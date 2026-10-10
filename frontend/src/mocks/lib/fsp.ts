import type { FspAchievement, FspDiscipline, FspIndexComponent, FspLevel, FspResult, Specialization } from '@/api/generated/model'

/**
 * ФСП-индекс 0–100 (SOLUTION.md, раздел 7):
 * Σ w_уровня · w_результата · релевантность_дисциплины_специализации · затухание (период полураспада 2 года),
 * с ограничением сверху. Бонус к силе профиля = индекс × 0.3 (0…+30). Нет истории — индекс 0, бонус 0, без штрафа.
 */
export const LEVEL_WEIGHT: Record<FspLevel, number> = { regional: 22, national: 48, international: 70 }
export const RESULT_WEIGHT: Record<FspResult, number> = { winner: 1, prize_winner: 0.78, finalist: 0.55, participant: 0.28 }
const HALF_LIFE_YEARS = 2
const INDEX_CAP = 100

const RELEVANCE: Record<FspDiscipline, Partial<Record<Specialization, number>> & { default: number }> = {
  product: { backend: 1, frontend: 1, mobile: 1, analyst: 0.9, qa: 0.8, default: 0.6 },
  algorithmic: { backend: 1, data_ml: 1, default: 0.7 },
  cybersecurity: { devops: 1, backend: 0.7, default: 0.4 },
  robotics: { mobile: 0.6, default: 0.4 },
  uas: { mobile: 0.6, data_ml: 0.6, default: 0.4 },
}

export function relevance(discipline: FspDiscipline, specialization: Specialization | null): number {
  const table = RELEVANCE[discipline]
  if (!specialization) return table.default
  return table[specialization] ?? table.default
}

export function decay(date: string, now: Date): number {
  const years = Math.max(0, (now.getTime() - new Date(date).getTime()) / (365.25 * 24 * 3600 * 1000))
  return Math.pow(0.5, years / HALF_LIFE_YEARS)
}

export interface FspScore {
  index: number
  bonus: number
  components: FspIndexComponent[]
}

export function computeFspScore(
  achievements: readonly FspAchievement[],
  specialization: Specialization | null,
  now: Date,
): FspScore {
  const components = achievements
    .filter((a) => a.verified)
    .map((a): FspIndexComponent => {
      const lw = LEVEL_WEIGHT[a.level]
      const rw = RESULT_WEIGHT[a.result]
      const rel = relevance(a.discipline, specialization)
      const d = decay(a.date, now)
      return {
        achievement_id: a.id,
        title: a.title,
        level_weight: lw,
        result_weight: rw,
        relevance: Math.round(rel * 100) / 100,
        decay: Math.round(d * 100) / 100,
        contribution: Math.round(lw * rw * rel * d * 10) / 10,
      }
    })
    .sort((x, y) => y.contribution - x.contribution)
  const raw = components.reduce((sum, c) => sum + c.contribution, 0)
  const index = Math.min(INDEX_CAP, Math.round(raw))
  return { index, bonus: Math.round(index * 0.3 * 10) / 10, components }
}

const LEVEL_ORDER: FspLevel[] = ['regional', 'national', 'international']

export function maxLevel(achievements: readonly FspAchievement[]): FspLevel | null {
  let best: FspLevel | null = null
  for (const a of achievements) {
    if (!best || LEVEL_ORDER.indexOf(a.level) > LEVEL_ORDER.indexOf(best)) best = a.level
  }
  return best
}

export function levelAtLeast(level: FspLevel | null, min: FspLevel): boolean {
  if (!level) return false
  return LEVEL_ORDER.indexOf(level) >= LEVEL_ORDER.indexOf(min)
}

const RESULT_TEXT: Record<FspResult, string> = {
  winner: 'Победитель',
  prize_winner: 'Призёр',
  finalist: 'Финалист',
  participant: 'Участник',
}

const LEVEL_TEXT: Record<FspLevel, string> = {
  regional: 'регионального этапа',
  national: 'всероссийского этапа',
  international: 'международных соревнований',
}

/** «Призёр всероссийского этапа ФСП 2025» */
export function achievementHeadline(a: FspAchievement): string {
  return `${RESULT_TEXT[a.result]} ${LEVEL_TEXT[a.level]} ФСП ${a.date.slice(0, 4)}`
}

export function topAchievement(achievements: readonly FspAchievement[], specialization: Specialization | null, now: Date) {
  const score = computeFspScore(achievements, specialization, now)
  const topId = score.components[0]?.achievement_id
  return achievements.find((a) => a.id === topId) ?? null
}
