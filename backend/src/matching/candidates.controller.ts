import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { ListCandidatesQueryParams } from '../contract/schemas.js';
import { MatchingService } from './matching.service.js';
import { snapshot, candidateInclude, card, detail } from './candidate-mapper.ts';
import { strength } from './matching.ts';
import { maxLevel, levelAtLeast } from './fsp-score.ts';
import { parse } from '../common/validation.js';
import { page, strings } from '../common/query.js';
import { Problem } from '../common/problem.js';
import type { SearchFilters } from '../contract/model/index.js';

@Controller()
@UseGuards(AuthGuard)
export class CandidatesController {
  constructor(private readonly matching: MatchingService) {}
  @Get('candidates')
  async list(@Req() r: { identity: Identity }, @Query() query: Record<string, unknown>) {
    const normalized = { ...query };
    for (const key of ['grade', 'skill', 'work_format']) if (query[key] !== undefined) normalized[key] = strings(query[key]);
    for (const key of ['fsp_only', 'verified_only']) {
      if (query[key] === 'true') normalized[key] = true;
      if (query[key] === 'false') normalized[key] = false;
    }
    for (const key of ['page', 'page_size', 'active_within_days']) if (query[key] !== undefined) normalized[key] = Number(query[key]);
    const q = parse(ListCandidatesQueryParams, normalized);
    const co = await this.matching.company(r.identity), now = new Date();
    const rows = (await this.matching.rows(co.id, q.specialization, q.grade)).filter(c => {
      const s = snapshot(c), p = s.profile, verified = s.achievements.filter(a => a.verified && new Date(a.date) <= now);
      return (!q.skill?.length || q.skill.every(id => p.skills.some(skill => skill.skill_id === id)))
        && (!q.work_format?.length || p.work_formats.some(f => q.work_format!.includes(f)))
        && (!q.city || p.city === q.city || p.relocation || p.work_formats.includes('remote'))
        && (!q.fsp_only || (s.showFsp && verified.length > 0))
        && (!q.fsp_level_min || (s.showFsp && levelAtLeast(maxLevel(verified), q.fsp_level_min)))
        && (!q.active_within_days || now.getTime() - c.lastActiveAt.getTime() <= q.active_within_days * 86400000);
    }).sort((a, b) => {
      if (q.sort === 'recent') return b.lastActiveAt.getTime() - a.lastActiveAt.getTime() || a.id.localeCompare(b.id);
      if (q.sort === 'percentile') return (snapshot(b).profile.standing?.percentile ?? 0) - (snapshot(a).profile.standing?.percentile ?? 0) || a.id.localeCompare(b.id);
      return strength(snapshot(b), now).total - strength(snapshot(a), now).total || a.id.localeCompare(b.id);
    });
    const paged = page(rows, q);
    return { ...paged, items: await this.matching.views(co.id, paged.items) };
  }
  @Get('candidates/:id')
  async get(@Req() r: { identity: Identity }, @Param('id') id: string, @Query('search_id') searchId?: string) {
    parse(z.uuid(), id);
    const co = await this.matching.company(r.identity), row = await this.matching.visible(co.id, id);
    let filters: SearchFilters | undefined;
    if (searchId) {
      parse(z.uuid(), searchId);
      const search = await this.matching.db.search.findFirst({ where: { id: searchId, companyId: co.id }, include: { versions: true } });
      if (!search) throw new Problem(404, 'not_found', 'Подборка не найдена');
      filters = search.versions.find(v => v.version === search.currentVersion)!.filters as unknown as SearchFilters;
    }
    const view = (await this.matching.views(co.id, [row], filters))[0]!;
    if (filters) return view;
    // Detail includes achievements even when there is no search context.
    const disclosure = await this.matching.db.disclosure.findUnique({ where: { companyId_candidateId: { companyId: co.id, candidateId: id } } });
    return detail(row, co.id, new Date(), disclosure, view.relation, null);
  }
  @Get('me/card-preview')
  async preview(@Req() r: { identity: Identity }) {
    if (r.identity.role !== 'candidate') throw new Problem(403, 'forbidden', 'Доступно кандидату');
    const row = await this.matching.db.candidate.findFirst({ where: { user: { subject: r.identity.sub } }, include: candidateInclude });
    if (!row) throw new Problem(404, 'not_found', 'Профиль не найден');
    return card(row, null, new Date(), null, { invitation: null, application: null });
  }
}
