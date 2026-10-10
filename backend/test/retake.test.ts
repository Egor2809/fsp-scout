import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eligibility, exceptionParent, confirmedGradeAfter, afterDays, type RetakeState, type Attempt } from '../src/common/retake.ts';

const at = new Date('2026-01-01T00:00:00Z');
const attempt: Attempt = { id: 'a', grade: 'middle', startedAt: at, finishedAt: at, outcome: 'passed_confident', exceptionParentId: null };
const base: RetakeState = { surveyCompleted: true, activeTestId: null, currentGrade: 'middle', lastGradeChangeAt: at, experienceYears: 2, attempts: [attempt] };
test('exception permits a diagnostic test but cannot change confirmed grade within 90 days', () => {
  const now = afterDays(at, 1);
  assert.equal(eligibility(base, now).find(g => g.grade === 'senior')!.can_start, true);
  assert.equal(exceptionParent(base, 'senior'), 'a');
  assert.equal(confirmedGradeAfter(base, 'senior', 'passed', now), 'middle');
  assert.equal(confirmedGradeAfter(base, 'senior', 'passed', afterDays(at, 90)), 'senior');
});
test('exception is consumed at start even if follow-up is abandoned; no cascades', () => {
  const follow: Attempt = { ...attempt, id: 'b', grade: 'senior', startedAt: afterDays(at, 1), finishedAt: null, outcome: null, exceptionParentId: 'a' };
  const state = { ...base, attempts: [attempt, follow] };
  assert.equal(exceptionParent(state, 'senior'), null);
  assert.equal(exceptionParent({ ...state, attempts: [attempt, { ...follow, outcome: 'passed_confident' as const, finishedAt: afterDays(at, 1) }] }, 'lead'), null);
  assert.equal(eligibility(state, afterDays(at, 2)).find(g => g.grade === 'senior')!.can_start, false);
});
test('same-grade lock wins over an exception and exposes the later blocking date', () => {
  const earlier: Attempt = { ...attempt, id: 'old', grade: 'junior', startedAt: afterDays(at, -1), finishedAt: afterDays(at, -1) };
  const state: RetakeState = { ...base, attempts: [earlier, { ...attempt, outcome: 'failed' }] };
  const row = eligibility(state, afterDays(at, 1)).find(g => g.grade === 'junior')!;
  assert.equal(row.can_start, false);
  assert.equal(row.available_at, afterDays(at, 90).toISOString());
  assert.equal(confirmedGradeAfter(state, 'junior', 'failed', afterDays(at, 100)), 'middle');
});
test('global category-change cooldown survives specialization switch; boundary is inclusive', () => {
  const state: RetakeState = { ...base, currentGrade: null, attempts: [] };
  assert.ok(eligibility(state, afterDays(at, 89)).every(g => !g.can_start));
  assert.ok(eligibility(state, afterDays(at, 90)).every(g => g.can_start));
  assert.ok(eligibility({ ...state, surveyCompleted: false }, afterDays(at, 90)).every(g => g.reason === 'survey_required'));
  assert.ok(eligibility({ ...state, activeTestId: 'x' }, afterDays(at, 90)).every(g => g.reason === 'test_in_progress'));
});
