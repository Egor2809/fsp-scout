import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applicationTransition } from '../src/common/application-state.ts';
test('application pipeline cannot skip to hired, reopen terminal states, or impersonate candidate', () => {
  assert.equal(applicationTransition('submitted', 'hired', 'employer'), false);
  assert.equal(applicationTransition('submitted', 'interview', 'employer'), true);
  assert.equal(applicationTransition('interview', 'offer', 'employer'), true);
  assert.equal(applicationTransition('offer', 'hired', 'employer'), true);
  for (const status of ['hired', 'rejected', 'withdrawn'] as const) assert.equal(applicationTransition(status, 'viewed', 'employer'), false);
  assert.equal(applicationTransition('offer', 'withdrawn', 'candidate'), true);
  assert.equal(applicationTransition('hired', 'withdrawn', 'candidate'), false);
  assert.equal(applicationTransition('submitted', 'withdrawn', 'employer'), false);
  assert.equal(applicationTransition('submitted', 'interview', 'candidate'), false);
});
