import { Controller, Get, Req, Res, StreamableFile, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { Database } from '../database/database.service.js';
import { Problem } from '../common/problem.js';
import { GetMyProfileResponse } from '../contract/schemas.js';
import { candidateInclude, ownProfile, snapshot, type CandidateRow } from '../matching/candidate-mapper.js';
import { createProfileProof } from './profile-proof.js';
import { ProfilePdfError, renderProfilePdf, verificationUrl } from './profile-pdf.js';

function capture(c: CandidateRow, now: Date) {
  if (!c.consents.some(x => x.type === 'personal_data' && !x.revokedAt)) throw new Problem(409, 'conflict', 'Для PDF нужно согласие на обработку данных');
  const profile = GetMyProfileResponse.parse(ownProfile(c));
  if (!profile.standing || profile.availability === 'not_looking') throw new Problem(409, 'conflict', 'Нет доступного подтверждённого профиля');
  const view = snapshot(c, now);
  const fspCount = view.showFsp ? view.achievements.filter(a => a.verified && new Date(a.date) <= now).length : 0;
  const consents = c.consents.map(x => [x.id, x.type, x.version, x.revokedAt?.toISOString() ?? null]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  return { profile, fspCount, revision: JSON.stringify([profile, c.privacy, consents, fspCount]) };
}

@Controller('me')
@UseGuards(AuthGuard)
export class ProfilePdfController {
  constructor(private readonly db: Database) {}
  @Get('profile.pdf')
  async download(@Req() req: { identity: Identity }, @Res({ passthrough: true }) response: { setHeader(name: string, value: string): void }) {
    if (req.identity.role !== 'candidate') throw new Problem(403, 'forbidden', 'Доступно кандидату');
    const candidate = await this.db.candidate.findFirst({ where: { user: { subject: req.identity.sub } }, include: candidateInclude });
    if (!candidate) throw new Problem(409, 'conflict', 'Сначала создайте профиль');
    const now = new Date(), before = capture(candidate, now);
    const proof = createProfileProof(before.profile.full_name, before.profile.standing!, before.fspCount, now);
    let url: string;
    try { url = verificationUrl(process.env.PUBLIC_VERIFICATION_BASE_URL ?? process.env.PUBLIC_API_URL ?? '', proof.token); }
    catch { throw new Problem(409, 'conflict', 'Публичный адрес проверки PDF не настроен'); }
    let pdf: Buffer;
    try { pdf = await renderProfilePdf({ claims: proof.claims, verification_url: url, profile: before.profile }); }
    catch (error) {
      if (error instanceof ProfilePdfError && error.reason === 'busy') throw new Problem(409, 'conflict', 'Генератор занят, повторите загрузку позже');
      throw new Problem(500, 'internal_error', 'Не удалось создать PDF');
    }
    await this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${candidate.id}::uuid FOR UPDATE`;
      const fresh = await tx.candidate.findUnique({ where: { id: candidate.id }, include: candidateInclude });
      if (!fresh || capture(fresh, new Date()).revision !== before.revision)
        throw new Problem(409, 'conflict', 'Профиль изменился во время генерации, повторите загрузку');
      await tx.profileCertificate.create({ data: { candidateId: candidate.id, tokenHash: proof.tokenHash, fingerprint: proof.fingerprint,
        snapshot: proof.claims as unknown as Prisma.InputJsonObject, issuedAt: proof.issuedAt, expiresAt: proof.expiresAt } });
      await tx.audit.create({ data: { actorSubject: req.identity.sub, action: 'profile.pdf_issued', resourceId: candidate.id } });
    });
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    return new StreamableFile(pdf, { type: 'application/pdf', disposition: 'attachment; filename="scout-profile.pdf"', length: pdf.length });
  }
}
