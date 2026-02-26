import { describe, it, expect } from 'vitest'
import { REGIONAL_PRESETS } from './presets'

describe('REGIONAL_PRESETS', () => {
  it('has 8 presets', () => {
    expect(REGIONAL_PRESETS.length).toBe(8)
  })

  it('all presets have required fields', () => {
    for (const preset of REGIONAL_PRESETS) {
      expect(preset.id).toBeTruthy()
      expect(preset.name).toBeTruthy()
      expect(typeof preset.latitude).toBe('number')
      expect(typeof preset.longitude).toBe('number')
      expect(typeof preset.altitude).toBe('number')
      expect(preset.latitude).toBeGreaterThanOrEqual(-90)
      expect(preset.latitude).toBeLessThanOrEqual(90)
      expect(preset.longitude).toBeGreaterThanOrEqual(-180)
      expect(preset.longitude).toBeLessThanOrEqual(180)
      expect(preset.altitude).toBeGreaterThan(0)
    }
  })

  it('has unique IDs', () => {
    const ids = REGIONAL_PRESETS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes global preset', () => {
    const global = REGIONAL_PRESETS.find((p) => p.id === 'global')
    expect(global).toBeDefined()
    expect(global!.altitude).toBe(20000000)
  })

  it('includes all expected regions', () => {
    const ids = REGIONAL_PRESETS.map((p) => p.id)
    expect(ids).toContain('global')
    expect(ids).toContain('americas')
    expect(ids).toContain('europe')
    expect(ids).toContain('mena')
    expect(ids).toContain('asia')
    expect(ids).toContain('africa')
    expect(ids).toContain('oceania')
    expect(ids).toContain('latam')
  })
})
