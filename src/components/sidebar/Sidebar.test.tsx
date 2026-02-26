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
      activePreset: 'global',
      layers: useMapStore.getState().layers.map((l) => ({ ...l, enabled: false })),
    })
  })

  it('renders LAYERS header when open', () => {
    render(<Sidebar />)
    expect(screen.getByText('LAYERS')).toBeInTheDocument()
  })

  it('renders all 8 regional presets', () => {
    render(<Sidebar />)
    expect(screen.getByText('Global')).toBeInTheDocument()
    expect(screen.getByText('Americas')).toBeInTheDocument()
    expect(screen.getByText('Europe')).toBeInTheDocument()
    expect(screen.getByText('MENA')).toBeInTheDocument()
    expect(screen.getByText('Asia')).toBeInTheDocument()
    expect(screen.getByText('Africa')).toBeInTheDocument()
    expect(screen.getByText('Oceania')).toBeInTheDocument()
    expect(screen.getByText('Latin America')).toBeInTheDocument()
  })

  it('renders layer categories', () => {
    render(<Sidebar />)
    expect(screen.getByText('Military & Strategic')).toBeInTheDocument()
    expect(screen.getByText('Infrastructure')).toBeInTheDocument()
    expect(screen.getByText('Conflicts & Unrest')).toBeInTheDocument()
    expect(screen.getByText('Natural Events')).toBeInTheDocument()
    expect(screen.getByText('Live Feeds')).toBeInTheDocument()
    expect(screen.getByText('Financial')).toBeInTheDocument()
  })

  it('shows version footer', () => {
    render(<Sidebar />)
    expect(screen.getByText('NEXUS v0.1.0')).toBeInTheDocument()
  })

  it('shows layer count', () => {
    render(<Sidebar />)
    expect(screen.getByText('25 layers available')).toBeInTheDocument()
  })

  it('shows HUD Overlay toggle', () => {
    render(<Sidebar />)
    expect(screen.getByText('HUD Overlay')).toBeInTheDocument()
  })

  it('clicking a preset updates active preset', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)
    await user.click(screen.getByText('Europe'))
    expect(useMapStore.getState().activePreset).toBe('europe')
  })

  it('shows collapsed state with open button', () => {
    useMapStore.setState({ sidebarOpen: false })
    render(<Sidebar />)
    expect(screen.queryByText('LAYERS')).not.toBeInTheDocument()
    expect(screen.getByTitle('Open Sidebar')).toBeInTheDocument()
  })

  it('shows enabled count badge when layers are on', () => {
    useMapStore.setState({
      layers: useMapStore.getState().layers.map((l) =>
        l.id === 'flights' ? { ...l, enabled: true } : l
      ),
    })
    render(<Sidebar />)
    // The badge shows "1"
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
