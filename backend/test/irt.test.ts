import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimate, information, probability } from '../src/common/irt.ts';

test('2PL is symmetric at difficulty and information peaks there', () => {
  const item = { a: 1.7, b: 0.4 };
  assert.equal(probability(0.4, item), 0.5);
  assert.ok(information(0.4, item) > information(2, item));
});
test('EAP recovers the prior without evidence and updates with answers', () => {
  assert.ok(Math.abs(estimate([]).theta) < 1e-12);
  const good = estimate(Array.from({ length: 10 }, () => ({ a: 1.2, b: 0, correct: true })));
  const bad = estimate(Array.from({ length: 10 }, () => ({ a: 1.2, b: 0, correct: false })));
  assert.ok(good.theta > 1);
  assert.ok(bad.theta < -1);
  assert.ok(Math.abs(good.theta + bad.theta) < 1e-12);
  assert.ok(good.se < estimate([]).se);
  assert.ok(good.probabilityAbove(0) > 0.9);
});
test('extreme likelihoods stay finite and invalid parameters fail', () => {
  const result = estimate(Array.from({ length: 1000 }, () => ({ a: 30, b: 10, correct: true })));
  assert.ok(Number.isFinite(result.theta) && Number.isFinite(result.se));
  assert.throws(() => probability(0, { a: -1, b: 0 }), RangeError);
});
