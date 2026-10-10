import { test } from 'node:test';
import assert from 'node:assert/strict';

// Run against a disposable local stack with three verified Keycloak accounts.
// Never print tokens, contact responses or profile data.
const base = process.env.TEST_API_URL ?? 'http://localhost:8000/api/v1';
const tokens = { candidate: process.env.TEST_CANDIDATE_TOKEN, employer: process.env.TEST_EMPLOYER_TOKEN, other: process.env.TEST_OTHER_EMPLOYER_TOKEN };
async function api(role, method, path, expected, body) {
  const response = await fetch(`${base}${path}`, { method, headers: { Authorization: `Bearer ${tokens[role]}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, expected, `${method} ${path}: unexpected status`);
  if (response.status === 204) return null;
  assert.match(response.headers.get('content-type') ?? '', /application\/(?:problem\+)?json/);
  return response.json();
}

test('vacancy ownership, concurrent duplicate apply, disclosure scope and terminal transitions', async () => {
  for (const [role, token] of Object.entries(tokens)) assert.ok(token, `Missing TEST_${role === 'other' ? 'OTHER_EMPLOYER' : role.toUpperCase()}_TOKEN; integration checks require a live stack`);
  const me = await api('candidate', 'GET', '/me', 200);
  await api('employer', 'GET', '/me', 200);
  await api('other', 'GET', '/me', 200);
  const consents = await api('candidate', 'GET', '/me/consents', 200);
  const document = consents.documents.find(d => d.type === 'personal_data');
  assert.ok(document);
  await api('candidate', 'POST', '/me/consents', 200, { items: [{ type: document.type, version: document.version, given: true }] });
  const input = { title: `Integration vacancy ${Date.now()}`, description: 'Integration fixture for authorization, concurrent applications and contact disclosure boundaries.', specialization: 'backend', grade: 'middle', must_skills: ['go'], nice_skills: ['postgresql'], work_format: 'remote', city: null, salary: { from: 200000, to: 300000 }, status: 'draft' };
  const vacancy = await api('employer', 'POST', '/vacancies', 201, input);
  let applicationId;
  try {
    await api('candidate', 'GET', `/vacancies/${vacancy.id}`, 404);
    await api('other', 'GET', `/vacancies/${vacancy.id}`, 404);
    await api('candidate', 'GET', `/vacancies/${vacancy.id}/test-blueprint`, 404);
    await api('other', 'GET', `/vacancies/${vacancy.id}/test-blueprint`, 404);
    const draftBlueprint = await api('employer', 'GET', `/vacancies/${vacancy.id}/test-blueprint`, 200);
    assert.equal(draftBlueprint.vacancy_id, vacancy.id);
    assert.equal(draftBlueprint.grade, input.grade);
    assert.equal(draftBlueprint.practice, null);
    assert.ok(Math.abs(draftBlueprint.competencies.reduce((sum, c) => sum + c.share, 0) - 1) < 1e-9);
    await api('other', 'PUT', `/vacancies/${vacancy.id}`, 404, { ...input, status: 'published' });
    await api('employer', 'PUT', `/vacancies/${vacancy.id}`, 200, { ...input, status: 'published' });
    const candidateBlueprint = await api('candidate', 'GET', `/vacancies/${vacancy.id}/test-blueprint`, 200);
    assert.deepEqual(candidateBlueprint.extracted_skills, draftBlueprint.extracted_skills);
    const responses = await Promise.all([1, 2].map(() => fetch(`${base}/vacancies/${vacancy.id}/apply`, { method: 'POST', headers: { Authorization: `Bearer ${tokens.candidate}`, 'Content-Type': 'application/json' }, body: '{}', signal: AbortSignal.timeout(15000) })));
    assert.deepEqual(responses.map(r => r.status).sort(), [201, 409]);
    const created = await responses.find(r => r.status === 201).json();
    applicationId = created.id;
    const duplicate = await responses.find(r => r.status === 409).json();
    assert.equal(duplicate.code, 'already_applied');
    const applications = await api('employer', 'GET', `/vacancies/${vacancy.id}/applications`, 200);
    assert.equal(applications.length, 1);
    assert.equal(applications[0].candidate.disclosure.revealed, true);
    assert.equal(applications[0].candidate.disclosure.reason, 'application');
    assert.equal(applications[0].candidate.disclosure.source_id, applicationId);
    assert.ok(applications[0].candidate.contacts?.email);
    assert.equal(applications[0].candidate.relation.application.vacancy_id, vacancy.id);
    await api('other', 'GET', `/vacancies/${vacancy.id}/applications`, 404);
    await api('other', 'POST', `/applications/${applicationId}/status`, 404, { status: 'viewed' });
    await api('candidate', 'POST', `/applications/${applicationId}/status`, 403, { status: 'viewed' });
    await api('employer', 'POST', `/applications/${applicationId}/status`, 409, { status: 'hired' });
    await api('employer', 'POST', `/applications/${applicationId}/status`, 200, { status: 'viewed' });
    await api('employer', 'POST', `/applications/${applicationId}/withdraw`, 403);
    const withdrawn = await api('candidate', 'POST', `/applications/${applicationId}/withdraw`, 200);
    assert.equal(withdrawn.status, 'withdrawn');
    assert.deepEqual(withdrawn.events.map(e => e.status), ['submitted', 'viewed', 'withdrawn']);
    await api('employer', 'POST', `/applications/${applicationId}/status`, 409, { status: 'interview' });
    assert.ok(me);
  } finally {
    if (applicationId) {
      // Best-effort cleanup, without masking the original assertion failure.
      await fetch(`${base}/applications/${applicationId}/withdraw`, { method: 'POST', headers: { Authorization: `Bearer ${tokens.candidate}` }, signal: AbortSignal.timeout(15000) }).catch(() => undefined);
    }
    await api('employer', 'PUT', `/vacancies/${vacancy.id}`, 200, { ...input, status: 'closed' });
  }
});
