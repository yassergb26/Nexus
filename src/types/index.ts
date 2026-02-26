export interface MapPosition {
  latitude: number
  longitude: number
  altitude: number
  heading: number
  pitch: number
}

export interface RegionalPreset {
  id: string
  name: string
  latitude: number
  longitude: number
  altitude: number
  heading?: number
  pitch?: number
}

export interface MapLayer {
  id: string
  name: string
  category: LayerCategory
  icon: string
  enabled: boolean
  count?: number
  color: string
}

export type LayerCategory =
  | 'military'
  | 'infrastructure'
  | 'conflicts'
  | 'natural'
  | 'intelligence'
  | 'financial'
  | 'live'

export type VisualMode =
  | 'normal'
  | 'flir'
  | 'nightvision'
  | 'crt'
  | 'anime'
  | 'noir'
  | 'snow'
  | 'satellite'

export interface HudData {
  latitude: number
  longitude: number
  altitude: number
  heading: number
  pitch: number
  zoom: number
  fps: number
}

export interface UrlState {
  lat: number
  lon: number
  alt: number
  heading: number
  pitch: number
  view: string
  layers: string[]
}

export type TimeRange = '1h' | '6h' | '24h' | '7d' | 'all'

export interface FlyToTarget {
  lat: number
  lon: number
  alt: number
  heading?: number
  pitch?: number
}
