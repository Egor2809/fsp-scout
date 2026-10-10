import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { IconArrowLeft, IconSend } from '@tabler/icons-react'
import { useGetCandidate } from '@/api/generated/endpoints/candidates/candidates'
import { CandidateCardView, ContactsBlock, FspTimeline, NoFspHistory, Section, WhyPanel } from '@/components/candidate'
import { InviteDialog } from '@/components/InviteDialog'
import { PageHeader } from '@/components/layout/AppShell'
import { QueryView } from '@/components/states'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import { ARCHIVED_INVITATION_STATUSES } from '@/lib/invitationStatus'

export default function CandidatePage() {
  const { candidateId = '' } = useParams()
  const [params] = useSearchParams()
  const searchId = params.get('search')
  const query = useGetCandidate(candidateId, searchId ? { search_id: searchId } : undefined)
  const [open, setOpen] = useState(false)
  return (
    <QueryView query={query}>
      {(c) => {
        const inv = c.relation.invitation
        const canInvite = !inv || ARCHIVED_INVITATION_STATUSES.includes(inv.status)
        return (
          <>
            <PageHeader
              back={
                <Link to={searchId ? `/e/searches/${searchId}` : '/e/candidates'} className="inline-flex items-center gap-1 no-underline">
                  <IconArrowLeft className="size-3.5" /> {searchId ? 'К подборке' : 'В банк кандидатов'}
                </Link>
              }
              title="Анонимная карточка"
              actions={
                canInvite ? (
                  <Button onClick={() => setOpen(true)}>
                    <IconSend data-icon="inline-start" /> Пригласить
                  </Button>
                ) : (
                  <Button asChild variant="outline">
                    <Link to="/e/invitations">Инвайт отправлен</Link>
                  </Button>
                )
              }
            />
            <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
              <div className="grid content-start gap-12">
                <CandidateCardView card={c} />
                <Section title="Соревнования ФСП">{c.fsp?.has_history && c.achievements.length ? <FspTimeline achievements={c.achievements} /> : <NoFspHistory />}</Section>
              </div>
              <div className="grid content-start gap-8 lg:sticky lg:top-24 lg:self-start">
                <ContactsBlock card={c} />
                {c.explanation && <WhyPanel explanation={c.explanation} />}
                {c.task_signal.solved_count > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Решено заданий: <span className="num text-foreground">{c.task_signal.solved_count}</span>
                    {c.task_signal.last_solved_at ? ` · последнее ${formatDate(c.task_signal.last_solved_at)}` : ''}
                  </p>
                )}
              </div>
            </div>
            {canInvite && <InviteDialog key={c.id} card={c} open={open} onOpenChange={setOpen} source={searchId ? { type: 'search', id: searchId } : { type: 'bank', id: null }} />}
          </>
        )
      }}
    </QueryView>
  )
}
