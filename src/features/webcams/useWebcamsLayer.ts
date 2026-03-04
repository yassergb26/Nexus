import { useEffect, useRef, useMemo } from 'react'
import { CustomDataSource, Cartesian3, NearFarScalar } from 'cesium'
import { useCesiumViewerContext } from '../../contexts/CesiumViewerContext'
import { useMapStore } from '../../store/useMapStore'
import { WEBCAM_FEEDS } from '../../data/webcam-feeds'
import { cameraIcon } from '../../utils/iconBuilder'

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

  const iconCache = useMemo(() => {
    const cache: Record<string, string> = {}
    for (const [type, color] of Object.entries(HOTSPOT_COLORS)) {
      cache[type] = cameraIcon(color)
    }
    return cache
  }, [])

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
      const icon = iconCache[cam.hotspotType] ?? cameraIcon('#888')
      ds.entities.add({
        id: `webcam-${cam.id}`,
        name: cam.name,
        position: Cartesian3.fromDegrees(cam.longitude, cam.latitude, 0),
        billboard: {
          image: icon,
          width: 24,
          height: 24,
          scaleByDistance: new NearFarScalar(1e4, 1.8, 1e7, 0.4),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: cam.description as unknown as any,
      })
    }
    setLayerCount('webcams', WEBCAM_FEEDS.length)
  }, [isEnabled, setLayerCount, setSelectedEntityId, iconCache])
}
