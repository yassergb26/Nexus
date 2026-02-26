import type { TimeRange } from '../types'

export interface USGSFeature {
  type: 'Feature'
  properties: {
    mag: number
    place: string
    time: number
    updated: number
    alert: string | null
    tsunami: number
    sig: number
    title: string
    type: string
  }
  geometry: {
    type: 'Point'
    coordinates: [number, number, number]
  }
  id: string
}

interface USGSResponse {
  type: 'FeatureCollection'
  metadata: { generated: number; count: number; title: string }
  features: USGSFeature[]
}

const USGS_FEEDS: Record<TimeRange, string> = {
  '1h':  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
  '6h':  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
  '24h': 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson',
  '7d':  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson',
  'all': 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson',
}

export async function fetchEarthquakes(timeRange: TimeRange = '24h'): Promise<USGSFeature[]> {
  const url = USGS_FEEDS[timeRange]
  const res = await fetch(url)
  if (!res.ok) throw new Error(`USGS API error: ${res.status}`)
  const data: USGSResponse = await res.json()
  if (timeRange === '6h') {
    const cutoff = Date.now() - 6 * 60 * 60 * 1000
    return data.features.filter((f) => f.properties.time >= cutoff)
  }
  return data.features
}
