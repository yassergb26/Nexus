import { useEffect } from 'react'
import { ScreenSpaceEventHandler, ScreenSpaceEventType, Entity, Cartesian2 } from 'cesium'
import { useEarthquakesLayer } from '../../features/earthquakes/useEarthquakesLayer'
import { useFlightsLayer } from '../../features/flights/useFlightsLayer'
import { useSatellitesLayer } from '../../features/satellites/useSatellitesLayer'
import { useCctvLayer } from '../../features/cctv/useCctvLayer'
import { useCctvMeshLines } from '../../features/cctv/useCctvMeshLines'
import { useMilitaryBasesLayer } from '../../features/bases/useMilitaryBasesLayer'
import { useCountriesLayer } from '../../features/countries/useCountriesLayer'
import { useTerminatorLayer } from '../../features/terminator/useTerminatorLayer'
import { useVisualMode } from '../../hooks/useVisualMode'
import { BroadcastPanel } from '../../features/broadcasts/BroadcastPanel'
import { useCesiumViewerContext } from '../../contexts/CesiumViewerContext'
import { useMapStore } from '../../store/useMapStore'
import EntityTooltip from './EntityTooltip'
import EntityDetailPanels from '../panels/EntityDetailPanel'

function useEntityInteraction() {
  const { viewerRef, viewerReady } = useCesiumViewerContext()
  const setHoveredEntity = useMapStore((s) => s.setHoveredEntity)
  const openPanel = useMapStore((s) => s.openPanel)

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !viewerReady || viewer.isDestroyed()) return

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas)

    // Click handler — all entities open via stackable panel system
    handler.setInputAction((click: { position: Cartesian2 }) => {
      const picked = viewer.scene.pick(click.position)
      if (picked?.id instanceof Entity && typeof picked.id.id === 'string') {
        // Country entities have name prefixed with 'country-' (id is read-only from GeoJSON)
        const panelId = picked.id.name?.startsWith('country-') ? picked.id.name : picked.id.id
        openPanel(panelId)
        return
      }
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
  }, [viewerRef, viewerReady, setHoveredEntity, openPanel])
}

export default function LayerRenderer() {
  useEarthquakesLayer()
  useFlightsLayer()
  useSatellitesLayer()
  useCctvLayer()
  useCctvMeshLines()
  useMilitaryBasesLayer()
  useCountriesLayer()
  useTerminatorLayer()
  useVisualMode()
  useEntityInteraction()

  return (
    <>
      <BroadcastPanel />
      <EntityTooltip />
      <EntityDetailPanels />
    </>
  )
}
