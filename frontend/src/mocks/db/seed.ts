import type {
  Availability,
  CandidateSkill,
  Consent,
  FspAchievement,
  FspDiscipline,
  FspLevel,
  FspResult,
  Grade,
  Industry,
  InvitationEvent,
  InvitationStatus,
  SearchFilters,
  SkillLevel,
  Specialization,
  TestResult,
  WorkFormat,
} from '@/api/generated/model'
import {
  DEMO_CANDIDATE_FSP_ID,
  DEMO_CANDIDATE_NO_FSP_ID,
  DEMO_COMPANY_ID,
  DEMO_PERSONAS,
} from '@/auth/personas'
import { mulberry32 } from '@/lib/irt'
import { categoryLabel } from '@/lib/labels'
import { CONSENT_VERSION } from '../lib/consents'
import { EXPERIENCE_COMPANIES, FEMALE_NAMES, MALE_NAMES, ROLE_TITLES, SURNAMES, feminineSurname, translit } from '../data/names'
import { CITIES, STACK_POOL, skillName, skillRef } from '../data/taxonomy'
import type {
  ApplicationRec,
  AssignmentRec,
  CandidateRec,
  CompanyRec,
  ExperienceRec,
  GradeHistoryRec,
  InvitationRec,
  MockDb,
  NeedRec,
  SearchRec,
  SubmissionRec,
  SurveyRec,
  TaskRec,
  TestRec,
  UserRec,
  VacancyRec,
} from './types'

export const DB_VERSION = 3

const DAY = 24 * 60 * 60 * 1000
const HOUR = 60 * 60 * 1000

/** Распределение θ по грейдам (та же шкала, что в мок-движке CAT). */
export const GRADE_THETA: Record<Grade, { mean: number; sd: number }> = {
  junior: { mean: -1.0, sd: 0.45 },
  middle: { mean: 0.35, sd: 0.45 },
  senior: { mean: 1.3, sd: 0.4 },
  lead: { mean: 2.0, sd: 0.35 },
}

const SALARY_BASE: Record<Grade, [number, number]> = {
  junior: [80_000, 140_000],
  middle: [180_000, 290_000],
  senior: [290_000, 420_000],
  lead: [400_000, 580_000],
}

const SPEC_SALARY_K: Record<Specialization, number> = {
  backend: 1,
  frontend: 0.95,
  mobile: 1,
  qa: 0.8,
  devops: 1.05,
  data_ml: 1.08,
  analyst: 0.88,
}

interface Rand {
  next: () => number
  int: (min: number, max: number) => number
  pick: <T>(list: readonly T[]) => T
  pickMany: <T>(list: readonly T[], n: number) => T[]
  chance: (p: number) => boolean
  normal: (mean: number, sd: number) => number
  weighted: <T>(entries: readonly (readonly [T, number])[]) => T
  uuid: () => string
}

function makeRand(seed: number): Rand {
  const next = mulberry32(seed)
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1))
  const pick = <T,>(list: readonly T[]): T => list[Math.floor(next() * list.length)] as T
  return {
    next,
    int,
    pick,
    pickMany: <T,>(list: readonly T[], n: number): T[] => {
      const copy = [...list]
      const out: T[] = []
      while (out.length < n && copy.length > 0) out.push(copy.splice(Math.floor(next() * copy.length), 1)[0] as T)
      return out
    },
    chance: (p: number) => next() < p,
    normal: (mean: number, sd: number) => {
      const u = Math.max(next(), 1e-9)
      const v = next()
      return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
    },
    weighted: <T,>(entries: readonly (readonly [T, number])[]): T => {
      const total = entries.reduce((s, [, w]) => s + w, 0)
      let r = next() * total
      for (const [value, w] of entries) {
        r -= w
        if (r <= 0) return value
      }
      return (entries[entries.length - 1] as readonly [T, number])[0]
    },
    uuid: () => {
      const hex = Array.from({ length: 32 }, () => Math.floor(next() * 16).toString(16))
      hex[12] = '4'
      hex[16] = ((parseInt(hex[16] ?? '0', 16) & 0x3) | 0x8).toString(16)
      const h = hex.join('')
      return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
    },
  }
}

const round10k = (v: number) => Math.round(v / 10_000) * 10_000

function monthStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function levelFromScore(score: number): SkillLevel {
  if (score >= 85) return 'advanced'
  if (score >= 65) return 'confident'
  return 'basic'
}

const BACKEND_STACKS: string[][] = [
  ['go', 'postgresql', 'kafka', 'docker', 'kubernetes', 'grpc', 'redis', 'microservices'],
  ['python', 'fastapi', 'postgresql', 'redis', 'kafka', 'docker', 'sql', 'microservices'],
  ['python', 'django', 'postgresql', 'rabbitmq', 'docker', 'redis', 'sql'],
  ['java', 'spring', 'postgresql', 'kafka', 'kubernetes', 'microservices', 'system_design'],
  ['go', 'python', 'postgresql', 'kafka', 'clickhouse', 'docker', 'system_design'],
]

const FSP_REGIONS: [string, string][] = [
  ['16', 'Республики Татарстан'],
  ['54', 'Новосибирской области'],
  ['66', 'Свердловской области'],
  ['77', 'Москвы'],
  ['78', 'Санкт-Петербурга'],
  ['70', 'Томской области'],
  ['52', 'Нижегородской области'],
]

function achievementTitle(discipline: FspDiscipline, level: FspLevel, year: number, region: string): string {
  const disc: Record<FspDiscipline, string> = {
    product: 'продуктовому программированию',
    algorithmic: 'алгоритмическому программированию',
    cybersecurity: 'программированию систем информационной безопасности',
    robotics: 'программированию робототехники',
    uas: 'программированию беспилотных авиационных систем',
  }
  if (level === 'international') return `Международные соревнования по ${disc[discipline]} ${year}`
  if (level === 'national') return `Чемпионат России по ${disc[discipline]} ${year}`
  return `Чемпионат ${region} по ${disc[discipline]} ${year}`
}

function makeAchievement(
  rand: Rand,
  now: Date,
  opts: { discipline: FspDiscipline; level: FspLevel; result: FspResult; monthsAgo: number; region: string; team?: string },
): FspAchievement {
  const date = new Date(now.getTime() - opts.monthsAgo * 30 * DAY)
  const year = date.getFullYear()
  const participants = opts.level === 'regional' ? rand.int(40, 160) : opts.level === 'national' ? rand.int(300, 1400) : rand.int(800, 2600)
  const place =
    opts.result === 'winner' ? 1 : opts.result === 'prize_winner' ? rand.int(2, 3) : opts.result === 'finalist' ? rand.int(4, 25) : rand.int(26, Math.max(30, Math.floor(participants * 0.6)))
  const team = opts.team ?? (rand.chance(0.7) ? rand.pick(['404 Not Found', 'Байтовый поток', 'Сеньоры из будущего', 'Kazan Coders', 'NullPointer', 'Ctrl+Alt+Win']) : null)
  return {
    id: rand.uuid(),
    event_id: `fsp-${year}-${opts.discipline}-${opts.level}-${rand.int(100, 999)}`,
    title: achievementTitle(opts.discipline, opts.level, year, opts.region),
    date: date.toISOString().slice(0, 10),
    level: opts.level,
    discipline: opts.discipline,
    format: team ? 'team' : 'individual',
    team,
    role: team ? rand.pick(['Backend', 'Капитан, backend', 'Frontend', 'Fullstack', 'ML']) : null,
    place,
    participants_total: participants,
    percentile: Math.max(1, Math.min(99, Math.round((1 - place / participants) * 100))),
    result: opts.result,
    sport_rank: opts.level === 'national' && opts.result !== 'participant' ? rand.pick(['КМС', 'I разряд']) : opts.level === 'international' ? 'МС' : null,
    certificate_url: null,
    verified: true,
  }
}

