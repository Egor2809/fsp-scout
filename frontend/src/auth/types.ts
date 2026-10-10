import type { Role } from '@/api/generated/model'

export interface AuthSession {
  userId: string
  role: Role
  displayName: string
  email: string
}

export interface RegisterInput {
  fullName: string
  email: string
}

/**
 * Интерфейс авторизации. Экраны работают только с ним, поэтому переход
 * с dev-входа на Keycloak (oidc-client-ts) не требует переделки экранов.
 */
export interface AuthProvider {
  readonly mode: 'dev' | 'oidc'
  /** Восстановить сессию; для OIDC — обработать redirect callback. Возвращает путь для перехода после входа. */
  init(): Promise<{ session: AuthSession | null; returnTo: string | null }>
  getSession(): AuthSession | null
  getAccessToken(): Promise<string | null>
  /** dev: вход демо-персоной; oidc: редирект на Keycloak */
  login(options?: { personaKey?: string; returnTo?: string }): Promise<AuthSession | null>
  /** dev: создаёт нового кандидата; oidc: редирект на регистрацию Keycloak (prompt=create) */
  register(input: RegisterInput, returnTo?: string): Promise<AuthSession | null>
  logout(): Promise<void>
  /** OIDC: client-initiated account linking с IdP ФСП ID. В dev — не требуется. */
  linkFspIdentity?(returnTo: string): Promise<void>
  subscribe(listener: (session: AuthSession | null) => void): () => void
}
