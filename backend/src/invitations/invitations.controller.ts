import { Body, Controller, Get, HttpCode, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { Database } from '../database/database.service.js';
import { Problem } from '../common/problem.js';
import { parse, checkOfferSalary } from '../common/validation.js';
import { quotaPeriod, transition, type InvitationStatus } from '../common/invitation-state.ts';
import { AcceptInvitationBody, CreateInvitationBody, DeclineInvitationBody, PostponeInvitationBody, PrecheckInvitationBody, UpdateInvitationStageBody, WithdrawInvitationBody, ListCompanyInvitationsQueryParams, ListMyInvitationsQueryParams } from '../contract/schemas.js';
import { strings } from '../common/query.js';
import { invitationStats } from '../common/invitation-stats.js';

type Request = { identity: Identity };
type Tx = Prisma.TransactionClient;
const include = { company: true, vacancy: { include: { company: true } }, candidate: { include: { user: true } }, events: { orderBy: { at: 'asc' as const } } } satisfies Prisma.InvitationInclude;
type Record = Prisma.InvitationGetPayload<{ include: typeof include }>;
const active = ['sent', 'viewed', 'postponed'];

@Controller()
@UseGuards(AuthGuard)
export class InvitationsController {
  constructor(private readonly db: Database) {}
  private async company(identity: Identity, tx: Tx = this.db) {
    if (identity.role !== 'employer') throw new Problem(403, 'forbidden', 'Доступно работодателю');
    const membership = await tx.membership.findFirst({ where: { user: { subject: identity.sub } }, include: { company: true } });
    if (!membership) throw new Problem(403, 'forbidden', 'Компания не назначена');
    return membership.company;
  }
  private async visible(tx: Tx, candidateId: string, companyId: string) {
    const c = await tx.candidate.findUnique({ where: { id: candidateId }, include: { consents: true } });
    const profile = c?.profile as Prisma.JsonObject | undefined;
    const privacy = c?.privacy as Prisma.JsonObject | undefined;
    if (!c || !c.grade || !c.confirmedSpecialization || !profile?.standing || profile?.availability === 'not_looking'
        || ((privacy?.hidden_company_ids ?? []) as string[]).includes(companyId)
        || !c.consents.some(x => x.type === 'profile_visibility' && !x.revokedAt)) {
      throw new Problem(404, 'not_found', 'Кандидат недоступен');
    }
    return c;
  }
  private async quota(tx: Tx, companyId: string, now: Date) {
    const period = quotaPeriod(now);
    const company = await tx.company.findUniqueOrThrow({ where: { id: companyId } });
    const trust = await this.trust(tx, companyId, now);
    const rate = trust.acceptance_rate;
    const bonus = Math.round(rate * 10);
    const penalty = 2 * trust.withdrawn_after_accept;
    const limit = Math.max(1, company.quotaBase + bonus - penalty);
    const used = await tx.invitation.count({ where: { companyId, sentAt: { gte: period.start, lt: period.end } } });
    return { limit, used, remaining: Math.max(0, limit - used), period_start: period.start.toISOString(), period_end: period.end.toISOString(), acceptance_rate: Math.round(rate * 100) / 100, bonus, penalty };
  }
  private async trust(tx: Tx, companyId: string, now: Date) {
    const recent = await tx.invitation.findMany({ where: { companyId, sentAt: { gte: new Date(now.getTime() - 90 * 86400000) } }, select: { status: true, response: true } });
    const responses = recent.map(x => x.response as Prisma.JsonObject | null).filter(x => x && x.decision !== 'postponed');
    const accepted = responses.filter(x => x?.decision === 'accepted').length;
    return { invitations_90d: recent.length, acceptance_rate: responses.length ? Math.round(accepted / responses.length * 100) / 100 : 0,
      withdrawn_after_accept: recent.filter(x => x.status === 'withdrawn' && (x.response as Prisma.JsonObject | null)?.decision === 'accepted').length };
  }
  private async view(inv: Record, role: Identity['role']) {
    const offer = inv.offer as Prisma.JsonObject;
    const profile = inv.candidate.profile as Prisma.JsonObject;
    const disclosed = role === 'employer' && await this.db.disclosure.findUnique({ where: { companyId_candidateId: { companyId: inv.companyId, candidateId: inv.candidateId } } });
    const category = (profile.standing as Prisma.JsonObject | undefined)?.category ?? null;
    return {
      id: inv.id, status: inv.status, title: offer.title, description: offer.description,
      salary: { from: inv.salaryFrom, to: inv.salaryTo }, work_format: offer.work_format,
      city: offer.city ?? null, company: { id: inv.company.id, name: inv.company.name, industry: inv.company.industry, city: inv.company.city, verified: inv.company.verified },
      company_trust: await this.trust(this.db, inv.companyId, new Date()), contact_person: offer.contact_person, contact: offer.contact, vacancy: inv.vacancy ? { id: inv.vacancy.id, title: inv.vacancy.title,
        company: { id: inv.vacancy.company.id, name: inv.vacancy.company.name, industry: inv.vacancy.company.industry, city: inv.vacancy.company.city, verified: inv.vacancy.company.verified } } : null,
      candidate: { id: inv.candidateId, alias: `Кандидат #${createHash('sha256').update(`${inv.companyId}:${inv.candidateId}`).digest('hex').slice(0, 8).toUpperCase()}`, category,
        percentile: (profile.standing as Prisma.JsonObject | undefined)?.percentile ?? null },
      source: offer.source ?? { type: 'bank', id: null }, created_at: inv.sentAt.toISOString(), sent_at: inv.sentAt.toISOString(),
      viewed_at: inv.viewedAt?.toISOString() ?? null, expires_at: inv.expiresAt.toISOString(), response: inv.response,
      candidate_contacts: disclosed ? { full_name: profile.full_name ?? inv.candidate.user.displayName, email: inv.candidate.user.email,
        phone: profile.phone ?? null, telegram: profile.telegram ?? null, preferred_channel: (inv.response as Prisma.JsonObject | null)?.channel ?? 'email' } : null,
      events: inv.events.map(e => ({ id: e.id, at: e.at.toISOString(), status: e.status, actor: e.actor, note: e.note })),
    };
  }
  private async owned(identity: Identity, id: string, tx: Tx = this.db) {
    parse(z.uuid(), id);
    const scope = identity.role === 'candidate' ? { candidate: { user: { subject: identity.sub } } }
      : identity.role === 'employer' ? { companyId: (await this.company(identity, tx)).id } : null;
    if (!scope) throw new Problem(403, 'forbidden', 'Доступ запрещён');
    const inv = await tx.invitation.findFirst({ where: { id, ...scope }, include });
    if (!inv) throw new Problem(404, 'not_found', 'Приглашение не найдено');
    return inv;
  }
  @Get('company/invitation-quota')
  async getQuota(@Req() request: Request) {
    return this.quota(this.db, (await this.company(request.identity)).id, new Date());
  }
  @Post('invitations/precheck')
  @HttpCode(200)
  async precheck(@Req() request: Request, @Body() body: unknown) {
    const data = parse(PrecheckInvitationBody, body);
    checkOfferSalary(data.salary, '/salary');
    const co = await this.company(request.identity);
    return this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Company" WHERE id = ${co.id}::uuid FOR UPDATE`;
      const c = await this.visible(tx, data.candidate_id, co.id);
      const now = new Date();
      const count = await tx.audit.count({ where: { action: 'invitation.precheck', resourceId: c.id, actorSubject: `company:${co.id}`, at: { gte: new Date(now.getTime() - 3600000) } } });
      if (count >= 10) throw new Problem(429, 'rate_limited', 'Слишком много проверок');
      await tx.audit.create({ data: { actorSubject: `company:${co.id}`, action: 'invitation.precheck', resourceId: c.id } });
      const quota = await this.quota(tx, co.id, now);
      const salaryOk = c.salaryFloor === null || data.salary.to >= c.salaryFloor;
      const duplicate = Boolean(await tx.invitation.findFirst({ where: { companyId: co.id, candidateId: c.id, status: { in: active }, expiresAt: { gt: now } } }));
      return { can_send: salaryOk && !duplicate && quota.remaining > 0, salary_ok: salaryOk, already_invited: duplicate, candidate_available: true, quota };
    });
  }
  @Post('invitations')
  async create(@Req() request: Request, @Body() body: unknown) {
    const data = parse(CreateInvitationBody, body);
    checkOfferSalary(data.salary, '/salary');
    const co = await this.company(request.identity);
    if (data.source && ((data.source.type === 'bank' && data.source.id !== null) || (data.source.type !== 'bank' && !data.source.id))) throw new Problem(422, 'validation_error', 'Некорректный источник', { errors: [{ pointer: '/source/id', detail: 'Для связанного источника нужен ID, для банка ID должен быть null' }] });
    const vacancyId = data.vacancy_id ?? (data.source?.type === 'vacancy' ? data.source.id : null);
    if (data.source?.type === 'vacancy' && data.vacancy_id && data.vacancy_id !== data.source.id) throw new Problem(422, 'validation_error', 'Вакансии не совпадают', { errors: [{ pointer: '/vacancy_id', detail: 'ID должен совпадать с источником' }] });
    const inv = await this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Company" WHERE id = ${co.id}::uuid FOR UPDATE`;
      if (data.source?.type === 'search' && !await tx.search.findFirst({ where: { id: data.source.id!, companyId: co.id } })) throw new Problem(404, 'not_found', 'Поиск не найден');
      if (data.source?.type === 'task_submission' && !await tx.taskSubmission.findFirst({ where: { id: data.source.id!, candidateId: data.candidate_id, assignment: { task: { companyId: co.id } } } })) throw new Problem(404, 'not_found', 'Решение не найдено');
      if (vacancyId) {
        await tx.$queryRaw`SELECT id FROM "Vacancy" WHERE id = ${vacancyId}::uuid FOR UPDATE`;
        if (!await tx.vacancy.findFirst({ where: { id: vacancyId, companyId: co.id, status: 'published' } })) throw new Problem(404, 'not_found', 'Вакансия недоступна');
      }
      await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${data.candidate_id}::uuid FOR UPDATE`;
      const c = await this.visible(tx, data.candidate_id, co.id);
      const now = new Date();
      const stale = await tx.invitation.findMany({ where: { companyId: co.id, candidateId: c.id, status: { in: active }, expiresAt: { lte: now } } });
      for (const old of stale) await tx.invitation.update({ where: { id: old.id }, data: { status: 'expired', events: { create: { status: 'expired', actor: 'system' } } } });
      if (await tx.invitation.findFirst({ where: { companyId: co.id, candidateId: c.id, status: { in: active } } })) throw new Problem(409, 'already_invited', 'Приглашение уже отправлено');
      const quota = await this.quota(tx, co.id, now);
      if (!quota.remaining) throw new Problem(429, 'quota_exceeded', 'Квота исчерпана', { quota });
      if (c.salaryFloor !== null && data.salary.to < c.salaryFloor) throw new Problem(422, 'salary_below_floor', 'Вилка ниже ожиданий кандидата');
      return tx.invitation.create({ data: { companyId: co.id, candidateId: c.id, vacancyId, salaryFrom: data.salary.from, salaryTo: data.salary.to,
        offer: JSON.parse(JSON.stringify(data)) as Prisma.InputJsonObject, sentAt: now, expiresAt: new Date(now.getTime() + data.response_days * 86400000),
        events: { create: { status: 'sent', actor: 'employer', at: now } } }, include });
    });
    return this.view(inv, request.identity.role);
  }
  @Get('invitations')
  async listEmployer(@Req() request: Request, @Query() query: { status?: unknown; candidate_id?: unknown }) {
    const co = await this.company(request.identity);
    const filter = parse(ListCompanyInvitationsQueryParams, { ...query, status: query.status === undefined ? undefined : strings(query.status) });
    await this.expire({ companyId: co.id });
    const records = await this.db.invitation.findMany({ where: { companyId: co.id, ...(filter.candidate_id ? { candidateId: filter.candidate_id } : {}), ...(filter.status ? { status: { in: filter.status } } : {}) }, include, orderBy: [{ sentAt: 'desc' }, { id: 'desc' }] });
    return Promise.all(records.map(x => this.view(x, 'employer')));
  }
  @Get('invitations/stats')
  async stats(@Req() request: Request, @Query('days') days: unknown) {
    const period = parse(z.coerce.number().int().min(7).max(365).default(90), days);
    const co = await this.company(request.identity), now = new Date();
    await this.expire({ companyId: co.id });
    const rows = await this.db.invitation.findMany({ where: { companyId: co.id, sentAt: { gte: new Date(now.getTime() - period * 86400000), lte: now } },
      select: { sentAt: true, viewedAt: true, response: true, events: { select: { at: true, status: true, actor: true } } } });
    return invitationStats(rows.map(r => ({ ...r, response: r.response as Prisma.JsonObject | null })), period);
  }
  @Get('me/invitations')
  async listCandidate(@Req() request: Request, @Query() query: { status?: unknown }) {
    if (request.identity.role !== 'candidate') throw new Problem(403, 'forbidden', 'Доступно кандидату');
    const filter = parse(ListMyInvitationsQueryParams, { status: query.status === undefined ? undefined : strings(query.status) });
    const scope = { candidate: { user: { subject: request.identity.sub } } };
    await this.expire(scope);
    const records = await this.db.invitation.findMany({ where: { ...scope, ...(filter.status ? { status: { in: filter.status } } : {}) }, include, orderBy: [{ sentAt: 'desc' }, { id: 'desc' }] });
    return Promise.all(records.map(x => this.view(x, 'candidate')));
  }
  @Get('invitations/:id')
  async get(@Req() request: Request, @Param('id') id: string) {
    const owned = await this.owned(request.identity, id);
    await this.expire({ id: owned.id });
    return this.view(await this.owned(request.identity, id), request.identity.role);
  }

  private async expire(scope: Prisma.InvitationWhereInput) {
    await this.db.$transaction(async tx => {
      const now = new Date();
      const stale = await tx.invitation.findMany({ where: { ...scope, status: { in: active }, expiresAt: { lte: now } }, select: { id: true }, orderBy: { id: 'asc' } });
      for (const inv of stale) {
        // Compare-and-set prevents duplicate events when the maintenance worker races a read.
        const changed = await tx.invitation.updateMany({ where: { id: inv.id, status: { in: active }, expiresAt: { lte: now } }, data: { status: 'expired' } });
        if (changed.count) await tx.invitationEvent.create({ data: { invitationId: inv.id, status: 'expired', actor: 'system', at: now } });
      }
    });
  }

  private async change(request: Request, id: string, next: InvitationStatus, response?: Prisma.InputJsonObject, note?: string | null) {
    const expectedRole = ['withdrawn', 'interview', 'offer', 'hired', 'closed'].includes(next) ? 'employer' : 'candidate';
    if (request.identity.role !== expectedRole) throw new Problem(403, 'forbidden', 'Действие недоступно для роли');
    const result = await this.db.$transaction(async tx => {
      const initial = await this.owned(request.identity, id, tx);
      // Consistent lock order with sending avoids FK-lock deadlocks during disclosure.
      await tx.$queryRaw`SELECT id FROM "Company" WHERE id = ${initial.companyId}::uuid FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${initial.candidateId}::uuid FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM "Invitation" WHERE id = ${id}::uuid FOR UPDATE`;
      const inv = await this.owned(request.identity, id, tx);
      const now = new Date();
      if (active.includes(inv.status) && inv.expiresAt <= now) {
        await tx.invitation.update({ where: { id }, data: { status: 'expired', events: { create: { status: 'expired', actor: 'system', at: now } } } });
        return null; // Commit expiry before reporting the conflict.
      }
      if (next === 'viewed' && inv.status !== 'sent') return inv;
      try { transition({ status: inv.status as InvitationStatus, expiresAt: inv.expiresAt, postponedOnce: inv.postponedOnce }, next, request.identity.role as 'candidate' | 'employer', now); }
      catch { throw new Problem(409, 'invitation_not_actionable', 'Действие недоступно'); }
      if (next === 'accepted') {
        const profile = inv.candidate.profile as Prisma.JsonObject;
        const channel = response?.channel;
        if (channel !== 'email' && !(typeof channel === 'string' && profile[channel])) throw new Problem(422, 'validation_error', 'Канал не заполнен', { errors: [{ pointer: '/channel', detail: 'Заполните контакт в профиле' }] });
        await tx.disclosure.upsert({ where: { companyId_candidateId: { companyId: inv.companyId, candidateId: inv.candidateId } }, create: { companyId: inv.companyId, candidateId: inv.candidateId, sourceId: id, reason: 'invitation_accepted' }, update: {} });
        await tx.audit.create({ data: { actorSubject: request.identity.sub, action: 'contacts.disclosed', resourceId: inv.candidateId, metadata: { company_id: inv.companyId, invitation_id: id } } });
      }
      if (next === 'postponed' && typeof response?.postponed_until === 'string') {
        const until = new Date(response.postponed_until);
        if (until <= now || until > inv.expiresAt) throw new Problem(422, 'validation_error', 'Некорректная дата', { errors: [{ pointer: '/until', detail: 'Дата должна быть в будущем до окончания срока приглашения' }] });
      }
      return tx.invitation.update({ where: { id }, data: { status: next, ...(['viewed', 'accepted', 'declined', 'postponed'].includes(next) && !inv.viewedAt ? { viewedAt: now } : {}), ...(next === 'postponed' ? { postponedOnce: true } : {}),
        ...(response ? { response: { ...response, responded_at: now.toISOString() } } : {}), events: { create: { status: next, actor: request.identity.role, note: note ?? null, at: now } } }, include });
    });
    if (!result) throw new Problem(409, 'invitation_not_actionable', 'Срок приглашения истёк');
    return this.view(result, request.identity.role);
  }
  @Post('invitations/:id/view') @HttpCode(200)
  async viewed(@Req() r: Request, @Param('id') id: string) {
    if (r.identity.role !== 'candidate') throw new Problem(403, 'forbidden', 'Доступно кандидату');
    return this.change(r, id, 'viewed');
  }
  @Post('invitations/:id/accept') @HttpCode(200)
  async accept(@Req() r: Request, @Param('id') id: string, @Body() body: unknown) {
    const d = parse(AcceptInvitationBody, body);
    return this.change(r, id, 'accepted', { decision: 'accepted', reason: null, comment: d.message ?? null, channel: d.channel, call_slot: d.call_slot ?? null, postponed_until: null });
  }
  @Post('invitations/:id/decline') @HttpCode(200)
  async decline(@Req() r: Request, @Param('id') id: string, @Body() body: unknown) {
    const d = parse(DeclineInvitationBody, body);
    if (d.reason === 'other' && !d.comment?.trim()) throw new Problem(422, 'validation_error', 'Укажите причину', { errors: [{ pointer: '/comment', detail: 'Комментарий обязателен' }] });
    return this.change(r, id, 'declined', { decision: 'declined', reason: d.reason, comment: d.comment ?? null, channel: null, call_slot: null, postponed_until: null });
  }
  @Post('invitations/:id/postpone') @HttpCode(200)
  async postpone(@Req() r: Request, @Param('id') id: string, @Body() body: unknown) {
    const d = parse(PostponeInvitationBody, body);
    return this.change(r, id, 'postponed', { decision: 'postponed', reason: null, comment: null, channel: null, call_slot: null, postponed_until: d.until ? `${d.until}T00:00:00Z` : null });
  }
  @Post('invitations/:id/withdraw') @HttpCode(200)
  async withdraw(@Req() r: Request, @Param('id') id: string, @Body() body: unknown) {
    const d = parse(WithdrawInvitationBody, body);
    return this.change(r, id, 'withdrawn', undefined, d.note);
  }
  @Post('invitations/:id/stage') @HttpCode(200)
  async stage(@Req() r: Request, @Param('id') id: string, @Body() body: unknown) {
    const d = parse(UpdateInvitationStageBody, body);
    return this.change(r, id, d.status, undefined, d.note);
  }
}
