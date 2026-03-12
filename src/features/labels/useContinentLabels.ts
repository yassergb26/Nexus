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

/** Map GeoJSON abbreviated names → proper English for labels */
const ENGLISH_LABEL: Record<string, string> = {
  'Dem. Rep. Congo': 'DR Congo',
  'Central African Rep.': 'Central African Republic',
  'Eq. Guinea': 'Equatorial Guinea',
  'S. Sudan': 'South Sudan',
  'W. Sahara': 'Western Sahara',
  'Dominican Rep.': 'Dominican Republic',
  'Bosnia and Herz.': 'Bosnia & Herzegovina',
  'N. Cyprus': 'Northern Cyprus',
  'Falkland Is.': 'Falkland Islands',
  'Solomon Is.': 'Solomon Islands',
  'Fr. S. Antarctic Lands': 'French Antarctic',
  'Côte d\'Ivoire': 'Ivory Coast',
  'Timor-Leste': 'East Timor',
  'eSwatini': 'Eswatini',
  'Czechia': 'Czech Republic',
  'Cabo Verde': 'Cape Verde',
  'São Tomé and Principe': 'São Tomé & Príncipe',
  'Curaçao': 'Curacao',
  'Antigua and Barb.': 'Antigua & Barbuda',
  'St. Kitts and Nevis': 'St. Kitts & Nevis',
  'St. Vin. and Gren.': 'St. Vincent',
  'Marshall Is.': 'Marshall Islands',
  'Cook Is.': 'Cook Islands',
  'N. Mariana Is.': 'N. Mariana Islands',
  'Fr. Polynesia': 'French Polynesia',
  'Br. Indian Ocean Ter.': 'British Indian Ocean',
  'S. Geo. and the Is.': 'South Georgia',
  'Cayman Is.': 'Cayman Islands',
  'British Virgin Is.': 'British Virgin Islands',
  'Turks and Caicos Is.': 'Turks & Caicos',
  'U.S. Virgin Is.': 'US Virgin Islands',
  'Faeroe Is.': 'Faroe Islands',
  'Pitcairn Is.': 'Pitcairn Islands',
  'Wallis and Futuna Is.': 'Wallis & Futuna',
  'Ashmore and Cartier Is.': 'Ashmore & Cartier',
  'Heard I. and McDonald Is.': 'Heard & McDonald',
  'Indian Ocean Ter.': 'Indian Ocean Ter.',
  'St. Pierre and Miquelon': 'St. Pierre & Miquelon',
  'St-Barthélemy': 'St. Barthélemy',
  'St-Martin': 'St. Martin',
  'Åland': 'Aland Islands',
}

interface GeoFeature {
  properties: {
    NAME: string
    LABEL_X: number
    LABEL_Y: number
    LABELRANK: number
  }
}

const CONTINENT_COLOR = Color.WHITE
const COUNTRY_COLOR = Color.fromCssColorString('#e0e0e0')
const OUTLINE_COLOR = Color.fromCssColorString('#000000')

/**
 * Map labels in English — only visible in 2D mode.
 * Continents: visible when zoomed out.
 * Countries: visible when zoomed in, loaded from GeoJSON label positions.
 */
export function useContinentLabels() {
  const { viewerRef, viewerReady } = useCesiumViewerContext()
  const mapMode = useMapStore((s) => s.mapMode)
  const dataSourceRef = useRef<CustomDataSource | null>(null)

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !viewerReady || viewer.isDestroyed()) return

    // Only show labels in 2D mode
    if (mapMode !== '2d') {
      if (dataSourceRef.current) {
        viewer.dataSources.remove(dataSourceRef.current, true)
        dataSourceRef.current = null
      }
      return
    }

    const ds = new CustomDataSource('map-labels')

    // ── Continent labels (visible when zoomed out) ──
    for (const c of CONTINENTS) {
      ds.entities.add({
        id: `continent-${c.name}`,
        position: Cartesian3.fromDegrees(c.lon, c.lat, 0),
        label: {
          text: new ConstantProperty(c.name.toUpperCase()),
          font: new ConstantProperty('bold 18px Inter, system-ui, sans-serif'),
          fillColor: new ConstantProperty(CONTINENT_COLOR),
          outlineColor: new ConstantProperty(OUTLINE_COLOR),
          outlineWidth: new ConstantProperty(3),
          style: new ConstantProperty(LabelStyle.FILL_AND_OUTLINE),
          verticalOrigin: new ConstantProperty(VerticalOrigin.CENTER),
          // Show when far, hide when close
          scaleByDistance: new ConstantProperty(
            new NearFarScalar(5e6, 0.9, 3e7, 0.5)
          ),
          translucencyByDistance: new ConstantProperty(
            new NearFarScalar(2e6, 0.0, 8e6, 1.0)
          ),
          disableDepthTestDistance: new ConstantProperty(Number.POSITIVE_INFINITY),
        },
      })
    }

    // ── Country labels (visible when zoomed in) ──
    fetch('/data/countries-50m.geojson')
      .then((r) => r.json())
      .then((geojson: { features: GeoFeature[] }) => {
        if (viewer.isDestroyed()) return

        for (const f of geojson.features) {
          const { NAME, LABEL_X, LABEL_Y, LABELRANK } = f.properties
          if (!NAME || LABEL_X == null || LABEL_Y == null) continue

          // Skip Antarctica (already a continent label)
          if (NAME === 'Antarctica') continue

          const displayName = ENGLISH_LABEL[NAME] || NAME

          // Larger countries (lower LABELRANK) are visible from further away
          const farDist = LABELRANK <= 2 ? 1.2e7 : LABELRANK <= 4 ? 8e6 : 5e6
          const nearDist = LABELRANK <= 2 ? 8e5 : LABELRANK <= 4 ? 5e5 : 3e5
          const fontSize = LABELRANK <= 2 ? 15 : LABELRANK <= 4 ? 13 : 11

          ds.entities.add({
            id: `country-label-${NAME}`,
            position: Cartesian3.fromDegrees(LABEL_X, LABEL_Y, 0),
            label: {
              text: new ConstantProperty(displayName),
              font: new ConstantProperty(`${fontSize}px Inter, system-ui, sans-serif`),
              fillColor: new ConstantProperty(COUNTRY_COLOR),
              outlineColor: new ConstantProperty(OUTLINE_COLOR),
              outlineWidth: new ConstantProperty(2),
              style: new ConstantProperty(LabelStyle.FILL_AND_OUTLINE),
              verticalOrigin: new ConstantProperty(VerticalOrigin.CENTER),
              // Show when close, hide when far
              scaleByDistance: new ConstantProperty(
                new NearFarScalar(nearDist, 1.0, farDist, 0.4)
              ),
              translucencyByDistance: new ConstantProperty(
                new NearFarScalar(nearDist, 1.0, farDist, 0.0)
              ),
              disableDepthTestDistance: new ConstantProperty(Number.POSITIVE_INFINITY),
            },
          })
        }
      })
      .catch(() => {
        // GeoJSON load failed — continent labels still work
      })

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
