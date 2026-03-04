import { X } from 'lucide-react'
import { useMapStore } from '../../store/useMapStore'
import { CCTV_CAMERAS } from '../../data/cctv-cameras'
import { WEBCAM_FEEDS } from '../../data/webcam-feeds'

function PanelCard({ id, children }: { id: string; children: React.ReactNode }) {
  const closePanel = useMapStore((s) => s.closePanel)
  const type = id.split('-')[0].toUpperCase()

  return (
    <div className="bg-[#0a0a0a]/95 backdrop-blur-sm border border-[#222] rounded overflow-hidden w-[280px]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#222]">
        <span className="text-[9px] font-mono tracking-[0.15em] text-[#00d4aa] uppercase">
          {type} DETAIL
        </span>
        <button
          onClick={() => closePanel(id)}
          className="text-[#555] hover:text-[#e0e0e0] transition-colors"
        >
          <X size={12} />
        </button>
      </div>
      <div className="p-3">{children}</div>
    </div>
  )
}

function CctvDetail({ id }: { id: string }) {
  const camId = id.replace('cctv-', '')
  const cam = CCTV_CAMERAS.find((c) => c.id === camId)
  if (!cam) return null
  return (
    <PanelCard id={id}>
      <div className="text-[11px] font-mono text-[#e0e0e0] mb-1">{cam.name}</div>
      <div className="text-[9px] font-mono text-[#555] mb-2">{cam.location}</div>
      <div className="aspect-video bg-black rounded overflow-hidden">
        <iframe
          src={cam.streamUrl}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          title={cam.name}
        />
      </div>
    </PanelCard>
  )
}

function WebcamDetail({ id }: { id: string }) {
  const camId = id.replace('webcam-', '')
  const cam = WEBCAM_FEEDS.find((c) => c.id === camId)
  if (!cam) return null
  return (
    <PanelCard id={id}>
      <div className="text-[11px] font-mono text-[#e0e0e0] mb-1">{cam.name}</div>
      <div className="text-[9px] font-mono text-[#555] mb-1">{cam.location}</div>
      <div className="text-[8px] font-mono text-[#444] mb-2">{cam.description}</div>
      <div className="aspect-video bg-black rounded overflow-hidden">
        <iframe
          src={cam.streamUrl}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          title={cam.name}
        />
      </div>
    </PanelCard>
  )
}

function GenericDetail({ id }: { id: string }) {
  return (
    <PanelCard id={id}>
      <div className="text-[10px] font-mono text-[#888]">
        {id}
      </div>
    </PanelCard>
  )
}

export default function EntityDetailPanels() {
  const openPanels = useMapStore((s) => s.openPanels)
  const cleanUI = useMapStore((s) => s.cleanUI)

  if (cleanUI || openPanels.length === 0) return null

  return (
    <div className="fixed top-24 right-[200px] z-30 flex flex-col gap-2 pointer-events-auto max-h-[calc(100vh-120px)] overflow-y-auto">
      {openPanels.map((id) => {
        if (id.startsWith('cctv-')) return <CctvDetail key={id} id={id} />
        if (id.startsWith('webcam-')) return <WebcamDetail key={id} id={id} />
        return <GenericDetail key={id} id={id} />
      })}
    </div>
  )
}
