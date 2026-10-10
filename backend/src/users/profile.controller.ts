import { Body, Controller, Get, HttpCode, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { Database } from '../database/database.service.js';
import { Problem } from '../common/problem.js';
import { parse, checkSalary } from '../common/validation.js';
import { UpdateMyConsentsBody, UpdateMyProfileBody } from '../contract/schemas.js';
import { skills as taxonomySkills } from '../taxonomy/taxonomy.controller.js';
import { ownProfile } from '../matching/candidate-mapper.js';

const DOCUMENTS = [
  { type: 'personal_data', title: 'Согласие на обработку персональных данных', summary: 'Обработка данных профиля для работы сервиса.', required: true, document_url: '/legal/personal-data' },
  { type: 'profile_visibility', title: 'Согласие на показ профиля работодателям', summary: 'Показ анонимного профиля; согласие можно отозвать.', required: false, document_url: '/legal/profile-visibility' },
  { type: 'fsp_data', title: 'Согласие на получение данных ФСП', summary: 'Получение достижений при проверенной привязке ФСП ID.', required: false, document_url: '/legal/fsp-data' },
].map(document => ({ ...document, version: '2026-09' }));

type Request = { identity: Identity };

@Controller('me')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly db: Database) {}

  private async candidate(request: Request) {
    if (request.identity.role !== 'candidate') throw new Problem(403, 'forbidden', 'Доступно кандидату');
    const candidate = await this.db.candidate.findFirst({
      where: { user: { subject: request.identity.sub } }, include: { user: true, consents: { orderBy: { givenAt: 'desc' } } },
    });
    if (!candidate) throw new Problem(404, 'not_found', 'Сначала выполните GET /me');
    return candidate;
  }

  @Get('consents')
  async consents(@Req() request: Request) {
    const candidate = await this.candidate(request);
    const latest = new Map<string, typeof candidate.consents[number]>();
    for (const consent of candidate.consents) if (!latest.has(consent.type)) latest.set(consent.type, consent);
    return { documents: DOCUMENTS, consents: [...latest.values()].map(c => ({
      type: c.type, version: c.version, given_at: c.givenAt.toISOString(), revoked_at: c.revokedAt?.toISOString() ?? null,
    })) };
  }

  @Post('consents')
  @HttpCode(200)
  async updateConsents(@Req() request: Request, @Body() body: unknown) {
    const data = parse(UpdateMyConsentsBody, body);
    const candidate = await this.candidate(request);
    const seen = new Set<string>();
    for (const [index, item] of data.items.entries()) {
      if (seen.has(item.type) || !DOCUMENTS.some(d => d.type === item.type && d.version === item.version) || (item.type === 'personal_data' && !item.given)) {
        throw new Problem(422, 'validation_error', 'Некорректное согласие', { errors: [{ pointer: `/items/${index}`, detail: 'Проверьте версию и отсутствие дубликатов; отзыв обработки данных выполняется удалением аккаунта' }] });
      }
      seen.add(item.type);
    }
    await this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${candidate.id}::uuid FOR UPDATE`;
      for (const item of data.items) {
        const active = await tx.consent.findFirst({ where: { candidateId: candidate.id, type: item.type, revokedAt: null } });
        if (!item.given || (active && active.version !== item.version)) {
          await tx.consent.updateMany({ where: { candidateId: candidate.id, type: item.type, revokedAt: null }, data: { revokedAt: new Date() } });
        }
        if (item.given && (!active || active.version !== item.version)) {
          await tx.consent.create({ data: { candidateId: candidate.id, type: item.type, version: item.version } });
        }
        if (item.type === 'fsp_data' && !item.given) {
          const fresh = await tx.candidate.findUniqueOrThrow({ where: { id: candidate.id } });
          await tx.fspLink.deleteMany({ where: { candidateId: candidate.id } });
          await tx.candidate.update({ where: { id: candidate.id }, data: { profile: { ...(fresh.profile as Prisma.JsonObject), fsp_achievements: [] } as Prisma.InputJsonObject } });
        }
        if (!item.given && ['profile_visibility', 'fsp_data'].includes(item.type)) await tx.profileCertificate.updateMany({
          where: { candidateId: candidate.id, revokedAt: null }, data: { revokedAt: new Date() },
        });
        await tx.audit.create({ data: { actorSubject: request.identity.sub, action: item.given ? 'consent.given' : 'consent.revoked', resourceId: candidate.id, metadata: { type: item.type, version: item.version } } });
      }
    });
    return this.consents(request);
  }

  @Get('profile')
  async profile(@Req() request: Request) {
    return ownProfile(await this.candidate(request));
  }

  @Put('profile')
  async updateProfile(@Req() request: Request, @Body() body: unknown) {
    const data = parse(UpdateMyProfileBody, body);
    checkSalary(data.salary_expectation, '/salary_expectation');
    const unknownSkill = data.skills.findIndex(s => !taxonomySkills.has(s.skill_id));
    if (unknownSkill >= 0) throw new Problem(422, 'validation_error', 'Неизвестный навык', { errors: [{ pointer: `/skills/${unknownSkill}/skill_id`, detail: 'Навык отсутствует в справочнике' }] });
    const c = await this.candidate(request);
    if (!c.consents.some(x => x.type === 'personal_data' && !x.revokedAt)) throw new Problem(403, 'consent_required', 'Нужно согласие', { consent_types: ['personal_data'] });
    // A row lock prevents overwriting concurrently confirmed skills.
    await this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${c.id}::uuid FOR UPDATE`;
      if (!await tx.consent.findFirst({ where: { candidateId: c.id, type: 'personal_data', revokedAt: null } })) throw new Problem(403, 'consent_required', 'Нужно согласие', { consent_types: ['personal_data'] });
      const fresh = await tx.candidate.findUniqueOrThrow({ where: { id: c.id } });
      const old = fresh.profile as Record<string, Prisma.JsonValue>;
      if (old.full_name !== data.full_name) await tx.profileCertificate.updateMany({
        where: { candidateId: c.id, revokedAt: null }, data: { revokedAt: new Date() },
      });
      const confirmed = ((old.skills ?? []) as { skill_id: string; source: string }[]).filter(s => ['test', 'fsp', 'task'].includes(s.source));
      const skills = data.skills.filter(s => !confirmed.some(v => v.skill_id === s.skill_id)).map(s => ({ ...s, name: taxonomySkills.get(s.skill_id)!.name, verified: false, score: null }));
      const profile = JSON.parse(JSON.stringify({ ...old, ...data, phone: data.phone ?? null, telegram: data.telegram ?? null,
        city: data.city ?? null, about: data.about ?? null,
        experience: data.experience.map(e => ({ ...e, company_name: e.company_name ?? null, company_hidden: false, industry: e.industry ?? null, end: e.end ?? null, description: e.description ?? null })),
        skills: [...confirmed, ...skills],
      })) as Prisma.InputJsonObject;
      await tx.candidate.update({ where: { id: c.id }, data: { profile } });
    });
    return this.profile(request);
  }
}
