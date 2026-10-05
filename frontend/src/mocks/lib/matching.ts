import type { ExplanationFactor, MatchExplanation, SearchFilters } from '@/api/generated/model'
import { formatSalaryRangeShort, rangesOverlap } from '@/lib/format'
import { categoryLabel, industryLabel } from '@/lib/labels'
import { skillName } from '../data/taxonomy'
import type { CandidateRec } from '../db/types'
import { achievementHeadline, computeFspScore, levelAtLeast, maxLevel, topAchievement } from './fsp'

/**
 * Скоринг (SOLUTION.md, 5.1):
 *  Strength = 0.65·перцентиль + 0.15·подтверждённые навыки + 0.10·регулярные задания + 0.10·полнота + бонус ФСП (0…15)
 *  Fit      = 0.40·покрытие навыков (тест ×1.5) + 0.25·семантика + 0.15·отрасль + 0.20·условия
 *  Score    = 0.6·Fit + 0.4·Strength − штрафы
 */

export function profileCompleteness(c: CandidateRec): number {
  const checks = [
    Boolean(c.phone || c.telegram),
    Boolean(c.city),
    Boolean(c.about && c.about.length >= 40),
    c.experience.length > 0,
    c.skills.length >= 3,
    c.industries.length > 0,
    Boolean(c.salaryExpectation),
    Boolean(c.standing),
    c.workFormats.length > 0,
    c.fsp.linked || c.experience.some((e) => Boolean(e.description)),
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

export interface StrengthParts {
  percentile: number
  confirmedSkills: number
  tasks: number
  completeness: number
  fspBonus: number
  total: number
}

export function strengthParts(c: CandidateRec, now: Date): StrengthParts {
  const percentile = c.standing?.percentile ?? 0
  const verified = c.skills.filter((s) => s.verified).length
  const confirmedSkills = c.skills.length ? Math.min(100, (verified / Math.max(4, c.skills.length)) * 100 * 1.4) : 0
  const tasks = Math.min(100, c.taskSignal.solvedCount * 35 + (c.taskSignal.fresh ? 30 : 0))
  const completeness = profileCompleteness(c)
  const fspBonus = c.privacy.showFsp ? computeFspScore(c.fsp.achievements, c.standing?.specialization ?? c.specialization, now).bonus : 0
  const total = 0.65 * percentile + 0.15 * confirmedSkills + 0.1 * tasks + 0.1 * completeness + fspBonus
  return { percentile, confirmedSkills, tasks, completeness, fspBonus, total: Math.round(total * 10) / 10 }
}

/** Жёсткие фильтры выдачи. */
export function passesHardFilters(c: CandidateRec, filters: SearchFilters, companyId: string): boolean {
  if (!isPublished(c)) return false
  if (c.privacy.hiddenCompanyIds.includes(companyId)) return false
  const s = c.standing
  if (!s || s.specialization !== filters.specialization) return false
  if (!filters.grades.includes(s.grade)) return false
  if (c.availability === 'not_looking' || !filters.availability.includes(c.availability)) return false
  if (!c.workFormats.some((f) => filters.work_formats.includes(f))) return false
  const remoteOk = filters.work_formats.includes('remote') && c.workFormats.includes('remote')
  if (filters.city && !remoteOk && c.city !== filters.city && !(filters.include_relocation && c.relocation)) return false
  const skillIds = new Set(c.skills.map((sk) => sk.skill_id))
  if (!filters.must_skills.every((id) => skillIds.has(id))) return false
  if (filters.fsp_only || filters.fsp_level_min) {
    if (!c.privacy.showFsp || c.fsp.achievements.length === 0) return false
    if (filters.fsp_level_min && !levelAtLeast(maxLevel(c.fsp.achievements), filters.fsp_level_min)) return false
  }
  return true
}

/** Кандидат в выдаче: согласие на показ, подтверждённый грейд, не «не ищу». */
export function isPublished(c: CandidateRec): boolean {
  const consent = c.consents.find((x) => x.type === 'profile_visibility')
  return Boolean(c.standing) && Boolean(consent && !consent.revoked_at) && c.availability !== 'not_looking'
}

const round1 = (v: number) => Math.round(v * 10) / 10

export function explainMatch(c: CandidateRec, filters: SearchFilters, now: Date): MatchExplanation {
  const skills = new Map(c.skills.map((s) => [s.skill_id, s]))
  const wanted = [
    ...filters.must_skills.map((id) => ({ id, weight: 1, must: true })),
    ...filters.nice_skills.map((id) => ({ id, weight: 0.5, must: false })),
  ]
  const totalWeight = wanted.reduce((s, w) => s + w.weight, 0)
  let covered = 0
  const verifiedHits: string[] = []
  const claimedHits: string[] = []
  const missingNice: string[] = []
  for (const w of wanted) {
    const s = skills.get(w.id)
    if (!s) {
      if (!w.must) missingNice.push(w.id)
      continue
    }
    // Подтверждённый тестом навык весит ×1.5 к заявленному
    covered += w.weight * (s.verified ? 1 : 1 / 1.5)
    ;(s.verified ? verifiedHits : claimedHits).push(w.id)
  }
  const coverage = totalWeight > 0 ? covered / totalWeight : 1

  const wantedSet = new Set(wanted.map((w) => w.id))
  const union = new Set([...wantedSet, ...skills.keys()])
  const intersection = [...wantedSet].filter((id) => skills.has(id)).length
  const semantic = 0.55 + 0.45 * (union.size ? intersection / union.size : 0)

  const industryMatch = filters.industries.length === 0 ? 0.7 : c.industries.some((i) => filters.industries.includes(i)) ? 1 : 0.3

  let salaryScore = 0.6
  const exp = c.salaryExpectation
  if (exp) {
    if (rangesOverlap(exp, filters.salary)) salaryScore = 1
    else if (exp.from > filters.salary.to) salaryScore = Math.max(0, 1 - ((exp.from - filters.salary.to) / filters.salary.to) * 3)
    else salaryScore = 0.85
  }
  const formatScore = c.workFormats.some((f) => filters.work_formats.includes(f)) ? 1 : 0
  const conditions = 0.7 * salaryScore + 0.3 * formatScore

  const fit = 100 * (0.4 * coverage + 0.25 * semantic + 0.15 * industryMatch + 0.2 * conditions)
  const parts = strengthParts(c, now)
  const lowConfidence = (c.se ?? 0.3) > 0.45
  const penalty = lowConfidence ? 3 : 0
  const score = Math.max(0, Math.min(100, 0.6 * fit + 0.4 * Math.min(100, parts.total) - penalty))

  const factors: ExplanationFactor[] = []
  const category = c.standing ? categoryLabel(c.standing.specialization, c.standing.grade) : ''
  const names = (ids: string[]) => ids.map(skillName).join(', ')

  if (verifiedHits.length > 0) {
    factors.push({
      kind: 'confirmed_skills',
      label: `${names(verifiedHits)} ${verifiedHits.length > 1 ? 'подтверждены' : 'подтверждён'} тестом`,
      contribution: round1(0.6 * 40 * coverage * (verifiedHits.length / Math.max(1, verifiedHits.length + claimedHits.length))),
      polarity: 'positive',
      evidence: c.standing ? `${c.standing.percentile}-й перцентиль в ${category}` : null,
    })
  }
  if (claimedHits.length > 0) {
    factors.push({
      kind: 'skills_coverage',
      label: `Заявлены ${names(claimedHits)}`,
      contribution: round1(0.6 * 40 * coverage * (claimedHits.length / Math.max(1, verifiedHits.length + claimedHits.length))),
      polarity: 'positive',
      evidence: `Покрытие навыков ${Math.round(coverage * 100)}%, заявленные весят меньше подтверждённых`,
    })
  }
  if (c.standing) {
    factors.push({
      kind: 'percentile',
      label: `${c.standing.percentile}-й перцентиль в ${category}`,
      contribution: round1(0.4 * 0.65 * c.standing.percentile),
      polarity: c.standing.percentile >= 50 ? 'positive' : 'neutral',
      evidence: 'Адаптивный тест на общей шкале IRT',
    })
  }
  if (parts.fspBonus > 0) {
    const top = topAchievement(c.fsp.achievements, c.standing?.specialization ?? null, now)
    factors.push({
      kind: 'fsp',
      label: top ? achievementHeadline(top) : 'Достижения ФСП',
      contribution: round1(0.4 * parts.fspBonus),
      polarity: 'positive',
      evidence: `ФСП-индекс ${computeFspScore(c.fsp.achievements, c.standing?.specialization ?? null, now).index}, бонус +${parts.fspBonus}`,
    })
  }
  if (exp) {
    const overlap = rangesOverlap(exp, filters.salary)
    factors.push({
      kind: 'conditions',
      label: overlap
        ? `Ожидания ${formatSalaryRangeShort(exp)} в вашей вилке`
        : exp.from > filters.salary.to
          ? `Ожидания ${formatSalaryRangeShort(exp)} выше вилки`
          : `Ожидания ${formatSalaryRangeShort(exp)} ниже вилки`,
      contribution: round1(0.6 * 20 * conditions - (overlap ? 0 : exp.from > filters.salary.to ? 6 : 0)),
      polarity: overlap ? 'positive' : exp.from > filters.salary.to ? 'negative' : 'neutral',
      evidence: `Вилка ${formatSalaryRangeShort(filters.salary)}`,
    })
  }
  if (filters.industries.length > 0 && industryMatch === 1) {
    const match = c.industries.find((i) => filters.industries.includes(i))
    factors.push({
      kind: 'industry',
      label: `Опыт в отрасли: ${match ? industryLabel[match].toLowerCase() : 'совпадает'}`,
      contribution: round1(0.6 * 15 * industryMatch),
      polarity: 'positive',
      evidence: null,
    })
  }
  if (c.taskSignal.fresh) {
    factors.push({
      kind: 'tasks',
      label: 'Свежий сигнал: хорошо решил регулярное задание',
      contribution: round1(0.4 * 0.1 * parts.tasks),
      polarity: 'positive',
      evidence: c.taskSignal.lastSolvedAt ? `Последнее решение ${c.taskSignal.lastSolvedAt.slice(0, 10)}` : null,
    })
  }
  factors.push({
    kind: 'semantic',
    label: 'Профиль близок к описанию потребности',
    contribution: round1(0.6 * 25 * semantic),
    polarity: semantic > 0.7 ? 'positive' : 'neutral',
    evidence: `Семантическая близость ${Math.round(semantic * 100)}%`,
  })
  for (const id of missingNice) {
    factors.push({
      kind: 'missing_skill',
      label: `Нет ${skillName(id)} (nice-to-have)`,
      contribution: round1(-(0.6 * 40 * 0.5) / Math.max(1, totalWeight)),
      polarity: 'negative',
      evidence: null,
    })
  }
  if (lowConfidence) {
    factors.push({ kind: 'penalty', label: 'Низкая уверенность оценки θ', contribution: -penalty, polarity: 'negative', evidence: 'Стандартная ошибка выше 0,45' })
  }

  const sorted = [...factors].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
  const positives = sorted.filter((f) => f.polarity === 'positive' && f.kind !== 'semantic')
  const negatives = sorted.filter((f) => f.polarity === 'negative')
  const chips = positives.slice(0, negatives.length > 0 ? 2 : 3)
  if (negatives.length > 0 && negatives[0]) chips.push(negatives[0])
  while (chips.length < 3 && sorted[chips.length]) {
    const next = sorted.find((f) => !chips.includes(f))
    if (!next) break
    chips.push(next)
  }

  return {
    score: round1(score),
    fit: round1(fit),
    strength: round1(parts.total),
    chips: chips.slice(0, 3),
    factors: sorted,
  }
}
