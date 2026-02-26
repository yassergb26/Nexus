import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CustomDataSource, Cartesian3, Color, NearFarScalar } from 'cesium'
import { useCesiumViewerContext } from '../../contexts/CesiumViewerContext'
import { useMapStore } from '../../store/useMapStore'
import { fetchEarthquakes } from '../../services/usgs'

function magnitudeColor(mag: number): Color {
  if (mag >= 7.0) return Color.fromCssColorString('#ff0000')   // major: bright red
  if (mag >= 6.0) return Color.fromCssColorString('#ff4500')   // strong: orange-red
  if (mag >= 5.0) return Color.fromCssColorString('#ff8c00')   // moderate: orange
  return Color.fromCssColorString('#ffd700')                    // light: yellow
}

function magnitudeSize(mag: number): number {
  return Math.max(4, (mag - 4) * 6 + 4) // 4px at M4, 18px at M7+
}

export function useEarthquakesLayer() {
  const { viewerRef, viewerReady } = useCesiumViewerContext()
  const isEnabled = useMapStore((s) => s.layers.find((l) => l.id === 'earthquakes')?.enabled ?? false)
  const timeRange = useMapStore((s) => s.timeRange)
  const setLayerCount = useMapStore((s) => s.setLayerCount)
  const dataSourceRef = useRef<CustomDataSource | null>(null)

  // Fetch USGS data
  const { data } = useQuery({
    queryKey: ['earthquakes', timeRange],
    queryFn: () => fetchEarthquakes(timeRange),
    enabled: isEnabled,
    refetchInterval: 60_000,
    staleTime: 50_000,
  })

  // Create data source on viewer ready
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

  // Sync entities with data
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
      ds.entities.add({
        id: `eq-${eq.id}`,
        name: eq.properties.title,
        position: Cartesian3.fromDegrees(lon, lat, 0),
        point: {
          pixelSize: magnitudeSize(mag),
          color: magnitudeColor(mag),
          outlineColor: Color.WHITE.withAlpha(0.4),
          outlineWidth: 1,
          scaleByDistance: new NearFarScalar(1e5, 1.5, 2e7, 0.5),
        },
        description: `
          <b>${eq.properties.title}</b><br/>
          Magnitude: ${mag}<br/>
          Depth: ${eq.geometry.coordinates[2].toFixed(1)} km<br/>
          ${new Date(eq.properties.time).toUTCString()}
        ` as unknown as any,
      })
    }
    setLayerCount('earthquakes', data.length)
  }, [data, isEnabled, setLayerCount])
}
