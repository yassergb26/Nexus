export interface BroadcastStream {
  id: string
  name: string
  network: string
  streamUrl: string
  category: 'news' | 'finance' | 'weather'
  region: string
  language: string
  accentColor: string
}

export const BROADCAST_STREAMS: BroadcastStream[] = [
  {
    id: 'sky-news',
    name: 'Sky News Live',
    network: 'Sky News',
    streamUrl: 'https://www.youtube.com/embed/9Auq9mYxFEE?autoplay=1&mute=1',
    category: 'news',
    region: 'UK',
    language: 'EN',
    accentColor: '#e60000',
  },
  {
    id: 'al-jazeera',
    name: 'Al Jazeera English',
    network: 'Al Jazeera',
    streamUrl: 'https://www.youtube.com/embed/gCNeDWCI0vo?autoplay=1&mute=1',
    category: 'news',
    region: 'Qatar',
    language: 'EN',
    accentColor: '#ee1d23',
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg Markets',
    network: 'Bloomberg',
    streamUrl: 'https://www.youtube.com/embed/dp8PhLsUcFE?autoplay=1&mute=1',
    category: 'finance',
    region: 'USA',
    language: 'EN',
    accentColor: '#ff6600',
  },
  {
    id: 'france24',
    name: 'France 24 English',
    network: 'France 24',
    streamUrl: 'https://www.youtube.com/embed/h3MuIUNCCLI?autoplay=1&mute=1',
    category: 'news',
    region: 'France',
    language: 'EN',
    accentColor: '#003f9c',
  },
  {
    id: 'dw',
    name: 'DW News',
    network: 'Deutsche Welle',
    streamUrl: 'https://www.youtube.com/embed/byPFRFOPqYQ?autoplay=1&mute=1',
    category: 'news',
    region: 'Germany',
    language: 'EN',
    accentColor: '#a00028',
  },
  {
    id: 'wion',
    name: 'WION World News',
    network: 'WION',
    streamUrl: 'https://www.youtube.com/embed/U3HER3qCHQo?autoplay=1&mute=1',
    category: 'news',
    region: 'India',
    language: 'EN',
    accentColor: '#f47920',
  },
  {
    id: 'nhk',
    name: 'NHK World',
    network: 'NHK',
    streamUrl: 'https://www.youtube.com/embed/oJuG0oGT3cg?autoplay=1&mute=1',
    category: 'news',
    region: 'Japan',
    language: 'EN',
    accentColor: '#003087',
  },
  {
    id: 'abc-australia',
    name: 'ABC News Australia',
    network: 'ABC Australia',
    streamUrl: 'https://www.youtube.com/embed/vOTiJkg1voo?autoplay=1&mute=1',
    category: 'news',
    region: 'Australia',
    language: 'EN',
    accentColor: '#ffd000',
  },
]
