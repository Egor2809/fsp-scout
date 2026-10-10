import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { IconArrowLeft, IconCheck } from '@tabler/icons-react'
import { Logo } from '@/components/brand'
import { ThemeToggle } from '@/components/layout/AppShell'
import { Tag } from '@/components/tags'
import { Button } from '@/components/ui/button'
import { FONT_PAIRS, useFontPair, type FontPair } from '@/lib/fontPair'
import { cn } from '@/lib/utils'

const ROWS = [
  ['Северный код', 'Финтех', '250–320', 87, 18],
  ['Волга Ритейл', 'Ритейл', '220–280', 74, 9],
  ['Связь Урал', 'Телеком', '260–300', 81, 12],
  ['ГосТех Урал', 'Госсектор', '180–240', 63, 4],
] as const

function Fragment({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <figure className={cn('grid content-start gap-2', className)}>
      <figcaption className="eyebrow">{label}</figcaption>
      {children}
    </figure>
  )
}

function Specimen({ pair, active, onApply }: { pair: FontPair; active: boolean; onApply: () => void }) {
  return (
    <section data-font={pair.id} aria-labelledby={`pair-${pair.id}`} className="grid gap-5 border-t pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid max-w-2xl gap-1">
          <p className="eyebrow">
            Заголовки: {pair.display} · текст: {pair.text}
          </p>
          <h2 id={`pair-${pair.id}`} className="display text-[2rem]">
            {pair.name}
          </h2>
          <p className="text-sm text-muted-foreground">{pair.note}</p>
        </div>
        <Button variant={active ? 'secondary' : 'default'} onClick={onApply} disabled={active}>
          {active ? (
            <>
              <IconCheck data-icon="inline-start" /> Сейчас на сайте
            </>
          ) : (
            'Применить ко всему сайту'
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Fragment label="Шапка кабинета">
          <header className="rounded-lg border bg-surface/50 p-5">
            <p className="eyebrow mb-2">Кабинет работодателя</p>
            <h3 className="display text-[2rem]">Здравствуйте, Ирина</h3>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">Опишите, кого ищете. Мы подберём кандидатов с подтверждённым грейдом и объясним выбор.</p>
            <dl className="mt-4 grid grid-cols-3 gap-3 border-t pt-4">
              {[
                ['Осталось инвайтов', '18'],
                ['Приняли', '42'],
                ['Конверсия', '38%'],
              ].map(([k, v]) => (
                <div key={k} className="grid gap-1">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="num text-xl font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </header>
        </Fragment>

        <Fragment label="Карточка кандидата">
          <article className="lift grid gap-3 rounded-lg border bg-card p-5">
            <div className="flex items-start gap-3">
              <span className="num pt-0.5 text-[1.625rem] leading-none font-bold text-muted-foreground/80">01</span>
              <div className="grid min-w-0 flex-1 gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">Кандидат #3F2A</span>
                  <span className="inline-flex h-6 items-center rounded-md bg-foreground px-2 font-heading text-xs font-semibold text-background">Backend · Middle</span>
                </div>
                <p className="font-heading text-[1.25rem] leading-tight font-semibold">Go, PostgreSQL, Kafka</p>
                <p className="text-sm text-muted-foreground">3 года в финтехе · гибрид, Москва · готов к переезду</p>
              </div>
              <div className="grid justify-items-end">
                <span className="num text-[1.75rem] leading-none font-bold">87</span>
                <span className="eyebrow">перцентиль</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Tag tone="success">Go · подтверждён</Tag>
              <Tag tone="success">PostgreSQL · подтверждён</Tag>
              <Tag>Kafka</Tag>
              <Tag>Kubernetes</Tag>
            </div>
            <p className="num text-sm font-semibold">280–320 тыс. ₽</p>
          </article>
        </Fragment>

        <Fragment label="Табло результата">
          <div className="canvas-board overflow-hidden rounded-lg px-5 pt-6 pb-7">
            <div className="relative grid gap-5">
              <p className="eyebrow text-white/85">Тест · Backend · заявлено Middle</p>
              <p className="display-xl text-[3.25rem] text-white">Backend · Middle</p>
              <div className="flex items-end gap-4 border-t border-white/30 pt-4">
                <span className="num text-[4.5rem] leading-[0.8] font-bold tracking-tighter">87</span>
                <span className="grid gap-1 pb-1 text-sm text-white/85">
                  <span className="eyebrow text-white">перцентиль</span>
                  среди кандидатов категории
                </span>
              </div>
            </div>
          </div>
        </Fragment>

        <Fragment label="Абзац текста">
          <div className="grid max-w-[62ch] gap-3">
            <h3 className="text-[1.375rem] leading-tight">Как работает тест</h3>
            <p>
              Адаптивный тест по модели IRT (2PL): каждое следующее задание подбирается под текущую оценку уровня, поэтому 12–20 заданий дают точность длинного экзамена. После каждого ответа
              пересчитываем оценку θ и её погрешность.
            </p>
            <p className="text-sm text-muted-foreground">
              Подтверждённый грейд меняется не чаще раза в 90 дней. Не прошли: можно сразу один раз попробовать грейд ниже.
            </p>
          </div>
        </Fragment>

        <Fragment label="Таблица с цифрами" className="lg:col-span-2">
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[34rem] text-sm">
              <thead className="bg-surface/60 text-left">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Компания</th>
                  <th className="px-4 py-2.5 font-medium">Отрасль</th>
                  <th className="px-4 py-2.5 text-right font-medium">Вилка, тыс. ₽</th>
                  <th className="px-4 py-2.5 text-right font-medium">Перцентиль</th>
                  <th className="px-4 py-2.5 text-right font-medium">Инвайтов</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ROWS.map(([name, industry, salary, p, inv]) => (
                  <tr key={name}>
                    <td className="px-4 py-2.5 font-medium">{name}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{industry}</td>
                    <td className="num px-4 py-2.5 text-right">{salary}</td>
                    <td className="num px-4 py-2.5 text-right">{p}</td>
                    <td className="num px-4 py-2.5 text-right">{inv}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Fragment>
      </div>
    </section>
  )
}

export default function Fonts() {
  const [pair, setPair] = useFontPair()
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <Link to="/" className="no-underline" aria-label="Скаут, на главную">
            <Logo />
          </Link>
          <div role="radiogroup" aria-label="Пара шрифтов" className="order-last flex w-full gap-1 overflow-x-auto scrollbar-none sm:order-none sm:ml-auto sm:w-auto">
            {FONT_PAIRS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={pair === p.id}
                onClick={() => setPair(p.id)}
                className={cn(
                  'h-8 shrink-0 rounded-md px-3 text-sm whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                  pair === p.id ? 'bg-foreground text-background' : 'text-foreground/80 hover:bg-muted',
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
          <div className="ml-auto sm:ml-0">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6">
        <div className="grid max-w-2xl gap-2">
          <Link to="/" className="inline-flex items-center gap-1 text-sm">
            <IconArrowLeft className="size-4" aria-hidden /> На главную
          </Link>
          <p className="eyebrow">Типографика</p>
          <h1 className="display-xl text-[2.5rem] sm:text-[3.25rem]">Шрифты Скаута</h1>
          <p className="text-muted-foreground">
            Пять пар на фрагментах интерфейса. Выбранная пара применяется ко всему сайту и сохраняется в браузере. Цифры и код везде набраны JetBrains Mono.
          </p>
        </div>
        {FONT_PAIRS.map((p) => (
          <Specimen key={p.id} pair={p} active={pair === p.id} onApply={() => setPair(p.id)} />
        ))}
      </main>
    </div>
  )
}
