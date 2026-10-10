import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyHmac(body: Buffer, signature: string | undefined, secret: string): boolean {
  if (secret.length < 32 || !signature) return false;
  const hex = /^(?:sha256=)?([0-9a-f]{64})$/i.exec(signature)?.[1];
  if (!hex) return false;
  const expected = createHmac('sha256', secret).update(body).digest();
  return timingSafeEqual(expected, Buffer.from(hex, 'hex'));
}
