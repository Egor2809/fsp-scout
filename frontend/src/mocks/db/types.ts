import type {
  ApplicationEvent,
  ApplicationStatus,
  Availability,
  CandidateSkill,
  CodeLanguage,
  Company,
  Consent,
  ContactChannel,
  FspAchievement,
  Grade,
  GradeHistoryEntry,
  Industry,
  InvitationContact,
  InvitationEvent,
  InvitationResponse,
  InvitationSource,
  InvitationStatus,
  Need,
  RubricCriterion,
  SalaryRange,
  Search,
  Specialization,
  Survey,
  TaskAssignmentStatus,
  TaskKind,
  TestBlock,
  TestResult,
  TestStatus,
  VacancyStatus,
  WorkFormat,
  Role,
} from '@/api/generated/model'

/** Внутренние записи мок-«сервера». Наружу отдаются только через src/mocks/lib/views.ts. */

export interface UserRec {
  id: string
  role: Role
  email: string
  displayName: string
  candidateId: string | null
  companyId: string | null
  createdAt: string
}

export interface ExperienceRec {
  role: string
  companyName: string | null
  industry: Industry | null
  start: string
  end: string | null
  description: string | null
}

export interface StandingRec {
  specialization: Specialization
  grade: Grade
  percentile: number
  confirmedAt: string
  testId: string
}

export interface CandidateRec {
  id: string
  userId: string
  fullName: string
  email: string
  phone: string | null
  telegram: string | null
  preferredChannel: ContactChannel
  city: string | null
  relocation: boolean
  about: string | null
  specialization: Specialization | null
  standing: StandingRec | null
  theta: number | null
  se: number | null
  experienceYears: number
  experience: ExperienceRec[]
  skills: CandidateSkill[]
  industries: Industry[]
  workFormats: WorkFormat[]
  salaryExpectation: SalaryRange | null
  availability: Availability
  privacy: {
    salaryFloor: number | null
    hiddenCompanyIds: string[]
    showFsp: boolean
    showCompanyNames: boolean
    showCity: boolean
  }
  consents: Consent[]
  fsp: {
    linked: boolean
    fspId: string | null
    verifiedAt: string | null
    achievements: FspAchievement[]
  }
  taskSignal: { fresh: boolean; solvedCount: number; lastSolvedAt: string | null }
  lastActiveAt: string
  gradeChangedAt: string | null
  createdAt: string
  updatedAt: string
}

export type CompanyRec = Company & { quotaBase: number }

export type SurveyRec = Survey & { candidateId: string }

export interface ServedItemRec {
  instanceId: string
  itemId: string
  block: TestBlock
  servedAt: string
  answeredAt: string | null
  correct: boolean | null
  skipped: boolean
  rtMs: number
  pasteCount: number
  focusLostCount: number
  thetaAfter: number | null
  seAfter: number | null
}

export interface TestRec {
  id: string
  candidateId: string
  specialization: Specialization
  declaredGrade: Grade
  status: TestStatus
  startedAt: string
  deadlineAt: string
  finishedAt: string | null
  timeLimitSec: number
  vacancyId: string | null
  seed: number
  adaptiveMin: number
  adaptiveMax: number
  served: ServedItemRec[]
  /** Практика пройдена (null — ещё не сдавали) */
  practicePassed: boolean | null
  result: TestResult | null
}

export type GradeHistoryRec = GradeHistoryEntry & { candidateId: string }

export type NeedRec = Need & { companyId: string }

export type SearchRec = Search & { companyId: string }

export interface InvitationRec {
  id: string
  companyId: string
  candidateId: string
  status: InvitationStatus
  title: string
  description: string
  salary: SalaryRange
  workFormat: WorkFormat
  city: string | null
  contactPerson: string
  contact: InvitationContact
  vacancyId: string | null
  source: InvitationSource
  createdAt: string
  sentAt: string | null
  viewedAt: string | null
  expiresAt: string
  response: InvitationResponse | null
  postponedOnce: boolean
  events: InvitationEvent[]
}

export interface VacancyRec {
  id: string
  companyId: string
  title: string
  description: string
  specialization: Specialization
  grade: Grade
  mustSkills: string[]
  niceSkills: string[]
  workFormat: WorkFormat
  city: string | null
  salary: SalaryRange
  status: VacancyStatus
  publishedAt: string | null
  createdAt: string
}

export interface ApplicationRec {
  id: string
  vacancyId: string
  candidateId: string
  status: ApplicationStatus
  coverLetter: string | null
  createdAt: string
  updatedAt: string
  events: ApplicationEvent[]
}

export interface TaskRec {
  id: string
  companyId: string
  title: string
  description: string
  kind: TaskKind
  specializations: Specialization[]
  grades: Grade[]
  timeLimitMin: number
  language: CodeLanguage | null
  starterCode: string | null
  rubric: RubricCriterion[]
  status: 'active' | 'closed'
  publishedAt: string | null
  deadlineAt: string
}

export interface AssignmentRec {
  taskId: string
  candidateId: string
  status: TaskAssignmentStatus
  assignedAt: string
  dueAt: string
}

export interface SubmissionRec {
  id: string
  taskId: string
  candidateId: string
  submittedAt: string
  answerText: string | null
  code: string | null
  language: CodeLanguage | null
  status: 'pending' | 'scored'
  llmScore: number | null
  finalScore: number | null
  freshSignal: boolean
  feedback: string | null
}

/** Журнал раскрытия контактов (152-ФЗ: каждое раскрытие фиксируется). */
export interface RevealRec {
  companyId: string
  candidateId: string
  reason: 'invitation_accepted' | 'application'
  sourceId: string
  at: string
}

export interface PrecheckLogRec {
  companyId: string
  candidateId: string
  at: string
}

export interface MockDb {
  version: number
  seededAt: string
  users: UserRec[]
  candidates: CandidateRec[]
  companies: CompanyRec[]
  surveys: SurveyRec[]
  tests: TestRec[]
  gradeHistory: GradeHistoryRec[]
  needs: NeedRec[]
  searches: SearchRec[]
  invitations: InvitationRec[]
  vacancies: VacancyRec[]
  applications: ApplicationRec[]
  tasks: TaskRec[]
  assignments: AssignmentRec[]
  submissions: SubmissionRec[]
  reveals: RevealRec[]
  prechecks: PrecheckLogRec[]
}
