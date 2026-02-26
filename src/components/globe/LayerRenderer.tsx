import { useEffect } from 'react'
import { ScreenSpaceEventHandler, ScreenSpaceEventType, Entity, Cartesian2 } from 'cesium'
import { useEarthquakesLayer } from '../../features/earthquakes/useEarthquakesLayer'
import { useFlightsLayer } from '../../features/flights/useFlightsLayer'
import { useSatellitesLayer } from '../../features/satellites/useSatellitesLayer'
import { useCctvLayer } from '../../features/cctv/useCctvLayer'
import { useWebcamsLayer } from '../../features/webcams/useWebcamsLayer'
import { useMilitaryBasesLayer } from '../../features/bases/useMilitaryBasesLayer'
import { useVisualMode } from '../../hooks/useVisualMode'
import { BroadcastPanel } from '../../features/broadcasts/BroadcastPanel'
import { CctvPopup } from '../../features/cctv/CctvPopup'
import { WebcamPopup } from '../../features/webcams/WebcamPopup'
import { useCesiumViewerContext } from '../../contexts/CesiumViewerContext'
import { useMapStore } from '../../store/useMapStore'

function useEntityClickHandler() {
  const { viewerRef, viewerReady } = useCesiumViewerContext()
  const setSelectedEntityId = useMapStore((s) => s.setSelectedEntityId)

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !viewerReady || viewer.isDestroyed()) return

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.setInputAction((click: { position: Cartesian2 }) => {
      const picked = viewer.scene.pick(click.position)
      if (picked?.id instanceof Entity && typeof picked.id.id === 'string') {
        const entityId = picked.id.id
        if (entityId.startsWith('cctv-') || entityId.startsWith('webcam-')) {
          setSelectedEntityId(entityId)
          return
        }
      }
      setSelectedEntityId(null)
    }, ScreenSpaceEventType.LEFT_CLICK)

    return () => handler.destroy()
  }, [viewerRef, viewerReady, setSelectedEntityId])
}

export default function LayerRenderer() {
  useEarthquakesLayer()
  useFlightsLayer()
  useSatellitesLayer()
  useCctvLayer()
  useWebcamsLayer()
  useMilitaryBasesLayer()
  useVisualMode()
  useEntityClickHandler()

  return (
    <>
      <BroadcastPanel />
      <CctvPopup />
      <WebcamPopup />
    </>
  )
}
