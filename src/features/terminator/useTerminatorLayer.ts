import { useEffect, useRef } from 'react'
import {
  CustomDataSource,
  Cartesian3,
  Color,
  ConstantProperty,
  ColorMaterialProperty,
  Rectangle as CesiumRectangle,
  DirectionalLight,
  JulianDate,
  CustomShader,
  UniformType,
  Cesium3DTileset,
} from 'cesium'
import { useCesiumViewerContext } from '../../contexts/CesiumViewerContext'
import { useMapStore } from '../../store/useMapStore'

/** Normalize longitude to [-180, 180] */
function normalizeLon(lon: number): number {
  while (lon > 180) lon -= 360
  while (lon < -180) lon += 360
  return lon
}

/** Compute the sub-solar point from real UTC time */
function getSunPosition(date: Date): { lat: number; lon: number } {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  )
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
  const declination = -23.44 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10))
  const lon = normalizeLon(-(hours - 12) * 15)
  return { lat: declination, lon }
}

/** Generate terminator great circle points */
function getTerminatorPoints(sunLat: number, sunLon: number, segments = 72): { lat: number; lon: number }[] {
  const sunLatRad = (sunLat * Math.PI) / 180
  const sunLonRad = (sunLon * Math.PI) / 180
  const points: { lat: number; lon: number }[] = []

  for (let i = 0; i <= segments; i++) {
    const angle = (2 * Math.PI * i) / segments
    const lat = Math.asin(
      Math.sin(sunLatRad) * Math.cos(Math.PI / 2) +
      Math.cos(sunLatRad) * Math.sin(Math.PI / 2) * Math.cos(angle)
    )
    const lon = sunLonRad + Math.atan2(
      Math.sin(angle) * Math.sin(Math.PI / 2) * Math.cos(sunLatRad),
      Math.cos(Math.PI / 2) - Math.sin(sunLatRad) * Math.sin(lat)
    )
    points.push({
      lat: (lat * 180) / Math.PI,
      lon: normalizeLon((lon * 180) / Math.PI),
    })
  }
  return points
}

// Original fixed light used when Day/Night is OFF
const FIXED_LIGHT_DIR = new Cartesian3(0.35, -0.9, -0.28)
const FIXED_LIGHT_INTENSITY = 1.8

/** Find the Google Photorealistic 3D Tileset from the viewer primitives */
function findTileset(viewer: InstanceType<typeof import('cesium').Viewer>): Cesium3DTileset | null {
  const primitives = viewer.scene.primitives
  for (let i = 0; i < primitives.length; i++) {
    const p = primitives.get(i)
    if (p instanceof Cesium3DTileset) return p
  }
  return null
}

/** Compute sun direction as ECEF unit vector */
function getSunDirectionECEF(sun: { lat: number; lon: number }): Cartesian3 {
  const latRad = (sun.lat * Math.PI) / 180
  const lonRad = (sun.lon * Math.PI) / 180
  return new Cartesian3(
    Math.cos(latRad) * Math.cos(lonRad),
    Math.cos(latRad) * Math.sin(lonRad),
    Math.sin(latRad)
  )
}

/** Create a CustomShader that darkens tiles on the night side */
function createNightShader(sunDirection: Cartesian3): CustomShader {
  return new CustomShader({
    uniforms: {
      u_sunDirection: {
        type: UniformType.VEC3,
        value: sunDirection,
      },
    },
    fragmentShaderText: `
      void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
        // Fragment position in world coordinates (ECEF)
        vec3 posWC = fsInput.attributes.positionWC;
        vec3 normalizedPos = normalize(posWC);
        vec3 sunDir = normalize(u_sunDirection);
        // Dot product: > 0 = facing sun (day), < 0 = away from sun (night)
        float sunDot = dot(normalizedPos, sunDir);
        // Smooth transition over ~5 degrees at the terminator
        float nightFactor = smoothstep(-0.05, 0.05, -sunDot);
        // Darken night side to ~12% brightness
        material.diffuse *= mix(1.0, 0.12, nightFactor);
      }
    `,
  })
}

