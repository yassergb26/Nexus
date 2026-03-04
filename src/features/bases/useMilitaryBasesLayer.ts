import { useEffect, useRef, useMemo } from 'react'
import { CustomDataSource, Cartesian3, NearFarScalar, ConstantProperty } from 'cesium'
import { useCesiumViewerContext } from '../../contexts/CesiumViewerContext'
import { useMapStore } from '../../store/useMapStore'
import { MILITARY_BASES } from '../../data/military-bases'
import { shieldIcon } from '../../utils/iconBuilder'

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

  const iconCache = useMemo(() => {
    const cache: Record<string, string> = {}
    for (const [op, color] of Object.entries(OP_COLOR)) {
      cache[op] = shieldIcon(color)
    }
    return cache
  }, [])

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
      const icon = iconCache[base.operator] ?? iconCache['other']
      const size = base.type === 'nuclear' ? 28 : base.type === 'space' ? 24 : 20
      ds.entities.add({
        id: 'base-' + base.id,
        name: base.name,
        position: Cartesian3.fromDegrees(base.lon, base.lat, 0),
        billboard: {
          image: icon,
          width: size,
          height: size,
          scaleByDistance: new NearFarScalar(1e5, 1.5, 2e7, 0.4),
        },
        description: new ConstantProperty(
          '<b>' + base.name + '</b><br/>Country: ' + base.country +
          '<br/>Operator: ' + base.operator + '<br/>Type: ' + base.type
        ),
      })
    }
    setLayerCount('bases', MILITARY_BASES.length)
  }, [isEnabled, setLayerCount, iconCache])
}
