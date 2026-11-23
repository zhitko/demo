interface ImportMetaEnv {
  readonly VITE_USE_LLM?: string
  readonly VITE_LLM_URL?: string
  readonly VITE_LLM_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
