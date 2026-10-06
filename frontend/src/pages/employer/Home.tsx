import { Link } from 'react-router'
import { IconArrowRight } from '@tabler/icons-react'
import { useGetInvitationQuota } from '@/api/generated/endpoints/company/company'
import { useGetInvitationStats, useListCompanyInvitations } from '@/api/generated/endpoints/invitations/invitations'
import { useListSearches } from '@/api/generated/endpoints/searches/searches'
import { useAuth } from '@/auth/context'
import { Section } from '@/components/candidate'
import { PageHeader } from '@/components/layout/AppShell'
import { CategoryTag, InvitationStatusBadge, Stat } from '@/components/tags'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import { NewNeedButton } from './Searches'

export default function EmployerHome() {
  const { session } = useAuth()
  const quota = useGetInvitationQuota()
  const stats = useGetInvitationStats({ days: 30 })
  const searches = useListSearches()
  const invitations = useListCompanyInvitations({ status: ['accepted', 'interview', 'offer'] })
  return (
    <div className="grid gap-12">
      <PageHeader title={`Здравствуйте, ${session?.displayName.split(' ')[0] ?? ''}`} actions={<NewNeedButton />} />
      <div className="flex flex-wrap gap-12">
        <Stat label="Осталось инвайтов" value={quota.data ? `${quota.data.remaining}/${quota.data.limit}` : '…'} accent />
        <Stat label="Приняли за 30 дней" value={stats.data?.funnel.accepted ?? '…'} />
      </div>
      <div className="grid gap-12 lg:grid-cols-2">
        <Section
          title="Приняли инвайт"
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/e/invitations">
                Все <IconArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          }
        >
          {(invitations.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Пока никто не принял инвайт.</p>
          ) : (
            <ul className="grid divide-y border-y">
              {invitations.data!.slice(0, 5).map((i) => (
                <li key={i.id} className="flex flex-wrap items-center gap-2 py-3.5 text-sm">
                  <span className="font-medium">{i.candidate_contacts?.full_name ?? i.candidate.alias}</span>
                  <CategoryTag category={i.candidate.category} />
                  <span className="ml-auto">
                    <InvitationStatusBadge status={i.status} viewer="employer" />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
        <Section title="Последние подборки">
          {(searches.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Подборок пока нет.</p>
          ) : (
            <ul className="grid divide-y border-y">
              {searches.data!.slice(0, 5).map((s) => (
                <li key={s.id}>
                  <Link to={`/e/searches/${s.id}`} className="flex items-center gap-2 py-3.5 text-sm text-foreground no-underline hover:text-link">
                    <span className="font-medium">{s.title}</span>
                    <span className="ml-auto text-muted-foreground">{formatDate(s.updated_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  )
}
