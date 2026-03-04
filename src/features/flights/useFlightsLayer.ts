import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CustomDataSource, Cartesian3, NearFarScalar, Math as CesiumMath } from 'cesium'
import { useCesiumViewerContext } from '../../contexts/CesiumViewerContext'
import { useMapStore } from '../../store/useMapStore'
import { fetchFlights } from '../../services/opensky'
import { airplaneIcon } from '../../utils/iconBuilder'

const FLIGHT_ICON = airplaneIcon('#00d4aa')

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

    const flights = data.filter((f) => !f.onGround).slice(0, 3000)

    for (const flight of flights) {
      const alt = Math.max(flight.altitude ?? 1000, 100)
      ds.entities.add({
        id: `flight-${flight.icao24}`,
        name: flight.callsign || flight.icao24,
        position: Cartesian3.fromDegrees(flight.longitude, flight.latitude, alt),
        billboard: {
          image: FLIGHT_ICON,
          width: 20,
          height: 20,
          rotation: CesiumMath.toRadians(-flight.heading),
          alignedAxis: Cartesian3.UNIT_Z,
          scaleByDistance: new NearFarScalar(1e5, 1.5, 1e7, 0.3),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: `<b>${flight.callsign || flight.icao24}</b><br/>Origin: ${flight.originCountry}<br/>Altitude: ${(alt / 1000).toFixed(1)} km<br/>Speed: ${flight.velocity.toFixed(0)} m/s<br/>Heading: ${flight.heading.toFixed(0)}°` as any,
      })
    }
    setLayerCount('flights', flights.length)
  }, [data, isEnabled, setLayerCount])
}
