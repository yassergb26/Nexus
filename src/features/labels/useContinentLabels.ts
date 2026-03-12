import { useEffect, useRef } from 'react'
import {
  CustomDataSource,
  Cartesian3,
  Color,
  ConstantProperty,
  NearFarScalar,
  VerticalOrigin,
  LabelStyle,
} from 'cesium'
import { useCesiumViewerContext } from '../../contexts/CesiumViewerContext'
import { useMapStore } from '../../store/useMapStore'

/** Continent label positions (geographic center) */
const CONTINENTS = [
  { name: 'Africa',        lat: 2,    lon: 20,   },
  { name: 'Europe',        lat: 52,   lon: 15,   },
  { name: 'Asia',          lat: 45,   lon: 85,   },
  { name: 'North America', lat: 45,   lon: -100, },
  { name: 'South America', lat: -15,  lon: -58,  },
  { name: 'Oceania',       lat: -25,  lon: 135,  },
  { name: 'Antarctica',    lat: -82,  lon: 0,    },
]

const LABEL_COLOR = Color.fromCssColorString('#a0a0a0')
const OUTLINE_COLOR = Color.fromCssColorString('#0a0a0a')

/**
 * Continent labels in English — only visible in 2D map mode.
 * Replaces the mixed-language labels from CartoDB dark_all tiles.
 */
export function useContinentLabels() {
  const { viewerRef, viewerReady } = useCesiumViewerContext()
  const mapMode = useMapStore((s) => s.mapMode)
  const dataSourceRef = useRef<CustomDataSource | null>(null)

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !viewerReady || viewer.isDestroyed()) return

    // Only show continent labels in 2D mode
    if (mapMode !== '2d') {
      if (dataSourceRef.current) {
        viewer.dataSources.remove(dataSourceRef.current, true)
        dataSourceRef.current = null
      }
      return
    }

    const ds = new CustomDataSource('continent-labels')

    for (const c of CONTINENTS) {
      ds.entities.add({
        id: `continent-${c.name}`,
        position: Cartesian3.fromDegrees(c.lon, c.lat, 0),
        label: {
          text: new ConstantProperty(c.name.toUpperCase()),
          font: new ConstantProperty('bold 13px Inter, system-ui, sans-serif'),
          fillColor: new ConstantProperty(LABEL_COLOR),
          outlineColor: new ConstantProperty(OUTLINE_COLOR),
          outlineWidth: new ConstantProperty(3),
          style: new ConstantProperty(LabelStyle.FILL_AND_OUTLINE),
          verticalOrigin: new ConstantProperty(VerticalOrigin.CENTER),
          scaleByDistance: new ConstantProperty(
            new NearFarScalar(3e6, 1.0, 2e7, 0.6)
          ),
          translucencyByDistance: new ConstantProperty(
            new NearFarScalar(1e6, 0.0, 5e6, 1.0)
          ),
          disableDepthTestDistance: new ConstantProperty(Number.POSITIVE_INFINITY),
        },
      })
    }

    viewer.dataSources.add(ds)
    dataSourceRef.current = ds

    return () => {
      if (viewer && !viewer.isDestroyed()) {
        viewer.dataSources.remove(ds, true)
      }
      dataSourceRef.current = null
    }
  }, [viewerRef, viewerReady, mapMode])
}
