import { useState } from 'react'
import { Link } from 'react-router'
import { IconDatabaseSearch } from '@tabler/icons-react'
import { useListCandidates } from '@/api/generated/endpoints/candidates/candidates'
import type { Grade, Specialization, WorkFormat } from '@/api/generated/model'
import { PlayerCard } from '@/components/candidate'
import { ChipMultiSelect, SelectField, SkillPicker } from '@/components/fields'
import { PageHeader } from '@/components/layout/AppShell'
import { EmptyState, QueryView } from '@/components/states'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { GRADES, SPECIALIZATIONS, WORK_FORMATS, gradeLabel, specializationLabel, workFormatLabel } from '@/lib/labels'

type Sort = 'strength' | 'percentile' | 'recent'

export default function Candidates() {
  const [spec, setSpec] = useState<Specialization | null>(null)
  const [grades, setGrades] = useState<Grade[]>([])
  const [formats, setFormats] = useState<WorkFormat[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [fspOnly, setFspOnly] = useState(false)
  const [sort, setSort] = useState<Sort>('strength')
  const [page, setPage] = useState(1)
  const query = useListCandidates({
    specialization: spec ?? undefined,
    grade: grades.length ? grades : undefined,
    work_format: formats.length ? formats : undefined,
    skill: skills.length ? skills : undefined,
    fsp_only: fspOnly || undefined,
    sort,
    page,
    page_size: 20,
  })
  return (
    <>
      <PageHeader eyebrow="Банк кандидатов" meta={query.data ? `${query.data.total} в банке` : undefined} title="Все кандидаты с подтверждённым грейдом" description="Анонимные карточки. Контакты — после принятия инвайта." />
      <div className="mb-5 grid gap-3 rounded-lg border bg-card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="w-52">
            <SelectField ariaLabel="Специализация" placeholder="Все специализации" value={spec} onChange={(v) => (setSpec(v), setPage(1))} options={SPECIALIZATIONS.map((s) => ({ value: s, label: specializationLabel[s] }))} />
          </div>
          <div className="w-44">
            <SelectField<Sort> ariaLabel="Сортировка" value={sort} onChange={setSort} options={[{ value: 'strength', label: 'По силе профиля' }, { value: 'percentile', label: 'По перцентилю' }, { value: 'recent', label: 'Недавно активные' }]} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={fspOnly} onCheckedChange={(v) => (setFspOnly(v), setPage(1))} /> С историей ФСП
          </label>
        </div>
        <ChipMultiSelect ariaLabel="Грейд" options={GRADES.map((g) => ({ value: g, label: gradeLabel[g] }))} value={grades} onChange={(v) => (setGrades(v), setPage(1))} />
        <ChipMultiSelect ariaLabel="Формат" options={WORK_FORMATS.map((f) => ({ value: f, label: workFormatLabel[f] }))} value={formats} onChange={(v) => (setFormats(v), setPage(1))} />
        <SkillPicker ariaLabel="Навыки" value={skills} onChange={(v) => (setSkills(v), setPage(1))} specialization={spec} placeholder="Навык" />
      </div>
      <QueryView query={query}>
        {(res) =>
          res.items.length === 0 ? (
            <EmptyState icon={<IconDatabaseSearch />} title="Никого не нашли" description="Ослабьте фильтры." />
          ) : (
            <>
              <p className="mb-3 text-sm text-muted-foreground">
                Найдено <b className="num text-foreground">{res.total}</b>
              </p>
              <div className="grid gap-3 lg:grid-cols-2">
                {res.items.map((c, i) => (
                  <Link key={c.id} to={`/e/candidates/${c.id}`} className="group rounded-lg text-foreground no-underline outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                    <PlayerCard card={c} rank={(res.page - 1) * res.page_size + i + 1} className="h-full transition-colors group-hover:border-primary/50" />
                  </Link>
                ))}
              </div>
              {res.total > res.page * res.page_size && (
                <Button variant="outline" className="mt-4" onClick={() => setPage(page + 1)}>
                  Следующая страница
                </Button>
              )}
              {page > 1 && (
                <Button variant="ghost" className="mt-4 ml-2" onClick={() => setPage(page - 1)}>
                  Назад
                </Button>
              )}
            </>
          )
        }
      </QueryView>
    </>
  )
}
