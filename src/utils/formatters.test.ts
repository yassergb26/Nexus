import { describe, it, expect } from 'vitest'
import { formatCoordinate, formatAltitude, formatNumber, toMGRS } from './formatters'

describe('formatCoordinate', () => {
  it('formats positive latitude', () => {
    const result = formatCoordinate(51.5074, 'lat')
    expect(result).toContain('N')
    expect(result).toContain('51°')
  })

  it('formats negative latitude', () => {
    const result = formatCoordinate(-33.8688, 'lat')
    expect(result).toContain('S')
    expect(result).toContain('33°')
  })

  it('formats positive longitude', () => {
    const result = formatCoordinate(139.6917, 'lon')
    expect(result).toContain('E')
    expect(result).toContain('139°')
  })

  it('formats negative longitude', () => {
    const result = formatCoordinate(-73.9857, 'lon')
    expect(result).toContain('W')
    expect(result).toContain('73°')
  })

  it('handles zero latitude', () => {
    const result = formatCoordinate(0, 'lat')
    expect(result).toContain('N')
    expect(result).toContain('0°')
  })

  it('handles zero longitude', () => {
    const result = formatCoordinate(0, 'lon')
    expect(result).toContain('E')
  })
})

describe('formatAltitude', () => {
  it('formats meters below 1000', () => {
    expect(formatAltitude(500)).toBe('500 m')
  })

  it('formats kilometers', () => {
    expect(formatAltitude(5000)).toBe('5.0 km')
  })

  it('formats large altitudes', () => {
    expect(formatAltitude(20000000)).toBe('20000.0 km')
  })

  it('formats exactly 1000m as km', () => {
    expect(formatAltitude(1000)).toBe('1.0 km')
  })

  it('formats small values', () => {
    expect(formatAltitude(10)).toBe('10 m')
  })
})

describe('formatNumber', () => {
  it('formats millions', () => {
    expect(formatNumber(1500000)).toBe('1.5M')
  })

  it('formats thousands', () => {
    expect(formatNumber(2500)).toBe('2.5K')
  })

  it('returns small numbers as-is', () => {
    expect(formatNumber(42)).toBe('42')
  })

  it('formats exactly 1000', () => {
    expect(formatNumber(1000)).toBe('1.0K')
  })

  it('formats exactly 1000000', () => {
    expect(formatNumber(1000000)).toBe('1.0M')
  })
})

describe('toMGRS', () => {
  it('returns valid MGRS for London', () => {
    const result = toMGRS(51.5074, -0.1278)
    expect(result).toMatch(/^\d{1,2}[C-X]\s\d{5}\s\d{5}$/)
  })

  it('returns valid MGRS for equator/prime meridian', () => {
    const result = toMGRS(0, 0)
    expect(result).toMatch(/^\d{1,2}[C-X]\s\d{5}\s\d{5}$/)
  })

  it('returns N/A for north pole', () => {
    expect(toMGRS(85, 0)).toBe('N/A (polar)')
  })

  it('returns N/A for south pole', () => {
    expect(toMGRS(-81, 0)).toBe('N/A (polar)')
  })

  it('handles dateline correctly', () => {
    const result = toMGRS(35, 179.9)
    expect(result).toMatch(/^\d{1,2}[C-X]\s\d{5}\s\d{5}$/)
  })

  it('handles negative dateline', () => {
    const result = toMGRS(35, -179.9)
    expect(result).toMatch(/^\d{1,2}[C-X]\s\d{5}\s\d{5}$/)
  })
})
