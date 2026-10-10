import { test } from 'node:test';
import assert from 'node:assert/strict';
import { progress, currentItem, answerDisposition, canonicalAnswer, exposure, DEFAULT_POLICY, type IssuedItem } from '../src/assessment/session-state.ts';

const issued = (ordinal: number, answered = false, block: IssuedItem['block'] = 'adaptive'): IssuedItem => ({ id: String(ordinal), ordinal, block, answeredAt: answered ? new Date() : null, correct: answered ? true : null });
test('progress does not confuse minimum length with actual CAT stopping', () => {
  const policy = { ...DEFAULT_POLICY, practiceTotal: 1 };
  const items = Array.from({ length: policy.min }, (_, i) => issued(i + 1, true));
  assert.equal(progress(items, policy).block, 'adaptive');
  assert.equal(progress(items, policy, true).block, 'practice');
  assert.equal(progress([...items, issued(11, false, 'practice')], policy).block, 'practice');
  assert.equal(progress([...items, issued(11, true, 'practice')], policy, true).practice_answered, 1);
  assert.equal(progress(items, policy).answered, policy.min);
  assert.throws(() => progress(items, { ...policy, targetSe: NaN }), /policy/);
});
test('one outstanding item is stable; duplicate responses replay only the same answer', () => {
  const first = issued(1, true), current = issued(2);
  assert.equal(currentItem([first, current])?.id, '2');
  assert.throws(() => currentItem([issued(1), current]), /Multiple outstanding/);
  assert.equal(answerDisposition(current, current, false), 'accept');
  assert.equal(answerDisposition(current, null, false), 'not_current');
  assert.equal(answerDisposition(first, current, true), 'replay');
  assert.equal(answerDisposition(first, current, false), 'conflict');
  assert.equal(canonicalAnswer({ option_ids: ['b', 'a'] }), canonicalAnswer({ skipped: false, option_ids: ['a', 'b'] }));
  assert.notEqual(canonicalAnswer({ text: '1' }), canonicalAnswer({ text: '2' }));
});
test('exposure uses real sessions and checks prospective capacity without bootstrap observations', () => {
  assert.equal(exposure(1, 0, 0.2).canServe, true);
  assert.equal(exposure(5, 5, 0.2).canServe, false);
  assert.equal(exposure(5, 0, 0.2).canServe, true);
  assert.equal(exposure(1, 1, 0.2).observedRate, 1);
  assert.equal(exposure(49, 10, 0.2).canServe, false);
  assert.equal(exposure(100, 19, 0.2).canServe, true);
  assert.equal(exposure(100, 20, 0.2).canServe, false);
  assert.equal(exposure(100, 20, 0.2).prospectiveRate, 0.21);
  assert.throws(() => exposure(10, 11, 0.2), RangeError);
});
