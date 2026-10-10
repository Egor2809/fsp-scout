import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTaskInput, buildTaskSubmission, buildTaskScore } from '../frontend/src/lib/taskForms.ts';
import { recomputeTaskSignal } from '../frontend/src/mocks/lib/taskSignal.ts';
import { taskSignal, validateRubric } from '../backend/src/common/task-policy.ts';

const now = new Date('2026-10-10T10:00:00Z');
const draft = () => ({ title: '  Проверка повторной обработки  ', description: 'Опишите устойчивый к повторной доставке алгоритм обработки платежа.', kind: 'approach', specializations: ['backend'], grades: ['middle'], minutes: '15', language: 'python', starter: 'old code', deadline: '2026-10-12T12:00:00Z', rubric: [{ criterion: 'Корректность', percent: '70' }, { criterion: 'Граничные случаи', percent: '30' }] });

test('reviews accept only integer scores required by the API contract', () => {
  for (const value of ['0', '74', '75', '100']) assert.deepEqual(buildTaskScore(value, '  Feedback  '), { final_score: Number(value), feedback: 'Feedback' });
  assert.deepEqual(buildTaskScore('75', ' '), { final_score: 75, feedback: null });
  for (const value of ['', ' ', '75.5', '-1', '101', 'Infinity', 'NaN']) assert.throws(() => buildTaskScore(value, ''));
  assert.throws(() => buildTaskScore('75', 'x'.repeat(2001)));
});

test('task form sends normalized contract data and converts percentages into a valid server rubric', () => {
  const input = buildTaskInput(draft(), now);
  assert.equal(input.title, 'Проверка повторной обработки');
  assert.deepEqual(input.rubric.map(r => r.weight), [0.7, 0.3]);
  assert.ok(validateRubric(input.rubric));
  assert.equal(input.language, null);
  assert.equal(input.starter_code, null);
  const code = buildTaskInput({ ...draft(), kind: 'code' }, now);
  assert.equal(code.language, 'python');
  assert.equal(code.starter_code, 'old code');
});
test('task form rejects invalid weights, duplicates, empty categories and insufficient deadline', () => {
  for (const patch of [
    { title: '    x    ' }, { description: 'too short' }, { specializations: [] }, { grades: [] },
    { minutes: '4' }, { minutes: '31' }, { minutes: '12.5' }, { deadline: '' },
    { deadline: '2026-10-10T10:15:00Z' },
    { rubric: [{ criterion: 'Один', percent: '99' }] }, { rubric: [{ criterion: 'Один', percent: '' }] },
    { rubric: [{ criterion: 'Один', percent: '50' }, { criterion: ' один ', percent: '50' }] },
    { rubric: [{ criterion: 'Один', percent: '101' }, { criterion: 'Другой', percent: '-1' }] },
    { kind: 'code', language: 'text' },
  ]) assert.throws(() => buildTaskInput({ ...draft(), ...patch }, now), JSON.stringify(patch));
});
test('task solution payload distinguishes code from textual review and does not submit hidden stale code', () => {
  assert.deepEqual(buildTaskSubmission('code', 'python', ' Notes ', ' print(1) '), { answer_text: 'Notes', code: 'print(1)', language: 'python' });
  assert.deepEqual(buildTaskSubmission('review', 'python', ' Use a transaction ', 'old code'), { answer_text: 'Use a transaction', code: null, language: null });
  assert.throws(() => buildTaskSubmission('code', 'python', 'only text', ' '));
  assert.throws(() => buildTaskSubmission('approach', null, ' ', 'code'));
  assert.throws(() => buildTaskSubmission('code', 'python', '', 'x'.repeat(20001)));
});
test('re-review and lowered scores recompute the mock profile without duplicate credits', () => {
  const rows = [{ id: 'a', candidateId: 'c', finalScore: 75, submittedAt: '2026-10-09T10:00:00Z' }, { id: 'b', candidateId: 'c', finalScore: null, submittedAt: now.toISOString() }, { id: 'other', candidateId: 'other', finalScore: 100, submittedAt: now.toISOString() }];
  const first = recomputeTaskSignal(rows, 'c', now);
  assert.deepEqual(first, { fresh: true, solvedCount: 1, lastSolvedAt: rows[0].submittedAt });
  assert.deepEqual(recomputeTaskSignal(rows, 'c', now), first);
  assert.deepEqual(recomputeTaskSignal([...rows, rows[0]], 'c', now), first);
  rows[0].finalScore = 74;
  assert.deepEqual(recomputeTaskSignal(rows, 'c', now), { fresh: false, solvedCount: 0, lastSolvedAt: null });
});
test('mock task signal agrees with production thresholds and inclusive freshness boundary', () => {
  for (const age of [0, 29 * 86400000, 30 * 86400000, 31 * 86400000]) {
    for (const score of [null, 0, 74, 75, 100]) {
      const submittedAt = new Date(now.getTime() - age);
      const actual = recomputeTaskSignal([{ id: 'a', candidateId: 'c', finalScore: score, submittedAt: submittedAt.toISOString() }], 'c', now);
      const expected = taskSignal([{ finalScore: score, submittedAt }], now);
      assert.deepEqual(actual, { fresh: expected.fresh, solvedCount: expected.solved_count, lastSolvedAt: expected.last_solved_at });
    }
  }
});
