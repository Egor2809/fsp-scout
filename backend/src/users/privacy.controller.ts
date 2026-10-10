import { Body, Controller, Get, Put, Query, Req, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { Database } from '../database/database.service.js';
import { UpdateMyPrivacyBody } from '../contract/schemas.js';
import { parse } from '../common/validation.js';
import { Problem } from '../common/problem.js';

@Controller()
@UseGuards(AuthGuard)
export class PrivacyController {
  constructor(private readonly db: Database) {}
  private async candidate(identity: Identity) {
    if (identity.role !== 'candidate') throw new Problem(403, 'forbidden', 'Доступно кандидату');
    const c = await this.db.candidate.findFirst({ where: { user: { subject: identity.sub } }, include: { consents: true } });
    if (!c) throw new Problem(404, 'not_found', 'Профиль не найден');
    return c;
  }
  @Get('companies')
  async companies(@Req() request: { identity: Identity }, @Query('q') q?: string) {
    await this.candidate(request.identity);
    return this.db.company.findMany({ where: { name: { contains: (q ?? '').trim().slice(0, 120), mode: 'insensitive' } }, orderBy: { name: 'asc' }, take: 20,
      select: { id: true, name: true, industry: true, city: true, verified: true } });
  }
  @Get('me/privacy')
  async get(@Req() request: { identity: Identity }) {
    const c = await this.candidate(request.identity);
    const privacy = c.privacy as Prisma.JsonObject;
    const profile = c.profile as Prisma.JsonObject;
    const ids = (privacy.hidden_company_ids ?? []) as string[];
    const hidden = await this.db.company.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, industry: true, city: true, verified: true } });
    return { availability: profile.availability ?? 'active', salary_floor: c.salaryFloor,
      hidden_companies: hidden, show_fsp: privacy.show_fsp ?? true,
      show_company_names: privacy.show_company_names ?? false, show_city: privacy.show_city ?? true,
      profile_published: Boolean(c.grade && profile.availability !== 'not_looking' && c.consents.some(x => x.type === 'profile_visibility' && !x.revokedAt)) };
  }
  @Put('me/privacy')
  async update(@Req() request: { identity: Identity }, @Body() body: unknown) {
    const data = parse(UpdateMyPrivacyBody, body);
    const c = await this.candidate(request.identity);
    await this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${c.id}::uuid FOR UPDATE`;
      const fresh = await tx.candidate.findUniqueOrThrow({ where: { id: c.id } });
      const companies = await tx.company.count({ where: { id: { in: [...new Set(data.hidden_company_ids)] } } });
      if (companies !== new Set(data.hidden_company_ids).size) throw new Problem(422, 'validation_error', 'Неизвестная компания', { errors: [{ pointer: '/hidden_company_ids', detail: 'Компания не найдена' }] });
      const { availability, salary_floor, ...privacy } = data;
      // Persist revocation: restoring a setting must not reactivate an old bearer link.
      if (!privacy.show_fsp || availability === 'not_looking') await tx.profileCertificate.updateMany({
        where: { candidateId: c.id, revokedAt: null }, data: { revokedAt: new Date() },
      });
      await tx.candidate.update({ where: { id: c.id }, data: { salaryFloor: salary_floor,
        privacy, profile: { ...(fresh.profile as Prisma.JsonObject), availability } as Prisma.InputJsonObject } });
      await tx.audit.create({ data: { actorSubject: request.identity.sub, action: 'privacy.updated', resourceId: c.id } });
    });
    return this.get(request);
  }
}
