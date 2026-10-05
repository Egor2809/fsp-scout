import type { ReactNode } from 'react'
import {
  IconCircleCheckFilled,
  IconClockPause,
  IconMedal,
  IconRosetteDiscountCheckFilled,
  IconSparkles,
} from '@tabler/icons-react'
import type { ApplicationStatus, Availability, CandidateSkill, Category, FspLevel, InvitationStatus } from '@/api/generated/model'
import { INVITATION_STATUS_META, type StatusTone } from '@/lib/invitationStatus'
import { applicationStatusLabel, availabilityLabel, fspLevelLabel, skillLevelLabel, skillSourceLabel } from '@/lib/labels'
import { cn } from '@/lib/utils'

const TONE: Record<StatusTone, string> = {
  neutral: 'border-border bg-background text-foreground',
  primary: 'border-primary/25 bg-primary/10 text-link',
  info: 'border-border bg-secondary text-secondary-foreground',
  success: 'border-success/25 bg-success-surface text-success',
  warning: 'border-warning/25 bg-warning-surface text-warning',
  danger: 'border-destructive/25 bg-destructive-surface text-destructive',
  muted: 'border-transparent bg-muted text-muted-foreground',
}

export function Tag({ tone = 'neutral', children, className, icon }: { tone?: StatusTone; children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <span className={cn('inline-flex h-6 max-w-full items-center gap-1 rounded-md border px-2 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5', TONE[tone], className)}>
      {icon}
      <span className="truncate">{children}</span>
    </span>
  )
}

export function InvitationStatusBadge({ status, viewer }: { status: InvitationStatus; viewer: 'candidate' | 'employer' }) {
  const meta = INVITATION_STATUS_META[status]
  return (
    <Tag tone={meta.tone} icon={status === 'postponed' ? <IconClockPause aria-hidden /> : undefined}>
      {viewer === 'candidate' ? meta.candidateLabel : meta.label}
    </Tag>
  )
}

const APP_TONE: Record<ApplicationStatus, StatusTone> = {
  submitted: 'primary',
  viewed: 'info',
  interview: 'success',
  offer: 'success',
  hired: 'success',
  rejected: 'danger',
  withdrawn: 'muted',
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return <Tag tone={APP_TONE[status]}>{applicationStatusLabel[status]}</Tag>
}

/** Категория «Backend · Middle» — дисплейный Tektur капсом, как номер на майке. */
export function CategoryTag({ category, size = 'sm', className }: { category: Category | null | undefined; size?: 'sm' | 'lg'; className?: string }) {
  if (!category) {
    return <Tag tone="muted">Грейд не подтверждён</Tag>
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md bg-foreground font-heading font-bold tracking-[-0.01em] whitespace-nowrap text-background uppercase',
        size === 'lg' ? 'h-9 px-3 text-[0.9375rem]' : 'h-6 px-2 text-[0.6875rem]',
        className,
      )}
    >
      {category.label}
    </span>
  )
}

export function SkillChip({ skill, showLevel = false }: { skill: Pick<CandidateSkill, 'name' | 'verified' | 'level' | 'source'>; showLevel?: boolean }) {
  return (
    <span
      title={`${skillSourceLabel[skill.source]} · ${skillLevelLabel[skill.level]}`}
      className={cn(
        'inline-flex h-7 items-center gap-1 rounded-md border px-2 text-xs font-medium',
        skill.verified ? 'border-primary/30 bg-primary/8 text-foreground' : 'border-border text-muted-foreground',
      )}
    >
      {skill.verified && <IconRosetteDiscountCheckFilled aria-label="подтверждён" className="size-3.5 text-primary dark:text-link" />}
      {skill.name}
      {showLevel && <span className="font-mono text-[0.65rem] text-muted-foreground">· {skillLevelLabel[skill.level].toLowerCase()}</span>}
    </span>
  )
}

export function SkillList({ skills, limit, showLevel }: { skills: CandidateSkill[]; limit?: number; showLevel?: boolean }) {
  const sorted = [...skills].sort((a, b) => Number(b.verified) - Number(a.verified) || (b.score ?? 0) - (a.score ?? 0))
  const shown = limit ? sorted.slice(0, limit) : sorted
  const rest = sorted.length - shown.length
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((s) => (
        <SkillChip key={s.skill_id} skill={s} showLevel={showLevel} />
      ))}
      {rest > 0 && <span className="inline-flex h-7 items-center px-1 text-xs text-muted-foreground">+{rest}</span>}
    </div>
  )
}

