import { useEffect, useRef } from 'react'
import { GeoJsonDataSource, Color, ConstantProperty, ColorMaterialProperty } from 'cesium'
import { useCesiumViewerContext } from '../../contexts/CesiumViewerContext'
import { useMapStore } from '../../store/useMapStore'

// ── Color palette ─────────────────────────────────────────────────────────
const WESTERN   = '#60a5fa'   // USA & core Western allies
const NATO_BLUE = '#3b82f6'   // NATO European members
const UK_COLOR  = '#818cf8'   // UK
const FR_COLOR  = '#93c5fd'   // France
const RUSSIA    = '#f97316'   // Russia & aligned states
const CHINA_RED = '#ef4444'   // China & DPRK
const MENA_GOLD = '#eab308'   // Middle East & North Africa
const INDIA     = '#a855f7'   // India
const BRAZIL    = '#22c55e'   // Brazil & Latin America
const UKRAINE   = '#fbbf24'   // Ukraine

/** Strategic significance coloring by country name (matches Natural Earth NAME field) */
const COUNTRY_COLORS: Record<string, string> = {
  // ── Western / Five Eyes ──
  'United States of America': WESTERN,
  'Canada': WESTERN,
  'Australia': WESTERN,
  'New Zealand': WESTERN,
  'Japan': WESTERN,
  'South Korea': WESTERN,
  'Taiwan': WESTERN,
  'Israel': WESTERN,

  // ── UK ──
  'United Kingdom': UK_COLOR,

  // ── France ──
  'France': FR_COLOR,

  // ── NATO Europe ──
  'Germany': NATO_BLUE,
  'Italy': NATO_BLUE,
  'Spain': NATO_BLUE,
  'Poland': NATO_BLUE,
  'Turkey': NATO_BLUE,
  'Norway': NATO_BLUE,
  'Netherlands': NATO_BLUE,
  'Belgium': NATO_BLUE,
  'Denmark': NATO_BLUE,
  'Portugal': NATO_BLUE,
  'Greece': NATO_BLUE,
  'Romania': NATO_BLUE,
  'Czechia': NATO_BLUE,
  'Hungary': NATO_BLUE,
  'Bulgaria': NATO_BLUE,
  'Croatia': NATO_BLUE,
  'Slovakia': NATO_BLUE,
  'Slovenia': NATO_BLUE,
  'Estonia': NATO_BLUE,
  'Latvia': NATO_BLUE,
  'Lithuania': NATO_BLUE,
  'Luxembourg': NATO_BLUE,
  'Iceland': NATO_BLUE,
  'Montenegro': NATO_BLUE,
  'North Macedonia': NATO_BLUE,
  'Albania': NATO_BLUE,
  'Finland': NATO_BLUE,
  'Sweden': NATO_BLUE,

  // ── EU non-NATO ──
  'Ireland': NATO_BLUE,
  'Austria': NATO_BLUE,
  'Switzerland': NATO_BLUE,
  'Cyprus': NATO_BLUE,

  // ── Russia & aligned ──
  'Russia': RUSSIA,
  'Belarus': RUSSIA,
  'Syria': RUSSIA,
  'Venezuela': RUSSIA,
  'Cuba': RUSSIA,
  'North Korea': CHINA_RED,

  // ── China ──
  'China': CHINA_RED,
  'Myanmar': CHINA_RED,
  'Laos': CHINA_RED,
  'Cambodia': CHINA_RED,

  // ── India ──
  'India': INDIA,

  // ── Ukraine ──
  'Ukraine': UKRAINE,

  // ── MENA — Middle East & North Africa ──
  'Saudi Arabia': MENA_GOLD,
  'United Arab Emirates': MENA_GOLD,
  'Qatar': MENA_GOLD,
  'Kuwait': MENA_GOLD,
  'Bahrain': MENA_GOLD,
  'Oman': MENA_GOLD,
  'Yemen': MENA_GOLD,
  'Iraq': MENA_GOLD,
  'Jordan': MENA_GOLD,
  'Lebanon': MENA_GOLD,
  'Palestine': MENA_GOLD,
  'Egypt': MENA_GOLD,
  'Libya': MENA_GOLD,
  'Tunisia': MENA_GOLD,
  'Algeria': MENA_GOLD,
  'Morocco': MENA_GOLD,
  'W. Sahara': MENA_GOLD,
  'Sudan': MENA_GOLD,
  'Iran': MENA_GOLD,
  'Djibouti': MENA_GOLD,
  'Somalia': MENA_GOLD,
  'Somaliland': MENA_GOLD,
  'Mauritania': MENA_GOLD,

  // ── Latin America ──
  'Brazil': BRAZIL,
  'Mexico': BRAZIL,
  'Argentina': BRAZIL,
  'Colombia': BRAZIL,
  'Chile': BRAZIL,
  'Peru': BRAZIL,

  // ── Africa (sub-Saharan) ──
  'South Africa': '#14b8a6',
  'Nigeria': '#14b8a6',
  'Kenya': '#14b8a6',
  'Ethiopia': '#14b8a6',
  'Ghana': '#14b8a6',
  'Tanzania': '#14b8a6',
  'Dem. Rep. Congo': '#14b8a6',
  'Congo': '#14b8a6',
  'Angola': '#14b8a6',
  'Mozambique': '#14b8a6',
  'Cameroon': '#14b8a6',
  'Côte d\'Ivoire': '#14b8a6',
  'Madagascar': '#14b8a6',
  'Niger': '#14b8a6',
  'Mali': '#14b8a6',
  'Burkina Faso': '#14b8a6',
  'Senegal': '#14b8a6',
  'Chad': '#14b8a6',
  'Guinea': '#14b8a6',
  'Benin': '#14b8a6',
  'Rwanda': '#14b8a6',
  'Burundi': '#14b8a6',
  'S. Sudan': '#14b8a6',
  'Eritrea': '#14b8a6',
  'Sierra Leone': '#14b8a6',
  'Togo': '#14b8a6',
  'Central African Rep.': '#14b8a6',
  'Liberia': '#14b8a6',
  'Namibia': '#14b8a6',
  'Botswana': '#14b8a6',
  'Lesotho': '#14b8a6',
  'Gambia': '#14b8a6',
  'Guinea-Bissau': '#14b8a6',
  'Eq. Guinea': '#14b8a6',
  'Gabon': '#14b8a6',
  'eSwatini': '#14b8a6',
  'Malawi': '#14b8a6',
  'Zambia': '#14b8a6',
  'Zimbabwe': '#14b8a6',
  'Uganda': '#14b8a6',

  // ── Southeast Asia ──
  'Indonesia': '#06b6d4',
  'Philippines': '#06b6d4',
  'Vietnam': '#06b6d4',
  'Thailand': '#06b6d4',
  'Malaysia': '#06b6d4',
  'Singapore': '#06b6d4',
  'Brunei': '#06b6d4',
  'Timor-Leste': '#06b6d4',

  // ── Central Asia ──
  'Kazakhstan': '#78716c',
  'Uzbekistan': '#78716c',
  'Turkmenistan': '#78716c',
  'Tajikistan': '#78716c',
  'Kyrgyzstan': '#78716c',
  'Mongolia': '#78716c',
  'Afghanistan': '#78716c',
  'Pakistan': '#78716c',

  // ── Other ──
  'Greenland': NATO_BLUE,
  'Georgia': '#78716c',
  'Armenia': '#78716c',
  'Azerbaijan': '#78716c',
  'Nepal': '#78716c',
  'Bangladesh': '#78716c',
  'Sri Lanka': '#78716c',
  'Bhutan': '#78716c',

  // ── Balkans / Eastern Europe ──
  'Serbia': '#78716c',
  'Bosnia and Herz.': '#78716c',
  'Kosovo': NATO_BLUE,
  'Moldova': '#78716c',

  // ── Pacific Islands ──
  'Fiji': '#06b6d4',
  'Papua New Guinea': '#06b6d4',
  'Solomon Is.': '#06b6d4',
  'Vanuatu': '#06b6d4',
  'New Caledonia': FR_COLOR,

  // ── Territories ──
  'Falkland Is.': UK_COLOR,
  'N. Cyprus': NATO_BLUE,

  // ── Other Americas ──
  'Ecuador': BRAZIL,
  'Bolivia': BRAZIL,
  'Paraguay': BRAZIL,
  'Uruguay': BRAZIL,
  'Guyana': BRAZIL,
  'Suriname': BRAZIL,
  'Panama': BRAZIL,
  'Costa Rica': BRAZIL,
  'Honduras': BRAZIL,
  'Guatemala': BRAZIL,
  'Nicaragua': BRAZIL,
  'El Salvador': BRAZIL,
  'Belize': BRAZIL,
  'Haiti': BRAZIL,
  'Dominican Rep.': BRAZIL,
  'Jamaica': BRAZIL,
  'Trinidad and Tobago': BRAZIL,
  'Bahamas': BRAZIL,
  'Puerto Rico': WESTERN,
}

const DEFAULT_COLOR = '#00d4aa'

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
      stroke: Color.fromCssColorString(DEFAULT_COLOR),
      strokeWidth: 1.5,
      fill: Color.fromCssColorString(DEFAULT_COLOR).withAlpha(0.06),
      clampToGround: true,
    }).then((ds) => {
      if (viewer.isDestroyed()) return

      const entities = ds.entities.values
      for (const entity of entities) {
        const name = entity.properties?.NAME?.getValue() ||
                     entity.properties?.ADMIN?.getValue() ||
                     entity.properties?.name?.getValue()

        // Apply per-country colors — every country gets colored
        const countryColor = name ? COUNTRY_COLORS[name] : undefined
        const color = countryColor || DEFAULT_COLOR

        if (entity.polygon) {
          entity.polygon.outlineColor = new ConstantProperty(Color.fromCssColorString(color))
          entity.polygon.material = new ColorMaterialProperty(Color.fromCssColorString(color).withAlpha(0.08))
        }

        // Set entity name for tooltip
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
