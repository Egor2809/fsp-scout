import test from 'node:test';
import assert from 'node:assert/strict';
import { createProfileProof, proofClaimsMatch, proofFingerprint, proofIsCurrent, proofTokenHash } from '../src/users/profile-proof.ts';
const at = new Date('2026-10-10T00:00:00Z');
const standing = { category: { specialization: 'backend' as const, grade: 'middle' as const, label: 'Backend · Middle' },
  percentile: 60, confirmed_at: '2026-10-09T00:00:00Z', test_id: 'test-1' };

test('public proof cannot return claims inconsistent with its confirmed profile or issue time', () => {
  const proof = createProfileProof('Иван', standing, 2, at);
  assert.equal(proofClaimsMatch(proof.claims, 'Иван', standing, 2, at), true);
  for (const claims of [{ ...proof.claims, full_name: 'Другой' }, { ...proof.claims, percentile: 99 },
    { ...proof.claims, fsp_achievements_count: 3 }, { ...proof.claims, issued_at: '2026-10-09T00:00:00Z' },
    { ...proof.claims, category: null }, { ...proof.claims, valid: false }])
    assert.equal(proofClaimsMatch(claims, 'Иван', standing, 2, at), false);
});
test('profile proof has an opaque random token, stable claims and a stored hash rather than the bearer link', () => {
  const first = createProfileProof('Иван Иванов', standing, 2, at), second = createProfileProof('Иван Иванов', standing, 2, at);
  assert.notEqual(first.token, second.token);
  assert.equal(first.fingerprint, second.fingerprint);
  assert.equal(proofTokenHash(first.token), first.tokenHash);
  assert.notEqual(first.tokenHash, first.token);
  assert.equal(proofTokenHash('candidate-id'), null);
  assert.equal(first.claims.issued_at, at.toISOString());
  assert.equal(first.expiresAt.getTime() - at.getTime(), 30 * 86400000);
});
test('expired, revoked, changed or unconsented proof is invalid at inclusive expiry boundary', () => {
  const proof = createProfileProof('Иван', standing, 0, at);
  const record = { ...proof, revokedAt: null };
  assert.equal(proofIsCurrent(record, proof.fingerprint, true, at), true);
  assert.equal(proofIsCurrent(record, proof.fingerprint, true, proof.expiresAt), false);
  assert.equal(proofIsCurrent({ ...record, revokedAt: at }, proof.fingerprint, true, at), false);
  assert.equal(proofIsCurrent(record, proof.fingerprint, false, at), false);
  for (const fingerprint of [proofFingerprint('Другой', standing, 0), proofFingerprint('Иван', { ...standing, percentile: 61 }, 0),
    proofFingerprint('Иван', { ...standing, test_id: 'test-2' }, 0), proofFingerprint('Иван', standing, 1)])
    assert.equal(proofIsCurrent(record, fingerprint, true, at), false);
});
