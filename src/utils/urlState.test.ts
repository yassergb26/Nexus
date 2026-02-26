import { describe, it, expect, beforeEach } from 'vitest'
import { encodeUrlState, decodeUrlState } from './urlState'
import type { UrlState } from '../types'

describe('encodeUrlState', () => {
  it('encodes full state to query string', () => {
    const state: UrlState = {
      lat: 51.5074,
      lon: -0.1278,
      alt: 5000000,
      heading: 45.5,
      pitch: -60.0,
      view: 'europe',
      layers: ['flights', 'satellites'],
    }
    const result = encodeUrlState(state)
    expect(result).toContain('lat=51.5074')
    expect(result).toContain('lon=-0.1278')
    expect(result).toContain('alt=5000000')
    expect(result).toContain('heading=45.5')
    expect(result).toContain('pitch=-60.0')
    expect(result).toContain('view=europe')
    expect(result).toContain('layers=flights%2Csatellites')
  })

  it('omits view when global', () => {
    const state: UrlState = {
      lat: 20,
      lon: 0,
      alt: 20000000,
      heading: 0,
      pitch: -90,
      view: 'global',
      layers: [],
    }
    const result = encodeUrlState(state)
    expect(result).not.toContain('view=')
  })

  it('omits layers when empty', () => {
    const state: UrlState = {
      lat: 20,
      lon: 0,
      alt: 20000000,
      heading: 0,
      pitch: -90,
      view: 'global',
      layers: [],
    }
    const result = encodeUrlState(state)
    expect(result).not.toContain('layers=')
  })

  it('starts with ?', () => {
    const state: UrlState = {
      lat: 0,
      lon: 0,
      alt: 1000,
      heading: 0,
      pitch: 0,
      view: 'global',
      layers: [],
    }
    expect(encodeUrlState(state)).toMatch(/^\?/)
  })
})

describe('decodeUrlState', () => {
  beforeEach(() => {
    // Reset URL
    window.history.replaceState(null, '', '/')
  })

  it('returns null when no params', () => {
    expect(decodeUrlState()).toBeNull()
  })

  it('decodes lat/lon/alt', () => {
    window.history.replaceState(null, '', '/?lat=51.5074&lon=-0.1278&alt=5000000')
    const result = decodeUrlState()
    expect(result).not.toBeNull()
    expect(result!.lat).toBeCloseTo(51.5074)
    expect(result!.lon).toBeCloseTo(-0.1278)
    expect(result!.alt).toBe(5000000)
  })

  it('decodes view and layers', () => {
    window.history.replaceState(null, '', '/?lat=50&lon=15&view=europe&layers=flights,satellites')
    const result = decodeUrlState()
    expect(result!.view).toBe('europe')
    expect(result!.layers).toEqual(['flights', 'satellites'])
  })

  it('handles partial params', () => {
    window.history.replaceState(null, '', '/?lat=20')
    const result = decodeUrlState()
    expect(result).not.toBeNull()
    expect(result!.lat).toBe(20)
    expect(result!.lon).toBeUndefined()
  })
})
