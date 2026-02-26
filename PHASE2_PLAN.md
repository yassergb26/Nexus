# Phase 2 — Visual Modes + Live Feeds

## Build Order (7 Sections)

### Section 1: Foundation Infrastructure
- CesiumViewerContext (share Cesium viewer across components)
- QueryClientProvider (TanStack Query for data fetching)
- LayerRenderer component (mounts all layer hooks)
- Modify GlobeViewer to use shared context ref

### Section 2: Visual Modes (8 GLSL Shaders)
- FLIR (thermal), Night Vision, CRT, Anime, Noir, Snow, Satellite
- PostProcessStage pipeline via useVisualMode hook
- Visual mode selector in sidebar

### Section 3: Earthquake Layer (simplest API — pattern template)
- USGS GeoJSON feed (M4.5+ daily, no auth, no rate limit)
- Magnitude-based colored markers on globe
- Auto-refresh every 60s

### Section 4: Flight Tracking
- OpenSky ADS-B REST API (free, no auth for anonymous)
- Aircraft points with heading rotation on globe
- Auto-refresh every 15s, cap 3000 entities

### Section 5: Satellite Tracking
- CelesTrak OMM JSON (no auth)
- satellite.js SGP4 propagation for real-time positions
- Orbital path visualization
- Refresh TLE every 6 hours, propagate positions per-frame

### Section 6: CCTV + Webcams
- Static data: 20+ CCTV cameras, 19+ webcams
- Billboard markers on globe
- Click → popup with embedded video player

### Section 7: Live Broadcasts
- Static data: 8+ live news streams
- Floating panel with video grid (not on globe)
- Toggle via broadcasts layer

## Key Architecture Decisions
- CustomDataSource per layer (isolated entity management)
- TanStack Query for all API fetching with caching
- React Context for Cesium viewer sharing
- Each layer = custom hook (fetch + render + cleanup)
