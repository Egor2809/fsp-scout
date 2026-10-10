import type { Prisma } from '@prisma/client';
import type { CandidateCard, CandidateDetail, CandidateProfile, CandidateSkill, CategoryStanding, ExperienceItem, FspAchievement, Industry, MatchExplanation, SalaryRange, WorkFormat } from '../contract/model/index.js';
import { createHash } from 'node:crypto';
import { category, strength, type CandidateSnapshot } from './matching.ts';
import { computeFspScore, maxLevel, topAchievement } from './fsp-score.ts';
import { redactContactText } from '../common/contact-redaction.ts';
import { FRESH_SIGNAL_MS } from '../common/task-policy.ts';

export const candidateInclude = { user: true, consents: true } satisfies Prisma.CandidateInclude;
export type CandidateRow = Prisma.CandidateGetPayload<{ include: typeof candidateInclude }>;
export function alias(companyId: string | null, candidateId: string): string {
  return `Кандидат #${createHash('sha256').update(`${companyId ?? 'preview'}:${candidateId}`).digest('hex').slice(0, 8).toUpperCase()}`;
}
export function ownProfile(c: CandidateRow): CandidateProfile {
  const p = c.profile as Prisma.JsonObject;
  const storedStanding = p.standing as unknown as CategoryStanding | undefined;
  const standing = c.grade && c.confirmedSpecialization && storedStanding ? { ...storedStanding, category: category(c.confirmedSpecialization as CategoryStanding['category']['specialization'], c.grade as CategoryStanding['category']['grade']) } : null;
  const visibility = !standing ? 'hidden_no_grade' : !c.consents.some(x => x.type === 'profile_visibility' && !x.revokedAt) ? 'hidden_no_consent' : p.availability === 'not_looking' ? 'hidden_by_candidate' : 'visible';
  return { id: c.id, full_name: String(p.full_name ?? c.user.displayName), email: c.user.email,
    phone: typeof p.phone === 'string' ? p.phone : null, telegram: typeof p.telegram === 'string' ? p.telegram : null,
    city: typeof p.city === 'string' ? p.city : null, relocation: p.relocation === true,
    about: typeof p.about === 'string' ? p.about : null, specialization: c.specialization as CandidateProfile['specialization'],
    standing,
    experience_years: Number(p.experience_years ?? 0), experience: (p.experience ?? []) as unknown as ExperienceItem[],
    skills: (p.skills ?? []) as unknown as CandidateSkill[], industries: (p.industries ?? []) as Industry[],
    work_formats: (p.work_formats ?? []) as WorkFormat[], salary_expectation: p.salary_expectation as SalaryRange | null ?? null,
    availability: p.availability as CandidateProfile['availability'] ?? 'active',
    completeness: Math.round([p.phone || p.telegram, p.city, p.about, (p.skills as unknown[] | undefined)?.length, (p.experience as unknown[] | undefined)?.length, p.salary_expectation].filter(Boolean).length / 6 * 100),
    visibility, updated_at: c.updatedAt.toISOString() };
}
export function snapshot(c: CandidateRow, now: Date = new Date()): CandidateSnapshot {
  const p = c.profile as Prisma.JsonObject, privacy = c.privacy as Prisma.JsonObject;
  const signal = p.task_signal as Prisma.JsonObject | undefined;
  const lastSolvedAt = typeof signal?.last_solved_at === 'string' ? signal.last_solved_at : null;
  const elapsed = lastSolvedAt ? now.getTime() - new Date(lastSolvedAt).getTime() : Infinity;
  return { profile: ownProfile(c), publishedConsent: c.consents.some(x => x.type === 'profile_visibility' && !x.revokedAt), hiddenCompanyIds: (privacy.hidden_company_ids ?? []) as string[],
    showFsp: privacy.show_fsp !== false && c.consents.some(x => x.type === 'fsp_data' && !x.revokedAt), achievements: c.consents.some(x => x.type === 'fsp_data' && !x.revokedAt) ? (p.fsp_achievements ?? []) as unknown as FspAchievement[] : [],
    taskSignal: { fresh: signal?.fresh === true && elapsed >= 0 && elapsed < FRESH_SIGNAL_MS,
      solvedCount: Number(signal?.solved_count ?? 0), lastSolvedAt }, standardError: c.standardError };
}
type DisclosureRow = { reason: string; at: Date; sourceId: string };
type Relation = CandidateCard['relation'];
export function card(c: CandidateRow, companyId: string | null, now: Date, disclosure: DisclosureRow | null, relation: Relation): CandidateCard {
  const snap = snapshot(c, now), p = snap.profile, privacy = c.privacy as Prisma.JsonObject;
  const verified = snap.achievements.filter(a => a.verified && new Date(a.date) <= now);
  const revealed = Boolean(companyId && disclosure);
  const secrets = revealed ? [] : [p.full_name, ...p.full_name.split(/\s+/).filter(s => s.length > 3), p.email, p.phone, p.telegram];
  const sanitize = (text: string | null) => revealed ? text : redactContactText(text, secrets);
  const achievements = verified.map(a => ({ ...a, title: sanitize(a.title)!, team: sanitize(a.team), role: sanitize(a.role), certificate_url: revealed ? a.certificate_url : null }));
  const fspScore = computeFspScore(verified, p.standing?.category.specialization ?? p.specialization, now);
  const top = topAchievement(achievements, p.standing?.category.specialization ?? p.specialization, now);
  return { id: c.id, alias: alias(companyId, c.id), category: p.standing ? category(p.standing.category.specialization, p.standing.category.grade) : null,
    grade_confirmed: Boolean(p.standing), percentile: p.standing?.percentile ?? null, strength: strength(snap, now).total,
    skills: p.skills, experience_years: p.experience_years,
    experience: p.experience.map(e => {
      const hideCompany = !revealed && privacy.show_company_names !== true;
      return { ...e, role: sanitize(e.role)!, company_name: hideCompany ? null : sanitize(e.company_name), company_hidden: hideCompany,
        description: revealed ? e.description : redactContactText(e.description, [...secrets, ...(hideCompany ? [e.company_name] : [])]) };
    }), industries: p.industries, work_formats: p.work_formats, city: revealed || privacy.show_city !== false ? p.city : null,
    relocation: p.relocation, salary_expectation: p.salary_expectation, availability: p.availability, last_active_at: c.lastActiveAt.toISOString(),
    fsp: snap.showFsp ? { has_history: verified.length > 0, index: fspScore.index, bonus: fspScore.bonus, achievements_count: verified.length, top_achievement: top, max_level: maxLevel(verified) } : null,
    task_signal: { fresh: snap.taskSignal.fresh, solved_count: snap.taskSignal.solvedCount, last_solved_at: snap.taskSignal.lastSolvedAt },
    disclosure: revealed ? { revealed: true, reason: disclosure!.reason as 'invitation_accepted' | 'application', revealed_at: disclosure!.at.toISOString(), source_id: disclosure!.sourceId }
      : { revealed: false, reason: null, revealed_at: null, source_id: null },
    contacts: revealed ? { full_name: p.full_name, email: p.email, phone: p.phone, telegram: p.telegram, preferred_channel: p.telegram ? 'telegram' : 'email' } : null, relation };
}
export function detail(c: CandidateRow, companyId: string, now: Date, disclosure: DisclosureRow | null, relation: Relation, explanation: MatchExplanation | null): CandidateDetail {
  const result = card(c, companyId, now, disclosure, relation);
  const privacy = c.privacy as Prisma.JsonObject;
  const profile = ownProfile(c);
  const secrets = result.disclosure.revealed ? [] : [profile.full_name, ...profile.full_name.split(/\s+/).filter(s => s.length > 3), profile.email, profile.phone, profile.telegram];
  const sanitize = (text: string | null) => result.disclosure.revealed ? text : redactContactText(text, secrets);
  return { ...result, explanation, achievements: privacy.show_fsp === false ? [] : snapshot(c).achievements.filter(a => a.verified && new Date(a.date) <= now)
    .map(a => ({ ...a, title: sanitize(a.title)!, team: sanitize(a.team), role: sanitize(a.role), certificate_url: result.disclosure.revealed ? a.certificate_url : null })) };
}
