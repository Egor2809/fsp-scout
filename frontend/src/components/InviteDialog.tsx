import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { IconSend } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useGetInvitationQuota, useGetMyCompany } from '@/api/generated/endpoints/company/company'
import { useCreateInvitation, usePrecheckInvitation } from '@/api/generated/endpoints/invitations/invitations'
import type { CandidateCard, ContactChannel, InvitationSource, WorkFormat } from '@/api/generated/model'
import { hasProblemCode } from '@/api/problem'
import { invalidatePaths } from '@/api/queryClient'
import { useAuth } from '@/auth/context'
import { FormField, SalaryRangeField, SelectField, type SalaryDraft } from '@/components/fields'
import { ErrorBanner } from '@/components/states'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { validateSalaryRange } from '@/lib/format'
import { CONTACT_CHANNELS, WORK_FORMATS, contactChannelLabel, workFormatLabel } from '@/lib/labels'

const BELOW = 'Вилка ниже ожиданий кандидата, инвайт не дойдёт. Поднимите верхнюю границу.'

export function InviteDialog({ card, open, onOpenChange, source }: { card: CandidateCard; open: boolean; onOpenChange: (v: boolean) => void; source?: InvitationSource }) {
  const { session } = useAuth()
  const company = useGetMyCompany({ query: { enabled: open } })
  const quota = useGetInvitationQuota({ query: { enabled: open } })
  const precheck = usePrecheckInvitation()
  const create = useCreateInvitation()
  const qc = useQueryClient()
  const [title, setTitle] = useState(card.category ? `${card.category.label}-разработчик` : '')
  const [description, setDescription] = useState('')
  const [salary, setSalary] = useState<SalaryDraft>({ from: card.salary_expectation?.from ?? null, to: card.salary_expectation?.to ?? null })
  const [format, setFormat] = useState<WorkFormat>(card.work_formats[0] ?? 'remote')
  const [city, setCity] = useState(card.city ?? '')
  const [person, setPerson] = useState(session?.displayName ?? '')
  const [channel, setChannel] = useState<ContactChannel>('email')
  const [contactDraft, setContact] = useState<string | null>(null)
  const [days, setDays] = useState<'3' | '7' | '14'>('7')
  const [touched, setTouched] = useState(false)

  const contact = contactDraft ?? (channel === 'email' ? (company.data?.contact_email ?? '') : channel === 'phone' ? (company.data?.contact_phone ?? '') : '')

  const salaryError = validateSalaryRange(salary.from, salary.to)
  const { mutate: runPrecheck } = precheck
  useEffect(() => {
    if (!open || salaryError) return
    const t = window.setTimeout(() => runPrecheck({ data: { candidate_id: card.id, salary: { from: salary.from!, to: salary.to! } } }), 400)
    return () => window.clearTimeout(t)
  }, [open, salary.from, salary.to, salaryError, card.id, runPrecheck])

  const below = (precheck.data && !precheck.data.salary_ok && !salaryError) || hasProblemCode(create.error, 'salary_below_floor')
  const errors = {
    title: title.trim().length >= 3 ? null : 'Название позиции',
    description: description.trim().length >= 20 ? null : 'Опишите задачи и команду, не короче 20 символов',
    person: person.trim() ? null : 'Кто будет на связи',
    contact: contact.trim() ? null : 'Укажите контакт',
  }
  const q = precheck.data?.quota ?? quota.data
  const invalid = Object.values(errors).some(Boolean) || !!salaryError

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Инвайт для {card.alias}</DialogTitle>
          <DialogDescription>Контакты откроются, если кандидат примет инвайт.</DialogDescription>
        </DialogHeader>
        <form
          id="invite-form"
          className="grid gap-5"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            setTouched(true)
            if (invalid || below) return
            create.mutate(
              {
                data: {
                  candidate_id: card.id,
                  title: title.trim(),
                  description: description.trim(),
                  salary: { from: salary.from!, to: salary.to! },
                  work_format: format,
                  city: city.trim() || null,
                  contact_person: person.trim(),
                  contact: { channel, value: contact.trim() },
                  response_days: Number(days),
                  source,
                },
              },
              {
                onSuccess: () => {
                  void invalidatePaths(qc, '/invitations', '/candidates', '/searches', '/company')
                  toast.success('Инвайт отправлен')
                  onOpenChange(false)
                },
              },
            )
          }}
        >
          {q && (
            <p className="num text-sm text-muted-foreground">
              {company.data?.name ? `${company.data.name} · ` : ''}осталось инвайтов <b className="text-foreground">{q.remaining}</b> из {q.limit}
            </p>
          )}
          <FormField label="Позиция" htmlFor="inv-title" required error={touched ? errors.title : null}>
            <Input id="inv-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormField>
          <FormField label="Описание: задачи, команда, стек" htmlFor="inv-desc" required error={touched ? errors.description : null}>
            <Textarea id="inv-desc" rows={4} value={description} maxLength={2000} onChange={(e) => setDescription(e.target.value)} />
          </FormField>
          <SalaryRangeField idPrefix="inv-sal" value={salary}
            onChange={(v) => {
              setSalary(v)
              if (create.isError) create.reset()
            }}
            error={salaryError && (touched || salary.from !== null) ? salaryError : below ? { field: 'to', message: BELOW } : null} hint="Проверим, что вилка не ниже скрытых ожиданий кандидата" />
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Формат" htmlFor="inv-fmt">
              <SelectField id="inv-fmt" value={format} onChange={setFormat} options={WORK_FORMATS.map((f) => ({ value: f, label: workFormatLabel[f] }))} />
            </FormField>
            <FormField label="Город" htmlFor="inv-city">
              <Input id="inv-city" value={city} onChange={(e) => setCity(e.target.value)} />
            </FormField>
            <FormField label="Срок ответа" htmlFor="inv-days">
              <SelectField id="inv-days" value={days} onChange={setDays} options={[{ value: '3', label: '3 дня' }, { value: '7', label: '7 дней' }, { value: '14', label: '14 дней' }]} />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Контактное лицо" htmlFor="inv-person" required error={touched ? errors.person : null}>
              <Input id="inv-person" value={person} onChange={(e) => setPerson(e.target.value)} />
            </FormField>
            <FormField label="Способ связи" htmlFor="inv-ch">
              <SelectField
                id="inv-ch"
                value={channel}
                onChange={(c) => {
                  setChannel(c)
                  setContact(null)
                }}
                options={CONTACT_CHANNELS.map((c) => ({ value: c, label: contactChannelLabel[c] }))}
              />
            </FormField>
            <FormField label="Контакт" htmlFor="inv-contact" required error={touched ? errors.contact : null}>
              <Input id="inv-contact" value={contact} onChange={(e) => setContact(e.target.value)} />
            </FormField>
          </div>
          {precheck.data?.already_invited && <p className="text-sm text-muted-foreground">Этому кандидату уже отправлен инвайт.</p>}
          {create.isError && !hasProblemCode(create.error, 'salary_below_floor') && <ErrorBanner error={create.error} />}
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button type="submit" form="invite-form" disabled={create.isPending || !!below || q?.remaining === 0 || precheck.data?.already_invited}>
            <IconSend data-icon="inline-start" /> Отправить инвайт
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
