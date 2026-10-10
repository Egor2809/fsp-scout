import { Link } from 'react-router'
import { useGetMyGradeHistory, useListMyTests } from '@/api/generated/endpoints/assessment/assessment'
import { Section } from '@/components/candidate'
import { PageHeader } from '@/components/layout/AppShell'
import { GradePicker } from '@/components/onboarding'
import { QueryView } from '@/components/states'
import { Tag } from '@/components/tags'
import { formatDate, formatPercentile } from '@/lib/format'
import { categoryLabel, gradeLabel, testOutcomeLabel } from '@/lib/labels'

const REASON = { test_passed: 'тест пройден', test_lower: 'подтверждён грейд ниже', admin: 'корректировка' } as const

export default function History() {
  const tests = useListMyTests()
  const grades = useGetMyGradeHistory()
  return (
    <>
      <PageHeader title="История тестов" />
      <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr]">
        <div className="grid content-start gap-12">
          <Section title="Попытки">
            <QueryView query={tests}>
              {(list) =>
                list.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Тестов пока не было.</p>
                ) : (
                  <ul className="grid divide-y border-y">
                    {list.map((t) => (
                      <li key={t.id} className="flex flex-wrap items-center gap-2 py-3.5 text-sm">
                        <span className="font-medium">{categoryLabel(t.specialization, t.declared_grade)}</span>
                        {t.express && <Tag tone="warning">Экспресс · демо</Tag>}
                        <span className="text-muted-foreground">{formatDate(t.finished_at ?? t.started_at)}</span>
                        {t.outcome && <Tag tone={t.outcome === 'failed' ? 'warning' : 'success'}>{testOutcomeLabel[t.outcome]}</Tag>}
                        {t.status === 'in_progress' && <Tag tone="primary">идёт</Tag>}
                        <span className="num ml-auto">{t.percentile !== null ? formatPercentile(t.percentile) : ''}</span>
                        {t.status === 'finished' ? <Link to={`/c/results/${t.id}`}>Результат</Link> : t.status === 'in_progress' ? <Link to={`/c/test/${t.id}`}>Продолжить</Link> : null}
                      </li>
                    ))}
                  </ul>
                )
              }
            </QueryView>
          </Section>
          <Section title="Новый тест">
            <GradePicker />
          </Section>
        </div>
        <Section title="Смена грейда">
          <QueryView query={grades}>
            {(list) =>
              list.length === 0 ? (
                <p className="text-sm text-muted-foreground">Грейд ещё не подтверждён.</p>
              ) : (
                <ol className="grid gap-3">
                  {list.map((g) => (
                    <li key={g.id} className="grid gap-0.5 border-l-2 border-primary/30 pl-3 text-sm">
                      <span className="font-medium">
                        {g.previous_grade ? `${gradeLabel[g.previous_grade]} → ` : ''}
                        {gradeLabel[g.grade]}
                      </span>
                      <span className="text-muted-foreground">
                        {formatDate(g.changed_at)} · {REASON[g.reason]}
                      </span>
                    </li>
                  ))}
                </ol>
              )
            }
          </QueryView>
        </Section>
      </div>
    </>
  )
}
