import test from 'node:test';
import assert from 'node:assert/strict';
import { codeJobPayload, codeRetry, mayCommitCodeResult } from '../src/assessment/code-job.ts';
test('grading jobs contain opaque IDs and bounded retries never invent a wrong answer', () => {
  const id = '11111111-1111-4111-8111-111111111111';
  assert.deepEqual(codeJobPayload({ itemId: id, sessionId: id, candidateId: id, code: 'do not transport' }), { itemId: id, sessionId: id, candidateId: id });
  assert.throws(() => codeJobPayload({ itemId: '../bad' }));
  const now = new Date('2026-10-10T00:00:00Z');
  assert.equal(codeRetry(1, now).availableAt.getTime() - now.getTime(), 5000);
  assert.equal(codeRetry(4, now).failedAt, null);
  assert.equal(codeRetry(5, now).failedAt, now);
  assert.throws(() => codeRetry(0, now));
});
test('late, duplicate, revoked and unfenced code results cannot mutate a test', () => {
  const now = new Date('2026-10-10T00:00:00Z');
  const state = { active: true, deadlineAt: new Date(now.getTime() + 60000), consent: true, answered: true,
    correct: null, tokenMatches: true, claimUntil: new Date(now.getTime() + 30000) };
  assert.equal(mayCommitCodeResult(state, now), true);
  for (const patch of [{ active: false }, { deadlineAt: now }, { consent: false }, { answered: false },
    { correct: false }, { correct: true }, { tokenMatches: false }, { claimUntil: now }, { claimUntil: null }])
    assert.equal(mayCommitCodeResult({ ...state, ...patch }, now), false);
});
