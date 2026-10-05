import { useMemo, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Section } from '@/components/candidate'
import { PageHeader } from '@/components/layout/AppShell'
import { fisherInformation, p2pl } from '@/lib/irt'
import { GRADE_CHANGE_COOLDOWN_DAYS, RETAKE_COOLDOWN_DAYS } from '@/lib/retake'

const ITEMS = [
  { key: 'easy', name: 'Лёгкое (b = −1)', a: 1.4, b: -1, color: 'var(--muted-foreground)' },
  { key: 'mid', name: 'Среднее (b = 0)', a: 1.4, b: 0, color: 'var(--primary)' },
  { key: 'hard', name: 'Сложное (b = 1.2)', a: 1.4, b: 1.2, color: 'var(--foreground)' },
]

export default function HowItWorks() {
  const [theta, setTheta] = useState(0.4)
  const data = useMemo(
    () =>
      Array.from({ length: 61 }, (_, i) => {
        const t = -3 + i * 0.1
        const row: Record<string, number> = { theta: Number(t.toFixed(1)) }
        for (const it of ITEMS) row[it.key] = p2pl(t, it.a, it.b)
        row.info = ITEMS.reduce((s, it) => s + fisherInformation(t, it.a, it.b), 0)
        return row
      }),
    [],
  )
  const best = ITEMS.reduce((acc, it) => (fisherInformation(theta, it.a, it.b) > fisherInformation(theta, acc.a, acc.b) ? it : acc), ITEMS[0]!)
  return (
    <div className="grid gap-5">
      <PageHeader motif eyebrow="Методика" title="Как работает тест" description="Адаптивный тест по модели IRT (2PL): каждое следующее задание подбирается под текущую оценку уровня, поэтому 12–20 заданий дают точность длинного экзамена." />
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Section title="Вероятность верного ответа">
          <div className="h-72" role="img" aria-label="Кривые вероятности верного ответа для трёх заданий разной сложности">
            <ResponsiveContainer>
              <LineChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="theta" type="number" domain={[-3, 3]} ticks={[-3, -2, -1, 0, 1, 2, 3]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip formatter={(v) => `${Math.round(Number(v) * 100)}%`} labelFormatter={(l) => `θ = ${l}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {ITEMS.map((it) => (
                  <Line key={it.key} dataKey={it.key} name={it.name} stroke={it.color} strokeWidth={2} dot={false} isAnimationActive={false} />
                ))}
                <ReferenceLine x={Number(theta.toFixed(1))} stroke="var(--brand-accent)" strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid gap-2">
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Текущая оценка уровня кандидата</span>
              <input type="range" min={-3} max={3} step={0.1} value={theta} onChange={(e) => setTheta(Number(e.target.value))} className="accent-primary" aria-label="Оценка θ" />
            </label>
            <p className="text-sm">
              При текущей оценке <b className="num">θ = {theta.toFixed(1)}</b> больше всего информации даст <b>{best.name.toLowerCase()}</b> задание — его тест и выберет следующим.
            </p>
          </div>
        </Section>
        <div className="grid content-start gap-5">
          <Section title="Шаги">
            <ol className="grid list-decimal gap-2 pl-5 text-sm">
              <li>Старт с задания уровня заявленного грейда.</li>
              <li>После каждого ответа пересчитываем оценку θ и её погрешность.</li>
              <li>Следующее задание — с максимумом информации в точке θ, по разным компетенциям.</li>
              <li>Останавливаемся, когда погрешность достаточно мала (или по лимиту заданий).</li>
              <li>Практическая задача проверяет код на скрытых тестах.</li>
              <li>Итог: грейд, перцентиль в категории и подтверждённые навыки.</li>
            </ol>
          </Section>
          <Section title="Правила">
            <ul className="grid gap-2 text-sm">
              <li>Подтверждённый грейд меняется не чаще раза в {GRADE_CHANGE_COOLDOWN_DAYS} дней.</li>
              <li>Повтор того же грейда — через {RETAKE_COOLDOWN_DAYS} дней.</li>
              <li>Не прошли — можно сразу попробовать грейд ниже (один раз).</li>
              <li>Вставки текста и переключения вкладок учитываются как сигнал, но не блокируют тест.</li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  )
}
