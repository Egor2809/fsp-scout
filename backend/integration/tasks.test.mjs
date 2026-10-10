import { test } from 'node:test';
import assert from 'node:assert/strict';
const base = process.env.TEST_API_URL ?? 'http://localhost:8000/api/v1';
const tokens = { candidate: process.env.TEST_CANDIDATE_TOKEN, employer: process.env.TEST_EMPLOYER_TOKEN, other: process.env.TEST_OTHER_EMPLOYER_TOKEN };
async function api(role, method, path, expected, body) {
  const r = await fetch(`${base}${path}`, { method, headers: { Authorization: `Bearer ${tokens[role]}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000) });
  assert.equal(r.status, expected, `${method} ${path}: unexpected status`);
  return r.json();
}

test('task assignment, duplicate submission, scoped review and correction of task signal', { timeout: 180000 }, async () => {
  for (const [role, token] of Object.entries(tokens)) assert.ok(token, `Missing integration token for ${role}`);
  await api('candidate', 'GET', '/me', 200);
  const profile = await api('candidate', 'GET', '/me/profile', 200);
  assert.ok(profile.standing, 'A separately provisioned test candidate must have a confirmed category');
  const consents = await api('candidate', 'GET', '/me/consents', 200);
  await api('candidate', 'POST', '/me/consents', 200, { items: consents.documents.filter(d => ['personal_data', 'profile_visibility'].includes(d.type)).map(d => ({ type: d.type, version: d.version, given: true })) });
  const existing = await api('candidate', 'GET', '/me/tasks', 200);
  assert.ok(existing.every(a => Date.now() - new Date(a.assigned_at).getTime() >= 14 * 86400000), 'Use a fresh disposable account outside the assignment cooldown');
  const previewBefore = await api('candidate', 'GET', '/me/card-preview', 200);
  const baseline = previewBefore.task_signal.solved_count;
  const input = { title: `Task integration ${Date.now()}`, description: 'Describe a strategy for idempotent processing, retries and recovery after a failure.', kind: 'approach', specializations: [profile.standing.category.specialization], grades: [profile.standing.category.grade], time_limit_min: 10, language: null, starter_code: null, rubric: [{ criterion: 'Correctness', weight: 0.7 }, { criterion: 'Edge cases', weight: 0.3 }], deadline_at: new Date(Date.now() + 3600000).toISOString() };
  await api('employer', 'POST', '/regular-tasks', 422, { ...input, rubric: [{ criterion: 'Correctness', weight: 0.5 }] });
  const task = await api('employer', 'POST', '/regular-tasks', 201, input);
  await api('other', 'GET', `/regular-tasks/${task.id}`, 404);
  let assignment;
  const until = Date.now() + 90000;
  while (Date.now() < until) {
    assignment = (await api('candidate', 'GET', '/me/tasks', 200)).find(a => a.task.id === task.id);
    if (assignment) break;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  assert.ok(assignment, 'Maintenance worker must assign the task within 90 seconds; check category, privacy, cooldown and stack health');
  assert.equal(assignment.task.assigned_count, null);
  assert.equal(assignment.task.submissions_count, null);
  await api('candidate', 'POST', `/tasks/${task.id}/submissions`, 422, { answer_text: ' ' });
  const responses = await Promise.all([1, 2].map(() => fetch(`${base}/tasks/${task.id}/submissions`, { method: 'POST', headers: { Authorization: `Bearer ${tokens.candidate}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ answer_text: 'Persist an idempotency key atomically with the operation result. Retries return the stored result.' }), signal: AbortSignal.timeout(15000) })));
  assert.deepEqual(responses.map(r => r.status).sort(), [201, 409]);
  const submission = await responses.find(r => r.status === 201).json();
  assert.equal(submission.llm_score, null);
  assert.equal(submission.final_score, null);
  assert.equal(submission.fresh_signal, false);
  const route = `/regular-tasks/${task.id}/submissions/${submission.id}/score`;
  await api('other', 'POST', route, 404, { final_score: 100 });
  await api('candidate', 'POST', route, 403, { final_score: 100 });
  await api('employer', 'POST', route, 200, { final_score: 75, feedback: 'Meets the rubric.' });
  assert.equal((await api('candidate', 'GET', '/me/card-preview', 200)).task_signal.solved_count, baseline + 1);
  await api('employer', 'POST', route, 200, { final_score: 75 });
  assert.equal((await api('candidate', 'GET', '/me/card-preview', 200)).task_signal.solved_count, baseline + 1);
  await api('employer', 'POST', route, 200, { final_score: 74, feedback: 'Corrected review after a missed edge case.' });
  assert.equal((await api('candidate', 'GET', '/me/card-preview', 200)).task_signal.solved_count, baseline);
  const reviewed = await api('candidate', 'GET', `/me/tasks/${task.id}`, 200);
  assert.equal(reviewed.status, 'reviewed');
  assert.equal(reviewed.submission.final_score, 74);
});
