import type { Grade } from '../contract/model/grade.js';
import type { TestOutcome } from '../contract/model/testOutcome.js';
import type { GradeEligibility } from '../contract/model/gradeEligibility.js';

export const GRADES: readonly Grade[] = ['junior', 'middle', 'senior', 'lead'];
const DAY = 86_400_000;
export const afterDays = (at: Date, days: number): Date => new Date(at.getTime() + days * DAY);
export interface Attempt {
  id: string;
  grade: Grade;
  startedAt: Date;
  finishedAt: Date | null;
  outcome: TestOutcome | null;
  /** Set at START, so abandoning or expiring an exceptional attempt consumes it. */
  exceptionParentId: string | null;
}
export interface RetakeState {
  surveyCompleted: boolean;
  activeTestId: string | null;
  currentGrade: Grade | null;
  lastGradeChangeAt: Date | null;
  experienceYears: number | null;
  /** Attempts only in the requested specialization; grade-change timestamp is global. */
  attempts: readonly Attempt[];
}
export function gradeChangeAvailable(state: Pick<RetakeState, 'lastGradeChangeAt'>, now: Date): boolean {
  return !state.lastGradeChangeAt || now >= afterDays(state.lastGradeChangeAt, 90);
}

/** One exceptional follow-up, never a chain and never a bypass of the 30-day same-grade lock. */
export function exceptionParent(state: RetakeState, grade: Grade): string | null {
  const latest = [...state.attempts].sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime() || b.id.localeCompare(a.id))[0];
  if (!latest?.finishedAt || latest.exceptionParentId || !latest.outcome) return null;
  if (state.attempts.some(a => a.exceptionParentId === latest.id)) return null;
  const offset = latest.outcome === 'failed' ? -1 : latest.outcome === 'passed_confident' ? 1 : 0;
  return offset !== 0 && GRADES[GRADES.indexOf(latest.grade) + offset] === grade ? latest.id : null;
}

export function eligibility(state: RetakeState, now: Date): GradeEligibility[] {
  const recommended = state.experienceYears === null ? null : state.experienceYears < 1 ? 'junior'
    : state.experienceYears < 3 ? 'middle' : state.experienceYears < 6 ? 'senior' : 'lead';
  return GRADES.map(grade => {
    const base = { grade, recommended: grade === recommended };
    const deny = (reason: NonNullable<GradeEligibility['reason']>, at: Date | null): GradeEligibility =>
      ({ ...base, can_start: false, reason, available_at: at?.toISOString() ?? null });
    if (!state.surveyCompleted) return deny('survey_required', null);
    if (state.activeTestId) return deny('test_in_progress', null);
    const previous = state.attempts.filter(a => a.grade === grade).sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())[0];
    const retakeAt = previous ? afterDays(previous.finishedAt ?? previous.startedAt, 30) : null;
    const changeAt = state.lastGradeChangeAt ? afterDays(state.lastGradeChangeAt, 90) : null;
    const changing = grade !== state.currentGrade;
    // Both constraints must have elapsed; expose the later date when both apply.
    if (retakeAt && now < retakeAt) {
      const available = changing && changeAt && changeAt > retakeAt ? changeAt : retakeAt;
      const parent = previous?.exceptionParentId ? state.attempts.find(a => a.id === previous.exceptionParentId) : null;
      return deny(parent?.outcome === 'failed' ? 'lower_attempt_used' : 'retake_cooldown', available);
    }
    if (changing && changeAt && now < changeAt && !exceptionParent(state, grade)) return deny('grade_change_cooldown', changeAt);
    return { ...base, can_start: true, reason: null, available_at: null };
  });
}

/** Called again under the candidate row lock at finish, independent of start eligibility. */
export function confirmedGradeAfter(state: RetakeState, requested: Grade, outcome: TestOutcome, now: Date): Grade | null {
  if (outcome === 'failed') return state.currentGrade;
  if (requested === state.currentGrade || gradeChangeAvailable(state, now)) return requested;
  return state.currentGrade;
}
