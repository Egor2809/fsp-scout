import test from 'node:test';
import assert from 'node:assert/strict';
import { identityTombstone } from '../src/auth/deleted-identity.ts';

test('deleted identity is stable, issuer scoped and does not retain bearer or raw subject', () => {
  const hash = identityTombstone('https://id.example/realm', 'subject-1');
  assert.match(hash, /^[0-9a-f]{64}$/);
  assert.equal(hash, identityTombstone('https://id.example/realm', 'subject-1'));
  assert.notEqual(hash, identityTombstone('https://id.example/other', 'subject-1'));
  assert.notEqual(hash, identityTombstone('https://id.example/realm', 'subject-2'));
  assert.throws(() => identityTombstone('', 'subject-1'));
});
