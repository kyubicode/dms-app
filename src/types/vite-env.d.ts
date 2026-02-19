/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  // tambahkan variabel env lainnya di sini...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}