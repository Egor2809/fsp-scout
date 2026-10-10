import type {
  Application,
  CandidateCard,
  CandidateDetail,
  CandidateProfile,
  Category,
  CompanyBrief,
  CurrentUser,
  EmployerApplication,
  EmployerTaskSubmission,
  ExperienceItem,
  FspProfile,
  FspSummary,
  Invitation,
  MatchExplanation,
  OnboardingState,
  PrivacySettings,
  RegularTask,
  SearchFilters,
  TaskAssignment,
  TaskSubmission,
  Vacancy,
} from '@/api/generated/model'
import { ACCEPTED_INVITATION_STATUSES } from '@/lib/invitationStatus'
import { categoryLabel } from '@/lib/labels'
import { skillRef } from '../data/taxonomy'
import type {
  ApplicationRec,
  CandidateRec,
  CompanyRec,
  InvitationRec,
  MockDb,
  StandingRec,
  SubmissionRec,
  TaskRec,
  UserRec,
  VacancyRec,
} from '../db/types'
import { computeFspScore, maxLevel, topAchievement } from './fsp'
import { explainMatch, isPublished, profileCompleteness, strengthParts } from './matching'

export function categoryOf(standing: StandingRec | null): Category | null {
  if (!standing) return null
  return { specialization: standing.specialization, grade: standing.grade, label: categoryLabel(standing.specialization, standing.grade) }
}

