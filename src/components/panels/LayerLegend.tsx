import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useMapStore } from '../../store/useMapStore'

interface LegendItem {
  color: string
  label: string
}

const FLIGHT_LEGEND: LegendItem[] = [
  { color: '#00d4aa', label: 'Active flight' },
]

const BASE_LEGEND: LegendItem[] = [
  { color: '#ef4444', label: 'USA' },
  { color: '#3b82f6', label: 'NATO' },
  { color: '#f59e0b', label: 'Russia' },
  { color: '#dc2626', label: 'China' },
  { color: '#6366f1', label: 'UK' },
  { color: '#8b5cf6', label: 'France' },
  { color: '#6b7280', label: 'Other' },
]

const EARTHQUAKE_LEGEND: LegendItem[] = [
  { color: '#ffd700', label: 'M4.0 – 4.9' },
  { color: '#ff8c00', label: 'M5.0 – 5.9' },
  { color: '#ff4500', label: 'M6.0 – 6.9' },
  { color: '#ff0000', label: 'M7.0+' },
]

const SATELLITE_LEGEND: LegendItem[] = [
  { color: '#8b5cf6', label: 'Orbital station' },
]

const CCTV_LEGEND: LegendItem[] = [
  { color: '#10b981', label: 'CCTV camera' },
]

const WEBCAM_LEGEND: LegendItem[] = [
  { color: '#ef4444', label: 'Conflict zone' },
  { color: '#f97316', label: 'Border region' },
  { color: '#3b82f6', label: 'Maritime chokepoint' },
  { color: '#a855f7', label: 'Political hotspot' },
  { color: '#eab308', label: 'Strategic location' },
]

interface LegendSectionProps {
  title: string
  items: LegendItem[]
  enabled: boolean
}

function LegendSection({ title, items, enabled }: LegendSectionProps) {
  if (!enabled) return null
  return (
    <div className="mb-2 last:mb-0">
      <div className="text-[8px] font-mono tracking-[0.15em] text-[#555] uppercase mb-1">
        {title}
      </div>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 py-0.5">
          <div
            className="w-2.5 h-2.5 rounded-sm shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-[9px] font-mono text-[#888]">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function LayerLegend() {
  const [open, setOpen] = useState(false)
  const layers = useMapStore((s) => s.layers)
  const cleanUI = useMapStore((s) => s.cleanUI)

  if (cleanUI) return null

  const isEnabled = (id: string) => layers.find((l) => l.id === id)?.enabled ?? false
  const anyEnabled = ['flights', 'bases', 'earthquakes', 'satellites', 'cctv', 'webcams'].some(isEnabled)

  if (!anyEnabled) return null

  return (
    <div className="fixed bottom-24 left-4 z-30 pointer-events-auto">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0a0a0a]/90 backdrop-blur-sm
                   border border-[#222] rounded hover:border-[#00d4aa]/30 transition-colors"
      >
        <div className="flex gap-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
        </div>
        <span className="text-[9px] font-mono tracking-wider text-[#888] uppercase">LEGEND</span>
        {open ? <ChevronDown size={10} className="text-[#555]" /> : <ChevronUp size={10} className="text-[#555]" />}
      </button>

      {open && (
        <div className="mt-1 bg-[#0a0a0a]/95 backdrop-blur-sm border border-[#222] rounded p-3 max-h-[300px] overflow-y-auto">
          <LegendSection title="Flights" items={FLIGHT_LEGEND} enabled={isEnabled('flights')} />
          <LegendSection title="Military Bases" items={BASE_LEGEND} enabled={isEnabled('bases')} />
          <LegendSection title="Earthquakes" items={EARTHQUAKE_LEGEND} enabled={isEnabled('earthquakes')} />
          <LegendSection title="Satellites" items={SATELLITE_LEGEND} enabled={isEnabled('satellites')} />
          <LegendSection title="CCTV" items={CCTV_LEGEND} enabled={isEnabled('cctv')} />
          <LegendSection title="Webcams" items={WEBCAM_LEGEND} enabled={isEnabled('webcams')} />
        </div>
      )}
    </div>
  )
}
