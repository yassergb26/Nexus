import { useEffect, useRef, useCallback } from 'react'
import type { Cesium3DTileset, PostProcessStageComposite } from 'cesium'
import {
  Viewer,
  Cartesian3,
  Math as CesiumMath,
  Color,
  createGooglePhotorealistic3DTileset,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Cartographic,
  defined,
  Ion,
  JulianDate,
} from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { useMapStore } from '../../store/useMapStore'
import { REGIONAL_PRESETS } from '../../utils/presets'
import { updateUrl } from '../../utils/urlState'
import { useCesiumViewerContext } from '../../contexts/CesiumViewerContext'
import type { RenderQuality } from '../../types'

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN || ''

// ── Render quality presets ─────────────────────────────────────────────────
// Each preset tunes: resolutionScale, SSE, MSAA, postProcessing, fog, HDR,
// tile memory cap (MB), and whether to load 3D tiles at all.
interface QualitySettings {
  resolutionScale: number
  sse: number
  msaa: number
  ao: boolean
  fxaa: boolean
  fog: boolean
  hdr: boolean
  tileMemoryMB: number
  skip3DTiles: boolean       // true = flat globe only (dev/potato mode)
  requestRenderMode: boolean // true = only re-render on camera move
  dynamicSSE: boolean
}

const QUALITY_PRESETS: Record<RenderQuality, QualitySettings> = {
  ultra: {
    resolutionScale: 1.0,
    sse: 4,
    msaa: 4,
    ao: true,
    fxaa: true,
    fog: true,
    hdr: true,
    tileMemoryMB: 2048,
    skip3DTiles: false,
    requestRenderMode: false,
    dynamicSSE: true,
  },
  high: {
    resolutionScale: 1.0,
    sse: 8,
    msaa: 4,
    ao: true,
    fxaa: true,
    fog: true,
    hdr: true,
    tileMemoryMB: 1024,
    skip3DTiles: false,
    requestRenderMode: false,
    dynamicSSE: true,
  },
  medium: {
    resolutionScale: 0.85,
    sse: 16,
    msaa: 2,
    ao: false,
    fxaa: true,
    fog: false,
    hdr: true,
    tileMemoryMB: 512,
    skip3DTiles: false,
    requestRenderMode: true,
    dynamicSSE: true,
  },
  low: {
    resolutionScale: 0.65,
    sse: 32,
    msaa: 1,
    ao: false,
    fxaa: false,
    fog: false,
    hdr: false,
    tileMemoryMB: 256,
    skip3DTiles: false,
    requestRenderMode: true,
    dynamicSSE: false,
  },
  potato: {
    resolutionScale: 0.5,
    sse: 64,
    msaa: 1,
    ao: false,
    fxaa: false,
    fog: false,
    hdr: false,
    tileMemoryMB: 128,
    skip3DTiles: true,
    requestRenderMode: true,
    dynamicSSE: false,
  },
}

