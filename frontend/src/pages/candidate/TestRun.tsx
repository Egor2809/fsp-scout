import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { IconClock, IconPlayerPlay, IconPlayerSkipForward } from '@tabler/icons-react'
import { useFinishTest, useGetNextTestItem, useRunTestCode, useSubmitTestAnswer } from '@/api/generated/endpoints/assessment/assessment'
import type { Answer, CodeRunResult, TestItem, TestProgress } from '@/api/generated/model'
import { errorMessage } from '@/api/problem'
import { invalidatePaths } from '@/api/queryClient'
import { CodeEditor } from '@/components/CodeEditor'
import { FadeIn } from '@/components/motion'
import { ErrorBanner, InlineError, QueryView } from '@/components/states'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { formatCountdown } from '@/lib/format'
import { codeLanguageLabel, testBlockLabel } from '@/lib/labels'
import { cn } from '@/lib/utils'

function useCountdown(deadline: string | undefined): number | null {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])
  if (!deadline) return null
  return Math.max(0, Math.round((new Date(deadline).getTime() - now) / 1000))
}

/** Прогресс как беговая дорожка: по сегменту на задание, таймер — табло в углу. */
function ProgressBar({ progress, left }: { progress: TestProgress; left: number | null }) {
  const total = progress.adaptive_max + progress.practice_total
  const done = progress.adaptive_answered + progress.practice_answered
  const lanes = [
    ...Array.from({ length: progress.adaptive_max }, (_, i) => ({ done: i < progress.adaptive_answered, optional: i >= progress.adaptive_min, current: progress.block === 'adaptive' && i === progress.adaptive_answered })),
    ...Array.from({ length: progress.practice_total }, (_, i) => ({ done: i < progress.practice_answered, optional: false, current: progress.block === 'practice' && i === progress.practice_answered })),
  ]
  return (
    <div className="sticky top-14 z-10 -mx-4 mb-10 grid gap-3 border-b bg-background/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
      <div className="flex items-end justify-between gap-3">
        <div className="grid min-w-0 gap-0.5">
          <span className="eyebrow">{testBlockLabel[progress.block]}</span>
          <span className="num text-sm">
            <b className="text-base">{String(progress.answered + 1).padStart(2, '0')}</b>
          </span>
        </div>
        {left !== null && (
          <span
            className={cn('num inline-flex items-center gap-1.5 rounded-md bg-foreground px-2.5 py-1 text-xl leading-none font-bold text-background', left < 120 && 'bg-destructive text-white dark:text-background')}
            role="timer"
            aria-label="Осталось времени"
          >
            <IconClock className="size-4" aria-hidden />
            {formatCountdown(left)}
          </span>
        )}
      </div>
      <div
        role="progressbar"
        aria-label="Прогресс теста"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        className="flex h-2 gap-[3px]"
      >
        {lanes.map((l, i) => (
          <span
            key={i}
            className={cn(
              'relative min-w-0 flex-1 overflow-hidden rounded-[1px] transition-[background-color,box-shadow] duration-300 ease-out',
              l.current ? 'bg-primary/20 ring-1 ring-primary ring-inset dark:ring-link' : l.optional ? 'bg-border/50' : 'bg-border',
            )}
          >
            {/* Заливка сегмента: scaleX 0 → 1, без перерасчёта раскладки */}
            <span
              aria-hidden
              className={cn('absolute inset-0 origin-left bg-primary transition-transform duration-300 ease-out dark:bg-link', l.done ? 'scale-x-100' : 'scale-x-0')}
            />
          </span>
        ))}
      </div>
    </div>
  )
}

