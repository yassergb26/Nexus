import { useState } from 'react'
import {
  Play,
  Sparkles,
  Sun,
  Crosshair,
  Layout,
  ScanSearch,
  EyeOff,
  ChevronDown,
  Minus,
  Plus,
  Gauge,
  Code,
  Zap,
} from 'lucide-react'
import { useMapStore } from '../../store/useMapStore'
import type { VisualMode, LayoutMode, RenderQuality } from '../../types'

/** Slider row with label + value */
function SliderRow({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <span className="text-[9px] text-[#555] font-mono tracking-wider w-16 shrink-0 uppercase">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-[2px] appearance-none bg-[#333] rounded cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5
                   [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-[#00d4aa] [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5
                   [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#00d4aa]
                   [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
      />
      <span className="text-[9px] text-[#444] font-mono w-7 text-right">{value}%</span>
    </div>
  )
}

/** Toggle button used for the main controls */
function ControlButton({
  icon,
  label,
  active,
  onClick,
  accent,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
  accent?: string
}) {
  const activeColor = accent || '#00d4aa'
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full px-3 py-2 transition-all hover:bg-[#1a1a1a]/60 group"
    >
      <div
        className="w-5 h-5 flex items-center justify-center"
        style={{ color: active ? activeColor : '#555' }}
      >
        {icon}
      </div>
      <span
        className="text-[10px] font-mono tracking-wider uppercase"
        style={{ color: active ? activeColor : '#888' }}
      >
        {label}
      </span>
      {active !== undefined && (
        <div
          className="ml-auto w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: active ? activeColor : '#333' }}
        />
      )}
    </button>
  )
}

const LAYOUT_OPTIONS: { id: LayoutMode; label: string }[] = [
  { id: 'tactical', label: 'Tactical' },
  { id: 'clean', label: 'Clean' },
  { id: 'cinematic', label: 'Cinematic' },
]

const QUALITY_OPTIONS: { id: RenderQuality; label: string; desc: string; color: string }[] = [
  { id: 'ultra',  label: 'ULTRA',  desc: 'Max quality · SSE 4 · 2GB tiles',   color: '#c084fc' },
  { id: 'high',   label: 'HIGH',   desc: 'Default · SSE 8 · 1GB tiles',       color: '#00d4aa' },
  { id: 'medium', label: 'MEDIUM', desc: 'Balanced · SSE 16 · render-on-move', color: '#fbbf24' },
  { id: 'low',    label: 'LOW',    desc: 'Laptop · SSE 32 · no AO/fog',        color: '#f97316' },
  { id: 'potato', label: 'POTATO', desc: 'No 3D tiles · flat globe only',      color: '#ef4444' },
]

/** FLIR-specific parameters */
function FlirParameters() {
  const [sensitivity, setSensitivity] = useState(65)
  const [bloomAmt, setBloomAmt] = useState(40)
  const [whot, setWhot] = useState(true)
  const [pixelation, setPixelation] = useState(0)

  return (
    <div className="py-1">
      <SliderRow label="SENSI" value={sensitivity} onChange={setSensitivity} />
      <SliderRow label="BLOOM" value={bloomAmt} onChange={setBloomAmt} />
      <div className="flex items-center gap-2 px-3 py-1.5">
        <span className="text-[9px] text-[#555] font-mono tracking-wider w-16 shrink-0 uppercase">
          POLARITY
        </span>
        <button
          onClick={() => setWhot(!whot)}
          className={`text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-sm transition-all ${
            whot ? 'bg-[#00d4aa] text-[#0a0a0a] font-bold' : 'bg-[#222] text-[#555]'
          }`}
        >
          {whot ? 'WHOT' : 'BHOT'}
        </button>
      </div>
      <SliderRow label="PIXEL" value={pixelation} onChange={setPixelation} />
    </div>
  )
}

/** Mode-specific parameter section names */
const MODE_PARAMS: Partial<Record<VisualMode, string>> = {
  flir: 'FLIR PARAMETERS',
  nightvision: 'NVG PARAMETERS',
  satellite: 'ISR PARAMETERS',
}

export default function RightPanel() {
  const {
    bloomEnabled,
    toggleBloom,
    sharpenAmount,
    setSharpen,
    hudVisible,
    toggleHud,
    cleanUI,
    toggleCleanUI,
    visualMode,
    layoutMode,
    setLayoutMode,
    devMode,
    toggleDevMode,
    renderQuality,
    setRenderQuality,
    fps,
  } = useMapStore()

  const [layoutOpen, setLayoutOpen] = useState(false)
  const [qualityOpen, setQualityOpen] = useState(false)
  const [paramsOpen, setParamsOpen] = useState(true)

  if (cleanUI) return null

  const modeParamTitle = MODE_PARAMS[visualMode]
  const currentQuality = QUALITY_OPTIONS.find((q) => q.id === renderQuality)

  return (
    <div className="fixed top-24 right-4 z-30 flex flex-col gap-[1px] w-[180px] pointer-events-auto">
      {/* Main controls card */}
      <div className="bg-[#0a0a0a]/90 backdrop-blur-sm border border-[#222] rounded overflow-hidden">
        {/* MOVE */}
        <ControlButton
          icon={<Play size={13} />}
          label="MOVE"
          onClick={() => {}}
        />

        {/* BLOOM */}
        <ControlButton
          icon={<Sparkles size={13} />}
          label="BLOOM"
          active={bloomEnabled}
          onClick={toggleBloom}
        />

        {/* SHARPEN */}
        <div>
          <ControlButton
            icon={<Sun size={13} />}
            label="SHARPEN"
            active={sharpenAmount > 0}
            onClick={() => setSharpen(sharpenAmount > 0 ? 0 : 49)}
          />
          <SliderRow label="" value={sharpenAmount} onChange={setSharpen} />
        </div>

        {/* HUD */}
        <ControlButton
          icon={<Crosshair size={13} />}
          label="HUD"
          active={hudVisible}
          onClick={toggleHud}
          accent="#22c55e"
        />

        {/* LAYOUT dropdown */}
        <div className="relative">
          <button
            onClick={() => setLayoutOpen(!layoutOpen)}
            className="flex items-center gap-2 w-full px-3 py-2 transition-all hover:bg-[#1a1a1a]/60"
          >
            <Layout size={13} className="text-[#555]" />
            <span className="text-[10px] font-mono tracking-wider text-[#888] uppercase">
              LAYOUT
            </span>
            <span className="ml-auto text-[9px] font-mono text-[#00d4aa] tracking-wider">
              {layoutMode.toUpperCase()}
            </span>
            <ChevronDown
              size={10}
              className={`text-[#444] transition-transform ${layoutOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {layoutOpen && (
            <div className="bg-[#111] border border-[#222] rounded overflow-hidden">
              {LAYOUT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setLayoutMode(opt.id)
                    setLayoutOpen(false)
                  }}
                  className={`w-full text-left px-3 py-1.5 text-[10px] font-mono tracking-wider transition-colors ${
                    layoutMode === opt.id
                      ? 'text-[#00d4aa] bg-[#00d4aa]/8'
                      : 'text-[#666] hover:bg-[#1a1a1a] hover:text-[#999]'
                  }`}
                >
                  {opt.label.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DETECT */}
        <ControlButton
          icon={<ScanSearch size={13} />}
          label="DETECT"
          onClick={() => {}}
        />

        {/* CLEAN UI */}
        <ControlButton
          icon={<EyeOff size={13} />}
          label="CLEAN UI"
          onClick={toggleCleanUI}
        />
      </div>

      {/* ── RENDER QUALITY panel ─────────────────────────────────────────── */}
      <div className="mt-2 bg-[#0a0a0a]/90 backdrop-blur-sm border border-[#222] rounded overflow-hidden">
        {/* Quality dropdown */}
        <div className="relative">
          <button
            onClick={() => setQualityOpen(!qualityOpen)}
            className="flex items-center gap-2 w-full px-3 py-2 transition-all hover:bg-[#1a1a1a]/60"
          >
            <Gauge size={13} className="text-[#555]" />
            <span className="text-[10px] font-mono tracking-wider text-[#888] uppercase">
              QUALITY
            </span>
            <span
              className="ml-auto text-[9px] font-mono tracking-wider font-bold"
              style={{ color: currentQuality?.color ?? '#00d4aa' }}
            >
              {renderQuality.toUpperCase()}
            </span>
            <ChevronDown
              size={10}
              className={`text-[#444] transition-transform ${qualityOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {qualityOpen && (
            <div className="bg-[#111] border border-[#222] rounded overflow-hidden">
              {QUALITY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setRenderQuality(opt.id)
                    setQualityOpen(false)
                  }}
                  className={`w-full text-left px-3 py-1.5 transition-colors ${
                    renderQuality === opt.id
                      ? 'bg-[#00d4aa]/8'
                      : 'hover:bg-[#1a1a1a]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-mono tracking-wider font-bold"
                      style={{ color: renderQuality === opt.id ? opt.color : '#666' }}
                    >
                      {opt.label}
                    </span>
                    {renderQuality === opt.id && (
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: opt.color }} />
                    )}
                  </div>
                  <div className="text-[8px] text-[#444] font-mono mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DEV MODE toggle */}
        <ControlButton
          icon={<Code size={13} />}
          label="DEV MODE"
          active={devMode}
          onClick={toggleDevMode}
          accent="#f59e0b"
        />

        {/* FPS indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5">
          <Zap size={11} className={fps < 30 ? 'text-[#ef4444]' : fps < 50 ? 'text-[#f59e0b]' : 'text-[#22c55e]'} />
          <span className="text-[9px] font-mono tracking-wider text-[#555]">FPS</span>
          <span
            className="ml-auto text-[10px] font-mono font-bold"
            style={{ color: fps < 30 ? '#ef4444' : fps < 50 ? '#f59e0b' : '#22c55e' }}
          >
            {fps}
          </span>
        </div>

        {/* Dev mode info banner */}
        {devMode && (
          <div className="px-3 py-2 bg-[#f59e0b]/8 border-t border-[#f59e0b]/20">
            <div className="text-[8px] font-mono text-[#f59e0b] tracking-wider">
              DEV MODE ACTIVE
            </div>
            <div className="text-[8px] font-mono text-[#f59e0b]/60 mt-0.5">
              3D tiles disabled. Flat globe only. Toggle off for full quality.
            </div>
          </div>
        )}
      </div>

      {/* Mode-specific PARAMETERS panel */}
      {modeParamTitle && (
        <div className="mt-2 bg-[#0a0a0a]/90 backdrop-blur-sm border border-[#222] rounded overflow-hidden">
          <button
            onClick={() => setParamsOpen(!paramsOpen)}
            className="flex items-center justify-between w-full px-3 py-2 hover:bg-[#111]/60 transition-colors"
          >
            <span className="text-[9px] font-mono tracking-[0.15em] text-[#666] uppercase">
              {modeParamTitle}
            </span>
            {paramsOpen ? (
              <Minus size={10} className="text-[#444]" />
            ) : (
              <Plus size={10} className="text-[#444]" />
            )}
          </button>
          {paramsOpen && (
            <>
              {visualMode === 'flir' && <FlirParameters />}
              {visualMode === 'nightvision' && (
                <div className="py-1">
                  <SliderRow label="GAIN" value={70} onChange={() => {}} />
                  <SliderRow label="NOISE" value={25} onChange={() => {}} />
                </div>
              )}
              {visualMode === 'satellite' && (
                <div className="py-1">
                  <SliderRow label="DENSITY" value={50} onChange={() => {}} />
                  <SliderRow label="CONTRAST" value={60} onChange={() => {}} />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