/** Анонимное имя, стабильное для пары компания–кандидат (FNV-1a). */
export function aliasFor(companyId: string | null, candidateId: string): string {
  let h = 0x811c9dc5
  for (const ch of `${companyId ?? 'preview'}:${candidateId}`) {
    h ^= ch.charCodeAt(0)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return `Кандидат #${(h >>> 16).toString(16).toUpperCase().padStart(4, '0')}`
}

export function companyBrief(c: CompanyRec): CompanyBrief {
  return { id: c.id, name: c.name, industry: c.industry, city: c.city, verified: c.verified }
}

export function findCompany(db: MockDb, id: string): CompanyRec | undefined {
  return db.companies.find((c) => c.id === id)
}

export function revealFor(db: MockDb, companyId: string, candidateId: string) {
  return db.reveals.find((r) => r.companyId === companyId && r.candidateId === candidateId) ?? null
}

function experienceView(c: CandidateRec, anonymous: boolean): ExperienceItem[] {
  return c.experience.map((e) => {
    const hide = anonymous && !c.privacy.showCompanyNames
    return {
      role: e.role,
      company_name: hide ? null : e.companyName,
      company_hidden: hide,
      industry: e.industry,
      start: e.start,
      end: e.end,
      description: e.description,
    }
  })
}

export function fspSummary(c: CandidateRec, now: Date): FspSummary {
  const spec = c.standing?.specialization ?? c.specialization
  const score = computeFspScore(c.fsp.achievements, spec, now)
  return {
    has_history: c.fsp.achievements.length > 0,
    index: score.index,
    bonus: score.bonus,
    achievements_count: c.fsp.achievements.length,
    top_achievement: topAchievement(c.fsp.achievements, spec, now),
    max_level: maxLevel(c.fsp.achievements),
  }
}

/**
 * Карточка для работодателя. companyId = null — предпросмотр для самого кандидата
 * (всегда анонимная, без контактов).
 */
export function candidateCard(db: MockDb, c: CandidateRec, companyId: string | null, now: Date): CandidateCard {
  const reveal = companyId ? revealFor(db, companyId, c.id) : null
  const revealed = Boolean(reveal)
  const invitations = companyId
    ? db.invitations.filter((i) => i.companyId === companyId && i.candidateId === c.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : []
  const companyVacancyIds = new Set(companyId ? db.vacancies.filter((v) => v.companyId === companyId).map((v) => v.id) : [])
  const application = db.applications.find((a) => a.candidateId === c.id && companyVacancyIds.has(a.vacancyId)) ?? null
  const parts = strengthParts(c, now)
  return {
    id: c.id,
    alias: aliasFor(companyId, c.id),
    category: categoryOf(c.standing),
    grade_confirmed: Boolean(c.standing),
    percentile: c.standing?.percentile ?? null,
    strength: parts.total,
    skills: c.skills,
    experience_years: c.experienceYears,
    experience: experienceView(c, !revealed),
    industries: c.industries,
    work_formats: c.workFormats,
    city: c.privacy.showCity || revealed ? c.city : null,
    relocation: c.relocation,
    salary_expectation: c.salaryExpectation,
    availability: c.availability,
    last_active_at: c.lastActiveAt,
    fsp: c.privacy.showFsp ? fspSummary(c, now) : null,
    task_signal: { fresh: c.taskSignal.fresh, solved_count: c.taskSignal.solvedCount, last_solved_at: c.taskSignal.lastSolvedAt },
    disclosure: reveal
      ? { revealed: true, reason: reveal.reason, revealed_at: reveal.at, source_id: reveal.sourceId }
      : { revealed: false, reason: null, revealed_at: null, source_id: null },
    contacts: reveal
      ? { full_name: c.fullName, email: c.email, phone: c.phone, telegram: c.telegram, preferred_channel: c.preferredChannel }
      : null,
    relation: {
      invitation: invitations[0] ? { id: invitations[0].id, status: invitations[0].status } : null,
      application: application ? { id: application.id, status: application.status, vacancy_id: application.vacancyId } : null,
    },
  }
}

export function candidateDetail(
  db: MockDb,
  c: CandidateRec,
  companyId: string,
  now: Date,
  explanation: MatchExplanation | null,
): CandidateDetail {
  return {
    ...candidateCard(db, c, companyId, now),
    explanation,
    achievements: c.privacy.showFsp ? c.fsp.achievements : [],
  }
}

export function onboardingState(db: MockDb, c: CandidateRec): OnboardingState {
  const pd = c.consents.find((x) => x.type === 'personal_data')
  const consentsGiven = Boolean(pd && !pd.revoked_at)
  const surveyDone = db.surveys.some((s) => s.candidateId === c.id)
  const active = db.tests.find((t) => t.candidateId === c.id && t.status === 'in_progress') ?? null
  const gradeConfirmed = Boolean(c.standing)
  let next: OnboardingState['next_step'] = 'done'
  if (!consentsGiven) next = 'consents'
  else if (!surveyDone) next = 'survey'
  else if (active) next = 'test'
  else if (!gradeConfirmed) next = 'grade'
  return {
    consents_given: consentsGiven,
    survey_completed: surveyDone,
    grade_confirmed: gradeConfirmed,
    next_step: next,
    active_test_id: active?.id ?? null,
  }
}

export function currentUser(db: MockDb, user: UserRec): CurrentUser {
  const cand = user.candidateId ? db.candidates.find((c) => c.id === user.candidateId) : undefined
  const company = user.companyId ? findCompany(db, user.companyId) : undefined
  return {
    id: user.id,
    role: user.role,
    email: user.email,
    display_name: user.displayName,
    onboarding: cand ? onboardingState(db, cand) : null,
    company: company ? companyBrief(company) : null,
  }
}

export function profileView(c: CandidateRec): CandidateProfile {
  const pv = c.consents.find((x) => x.type === 'profile_visibility')
  let visibility: CandidateProfile['visibility'] = 'visible'
  if (!c.standing) visibility = 'hidden_no_grade'
  else if (!pv || pv.revoked_at) visibility = 'hidden_no_consent'
  else if (c.availability === 'not_looking') visibility = 'hidden_by_candidate'
  return {
    id: c.id,
    full_name: c.fullName,
    email: c.email,
    phone: c.phone,
    telegram: c.telegram,
    city: c.city,
    relocation: c.relocation,
    about: c.about,
    specialization: c.specialization,
    standing: c.standing
      ? { category: categoryOf(c.standing) as Category, percentile: c.standing.percentile, confirmed_at: c.standing.confirmedAt, test_id: c.standing.testId }
      : null,
    experience_years: c.experienceYears,
    experience: experienceView(c, false),
    skills: c.skills,
    industries: c.industries,
    work_formats: c.workFormats,
    salary_expectation: c.salaryExpectation,
    availability: c.availability,
    completeness: profileCompleteness(c),
    visibility,
    updated_at: c.updatedAt,
  }
}

export function privacyView(db: MockDb, c: CandidateRec): PrivacySettings {
  return {
    availability: c.availability,
    salary_floor: c.privacy.salaryFloor,
    hidden_companies: c.privacy.hiddenCompanyIds
      .map((id) => findCompany(db, id))
      .filter((x): x is CompanyRec => Boolean(x))
      .map(companyBrief),
    show_fsp: c.privacy.showFsp,
    show_company_names: c.privacy.showCompanyNames,
    show_city: c.privacy.showCity,
    profile_published: isPublished(c),
  }
}

export function fspProfileView(c: CandidateRec, now: Date): FspProfile {
  const score = computeFspScore(c.fsp.achievements, c.standing?.specialization ?? c.specialization, now)
  return {
    linked: c.fsp.linked,
    fsp_id: c.fsp.fspId,
    verified_at: c.fsp.verifiedAt,
    has_history: c.fsp.achievements.length > 0,
    index: score.index,
    bonus: score.bonus,
    components: score.components,
    achievements: [...c.fsp.achievements].sort((a, b) => b.date.localeCompare(a.date)),
  }
}

export function invitationView(db: MockDb, inv: InvitationRec, viewer: 'candidate' | 'employer'): Invitation {
  const company = findCompany(db, inv.companyId)
  const cand = db.candidates.find((c) => c.id === inv.candidateId)
  const vacancy = inv.vacancyId ? db.vacancies.find((v) => v.id === inv.vacancyId) : undefined
  const revealed = viewer === 'employer' && ACCEPTED_INVITATION_STATUSES.concat(['closed']).includes(inv.status) && inv.response?.decision === 'accepted'
  return {
    id: inv.id,
    status: inv.status,
    title: inv.title,
    description: inv.description,
    salary: inv.salary,
    work_format: inv.workFormat,
    city: inv.city,
    company: company ? companyBrief(company) : { id: inv.companyId, name: 'Компания', industry: 'other', city: null, verified: false },
    contact_person: inv.contactPerson,
    contact: inv.contact,
    vacancy: vacancy && company ? { id: vacancy.id, title: vacancy.title, company: companyBrief(company) } : null,
    candidate: {
      id: inv.candidateId,
      alias: viewer === 'employer' ? aliasFor(inv.companyId, inv.candidateId) : (cand?.fullName ?? ''),
      category: categoryOf(cand?.standing ?? null),
      percentile: cand?.standing?.percentile ?? null,
    },
    source: inv.source,
    created_at: inv.createdAt,
    sent_at: inv.sentAt,
    viewed_at: inv.viewedAt,
    expires_at: inv.expiresAt,
    response: inv.response,
    candidate_contacts:
      revealed && cand
        ? { full_name: cand.fullName, email: cand.email, phone: cand.phone, telegram: cand.telegram, preferred_channel: inv.response?.channel ?? cand.preferredChannel }
        : null,
    events: [...inv.events].sort((a, b) => a.at.localeCompare(b.at)),
  }
}

export function vacancyFilters(v: VacancyRec): SearchFilters {
  return {
    specialization: v.specialization,
    grades: [v.grade],
    must_skills: v.mustSkills,
    nice_skills: v.niceSkills,
    work_formats: [v.workFormat],
    city: v.city,
    include_relocation: true,
    industries: [],
    salary: v.salary,
    fsp_only: false,
    fsp_level_min: null,
    availability: ['active', 'open'],
  }
}

export function vacancyView(
  db: MockDb,
  v: VacancyRec,
  viewer: { role: 'candidate'; candidate: CandidateRec } | { role: 'employer'; companyId: string },
  now: Date,
): Vacancy {
  const company = findCompany(db, v.companyId)
  const isOwner = viewer.role === 'employer' && viewer.companyId === v.companyId
  const myApp = viewer.role === 'candidate' ? db.applications.find((a) => a.vacancyId === v.id && a.candidateId === viewer.candidate.id) : undefined
  let match: Vacancy['match'] = null
  if (viewer.role === 'candidate' && viewer.candidate.standing) {
    const ex = explainMatch(viewer.candidate, vacancyFilters(v), now)
    match = { score: ex.score, chips: ex.chips }
  }
  return {
    id: v.id,
    company: company ? companyBrief(company) : { id: v.companyId, name: 'Компания', industry: 'other', city: null, verified: false },
    title: v.title,
    description: v.description,
    specialization: v.specialization,
    grade: v.grade,
    must_skills: v.mustSkills.map(skillRef),
    nice_skills: v.niceSkills.map(skillRef),
    work_format: v.workFormat,
    city: v.city,
    salary: v.salary,
    status: v.status,
    published_at: v.publishedAt,
    created_at: v.createdAt,
    applications_count: isOwner ? db.applications.filter((a) => a.vacancyId === v.id && a.status !== 'withdrawn').length : null,
    my_application: myApp ? { id: myApp.id, status: myApp.status } : null,
    match,
  }
}

export function applicationView(db: MockDb, a: ApplicationRec): Application {
  const v = db.vacancies.find((x) => x.id === a.vacancyId)
  const company = v ? findCompany(db, v.companyId) : undefined
  return {
    id: a.id,
    vacancy: {
      id: a.vacancyId,
      title: v?.title ?? 'Вакансия',
      company: company ? companyBrief(company) : { id: '', name: 'Компания', industry: 'other', city: null, verified: false },
    },
    status: a.status,
    cover_letter: a.coverLetter,
    created_at: a.createdAt,
    updated_at: a.updatedAt,
    events: a.events,
  }
}

export function employerApplicationView(db: MockDb, a: ApplicationRec, now: Date): EmployerApplication | null {
  const cand = db.candidates.find((c) => c.id === a.candidateId)
  const v = db.vacancies.find((x) => x.id === a.vacancyId)
  if (!cand || !v) return null
  return {
    ...applicationView(db, a),
    candidate: candidateCard(db, cand, v.companyId, now),
    explanation: explainMatch(cand, vacancyFilters(v), now),
  }
}

export function taskView(db: MockDb, t: TaskRec, forEmployer: boolean): RegularTask {
  const company = findCompany(db, t.companyId)
  return {
    id: t.id,
    company: company ? companyBrief(company) : { id: t.companyId, name: 'Компания', industry: 'other', city: null, verified: false },
    title: t.title,
    description: t.description,
    kind: t.kind,
    specializations: t.specializations,
    grades: t.grades,
    time_limit_min: t.timeLimitMin,
    language: t.language,
    starter_code: t.starterCode,
    rubric: t.rubric,
    status: t.status,
    published_at: t.publishedAt,
    deadline_at: t.deadlineAt,
    assigned_count: forEmployer ? db.assignments.filter((a) => a.taskId === t.id).length : null,
    submissions_count: forEmployer ? db.submissions.filter((s) => s.taskId === t.id).length : null,
  }
}

export function submissionView(s: SubmissionRec): TaskSubmission {
  return {
    id: s.id,
    task_id: s.taskId,
    submitted_at: s.submittedAt,
    answer_text: s.answerText,
    code: s.code,
    language: s.language,
    status: s.status,
    llm_score: s.llmScore,
    final_score: s.finalScore,
    fresh_signal: s.freshSignal,
    feedback: s.feedback,
  }
}

export function employerSubmissionView(db: MockDb, s: SubmissionRec, companyId: string, now: Date): EmployerTaskSubmission | null {
  const cand = db.candidates.find((c) => c.id === s.candidateId)
  if (!cand) return null
  return { ...submissionView(s), candidate: candidateCard(db, cand, companyId, now) }
}

export function assignmentView(db: MockDb, candidateId: string, taskId: string): TaskAssignment | null {
  const a = db.assignments.find((x) => x.taskId === taskId && x.candidateId === candidateId)
  const t = db.tasks.find((x) => x.id === taskId)
  if (!a || !t) return null
  const sub = db.submissions.find((s) => s.taskId === taskId && s.candidateId === candidateId)
  return { task: taskView(db, t, false), status: a.status, assigned_at: a.assignedAt, due_at: a.dueAt, submission: sub ? submissionView(sub) : null }
}
