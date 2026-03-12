import { useEffect, useRef } from 'react'
import { CustomDataSource, Cartesian3, Color, ConstantProperty, PolygonHierarchy, ColorMaterialProperty } from 'cesium'
import { useCesiumViewerContext } from '../../contexts/CesiumViewerContext'
import { useMapStore } from '../../store/useMapStore'

/** Normalize longitude to [-180, 180] */
function normalizeLon(lon: number): number {
  while (lon > 180) lon -= 360
  while (lon < -180) lon += 360
  return lon
}

/** Compute the sub-solar point from real UTC time */
function getSunPosition(date: Date): { lat: number; lon: number } {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  )
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600

  // Solar declination (simplified approximation)
  const declination = -23.44 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10))

  // Sub-solar longitude from hour angle
  const lon = normalizeLon(-(hours - 12) * 15)

  return { lat: declination, lon }
}

/** Generate terminator great circle points (boundary where solar elevation = 0) */
function getTerminatorPoints(sunLat: number, sunLon: number, segments = 72): { lat: number; lon: number }[] {
  const sunLatRad = (sunLat * Math.PI) / 180
  const sunLonRad = (sunLon * Math.PI) / 180
  const points: { lat: number; lon: number }[] = []

  for (let i = 0; i <= segments; i++) {
    const angle = (2 * Math.PI * i) / segments

    const lat = Math.asin(
      Math.sin(sunLatRad) * Math.cos(Math.PI / 2) +
      Math.cos(sunLatRad) * Math.sin(Math.PI / 2) * Math.cos(angle)
    )
    const lon = sunLonRad + Math.atan2(
      Math.sin(angle) * Math.sin(Math.PI / 2) * Math.cos(sunLatRad),
      Math.cos(Math.PI / 2) - Math.sin(sunLatRad) * Math.sin(lat)
    )

    points.push({
      lat: (lat * 180) / Math.PI,
      lon: normalizeLon((lon * 180) / Math.PI),
    })
  }

  return points
}

/**
 * Build a polygon covering the night hemisphere, avoiding poles (±80°).
 * Uses the hour-angle formula to find terminator longitude at each latitude,
 * then traces the east edge up and west edge down with connectors via anti-solar.
 */
function getNightPolygonPoints(sunLat: number, sunLon: number): Cartesian3[] {
  const MAX_LAT = 78
  const STEP = 4
  const sunLatRad = (sunLat * Math.PI) / 180
  const antiLon = normalizeLon(sunLon + 180)

  const terminatorLonAt = (lat: number, east: boolean): number => {
    const latRad = (lat * Math.PI) / 180
    const cosH = -Math.tan(latRad) * Math.tan(sunLatRad)
    if (cosH > 1) return antiLon
    if (cosH < -1) return sunLon
    const hourAngle = Math.acos(Math.max(-1, Math.min(1, cosH))) * 180 / Math.PI
    return normalizeLon(sunLon + (east ? hourAngle : -hourAngle))
  }

  const points: Cartesian3[] = []

  // East terminator edge (south → north)
  for (let lat = -MAX_LAT; lat <= MAX_LAT; lat += STEP) {
    points.push(Cartesian3.fromDegrees(terminatorLonAt(lat, true), lat))
  }

  // Top connector: east terminator → anti-solar → west terminator at +MAX_LAT
  points.push(Cartesian3.fromDegrees(normalizeLon(antiLon - 60), MAX_LAT))
  points.push(Cartesian3.fromDegrees(normalizeLon(antiLon - 30), MAX_LAT))
  points.push(Cartesian3.fromDegrees(antiLon, MAX_LAT))
  points.push(Cartesian3.fromDegrees(normalizeLon(antiLon + 30), MAX_LAT))
  points.push(Cartesian3.fromDegrees(normalizeLon(antiLon + 60), MAX_LAT))

  // West terminator edge (north → south)
  for (let lat = MAX_LAT; lat >= -MAX_LAT; lat -= STEP) {
    points.push(Cartesian3.fromDegrees(terminatorLonAt(lat, false), lat))
  }

  // Bottom connector: west terminator → anti-solar → east terminator at -MAX_LAT
  points.push(Cartesian3.fromDegrees(normalizeLon(antiLon + 60), -MAX_LAT))
  points.push(Cartesian3.fromDegrees(normalizeLon(antiLon + 30), -MAX_LAT))
  points.push(Cartesian3.fromDegrees(antiLon, -MAX_LAT))
  points.push(Cartesian3.fromDegrees(normalizeLon(antiLon - 30), -MAX_LAT))
  points.push(Cartesian3.fromDegrees(normalizeLon(antiLon - 60), -MAX_LAT))

  return points
}

export function useTerminatorLayer() {
  const { viewerRef, viewerReady } = useCesiumViewerContext()
  const isEnabled = useMapStore((s) => s.layers.find((l) => l.id === 'terminator')?.enabled ?? false)
  const dataSourceRef = useRef<CustomDataSource | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !viewerReady || viewer.isDestroyed()) return

    const ds = new CustomDataSource('terminator')
    viewer.dataSources.add(ds)
    dataSourceRef.current = ds

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (viewer && !viewer.isDestroyed()) viewer.dataSources.remove(ds, true)
      dataSourceRef.current = null
    }
  }, [viewerRef, viewerReady])

  useEffect(() => {
    const ds = dataSourceRef.current
    if (!ds) return
    ds.entities.removeAll()
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (!isEnabled) return

    const updateTerminator = () => {
      ds.entities.removeAll()
      const now = new Date()
      const sun = getSunPosition(now)
      const terminatorPts = getTerminatorPoints(sun.lat, sun.lon)

      // Night shadow polygon — covers the dark hemisphere
      const nightPoints = getNightPolygonPoints(sun.lat, sun.lon)
      if (nightPoints.length > 3) {
        ds.entities.add({
          id: 'night-shadow',
          name: 'Night Hemisphere',
          polygon: {
            hierarchy: new PolygonHierarchy(nightPoints),
            material: new ColorMaterialProperty(Color.BLACK.withAlpha(0.35)),
            height: 0,
          },
        })
      }

      // Terminator line — clamped to ground for 2D/3D compatibility
      const linePositions = terminatorPts.map((p) => Cartesian3.fromDegrees(p.lon, p.lat))
      ds.entities.add({
        id: 'terminator-line',
        name: 'Day/Night Terminator',
        polyline: {
          positions: new ConstantProperty(linePositions),
          width: new ConstantProperty(2),
          material: Color.fromCssColorString('#f59e0b').withAlpha(0.7),
          clampToGround: new ConstantProperty(true),
        },
      })

      // Wider glow line for visual emphasis
      ds.entities.add({
        id: 'terminator-glow',
        name: 'Terminator Glow',
        polyline: {
          positions: new ConstantProperty(linePositions),
          width: new ConstantProperty(8),
          material: Color.fromCssColorString('#f59e0b').withAlpha(0.12),
          clampToGround: new ConstantProperty(true),
        },
      })
    }

    updateTerminator()
    intervalRef.current = setInterval(updateTerminator, 60000)
  }, [isEnabled])
}
