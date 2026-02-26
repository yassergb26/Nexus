import type { UrlState } from '../types'

export function encodeUrlState(state: UrlState): string {
  const params = new URLSearchParams()
  params.set('lat', state.lat.toFixed(4))
  params.set('lon', state.lon.toFixed(4))
  params.set('alt', Math.round(state.alt).toString())
  params.set('heading', state.heading.toFixed(1))
  params.set('pitch', state.pitch.toFixed(1))
  if (state.view !== 'global') params.set('view', state.view)
  if (state.layers.length > 0) params.set('layers', state.layers.join(','))
  return `?${params.toString()}`
}

export function decodeUrlState(): Partial<UrlState> | null {
  const params = new URLSearchParams(window.location.search)
  if (!params.has('lat')) return null

  const state: Partial<UrlState> = {}
  const lat = params.get('lat')
  const lon = params.get('lon')
  const alt = params.get('alt')
  const heading = params.get('heading')
  const pitch = params.get('pitch')
  const view = params.get('view')
  const layers = params.get('layers')

  if (lat) state.lat = parseFloat(lat)
  if (lon) state.lon = parseFloat(lon)
  if (alt) state.alt = parseFloat(alt)
  if (heading) state.heading = parseFloat(heading)
  if (pitch) state.pitch = parseFloat(pitch)
  if (view) state.view = view
  if (layers) state.layers = layers.split(',')

  return state
}

export function updateUrl(state: UrlState): void {
  const url = encodeUrlState(state)
  window.history.replaceState(null, '', url)
}
