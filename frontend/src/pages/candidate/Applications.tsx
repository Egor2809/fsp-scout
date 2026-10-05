import { useQueryClient } from '@tanstack/react-query'
import { IconSend } from '@tabler/icons-react'
import { useListMyApplications, useWithdrawApplication } from '@/api/generated/endpoints/vacancies/vacancies'
import { invalidatePaths } from '@/api/queryClient'
import { PageHeader } from '@/components/layout/AppShell'
import { EmptyState, QueryView } from '@/components/states'
import { ApplicationStatusBadge } from '@/components/tags'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import { applicationStatusLabel } from '@/lib/labels'

export default function Applications() {
  const query = useListMyApplications()
  const withdraw = useWithdrawApplication()
  const qc = useQueryClient()
  return (
    <>
      <PageHeader eyebrow="Отклики" title="Мои отклики" />
      <QueryView query={query}>
        {(list) =>
          list.length === 0 ? (
            <EmptyState icon={<IconSend />} title="Откликов пока нет" description="Найдите вакансию в разделе «Вакансии»." />
          ) : (
            <div className="grid gap-3">
              {list.map((a) => (
                <article key={a.id} className="grid gap-2 rounded-xl border bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{a.vacancy.company.name}</p>
                      <h2 className="font-semibold">{a.vacancy.title}</h2>
                    </div>
                    <ApplicationStatusBadge status={a.status} />
                  </div>
                  <ol className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {a.events.map((e, i) => (
                      <li key={i}>
                        {formatDate(e.at)} · {applicationStatusLabel[e.status]}
                        {e.note ? ` — ${e.note}` : ''}
                      </li>
                    ))}
                  </ol>
                  {(a.status === 'submitted' || a.status === 'viewed') && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-self-start"
                      disabled={withdraw.isPending}
                      onClick={() => withdraw.mutate({ applicationId: a.id }, { onSuccess: () => void invalidatePaths(qc, '/me/applications', '/vacancies') })}
                    >
                      Отозвать
                    </Button>
                  )}
                </article>
              ))}
            </div>
          )
        }
      </QueryView>
    </>
  )
}
