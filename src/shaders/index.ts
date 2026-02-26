import flirSource from './flir.glsl?raw'
import nightvisionSource from './nightvision.glsl?raw'
import crtSource from './crt.glsl?raw'
import animeSource from './anime.glsl?raw'
import noirSource from './noir.glsl?raw'
import snowSource from './snow.glsl?raw'
import satelliteModeSource from './satellite-mode.glsl?raw'
import type { VisualMode } from '../types'

export const SHADER_SOURCES: Record<VisualMode, string | null> = {
  normal: null,
  flir: flirSource,
  nightvision: nightvisionSource,
  crt: crtSource,
  anime: animeSource,
  noir: noirSource,
  snow: snowSource,
  satellite: satelliteModeSource,
}
