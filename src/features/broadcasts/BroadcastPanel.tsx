import { useState } from 'react'
import { X, Radio, ChevronDown, ChevronUp } from 'lucide-react'
import { useMapStore } from '../../store/useMapStore'
import { BROADCAST_STREAMS } from '../../data/broadcast-streams'

export function BroadcastPanel() {
  const isEnabled = useMapStore((s) => s.layers.find((l) => l.id === 'broadcasts')?.enabled ?? false)
  const [activeStream, setActiveStream] = useState(BROADCAST_STREAMS[0].id)
  const [minimized, setMinimized] = useState(false)

  if (!isEnabled) return null

  const active = BROADCAST_STREAMS.find((s) => s.id === activeStream) ?? BROADCAST_STREAMS[0]

  return (
    <div className="fixed bottom-20 right-4 z-50 w-[380px] bg-[#0a0a0a]/95 backdrop-blur-md border border-[#222] rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#222]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] animate-pulse" />
          <Radio size={12} className="text-[#8b5cf6]" />
          <span className="text-[11px] text-[#8b5cf6] uppercase tracking-wider font-medium">Live Broadcasts</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimized(!minimized)}
            className="p-1 hover:bg-[#1a1a1a] rounded transition-colors"
          >
            {minimized
              ? <ChevronUp size={14} className="text-[#666]" />
              : <ChevronDown size={14} className="text-[#666]" />}
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Active stream player */}
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              key={activeStream}
              src={active.streamUrl}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
              frameBorder="0"
              title={active.name}
            />
          </div>

          {/* Stream info */}
          <div className="px-4 py-2 border-b border-[#1a1a1a]">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-sm"
                style={{ backgroundColor: active.accentColor }}
              />
              <span className="text-[12px] text-[#e0e0e0] font-medium">{active.name}</span>
              <span className="ml-auto text-[10px] text-[#555]">{active.region} · {active.language}</span>
            </div>
          </div>

          {/* Stream selector */}
          <div className="grid grid-cols-4 gap-1 p-2">
            {BROADCAST_STREAMS.map((stream) => (
              <button
                key={stream.id}
                onClick={() => setActiveStream(stream.id)}
                className={`text-[9px] px-1 py-1.5 rounded text-center transition-all leading-tight ${
                  activeStream === stream.id
                    ? 'border text-white'
                    : 'bg-[#111] text-[#666] border border-[#222] hover:bg-[#1a1a1a]'
                }`}
                style={activeStream === stream.id ? {
                  backgroundColor: `${stream.accentColor}20`,
                  borderColor: `${stream.accentColor}60`,
                  color: stream.accentColor,
                } : {}}
              >
                {stream.network.replace(' ', '\n')}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
