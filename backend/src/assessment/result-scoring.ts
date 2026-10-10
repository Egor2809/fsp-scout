import type { Grade, TestOutcome } from '../contract/model/index.js';
import { estimate, type ItemResponse } from '../common/irt.ts';

export const GRADE_ORDER: readonly Grade[] = ['junior', 'middle', 'senior', 'lead'];
export interface GradeCuts { version: string; cuts: Record<Grade, number>; passProbability: number }

export function validateGradeCuts(policy: GradeCuts): void {
  if (!policy.version.trim() || !Number.isFinite(policy.passProbability) || policy.passProbability < 0.7 || policy.passProbability >= 1)
    throw new RangeError('Invalid grade policy');
  const values = GRADE_ORDER.map(grade => policy.cuts[grade]);
  if (values.some((cut, i) => !Number.isFinite(cut) || (i > 0 && cut <= values[i - 1]))) throw new RangeError('Grade cuts must increase strictly');
}
/** Comparing the version label alone cannot detect a misconfigured reused version. */
export function gradePolicySignature(policy: GradeCuts): string {
  validateGradeCuts(policy);
  return JSON.stringify([policy.version, policy.passProbability, ...GRADE_ORDER.map(grade => policy.cuts[grade])]);
}

/** Higher-grade evidence suggests a new test; it does not assign an unattempted grade. */
export function scoreOutcome(responses: readonly ItemResponse[], declaredGrade: Grade, policy: GradeCuts) {
  validateGradeCuts(policy);
  if (!responses.length || responses.some(r => typeof r.correct !== 'boolean')) throw new RangeError('Scoring needs completed objective responses');
  const index = GRADE_ORDER.indexOf(declaredGrade);
  if (index < 0) throw new RangeError('Unknown grade');
  const posterior = estimate(responses);
  const probability = posterior.probabilityAbove(policy.cuts[declaredGrade]);
  const nextGrade = GRADE_ORDER[index + 1] ?? null;
  const nextProbability = nextGrade ? posterior.probabilityAbove(policy.cuts[nextGrade]) : null;
  const outcome: TestOutcome = probability < policy.passProbability ? 'failed'
    : nextProbability !== null && nextProbability >= policy.passProbability ? 'passed_confident' : 'passed';
  return { theta: posterior.theta, se: posterior.se, outcome, probability,
    nextProbability, suggestedHigherGrade: outcome === 'passed_confident' ? nextGrade : null, policyVersion: policy.version };
}

export interface NormObservation { candidateId: string; theta: number }
export function modelPercentile(theta: number): number {
  if (!Number.isFinite(theta)) throw new RangeError('Invalid theta');
  const t = 1 / (1 + 0.3275911 * Math.abs(theta) / Math.SQRT2);
  const erf = 1 - t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-theta * theta / 2);
  return Math.max(1, Math.min(99, Math.round(50 * (1 + Math.sign(theta) * erf))));
}

/** Supply one same-category, same-calibration cohort. The tested candidate is excluded. */
export function empiricalPercentile(theta: number, candidateId: string, cohort: readonly NormObservation[], minimumSize = 30): number | null {
  if (!Number.isFinite(theta) || !Number.isInteger(minimumSize) || minimumSize < 2) throw new RangeError('Invalid percentile request');
  const byCandidate = new Map<string, number>();
  for (const row of cohort) {
    if (!row.candidateId || !Number.isFinite(row.theta)) throw new RangeError('Invalid normative observation');
    if (row.candidateId === candidateId) continue;
    if (byCandidate.has(row.candidateId)) throw new RangeError('Normative cohort must contain one observation per candidate');
    byCandidate.set(row.candidateId, row.theta);
  }
  if (byCandidate.size < minimumSize) return null;
  const values = [...byCandidate.values()];
  const below = values.filter(value => value < theta).length;
  const tied = values.filter(value => value === theta).length;
  return Math.max(1, Math.min(99, Math.round(100 * (below + tied / 2) / values.length)));
}
