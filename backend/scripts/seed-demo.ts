import { Prisma, PrismaClient } from '@prisma/client';
import { createHash } from 'node:crypto';
import { CITIES, SKILLS, skillRef } from '../src/common/taxonomy-data.ts';
import { category } from '../src/matching/matching.ts';
import { parseNeed } from '../src/needs/need-parser.ts';
import type { CandidateSkill, ExperienceItem, FspAchievement, FspDiscipline, FspLevel, FspResult, Grade, Industry, SearchFilters, Specialization, WorkFormat } from '../src/contract/model/index.js';

const CONSENT_VERSION = '2026-09';
const PER_CATEGORY = Number(process.env.SEED_PER_CATEGORY ?? 15);
const SPECS: Specialization[] = ['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst'];
const GRADES: Grade[] = ['junior', 'middle', 'senior', 'lead'];
const INDUSTRIES: Industry[] = ['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing'];
const THETA: Record<Grade, [number, number]> = { junior: [-1, 0.45], middle: [0.35, 0.45], senior: [1.3, 0.4], lead: [2, 0.35] };
const YEARS: Record<Grade, [number, number]> = { junior: [0, 1], middle: [1, 3], senior: [3, 6], lead: [6, 12] };
const SALARY: Record<Grade, [number, number]> = { junior: [80000, 140000], middle: [160000, 260000], senior: [280000, 420000], lead: [380000, 550000] };
const SPEC_K: Record<Specialization, number> = { backend: 1.05, frontend: 1, mobile: 1.02, qa: 0.82, devops: 1.08, data_ml: 1.1, analyst: 0.9 };
const MALE = ['Алексей', 'Дмитрий', 'Иван', 'Максим', 'Артём', 'Никита', 'Егор', 'Михаил', 'Кирилл', 'Андрей', 'Илья', 'Роман', 'Павел', 'Сергей', 'Тимур', 'Глеб', 'Даниил', 'Олег', 'Вадим', 'Степан'];
const FEMALE = ['Мария', 'Анна', 'Екатерина', 'Дарья', 'Ольга', 'Полина', 'Алина', 'Виктория', 'Ксения', 'Софья', 'Елена', 'Юлия', 'Наталья', 'Вера', 'Алиса'];
const SURNAMES = ['Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Петров', 'Соколов', 'Михайлов', 'Новиков', 'Фёдоров', 'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семёнов', 'Егоров', 'Павлов', 'Козлов', 'Степанов', 'Николаев', 'Орлов', 'Андреев', 'Макаров', 'Никитин', 'Захаров', 'Зайцев', 'Соловьёв', 'Борисов', 'Яковлев', 'Григорьев', 'Романов'];
const ROLES: Record<Specialization, string[]> = {
  backend: ['Backend-разработчик', 'Python-разработчик', 'Go-разработчик', 'Java-разработчик'],
  frontend: ['Frontend-разработчик', 'React-разработчик', 'Веб-разработчик'],
  mobile: ['iOS-разработчик', 'Android-разработчик', 'Flutter-разработчик'],
  qa: ['QA-инженер', 'Инженер по автотестам', 'Тестировщик'],
  devops: ['DevOps-инженер', 'SRE-инженер', 'Инженер платформы'],
  data_ml: ['ML-инженер', 'Data Scientist', 'Инженер данных'],
  analyst: ['Системный аналитик', 'Бизнес-аналитик', 'Продуктовый аналитик'],
};
const EMPLOYERS = ['Сбер', 'Т-Банк', 'Яндекс', 'VK', 'Ozon', 'Wildberries', 'МТС', 'Ростелеком', 'Авито', 'Лаборатория Касперского', 'Positive Technologies', '2ГИС', 'СКБ Контур', 'Selectel', 'HeadHunter'];
const ABOUT: Record<Specialization, string> = {
  backend: 'Проектирую API и сервисы под нагрузкой, люблю чистые схемы данных.',
  frontend: 'Делаю быстрые и доступные интерфейсы, слежу за производительностью.',
  mobile: 'Разрабатываю нативные мобильные приложения, публиковал в сторах.',
  qa: 'Строю автотесты и процессы качества, от API до UI.',
  devops: 'Автоматизирую инфраструктуру, CI/CD и наблюдаемость.',
  data_ml: 'Довожу модели до продакшена и считаю метрики честно.',
  analyst: 'Собираю требования, описываю интеграции и процессы.',
};
const CORE: Record<Specialization, string[]> = {
  backend: ['python', 'go', 'java', 'postgresql', 'docker', 'kafka', 'redis'], frontend: ['typescript', 'react', 'javascript', 'vue'], mobile: ['kotlin', 'swift', 'flutter'],
  qa: ['python', 'api_testing', 'test_design', 'sql'], devops: ['docker', 'kubernetes', 'linux', 'ci_cd', 'terraform'], data_ml: ['python', 'sql', 'pandas', 'ml', 'pytorch'],
  analyst: ['sql', 'requirements', 'bpmn', 'openapi_spec'],
};
const DISCIPLINE: Record<Specialization, FspDiscipline[]> = {
  backend: ['product', 'algorithmic'], frontend: ['product'], mobile: ['product', 'robotics'], qa: ['product'],
  devops: ['cybersecurity', 'product'], data_ml: ['algorithmic', 'uas'], analyst: ['product'],
};
const DISCIPLINE_TITLE: Record<FspDiscipline, string> = {
  product: 'продуктовое программирование', algorithmic: 'алгоритмическое программирование', cybersecurity: 'программирование систем информационной безопасности',
  robotics: 'программирование робототехники', uas: 'программирование БАС',
};
const LEVEL_TITLE: Record<FspLevel, string> = { regional: 'Региональный этап', national: 'Всероссийский этап', international: 'Международные соревнования' };

