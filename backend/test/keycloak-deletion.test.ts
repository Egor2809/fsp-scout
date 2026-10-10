import test from 'node:test';
import assert from 'node:assert/strict';
import { deleteKeycloakUser } from '../src/auth/keycloak-deletion.ts';
const config = { baseUrl: 'https://id.example/', issuer: 'https://public.example/realms/scout', realm: 'scout', clientId: 'eraser', clientSecret: 'private-secret' };

test('Keycloak erasure uses service credentials, exact encoded identity and idempotent absence', async () => {
  const calls: { url: string; options: RequestInit }[] = [];
  const fetcher = (async (url, options) => {
    calls.push({ url: String(url), options: options! });
    return calls.length === 1 ? Response.json({ access_token: 'service-token', token_type: 'Bearer' }) : new Response(null, { status: 404 });
  }) as typeof fetch;
  await deleteKeycloakUser('user/a', config, fetcher);
  assert.equal(calls.length, 2);
  assert.equal(calls[0]!.options.body!.toString().includes('grant_type=client_credentials'), true);
  assert.equal(calls[1]!.url, 'https://id.example/admin/realms/scout/users/user%2Fa');
  assert.equal(calls[1]!.options.method, 'DELETE');
  assert.equal(calls[1]!.options.redirect, 'error');
  assert.deepEqual(calls[1]!.options.headers, { Authorization: 'Bearer service-token' });
});

test('failed service authentication never sends deletion and errors contain no secret or provider body', async () => {
  let calls = 0;
  const fetcher = (async () => { calls++; return new Response('private-secret upstream details', { status: 403 }); }) as typeof fetch;
  await assert.rejects(deleteKeycloakUser('user', config, fetcher), { message: 'keycloak_deletion_unavailable' });
  assert.equal(calls, 1);
  await assert.rejects(deleteKeycloakUser('..', config, fetcher));
  assert.equal(calls, 1);
});

test('erasure refuses a mismatched issuer realm or context path before requesting credentials', async () => {
  let calls = 0;
  const fetcher = (async () => { calls++; throw new Error('Unexpected network request'); }) as typeof fetch;
  for (const issuer of ['https://public.example/realms/other', 'https://public.example/auth/realms/scout', 'https://public.example/realms/scout?realm=other']) {
    await assert.rejects(deleteKeycloakUser('user', { ...config, issuer }, fetcher), { message: 'keycloak_deletion_unavailable' });
  }
  assert.equal(calls, 0);
});
