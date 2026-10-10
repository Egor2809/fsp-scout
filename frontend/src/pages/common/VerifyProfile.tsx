import { useEffect } from 'react'
import { useParams } from 'react-router'
import { useVerifyProfile } from '@/api/generated/endpoints/service/service'
import { ApiError } from '@/api/problem'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/format'

export default function VerifyProfile() {
  useEffect(() => {
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow, noarchive'
    document.head.appendChild(robots)
    return () => robots.remove()
  }, [])
  const { token = '' } = useParams()
  const tokenValid = /^[A-Za-z0-9_-]{43}$/.test(token)
  const query = useVerifyProfile(token, {
    query: { enabled: tokenValid, retry: false, staleTime: 0, gcTime: 0, refetchOnWindowFocus: true, refetchInterval: 30000 },
    request: { anonymous: true, cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' },
  })
  const unavailable = !tokenValid || query.error instanceof ApiError && query.error.status === 404 || query.data?.valid === false
  return (
    <main className="mx-auto grid max-w-2xl gap-6 px-6 py-12">
      <h1 className="display text-3xl">Проверка профиля Скаут</h1>
      {query.isFetching ? <p role="status">Проверяем актуальность результатов…</p>
        : unavailable ? <p role="status">Ссылка недействительна, отозвана или срок её действия истёк.</p>
        : query.isError ? <div className="grid justify-items-start gap-4">
          <p role="alert">Не удалось проверить профиль. Повторите попытку позже.</p>
          <Button onClick={() => void query.refetch()}>Повторить проверку</Button>
        </div>
        : query.data ? <section className="grid gap-5 rounded-xl border p-6">
          <p className="text-success" role="status">Результаты актуальны</p>
          <h2 className="text-2xl font-semibold">{query.data.full_name}</h2>
          <dl className="grid gap-4">
            <div><dt className="text-muted-foreground">Категория</dt><dd>{query.data.category?.label ?? '—'}</dd></div>
            <div><dt className="text-muted-foreground">Процентиль в категории</dt><dd>{query.data.percentile ?? '—'}</dd></div>
            <div><dt className="text-muted-foreground">Подтверждено</dt><dd>{formatDateTime(query.data.confirmed_at)}</dd></div>
            <div><dt className="text-muted-foreground">Подтверждённых достижений ФСП</dt><dd>{query.data.fsp_achievements_count}</dd></div>
            <div><dt className="text-muted-foreground">PDF выдан</dt><dd>{formatDateTime(query.data.issued_at)}</dd></div>
          </dl>
          <p className="text-sm text-muted-foreground">Проверка относится к подтверждённым результатам. Контакты и описание опыта из PDF здесь не подтверждаются.</p>
        </section> : <p role="status">Загружаем проверку…</p>}
    </main>
  )
}