export default function GlobeViewer() {
  const { viewerRef, setViewerReady } = useCesiumViewerContext()
  const containerRef = useRef<HTMLDivElement>(null)
  const fpsFrames = useRef<number[]>([])
  const lastFpsUpdate = useRef(0)
  const initialMount = useRef(true)
  const tilesetRef = useRef<Cesium3DTileset | null>(null)
  const aoRef = useRef<PostProcessStageComposite | null>(null)
  const syncGlobeRef = useRef<(() => void) | null>(null)

  const {
    setPosition,
    setFps,
    activePreset,
    pendingFlyTo,
    setPendingFlyTo,
    performanceMode,
    devMode,
    renderQuality,
  } = useMapStore()

  const flyTo = useCallback(
    (lat: number, lon: number, alt: number, heading = 0, pitch = -90) => {
      const viewer = viewerRef.current
      if (!viewer) return
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(lon, lat, alt),
        orientation: {
          heading: CesiumMath.toRadians(heading),
          pitch: CesiumMath.toRadians(pitch),
          roll: 0,
        },
        duration: 2.0,
      })
    },
    [viewerRef]
  )

  // Initialize Cesium viewer
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return

    const q = QUALITY_PRESETS[renderQuality]

    const viewer = new Viewer(containerRef.current, {
      timeline: false,
      animation: false,
      homeButton: false,
      geocoder: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      creditContainer: document.createElement('div'),
      msaaSamples: q.msaa,
      useBrowserRecommendedResolution: true,
      // requestRenderMode: only re-render when camera moves or data changes
      // Saves massive GPU cycles when the user isn't interacting
      requestRenderMode: q.requestRenderMode,
      maximumRenderTimeChange: q.requestRenderMode ? Infinity : undefined,
    })

    // Dark space background
    viewer.scene.backgroundColor = new Color(0.04, 0.04, 0.04, 1.0)

    // ── Render quality settings ─────────────────────────────────────────
    viewer.scene.highDynamicRange = q.hdr
    viewer.resolutionScale = q.resolutionScale
    viewer.shadows = false

    viewer.scene.fog.enabled = q.fog
    if (q.fog) viewer.scene.fog.density = 0.0002

    // ── Post-processing pipeline ────────────────────────────────────────
    const ao = viewer.scene.postProcessStages.ambientOcclusion
    ao.enabled = q.ao
    aoRef.current = ao
    if (q.ao) {
      ao.uniforms.intensity = 0.5
      ao.uniforms.bias = 0.1
      ao.uniforms.lengthCap = 0.26
      ao.uniforms.stepSize = 1.95
      ao.uniforms.frustumLength = 1000.0
    }

    viewer.scene.postProcessStages.bloom.enabled = false
    viewer.scene.postProcessStages.fxaa.enabled = q.fxaa

    // Globe fallback settings
    viewer.scene.globe.enableLighting = true

    // ── Tile memory budget ──────────────────────────────────────────────
    // This is the single most impactful setting for low-RAM machines.
    // Cesium will evict tiles from GPU/CPU memory once this cap is hit.
    viewer.scene.globe.tileCacheSize = 100

    // ── 3D Tiles (skip entirely in dev/potato mode) ─────────────────────
    if (!q.skip3DTiles && !devMode) {
      createGooglePhotorealistic3DTileset()
        .then((tileset) => {
          tileset.maximumScreenSpaceError = q.sse
          tileset.skipLevelOfDetail = true
          tileset.dynamicScreenSpaceError = q.dynamicSSE
          // Memory budget: limit how much tile data Cesium caches
          // Cap GPU tile memory (cacheBytes is in bytes)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(tileset as any).cacheBytes = q.tileMemoryMB * 1024 * 1024
          // Reduce concurrent tile requests to ease network + GPU pressure
          tileset.preloadFlightDestinations = false
          tileset.preferLeaves = true
          viewer.scene.primitives.add(tileset)
          tilesetRef.current = tileset

          // Altitude-based globe visibility
          const CITY_THRESHOLD = 200000
          const syncGlobe = () => {
            const alt = viewer.camera.positionCartographic?.height ?? Infinity
            viewer.scene.globe.show = alt > CITY_THRESHOLD
          }
          syncGlobeRef.current = syncGlobe
          syncGlobe()
          viewer.camera.changed.addEventListener(syncGlobe)
          viewer.camera.moveEnd.addEventListener(syncGlobe)
        })
        .catch((err) => {
          console.warn('Google 3D Tiles not available, using default globe:', err.message)
        })
    }

    // Pin clock to solar noon
    const initNoon = new Date()
    initNoon.setUTCHours(12, 0, 0, 0)
    viewer.clock.currentTime = JulianDate.fromDate(initNoon)

    // Initial camera position
    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(0, 20, 20000000),
      orientation: {
        heading: 0,
        pitch: CesiumMath.toRadians(-90),
        roll: 0,
      },
    })

    // Track camera movement — only update URL on moveEnd
    const updatePositionLive = () => {
      const cartographic = viewer.camera.positionCartographic
      if (cartographic) {
        setPosition({
          latitude: CesiumMath.toDegrees(cartographic.latitude),
          longitude: CesiumMath.toDegrees(cartographic.longitude),
          altitude: cartographic.height,
          heading: CesiumMath.toDegrees(viewer.camera.heading),
          pitch: CesiumMath.toDegrees(viewer.camera.pitch),
        })
      }
    }

    const updatePositionFinal = () => {
      updatePositionLive()
      const cartographic = viewer.camera.positionCartographic
      if (cartographic) {
        const enabledLayers = useMapStore
          .getState()
          .layers.filter((l) => l.enabled)
          .map((l) => l.id)
        updateUrl({
          lat: CesiumMath.toDegrees(cartographic.latitude),
          lon: CesiumMath.toDegrees(cartographic.longitude),
          alt: cartographic.height,
          heading: CesiumMath.toDegrees(viewer.camera.heading),
          pitch: CesiumMath.toDegrees(viewer.camera.pitch),
          view: useMapStore.getState().activePreset,
          layers: enabledLayers,
        })
      }
    }

    viewer.camera.changed.addEventListener(updatePositionLive)
    viewer.camera.moveEnd.addEventListener(updatePositionFinal)

    // FPS counter — throttled to 2 updates/sec
    viewer.scene.postRender.addEventListener(() => {
      const now = performance.now()
      fpsFrames.current.push(now)
      fpsFrames.current = fpsFrames.current.filter((t) => now - t < 1000)
      if (now - lastFpsUpdate.current > 500) {
        lastFpsUpdate.current = now
        setFps(fpsFrames.current.length)
      }
    })

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler.setInputAction((movement: any) => {
      const cartesian = viewer.camera.pickEllipsoid(
        movement.endPosition,
        viewer.scene.globe.ellipsoid
      )
      if (defined(cartesian)) {
        Cartographic.fromCartesian(cartesian)
      }
    }, ScreenSpaceEventType.MOUSE_MOVE)

    viewerRef.current = viewer
    setViewerReady(true)

    return () => {
      handler.destroy()
      setViewerReady(false)
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPosition, setFps, setViewerReady, devMode])

  // ── Apply render quality at runtime ─────────────────────────────────────
  // Changing quality doesn't require re-creating the viewer — we just
  // update the relevant properties live.
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    // If performanceMode is on, override to 'low'; otherwise use store value
    const effectiveQuality = performanceMode ? 'low' : renderQuality
    const q = QUALITY_PRESETS[effectiveQuality]

    viewer.resolutionScale = q.resolutionScale
    viewer.scene.highDynamicRange = q.hdr
    viewer.scene.fog.enabled = q.fog

    // Post-processing
    if (aoRef.current) aoRef.current.enabled = q.ao
    viewer.scene.postProcessStages.fxaa.enabled = q.fxaa

    // requestRenderMode toggle
    viewer.scene.requestRenderMode = q.requestRenderMode
    if (q.requestRenderMode) {
      viewer.scene.maximumRenderTimeChange = Infinity
    }

    // Tileset tuning
    if (tilesetRef.current) {
      tilesetRef.current.maximumScreenSpaceError = q.sse
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(tilesetRef.current as any).cacheBytes = q.tileMemoryMB * 1024 * 1024
      tilesetRef.current.dynamicScreenSpaceError = q.dynamicSSE

      // In dev/potato: hide 3D tiles entirely
      if (q.skip3DTiles || devMode) {
        tilesetRef.current.show = false
        viewer.scene.globe.show = true
      } else {
        tilesetRef.current.show = true
        // Re-run altitude sync
        syncGlobeRef.current?.()
      }
    }
  }, [performanceMode, renderQuality, devMode, viewerRef])

  // React to preset changes — skip initial mount
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false
      return
    }
    const preset = REGIONAL_PRESETS.find((p) => p.id === activePreset)
    if (preset) {
      flyTo(
        preset.latitude,
        preset.longitude,
        preset.altitude,
        preset.heading ?? 0,
        preset.pitch ?? -90
      )
      const viewer = viewerRef.current
      if (viewer) {
        const noon = new Date()
        noon.setUTCHours(Math.round(12 - preset.longitude / 15), 0, 0, 0)
        viewer.clock.currentTime = JulianDate.fromDate(noon)
      }
    }
  }, [activePreset, flyTo, viewerRef])

  // Command-palette arbitrary fly-to
  useEffect(() => {
    if (!pendingFlyTo) return
    const { lat, lon, alt, heading = 0, pitch = -35 } = pendingFlyTo
    flyTo(lat, lon, alt, heading, pitch)
    const viewer = viewerRef.current
    if (viewer) {
      const noon = new Date()
      noon.setUTCHours(Math.round(12 - lon / 15), 0, 0, 0)
      viewer.clock.currentTime = JulianDate.fromDate(noon)
    }
    setPendingFlyTo(null)
  }, [pendingFlyTo, flyTo, viewerRef, setPendingFlyTo])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: '#0a0a0a' }}
    />
  )
}
