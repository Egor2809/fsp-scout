const env = import.meta.env

const apiMock = env.VITE_API_MOCK !== 'false'

export type AuthMode = 'dev' | 'oidc'

function resolveAuthMode(): AuthMode {
  const mode = env.VITE_AUTH_MODE
  if (mode === 'dev' || mode === 'oidc') return mode
  return apiMock ? 'dev' : 'oidc'
}

export const config = {
  /** Весь фронт работает на моках MSW, пока не выставлен VITE_API_MOCK=false */
  apiMock,
  authMode: resolveAuthMode(),
  oidc: {
    authority: env.VITE_OIDC_AUTHORITY ?? 'http://localhost:8080/realms/scout',
    clientId: env.VITE_OIDC_CLIENT_ID ?? 'scout-frontend',
    /** Alias Identity Provider ФСП ID в Keycloak (account linking) */
    fspIdpAlias: env.VITE_OIDC_FSP_IDP ?? 'fsp',
  },
} as const
