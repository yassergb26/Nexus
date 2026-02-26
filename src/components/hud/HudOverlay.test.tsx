import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import HudOverlay from './HudOverlay'
import { useMapStore } from '../../store/useMapStore'

describe('HudOverlay', () => {
  beforeEach(() => {
    useMapStore.setState({
      position: {
        latitude: 51.5074,
        longitude: -0.1278,
        altitude: 5000000,
        heading: 45.5,
        pitch: -60,
      },
      fps: 55,
      hudVisible: true,
      visualMode: 'normal',
    })
  })

  it('renders the header with NEXUS branding', () => {
    render(<HudOverlay />)
    expect(screen.getByText('NEXUS')).toBeInTheDocument()
    expect(screen.getByText('Global Intelligence Command Center')).toBeInTheDocument()
  })

  it('displays the visual mode', () => {
    render(<HudOverlay />)
    expect(screen.getByText('NORMAL')).toBeInTheDocument()
  })

  it('shows coordinate labels', () => {
    render(<HudOverlay />)
    expect(screen.getByText('LAT')).toBeInTheDocument()
    expect(screen.getByText('LON')).toBeInTheDocument()
    expect(screen.getByText('ALT')).toBeInTheDocument()
    expect(screen.getByText('HDG')).toBeInTheDocument()
    expect(screen.getByText('MGRS')).toBeInTheDocument()
  })

  it('shows FPS value', () => {
    render(<HudOverlay />)
    expect(screen.getByText('FPS')).toBeInTheDocument()
    expect(screen.getByText('55')).toBeInTheDocument()
  })

  it('renders nothing when hudVisible is false', () => {
    useMapStore.setState({ hudVisible: false })
    const { container } = render(<HudOverlay />)
    expect(container.innerHTML).toBe('')
  })

  it('shows altitude in km', () => {
    render(<HudOverlay />)
    expect(screen.getByText('5000.0 km')).toBeInTheDocument()
  })

  it('shows heading value', () => {
    render(<HudOverlay />)
    expect(screen.getByText('45.5°')).toBeInTheDocument()
  })

  it('updates when visual mode changes', () => {
    useMapStore.setState({ visualMode: 'flir' })
    render(<HudOverlay />)
    expect(screen.getByText('FLIR')).toBeInTheDocument()
  })
})
