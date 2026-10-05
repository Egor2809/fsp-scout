/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** `false` — работать с реальным бэкендом; по умолчанию моки MSW */
  readonly VITE_API_MOCK?: string
  /** `dev` — вход с выбором роли (моки), `oidc` — Keycloak */
  readonly VITE_AUTH_MODE?: string
  readonly VITE_OIDC_AUTHORITY?: string
  readonly VITE_OIDC_CLIENT_ID?: string
  readonly VITE_OIDC_FSP_IDP?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
