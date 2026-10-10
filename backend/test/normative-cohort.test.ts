import test from 'node:test';
import assert from 'node:assert/strict';
import { normativeCohort, normativePolicySignature, type NormTest } from '../src/assessment/normative-cohort.ts';
import { DEFAULT_POLICY, type SessionPolicy } from '../src/assessment/session-state.ts';
const now = new Date('2026-10-10T00:00:00Z');
test('normative populations distinguish mandatory gates, practice versions and adaptive selection rules', () => {
  const policy: SessionPolicy = { ...DEFAULT_POLICY, familyIds: ['b', 'a'], requiredCompetencies: ['sql'],
    practiceBankVersion: 'p1', practiceFamilyIds: ['x', 'y'], practiceLanguage: 'python', practiceRuntimeVersion: '3.12.0',
    gradeCuts: { version: 'v1', passProbability: 0.8, cuts: { junior: -1, middle: 0, senior: 1, lead: 2 } } };
  const signature = normativePolicySignature(policy);
  assert.equal(normativePolicySignature({ ...policy, familyIds: ['a', 'b'] }), signature);
  for (const patch of [{ approachTotal: 0 }, { practiceBankVersion: 'p2' }, { practiceTotal: 2 }, { max: 20 },
    { targetSe: 0.3 }, { requiredCompetencies: ['http'] }, { practiceRuntimeVersion: '3.13.0' }])
    assert.notEqual(normativePolicySignature({ ...policy, ...patch }), signature);
  assert.throws(() => normativePolicySignature({ ...policy, practiceBankVersion: undefined }));
});
const category = { candidateId: 'self', bankVersion: 'bank1', policyVersion: 'cuts1', policySignature: 'exact-cuts', specialization: 'backend' as const, grade: 'middle' as const, at: now };
const observation: NormTest = { id: 't1', candidateId: 'a', bankVersion: 'bank1', policyVersion: 'cuts1', policySignature: 'exact-cuts', specialization: 'backend',
  declaredGrade: 'middle', assignedGrade: 'middle', assignedSpecialization: 'backend', outcome: 'passed', theta: 0, finishedAt: new Date('2026-10-09') };
test('norms exclude self, failed/diagnostic attempts, future results and different calibration/category', () => {
  const invalid: Partial<NormTest>[] = [{ candidateId: 'self' }, { bankVersion: 'bank2' }, { policyVersion: 'cuts2' }, { policySignature: 'changed-cuts-with-same-version' },
    { specialization: 'qa' }, { declaredGrade: 'senior' }, { assignedGrade: 'junior' }, { assignedSpecialization: 'qa' },
    { outcome: 'failed' }, { theta: NaN }, { finishedAt: new Date('2026-10-11') }];
  assert.deepEqual(normativeCohort([observation, ...invalid.map((patch, i) => ({ ...observation, id: `bad${i}`, ...patch }))], category), [{ candidateId: 'a', theta: 0 }]);
});
test('norms use latest eligible attempt once per candidate with deterministic ties', () => {
  const tests = [observation, { ...observation, id: 't2', theta: 1, finishedAt: now }, { ...observation, id: 't3', theta: 2, finishedAt: now },
    { ...observation, id: 'tb', candidateId: 'b', theta: -1 }];
  assert.deepEqual(normativeCohort(tests, category), [{ candidateId: 'a', theta: 2 }, { candidateId: 'b', theta: -1 }]);
});
