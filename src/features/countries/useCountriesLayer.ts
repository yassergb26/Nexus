import { useEffect, useRef } from 'react'
import { GeoJsonDataSource, Color, ConstantProperty, ColorMaterialProperty } from 'cesium'
import { useCesiumViewerContext } from '../../contexts/CesiumViewerContext'
import { useMapStore } from '../../store/useMapStore'

/** Strategic significance coloring by country name */
const COUNTRY_COLORS: Record<string, string> = {
  'United States of America': '#60a5fa',
  'Canada': '#60a5fa',
  'United Kingdom': '#818cf8',
  'France': '#93c5fd',
  'Germany': '#3b82f6',
  'Italy': '#3b82f6',
  'Spain': '#3b82f6',
  'Poland': '#3b82f6',
  'Turkey': '#3b82f6',
  'Norway': '#3b82f6',
  'Netherlands': '#3b82f6',
  'Belgium': '#3b82f6',
  'Denmark': '#3b82f6',
  'Portugal': '#3b82f6',
  'Greece': '#3b82f6',
  'Romania': '#3b82f6',
  'Czech Republic': '#3b82f6',
  'Czechia': '#3b82f6',
  'Russia': '#f97316',
  'China': '#ef4444',
  'North Korea': '#ef4444',
  'Iran': '#f97316',
  'India': '#a855f7',
  'Japan': '#60a5fa',
  'South Korea': '#60a5fa',
  'Australia': '#60a5fa',
  'Israel': '#60a5fa',
  'Saudi Arabia': '#eab308',
  'Brazil': '#22c55e',
  'Ukraine': '#fbbf24',
}

const DEFAULT_STROKE = '#00d4aa'

export function useCountriesLayer() {
  const { viewerRef, viewerReady } = useCesiumViewerContext()
  const isEnabled = useMapStore((s) => s.layers.find((l) => l.id === 'countries')?.enabled ?? false)
  const setLayerCount = useMapStore((s) => s.setLayerCount)
  const dataSourceRef = useRef<GeoJsonDataSource | null>(null)

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !viewerReady || viewer.isDestroyed()) return

    if (!isEnabled) {
      if (dataSourceRef.current) {
        viewer.dataSources.remove(dataSourceRef.current, true)
        dataSourceRef.current = null
      }
      setLayerCount('countries', 0)
      return
    }

    GeoJsonDataSource.load('/data/countries.geojson', {
      stroke: Color.fromCssColorString(DEFAULT_STROKE),
      strokeWidth: 1.5,
      fill: Color.fromCssColorString('#00d4aa').withAlpha(0.04),
      clampToGround: true,
    }).then((ds) => {
      if (viewer.isDestroyed()) return

      const entities = ds.entities.values
      for (const entity of entities) {
        const name = entity.properties?.NAME?.getValue() ||
                     entity.properties?.ADMIN?.getValue() ||
                     entity.properties?.name?.getValue()

        // Apply per-country colors
        const countryColor = name ? COUNTRY_COLORS[name] : undefined
        if (countryColor && entity.polygon) {
          entity.polygon.outlineColor = new ConstantProperty(Color.fromCssColorString(countryColor))
          entity.polygon.material = new ColorMaterialProperty(Color.fromCssColorString(countryColor).withAlpha(0.06))
        }

        // Set entity name for tooltip
        // Entity IDs from GeoJSON are read-only, so we store country info in the name
        if (name) entity.name = `country-${name}`
      }

      viewer.dataSources.add(ds)
      dataSourceRef.current = ds
      setLayerCount('countries', entities.length)
    }).catch((err) => {
      console.warn('Countries GeoJSON failed to load:', err.message)
    })

    return () => {
      if (dataSourceRef.current && viewer && !viewer.isDestroyed()) {
        viewer.dataSources.remove(dataSourceRef.current, true)
        dataSourceRef.current = null
      }
    }
  }, [viewerRef, viewerReady, isEnabled, setLayerCount])
}
