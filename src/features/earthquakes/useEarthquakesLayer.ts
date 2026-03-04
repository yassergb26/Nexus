import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CustomDataSource, Cartesian3, NearFarScalar } from 'cesium'
import { useCesiumViewerContext } from '../../contexts/CesiumViewerContext'
import { useMapStore } from '../../store/useMapStore'
import { fetchEarthquakes } from '../../services/usgs'
import { warningIcon } from '../../utils/iconBuilder'

function magnitudeColor(mag: number): string {
  if (mag >= 7.0) return '#ff0000'
  if (mag >= 6.0) return '#ff4500'
  if (mag >= 5.0) return '#ff8c00'
  return '#ffd700'
}

function magnitudeSize(mag: number): number {
  return Math.max(16, (mag - 4) * 8 + 16)
}

export function useEarthquakesLayer() {
  const { viewerRef, viewerReady } = useCesiumViewerContext()
  const isEnabled = useMapStore((s) => s.layers.find((l) => l.id === 'earthquakes')?.enabled ?? false)
  const timeRange = useMapStore((s) => s.timeRange)
  const setLayerCount = useMapStore((s) => s.setLayerCount)
  const dataSourceRef = useRef<CustomDataSource | null>(null)

  const { data } = useQuery({
    queryKey: ['earthquakes', timeRange],
    queryFn: () => fetchEarthquakes(timeRange),
    enabled: isEnabled,
    refetchInterval: 60_000,
    staleTime: 50_000,
  })

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !viewerReady || viewer.isDestroyed()) return
    const ds = new CustomDataSource('earthquakes')
    viewer.dataSources.add(ds)
    dataSourceRef.current = ds
    return () => {
      if (viewer && !viewer.isDestroyed()) {
        viewer.dataSources.remove(ds, true)
      }
      dataSourceRef.current = null
    }
  }, [viewerRef, viewerReady])

  useEffect(() => {
    const ds = dataSourceRef.current
    if (!ds) return

    ds.entities.removeAll()

    if (!isEnabled || !data) {
      setLayerCount('earthquakes', 0)
      return
    }

    for (const eq of data) {
      const [lon, lat] = eq.geometry.coordinates
      if (lon == null || lat == null) continue
      const mag = eq.properties.mag
      const color = magnitudeColor(mag)
      ds.entities.add({
        id: `eq-${eq.id}`,
        name: eq.properties.title,
        position: Cartesian3.fromDegrees(lon, lat, 0),
        billboard: {
          image: warningIcon(color),
          width: magnitudeSize(mag),
          height: magnitudeSize(mag),
          scaleByDistance: new NearFarScalar(1e5, 1.5, 2e7, 0.4),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: `<b>${eq.properties.title}</b><br/>Magnitude: ${mag}<br/>Depth: ${eq.geometry.coordinates[2].toFixed(1)} km<br/>${new Date(eq.properties.time).toUTCString()}` as any,
      })
    }
    setLayerCount('earthquakes', data.length)
  }, [data, isEnabled, setLayerCount])
}
