import type { Role } from '@/api/generated/model'

/** Полезная нагрузка access token в той же форме, что у Keycloak. */
export interface TokenClaims {
  sub: string
  email: string
  name: string
  realm_access: { roles: string[] }
  exp?: number
}

function base64UrlEncode(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (segment.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/** Неподписанный «JWT» для dev-входа на моках (мок-бэкенд разбирает его как настоящий). */
export function encodeDevToken(claims: TokenClaims): string {
  return `${base64UrlEncode(JSON.stringify({ alg: 'none', typ: 'JWT' }))}.${base64UrlEncode(JSON.stringify(claims))}.dev`
}

export function decodeJwtPayload(token: string): TokenClaims | null {
  const parts = token.split('.')
  if (parts.length < 2 || !parts[1]) return null
  try {
    const payload = JSON.parse(base64UrlDecode(parts[1])) as Partial<TokenClaims>
    if (typeof payload.sub !== 'string') return null
    return {
      sub: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : '',
      name: typeof payload.name === 'string' ? payload.name : '',
      realm_access: { roles: Array.isArray(payload.realm_access?.roles) ? payload.realm_access.roles : [] },
      exp: typeof payload.exp === 'number' ? payload.exp : undefined,
    }
  } catch {
    return null
  }
}

/** Роль приложения из realm roles (приоритет: admin > employer > candidate). */
export function roleFromClaims(claims: TokenClaims): Role | null {
  const roles = claims.realm_access.roles
  if (roles.includes('admin')) return 'admin'
  if (roles.includes('employer')) return 'employer'
  if (roles.includes('candidate')) return 'candidate'
  return null
}
