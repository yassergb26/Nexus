import { useEffect, useRef } from 'react'
import { PostProcessStage } from 'cesium'
import { useCesiumViewerContext } from '../contexts/CesiumViewerContext'
import { useMapStore } from '../store/useMapStore'
import { SHADER_SOURCES } from '../shaders/index'

export function useVisualMode() {
  const { viewerRef, viewerReady } = useCesiumViewerContext()
  const visualMode = useMapStore((s) => s.visualMode)
  const stageRef = useRef<PostProcessStage | null>(null)

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !viewerReady || viewer.isDestroyed()) return

    // Remove existing stage
    if (stageRef.current) {
      try {
        viewer.scene.postProcessStages.remove(stageRef.current)
        stageRef.current.destroy()
      } catch (_) { /* ignore if already destroyed */ }
      stageRef.current = null
    }

    const source = SHADER_SOURCES[visualMode]
    if (!source) return

    const stage = new PostProcessStage({
      fragmentShader: source,
      uniforms: {
        u_time: () => performance.now() / 1000.0,
      },
    })

    viewer.scene.postProcessStages.add(stage)
    stageRef.current = stage

    return () => {
      if (stageRef.current) {
        try {
          if (viewer && !viewer.isDestroyed()) {
            viewer.scene.postProcessStages.remove(stageRef.current)
          }
          stageRef.current.destroy()
        } catch (_) { /* ignore */ }
        stageRef.current = null
      }
    }
  }, [viewerRef, viewerReady, visualMode])
}
