import { useState } from 'react'
import { Plus, Minus, Plane, Satellite, Activity, Camera, Car, CloudLightning, Shield } from 'lucide-react'
import { useMapStore } from '../../store/useMapStore'

/** Source labels for display under layer names */
const LAYER_SOURCES: Record<string, string> = {
  flights:     'OpenSky Network',
  bases:       'OSINT · 60 bases',
  earthquakes: 'USGS',
  satellites:  'CelesTrak',
  weather:     'NOAA NEXRAD (globe overlay)',
  cctv:        'CCTV Mesh + Street View fallback',
  webcams:     'GBFS',
}

/** Icon mapping for the data layers list */
const LAYER_ICONS: Record<string, React.ReactNode> = {
  flights:     <Plane size={14} className="text-[#00d4aa]" />,
  bases:       <Shield size={14} className="text-[#ef4444]" />,
  earthquakes: <Activity size={14} className="text-[#eab308]" />,
  satellites:  <Satellite size={14} className="text-[#8b5cf6]" />,
  weather:     <CloudLightning size={14} className="text-[#64748b]" />,
  cctv:        <Camera size={14} className="text-[#10b981]" />,
  webcams:     <Car size={14} className="text-[#14b8a6]" />,
}

/** Primary layers shown in the DATA LAYERS panel (matching WorldView) */
const PRIMARY_LAYER_IDS = [
  'flights',
  'bases',
  'earthquakes',
  'satellites',
  'weather',
  'cctv',
  'webcams',
]

interface CollapsiblePanelProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  /** Optional short info shown to the right of the title when collapsed */
  badge?: string
}

function CollapsiblePanel({ title, children, defaultOpen = false, badge }: CollapsiblePanelProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="pointer-events-auto">
      {/* Header — wide horizontal bar matching WorldView */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-3.5
                   bg-[#0d0d0d]/90 backdrop-blur-md border border-[#1e1e1e]
                   rounded-lg hover:bg-[#141414]/90 hover:border-[#2a2a2a]
                   transition-all duration-150"
      >
        <span className="text-[11px] font-mono tracking-[0.18em] text-[#888] uppercase select-none">
          {title}
        </span>
        <div className="flex items-center gap-3">
          {badge && !open && (
            <span className="text-[9px] text-[#444] font-mono">{badge}</span>
          )}
          <div className="w-5 h-5 flex items-center justify-center rounded border border-[#2a2a2a] bg-[#111]">
            {open ? (
              <Minus size={11} className="text-[#666]" />
            ) : (
              <Plus size={11} className="text-[#666]" />
            )}
          </div>
        </div>
      </button>

      {/* Content — drops below with slight gap */}
      {open && (
        <div className="mt-1 bg-[#0d0d0d]/90 backdrop-blur-md border border-[#1e1e1e] rounded-lg overflow-hidden">
          {children}
        </div>
      )}
    </div>
  )
}

function OnOffToggle({ enabled, onClick }: { enabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={`text-[9px] font-mono tracking-wider px-2.5 py-0.5 rounded transition-all ${
        enabled
          ? 'bg-[#00d4aa] text-[#0a0a0a] font-bold'
          : 'bg-[#1a1a1a] text-[#555] border border-[#2a2a2a]'
      }`}
    >
      {enabled ? 'ON' : 'OFF'}
    </button>
  )
}

export default function Sidebar() {
  const { layers, toggleLayer, cleanUI } = useMapStore()

  if (cleanUI) return null

  const getLayer = (id: string) => layers.find((l) => l.id === id)
  const enabledCount = layers.filter((l) => l.enabled).length

  return (
    <div className="fixed top-28 left-5 z-30 flex flex-col gap-3 w-[240px] pointer-events-none">
      {/* CCTV MESH */}
      <CollapsiblePanel title="CCTV MESH">
        <div className="px-5 py-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#888] font-mono">Camera feeds</span>
            <OnOffToggle
              enabled={getLayer('cctv')?.enabled ?? false}
              onClick={() => toggleLayer('cctv')}
            />
          </div>
          <div className="mt-2 text-[9px] text-[#444] font-mono">
            CCTV Mesh + Street View fallback
          </div>
        </div>
      </CollapsiblePanel>

      {/* DATA LAYERS */}
      <CollapsiblePanel
        title="DATA LAYERS"
        defaultOpen={false}
        badge={enabledCount > 0 ? `${enabledCount} active` : undefined}
      >
        <div className="py-1.5">
          {PRIMARY_LAYER_IDS.map((id) => {
            const layer = getLayer(id)
            if (!layer) return null
            return (
              <div
                key={id}
                className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#161616] transition-colors"
              >
                {/* Icon */}
                <div className="w-5 flex-shrink-0 flex justify-center">
                  {LAYER_ICONS[id] || <Activity size={14} className="text-[#555]" />}
                </div>

                {/* Name + source */}
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-[#ccc] font-mono truncate">
                    {layer.name}
                    {layer.count !== undefined && layer.enabled && (
                      <span className="ml-2 text-[#00d4aa]">{layer.count}</span>
                    )}
                  </div>
                  <div className="text-[8px] text-[#444] font-mono truncate mt-0.5">
                    {LAYER_SOURCES[id] || layer.category}
                  </div>
                </div>

                {/* ON/OFF toggle */}
                <OnOffToggle
                  enabled={layer.enabled}
                  onClick={() => toggleLayer(id)}
                />
              </div>
            )
          })}
        </div>
      </CollapsiblePanel>

      {/* SCENES */}
      <CollapsiblePanel title="SCENES">
        <div className="px-5 py-3.5">
          <div className="text-[10px] text-[#555] font-mono">No saved scenes</div>
          <div className="mt-2 text-[9px] text-[#333] font-mono">
            Save camera positions as reusable presets
          </div>
        </div>
      </CollapsiblePanel>
    </div>
  )
}
