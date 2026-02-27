import { useState, useEffect, useRef, useMemo } from 'react'
import { Search, MapPin, Layers, Eye, Globe, Zap, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMapStore } from '../store/useMapStore'
import { REGIONAL_PRESETS } from '../utils/presets'
import { DEFAULT_LAYERS } from '../utils/layers'
import type { VisualMode } from '../types'

// ── Geopolitical capitals + strategic chokepoints ────────────────────────────
const WORLD_CITIES = [
  { name: 'Washington D.C.',  sub: 'USA',               lat: 38.895,  lon: -77.036 },
  { name: 'New York',         sub: 'USA',               lat: 40.712,  lon: -74.006 },
  { name: 'Los Angeles',      sub: 'USA',               lat: 34.052,  lon: -118.244 },
  { name: 'Beijing',          sub: 'China',             lat: 39.905,  lon: 116.407 },
  { name: 'Shanghai',         sub: 'China',             lat: 31.230,  lon: 121.473 },
  { name: 'Hong Kong',        sub: 'China SAR',         lat: 22.302,  lon: 114.177 },
  { name: 'Moscow',           sub: 'Russia',            lat: 55.755,  lon: 37.617 },
  { name: 'London',           sub: 'United Kingdom',    lat: 51.505,  lon: -0.127 },
  { name: 'Paris',            sub: 'France',            lat: 48.856,  lon: 2.352 },
  { name: 'Berlin',           sub: 'Germany',           lat: 52.520,  lon: 13.405 },
  { name: 'Warsaw',           sub: 'Poland',            lat: 52.230,  lon: 21.012 },
  { name: 'Kyiv',             sub: 'Ukraine',           lat: 50.450,  lon: 30.523 },
  { name: 'Minsk',            sub: 'Belarus',           lat: 53.904,  lon: 27.562 },
  { name: 'Istanbul',         sub: 'Turkey',            lat: 41.008,  lon: 28.978 },
  { name: 'Tehran',           sub: 'Iran',              lat: 35.689,  lon: 51.388 },
  { name: 'Tel Aviv',         sub: 'Israel',            lat: 32.085,  lon: 34.781 },
  { name: 'Riyadh',           sub: 'Saudi Arabia',      lat: 24.689,  lon: 46.690 },
  { name: 'Dubai',            sub: 'UAE',               lat: 25.197,  lon: 55.274 },
  { name: 'Baghdad',          sub: 'Iraq',              lat: 33.341,  lon: 44.400 },
  { name: 'Kabul',            sub: 'Afghanistan',       lat: 34.528,  lon: 69.172 },
  { name: 'Cairo',            sub: 'Egypt',             lat: 30.044,  lon: 31.235 },
  { name: 'Tripoli',          sub: 'Libya',             lat: 32.887,  lon: 13.188 },
  { name: 'Khartoum',         sub: 'Sudan',             lat: 15.553,  lon: 32.535 },
  { name: 'Mogadishu',        sub: 'Somalia',           lat:  2.047,  lon: 45.341 },
  { name: 'Lagos',            sub: 'Nigeria',           lat:  6.524,  lon:  3.379 },
  { name: 'Nairobi',          sub: 'Kenya',             lat: -1.286,  lon: 36.820 },
  { name: 'Johannesburg',     sub: 'South Africa',      lat: -26.195, lon: 28.034 },
  { name: 'New Delhi',        sub: 'India',             lat: 28.613,  lon: 77.209 },
  { name: 'Islamabad',        sub: 'Pakistan',          lat: 33.729,  lon: 73.094 },
  { name: 'Tokyo',            sub: 'Japan',             lat: 35.689,  lon: 139.692 },
  { name: 'Seoul',            sub: 'South Korea',       lat: 37.566,  lon: 126.978 },
  { name: 'Pyongyang',        sub: 'North Korea',       lat: 39.019,  lon: 125.738 },
  { name: 'Taipei',           sub: 'Taiwan',            lat: 25.041,  lon: 121.565 },
  { name: 'Singapore',        sub: 'Singapore',         lat:  1.352,  lon: 103.820 },
  { name: 'Yangon',           sub: 'Myanmar',           lat: 16.871,  lon: 96.150 },
  { name: 'Sydney',           sub: 'Australia',         lat: -33.868, lon: 151.209 },
  { name: 'Havana',           sub: 'Cuba',              lat: 23.136,  lon: -82.359 },
  { name: 'São Paulo',        sub: 'Brazil',            lat: -23.543, lon: -46.633 },
  { name: 'Caracas',          sub: 'Venezuela',         lat: 10.480,  lon: -66.903 },
  { name: 'Baku',             sub: 'Azerbaijan',        lat: 40.409,  lon: 49.867 },
  // Strategic chokepoints
  { name: 'Strait of Hormuz', sub: 'Chokepoint · Persian Gulf', lat: 26.560,  lon: 56.248 },
  { name: 'Suez Canal',       sub: 'Chokepoint · Egypt',        lat: 30.458,  lon: 32.552 },
  { name: 'Strait of Malacca',sub: 'Chokepoint · SE Asia',      lat:  2.500,  lon: 101.500 },
  { name: 'Taiwan Strait',    sub: 'Disputed · Pacific',        lat: 24.437,  lon: 118.674 },
  { name: 'Panama Canal',     sub: 'Chokepoint · Panama',       lat:  9.080,  lon: -79.681 },
  { name: 'South China Sea',  sub: 'Disputed · Pacific',        lat: 12.000,  lon: 115.000 },
  { name: 'Bosphorus Strait', sub: 'Chokepoint · Turkey',       lat: 41.120,  lon: 29.085 },
  { name: 'Drake Passage',    sub: 'Strategic · Antarctica',    lat: -58.000, lon: -68.000 },
]

