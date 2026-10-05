import { createContext, useContext } from 'react'
import type { AuthProvider, AuthSession } from './types'

export interface AuthContextValue {
  provider: AuthProvider
  session: AuthSession | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth вне AuthContext')
  return ctx
}

/** Домашняя страница роли. */
export function homeFor(session: AuthSession | null): string {
  if (!session) return '/'
  return session.role === 'employer' ? '/e' : session.role === 'candidate' ? '/c' : '/'
}
