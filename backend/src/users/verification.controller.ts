import { Controller, Get, Param, Res } from '@nestjs/common';
import { Database } from '../database/database.service.js';
import { Problem } from '../common/problem.js';
import { VerifyProfileResponse } from '../contract/schemas.js';
import { candidateInclude, ownProfile, snapshot } from '../matching/candidate-mapper.js';
import { proofClaimsMatch, proofFingerprint, proofIsCurrent, proofTokenHash } from './profile-proof.js';

@Controller('verify')
export class VerificationController {
  constructor(private readonly db: Database) {}
  @Get(':token')
  async verify(@Param('token') token: string, @Res({ passthrough: true }) response: { setHeader(name: string, value: string): void }) {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Referrer-Policy', 'no-referrer');
    const absent = () => new Problem(404, 'not_found', 'Ссылка проверки недействительна');
    const tokenHash = proofTokenHash(token);
    if (!tokenHash) throw absent();
    const certificate = await this.db.profileCertificate.findUnique({ where: { tokenHash }, include: { candidate: { include: candidateInclude } } });
    if (!certificate) throw absent();
    const c = certificate.candidate, profile = ownProfile(c);
    if (!profile.standing || profile.availability === 'not_looking') throw absent();
    const now = new Date();
    const view = snapshot(c, now);
    const fspCount = view.showFsp ? view.achievements.filter(a => a.verified && new Date(a.date) <= now).length : 0;
    let fingerprint: string;
    try { fingerprint = proofFingerprint(profile.full_name, profile.standing, fspCount); } catch { throw absent(); }
    if (!proofIsCurrent(certificate, fingerprint, c.consents.some(consent => consent.type === 'personal_data' && consent.revokedAt === null), now)) throw absent();
    const parsed = VerifyProfileResponse.safeParse(certificate.snapshot);
    if (!parsed.success || !proofClaimsMatch(parsed.data, profile.full_name, profile.standing, fspCount, certificate.issuedAt)) throw absent();
    return parsed.data;
  }
}
