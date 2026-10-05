import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { IconArrowRight, IconUsers } from '@tabler/icons-react'
import { useConfirmNeed, useGetNeed, useGetNeedCategories } from '@/api/generated/endpoints/needs/needs'
import { useCreateSearch } from '@/api/generated/endpoints/searches/searches'
import type { CategoryRecommendation, ConfirmedNeed, Grade, Industry, Need, Specialization, WorkFormat } from '@/api/generated/model'
import { invalidatePaths } from '@/api/queryClient'
import { Section } from '@/components/candidate'
import { ChipMultiSelect, FormField, SalaryRangeField, SelectField, SkillPicker, type SalaryDraft } from '@/components/fields'
import { PageHeader } from '@/components/layout/AppShell'
import { ErrorBanner, QueryView, SkeletonCards } from '@/components/states'
import { Tag } from '@/components/tags'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatMoney, formatShare, plural, validateSalaryRange } from '@/lib/format'
import { GRADES, INDUSTRIES, SPECIALIZATIONS, WORK_FORMATS, gradeLabel, industryLabel, specializationLabel, workFormatLabel } from '@/lib/labels'

const VERDICT_TONE = { below_market: 'warning', in_market: 'success', above_market: 'primary' } as const

function NeedForm({ need, onConfirmed }: { need: Need; onConfirmed: () => void }) {
  const src = need.confirmed ?? need.parsed
  const [spec, setSpec] = useState<Specialization | null>(src.specialization)
  const [grade, setGrade] = useState<Grade | null>(src.grade)
  const [must, setMust] = useState(src.must_skills.map((s) => s.id))
  const [nice, setNice] = useState(src.nice_skills.map((s) => s.id))
  const [formats, setFormats] = useState<WorkFormat[]>(src.work_formats)
  const [city, setCity] = useState(src.city ?? '')
  const [industry, setIndustry] = useState<Industry | null>(src.industry)
  const [salary, setSalary] = useState<SalaryDraft>({ from: src.salary?.from ?? null, to: src.salary?.to ?? null })
  const [touched, setTouched] = useState(false)
  const confirm = useConfirmNeed()
  const qc = useQueryClient()
  const salaryError = validateSalaryRange(salary.from, salary.to)
  const invalid = !spec || !grade || must.length === 0 || formats.length === 0 || !!salaryError

  return (
    <form
      className="grid gap-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        setTouched(true)
        if (invalid || !spec || !grade) return
        confirm.mutate(
          {
            needId: need.id,
            data: { specialization: spec, grade, must_skills: must, nice_skills: nice, work_formats: formats, city: city.trim() || null, industry, salary: { from: salary.from!, to: salary.to! } },
          },
          {
            onSuccess: () => {
              void invalidatePaths(qc, `/needs/${need.id}`)
              onConfirmed()
            },
          },
        )
      }}
    >
      <blockquote className="rounded-lg border-l-4 border-primary bg-surface/60 p-3 text-sm text-muted-foreground">{need.raw_text}</blockquote>
      {need.parsed.unrecognized.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Не распознали: {need.parsed.unrecognized.map((u) => `«${u}»`).join(', ')} — добавьте вручную, если важно.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Специализация" htmlFor="nd-spec" required error={touched && !spec ? 'Выберите специализацию' : null}>
          <SelectField id="nd-spec" value={spec} onChange={setSpec} options={SPECIALIZATIONS.map((s) => ({ value: s, label: specializationLabel[s] }))} />
        </FormField>
        <FormField label="Грейд" htmlFor="nd-grade" required error={touched && !grade ? 'Выберите грейд' : null}>
          <SelectField id="nd-grade" value={grade} onChange={setGrade} options={GRADES.map((g) => ({ value: g, label: gradeLabel[g] }))} />
        </FormField>
      </div>
      <FormField label="Обязательные навыки" required hint="Нажмите на навык, чтобы сделать его желательным" error={touched && must.length === 0 ? 'Нужен хотя бы один навык' : null}>
        <SkillPicker
          ariaLabel="Обязательные навыки"
          value={must}
          onChange={setMust}
          specialization={spec}
          exclude={nice}
          chipHint="Сделать желательным"
          onChipClick={(id) => {
            setMust(must.filter((x) => x !== id))
            setNice([...nice, id])
          }}
        />
      </FormField>
      <FormField label="Желательные навыки" hint="Нажмите, чтобы сделать обязательным">
        <SkillPicker
          ariaLabel="Желательные навыки"
          value={nice}
          onChange={setNice}
          specialization={spec}
          exclude={must}
          chipHint="Сделать обязательным"
          onChipClick={(id) => {
            setNice(nice.filter((x) => x !== id))
            setMust([...must, id])
          }}
        />
      </FormField>
      <FormField label="Формат" required error={touched && formats.length === 0 ? 'Выберите формат' : null}>
        <ChipMultiSelect ariaLabel="Формат" options={WORK_FORMATS.map((f) => ({ value: f, label: workFormatLabel[f] }))} value={formats} onChange={setFormats} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Город" htmlFor="nd-city">
          <Input id="nd-city" value={city} onChange={(e) => setCity(e.target.value)} />
        </FormField>
        <FormField label="Отрасль" htmlFor="nd-ind">
          <SelectField id="nd-ind" value={industry} onChange={setIndustry} options={INDUSTRIES.map((i) => ({ value: i, label: industryLabel[i] }))} />
        </FormField>
      </div>
      <SalaryRangeField value={salary} onChange={setSalary} error={touched || salary.from !== null ? salaryError : null} hint="Вилка обязательна: без неё нельзя отправить инвайт" />
      {confirm.isError && <ErrorBanner error={confirm.error} />}
      <Button type="submit" disabled={confirm.isPending} className="justify-self-start">
        Подтвердить и показать категории
      </Button>
    </form>
  )
}

