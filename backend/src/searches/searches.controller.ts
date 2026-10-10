import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { MatchingService } from '../matching/matching.service.js';
import { CreateSearchBody, RefineSearchBody } from '../contract/schemas.js';
import { Problem } from '../common/problem.js';
import { parse, checkSalary } from '../common/validation.js';
import { page, pagination } from '../common/query.js';
import { SKILL_BY_ID, skillName } from '../common/taxonomy-data.ts';
import { alias, candidateInclude, snapshot } from '../matching/candidate-mapper.ts';
import { category, hardFilters, published } from '../matching/matching.ts';
import type { SearchFilters } from '../contract/model/index.js';

const include = { versions: { orderBy: { version: 'asc' as const } }, shortlist: { include: { candidate: { include: candidateInclude } }, orderBy: { addedAt: 'asc' as const } } } satisfies Prisma.SearchInclude;
type SearchRow = Prisma.SearchGetPayload<{ include: typeof include }>;
type Request = { identity: Identity };
function validateFilters(filters: SearchFilters) {
  checkSalary(filters.salary, '/filters/salary');
  for (const field of ['must_skills', 'nice_skills'] as const) {
    const index = filters[field].findIndex(id => !SKILL_BY_ID.has(id));
    if (index >= 0) throw new Problem(422, 'validation_error', 'Неизвестный навык', { errors: [{ pointer: `/filters/${field}/${index}`, detail: 'Навык отсутствует в справочнике' }] });
  }
}
function diff(previous: SearchFilters, next: SearchFilters): string {
  const changes: string[] = [];
  for (const id of next.must_skills.filter(id => !previous.must_skills.includes(id))) changes.push(`+ ${skillName(id)} обязательно`);
  for (const id of previous.must_skills.filter(id => !next.must_skills.includes(id))) changes.push(`− ${skillName(id)}`);
  if (previous.grades.join() !== next.grades.join()) changes.push(`Грейды: ${next.grades.join(', ')}`);
  if (previous.city !== next.city) changes.push(`Город: ${next.city ?? 'любой'}`);
  if (previous.salary.from !== next.salary.from || previous.salary.to !== next.salary.to) changes.push(`Вилка ${next.salary.from}–${next.salary.to} ₽`);
  if (previous.work_formats.join() !== next.work_formats.join()) changes.push(`Формат: ${next.work_formats.join(', ')}`);
  return changes.slice(0, 3).join(' · ') || (JSON.stringify(previous) === JSON.stringify(next) ? 'Без изменений' : 'Уточнение фильтров');
}

