import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useGetMyFsp, useLinkMyFsp } from '@/api/generated/endpoints/fsp/fsp'
import { invalidatePaths } from '@/api/queryClient'
import { FspTimeline, NoFspHistory, Section } from '@/components/candidate'
import { FormField } from '@/components/fields'
import { PageHeader } from '@/components/layout/AppShell'
import { ErrorBanner, QueryView } from '@/components/states'
import { Stat, Tag } from '@/components/tags'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/format'

export default function Fsp() {
  const query = useGetMyFsp()
  const link = useLinkMyFsp()
  const qc = useQueryClient()
  const [fspId, setFspId] = useState('')
  return (
    <>
      <PageHeader eyebrow="Федерация спортивного программирования" title="История ФСП" description="Результаты соревнований подтягиваются из ФСП ID и усиливают карточку. Без истории подбор работает так же." />
      <QueryView query={query}>
        {(fsp) => (
          <div className="grid gap-5">
            {!fsp.linked && (
              <Section title="Привязать ФСП ID">
                <form
                  className="flex flex-wrap items-end gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (fspId.trim()) link.mutate({ data: { fsp_id: fspId.trim() } }, { onSuccess: () => void invalidatePaths(qc, '/me') })
                  }}
                >
                  <FormField label="ФСП ID" htmlFor="fsp-id" className="min-w-56 flex-1">
                    <Input id="fsp-id" value={fspId} onChange={(e) => setFspId(e.target.value)} placeholder="FSP-000000" className="num" />
                  </FormField>
                  <Button type="submit" disabled={link.isPending}>
                    Привязать
                  </Button>
                </form>
                {link.isError && <ErrorBanner className="mt-3" error={link.error} />}
              </Section>
            )}
            {!fsp.has_history ? (
              <NoFspHistory />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <Stat label="Индекс ФСП" value={fsp.index} accent />
                  <Stat label="Бонус к рейтингу" value={`+${(fsp.bonus * 100).toFixed(0)}%`} />
                  <Stat label="Достижений" value={fsp.achievements.length} />
                  <Stat label="Подтверждено" value={fsp.verified_at ? formatDate(fsp.verified_at) : '—'} />
                </div>
                <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
                  <Section title="Таймлайн">
                    <FspTimeline achievements={fsp.achievements} />
                  </Section>
                  <Section title="Из чего складывается индекс">
                    <ul className="grid gap-2 text-sm">
                      {fsp.components.map((c) => (
                        <li key={c.achievement_id} className="grid gap-0.5 border-b pb-2 last:border-0">
                          <span className="flex justify-between gap-2">
                            <span>{c.title}</span>
                            <span className="num font-semibold">+{c.contribution.toFixed(1)}</span>
                          </span>
                          <span className="num text-xs text-muted-foreground">
                            уровень ×{c.level_weight} · результат ×{c.result_weight} · релевантность ×{c.relevance} · давность ×{c.decay}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-muted-foreground">
                      <Tag>ФСП</Tag> Индекс складывается из вкладов, старые результаты весят меньше.
                    </p>
                  </Section>
                </div>
              </>
            )}
          </div>
        )}
      </QueryView>
    </>
  )
}
