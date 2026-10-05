import { setupServer } from 'msw/node'
import { encodeDevToken } from '@/auth/jwt'
import { statefulHandlers } from '@/mocks/handlers'
import { setMockLatency } from '@/mocks/http'
import { resetMemoryDb, useMemoryStorage } from '@/mocks/db/store'

export const ORIGIN = 'http://localhost:3000'

export function createMockServer() {
  setMockLatency([0, 0])
  const server = setupServer(...statefulHandlers)
  return {
    server,
    start: () => {
      useMemoryStorage()
      resetMemoryDb()
      server.listen({ onUnhandledFrame: 'error' })
    },
    stop: () => server.close(),
  }
}

export function tokenFor(sub: string, role: 'candidate' | 'employer', name = 'Тест', email = 'test@demo.scout') {
  return encodeDevToken({ sub, email, name, realm_access: { roles: [role] } })
}

export async function call<T = unknown>(
  method: string,
  path: string,
  opts: { token?: string; body?: unknown } = {},
): Promise<{ status: number; data: T }> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${ORIGIN}/api/v1${path}`, { method, headers, body: opts.body === undefined ? undefined : JSON.stringify(opts.body) })
  const text = await res.text()
  return { status: res.status, data: (text ? JSON.parse(text) : null) as T }
}
