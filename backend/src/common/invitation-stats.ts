import type { InvitationStats } from '../contract/model/invitationStats.js';
import type { DeclineReason } from '../contract/model/declineReason.js';
export interface StatsInvitation {
  sentAt: Date;
  viewedAt: Date | null;
  response: { decision?: unknown; reason?: unknown } | null;
  events: { at: Date; status: string; actor: string }[];
}
/** Cohort is selected by send date by the caller. Stages count ever reached, not current status. */
export function invitationStats(rows: readonly StatsInvitation[], days: number): InvitationStats {
  const reached = (status: string) => rows.filter(r => r.events.some(e => e.status === status)).length;
  const funnel = { sent: rows.length, viewed: rows.filter(r => r.viewedAt || r.events.some(e => e.actor === 'candidate')).length,
    accepted: reached('accepted'), declined: reached('declined'), postponed: reached('postponed'), expired: reached('expired'),
    withdrawn: reached('withdrawn'), interview: reached('interview'), offer: reached('offer'), hired: reached('hired') };
  const reasons = new Map<DeclineReason, number>();
  for (const r of rows) if (r.response?.decision === 'declined' && ['salary', 'stack', 'format', 'company', 'not_looking', 'other'].includes(String(r.response.reason))) {
    const reason = r.response.reason as DeclineReason;
    reasons.set(reason, (reasons.get(reason) ?? 0) + 1);
  }
  const hours = rows.flatMap(r => {
    const response = r.events.filter(e => e.actor === 'candidate' && ['accepted', 'declined', 'postponed'].includes(e.status)).sort((a, b) => a.at.getTime() - b.at.getTime())[0];
    const elapsed = response ? (response.at.getTime() - r.sentAt.getTime()) / 3600000 : NaN;
    return Number.isFinite(elapsed) && elapsed >= 0 ? [elapsed] : [];
  }).sort((a, b) => a - b);
  const mid = Math.floor(hours.length / 2);
  const median = !hours.length ? null : hours.length % 2 ? hours[mid]! : (hours[mid - 1]! + hours[mid]!) / 2;
  const answered = funnel.accepted + funnel.declined;
  return { days, funnel, decline_reasons: [...reasons].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason)),
    acceptance_rate: answered ? Math.round(funnel.accepted / answered * 10000) / 10000 : 0,
    median_response_hours: median === null ? null : Math.round(median * 10) / 10 };
}
