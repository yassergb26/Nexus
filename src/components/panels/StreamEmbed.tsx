import { useState, useEffect, useRef, useCallback } from 'react'
import { VideoOff, ExternalLink, SkipForward } from 'lucide-react'

interface StreamEmbedProps {
  url: string
  fallbackUrls?: string[]
  title: string
}

/**
 * Inner component that manages fallback cycling for a specific primary URL.
 * Wrapped by StreamEmbed which uses key={url} to force full remount on URL change.
 */
function StreamEmbedInner({ url, fallbackUrls = [], title }: StreamEmbedProps) {
  const allUrls = [url, ...fallbackUrls]
  const [urlIndex, setUrlIndex] = useState(0)
  const [allFailed, setAllFailed] = useState(false)
  const [loading, setLoading] = useState(true)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentUrl = allUrls[urlIndex] ?? url

  // Extract YouTube video ID for external link
  const ytMatch = currentUrl.match(/embed\/([^?]+)/)
  const ytUrl = ytMatch ? `https://www.youtube.com/watch?v=${ytMatch[1]}` : currentUrl

  const tryNextFallback = useCallback(() => {
    if (urlIndex + 1 < allUrls.length) {
      setUrlIndex((i) => i + 1)
      setLoading(true)
    } else {
      setAllFailed(true)
    }
  }, [urlIndex, allUrls.length])

  // Timeout: clear loading state after 10s even if no onLoad fires
  useEffect(() => {
    if (allFailed) return

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      setLoading(false)
    }, 10000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [urlIndex, allFailed])

  const handleLoad = () => {
    setLoading(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  if (allFailed) {
    return (
      <div className="aspect-video bg-[#111] rounded flex flex-col items-center justify-center gap-2">
        <VideoOff size={20} className="text-[#333]" />
        <span className="text-[8px] font-mono text-[#444]">All streams unavailable</span>
        <a
          href={ytUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[8px] font-mono text-[#00d4aa] hover:underline"
        >
          <ExternalLink size={10} /> Open in YouTube
        </a>
      </div>
    )
  }

  return (
    <div className="aspect-video bg-black rounded overflow-hidden relative">
      <iframe
        src={currentUrl}
        className="absolute inset-0 w-full h-full"
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        title={title}
        onLoad={handleLoad}
        onError={tryNextFallback}
      />
      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
          <div className="w-4 h-4 border-2 border-[#00d4aa]/30 border-t-[#00d4aa] rounded-full animate-spin" />
        </div>
      )}
      {/* Manual skip button — lets user cycle to next stream */}
      {allUrls.length > 1 && (
        <button
          onClick={tryNextFallback}
          className="absolute top-1 right-1 p-1 bg-[#0a0a0a]/80 rounded hover:bg-[#1a1a1a] transition-colors"
          title="Try next stream"
        >
          <SkipForward size={10} className="text-[#555]" />
        </button>
      )}
    </div>
  )
}

/**
 * YouTube stream embed with automatic fallback cycling.
 * Uses key={url} to fully remount when the primary URL changes.
 */
export default function StreamEmbed(props: StreamEmbedProps) {
  return <StreamEmbedInner key={props.url} {...props} />
}
