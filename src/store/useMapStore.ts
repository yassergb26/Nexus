import { create } from 'zustand'
import type { MapPosition, VisualMode, MapLayer, RegionalPreset, TimeRange, FlyToTarget } from '../types'
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
  hudVisible: true,
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
  setTimeRange: (range) => set({ timeRange: range }),
  setPendingFlyTo: (target) => set({ pendingFlyTo: target }),
}))
