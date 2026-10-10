import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreOutcome, empiricalPercentile, validateGradeCuts, gradePolicySignature } from '../src/assessment/result-scoring.ts';
const policy = { version: 'test-fixture-only', cuts: { junior: -1.5, middle: -0.5, senior: 0.5, lead: 1.5 }, passProbability: 0.7 };
test('posterior outcome uses explicit ordered thresholds and higher evidence only suggests a separate attempt', () => {
  const strong = Array.from({ length: 18 }, () => ({ a: 1.5, b: 1, correct: true }));
  const result = scoreOutcome(strong, 'middle', policy);
  assert.equal(result.outcome, 'passed_confident');
  assert.equal(result.suggestedHigherGrade, 'senior');
  assert.equal(result.policyVersion, policy.version);
  const weak = scoreOutcome(strong.map(r => ({ ...r, correct: false })), 'middle', policy);
  assert.equal(weak.outcome, 'failed');
  assert.equal(weak.suggestedHigherGrade, null);
  assert.notEqual(scoreOutcome(strong, 'lead', policy).outcome, 'passed_confident');
  assert.throws(() => scoreOutcome([], 'junior', policy));
  assert.throws(() => validateGradeCuts({ ...policy, cuts: { ...policy.cuts, senior: -1 } }));
  assert.throws(() => validateGradeCuts({ ...policy, passProbability: 0.5 }));
  assert.notEqual(gradePolicySignature(policy), gradePolicySignature({ ...policy, cuts: { ...policy.cuts, lead: 2 } }));
});
test('normative percentile excludes self, handles ties and refuses artificial duplicated observations', () => {
  const cohort = [{ candidateId: 'a', theta: -1 }, { candidateId: 'b', theta: 0 }, { candidateId: 'c', theta: 1 }, { candidateId: 'self', theta: -100 }];
  assert.equal(empiricalPercentile(0, 'self', cohort, 3), 50);
  assert.equal(empiricalPercentile(0, 'self', cohort, 4), null);
  assert.equal(empiricalPercentile(-2, 'self', cohort, 3), 1);
  assert.equal(empiricalPercentile(2, 'self', cohort, 3), 99);
  assert.throws(() => empiricalPercentile(0, 'self', [...cohort, cohort[0]], 3));
  assert.throws(() => empiricalPercentile(NaN, 'self', cohort));
});
