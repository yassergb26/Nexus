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
  'Samoa': '#06b6d4',
  'Tonga': '#06b6d4',
  'Kiribati': '#06b6d4',
  'Micronesia': '#06b6d4',
  'Marshall Is.': '#06b6d4',
  'Palau': '#06b6d4',
  'Nauru': '#06b6d4',
  'Tuvalu': '#06b6d4',
  'Niue': '#06b6d4',
  'Cook Is.': '#06b6d4',
  'American Samoa': WESTERN,
  'Guam': WESTERN,
  'N. Mariana Is.': WESTERN,
  'Norfolk Island': WESTERN,
  'Pitcairn Is.': UK_COLOR,
  'Wallis and Futuna Is.': FR_COLOR,
  'Fr. Polynesia': FR_COLOR,
  'Ashmore and Cartier Is.': WESTERN,

  // ── Territories ──
  'Falkland Is.': UK_COLOR,
  'N. Cyprus': NATO_BLUE,
  'Fr. S. Antarctic Lands': FR_COLOR,
  'Antarctica': '#78716c',
  'Br. Indian Ocean Ter.': UK_COLOR,
  'Indian Ocean Ter.': WESTERN,
  'Heard I. and McDonald Is.': WESTERN,
  'S. Geo. and the Is.': UK_COLOR,
  'Saint Helena': UK_COLOR,
  'Bermuda': UK_COLOR,
  'Cayman Is.': UK_COLOR,
  'British Virgin Is.': UK_COLOR,
  'Turks and Caicos Is.': UK_COLOR,
  'Montserrat': UK_COLOR,
  'Anguilla': UK_COLOR,
  'U.S. Virgin Is.': WESTERN,
  'Faeroe Is.': NATO_BLUE,
  'St. Pierre and Miquelon': FR_COLOR,
  'St-Barthélemy': FR_COLOR,
  'St-Martin': FR_COLOR,
  'Siachen Glacier': INDIA,

  // ── Caribbean ──
  'Barbados': BRAZIL,
  'Dominica': BRAZIL,
  'Grenada': BRAZIL,
  'Saint Lucia': BRAZIL,
  'St. Kitts and Nevis': BRAZIL,
  'St. Vin. and Gren.': BRAZIL,
  'Antigua and Barb.': BRAZIL,
  'Aruba': BRAZIL,
  'Curaçao': BRAZIL,
  'Sint Maarten': BRAZIL,

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

  // ── Africa (island nations) ──
  'Cabo Verde': '#14b8a6',
  'Comoros': '#14b8a6',
  'Mauritius': '#14b8a6',
  'Seychelles': '#14b8a6',
  'São Tomé and Principe': '#14b8a6',

  // ── Europe (micro-states) ──
  'Andorra': NATO_BLUE,
  'Liechtenstein': NATO_BLUE,
  'Malta': NATO_BLUE,
  'Monaco': FR_COLOR,
  'San Marino': NATO_BLUE,
  'Vatican': NATO_BLUE,
  'Guernsey': UK_COLOR,
  'Jersey': UK_COLOR,
  'Isle of Man': UK_COLOR,
  'Åland': NATO_BLUE,

  // ── Asia (additional) ──
  'Hong Kong': CHINA_RED,
  'Macao': CHINA_RED,
  'Maldives': '#78716c',
}

/** Map abbreviated / non-English GeoJSON names → proper English names */
const ENGLISH_NAMES: Record<string, string> = {
  'Dem. Rep. Congo': 'Democratic Republic of the Congo',
  'Central African Rep.': 'Central African Republic',
  'Eq. Guinea': 'Equatorial Guinea',
  'S. Sudan': 'South Sudan',
  'W. Sahara': 'Western Sahara',
  'Dominican Rep.': 'Dominican Republic',
  'Bosnia and Herz.': 'Bosnia and Herzegovina',
  'N. Cyprus': 'Northern Cyprus',
  'Falkland Is.': 'Falkland Islands',
  'Solomon Is.': 'Solomon Islands',
  'Fr. S. Antarctic Lands': 'French Southern Antarctic Lands',
  'Côte d\'Ivoire': 'Ivory Coast',
  'Timor-Leste': 'East Timor',
  'eSwatini': 'Eswatini',
  'Czechia': 'Czech Republic',
  'Cabo Verde': 'Cape Verde',
  'São Tomé and Principe': 'Sao Tome and Principe',
  'Curaçao': 'Curacao',
  'St-Barthélemy': 'Saint Barthelemy',
  'St-Martin': 'Saint Martin',
  'Antigua and Barb.': 'Antigua and Barbuda',
  'St. Kitts and Nevis': 'Saint Kitts and Nevis',
  'St. Vin. and Gren.': 'Saint Vincent and the Grenadines',
  'Marshall Is.': 'Marshall Islands',
  'Cook Is.': 'Cook Islands',
  'N. Mariana Is.': 'Northern Mariana Islands',
  'Wallis and Futuna Is.': 'Wallis and Futuna',
  'Fr. Polynesia': 'French Polynesia',
  'Ashmore and Cartier Is.': 'Ashmore and Cartier Islands',
  'Br. Indian Ocean Ter.': 'British Indian Ocean Territory',
  'Indian Ocean Ter.': 'Australian Indian Ocean Territories',
  'Heard I. and McDonald Is.': 'Heard Island and McDonald Islands',
  'S. Geo. and the Is.': 'South Georgia and the South Sandwich Islands',
  'Cayman Is.': 'Cayman Islands',
  'British Virgin Is.': 'British Virgin Islands',
  'Turks and Caicos Is.': 'Turks and Caicos Islands',
  'U.S. Virgin Is.': 'US Virgin Islands',
  'Faeroe Is.': 'Faroe Islands',
  'St. Pierre and Miquelon': 'Saint Pierre and Miquelon',
  'Pitcairn Is.': 'Pitcairn Islands',
  'Åland': 'Aland Islands',
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

    GeoJsonDataSource.load('/data/countries-50m.geojson', {
      stroke: Color.fromCssColorString(DEFAULT_COLOR),
      strokeWidth: 1.5,
      fill: Color.fromCssColorString(DEFAULT_COLOR).withAlpha(0.06),
      clampToGround: true,
    }).then((ds) => {
      if (viewer.isDestroyed()) return

      const entities = ds.entities.values
      for (const entity of entities) {
        const rawName = entity.properties?.NAME?.getValue() ||
                        entity.properties?.ADMIN?.getValue() ||
                        entity.properties?.name?.getValue()

        // Apply per-country colors — every country gets colored
        const countryColor = rawName ? COUNTRY_COLORS[rawName] : undefined
        const color = countryColor || DEFAULT_COLOR

        if (entity.polygon) {
          entity.polygon.outlineColor = new ConstantProperty(Color.fromCssColorString(color))
          entity.polygon.material = new ColorMaterialProperty(Color.fromCssColorString(color).withAlpha(0.08))
        }

        // Set entity name for tooltip — use proper English name
        const displayName = rawName ? (ENGLISH_NAMES[rawName] || rawName) : undefined
        if (displayName) entity.name = `country-${displayName}`
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
