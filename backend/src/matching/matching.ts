import type { CandidateProfile, Category, ExplanationFactor, FspAchievement, Grade, MatchExplanation, SalaryRadar, SalaryRange, SearchFilters } from '../contract/model/index.js';
import { computeFspScore, levelAtLeast, maxLevel } from './fsp-score.ts';
import { SKILL_BY_ID, skillName, taxonomy } from '../common/taxonomy-data.ts';

// Подписи для объяснения работодателю: русские названия и числа в русской записи.
const FORMAT_LABEL: Record<string, string> = { office: 'офис', hybrid: 'гибрид', remote: 'удалёнка' };
const INDUSTRY_LABEL: Record<string, string> = { fintech: 'финтех', ecom: 'e-com', gov: 'госсектор', telecom: 'телеком', gamedev: 'геймдев', edtech: 'edtech', medtech: 'медтех', manufacturing: 'промышленность', other: 'другое' };
const ruNumber = (x: number) => String(x).replace('.', ',');
const rub = (x: number) => x.toLocaleString('ru-RU');
const ruDate = (iso: string) => new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Moscow' });

export interface CandidateSnapshot {
  profile: CandidateProfile;
  publishedConsent: boolean;
  hiddenCompanyIds: string[];
  showFsp: boolean;
  achievements: FspAchievement[];
  taskSignal: { fresh: boolean; solvedCount: number; lastSolvedAt: string | null };
  standardError: number | null;
}
export const round = (value: number) => Math.round(value * 100) / 100;
const clamp = (value: number, max = 100) => Math.max(0, Math.min(max, value));
export function category(specialization: Category['specialization'], grade: Category['grade']): Category {
  return { specialization, grade, label: `${taxonomy.specializations.find(x => x.id === specialization)?.name ?? specialization} · ${taxonomy.grades.find(x => x.id === grade)?.name ?? grade}` };
}
export function overlaps(a: SalaryRange, b: SalaryRange): boolean { return a.from <= b.to && b.from <= a.to; }
export function published(candidate: CandidateSnapshot, companyId: string): boolean {
  return Boolean(candidate.profile.standing) && candidate.publishedConsent && candidate.profile.availability !== 'not_looking' && !candidate.hiddenCompanyIds.includes(companyId);
}
const gradeOrder: Grade[] = ['junior', 'middle', 'senior', 'lead'];
/** Exact grades or one step below a requested grade; never broaden other filters. */
export function gradeGap(grade: Grade, requested: Grade[]): number {
  if (requested.includes(grade)) return 0;
  return requested.some(target => gradeOrder.indexOf(target) - gradeOrder.indexOf(grade) === 1) ? 1 : Infinity;
}
export function searchGrades(requested: Grade[]): Grade[] {
  return gradeOrder.filter(grade => Number.isFinite(gradeGap(grade, requested)));
}
export function hardFilters(c: CandidateSnapshot, filters: SearchFilters, companyId: string): boolean {
  if (!published(c, companyId)) return false;
  const p = c.profile, standing = p.standing!;
  if (standing.category.specialization !== filters.specialization || !Number.isFinite(gradeGap(standing.category.grade, filters.grades))) return false;
  if (p.availability === 'not_looking' || !filters.availability.includes(p.availability)) return false;
  if (!p.work_formats.some(f => filters.work_formats.includes(f))) return false;
  const remote = p.work_formats.includes('remote') && filters.work_formats.includes('remote');
  if (filters.city && !remote && p.city !== filters.city && !(filters.include_relocation && p.relocation)) return false;
  if (!filters.must_skills.every(id => p.skills.some(s => s.skill_id === id))) return false;
  const verified = c.achievements.filter(a => a.verified);
  if ((filters.fsp_only || filters.fsp_level_min) && (!c.showFsp || !verified.length)) return false;
  if (filters.fsp_level_min && !levelAtLeast(maxLevel(verified), filters.fsp_level_min)) return false;
  return true;
}
const WITHIN_GRADE_VARIANCE = 0.8 ** 2 / 12;
export function percentileReliability(standardError: number | null): number {
  return standardError === null || !Number.isFinite(standardError) ? 0 : WITHIN_GRADE_VARIANCE / (WITHIN_GRADE_VARIANCE + standardError ** 2);
}
export function strength(c: CandidateSnapshot, now: Date) {
  const p = c.profile;
  const percentile = p.standing?.percentile ?? 0;
  const reliability = percentileReliability(c.standardError);
  const weightedPercentile = p.standing ? round(50 + (percentile - 50) * reliability) : 0;
  const confirmed = clamp(p.skills.filter(s => s.verified).length / Math.max(4, p.skills.length) * 140);
  const tasks = clamp(c.taskSignal.solvedCount * 35 + (c.taskSignal.fresh ? 30 : 0));
  const completeness = clamp(p.completeness);
  const fspBonus = c.showFsp ? computeFspScore(c.achievements, p.standing?.category.specialization ?? p.specialization, now).bonus : 0;
  return { percentile, weightedPercentile, reliability, confirmed, tasks, completeness, fspBonus, total: round(MATCH_WEIGHTS.percentile * weightedPercentile + MATCH_WEIGHTS.confirmed * confirmed + MATCH_WEIGHTS.tasks * tasks + MATCH_WEIGHTS.completeness * completeness + fspBonus) };
}
export const ADJACENT_CREDIT = 0.25;
export const MATCH_WEIGHTS = { fit: 0.6, coverage: 0.25, lexical: 0.45, industry: 0.1, conditions: 0.2, claimed: 1 / 1.5, gradePenalty: 15, sePenalty: 3, percentile: 0.65, confirmed: 0.15, tasks: 0.1, completeness: 0.1 };

