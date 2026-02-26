export interface OMMRecord {
  OBJECT_NAME: string
  OBJECT_ID: string
  EPOCH: string
  MEAN_MOTION: number
  ECCENTRICITY: number
  INCLINATION: number
  RA_OF_ASC_NODE: number
  ARG_OF_PERICENTER: number
  MEAN_ANOMALY: number
  EPHEMERIS_TYPE: number
  CLASSIFICATION_TYPE: string
  NORAD_CAT_ID: number
  REV_AT_EPOCH: number
  BSTAR: number
  MEAN_MOTION_DOT: number
  MEAN_MOTION_DDOT: number
}

export async function fetchSatelliteTLEs(): Promise<OMMRecord[]> {
  // Fetch a manageable subset — space stations + active high-interest sats
  const res = await fetch(
    'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=json'
  )
  if (!res.ok) throw new Error(`CelesTrak API error: ${res.status}`)
  const data: OMMRecord[] = await res.json()
  return data
}
