import { Link, Navigate } from 'react-router'
import { IconArrowRight, IconEye, IconMail } from '@tabler/icons-react'
import { useGetMe } from '@/api/generated/endpoints/me/me'
import { useGetMyProfile } from '@/api/generated/endpoints/profile/profile'
import { useListMyInvitations } from '@/api/generated/endpoints/invitations/invitations'
import { Section } from '@/components/candidate'
import { PageHeader } from '@/components/layout/AppShell'
import { QueryView } from '@/components/states'
import { AvailabilityTag, CategoryTag, InvitationStatusBadge, SkillList, Stat } from '@/components/tags'
import { Button } from '@/components/ui/button'
import { formatDate, formatPercentile, formatSalaryRange, formatSalaryRangeShort } from '@/lib/format'
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
          <div className="grid gap-5">
            <PageHeader
              motif
              eyebrow="Кабинет кандидата"
              title={`Здравствуйте, ${p.full_name.split(' ')[0]}`}
              description={p.visibility === 'visible' ? 'Профиль виден работодателям анонимно. Контакты откроются только по вашему согласию.' : 'Профиль сейчас скрыт из подбора — проверьте согласия и настройки приватности.'}
              actions={
                <Button asChild variant="outline">
                  <Link to="/c/profile">
                    <IconEye data-icon="inline-start" /> Как меня видят
                  </Link>
                </Button>
              }
            >
              <div className="flex flex-wrap items-end gap-6">
                <CategoryTag category={p.standing?.category} size="lg" />
                {p.standing && (
                  <div>
                    <p className="font-heading text-4xl font-semibold text-brand-accent">{formatPercentile(p.standing.percentile)}</p>
                    <p className="text-sm text-muted-foreground">в категории · подтверждено {formatDate(p.standing.confirmed_at)}</p>
                  </div>
                )}
              </div>
            </PageHeader>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Активные инвайты" value={active.length} accent={active.length > 0} />
              <Stat label="Ожидания" value={formatSalaryRangeShort(p.salary_expectation)} />
              <Stat label="Статус поиска" value={<AvailabilityTag availability={p.availability} />} />
              <Stat label="Заполненность" value={`${p.completeness}%`} />
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <Section
                title="Новые инвайты"
                actions={
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/c/invitations">
                      Все <IconArrowRight data-icon="inline-end" />
                    </Link>
                  </Button>
                }
              >
                {active.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Пока нет новых предложений. Компании видят вашу карточку в подборках.</p>
                ) : (
                  <ul className="grid gap-2">
                    {active.slice(0, 4).map((i) => (
                      <li key={i.id}>
                        <Link to="/c/invitations" className="flex flex-wrap items-center gap-2 rounded-lg border p-3 no-underline hover:bg-accent">
                          <IconMail className="size-4 text-link" />
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
              <Section title="Навыки">
                <SkillList skills={p.skills} limit={12} showLevel />
              </Section>
            </div>
          </div>
        )
      }}
    </QueryView>
  )
}
