import type { RegionalPreset } from '../types'

export const REGIONAL_PRESETS: RegionalPreset[] = [
  {
    // Whole-earth overview — pitch -90 is correct at this altitude
    id: 'global',
    name: 'Global',
    latitude: 20.0,
    longitude: 0.0,
    altitude: 20000000,
    heading: 0,
    pitch: -90,
  },
  {
    // Camera 1.2 km NW of Empire State Building, looking SE toward Manhattan
    // Empire State: 40.7484, -73.9967
    id: 'americas',
    name: 'Americas',
    latitude: 40.757,
    longitude: -74.007,
    altitude: 500,
    heading: 135,
    pitch: -18,
  },
  {
    // Camera 1 km NW of Eiffel Tower, looking SE — tower dominates foreground
    // Eiffel Tower: 48.8584, 2.2945
    id: 'europe',
    name: 'Europe',
    latitude: 48.866,
    longitude: 2.281,
    altitude: 400,
    heading: 135,
    pitch: -15,
  },
  {
    // Camera 1.5 km NW of Burj Khalifa, looking SE — 828 m tower fills frame
    // Burj Khalifa: 25.1972, 55.2744
    id: 'mena',
    name: 'MENA',
    latitude: 25.211,
    longitude: 55.260,
    altitude: 500,
    heading: 135,
    pitch: -15,
  },
  {
    // Camera 1 km W of Tokyo Skytree (634 m), looking east
    // Tokyo Skytree: 35.7101, 139.8107
    id: 'asia',
    name: 'Asia',
    latitude: 35.710,
    longitude: 139.797,
    altitude: 450,
    heading: 90,
    pitch: -15,
  },
  {
    // Camera 800 m NW of Nairobi CBD, looking toward skyline
    id: 'africa',
    name: 'Africa',
    latitude: -1.284,
    longitude: 36.813,
    altitude: 400,
    heading: 135,
    pitch: -20,
  },
  {
    // Camera 1 km SW of Sydney Opera House, looking NE across the harbour
    // Sydney Opera House: -33.8568, 151.2153
    id: 'oceania',
    name: 'Oceania',
    latitude: -33.863,
    longitude: 151.207,
    altitude: 350,
    heading: 30,
    pitch: -15,
  },
  {
    // Camera 1 km NW of São Paulo financial district, looking toward skyscrapers
    id: 'latam',
    name: 'Latin America',
    latitude: -23.541,
    longitude: -46.644,
    altitude: 500,
    heading: 135,
    pitch: -20,
  },
]
