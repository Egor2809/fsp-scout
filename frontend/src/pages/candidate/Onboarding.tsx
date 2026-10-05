import { Navigate } from 'react-router'
import { IconCheck } from '@tabler/icons-react'
import { useGetMe } from '@/api/generated/endpoints/me/me'
import type { OnboardingStep } from '@/api/generated/model'
import { PageHeader } from '@/components/layout/AppShell'
import { ConsentsForm, GradePicker, SurveyForm } from '@/components/onboarding'
import { QueryView } from '@/components/states'
import { cn } from '@/lib/utils'

const STEPS: { key: OnboardingStep; label: string }[] = [
  { key: 'consents', label: 'Согласия' },
  { key: 'survey', label: 'Опрос' },
  { key: 'grade', label: 'Грейд' },
  { key: 'test', label: 'Тест' },
]

const TITLES: Partial<Record<OnboardingStep, { title: string; description: string }>> = {
  consents: { title: 'Согласия', description: 'Три отдельных согласия — каждое можно отозвать в настройках. Без первых двух профиль не попадёт в подбор.' },
  survey: { title: 'Расскажите о себе', description: 'Пять вопросов вместо резюме. По ответам мы подберём тест и покажем вас нужным компаниям.' },
  grade: { title: 'Выберите грейд для теста', description: 'Тест подтвердит грейд. Если не получится — предложим попробовать уровнем ниже.' },
  test: { title: 'Тест', description: 'Продолжите начатый тест.' },
}

export default function Onboarding() {
  const me = useGetMe()
  return (
    <QueryView query={me}>
      {(user) => {
        const step = user.onboarding?.next_step ?? 'done'
        if (step === 'done') return <Navigate to="/c" replace />
        if (step === 'test' && user.onboarding?.active_test_id) return <Navigate to={`/c/test/${user.onboarding.active_test_id}`} replace />
        const idx = STEPS.findIndex((s) => s.key === step)
        const t = TITLES[step]!
        return (
          <div className="mx-auto max-w-3xl">
            <ol className="mb-6 flex flex-wrap gap-2" aria-label="Шаги">
              {STEPS.map((s, i) => (
                <li
                  key={s.key}
                  aria-current={i === idx ? 'step' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-full border px-3 py-1 text-sm',
                    i < idx && 'border-success/30 bg-success-surface text-success',
                    i === idx && 'border-primary bg-primary text-primary-foreground',
                    i > idx && 'text-muted-foreground',
                  )}
                >
                  <span className="num">{i < idx ? <IconCheck className="size-3.5" /> : i + 1}</span>
                  {s.label}
                </li>
              ))}
            </ol>
            <PageHeader eyebrow={`Шаг ${idx + 1} из ${STEPS.length}`} title={t.title} description={t.description} />
            {step === 'consents' && <ConsentsForm onDone={() => void me.refetch()} />}
            {step === 'survey' && <SurveyForm onDone={() => void me.refetch()} />}
            {(step === 'grade' || step === 'test') && <GradePicker />}
          </div>
        )
      }}
    </QueryView>
  )
}
