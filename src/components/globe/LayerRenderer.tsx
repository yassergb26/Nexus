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
import EntityTooltip from './EntityTooltip'
import EntityDetailPanels from '../panels/EntityDetailPanel'

function useEntityInteraction() {
  const { viewerRef, viewerReady } = useCesiumViewerContext()
  const setSelectedEntityId = useMapStore((s) => s.setSelectedEntityId)
  const setHoveredEntity = useMapStore((s) => s.setHoveredEntity)
  const openPanel = useMapStore((s) => s.openPanel)

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !viewerReady || viewer.isDestroyed()) return

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas)

    // Click handler — open detail panel or CCTV/Webcam popup
    handler.setInputAction((click: { position: Cartesian2 }) => {
      const picked = viewer.scene.pick(click.position)
      if (picked?.id instanceof Entity && typeof picked.id.id === 'string') {
        const entityId = picked.id.id
        if (entityId.startsWith('cctv-') || entityId.startsWith('webcam-')) {
          setSelectedEntityId(entityId)
          return
        }
        openPanel(entityId)
        return
      }
      setSelectedEntityId(null)
    }, ScreenSpaceEventType.LEFT_CLICK)

    // Hover handler — show tooltip
    handler.setInputAction((move: { endPosition: Cartesian2 }) => {
      const picked = viewer.scene.pick(move.endPosition)
      if (picked?.id instanceof Entity && typeof picked.id.id === 'string') {
        const entity = picked.id
        setHoveredEntity({
          id: entity.id,
          screenX: move.endPosition.x,
          screenY: move.endPosition.y,
          name: entity.name ?? entity.id,
        })
        viewer.scene.canvas.style.cursor = 'pointer'
      } else {
        setHoveredEntity(null)
        viewer.scene.canvas.style.cursor = ''
      }
    }, ScreenSpaceEventType.MOUSE_MOVE)

    return () => {
      handler.destroy()
      setHoveredEntity(null)
    }
  }, [viewerRef, viewerReady, setSelectedEntityId, setHoveredEntity, openPanel])
}

export default function LayerRenderer() {
  useEarthquakesLayer()
  useFlightsLayer()
  useSatellitesLayer()
  useCctvLayer()
  useWebcamsLayer()
  useMilitaryBasesLayer()
  useVisualMode()
  useEntityInteraction()

  return (
    <>
      <BroadcastPanel />
      <CctvPopup />
      <WebcamPopup />
      <EntityTooltip />
      <EntityDetailPanels />
    </>
  )
}