function consentsAt(at: string, fsp: boolean): Consent[] {
  const list: Consent[] = [
    { type: 'personal_data', version: CONSENT_VERSION, given_at: at, revoked_at: null },
    { type: 'profile_visibility', version: CONSENT_VERSION, given_at: at, revoked_at: null },
  ]
  if (fsp) list.push({ type: 'fsp_data', version: CONSENT_VERSION, given_at: at, revoked_at: null })
  return list
}

function buildExperience(rand: Rand, now: Date, spec: Specialization, years: number, industries: Industry[]): ExperienceRec[] {
  const items: ExperienceRec[] = []
  let remainingMonths = Math.max(4, Math.round(years * 12))
  let end: Date | null = null
  const count = Math.min(3, Math.max(1, Math.ceil(years / 2.5)))
  for (let i = 0; i < count && remainingMonths > 0; i++) {
    const months = i === count - 1 ? remainingMonths : Math.max(4, Math.round(remainingMonths / (count - i)) + rand.int(-3, 3))
    const endDate: Date = end ?? now
    const startDate: Date = new Date(endDate.getFullYear(), endDate.getMonth() - months, 1)
    items.push({
      role: rand.pick(ROLE_TITLES[spec] ?? ['Разработчик']),
      companyName: rand.pick(EXPERIENCE_COMPANIES),
      industry: rand.pick(industries.length ? industries : (['other'] as Industry[])),
      start: monthStr(startDate),
      end: end ? monthStr(end) : null,
      description: null,
    })
    remainingMonths -= months
    end = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1)
  }
  return items
}

function skillList(rand: Rand, ids: string[], verifiedCount: number): CandidateSkill[] {
  return ids.map((id, i) => {
    if (i < verifiedCount) {
      const score = rand.int(58, 97)
      return { skill_id: id, name: skillName(id), level: levelFromScore(score), source: 'test', verified: true, score }
    }
    return {
      skill_id: id,
      name: skillName(id),
      level: rand.pick(['basic', 'confident', 'confident', 'advanced'] as const),
      source: rand.chance(0.5) ? 'self' : 'resume',
      verified: false,
      score: null,
    }
  })
}

const INDUSTRY_LIST: Industry[] = ['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing']

function salaryFor(rand: Rand, spec: Specialization, grade: Grade): { from: number; to: number } {
  const [lo, hi] = SALARY_BASE[grade]
  const k = SPEC_SALARY_K[spec]
  const from = round10k((lo + rand.next() * (hi - lo)) * k)
  const to = round10k(from * (1.12 + rand.next() * 0.15))
  return { from, to: Math.max(to, from + 20_000) }
}

/** Синтетический результат теста для истории. */
function historicalResult(
  test: { id: string; specialization: Specialization; declaredGrade: Grade; finishedAt: string },
  outcome: TestResult['outcome'],
  assigned: Grade | null,
  percentile: number | null,
  theta: number,
  skills: CandidateSkill[],
  nextRetakeAt: string,
  nextGradeChangeAt: string | null,
): TestResult {
  return {
    test_id: test.id,
    specialization: test.specialization,
    declared_grade: test.declaredGrade,
    outcome,
    assigned_grade: assigned,
    category: assigned ? { specialization: test.specialization, grade: assigned, label: categoryLabel(test.specialization, assigned) } : null,
    percentile,
    theta,
    se: 0.33,
    confidence: 'high',
    confirmed_skills: skills.filter((s) => s.verified),
    competencies: [],
    suggestion:
      outcome === 'failed'
        ? { action: 'try_lower', grade: assigned ?? 'middle', available_at: null, message: 'Сразу доступна одна попытка на грейд ниже.' }
        : { action: 'none', grade: null, available_at: null, message: 'Грейд подтверждён.' },
    flags: [],
    items_answered: 14,
    duration_sec: 2280,
    finished_at: test.finishedAt,
    next_retake_at: nextRetakeAt,
    next_grade_change_at: nextGradeChangeAt,
    trace: [],
  }
}

