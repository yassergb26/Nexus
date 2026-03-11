import { X, GripVertical } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMapStore } from '../../store/useMapStore'
import { CCTV_CAMERAS } from '../../data/cctv-cameras'
import { WEBCAM_FEEDS } from '../../data/webcam-feeds'
import { MILITARY_BASES } from '../../data/military-bases'
import StreamEmbed from './StreamEmbed'

function PanelCard({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const closePanel = useMapStore((s) => s.closePanel)

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={{ top: -500, left: -800, right: 200, bottom: 200 }}
      dragElastic={0.05}
      className="bg-[#0a0a0a]/95 backdrop-blur-sm border border-[#222] rounded overflow-hidden w-[280px] cursor-default shadow-xl"
      whileDrag={{ scale: 1.02, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
    >
      {/* Drag handle + header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#222] cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-1.5">
          <GripVertical size={10} className="text-[#333]" />
          <span className="text-[9px] font-mono tracking-[0.15em] text-[#00d4aa] uppercase">
            {title}
          </span>
        </div>
        <button
          onClick={() => closePanel(id)}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-[#555] hover:text-[#e0e0e0] transition-colors"
        >
          <X size={12} />
        </button>
      </div>
      <div className="p-3">{children}</div>
    </motion.div>
  )
}

function CctvDetail({ id }: { id: string }) {
  const camId = id.replace('cctv-', '')
  const cam = CCTV_CAMERAS.find((c) => c.id === camId)
  if (!cam) return null
  return (
    <PanelCard id={id} title="CCTV DETAIL">
      <div className="text-[11px] font-mono text-[#e0e0e0] mb-1">{cam.name}</div>
      <div className="text-[9px] font-mono text-[#555] mb-2">{cam.location}</div>
      <StreamEmbed url={cam.streamUrl} fallbackUrls={cam.fallbackUrls} title={cam.name} />
    </PanelCard>
  )
}

function WebcamDetail({ id }: { id: string }) {
  const camId = id.replace('webcam-', '')
  const cam = WEBCAM_FEEDS.find((c) => c.id === camId)
  if (!cam) return null
  return (
    <PanelCard id={id} title="WEBCAM DETAIL">
      <div className="text-[11px] font-mono text-[#e0e0e0] mb-1">{cam.name}</div>
      <div className="text-[9px] font-mono text-[#555] mb-1">{cam.location}</div>
      <div className="text-[8px] font-mono text-[#444] mb-2">{cam.description}</div>
      <StreamEmbed url={cam.streamUrl} fallbackUrls={cam.fallbackUrls} title={cam.name} />
    </PanelCard>
  )
}

function BaseDetail({ id }: { id: string }) {
  const baseId = id.replace('base-', '')
  const base = MILITARY_BASES.find((b) => b.id === baseId)
  if (!base) return null
  return (
    <PanelCard id={id} title="MILITARY BASE">
      <div className="text-[11px] font-mono text-[#e0e0e0] mb-1">{base.name}</div>
      <div className="text-[9px] font-mono text-[#555] mb-2">
        {base.country} &middot; {base.operator} &middot; {base.type}
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-[#555]">Coordinates</span>
          <span className="text-[#888]">{base.lat.toFixed(3)}, {base.lon.toFixed(3)}</span>
        </div>
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-[#555]">Operator</span>
          <span className="text-[#888]">{base.operator}</span>
        </div>
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-[#555]">Type</span>
          <span className="text-[#888] capitalize">{base.type}</span>
        </div>
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-[#555]">Status</span>
          <span className="text-[#00d4aa]">ACTIVE</span>
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-[#222] text-[8px] font-mono text-[#444]">
        Additional intelligence data will be available in future updates.
      </div>
    </PanelCard>
  )
}

function EarthquakeDetail({ id }: { id: string }) {
  const eqId = id.replace('eq-', '')
  return (
    <PanelCard id={id} title="EARTHQUAKE">
      <div className="text-[11px] font-mono text-[#e0e0e0] mb-1">Seismic Event</div>
      <div className="text-[9px] font-mono text-[#555] mb-2">ID: {eqId}</div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-[#555]">Source</span>
          <span className="text-[#888]">USGS</span>
        </div>
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-[#555]">Status</span>
          <span className="text-[#eab308]">RECORDED</span>
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-[#222] text-[8px] font-mono text-[#444]">
        Detailed seismic data, depth, and impact analysis will be available in future updates.
      </div>
    </PanelCard>
  )
}

function FlightDetail({ id }: { id: string }) {
  const flightId = id.replace('flight-', '')
  return (
    <PanelCard id={id} title="FLIGHT DETAIL">
      <div className="text-[11px] font-mono text-[#e0e0e0] mb-1">Flight {flightId}</div>
      <div className="text-[9px] font-mono text-[#555] mb-2">Source: OpenSky Network</div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-[#555]">Callsign</span>
          <span className="text-[#888]">{flightId}</span>
        </div>
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-[#555]">Status</span>
          <span className="text-[#00d4aa]">IN FLIGHT</span>
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-[#222] text-[8px] font-mono text-[#444]">
        Flight route, altitude, speed, and aircraft details will be available in future updates.
      </div>
    </PanelCard>
  )
}

function SatelliteDetail({ id }: { id: string }) {
  const satId = id.replace('sat-', '')
  return (
    <PanelCard id={id} title="SATELLITE">
      <div className="text-[11px] font-mono text-[#e0e0e0] mb-1">Satellite {satId}</div>
      <div className="text-[9px] font-mono text-[#555] mb-2">Source: CelesTrak</div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-[#555]">NORAD ID</span>
          <span className="text-[#888]">{satId}</span>
        </div>
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-[#555]">Status</span>
          <span className="text-[#8b5cf6]">ORBITAL</span>
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-[#222] text-[8px] font-mono text-[#444]">
        Orbital parameters, TLE data, and pass predictions will be available in future updates.
      </div>
    </PanelCard>
  )
}

function GenericDetail({ id }: { id: string }) {
  const type = id.split('-')[0].toUpperCase()
  return (
    <PanelCard id={id} title={`${type} DETAIL`}>
      <div className="text-[11px] font-mono text-[#e0e0e0] mb-1">{id}</div>
      <div className="mt-2 text-[8px] font-mono text-[#444]">
        Detailed information will be available in future updates.
      </div>
    </PanelCard>
  )
}

export default function EntityDetailPanels() {
  const openPanels = useMapStore((s) => s.openPanels)
  const cleanUI = useMapStore((s) => s.cleanUI)

  if (cleanUI || openPanels.length === 0) return null

  // Split panels into columns of 3, stacking bottom-right → up → left
  const columns: string[][] = []
  for (let i = 0; i < openPanels.length; i++) {
    const colIndex = Math.floor(i / 3)
    if (!columns[colIndex]) columns[colIndex] = []
    columns[colIndex].push(openPanels[i])
  }

  function renderPanel(id: string) {
    if (id.startsWith('cctv-')) return <CctvDetail key={id} id={id} />
    if (id.startsWith('webcam-')) return <WebcamDetail key={id} id={id} />
    if (id.startsWith('base-')) return <BaseDetail key={id} id={id} />
    if (id.startsWith('eq-')) return <EarthquakeDetail key={id} id={id} />
    if (id.startsWith('flight-')) return <FlightDetail key={id} id={id} />
    if (id.startsWith('sat-')) return <SatelliteDetail key={id} id={id} />
    return <GenericDetail key={id} id={id} />
  }

  return (
    <div className="fixed bottom-20 right-4 z-30 flex flex-row-reverse items-end gap-2 pointer-events-auto">
      {columns.map((col, colIdx) => (
        <div key={colIdx} className="flex flex-col-reverse gap-2">
          {col.map(renderPanel)}
        </div>
      ))}
    </div>
  )
}
