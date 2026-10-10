import { createHash } from 'node:crypto';

/** Persist a non-reversible OIDC tombstone independently of the deleted user row. */
export function identityTombstone(issuer: string, subject: string): string {
  if (!issuer || !subject) throw new Error('Invalid OIDC identity');
  return createHash('sha256').update(JSON.stringify([issuer, subject])).digest('hex');
}
