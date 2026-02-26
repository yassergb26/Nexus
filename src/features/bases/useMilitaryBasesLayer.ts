import { useEffect, useRef } from 'react'
import { CustomDataSource, Cartesian3, Color, NearFarScalar, ConstantProperty } from 'cesium'
import { useCesiumViewerContext } from '../../contexts/CesiumViewerContext'
import { useMapStore } from '../../store/useMapStore'
import { MILITARY_BASES } from '../../data/military-bases'

const OP_COLOR: Record<string, string> = {
  USA:    '#ef4444',
  NATO:   '#3b82f6',
  Russia: '#f59e0b',
  China:  '#dc2626',
  UK:     '#6366f1',
  France: '#8b5cf6',
  other:  '#6b7280',
}

export function useMilitaryBasesLayer() {
  const { viewerRef, viewerReady } = useCesiumViewerContext()
  const isEnabled = useMapStore((s) => s.layers.find((l) => l.id === 'bases')?.enabled ?? false)
  const setLayerCount = useMapStore((s) => s.setLayerCount)
  const dataSourceRef = useRef<CustomDataSource | null>(null)

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !viewerReady || viewer.isDestroyed()) return
    const ds = new CustomDataSource('bases')
    viewer.dataSources.add(ds)
    dataSourceRef.current = ds
    return () => {
      if (viewer && !viewer.isDestroyed()) viewer.dataSources.remove(ds, true)
      dataSourceRef.current = null
    }
  }, [viewerRef, viewerReady])

  useEffect(() => {
    const ds = dataSourceRef.current
    if (!ds) return
    ds.entities.removeAll()
    if (!isEnabled) { setLayerCount('bases', 0); return }

    for (const base of MILITARY_BASES) {
      const color = Color.fromCssColorString(OP_COLOR[base.operator] ?? '#6b7280')
      const size = base.type === 'nuclear' ? 11 : base.type === 'space' ? 9 : 7
      ds.entities.add({
        id: 'base-' + base.id,
        name: base.name,
        position: Cartesian3.fromDegrees(base.lon, base.lat, 0),
        point: {
          pixelSize: size,
          color: color.withAlpha(0.9),
          outlineColor: color.withAlpha(0.4),
          outlineWidth: 2,
          scaleByDistance: new NearFarScalar(1e5, 1.8, 2e7, 0.5),
        },
        description: new ConstantProperty(
          '<b>' + base.name + '</b><br/>Country: ' + base.country +
          '<br/>Operator: ' + base.operator + '<br/>Type: ' + base.type
        ),
      })
    }
    setLayerCount('bases', MILITARY_BASES.length)
  }, [isEnabled, setLayerCount])
}
