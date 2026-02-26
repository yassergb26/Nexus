import { describe, it, expect } from 'vitest'
import { DEFAULT_LAYERS } from './layers'
import type { LayerCategory } from '../types'

describe('DEFAULT_LAYERS', () => {
  it('has 25 layers', () => {
    expect(DEFAULT_LAYERS.length).toBe(25)
  })

  it('all layers have required fields', () => {
    for (const layer of DEFAULT_LAYERS) {
      expect(layer.id).toBeTruthy()
      expect(layer.name).toBeTruthy()
      expect(layer.category).toBeTruthy()
      expect(layer.icon).toBeTruthy()
      expect(layer.color).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(layer.enabled).toBe(false)
    }
  })

  it('has unique IDs', () => {
    const ids = DEFAULT_LAYERS.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('covers all expected categories', () => {
    const categories = new Set(DEFAULT_LAYERS.map((l) => l.category))
    const expected: LayerCategory[] = [
      'military',
      'infrastructure',
      'conflicts',
      'natural',
      'live',
      'financial',
    ]
    for (const cat of expected) {
      expect(categories.has(cat)).toBe(true)
    }
  })

  it('all layers start disabled', () => {
    expect(DEFAULT_LAYERS.every((l) => !l.enabled)).toBe(true)
  })
})
