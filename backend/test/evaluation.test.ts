import test from 'node:test';
import assert from 'node:assert/strict';
import { rankExternal, rankCsv } from '../src/evaluation/rank.ts';
import { rankingMetrics } from '../src/evaluation/metrics.ts';

test('external ranking prefers relevant skills and explains the bounded score without trusted platform signals', () => {
  const result = rankExternal({ vacancies: [{ id: 'v', text: 'Backend Python PostgreSQL middle remote' }], candidates: [
    { id: 'unrelated', text: 'Дизайнер Figma Photoshop' },
    { id: 'fit', text: 'Backend Python PostgreSQL middle remote' },
  ], top_k: 2 });
  assert.equal(result.results[0].ranking[0].candidate_id, 'fit');
  for (const row of result.results[0].ranking) {
    assert.ok(row.score >= 0 && row.score <= 100);
    assert.ok(Math.abs(row.score - row.factors.reduce((sum, f) => sum + f.contribution, 0)) < 0.011);
    assert.ok(row.factors.every(f => !['fsp', 'percentile', 'tasks'].includes(f.kind)));
  }
});

test('JSON Resume identity fields do not boost matching and ties have stable ordering', () => {
  const result = rankExternal({ vacancies: [{ id: 'v', text: 'Python PostgreSQL' }], candidates: [
    { id: 'b', text: JSON.stringify({ basics: { name: 'Python PostgreSQL', email: 'python@example.com' } }) },
    { id: 'a', text: JSON.stringify({ basics: { name: 'Иван' } }) },
    { id: 'c', text: JSON.stringify({ skills: [{ name: 'Python', keywords: ['PostgreSQL'] }] }) },
  ] });
  assert.deepEqual(result.results[0].ranking.map(row => row.candidate_id), ['c', 'a', 'b']);
});

test('CSV quotes multiline identifiers and neutralizes spreadsheet formulas', () => {
  const csv = rankCsv({ results: [{ vacancy_id: ' =HYPERLINK("x")', ranking: [{ candidate_id: 'a,"b\nc', score: 2, factors: [] }] }] });
  assert.ok(csv.includes('"\' =HYPERLINK(""x"")"'));
  assert.ok(csv.includes('"a,""b\nc"'));
  assert.ok(csv.endsWith('\r\n'));
});

test('ranking metrics use independent labels, truncate at k and reject invalid observations', () => {
  const labels = { a: 3, b: 1, c: 0 };
  assert.deepEqual(rankingMetrics(['a', 'b', 'c'], labels, 2), { ndcg: 1, recall: 1, reciprocalRank: 1, relevantCount: 2 });
  const reversed = rankingMetrics(['c', 'b', 'a'], labels, 2);
  assert.equal(reversed.recall, 0.5);
  assert.equal(reversed.reciprocalRank, 0.5);
  assert.ok(reversed.ndcg > 0 && reversed.ndcg < 1);
  assert.deepEqual(rankingMetrics(['x'], {}, 3), { ndcg: 0, recall: 0, reciprocalRank: 0, relevantCount: 0 });
  assert.throws(() => rankingMetrics(['a', 'a'], labels, 2));
  assert.throws(() => rankingMetrics([], { a: NaN }, 2));
  assert.throws(() => rankingMetrics([], labels, 0));
});
