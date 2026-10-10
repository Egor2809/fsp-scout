import type { TestProgress } from '../contract/model/testProgress.js';
import type { CatPolicy } from '../common/cat.ts';
import type { Answer } from '../contract/model/answer.js';
import type { GradeCuts } from './result-scoring.ts';
import type { CodeLanguage, TestBlueprint } from '../contract/model/index.js';
export interface SessionPolicy extends CatPolicy {
  practiceTotal: number; familyIds?: string[]; requiredCompetencies?: string[]; gradeCuts?: GradeCuts;
  practiceBankVersion?: string; practiceFamilyIds?: string[]; practiceLanguage?: CodeLanguage; practiceRuntimeVersion?: string; approachTotal?: number;
  vacancyBlueprint?: TestBlueprint;
  skillConfirmationPolicyVersion?: string;
}
export const DEFAULT_POLICY: SessionPolicy = { min: 10, max: 18, targetSe: 0.35, topK: 5, maxExposure: 0.2, practiceTotal: 1, approachTotal: 1 };
export interface IssuedItem { id: string; ordinal: number; block: 'adaptive' | 'practice' | 'approach'; answeredAt: Date | null; correct: boolean | null }

export function validatePolicy(policy: SessionPolicy): void {
  if (policy.competencyWeights && (Object.values(policy.competencyWeights).some(w => !Number.isFinite(w) || w <= 0)
    || Math.abs(Object.values(policy.competencyWeights).reduce((sum, w) => sum + w, 0) - 1) > 1e-8
    || policy.requiredCompetencies?.some(id => !policy.competencyWeights![id]))) throw new Error('Invalid saved competency weights');
  if (!Number.isInteger(policy.min) || policy.min < 1 || !Number.isInteger(policy.max) || policy.max < policy.min
    || !Number.isFinite(policy.targetSe) || policy.targetSe <= 0 || !Number.isInteger(policy.topK) || policy.topK < 1
    || !Number.isFinite(policy.maxExposure) || policy.maxExposure <= 0 || policy.maxExposure > 1
    || !Number.isInteger(policy.practiceTotal) || policy.practiceTotal < 0
    || (policy.approachTotal !== undefined && (!Number.isInteger(policy.approachTotal) || policy.approachTotal < 0))) throw new Error('Invalid saved assessment policy');
}
export function progress(items: readonly IssuedItem[], policy: SessionPolicy, adaptiveDone = false): TestProgress {
  validatePolicy(policy);
  const adaptive = items.filter(i => i.block === 'adaptive' && i.answeredAt !== null).length;
  const practice = items.filter(i => i.block === 'practice' && i.answeredAt !== null).length;
  const approach = items.filter(i => i.block === 'approach' && i.answeredAt !== null).length;
  const current = items.find(i => i.answeredAt === null);
  return { block: current?.block ?? ((adaptiveDone || adaptive >= policy.max) && practice < policy.practiceTotal ? 'practice'
    : practice >= policy.practiceTotal && approach < (policy.approachTotal ?? 0) ? 'approach' : 'adaptive'),
    answered: items.filter(i => i.answeredAt !== null).length, adaptive_answered: adaptive, adaptive_min: policy.min, adaptive_max: policy.max,
    practice_answered: practice, practice_total: policy.practiceTotal };
}
export function canonicalAnswer(answer: Answer): string {
  return JSON.stringify({ option_ids: answer.option_ids ? [...answer.option_ids].sort() : undefined,
    text: answer.text, code: answer.code, language: answer.language, ...(answer.skipped ? { skipped: true } : {}) });
}
export function currentItem(items: readonly IssuedItem[]): IssuedItem | null {
  const outstanding = items.filter(i => i.answeredAt === null);
  if (outstanding.length > 1) throw new Error('Multiple outstanding assessment items');
  return outstanding[0] ?? null;
}
export type AnswerDisposition = 'accept' | 'replay' | 'conflict' | 'not_current';
/** Caller compares canonical parsed answers; timing counters are not part of the answer identity. */
export function answerDisposition(item: IssuedItem, current: IssuedItem | null, sameAnswer: boolean): AnswerDisposition {
  if (item.answeredAt !== null) return sameAnswer ? 'replay' : 'conflict';
  return item.id === current?.id ? 'accept' : 'not_current';
}
/** Prospective observed rate across started sessions; no synthetic bootstrap observations. */
export function exposure(sessionCount: number, servedCount: number, ceiling: number) {
  if (![sessionCount, servedCount].every(Number.isInteger) || sessionCount < 0 || servedCount < 0 || servedCount > sessionCount
    || !Number.isFinite(ceiling) || ceiling <= 0 || ceiling > 1) throw new RangeError('Invalid exposure counters');
  const capacity = Math.floor(sessionCount * ceiling + 1e-12);
  return { observedRate: sessionCount ? servedCount / sessionCount : 0, prospectiveRate: sessionCount ? (servedCount + 1) / sessionCount : null, canServe: servedCount + 1 <= capacity };
}
