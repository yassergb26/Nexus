import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LayerPanel from './LayerPanel'
import { useMapStore } from '../../store/useMapStore'
import type { MapLayer } from '../../types'

const mockLayers: MapLayer[] = [
  { id: 'flights', name: 'Live Flights', category: 'military', icon: 'Plane', enabled: false, color: '#00d4aa' },
  { id: 'satellites', name: 'Satellites', category: 'military', icon: 'Satellite', enabled: false, color: '#8b5cf6' },
]

describe('LayerPanel', () => {
  beforeEach(() => {
    useMapStore.setState({
      layers: useMapStore.getState().layers.map((l) => ({ ...l, enabled: false })),
    })
  })

  it('renders category title', () => {
    render(<LayerPanel title="Military & Strategic" layers={mockLayers} />)
    expect(screen.getByText('Military & Strategic')).toBeInTheDocument()
  })

  it('renders all layer names', () => {
    render(<LayerPanel title="Military & Strategic" layers={mockLayers} />)
    expect(screen.getByText('Live Flights')).toBeInTheDocument()
    expect(screen.getByText('Satellites')).toBeInTheDocument()
  })

  it('clicking a layer toggles it in store', async () => {
    const user = userEvent.setup()
    render(<LayerPanel title="Military & Strategic" layers={mockLayers} />)
    await user.click(screen.getByText('Live Flights'))
    const flights = useMapStore.getState().layers.find((l) => l.id === 'flights')
    expect(flights!.enabled).toBe(true)
  })

  it('collapses when header clicked', async () => {
    const user = userEvent.setup()
    render(<LayerPanel title="Military & Strategic" layers={mockLayers} />)
    expect(screen.getByText('Live Flights')).toBeInTheDocument()
    await user.click(screen.getByText('Military & Strategic'))
    expect(screen.queryByText('Live Flights')).not.toBeInTheDocument()
  })

  it('shows enabled count badge', () => {
    const enabledLayers = mockLayers.map((l) =>
      l.id === 'flights' ? { ...l, enabled: true } : l
    )
    render(<LayerPanel title="Military & Strategic" layers={enabledLayers} />)
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  it('shows count badge when layer has count', () => {
    const layersWithCount: MapLayer[] = [
      { ...mockLayers[0], enabled: true, count: 5432 },
    ]
    render(<LayerPanel title="Military & Strategic" layers={layersWithCount} />)
    expect(screen.getByText('5.4K')).toBeInTheDocument()
  })
})
