import { useMapStore } from '../../store/useMapStore'
import { REGIONAL_PRESETS } from '../../utils/presets'
import LayerPanel from './LayerPanel'
import {
  PanelLeftClose,
  PanelLeftOpen,
  Globe,
  Map,
  Eye,
  Layers,
  Clock,
  Command,
} from 'lucide-react'
import type { LayerCategory, VisualMode, TimeRange } from '../../types'

const VISUAL_MODES: { id: VisualMode; label: string }[] = [
  { id: 'normal', label: 'NRML' },
  { id: 'flir',   label: 'FLIR' },
  { id: 'nightvision', label: 'NVG' },
  { id: 'crt',    label: 'CRT'  },
  { id: 'anime',  label: 'ANME' },
  { id: 'noir',   label: 'NOIR' },
  { id: 'snow',   label: 'SNOW' },
  { id: 'satellite', label: 'SAT' },
]

const CATEGORY_LABELS: Record<LayerCategory, string> = {
  military: 'Military & Strategic',
  infrastructure: 'Infrastructure',
  conflicts: 'Conflicts & Unrest',
  natural: 'Natural Events',
  live: 'Live Feeds',
  financial: 'Financial',
  intelligence: 'Intelligence',
}

const CATEGORY_ORDER: LayerCategory[] = [
  'military',
  'infrastructure',
  'conflicts',
  'natural',
  'intelligence',
  'live',
  'financial',
]

export default function Sidebar() {
  const {
    sidebarOpen, toggleSidebar, layers, activePreset, flyToPreset,
    hudVisible, toggleHud, visualMode, setVisualMode, timeRange, setTimeRange,
  } = useMapStore()

  const TIME_RANGES: { id: TimeRange; label: string }[] = [
    { id: '1h',  label: '1H'  },
    { id: '6h',  label: '6H'  },
    { id: '24h', label: '24H' },
    { id: '7d',  label: '7D'  },
    { id: 'all', label: 'ALL' },
  ]

  const enabledCount = layers.filter((l) => l.enabled).length

  if (!sidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed top-10 left-3 z-50 bg-[#111]/90 backdrop-blur-sm border border-[#222] rounded-lg p-2 hover:bg-[#1a1a1a] transition-colors"
        title="Open Sidebar"
      >
        <PanelLeftOpen size={18} className="text-[#00d4aa]" />
      </button>
    )
  }

  return (
    <div className="fixed top-7 left-0 bottom-0 z-40 w-[300px] bg-[#0a0a0a]/95 backdrop-blur-md border-r border-[#222] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#222]">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-[#00d4aa]" />
          <span className="text-sm font-medium text-[#e0e0e0] tracking-wide">LAYERS</span>
          {enabledCount > 0 && (
            <span className="text-[10px] bg-[#00d4aa]/20 text-[#00d4aa] px-1.5 py-0.5 rounded-full">
              {enabledCount}
            </span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 hover:bg-[#1a1a1a] rounded transition-colors"
        >
          <PanelLeftClose size={16} className="text-[#666]" />
        </button>
      </div>

      {/* Regional Presets */}
      <div className="px-3 py-3 border-b border-[#222]">
        <div className="flex items-center gap-1.5 mb-2">
          <Map size={12} className="text-[#666]" />
          <span className="text-[10px] uppercase tracking-wider text-[#666]">Region</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {REGIONAL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => flyToPreset(preset.id)}
              className={`text-[10px] px-2 py-1.5 rounded transition-all ${
                activePreset === preset.id
                  ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30'
                  : 'bg-[#111] text-[#888] border border-[#222] hover:bg-[#1a1a1a] hover:text-[#ccc]'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Mode Selector */}
      <div className="px-3 py-2 border-b border-[#222]">
        <div className="flex items-center gap-1.5 mb-2">
          <Layers size={12} className="text-[#666]" />
          <span className="text-[10px] uppercase tracking-wider text-[#666]">Visual Mode</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {VISUAL_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setVisualMode(mode.id)}
              className={`text-[10px] px-1.5 py-1.5 rounded font-mono tracking-wide transition-all ${
                visualMode === mode.id
                  ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/40'
                  : 'bg-[#111] text-[#777] border border-[#222] hover:bg-[#1a1a1a] hover:text-[#aaa]'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* HUD Toggle */}
      <div className="px-3 py-2 border-b border-[#222]">
        <button
          onClick={toggleHud}
          className={`flex items-center gap-2 w-full text-[11px] px-2 py-1.5 rounded transition-all ${
            hudVisible
              ? 'text-[#00d4aa] bg-[#00d4aa]/10'
              : 'text-[#666] hover:text-[#888]'
          }`}
        >
          <Eye size={12} />
          <span>HUD Overlay</span>
        </button>
      </div>

      {/* Time Range Filter */}
      <div className="px-3 py-2 border-b border-[#222]">
        <div className="flex items-center gap-1.5 mb-2">
          <Clock size={12} className="text-[#666]" />
          <span className="text-[10px] uppercase tracking-wider text-[#666]">Time Range</span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {TIME_RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setTimeRange(r.id)}
              className={`text-[10px] px-1 py-1.5 rounded font-mono tracking-wide transition-all ${
                timeRange === r.id
                  ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30'
                  : 'bg-[#111] text-[#666] border border-[#222] hover:bg-[#1a1a1a] hover:text-[#aaa]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Command Palette hint */}
      <div className="px-3 py-2 border-b border-[#222]">
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))}
          className="flex items-center justify-between w-full text-[11px] px-2 py-1.5 rounded bg-[#111] border border-[#222] hover:bg-[#1a1a1a] transition-colors"
        >
          <div className="flex items-center gap-2 text-[#555]">
            <Command size={11} />
            <span>Command Palette</span>
          </div>
          <kbd className="text-[9px] text-[#444] border border-[#2a2a2a] rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
        </button>
      </div>

      {/* Layer Categories */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {CATEGORY_ORDER.map((category) => {
          const categoryLayers = layers.filter((l) => l.category === category)
          if (categoryLayers.length === 0) return null
          return (
            <LayerPanel
              key={category}
              title={CATEGORY_LABELS[category]}
              layers={categoryLayers}
            />
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#222] text-[10px] text-[#555]">
        <div className="flex items-center justify-between">
          <span>NEXUS v0.1.0</span>
          <span>{layers.length} layers available</span>
        </div>
      </div>
    </div>
  )
}
