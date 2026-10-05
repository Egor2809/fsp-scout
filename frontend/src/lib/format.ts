import type { SalaryRange } from '@/api/generated/model'

const NBSP = '\u00A0'

export const SALARY_MIN = 10_000
export const SALARY_MAX = 10_000_000

const integerFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })

/** 250000 → «250 000» (неразрывные пробелы, чтобы сумма не переносилась). */
export function formatNumber(value: number): string {
  return integerFormat.format(Math.round(value)).replace(/[\s\u00A0\u202F]/g, NBSP)
}

/** 250000 → «250 000 ₽» */
export function formatMoney(value: number): string {
  return `${formatNumber(value)}${NBSP}₽`
}

/** 250000 → «250 тыс.», 1200000 → «1,2 млн» */
export function formatMoneyShort(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    const millions = Math.round(value / 100_000) / 10
    return `${String(millions).replace('.', ',')}${NBSP}млн`
  }
  if (Math.abs(value) >= 1_000) return `${formatNumber(Math.round(value / 1_000))}${NBSP}тыс.`
  return formatNumber(value)
}

/** Вилка: «250 000 – 320 000 ₽», при равных границах — одна сумма. */
export function formatSalaryRange(range: SalaryRange | null | undefined): string {
  if (!range) return 'Не указана'
  if (range.from === range.to) return formatMoney(range.from)
  return `${formatNumber(range.from)}${NBSP}–${NBSP}${formatNumber(range.to)}${NBSP}₽`
}

/** Короткая вилка: «250–320 тыс. ₽» */
export function formatSalaryRangeShort(range: SalaryRange | null | undefined): string {
  if (!range) return 'Не указана'
  const k = (v: number) => formatNumber(Math.round(v / 1_000))
  if (range.from === range.to) return `${k(range.from)}${NBSP}тыс.${NBSP}₽`
  return `${k(range.from)}–${k(range.to)}${NBSP}тыс.${NBSP}₽`
}

export type SalaryRangeError =
  | { field: 'from' | 'to'; message: string }
  | null

/**
 * Проверка вилки (та же логика, что на сервере: обязательна, целые рубли 10 000–10 000 000, from ≤ to).
 * Возвращает первую ошибку или null.
 */
export function validateSalaryRange(from: number | null | undefined, to: number | null | undefined): SalaryRangeError {
  if (from === null || from === undefined || Number.isNaN(from)) return { field: 'from', message: 'Укажите нижнюю границу вилки' }
  if (to === null || to === undefined || Number.isNaN(to)) return { field: 'to', message: 'Укажите верхнюю границу вилки' }
  if (!Number.isInteger(from)) return { field: 'from', message: 'Только целые рубли' }
  if (!Number.isInteger(to)) return { field: 'to', message: 'Только целые рубли' }
  if (from < SALARY_MIN) return { field: 'from', message: `Не меньше ${formatMoney(SALARY_MIN)}` }
  if (to > SALARY_MAX) return { field: 'to', message: `Не больше ${formatMoney(SALARY_MAX)}` }
  if (from > SALARY_MAX) return { field: 'from', message: `Не больше ${formatMoney(SALARY_MAX)}` }
  if (to < SALARY_MIN) return { field: 'to', message: `Не меньше ${formatMoney(SALARY_MIN)}` }
  if (from > to) return { field: 'to', message: 'Верхняя граница должна быть не меньше нижней' }
  return null
}

/** Разбор ввода суммы: «250 000», «250000», «250к», «250 тыс» → 250000. Пусто → null. */
export function parseMoneyInput(raw: string): number | null {
  const s = raw.trim().toLowerCase().replace(/[\s\u00A0\u202F]/g, '').replace(',', '.')
  if (!s) return null
  const m = /^(\d+(?:\.\d+)?)(к|k|т|тыс\.?|тысяч|млн|m)?₽?$/.exec(s)
  if (!m) return Number.NaN
  const base = Number(m[1])
  const suffix = m[2]
  if (!suffix) return Math.round(base)
  if (suffix === 'млн' || suffix === 'm') return Math.round(base * 1_000_000)
  return Math.round(base * 1_000)
}

/** Пересекаются ли две вилки. */
export function rangesOverlap(a: SalaryRange, b: SalaryRange): boolean {
  return a.from <= b.to && b.from <= a.to
}

/** Склонение: plural(3, ['день', 'дня', 'дней']) → «дня» */
export function plural(n: number, forms: readonly [string, string, string]): string {
  const abs = Math.abs(n) % 100
  const last = abs % 10
  if (abs > 10 && abs < 20) return forms[2]
  if (last > 1 && last < 5) return forms[1]
  if (last === 1) return forms[0]
  return forms[2]
}

export function pluralWithCount(n: number, forms: readonly [string, string, string]): string {
  return `${formatNumber(n)}${NBSP}${plural(n, forms)}`
}

/** 82 → «82-й перцентиль» */
export function formatPercentile(p: number | null | undefined): string {
  if (p === null || p === undefined) return '—'
  return `${p}-й перцентиль`
}

/** 0.6 → «60%» */
export function formatShare(share: number): string {
  return `${Math.round(share * 100)}%`
}

const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
const shortDateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })
const dateTimeFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value)
}

/** «5 октября 2026 г.» */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—'
  return dateFormat.format(toDate(value))
}

/** «5 окт.» */
export function formatShortDate(value: string | Date | null | undefined): string {
  if (!value) return '—'
  return shortDateFormat.format(toDate(value))
}

/** «5 окт., 14:30» */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—'
  return dateTimeFormat.format(toDate(value))
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Сколько полных суток до даты (может быть отрицательным). */
export function daysUntil(value: string | Date, now: Date = new Date()): number {
  return Math.ceil((toDate(value).getTime() - now.getTime()) / DAY_MS)
}

/** «через 3 дня», «сегодня», «2 дня назад» */
export function formatRelativeDays(value: string | Date, now: Date = new Date()): string {
  const target = toDate(value)
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diff = Math.round((startOf(target) - startOf(now)) / DAY_MS)
  if (diff === 0) return 'сегодня'
  if (diff === 1) return 'завтра'
  if (diff === -1) return 'вчера'
  if (diff > 0) return `через ${pluralWithCount(diff, ['день', 'дня', 'дней'])}`
  return `${pluralWithCount(-diff, ['день', 'дня', 'дней'])} назад`
}

/** Таймер теста: 125 → «02:05», 3725 → «1:02:05» */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(sec).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

/** Стаж: 3.5 → «3,5 года», 1 → «1 год» */
export function formatYears(years: number): string {
  if (years < 1) {
    const months = Math.max(1, Math.round(years * 12))
    return pluralWithCount(months, ['месяц', 'месяца', 'месяцев'])
  }
  const rounded = Math.round(years * 2) / 2
  if (Number.isInteger(rounded)) return pluralWithCount(rounded, ['год', 'года', 'лет'])
  return `${String(rounded).replace('.', ',')}${NBSP}года`
}
