import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, Identity } from '../auth/auth.guard.js';
import { Database } from '../database/database.service.js';
import { identityTombstone } from '../auth/deleted-identity.js';
import { Problem } from '../common/problem.js';

@Controller('me')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly db: Database) {}
  @Get()
  async me(@Req() request: { identity: Identity }) {
    const identity = request.identity;
    const user = await this.db.$transaction(async tx => {
      // Serialise provisioning for the same OIDC subject across API instances.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${identity.sub}, 0))`;
      if (await tx.deletedIdentity.findUnique({ where: { identityHash: identityTombstone(process.env.OIDC_ISSUER!, identity.sub) } }))
        throw new Problem(401, 'unauthorized', 'Аккаунт удалён или ожидает удаления');
      const user = await tx.user.upsert({
      where: { subject: identity.sub },
      create: { subject: identity.sub, email: identity.email, displayName: identity.name, role: identity.role,
        ...(identity.role === 'candidate' ? { candidate: { create: {} } } : {}) },
      update: { email: identity.email, displayName: identity.name, role: identity.role },
      include: { candidate: { include: { consents: true, tests: { where: { status: 'in_progress' }, take: 1 } } }, memberships: { include: { company: true }, take: 1 } },
      });
      if (identity.role === 'candidate') await tx.candidate.updateMany({ where: { userId: user.id }, data: { lastActiveAt: new Date() } });
      return user;
    });
    const candidate = user.candidate;
    const consentsGiven = candidate?.consents.some(c => c.type === 'personal_data' && c.revokedAt === null) ?? false;
    const surveyCompleted = candidate?.surveyCompleted ?? false;
    const gradeConfirmed = candidate?.grade !== null && candidate?.grade !== undefined;
    const company = user.memberships[0]?.company;
    return {
      id: user.subject, role: user.role, email: user.email, display_name: user.displayName,
      onboarding: identity.role === 'candidate' ? {
        consents_given: consentsGiven, survey_completed: surveyCompleted, grade_confirmed: gradeConfirmed,
        next_step: !consentsGiven ? 'consents' : !surveyCompleted ? 'survey' : candidate?.tests[0] ? 'test' : !gradeConfirmed ? 'grade' : 'done',
        active_test_id: candidate?.tests[0]?.id ?? null,
      } : null,
      company: company ? { id: company.id, name: company.name, industry: company.industry, city: company.city, verified: company.verified } : null,
    };
  }
}