export function buildSeed(now: Date = new Date()): MockDb {
  const rand = makeRand(20261005)
  const iso = (d: Date) => d.toISOString()
  const ago = (days: number, hours = 0) => iso(new Date(now.getTime() - days * DAY - hours * HOUR))
  const ahead = (days: number, hours = 0) => iso(new Date(now.getTime() + days * DAY + hours * HOUR))

  // ───────────── Компании ─────────────
  const companyBase = (id: string, name: string, industry: Industry, city: string, size: CompanyRec['size'], description: string, email: string, verified = true): CompanyRec => ({
    id,
    name,
    industry,
    description,
    website: `https://${translit(name).replace(/[^a-z]/g, '')}.example`,
    city,
    size,
    inn: null,
    contact_email: email,
    contact_phone: null,
    verified,
    created_at: ago(rand.int(200, 700)),
    quotaBase: 20,
  })
  const companies: CompanyRec[] = [
    {
      ...companyBase(
        DEMO_COMPANY_ID,
        'Северный код',
        'fintech',
        'Москва',
        '201-1000',
        'Разрабатываем платёжную инфраструктуру для банков и маркетплейсов: эквайринг, выплаты, антифрод. 14 млн транзакций в сутки, своя платформа на Go и Python.',
        'hr@severcode.ru',
      ),
      website: 'https://severcode.example',
      inn: '7701234567',
      contact_phone: '+7 495 120-45-00',
    },
    companyBase(rand.uuid(), 'Волга Ритейл Тех', 'ecom', 'Казань', '201-1000', 'ИТ-компания сети гипермаркетов Поволжья: доставка, лояльность, складская логистика.', 'jobs@volgaretail.example'),
    companyBase(rand.uuid(), 'ТелеМост', 'telecom', 'Санкт-Петербург', '1000+', 'Оператор связи: биллинг, сеть 5G, клиентские приложения.', 'career@telemost.example'),
    companyBase(rand.uuid(), 'Пиксель Плэй', 'gamedev', 'Новосибирск', '51-200', 'Мобильные игры и игровые сервисы, 20 млн игроков.', 'team@pixelplay.example'),
    companyBase(rand.uuid(), 'МедДата', 'medtech', 'Москва', '51-200', 'Анализ медицинских изображений и электронные медкарты для клиник.', 'hr@meddata.example'),
    companyBase(rand.uuid(), 'Цифровой регион', 'gov', 'Екатеринбург', '201-1000', 'Региональные госуслуги и цифровые сервисы для жителей Урала.', 'hr@digitalregion.example'),
    companyBase(rand.uuid(), 'Знание Онлайн', 'edtech', 'Томск', '51-200', 'Онлайн-школа программирования: платформа курсов и тренажёров.', 'hello@znanie.example'),
    companyBase(rand.uuid(), 'Уральский станок Digital', 'manufacturing', 'Екатеринбург', '1000+', 'Цифровизация производства: MES, IoT-датчики, предиктивное обслуживание.', 'it@uralstanok.example', false),
  ]
  const [cSever, cVolga, cTele, cPixel, cMed, cRegion, cZnanie, cUral] = companies as [
    CompanyRec, CompanyRec, CompanyRec, CompanyRec, CompanyRec, CompanyRec, CompanyRec, CompanyRec,
  ]

  // ───────────── Пользователи ─────────────
  const personaAlexey = DEMO_PERSONAS.find((p) => p.key === 'candidate-fsp')!
  const personaMaria = DEMO_PERSONAS.find((p) => p.key === 'candidate-no-fsp')!
  const personaIrina = DEMO_PERSONAS.find((p) => p.key === 'employer')!
  const users: UserRec[] = [
    { id: personaAlexey.userId, role: 'candidate', email: personaAlexey.email, displayName: personaAlexey.displayName, candidateId: DEMO_CANDIDATE_FSP_ID, companyId: null, createdAt: ago(60) },
    { id: personaMaria.userId, role: 'candidate', email: personaMaria.email, displayName: personaMaria.displayName, candidateId: DEMO_CANDIDATE_NO_FSP_ID, companyId: null, createdAt: ago(20) },
    { id: personaIrina.userId, role: 'employer', email: personaIrina.email, displayName: personaIrina.displayName, candidateId: null, companyId: DEMO_COMPANY_ID, createdAt: ago(300) },
  ]

  // ───────────── Кандидаты ─────────────
  const candidates: CandidateRec[] = []

  const alexeyGradeAt = ago(46)
  const alexeyMiddleTestId = rand.uuid()
  const alexeySeniorTestId = rand.uuid()
  const alexeySkills: CandidateSkill[] = [
    { skill_id: 'go', name: 'Go', level: 'advanced', source: 'test', verified: true, score: 91 },
    { skill_id: 'postgresql', name: 'PostgreSQL', level: 'advanced', source: 'test', verified: true, score: 88 },
    { skill_id: 'python', name: 'Python', level: 'confident', source: 'test', verified: true, score: 79 },
    { skill_id: 'kafka', name: 'Kafka', level: 'confident', source: 'self', verified: false, score: null },
    { skill_id: 'docker', name: 'Docker', level: 'confident', source: 'resume', verified: false, score: null },
    { skill_id: 'grpc', name: 'gRPC', level: 'confident', source: 'resume', verified: false, score: null },
    { skill_id: 'redis', name: 'Redis', level: 'basic', source: 'self', verified: false, score: null },
  ]
  const alexeyAchievements: FspAchievement[] = [
    {
      ...makeAchievement(rand, now, { discipline: 'product', level: 'national', result: 'prize_winner', monthsAgo: 11, region: 'Республики Татарстан', team: 'Kazan Coders' }),
      title: 'Чемпионат России по продуктовому программированию 2025',
      date: `${now.getFullYear() - 1}-11-16`,
      place: 2,
      participants_total: 1140,
      percentile: 99,
      role: 'Капитан, backend',
      sport_rank: 'КМС',
    },
    {
      ...makeAchievement(rand, now, { discipline: 'algorithmic', level: 'regional', result: 'winner', monthsAgo: 19, region: 'Республики Татарстан' }),
      title: 'Чемпионат Республики Татарстан по алгоритмическому программированию 2025',
      date: `${now.getFullYear() - 1}-03-22`,
    },
  ]
  candidates.push({
    id: DEMO_CANDIDATE_FSP_ID,
    userId: personaAlexey.userId,
    fullName: 'Алексей Смирнов',
    email: personaAlexey.email,
    phone: '+7 917 245-18-63',
    telegram: '@a_smirnov_dev',
    preferredChannel: 'telegram',
    city: 'Казань',
    relocation: true,
    about: 'Backend-разработчик, 3 года в финтехе и e-com. Пишу на Go и Python, люблю PostgreSQL и понятные контракты API. Капитан команды на чемпионате ФСП.',
    specialization: 'backend',
    standing: { specialization: 'backend', grade: 'middle', percentile: 82, confirmedAt: alexeyGradeAt, testId: alexeyMiddleTestId },
    theta: 0.84,
    se: 0.31,
    experienceYears: 3.5,
    experience: [
      { role: 'Go-разработчик', companyName: 'ООО «Платёжные решения»', industry: 'fintech', start: monthStr(new Date(now.getFullYear() - 2, now.getMonth() - 1, 1)), end: null, description: 'Сервис выплат: Go, PostgreSQL, Kafka. Перевёл обработку на outbox, сократил дубли платежей до нуля.' },
      { role: 'Python-разработчик', companyName: 'ООО «РитейлСофт»', industry: 'ecom', start: monthStr(new Date(now.getFullYear() - 3, now.getMonth() - 7, 1)), end: monthStr(new Date(now.getFullYear() - 2, now.getMonth() - 2, 1)), description: 'Бэкенд программы лояльности на FastAPI.' },
    ],
    skills: alexeySkills,
    industries: ['fintech', 'ecom'],
    workFormats: ['hybrid', 'remote'],
    salaryExpectation: { from: 250_000, to: 300_000 },
    availability: 'active',
    privacy: { salaryFloor: 240_000, hiddenCompanyIds: [], showFsp: true, showCompanyNames: false, showCity: true },
    consents: consentsAt(ago(60), true),
    fsp: { linked: true, fspId: 'FSP-16-004215', verifiedAt: ago(40), achievements: alexeyAchievements },
    taskSignal: { fresh: true, solvedCount: 1, lastSolvedAt: ago(18) },
    lastActiveAt: ago(0, 3),
    gradeChangedAt: alexeyGradeAt,
    createdAt: ago(60),
    updatedAt: ago(5),
  })

  const mariaTestId = rand.uuid()
  candidates.push({
    id: DEMO_CANDIDATE_NO_FSP_ID,
    userId: personaMaria.userId,
    fullName: 'Мария Кузнецова',
    email: personaMaria.email,
    phone: '+7 926 381-72-40',
    telegram: null,
    preferredChannel: 'email',
    city: 'Москва',
    relocation: false,
    about: 'Frontend-разработчица, год коммерческого опыта на React и TypeScript. Внимательна к доступности интерфейсов.',
    specialization: 'frontend',
    standing: { specialization: 'frontend', grade: 'junior', percentile: 64, confirmedAt: ago(14), testId: mariaTestId },
    theta: -0.85,
    se: 0.34,
    experienceYears: 1,
    experience: [
      { role: 'Frontend-разработчик', companyName: 'ООО «Кодовая база»', industry: 'edtech', start: monthStr(new Date(now.getFullYear() - 1, now.getMonth(), 1)), end: null, description: 'Личный кабинет ученика на React, TypeScript, TanStack Query.' },
    ],
    skills: [
      { skill_id: 'react', name: 'React', level: 'confident', source: 'test', verified: true, score: 74 },
      { skill_id: 'typescript', name: 'TypeScript', level: 'basic', source: 'test', verified: true, score: 63 },
      { skill_id: 'html_css', name: 'HTML/CSS', level: 'confident', source: 'self', verified: false, score: null },
      { skill_id: 'a11y', name: 'Доступность (a11y)', level: 'basic', source: 'self', verified: false, score: null },
      { skill_id: 'vite', name: 'Vite', level: 'basic', source: 'resume', verified: false, score: null },
    ],
    industries: ['edtech'],
    workFormats: ['hybrid', 'remote'],
    salaryExpectation: { from: 110_000, to: 140_000 },
    availability: 'active',
    privacy: { salaryFloor: 100_000, hiddenCompanyIds: [], showFsp: true, showCompanyNames: true, showCity: true },
    consents: consentsAt(ago(20), false),
    fsp: { linked: false, fspId: null, verifiedAt: null, achievements: [] },
    taskSignal: { fresh: false, solvedCount: 0, lastSolvedAt: null },
    lastActiveAt: ago(1),
    gradeChangedAt: ago(14),
    createdAt: ago(20),
    updatedAt: ago(14),
  })

  const specWeights: [Specialization, number][] = [
    ['backend', 32], ['frontend', 20], ['mobile', 8], ['qa', 10], ['devops', 10], ['data_ml', 12], ['analyst', 8],
  ]
  const gradeWeights: [Grade, number][] = [['junior', 20], ['middle', 40], ['senior', 30], ['lead', 10]]
  const cityWeights: [string, number][] = CITIES.map((c, i) => [c, i === 0 ? 30 : i === 1 ? 14 : 5])
  const formatsVariants: WorkFormat[][] = [['remote'], ['hybrid', 'remote'], ['office', 'hybrid'], ['hybrid'], ['office', 'hybrid', 'remote']]

  for (let i = 0; i < 72; i++) {
    // Первые кандидаты — бэкенд Middle/Senior, чтобы витринная подборка была содержательной
    const spec: Specialization = i < 14 ? 'backend' : rand.weighted(specWeights)
    const grade: Grade = i < 10 ? (i % 3 === 0 ? 'senior' : 'middle') : rand.weighted(gradeWeights)
    const male = rand.chance(0.7)
    const first = rand.pick(male ? MALE_NAMES : FEMALE_NAMES)
    const lastBase = rand.pick(SURNAMES)
    const last = male ? lastBase : feminineSurname(lastBase)
    const yearsRange: Record<Grade, [number, number]> = { junior: [0.3, 1], middle: [1, 3], senior: [3, 6], lead: [6, 12] }
    const [ylo, yhi] = yearsRange[grade]
    const years = Math.round((ylo + rand.next() * (yhi - ylo)) * 2) / 2
    const stack =
      spec === 'backend'
        ? rand.pickMany(i < 10 ? (BACKEND_STACKS[i % 2 === 0 ? 0 : 4] as string[]) : rand.pick(BACKEND_STACKS), rand.int(5, 7))
        : rand.pickMany(STACK_POOL[spec], rand.int(4, 7))
    if (spec === 'backend' && i < 10) {
      for (const must of ['go', 'postgresql']) if (!stack.includes(must)) stack.unshift(must)
      if (i % 2 === 0 && !stack.includes('kafka')) stack.push('kafka')
    }
    const industries = rand.pickMany(INDUSTRY_LIST, rand.int(1, 2))
    if (i < 10 && !industries.includes('fintech') && rand.chance(0.6)) industries.unshift('fintech')
    const createdAt = ago(rand.int(30, 400))
    const confirmed = i < 12 ? true : rand.chance(0.9)
    const theta = rand.normal(GRADE_THETA[grade].mean, GRADE_THETA[grade].sd)
    const hasFsp = i === 1 || i === 4 ? true : rand.chance(0.35)
    const region = rand.pick(FSP_REGIONS)
    const achievements: FspAchievement[] = hasFsp
      ? Array.from({ length: rand.int(1, 3) }, () =>
          makeAchievement(rand, now, {
            discipline: rand.weighted<FspDiscipline>([['product', 45], ['algorithmic', 30], ['cybersecurity', 15], ['robotics', 5], ['uas', 5]]),
            level: rand.weighted<FspLevel>([['regional', 60], ['national', 32], ['international', 8]]),
            result: rand.weighted<FspResult>([['winner', 12], ['prize_winner', 22], ['finalist', 30], ['participant', 36]]),
            monthsAgo: rand.int(2, 40),
            region: region[1],
          }),
        )
      : []
    const salary = salaryFor(rand, spec, grade)
    const availability: Availability = i < 10 ? rand.pick(['active', 'open'] as const) : rand.weighted<Availability>([['active', 45], ['open', 45], ['not_looking', 10]])
    const telegramHandle = `@${translit(first).slice(0, 4)}_${translit(lastBase).replace(/[^a-z]/g, '')}`.slice(0, 30)
    const skills = skillList(rand, stack, confirmed ? Math.min(stack.length, rand.int(2, 4)) : 0)
    const confirmedAt = ago(rand.int(8, 200))
    candidates.push({
      id: rand.uuid(),
      userId: rand.uuid(),
      fullName: `${first} ${last}`,
      email: `${translit(first).slice(0, 1)}.${translit(last).replace(/[^a-z]/g, '')}${rand.int(1, 99)}@${rand.pick(['mail.ru', 'yandex.ru', 'gmail.com', 'inbox.ru'])}`,
      phone: `+7 9${rand.int(10, 99)} ${rand.int(100, 999)}-${rand.int(10, 99)}-${rand.int(10, 99)}`,
      telegram: rand.chance(0.7) ? telegramHandle : null,
      preferredChannel: rand.pick(['email', 'phone', 'telegram'] as const),
      city: rand.weighted(cityWeights),
      relocation: rand.chance(0.3),
      about: null,
      specialization: spec,
      standing: confirmed ? { specialization: spec, grade, percentile: 50, confirmedAt, testId: rand.uuid() } : null,
      theta: confirmed ? theta : null,
      se: confirmed ? 0.28 + rand.next() * 0.2 : null,
      experienceYears: years,
      experience: buildExperience(rand, now, spec, years, industries),
      skills,
      industries,
      workFormats: i < 10 ? rand.pick([['hybrid', 'remote'], ['remote'], ['office', 'hybrid', 'remote']] as WorkFormat[][]) : rand.pick(formatsVariants),
      salaryExpectation: salary,
      availability,
      privacy: {
        salaryFloor: rand.chance(0.6) ? round10k(salary.from * (0.85 + rand.next() * 0.15)) : null,
        hiddenCompanyIds: rand.chance(0.04) ? [cSever.id] : [],
        showFsp: rand.chance(0.92),
        showCompanyNames: rand.chance(0.5),
        showCity: rand.chance(0.9),
      },
      consents: consentsAt(createdAt, hasFsp),
      fsp: hasFsp
        ? { linked: true, fspId: `FSP-${region[0]}-${String(rand.int(1, 999999)).padStart(6, '0')}`, verifiedAt: ago(rand.int(5, 90)), achievements }
        : { linked: rand.chance(0.15), fspId: null, verifiedAt: null, achievements: [] },
      taskSignal: rand.chance(0.15) ? { fresh: true, solvedCount: rand.int(1, 3), lastSolvedAt: ago(rand.int(1, 14)) } : { fresh: false, solvedCount: rand.chance(0.2) ? 1 : 0, lastSolvedAt: null },
      lastActiveAt: ago(rand.int(0, 35), rand.int(0, 20)),
      gradeChangedAt: confirmed ? confirmedAt : null,
      createdAt,
      updatedAt: ago(rand.int(1, 30)),
    })
    // У «пустой» ФСП-связки без достижений fspId нужен для консистентности
    const last2 = candidates[candidates.length - 1] as CandidateRec
    if (last2.fsp.linked && !last2.fsp.fspId) last2.fsp.fspId = `FSP-${region[0]}-${String(rand.int(1, 999999)).padStart(6, '0')}`
  }

  // Перцентиль внутри категории — по рангу θ (Алексей и Мария зафиксированы для демо)
  const byCategory = new Map<string, CandidateRec[]>()
  for (const c of candidates) {
    if (!c.standing) continue
    const key = `${c.standing.specialization}:${c.standing.grade}`
    byCategory.set(key, [...(byCategory.get(key) ?? []), c])
  }
  for (const list of byCategory.values()) {
    const sorted = [...list].sort((a, b) => (a.theta ?? 0) - (b.theta ?? 0))
    sorted.forEach((c, idx) => {
      if (c.id === DEMO_CANDIDATE_FSP_ID || c.id === DEMO_CANDIDATE_NO_FSP_ID || !c.standing) return
      c.standing.percentile = Math.max(1, Math.min(99, Math.round(((idx + 0.5) / sorted.length) * 100)))
    })
  }

  const synthetic = candidates.slice(2)
  const backendPool = synthetic.filter((c) => c.standing?.specialization === 'backend' && !c.privacy.hiddenCompanyIds.includes(cSever.id))

  // ───────────── Опросы, тесты, история грейдов ─────────────
  const surveys: SurveyRec[] = [
    {
      id: rand.uuid(),
      candidateId: DEMO_CANDIDATE_FSP_ID,
      created_at: ago(47),
      industries: ['fintech', 'ecom'],
      specialization: 'backend',
      primary_stack: ['go', 'python', 'postgresql', 'kafka', 'docker'],
      experience_years: 3.5,
      work_formats: ['hybrid', 'remote'],
      city: 'Казань',
      relocation: true,
      salary_expectation: { from: 250_000, to: 300_000 },
    },
    {
      id: rand.uuid(),
      candidateId: DEMO_CANDIDATE_NO_FSP_ID,
      created_at: ago(15),
      industries: ['edtech'],
      specialization: 'frontend',
      primary_stack: ['react', 'typescript', 'html_css'],
      experience_years: 1,
      work_formats: ['hybrid', 'remote'],
      city: 'Москва',
      relocation: false,
      salary_expectation: { from: 110_000, to: 140_000 },
    },
  ]

  const seniorFinished = new Date(now.getTime() - 46 * DAY - 2 * HOUR).toISOString()
  const tests: TestRec[] = [
    {
      id: alexeySeniorTestId,
      candidateId: DEMO_CANDIDATE_FSP_ID,
      specialization: 'backend',
      declaredGrade: 'senior',
      status: 'finished',
      startedAt: new Date(now.getTime() - 46 * DAY - 3 * HOUR).toISOString(),
      deadlineAt: new Date(now.getTime() - 46 * DAY - 2 * HOUR + 20 * 60 * 1000).toISOString(),
      finishedAt: seniorFinished,
      timeLimitSec: 2400,
      vacancyId: null,
      seed: 11,
      adaptiveMin: 10,
      adaptiveMax: 18,
      served: [],
      practicePassed: true,
      result: historicalResult(
        { id: alexeySeniorTestId, specialization: 'backend', declaredGrade: 'senior', finishedAt: seniorFinished },
        'failed',
        null,
        null,
        0.62,
        [],
        new Date(new Date(seniorFinished).getTime() + 30 * DAY).toISOString(),
        null,
      ),
    },
    {
      id: alexeyMiddleTestId,
      candidateId: DEMO_CANDIDATE_FSP_ID,
      specialization: 'backend',
      declaredGrade: 'middle',
      status: 'finished',
      startedAt: new Date(new Date(alexeyGradeAt).getTime() - 40 * 60 * 1000).toISOString(),
      deadlineAt: alexeyGradeAt,
      finishedAt: alexeyGradeAt,
      timeLimitSec: 2400,
      vacancyId: null,
      seed: 12,
      adaptiveMin: 10,
      adaptiveMax: 18,
      served: [],
      practicePassed: true,
      result: historicalResult(
        { id: alexeyMiddleTestId, specialization: 'backend', declaredGrade: 'middle', finishedAt: alexeyGradeAt },
        'passed',
        'middle',
        82,
        0.84,
        alexeySkills,
        new Date(new Date(alexeyGradeAt).getTime() + 30 * DAY).toISOString(),
        new Date(new Date(alexeyGradeAt).getTime() + 90 * DAY).toISOString(),
      ),
    },
    {
      id: mariaTestId,
      candidateId: DEMO_CANDIDATE_NO_FSP_ID,
      specialization: 'frontend',
      declaredGrade: 'junior',
      status: 'finished',
      startedAt: ago(14, 1),
      deadlineAt: ago(14),
      finishedAt: ago(14),
      timeLimitSec: 2400,
      vacancyId: null,
      seed: 13,
      adaptiveMin: 10,
      adaptiveMax: 18,
      served: [],
      practicePassed: true,
      result: historicalResult(
        { id: mariaTestId, specialization: 'frontend', declaredGrade: 'junior', finishedAt: ago(14) },
        'passed',
        'junior',
        64,
        -0.85,
        candidates[1]?.skills ?? [],
        ahead(16),
        ahead(76),
      ),
    },
  ]
  const gradeHistory: GradeHistoryRec[] = [
    { id: rand.uuid(), candidateId: DEMO_CANDIDATE_FSP_ID, specialization: 'backend', grade: 'middle', previous_grade: null, changed_at: alexeyGradeAt, test_id: alexeyMiddleTestId, reason: 'test_lower' },
    { id: rand.uuid(), candidateId: DEMO_CANDIDATE_NO_FSP_ID, specialization: 'frontend', grade: 'junior', previous_grade: null, changed_at: ago(14), test_id: mariaTestId, reason: 'test_passed' },
  ]

  // ───────────── Вакансии ─────────────
  const vac = (company: CompanyRec, title: string, specialization: Specialization, grade: Grade, must: string[], nice: string[], workFormat: WorkFormat, city: string | null, from: number, to: number, publishedDaysAgo: number | null, description: string): VacancyRec => ({
    id: rand.uuid(),
    companyId: company.id,
    title,
    description,
    specialization,
    grade,
    mustSkills: must,
    niceSkills: nice,
    workFormat,
    city,
    salary: { from, to },
    status: publishedDaysAgo === null ? 'draft' : 'published',
    publishedAt: publishedDaysAgo === null ? null : ago(publishedDaysAgo),
    createdAt: ago((publishedDaysAgo ?? 3) + 2),
  })
  const vacancies: VacancyRec[] = [
    vac(cSever, 'Middle Go-разработчик (платёжный шлюз)', 'backend', 'middle', ['go', 'postgresql', 'kafka'], ['kubernetes', 'grpc'], 'hybrid', 'Москва', 250_000, 320_000, 10,
      'Развиваем шлюз эквайринга: 3 000 RPS в пике, требования к идемпотентности и аудиту. Стек: Go, PostgreSQL, Kafka, Kubernetes. Команда из 6 человек, код-ревью, дежурства раз в 6 недель.'),
    vac(cSever, 'Senior Python-разработчик (антифрод)', 'backend', 'senior', ['python', 'postgresql', 'kafka'], ['ml', 'clickhouse'], 'remote', null, 330_000, 420_000, 6,
      'Сервис оценки риска транзакций в реальном времени: FastAPI, Kafka, ClickHouse, модели от ML-команды. Нужен опыт проектирования высоконагруженных систем.'),
    vac(cSever, 'Frontend-разработчик (личный кабинет мерчанта)', 'frontend', 'middle', ['react', 'typescript'], ['nextjs', 'a11y'], 'hybrid', 'Москва', 220_000, 280_000, 14,
      'Личный кабинет для 40 000 мерчантов: отчёты, выплаты, настройки. React, TypeScript, TanStack Query, дизайн-система.'),
    vac(cSever, 'QA-автоматизатор (платёжные API)', 'qa', 'middle', ['python', 'api_testing'], ['load_testing'], 'remote', null, 170_000, 220_000, null,
      'Автотесты платёжных API на pytest, контрактные тесты, нагрузка перед релизами.'),
    vac(cVolga, 'Python-разработчик в сервис доставки', 'backend', 'middle', ['python', 'postgresql'], ['redis', 'rabbitmq'], 'hybrid', 'Казань', 240_000, 300_000, 9,
      'Сервис планирования доставки для 120 гипермаркетов: маршруты, слоты, курьеры. Python, FastAPI, PostgreSQL, RabbitMQ.'),
    vac(cVolga, 'Mobile-разработчик (Flutter)', 'mobile', 'middle', ['flutter'], ['rest'], 'hybrid', 'Казань', 210_000, 270_000, 20,
      'Приложение программы лояльности: 2 млн пользователей, офлайн-режим, push.'),
    vac(cTele, 'DevOps-инженер (Kubernetes)', 'devops', 'senior', ['kubernetes', 'terraform', 'ci_cd'], ['prometheus', 'helm'], 'remote', null, 320_000, 400_000, 4,
      'Платформа для 300 микросервисов биллинга: Kubernetes, GitLab CI, Terraform, наблюдаемость.'),
    vac(cPixel, 'Backend-разработчик игровых сервисов (Go)', 'backend', 'middle', ['go', 'redis'], ['postgresql', 'grpc'], 'office', 'Новосибирск', 230_000, 290_000, 12,
      'Матчмейкинг, лидерборды и внутриигровые покупки для мобильных игр.'),
    vac(cMed, 'Data Scientist (медицинские изображения)', 'data_ml', 'middle', ['python', 'pytorch', 'ml'], ['sql'], 'remote', null, 250_000, 330_000, 7,
      'Модели сегментации КТ и МРТ, работа с врачами-разметчиками, валидация на клинических данных.'),
    vac(cRegion, 'Системный аналитик (региональные госуслуги)', 'analyst', 'middle', ['requirements', 'bpmn', 'openapi_spec'], ['sql'], 'hybrid', 'Екатеринбург', 170_000, 220_000, 16,
      'Проектирование сервисов записи к врачу и подачи заявлений, интеграции со СМЭВ.'),
    vac(cZnanie, 'Junior Frontend-разработчик', 'frontend', 'junior', ['react', 'javascript'], ['typescript'], 'remote', null, 100_000, 140_000, 3,
      'Тренажёры и интерактивные уроки для платформы курсов. Наставник и код-ревью с первого дня.'),
    vac(cUral, 'Java-разработчик (MES)', 'backend', 'senior', ['java', 'spring', 'postgresql'], ['kafka'], 'office', 'Екатеринбург', 280_000, 350_000, 25,
      'Система управления производством для 4 заводов: учёт операций, интеграция с датчиками.'),
  ]
  const [vSeverGo, , vSeverFront, , vVolgaPy, , , , , , vZnanieJunior] = vacancies as VacancyRec[]

  // ───────────── Инвайты ─────────────
  const invitations: InvitationRec[] = []
  const reveals: MockDb['reveals'] = []
  const event = (at: string, status: InvitationStatus, actor: InvitationEvent['actor'], note: string | null = null): InvitationEvent => ({ id: rand.uuid(), at, status, actor, note })

  const invite = (opts: {
    company: CompanyRec
    candidateId: string
    title: string
    description: string
    salary: [number, number]
    workFormat: WorkFormat
    city: string | null
    contactPerson: string
    contact: InvitationRec['contact']
    sentDaysAgo: number
    sentHoursAgo?: number
    responseDays?: number
    flow: InvitationStatus[]
    response?: InvitationRec['response']
    vacancyId?: string | null
  }): InvitationRec => {
    const sentAtDate = new Date(now.getTime() - opts.sentDaysAgo * DAY - (opts.sentHoursAgo ?? 0) * HOUR)
    const sentAt = sentAtDate.toISOString()
    const expiresAt = new Date(sentAtDate.getTime() + (opts.responseDays ?? 7) * DAY).toISOString()
    const events: InvitationEvent[] = [event(sentAt, 'sent', 'employer')]
    let viewedAt: string | null = null
    let t = sentAtDate.getTime()
    for (const status of opts.flow) {
      t += Math.min(DAY, Math.max(HOUR, (now.getTime() - t) / 3))
      const at = status === 'expired' ? expiresAt : new Date(Math.min(t, now.getTime() - HOUR)).toISOString()
      if (status === 'viewed') viewedAt = at
      const actor: InvitationEvent['actor'] =
        status === 'expired' ? 'system' : ['viewed', 'accepted', 'declined', 'postponed'].includes(status) ? 'candidate' : 'employer'
      events.push(event(at, status, actor))
    }
    const rec: InvitationRec = {
      id: rand.uuid(),
      companyId: opts.company.id,
      candidateId: opts.candidateId,
      status: opts.flow[opts.flow.length - 1] ?? 'sent',
      title: opts.title,
      description: opts.description,
      salary: { from: opts.salary[0], to: opts.salary[1] },
      workFormat: opts.workFormat,
      city: opts.city,
      contactPerson: opts.contactPerson,
      contact: opts.contact,
      vacancyId: opts.vacancyId ?? null,
      source: { type: 'search', id: null },
      createdAt: sentAt,
      sentAt,
      viewedAt,
      expiresAt,
      response: opts.response ?? null,
      postponedOnce: opts.flow.includes('postponed'),
      events,
    }
    if (rec.response) rec.response.responded_at = events.find((e) => ['accepted', 'declined', 'postponed'].includes(e.status))?.at ?? sentAt
    invitations.push(rec)
    if (opts.flow.includes('accepted')) {
      reveals.push({ companyId: rec.companyId, candidateId: rec.candidateId, reason: 'invitation_accepted', sourceId: rec.id, at: rec.response?.responded_at ?? sentAt })
    }
    return rec
  }

  // Входящие Алексея — от разных компаний, все статусы
  invite({
    company: cZnanie, candidateId: DEMO_CANDIDATE_FSP_ID, title: 'Backend-разработчик платформы курсов (Go)',
    description: 'Переписываем проверку домашних заданий на Go: очередь решений, песочница, отчёты для преподавателей. 40 000 решений в день, команда из 5 человек, полностью удалённо.',
    salary: [270_000, 330_000], workFormat: 'remote', city: null, contactPerson: 'Ольга Лебедева, техлид платформы', contact: { channel: 'telegram', value: '@olga_lebedeva_tl' },
    sentDaysAgo: 0, sentHoursAgo: 5, flow: [],
  })
  invite({
    company: cVolga, candidateId: DEMO_CANDIDATE_FSP_ID, title: 'Middle Python/Go-разработчик в сервис доставки',
    description: 'Сервис слотов доставки: пиковые нагрузки по пятницам, интеграция с 1С и курьерскими партнёрами. Гибрид в Казани, офис у метро Козья слобода.',
    salary: [260_000, 310_000], workFormat: 'hybrid', city: 'Казань', contactPerson: 'Тимур Галиев, руководитель разработки', contact: { channel: 'email', value: 'galiev@volgaretail.example' },
    sentDaysAgo: 2, flow: ['viewed'], vacancyId: vVolgaPy?.id ?? null,
  })
  invite({
    company: cRegion, candidateId: DEMO_CANDIDATE_FSP_ID, title: 'Go-разработчик сервиса записи к врачу',
    description: 'Региональный сервис записи к врачу для 4 млн жителей: интеграции с МИС, нагрузка в 8 утра, высокие требования к надёжности.',
    salary: [230_000, 270_000], workFormat: 'hybrid', city: 'Екатеринбург', contactPerson: 'Павел Орлов, HR', contact: { channel: 'phone', value: '+7 343 200-11-22' },
    sentDaysAgo: 3, flow: ['viewed', 'postponed'],
    response: { decision: 'postponed', reason: null, comment: 'Вернусь после релиза на текущей работе', channel: null, call_slot: null, postponed_until: ahead(3).slice(0, 10), responded_at: '' },
  })
  invite({
    company: cTele, candidateId: DEMO_CANDIDATE_FSP_ID, title: 'Backend-разработчик биллинга (Go)',
    description: 'Биллинг для 12 млн абонентов: тарификация, списания, перерасчёты. Go, PostgreSQL, Kafka. Удалённо по России.',
    salary: [280_000, 340_000], workFormat: 'remote', city: null, contactPerson: 'Анна Белова, рекрутер', contact: { channel: 'email', value: 'belova@telemost.example' },
    sentDaysAgo: 12, flow: ['viewed', 'accepted', 'interview'],
    response: { decision: 'accepted', reason: null, comment: null, channel: 'telegram', call_slot: ahead(2, 4), postponed_until: null, responded_at: '' },
  })
  invite({
    company: cPixel, candidateId: DEMO_CANDIDATE_FSP_ID, title: 'Backend-разработчик игровых сервисов',
    description: 'Матчмейкинг и лидерборды для мобильных игр. Только офис в Новосибирске, помогаем с переездом.',
    salary: [240_000, 290_000], workFormat: 'office', city: 'Новосибирск', contactPerson: 'Денис Козлов, CTO', contact: { channel: 'email', value: 'kozlov@pixelplay.example' },
    sentDaysAgo: 20, flow: ['viewed', 'declined'],
    response: { decision: 'declined', reason: 'format', comment: 'Рассматриваю только гибрид или удалёнку', channel: null, call_slot: null, postponed_until: null, responded_at: '' },
  })
  invite({
    company: cMed, candidateId: DEMO_CANDIDATE_FSP_ID, title: 'Python-разработчик (медкарты)',
    description: 'Электронные медкарты для частных клиник: интеграции с лабораториями, FHIR, PostgreSQL.',
    salary: [220_000, 260_000], workFormat: 'remote', city: null, contactPerson: 'Елена Фролова, HR', contact: { channel: 'email', value: 'frolova@meddata.example' },
    sentDaysAgo: 26, flow: ['expired'],
  })

  // Входящий Марии
  invite({
    company: cZnanie, candidateId: DEMO_CANDIDATE_NO_FSP_ID, title: 'Junior Frontend-разработчик (тренажёры)',
    description: 'Интерактивные тренажёры по программированию на React. Наставник, план развития на полгода, полностью удалённо.',
    salary: [110_000, 140_000], workFormat: 'remote', city: null, contactPerson: 'Ольга Лебедева, техлид платформы', contact: { channel: 'telegram', value: '@olga_lebedeva_tl' },
    sentDaysAgo: 1, flow: [], vacancyId: vZnanieJunior?.id ?? null,
  })

  // Исходящие «Северного кода» — воронка и причины отказов
  const severContact = { channel: 'email' as const, value: 'hr@severcode.ru' }
  const severPerson = 'Ирина Волкова, руководитель подбора'
  const severFlows: { flow: InvitationStatus[]; days: number; response?: InvitationRec['response']; salary: [number, number]; title: string }[] = [
    { flow: [], days: 1, salary: [260_000, 320_000], title: 'Middle Go-разработчик (платёжный шлюз)' },
    { flow: ['viewed'], days: 2, salary: [250_000, 320_000], title: 'Middle Go-разработчик (платёжный шлюз)' },
    { flow: [], days: 3, salary: [330_000, 400_000], title: 'Senior Python-разработчик (антифрод)' },
    { flow: ['viewed', 'accepted'], days: 5, salary: [260_000, 320_000], title: 'Middle Go-разработчик (платёжный шлюз)', response: { decision: 'accepted', reason: null, comment: null, channel: 'email', call_slot: null, postponed_until: null, responded_at: '' } },
    { flow: ['viewed', 'accepted', 'interview', 'offer'], days: 16, salary: [280_000, 330_000], title: 'Middle Go-разработчик (платёжный шлюз)', response: { decision: 'accepted', reason: null, comment: null, channel: 'phone', call_slot: null, postponed_until: null, responded_at: '' } },
    { flow: ['viewed', 'accepted', 'interview', 'offer', 'hired'], days: 40, salary: [300_000, 360_000], title: 'Senior Go-разработчик', response: { decision: 'accepted', reason: null, comment: null, channel: 'telegram', call_slot: null, postponed_until: null, responded_at: '' } },
    { flow: ['viewed', 'declined'], days: 9, salary: [200_000, 240_000], title: 'Middle Go-разработчик (платёжный шлюз)', response: { decision: 'declined', reason: 'salary', comment: 'Ожидаю от 280 тысяч', channel: null, call_slot: null, postponed_until: null, responded_at: '' } },
    { flow: ['viewed', 'declined'], days: 14, salary: [250_000, 300_000], title: 'Middle Go-разработчик (платёжный шлюз)', response: { decision: 'declined', reason: 'salary', comment: null, channel: null, call_slot: null, postponed_until: null, responded_at: '' } },
    { flow: ['viewed', 'declined'], days: 18, salary: [260_000, 320_000], title: 'Senior Python-разработчик (антифрод)', response: { decision: 'declined', reason: 'stack', comment: 'Не хочу уходить с Java', channel: null, call_slot: null, postponed_until: null, responded_at: '' } },
    { flow: ['declined'], days: 22, salary: [270_000, 330_000], title: 'Middle Go-разработчик (платёжный шлюз)', response: { decision: 'declined', reason: 'company', comment: null, channel: null, call_slot: null, postponed_until: null, responded_at: '' } },
    { flow: ['expired'], days: 30, salary: [240_000, 300_000], title: 'Middle Go-разработчик (платёжный шлюз)' },
    { flow: ['withdrawn'], days: 4, salary: [250_000, 310_000], title: 'Middle Go-разработчик (платёжный шлюз)' },
    { flow: ['viewed', 'postponed'], days: 2, salary: [270_000, 320_000], title: 'Middle Go-разработчик (платёжный шлюз)', response: { decision: 'postponed', reason: null, comment: null, channel: null, call_slot: null, postponed_until: ahead(4).slice(0, 10), responded_at: '' } },
  ]
  severFlows.forEach((f, idx) => {
    const cand = backendPool[idx % backendPool.length] as CandidateRec
    invite({
      company: cSever,
      candidateId: cand.id,
      title: f.title,
      description:
        'Развиваем шлюз эквайринга «Северного кода»: идемпотентные платежи, outbox, аудит операций. Стек Go, PostgreSQL, Kafka, Kubernetes. Команда из 6 инженеров, ревью и дежурства раз в 6 недель.',
      salary: f.salary,
      workFormat: 'hybrid',
      city: 'Москва',
      contactPerson: severPerson,
      contact: severContact,
      sentDaysAgo: f.days,
      flow: f.flow,
      response: f.response ? { ...f.response } : undefined,
      vacancyId: vSeverGo?.id ?? null,
    })
  })

  // ───────────── Отклики ─────────────
  const applications: ApplicationRec[] = []
  const apply = (vacancy: VacancyRec | undefined, candidateId: string, daysAgo: number, statuses: ApplicationRec['status'][], coverLetter: string | null = null) => {
    if (!vacancy) return
    const createdAt = ago(daysAgo)
    const events: ApplicationRec['events'] = [{ at: createdAt, status: 'submitted', actor: 'candidate', note: null }]
    let t = new Date(createdAt).getTime()
    for (const s of statuses) {
      t += DAY
      events.push({ at: new Date(Math.min(t, now.getTime() - HOUR)).toISOString(), status: s, actor: 'employer', note: null })
    }
    const app: ApplicationRec = {
      id: rand.uuid(),
      vacancyId: vacancy.id,
      candidateId,
      status: statuses[statuses.length - 1] ?? 'submitted',
      coverLetter,
      createdAt,
      updatedAt: events[events.length - 1]?.at ?? createdAt,
      events,
    }
    applications.push(app)
    reveals.push({ companyId: vacancy.companyId, candidateId, reason: 'application', sourceId: app.id, at: createdAt })
  }
  apply(vVolgaPy, DEMO_CANDIDATE_FSP_ID, 6, ['viewed'], 'Добрый день! Делал похожий сервис слотов в «РитейлСофт», готов рассказать про опыт с пиковыми нагрузками.')
  apply(vZnanieJunior, DEMO_CANDIDATE_NO_FSP_ID, 2, [])
  const frontPool = synthetic.filter((c) => c.standing?.specialization === 'frontend')
  ;[[], ['viewed'], ['viewed', 'interview'], ['viewed', 'rejected']].forEach((flow, idx) => {
    const cand = backendPool[(idx + 6) % backendPool.length]
    if (cand) apply(vSeverGo, cand.id, 3 + idx * 2, flow as ApplicationRec['status'][])
  })
  ;[[], ['viewed']].forEach((flow, idx) => {
    const cand = frontPool[idx]
    if (cand) apply(vSeverFront, cand.id, 2 + idx, flow as ApplicationRec['status'][])
  })

  // ───────────── Регулярные задания ─────────────
  const tasks: TaskRec[] = [
    {
      id: rand.uuid(),
      companyId: cSever.id,
      title: 'Идемпотентный обработчик платежа',
      description:
        'Напишите обработчик `handle_payment(event, storage)`: событие может прийти повторно, сумма должна списаться ровно один раз. `storage` — словарь, имитирующий таблицу с уникальным ключом. Опишите в комментарии, как поведёт себя решение при параллельных вызовах.',
      kind: 'code',
      specializations: ['backend'],
      grades: ['middle', 'senior'],
      timeLimitMin: 25,
      language: 'python',
      starterCode: 'def handle_payment(event, storage):\n    """event = {"id": str, "amount": int}"""\n    ...\n',
      rubric: [
        { criterion: 'Повтор события не приводит к двойному списанию', weight: 0.4 },
        { criterion: 'Учтены параллельные вызовы', weight: 0.3 },
        { criterion: 'Читаемость и обработка ошибок', weight: 0.2 },
        { criterion: 'Есть проверки или тесты', weight: 0.1 },
      ],
      status: 'active',
      publishedAt: ago(6),
      deadlineAt: ahead(10),
    },
    {
      id: rand.uuid(),
      companyId: cTele.id,
      title: 'Ревью: утечка горутин в обработчике',
      description:
        'Перед вами фрагмент HTTP-обработчика на Go. Найдите проблемы (утечки, гонки, обработка контекста) и предложите исправления. Ответ — список замечаний как в код-ревью.',
      kind: 'review',
      specializations: ['backend'],
      grades: ['middle', 'senior'],
      timeLimitMin: 20,
      language: 'go',
      starterCode:
        'func handler(w http.ResponseWriter, r *http.Request) {\n    results := make(chan string)\n    for _, id := range ids(r) {\n        go func() {\n            results <- fetch(id)\n        }()\n    }\n    first := <-results\n    fmt.Fprint(w, first)\n}\n',
      rubric: [
        { criterion: 'Найдена утечка горутин из-за небуферизованного канала', weight: 0.5 },
        { criterion: 'Учтён контекст запроса и отмена', weight: 0.3 },
        { criterion: 'Ясность формулировок', weight: 0.2 },
      ],
      status: 'active',
      publishedAt: ago(2),
      deadlineAt: ahead(9),
    },
    {
      id: rand.uuid(),
      companyId: cZnanie.id,
      title: 'Предложи подход: кеш расписания занятий',
      description: 'Расписание читают 50 000 учеников в минуту перед началом занятий, меняют преподаватели. Предложите схему кеширования и инвалидации.',
      kind: 'approach',
      specializations: ['backend'],
      grades: ['middle', 'senior'],
      timeLimitMin: 15,
      language: null,
      starterCode: null,
      rubric: [
        { criterion: 'Корректная инвалидация', weight: 0.5 },
        { criterion: 'Учтены пики нагрузки', weight: 0.3 },
        { criterion: 'Аргументация', weight: 0.2 },
      ],
      status: 'closed',
      publishedAt: ago(30),
      deadlineAt: ago(16),
    },
    {
      id: rand.uuid(),
      companyId: cVolga.id,
      title: 'Мини-код: форматирование цены',
      description: 'Напишите `formatPrice(kopecks)` → строку вида «1 299,90 ₽» с неразрывными пробелами между разрядами.',
      kind: 'code',
      specializations: ['frontend'],
      grades: ['junior', 'middle'],
      timeLimitMin: 15,
      language: 'javascript',
      starterCode: 'function formatPrice(kopecks) {\n  // ваш код\n}\n',
      rubric: [
        { criterion: 'Верный формат, разряды и копейки', weight: 0.6 },
        { criterion: 'Граничные случаи (0, отрицательные)', weight: 0.4 },
      ],
      status: 'active',
      publishedAt: ago(3),
      deadlineAt: ahead(11),
    },
  ]
  const [tSever, tTele, tZnanie, tVolga] = tasks as [TaskRec, TaskRec, TaskRec, TaskRec]
  const assignments: AssignmentRec[] = [
    { taskId: tTele.id, candidateId: DEMO_CANDIDATE_FSP_ID, status: 'assigned', assignedAt: ago(2), dueAt: ahead(5) },
    { taskId: tZnanie.id, candidateId: DEMO_CANDIDATE_FSP_ID, status: 'reviewed', assignedAt: ago(29), dueAt: ago(16) },
    { taskId: tVolga.id, candidateId: DEMO_CANDIDATE_NO_FSP_ID, status: 'assigned', assignedAt: ago(3), dueAt: ahead(4) },
  ]
  const submissions: SubmissionRec[] = [
    {
      id: rand.uuid(),
      taskId: tZnanie.id,
      candidateId: DEMO_CANDIDATE_FSP_ID,
      submittedAt: ago(18),
      answerText:
        'Кеш в Redis по ключу schedule:{group}:{date} с TTL 10 минут. Инвалидация по событию изменения расписания из outbox. Перед началом занятий — прогрев популярных групп. Защита от thundering herd: single-flight на ключ.',
      code: null,
      language: null,
      status: 'scored',
      llmScore: 81,
      finalScore: 84,
      freshSignal: true,
      feedback: 'Хорошая схема, single-flight — отличная идея.',
    },
  ]
  const subPool = backendPool.slice(2, 6)
  const subScores: [number, number | null][] = [[88, 86], [74, 72], [78, null], [64, null]]
  subPool.forEach((cand, idx) => {
    const [llm, final] = subScores[idx] ?? [70, null]
    assignments.push({ taskId: tSever.id, candidateId: cand.id, status: final === null ? 'submitted' : 'reviewed', assignedAt: ago(6), dueAt: ahead(4) })
    submissions.push({
      id: rand.uuid(),
      taskId: tSever.id,
      candidateId: cand.id,
      submittedAt: ago(5 - idx),
      answerText: idx % 2 === 0 ? 'Проверяю ключ через setdefault — операция атомарна в рамках словаря; для БД — уникальный индекс и INSERT ... ON CONFLICT DO NOTHING.' : null,
      code:
        'def handle_payment(event, storage):\n    key = event["id"]\n    if key in storage:\n        return storage[key]\n    storage[key] = {"amount": event["amount"], "status": "charged"}\n    return storage[key]\n',
      language: 'python',
      status: final === null ? 'pending' : 'scored',
      llmScore: llm,
      finalScore: final,
      freshSignal: final !== null && final >= 80,
      feedback: final !== null ? (final >= 80 ? 'Отлично учтены повторы и гонки.' : 'Нет защиты от параллельных вызовов.') : null,
    })
  })

  // ───────────── Потребность и подборка «Северного кода» ─────────────
  const needId = rand.uuid()
  const needSalary = { from: 250_000, to: 320_000 }
  const needs: NeedRec[] = [
    {
      id: needId,
      companyId: cSever.id,
      raw_text:
        'Ищем бэкенд-разработчика уровня middle на Go в платёжный сервис: PostgreSQL обязательно, желательно Kafka и k8s. Гибрид в Москве или удалёнка, 250–320 тысяч на руки.',
      parsed: {
        specialization: 'backend',
        grade: 'middle',
        must_skills: [skillRef('go'), skillRef('postgresql')],
        nice_skills: [skillRef('kafka'), skillRef('kubernetes')],
        work_formats: ['hybrid', 'remote'],
        city: 'Москва',
        industry: 'fintech',
        salary: needSalary,
        unrecognized: [],
      },
      confirmed: {
        specialization: 'backend',
        grade: 'middle',
        must_skills: [skillRef('go'), skillRef('postgresql')],
        nice_skills: [skillRef('kafka'), skillRef('kubernetes')],
        work_formats: ['hybrid', 'remote'],
        city: 'Москва',
        industry: 'fintech',
        salary: needSalary,
      },
      created_at: ago(4),
      updated_at: ago(4),
    },
  ]
  const baseFilters: SearchFilters = {
    specialization: 'backend',
    grades: ['middle'],
    must_skills: ['go', 'postgresql'],
    nice_skills: ['kafka', 'kubernetes'],
    work_formats: ['hybrid', 'remote'],
    city: 'Москва',
    include_relocation: true,
    industries: ['fintech'],
    salary: needSalary,
    fsp_only: false,
    fsp_level_min: null,
    availability: ['active', 'open'],
  }
  const shortlistCands = backendPool.slice(0, 2)
  const searches: SearchRec[] = [
    {
      id: rand.uuid(),
      companyId: cSever.id,
      need_id: needId,
      title: 'Go-разработчик в платёжный сервис',
      created_at: ago(4),
      updated_at: ago(3),
      current_version: 2,
      versions: [
        { version: 1, created_at: ago(4), label: 'Исходная потребность', filters: baseFilters, results_total: 0 },
        { version: 2, created_at: ago(3), label: '+ Senior', filters: { ...baseFilters, grades: ['middle', 'senior'] }, results_total: 0 },
      ],
      shortlist: shortlistCands.map((c, idx) => ({
        candidate_id: c.id,
        alias: '',
        category: c.standing ? { specialization: c.standing.specialization, grade: c.standing.grade, label: categoryLabel(c.standing.specialization, c.standing.grade) } : null,
        added_at: ago(4 - idx),
        added_in_version: 1,
      })),
    },
  ]

  return {
    version: DB_VERSION,
    seededAt: now.toISOString(),
    users,
    candidates,
    companies,
    surveys,
    tests,
    gradeHistory,
    needs,
    searches,
    invitations,
    vacancies,
    applications,
    tasks,
    assignments,
    submissions,
    reveals,
    prechecks: [],
  }
}
