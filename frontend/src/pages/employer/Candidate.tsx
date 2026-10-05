import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { IconArrowLeft, IconSend } from '@tabler/icons-react'
import { useGetCandidate } from '@/api/generated/endpoints/candidates/candidates'
import { CandidateCardView, ContactsBlock, FspTimeline, NoFspHistory, Section, WhyPanel } from '@/components/candidate'
import { InviteDialog } from '@/components/InviteDialog'
import { PageHeader } from '@/components/layout/AppShell'
import { QueryView } from '@/components/states'
import { Stat } from '@/components/tags'
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
              eyebrow={
                <Link to={searchId ? `/e/searches/${searchId}` : '/e/candidates'} className="inline-flex items-center gap-1 no-underline">
                  <IconArrowLeft className="size-3.5" /> {searchId ? 'К подборке' : 'В банк кандидатов'}
                </Link>
              }
              title="Анонимная карточка"
              description="Без ФИО, фото и контактов. Только проверяемые сигналы: тест, навыки, ФСП, задания."
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
            <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <div className="grid content-start gap-5">
                <CandidateCardView card={c} />
                <Section title="Соревнования ФСП">{c.fsp?.has_history && c.achievements.length ? <FspTimeline achievements={c.achievements} /> : <NoFspHistory />}</Section>
              </div>
              <div className="grid content-start gap-4 lg:sticky lg:top-20 lg:self-start">
                <ContactsBlock card={c} />
                {c.explanation && <WhyPanel explanation={c.explanation} />}
                <div className="grid grid-cols-2 gap-2">
                  <Stat label="Решено заданий" value={c.task_signal.solved_count} />
                  <Stat label="Последнее" value={c.task_signal.last_solved_at ? formatDate(c.task_signal.last_solved_at) : '—'} />
                </div>
              </div>
            </div>
            {canInvite && <InviteDialog key={c.id} card={c} open={open} onOpenChange={setOpen} source={searchId ? { type: 'search', id: searchId } : { type: 'bank', id: null }} />}
          </>
        )
      }}
    </QueryView>
  )
}
