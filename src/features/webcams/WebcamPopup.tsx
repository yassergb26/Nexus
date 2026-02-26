import { X } from 'lucide-react'
import { WEBCAM_FEEDS } from '../../data/webcam-feeds'
import { useMapStore } from '../../store/useMapStore'

const HOTSPOT_COLORS: Record<string, string> = {
  conflict:  '#ef4444',
  border:    '#f97316',
  maritime:  '#3b82f6',
  political: '#a855f7',
  strategic: '#eab308',
}

export function WebcamPopup() {
  const selectedEntityId = useMapStore((s) => s.selectedEntityId)
  const setSelectedEntityId = useMapStore((s) => s.setSelectedEntityId)

  if (!selectedEntityId?.startsWith('webcam-')) return null

  const camId = selectedEntityId.replace('webcam-', '')
  const cam = WEBCAM_FEEDS.find((c) => c.id === camId)
  if (!cam) return null

  const color = HOTSPOT_COLORS[cam.hotspotType] ?? '#888'

  return (
    <div className="fixed top-12 right-4 z-50 w-[360px] bg-[#0a0a0a]/95 backdrop-blur-md border border-[#222] rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#222]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
            <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color }}>
              {cam.hotspotType.toUpperCase()} HOTSPOT
            </span>
          </div>
          <p className="text-[13px] text-[#e0e0e0] font-medium mt-0.5">{cam.name}</p>
          <p className="text-[11px] text-[#666]">{cam.location}</p>
        </div>
        <button
          onClick={() => setSelectedEntityId(null)}
          className="p-1.5 hover:bg-[#1a1a1a] rounded-lg transition-colors"
        >
          <X size={14} className="text-[#666]" />
        </button>
      </div>

      {/* Video */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={cam.streamUrl}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen"
          allowFullScreen
          frameBorder="0"
          title={cam.name}
        />
      </div>

      <div className="px-4 py-2 text-[10px] text-[#555]">{cam.description}</div>
    </div>
  )
}
