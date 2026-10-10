import { useState } from 'react'
import { Link } from 'react-router'
import { apiFetch } from '@/api/http'
import type { EvalRankRequest, EvalRankResponse } from '@/api/generated/model'
import { errorMessage } from '@/api/problem'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { config } from '@/config'
import { evaluationMetrics } from '@/lib/evaluationMetrics'

export default function Evaluate() {
  const [need, setNeed] = useState('Backend Middle: Go и PostgreSQL обязательно, желательно Kafka. Удалённо, 250–320 тысяч рублей.')
  const [candidates, setCandidates] = useState(JSON.stringify([
    { id: 'backend', text: 'Backend Middle, Go, PostgreSQL, Kafka, удалённо, 250–300 тысяч рублей' },
    { id: 'frontend', text: 'Frontend Junior, React, CSS, удалённо' },
  ], null, 2))
  const [result, setResult] = useState<EvalRankResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [labels, setLabels] = useState('')
  const [metrics, setMetrics] = useState<ReturnType<typeof evaluationMetrics> | null>(null)

  async function evaluate() {
    setError(null)
    setResult(null)
    setMetrics(null)
    setBusy(true)
    try {
      const parsed: unknown = JSON.parse(candidates)
      if (!need.trim() || !Array.isArray(parsed) || parsed.length < 1 || parsed.length > 2000 ||
        parsed.some(c => !c || typeof c.id !== 'string' || !c.id.trim() || typeof c.text !== 'string' || !c.text.trim())) {
        throw new Error('Укажите потребность и от 1 до 2000 резюме с непустыми строками id и text.')
      }
      if (new Set(parsed.map(c => c.id)).size !== parsed.length) throw new Error('ID кандидатов должны быть уникальными.')
      const judgments: unknown = labels.trim() ? JSON.parse(labels) : null
      const ids: string[] = parsed.map(c => c.id)
      if (labels.trim()) evaluationMetrics([], ids, judgments)
      const body: EvalRankRequest = { top_k: 10, vacancies: [{ id: 'need', text: need }], candidates: parsed }
      const ranked = await apiFetch<EvalRankResponse>('/eval/rank', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (judgments !== null) setMetrics(evaluationMetrics(ranked.results[0].ranking.map(c => c.candidate_id), ids, judgments))
      setResult(ranked)
    } catch (cause) {
      setError(cause instanceof SyntaxError ? 'Некорректный JSON резюме или разметки.' : cause instanceof Error ? cause.message : errorMessage(cause))
    } finally {
      setBusy(false)
    }
  }

  return <main className="mx-auto grid max-w-4xl gap-6 px-4 py-8">
    <Link to="/e">← Кабинет работодателя</Link>
    <h1 className="text-3xl">Проверка подбора</h1>
    <p className="text-muted-foreground">Введите потребность и собственные резюме. Внешние резюме оцениваются по требованиям и BM25; подтверждённые результаты тестов и достижения ФСП им не приписываются.</p>
    {config.apiMock && <p role="status">Для проверки нужен реальный API и вход работодателя через OIDC. Мок-режим не измеряет качество поиска.</p>}
    <form className="grid gap-4" onSubmit={e => { e.preventDefault(); void evaluate() }}>
      <label className="grid gap-2">Потребность<Textarea value={need} disabled={busy} onChange={e => setNeed(e.target.value)} required /></label>
      <label className="grid gap-2">Резюме: JSON-массив объектов id и text<Textarea className="min-h-56 font-mono" value={candidates} disabled={busy} onChange={e => setCandidates(e.target.value)} required /></label>
      <label className="grid gap-2">Независимая разметка (необязательно): JSON-объект id: оценка от 0 до 4<Textarea className="font-mono" placeholder={'{"backend": 4, "frontend": 0}'} value={labels} disabled={busy} onChange={e => setLabels(e.target.value)} /></label>
      <p className="text-sm text-muted-foreground">Для метрик разметьте все резюме до запуска поиска. 0 — нерелевантно, 4 — полностью соответствует. Без разметки метрики не рассчитываются.</p>
      <Button type="submit" disabled={busy || config.apiMock}>{busy ? 'Ранжирование…' : 'Ранжировать'}</Button>
    </form>
    {error && <p role="alert" className="text-destructive">{error}</p>}
    {metrics && <section aria-label="Метрики" className="rounded-lg border p-4">
      <h2 className="text-xl">Метрики на вашей разметке</h2>
      <p>nDCG@10: {metrics.ndcg.toFixed(3)} · Recall@10: {metrics.recall.toFixed(3)} · RR@10: {metrics.reciprocalRank.toFixed(3)}</p>
      <p className="text-sm text-muted-foreground">Релевантных резюме: {metrics.relevantCount}. RR относится к одному запросу; MRR требует усреднения нескольких запросов. Результат зависит от независимости и полноты разметки.</p>
    </section>}
    {result?.results.map(v => <section key={v.vacancy_id} className="grid gap-4" aria-live="polite">
      <h2 className="text-xl">Результаты · топ-10</h2>
      <ol className="grid gap-4">
        {v.ranking.map((c, i) => <li key={c.candidate_id} className="rounded-lg border p-4">
          <h3 className="font-semibold">{i + 1}. {c.candidate_id} · {c.score} / 100</h3>
          <ul className="mt-3 grid gap-2 text-sm">{c.factors.map((f, j) => <li key={j}>{f.label}: {f.contribution > 0 ? '+' : ''}{f.contribution}<p className="text-muted-foreground">{f.evidence}</p></li>)}</ul>
        </li>)}
      </ol>
    </section>)}
  </main>
}
