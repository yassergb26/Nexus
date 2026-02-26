export interface FlightState {
  icao24: string
  callsign: string
  originCountry: string
  longitude: number
  latitude: number
  altitude: number
  onGround: boolean
  velocity: number
  heading: number
  verticalRate: number
}

interface OpenSkyResponse {
  time: number
  states: (string | number | boolean | null)[][] | null
}

export async function fetchFlights(): Promise<FlightState[]> {
  const res = await fetch('https://opensky-network.org/api/states/all')
  if (!res.ok) throw new Error(`OpenSky API error: ${res.status}`)
  const data: OpenSkyResponse = await res.json()
  if (!data.states) return []

  const flights: FlightState[] = []
  for (const s of data.states) {
    const lon = s[5] as number | null
    const lat = s[6] as number | null
    const alt = s[13] as number | null // baro_altitude
    if (lon == null || lat == null) continue

    flights.push({
      icao24: (s[0] as string) ?? '',
      callsign: ((s[1] as string) ?? '').trim(),
      originCountry: (s[2] as string) ?? '',
      longitude: lon,
      latitude: lat,
      altitude: alt ?? (s[7] as number) ?? 0,
      onGround: (s[8] as boolean) ?? false,
      velocity: (s[9] as number) ?? 0,
      heading: (s[10] as number) ?? 0,
      verticalRate: (s[11] as number) ?? 0,
    })
  }
  return flights
}
