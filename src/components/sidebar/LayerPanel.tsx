import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Circle,
  Plane,
  Satellite,
  Shield,
  Radiation,
  Rocket,
  Cable,
  Pipette,
  Server,
  Anchor,
  WifiOff,
  Crosshair,
  Users,
  Ban,
  UserX,
  Activity,
  CloudLightning,
  Flame,
  AlertTriangle,
  Thermometer,
  Camera,
  Radio,
  Video,
  TrendingUp,
  Landmark,
  BarChart3,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMapStore } from '../../store/useMapStore'
import { formatNumber } from '../../utils/formatters'
import type { MapLayer } from '../../types'

const ICON_MAP: Record<string, LucideIcon> = {
  Plane, Satellite, Shield, Radiation, Rocket, Cable, Pipette, Server,
  Anchor, WifiOff, Crosshair, Users, Ban, UserX, Activity, CloudLightning,
  Flame, AlertTriangle, Thermometer, Camera, Radio, Video, TrendingUp,
  Landmark, BarChart3,
}

interface LayerPanelProps {
  title: string
  layers: MapLayer[]
}

export default function LayerPanel({ title, layers }: LayerPanelProps) {
  const [expanded, setExpanded] = useState(true)
  const { toggleLayer } = useMapStore()
  const enabledCount = layers.filter((l) => l.enabled).length

  return (
    <div className="border-b border-[#1a1a1a]">
      {/* Category Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-4 py-2 hover:bg-[#111] transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown size={12} className="text-[#555]" />
          ) : (
            <ChevronRight size={12} className="text-[#555]" />
          )}
          <span className="text-[11px] uppercase tracking-wider text-[#888]">{title}</span>
        </div>
        {enabledCount > 0 && (
          <span className="text-[9px] bg-[#00d4aa]/15 text-[#00d4aa] px-1.5 py-0.5 rounded-full">
            {enabledCount}/{layers.length}
          </span>
        )}
      </button>

      {/* Layer List */}
      {expanded && (
        <div className="pb-1">
          {layers.map((layer) => {
            const IconComponent = ICON_MAP[layer.icon] || Circle
            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`flex items-center gap-3 w-full px-4 py-1.5 text-left transition-all ${
                  layer.enabled
                    ? 'bg-[#111]'
                    : 'hover:bg-[#0f0f0f]'
                }`}
              >
                {/* Toggle indicator */}
                <div
                  className={`w-1 h-4 rounded-full transition-all ${
                    layer.enabled ? 'opacity-100' : 'opacity-20'
                  }`}
                  style={{ backgroundColor: layer.color }}
                />

                {/* Icon */}
                <IconComponent
                  size={14}
                  className="transition-colors"
                  style={{ color: layer.enabled ? layer.color : '#555' }}
                />

                {/* Name */}
                <span
                  className={`text-[12px] flex-1 transition-colors ${
                    layer.enabled ? 'text-[#e0e0e0]' : 'text-[#666]'
                  }`}
                >
                  {layer.name}
                </span>

                {/* Count badge */}
                {layer.count !== undefined && layer.enabled && (
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${layer.color}20`,
                      color: layer.color,
                    }}
                  >
                    {formatNumber(layer.count)}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
