import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { verifyHmac } from '../src/common/hmac.ts';

test('signature covers exact raw bytes and rejects weak or malformed inputs', () => {
  const secret = 'a'.repeat(32), body = Buffer.from('{"event":"achievement.created"}');
  const signature = createHmac('sha256', secret).update(body).digest('hex');
  assert.equal(verifyHmac(body, signature, secret), true);
  assert.equal(verifyHmac(body, `sha256=${signature}`, secret), true);
  assert.equal(verifyHmac(Buffer.concat([body, Buffer.from(' ')]), signature, secret), false);
  assert.equal(verifyHmac(body, signature, 'short'), false);
  assert.equal(verifyHmac(body, 'invalid', secret), false);
  assert.equal(verifyHmac(body, undefined, secret), false);
});
