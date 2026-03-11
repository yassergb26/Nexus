import { useEffect, useRef } from 'react'
import {
  CustomDataSource,
  Cartesian3,
  Color,
  PolylineDashMaterialProperty,
} from 'cesium'
import { useCesiumViewerContext } from '../../contexts/CesiumViewerContext'
import { useMapStore } from '../../store/useMapStore'
import { CCTV_CAMERAS } from '../../data/cctv-cameras'
import { WEBCAM_FEEDS } from '../../data/webcam-feeds'

interface CameraPoint {
  lat: number
  lon: number
}

/**
 * Draw dotted mesh lines between all camera locations on the globe.
 * Creates a network visualization connecting nearby cameras.
 */
export function useCctvMeshLines() {
  const { viewerRef, viewerReady } = useCesiumViewerContext()
  const meshVisible = useMapStore((s) => s.cctvMeshVisible)
  const cctvEnabled = useMapStore((s) => s.layers.find((l) => l.id === 'cctv')?.enabled ?? false)
  const dataSourceRef = useRef<CustomDataSource | null>(null)

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !viewerReady || viewer.isDestroyed()) return
    const ds = new CustomDataSource('cctv-mesh')
    viewer.dataSources.add(ds)
    dataSourceRef.current = ds
    return () => {
      if (viewer && !viewer.isDestroyed()) {
        viewer.dataSources.remove(ds, true)
      }
      dataSourceRef.current = null
    }
  }, [viewerRef, viewerReady])

  useEffect(() => {
    const ds = dataSourceRef.current
    if (!ds) return

    ds.entities.removeAll()

    if (!meshVisible || !cctvEnabled) return

    // Collect all camera positions
    const points: CameraPoint[] = [
      ...CCTV_CAMERAS.map((c) => ({ lat: c.latitude, lon: c.longitude })),
      ...WEBCAM_FEEDS.map((c) => ({ lat: c.latitude, lon: c.longitude })),
    ]

    // Connect each camera to its nearest neighbors (max distance threshold)
    const maxDistDeg = 30 // max ~30 degrees apart (~3300km)
    const connections = new Set<string>()

    for (let i = 0; i < points.length; i++) {
      // Sort other points by distance and connect to nearest 3
      const distances = points
        .map((p, j) => ({
          idx: j,
          dist: Math.sqrt(
            (p.lat - points[i].lat) ** 2 + (p.lon - points[i].lon) ** 2,
          ),
        }))
        .filter((d) => d.idx !== i && d.dist < maxDistDeg)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 3)

      for (const d of distances) {
        const key = [Math.min(i, d.idx), Math.max(i, d.idx)].join('-')
        if (connections.has(key)) continue
        connections.add(key)

        const a = points[i]
        const b = points[d.idx]

        ds.entities.add({
          polyline: {
            positions: Cartesian3.fromDegreesArray([a.lon, a.lat, b.lon, b.lat]),
            width: 1,
            material: new PolylineDashMaterialProperty({
              color: Color.fromCssColorString('#00d4aa').withAlpha(0.25),
              dashLength: 16,
              dashPattern: 255,
            }),
            clampToGround: true,
          },
        })
      }
    }
  }, [meshVisible, cctvEnabled])
}
