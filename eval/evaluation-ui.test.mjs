import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluationMetrics } from '../frontend/src/lib/evaluationMetrics.ts';
import { rankingMetrics } from '../backend/src/evaluation/metrics.ts';

test('UI metrics agree with server metrics for independent labels, cutoff and irrelevant results', () => {
  const ids = ['a', 'b', 'c', 'd'];
  const labels = { a: 4, b: 2, c: 0, d: 1 };
  for (const ranked of [['a', 'b', 'c', 'd'], ['c', 'd', 'b', 'a'], []]) {
    for (const k of [1, 2, 10]) assert.deepEqual(evaluationMetrics(ranked, ids, labels, k), rankingMetrics(ranked, labels, k));
  }
  assert.deepEqual(evaluationMetrics(['a'], ['a'], { a: 0 }), { ndcg: 0, recall: 0, reciprocalRank: 0, relevantCount: 0 });
});
test('UI refuses incomplete, unknown, malformed and fabricated relevance labels', () => {
  for (const labels of [null, [], { a: 4 }, { a: 4, x: 0 }, { a: 5, b: 0 }, { a: '4', b: 0 }, { a: NaN, b: 0 }, { a: 1.5, b: 0 }]) {
    assert.throws(() => evaluationMetrics(['a'], ['a', 'b'], labels));
  }
  assert.throws(() => evaluationMetrics(['a', 'a'], ['a', 'b'], { a: 4, b: 0 }));
  assert.throws(() => evaluationMetrics(['x'], ['a', 'b'], { a: 4, b: 0 }));
  assert.throws(() => evaluationMetrics(['a'], ['a'], { a: 4 }, 0));
});
