import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { IconBriefcase } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useApplyToVacancy, useListVacancies } from '@/api/generated/endpoints/vacancies/vacancies'
import type { Specialization, Vacancy } from '@/api/generated/model'
import { errorMessage } from '@/api/problem'
import { invalidatePaths } from '@/api/queryClient'
import { ExplanationChips } from '@/components/candidate'
import { SelectField } from '@/components/fields'
import { PageHeader } from '@/components/layout/AppShell'
import { EmptyState, InlineError, QueryView } from '@/components/states'
import { ApplicationStatusBadge } from '@/components/tags'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatSalaryRange } from '@/lib/format'
import { SPECIALIZATIONS, categoryLabel, specializationLabel, workFormatLabel } from '@/lib/labels'

function VacancyItem({ v }: { v: Vacancy }) {
  const apply = useApplyToVacancy()
  const qc = useQueryClient()
  return (
    <article className="grid gap-4 py-8">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm text-muted-foreground">{v.company.name}</p>
          <h2 className="text-lg font-semibold">{v.title}</h2>
        </div>
        {v.my_application && <ApplicationStatusBadge status={v.my_application.status} />}
      </header>
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span className="num font-semibold">{formatSalaryRange(v.salary)}</span>
        <span className="text-muted-foreground">
          {categoryLabel(v.specialization, v.grade)} · {workFormatLabel[v.work_format]}
          {v.city ? ` · ${v.city}` : ''}
        </span>
      </p>
      <p className="line-clamp-2 max-w-prose text-sm text-muted-foreground">{v.description}</p>
      {v.match && <ExplanationChips chips={v.match.chips} />}
      {!v.my_application && (
        <Button
          className="justify-self-start"
          disabled={apply.isPending}
          onClick={() =>
            apply.mutate(
              { vacancyId: v.id, data: {} },
              { onSuccess: () => void invalidatePaths(qc, '/vacancies', '/me/applications').then(() => toast.success('Отклик отправлен: компания увидит ваши контакты')) },
            )
          }
        >
          Откликнуться
        </Button>
      )}
      <InlineError>{apply.isError ? errorMessage(apply.error) : null}</InlineError>
    </article>
  )
}

export default function Vacancies() {
  const [spec, setSpec] = useState<Specialization | null>(null)
  const [q, setQ] = useState('')
  const query = useListVacancies({ specialization: spec ?? undefined, q: q.trim() || undefined })
  return (
    <>
      <PageHeader title="Открытые вакансии" />
      <div className="mb-6 flex flex-wrap gap-2">
        <Input aria-label="Поиск" placeholder="Поиск по названию" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <div className="w-52">
          <SelectField ariaLabel="Специализация" value={spec} onChange={setSpec} placeholder="Все специализации" options={SPECIALIZATIONS.map((s) => ({ value: s, label: specializationLabel[s] }))} />
        </div>
        {spec && (
          <Button variant="ghost" onClick={() => setSpec(null)}>
            Сбросить
          </Button>
        )}
      </div>
      <QueryView query={query}>
        {(page) =>
          page.items.length === 0 ? (
            <EmptyState icon={<IconBriefcase />} title="Вакансий не найдено" />
          ) : (
            <div className="grid max-w-3xl divide-y border-y">
              {page.items.map((v) => (
                <VacancyItem key={v.id} v={v} />
              ))}
            </div>
          )
        }
      </QueryView>
    </>
  )
}
