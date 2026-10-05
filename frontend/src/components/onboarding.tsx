import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { IconPlayerPlay, IconStarFilled } from '@tabler/icons-react'
import { useGetMyConsents, useUpdateMyConsents } from '@/api/generated/endpoints/me/me'
import { useCreateSurvey, useGetMyTestEligibility, useStartTest } from '@/api/generated/endpoints/assessment/assessment'
import type { ConsentType, Grade, Industry, Specialization, WorkFormat } from '@/api/generated/model'
import { errorMessage, fieldErrors } from '@/api/problem'
import { invalidatePaths } from '@/api/queryClient'
import { ChipMultiSelect, FormField, SalaryRangeField, SelectField, SkillPicker, type SalaryDraft } from '@/components/fields'
import { ErrorBanner, InlineError, QueryView } from '@/components/states'
import { Tag } from '@/components/tags'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { formatDate, validateSalaryRange } from '@/lib/format'
import { GRADES, INDUSTRIES, SPECIALIZATIONS, WORK_FORMATS, gradeExperience, gradeLabel, industryLabel, specializationLabel, workFormatLabel } from '@/lib/labels'
import { eligibilityReasonText } from '@/lib/retake'
import { cn } from '@/lib/utils'

/** Три отдельных согласия: каждое со своим текстом, обязательные отмечены. */
export function ConsentsForm({ onDone, submitLabel = 'Продолжить' }: { onDone?: () => void; submitLabel?: string }) {
  const query = useGetMyConsents()
  const qc = useQueryClient()
  const update = useUpdateMyConsents()
  const [draft, setDraft] = useState<Partial<Record<ConsentType, boolean>>>({})
  return (
    <QueryView query={query}>
      {(state) => {
        const given = (t: ConsentType) => draft[t] ?? state.consents.some((c) => c.type === t && !c.revoked_at)
        const missing = state.documents.filter((d) => d.required && !given(d.type))
        return (
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (missing.length) return
              update.mutate(
                { data: { items: state.documents.map((d) => ({ type: d.type, version: d.version, given: given(d.type) })) } },
                {
                  onSuccess: () => {
                    void invalidatePaths(qc, '/me')
                    onDone?.()
                  },
                },
              )
            }}
          >
            {state.documents.map((d) => (
              <label key={d.type} htmlFor={`consent-${d.type}`} className={cn('flex cursor-pointer gap-3 rounded-lg border bg-card p-4', given(d.type) && 'border-primary/40')}>
                <Checkbox id={`consent-${d.type}`} checked={given(d.type)} onCheckedChange={(v) => setDraft((s) => ({ ...s, [d.type]: v === true }))} className="mt-0.5" />
                <span className="grid gap-1">
                  <span className="flex flex-wrap items-center gap-2 font-medium">
                    {d.title}
                    {d.required ? <Tag tone="primary">обязательно</Tag> : <Tag>по желанию</Tag>}
                  </span>
                  <span className="text-sm text-muted-foreground">{d.summary}</span>
                </span>
              </label>
            ))}
            {missing.length > 0 && <p className="text-sm text-muted-foreground">Чтобы продолжить, отметьте обязательные согласия.</p>}
            {update.isError && <ErrorBanner error={update.error} />}
            <Button type="submit" disabled={missing.length > 0 || update.isPending} className="justify-self-start">
              {submitLabel}
            </Button>
          </form>
        )
      }}
    </QueryView>
  )
}

