import type { TestProgress } from '../contract/model/testProgress.js';
import type { CatPolicy } from '../common/cat.ts';
import type { Answer } from '../contract/model/answer.js';
import type { GradeCuts } from './result-scoring.ts';
import type { CodeLanguage, TestBlueprint } from '../contract/model/index.js';
export interface SessionPolicy extends CatPolicy {
  express?: boolean;
  practiceTotal: number; familyIds?: string[]; requiredCompetencies?: string[]; waivedCompetencies?: string[]; gradeCuts?: GradeCuts;
  practiceBankVersion?: string; practiceFamilyIds?: string[]; practiceLanguage?: CodeLanguage; practiceRuntimeVersion?: string; approachTotal?: number;
  vacancyBlueprint?: TestBlueprint;
  skillConfirmationPolicyVersion?: string;
}
export function coveredCompetencies(policy: SessionPolicy): string[] {
  return (policy.requiredCompetencies ?? []).filter(id => !policy.waivedCompetencies?.includes(id));
}
export const DEFAULT_GRADE_POLICY = JSON.stringify({ version: 'expert-cuts-20261010-v2', cuts: { junior: -1.2, middle: -0.4, senior: 0.4, lead: 1.2 }, passProbability: 0.6 });
export const DEFAULT_POLICY: SessionPolicy = { min: 8, max: 14, targetSe: 0.4, topK: 3, maxExposure: 0.4, choiceShare: 0.17, practiceTotal: 1, approachTotal: 1 };
export function assessmentMode(setting?: string): { policy: SessionPolicy; timeLimitSec: number } {
  return setting === 'true'
    ? { policy: { ...DEFAULT_POLICY, express: true, min: 5, max: 6, practiceTotal: 0, approachTotal: 0 }, timeLimitSec: 600 }
    : { policy: { ...DEFAULT_POLICY, express: false }, timeLimitSec: 2400 };
}
export function fullAttempts<T extends { policy: unknown }>(rows: readonly T[]): T[] {
  return rows.filter(row => (row.policy as { express?: unknown } | null)?.express !== true);
}
export function confirmsCategory(policy: SessionPolicy, passed: boolean, permitted: boolean): boolean {
  return policy.express !== true && passed && permitted;
}
export interface IssuedItem { id: string; ordinal: number; block: 'adaptive' | 'practice' | 'approach'; answeredAt: Date | null; correct: boolean | null }

export function validatePolicy(policy: SessionPolicy): void {
  if (policy.express !== undefined && typeof policy.express !== 'boolean') throw new Error('Invalid saved assessment mode');
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
  const capacity = Math.max(Math.floor(sessionCount * ceiling + 1e-12), Math.ceil(1 / ceiling));
  return { observedRate: sessionCount ? servedCount / sessionCount : 0, prospectiveRate: sessionCount ? (servedCount + 1) / sessionCount : null, canServe: servedCount + 1 <= capacity };
}
