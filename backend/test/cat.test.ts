import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateCountFamily, seededRandom, selectFamily, selectWithWaiver } from '../src/common/cat.ts';

const policy = { min: 10, max: 18, targetSe: 0.35, topK: 5, maxExposure: 0.2 };
const bank = [
  { id: 'sql', a: 1.2, b: 0, competency: 'sql' },
  { id: 'code', a: 1.4, b: 0, competency: 'code' },
];
test('vacancy content weights control allocation before information selection without bypassing exposure', () => {
  const weighted = { ...policy, topK: 1, competencyWeights: { sql: 0.75, code: 0.25 } };
  const families = Array.from({ length: 24 }, (_, i) => ({ id: `f${i}`, a: 1.2, b: 0, competency: i < 18 ? 'sql' : 'code' }));
  const state = { responses: [] as { a: number; b: number; correct: boolean }[], servedIds: [] as string[], competencyCounts: {} as Record<string, number> };
  for (let i = 0; i < 12; i++) {
    const picked = selectFamily(families, state, { ...weighted, min: 18 }, {}, ['sql', 'code'], () => 0).family!;
    state.servedIds.push(picked.id);
    state.responses.push({ a: picked.a, b: picked.b, correct: true });
    state.competencyCounts[picked.competency] = (state.competencyCounts[picked.competency] ?? 0) + 1;
  }
  assert.deepEqual(state.competencyCounts, { sql: 9, code: 3 });
  assert.equal(selectFamily(families, { responses: [], servedIds: [], competencyCounts: {} }, weighted,
    Object.fromEntries(families.map(f => [f.id, 1])), ['sql', 'code'], () => 0).reason, 'exposure_exhausted');
});
test('coverage, repetition and exposure constraints are enforced', () => {
  const result = selectFamily(bank, { responses: [], servedIds: [], competencyCounts: { code: 1 } }, policy, {}, ['sql', 'code'], () => 0);
  assert.equal(result.family?.id, 'sql');
  assert.equal(selectFamily(bank, { responses: [], servedIds: ['sql'], competencyCounts: {} }, policy, { code: 0.2 }, [], () => 0).reason, 'exposure_exhausted');
  assert.equal(selectFamily(bank, { responses: [], servedIds: ['sql', 'code'], competencyCounts: {} }, policy, {}, [], () => 0).reason, 'bank_exhausted');
});
test('seeded generation is deterministic and produces solvable independent variants', () => {
  assert.deepEqual(generateCountFamily(123), generateCountFamily(123));
  const variants = Array.from({ length: 100 }, (_, seed) => generateCountFamily(seed));
  for (const item of variants) {
    assert.equal(item.parameters.rows % item.parameters.groups, 0);
    assert.equal(item.expectedAnswer, String(item.parameters.groups));
    assert.ok(!('expectedAnswer' in item.publicItem));
  }
  assert.ok(new Set(variants.map(x => JSON.stringify(x.parameters))).size > 30);
  const a = seededRandom(1), b = seededRandom(1);
  assert.deepEqual(Array.from({ length: 10 }, a), Array.from({ length: 10 }, b));
});
test('an unavailable required competency cannot be replaced with unrelated items or a successful stop', () => {
  const state = { responses: [], servedIds: [], competencyCounts: { code: 1 } };
  assert.equal(selectFamily(bank, state, policy, { sql: 0.2 }, ['sql', 'code'], () => 0).reason, 'coverage_unavailable');
  const capped = { ...state, responses: Array.from({ length: 18 }, () => ({ a: 1.2, b: 0, correct: true })) };
  assert.equal(selectFamily(bank, capped, policy, {}, ['sql', 'code'], () => 0).reason, 'coverage_unavailable');
  assert.equal(selectFamily(bank, { ...capped, competencyCounts: { sql: 1, code: 1 } }, policy, {}, ['sql', 'code'], () => 0).reason, 'max_length');
});

test('coverage blocked only by exposure is waived instead of stopping the session', () => {
  const bank = [{ id: 'a1', a: 1, b: 0, competency: 'a' }, { id: 'a2', a: 1, b: 0.5, competency: 'a' }, { id: 'b1', a: 1, b: 0, competency: 'b' }];
  const state = { responses: [], servedIds: [], competencyCounts: {} };
  const limits = { min: 1, max: 3, targetSe: 0.1, topK: 1, maxExposure: 0.5 };
  assert.equal(selectFamily(bank, state, limits, { b1: 1 }, ['a', 'b'], () => 0).family?.competency, 'a');
  const stuck = { responses: [{ a: 1, b: 0, correct: true }], servedIds: ['a1'], competencyCounts: { a: 1 } };
  assert.equal(selectFamily(bank, stuck, limits, { b1: 1 }, ['a', 'b'], () => 0).reason, 'coverage_unavailable');
  const waived = selectWithWaiver(bank, stuck, limits, { b1: 1 }, ['a', 'b'], () => 0);
  assert.deepEqual(waived.waived, ['b']);
  assert.equal(waived.family?.id, 'a2');
});
