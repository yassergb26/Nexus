import { useState, useRef, useEffect } from 'react'
import { MapPin, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMapStore } from '../../store/useMapStore'
import { CITY_LIST, CITY_CENTERS, LANDMARKS } from '../../data/landmarks'
import type { CityName } from '../../data/landmarks'

export default function LocationsBar() {
  const { activeCity, setActiveCity, activeLandmark, setActiveLandmark, setPendingFlyTo, cleanUI } =
    useMapStore()
  const [expanded, setExpanded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Track scroll state for arrow buttons
  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', updateScrollState)
      return () => el.removeEventListener('scroll', updateScrollState)
    }
  }, [expanded])

  if (cleanUI) return null

  const cityLandmarks = activeCity
    ? LANDMARKS.filter((l) => l.city === activeCity)
    : []

  const handleCityClick = (city: CityName) => {
    if (activeCity === city) {
      // Deselect
      setActiveCity(null)
      return
    }
    setActiveCity(city)
    const center = CITY_CENTERS[city]
    setPendingFlyTo({
      lat: center.lat,
      lon: center.lon,
      alt: 8000,
      heading: 0,
      pitch: -35,
    })
  }

  const handleLandmarkClick = (id: string) => {
    const lm = LANDMARKS.find((l) => l.id === id)
    if (!lm) return
    setActiveLandmark(id)
    setPendingFlyTo({
      lat: lm.lat,
      lon: lm.lon,
      alt: 800,
      heading: 0,
      pitch: -25,
    })
  }

  const scrollBy = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-[90vw]">
      {/* Header row */}
      <div className="flex items-center gap-3 bg-[#0a0a0a]/90 backdrop-blur-sm border border-[#222] rounded-lg px-4 py-2">
        <MapPin size={12} className="text-[#00d4aa] shrink-0" />
        <span className="text-[9px] font-mono tracking-[0.15em] text-[#555] uppercase shrink-0">
          LOCATIONS
        </span>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[9px] font-mono tracking-wider text-[#444] hover:text-[#888] transition-colors shrink-0"
        >
          {expanded ? <Minus size={10} /> : <Plus size={10} />}
        </button>

        <div className="w-px h-4 bg-[#222]" />

        {/* Current selection display */}
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider min-w-0">
          <span className="text-[#555] shrink-0">Location:</span>
          <span className="text-[#999] truncate">{activeCity ?? '--'}</span>
          <span className="text-[#333] shrink-0">|</span>
          <span className="text-[#555] shrink-0">Landmark:</span>
          <span className="text-[#999] truncate">
            {activeLandmark
              ? LANDMARKS.find((l) => l.id === activeLandmark)?.name ?? '--'
              : '--'}
          </span>
        </div>
      </div>

      {/* Expanded: City tabs + POI chips */}
      {expanded && (
        <div className="mt-[1px] bg-[#0a0a0a]/90 backdrop-blur-sm border border-[#222] rounded-lg overflow-hidden">
          {/* City tabs with horizontal scroll */}
          <div className="relative flex items-center">
            {/* Left scroll arrow */}
            {canScrollLeft && (
              <button
                onClick={() => scrollBy(-160)}
                className="absolute left-0 z-10 h-full px-1 bg-gradient-to-r from-[#0a0a0a] to-transparent"
              >
                <ChevronLeft size={12} className="text-[#555]" />
              </button>
            )}

            <div
              ref={scrollRef}
              className="flex items-center gap-1 px-3 py-2 overflow-x-auto scrollbar-none"
              style={{ scrollbarWidth: 'none' }}
            >
              {CITY_LIST.map((city) => {
                const isActive = activeCity === city
                return (
                  <button
                    key={city}
                    onClick={() => handleCityClick(city)}
                    className={`shrink-0 px-3 py-1.5 rounded-md text-[10px] font-mono tracking-wider transition-all ${
                      isActive
                        ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/30'
                        : 'text-[#666] border border-transparent hover:bg-[#1a1a1a] hover:text-[#999]'
                    }`}
                  >
                    {city.toUpperCase()}
                  </button>
                )
              })}
            </div>

            {/* Right scroll arrow */}
            {canScrollRight && (
              <button
                onClick={() => scrollBy(160)}
                className="absolute right-0 z-10 h-full px-1 bg-gradient-to-l from-[#0a0a0a] to-transparent"
              >
                <ChevronRight size={12} className="text-[#555]" />
              </button>
            )}
          </div>

          {/* POI chips for selected city */}
          {activeCity && cityLandmarks.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-3 py-2 border-t border-[#1a1a1a]">
              {cityLandmarks.map((lm) => {
                const isActive = activeLandmark === lm.id
                return (
                  <button
                    key={lm.id}
                    onClick={() => handleLandmarkClick(lm.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono transition-all ${
                      isActive
                        ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/30'
                        : 'bg-[#141414] text-[#777] border border-[#222] hover:bg-[#1a1a1a] hover:text-[#bbb]'
                    }`}
                  >
                    <MapPin size={10} className={isActive ? 'text-[#00d4aa]' : 'text-[#555]'} />
                    {lm.name}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
