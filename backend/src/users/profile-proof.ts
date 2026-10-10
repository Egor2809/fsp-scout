import { createHash, randomBytes } from 'node:crypto';
import type { CategoryStanding, ProfileVerification } from '../contract/model/index.js';

export function proofTokenHash(token: string): string | null {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  return createHash('sha256').update(token).digest('hex');
}
export function proofFingerprint(fullName: string, standing: CategoryStanding, fspCount: number): string {
  if (!fullName.trim() || !Number.isInteger(standing.percentile) || standing.percentile < 1 || standing.percentile > 99
    || !Number.isSafeInteger(fspCount) || fspCount < 0 || !Number.isFinite(Date.parse(standing.confirmed_at)) || !standing.test_id)
    throw new RangeError('Invalid confirmed profile');
  return createHash('sha256').update(JSON.stringify([fullName, standing.category.specialization, standing.category.grade,
    standing.percentile, standing.confirmed_at, standing.test_id, fspCount])).digest('hex');
}
export function createProfileProof(fullName: string, standing: CategoryStanding, fspCount: number, issuedAt = new Date()) {
  if (!Number.isFinite(issuedAt.getTime())) throw new RangeError('Invalid issue time');
  const token = randomBytes(32).toString('base64url');
  const claims: ProfileVerification = { valid: true, full_name: fullName, category: { ...standing.category }, percentile: standing.percentile,
    confirmed_at: standing.confirmed_at, fsp_achievements_count: fspCount, issued_at: issuedAt.toISOString() };
  return { token, tokenHash: proofTokenHash(token)!, fingerprint: proofFingerprint(fullName, standing, fspCount), claims,
    issuedAt, expiresAt: new Date(issuedAt.getTime() + 30 * 86400000) };
}
export function proofIsCurrent(record: { fingerprint: string; issuedAt: Date; expiresAt: Date; revokedAt: Date | null },
  fingerprint: string, personalDataConsent: boolean, now = new Date()): boolean {
  return personalDataConsent && record.revokedAt === null && record.issuedAt <= now && record.expiresAt > now && record.fingerprint === fingerprint;
}

export function proofClaimsMatch(claims: ProfileVerification, fullName: string, standing: CategoryStanding, fspCount: number, issuedAt: Date): boolean {
  return claims.valid === true && claims.full_name === fullName
    && claims.category?.specialization === standing.category.specialization && claims.category?.grade === standing.category.grade
    && claims.percentile === standing.percentile && claims.confirmed_at === standing.confirmed_at
    && claims.fsp_achievements_count === fspCount && claims.issued_at === issuedAt.toISOString();
}
