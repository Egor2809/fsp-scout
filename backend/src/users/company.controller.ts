import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { Database } from '../database/database.service.js';
import { UpdateMyCompanyBody } from '../contract/schemas.js';
import { parse } from '../common/validation.js';
import { Problem } from '../common/problem.js';

@Controller('company')
@UseGuards(AuthGuard)
export class CompanyController {
  constructor(private readonly db: Database) {}
  private async company(identity: Identity) {
    if (identity.role !== 'employer') throw new Problem(403, 'forbidden', 'Доступно работодателю');
    const member = await this.db.membership.findFirst({ where: { user: { subject: identity.sub } }, include: { company: true } });
    if (!member) throw new Problem(403, 'forbidden', 'Компания не назначена администратором');
    return member.company;
  }
  @Get()
  async get(@Req() request: { identity: Identity }) {
    const c = await this.company(request.identity);
    const d = c.details as Prisma.JsonObject;
    return { id: c.id, name: c.name, industry: c.industry, description: c.description, city: c.city,
      website: d.website ?? null, size: d.size ?? '1-50', inn: d.inn ?? null,
      contact_email: d.contact_email ?? request.identity.email, contact_phone: d.contact_phone ?? null,
      verified: c.verified, created_at: c.createdAt.toISOString() };
  }
  @Put()
  async update(@Req() request: { identity: Identity }, @Body() body: unknown) {
    const data = parse(UpdateMyCompanyBody, body);
    const c = await this.company(request.identity);
    await this.db.company.update({ where: { id: c.id }, data: { name: data.name.trim(), industry: data.industry, description: data.description, city: data.city ?? null,
      details: { website: data.website ?? null, size: data.size, inn: data.inn ?? null, contact_email: data.contact_email, contact_phone: data.contact_phone ?? null } } });
    return this.get(request);
  }
}
