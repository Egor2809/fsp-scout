export type InvitationStatus = 'draft' | 'sent' | 'viewed' | 'postponed' | 'accepted' | 'interview' | 'offer' | 'hired' | 'closed' | 'declined' | 'expired' | 'withdrawn';
export type Actor = 'candidate' | 'employer' | 'system';
export interface InvitationState { status: InvitationStatus; expiresAt: Date; postponedOnce: boolean }
export class InvalidInvitationTransition extends Error {}
const ACTIVE: readonly InvitationStatus[] = ['sent', 'viewed', 'postponed'];
const FOLLOW_UP: Partial<Record<InvitationStatus, readonly InvitationStatus[]>> = {
  accepted: ['interview', 'closed'], interview: ['offer', 'closed'], offer: ['hired', 'closed'],
};

/** Pure transition policy; the caller must lock the row before persisting it. */
export function transition(state: InvitationState, next: InvitationStatus, actor: Actor, now: Date): InvitationState {
  if (!Number.isFinite(now.getTime()) || !Number.isFinite(state.expiresAt.getTime())) throw new InvalidInvitationTransition('Invalid timestamp');
  if (ACTIVE.includes(state.status) && state.expiresAt <= now) {
    if (actor === 'system' && next === 'expired') return { ...state, status: 'expired' };
    throw new InvalidInvitationTransition('Invitation expired');
  }
  let allowed = false;
  if (actor === 'candidate') {
    allowed = (state.status === 'sent' && next === 'viewed')
      || (ACTIVE.includes(state.status) && ['accepted', 'declined'].includes(next))
      || (['sent', 'viewed'].includes(state.status) && next === 'postponed' && !state.postponedOnce);
  } else if (actor === 'employer') {
    allowed = (ACTIVE.includes(state.status) && next === 'withdrawn')
      || Boolean(FOLLOW_UP[state.status]?.includes(next));
  }
  if (!allowed) throw new InvalidInvitationTransition('Forbidden state transition');
  return { ...state, status: next, postponedOnce: state.postponedOnce || next === 'postponed' };
}

/** Moscow currently uses UTC+3; use IANA Intl conversion for future rule changes. */
export function quotaPeriod(now: Date): { start: Date; end: Date } {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const get = (type: string) => Number(parts.find(p => p.type === type)?.value);
  const local = new Date(Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second')));
  const offset = local.getTime() - Math.floor(now.getTime() / 1000) * 1000;
  local.setUTCHours(0, 0, 0, 0);
  local.setUTCDate(local.getUTCDate() - (local.getUTCDay() + 6) % 7);
  const start = new Date(local.getTime() - offset);
  return { start, end: new Date(start.getTime() + 7 * 86400000) };
}
