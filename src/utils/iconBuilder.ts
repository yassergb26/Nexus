/**
 * SVG icon builder for CesiumJS Billboard entities.
 * Generates inline data URIs from SVG paths so we avoid external image loads.
 */

function svgToDataUri(svgContent: string, size = 48): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${svgContent}</svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/** Airplane icon — for flight tracking. Caller rotates via billboard.rotation. */
export function airplaneIcon(color = '#00d4aa'): string {
  return svgToDataUri(
    `<path d="M24 4 L28 18 L42 22 L42 26 L28 24 L26 38 L32 42 L32 45 L24 43 L16 45 L16 42 L22 38 L20 24 L6 26 L6 22 L20 18 Z" fill="${color}" stroke="${color}" stroke-width="0.5"/>`,
  )
}

/** Shield icon — for military bases. */
export function shieldIcon(color = '#ef4444'): string {
  return svgToDataUri(
    `<path d="M24 4 L40 12 L40 24 C40 34 32 42 24 46 C16 42 8 34 8 24 L8 12 Z" fill="${color}" fill-opacity="0.85" stroke="${color}" stroke-width="1.5"/>`,
  )
}

/** Warning triangle — for earthquakes. */
export function warningIcon(color = '#ffd700'): string {
  return svgToDataUri(
    `<path d="M24 6 L44 42 L4 42 Z" fill="${color}" fill-opacity="0.85" stroke="${color}" stroke-width="1"/>
     <text x="24" y="38" text-anchor="middle" font-size="22" font-weight="bold" fill="#000">!</text>`,
  )
}

/** Satellite icon — for orbital tracking. */
export function satelliteIcon(color = '#8b5cf6'): string {
  return svgToDataUri(
    `<rect x="18" y="18" width="12" height="12" rx="2" fill="${color}" stroke="${color}" stroke-width="1"/>
     <rect x="4" y="20" width="12" height="8" rx="1" fill="${color}" fill-opacity="0.6"/>
     <rect x="32" y="20" width="12" height="8" rx="1" fill="${color}" fill-opacity="0.6"/>
     <line x1="24" y1="8" x2="24" y2="18" stroke="${color}" stroke-width="1.5"/>
     <circle cx="24" cy="6" r="2" fill="${color}"/>`,
  )
}

/** Camera icon — for CCTV and webcam feeds. */
export function cameraIcon(color = '#10b981'): string {
  return svgToDataUri(
    `<rect x="6" y="14" width="28" height="22" rx="3" fill="${color}" fill-opacity="0.85" stroke="${color}" stroke-width="1.5"/>
     <polygon points="34,18 44,12 44,38 34,32" fill="${color}" fill-opacity="0.7"/>
     <circle cx="20" cy="25" r="5" fill="none" stroke="#000" stroke-width="1.5" opacity="0.4"/>`,
  )
}
