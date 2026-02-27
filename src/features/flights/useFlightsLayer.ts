import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CustomDataSource, Cartesian3, Color, NearFarScalar, HeadingPitchRoll } from 'cesium'
import { useCesiumViewerContext } from '../../contexts/CesiumViewerContext'
import { useMapStore } from '../../store/useMapStore'
import { fetchFlights } from '../../services/opensky'

export function useFlightsLayer() {
  const { viewerRef, viewerReady } = useCesiumViewerContext()
  const isEnabled = useMapStore((s) => s.layers.find((l) => l.id === 'flights')?.enabled ?? false)
  const setLayerCount = useMapStore((s) => s.setLayerCount)
  const dataSourceRef = useRef<CustomDataSource | null>(null)

  const { data } = useQuery({
    queryKey: ['flights'],
    queryFn: fetchFlights,
    enabled: isEnabled,
    refetchInterval: 15_000,
    staleTime: 12_000,
  })

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !viewerReady || viewer.isDestroyed()) return
    const ds = new CustomDataSource('flights')
    viewer.dataSources.add(ds)
    dataSourceRef.current = ds
    return () => {
      if (viewer && !viewer.isDestroyed()) {
        viewer.dataSources.remove(ds, true)
      }
      dataSourceRef.current = null
    }
  }, [viewerRef, viewerReady])

  useEffect(() => {
    const ds = dataSourceRef.current
    if (!ds) return

    ds.entities.removeAll()

    if (!isEnabled || !data) {
      setLayerCount('flights', 0)
      return
    }

    // Cap at 3000 for performance
    const flights = data.filter((f) => !f.onGround).slice(0, 3000)

    for (const flight of flights) {
      const alt = Math.max(flight.altitude ?? 1000, 100)
      ds.entities.add({
        id: `flight-${flight.icao24}`,
        name: flight.callsign || flight.icao24,
        position: Cartesian3.fromDegrees(flight.longitude, flight.latitude, alt),
        point: {
          pixelSize: 4,
          color: Color.fromCssColorString('#00d4aa'),
          outlineColor: Color.fromCssColorString('#00d4aa').withAlpha(0.3),
          outlineWidth: 2,
          scaleByDistance: new NearFarScalar(1e5, 2.0, 1e7, 0.4),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: `<b>${flight.callsign || flight.icao24}</b><br/>Origin: ${flight.originCountry}<br/>Altitude: ${(alt / 1000).toFixed(1)} km<br/>Speed: ${flight.velocity.toFixed(0)} m/s<br/>Heading: ${flight.heading.toFixed(0)}°` as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        orientation: HeadingPitchRoll.fromDegrees(flight.heading, 0, 0) as any,
      })
    }
    setLayerCount('flights', flights.length)
  }, [data, isEnabled, setLayerCount])
}
