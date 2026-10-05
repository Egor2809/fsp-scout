import type { ReactNode } from 'react'
import { IconLock, IconMail, IconMapPin, IconPhone, IconBrandTelegram, IconMedal } from '@tabler/icons-react'
import type { CandidateCard, ExplanationFactor, FspAchievement, MatchExplanation } from '@/api/generated/model'
import { AvailabilityTag, CategoryTag, FreshSignalBadge, FspBadge, InvitationStatusBadge, SkillList, Stat, Tag, ApplicationStatusBadge } from '@/components/tags'
import { formatDate, formatPercentile, formatSalaryRange, formatShortDate, formatYears } from '@/lib/format'
import { contactChannelLabel, fspDisciplineLabel, fspLevelLabel, fspResultLabel, industryLabel, workFormatLabel } from '@/lib/labels'
import { cn } from '@/lib/utils'

const POLARITY_TONE = { positive: 'success', negative: 'danger', neutral: 'neutral' } as const

export function ExplanationChips({ chips, className }: { chips: ExplanationFactor[]; className?: string }) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)} aria-label="Почему подходит">
      {chips.slice(0, 3).map((c, i) => (
        <Tag key={`${c.kind}-${i}`} tone={POLARITY_TONE[c.polarity]}>
          {c.label}
        </Tag>
      ))}
    </div>
  )
}

