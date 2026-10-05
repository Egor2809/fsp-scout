import type {
  ApplicationStatus,
  Availability,
  CodeLanguage,
  ConsentType,
  ContactChannel,
  DeclineReason,
  FspDiscipline,
  FspFormat,
  FspLevel,
  FspResult,
  Grade,
  Industry,
  ItemType,
  SkillLevel,
  SkillSource,
  Specialization,
  TaskAssignmentStatus,
  TaskKind,
  TestBlock,
  TestOutcome,
  VacancyStatus,
  WorkFormat,
} from '@/api/generated/model'

export const SPECIALIZATIONS: readonly Specialization[] = ['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']
export const GRADES: readonly Grade[] = ['junior', 'middle', 'senior', 'lead']
export const WORK_FORMATS: readonly WorkFormat[] = ['office', 'hybrid', 'remote']
export const INDUSTRIES: readonly Industry[] = ['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']
export const AVAILABILITIES: readonly Availability[] = ['active', 'open', 'not_looking']
export const DECLINE_REASONS: readonly DeclineReason[] = ['salary', 'stack', 'format', 'company', 'not_looking', 'other']
export const CONTACT_CHANNELS: readonly ContactChannel[] = ['email', 'phone', 'telegram']
export const FSP_LEVELS: readonly FspLevel[] = ['regional', 'national', 'international']

export const specializationLabel: Record<Specialization, string> = {
  backend: 'Backend',
  frontend: 'Frontend',
  mobile: 'Mobile',
  qa: 'QA',
  devops: 'DevOps/SRE',
  data_ml: 'Data/ML',
  analyst: 'Аналитик',
}

export const gradeLabel: Record<Grade, string> = {
  junior: 'Junior',
  middle: 'Middle',
  senior: 'Senior',
  lead: 'Lead',
}

export const gradeExperience: Record<Grade, string> = {
  junior: 'до 1 года',
  middle: '1–3 года',
  senior: '3–6 лет',
  lead: '6+ лет, тест и кейс',
}

/** «Backend · Middle» */
export function categoryLabel(specialization: Specialization, grade: Grade): string {
  return `${specializationLabel[specialization]} · ${gradeLabel[grade]}`
}

export const workFormatLabel: Record<WorkFormat, string> = {
  office: 'Офис',
  hybrid: 'Гибрид',
  remote: 'Удалёнка',
}

export const industryLabel: Record<Industry, string> = {
  fintech: 'Финтех',
  ecom: 'E-com',
  gov: 'Госсектор',
  telecom: 'Телеком',
  gamedev: 'Геймдев',
  edtech: 'Edtech',
  medtech: 'Медтех',
  manufacturing: 'Промышленность',
  other: 'Другое',
}

export const availabilityLabel: Record<Availability, string> = {
  active: 'Ищу активно',
  open: 'Открыт к предложениям',
  not_looking: 'Не ищу',
}

export const consentLabel: Record<ConsentType, string> = {
  personal_data: 'Обработка персональных данных',
  profile_visibility: 'Показ профиля работодателям',
  fsp_data: 'Получение данных ФСП',
}

export const skillLevelLabel: Record<SkillLevel, string> = {
  basic: 'Базовый',
  confident: 'Уверенный',
  advanced: 'Продвинутый',
}

export const skillSourceLabel: Record<SkillSource, string> = {
  self: 'Заявлен',
  resume: 'Из резюме',
  test: 'Подтверждён тестом',
  fsp: 'Подтверждён ФСП',
  task: 'Подтверждён заданием',
}

export const declineReasonLabel: Record<DeclineReason, string> = {
  salary: 'Вилка',
  stack: 'Стек',
  format: 'Формат работы',
  company: 'Компания',
  not_looking: 'Не ищу работу',
  other: 'Другое',
}

export const contactChannelLabel: Record<ContactChannel, string> = {
  email: 'Email',
  phone: 'Телефон',
  telegram: 'Telegram',
}

export const applicationStatusLabel: Record<ApplicationStatus, string> = {
  submitted: 'Отправлен',
  viewed: 'Просмотрен',
  interview: 'Интервью',
  offer: 'Оффер',
  hired: 'Нанят',
  rejected: 'Отказ',
  withdrawn: 'Отозван',
}

export const vacancyStatusLabel: Record<VacancyStatus, string> = {
  draft: 'Черновик',
  published: 'Опубликована',
  closed: 'Закрыта',
}

export const testOutcomeLabel: Record<TestOutcome, string> = {
  passed: 'Грейд подтверждён',
  passed_confident: 'Подтверждён уверенно',
  failed: 'Не подтверждён',
}

export const testBlockLabel: Record<TestBlock, string> = {
  adaptive: 'Блок A · адаптивный',
  practice: 'Блок B · практика',
  approach: 'Блок C · подход',
}

export const itemTypeLabel: Record<ItemType, string> = {
  single_choice: 'Один вариант',
  multiple_choice: 'Несколько вариантов',
  short_answer: 'Короткий ответ',
  code: 'Код',
  open_text: 'Развёрнутый ответ',
}

export const codeLanguageLabel: Record<CodeLanguage, string> = {
  python: 'Python',
  go: 'Go',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  java: 'Java',
  sql: 'SQL',
  yaml: 'YAML',
  text: 'Текст',
}

export const fspLevelLabel: Record<FspLevel, string> = {
  regional: 'Региональный',
  national: 'Всероссийский',
  international: 'Международный',
}

export const fspDisciplineLabel: Record<FspDiscipline, string> = {
  product: 'Продуктовое программирование',
  algorithmic: 'Алгоритмическое программирование',
  cybersecurity: 'Кибербезопасность',
  robotics: 'Робототехника',
  uas: 'Программирование БАС',
}

export const fspResultLabel: Record<FspResult, string> = {
  winner: 'Победитель',
  prize_winner: 'Призёр',
  finalist: 'Финалист',
  participant: 'Участник',
}

export const fspFormatLabel: Record<FspFormat, string> = {
  individual: 'Личный зачёт',
  team: 'Командный зачёт',
}

export const taskKindLabel: Record<TaskKind, string> = {
  code: 'Мини-код',
  review: 'Ревью фрагмента',
  approach: 'Предложи подход',
}

export const taskAssignmentStatusLabel: Record<TaskAssignmentStatus, string> = {
  assigned: 'Ждёт решения',
  submitted: 'На проверке',
  reviewed: 'Оценено',
  expired: 'Срок истёк',
}

export const companySizeLabel: Record<'1-50' | '51-200' | '201-1000' | '1000+', string> = {
  '1-50': 'до 50 человек',
  '51-200': '51–200 человек',
  '201-1000': '201–1000 человек',
  '1000+': 'больше 1000 человек',
}

/** Рекомендованный грейд по стажу (как в справочнике грейдов). */
export function gradeForExperience(years: number): Grade {
  if (years < 1) return 'junior'
  if (years < 3) return 'middle'
  if (years < 6) return 'senior'
  return 'lead'
}

export function nextGrade(grade: Grade): Grade | null {
  const i = GRADES.indexOf(grade)
  return GRADES[i + 1] ?? null
}

export function prevGrade(grade: Grade): Grade | null {
  const i = GRADES.indexOf(grade)
  return i > 0 ? (GRADES[i - 1] ?? null) : null
}
