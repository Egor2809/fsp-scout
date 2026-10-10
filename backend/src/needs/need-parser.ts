import type { Grade, Industry, ParsedNeed, SalaryRange, Specialization, WorkFormat } from '../contract/model/index.js'
import { CITIES, SKILLS, skillRef } from '../common/taxonomy-data.ts'

/**
 * Офлайн-фолбэк разбора потребности на правилах и словаре синонимов (SOLUTION.md, 9: «Без ключей
 * работает офлайн-фолбэк на правилах»). LLM-разбор на бэкенде отдаёт ту же структуру ParsedNeed.
 */

const SPEC_PATTERNS: [Specialization, RegExp][] = [
  ['backend', /(бэк|бек|back)[\s-]?(енд|энд|end)|бэкендер|бекендер|серверн/],
  ['frontend', /(фронт|front)[\s-]?(енд|энд|end)?|фронтендер|верстальщик/],
  ['mobile', /мобильн|mobile|ios[\s-]?разраб|android[\s-]?разраб|андроид[\s-]?разраб|flutter[\s-]?разраб/],
  ['qa', /тестировщик|\bqa\b|автотест|тестирован/],
  ['devops', /devops|девопс|\bsre\b|инфраструктур/],
  ['data_ml', /\bml\b|machine learning|машинн\w* обучен|data scien|дата[\s-]?сайент|data[\s-]?engineer|дата[\s-]?инженер/],
  ['analyst', /аналитик|analyst/],
]

const GRADE_PATTERNS: [Grade, RegExp][] = [
  ['lead', /\blead\b|тимлид|техлид|team ?lead|лид\b|ведущ/],
  ['senior', /senior|сеньор|синьор|старш/],
  ['middle', /middle|мидл|миддл/],
  ['junior', /junior|джун|начинающ|стаж[её]р/],
]

const FORMAT_PATTERNS: [WorkFormat, RegExp][] = [
  ['remote', /удал[её]н|remote|из дома|дистанц/],
  ['hybrid', /гибрид|hybrid/],
  ['office', /офис|office/],
]

const INDUSTRY_PATTERNS: [Industry, RegExp][] = [
  ['fintech', /финтех|fintech|банк|платёж|платеж|эквайринг|финанс/],
  ['ecom', /e-?com|маркетплейс|интернет-магазин|ритейл|retail|доставк/],
  ['gov', /госсектор|госуслуг|государств|\bгос\b/],
  ['telecom', /телеком|оператор связи|telecom/],
  ['gamedev', /геймдев|gamedev|игров|игры/],
  ['edtech', /edtech|образоват|онлайн-школ|курс/],
  ['medtech', /медтех|medtech|медицин|клиник/],
  ['manufacturing', /промышлен|производств|завод/],
]

const NICE_MARKERS = /(желательно|будет плюсом|плюсом будет|nice[\s-]?to[\s-]?have|приветствуется|как плюс|не обязательно|по желанию)/

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Словарь: синоним в нижнем регистре → id навыка. Длинные синонимы проверяются первыми. */
const SKILL_LEXICON: { pattern: RegExp; id: string }[] = SKILLS.flatMap((s) =>
  [s.name, ...s.aliases].map((alias) => ({ alias: alias.toLowerCase(), id: s.id })),
)
  .sort((a, b) => b.alias.length - a.alias.length)
  .map(({ alias, id }) => ({
    // Границы слова для латиницы и кириллицы: не буква/цифра до и после
    pattern: new RegExp(`(^|[^\\p{L}\\p{N}+#.])${escapeRegExp(alias)}(?=$|[^\\p{L}\\p{N}+#])`, 'iu'),
    id,
  }))

function normalize(text: string): string {
  return text.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ')
}

