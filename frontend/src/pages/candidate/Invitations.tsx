import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { IconBuilding, IconCheck, IconClockPause, IconMail, IconRosetteDiscountCheckFilled, IconX } from '@tabler/icons-react'
import { toast } from 'sonner'
import {
  useAcceptInvitation,
  useDeclineInvitation,
  useListMyInvitations,
  useMarkInvitationViewed,
  usePostponeInvitation,
} from '@/api/generated/endpoints/invitations/invitations'
import type { ContactChannel, DeclineReason, Invitation } from '@/api/generated/model'
import { invalidatePaths } from '@/api/queryClient'
import { FormField, SelectField } from '@/components/fields'
import { PageHeader } from '@/components/layout/AppShell'
import { EmptyState, ErrorBanner, QueryView } from '@/components/states'
import { InvitationStatusBadge, Tag } from '@/components/tags'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { formatDate, formatRelativeDays, formatSalaryRange } from '@/lib/format'
import { ACCEPTED_INVITATION_STATUSES, ACTIVE_INVITATION_STATUSES, candidateActions } from '@/lib/invitationStatus'
import { CONTACT_CHANNELS, DECLINE_REASONS, contactChannelLabel, declineReasonLabel, industryLabel, workFormatLabel } from '@/lib/labels'

function useRefresh() {
  const qc = useQueryClient()
  return () => invalidatePaths(qc, '/me/invitations', '/invitations')
}

