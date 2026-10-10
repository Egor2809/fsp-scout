import type { InvitationStatus } from '@/api/generated/model'

/** Визуальный тон бейджа статуса. */
export type StatusTone = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger' | 'muted'

export interface InvitationStatusMeta {
  /** Подпись для работодателя */
  label: string
  /** Подпись для кандидата (если отличается) */
  candidateLabel: string
  tone: StatusTone
  /** Инвайт ждёт ответа кандидата */
  active: boolean
  /** Дальше переходов нет */
  final: boolean
}

export const INVITATION_STATUS_META: Record<InvitationStatus, InvitationStatusMeta> = {
  draft: { label: 'Черновик', candidateLabel: 'Черновик', tone: 'muted', active: false, final: false },
  sent: { label: 'Отправлен', candidateLabel: 'Новый', tone: 'primary', active: true, final: false },
  viewed: { label: 'Просмотрен', candidateLabel: 'Просмотрен', tone: 'info', active: true, final: false },
  postponed: { label: 'Отложен кандидатом', candidateLabel: 'Отложен', tone: 'warning', active: true, final: false },
  accepted: { label: 'Принят', candidateLabel: 'Принят', tone: 'success', active: false, final: false },
  declined: { label: 'Отклонён', candidateLabel: 'Отклонён', tone: 'danger', active: false, final: true },
  expired: { label: 'Истёк', candidateLabel: 'Истёк', tone: 'muted', active: false, final: true },
  withdrawn: { label: 'Отозван', candidateLabel: 'Отозван компанией', tone: 'muted', active: false, final: true },
  interview: { label: 'Интервью', candidateLabel: 'Интервью', tone: 'success', active: false, final: false },
  offer: { label: 'Оффер', candidateLabel: 'Оффер', tone: 'success', active: false, final: false },
  hired: { label: 'Нанят', candidateLabel: 'Вы приняты', tone: 'success', active: false, final: true },
  closed: { label: 'Закрыт', candidateLabel: 'Закрыт', tone: 'muted', active: false, final: true },
}

export const ACTIVE_INVITATION_STATUSES: readonly InvitationStatus[] = ['sent', 'viewed', 'postponed']
export const ACCEPTED_INVITATION_STATUSES: readonly InvitationStatus[] = ['accepted', 'interview', 'offer', 'hired']
export const ARCHIVED_INVITATION_STATUSES: readonly InvitationStatus[] = ['declined', 'expired', 'withdrawn', 'closed']

export type InvitationActor = 'candidate' | 'employer' | 'system'

/**
 * Граф переходов инвайта (совпадает с описанием в contracts/openapi.yaml).
 * Ключ — текущий статус, значение — допустимые следующие статусы по ролям.
 */
const TRANSITIONS: Record<InvitationStatus, Partial<Record<InvitationActor, readonly InvitationStatus[]>>> = {
  draft: { employer: ['sent'] },
  sent: { candidate: ['viewed', 'accepted', 'declined', 'postponed'], employer: ['withdrawn'], system: ['expired'] },
  viewed: { candidate: ['accepted', 'declined', 'postponed'], employer: ['withdrawn'], system: ['expired'] },
  postponed: { candidate: ['accepted', 'declined'], employer: ['withdrawn'], system: ['expired'] },
  accepted: { employer: ['interview', 'closed'] },
  interview: { employer: ['offer', 'closed'] },
  offer: { employer: ['hired', 'closed'] },
  declined: {},
  expired: {},
  withdrawn: {},
  hired: {},
  closed: {},
}

export function canTransition(from: InvitationStatus, to: InvitationStatus, actor: InvitationActor): boolean {
  return TRANSITIONS[from][actor]?.includes(to) ?? false
}

export function nextStatuses(from: InvitationStatus, actor: InvitationActor): readonly InvitationStatus[] {
  return TRANSITIONS[from][actor] ?? []
}

export interface CandidateInvitationActions {
  accept: boolean
  decline: boolean
  /** «Не сейчас» — только один раз */
  postpone: boolean
}

export function candidateActions(status: InvitationStatus): CandidateInvitationActions {
  return {
    accept: canTransition(status, 'accepted', 'candidate'),
    decline: canTransition(status, 'declined', 'candidate'),
    postpone: canTransition(status, 'postponed', 'candidate'),
  }
}

export interface EmployerInvitationActions {
  withdraw: boolean
  stages: readonly ('interview' | 'offer' | 'hired' | 'closed')[]
}

export function employerActions(status: InvitationStatus): EmployerInvitationActions {
  const stages = nextStatuses(status, 'employer').filter(
    (s): s is 'interview' | 'offer' | 'hired' | 'closed' => s === 'interview' || s === 'offer' || s === 'hired' || s === 'closed',
  )
  return { withdraw: canTransition(status, 'withdrawn', 'employer'), stages }
}

/** Контакты кандидата раскрыты компании (инвайт принят и дальше по воронке). */
export function contactsRevealed(status: InvitationStatus): boolean {
  return ACCEPTED_INVITATION_STATUSES.includes(status) || (status === 'closed')
}

/** Активный инвайт с истёкшим сроком считается истёкшим (до того как система сменит статус). */
export function effectiveStatus(status: InvitationStatus, expiresAt: string, now: Date = new Date()): InvitationStatus {
  if (ACTIVE_INVITATION_STATUSES.includes(status) && new Date(expiresAt).getTime() <= now.getTime()) return 'expired'
  return status
}

export const stageActionLabel: Record<'interview' | 'offer' | 'hired' | 'closed', string> = {
  interview: 'Назначить интервью',
  offer: 'Сделать оффер',
  hired: 'Отметить найм',
  closed: 'Закрыть',
}
