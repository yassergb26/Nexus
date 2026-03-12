import { useEffect, useRef } from 'react'
import { CustomDataSource, Cartesian3, Color, PolygonHierarchy, ConstantProperty, ColorMaterialProperty } from 'cesium'
import { useCesiumViewerContext } from '../../contexts/CesiumViewerContext'
import { useMapStore } from '../../store/useMapStore'

/** Compute the sub-solar point from real UTC time */
function getSunPosition(date: Date): { lat: number; lon: number } {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  )
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600

  // Solar declination (simplified approximation)
  const declination = -23.44 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10))

  // Sub-solar longitude from hour angle
  let lon = -(hours - 12) * 15
  if (lon > 180) lon -= 360
  if (lon < -180) lon += 360

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
      lon: (lon * 180) / Math.PI,
    })
  }

  return points
}

/** Build night-side polygon from terminator points */
function getNightPolygon(sunLat: number, terminatorPts: { lat: number; lon: number }[]): Cartesian3[] {
  // The night pole is the anti-solar pole
  const nightPoleLat = sunLat > 0 ? -90 : 90
  // Build polygon: terminator line + sweep to night pole
  const positions: Cartesian3[] = []

  for (const pt of terminatorPts) {
    positions.push(Cartesian3.fromDegrees(pt.lon, pt.lat, 500))
  }

  // Close via night pole
  positions.push(Cartesian3.fromDegrees(terminatorPts[terminatorPts.length - 1].lon, nightPoleLat, 500))
  positions.push(Cartesian3.fromDegrees(terminatorPts[0].lon, nightPoleLat, 500))

  return positions
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

      // Terminator line
      const linePositions = terminatorPts.map((p) => Cartesian3.fromDegrees(p.lon, p.lat, 1000))
      ds.entities.add({
        id: 'terminator-line',
        name: 'Day/Night Terminator',
        polyline: {
          positions: new ConstantProperty(linePositions),
          width: new ConstantProperty(2),
          material: Color.fromCssColorString('#f59e0b').withAlpha(0.6),
          clampToGround: new ConstantProperty(true),
        },
      })

      // Night shadow polygon
      const nightPositions = getNightPolygon(sun.lat, terminatorPts)
      ds.entities.add({
        id: 'terminator-shadow',
        name: 'Night Shadow',
        polygon: {
          hierarchy: new ConstantProperty(new PolygonHierarchy(nightPositions)),
          material: new ColorMaterialProperty(Color.fromCssColorString('#000000').withAlpha(0.35)),
          outline: new ConstantProperty(false),
          height: new ConstantProperty(0),
        },
      })
    }

    updateTerminator()
    // Update every 60 seconds
    intervalRef.current = setInterval(updateTerminator, 60000)
  }, [isEnabled])
}