const EMPLOYER_COMPANY = { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', name: 'Северный код', industry: 'fintech', city: 'Москва',
  description: 'Финтех-платформа для малого бизнеса: платежи, кредитование, аналитика.', details: { website: 'https://severcode.example', size: '201-1000', inn: '7700000000' } };
const EXTRA_COMPANIES = [
  { key: 'medline', name: 'МедЛайн Цифра', industry: 'medtech', city: 'Санкт-Петербург', description: 'Цифровые сервисы для клиник и лабораторий.' },
  { key: 'gorod', name: 'Город Онлайн', industry: 'gov', city: 'Казань', description: 'Городские цифровые сервисы и порталы госуслуг.' },
  { key: 'pixel', name: 'Пиксель Геймс', industry: 'gamedev', city: 'Новосибирск', description: 'Мобильные и браузерные игры.' },
];
const EMPLOYERS_IN_REALM = [
  { subject: '22222222-2222-4222-8222-000000000001', email: 'employer@demo.ru', name: 'Демо Работодатель', company: EMPLOYER_COMPANY },
  ...[1, 2, 3, 4, 5].map(n => ({ subject: `22222222-2222-4222-8222-00000000010${n}`, email: `jury${n}-employer@demo.ru`, name: `Жюри ${n} Работодатель`,
    company: { id: uuid(`company:jury${n}`), name: `Компания проверяющего ${n}`, industry: 'fintech', city: 'Москва',
      description: 'Учебная компания для проверки сценария работодателя.', details: { size: '51-200' } } })),
];

