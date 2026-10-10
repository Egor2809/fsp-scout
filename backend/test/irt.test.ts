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

test('guessing reduces the theta shift from a correct difficult answer', () => {
  const item = { a: 1.2, b: 2, correct: true };
  const two = estimate([item]), three = estimate([{ ...item, c: 0.25 }]);
  assert.ok(three.theta > 0 && three.theta < two.theta);
  const zero = estimate([{ ...item, c: 0 }]);
  assert.equal(zero.theta, two.theta);
  assert.equal(zero.se, two.se);
  assert.equal(zero.probabilityAbove(0), two.probabilityAbove(0));
});

test('3PL probabilities and Fisher information match the response curve', () => {
  const item = { a: 1.7, b: 0.4, c: 0.25 };
  assert.equal(probability(item.b, item), 0.625);
  assert.equal(probability(-1000, item), 0.25);
  assert.equal(probability(1000, item), 1);
  for (const theta of [-8, -2, 0.4, 2, 8]) {
    const h = 1e-5, p = probability(theta, item);
    const derivative = (probability(theta + h, item) - probability(theta - h, item)) / (2 * h);
    const expected = derivative ** 2 / (p * (1 - p));
    assert.ok(Math.abs(information(theta, item) - expected) < 1e-8);
  }
  assert.equal(information(-1000, item), 0);
  assert.equal(information(1000, item), 0);
});

test('3PL likelihood stays finite at extreme difficulties and validates c', () => {
  for (const correct of [true, false]) {
    const posterior = estimate(Array.from({ length: 1000 }, () => ({ a: 30, b: 100, c: 0.25, correct })));
    assert.ok(Number.isFinite(posterior.theta) && Number.isFinite(posterior.se));
    assert.ok(posterior.probabilityAbove(0) >= 0 && posterior.probabilityAbove(0) <= 1);
  }
  for (const c of [-0.01, 1, Infinity, NaN]) {
    const item = { a: 1, b: 0, c, correct: true };
    assert.throws(() => probability(0, item), RangeError);
    assert.throws(() => information(0, item), RangeError);
    assert.throws(() => estimate([item]), RangeError);
  }
});
