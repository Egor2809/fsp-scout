import { useState } from 'react'
import { Link } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { IconMail } from '@tabler/icons-react'
import { useGetInvitationStats, useListCompanyInvitations, useUpdateInvitationStage, useWithdrawInvitation } from '@/api/generated/endpoints/invitations/invitations'
import type { Invitation, InvitationStatus } from '@/api/generated/model'
import { invalidatePaths } from '@/api/queryClient'
import { ContactList } from '@/components/candidate'
import { SelectField } from '@/components/fields'
import { PageHeader } from '@/components/layout/AppShell'
import { EmptyState, ErrorBanner, QueryView } from '@/components/states'
import { CategoryTag, InvitationStatusBadge, Stat } from '@/components/tags'
import { Button } from '@/components/ui/button'
import { formatDate, formatPercentile, formatSalaryRange, formatShare } from '@/lib/format'
import { INVITATION_STATUS_META, employerActions, stageActionLabel } from '@/lib/invitationStatus'
import { contactChannelLabel, declineReasonLabel } from '@/lib/labels'

function Row({ inv }: { inv: Invitation }) {
  const stage = useUpdateInvitationStage()
  const withdraw = useWithdrawInvitation()
  const qc = useQueryClient()
  const done = () => void invalidatePaths(qc, '/invitations', '/candidates', '/company')
  const actions = employerActions(inv.status)
  const r = inv.response
  return (
    <article className="grid gap-3 rounded-xl border bg-card p-4">
      <header className="flex flex-wrap items-center gap-2">
        <Link to={`/e/candidates/${inv.candidate.id}`} className="font-heading font-semibold">
          {inv.candidate.alias}
        </Link>
        <CategoryTag category={inv.candidate.category} />
        <span className="num text-sm text-muted-foreground">{formatPercentile(inv.candidate.percentile)}</span>
        <span className="ml-auto">
          <InvitationStatusBadge status={inv.status} viewer="employer" />
        </span>
      </header>
      <p className="text-sm">
        <b>{inv.title}</b> · <span className="num">{formatSalaryRange(inv.salary)}</span> · отправлен {formatDate(inv.sent_at ?? inv.created_at)} · ответ до {formatDate(inv.expires_at)}
      </p>
      {r?.decision === 'declined' && (
        <p className="rounded-lg bg-surface/60 p-3 text-sm">
          Причина отказа: <b>{r.reason ? declineReasonLabel[r.reason] : 'не указана'}</b>
          {r.comment ? ` — «${r.comment}»` : ''}
        </p>
      )}
      {r?.decision === 'postponed' && <p className="text-sm text-muted-foreground">Кандидат попросил вернуться позже{r.postponed_until ? ` — после ${formatDate(r.postponed_until)}` : ''}.</p>}
      {inv.candidate_contacts && <ContactList contacts={inv.candidate_contacts} note={r?.channel ? `просит связаться: ${contactChannelLabel[r.channel]}${r.comment ? ` · «${r.comment}»` : ''}` : undefined} />}
      {(actions.stages.length > 0 || actions.withdraw) && (
        <div className="flex flex-wrap gap-2">
          {actions.stages.map((s) => (
            <Button key={s} size="sm" variant={s === 'closed' ? 'ghost' : 'outline'} disabled={stage.isPending} onClick={() => stage.mutate({ invitationId: inv.id, data: { status: s } }, { onSuccess: done })}>
              {stageActionLabel[s]}
            </Button>
          ))}
          {actions.withdraw && (
            <Button size="sm" variant="ghost" disabled={withdraw.isPending} onClick={() => withdraw.mutate({ invitationId: inv.id, data: {} }, { onSuccess: done })}>
              Отозвать
            </Button>
          )}
        </div>
      )}
      {(stage.isError || withdraw.isError) && <ErrorBanner error={stage.error ?? withdraw.error} />}
    </article>
  )
}

const FILTERS: InvitationStatus[] = ['sent', 'viewed', 'postponed', 'accepted', 'declined', 'interview', 'offer', 'hired', 'expired', 'withdrawn', 'closed']

export default function EmployerInvitations() {
  const [status, setStatus] = useState<InvitationStatus | 'all'>('all')
  const query = useListCompanyInvitations(status === 'all' ? undefined : { status: [status] })
  const stats = useGetInvitationStats({ days: 30 })
  return (
    <>
      <PageHeader eyebrow="Инвайты" title="Отправленные инвайты" description="Контакты кандидата появляются здесь сразу после принятия инвайта." />
      {stats.data && (
        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Отправлено за 30 дней" value={stats.data.funnel.sent} />
          <Stat label="Приняли" value={stats.data.funnel.accepted} />
          <Stat label="Конверсия" value={formatShare(stats.data.acceptance_rate)} accent />
          <Stat label="Частая причина отказа" value={stats.data.decline_reasons[0] ? declineReasonLabel[stats.data.decline_reasons[0].reason] : '—'} />
        </div>
      )}
      <div className="mb-4 w-56">
        <SelectField<InvitationStatus | 'all'> ariaLabel="Статус" value={status} onChange={setStatus} options={[{ value: 'all', label: 'Все статусы' }, ...FILTERS.map((s) => ({ value: s, label: INVITATION_STATUS_META[s].label }))]} />
      </div>
      <QueryView query={query}>
        {(list) =>
          list.length === 0 ? (
            <EmptyState icon={<IconMail />} title="Инвайтов нет" description="Соберите подборку и пригласите подходящих кандидатов." />
          ) : (
            <div className="grid gap-3">
              {list.map((inv) => (
                <Row key={inv.id} inv={inv} />
              ))}
            </div>
          )
        }
      </QueryView>
    </>
  )
}