function uuid(key: string): string {
  const h = createHash('sha256').update(`scout-demo:${key}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-${'89ab'[parseInt(h[16]!, 16) % 4]}${h.slice(17, 20)}-${h.slice(20, 32)}`;
}
function random(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1));
  const pick = <T>(list: readonly T[]): T => list[Math.floor(next() * list.length)]!;
  const sample = <T>(list: readonly T[], n: number): T[] => [...list].sort(() => next() - 0.5).slice(0, n);
  const normal = (mean: number, sd: number) => mean + sd * Math.sqrt(-2 * Math.log(1 - next())) * Math.cos(2 * Math.PI * next());
  return { next, int, pick, sample, normal, chance: (p: number) => next() < p };
}
type Rand = ReturnType<typeof random>;
const month = (d: Date) => d.toISOString().slice(0, 7);
const round10k = (v: number) => Math.round(v / 10000) * 10000;
const DAY = 86400000;
function translit(text: string): string {
  const map: Record<string, string> = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ы: 'y', э: 'e', ю: 'yu', я: 'ya', ь: '', ъ: '' };
  return [...text.toLowerCase()].map(ch => map[ch] ?? ch).join('');
}
function skills(rand: Rand, spec: Specialization, grade: Grade): CandidateSkill[] {
  const pool = SKILLS.filter(s => s.specializations.includes(spec));
  const core = rand.sample(pool.filter(s => CORE[spec].includes(s.id)), rand.int(2, 3));
  const chosen = [...core, ...rand.sample(pool.filter(s => !core.includes(s)), rand.int(2, 5))];
  const verifiedCount = rand.int(1, Math.min(4, chosen.length));
  return chosen.map((s, i) => {
    if (i < verifiedCount) {
      const score = Math.min(99, rand.int(55, 90) + GRADES.indexOf(grade) * 3);
      return { skill_id: s.id, name: s.name, level: score >= 85 ? 'advanced' : score >= 70 ? 'confident' : 'basic', source: 'test', verified: true, score };
    }
    return { skill_id: s.id, name: s.name, level: rand.pick(['basic', 'confident', 'confident', 'advanced'] as const), source: rand.chance(0.5) ? 'self' : 'resume', verified: false, score: null };
  });
}
function experience(rand: Rand, spec: Specialization, years: number, industries: Industry[], now: Date): ExperienceItem[] {
  const items: ExperienceItem[] = [];
  let remaining = Math.max(4, Math.round(years * 12)), end: Date | null = null;
  const count = Math.min(3, Math.max(1, Math.ceil(years / 2.5)));
  for (let i = 0; i < count && remaining > 0; i++) {
    const months = i === count - 1 ? remaining : Math.max(4, Math.round(remaining / (count - i)) + rand.int(-3, 3));
    const until: Date = end ?? now;
    const start = new Date(Date.UTC(until.getUTCFullYear(), until.getUTCMonth() - months, 1));
    items.push({ role: rand.pick(ROLES[spec]), company_name: rand.pick(EMPLOYERS), company_hidden: false, industry: rand.pick(industries),
      start: month(start), end: end ? month(end) : null, description: null });
    remaining -= months;
    end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - 1, 1));
  }
  return items;
}
function achievements(rand: Rand, spec: Specialization, city: string, now: Date): FspAchievement[] {
  return Array.from({ length: rand.int(1, 3) }, () => {
    const level = rand.pick<FspLevel>(['regional', 'regional', 'national', 'national', 'international']);
    const result = rand.pick<FspResult>(['winner', 'prize_winner', 'finalist', 'finalist', 'participant']);
    const discipline = rand.pick(DISCIPLINE[spec]);
    const date = new Date(now.getTime() - rand.int(2, 40) * 30 * DAY);
    const participants = level === 'regional' ? rand.int(40, 160) : level === 'national' ? rand.int(300, 1400) : rand.int(800, 2600);
    const place = result === 'winner' ? 1 : result === 'prize_winner' ? rand.int(2, 3) : result === 'finalist' ? rand.int(4, 25) : rand.int(26, Math.floor(participants * 0.6));
    const team = rand.chance(0.7) ? rand.pick(['404 Not Found', 'Байтовый поток', 'Сеньоры из будущего', 'NullPointer', 'Ctrl+Alt+Win']) : null;
    return { id: uuid(`fsp:${rand.next()}`), event_id: `fsp-${date.getUTCFullYear()}-${discipline}-${level}-${rand.int(100, 999)}`,
      title: `${LEVEL_TITLE[level]} ФСП по направлению «${DISCIPLINE_TITLE[discipline]}»${level === 'regional' ? `, ${city}` : ''}`,
      date: date.toISOString().slice(0, 10), level, discipline, format: team ? 'team' : 'individual', team, role: team ? rand.pick(['Капитан', 'Разработчик', 'Аналитик']) : null,
      place, participants_total: participants, percentile: Math.max(1, Math.min(99, Math.round((1 - place / participants) * 100))), result,
      sport_rank: level === 'national' && result !== 'participant' ? rand.pick(['КМС', 'I разряд']) : level === 'international' ? 'МС' : null,
      certificate_url: null, verified: true };
  });
}

