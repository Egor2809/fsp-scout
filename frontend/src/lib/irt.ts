/**
 * IRT 2PL: вероятность верного ответа, информация Фишера, оценка θ методом EAP.
 * Используется в экране «Как работает тест» (кривые) и в мок-движке CAT.
 */

/** P(θ) = 1 / (1 + e^(−a(θ − b))) */
export function p2pl(theta: number, a: number, b: number): number {
  return 1 / (1 + Math.exp(-a * (theta - b)))
}

/** I(θ) = a² · P · (1 − P) */
export function fisherInformation(theta: number, a: number, b: number): number {
  const p = p2pl(theta, a, b)
  return a * a * p * (1 - p)
}

/** Функция распределения стандартного нормального (Abramowitz–Stegun 7.1.26, погрешность < 1.5e-7). */
export function normalCdf(x: number): number {
  const sign = x < 0 ? -1 : 1
  const z = Math.abs(x) / Math.SQRT2
  const t = 1 / (1 + 0.3275911 * z)
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z)
  return 0.5 * (1 + sign * y)
}

export interface ItemResponse {
  a: number
  b: number
  correct: boolean
}

export interface ThetaEstimate {
  theta: number
  se: number
}

const GRID: number[] = Array.from({ length: 161 }, (_, i) => -4 + i * 0.05)

/** EAP-оценка θ с априорным N(μ, σ²) на сетке [−4; 4]. */
export function estimateThetaEap(responses: readonly ItemResponse[], priorMean = 0, priorSd = 1): ThetaEstimate {
  let sumW = 0
  let sumWT = 0
  const weights = GRID.map((theta) => {
    const z = (theta - priorMean) / priorSd
    let logL = -0.5 * z * z
    for (const r of responses) {
      const p = p2pl(theta, r.a, r.b)
      logL += Math.log(r.correct ? p : 1 - p)
    }
    return logL
  })
  const maxLog = Math.max(...weights)
  const posterior = weights.map((w) => Math.exp(w - maxLog))
  GRID.forEach((theta, i) => {
    const w = posterior[i] ?? 0
    sumW += w
    sumWT += w * theta
  })
  const mean = sumWT / sumW
  let sumVar = 0
  GRID.forEach((theta, i) => {
    const w = posterior[i] ?? 0
    sumVar += w * (theta - mean) ** 2
  })
  return { theta: mean, se: Math.sqrt(sumVar / sumW) }
}

/**
 * P(θ ≥ cut) при апостериорном N(θ̂, SE²).
 * Решение по грейду: сдал, если P(θ ≥ cut_грейда) ≥ 0.7.
 */
export function probabilityAbove(estimate: ThetaEstimate, cut: number): number {
  return normalCdf((estimate.theta - cut) / Math.max(estimate.se, 1e-6))
}

export interface CatItem {
  id: string
  a: number
  b: number
  competency: string
}

/**
 * Выбор следующего задания: максимум информации Фишера в текущей θ, случайно из топ-K (randomesque),
 * без повторов и с ограничением на компетенцию (не больше maxPerCompetency подряд выбранных).
 */
export function selectNextItem<T extends CatItem>(
  bank: readonly T[],
  theta: number,
  usedIds: ReadonlySet<string>,
  random: () => number,
  options: { topK?: number; competencyCounts?: ReadonlyMap<string, number>; maxPerCompetency?: number } = {},
): T | null {
  const topK = options.topK ?? 5
  const max = options.maxPerCompetency ?? Number.POSITIVE_INFINITY
  const candidates = bank
    .filter((item) => !usedIds.has(item.id))
    .filter((item) => (options.competencyCounts?.get(item.competency) ?? 0) < max)
    .map((item) => ({ item, info: fisherInformation(theta, item.a, item.b) }))
    .sort((x, y) => y.info - x.info)
    .slice(0, topK)
  if (candidates.length === 0) return null
  const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length))
  return candidates[index]?.item ?? null
}

/** Уровень сложности 1–5 по параметру b (для показа кандидату). */
export function difficultyLevel(b: number): number {
  if (b < -1.2) return 1
  if (b < -0.4) return 2
  if (b < 0.4) return 3
  if (b < 1.2) return 4
  return 5
}

/** Детерминированный ГПСЧ (mulberry32) — для воспроизводимых симуляций и сидов. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
