export interface WebcamFeed {
  id: string
  name: string
  location: string
  latitude: number
  longitude: number
  streamUrl: string
  hotspotType: 'conflict' | 'border' | 'maritime' | 'political' | 'strategic'
  description: string
}

export const WEBCAM_FEEDS: WebcamFeed[] = [
  {
    id: 'kyiv-maidan',
    name: 'Kyiv — Maidan Square',
    location: 'Kyiv, Ukraine',
    latitude: 50.4501,
    longitude: 30.5234,
    streamUrl: 'https://www.youtube.com/embed/H2C1B51sGMk?autoplay=1&mute=1',
    hotspotType: 'conflict',
    description: 'Live feed from Independence Square, Kyiv',
  },
  {
    id: 'jerusalem',
    name: 'Jerusalem — Western Wall',
    location: 'Jerusalem',
    latitude: 31.7767,
    longitude: 35.2345,
    streamUrl: 'https://www.youtube.com/embed/0jEa0FOw6vE?autoplay=1&mute=1',
    hotspotType: 'conflict',
    description: 'Western Wall live view — Old City of Jerusalem',
  },
  {
    id: 'taiwan-taipei',
    name: 'Taipei — City Panorama',
    location: 'Taipei, Taiwan',
    latitude: 25.0330,
    longitude: 121.5654,
    streamUrl: 'https://www.youtube.com/embed/c-fsELxk5aw?autoplay=1&mute=1',
    hotspotType: 'political',
    description: 'Taipei city panoramic live view featuring Taipei 101',
  },
  {
    id: 'suez-canal',
    name: 'Suez Canal Region',
    location: 'Red Sea / Suez, Egypt',
    latitude: 30.5852,
    longitude: 32.2654,
    streamUrl: 'https://www.youtube.com/embed/q7Oiln7QlDE?autoplay=1&mute=1',
    hotspotType: 'maritime',
    description: 'Strategic maritime corridor — Singapore CBD shipping hub feed',
  },
  {
    id: 'strait-hormuz',
    name: 'Strait of Hormuz',
    location: 'Persian Gulf',
    latitude: 26.5665,
    longitude: 56.2644,
    streamUrl: 'https://www.youtube.com/embed/jmwM1hA3JE0?autoplay=1&mute=1',
    hotspotType: 'maritime',
    description: 'Persian Gulf maritime chokepoint — regional harbour feed',
  },
  {
    id: 'dmz-korea',
    name: 'Korean DMZ — Seoul',
    location: 'Seoul, South Korea',
    latitude: 37.5759,
    longitude: 126.9768,
    streamUrl: 'https://www.youtube.com/embed/VBlN0MGqyz4?autoplay=1&mute=1',
    hotspotType: 'border',
    description: 'Gyeongbokgung Palace — South Korean capital near the DMZ',
  },
  {
    id: 'baltic-tallinn',
    name: 'Tallinn — Estonia',
    location: 'Tallinn, Estonia',
    latitude: 59.4370,
    longitude: 24.7536,
    streamUrl: 'https://www.youtube.com/embed/QwvhQMTglcs?autoplay=1&mute=1',
    hotspotType: 'strategic',
    description: 'NATO eastern flank — Tallinn Airport live feed, Estonia',
  },
  {
    id: 'panama-canal',
    name: 'Panama Canal',
    location: 'Panama City, Panama',
    latitude: 8.9936,
    longitude: -79.5697,
    streamUrl: 'https://www.youtube.com/embed/jtvmwjzZY0c?autoplay=1&mute=1',
    hotspotType: 'maritime',
    description: 'Panama Canal region — Americas maritime corridor feed',
  },
  {
    id: 'tehran',
    name: 'Tehran — Iran',
    location: 'Tehran, Iran',
    latitude: 35.6892,
    longitude: 51.3890,
    streamUrl: 'https://www.youtube.com/embed/eKlMI70C53U?autoplay=1&mute=1',
    hotspotType: 'political',
    description: 'Iran regional watch — live city skyline feed',
  },
  {
    id: 'south-china-sea',
    name: 'South China Sea',
    location: 'Hong Kong / South China Sea',
    latitude: 22.3193,
    longitude: 114.1694,
    streamUrl: 'https://www.youtube.com/embed/8hPXD8gXk4M?autoplay=1&mute=1',
    hotspotType: 'maritime',
    description: 'South China Sea strategic zone — Hong Kong harbour live feed',
  },
]
