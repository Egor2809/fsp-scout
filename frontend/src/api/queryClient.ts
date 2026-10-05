import { QueryClient, type Query } from '@tanstack/react-query'
import { isApiError } from './problem'

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15_000,
        refetchOnWindowFocus: true,
        // 4xx не ретраим: это ответ сервера, а не сбой сети
        retry: (count, error) => !(isApiError(error) && error.status < 500) && count < 2,
      },
      mutations: { retry: false },
    },
  })
}

/** Инвалидация по префиксу пути (ключи orval начинаются с URL: ['/me/invitations', params]). */
export function invalidatePaths(client: QueryClient, ...prefixes: string[]): Promise<void> {
  return client.invalidateQueries({
    predicate: (q: Query) => {
      const key = q.queryKey[0]
      return typeof key === 'string' && prefixes.some((p) => key === p || key.startsWith(`${p}/`) || key.startsWith(`${p}?`))
    },
  })
}
