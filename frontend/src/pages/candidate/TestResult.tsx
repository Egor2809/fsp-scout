import { Link, useNavigate, useParams } from 'react-router'
import { IconArrowDown, IconArrowUp, IconMail } from '@tabler/icons-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useGetTestResult, useStartTest } from '@/api/generated/endpoints/assessment/assessment'
import { errorMessage } from '@/api/problem'
import { Section } from '@/components/candidate'
import { ConnectLines } from '@/components/brand'
import { CountUp, FadeIn } from '@/components/motion'
import { InlineError, QueryView } from '@/components/states'
import { SkillList, Stat, Tag } from '@/components/tags'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import { competencyLabel, gradeLabel, testOutcomeLabel } from '@/lib/labels'
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
        const suggested = s.action !== 'none' && s.grade && (!s.available_at || new Date(s.available_at) <= new Date()) ? s.grade : null
        return (
          <div className="grid gap-12">
            <header className="canvas-board -mx-4 -mt-10 overflow-hidden px-4 pt-10 pb-12 sm:-mx-8 sm:px-10 sm:pt-14 sm:pb-16">
              <ConnectLines variant="b" className="text-white opacity-[0.14] dark:opacity-[0.14]" />
              <div className="relative grid gap-10">
                <FadeIn className="grid gap-3" delay={r.percentile !== null ? 0.7 : 0} y={8}>
                  <p className="text-sm font-medium text-white/85">{testOutcomeLabel[r.outcome]}</p>
                  {r.express && <p className="rounded-lg border border-white/50 p-3 text-white">Экспресс-тест для жюри · демонстрационный результат. Категория профиля не изменена.</p>}
                  <h1 className="display-xl text-[clamp(2.75rem,8vw,6.5rem)] break-words text-white">{r.express ? 'Экспресс-тест' : r.category ? r.category.label : 'Без категории'}</h1>
                </FadeIn>
                <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8 border-t border-white/30 pt-8">
                  {r.percentile !== null ? (
                    <div className="flex items-end gap-4">
                      <CountUp value={r.percentile} className="num text-[clamp(4.5rem,14vw,10rem)] leading-[0.8] font-bold tracking-tighter" />
                      <span className="eyebrow pb-1 text-white">перцентиль</span>
                    </div>
                  ) : (
                    <span />
                  )}
                  {suggested ? (
                    <Button
                      variant="secondary"
                      size="lg"
                      disabled={start.isPending}
                      onClick={() => start.mutate({ data: { declared_grade: suggested } }, { onSuccess: (t) => navigate(`/c/test/${t.id}`) })}
                    >
                      {s.action === 'try_higher' ? <IconArrowUp data-icon="inline-start" /> : <IconArrowDown data-icon="inline-start" />}
                      Пройти тест на {gradeLabel[suggested]}
                    </Button>
                  ) : (
                    <Button asChild variant="secondary" size="lg">
                      <Link to="/c/invitations">
                        <IconMail data-icon="inline-start" /> К инвайтам
                      </Link>
                    </Button>
                  )}
                </div>
                <InlineError>{start.isError ? errorMessage(start.error) : null}</InlineError>
              </div>
            </header>

            <details className="group max-w-4xl" open={r.express || undefined}>
              <summary className="cursor-pointer list-none text-sm font-medium text-link [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">Подробнее о результате</span>
                <span className="hidden group-open:inline">Скрыть подробности</span>
              </summary>
              <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
                <div className="grid content-start gap-12">
                  <Section title="Подтверждённые навыки">
                    {r.confirmed_skills.length ? <SkillList skills={r.confirmed_skills} showLevel /> : <p className="text-sm text-muted-foreground">Навыки не подтверждены в этой попытке.</p>}
                  </Section>
                  <Section title="По компетенциям">
                    <ul className="grid gap-3">
                      {r.competencies.map((c) => (
                        <li key={c.competency_id} className="grid gap-1">
                          <div className="flex justify-between gap-2 text-sm">
                            <span>{competencyLabel[c.competency_id] ?? c.name}</span>
                            <span className="num text-muted-foreground">{c.score}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-[2px] bg-muted" aria-hidden>
                            <div className="h-full origin-left animate-[bar-grow_600ms_cubic-bezier(0.22,1,0.36,1)_both] bg-primary" style={{ width: `${c.score}%` }} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Section>
                  {r.trace.length > 1 && (
                    <Section title="Как тест подстраивался" actions={<Link to="/how-it-works" className="text-sm">Методика</Link>}>
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
                    </Section>
                  )}
                </div>

                <div className="grid content-start gap-10">
                  <dl className="grid grid-cols-3 gap-4">
                    {[
                      ['заданий', r.items_answered],
                      ['минут', Math.round(r.duration_sec / 60)],
                      ['точность', CONFIDENCE[r.confidence]],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="grid gap-1">
                        <dt className="eyebrow">{label}</dt>
                        <dd className="num text-xl font-semibold">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  {s.action !== 'none' && (
                    <p className="text-sm">
                      {s.message}
                      {s.available_at && !suggested ? ` Доступно с ${formatDate(s.available_at)}.` : ''}
                    </p>
                  )}
                  <Section title="Пересдача">
                    <div className="grid gap-4">
                      <Stat label="Смена грейда" value={nextChange ? `с ${formatDate(nextChange)}` : 'в любой момент'} />
                      <Stat label="Повтор этого грейда" value={`с ${formatDate(nextRetake)}`} />
                    </div>
                  </Section>
                  {r.flags.length > 0 && (
                    <Section title="Замечания">
                      <ul className="grid gap-2 text-sm">
                        {r.flags.map((f) => (
                          <li key={f.code} className="flex gap-2">
                            {f.severity === 'warning' && <Tag tone="warning">внимание</Tag>}
                            {f.message}
                          </li>
                        ))}
                      </ul>
                    </Section>
                  )}
                  <Link to="/c/history" className="text-sm">
                    История тестов
                  </Link>
                </div>
              </div>
            </details>
          </div>
        )
      }}
    </QueryView>
  )
}
