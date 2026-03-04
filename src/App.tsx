import { useEffect } from 'react'
import { Eye } from 'lucide-react'
import GlobeViewer from './components/globe/GlobeViewer'
import HudOverlay from './components/hud/HudOverlay'
import Sidebar from './components/sidebar/Sidebar'
import RightPanel from './components/controls/RightPanel'
import StylePresetsBar from './components/controls/StylePresetsBar'
import LocationsBar from './components/controls/LocationsBar'
import LayerRenderer from './components/globe/LayerRenderer'
import { CommandPalette } from './components/CommandPalette'
import LayerLegend from './components/panels/LayerLegend'
import { CesiumViewerProvider } from './contexts/CesiumViewerContext'
import { useMapStore } from './store/useMapStore'
import { decodeUrlState } from './utils/urlState'
import { REGIONAL_PRESETS } from './utils/presets'

export default function App() {
  const { setPosition, flyToPreset, toggleLayer, circularViewport, cleanUI } = useMapStore()

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
      if (e.key === 'Escape' && useMapStore.getState().cleanUI) {
        useMapStore.getState().toggleCleanUI()
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

        {/* ── Topographic contour pattern in the dark border area ───────────
            Subtle organic contour lines visible in the masked-out corners,
            matching the WorldView ISR aesthetic background.                  */}
        <svg className="absolute inset-0 z-[9] pointer-events-none w-full h-full opacity-[0.035]">
          <defs>
            <pattern id="topo" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <ellipse cx="60" cy="60" rx="55" ry="40" fill="none" stroke="#00d4aa" strokeWidth="0.5" />
              <ellipse cx="60" cy="60" rx="42" ry="28" fill="none" stroke="#00d4aa" strokeWidth="0.5" />
              <ellipse cx="60" cy="60" rx="28" ry="18" fill="none" stroke="#00d4aa" strokeWidth="0.5" />
              <ellipse cx="60" cy="60" rx="14" ry="9" fill="none" stroke="#00d4aa" strokeWidth="0.5" />
              <ellipse cx="25" cy="110" rx="30" ry="22" fill="none" stroke="#00d4aa" strokeWidth="0.3" />
              <ellipse cx="100" cy="15" rx="25" ry="18" fill="none" stroke="#00d4aa" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topo)" />
        </svg>

        {/* ── Circular viewport mask (toggleable) ──────────────────────────── */}
        {circularViewport && (
          <>
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle 44vh at 50% 52%, transparent 99.5%, #0a0a0a 100%)',
              }}
            />
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
          </>
        )}

        {/* ── Overlays ──────────────────────────────────────────────────────
            z-20: HUD edge text
            z-30: Left panels, right panel, bottom bars
            z-40: HUD top/bottom blocks
            z-101: CommandPalette                                             */}
        <HudOverlay />
        <Sidebar />
        <RightPanel />
        <LocationsBar />
        <StylePresetsBar />
        <CommandPalette />
        <LayerLegend />

        {/* Floating button to exit Clean UI mode */}
        {cleanUI && (
          <button
            onClick={() => useMapStore.getState().toggleCleanUI()}
            className="fixed bottom-4 right-4 z-50 w-9 h-9 rounded-full bg-[#111]/70 backdrop-blur-sm
                       border border-[#333] flex items-center justify-center
                       hover:bg-[#1a1a1a] hover:border-[#00d4aa]/40 transition-all group"
            title="Exit Clean UI (Esc)"
          >
            <Eye size={14} className="text-[#555] group-hover:text-[#00d4aa] transition-colors" />
          </button>
        )}
      </div>
    </CesiumViewerProvider>
  )
}
