import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { IconBookmark, IconBookmarkFilled, IconChevronRight, IconUsersGroup } from '@tabler/icons-react'
import { useAddToShortlist, useGetSearch, useGetSearchResults, useRefineSearch, useRemoveFromShortlist } from '@/api/generated/endpoints/searches/searches'
import type { Search, SearchResultItem } from '@/api/generated/model'
import { invalidatePaths } from '@/api/queryClient'
import { ExplanationChips, Section, WhyPanel } from '@/components/candidate'
import { FormField, SkillPicker } from '@/components/fields'
import { PageHeader } from '@/components/layout/AppShell'
import { EmptyState, ErrorBanner, QueryView } from '@/components/states'
import { CategoryTag, FspBadge, Tag } from '@/components/tags'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { formatPercentile, formatSalaryRangeShort, formatYears } from '@/lib/format'
import { FadeIn } from '@/components/motion'
import { cn } from '@/lib/utils'

function Refine({ search }: { search: Search }) {
  const current = search.versions.find((v) => v.version === search.current_version) ?? search.versions[search.versions.length - 1]!
  const [must, setMust] = useState(current.filters.must_skills)
  const [fspOnly, setFspOnly] = useState(current.filters.fsp_only)
  const refine = useRefineSearch()
  const qc = useQueryClient()
  return (
    <Section title="Уточнить подборку">
      <div className="grid gap-3">
        <FormField label="Обязательные навыки">
          <SkillPicker ariaLabel="Обязательные навыки" value={must} onChange={setMust} specialization={current.filters.specialization} />
        </FormField>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={fspOnly} onCheckedChange={setFspOnly} /> Только с историей ФСП
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            disabled={refine.isPending || must.length === 0}
            onClick={() => refine.mutate({ searchId: search.id, data: { filters: { ...current.filters, must_skills: must, fsp_only: fspOnly } } }, { onSuccess: () => void invalidatePaths(qc, `/searches/${search.id}`) })}
          >
            Применить
          </Button>
          <span className="text-xs text-muted-foreground">Шорт-лист сохранится</span>
        </div>
        {refine.isError && <ErrorBanner error={refine.error} />}
        <ol className="flex flex-wrap gap-1.5" aria-label="Версии подборки">
          {search.versions.map((v) => (
            <li key={v.version}>
              <Tag tone={v.version === search.current_version ? 'primary' : 'neutral'}>
                v{v.version} · {v.label} · {v.results_total}
              </Tag>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}

function ResultRow({ item, index, searchId, selected, onSelect }: { item: SearchResultItem; index: number; searchId: string; selected: boolean; onSelect: () => void }) {
  const c = item.candidate
  const add = useAddToShortlist()
  const remove = useRemoveFromShortlist()
  const qc = useQueryClient()
  const toggle = () => {
    const m = item.shortlisted ? remove : add
    m.mutate({ searchId, candidateId: c.id }, { onSuccess: () => void invalidatePaths(qc, `/searches/${searchId}`) })
  }
  return (
    <FadeIn as="li" index={index}>
      <div
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onClick={onSelect}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect())}
        className={cn(
          'grid cursor-pointer grid-cols-[3.25rem_1fr] gap-x-3 py-3.5 pr-2 pl-3 transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset',
          selected ? 'bg-accent shadow-[inset_3px_0_0_var(--primary)]' : 'hover:bg-muted/60',
        )}
      >
        <span className={cn('num row-span-3 pt-0.5 text-[1.625rem] leading-none font-bold tracking-tight', selected ? 'text-link' : 'text-muted-foreground/80')} aria-label={`Место ${item.rank}`}>
          {String(item.rank).padStart(2, '0')}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{c.alias}</span>
          <CategoryTag category={c.category} />
          {c.fsp?.has_history && <FspBadge level={c.fsp.max_level} />}
          <span className="num ml-auto text-sm font-semibold" title={formatPercentile(c.percentile)}>
            P{c.percentile ?? '—'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label={item.shortlisted ? 'Убрать из шорт-листа' : 'В шорт-лист'}
            onClick={(e) => {
              e.stopPropagation()
              toggle()
            }}
          >
            {item.shortlisted ? <IconBookmarkFilled className="text-link" /> : <IconBookmark />}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatYears(c.experience_years)} · ожидания <span className="num">{formatSalaryRangeShort(c.salary_expectation)}</span>
          {c.city ? ` · ${c.city}` : ''}
        </p>
        <ExplanationChips chips={item.explanation.chips} className="mt-2" />
      </div>
    </FadeIn>
  )
}

export default function SearchPage() {
  const { searchId = '' } = useParams()
  const search = useGetSearch(searchId)
  const results = useGetSearchResults(searchId)
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <>
      <PageHeader eyebrow="Подборка" meta={results.data ? `v${results.data.version} · ${results.data.total} в таблице` : undefined} title={search.data?.title ?? 'Подборка'} description="У каждого кандидата есть объяснение: что совпало, что подтверждено тестом и где расхождения." />
      <QueryView query={results}>
        {(res) => {
          const current = res.items.find((i) => i.candidate.id === selected) ?? res.items[0]
          if (!res.items.length) return <EmptyState icon={<IconUsersGroup />} title="Никого не нашли" description="Ослабьте обязательные навыки или расширьте формат." />
          return (
            <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
              <div className="grid content-start gap-3">
                <p className="text-sm text-muted-foreground">
                  Найдено <b className="num text-foreground">{res.total}</b> · версия {res.version}
                </p>
                <div className="eyebrow grid grid-cols-[3.25rem_1fr_auto] gap-x-3 border-b-2 border-foreground px-3 pb-1.5" aria-hidden>
                  <span>Место</span>
                  <span>Кандидат · почему в подборке</span>
                  <span className="pr-12">Перц.</span>
                </div>
                <ol className="-mt-3 grid divide-y divide-border border-b">
                  {res.items.map((item, i) => (
                    <ResultRow key={item.candidate.id} item={item} index={i} searchId={searchId} selected={current?.candidate.id === item.candidate.id} onSelect={() => setSelected(item.candidate.id)} />
                  ))}
                </ol>
              </div>
              <div className="grid content-start gap-4 lg:sticky lg:top-20 lg:self-start">
                {current && (
                  <>
                    <WhyPanel explanation={current.explanation} />
                    <Button asChild>
                      <Link to={`/e/candidates/${current.candidate.id}?search=${searchId}`}>
                        Открыть карточку {current.candidate.alias} <IconChevronRight data-icon="inline-end" />
                      </Link>
                    </Button>
                  </>
                )}
                {search.data && <Refine key={search.data.current_version} search={search.data} />}
              </div>
            </div>
          )
        }}
      </QueryView>
    </>
  )
}
