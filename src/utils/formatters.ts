export function formatCoordinate(value: number, type: 'lat' | 'lon'): string {
  const abs = Math.abs(value)
  const degrees = Math.floor(abs)
  const totalSeconds = (abs - degrees) * 3600
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.max(0, totalSeconds - minutes * 60).toFixed(1)
  const direction =
    type === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W'
  return `${degrees}°${minutes}'${seconds}"${direction}`
}

export function formatAltitude(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`
  }
  return `${meters.toFixed(0)} m`
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export function toMGRS(lat: number, lon: number): string {
  // MGRS is only valid between 80S and 84N
  if (lat < -80 || lat > 84) return 'N/A (polar)'

  // Clamp longitude
  const clampedLon = ((lon + 180) % 360 + 360) % 360 - 180
  const zoneNumber = Math.min(60, Math.floor((clampedLon + 180) / 6) + 1)
  const letters = 'CDEFGHJKLMNPQRSTUVWX'
  const letterIndex = Math.max(0, Math.min(letters.length - 1, Math.floor((lat + 80) / 8)))
  const zoneLetter = letters[letterIndex]
  const easting = Math.round((((clampedLon + 180) % 6) * 100000) / 6)
  const northing = Math.round((((lat + 80) % 8) * 100000) / 8)
  return `${zoneNumber}${zoneLetter} ${easting.toString().padStart(5, '0')} ${northing.toString().padStart(5, '0')}`
}