/** Бейдж ФСП — фирменный красный только для иконки и крупного текста. */
export function FspBadge({ level, label, className }: { level?: FspLevel | null; label?: string; className?: string }) {
  return (
    <span className={cn('inline-flex h-6 items-center gap-1 rounded-md border border-brand-accent/30 px-2 text-xs font-medium text-foreground', className)}>
      <IconMedal aria-hidden className="size-3.5 text-brand-accent" />
      {label ?? (level ? `ФСП · ${fspLevelLabel[level].toLowerCase()}` : 'ФСП')}
    </span>
  )
}

/**
 * ФСП-индекс отдельным красным бейджем. Белый на #EC1D35 — 4.4:1, поэтому
 * цифра и подпись крупные и жирные (≥ 14pt bold — «крупный текст» по WCAG).
 */
export function FspIndexBadge({ index, className }: { index: number; className?: string }) {
  return (
    <span
      className={cn('inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-accent px-2.5 text-[1.1875rem] leading-none font-bold text-white', className)}
      aria-label={`Индекс ФСП ${index}`}
    >
      <IconMedal aria-hidden className="size-4.5" />
      <span className="num">{index}</span>
    </span>
  )
}

/** Уровень навыка → условная шкала, если тест не дал числовой оценки. */
const LEVEL_SCORE = { basic: 45, confident: 70, advanced: 88 } as const

/** Подтверждённые навыки как стат-бары игрока: название, полоса, число. */
export function SkillStatBars({ skills, limit = 5, className }: { skills: CandidateSkill[]; limit?: number; className?: string }) {
  const top = [...skills]
    .sort((a, b) => Number(b.verified) - Number(a.verified) || (b.score ?? LEVEL_SCORE[b.level]) - (a.score ?? LEVEL_SCORE[a.level]))
    .slice(0, limit)
  if (!top.length) return null
  return (
    <ul className={cn('grid gap-1.5', className)} aria-label="Ключевые навыки">
      {top.map((s) => {
        const v = Math.round(s.score ?? LEVEL_SCORE[s.level])
        return (
          <li key={s.skill_id} className="grid grid-cols-[minmax(0,7.5rem)_1fr_2rem] items-center gap-2.5 text-xs">
            <span className={cn('flex min-w-0 items-center gap-1 truncate', !s.verified && 'text-muted-foreground')} title={`${skillSourceLabel[s.source]} · ${skillLevelLabel[s.level]}`}>
              {s.verified && <IconRosetteDiscountCheckFilled aria-label="подтверждён" className="size-3.5 shrink-0 text-primary dark:text-link" />}
              <span className="truncate">{s.name}</span>
            </span>
            <span className="h-1.5 overflow-hidden rounded-[2px] bg-muted" aria-hidden>
              <span className={cn('block h-full', s.verified ? 'bg-primary' : 'bg-muted-foreground/45')} style={{ width: `${v}%` }} />
            </span>
            <span className="num text-right font-semibold">{v}</span>
          </li>
        )
      })}
    </ul>
  )
}

export function FreshSignalBadge() {
  return (
    <Tag tone="primary" icon={<IconSparkles aria-hidden />}>
      Свежий сигнал
    </Tag>
  )
}

export function AvailabilityTag({ availability }: { availability: Availability }) {
  const tone: StatusTone = availability === 'active' ? 'success' : availability === 'open' ? 'info' : 'muted'
  return (
    <Tag tone={tone} icon={availability === 'active' ? <IconCircleCheckFilled aria-hidden /> : undefined}>
      {availabilityLabel[availability]}
    </Tag>
  )
}

/** Сложность задания 1–5 — «видна смена сложности». */
export function DifficultyMeter({ level, className }: { level: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)} aria-label={`Сложность ${level} из 5`}>
      <span className="eyebrow">Сложность</span>
      <span className="flex items-end gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={cn('w-1.5 rounded-sm', i <= level ? 'bg-primary' : 'bg-border')} style={{ height: 4 + i * 2.5 }} />
        ))}
      </span>
    </span>
  )
}

/** Ключевая цифра: моно, табличные цифры. accent — фирменный красный (только крупно). */
export function Stat({ label, value, hint, accent = false, className }: { label: string; value: ReactNode; hint?: ReactNode; accent?: boolean; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <p className="eyebrow">{label}</p>
      <p className={cn('num mt-1 text-2xl leading-tight font-semibold', accent && 'text-brand-accent')}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
