import { useState } from 'react'
import {
  Eye,
  Flame,
  Moon,
  Monitor,
  Palette,
  CircleDot,
  Snowflake,
  Satellite,
  Plus,
  Minus,
} from 'lucide-react'
import { useMapStore } from '../../store/useMapStore'
import type { VisualMode } from '../../types'

interface StylePreset {
  id: VisualMode
  label: string
  shortLabel: string
  icon: React.ReactNode
  color: string
}

const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'normal',
    label: 'Normal',
    shortLabel: 'NORM',
    icon: <Eye size={16} />,
    color: '#e0e0e0',
  },
  {
    id: 'crt',
    label: 'CRT',
    shortLabel: 'CRT',
    icon: <Monitor size={16} />,
    color: '#22c55e',
  },
  {
    id: 'nightvision',
    label: 'NVG',
    shortLabel: 'NVG',
    icon: <Moon size={16} />,
    color: '#4ade80',
  },
  {
    id: 'flir',
    label: 'FLIR',
    shortLabel: 'FLIR',
    icon: <Flame size={16} />,
    color: '#f97316',
  },
  {
    id: 'anime',
    label: 'Anime',
    shortLabel: 'ANIME',
    icon: <Palette size={16} />,
    color: '#f472b6',
  },
  {
    id: 'noir',
    label: 'Noir',
    shortLabel: 'NOIR',
    icon: <CircleDot size={16} />,
    color: '#a1a1aa',
  },
  {
    id: 'snow',
    label: 'Snow',
    shortLabel: 'SNOW',
    icon: <Snowflake size={16} />,
    color: '#7dd3fc',
  },
  {
    id: 'satellite',
    label: 'Satellite',
    shortLabel: 'SAT',
    icon: <Satellite size={16} />,
    color: '#c084fc',
  },
]

export default function StylePresetsBar() {
  const { visualMode, setVisualMode, cleanUI } = useMapStore()
  const [expanded, setExpanded] = useState(false)

  if (cleanUI) return null

  const current = STYLE_PRESETS.find((s) => s.id === visualMode)
  const modeName = current?.shortLabel ?? 'NORMAL'

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
      {/* Collapsed bar */}
      <div className="flex items-center gap-3 bg-[#0a0a0a]/90 backdrop-blur-sm border border-[#222] rounded-lg px-4 py-2.5">
        <span className="text-[9px] font-mono tracking-[0.15em] text-[#555] uppercase">
          STYLE PRESETS
        </span>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[9px] font-mono tracking-wider text-[#444] hover:text-[#888] transition-colors"
        >
          {expanded ? <Minus size={10} /> : <Plus size={10} />}
        </button>

        <div className="w-px h-4 bg-[#222]" />

        <span className="text-[10px] font-mono tracking-wider" style={{ color: current?.color ?? '#e0e0e0' }}>
          STYLE: {modeName}
        </span>
      </div>

      {/* Expanded mode grid */}
      {expanded && (
        <div className="mt-[1px] flex items-center gap-1 bg-[#0a0a0a]/90 backdrop-blur-sm border border-[#222] rounded-lg px-2 py-2">
          {STYLE_PRESETS.map((preset) => {
            const isActive = visualMode === preset.id
            return (
              <button
                key={preset.id}
                onClick={() => setVisualMode(preset.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-all ${
                  isActive
                    ? 'bg-[#00d4aa]/10 border border-[#00d4aa]/30'
                    : 'border border-transparent hover:bg-[#1a1a1a] hover:border-[#333]'
                }`}
              >
                <div style={{ color: isActive ? preset.color : '#555' }}>
                  {preset.icon}
                </div>
                <span
                  className="text-[8px] font-mono tracking-wider"
                  style={{ color: isActive ? preset.color : '#555' }}
                >
                  {preset.shortLabel}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
