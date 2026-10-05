import { useState } from 'react'
import { Link } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { IconBriefcase } from '@tabler/icons-react'
import { useListMyCompanyVacancies } from '@/api/generated/endpoints/company/company'
import { useListVacancyApplications, useUpdateApplicationStatus } from '@/api/generated/endpoints/vacancies/vacancies'
import type { EmployerApplication } from '@/api/generated/model'
import { invalidatePaths } from '@/api/queryClient'
import { CandidateHeadline, ContactsBlock, ExplanationChips, Section } from '@/components/candidate'
import { PageHeader } from '@/components/layout/AppShell'
import { EmptyState, QueryView } from '@/components/states'
import { ApplicationStatusBadge, Tag } from '@/components/tags'
import { Button } from '@/components/ui/button'
import { formatDate, formatSalaryRange } from '@/lib/format'
import { categoryLabel, vacancyStatusLabel } from '@/lib/labels'
import { cn } from '@/lib/utils'

const NEXT: Partial<Record<EmployerApplication['status'], { status: 'viewed' | 'interview' | 'offer' | 'hired' | 'rejected'; label: string }[]>> = {
  submitted: [{ status: 'viewed', label: 'Просмотрено' }, { status: 'interview', label: 'Интервью' }, { status: 'rejected', label: 'Отказать' }],
  viewed: [{ status: 'interview', label: 'Интервью' }, { status: 'rejected', label: 'Отказать' }],
  interview: [{ status: 'offer', label: 'Оффер' }, { status: 'rejected', label: 'Отказать' }],
  offer: [{ status: 'hired', label: 'Нанят' }, { status: 'rejected', label: 'Отказать' }],
}

function Applications({ vacancyId }: { vacancyId: string }) {
  const query = useListVacancyApplications(vacancyId)
  const update = useUpdateApplicationStatus()
  const qc = useQueryClient()
  return (
    <QueryView query={query}>
      {(list) =>
        list.length === 0 ? (
          <p className="text-sm text-muted-foreground">Откликов пока нет.</p>
        ) : (
          <div className="grid gap-3">
            {list.map((a) => (
              <article key={a.id} className="grid gap-3 rounded-xl border p-4">
                <CandidateHeadline card={a.candidate} right={<ApplicationStatusBadge status={a.status} />} />
                <ExplanationChips chips={a.explanation.chips} />
                {a.cover_letter && <p className="text-sm whitespace-pre-line">{a.cover_letter}</p>}
                <ContactsBlock card={a.candidate} />
                <div className="flex flex-wrap items-center gap-2">
                  {(NEXT[a.status] ?? []).map((n) => (
                    <Button key={n.status} size="sm" variant={n.status === 'rejected' ? 'ghost' : 'outline'} disabled={update.isPending} onClick={() => update.mutate({ applicationId: a.id, data: { status: n.status } }, { onSuccess: () => void invalidatePaths(qc, '/vacancies', '/company') })}>
                      {n.label}
                    </Button>
                  ))}
                  <Link to={`/e/candidates/${a.candidate.id}`} className="ml-auto text-sm">
                    Карточка
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )
      }
    </QueryView>
  )
}

export default function EmployerVacancies() {
  const query = useListMyCompanyVacancies()
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <>
      <PageHeader eyebrow="Вакансии" title="Вакансии и отклики" description="Отклик раскрывает контакты кандидата сразу." />
      <QueryView query={query}>
        {(list) => {
          if (!list.length) return <EmptyState icon={<IconBriefcase />} title="Вакансий нет" />
          const current = list.find((v) => v.id === selected) ?? list[0]!
          return (
            <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
              <ul className="grid content-start gap-2">
                {list.map((v) => (
                  <li key={v.id}>
                    <button type="button" onClick={() => setSelected(v.id)} className={cn('grid w-full gap-1 rounded-xl border bg-card p-4 text-left', current.id === v.id ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/40')}>
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{v.title}</span>
                        <Tag tone={v.status === 'published' ? 'success' : 'muted'}>{vacancyStatusLabel[v.status]}</Tag>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {categoryLabel(v.specialization, v.grade)} · <span className="num">{formatSalaryRange(v.salary)}</span>
                      </span>
                      <span className="num text-xs text-muted-foreground">
                        откликов {v.applications_count ?? 0} · {v.published_at ? `с ${formatDate(v.published_at)}` : 'не опубликована'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <Section title={`Отклики · ${current.title}`}>
                <Applications key={current.id} vacancyId={current.id} />
              </Section>
            </div>
          )
        }}
      </QueryView>
    </>
  )
}
