import { Link, Navigate } from 'react-router'
import { IconArrowRight } from '@tabler/icons-react'
import { useGetMe } from '@/api/generated/endpoints/me/me'
import { useGetMyProfile } from '@/api/generated/endpoints/profile/profile'
import { useListMyInvitations } from '@/api/generated/endpoints/invitations/invitations'
import { Section } from '@/components/candidate'
import { PageHeader } from '@/components/layout/AppShell'
import { QueryView } from '@/components/states'
import { CategoryTag, InvitationStatusBadge } from '@/components/tags'
import { Button } from '@/components/ui/button'
import { formatPercentile, formatSalaryRange } from '@/lib/format'
import { ACTIVE_INVITATION_STATUSES } from '@/lib/invitationStatus'

export default function CandidateHome() {
  const me = useGetMe()
  const profile = useGetMyProfile({ query: { enabled: me.data?.onboarding?.next_step === 'done' } })
  const invitations = useListMyInvitations()
  if (me.data && me.data.onboarding && me.data.onboarding.next_step !== 'done') return <Navigate to="/c/onboarding" replace />
  return (
    <QueryView query={profile}>
      {(p) => {
        const active = (invitations.data ?? []).filter((i) => ACTIVE_INVITATION_STATUSES.includes(i.status))
        return (
          <div className="grid gap-12">
            <PageHeader title={`Здравствуйте, ${p.full_name.split(' ')[0]}`}>
              <div className="flex flex-wrap items-end gap-8">
                <CategoryTag category={p.standing?.category} size="lg" />
                {p.standing && (
                  <p className="num text-4xl font-semibold text-brand-accent">
                    {formatPercentile(p.standing.percentile)}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">в категории</span>
                  </p>
                )}
              </div>
              {p.visibility !== 'visible' && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Профиль скрыт из подбора. <Link to="/c/privacy">Приватность</Link>
                </p>
              )}
            </PageHeader>
            <Section
              title={`Новые инвайты${active.length ? ` · ${active.length}` : ''}`}
              className="max-w-3xl"
              actions={
                <Button asChild variant="ghost" size="sm">
                  <Link to="/c/invitations">
                    Все <IconArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
              }
            >
              {active.length === 0 ? (
                <p className="text-sm text-muted-foreground">Пока нет новых предложений.</p>
              ) : (
                <ul className="grid divide-y border-y">
                  {active.slice(0, 4).map((i) => (
                    <li key={i.id}>
                      <Link to="/c/invitations" className="flex flex-wrap items-center gap-x-3 gap-y-1 py-4 no-underline hover:text-link">
                        <span className="font-medium text-foreground">{i.company.name}</span>
                        <span className="text-sm text-muted-foreground">{i.title}</span>
                        <span className="num ml-auto text-sm text-foreground">{formatSalaryRange(i.salary)}</span>
                        <InvitationStatusBadge status={i.status} viewer="candidate" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
        )
      }}
    </QueryView>
  )
}
