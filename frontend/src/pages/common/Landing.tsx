import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { IconArrowRight, IconBuilding, IconUser, IconUserPlus } from '@tabler/icons-react'
import { homeFor, useAuth } from '@/auth/context'
import { DEMO_PERSONAS, OIDC_DEMO_ACCOUNTS, OIDC_DEMO_PASSWORD, OIDC_JURY_ACCOUNTS } from '@/auth/personas'
import { ConnectLines, Logo } from '@/components/brand'
import { FormField } from '@/components/fields'
import { ThemeToggle } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Landing() {
  const { session, provider } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  if (session) return <Navigate to={homeFor(session)} replace />

  const go = async (p: Promise<unknown>) => {
    try {
      await p
      const s = provider.getSession()
      if (s) navigate(s.role === 'candidate' && !DEMO_PERSONAS.some((d) => d.userId === s.userId) ? '/c/onboarding' : homeFor(s))
    } catch {
      setError('Не удалось войти. Попробуйте ещё раз.')
    }
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
        <Logo />
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-16">
        <section className="canvas-board overflow-hidden rounded-lg p-6 sm:p-10">
          <ConnectLines className="text-white opacity-[0.2] dark:opacity-[0.2]" />
          <div className="relative">
            <p className="eyebrow mb-4 text-white/85">Обратный найм в ИТ</p>
            <h1 className="display-xl text-[2.5rem] sm:text-[4rem]">
              Компании приходят <span className="underline decoration-brand-accent decoration-[0.12em] underline-offset-[0.12em]">к вам</span>
            </h1>
            <p className="mt-5 max-w-lg text-white/85 text-pretty">
              Пройдите адаптивный тест один раз и получайте инвайты с вилкой от работодателей. Профиль анонимен, контакты открываются только после вашего согласия.
              Победы на соревнованиях ФСП усиливают карточку.
            </p>
            <ul className="mt-6 grid gap-2 text-sm text-white">
              <li>· Категория «Backend · Middle» и перцентиль вместо резюме</li>
              <li>· Вилка в каждом инвайте обязательна</li>
              <li>· Работодатель видит, почему вы в подборке</li>
            </ul>
          </div>
        </section>
        <section className="grid content-start gap-4">
          <h2 className="text-xl">Войти в демо</h2>
          {import.meta.env.VITE_API_MOCK === 'false' && import.meta.env.VITE_ASSESSMENT_EXPRESS === 'true' && <div className="grid gap-2 rounded-lg border border-primary p-4">
            <Button onClick={() => void go(provider.login({ loginHint: 'jury1-candidate@demo.ru' }))}>Экспресс-тест для жюри (5 минут)</Button>
            <p className="text-sm text-muted-foreground">После входа: согласия, опрос, выбор грейда и кнопка «Экспресс-тест для жюри». 5–6 вопросов, лимит 10 минут. Результат демонстрационный; полный тест с практикой и подтверждением категории доступен там же.</p>
          </div>}
          <Link to="/evaluate" className="text-link">Проверка подбора на своих резюме (для работодателя)</Link>
          {provider.mode === 'oidc' && (
            <>
              <p className="text-sm text-muted-foreground">
                Вход через Keycloak, email подставится сам. Пароль для всех демо-учёток: <span className="font-mono text-foreground">{OIDC_DEMO_PASSWORD}</span>
              </p>
              {OIDC_DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => void provider.login({ loginHint: a.email })}
                  className="group flex items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors outline-none hover:border-primary/50 hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-link">{a.role === 'employer' ? <IconBuilding /> : <IconUser />}</span>
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="font-medium">
                      {a.title} <span className="font-normal text-muted-foreground">· {a.email}</span>
                    </span>
                    <span className="text-sm text-muted-foreground">{a.description}</span>
                  </span>
                  <IconArrowRight className="mt-2 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
              <div className="grid gap-2 rounded-lg border bg-card p-4">
                <p className="font-medium">Отдельные учётки проверяющих</p>
                {OIDC_JURY_ACCOUNTS.map((j) => (
                  <div key={j.n} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="w-16 text-muted-foreground">Жюри {j.n}</span>
                    <Button size="sm" variant="outline" onClick={() => void provider.login({ loginHint: j.candidate })}>
                      <IconUser /> Кандидат
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void provider.login({ loginHint: j.employer })}>
                      <IconBuilding /> Работодатель
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
          {provider.mode === 'dev' && DEMO_PERSONAS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => void go(provider.login({ personaKey: p.key }))}
              className="group flex items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors outline-none hover:border-primary/50 hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-link">{p.role === 'employer' ? <IconBuilding /> : <IconUser />}</span>
              <span className="grid min-w-0 flex-1 gap-0.5">
                <span className="font-medium">
                  {p.displayName} <span className="font-normal text-muted-foreground">· {p.title}</span>
                </span>
                <span className="text-sm text-muted-foreground">{p.description}</span>
              </span>
              <IconArrowRight className="mt-2 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <form
            className="grid gap-3 rounded-lg border bg-card p-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(email)) {
                setError('Укажите имя и корректный email')
                return
              }
              void go(provider.register({ fullName: name, email }))
            }}
          >
            <p className="flex items-center gap-2 font-medium">
              <IconUserPlus className="size-5 text-link" /> Новый кандидат: путь с нуля
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Имя и фамилия" htmlFor="reg-name">
                <Input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </FormField>
              <FormField label="Email" htmlFor="reg-email" error={error}>
                <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </FormField>
            </div>
            <Button type="submit" className="justify-self-start">
              Зарегистрироваться
            </Button>
          </form>
        </section>
      </main>
    </div>
  )
}
