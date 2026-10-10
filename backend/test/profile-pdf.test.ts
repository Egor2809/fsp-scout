import test from 'node:test';
import assert from 'node:assert/strict';
import { verificationUrl } from '../src/users/profile-pdf.ts';

test('verification QR target uses configured public API base and an opaque token', () => {
  const token = 'a'.repeat(43);
  assert.equal(verificationUrl('https://scout.example/api/v1/', token), `https://scout.example/api/v1/verify/${token}`);
  for (const base of ['file:///tmp/x', 'https://user:pass@scout.example/api/v1', 'https://scout.example/api/v1?token=x', 'https://scout.example/#x'])
    assert.throws(() => verificationUrl(base, token));
  assert.throws(() => verificationUrl('https://scout.example/api/v1', '../candidate-id'));
});
