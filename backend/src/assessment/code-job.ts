export const CODE_JOB_TOPIC = 'assessment.code_submitted';
export const CODE_JOB_MAX_ATTEMPTS = 5;
export const CODE_JOB_LEASE_MS = 180000;
export function codeJobPayload(value: unknown): { itemId: string; sessionId: string; candidateId: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid code job payload');
  const v = value as Record<string, unknown>;
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (![v.itemId, v.sessionId, v.candidateId].every(id => typeof id === 'string' && uuid.test(id))) throw new Error('Invalid code job identifiers');
  return { itemId: v.itemId as string, sessionId: v.sessionId as string, candidateId: v.candidateId as string };
}
export function codeRetry(attempt: number, now: Date) {
  if (!Number.isInteger(attempt) || attempt < 1 || !Number.isFinite(now.getTime())) throw new RangeError('Invalid retry state');
  return { failedAt: attempt >= CODE_JOB_MAX_ATTEMPTS ? now : null,
    availableAt: new Date(now.getTime() + Math.min(60000, 5000 * 2 ** Math.min(attempt - 1, 4))) };
}
export function mayCommitCodeResult(state: { active: boolean; deadlineAt: Date; consent: boolean; answered: boolean;
  correct: boolean | null; tokenMatches: boolean; claimUntil: Date | null }, now: Date): boolean {
  return state.active && state.deadlineAt > now && state.consent && state.answered && state.correct === null
    && state.tokenMatches && state.claimUntil !== null && state.claimUntil > now;
}
