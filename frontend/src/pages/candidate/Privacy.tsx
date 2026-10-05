import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useGetMyPrivacy, useUpdateMyPrivacy } from '@/api/generated/endpoints/profile/profile'
import type { Availability, PrivacySettings } from '@/api/generated/model'
import { invalidatePaths } from '@/api/queryClient'
import { Section } from '@/components/candidate'
import { FormField, MoneyInput, SelectField } from '@/components/fields'
import { PageHeader } from '@/components/layout/AppShell'
import { ErrorBanner, QueryView } from '@/components/states'
import { Tag } from '@/components/tags'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { AVAILABILITIES, availabilityLabel } from '@/lib/labels'

function PrivacyForm({ initial }: { initial: PrivacySettings }) {
  const [s, setS] = useState(initial)
  const update = useUpdateMyPrivacy()
  const qc = useQueryClient()
  const toggle = (key: 'show_fsp' | 'show_company_names' | 'show_city', label: string, hint: string) => (
    <label className="flex items-start justify-between gap-4 py-2">
      <span className="grid gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </span>
      <Switch checked={s[key]} onCheckedChange={(v) => setS({ ...s, [key]: v })} />
    </label>
  )
  return (
    <form
      className="grid max-w-2xl gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        update.mutate(
          {
            data: {
              availability: s.availability,
              salary_floor: s.salary_floor,
              hidden_company_ids: s.hidden_companies.map((c) => c.id),
              show_fsp: s.show_fsp,
              show_company_names: s.show_company_names,
              show_city: s.show_city,
            },
          },
          { onSuccess: () => void invalidatePaths(qc, '/me').then(() => toast.success('Настройки сохранены')) },
        )
      }}
    >
      <Section title="Поиск" actions={<Tag tone={s.profile_published ? 'success' : 'muted'}>{s.profile_published ? 'профиль в подборе' : 'профиль скрыт'}</Tag>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Статус" htmlFor="pr-av">
            <SelectField<Availability> id="pr-av" value={s.availability} onChange={(availability) => setS({ ...s, availability })} options={AVAILABILITIES.map((a) => ({ value: a, label: availabilityLabel[a] }))} />
          </FormField>
          <FormField label="Нижний порог, ₽" htmlFor="pr-floor" hint="Инвайты с вилкой ниже порога не дойдут. Компании цифру не видят.">
            <MoneyInput id="pr-floor" value={s.salary_floor} onChange={(salary_floor) => setS({ ...s, salary_floor })} />
          </FormField>
        </div>
      </Section>
      <Section title="Что показывать в карточке">
        <div className="divide-y">
          {toggle('show_fsp', 'Достижения ФСП', 'Уровень и результаты соревнований')}
          {toggle('show_company_names', 'Названия компаний в опыте', 'Иначе — «Компания скрыта» с отраслью')}
          {toggle('show_city', 'Город', 'Иначе виден только формат работы')}
        </div>
      </Section>
      {s.hidden_companies.length > 0 && (
        <Section title="Скрыт от компаний">
          <div className="flex flex-wrap gap-1.5">
            {s.hidden_companies.map((c) => (
              <button key={c.id} type="button" onClick={() => setS({ ...s, hidden_companies: s.hidden_companies.filter((x) => x.id !== c.id) })} className="rounded-md border px-2.5 py-1 text-sm hover:bg-accent" aria-label={`Убрать ${c.name}`}>
                {c.name} ×
              </button>
            ))}
          </div>
        </Section>
      )}
      {update.isError && <ErrorBanner error={update.error} />}
      <Button type="submit" disabled={update.isPending} className="justify-self-start">
        Сохранить
      </Button>
    </form>
  )
}

export default function Privacy() {
  const query = useGetMyPrivacy()
  return (
    <>
      <PageHeader eyebrow="Приватность" title="Кто и что видит" description="Компании видят анонимную карточку. ФИО и контакты — только после того, как вы примете инвайт или откликнетесь." />
      <QueryView query={query}>{(data) => <PrivacyForm initial={data} />}</QueryView>
    </>
  )
}