/** Панель «Почему в подборке»: вклад каждого фактора в итоговый балл. */
export function WhyPanel({ explanation, className }: { explanation: MatchExplanation; className?: string }) {
  const max = Math.max(0.01, ...explanation.factors.map((f) => Math.abs(f.contribution)))
  return (
    <section className={cn('rounded-xl border bg-card p-4', className)} aria-labelledby="why-title">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="why-title" className="text-base font-semibold">
          Почему в подборке
        </h2>
        <span className="num text-sm text-muted-foreground">
          соответствие <b className="text-foreground">{Math.round(explanation.score * 100)}</b>/100
        </span>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <Stat label="Совпадение с запросом" value={`${Math.round(explanation.fit * 100)}%`} />
        <Stat label="Сила профиля" value={`${Math.round(explanation.strength * 100)}%`} />
      </div>
      <ul className="grid gap-2.5">
        {explanation.factors.map((f, i) => (
          <li key={`${f.kind}-${i}`} className="grid gap-1">
            <div className="flex items-start justify-between gap-3 text-sm">
              <span>{f.label}</span>
              <span className={cn('num shrink-0', f.polarity === 'negative' ? 'text-destructive' : f.polarity === 'positive' ? 'text-success' : 'text-muted-foreground')}>
                {f.contribution > 0 ? '+' : ''}
                {(f.contribution * 100).toFixed(0)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
              <div
                className={cn('h-full rounded-full', f.polarity === 'negative' ? 'bg-destructive' : f.polarity === 'positive' ? 'bg-primary' : 'bg-muted-foreground/50')}
                style={{ width: `${(Math.abs(f.contribution) / max) * 100}%` }}
              />
            </div>
            {f.evidence && <p className="text-xs text-muted-foreground">{f.evidence}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function Section({ title, children, actions, className }: { title: ReactNode; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-xl border bg-card p-4 sm:p-5', className)}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  )
}

/** Шапка анонимной карточки: без ФИО и контактов, только псевдоним и проверяемые сигналы. */
export function CandidateHeadline({ card, right }: { card: CandidateCard; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="grid min-w-0 gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-heading text-lg font-semibold">{card.alias}</span>
          <CategoryTag category={card.category} />
          {card.fsp?.has_history && <FspBadge level={card.fsp.max_level} />}
          {card.task_signal.fresh && <FreshSignalBadge />}
        </div>
        <p className="text-sm text-muted-foreground">
          {formatYears(card.experience_years)} опыта · {card.work_formats.map((f) => workFormatLabel[f]).join(', ')}
          {card.city ? ` · ${card.city}` : ''}
          {card.relocation ? ' · готов к переезду' : ''}
        </p>
      </div>
      {right}
    </div>
  )
}

export function CandidateFacts({ card }: { card: CandidateCard }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Stat label="Перцентиль" value={formatPercentile(card.percentile)} accent />
      <Stat label="Ожидания" value={formatSalaryRange(card.salary_expectation)} />
      <Stat label="Статус" value={<AvailabilityTag availability={card.availability} />} />
      <Stat label="Был активен" value={card.last_active_at ? formatShortDate(card.last_active_at) : '—'} />
    </div>
  )
}

/** Полная анонимная карточка кандидата (банк, подборка, превью для самого кандидата). */
export function CandidateCardView({ card }: { card: CandidateCard }) {
  return (
    <div className="grid gap-4">
      <CandidateHeadline card={card} right={card.relation.invitation ? <InvitationStatusBadge status={card.relation.invitation.status} viewer="employer" /> : card.relation.application ? <ApplicationStatusBadge status={card.relation.application.status} /> : null} />
      <CandidateFacts card={card} />
      <Section title="Навыки">
        <SkillList skills={card.skills} showLevel />
      </Section>
      {card.experience.length > 0 && (
        <Section title="Опыт">
          <ol className="grid gap-3">
            {card.experience.map((e, i) => (
              <li key={i} className="grid gap-0.5 border-l-2 border-primary/30 pl-3">
                <span className="font-medium">{e.role}</span>
                <span className="text-sm text-muted-foreground">
                  {e.company_hidden || !e.company_name ? 'Компания скрыта' : e.company_name}
                  {e.industry ? ` · ${industryLabel[e.industry]}` : ''} · {formatShortDate(e.start)} — {e.end ? formatShortDate(e.end) : 'сейчас'}
                </span>
                {e.description && <p className="text-sm">{e.description}</p>}
              </li>
            ))}
          </ol>
        </Section>
      )}
      {card.industries.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {card.industries.map((i) => (
            <Tag key={i}>{industryLabel[i]}</Tag>
          ))}
        </div>
      )}
    </div>
  )
}

/** Контакты: раскрыты только после принятия инвайта или отклика. */
export function ContactsBlock({ card }: { card: CandidateCard }) {
  if (!card.disclosure.revealed || !card.contacts) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-dashed bg-surface/40 p-4 text-sm">
        <IconLock className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
        <div>
          <p className="font-medium">Контакты скрыты</p>
          <p className="text-muted-foreground">ФИО и контакты откроются, когда кандидат примет инвайт или откликнется на вакансию.</p>
        </div>
      </div>
    )
  }
  return <ContactList contacts={card.contacts} note={card.disclosure.revealed_at ? `Раскрыты ${formatDate(card.disclosure.revealed_at)}` : undefined} />
}

export function ContactList({ contacts, note }: { contacts: NonNullable<CandidateCard['contacts']>; note?: string }) {
  return (
    <div className="grid gap-2 rounded-xl border border-success/30 bg-success-surface p-4 text-sm">
      <p className="font-semibold">{contacts.full_name}</p>
      <p className="flex items-center gap-2">
        <IconMail className="size-4" aria-hidden />
        {contacts.email}
      </p>
      {contacts.phone && (
        <p className="flex items-center gap-2">
          <IconPhone className="size-4" aria-hidden />
          {contacts.phone}
        </p>
      )}
      {contacts.telegram && (
        <p className="flex items-center gap-2">
          <IconBrandTelegram className="size-4" aria-hidden />
          {contacts.telegram}
        </p>
      )}
      <p className="text-muted-foreground">
        Предпочитает: {contactChannelLabel[contacts.preferred_channel]}
        {note ? ` · ${note}` : ''}
      </p>
    </div>
  )
}

export function FspTimeline({ achievements }: { achievements: FspAchievement[] }) {
  const sorted = [...achievements].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <ol className="grid gap-3">
      {sorted.map((a) => (
        <li key={a.id} className="relative grid gap-1 border-l-2 border-primary/30 pl-4">
          <span className="absolute top-1.5 -left-[5px] size-2 rounded-full bg-primary" aria-hidden />
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{a.title}</span>
            <FspBadge level={a.level} label={fspLevelLabel[a.level]} />
            {a.verified && <Tag tone="success">подтверждено ФСП</Tag>}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDate(a.date)} · {fspDisciplineLabel[a.discipline]} · {fspResultLabel[a.result]}
            {a.place ? ` · ${a.place} место` : ''}
            {a.participants_total ? ` из ${a.participants_total}` : ''}
            {a.team ? ` · команда «${a.team}»` : ''}
            {a.role ? ` · ${a.role}` : ''}
          </p>
        </li>
      ))}
    </ol>
  )
}

export function NoFspHistory() {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-surface/40 p-4 text-sm">
      <IconMedal className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
      <div>
        <p className="font-medium">Нет истории ФСП</p>
        <p className="text-muted-foreground">Это нормально: подбор строится на тесте и навыках. Участие в соревнованиях ФСП — дополнительный сигнал, не обязательный.</p>
      </div>
    </div>
  )
}

export function SalaryText({ children }: { children: ReactNode }) {
  return <span className="num font-medium">{children}</span>
}

export function IconText({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
      {icon ?? <IconMapPin className="size-4" aria-hidden />}
      {children}
    </span>
  )
}