@Controller('searches')
@UseGuards(AuthGuard)
export class SearchesController {
  constructor(private readonly matching: MatchingService) {}
  private async owned(identity: Identity, id: string, tx: Prisma.TransactionClient = this.matching.db) {
    parse(z.uuid(), id);
    const co = await this.matching.company(identity, tx);
    const search = await tx.search.findFirst({ where: { id, companyId: co.id }, include });
    if (!search) throw new Problem(404, 'not_found', 'Подборка не найдена');
    return search;
  }
  private async view(s: SearchRow) {
    const candidates = (await this.matching.rows(s.companyId)).map(c => snapshot(c));
    return { id: s.id, need_id: s.needId, title: s.title, created_at: s.createdAt.toISOString(), updated_at: s.updatedAt.toISOString(), current_version: s.currentVersion,
      versions: s.versions.map(v => ({ version: v.version, created_at: v.createdAt.toISOString(), label: v.label, filters: v.filters,
        results_total: candidates.filter(c => hardFilters(c, v.filters as unknown as SearchFilters, s.companyId)).length })),
      // Keep entries in storage, but never expose a candidate who withdrew publication.
      shortlist: s.shortlist.filter(entry => published(snapshot(entry.candidate), s.companyId)).map(entry => ({ candidate_id: entry.candidateId, alias: alias(s.companyId, entry.candidateId), category: snapshot(entry.candidate).profile.standing?.category ?? null, added_at: entry.addedAt.toISOString(), added_in_version: entry.addedInVersion })) };
  }
  @Get()
  async list(@Req() r: Request) {
    const co = await this.matching.company(r.identity);
    const rows = await this.matching.db.search.findMany({ where: { companyId: co.id }, include, orderBy: { updatedAt: 'desc' } });
    return Promise.all(rows.map(s => this.view(s)));
  }
  @Post()
  async create(@Req() r: Request, @Body() body: unknown) {
    const data = parse(CreateSearchBody, body); validateFilters(data.filters);
    const co = await this.matching.company(r.identity);
    if (data.need_id && !await this.matching.db.need.findFirst({ where: { id: data.need_id, companyId: co.id } })) throw new Problem(404, 'not_found', 'Потребность не найдена');
    const title = data.title?.trim() || `${category(data.filters.specialization, data.filters.grades[0]!).label}: ${data.filters.must_skills.slice(0, 3).map(skillName).join(', ')}`;
    const row = await this.matching.db.search.create({ data: { companyId: co.id, needId: data.need_id ?? null, title,
      versions: { create: { version: 1, label: 'Исходная потребность', filters: data.filters as unknown as Prisma.InputJsonObject } } }, include });
    return this.view(row);
  }
  @Get(':id')
  async get(@Req() r: Request, @Param('id') id: string) { return this.view(await this.owned(r.identity, id)); }
  @Patch(':id')
  async refine(@Req() r: Request, @Param('id') id: string, @Body() body: unknown) {
    const data = parse(RefineSearchBody, body); validateFilters(data.filters);
    await this.owned(r.identity, id);
    const row = await this.matching.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Search" WHERE id = ${id}::uuid FOR UPDATE`;
      const s = await this.owned(r.identity, id, tx);
      const previous = s.versions.find(v => v.version === s.currentVersion)!;
      return tx.search.update({ where: { id }, data: { currentVersion: s.currentVersion + 1, versions: { create: {
        version: s.currentVersion + 1, label: data.label?.trim() || diff(previous.filters as unknown as SearchFilters, data.filters), filters: data.filters as unknown as Prisma.InputJsonObject,
      } } }, include });
    });
    return this.view(row);
  }
  @Get(':id/results')
  async results(@Req() r: Request, @Param('id') id: string, @Query() query: Record<string, unknown>) {
    const s = await this.owned(r.identity, id), paging = pagination(query);
    const version = query.version === undefined ? s.currentVersion : parse(z.coerce.number().int().min(1), query.version);
    const v = s.versions.find(v => v.version === version);
    if (!v) throw new Problem(404, 'not_found', 'Версия не найдена');
    const ranked = await this.matching.ranked(s.companyId, v.filters as unknown as SearchFilters);
    const paged = page(ranked, paging);
    const cards = await this.matching.views(s.companyId, paged.items.map(item => item.row));
    const shortlist = new Set(s.shortlist.map(entry => entry.candidateId));
    return { search_id: s.id, version, generated_at: new Date().toISOString(), ...paged,
      items: paged.items.map((item, i) => ({ rank: (paging.page - 1) * paging.page_size + i + 1, candidate: cards[i], explanation: item.explanation, shortlisted: shortlist.has(item.row.id) })) };
  }
  @Put(':id/shortlist/:candidateId')
  async shortlist(@Req() r: Request, @Param('id') id: string, @Param('candidateId') candidateId: string) {
    parse(z.uuid(), candidateId);
    await this.owned(r.identity, id);
    await this.matching.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Search" WHERE id = ${id}::uuid FOR UPDATE`;
      const s = await this.owned(r.identity, id, tx);
      await this.matching.visible(s.companyId, candidateId, tx);
      await tx.shortlist.upsert({ where: { searchId_candidateId: { searchId: id, candidateId } },
        create: { searchId: id, candidateId, addedInVersion: s.currentVersion }, update: {} });
    });
    return this.get(r, id);
  }
  @Delete(':id/shortlist/:candidateId')
  async remove(@Req() r: Request, @Param('id') id: string, @Param('candidateId') candidateId: string) {
    parse(z.uuid(), candidateId); await this.owned(r.identity, id);
    await this.matching.db.shortlist.deleteMany({ where: { searchId: id, candidateId } });
    return this.get(r, id);
  }
}