export function explain(c: CandidateSnapshot, filters: SearchFilters, now: Date): MatchExplanation {
  const p = c.profile;
  const wanted = [...new Set(filters.must_skills)].map(id => ({ id, weight: 1 }));
  wanted.push(...[...new Set(filters.nice_skills)].filter(id => !filters.must_skills.includes(id)).map(id => ({ id, weight: 0.5 })));
  const skillMap = new Map(p.skills.map(s => [s.skill_id, s]));
  const totalWeight = wanted.reduce((sum, item) => sum + item.weight, 0);
  const adjacent = new Map(wanted.filter(item => !skillMap.has(item.id)).flatMap(item => {
    const near = p.skills.filter(s => SKILL_BY_ID.get(s.skill_id)?.competency_id === SKILL_BY_ID.get(item.id)?.competency_id && SKILL_BY_ID.has(item.id))
      .sort((a, b) => Number(b.verified) - Number(a.verified))[0];
    return near ? [[item.id, near] as const] : [];
  }));
  const credit = (id: string) => skillMap.get(id)?.verified ? 1 : skillMap.has(id) ? MATCH_WEIGHTS.claimed : adjacent.get(id)?.verified ? ADJACENT_CREDIT * 1.5 : adjacent.has(id) ? ADJACENT_CREDIT : 0;
  const coverage = totalWeight ? wanted.reduce((sum, item) => sum + item.weight * credit(item.id), 0) / totalWeight : 1;
  const wantedIds = new Set(wanted.map(x => x.id));
  const union = new Set([...wantedIds, ...skillMap.keys()]);
  // Explicit lexical fallback; this is not an embedding model.
  const lexical = wantedIds.size ? [...wantedIds].filter(id => skillMap.has(id)).length / Math.max(1, union.size) : 1;
  const industry = !filters.industries.length ? 0.7 : p.industries.some(x => filters.industries.includes(x)) ? 1 : 0.3;
  let salary = 0.6;
  if (p.salary_expectation) salary = overlaps(p.salary_expectation, filters.salary) ? 1 : p.salary_expectation.from > filters.salary.to
    ? clamp(1 - (p.salary_expectation.from - filters.salary.to) / filters.salary.to * 3, 1) : 0.85;
  const conditions = 0.7 * salary + 0.3 * Number(p.work_formats.some(f => filters.work_formats.includes(f)));
  const W = MATCH_WEIGHTS, fitShare = 100 * W.fit, strengthShare = 1 - W.fit;
  const fit = round(100 * (W.coverage * coverage + W.lexical * lexical + W.industry * industry + W.conditions * conditions));
  const parts = strength(c, now);
  const penalty = (c.standardError ?? 1) > 0.45 ? W.sePenalty : 0;
  const belowGrade = p.standing ? gradeGap(p.standing.category.grade, filters.grades) === 1 : false;
  const gradePenalty = belowGrade ? W.gradePenalty : 0;
  const raw = W.fit * fit + strengthShare * parts.total - penalty - gradePenalty;
  const score = round(clamp(raw));
  const factors: ExplanationFactor[] = [
    { kind: 'skills_coverage', label: `Покрытие навыков ${Math.round(coverage * 100)}%`, contribution: round(fitShare * W.coverage * coverage), polarity: coverage >= 0.7 ? 'positive' : 'neutral', evidence: adjacent.size ? `Смежные навыки по таксономии: ${[...adjacent].map(([id, s]) => `${s.name} вместо ${skillName(id)}`).join(', ')}` : 'Подтверждённый навык весит в 1,5 раза больше заявленного' },
    { kind: 'semantic', label: 'Совпадение словаря навыков', contribution: round(fitShare * W.lexical * lexical), polarity: lexical >= 0.5 ? 'positive' : 'neutral', evidence: `Офлайн-метрика Jaccard: ${ruNumber(round(lexical))}; модель эмбеддингов не используется` },
    { kind: 'industry', label: 'Соответствие отрасли', contribution: round(fitShare * W.industry * industry), polarity: industry === 1 ? 'positive' : 'neutral', evidence: industry === 1 ? `Совпала: ${p.industries.filter(x => filters.industries.includes(x)).map(x => INDUSTRY_LABEL[x] ?? x).join(', ')}`
      : filters.industries.length ? 'Отрасль не совпала: учтена с пониженным весом' : 'Отрасль в запросе не задана: нейтральный вклад' },
    { kind: 'conditions', label: 'Соответствие условий', contribution: round(fitShare * W.conditions * conditions), polarity: salary < 0.5 ? 'negative' : 'positive', evidence: `Вилка запроса ${rub(filters.salary.from)}–${rub(filters.salary.to)} ₽; формат: ${filters.work_formats.map(f => FORMAT_LABEL[f] ?? f).join(', ')}` },
    { kind: 'percentile', label: `${parts.percentile}-й перцентиль подтверждённого теста`, contribution: round(strengthShare * W.percentile * parts.weightedPercentile), polarity: parts.percentile >= 50 ? 'positive' : 'neutral', evidence: p.standing ? `${p.standing.category.label}; вес перцентиля ×${ruNumber(round(parts.reliability))} по точности теста` : null },
    { kind: 'confirmed_skills', label: 'Подтверждённые навыки', contribution: round(strengthShare * W.confirmed * parts.confirmed), polarity: parts.confirmed ? 'positive' : 'neutral', evidence: p.skills.filter(s => s.verified).map(s => s.name).join(', ') || null },
    { kind: 'tasks', label: 'Результаты регулярных заданий', contribution: round(strengthShare * W.tasks * parts.tasks), polarity: parts.tasks ? 'positive' : 'neutral', evidence: c.taskSignal.lastSolvedAt ? `Последнее решение ${ruDate(c.taskSignal.lastSolvedAt)}` : null },
    { kind: 'completeness', label: 'Полнота профиля', contribution: round(strengthShare * W.completeness * parts.completeness), polarity: 'neutral', evidence: `${parts.completeness}%` },
  ];
  if (parts.fspBonus) factors.push({ kind: 'fsp', label: 'Подтверждённые достижения ФСП', contribution: round(strengthShare * parts.fspBonus), polarity: 'positive', evidence: `Бонус к силе профиля +${ruNumber(parts.fspBonus)}` });
  for (const id of filters.nice_skills.filter(id => !skillMap.has(id))) factors.push({ kind: 'missing_skill', label: adjacent.has(id) ? `Нет ${skillName(id)}, есть смежный ${adjacent.get(id)!.name}` : `Нет ${skillName(id)} (желательно)`, contribution: 0, polarity: 'negative', evidence: 'Уже учтено в покрытии навыков; повторного штрафа нет' });
  if (penalty) factors.push({ kind: 'penalty', label: 'Низкая точность оценки', contribution: -penalty, polarity: 'negative', evidence: 'Стандартная ошибка оценки больше 0,45 или оценки нет' });
  if (belowGrade) factors.push({ kind: 'penalty', label: 'Категория на один грейд ниже запроса', contribution: -gradePenalty, polarity: 'negative', evidence: `Подтверждённая категория: ${p.standing!.category.label}; штраф ${W.gradePenalty} баллов, категория не изменяется` });
  if (raw !== clamp(raw)) factors.push({ kind: 'penalty', label: 'Ограничение итогового балла', contribution: round(clamp(raw) - raw), polarity: 'neutral', evidence: 'Итоговый балл ограничен диапазоном 0–100' });
  // Account for rounding so displayed contributions sum to the displayed score.
  const residual = round(score - factors.reduce((sum, f) => sum + f.contribution, 0));
  factors.find(f => f.kind === 'completeness')!.contribution = round(factors.find(f => f.kind === 'completeness')!.contribution + residual);
  factors.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  const positives = factors.filter(f => f.polarity === 'positive');
  const missing = factors.find(f => f.kind === 'missing_skill');
  const gradeWarning = belowGrade ? factors.find(f => f.label === 'Категория на один грейд ниже запроса') : undefined;
  const warning = gradeWarning ?? missing;
  const chips = warning ? [...positives.slice(0, 2), warning] : positives.slice(0, 3);
  for (const factor of factors) if (chips.length < 3 && !chips.includes(factor)) chips.push(factor);
  return { score, fit, strength: parts.total, chips, factors };
}
function percentile(values: number[], q: number): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * q;
  return Math.round(sorted[Math.floor(index)]! + (sorted[Math.ceil(index)]! - sorted[Math.floor(index)]!) * (index % 1));
}
export function radar(candidates: CandidateSnapshot[], cat: Category, salary: SalaryRange): SalaryRadar {
  const ranges = candidates.filter(c => c.profile.standing?.category.specialization === cat.specialization && c.profile.standing.category.grade === cat.grade).map(c => c.profile.salary_expectation).filter((s): s is SalaryRange => s !== null);
  const total = ranges.length;
  const above = total ? ranges.filter(s => s.from > salary.to).length / total : 0;
  const below = total ? ranges.filter(s => s.to < salary.from).length / total : 0;
  const within = total ? ranges.filter(s => overlaps(s, salary)).length / total : 0;
  const mids = ranges.map(s => (s.from + s.to) / 2);
  const min = total ? Math.floor(Math.min(...mids) / 50000) * 50000 : salary.from;
  const max = total ? Math.ceil(Math.max(...mids) / 50000) * 50000 : salary.to;
  const step = Math.max(10000, Math.ceil((max - min) / 6 / 10000) * 10000);
  const histogram = Array.from({ length: 6 }, (_, i) => ({ from: min + i * step, to: min + (i + 1) * step,
    count: mids.filter(x => x >= min + i * step && (i === 5 ? x <= min + (i + 1) * step : x < min + (i + 1) * step)).length }));
  return { category: cat, salary, candidates_total: total, share_above: round(above), share_within: round(within), share_below: round(below),
    median: percentile(mids, 0.5), p25: percentile(mids, 0.25), p75: percentile(mids, 0.75), histogram,
    verdict: above > 0.5 ? 'below_market' : below > 0.5 ? 'above_market' : 'in_market',
    message: !total ? `Недостаточно данных для ${cat.label}` : `Ваша вилка ниже ожиданий ${Math.round(above * 100)}% кандидатов ${cat.label}` };
}