/** Вилка из текста: «250–320 тысяч», «от 250 до 320 тыс.», «250-320к», «250 000 – 320 000 ₽». */
export function parseSalary(text: string): SalaryRange | null {
  const t = text.toLowerCase().replace(/\s+/g, ' ')
  const unit = '(тысяч[а-я]*|тыс\\.?|к(?![а-я])|k(?![a-z])|т\\.?р\\.?)?'
  const num = '(\\d{2,3}(?: ?\\d{3})?)'
  const range = new RegExp(`(?:от\\s*)?${num}\\s*${unit}\\s*(?:[-–—]|до)\\s*${num}\\s*${unit}`, 'g')
  for (const m of t.matchAll(range)) {
    const rawFrom = Number((m[1] ?? '').replace(/ /g, ''))
    const rawTo = Number((m[3] ?? '').replace(/ /g, ''))
    const hasUnit = Boolean(m[2] || m[4])
    const after = t.slice((m.index ?? 0) + m[0].length, (m.index ?? 0) + m[0].length + 12)
    const hasCurrency = /^\s*(₽|руб|р\.)/.test(after)
    const isFull = rawFrom >= 10_000 && rawTo >= 10_000
    if (!hasUnit && !hasCurrency && !isFull) continue
    const scale = (n: number) => (n >= 10_000 ? n : n * 1000)
    const from = scale(rawFrom)
    const to = scale(rawTo)
    if (from <= 0 || to <= 0) continue
    return from <= to ? { from, to } : { from: to, to: from }
  }
  return null
}

function splitClauses(text: string): string[] {
  return text
    .split(/[.;\n!?]|,\s*(?=желательно|будет плюсом|плюсом|nice)|\s+а также\s+/i)
    .map((s) => s.trim())
    .filter(Boolean)
}

function findSkills(clause: string): string[] {
  const found: string[] = []
  let rest = ` ${clause} `
  for (const { pattern, id } of SKILL_LEXICON) {
    const m = pattern.exec(rest)
    if (m) {
      if (!found.includes(id)) found.push(id)
      // Вырезаем найденное, чтобы «react native» не дал ещё и «react»
      rest = rest.slice(0, m.index) + ' '.repeat(m[0].length) + rest.slice(m.index + m[0].length)
    }
  }
  return found
}

export function parseNeed(rawText: string): ParsedNeed {
  const text = normalize(rawText)
  const specialization = SPEC_PATTERNS.find(([, re]) => re.test(text))?.[0] ?? null
  const grade = GRADE_PATTERNS.find(([, re]) => re.test(text))?.[0] ?? null
  const work_formats = FORMAT_PATTERNS.filter(([, re]) => re.test(text)).map(([f]) => f)
  const industry = INDUSTRY_PATTERNS.find(([, re]) => re.test(text))?.[0] ?? null
  const city =
    CITIES.find((c) => {
      const stem = normalize(c).slice(0, Math.max(4, c.length - 2))
      return text.includes(stem) || (c === 'Москва' && /\bмск\b/.test(text)) || (c === 'Санкт-Петербург' && /\bспб\b|питер/.test(text))
    }) ?? null

  const must: string[] = []
  const nice: string[] = []
  for (const clause of splitClauses(text)) {
    const niceIdx = clause.search(NICE_MARKERS)
    if (niceIdx >= 0) {
      for (const id of findSkills(clause.slice(0, niceIdx))) if (!must.includes(id)) must.push(id)
      for (const id of findSkills(clause.slice(niceIdx))) if (!nice.includes(id) && !must.includes(id)) nice.push(id)
    } else {
      for (const id of findSkills(clause)) if (!must.includes(id)) must.push(id)
    }
  }
  const niceFinal = nice.filter((id) => !must.includes(id))

  // Нераспознанные «технические» слова латиницей — подсказка работодателю
  const known = new Set([...must, ...niceFinal])
  const latinTokens = [...new Set(rawText.match(/\b[A-Za-z][A-Za-z0-9+#.]{1,20}\b/g) ?? [])]
  const unrecognized = latinTokens.filter((tok) => {
    const lower = tok.toLowerCase()
    if (['middle', 'senior', 'junior', 'lead', 'remote', 'office', 'hybrid', 'backend', 'frontend', 'devops', 'qa', 'ml', 'sre', 'it', 'api', 'e-com', 'nice', 'to', 'have', 'team', 'data'].includes(lower)) return false
    return findSkills(lower).length === 0 && !known.has(lower)
  })

  return {
    specialization,
    grade,
    must_skills: must.map(skillRef),
    nice_skills: niceFinal.map(skillRef),
    work_formats,
    city,
    industry,
    salary: parseSalary(rawText),
    unrecognized: unrecognized.slice(0, 6),
  }
}
