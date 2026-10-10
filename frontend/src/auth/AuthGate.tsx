import { useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AuthContext } from './context'
import type { AuthProvider, AuthSession } from './types'

/** Держит текущую сессию; при смене пользователя чистит кэш запросов (кандидат видит только своё). */
export function AuthGate({ provider, initial, children }: { provider: AuthProvider; initial: AuthSession | null; children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(initial)
  const queryClient = useQueryClient()
  useEffect(
    () =>
      provider.subscribe((next) => {
        queryClient.clear()
        setSession(next)
      }),
    [provider, queryClient],
  )
  return <AuthContext.Provider value={{ provider, session }}>{children}</AuthContext.Provider>
}
