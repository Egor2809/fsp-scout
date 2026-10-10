import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { Database } from '../database/database.service.js';
import { GetMyTestEligibilityQueryParams } from '../contract/schemas.js';
import type { Grade } from '../contract/model/grade.js';
import type { TestOutcome } from '../contract/model/testOutcome.js';
import { parse } from '../common/validation.js';
import { Problem } from '../common/problem.js';
import { afterDays, eligibility, type RetakeState } from '../common/retake.js';
import { assessmentMode, fullAttempts } from './session-state.js';

@Controller('me/test-eligibility')
@UseGuards(AuthGuard)
export class EligibilityController {
  constructor(private readonly db: Database) {}
  @Get()
  async get(@Req() req: { identity: Identity }, @Query() query: unknown) {
    if (req.identity.role !== 'candidate') throw new Problem(403, 'forbidden', 'Доступно кандидату');
    const params = parse(GetMyTestEligibilityQueryParams, query);
    const candidate = await this.db.candidate.findFirst({ where: { user: { subject: req.identity.sub } } });
    if (!candidate) throw new Problem(404, 'not_found', 'Профиль не найден');
    return this.db.$transaction(async tx => {
      // Same lock as start/finish and survey updates: one consistent history snapshot.
      await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${candidate.id}::uuid FOR UPDATE`;
      const now = new Date();
      await tx.testSession.updateMany({ where: { candidateId: candidate.id, status: 'in_progress', deadlineAt: { lte: now } }, data: { status: 'expired', finishedAt: now } });
      const c = await tx.candidate.findUniqueOrThrow({ where: { id: candidate.id } });
      const specialization = params.specialization ?? c.specialization;
      const active = await tx.testSession.findFirst({ where: { candidateId: c.id, status: 'in_progress' }, select: { id: true } });
      const history = specialization ? await tx.testSession.findMany({ where: { candidateId: c.id, specialization }, orderBy: [{ startedAt: 'desc' }, { id: 'desc' }] }) : [];
      const profile = c.profile as Prisma.JsonObject;
      const currentGrade = c.confirmedSpecialization === specialization ? c.grade as Grade | null : null;
      const state: RetakeState = {
        surveyCompleted: c.surveyCompleted && specialization !== null,
        activeTestId: active?.id ?? null, currentGrade, lastGradeChangeAt: c.gradeChangedAt,
        experienceYears: typeof profile.experience_years === 'number' ? profile.experience_years : null,
        attempts: fullAttempts(history).map(t => ({ id: t.id, grade: t.declaredGrade as Grade, startedAt: t.startedAt,
          finishedAt: t.finishedAt, exceptionParentId: t.exceptionParentId,
          outcome: ((t.result as Prisma.JsonObject | null)?.outcome ?? null) as TestOutcome | null })),
      };
      return { specialization, current_grade: currentGrade, last_grade_change_at: c.gradeChangedAt?.toISOString() ?? null,
        next_grade_change_at: c.gradeChangedAt ? afterDays(c.gradeChangedAt, 90).toISOString() : null,
        active_test_id: active?.id ?? null, grades: eligibility(state, now).map(g => assessmentMode(process.env.ASSESSMENT_EXPRESS).policy.express && !active && state.surveyCompleted
          ? { ...g, can_start: true, reason: null, available_at: null } : g) };
    });
  }
}
