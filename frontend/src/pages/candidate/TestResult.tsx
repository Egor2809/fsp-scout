import { Link, useNavigate, useParams } from 'react-router'
import { IconArrowDown, IconArrowUp, IconCalendar, IconMail } from '@tabler/icons-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useGetTestResult, useStartTest } from '@/api/generated/endpoints/assessment/assessment'
import { errorMessage } from '@/api/problem'
import { Section } from '@/components/candidate'
import { PageHeader } from '@/components/layout/AppShell'
import { InlineError, QueryView } from '@/components/states'
import { CategoryTag, SkillList, Stat, Tag } from '@/components/tags'
import { Button } from '@/components/ui/button'
import { formatDate, formatPercentile } from '@/lib/format'
import { gradeLabel, specializationLabel, testOutcomeLabel } from '@/lib/labels'
import { retakeDatesAfter } from '@/lib/retake'

const CONFIDENCE = { high: 'высокая', medium: 'средняя', low: 'низкая' } as const

export default function TestResult() {
  const { testId = '' } = useParams()
  const query = useGetTestResult(testId)
  const start = useStartTest()
  const navigate = useNavigate()
  return (
    <QueryView query={query}>
      {(r) => {
        const fallback = retakeDatesAfter(new Date(r.finished_at), r.assigned_grade !== null && r.outcome !== 'failed', null)
        const nextChange = r.next_grade_change_at ?? fallback.nextGradeChangeAt?.toISOString() ?? null
        const nextRetake = r.next_retake_at ?? fallback.nextRetakeAt.toISOString()
        const s = r.suggestion
        const canStartSuggested = s.grade && (!s.available_at || new Date(s.available_at) <= new Date())
        return (
          <div className="grid gap-5">
            <PageHeader
              motif
              eyebrow={`Тест · ${specializationLabel[r.specialization]} · заявлено ${gradeLabel[r.declared_grade]}`}
              title={r.outcome === 'failed' ? 'Грейд пока не подтверждён' : 'Грейд подтверждён'}
              description={`${testOutcomeLabel[r.outcome]} · ${r.items_answered} заданий за ${Math.round(r.duration_sec / 60)} мин · точность оценки ${CONFIDENCE[r.confidence]}`}
            >
              <div className="flex flex-wrap items-end gap-6">
                {r.category && <CategoryTag category={r.category} size="lg" />}
                {r.percentile !== null && (
                  <div>
                    <p className="font-heading text-4xl font-semibold text-brand-accent sm:text-5xl">{formatPercentile(r.percentile)}</p>
                    <p className="text-sm text-muted-foreground">среди кандидатов категории</p>
                  </div>
                )}
              </div>
            </PageHeader>

            <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <div className="grid content-start gap-5">
                <Section title="Подтверждённые навыки">
                  {r.confirmed_skills.length ? <SkillList skills={r.confirmed_skills} showLevel /> : <p className="text-sm text-muted-foreground">Навыки не подтверждены в этой попытке.</p>}
                </Section>
                <Section title="По компетенциям">
                  <ul className="grid gap-2.5">
                    {r.competencies.map((c) => (
                      <li key={c.competency_id} className="grid gap-1">
                        <div className="flex justify-between gap-2 text-sm">
                          <span>{c.name}</span>
                          <span className="num text-muted-foreground">
                            {c.score}% · {c.items} зад.
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                          <div className="h-full rounded-full bg-primary" style={{ width: `${c.score}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </Section>
                {r.trace.length > 1 && (
                  <Section title="Как тест подстраивался">
                    <div className="h-48" aria-label="Оценка уровня после каждого ответа">
                      <ResponsiveContainer>
                        <LineChart data={r.trace} margin={{ left: -20, right: 8, top: 8 }}>
                          <CartesianGrid stroke="var(--border)" vertical={false} />
                          <XAxis dataKey="index" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                          <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" domain={[-3, 3]} />
                          <Tooltip formatter={(v) => Number(v).toFixed(2)} labelFormatter={(l) => `Задание ${l}`} />
                          <Line type="monotone" dataKey="theta" name="Оценка θ" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Вертикаль — оценка уровня (θ). После верных ответов задания усложняются. <Link to="/how-it-works">Как работает тест</Link>
                    </p>
                  </Section>
                )}
              </div>

              <div className="grid content-start gap-5">
                {s.action !== 'none' && (
                  <Section title={s.action === 'try_higher' ? 'Попробуйте грейд выше' : 'Попробуйте грейд ниже'}>
                    <div className="grid gap-3">
                      <p className="flex items-start gap-2 text-sm">
                        {s.action === 'try_higher' ? <IconArrowUp className="size-5 shrink-0 text-link" /> : <IconArrowDown className="size-5 shrink-0 text-link" />}
                        {s.message}
                      </p>
                      {s.available_at && <p className="text-sm text-muted-foreground">Доступно с {formatDate(s.available_at)}</p>}
                      {canStartSuggested && s.grade && (
                        <Button
                          className="justify-self-start"
                          variant={s.action === 'try_higher' ? 'default' : 'outline'}
                          disabled={start.isPending}
                          onClick={() => start.mutate({ data: { declared_grade: s.grade! } }, { onSuccess: (t) => navigate(`/c/test/${t.id}`) })}
                        >
                          Пройти тест на {gradeLabel[s.grade]}
                        </Button>
                      )}
                      <InlineError>{start.isError ? errorMessage(start.error) : null}</InlineError>
                    </div>
                  </Section>
                )}
                <Section title="Правила пересдачи">
                  <div className="grid gap-2">
                    <Stat label="Смена подтверждённого грейда" value={nextChange ? `с ${formatDate(nextChange)}` : 'в любой момент'} hint="не чаще раза в 90 дней" />
                    <Stat label="Повтор этого грейда" value={`с ${formatDate(nextRetake)}`} hint="через 30 дней" />
                  </div>
                </Section>
                {r.flags.length > 0 && (
                  <Section title="Замечания">
                    <ul className="grid gap-1.5 text-sm">
                      {r.flags.map((f) => (
                        <li key={f.code} className="flex gap-2">
                          <Tag tone={f.severity === 'warning' ? 'warning' : 'neutral'}>{f.severity === 'warning' ? 'внимание' : 'заметка'}</Tag>
                          {f.message}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button asChild>
                    <Link to="/c/invitations">
                      <IconMail data-icon="inline-start" /> К инвайтам
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/c/history">
                      <IconCalendar data-icon="inline-start" /> История тестов
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      }}
    </QueryView>
  )
}
