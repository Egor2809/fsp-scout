import type { Grade, Specialization, TestOutcome } from '../contract/model/index.js';
import type { NormObservation } from './result-scoring.ts';
import { gradePolicySignature } from './result-scoring.ts';
import { validatePolicy, type SessionPolicy } from './session-state.ts';

/** Selection rules and mandatory gates affect who enters the normative population. */
export function normativePolicySignature(policy: SessionPolicy): string {
  validatePolicy(policy);
  if (!policy.gradeCuts) throw new RangeError('Missing grade policy');
  if (policy.practiceTotal > 0 && (!policy.practiceBankVersion || !policy.practiceLanguage || !policy.practiceRuntimeVersion))
    throw new RangeError('Missing practice policy');
  const canonical = (values?: string[]) => [...new Set(values ?? [])].sort();
  return JSON.stringify([gradePolicySignature(policy.gradeCuts), policy.min, policy.max, policy.targetSe, policy.topK, policy.maxExposure,
    canonical(policy.familyIds), canonical(policy.requiredCompetencies), policy.practiceTotal, policy.approachTotal ?? 0,
    policy.practiceBankVersion ?? null, canonical(policy.practiceFamilyIds), policy.practiceLanguage ?? null, policy.practiceRuntimeVersion ?? null,
    Object.entries(policy.competencyWeights ?? {}).sort(([a], [b]) => a.localeCompare(b))]);
}

export interface NormTest {
  id: string; candidateId: string; bankVersion: string; policyVersion: string; policySignature: string;
  specialization: Specialization; declaredGrade: Grade; assignedGrade: Grade | null;
  assignedSpecialization: Specialization | null; outcome: TestOutcome;
  theta: number; finishedAt: Date;
}
export interface NormCategory { candidateId: string; bankVersion: string; policyVersion: string; policySignature: string; specialization: Specialization; grade: Grade; at: Date }

/** The latest successful confirmed-category observation per other candidate, on the identical scale. */
export function normativeCohort(tests: readonly NormTest[], category: NormCategory): NormObservation[] {
  const eligible = tests.filter(t => t.candidateId !== category.candidateId && t.bankVersion === category.bankVersion
    && t.policyVersion === category.policyVersion && t.policySignature === category.policySignature && t.specialization === category.specialization
    && t.declaredGrade === category.grade && t.assignedGrade === category.grade && t.assignedSpecialization === category.specialization
    && ['passed', 'passed_confident'].includes(t.outcome) && Number.isFinite(t.theta)
    && Number.isFinite(t.finishedAt.getTime()) && t.finishedAt <= category.at)
    .sort((a, b) => b.finishedAt.getTime() - a.finishedAt.getTime() || b.id.localeCompare(a.id));
  const observations = new Map<string, NormObservation>();
  for (const test of eligible) if (!observations.has(test.candidateId)) observations.set(test.candidateId, { candidateId: test.candidateId, theta: test.theta });
  return [...observations.values()];
}
