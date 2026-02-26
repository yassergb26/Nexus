import { useMemo } from 'react'
import { useMapStore } from '../../store/useMapStore'
import { formatCoordinate, formatAltitude, toMGRS } from '../../utils/formatters'

// ── Threat level derived from active layer event counts ─────────────────────
type ThreatLevel = 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL'

function computeThreatLevel(layers: ReturnType<typeof useMapStore>['layers']): ThreatLevel {
  const totalEvents = layers
    .filter((l) => l.enabled && l.count !== undefined)
    .reduce((sum, l) => sum + (l.count ?? 0), 0)
  const conflictLayers = layers.filter(
    (l) => (l.category === 'conflicts' || l.category === 'military') && l.enabled && (l.count ?? 0) > 0
  ).length
  if (conflictLayers >= 2 || totalEvents >= 100) return 'CRITICAL'
  if (conflictLayers >= 1 || totalEvents >= 30)  return 'HIGH'
  if (totalEvents >= 5)                           return 'ELEVATED'
  return 'LOW'
}

const THREAT_COLORS: Record<ThreatLevel, { dot: string; text: string; bg: string }> = {
  LOW:      { dot: 'bg-[#00d4aa]', text: 'text-[#00d4aa]', bg: 'bg-[#00d4aa]/10' },
  ELEVATED: { dot: 'bg-[#ffaa00]', text: 'text-[#ffaa00]', bg: 'bg-[#ffaa00]/10' },
  HIGH:     { dot: 'bg-[#ff6600]', text: 'text-[#ff6600]', bg: 'bg-[#ff6600]/10' },
  CRITICAL: { dot: 'bg-[#ff2222]', text: 'text-[#ff2222]', bg: 'bg-[#ff2222]/10' },
}

const TIME_RANGE_LABEL: Record<string, string> = {
  '1h': 'LAST 1H', '6h': 'LAST 6H', '24h': 'LAST 24H', '7d': 'LAST 7D', 'all': 'ALL TIME',
}

