import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Identity } from '../auth/auth.guard.js';
import { Database } from '../database/database.service.js';
import { Problem } from '../common/problem.js';
import { candidateInclude, card, detail, snapshot, type CandidateRow } from './candidate-mapper.ts';
import { explain, hardFilters, published, searchGrades } from './matching.ts';
import type { SearchFilters } from '../contract/model/index.js';

@Injectable()
export class MatchingService {
  constructor(readonly db: Database) {}
  async company(identity: Identity, tx: Prisma.TransactionClient = this.db) {
    if (identity.role !== 'employer') throw new Problem(403, 'forbidden', 'Доступно работодателю');
    const member = await tx.membership.findFirst({ where: { user: { subject: identity.sub } }, include: { company: true } });
    if (!member) throw new Problem(403, 'forbidden', 'Компания не назначена');
    return member.company;
  }
  async rows(companyId: string, specialization?: string, grades?: string[]) {
    const rows = await this.db.candidate.findMany({ where: { grade: grades ? { in: grades } : { not: null },
      ...(specialization ? { confirmedSpecialization: specialization } : {}), consents: { some: { type: 'profile_visibility', revokedAt: null } } }, include: candidateInclude });
    return rows.filter(c => published(snapshot(c), companyId));
  }
  async visible(companyId: string, id: string, tx: Prisma.TransactionClient = this.db) {
    const row = await tx.candidate.findUnique({ where: { id }, include: candidateInclude });
    if (!row || !published(snapshot(row), companyId)) throw new Problem(404, 'not_found', 'Кандидат недоступен');
    return row;
  }
  async ranked(companyId: string, filters: SearchFilters) {
    const now = new Date();
    const rows = await this.rows(companyId, filters.specialization, searchGrades(filters.grades));
    return rows.filter(c => hardFilters(snapshot(c), filters, companyId)).map(row => ({ row, explanation: explain(snapshot(row), filters, now) }))
      .sort((a, b) => b.explanation.score - a.explanation.score || a.row.id.localeCompare(b.row.id));
  }
  async views(companyId: string, rows: CandidateRow[], filters?: SearchFilters) {
    const ids = rows.map(c => c.id), now = new Date();
    const [disclosures, invitations, applications] = await Promise.all([
      this.db.disclosure.findMany({ where: { companyId, candidateId: { in: ids } } }),
      this.db.invitation.findMany({ where: { companyId, candidateId: { in: ids } }, orderBy: { sentAt: 'desc' }, select: { id: true, candidateId: true, status: true } }),
      this.db.application.findMany({ where: { vacancy: { companyId }, candidateId: { in: ids } }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { id: true, candidateId: true, vacancyId: true, status: true } }),
    ]);
    const revealById = new Map(disclosures.map(d => [d.candidateId, d]));
    const invitationById = new Map<string, typeof invitations[number]>();
    for (const inv of invitations) if (!invitationById.has(inv.candidateId)) invitationById.set(inv.candidateId, inv);
    const applicationById = new Map<string, typeof applications[number]>();
    for (const a of applications) if (!applicationById.has(a.candidateId)) applicationById.set(a.candidateId, a);
    return rows.map(row => {
      const inv = invitationById.get(row.id);
      const a = applicationById.get(row.id);
      const relation = { invitation: inv ? { id: inv.id, status: inv.status as 'sent' } : null, application: a ? { id: a.id, status: a.status as 'submitted', vacancy_id: a.vacancyId } : null };
      return filters ? detail(row, companyId, now, revealById.get(row.id) ?? null, relation, explain(snapshot(row), filters, now))
        : card(row, companyId, now, revealById.get(row.id) ?? null, relation);
    });
  }
}
