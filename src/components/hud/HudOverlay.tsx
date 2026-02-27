import { useState, useEffect, useMemo } from 'react'
import { useMapStore } from '../../store/useMapStore'
import { formatCoordinate, toMGRS } from '../../utils/formatters'
import { LANDMARKS } from '../../data/landmarks'
import type { MapLayer } from '../../types'

// ── Threat level derived from active layer event counts ─────────────────────
type ThreatLevel = 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL'

function computeThreatLevel(layers: MapLayer[]): ThreatLevel {
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

/** Fake satellite telemetry that increments */
function useOrbitalCounter() {
  const [orb, setOrb] = useState(47916)
  useEffect(() => {
    const t = setInterval(() => setOrb((o) => o + 1), 90_000)
    return () => clearInterval(t)
  }, [])
  return orb
}

/** Live UTC clock */
function useUtcClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

/** Generate a summary line based on position + nearest landmark */
function useSummaryLine() {
  const { position, visualMode, activeLandmark } = useMapStore()

  return useMemo(() => {
    const modeName = visualMode === 'normal' ? 'NORMAL' :
                     visualMode === 'nightvision' ? 'NVG' : visualMode.toUpperCase()

    // Find nearest landmark
    let nearestName = ''
    let nearestCity = ''
    let minDist = Infinity

    for (const lm of LANDMARKS) {
      const dlat = lm.lat - position.latitude
      const dlon = lm.lon - position.longitude
      const dist = Math.sqrt(dlat * dlat + dlon * dlon)
      if (dist < minDist) {
        minDist = dist
        nearestName = lm.name
        nearestCity = lm.city
      }
    }

    if (activeLandmark) {
      const lm = LANDMARKS.find((l) => l.id === activeLandmark)
      if (lm) {
        nearestName = lm.name
        nearestCity = lm.city
      }
    }

    const distKm = Math.round(minDist * 111)
    const city = nearestCity ? ` (${nearestCity.toUpperCase()})` : ''
    return `${modeName} STREET NEAR ${nearestName.toUpperCase()}${city} ${distKm}KM | NORTH`
  }, [position.latitude, position.longitude, visualMode, activeLandmark])
}

/** Format lat/lon as DMS string */
function toDMS(decimal: number, isLat: boolean): string {
  const abs = Math.abs(decimal)
  const d = Math.floor(abs)
  const mFull = (abs - d) * 60
  const m = Math.floor(mFull)
  const s = ((mFull - m) * 60).toFixed(2)
  const dir = isLat ? (decimal >= 0 ? 'N' : 'S') : (decimal >= 0 ? 'E' : 'W')
  return `${d.toString().padStart(isLat ? 2 : 3, '0')}°${m.toString().padStart(2, '0')}'${s.padStart(5, '0')}"${dir}`
}

export default function HudOverlay() {
  const { position, hudVisible, visualMode, layers, cleanUI } = useMapStore()
  const utc = useUtcClock()
  const orb = useOrbitalCounter()
  const summary = useSummaryLine()
  const threat = useMemo(() => computeThreatLevel(layers), [layers])
  const [passNum] = useState(() => 192 + Math.floor((Date.now() / 600_000) % 100))

  if (!hudVisible || cleanUI) return null

  const modeName = visualMode === 'normal' ? 'NORMAL' :
                   visualMode === 'nightvision' ? 'NVG' : visualMode.toUpperCase()

  const utcStr = `${utc.getUTCFullYear()}-${String(utc.getUTCMonth() + 1).padStart(2, '0')}-${String(utc.getUTCDate()).padStart(2, '0')} ${String(utc.getUTCHours()).padStart(2, '0')}:${String(utc.getUTCMinutes()).padStart(2, '0')}:${String(utc.getUTCSeconds()).padStart(2, '0')}Z`

  const mgrs = toMGRS(position.latitude, position.longitude)
  const latDMS = toDMS(position.latitude, true)
  const lonDMS = toDMS(position.longitude, false)

  const collTime = `${String(utc.getUTCHours()).padStart(2, '0')}:${String(utc.getUTCMinutes()).padStart(2, '0')}:${String(utc.getUTCSeconds()).padStart(2, '0')}.${String(utc.getUTCMilliseconds()).padStart(3, '0')}`

  return (
    <>
      {/* ── Top-left: Classification + Satellite ID + Mode ──────────────── */}
      <div className="fixed top-4 left-4 z-40 pointer-events-none font-mono">
        <div className="text-[#00d4aa] text-[11px] tracking-[0.25em] font-bold">
          TOP SECRET // SI-TK // NOFORN
        </div>
        <div className="flex items-center gap-3 mt-1">
          {/* Corner bracket */}
          <div className="relative">
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-[#00d4aa]/60" />
          </div>
          <span className="text-[#666] text-[11px] tracking-wider ml-2">
            KH11-{4084 + Math.floor(orb / 10000)} OPS-{4114 + Math.floor(passNum / 50)}
          </span>
        </div>
        <div className="text-[#e0e0e0] text-[18px] font-bold tracking-wider mt-1.5">
          {modeName}
        </div>
        <div className="text-[#555] text-[9px] tracking-[0.2em] uppercase mt-1">
          SUMMARY
        </div>
        <div className="text-[#999] text-[10px] tracking-wide mt-0.5 max-w-[450px]">
          {summary}
        </div>
      </div>

      {/* ── Top-right: Active Style + REC + Telemetry ───────────────────── */}
      <div className="fixed top-4 right-4 z-40 pointer-events-none font-mono text-right">
        <div className="text-[#555] text-[9px] tracking-[0.2em] uppercase">
          ACTIVE STYLE
        </div>
        <div className="text-[#00d4aa] text-[18px] font-bold tracking-wider">
          {modeName}
        </div>
        <div className="flex items-center justify-end gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-[#ff2222] animate-pulse" />
          <span className="text-[#999] text-[11px] tracking-wider">
            REC {utcStr}
          </span>
        </div>
        <div className="text-[#666] text-[10px] tracking-wider mt-1">
          ORB: {orb} PASS: DESC-{passNum}
        </div>
      </div>

      {/* ── Bottom-left: MGRS + Coordinates ─────────────────────────────── */}
      <div className="fixed bottom-8 left-4 z-40 pointer-events-none font-mono">
        <div className="flex items-start gap-0">
          {/* Corner bracket character */}
          <span className="text-[#00d4aa]/60 text-[14px] leading-none">&#x2310;</span>
          <div className="ml-1">
            <div className="text-[#00d4aa] text-[11px] tracking-wider">
              MGRS: {mgrs}
            </div>
            <div className="text-[#999] text-[11px] tracking-wider mt-0.5">
              {latDMS} {lonDMS}
            </div>
          </div>
        </div>
      </div>

      {/* ── Left edge: Vertical running text ────────────────────────────── */}
      <div className="fixed top-0 left-0 z-20 pointer-events-none h-full flex items-center">
        <div
          className="font-mono text-[9px] text-[#333] tracking-[0.15em]"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          COLL {collTime} &nbsp; {formatCoordinate(position.latitude, 'lat')} &nbsp; {formatCoordinate(position.longitude, 'lon')} &nbsp; ALT:{Math.round(position.altitude)}M &nbsp; HDG:{position.heading.toFixed(0)}° &nbsp; THREAT:{threat}
        </div>
      </div>

      {/* ── Right edge: Vertical running text ───────────────────────────── */}
      <div className="fixed top-0 right-0 z-20 pointer-events-none h-full flex items-center">
        <div
          className="font-mono text-[9px] text-[#333] tracking-[0.15em]"
          style={{ writingMode: 'vertical-lr' }}
        >
          BAND: PAN &nbsp; PASS: II &nbsp; LVL: 1A &nbsp; SNR: 42.7dB &nbsp; BITS: 16 &nbsp; GSD: 0.31M
        </div>
      </div>

      {/* ── Crosshair ───────────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center" style={{ top: '4%' }}>
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <line x1="22" y1="0"  x2="22" y2="16" stroke="#00d4aa" strokeWidth="1" opacity="0.35" />
          <line x1="22" y1="28" x2="22" y2="44" stroke="#00d4aa" strokeWidth="1" opacity="0.35" />
          <line x1="0"  y1="22" x2="16" y2="22" stroke="#00d4aa" strokeWidth="1" opacity="0.35" />
          <line x1="28" y1="22" x2="44" y2="22" stroke="#00d4aa" strokeWidth="1" opacity="0.35" />
          <circle cx="22" cy="22" r="3" stroke="#00d4aa" strokeWidth="1" fill="none" opacity="0.45" />
        </svg>
      </div>

      {/* ── Corner brackets (larger, brighter) ──────────────────────────── */}
      <div className="fixed inset-0 z-20 pointer-events-none">
        {/* Top-left */}
        <div className="absolute top-3 left-3 w-6 h-6">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-[#00d4aa]/35" />
          <div className="absolute top-0 left-0 w-[1px] h-full bg-[#00d4aa]/35" />
        </div>
        {/* Top-right */}
        <div className="absolute top-3 right-3 w-6 h-6">
          <div className="absolute top-0 right-0 w-full h-[1px] bg-[#00d4aa]/35" />
          <div className="absolute top-0 right-0 w-[1px] h-full bg-[#00d4aa]/35" />
        </div>
        {/* Bottom-left */}
        <div className="absolute bottom-3 left-3 w-6 h-6">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#00d4aa]/35" />
          <div className="absolute bottom-0 left-0 w-[1px] h-full bg-[#00d4aa]/35" />
        </div>
        {/* Bottom-right */}
        <div className="absolute bottom-3 right-3 w-6 h-6">
          <div className="absolute bottom-0 right-0 w-full h-[1px] bg-[#00d4aa]/35" />
          <div className="absolute bottom-0 right-0 w-[1px] h-full bg-[#00d4aa]/35" />
        </div>
      </div>
    </>
  )
}
