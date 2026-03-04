import { useEffect, useRef } from 'react'
import { CustomDataSource, Cartesian3, NearFarScalar } from 'cesium'
import { useCesiumViewerContext } from '../../contexts/CesiumViewerContext'
import { useMapStore } from '../../store/useMapStore'
import { CCTV_CAMERAS } from '../../data/cctv-cameras'
import { cameraIcon } from '../../utils/iconBuilder'

const CCTV_ICON = cameraIcon('#10b981')

export function useCctvLayer() {
  const { viewerRef, viewerReady } = useCesiumViewerContext()
  const isEnabled = useMapStore((s) => s.layers.find((l) => l.id === 'cctv')?.enabled ?? false)
  const setLayerCount = useMapStore((s) => s.setLayerCount)
  const setSelectedEntityId = useMapStore((s) => s.setSelectedEntityId)
  const dataSourceRef = useRef<CustomDataSource | null>(null)

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !viewerReady || viewer.isDestroyed()) return
    const ds = new CustomDataSource('cctv')
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
      setLayerCount('cctv', 0)
      setSelectedEntityId(null)
      return
    }

    for (const cam of CCTV_CAMERAS) {
      ds.entities.add({
        id: `cctv-${cam.id}`,
        name: cam.name,
        position: Cartesian3.fromDegrees(cam.longitude, cam.latitude, 0),
        billboard: {
          image: CCTV_ICON,
          width: 24,
          height: 24,
          scaleByDistance: new NearFarScalar(1e4, 1.8, 1e7, 0.4),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: cam.name as unknown as any,
      })
    }
    setLayerCount('cctv', CCTV_CAMERAS.length)
  }, [isEnabled, setLayerCount, setSelectedEntityId])
}