const db = new PrismaClient();

async function employers() {
  for (const e of EMPLOYERS_IN_REALM) {
    await db.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${e.subject}, 0))`;
      const user = await tx.user.upsert({ where: { subject: e.subject }, create: { subject: e.subject, email: e.email, displayName: e.name, role: 'employer' }, update: {} });
      const { id, details, ...company } = e.company;
      await tx.company.upsert({ where: { id }, create: { id, ...company, verified: true, details: { contact_email: e.email, ...details } }, update: {} });
      await tx.membership.upsert({ where: { userId_companyId: { userId: user.id, companyId: id } }, create: { userId: user.id, companyId: id }, update: {} });
    });
  }
  for (const c of EXTRA_COMPANIES) {
    const id = uuid(`company:${c.key}`);
    await db.company.upsert({ where: { id }, create: { id, name: c.name, industry: c.industry, city: c.city, description: c.description, verified: true, details: { size: '51-200' } }, update: {} });
  }
}

async function candidates(now: Date) {
  let created = 0;
  for (const spec of SPECS) for (const grade of GRADES) for (let i = 0; i < PER_CATEGORY; i++) {
    const key = `${spec}:${grade}:${i}`, subject = `demo-seed:${key}`;
    if (await db.user.findUnique({ where: { subject } })) continue;
    const rand = random(parseInt(createHash('sha256').update(key).digest('hex').slice(0, 8), 16));
    const female = rand.chance(0.35);
    const first = rand.pick(female ? FEMALE : MALE), surname = rand.pick(SURNAMES), last = female ? `${surname}а` : surname;
    const fullName = `${first} ${last}`;
    const email = `${translit(first)}.${translit(last)}.${i + 1}@candidate.demo`.replace(/[^a-z0-9.@-]/g, '');
    const city = rand.next() < 0.4 ? 'Москва' : rand.pick(CITIES);
    const industries = rand.sample(INDUSTRIES, rand.int(1, 3));
    const years = Math.round((YEARS[grade][0] + rand.next() * (YEARS[grade][1] - YEARS[grade][0])) * 10) / 10;
    const [lo, hi] = SALARY[grade];
    const from = round10k((lo + rand.next() * (hi - lo)) * SPEC_K[spec]);
    const formats = rand.pick<WorkFormat[]>([['remote'], ['hybrid'], ['office'], ['remote', 'hybrid'], ['office', 'hybrid'], ['remote', 'hybrid', 'office']]);
    const withFsp = rand.chance(0.25);
    const confirmedAt = new Date(now.getTime() - rand.int(3, 120) * DAY);
    const testId = uuid(`test:${key}`), candidateId = uuid(`candidate:${key}`);
    const theta = Math.round(rand.normal(...THETA[grade]) * 100) / 100;
    const solved = rand.chance(0.3) ? rand.int(1, 4) : 0;
    const lastSolved = solved ? new Date(now.getTime() - rand.int(1, 20) * DAY).toISOString() : null;
    const profile = {
      full_name: fullName, phone: `+7 9${rand.int(10, 99)} ${rand.int(100, 999)}-${rand.int(10, 99)}-${rand.int(10, 99)}`,
      telegram: rand.chance(0.7) ? `@${translit(first)}_${translit(last)}${i + 1}`.replace(/[^a-z0-9_@]/g, '') : null,
      city, relocation: rand.chance(0.3), about: ABOUT[spec], experience_years: years,
      experience: experience(rand, spec, years, industries, now), skills: skills(rand, spec, grade), industries, work_formats: formats,
      salary_expectation: { from, to: Math.max(round10k(from * (1.12 + rand.next() * 0.15)), from + 20000) },
      availability: rand.chance(0.7) ? 'active' : 'open',
      standing: { category: category(spec, grade), percentile: rand.int(5, 97), confirmed_at: confirmedAt.toISOString(), test_id: testId },
      fsp_achievements: withFsp ? achievements(rand, spec, city, now) : [],
      ...(solved ? { task_signal: { fresh: true, solved_count: solved, last_solved_at: lastSolved } } : {}),
    };
    const consents = ['personal_data', 'profile_visibility', ...(withFsp ? ['fsp_data'] : [])].map(type => ({ type, version: CONSENT_VERSION, givenAt: confirmedAt }));
    await db.$transaction(async tx => {
      await tx.user.create({ data: { subject, email, displayName: fullName, role: 'candidate', createdAt: new Date(confirmedAt.getTime() - 2 * DAY),
        candidate: { create: { id: candidateId, surveyCompleted: true, specialization: spec, confirmedSpecialization: spec, grade, theta, standardError: Math.round((0.25 + rand.next() * 0.15) * 100) / 100,
          gradeChangedAt: confirmedAt, salaryFloor: from, profile: profile as unknown as Prisma.InputJsonObject, privacy: {},
          lastActiveAt: new Date(now.getTime() - rand.int(0, 14) * DAY), consents: { create: consents } } } } });
      await tx.testSession.create({ data: { id: testId, candidateId, specialization: spec, declaredGrade: grade, status: 'finished', seed: rand.int(1, 2 ** 30),
        startedAt: new Date(confirmedAt.getTime() - 50 * 60000), deadlineAt: new Date(confirmedAt.getTime() + 40 * 60000), finishedAt: confirmedAt, bankVersion: 'demo-seed' } });
      await tx.gradeHistory.create({ data: { candidateId, specialization: spec, grade, testId, changedAt: confirmedAt, reason: 'test_passed' } });
      if (withFsp) {
        const fspId = `FSP-77-${String(SPECS.indexOf(spec) * 10000 + GRADES.indexOf(grade) * 1000 + i).padStart(6, '0')}`;
        await tx.fspParticipant.upsert({ where: { id: fspId }, create: { id: fspId, ownerSubject: subject, achievements: profile.fsp_achievements as unknown as Prisma.InputJsonArray }, update: {} });
        await tx.fspLink.create({ data: { candidateId, fspId, verifiedAt: confirmedAt } });
      }
    });
    created++;
  }
  return created;
}

const NEEDS = [
  { text: 'Нужен middle backend-разработчик на Python, PostgreSQL и Docker, желательно Kafka. Удалёнка или гибрид, Москва, финтех.',
    confirmed: { specialization: 'backend', grade: 'middle', must_skills: ['python'], nice_skills: ['postgresql', 'kafka', 'docker'], work_formats: ['remote', 'hybrid'], city: null, industry: 'fintech', salary: { from: 200000, to: 300000 } } },
  { text: 'Ищем senior frontend на React и TypeScript в продуктовую команду, гибрид в Москве.',
    confirmed: { specialization: 'frontend', grade: 'senior', must_skills: ['react'], nice_skills: ['typescript'], work_formats: ['hybrid', 'remote'], city: null, industry: 'fintech', salary: { from: 300000, to: 420000 } } },
] as const;
const VACANCIES = [
  { company: EMPLOYER_COMPANY.id, title: 'Python-разработчик в платёжный шлюз', specialization: 'backend', grade: 'middle', must: ['python', 'postgresql'], nice: ['kafka'], format: 'hybrid', city: 'Москва', salary: [220000, 300000] },
  { company: EMPLOYER_COMPANY.id, title: 'Frontend-разработчик личного кабинета', specialization: 'frontend', grade: 'junior', must: ['react'], nice: ['typescript'], format: 'remote', city: null, salary: [110000, 150000] },
  { company: 'medline', title: 'QA-инженер (автотесты API)', specialization: 'qa', grade: 'middle', must: [], nice: [], format: 'remote', city: null, salary: [150000, 210000] },
  { company: 'gorod', title: 'Системный аналитик госуслуг', specialization: 'analyst', grade: 'senior', must: [], nice: [], format: 'office', city: 'Казань', salary: [220000, 300000] },
  { company: 'pixel', title: 'Mobile-разработчик (Flutter)', specialization: 'mobile', grade: 'middle', must: [], nice: [], format: 'remote', city: null, salary: [180000, 260000] },
  { company: 'medline', title: 'DevOps-инженер медицинской платформы', specialization: 'devops', grade: 'senior', must: [], nice: [], format: 'hybrid', city: 'Санкт-Петербург', salary: [300000, 400000] },
  { company: 'gorod', title: 'ML-инженер для анализа обращений', specialization: 'data_ml', grade: 'middle', must: [], nice: [], format: 'hybrid', city: 'Казань', salary: [200000, 280000] },
] as const;

async function employerContent(now: Date) {
  for (const [i, n] of NEEDS.entries()) {
    const id = uuid(`need:${i}`);
    const confirmed = { ...n.confirmed, must_skills: n.confirmed.must_skills.map(skillRef), nice_skills: n.confirmed.nice_skills.map(skillRef) };
    await db.need.upsert({ where: { id }, update: {}, create: { id, companyId: EMPLOYER_COMPANY.id, rawText: n.text,
      parsed: JSON.parse(JSON.stringify(parseNeed(n.text))) as Prisma.InputJsonObject, confirmed: confirmed as unknown as Prisma.InputJsonObject } });
    const filters: SearchFilters = { specialization: n.confirmed.specialization, grades: [n.confirmed.grade], must_skills: [...n.confirmed.must_skills], nice_skills: [...n.confirmed.nice_skills],
      work_formats: [...n.confirmed.work_formats], city: n.confirmed.city, include_relocation: true, industries: [n.confirmed.industry], salary: n.confirmed.salary,
      fsp_only: false, fsp_level_min: null, availability: ['active', 'open'] };
    const searchId = uuid(`search:${i}`);
    if (!await db.search.findUnique({ where: { id: searchId } })) await db.search.create({ data: { id: searchId, companyId: EMPLOYER_COMPANY.id, needId: id,
      title: `${category(filters.specialization, filters.grades[0]!).label}: ${confirmed.must_skills.map(s => s.name).join(', ')}`,
      versions: { create: { version: 1, label: 'Исходная потребность', filters: filters as unknown as Prisma.InputJsonObject } } } });
  }
  for (const [i, v] of VACANCIES.entries()) {
    const id = uuid(`vacancy:${i}`);
    const companyId = v.company === EMPLOYER_COMPANY.id ? v.company : uuid(`company:${v.company}`);
    const pool = SKILLS.filter(s => s.specializations.includes(v.specialization)).map(s => s.id);
    const must = v.must.length ? [...v.must] : pool.slice(0, 2), nice = v.nice.length ? [...v.nice] : pool.slice(2, 4);
    await db.vacancy.upsert({ where: { id }, update: {}, create: { id, companyId, title: v.title, specialization: v.specialization, grade: v.grade,
      description: `${v.title}. Команда из 5–8 человек, код-ревью, понятный онбординг. Отбор по подтверждённой категории «Скаута».`,
      mustSkills: must, niceSkills: nice.filter(s => !must.includes(s)), workFormat: v.format, city: v.city, salaryFrom: v.salary[0], salaryTo: v.salary[1],
      status: 'published', publishedAt: new Date(now.getTime() - (i + 1) * DAY) } });
  }
}

try {
  const now = new Date();
  await employers();
  const created = await candidates(now);
  await employerContent(now);
  console.log(JSON.stringify({ seeded_candidates: created, total_candidates: await db.candidate.count(), companies: await db.company.count() }));
} finally { await db.$disconnect(); }
