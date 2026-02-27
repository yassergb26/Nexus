import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
  type MutableRefObject,
} from 'react'
import type { Viewer } from 'cesium'

interface CesiumViewerContextValue {
  viewerRef: MutableRefObject<Viewer | null>
  viewerReady: boolean
  setViewerReady: (ready: boolean) => void
}

const CesiumViewerContext = createContext<CesiumViewerContextValue | null>(null)

export function CesiumViewerProvider({ children }: { children: ReactNode }) {
  const viewerRef = useRef<Viewer | null>(null)
  const [viewerReady, setViewerReady] = useState(false)
  return (
    <CesiumViewerContext.Provider value={{ viewerRef, viewerReady, setViewerReady }}>
      {children}
    </CesiumViewerContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCesiumViewerContext() {
  const ctx = useContext(CesiumViewerContext)
  if (!ctx) throw new Error('Must be inside CesiumViewerProvider')
  return ctx
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCesiumViewer(): Viewer | null {
  return useCesiumViewerContext().viewerRef.current
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCesiumViewerRef(): MutableRefObject<Viewer | null> {
  return useCesiumViewerContext().viewerRef
}
