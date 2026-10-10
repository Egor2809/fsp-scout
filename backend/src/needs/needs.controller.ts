import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { Prisma, type Need } from '@prisma/client';
import { z } from 'zod';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { MatchingService } from '../matching/matching.service.js';
import { ConfirmNeedBody, CreateNeedBody } from '../contract/schemas.js';
import { parse, checkSalary } from '../common/validation.js';
import { Problem } from '../common/problem.js';
import { SKILL_BY_ID, skillRef } from '../common/taxonomy-data.ts';
import { parseNeed } from './need-parser.ts';
import { category, radar } from '../matching/matching.ts';
import { snapshot } from '../matching/candidate-mapper.ts';
import type { ConfirmedNeed, Grade, Specialization } from '../contract/model/index.js';

const needView = (n: Need) => ({ id: n.id, raw_text: n.rawText, parsed: n.parsed, confirmed: n.confirmed, created_at: n.createdAt.toISOString(), updated_at: n.updatedAt.toISOString() });
@Controller()
@UseGuards(AuthGuard)
export class NeedsController {
  constructor(private readonly matching: MatchingService) {}
  @Post('needs')
  async create(@Req() r: { identity: Identity }, @Body() body: unknown) {
    const data = parse(CreateNeedBody, body), co = await this.matching.company(r.identity);
    const parsed = JSON.parse(JSON.stringify(parseNeed(data.raw_text))) as Prisma.InputJsonObject;
    return needView(await this.matching.db.need.create({ data: { companyId: co.id, rawText: data.raw_text, parsed } }));
  }
  private async owned(identity: Identity, id: string) {
    parse(z.uuid(), id);
    const co = await this.matching.company(identity);
    const need = await this.matching.db.need.findFirst({ where: { id, companyId: co.id } });
    if (!need) throw new Problem(404, 'not_found', 'Потребность не найдена');
    return need;
  }
  @Get('needs/:id')
  async get(@Req() r: { identity: Identity }, @Param('id') id: string) { return needView(await this.owned(r.identity, id)); }
  @Put('needs/:id')
  async confirm(@Req() r: { identity: Identity }, @Param('id') id: string, @Body() body: unknown) {
    const data = parse(ConfirmNeedBody, body);
    checkSalary(data.salary, '/salary');
    for (const field of ['must_skills', 'nice_skills'] as const) {
      const unknown = data[field].findIndex(s => !SKILL_BY_ID.has(s));
      if (unknown >= 0) throw new Problem(422, 'validation_error', 'Неизвестный навык', { errors: [{ pointer: `/${field}/${unknown}`, detail: 'Навык отсутствует в справочнике' }] });
    }
    const need = await this.owned(r.identity, id);
    const confirmed = { ...data, must_skills: [...new Set(data.must_skills)].map(skillRef), nice_skills: [...new Set(data.nice_skills)].filter(s => !data.must_skills.includes(s)).map(skillRef) };
    return needView(await this.matching.db.need.update({ where: { id: need.id }, data: { confirmed: confirmed as unknown as Prisma.InputJsonObject } }));
  }
  @Get('needs/:id/categories')
  async categories(@Req() r: { identity: Identity }, @Param('id') id: string) {
    const n = await this.owned(r.identity, id);
    if (!n.confirmed) throw new Problem(409, 'need_not_confirmed', 'Подтвердите потребность');
    const need = n.confirmed as unknown as ConfirmedNeed;
    const rows = await this.matching.rows(n.companyId, need.specialization);
    const snapshots = rows.map(c => snapshot(c));
    const grades: Grade[] = ['junior', 'middle', 'senior', 'lead'];
    const index = grades.indexOf(need.grade);
    const choices = [need.grade, ...grades.filter((_, i) => Math.abs(i - index) === 1)];
    return { need_id: n.id, salary: need.salary, items: choices.map((grade, i) => {
      const cat = category(need.specialization, grade), result = radar(snapshots, cat, need.salary);
      return { category: cat, kind: i === 0 ? 'primary' : 'adjacent', candidate_count: snapshots.filter(c => c.profile.standing?.category.grade === grade).length,
        median_expectation: result.median, reason: i === 0 ? 'Подтверждённая категория соответствует потребности' : 'Соседний грейд: можно уточнить требования', radar: result };
    }) };
  }
  @Get('salary-radar')
  async salaryRadar(@Req() r: { identity: Identity }, @Query() query: Record<string, unknown>) {
    const q = parse(z.object({ specialization: z.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']), grade: z.enum(['junior', 'middle', 'senior', 'lead']), salary_from: z.coerce.number().int().min(10000).max(10000000), salary_to: z.coerce.number().int().min(10000).max(10000000) }), query);
    const salary = { from: q.salary_from, to: q.salary_to };
    if (salary.from > salary.to) throw new Problem(422, 'salary_range_invalid', 'Некорректная вилка', { errors: [{ pointer: '/salary_to', detail: 'Верхняя граница должна быть не меньше нижней' }] });
    const co = await this.matching.company(r.identity);
    const rows = await this.matching.rows(co.id, q.specialization, [q.grade]);
    return radar(rows.map(c => snapshot(c)), category(q.specialization as Specialization, q.grade), salary);
  }
}
