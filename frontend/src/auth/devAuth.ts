import { DEMO_PERSONAS } from './personas'
import { encodeDevToken } from './jwt'
import type { AuthProvider, AuthSession, RegisterInput } from './types'

const SESSION_KEY = 'scout.dev.session'

/**
 * Dev-вход на моках: сессия в sessionStorage (своя в каждой вкладке —
 * кандидат и работодатель открываются в соседних вкладках), токен — неподписанный JWT
 * с теми же claims, что выдаёт Keycloak.
 */
export class DevAuthProvider implements AuthProvider {
  readonly mode = 'dev' as const
  private session: AuthSession | null = null
  private listeners = new Set<(s: AuthSession | null) => void>()

  async init() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      this.session = raw ? (JSON.parse(raw) as AuthSession) : null
    } catch {
      this.session = null
    }
    return { session: this.session, returnTo: null }
  }

  getSession() {
    return this.session
  }

  async getAccessToken() {
    const s = this.session
    if (!s) return null
    return encodeDevToken({ sub: s.userId, email: s.email, name: s.displayName, realm_access: { roles: [s.role] } })
  }

  async login(options?: { personaKey?: string }) {
    const persona = DEMO_PERSONAS.find((p) => p.key === options?.personaKey) ?? DEMO_PERSONAS[0]
    if (!persona) return null
    this.setSession({ userId: persona.userId, role: persona.role, displayName: persona.displayName, email: persona.email })
    return this.session
  }

  async register(input: RegisterInput) {
    this.setSession({ userId: crypto.randomUUID(), role: 'candidate', displayName: input.fullName.trim(), email: input.email.trim().toLowerCase() })
    return this.session
  }

  async logout() {
    this.setSession(null)
  }

  subscribe(listener: (s: AuthSession | null) => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private setSession(session: AuthSession | null) {
    this.session = session
    try {
      if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
      else sessionStorage.removeItem(SESSION_KEY)
    } catch {
      // приватный режим — сессия только в памяти
    }
    for (const l of this.listeners) l(session)
  }
}
