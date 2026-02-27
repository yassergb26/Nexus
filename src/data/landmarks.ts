import type { Landmark } from '../types'

export const CITY_LIST = [
  'Austin',
  'San Francisco',
  'New York',
  'Tokyo',
  'London',
  'Paris',
  'Dubai',
  'Washington DC',
  'Moscow',
  'Sydney',
] as const

export type CityName = (typeof CITY_LIST)[number]

/** Center coordinates for each city (used for fly-to on city tab click) */
export const CITY_CENTERS: Record<CityName, { lat: number; lon: number }> = {
  'Austin':        { lat: 30.267,  lon: -97.743 },
  'San Francisco': { lat: 37.774,  lon: -122.419 },
  'New York':      { lat: 40.712,  lon: -74.006 },
  'Tokyo':         { lat: 35.689,  lon: 139.692 },
  'London':        { lat: 51.507,  lon: -0.128 },
  'Paris':         { lat: 48.856,  lon: 2.352 },
  'Dubai':         { lat: 25.197,  lon: 55.274 },
  'Washington DC': { lat: 38.895,  lon: -77.036 },
  'Moscow':        { lat: 55.755,  lon: 37.617 },
  'Sydney':        { lat: -33.868, lon: 151.209 },
}

export const LANDMARKS: Landmark[] = [
  // Austin
  { id: 'austin-capitol',       name: 'Texas State Capitol',    city: 'Austin',        lat: 30.2747, lon: -97.7404, icon: 'Q' },
  { id: 'austin-frost',         name: 'Frost Bank Tower',       city: 'Austin',        lat: 30.2655, lon: -97.7437, icon: 'E' },
  { id: 'austin-pennybacker',   name: 'Pennybacker Bridge',     city: 'Austin',        lat: 30.3452, lon: -97.7889, icon: 'F' },
  { id: 'austin-jenga',         name: 'The Jenga Tower',        city: 'Austin',        lat: 30.2643, lon: -97.7520, icon: 'K' },
  { id: 'austin-ut',            name: 'UT Tower',               city: 'Austin',        lat: 30.2862, lon: -97.7394, icon: 'T' },

  // San Francisco
  { id: 'sf-ggb',               name: 'Golden Gate Bridge',     city: 'San Francisco', lat: 37.8199, lon: -122.4783, icon: 'Q' },
  { id: 'sf-transamerica',      name: 'Transamerica Pyramid',   city: 'San Francisco', lat: 37.7952, lon: -122.4028, icon: 'K' },
  { id: 'sf-salesforce',        name: 'Salesforce Tower',       city: 'San Francisco', lat: 37.7897, lon: -122.3969, icon: 'E' },
  { id: 'sf-alcatraz',          name: 'Alcatraz Island',        city: 'San Francisco', lat: 37.8270, lon: -122.4230, icon: 'R' },
  { id: 'sf-coit',              name: 'Coit Tower',             city: 'San Francisco', lat: 37.8024, lon: -122.4058, icon: 'T' },

  // New York
  { id: 'ny-empire',            name: 'Empire State Building',  city: 'New York',      lat: 40.7484, lon: -73.9857, icon: 'E' },
  { id: 'ny-statue',            name: 'Statue of Liberty',      city: 'New York',      lat: 40.6892, lon: -74.0445, icon: 'Q' },
  { id: 'ny-central-park',      name: 'Central Park',           city: 'New York',      lat: 40.7829, lon: -73.9654, icon: 'F' },
  { id: 'ny-brooklyn-bridge',   name: 'Brooklyn Bridge',        city: 'New York',      lat: 40.7061, lon: -73.9969, icon: 'K' },
  { id: 'ny-wtc',               name: 'One World Trade Center', city: 'New York',      lat: 40.7127, lon: -74.0134, icon: 'T' },

  // Tokyo
  { id: 'tokyo-skytree',        name: 'Tokyo Skytree',          city: 'Tokyo',         lat: 35.7101, lon: 139.8107, icon: 'T' },
  { id: 'tokyo-tower',          name: 'Tokyo Tower',            city: 'Tokyo',         lat: 35.6586, lon: 139.7454, icon: 'E' },
  { id: 'tokyo-shibuya',        name: 'Shibuya Crossing',       city: 'Tokyo',         lat: 35.6595, lon: 139.7004, icon: 'K' },
  { id: 'tokyo-palace',         name: 'Imperial Palace',        city: 'Tokyo',         lat: 35.6852, lon: 139.7528, icon: 'Q' },
  { id: 'tokyo-sensoji',        name: 'Sensoji Temple',         city: 'Tokyo',         lat: 35.7148, lon: 139.7967, icon: 'F' },

  // London
  { id: 'london-bigben',        name: 'Big Ben',                city: 'London',        lat: 51.5007, lon: -0.1246,  icon: 'T' },
  { id: 'london-eye',           name: 'London Eye',             city: 'London',        lat: 51.5033, lon: -0.1196,  icon: 'E' },
  { id: 'london-tower',         name: 'Tower of London',        city: 'London',        lat: 51.5081, lon: -0.0759,  icon: 'Q' },
  { id: 'london-shard',         name: 'The Shard',              city: 'London',        lat: 51.5045, lon: -0.0865,  icon: 'K' },
  { id: 'london-buckingham',    name: 'Buckingham Palace',      city: 'London',        lat: 51.5014, lon: -0.1419,  icon: 'F' },

  // Paris
  { id: 'paris-eiffel',         name: 'Eiffel Tower',           city: 'Paris',         lat: 48.8584, lon: 2.2945,   icon: 'T' },
  { id: 'paris-louvre',          name: 'Louvre Museum',          city: 'Paris',         lat: 48.8606, lon: 2.3376,   icon: 'Q' },
  { id: 'paris-notredame',      name: 'Notre-Dame',             city: 'Paris',         lat: 48.8530, lon: 2.3499,   icon: 'E' },
  { id: 'paris-arc',            name: 'Arc de Triomphe',        city: 'Paris',         lat: 48.8738, lon: 2.2950,   icon: 'K' },
  { id: 'paris-sacrecoeur',     name: 'Sacre-Coeur',            city: 'Paris',         lat: 48.8867, lon: 2.3431,   icon: 'F' },

  // Dubai
  { id: 'dubai-burj',           name: 'Burj Khalifa',           city: 'Dubai',         lat: 25.1972, lon: 55.2744,  icon: 'T' },
  { id: 'dubai-palm',           name: 'Palm Jumeirah',          city: 'Dubai',         lat: 25.1124, lon: 55.1390,  icon: 'Q' },
  { id: 'dubai-marina',         name: 'Dubai Marina',           city: 'Dubai',         lat: 25.0805, lon: 55.1403,  icon: 'E' },
  { id: 'dubai-frame',          name: 'Dubai Frame',            city: 'Dubai',         lat: 25.2350, lon: 55.3004,  icon: 'K' },
  { id: 'dubai-mall',           name: 'Dubai Mall',             city: 'Dubai',         lat: 25.1985, lon: 55.2796,  icon: 'F' },

  // Washington DC
  { id: 'dc-capitol',           name: 'US Capitol',             city: 'Washington DC', lat: 38.8899, lon: -77.0091, icon: 'Q' },
  { id: 'dc-whitehouse',        name: 'White House',            city: 'Washington DC', lat: 38.8977, lon: -77.0365, icon: 'E' },
  { id: 'dc-monument',          name: 'Washington Monument',    city: 'Washington DC', lat: 38.8895, lon: -77.0353, icon: 'T' },
  { id: 'dc-lincoln',           name: 'Lincoln Memorial',       city: 'Washington DC', lat: 38.8893, lon: -77.0502, icon: 'K' },
  { id: 'dc-pentagon',          name: 'The Pentagon',           city: 'Washington DC', lat: 38.8711, lon: -77.0559, icon: 'F' },

  // Moscow
  { id: 'moscow-kremlin',       name: 'The Kremlin',            city: 'Moscow',        lat: 55.7520, lon: 37.6175,  icon: 'Q' },
  { id: 'moscow-redsquare',     name: 'Red Square',             city: 'Moscow',        lat: 55.7539, lon: 37.6208,  icon: 'E' },
  { id: 'moscow-stbasil',       name: "St Basil's Cathedral",   city: 'Moscow',        lat: 55.7525, lon: 37.6231,  icon: 'T' },
  { id: 'moscow-bolshoi',       name: 'Bolshoi Theatre',        city: 'Moscow',        lat: 55.7601, lon: 37.6186,  icon: 'K' },
  { id: 'moscow-citytower',     name: 'Moscow City Tower',      city: 'Moscow',        lat: 55.7497, lon: 37.5375,  icon: 'F' },

  // Sydney
  { id: 'sydney-opera',         name: 'Sydney Opera House',     city: 'Sydney',        lat: -33.8568, lon: 151.2153, icon: 'Q' },
  { id: 'sydney-harbour',       name: 'Harbour Bridge',         city: 'Sydney',        lat: -33.8523, lon: 151.2108, icon: 'E' },
  { id: 'sydney-bondi',         name: 'Bondi Beach',            city: 'Sydney',        lat: -33.8915, lon: 151.2767, icon: 'F' },
  { id: 'sydney-tower',         name: 'Sydney Tower Eye',       city: 'Sydney',        lat: -33.8705, lon: 151.2089, icon: 'T' },
  { id: 'sydney-darling',       name: 'Darling Harbour',        city: 'Sydney',        lat: -33.8724, lon: 151.1987, icon: 'K' },
]
