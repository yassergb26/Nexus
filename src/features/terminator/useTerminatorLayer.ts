import { useEffect, useRef } from 'react'
import { CustomDataSource, Cartesian3, Color, ConstantProperty } from 'cesium'
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
