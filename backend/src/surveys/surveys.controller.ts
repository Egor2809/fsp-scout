import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { Database } from '../database/database.service.js';
import { CreateSurveyBody } from '../contract/schemas.js';
import { parse, checkSalary } from '../common/validation.js';
import { Problem } from '../common/problem.js';
import { skills } from '../taxonomy/taxonomy.controller.js';

@Controller()
@UseGuards(AuthGuard)
export class SurveysController {
  constructor(private readonly db: Database) {}
  private async candidate(identity: Identity) {
    if (identity.role !== 'candidate') throw new Problem(403, 'forbidden', 'Доступно кандидату');
    const candidate = await this.db.candidate.findFirst({ where: { user: { subject: identity.sub } } });
    if (!candidate) throw new Problem(404, 'not_found', 'Профиль не найден');
    return candidate;
  }
  @Post('surveys')
  async create(@Req() request: { identity: Identity }, @Body() body: unknown) {
    const data = parse(CreateSurveyBody, body);
    checkSalary(data.salary_expectation, '/salary_expectation');
    const unknown = data.primary_stack.findIndex(id => !skills.has(id));
    if (unknown >= 0) throw new Problem(422, 'validation_error', 'Неизвестный навык', { errors: [{ pointer: `/primary_stack/${unknown}`, detail: 'Навык отсутствует в справочнике' }] });
    const c = await this.candidate(request.identity);
    const survey = await this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${c.id}::uuid FOR UPDATE`;
      const consent = await tx.consent.findFirst({ where: { candidateId: c.id, type: 'personal_data', revokedAt: null } });
      if (!consent) throw new Problem(403, 'consent_required', 'Нужно согласие', { consent_types: ['personal_data'] });
      const active = await tx.testSession.findFirst({ where: { candidateId: c.id, status: 'in_progress' } });
      if (active) throw new Problem(409, 'test_in_progress', 'Сначала завершите тест');
      const fresh = await tx.candidate.findUniqueOrThrow({ where: { id: c.id } });
      const old = fresh.profile as Record<string, Prisma.JsonValue>;
      const existing = (old.skills ?? []) as { skill_id: string; source: string }[];
      const declared = data.primary_stack.filter(id => !existing.some(s => s.skill_id === id)).map(id => ({ skill_id: id, name: skills.get(id)!.name, source: 'self', level: 'basic', verified: false, score: null }));
      const profile = { ...old, industries: data.industries, work_formats: data.work_formats, city: data.city,
        relocation: data.relocation, experience_years: data.experience_years, salary_expectation: data.salary_expectation,
        skills: [...existing, ...declared],
      } as Prisma.InputJsonObject;
      await tx.candidate.update({ where: { id: c.id }, data: { surveyCompleted: true, specialization: data.specialization, profile } });
      return tx.survey.create({ data: { candidateId: c.id, answers: data as Prisma.InputJsonObject } });
    });
    return { ...(survey.answers as Prisma.JsonObject), id: survey.id, created_at: survey.createdAt.toISOString() };
  }
  @Get('me/surveys')
  async list(@Req() request: { identity: Identity }) {
    const c = await this.candidate(request.identity);
    const surveys = await this.db.survey.findMany({ where: { candidateId: c.id }, orderBy: { createdAt: 'desc' } });
    return surveys.map(s => ({ ...(s.answers as Prisma.JsonObject), id: s.id, created_at: s.createdAt.toISOString() }));
  }
}
