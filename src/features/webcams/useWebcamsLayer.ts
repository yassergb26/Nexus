import { useEffect, useRef } from 'react'
import { CustomDataSource, Cartesian3, Color, NearFarScalar } from 'cesium'
import { useCesiumViewerContext } from '../../contexts/CesiumViewerContext'
import { useMapStore } from '../../store/useMapStore'
import { WEBCAM_FEEDS } from '../../data/webcam-feeds'

const HOTSPOT_COLORS: Record<string, string> = {
  conflict:  '#ef4444',
  border:    '#f97316',
  maritime:  '#3b82f6',
  political: '#a855f7',
  strategic: '#eab308',
}

export function useWebcamsLayer() {
  const { viewerRef, viewerReady } = useCesiumViewerContext()
  const isEnabled = useMapStore((s) => s.layers.find((l) => l.id === 'webcams')?.enabled ?? false)
  const setLayerCount = useMapStore((s) => s.setLayerCount)
  const setSelectedEntityId = useMapStore((s) => s.setSelectedEntityId)
  const dataSourceRef = useRef<CustomDataSource | null>(null)

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !viewerReady || viewer.isDestroyed()) return
    const ds = new CustomDataSource('webcams')
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

    if (!isEnabled) {
      setLayerCount('webcams', 0)
      setSelectedEntityId(null)
      return
    }

    for (const cam of WEBCAM_FEEDS) {
      const color = HOTSPOT_COLORS[cam.hotspotType] ?? '#888'
      ds.entities.add({
        id: `webcam-${cam.id}`,
        name: cam.name,
        position: Cartesian3.fromDegrees(cam.longitude, cam.latitude, 0),
        point: {
          pixelSize: 11,
          color: Color.fromCssColorString(color),
          outlineColor: Color.fromCssColorString(color).withAlpha(0.5),
          outlineWidth: 3,
          scaleByDistance: new NearFarScalar(1e4, 2.0, 1e7, 0.5),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: cam.description as unknown as any,
      })
    }
    setLayerCount('webcams', WEBCAM_FEEDS.length)
  }, [isEnabled, setLayerCount, setSelectedEntityId])
}
