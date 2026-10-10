import { test } from 'node:test';
import assert from 'node:assert/strict';

const base = process.env.TEST_API_URL ?? 'http://localhost:8000/api/v1';
test('concurrent early finish is idempotent, retains previous grade and creates no category history', async () => {
  const token = process.env.TEST_CANDIDATE_TOKEN;
  const id = process.env.TEST_EARLY_FINISH_TEST_ID;
  assert.ok(token && id, 'Provide candidate token and an owned fresh empty in-progress fixture with saved gradeCuts');
  const headers = { Authorization: `Bearer ${token}` };
  const api = async (method, path, expected) => {
    const response = await fetch(`${base}${path}`, { method, headers, signal: AbortSignal.timeout(20000) });
    assert.equal(response.status, expected, `${method} ${path}: unexpected status`);
    return response.json();
  };
  const before = await api('GET', '/me/profile', 200);
  const history = await api('GET', '/me/grade-history', 200);
  const session = await api('GET', `/tests/${id}`, 200);
  assert.equal(session.status, 'in_progress');
  assert.equal(session.progress.answered, 0);
  assert.ok(session.progress.adaptive_min >= 2, 'Fixture must require more evidence than a single issued skip');
  const results = await Promise.all([api('POST', `/tests/${id}/finish`, 200), api('POST', `/tests/${id}/finish`, 200)]);
  assert.deepEqual(results[0], results[1]);
  assert.equal(results[0].outcome, 'failed');
  assert.equal(results[0].confidence, 'low');
  if (before.standing) assert.deepEqual(results[0].category, before.standing.category);
  assert.deepEqual(await api('GET', `/tests/${id}/result`, 200), results[0]);
  assert.deepEqual(await api('GET', '/me/grade-history', 200), history);
  assert.deepEqual((await api('GET', '/me/profile', 200)).standing, before.standing);
  assert.equal((await api('GET', `/tests/${id}`, 200)).status, 'finished');
});
