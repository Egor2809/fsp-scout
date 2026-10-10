import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useGetMyFsp, useLinkMyFsp } from '@/api/generated/endpoints/fsp/fsp'
import { invalidatePaths } from '@/api/queryClient'
import { FspTimeline, NoFspHistory, Section } from '@/components/candidate'
import { FormField } from '@/components/fields'
import { PageHeader } from '@/components/layout/AppShell'
import { ErrorBanner, QueryView } from '@/components/states'
import { Stat } from '@/components/tags'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Fsp() {
  const query = useGetMyFsp()
  const link = useLinkMyFsp()
  const qc = useQueryClient()
  const [fspId, setFspId] = useState('')
  return (
    <>
      <PageHeader title="История ФСП" />
      <QueryView query={query}>
        {(fsp) => (
          <div className="grid gap-12">
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
                    <Input id="fsp-id" value={fspId} onChange={(e) => setFspId(e.target.value)} placeholder="FSP-77-000001" className="num" />
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
                <div className="flex flex-wrap gap-12">
                  <Stat label="Индекс ФСП" value={fsp.index} accent />
                  <Stat label="Бонус к силе профиля" value={`+${fsp.bonus.toFixed(1)}`} />
                </div>
                <div className="max-w-3xl">
                  <FspTimeline achievements={fsp.achievements} />
                </div>
                <details className="group max-w-3xl">
                  <summary className="cursor-pointer list-none text-sm font-medium text-link [&::-webkit-details-marker]:hidden">Из чего складывается индекс</summary>
                  <ul className="mt-4 grid gap-3 text-sm">
                    {fsp.components.map((c) => (
                      <li key={c.achievement_id} className="grid gap-0.5">
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
                </details>
              </>
            )}
          </div>
        )}
      </QueryView>
    </>
  )
}
