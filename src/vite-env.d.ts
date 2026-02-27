/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CESIUM_TOKEN: string
  readonly VITE_CLAUDE_API_KEY: string
  readonly VITE_GROQ_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Allow Cesium global access
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Cesium: any