function ItemView({ testId, item, onAnswered }: { testId: string; item: TestItem; onAnswered: () => void }) {
  const [options, setOptions] = useState<string[]>([])
  const [text, setText] = useState('')
  const [code, setCode] = useState(item.starter_code ?? '')
  const [run, setRun] = useState<CodeRunResult | null>(null)
  const started = useRef(0)
  const paste = useRef(0)
  const focusLost = useRef(0)
  const submit = useSubmitTestAnswer()
  const runCode = useRunTestCode()

  useEffect(() => {
    started.current = Date.now()
    const onBlur = () => (focusLost.current += 1)
    const onVis = () => document.hidden && (focusLost.current += 1)
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  const isCode = item.type === 'code'
  const answer: Answer =
    item.type === 'single_choice' || item.type === 'multiple_choice'
      ? { option_ids: options }
      : isCode
        ? { code, language: item.answer_language ?? 'text' }
        : { text }
  const empty = item.type.endsWith('choice') ? options.length === 0 : isCode ? code.trim() === '' || code === item.starter_code : text.trim() === ''

  const send = (a: Answer) =>
    submit.mutate(
      { testId, data: { instance_id: item.instance_id, answer: a, rt_ms: Date.now() - started.current, paste_count: paste.current, focus_lost_count: focusLost.current } },
      { onSuccess: onAnswered },
    )

  return (
    <FadeIn y={8}>
    <article className="grid gap-8" aria-labelledby="item-title" onPaste={() => (paste.current += 1)}>
      <header className="grid gap-2">
        <p className="text-sm text-muted-foreground">{item.competency.name}</p>
        <h1 id="item-title" className="text-[1.375rem] leading-tight">
          {item.title}
        </h1>
        <p className="whitespace-pre-line text-pretty">{item.prompt}</p>
      </header>
      {item.code && (
        <pre className="overflow-x-auto rounded-lg border bg-surface p-4 font-mono text-sm" aria-label={`Код, ${codeLanguageLabel[item.code.language]}`}>
          <code>{item.code.source}</code>
        </pre>
      )}

      {item.type === 'single_choice' && item.options && (
        <RadioGroup value={options[0] ?? ''} onValueChange={(v) => setOptions([v])} className="grid gap-2" aria-label="Варианты ответа">
          {item.options.map((o) => (
            <label key={o.id} htmlFor={`o-${o.id}`} className={cn('flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors duration-150 hover:border-primary/40', options[0] === o.id && 'border-primary bg-primary/5')}>
              <RadioGroupItem id={`o-${o.id}`} value={o.id} className="mt-0.5" />
              <span className="whitespace-pre-line">{o.text}</span>
            </label>
          ))}
        </RadioGroup>
      )}
      {item.type === 'multiple_choice' && item.options && (
        <div className="grid gap-2" role="group" aria-label="Несколько вариантов">
          <p className="text-sm text-muted-foreground">Несколько вариантов</p>
          {item.options.map((o) => {
            const on = options.includes(o.id)
            return (
              <label key={o.id} htmlFor={`o-${o.id}`} className={cn('flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors duration-150 hover:border-primary/40', on && 'border-primary bg-primary/5')}>
                <Checkbox id={`o-${o.id}`} checked={on} onCheckedChange={(v) => setOptions((s) => (v === true ? [...s, o.id] : s.filter((x) => x !== o.id)))} className="mt-0.5" />
                <span className="whitespace-pre-line">{o.text}</span>
              </label>
            )
          })}
        </div>
      )}
      {item.type === 'short_answer' && <Input aria-label="Ответ" className="num max-w-md" value={text} onChange={(e) => setText(e.target.value)} autoFocus />}
      {item.type === 'open_text' && (
        <div className="grid gap-1">
          <Textarea aria-label="Ответ" rows={8} value={text} maxLength={item.max_length ?? undefined} onChange={(e) => setText(e.target.value)} />
          {item.max_length && (
            <span className="num justify-self-end text-xs text-muted-foreground">
              {text.length}/{item.max_length}
            </span>
          )}
        </div>
      )}
      {isCode && (
        <div className="grid gap-3">
          <CodeEditor key={item.instance_id} ariaLabel="Решение" initial={item.starter_code ?? ''} language={item.answer_language} onChange={setCode} />
          {item.public_tests && item.public_tests.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={runCode.isPending}
                onClick={() => runCode.mutate({ testId, data: { instance_id: item.instance_id, code, language: item.answer_language ?? 'text' } }, { onSuccess: setRun })}
              >
                <IconPlayerPlay data-icon="inline-start" /> Запустить открытые тесты
              </Button>
              {run && (
                <span className={cn('num text-sm', run.passed === run.total ? 'text-success' : 'text-muted-foreground')}>
                  {run.status === 'ok' ? `${run.passed}/${run.total} пройдено · ${run.duration_ms} мс` : run.status}
                </span>
              )}
            </div>
          )}
          {run && run.cases.some((c) => !c.passed) && (
            <ul className="grid gap-1 font-mono text-xs">
              {run.cases
                .filter((c) => !c.passed)
                .map((c) => (
                  <li key={c.name} className="rounded border border-destructive/30 bg-destructive-surface p-2">
                    {c.name}: {c.stderr ?? `получено ${c.actual ?? '—'}`}
                  </li>
                ))}
            </ul>
          )}
          <InlineError>{runCode.isError ? errorMessage(runCode.error) : null}</InlineError>
        </div>
      )}

      {submit.isError && <ErrorBanner error={submit.error} title="Ответ не сохранился" />}
      <div className="flex flex-wrap gap-2">
        <Button disabled={empty || submit.isPending} onClick={() => send(answer)}>
          Ответить
        </Button>
        <Button variant="ghost" disabled={submit.isPending} onClick={() => send({ skipped: true })}>
          <IconPlayerSkipForward data-icon="inline-start" /> Не знаю, дальше
        </Button>
      </div>
    </article>
    </FadeIn>
  )
}

export default function TestRun() {
  const { testId = '' } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const next = useGetNextTestItem(testId, { query: { staleTime: 0, refetchOnWindowFocus: false } })
  const finish = useFinishTest()
  const left = useCountdown(next.data?.deadline_at)
  const doFinish = () =>
    finish.mutate(
      { testId },
      {
        onSuccess: () => {
          void invalidatePaths(qc, '/me', '/tests')
          navigate(`/c/results/${testId}`, { replace: true })
        },
      },
    )
  const expired = left === 0
  const autoFinished = useRef(false)
  useEffect(() => {
    if (expired && !autoFinished.current) {
      autoFinished.current = true
      doFinish()
    }
  })

  return (
    <div className="mx-auto max-w-3xl">
      <QueryView query={next} errorTitle="Не удалось загрузить задание">
        {(step) => (
          <>
            <ProgressBar progress={step.progress} left={left} />
            {step.status === 'item' && step.item ? (
              <ItemView key={step.item.instance_id} testId={testId} item={step.item} onAnswered={() => void next.refetch()} />
            ) : (
              <div className="grid justify-items-start gap-6 py-6">
                <h1 className="display text-[1.75rem]">Все задания пройдены</h1>
                {finish.isError && <ErrorBanner error={finish.error} />}
                <Button onClick={doFinish} disabled={finish.isPending}>
                  Завершить и посмотреть результат
                </Button>
              </div>
            )}
          </>
        )}
      </QueryView>
    </div>
  )
}
