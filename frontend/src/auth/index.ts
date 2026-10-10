import { config } from '@/config'
import { DevAuthProvider } from './devAuth'
import { OidcAuthProvider } from './oidcAuth'
import { setAccessTokenGetter } from './token'
import type { AuthProvider } from './types'

export function createAuthProvider(): AuthProvider {
  const provider: AuthProvider = config.authMode === 'oidc' ? new OidcAuthProvider(config.oidc) : new DevAuthProvider()
  setAccessTokenGetter(() => provider.getAccessToken())
  return provider
}

export type { AuthProvider, AuthSession, RegisterInput } from './types'