const VISUAL_MODES: { id: VisualMode; label: string; desc: string }[] = [
  { id: 'normal',      label: 'Normal',       desc: 'Standard photorealistic view' },
  { id: 'flir',        label: 'FLIR Thermal', desc: 'Forward-looking infrared sensor' },
  { id: 'nightvision', label: 'Night Vision', desc: 'NVG green-amplified overlay' },
  { id: 'crt',         label: 'CRT Monitor',  desc: 'Retro terminal scanlines' },
  { id: 'anime',       label: 'Anime',        desc: 'Cel-shaded outline style' },
  { id: 'noir',        label: 'Noir',         desc: 'High-contrast B&W' },
  { id: 'snow',        label: 'Snow',         desc: 'Winter particle overlay' },
  { id: 'satellite',   label: 'Satellite ISR',desc: 'False-color recon mode' },
]

type ItemType = 'region' | 'city' | 'layer' | 'mode'

interface CmdItem {
  key: string
  type: ItemType
  label: string
  sub: string
  enabled?: boolean
  action: () => void
}

const TYPE_COLOR: Record<ItemType, string> = {
  region: 'text-[#00d4aa]',
  city:   'text-[#3b82f6]',
  layer:  'text-[#8b5cf6]',
  mode:   'text-[#f59e0b]',
}
const TYPE_BG: Record<ItemType, string> = {
  region: 'bg-[#00d4aa]/10',
  city:   'bg-[#3b82f6]/10',
  layer:  'bg-[#8b5cf6]/10',
  mode:   'bg-[#f59e0b]/10',
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [idx, setIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { flyToPreset, toggleLayer, setVisualMode, layers, setPendingFlyTo } = useMapStore()

  // Build flat items list (memoised — rebuilds only when layers change)
  const allItems = useMemo<CmdItem[]>(() => {
    const items: CmdItem[] = []

    for (const p of REGIONAL_PRESETS) {
      items.push({
        key: `r-${p.id}`, type: 'region',
        label: p.name, sub: 'Region Preset',
        action: () => { flyToPreset(p.id); setOpen(false) },
      })
    }

    for (const c of WORLD_CITIES) {
      items.push({
        key: `c-${c.name}`, type: 'city',
        label: c.name, sub: c.sub,
        action: () => {
          setPendingFlyTo({ lat: c.lat, lon: c.lon, alt: 4000, heading: 0, pitch: -35 })
          setOpen(false)
        },
      })
    }

    for (const l of DEFAULT_LAYERS) {
      const live = layers.find((x) => x.id === l.id)
      items.push({
        key: `l-${l.id}`, type: 'layer',
        label: l.name, sub: `${l.category} layer`,
        enabled: live?.enabled,
        action: () => { toggleLayer(l.id); setOpen(false) },
      })
    }

    for (const m of VISUAL_MODES) {
      items.push({
        key: `m-${m.id}`, type: 'mode',
        label: m.label, sub: m.desc,
        action: () => { setVisualMode(m.id); setOpen(false) },
      })
    }

    return items
  }, [layers, flyToPreset, toggleLayer, setVisualMode, setPendingFlyTo])

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 10)
    const q = query.toLowerCase()
    return allItems
      .filter((i) => i.label.toLowerCase().includes(q) || i.sub.toLowerCase().includes(q))
      .slice(0, 12)
  }, [allItems, query])

  // Reset selection whenever query changes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setIdx(0), [query])

  // Global Cmd+K toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => { if (!o) { setQuery(''); setIdx(0) } return !o })
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40)
  }, [open])

  // Scroll highlighted item into view
  useEffect(() => {
    const el = listRef.current?.children[idx] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [idx])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && filtered[idx]) filtered[idx].action()
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={() => setOpen(false)}
          />

          {/* Palette panel */}
          <motion.div
            className="fixed top-[18%] left-1/2 z-[101] w-[580px] -translate-x-1/2
                       bg-[#0d0d0d] border border-[#252525] rounded-2xl overflow-hidden
                       shadow-[0_40px_100px_rgba(0,0,0,0.85),0_0_0_1px_rgba(0,212,170,0.06)]"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1,  y:   0, scale: 1.00 }}
            exit={{    opacity: 0,  y:  -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1c1c1c]">
              <Search size={15} className="text-[#444] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Search locations, layers, visual modes…"
                className="flex-1 bg-transparent text-[13px] text-[#e0e0e0] placeholder-[#444] outline-none"
              />
              {query && (
                <button onClick={() => { setQuery(''); inputRef.current?.focus() }}
                  className="text-[#444] hover:text-[#888] text-[11px]">
                  clear
                </button>
              )}
              <kbd className="text-[10px] text-[#383838] border border-[#252525] rounded px-1.5 py-0.5 font-mono">ESC</kbd>
            </div>

            {/* Results list */}
            <div ref={listRef} className="max-h-[360px] overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="py-10 text-center text-[12px] text-[#383838]">
                  No results for &ldquo;{query}&rdquo;
                </p>
              ) : filtered.map((item, i) => (
                <button
                  key={item.key}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all
                    border-l-2 ${i === idx
                      ? 'bg-[#00d4aa]/8 border-[#00d4aa]'
                      : 'border-transparent hover:bg-[#181818]'}`}
                  onMouseEnter={() => setIdx(i)}
                  onClick={item.action}
                >
                  {/* Type icon */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${TYPE_BG[item.type]}`}>
                    {item.type === 'region' && <Globe   size={13} className={TYPE_COLOR[item.type]} />}
                    {item.type === 'city'   && <MapPin  size={13} className={TYPE_COLOR[item.type]} />}
                    {item.type === 'layer'  && <Layers  size={13} className={item.enabled ? 'text-[#00d4aa]' : TYPE_COLOR[item.type]} />}
                    {item.type === 'mode'   && <Eye     size={13} className={TYPE_COLOR[item.type]} />}
                  </div>

                  {/* Label + subtitle */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-[#e0e0e0] font-medium truncate">{item.label}</div>
                    <div className="text-[10px] text-[#444] truncate">{item.sub}</div>
                  </div>

                  {/* Layer on/off badge */}
                  {item.type === 'layer' && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono tracking-wider ${
                      item.enabled ? 'bg-[#00d4aa]/15 text-[#00d4aa]' : 'bg-[#1c1c1c] text-[#444]'
                    }`}>
                      {item.enabled ? 'ON' : 'OFF'}
                    </span>
                  )}

                  {i === idx && <ChevronRight size={12} className="text-[#00d4aa] shrink-0" />}
                </button>
              ))}
            </div>

            {/* Footer hints */}
            <div className="flex items-center gap-4 px-4 py-2 border-t border-[#1c1c1c] bg-[#080808]">
              {[['↑↓', 'navigate'], ['↵', 'execute'], ['⌘K', 'toggle']].map(([key, label]) => (
                <div key={key} className="flex items-center gap-1.5 text-[10px] text-[#383838]">
                  <kbd className="border border-[#222] rounded px-1.5 py-0.5 font-mono">{key}</kbd>
                  <span>{label}</span>
                </div>
              ))}
              <div className="ml-auto flex items-center gap-1.5 text-[10px] text-[#333]">
                <Zap size={9} className="text-[#00d4aa]" />
                <span>NEXUS Command</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
