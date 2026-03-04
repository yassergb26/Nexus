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
  DirectionalLight,
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
  tileOverflowMB: number     // extra cache before eviction kicks in
  requestRenderMode: boolean  // true = only re-render on camera move
  dynamicSSE: boolean
  preloadFlyTo: boolean       // pre-fetch tiles at camera fly destination
  foveatedEnabled: boolean    // prioritize center-screen tile loading
  foveatedConeSize: number    // center-screen cone (0 = none, 0.3 = default)
}

const QUALITY_PRESETS: Record<RenderQuality, QualitySettings> = {
  ultra: {
    resolutionScale: 1.0,
    sse: 2,
    msaa: 4,
    ao: true,
    fxaa: true,
    fog: true,
    hdr: true,
    tileMemoryMB: 2048,
    tileOverflowMB: 1024,
    requestRenderMode: false,
    dynamicSSE: true,
    preloadFlyTo: true,
    foveatedConeSize: 0.1,
    foveatedEnabled: true,
  },
  high: {
    resolutionScale: 1.0,
    sse: 6,
    msaa: 4,
    ao: true,
    fxaa: true,
    fog: true,
    hdr: true,
    tileMemoryMB: 1024,
    tileOverflowMB: 512,
    requestRenderMode: false,
    dynamicSSE: true,
    preloadFlyTo: true,
    foveatedConeSize: 0.2,
    foveatedEnabled: true,
  },
  medium: {
    resolutionScale: 0.85,
    sse: 12,
    msaa: 2,
    ao: false,
    fxaa: true,
    fog: false,
    hdr: true,
    tileMemoryMB: 512,
    tileOverflowMB: 256,
    requestRenderMode: true,
    dynamicSSE: true,
    preloadFlyTo: false,
    foveatedConeSize: 0.3,
    foveatedEnabled: false,
  },
  low: {
    resolutionScale: 0.65,
    sse: 24,
    msaa: 1,
    ao: false,
    fxaa: false,
    fog: false,
    hdr: false,
    tileMemoryMB: 256,
    tileOverflowMB: 128,
    requestRenderMode: true,
    dynamicSSE: false,
    preloadFlyTo: false,
    foveatedConeSize: 0.4,
    foveatedEnabled: false,
  },
  potato: {
    resolutionScale: 0.5,
    sse: 48,
    msaa: 1,
    ao: false,
    fxaa: false,
    fog: false,
    hdr: false,
    tileMemoryMB: 128,
    tileOverflowMB: 64,
    requestRenderMode: true,
    dynamicSSE: false,
    preloadFlyTo: false,
    foveatedConeSize: 0.5,
    foveatedEnabled: false,
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

  const {
    setPosition,
    setFps,
    activePreset,
    pendingFlyTo,
    setPendingFlyTo,
    performanceMode,
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
      globe: false,
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
    viewer.scene.light = new DirectionalLight({
      direction: new Cartesian3(0.35, -0.9, -0.28),
      intensity: 1.8,
    })

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

    // ── Google Photorealistic 3D Tiles ───────────────────────────────────
    createGooglePhotorealistic3DTileset()
      .then((tileset) => {
        // Core quality: lower SSE = sharper buildings, more tiles loaded
        tileset.maximumScreenSpaceError = q.sse

        // IMPORTANT: skipLevelOfDetail must be FALSE for sharp buildings.
        // When true, low-res ancestor tiles bleed through while children
        // load, causing blurry/popping artifacts (CesiumGS/cesium#7903).
        // Cesium changed default to false in v1.67 for this reason.
        tileset.skipLevelOfDetail = false

        // Dynamic SSE: slightly reduce quality only for far-horizon tiles
        tileset.dynamicScreenSpaceError = q.dynamicSSE
        tileset.dynamicScreenSpaceErrorDensity = 0.0018
        tileset.dynamicScreenSpaceErrorFactor = 2.0
        tileset.dynamicScreenSpaceErrorHeightFalloff = 0.25

        // Foveated rendering: prioritize center-screen loading order,
        // but keep relaxation at 0 so edge tiles still reach full quality
        tileset.foveatedScreenSpaceError = q.foveatedEnabled
        tileset.foveatedConeSize = q.foveatedConeSize
        tileset.foveatedMinimumScreenSpaceErrorRelaxation = 0.0
        tileset.foveatedTimeDelay = 0.1

        // Loading strategy
        tileset.preferLeaves = false
        tileset.loadSiblings = true
        tileset.preloadFlightDestinations = q.preloadFlyTo
        // 0 = always show full-res immediately, no low-res placeholders
        tileset.progressiveResolutionHeightFraction = 0.0

        // Memory budget — generous to avoid evicting sharp tiles
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(tileset as any).cacheBytes = q.tileMemoryMB * 1024 * 1024
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(tileset as any).maximumCacheOverflowBytes = q.tileOverflowMB * 1024 * 1024

        viewer.scene.primitives.add(tileset)
        tilesetRef.current = tileset
      })
      .catch((err) => {
        console.warn('Google 3D Tiles not available:', err.message)
      })

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
      const cartesian = viewer.camera.pickEllipsoid(movement.endPosition)
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
  }, [setPosition, setFps, setViewerReady])

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
      tilesetRef.current.dynamicScreenSpaceError = q.dynamicSSE
      tilesetRef.current.foveatedScreenSpaceError = q.foveatedEnabled
      tilesetRef.current.foveatedConeSize = q.foveatedConeSize
      tilesetRef.current.preloadFlightDestinations = q.preloadFlyTo
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(tilesetRef.current as any).cacheBytes = q.tileMemoryMB * 1024 * 1024
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(tilesetRef.current as any).maximumCacheOverflowBytes = q.tileOverflowMB * 1024 * 1024
    }
  }, [performanceMode, renderQuality, viewerRef])

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
