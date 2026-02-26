import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CustomDataSource, Cartesian3, Color, NearFarScalar } from 'cesium'
import * as satellite from 'satellite.js'
import { useCesiumViewerContext } from '../../contexts/CesiumViewerContext'
import { useMapStore } from '../../store/useMapStore'

interface SatRecord {
  name: string
  satrec: satellite.SatRec
}

function propagateToCartesian(satrec: satellite.SatRec): Cartesian3 | null {
  try {
    const now = new Date()
    const posVel = satellite.propagate(satrec, now)
    if (!posVel) return null
    const pos = posVel.position
    if (!pos || typeof pos === 'boolean') return null
    const gmst = satellite.gstime(now)
    const geo = satellite.eciToGeodetic(pos, gmst)
    const lon = (geo.longitude * 180) / Math.PI
    const lat = (geo.latitude * 180) / Math.PI
    const alt = geo.height * 1000 // km → m
    if (!isFinite(lon) || !isFinite(lat) || !isFinite(alt) || alt < 0) return null
    return Cartesian3.fromDegrees(lon, lat, alt)
  } catch {
    return null
  }
}

function parseTleText(text: string): SatRecord[] {
  const lines = text.trim().split('\n').map((l) => l.trim())
  const records: SatRecord[] = []
  for (let i = 0; i + 2 < lines.length; i += 3) {
    const name = lines[i]
    const line1 = lines[i + 1]
    const line2 = lines[i + 2]
    if (!line1.startsWith('1 ') || !line2.startsWith('2 ')) continue
    try {
      const satrec = satellite.twoline2satrec(line1, line2)
      records.push({ name, satrec })
    } catch { /* skip malformed */ }
  }
  return records
}

async function fetchStationTLEs(): Promise<SatRecord[]> {
  const res = await fetch('https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle')
  if (!res.ok) throw new Error(`CelesTrak error: ${res.status}`)
  const text = await res.text()
  return parseTleText(text)
}

export function useSatellitesLayer() {
  const { viewerRef, viewerReady } = useCesiumViewerContext()
  const isEnabled = useMapStore((s) => s.layers.find((l) => l.id === 'satellites')?.enabled ?? false)
  const setLayerCount = useMapStore((s) => s.setLayerCount)
  const dataSourceRef = useRef<CustomDataSource | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { data: satRecords } = useQuery({
    queryKey: ['satellites-tle'],
    queryFn: fetchStationTLEs,
    enabled: isEnabled,
    refetchInterval: 6 * 60 * 60_000, // 6 hours
    staleTime: 5.5 * 60 * 60_000,
  })

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !viewerReady || viewer.isDestroyed()) return
    const ds = new CustomDataSource('satellites')
    viewer.dataSources.add(ds)
    dataSourceRef.current = ds
    return () => {
      if (viewer && !viewer.isDestroyed()) {
        viewer.dataSources.remove(ds, true)
      }
      dataSourceRef.current = null
    }
  }, [viewerRef, viewerReady])

  // Build entities when TLE data arrives
  useEffect(() => {
    const ds = dataSourceRef.current
    if (!ds) return

    ds.entities.removeAll()
    if (intervalRef.current) clearInterval(intervalRef.current)

    if (!isEnabled || !satRecords?.length) {
      setLayerCount('satellites', 0)
      return
    }

    // Add a point entity per satellite
    for (const { name, satrec } of satRecords) {
      const pos = propagateToCartesian(satrec)
      if (!pos) continue
      ds.entities.add({
        id: `sat-${name}`,
        name,
        position: pos,
        point: {
          pixelSize: 7,
          color: Color.fromCssColorString('#8b5cf6'),
          outlineColor: Color.fromCssColorString('#8b5cf6').withAlpha(0.4),
          outlineWidth: 2,
          scaleByDistance: new NearFarScalar(1e5, 2.5, 5e7, 0.6),
        },
        description: `<b>${name}</b><br/>Orbital Station` as unknown as any,
      })
    }
    setLayerCount('satellites', satRecords.length)

    // Update positions every 5s
    intervalRef.current = setInterval(() => {
      const source = dataSourceRef.current
      if (!source) return
      for (const { name, satrec } of satRecords) {
        const entity = source.entities.getById(`sat-${name}`)
        if (!entity) continue
        const pos = propagateToCartesian(satrec)
        if (pos) entity.position = pos as unknown as any
      }
    }, 5000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [satRecords, isEnabled, setLayerCount])
}
