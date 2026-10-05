import { getAccessToken } from '@/auth/token'
import { ApiError, isProblem } from './problem'

export const API_BASE = '/api/v1'

/**
 * Мутатор orval: все запросы сгенерированного клиента идут через него.
 * Добавляет Bearer-токен текущего провайдера авторизации, разбирает JSON
 * и превращает ответы 4xx/5xx в ApiError с телом RFC 9457.
 */
export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const token = await getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (!headers.has('Accept')) headers.set('Accept', 'application/json, application/problem+json')

  const target = url.startsWith('http') || url.startsWith(API_BASE) ? url : `${API_BASE}${url}`
  let response: Response
  try {
    response = await fetch(target, { ...options, headers })
  } catch (cause) {
    throw ApiError.network(cause)
  }

  if (!response.ok) {
    const body: unknown = await readBody(response)
    if (isProblem(body)) throw new ApiError(body)
    throw ApiError.fromStatus(response.status, response.statusText)
  }

  if (response.status === 204 || response.status === 202) {
    const body = await readBody(response)
    return (body ?? undefined) as T
  }
  const contentType = response.headers.get('Content-Type') ?? ''
  if (contentType.includes('application/pdf') || contentType.includes('octet-stream')) {
    return (await response.blob()) as T
  }
  return (await readBody(response)) as T
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export type ErrorType<E> = ApiError & { problemBody?: E }
export type BodyType<B> = B
