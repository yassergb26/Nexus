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
      cleanUI: false,
      visualMode: 'normal',
    })
  })

  it('renders classification banner', () => {
    render(<HudOverlay />)
    expect(screen.getByText('TOP SECRET // SI-TK // NOFORN')).toBeInTheDocument()
  })

  it('displays the visual mode name', () => {
    render(<HudOverlay />)
    // Mode name appears in top-left and top-right
    const normals = screen.getAllByText('NORMAL')
    expect(normals.length).toBeGreaterThanOrEqual(2)
  })

  it('shows MGRS label', () => {
    render(<HudOverlay />)
    expect(screen.getByText(/MGRS:/)).toBeInTheDocument()
  })

  it('shows ACTIVE STYLE label', () => {
    render(<HudOverlay />)
    expect(screen.getByText('ACTIVE STYLE')).toBeInTheDocument()
  })

  it('shows REC indicator with timestamp', () => {
    render(<HudOverlay />)
    expect(screen.getByText(/REC/)).toBeInTheDocument()
  })

  it('renders nothing when hudVisible is false', () => {
    useMapStore.setState({ hudVisible: false })
    const { container } = render(<HudOverlay />)
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing when cleanUI is true', () => {
    useMapStore.setState({ cleanUI: true })
    const { container } = render(<HudOverlay />)
    expect(container.innerHTML).toBe('')
  })

  it('updates when visual mode changes', () => {
    useMapStore.setState({ visualMode: 'flir' })
    render(<HudOverlay />)
    const flirs = screen.getAllByText('FLIR')
    expect(flirs.length).toBeGreaterThanOrEqual(2)
  })
})
