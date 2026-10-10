import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectFamily } from '../src/common/cat.ts';
import { estimate } from '../src/common/irt.ts';
import { itemResponse } from '../src/assessment/item-response.ts';
import { LIVE_BANK, instantiate, bankInventory } from '../src/assessment/live-bank.ts';
import { completionReadiness, resultTrace, scoreCompletion } from '../src/assessment/completion.ts';
import { DEFAULT_POLICY } from '../src/assessment/session-state.ts';
import { scoreOutcome } from '../src/assessment/result-scoring.ts';

test('CAT prefers the more informative numeric item over a guessable equivalent', () => {
  const bank = [{ id: 'a-choice', competency: 'x', a: 1.2, b: 0, c: 0.25 },
    { id: 'z-number', competency: 'x', a: 1.2, b: 0, c: 0 }];
  const selected = selectFamily(bank, { responses: [], servedIds: [], competencyCounts: {} },
    { min: 1, max: 3, targetSe: 0.5, topK: 1, maxExposure: 1 }, {}, [], () => 0);
  assert.equal(selected.family?.id, 'z-number');
});

test('CAT restores guessing for legacy responses and honours an explicit saved value', () => {
  const response = { a: 1.2, b: 2, correct: true };
  const bank = [{ id: 'answered', competency: 'x', a: 1.2, b: 2, c: 0.25 },
    { id: 'next', competency: 'x', a: 1.2, b: 0, c: 0 }];
  const targetSe = (estimate([response]).se + estimate([{ ...response, c: 0.25 }]).se) / 2;
  const policy = { min: 1, max: 3, targetSe, topK: 1, maxExposure: 1 };
  const state = { responses: [response], servedIds: ['answered'], competencyCounts: { x: 1 } };
  assert.equal(selectFamily(bank, state, policy, {}, [], () => 0).reason, 'selected');
  assert.equal(selectFamily(bank, { ...state, servedIds: ['unrelated', 'answered'],
    responses: [{ ...response, familyId: 'answered' }] }, policy, {}, [], () => 0).reason, 'selected');
  assert.equal(selectFamily(bank, { ...state, responses: [{ ...response, c: 0 }] }, policy, {}, [], () => 0).reason, 'precision');
});

test('every bank variant carries the guessing parameter implied by its answer format', () => {
  for (const family of LIVE_BANK) {
    for (let seed = 0; seed < 30; seed++) {
      const item = instantiate(family, seed, 'fixture', 1);
      const expected = item.publicItem.type === 'single_choice' ? 1 / item.publicItem.options!.length
        : item.publicItem.type === 'multiple_choice' ? 0.05 : 0;
      assert.equal(family.c, expected);
      assert.equal(item.parameters.irt_c, expected);
      assert.equal(itemResponse({ ...item, correct: true }).c, expected);
      assert.equal(itemResponse({ familyId: family.id, discrimination: family.a, difficulty: family.b, correct: true }).c, expected);
    }
  }
});

test('saved parameters take precedence and completion traces use the same 3PL posterior', () => {
  const family = LIVE_BANK.find(f => f.c === 0.25)!;
  const item = { ...instantiate(family, 9, 'fixture', 1), ordinal: 1, block: 'adaptive',
    answeredAt: new Date(), correct: true, competency: family.competency, id: 'fixture' };
  const expected = estimate([itemResponse(item)]);
  assert.equal(resultTrace([item])[0]!.theta, expected.theta);
  assert.equal(resultTrace([item])[0]!.se, expected.se);
  const cuts = { version: 'fixture', cuts: { junior: -1.2, middle: -0.4, senior: 0.4, lead: 1.2 }, passProbability: 0.6 };
  const policy = { min: 1, max: 1, targetSe: 0.4, topK: 1, maxExposure: 1, practiceTotal: 0, approachTotal: 0 };
  const scored = scoreCompletion([item], policy, 'middle', cuts);
  const direct = scoreOutcome([itemResponse(item)], 'middle', cuts);
  assert.equal(scored.theta, direct.theta);
  assert.equal(scored.outcome, direct.outcome);
  assert.equal(scored.probability, direct.probability);
  const two = estimate([{ a: family.a, b: family.b, correct: true }]);
  const targetSe = (two.se + expected.se) / 2;
  assert.equal(completionReadiness([item], { ...policy, max: 3, targetSe }), 'adaptive_incomplete');
  assert.equal(itemResponse({ ...item, parameters: { irt_c: 0 } }).c, 0);
  assert.equal(itemResponse({ ...item, parameters: { seed: 9 } }).c, 0);
  assert.equal(itemResponse({ ...item, familyId: 'unknown', parameters: {} }).c, 0);
  assert.throws(() => itemResponse({ ...item, parameters: { irt_c: '0.25' } }), RangeError);
  assert.throws(() => itemResponse({ ...item, correct: null }));
});

test('every specialization has sufficient inventory at the full 3PL test length', () => {
  for (const spec of ['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst'] as const) {
    assert.equal(bankInventory(spec, DEFAULT_POLICY.max, DEFAULT_POLICY.maxExposure).sufficientInventory, true);
  }
});

test('EAP agrees with independently integrated Bernoulli 3PL likelihoods', () => {
  const responses = [{ a: 1.2, b: 2, c: 0.25, correct: true },
    { a: 1.5, b: -0.4, c: 0.05, correct: false }, { a: 0.8, b: 0, c: 0, correct: true }];
  let mass = 0, first = 0, second = 0;
  for (let index = 0; index <= 2000; index++) {
    const theta = -5 + index * 0.005;
    const likelihood = responses.reduce((product, item) => {
      const p = item.c + (1 - item.c) / (1 + Math.exp(-item.a * (theta - item.b)));
      return product * (item.correct ? p : 1 - p);
    }, Math.exp(-(theta ** 2) / 2));
    const weight = likelihood * (index === 0 || index === 2000 ? 0.5 : 1);
    mass += weight; first += weight * theta; second += weight * theta ** 2;
  }
  const actual = estimate(responses), theta = first / mass;
  assert.ok(Math.abs(actual.theta - theta) < 1e-5);
  assert.ok(Math.abs(actual.se - Math.sqrt(second / mass - theta ** 2)) < 1e-5);
});
