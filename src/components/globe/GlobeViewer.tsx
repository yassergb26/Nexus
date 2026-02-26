import { useEffect, useRef, useCallback } from 'react'
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

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN || ''

export default function GlobeViewer() {
  const { viewerRef, setViewerReady } = useCesiumViewerContext()
  const containerRef = useRef<HTMLDivElement>(null)
  const fpsFrames = useRef<number[]>([])
  const lastFpsUpdate = useRef(0)
  const initialMount = useRef(true)
  const { setPosition, setFps, activePreset, pendingFlyTo, setPendingFlyTo } = useMapStore()

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
    []
  )

  // Initialize Cesium viewer
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return

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
      msaaSamples: 4,
      useBrowserRecommendedResolution: true,
      requestRenderMode: false,
    })

    // Dark space background
    viewer.scene.backgroundColor = new Color(0.04, 0.04, 0.04, 1.0)

    // ── Render quality: maximum ────────────────────────────────────────────
    // HDR: physically correct colour/contrast (biggest single improvement)
    viewer.scene.highDynamicRange = true
    // resolutionScale = 1.0 when useBrowserRecommendedResolution: true is set —
    // the viewer option already applies devicePixelRatio; stacking > 1.0 doubles cost
    viewer.resolutionScale = 1.0
    // IMPORTANT: do NOT enable viewer.shadows with real-time day/night lighting —
    // the night side becomes pitch black. Use ambient occlusion for depth instead.
    viewer.shadows = false

    viewer.scene.fog.enabled = true
    viewer.scene.fog.density = 0.0002

    // ── Post-processing pipeline ──────────────────────────────────────────
    // Ambient Occlusion — subtle depth cues between buildings
    // (kept light so it doesn't hurt laptop GPUs)
    const ao = viewer.scene.postProcessStages.ambientOcclusion
    ao.enabled = true
    ao.uniforms.intensity = 0.5
    ao.uniforms.bias = 0.1
    ao.uniforms.lengthCap = 0.26
    ao.uniforms.stepSize = 1.95
    ao.uniforms.frustumLength = 1000.0

    // Bloom DISABLED — contrast ≥ 64 turns the sun into a massive red explosion;
    // with HDR + day/night lighting the effect is destructive not cinematic.
    viewer.scene.postProcessStages.bloom.enabled = false

    // FXAA — cheap edge smoothing, always runs last
    viewer.scene.postProcessStages.fxaa.enabled = true

    // Globe fallback settings (overridden when 3D tiles load)
    viewer.scene.globe.enableLighting = true

    // Add Google Photorealistic 3D Tileset
    createGooglePhotorealistic3DTileset()
      .then((tileset) => {
        // SSE 8: balanced sweet spot — full building geometry at city level
        tileset.maximumScreenSpaceError = 8
        // Skip coarse intermediate LOD levels for sharper tile transitions
        tileset.skipLevelOfDetail = true
        // Reduce detail for tiles far from camera centre — frees GPU budget
        tileset.dynamicScreenSpaceError = true
        viewer.scene.primitives.add(tileset)

        // ── Altitude-based globe visibility ─────────────────────────────
        // Google 3D tiles only cover city-level views (<200 km altitude).
        // At high altitude we need the regular Cesium globe so Earth is
        // visible from space. Below 200 km we hide the globe so the flat
        // terrain doesn't render on top of the 3D building geometry.
        const CITY_THRESHOLD = 200000 // 200 km in metres

        const syncGlobe = () => {
          const alt = viewer.camera.positionCartographic?.height ?? Infinity
          viewer.scene.globe.show = alt > CITY_THRESHOLD
        }

        // Set immediately, then track every camera move
        syncGlobe()
        viewer.camera.changed.addEventListener(syncGlobe)
        viewer.camera.moveEnd.addEventListener(syncGlobe)
      })
      .catch((err) => {
        console.warn('Google 3D Tiles not available, using default globe:', err.message)
      })

    // Pin clock to solar noon (lon=0) so tiles always render in daylight on first load
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

    // Track camera movement — only update URL on moveEnd (Bug #10 fix)
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

    // FPS counter — throttled to 2 updates/sec (Bug #9 fix)
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
  }, [setPosition, setFps, setViewerReady])

  // React to preset changes — skip initial mount (Bug #15 fix)
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
      // Advance clock to solar noon at the destination longitude so 3D tiles
      // always render in full daylight regardless of the user's local time
      const viewer = viewerRef.current
      if (viewer) {
        const noon = new Date()
        noon.setUTCHours(Math.round(12 - preset.longitude / 15), 0, 0, 0)
        viewer.clock.currentTime = JulianDate.fromDate(noon)
      }
    }
  }, [activePreset, flyTo, viewerRef])

  // Command-palette arbitrary fly-to (cities, custom coords)
  useEffect(() => {
    if (!pendingFlyTo) return
    const { lat, lon, alt, heading = 0, pitch = -35 } = pendingFlyTo
    flyTo(lat, lon, alt, heading, pitch)
    // Set solar noon for that longitude so tiles render in daylight
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
