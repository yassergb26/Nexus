import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sidebar from './Sidebar'
import { useMapStore } from '../../store/useMapStore'

describe('Sidebar', () => {
  beforeEach(() => {
    useMapStore.setState({
      sidebarOpen: true,
      hudVisible: true,
      cleanUI: false,
      activePreset: 'global',
      layers: useMapStore.getState().layers.map((l) => ({ ...l, enabled: false })),
    })
  })

  it('renders CCTV MESH panel header', () => {
    render(<Sidebar />)
    expect(screen.getByText('CCTV MESH')).toBeInTheDocument()
  })

  it('renders DATA LAYERS panel header', () => {
    render(<Sidebar />)
    expect(screen.getByText('DATA LAYERS')).toBeInTheDocument()
  })

  it('renders SCENES panel header', () => {
    render(<Sidebar />)
    expect(screen.getByText('SCENES')).toBeInTheDocument()
  })

  it('renders nothing when cleanUI is true', () => {
    useMapStore.setState({ cleanUI: true })
    const { container } = render(<Sidebar />)
    expect(container.innerHTML).toBe('')
  })

  it('expands DATA LAYERS to show layer list', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)
    // Click the DATA LAYERS header to expand it
    await user.click(screen.getByText('DATA LAYERS'))
    expect(screen.getByText('Live Flights')).toBeInTheDocument()
    expect(screen.getByText('Earthquakes')).toBeInTheDocument()
    expect(screen.getByText('Satellites')).toBeInTheDocument()
  })

  it('shows ON/OFF toggles for layers when expanded', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)
    await user.click(screen.getByText('DATA LAYERS'))
    // All layers start OFF
    const offToggles = screen.getAllByText('OFF')
    expect(offToggles.length).toBeGreaterThanOrEqual(1)
  })

  it('toggles a layer when ON/OFF is clicked', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)
    await user.click(screen.getByText('DATA LAYERS'))
    // Find the first OFF toggle and click it
    const offToggles = screen.getAllByText('OFF')
    await user.click(offToggles[0])
    // Check that the CCTV layer (first in primary list) toggled — at least one ON should appear
    expect(screen.getAllByText('ON').length).toBeGreaterThanOrEqual(1)
  })

  it('shows CCTV toggle inside CCTV MESH panel', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)
    await user.click(screen.getByText('CCTV MESH'))
    expect(screen.getByText('Camera feeds')).toBeInTheDocument()
  })

  it('shows scenes placeholder when expanded', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)
    await user.click(screen.getByText('SCENES'))
    expect(screen.getByText('No saved scenes')).toBeInTheDocument()
  })
})
