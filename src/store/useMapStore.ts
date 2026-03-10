import { create } from 'zustand'
import type { MapPosition, VisualMode, MapLayer, RegionalPreset, TimeRange, FlyToTarget, LayoutMode, RenderQuality } from '../types'
import { REGIONAL_PRESETS } from '../utils/presets'
import { DEFAULT_LAYERS } from '../utils/layers'

interface MapState {
  position: MapPosition
  visualMode: VisualMode
  layers: MapLayer[]
  activePreset: string
  sidebarOpen: boolean
  hudVisible: boolean
  fps: number
  selectedEntityId: string | null
  timeRange: TimeRange
  pendingFlyTo: FlyToTarget | null
  performanceMode: boolean
  sharpenAmount: number
  bloomEnabled: boolean
  cleanUI: boolean
  activeCity: string | null
  activeLandmark: string | null
  layoutMode: LayoutMode
  renderQuality: RenderQuality
  circularViewport: boolean
  hoveredEntity: { id: string; screenX: number; screenY: number; name: string } | null
  openPanels: string[]

  setPosition: (position: Partial<MapPosition>) => void
  setVisualMode: (mode: VisualMode) => void
  toggleLayer: (layerId: string) => void
  setLayerCount: (layerId: string, count: number) => void
  flyToPreset: (presetId: string) => void
  toggleSidebar: () => void
  toggleHud: () => void
  setFps: (fps: number) => void
  setSelectedEntityId: (id: string | null) => void
  getActivePreset: () => RegionalPreset | undefined
  setTimeRange: (range: TimeRange) => void
  setPendingFlyTo: (target: FlyToTarget | null) => void
  togglePerformanceMode: () => void
  setSharpen: (amount: number) => void
  toggleBloom: () => void
  toggleCleanUI: () => void
  setActiveCity: (city: string | null) => void
  setActiveLandmark: (id: string | null) => void
  setLayoutMode: (mode: LayoutMode) => void
  setRenderQuality: (quality: RenderQuality) => void
  toggleCircularViewport: () => void
  flyHome: () => void
  resetAll: () => void
  setHoveredEntity: (entity: { id: string; screenX: number; screenY: number; name: string } | null) => void
  openPanel: (id: string) => void
  closePanel: (id: string) => void
}

export const useMapStore = create<MapState>((set, get) => ({
  position: {
    latitude: 20.0,
    longitude: 0.0,
    altitude: 20000000,
    heading: 0,
    pitch: -90,
  },
  visualMode: 'normal',
  layers: DEFAULT_LAYERS,
  activePreset: 'global',
  sidebarOpen: true,
  hudVisible: false,
  fps: 60,
  selectedEntityId: null,

  setPosition: (position) =>
    set((state) => ({
      position: { ...state.position, ...position },
    })),

  setVisualMode: (mode) => set({ visualMode: mode }),

  toggleLayer: (layerId) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId ? { ...l, enabled: !l.enabled } : l
      ),
    })),

  setLayerCount: (layerId, count) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId ? { ...l, count } : l
      ),
    })),

  flyToPreset: (presetId) => set({ activePreset: presetId }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  toggleHud: () => set((state) => ({ hudVisible: !state.hudVisible })),

  setFps: (fps) => set({ fps }),

  setSelectedEntityId: (id) => set({ selectedEntityId: id }),

  getActivePreset: () => REGIONAL_PRESETS.find((p) => p.id === get().activePreset),

  timeRange: '24h',
  pendingFlyTo: null,
  performanceMode: false,
  sharpenAmount: 49,
  bloomEnabled: false,
  cleanUI: false,
  activeCity: null,
  activeLandmark: null,
  layoutMode: 'standard',
  renderQuality: 'high',
  circularViewport: false,
  hoveredEntity: null,
  openPanels: [],
  setTimeRange: (range) => set({ timeRange: range }),
  setPendingFlyTo: (target) => set({ pendingFlyTo: target }),
  togglePerformanceMode: () => set((state) => ({ performanceMode: !state.performanceMode })),
  setSharpen: (amount) => set({ sharpenAmount: amount }),
  toggleBloom: () => set((state) => ({ bloomEnabled: !state.bloomEnabled })),
  toggleCleanUI: () => set((state) => ({ cleanUI: !state.cleanUI })),
  setActiveCity: (city) => set({ activeCity: city, activeLandmark: null }),
  setActiveLandmark: (id) => set({ activeLandmark: id }),
  setLayoutMode: (mode) => {
    if (mode === 'standard') {
      set({ layoutMode: mode, hudVisible: false, circularViewport: false, cleanUI: false })
    } else if (mode === 'tactical') {
      set({ layoutMode: mode, hudVisible: true, circularViewport: true, cleanUI: false })
    } else if (mode === 'cinematic') {
      set({ layoutMode: mode, hudVisible: false, circularViewport: false, cleanUI: true })
    }
  },
  setRenderQuality: (quality) => set({ renderQuality: quality }),
  toggleCircularViewport: () => set((state) => ({ circularViewport: !state.circularViewport })),
  flyHome: () => set({ pendingFlyTo: { lat: 20, lon: 0, alt: 20_000_000, heading: 0, pitch: -90 } }),
  resetAll: () => set({
    layers: DEFAULT_LAYERS,
    openPanels: [],
    selectedEntityId: null,
    layoutMode: 'standard',
    hudVisible: false,
    circularViewport: false,
    cleanUI: false,
    bloomEnabled: false,
    sharpenAmount: 49,
    visualMode: 'normal',
  }),
  setHoveredEntity: (entity) => set({ hoveredEntity: entity }),
  openPanel: (id) => set((state) => {
    if (state.openPanels.includes(id)) return state
    const panels = [...state.openPanels, id].slice(-4) // max 4 panels
    return { openPanels: panels }
  }),
  closePanel: (id) => set((state) => ({ openPanels: state.openPanels.filter((p) => p !== id) })),
}))
