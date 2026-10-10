import { Body, Controller, Get, HttpCode, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { Database } from '../database/database.service.js';
import { MatchingService } from '../matching/matching.service.js';
import { candidateInclude, card, snapshot, type CandidateRow } from '../matching/candidate-mapper.js';
import { explain } from '../matching/matching.js';
import { CreateVacancyBody, UpdateVacancyBody, ListVacanciesQueryParams, ApplyToVacancyBody, UpdateApplicationStatusBody } from '../contract/schemas.js';
import type { ApplicationStatus, SearchFilters, VacancyInput } from '../contract/model/index.js';
import { Problem } from '../common/problem.js';
import { parse, checkSalary } from '../common/validation.js';
import { pagination } from '../common/query.js';
import { skillRef, SKILL_BY_ID } from '../common/taxonomy-data.js';
import { applicationTransition } from '../common/application-state.js';
import { vacancyBlueprint } from '../assessment/vacancy-blueprint.js';
import type { Grade, Specialization } from '../contract/model/index.js';

type Request = { identity: Identity };
type Tx = Prisma.TransactionClient;
const vacancyInclude = { company: true, _count: { select: { applications: true } } } satisfies Prisma.VacancyInclude;
type VacancyRow = Prisma.VacancyGetPayload<{ include: typeof vacancyInclude }>;
const applicationInclude = { vacancy: { include: vacancyInclude }, candidate: { include: candidateInclude }, events: { orderBy: [{ at: 'asc' as const }, { id: 'asc' as const }] } } satisfies Prisma.ApplicationInclude;
type ApplicationRow = Prisma.ApplicationGetPayload<{ include: typeof applicationInclude }>;
const brief = (v: VacancyRow) => ({ id: v.id, title: v.title, company: { id: v.company.id, name: v.company.name, industry: v.company.industry, city: v.company.city, verified: v.company.verified } });
export function vacancyFilters(v: VacancyRow): SearchFilters {
  return { specialization: v.specialization as SearchFilters['specialization'], grades: [v.grade as SearchFilters['grades'][number]],
    must_skills: v.mustSkills, nice_skills: v.niceSkills, work_formats: [v.workFormat as SearchFilters['work_formats'][number]],
    city: v.city, include_relocation: true, industries: [v.company.industry as SearchFilters['industries'][number]],
    salary: { from: v.salaryFrom, to: v.salaryTo }, fsp_only: false, fsp_level_min: null, availability: ['active', 'open'] };
}

@Controller()
@UseGuards(AuthGuard)
export class VacanciesController {
  constructor(private readonly db: Database, private readonly matching: MatchingService) {}
  private async candidate(identity: Identity, tx: Tx = this.db) {
    if (identity.role !== 'candidate') throw new Problem(403, 'forbidden', 'Доступно кандидату');
    const row = await tx.candidate.findFirst({ where: { user: { subject: identity.sub } }, include: candidateInclude });
    if (!row) throw new Problem(404, 'not_found', 'Профиль не найден');
    return row;
  }
  private async owned(identity: Identity, id: string, tx: Tx = this.db) {
    parse(z.uuid(), id);
    const company = await this.matching.company(identity, tx);
    const vacancy = await tx.vacancy.findFirst({ where: { id, companyId: company.id }, include: vacancyInclude });
    if (!vacancy) throw new Problem(404, 'not_found', 'Вакансия не найдена');
    return vacancy;
  }
  private input(body: unknown, update = false) {
    const data = parse(update ? UpdateVacancyBody : CreateVacancyBody, body);
    checkSalary(data.salary, '/salary');
    for (const key of ['must_skills', 'nice_skills'] as const) {
      const ids = data[key];
      const bad = ids.findIndex(id => !SKILL_BY_ID.has(id));
      if (bad >= 0 || new Set(ids).size !== ids.length) throw new Problem(422, 'validation_error', 'Проверьте навыки', { errors: [{ pointer: `/${key}`, detail: 'Навыки должны быть известными и уникальными' }] });
    }
    if (data.nice_skills.some(id => data.must_skills.includes(id))) throw new Problem(422, 'validation_error', 'Навыки пересекаются', { errors: [{ pointer: '/nice_skills', detail: 'Обязательный навык не дублируется в желательных' }] });
    return data;
  }
  private values(d: VacancyInput) {
    return { title: d.title, description: d.description, specialization: d.specialization, grade: d.grade,
      mustSkills: d.must_skills, niceSkills: d.nice_skills, workFormat: d.work_format, city: d.city,
      salaryFrom: d.salary.from, salaryTo: d.salary.to, status: d.status };
  }
  private view(v: VacancyRow, owner: boolean, candidate: CandidateRow | null, application: { id: string; status: string } | null = null) {
    const explanation = candidate && snapshot(candidate).profile.standing ? explain(snapshot(candidate), vacancyFilters(v), new Date()) : null;
    return { ...brief(v), description: v.description, specialization: v.specialization, grade: v.grade,
      must_skills: v.mustSkills.map(skillRef), nice_skills: v.niceSkills.map(skillRef), work_format: v.workFormat, city: v.city,
      salary: { from: v.salaryFrom, to: v.salaryTo }, status: v.status, published_at: v.publishedAt?.toISOString() ?? null,
      created_at: v.createdAt.toISOString(), applications_count: owner ? v._count.applications : null,
      my_application: application ? { id: application.id, status: application.status } : null,
      match: explanation ? { score: explanation.score, chips: explanation.chips } : null };
  }
  @Get('company/vacancies')
  async companyList(@Req() req: Request) {
    const co = await this.matching.company(req.identity);
    return (await this.db.vacancy.findMany({ where: { companyId: co.id }, include: vacancyInclude, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] })).map(v => this.view(v, true, null));
  }
  @Get('vacancies')
  async list(@Req() req: Request, @Query() query: Record<string, unknown>) {
    const paging = pagination(query);
    const filter = parse(ListVacanciesQueryParams, { ...query, ...paging });
    const c = req.identity.role === 'candidate' ? await this.candidate(req.identity) : null;
    const co = req.identity.role === 'employer' ? await this.matching.company(req.identity) : null;
    if (!c && !co) throw new Problem(403, 'forbidden', 'Доступ запрещён');
    const where: Prisma.VacancyWhereInput = { status: 'published', ...(filter.specialization ? { specialization: filter.specialization } : {}),
      ...(filter.grade ? { grade: filter.grade } : {}), ...(filter.work_format ? { workFormat: filter.work_format } : {}),
      ...(filter.q ? { OR: [{ title: { contains: filter.q, mode: 'insensitive' } }, { description: { contains: filter.q, mode: 'insensitive' } }] } : {}) };
    const [total, rows] = await this.db.$transaction([
      this.db.vacancy.count({ where }), this.db.vacancy.findMany({ where, include: vacancyInclude, orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }], skip: (paging.page - 1) * paging.page_size, take: paging.page_size }),
    ], { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
    const applications = c ? await this.db.application.findMany({ where: { candidateId: c.id, vacancyId: { in: rows.map(v => v.id) } }, select: { id: true, status: true, vacancyId: true } }) : [];
    const byVacancy = new Map(applications.map(a => [a.vacancyId, a]));
    return { items: rows.map(v => this.view(v, co?.id === v.companyId, c, byVacancy.get(v.id) ?? null)), total, ...paging };
  }
  @Post('vacancies')
  async create(@Req() req: Request, @Body() body: unknown) {
    const co = await this.matching.company(req.identity), data = this.input(body);
    const v = await this.db.vacancy.create({ data: { companyId: co.id, ...this.values(data), publishedAt: data.status === 'published' ? new Date() : null }, include: vacancyInclude });
    return this.view(v, true, null);
  }
  @Get('vacancies/:id')
  async get(@Req() req: Request, @Param('id') id: string) {
    parse(z.uuid(), id);
    const c = req.identity.role === 'candidate' ? await this.candidate(req.identity) : null;
    const co = req.identity.role === 'employer' ? await this.matching.company(req.identity) : null;
    if (!c && !co) throw new Problem(403, 'forbidden', 'Доступ запрещён');
    const application = c ? await this.db.application.findUnique({ where: { vacancyId_candidateId: { vacancyId: id, candidateId: c.id } }, select: { id: true, status: true } }) : null;
    const v = await this.db.vacancy.findUnique({ where: { id }, include: vacancyInclude });
    if (!v || (v.status !== 'published' && co?.id !== v.companyId && !application)) throw new Problem(404, 'not_found', 'Вакансия не найдена');
    return this.view(v, co?.id === v.companyId, c, application);
  }
  @Get('vacancies/:id/test-blueprint')
  async blueprint(@Req() req: Request, @Param('id') id: string) {
    // Reuse the same ownership/publication/application visibility rules as the vacancy.
    const v = await this.get(req, id);
    return vacancyBlueprint({ id: v.id, title: v.title, specialization: v.specialization as Specialization,
      grade: v.grade as Grade, mustSkills: v.must_skills.map(s => s.id), niceSkills: v.nice_skills.map(s => s.id) });
  }
  @Put('vacancies/:id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() body: unknown) {
    const data = this.input(body, true);
    const v = await this.db.$transaction(async tx => {
      await this.owned(req.identity, id, tx);
      await tx.$queryRaw`SELECT id FROM "Vacancy" WHERE id = ${id}::uuid FOR UPDATE`;
      const current = await this.owned(req.identity, id, tx);
      return tx.vacancy.update({ where: { id }, data: { ...this.values(data), publishedAt: data.status === 'published' ? current.publishedAt ?? new Date() : current.publishedAt }, include: vacancyInclude });
    });
    return this.view(v, true, null);
  }
  private applicationView(a: ApplicationRow) {
    return { id: a.id, vacancy: brief(a.vacancy), status: a.status, cover_letter: a.coverLetter, created_at: a.createdAt.toISOString(), updated_at: a.updatedAt.toISOString(),
      events: a.events.map(e => ({ at: e.at.toISOString(), status: e.status, actor: e.actor, note: e.note })) };
  }
  private async employerView(a: ApplicationRow) {
    const disclosure = await this.db.disclosure.findUnique({ where: { companyId_candidateId: { companyId: a.vacancy.companyId, candidateId: a.candidateId } } });
    const invitation = await this.db.invitation.findFirst({ where: { companyId: a.vacancy.companyId, candidateId: a.candidateId }, orderBy: [{ sentAt: 'desc' }, { id: 'desc' }], select: { id: true, status: true } });
    return { ...this.applicationView(a), candidate: card(a.candidate, a.vacancy.companyId, new Date(), disclosure,
      { invitation: invitation ? { id: invitation.id, status: invitation.status as 'sent' } : null, application: { id: a.id, status: a.status as ApplicationStatus, vacancy_id: a.vacancyId } }),
      explanation: explain(snapshot(a.candidate), vacancyFilters(a.vacancy), new Date()) };
  }
  @Post('vacancies/:id/apply')
  async apply(@Req() req: Request, @Param('id') id: string, @Body() body: unknown) {
    parse(z.uuid(), id);
    const data = parse(ApplyToVacancyBody, body ?? {}), candidate = await this.candidate(req.identity);
    const a = await this.db.$transaction(async tx => {
      const initial = await tx.vacancy.findUnique({ where: { id } });
      if (!initial) throw new Problem(404, 'not_found', 'Вакансия не найдена');
      // Same Company -> Candidate order as invitations; vacancy closure is serialized too.
      await tx.$queryRaw`SELECT id FROM "Company" WHERE id = ${initial.companyId}::uuid FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${candidate.id}::uuid FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM "Vacancy" WHERE id = ${id}::uuid FOR UPDATE`;
      const vacancy = await tx.vacancy.findUniqueOrThrow({ where: { id } });
      if (vacancy.status === 'draft') throw new Problem(404, 'not_found', 'Вакансия не найдена');
      if (vacancy.status !== 'published') throw new Problem(409, 'vacancy_closed', 'Вакансия закрыта');
      if (await tx.application.findUnique({ where: { vacancyId_candidateId: { vacancyId: id, candidateId: candidate.id } } })) throw new Problem(409, 'already_applied', 'Отклик уже существует');
      if (!await tx.consent.findFirst({ where: { candidateId: candidate.id, type: 'personal_data', revokedAt: null } })) throw new Problem(403, 'consent_required', 'Нужно согласие', { consent_types: ['personal_data'] });
      const created = await tx.application.create({ data: { vacancyId: id, candidateId: candidate.id, coverLetter: data.cover_letter ?? null, events: { create: { status: 'submitted', actor: 'candidate' } } }, include: applicationInclude });
      await tx.disclosure.upsert({ where: { companyId_candidateId: { companyId: vacancy.companyId, candidateId: candidate.id } }, create: { companyId: vacancy.companyId, candidateId: candidate.id, sourceId: created.id, reason: 'application' }, update: {} });
      await tx.audit.create({ data: { actorSubject: req.identity.sub, action: 'contacts.disclosed', resourceId: candidate.id, metadata: { company_id: vacancy.companyId, application_id: created.id } } });
      return created;
    });
    return this.applicationView(a);
  }
  @Get('vacancies/:id/applications')
  async applications(@Req() req: Request, @Param('id') id: string) {
    await this.owned(req.identity, id);
    const rows = await this.db.application.findMany({ where: { vacancyId: id }, include: applicationInclude, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
    return Promise.all(rows.map(a => this.employerView(a)));
  }
  @Get('me/applications')
  async myApplications(@Req() req: Request) {
    const c = await this.candidate(req.identity);
    return (await this.db.application.findMany({ where: { candidateId: c.id }, include: applicationInclude, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] })).map(a => this.applicationView(a));
  }
  private async change(req: Request, id: string, status: ApplicationStatus, note: string | null, actor: 'candidate' | 'employer') {
    parse(z.uuid(), id);
    if (req.identity.role !== actor) throw new Problem(403, 'forbidden', 'Действие недоступно для роли');
    return this.db.$transaction(async tx => {
      const company = actor === 'employer' ? await this.matching.company(req.identity, tx) : null;
      const scope: Prisma.ApplicationWhereInput = company ? { vacancy: { companyId: company.id } } : { candidate: { user: { subject: req.identity.sub } } };
      if (!await tx.application.findFirst({ where: { id, ...scope }, select: { id: true } })) throw new Problem(404, 'not_found', 'Отклик не найден');
      await tx.$queryRaw`SELECT id FROM "Application" WHERE id = ${id}::uuid FOR UPDATE`;
      const a = await tx.application.findFirstOrThrow({ where: { id, ...scope } });
      if (!applicationTransition(a.status as ApplicationStatus, status, actor)) throw new Problem(409, 'conflict', 'Переход недоступен');
      return tx.application.update({ where: { id }, data: { status, events: { create: { status, actor, note } } }, include: applicationInclude });
    });
  }
  @Post('applications/:id/withdraw') @HttpCode(200)
  async withdraw(@Req() req: Request, @Param('id') id: string) { return this.applicationView(await this.change(req, id, 'withdrawn', null, 'candidate')); }
  @Post('applications/:id/status') @HttpCode(200)
  async status(@Req() req: Request, @Param('id') id: string, @Body() body: unknown) {
    const data = parse(UpdateApplicationStatusBody, body);
    return this.employerView(await this.change(req, id, data.status, data.note ?? null, 'employer'));
  }
}