export function SurveyForm({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient()
  const create = useCreateSurvey()
  const [industries, setIndustries] = useState<Industry[]>([])
  const [specialization, setSpecialization] = useState<Specialization | null>(null)
  const [stack, setStack] = useState<string[]>([])
  const [years, setYears] = useState('')
  const [formats, setFormats] = useState<WorkFormat[]>([])
  const [city, setCity] = useState('')
  const [relocation, setRelocation] = useState(false)
  const [salary, setSalary] = useState<SalaryDraft>({ from: null, to: null })
  const [touched, setTouched] = useState(false)

  const exp = Number(years.replace(',', '.'))
  const errors = {
    industries: industries.length ? null : 'Выберите хотя бы одну отрасль',
    specialization: specialization ? null : 'Выберите специализацию',
    stack: stack.length ? null : 'Добавьте основной стек',
    years: years !== '' && Number.isFinite(exp) && exp >= 0 && exp <= 50 ? null : 'Стаж в годах, например 2.5',
    formats: formats.length ? null : 'Выберите формат',
    salary: validateSalaryRange(salary.from, salary.to),
  }
  const server = fieldErrors(create.error)
  const valid = Object.values(errors).every((e) => !e)
  const show = (e: string | null) => (touched ? e : null)

  return (
    <form
      className="grid gap-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        setTouched(true)
        if (!valid || !specialization) return
        create.mutate(
          {
            data: {
              industries,
              specialization,
              primary_stack: stack,
              experience_years: exp,
              work_formats: formats,
              city: city.trim() || null,
              relocation,
              salary_expectation: { from: salary.from!, to: salary.to! },
            },
          },
          {
            onSuccess: () => {
              void invalidatePaths(qc, '/me')
              onDone()
            },
          },
        )
      }}
    >
      <FormField label="Отрасли, где хотите работать" required error={show(errors.industries)}>
        <ChipMultiSelect ariaLabel="Отрасли" options={INDUSTRIES.map((v) => ({ value: v, label: industryLabel[v] }))} value={industries} onChange={setIndustries} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Специализация" htmlFor="sv-spec" required error={show(errors.specialization)}>
          <SelectField id="sv-spec" value={specialization} onChange={setSpecialization} options={SPECIALIZATIONS.map((v) => ({ value: v, label: specializationLabel[v] }))} invalid={touched && !!errors.specialization} />
        </FormField>
        <FormField label="Коммерческий стаж, лет" htmlFor="sv-years" required error={show(errors.years) ?? server['/experience_years']}>
          <Input id="sv-years" inputMode="decimal" className="num" value={years} onChange={(e) => setYears(e.target.value)} placeholder="2.5" aria-invalid={(touched && !!errors.years) || undefined} />
        </FormField>
      </div>
      <FormField label="Основной стек" required error={show(errors.stack)} hint="Навыки из справочника, ищутся и по синонимам: «постгрес», «k8s»">
        <SkillPicker ariaLabel="Основной стек" value={stack} onChange={setStack} specialization={specialization} />
      </FormField>
      <FormField label="Формат работы" required error={show(errors.formats)}>
        <ChipMultiSelect ariaLabel="Формат работы" options={WORK_FORMATS.map((v) => ({ value: v, label: workFormatLabel[v] }))} value={formats} onChange={setFormats} />
      </FormField>
      <div className="grid items-end gap-4 sm:grid-cols-2">
        <FormField label="Город" htmlFor="sv-city">
          <Input id="sv-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Москва" />
        </FormField>
        <label className="flex h-9 items-center gap-2 text-sm">
          <Switch checked={relocation} onCheckedChange={setRelocation} />
          Готов к переезду
        </label>
      </div>
      <SalaryRangeField label="Ожидания, ₽ в месяц на руки" value={salary} onChange={setSalary} error={touched ? errors.salary : null} hint="Работодатель не увидит точные цифры ниже своей вилки: мы лишь не пропустим инвайт ниже ожиданий" />
      {create.isError && <ErrorBanner error={create.error} />}
      <Button type="submit" disabled={create.isPending} className="justify-self-start">
        Сохранить и выбрать грейд
      </Button>
    </form>
  )
}

/** Выбор грейда для теста с учётом правил пересдачи (90 дней на смену грейда, 30 дней на повтор). */
export function GradePicker() {
  const query = useGetMyTestEligibility()
  const start = useStartTest()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<Grade | null>(null)
  return (
    <QueryView query={query}>
      {(el) => (
        <div className="grid gap-4">
          {el.active_test_id && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/40 bg-primary/5 p-4">
              <span>У вас есть незавершённый тест.</span>
              <Button onClick={() => navigate(`/c/test/${el.active_test_id}`)}>
                <IconPlayerPlay data-icon="inline-start" /> Продолжить
              </Button>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Грейд для теста">
            {GRADES.map((g) => {
              const ge = el.grades.find((x) => x.grade === g)
              const can = ge?.can_start ?? false
              return (
                <button
                  key={g}
                  type="button"
                  role="radio"
                  aria-checked={selected === g}
                  disabled={!can}
                  onClick={() => setSelected(g)}
                  className={cn(
                    'grid gap-1 rounded-lg border bg-card p-4 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60',
                    selected === g ? 'border-primary ring-1 ring-primary' : can && 'hover:border-primary/50',
                  )}
                >
                  <span className="flex items-center gap-2 font-heading text-lg font-semibold">
                    {gradeLabel[g]}
                    {ge?.recommended && (
                      <Tag tone="primary" icon={<IconStarFilled className="size-3" />}>
                        рекомендуем
                      </Tag>
                    )}
                    {el.current_grade === g && <Tag tone="success">текущий</Tag>}
                  </span>
                  <span className="text-sm text-muted-foreground">{gradeExperience[g]}</span>
                  {!can && ge?.reason && (
                    <span className="text-xs text-muted-foreground">
                      {eligibilityReasonText[ge.reason]}
                      {ge.available_at ? ` · доступно с ${formatDate(ge.available_at)}` : ''}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          {el.next_grade_change_at && <p className="text-sm text-muted-foreground">Следующая смена подтверждённого грейда — не раньше {formatDate(el.next_grade_change_at)}.</p>}
          <InlineError>{start.isError ? errorMessage(start.error) : null}</InlineError>
          <Button
            className="justify-self-start"
            disabled={!selected || start.isPending}
            onClick={() => selected && start.mutate({ data: { declared_grade: selected } }, { onSuccess: (t) => navigate(`/c/test/${t.id}`) })}
          >
            <IconPlayerPlay data-icon="inline-start" />
            Начать тест{selected ? ` на ${gradeLabel[selected]}` : ''}
          </Button>
          <p className="text-xs text-muted-foreground">~25 минут: адаптивная часть (задания подстраиваются под ответы) и одна практическая задача. Отвлекаться можно, но время идёт.</p>
        </div>
      )}
    </QueryView>
  )
}