export default function HudOverlay() {
  const { position, fps, hudVisible, visualMode, layers, timeRange } = useMapStore()

  const threat = useMemo(() => computeThreatLevel(layers), [layers])
  const tc = THREAT_COLORS[threat]

  const totalEvents = layers
    .filter((l) => l.enabled && l.count !== undefined)
    .reduce((sum, l) => sum + (l.count ?? 0), 0)

  const enabledCount = layers.filter((l) => l.enabled).length

  const is3DTiles = position.altitude < 200_000

  if (!hudVisible) return null

  return (
    <>
      {/* ── Classification / Title bar ────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-7 bg-[#0a0a0a]/90 border-b border-[#222]">
        <div className="flex items-center gap-3 text-[11px] tracking-[0.2em] uppercase">
          <span className="text-[#00d4aa] font-bold">NEXUS</span>
          <span className="text-[#333]">|</span>
          <span className="text-[#555]">Global Intelligence Command Center</span>
          <span className="text-[#333]">|</span>
          <span className="text-[#00d4aa]">{visualMode.toUpperCase()}</span>
          <span className="text-[#333]">|</span>
          <span className="text-[#444] text-[10px]">{TIME_RANGE_LABEL[timeRange]}</span>
        </div>
        {/* Cmd+K hint — top-right */}
        <div className="absolute right-4 flex items-center gap-1.5 text-[10px] text-[#333]">
          <kbd className="border border-[#222] rounded px-1.5 py-0.5 font-mono text-[9px]">⌘K</kbd>
        </div>
      </div>

      {/* ── Bottom-left: Position ─────────────────────────────────────────── */}
      <div className="fixed bottom-4 left-4 z-40 pointer-events-none">
        <div className="bg-[#0a0a0a]/80 backdrop-blur-sm border border-[#222] rounded-lg p-3 font-mono text-[11px]">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
            <span className="text-[#00d4aa] tracking-wider text-[10px] uppercase">Position</span>
            {is3DTiles && (
              <span className="ml-auto text-[9px] text-[#00d4aa]/70 tracking-wider">3D TILES</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[#ccc]">
            <span className="text-[#555]">LAT</span>
            <span>{formatCoordinate(position.latitude, 'lat')}</span>
            <span className="text-[#555]">LON</span>
            <span>{formatCoordinate(position.longitude, 'lon')}</span>
            <span className="text-[#555]">ALT</span>
            <span>{formatAltitude(position.altitude)}</span>
            <span className="text-[#555]">HDG</span>
            <span>{position.heading.toFixed(1)}°</span>
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-[#222]">
            <div className="flex items-center justify-between">
              <span className="text-[#555]">MGRS</span>
              <span className="text-[#aaa] text-[10px]">
                {toMGRS(position.latitude, position.longitude)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom-right: System + Threat ────────────────────────────────── */}
      <div className="fixed bottom-4 right-4 z-40 pointer-events-none">
        <div className="bg-[#0a0a0a]/80 backdrop-blur-sm border border-[#222] rounded-lg p-3 font-mono text-[11px]">

          {/* Threat level */}
          <div className={`flex items-center justify-between mb-2 px-2 py-1 rounded ${tc.bg}`}>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${tc.dot} ${threat === 'CRITICAL' ? 'animate-ping' : threat === 'HIGH' ? 'animate-pulse' : ''}`} />
              <span className="text-[9px] text-[#555] uppercase tracking-wider">Threat</span>
            </div>
            <span className={`text-[10px] font-bold tracking-widest ${tc.text}`}>{threat}</span>
          </div>

          <div className="flex items-center gap-2 mb-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${fps >= 50 ? 'bg-[#00d4aa]' : fps >= 30 ? 'bg-[#ffaa00]' : 'bg-[#ff3333]'}`} />
            <span className="text-[#00d4aa] tracking-wider text-[10px] uppercase">System</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[#ccc]">
            <span className="text-[#555]">FPS</span>
            <span className={fps >= 50 ? 'text-[#00d4aa]' : fps >= 30 ? 'text-[#ffaa00]' : 'text-[#ff3333]'}>
              {fps}
            </span>
            <span className="text-[#555]">MODE</span>
            <span className="uppercase">{visualMode}</span>
            <span className="text-[#555]">LAYERS</span>
            <span>{enabledCount} active</span>
            {totalEvents > 0 && (
              <>
                <span className="text-[#555]">EVENTS</span>
                <span className="text-[#ffaa00]">{totalEvents}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Crosshair ────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <line x1="22" y1="0"  x2="22" y2="16" stroke="#00d4aa" strokeWidth="1" opacity="0.45" />
          <line x1="22" y1="28" x2="22" y2="44" stroke="#00d4aa" strokeWidth="1" opacity="0.45" />
          <line x1="0"  y1="22" x2="16" y2="22" stroke="#00d4aa" strokeWidth="1" opacity="0.45" />
          <line x1="28" y1="22" x2="44" y2="22" stroke="#00d4aa" strokeWidth="1" opacity="0.45" />
          <circle cx="22" cy="22" r="3" stroke="#00d4aa" strokeWidth="1" fill="none" opacity="0.55" />
        </svg>
      </div>

      {/* ── Corner brackets ───────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-20 pointer-events-none">
        <div className="absolute top-8 left-0 w-10 h-10">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-[#00d4aa]/25" />
          <div className="absolute top-0 left-0 w-[1px] h-full bg-[#00d4aa]/25" />
        </div>
        <div className="absolute top-8 right-0 w-10 h-10">
          <div className="absolute top-0 right-0 w-full h-[1px] bg-[#00d4aa]/25" />
          <div className="absolute top-0 right-0 w-[1px] h-full bg-[#00d4aa]/25" />
        </div>
        <div className="absolute bottom-0 left-0 w-10 h-10">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#00d4aa]/25" />
          <div className="absolute bottom-0 left-0 w-[1px] h-full bg-[#00d4aa]/25" />
        </div>
        <div className="absolute bottom-0 right-0 w-10 h-10">
          <div className="absolute bottom-0 right-0 w-full h-[1px] bg-[#00d4aa]/25" />
          <div className="absolute bottom-0 right-0 w-[1px] h-full bg-[#00d4aa]/25" />
        </div>
      </div>
    </>
  )
}
