import type { CategoryRecommendation, Grade, SalaryRadar, SalaryRange, Specialization, WorkFormat } from '@/api/generated/model'
import { formatShare } from '@/lib/format'
import { categoryLabel, nextGrade, prevGrade } from '@/lib/labels'
import type { CandidateRec, MockDb } from '../db/types'
import { isPublished } from './matching'

/** Салари-радар: где вилка относительно ожиданий кандидатов категории (SOLUTION.md, 5.3). */

function quantile(sorted: number[], q: number): number | null {
  if (sorted.length === 0) return null
  const pos = (sorted.length - 1) * q
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  const v = (sorted[lo] ?? 0) + ((sorted[hi] ?? 0) - (sorted[lo] ?? 0)) * (pos - lo)
  return Math.round(v / 1000) * 1000
}

export function categoryPool(db: MockDb, specialization: Specialization, grade: Grade, companyId: string | null): CandidateRec[] {
  return db.candidates.filter(
    (c) =>
      isPublished(c) &&
      c.standing?.specialization === specialization &&
      c.standing.grade === grade &&
      (!companyId || !c.privacy.hiddenCompanyIds.includes(companyId)),
  )
}

export function salaryRadar(db: MockDb, specialization: Specialization, grade: Grade, salary: SalaryRange, companyId: string | null): SalaryRadar {
  const pool = categoryPool(db, specialization, grade, companyId).filter((c) => c.salaryExpectation)
  const total = pool.length
  let above = 0
  let below = 0
  const mids: number[] = []
  for (const c of pool) {
    const e = c.salaryExpectation as SalaryRange
    if (e.from > salary.to) above += 1
    else if (e.to < salary.from) below += 1
    mids.push((e.from + e.to) / 2)
  }
  mids.sort((a, b) => a - b)
  const within = total - above - below
  const share = (n: number) => (total ? Math.round((n / total) * 100) / 100 : 0)
  const label = categoryLabel(specialization, grade)

  // Гистограмма ожиданий (нижняя граница), шаг 20–40 тыс. в зависимости от разброса
  const froms = pool.map((c) => (c.salaryExpectation as SalaryRange).from)
  const minV = Math.min(...froms, salary.from)
  const maxV = Math.max(...froms, salary.to)
  const step = maxV - minV > 300_000 ? 40_000 : maxV - minV > 150_000 ? 30_000 : 20_000
  const start = Math.floor(minV / step) * step
  const buckets: SalaryRadar['histogram'] = []
  for (let from = start; from <= maxV; from += step) {
    buckets.push({ from, to: from + step, count: froms.filter((v) => v >= from && v < from + step).length })
  }

  const shareAbove = share(above)
  const shareBelow = share(below)
  const verdict: SalaryRadar['verdict'] = shareAbove >= 0.5 ? 'below_market' : shareBelow >= 0.5 ? 'above_market' : 'in_market'
  const message =
    total === 0
      ? `В категории ${label} пока нет кандидатов с указанными ожиданиями`
      : verdict === 'below_market'
        ? `Ваша вилка ниже ожиданий ${formatShare(shareAbove)} кандидатов ${label}`
        : verdict === 'above_market'
          ? `Вилка выше ожиданий ${formatShare(shareBelow)} кандидатов ${label}: можно рассчитывать на сильных`
          : `Вилка в рынке: пересекается с ожиданиями ${formatShare(share(within))} кандидатов ${label}`

  return {
    category: { specialization, grade, label },
    salary,
    candidates_total: total,
    share_above: shareAbove,
    share_within: share(within),
    share_below: shareBelow,
    median: quantile(mids, 0.5),
    p25: quantile(mids, 0.25),
    p75: quantile(mids, 0.75),
    histogram: buckets,
    verdict,
    message,
  }
}

export function recommendCategories(
  db: MockDb,
  need: { specialization: Specialization; grade: Grade; salary: SalaryRange; work_formats: WorkFormat[]; city: string | null },
  companyId: string,
): CategoryRecommendation[] {
  const make = (grade: Grade, kind: CategoryRecommendation['kind'], reason: string): CategoryRecommendation => {
    const pool = categoryPool(db, need.specialization, grade, companyId).filter((c) => c.workFormats.some((f) => need.work_formats.includes(f)))
    const radar = salaryRadar(db, need.specialization, grade, need.salary, companyId)
    return {
      category: { specialization: need.specialization, grade, label: categoryLabel(need.specialization, grade) },
      kind,
      candidate_count: pool.length,
      median_expectation: radar.median,
      reason,
      radar,
    }
  }
  const list: CategoryRecommendation[] = [make(need.grade, 'primary', 'Точное совпадение со специализацией и грейдом из потребности')]
  const lower = prevGrade(need.grade)
  const higher = nextGrade(need.grade)
  if (higher) list.push(make(higher, 'adjacent', `Сильнее по уровню, ожидания обычно выше вашей вилки`))
  if (lower) list.push(make(lower, 'adjacent', `Растущие специалисты с подтверждёнными навыками: ожидания ниже, нужен онбординг`))
  return list
}
