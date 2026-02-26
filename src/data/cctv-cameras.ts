export interface CctvCamera {
  id: string
  name: string
  location: string
  latitude: number
  longitude: number
  streamUrl: string
  category: 'traffic' | 'city' | 'port' | 'border' | 'landmark'
}

export const CCTV_CAMERAS: CctvCamera[] = [
  {
    id: 'times-square',
    name: 'Times Square',
    location: 'New York, USA',
    latitude: 40.7580,
    longitude: -73.9855,
    streamUrl: 'https://www.youtube.com/embed/rnXIjl_Rzy4?autoplay=1&mute=1',
    category: 'landmark',
  },
  {
    id: 'shibuya',
    name: 'Shibuya Crossing',
    location: 'Tokyo, Japan',
    latitude: 35.6595,
    longitude: 139.7004,
    streamUrl: 'https://www.youtube.com/embed/dfVK7ld38Ys?autoplay=1&mute=1',
    category: 'landmark',
  },
  {
    id: 'trafalgar',
    name: 'Trafalgar Square',
    location: 'London, UK',
    latitude: 51.5080,
    longitude: -0.1281,
    streamUrl: 'https://www.youtube.com/embed/8JCk5M_xrBs?autoplay=1&mute=1',
    category: 'landmark',
  },
  {
    id: 'eiffel',
    name: 'Eiffel Tower',
    location: 'Paris, France',
    latitude: 48.8584,
    longitude: 2.2945,
    streamUrl: 'https://www.youtube.com/embed/OzYp4NRZlwQ?autoplay=1&mute=1',
    category: 'landmark',
  },
  {
    id: 'dubai-burj',
    name: 'Burj Khalifa View',
    location: 'Dubai, UAE',
    latitude: 25.1972,
    longitude: 55.2744,
    streamUrl: 'https://www.youtube.com/embed/bqkzI5iVU2A?autoplay=1&mute=1',
    category: 'city',
  },
  {
    id: 'hong-kong',
    name: 'Victoria Harbour',
    location: 'Hong Kong',
    latitude: 22.2855,
    longitude: 114.1577,
    streamUrl: 'https://www.youtube.com/embed/jttO_OKVWsU?autoplay=1&mute=1',
    category: 'port',
  },
  {
    id: 'singapore-port',
    name: 'Singapore Strait',
    location: 'Singapore',
    latitude: 1.2644,
    longitude: 103.8204,
    streamUrl: 'https://www.youtube.com/embed/BcCLN2oCHb4?autoplay=1&mute=1',
    category: 'port',
  },
  {
    id: 'sydney-opera',
    name: 'Sydney Harbour',
    location: 'Sydney, Australia',
    latitude: -33.8568,
    longitude: 151.2153,
    streamUrl: 'https://www.youtube.com/embed/5uZa3-RMFos?autoplay=1&mute=1',
    category: 'landmark',
  },
  {
    id: 'moscow-red',
    name: 'Red Square',
    location: 'Moscow, Russia',
    latitude: 55.7539,
    longitude: 37.6208,
    streamUrl: 'https://www.youtube.com/embed/IxAHLXHhyds?autoplay=1&mute=1',
    category: 'landmark',
  },
  {
    id: 'taipei-101',
    name: 'Taipei 101',
    location: 'Taipei, Taiwan',
    latitude: 25.0336,
    longitude: 121.5645,
    streamUrl: 'https://www.youtube.com/embed/z_fY1pj1VBw?autoplay=1&mute=1',
    category: 'city',
  },
]