function AcceptDialog({ inv, open, onOpenChange }: { inv: Invitation; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [channel, setChannel] = useState<ContactChannel>('telegram')
  const [message, setMessage] = useState('')
  const accept = useAcceptInvitation()
  const refresh = useRefresh()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Принять инвайт от {inv.company.name}</DialogTitle>
          <DialogDescription>Компания увидит ваше ФИО и контакты. Отозвать раскрытие после принятия нельзя.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <FormField label="Как с вами связаться" htmlFor="acc-ch">
            <SelectField id="acc-ch" value={channel} onChange={setChannel} options={CONTACT_CHANNELS.map((c) => ({ value: c, label: contactChannelLabel[c] }))} />
          </FormField>
          <FormField label="Сообщение компании" htmlFor="acc-msg" hint="Например, удобное время для созвона">
            <Textarea id="acc-msg" value={message} maxLength={500} onChange={(e) => setMessage(e.target.value)} />
          </FormField>
          {accept.isError && <ErrorBanner error={accept.error} />}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            disabled={accept.isPending}
            onClick={() =>
              accept.mutate(
                { invitationId: inv.id, data: { channel, message: message.trim() || null } },
                {
                  onSuccess: () => {
                    void refresh()
                    onOpenChange(false)
                    toast.success('Инвайт принят — компания свяжется с вами')
                  },
                },
              )
            }
          >
            <IconCheck data-icon="inline-start" /> Принять и открыть контакты
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeclineDialog({ inv, open, onOpenChange }: { inv: Invitation; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [reason, setReason] = useState<DeclineReason | null>(null)
  const [comment, setComment] = useState('')
  const decline = useDeclineInvitation()
  const refresh = useRefresh()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Отклонить инвайт</DialogTitle>
          <DialogDescription>Причина поможет компании и улучшит следующие подборки. Ваши контакты не раскрываются.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <RadioGroup value={reason ?? ''} onValueChange={(v) => setReason(v as DeclineReason)} aria-label="Причина отказа" className="grid gap-2">
            {DECLINE_REASONS.map((r) => (
              <label key={r} htmlFor={`dr-${r}`} className="flex cursor-pointer items-center gap-2 text-sm">
                <RadioGroupItem id={`dr-${r}`} value={r} />
                {declineReasonLabel[r]}
              </label>
            ))}
          </RadioGroup>
          <FormField label="Комментарий" htmlFor="dec-c">
            <Textarea id="dec-c" value={comment} maxLength={500} onChange={(e) => setComment(e.target.value)} />
          </FormField>
          {decline.isError && <ErrorBanner error={decline.error} />}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            variant="destructive"
            disabled={!reason || decline.isPending}
            onClick={() =>
              reason &&
              decline.mutate(
                { invitationId: inv.id, data: { reason, comment: comment.trim() || null } },
                {
                  onSuccess: () => {
                    void refresh()
                    onOpenChange(false)
                    toast('Инвайт отклонён')
                  },
                },
              )
            }
          >
            Отклонить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function InvitationItem({ inv }: { inv: Invitation }) {
  const [dialog, setDialog] = useState<'accept' | 'decline' | null>(null)
  const view = useMarkInvitationViewed()
  const postpone = usePostponeInvitation()
  const refresh = useRefresh()
  const viewed = useRef(false)
  useEffect(() => {
    if (inv.status === 'sent' && !viewed.current) {
      viewed.current = true
      view.mutate({ invitationId: inv.id }, { onSuccess: () => void refresh() })
    }
  }, [inv.id, inv.status, view, refresh])
  const actions = candidateActions(inv.status)
  return (
    <article className="grid gap-3 rounded-xl border bg-card p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <IconBuilding className="size-4" />
            <span className="font-medium text-foreground">{inv.company.name}</span>
            {inv.company.verified && <IconRosetteDiscountCheckFilled className="size-4 text-link" aria-label="Компания проверена" />}
            <span>· {industryLabel[inv.company.industry]}</span>
          </p>
          <h2 className="text-lg font-semibold">{inv.title}</h2>
        </div>
        <InvitationStatusBadge status={inv.status} viewer="candidate" />
      </header>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span className="num font-semibold">{formatSalaryRange(inv.salary)}</span>
        <span>{workFormatLabel[inv.work_format]}</span>
        {inv.city && <span>{inv.city}</span>}
        {inv.vacancy && <Tag>по вакансии</Tag>}
      </div>
      <p className="text-sm whitespace-pre-line text-pretty">{inv.description}</p>
      <p className="text-xs text-muted-foreground">
        Контакт: {inv.contact_person} · {contactChannelLabel[inv.contact.channel]} {ACCEPTED_INVITATION_STATUSES.includes(inv.status) ? inv.contact.value : ''} · получено{' '}
        {formatDate(inv.sent_at ?? inv.created_at)}
        {actions.accept ? ` · ответить ${formatRelativeDays(inv.expires_at)}` : ''}
      </p>
      {inv.response?.reason && (
        <p className="text-sm text-muted-foreground">
          Ваша причина отказа: {declineReasonLabel[inv.response.reason]}
          {inv.response.comment ? ` — «${inv.response.comment}»` : ''}
        </p>
      )}
      {(actions.accept || actions.decline || actions.postpone) && (
        <div className="flex flex-wrap gap-2">
          {actions.accept && (
            <Button onClick={() => setDialog('accept')}>
              <IconCheck data-icon="inline-start" /> Принять
            </Button>
          )}
          {actions.decline && (
            <Button variant="outline" onClick={() => setDialog('decline')}>
              <IconX data-icon="inline-start" /> Отклонить
            </Button>
          )}
          {actions.postpone && (
            <Button
              variant="ghost"
              disabled={postpone.isPending}
              onClick={() => postpone.mutate({ invitationId: inv.id, data: {} }, { onSuccess: () => void refresh().then(() => toast('Напомним позже')) })}
            >
              <IconClockPause data-icon="inline-start" /> Не сейчас
            </Button>
          )}
        </div>
      )}
      {postpone.isError && <ErrorBanner error={postpone.error} />}
      <AcceptDialog inv={inv} open={dialog === 'accept'} onOpenChange={(v) => setDialog(v ? 'accept' : null)} />
      <DeclineDialog inv={inv} open={dialog === 'decline'} onOpenChange={(v) => setDialog(v ? 'decline' : null)} />
    </article>
  )
}

function List({ items, empty }: { items: Invitation[]; empty: string }) {
  if (!items.length) return <EmptyState icon={<IconMail />} title={empty} />
  return (
    <div className="grid gap-3">
      {items.map((i) => (
        <InvitationItem key={i.id} inv={i} />
      ))}
    </div>
  )
}

export default function CandidateInvitations() {
  const query = useListMyInvitations()
  return (
    <>
      <PageHeader eyebrow="Инвайты" title="Предложения от компаний" description="В каждом инвайте есть вилка. Контакты откроются компании только после того, как вы примете инвайт." />
      <QueryView query={query}>
        {(all) => {
          const active = all.filter((i) => ACTIVE_INVITATION_STATUSES.includes(i.status))
          const accepted = all.filter((i) => ACCEPTED_INVITATION_STATUSES.includes(i.status))
          const archived = all.filter((i) => !active.includes(i) && !accepted.includes(i))
          return (
            <Tabs defaultValue="active">
              <TabsList className="mb-4 flex-wrap">
                <TabsTrigger value="active">Ждут ответа · {active.length}</TabsTrigger>
                <TabsTrigger value="accepted">Принятые · {accepted.length}</TabsTrigger>
                <TabsTrigger value="archive">Архив · {archived.length}</TabsTrigger>
              </TabsList>
              <TabsContent value="active">
                <List items={active} empty="Новых инвайтов нет" />
              </TabsContent>
              <TabsContent value="accepted">
                <List items={accepted} empty="Принятых инвайтов пока нет" />
              </TabsContent>
              <TabsContent value="archive">
                <List items={archived} empty="Архив пуст" />
              </TabsContent>
            </Tabs>
          )
        }}
      </QueryView>
    </>
  )
}
