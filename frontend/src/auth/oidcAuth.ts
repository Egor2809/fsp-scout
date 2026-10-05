import { UserManager, WebStorageStateStore, type User } from 'oidc-client-ts'
import { decodeJwtPayload, roleFromClaims } from './jwt'
import type { AuthProvider, AuthSession } from './types'

export interface OidcSettings {
  authority: string
  clientId: string
  fspIdpAlias: string
}

const CALLBACK_PATH = '/auth/callback'

/** Keycloak (realm scout), Authorization Code + PKCE через oidc-client-ts. */
export class OidcAuthProvider implements AuthProvider {
  readonly mode = 'oidc' as const
  private readonly manager: UserManager
  private session: AuthSession | null = null
  private listeners = new Set<(s: AuthSession | null) => void>()

  constructor(private readonly settings: OidcSettings) {
    const origin = window.location.origin
    this.manager = new UserManager({
      authority: settings.authority,
      client_id: settings.clientId,
      redirect_uri: `${origin}${CALLBACK_PATH}`,
      post_logout_redirect_uri: origin,
      response_type: 'code',
      scope: 'openid profile email',
      automaticSilentRenew: true,
      userStore: new WebStorageStateStore({ store: window.sessionStorage }),
    })
    this.manager.events.addUserLoaded((user) => this.setUser(user))
    this.manager.events.addUserUnloaded(() => this.setUser(null))
    this.manager.events.addAccessTokenExpired(() => this.setUser(null))
  }

  async init() {
    let returnTo: string | null = null
    if (window.location.pathname === CALLBACK_PATH) {
      const user = await this.manager.signinRedirectCallback()
      const state = user.state as { returnTo?: string } | undefined
      returnTo = state?.returnTo ?? '/'
      this.setUser(user)
    } else {
      this.setUser(await this.manager.getUser())
    }
    return { session: this.session, returnTo }
  }

  getSession() {
    return this.session
  }

  async getAccessToken() {
    const user = await this.manager.getUser()
    return user && !user.expired ? user.access_token : null
  }

  async login(options?: { returnTo?: string }) {
    await this.manager.signinRedirect({ state: { returnTo: options?.returnTo ?? '/' } })
    return null
  }

  async register(_input: unknown, returnTo?: string) {
    // Keycloak 26: prompt=create открывает форму регистрации (email подтверждается письмом)
    await this.manager.signinRedirect({ state: { returnTo: returnTo ?? '/' }, prompt: 'create' })
    return null
  }

  async logout() {
    await this.manager.signoutRedirect()
  }

  async linkFspIdentity(returnTo: string) {
    // Client-initiated account linking (AIA): Keycloak привязывает IdP ФСП ID к текущему пользователю
    await this.manager.signinRedirect({ state: { returnTo }, extraQueryParams: { kc_action: `idp_link:${this.settings.fspIdpAlias}` } })
  }

  subscribe(listener: (s: AuthSession | null) => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private setUser(user: User | null) {
    const claims = user && !user.expired ? decodeJwtPayload(user.access_token) : null
    const role = claims ? roleFromClaims(claims) : null
    this.session =
      claims && role
        ? { userId: claims.sub, role, displayName: claims.name || String(user?.profile.name ?? claims.email), email: claims.email || String(user?.profile.email ?? '') }
        : null
    for (const l of this.listeners) l(this.session)
  }
}
