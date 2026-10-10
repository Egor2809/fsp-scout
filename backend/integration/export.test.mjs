import { test } from 'node:test';
import assert from 'node:assert/strict';

const base = process.env.TEST_API_URL ?? 'http://localhost:8000/api/v1';
test('personal export requires authentication and cannot select another subject', async () => {
  const unauthorized = await fetch(`${base}/me/export`, { signal: AbortSignal.timeout(15000) });
  assert.equal(unauthorized.status, 401);
  const exports = [];
  for (const role of ['CANDIDATE', 'EMPLOYER']) {
    const token = process.env[`TEST_${role}_TOKEN`];
    assert.ok(token, `Missing TEST_${role}_TOKEN; a live stack is required`);
    const headers = { Authorization: `Bearer ${token}` };
    const meResponse = await fetch(`${base}/me`, { headers, signal: AbortSignal.timeout(15000) });
    assert.equal(meResponse.status, 200);
    const response = await fetch(`${base}/me/export?subject=someone-else`, { headers, signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.match(response.headers.get('content-disposition') ?? '', /attachment/);
    const data = await response.json();
    assert.equal(data.user.role, role.toLowerCase());
    assert.equal(data.schema_version, 1);
    assert.ok(data.user.id);
    assert.ok(Array.isArray(data.memberships));
    if (role === 'CANDIDATE') {
      assert.equal(data.candidate.userId, data.user.id);
      for (const session of data.candidate.tests) for (const item of session.items) {
        assert.equal(Object.hasOwn(item, 'expectedAnswer'), false);
        assert.equal(Object.hasOwn(item, 'parameters'), false);
        assert.equal(Object.hasOwn(item, 'correct'), false);
      }
    } else assert.equal(data.candidate, null);
    exports.push(data);
  }
  assert.notEqual(exports[0].user.subject, exports[1].user.subject);
});
