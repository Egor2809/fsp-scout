import { Controller, Delete, HttpCode, Req, UseGuards } from '@nestjs/common';
import { Database } from '../database/database.service.js';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { identityTombstone } from '../auth/deleted-identity.js';
import { Problem } from '../common/problem.js';

@Controller('me')
@UseGuards(AuthGuard)
export class AccountDeletionController {
  constructor(private readonly db: Database) {}
  @Delete() @HttpCode(202)
  async remove(@Req() req: { identity: Identity }) {
    if (!['candidate', 'employer'].includes(req.identity.role)) throw new Problem(403, 'forbidden', 'Удаление этой роли недоступно');
    const subject = req.identity.sub, issuer = process.env.OIDC_ISSUER!;
    const identityHash = identityTombstone(issuer, subject);
    return this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${subject}, 0))`;
      const previous = await tx.deletedIdentity.findUnique({ where: { identityHash } });
      if (previous) return { scheduled_at: previous.requestedAt.toISOString() };
      const now = new Date();
      const user = await tx.user.findUnique({ where: { subject }, include: { candidate: true } });
      if (user?.candidate) {
        const id = user.candidate.id;
        await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${id}::uuid FOR UPDATE`;
        await tx.consent.updateMany({ where: { candidateId: id, revokedAt: null }, data: { revokedAt: now } });
        await tx.profileCertificate.updateMany({ where: { candidateId: id, revokedAt: null }, data: { revokedAt: now } });
        await tx.testSession.updateMany({ where: { candidateId: id, status: 'in_progress' }, data: { status: 'expired', finishedAt: now } });
        await tx.fspLink.deleteMany({ where: { candidateId: id } });
        await tx.disclosure.deleteMany({ where: { candidateId: id } });
        await tx.shortlist.deleteMany({ where: { candidateId: id } });
        await tx.candidate.update({ where: { id }, data: { profile: { availability: 'not_looking' }, privacy: { show_fsp: false },
          grade: null, confirmedSpecialization: null, salaryFloor: null, surveyCompleted: false } });
      }
      if (user) {
        await tx.membership.deleteMany({ where: { userId: user.id } });
        await tx.user.update({ where: { id: user.id }, data: { email: '', displayName: '' } });
      }
      await tx.deletedIdentity.create({ data: { identityHash, requestedAt: now } });
      await tx.outbox.create({ data: { topic: 'account.delete_requested', payload: { issuer, subject, identityHash, userId: user?.id ?? null } } });
      return { scheduled_at: now.toISOString() };
    });
  }
}
