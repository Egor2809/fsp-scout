import { test } from 'node:test';
import assert from 'node:assert/strict';
import { taskEligible, taskSignal, validateRubric, TASK_COOLDOWN_MS, FRESH_SIGNAL_MS } from '../src/common/task-policy.ts';
test('task assignment interval is global and includes the exact two-week boundary', () => {
  const now = new Date('2026-10-10T10:00:00Z');
  assert.equal(taskEligible(null, now), true);
  assert.equal(taskEligible(new Date(now.getTime() - TASK_COOLDOWN_MS + 1), now), false);
  assert.equal(taskEligible(new Date(now.getTime() - TASK_COOLDOWN_MS), now), true);
});
test('rubric requires contract weights summing to one and distinct nonempty criteria', () => {
  assert.equal(validateRubric([{ criterion: 'Correctness', weight: 0.7 }, { criterion: 'Edge cases', weight: 0.3 }]), true);
  assert.equal(validateRubric([{ criterion: 'Correctness', weight: 1 }, { criterion: 'Informational', weight: 0 }]), true);
  for (const rubric of [[], [{ criterion: 'Correctness', weight: 0.99 }], [{ criterion: 'Correctness', weight: 1.1 }, { criterion: 'Invalid', weight: -0.1 }], [{ criterion: 'ABC', weight: 0.5 }, { criterion: 'abc', weight: 0.5 }]]) assert.equal(validateRubric(rubric), false);
});
test('task signal counts unique persisted solutions, expires and retracts on corrected review', () => {
  const now = new Date('2026-10-10T10:00:00Z'), last = new Date(now.getTime() - 1000);
  assert.deepEqual(taskSignal([{ finalScore: 75, submittedAt: last }, { finalScore: null, submittedAt: now }, { finalScore: 74, submittedAt: now }], now), { fresh: true, solved_count: 1, last_solved_at: last.toISOString() });
  assert.equal(taskSignal([{ finalScore: 100, submittedAt: new Date(now.getTime() - FRESH_SIGNAL_MS) }], now).fresh, false);
  assert.equal(taskSignal([{ finalScore: 74, submittedAt: last }], now).solved_count, 0);
});
