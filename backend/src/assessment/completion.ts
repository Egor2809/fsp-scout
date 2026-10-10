import { estimate, type ItemResponse } from '../common/irt.ts';
import { currentItem, validatePolicy, type IssuedItem, type SessionPolicy } from './session-state.ts';
import type { Grade } from '../contract/model/index.js';
import { scoreOutcome, validateGradeCuts, GRADE_ORDER, type GradeCuts } from './result-scoring.ts';

export interface CompletionItem extends IssuedItem {
  competency: string; discrimination: number; difficulty: number;
}
export type CompletionReadiness = 'ready' | 'unanswered' | 'pending_grading' | 'adaptive_incomplete' | 'coverage_incomplete' | 'practice_incomplete' | 'approach_incomplete';

/** Only issued outstanding items become persisted skips; unissued instances are never invented. */
export function skipOutstanding<T extends CompletionItem>(items: readonly T[], at: Date): { items: T[]; skippedIds: string[] } {
  currentItem(items);
  if (!Number.isFinite(at.getTime())) throw new RangeError('Invalid finish time');
  const skippedIds = items.filter(i => i.answeredAt === null).map(i => i.id);
  return { items: items.map(i => i.answeredAt === null ? { ...i, answeredAt: at, correct: false } : { ...i }), skippedIds };
}

/** Insufficient assessment evidence cannot confirm a grade solely from the prior or a few answers. */
export function scoreCompletion(items: readonly CompletionItem[], policy: SessionPolicy, grade: Grade, cuts: GradeCuts) {
  validateGradeCuts(cuts);
  const readiness = completionReadiness(items, policy);
  if (readiness === 'unanswered' || readiness === 'pending_grading') throw new Error('Complete/grade issued responses before scoring');
  const observations = items.filter(i => i.block === 'adaptive').map(i => ({ a: i.discrimination, b: i.difficulty, correct: i.correct! }));
  if (readiness === 'ready' && (policy.practiceTotal === 0 || (policy.approachTotal ?? 0) >= 1)) {
    const scored = scoreOutcome(observations, grade, cuts);
    const practiceFailed = items.filter(i => i.block === 'practice' || i.block === 'approach').some(i => i.correct !== true);
    return { ...scored, ...(practiceFailed ? { outcome: 'failed' as const, suggestedHigherGrade: null } : {}), incomplete: false, practiceFailed };
  }
  const posterior = estimate(observations);
  const index = GRADE_ORDER.indexOf(grade);
  if (index < 0) throw new RangeError('Unknown grade');
  const next = GRADE_ORDER[index + 1];
  return { theta: posterior.theta, se: posterior.se, outcome: 'failed' as const, probability: posterior.probabilityAbove(cuts.cuts[grade]),
    nextProbability: next ? posterior.probabilityAbove(cuts.cuts[next]) : null, suggestedHigherGrade: null,
    policyVersion: cuts.version, incomplete: true, practiceFailed: false };
}

/** Same stopping rule as next: reaching the minimum alone is not completion. */
export function completionReadiness(items: readonly CompletionItem[], policy: SessionPolicy): CompletionReadiness {
  validatePolicy(policy);
  if (currentItem(items)) return 'unanswered';
  if (items.some(item => item.correct === null)) return 'pending_grading';
  const adaptive = items.filter(item => item.block === 'adaptive');
  if (adaptive.length < policy.min) return 'adaptive_incomplete';
  const observations: ItemResponse[] = adaptive.map(item => ({ a: item.discrimination, b: item.difficulty, correct: item.correct! }));
  if (adaptive.length < policy.max && estimate(observations).se > policy.targetSe) return 'adaptive_incomplete';
  if (policy.requiredCompetencies?.some(id => !adaptive.some(item => item.competency === id))) return 'coverage_incomplete';
  if (items.filter(item => item.block === 'practice').length < policy.practiceTotal) return 'practice_incomplete';
  // A failed practice already fails the assessment; no misleading clarification is fabricated for broken code.
  if (!items.some(item => item.block === 'practice' && item.correct === false)
    && items.filter(item => item.block === 'approach').length < (policy.approachTotal ?? 0)) return 'approach_incomplete';
  return 'ready';
}

/** Prefix estimates describe the actual trajectory, not re-estimated/fabricated difficulty. */
export function resultTrace(items: readonly CompletionItem[]) {
  const observations: ItemResponse[] = [];
  return [...items].filter(item => item.block === 'adaptive' && item.answeredAt !== null).sort((a, b) => a.ordinal - b.ordinal).map(item => {
    if (typeof item.correct !== 'boolean') throw new Error('Unscored response in trace');
    observations.push({ a: item.discrimination, b: item.difficulty, correct: item.correct });
    const posterior = estimate(observations);
    return { index: item.ordinal, difficulty_level: Math.max(1, Math.min(5, Math.round(item.difficulty + 3))),
      correct: item.correct, theta: posterior.theta, se: posterior.se };
  });
}

export function competencyScores(items: readonly CompletionItem[]) {
  const groups = new Map<string, { count: number; correct: number }>();
  for (const item of items) {
    if (item.answeredAt === null || typeof item.correct !== 'boolean') continue;
    const group = groups.get(item.competency) ?? { count: 0, correct: 0 };
    group.count++; group.correct += Number(item.correct);
    groups.set(item.competency, group);
  }
  return [...groups].map(([id, group]) => ({ competency_id: id, name: id,
    score: Math.round(100 * group.correct / group.count), items: group.count }));
}
