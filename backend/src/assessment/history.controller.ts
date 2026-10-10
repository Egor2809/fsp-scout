import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { Database } from '../database/database.service.js';
import { Problem } from '../common/problem.js';
import { parse } from '../common/validation.js';
import { progress, type IssuedItem, type SessionPolicy } from './session-state.js';
import { GetTestResultResponse } from '../contract/schemas.js';

@Controller()
@UseGuards(AuthGuard)
export class AssessmentHistoryController {
  constructor(private readonly db: Database) {}
  private async candidate(identity: Identity) {
    if (identity.role !== 'candidate') throw new Problem(403, 'forbidden', 'Доступно кандидату');
    const c = await this.db.candidate.findFirst({ where: { user: { subject: identity.sub } }, select: { id: true } });
    if (!c) throw new Problem(404, 'not_found', 'Профиль не найден');
    return c;
  }
  private async expire(candidateId: string) {
    await this.db.testSession.updateMany({ where: { candidateId, status: 'in_progress', deadlineAt: { lte: new Date() } }, data: { status: 'expired', finishedAt: new Date() } });
  }
  @Get('me/tests')
  async tests(@Req() req: { identity: Identity }) {
    const c = await this.candidate(req.identity);
    await this.expire(c.id);
    const rows = await this.db.testSession.findMany({ where: { candidateId: c.id }, orderBy: [{ startedAt: 'desc' }, { id: 'desc' }] });
    return rows.map(t => {
      const result = t.result as Prisma.JsonObject | null;
      return { id: t.id, specialization: t.specialization, declared_grade: t.declaredGrade, status: t.status,
        outcome: result?.outcome ?? null, assigned_grade: result?.assigned_grade ?? null, percentile: result?.percentile ?? null,
        started_at: t.startedAt.toISOString(), finished_at: t.finishedAt?.toISOString() ?? null };
    });
  }
  @Get('tests/:id')
  async get(@Req() req: { identity: Identity }, @Param('id') id: string) {
    parse(z.uuid(), id);
    const c = await this.candidate(req.identity);
    const exists = await this.db.testSession.findFirst({ where: { id, candidateId: c.id }, select: { id: true } });
    if (!exists) throw new Problem(404, 'not_found', 'Тест не найден');
    await this.expire(c.id);
    const t = await this.db.testSession.findUniqueOrThrow({ where: { id }, include: { items: { orderBy: { ordinal: 'asc' } } } });
    return { id: t.id, specialization: t.specialization, declared_grade: t.declaredGrade, status: t.status,
      started_at: t.startedAt.toISOString(), deadline_at: t.deadlineAt.toISOString(), finished_at: t.finishedAt?.toISOString() ?? null,
      time_limit_sec: Math.round((t.deadlineAt.getTime() - t.startedAt.getTime()) / 1000), vacancy_id: t.vacancyId,
      progress: progress(t.items as IssuedItem[], t.policy as unknown as SessionPolicy) };
  }
  @Get('me/grade-history')
  async grades(@Req() req: { identity: Identity }) {
    const c = await this.candidate(req.identity);
    return (await this.db.gradeHistory.findMany({ where: { candidateId: c.id }, orderBy: [{ changedAt: 'desc' }, { id: 'desc' }] })).map(h => ({
      id: h.id, specialization: h.specialization, grade: h.grade, previous_grade: h.previousGrade,
      changed_at: h.changedAt.toISOString(), test_id: h.testId, reason: h.reason,
    }));
  }
  @Get('tests/:id/result')
  async result(@Req() req: { identity: Identity }, @Param('id') id: string) {
    parse(z.uuid(), id);
    const c = await this.candidate(req.identity);
    const t = await this.db.testSession.findFirst({ where: { id, candidateId: c.id }, select: { status: true, result: true } });
    if (!t) throw new Problem(404, 'not_found', 'Тест не найден');
    if (t.status !== 'finished' || !t.result) throw new Problem(409, 'conflict', 'Результат ещё не готов');
    const parsed = GetTestResultResponse.safeParse(t.result);
    if (!parsed.success || parsed.data.test_id !== id) throw new Problem(500, 'internal_error', 'Результат теста повреждён');
    return parsed.data;
  }
}
