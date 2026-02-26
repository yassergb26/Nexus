import { describe, it, expect, beforeEach } from 'vitest'
import { useMapStore } from './useMapStore'

describe('useMapStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useMapStore.setState({
      position: {
        latitude: 20.0,
        longitude: 0.0,
        altitude: 20000000,
        heading: 0,
        pitch: -90,
      },
      visualMode: 'normal',
      activePreset: 'global',
      sidebarOpen: true,
      hudVisible: true,
      fps: 60,
      layers: useMapStore.getState().layers.map((l) => ({ ...l, enabled: false })),
    })
  })

  it('has correct initial position', () => {
    const { position } = useMapStore.getState()
    expect(position.latitude).toBe(20.0)
    expect(position.longitude).toBe(0.0)
    expect(position.altitude).toBe(20000000)
  })

  it('setPosition updates partial position', () => {
    useMapStore.getState().setPosition({ latitude: 51.5, longitude: -0.13 })
    const { position } = useMapStore.getState()
    expect(position.latitude).toBe(51.5)
    expect(position.longitude).toBe(-0.13)
    expect(position.altitude).toBe(20000000) // unchanged
  })

  it('toggleLayer enables and disables', () => {
    const { toggleLayer, layers } = useMapStore.getState()
    const firstLayer = layers[0]
    expect(firstLayer.enabled).toBe(false)

    toggleLayer(firstLayer.id)
    expect(useMapStore.getState().layers[0].enabled).toBe(true)

    toggleLayer(firstLayer.id)
    expect(useMapStore.getState().layers[0].enabled).toBe(false)
  })

  it('setLayerCount updates count', () => {
    useMapStore.getState().setLayerCount('flights', 1234)
    const flights = useMapStore.getState().layers.find((l) => l.id === 'flights')
    expect(flights!.count).toBe(1234)
  })

  it('flyToPreset updates activePreset', () => {
    useMapStore.getState().flyToPreset('europe')
    expect(useMapStore.getState().activePreset).toBe('europe')
  })

  it('toggleSidebar toggles state', () => {
    expect(useMapStore.getState().sidebarOpen).toBe(true)
    useMapStore.getState().toggleSidebar()
    expect(useMapStore.getState().sidebarOpen).toBe(false)
    useMapStore.getState().toggleSidebar()
    expect(useMapStore.getState().sidebarOpen).toBe(true)
  })

  it('toggleHud toggles state', () => {
    expect(useMapStore.getState().hudVisible).toBe(true)
    useMapStore.getState().toggleHud()
    expect(useMapStore.getState().hudVisible).toBe(false)
  })

  it('setFps updates fps', () => {
    useMapStore.getState().setFps(45)
    expect(useMapStore.getState().fps).toBe(45)
  })

  it('setVisualMode updates mode', () => {
    useMapStore.getState().setVisualMode('flir')
    expect(useMapStore.getState().visualMode).toBe('flir')
  })

  it('getActivePreset returns correct preset', () => {
    useMapStore.getState().flyToPreset('europe')
    const preset = useMapStore.getState().getActivePreset()
    expect(preset).toBeDefined()
    expect(preset!.id).toBe('europe')
    expect(preset!.name).toBe('Europe')
  })

  it('has 25 default layers', () => {
    expect(useMapStore.getState().layers.length).toBe(25)
  })
})
