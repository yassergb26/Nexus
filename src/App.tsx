import { useEffect } from 'react'
import GlobeViewer from './components/globe/GlobeViewer'
import HudOverlay from './components/hud/HudOverlay'
import Sidebar from './components/sidebar/Sidebar'
import LayerRenderer from './components/globe/LayerRenderer'
import { CommandPalette } from './components/CommandPalette'
import { CesiumViewerProvider } from './contexts/CesiumViewerContext'
import { useMapStore } from './store/useMapStore'
import { decodeUrlState } from './utils/urlState'
import { REGIONAL_PRESETS } from './utils/presets'

export default function App() {
  const { setPosition, flyToPreset, toggleLayer } = useMapStore()

  // Restore state from URL on mount
  useEffect(() => {
    const urlState = decodeUrlState()
    if (urlState) {
      // Use preset if specified, otherwise use exact coordinates
      if (urlState.view && urlState.view !== 'global') {
        const preset = REGIONAL_PRESETS.find((p) => p.id === urlState.view)
        if (preset) flyToPreset(preset.id)
      } else if (urlState.lat !== undefined && urlState.lon !== undefined) {
        setPosition({
          latitude: urlState.lat,
          longitude: urlState.lon,
          altitude: urlState.alt ?? 20000000,
          heading: urlState.heading ?? 0,
          pitch: urlState.pitch ?? -90,
        })
      }
      if (urlState.layers) {
        urlState.layers.forEach((layerId) => {
          const layer = useMapStore.getState().layers.find((l) => l.id === layerId)
          if (layer && !layer.enabled) toggleLayer(layerId)
        })
      }
    }
  }, [setPosition, flyToPreset, toggleLayer])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        useMapStore.getState().toggleSidebar()
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
        e.preventDefault()
        useMapStore.getState().toggleHud()
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  return (
    <CesiumViewerProvider>
      <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a]">
        <GlobeViewer />
        <LayerRenderer />

        {/* ── Circular viewport mask ─────────────────────────────────────────
            Dark overlay with a circular hole that reveals the globe through
            the center — matching the WorldView ISR/IMINT window aesthetic.
            pointer-events-none so all Cesium interactions still work.        */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle 44vh at 50% 52%, transparent 99.5%, #0a0a0a 100%)',
          }}
        />
        {/* Accent ring framing the circular viewport */}
        <div
          className="absolute z-10 pointer-events-none rounded-full"
          style={{
            top: '52%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '88vh',
            height: '88vh',
            border: '1px solid rgba(0, 212, 170, 0.25)',
            boxShadow:
              '0 0 60px rgba(0, 212, 170, 0.06), inset 0 0 80px rgba(0, 0, 0, 0.5)',
          }}
        />

        <HudOverlay />
        <Sidebar />
        <CommandPalette />
      </div>
    </CesiumViewerProvider>
  )
}