export function useTerminatorLayer() {
  const { viewerRef, viewerReady } = useCesiumViewerContext()
  const isEnabled = useMapStore((s) => s.layers.find((l) => l.id === 'terminator')?.enabled ?? false)
  const mapMode = useMapStore((s) => s.mapMode)
  const dataSourceRef = useRef<CustomDataSource | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const shaderRef = useRef<CustomShader | null>(null)

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !viewerReady || viewer.isDestroyed()) return

    const ds = new CustomDataSource('terminator')
    viewer.dataSources.add(ds)
    dataSourceRef.current = ds

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (viewer && !viewer.isDestroyed()) viewer.dataSources.remove(ds, true)
      dataSourceRef.current = null
    }
  }, [viewerRef, viewerReady])

  useEffect(() => {
    const viewer = viewerRef.current
    const ds = dataSourceRef.current
    if (!ds || !viewer || viewer.isDestroyed()) return

    ds.entities.removeAll()
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Helper: remove custom shader from 3D tileset
    const clearNightShader = () => {
      if (!viewer || viewer.isDestroyed()) return
      const tileset = findTileset(viewer)
      if (tileset) tileset.customShader = undefined as unknown as CustomShader
      shaderRef.current = null
    }

    // Helper: restore fixed daylit lighting
    const restoreFixedLighting = () => {
      if (!viewer || viewer.isDestroyed()) return
      viewer.scene.light = new DirectionalLight({
        direction: FIXED_LIGHT_DIR,
        intensity: FIXED_LIGHT_INTENSITY,
      })
      viewer.scene.globe.enableLighting = false
      const noon = new Date()
      noon.setUTCHours(12, 0, 0, 0)
      viewer.clock.currentTime = JulianDate.fromDate(noon)
      viewer.clock.shouldAnimate = false
    }

    if (!isEnabled) {
      clearNightShader()
      restoreFixedLighting()
      return
    }

    // ── Enable Day/Night ──────────────────────────────────────────────────
    const is2D = mapMode === '2d'

    // Enable globe lighting for 2D mode
    viewer.scene.globe.enableLighting = true

    const updateTerminator = () => {
      ds.entities.removeAll()
      const now = new Date()
      const sun = getSunPosition(now)
      const terminatorPts = getTerminatorPoints(sun.lat, sun.lon)

      // ── 3D mode: apply CustomShader to darken night side of 3D tiles ──
      if (!is2D) {
        const sunDir = getSunDirectionECEF(sun)
        const tileset = findTileset(viewer)
        if (tileset) {
          if (!shaderRef.current) {
            // First time — create the shader
            shaderRef.current = createNightShader(sunDir)
            tileset.customShader = shaderRef.current
          } else {
            // Update existing shader uniform
            shaderRef.current.setUniform('u_sunDirection', sunDir)
          }
        }
      }

      // ── 2D mode: Rectangle shadow overlay ──
      if (is2D) {
        clearNightShader()
        const nightWest = normalizeLon(sun.lon + 90)
        const nightEast = normalizeLon(sun.lon - 90)
        ds.entities.add({
          id: 'night-shadow',
          name: 'Night Hemisphere',
          rectangle: {
            coordinates: new ConstantProperty(
              CesiumRectangle.fromDegrees(nightWest, -90, nightEast, 90)
            ),
            material: new ColorMaterialProperty(Color.BLACK.withAlpha(0.35)),
            height: new ConstantProperty(0),
          },
        })
      }

      // ── Terminator line (both modes) ──
      const linePositions = terminatorPts.map((p) =>
        Cartesian3.fromDegrees(p.lon, p.lat, 0)
      )

      const clampTo3D = !is2D

      ds.entities.add({
        id: 'terminator-line',
        name: 'Day/Night Terminator',
        polyline: {
          positions: new ConstantProperty(linePositions),
          width: new ConstantProperty(2.5),
          material: Color.fromCssColorString('#f59e0b').withAlpha(0.8),
          ...(clampTo3D ? { clampToGround: new ConstantProperty(true) } : {}),
        },
      })
      ds.entities.add({
        id: 'terminator-glow',
        name: 'Terminator Glow',
        polyline: {
          positions: new ConstantProperty(linePositions),
          width: new ConstantProperty(10),
          material: Color.fromCssColorString('#f59e0b').withAlpha(0.15),
          ...(clampTo3D ? { clampToGround: new ConstantProperty(true) } : {}),
        },
      })
    }

    updateTerminator()
    intervalRef.current = setInterval(updateTerminator, 60000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      clearNightShader()
      restoreFixedLighting()
    }
  }, [isEnabled, mapMode, viewerRef])
}