function CategoryCard({ rec, onPick, pending }: { rec: CategoryRecommendation; onPick: () => void; pending: boolean }) {
  const r = rec.radar
  return (
    <article className="grid gap-3 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-heading text-lg font-semibold">{rec.category.label}</h3>
        <Tag tone={rec.kind === 'primary' ? 'primary' : 'neutral'}>{rec.kind === 'primary' ? 'точное совпадение' : 'смежная'}</Tag>
      </div>
      <p className="flex items-baseline gap-2">
        <IconUsers className="size-4 self-center text-link" aria-hidden />
        <span className="num text-2xl font-semibold">{rec.candidate_count}</span>
        <span className="text-sm text-muted-foreground">{plural(rec.candidate_count, ['кандидат', 'кандидата', 'кандидатов'])}</span>
        {rec.median_expectation && <span className="num ml-auto text-sm text-muted-foreground">медиана {formatMoney(rec.median_expectation)}</span>}
      </p>
      <p className="text-sm text-muted-foreground">{rec.reason}</p>
      <div className="grid gap-1.5">
        <div className="flex h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
          <div className="bg-muted-foreground/40" style={{ width: `${r.share_below * 100}%` }} />
          <div className="bg-primary" style={{ width: `${r.share_within * 100}%` }} />
          <div className="bg-foreground/70" style={{ width: `${r.share_above * 100}%` }} />
        </div>
        <p className="num text-xs text-muted-foreground">
          ниже вилки {formatShare(r.share_below)} · в вилке {formatShare(r.share_within)} · выше {formatShare(r.share_above)}
        </p>
        <p className="text-sm">
          <Tag tone={VERDICT_TONE[r.verdict]}>{r.verdict === 'below_market' ? 'ниже рынка' : r.verdict === 'in_market' ? 'в рынке' : 'выше рынка'}</Tag> {r.message}
        </p>
      </div>
      <Button onClick={onPick} disabled={pending || rec.candidate_count === 0} className="justify-self-start">
        Собрать подборку <IconArrowRight data-icon="inline-end" />
      </Button>
    </article>
  )
}

function Categories({ need, confirmed }: { need: Need; confirmed: ConfirmedNeed }) {
  const cats = useGetNeedCategories(need.id)
  const create = useCreateSearch()
  const navigate = useNavigate()
  const pick = (rec: CategoryRecommendation) =>
    create.mutate(
      {
        data: {
          need_id: need.id,
          title: rec.category.label,
          filters: {
            specialization: rec.category.specialization,
            grades: [rec.category.grade],
            must_skills: confirmed.must_skills.map((s) => s.id),
            nice_skills: confirmed.nice_skills.map((s) => s.id),
            work_formats: confirmed.work_formats,
            city: confirmed.city,
            include_relocation: true,
            industries: confirmed.industry ? [confirmed.industry] : [],
            salary: confirmed.salary,
            fsp_only: false,
            fsp_level_min: null,
            availability: ['active', 'open'],
          },
        },
      },
      { onSuccess: (s) => navigate(`/e/searches/${s.id}`) },
    )
  return (
    <Section title="Рекомендованные категории">
      <QueryView query={cats} skeleton={<SkeletonCards count={2} />}>
        {(data) => (
          <div className="grid gap-3">
            {data.items.map((rec) => (
              <CategoryCard key={rec.category.label} rec={rec} pending={create.isPending} onPick={() => pick(rec)} />
            ))}
            {create.isError && <ErrorBanner error={create.error} />}
          </div>
        )}
      </QueryView>
    </Section>
  )
}

export default function NeedPage() {
  const { needId = '' } = useParams()
  const query = useGetNeed(needId)
  return (
    <>
      <PageHeader eyebrow="Потребность" title="Проверьте параметры" description="Мы разобрали текст на чипы. Поправьте, если нужно, и подтвердите — вилка обязательна." />
      <QueryView query={query}>
        {(need) => (
          <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
            <Section title="Параметры">
              <NeedForm key={need.updated_at} need={need} onConfirmed={() => void query.refetch()} />
            </Section>
            {need.confirmed ? <Categories need={need} confirmed={need.confirmed} /> : <p className="text-sm text-muted-foreground xl:pt-4">После подтверждения покажем подходящие категории, число кандидатов и как ваша вилка выглядит на рынке.</p>}
          </div>
        )}
      </QueryView>
    </>
  )
}
