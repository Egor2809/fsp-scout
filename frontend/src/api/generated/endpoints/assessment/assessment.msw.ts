/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import {
  faker
} from '@faker-js/faker/locale/ru';

import {
  HttpResponse,
  http
} from 'msw';
import type {
  RequestHandlerOptions
} from 'msw';

import {
  CodeLanguage,
  EligibilityReason,
  Grade,
  Industry,
  ItemType,
  SkillLevel,
  SkillSource,
  Specialization,
  TestBlock,
  TestOutcome,
  TestStatus,
  WorkFormat
} from '../../model';
import type {
  AnswerAck,
  Category,
  CodeRunResult,
  CodeSnippet,
  GradeHistoryEntry,
  ItemFamily,
  ItemFamilyBrief,
  Survey,
  TestEligibility,
  TestItem,
  TestResult,
  TestSession,
  TestSessionSummary,
  TestStep
} from '../../model';


export const getCreateSurveyResponseMock = (): Survey => ({...{industries: faker.helpers.arrayElements(Object.values(Industry)), specialization: faker.helpers.arrayElement(Object.values(Specialization)), primary_stack: ["python","go","postgresql","kafka"], experience_years: faker.number.float({min: 0, max: 50, fractionDigits: 2}), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 100}}), null]), relocation: faker.datatype.boolean(), salary_expectation: {"from":250000,"to":320000}},...{id: faker.string.uuid(), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z'},})

export const getListMySurveysResponseMock = (): Survey[] => (Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({...{industries: faker.helpers.arrayElements(Object.values(Industry)), specialization: faker.helpers.arrayElement(Object.values(Specialization)), primary_stack: ["python","go","postgresql","kafka"], experience_years: faker.number.float({min: 0, max: 50, fractionDigits: 2}), work_formats: faker.helpers.arrayElements(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 100}}), null]), relocation: faker.datatype.boolean(), salary_expectation: {"from":250000,"to":320000}},...{id: faker.string.uuid(), created_at: faker.date.past().toISOString().slice(0, 19) + 'Z'},})))

export const getGetMyTestEligibilityResponseMock = (overrideResponse: Partial<Extract<TestEligibility, object>> = {}): TestEligibility => ({specialization: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Specialization)),null,]), current_grade: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Grade)),null,]), last_grade_change_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), next_grade_change_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), active_test_id: faker.helpers.arrayElement([faker.string.uuid(), null]), grades: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({grade: faker.helpers.arrayElement(Object.values(Grade)), can_start: faker.datatype.boolean(), reason: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(EligibilityReason)),null,]), available_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), recommended: faker.datatype.boolean()})), ...overrideResponse})

export const getStartTestResponseMock = (overrideResponse: Partial<Extract<TestSession, object>> = {}): TestSession => ({id: faker.string.uuid(), specialization: faker.helpers.arrayElement(Object.values(Specialization)), declared_grade: faker.helpers.arrayElement(Object.values(Grade)), status: faker.helpers.arrayElement(Object.values(TestStatus)), started_at: faker.date.past().toISOString().slice(0, 19) + 'Z', deadline_at: faker.date.past().toISOString().slice(0, 19) + 'Z', finished_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), time_limit_sec: 2400, progress: {block: faker.helpers.arrayElement(Object.values(TestBlock)), answered: faker.number.int({min: 0}), adaptive_answered: faker.number.int({min: 0}), adaptive_min: 10, adaptive_max: 18, practice_answered: faker.number.int({min: 0}), practice_total: faker.number.int({min: 0})}, vacancy_id: faker.helpers.arrayElement([faker.string.uuid(), null]), ...overrideResponse})

export const getListMyTestsResponseMock = (): TestSessionSummary[] => (Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), specialization: faker.helpers.arrayElement(Object.values(Specialization)), declared_grade: faker.helpers.arrayElement(Object.values(Grade)), status: faker.helpers.arrayElement(Object.values(TestStatus)), outcome: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(TestOutcome)),null,]), assigned_grade: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Grade)),null,]), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), started_at: faker.date.past().toISOString().slice(0, 19) + 'Z', finished_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null])})))

export const getGetTestResponseMock = (overrideResponse: Partial<Extract<TestSession, object>> = {}): TestSession => ({id: faker.string.uuid(), specialization: faker.helpers.arrayElement(Object.values(Specialization)), declared_grade: faker.helpers.arrayElement(Object.values(Grade)), status: faker.helpers.arrayElement(Object.values(TestStatus)), started_at: faker.date.past().toISOString().slice(0, 19) + 'Z', deadline_at: faker.date.past().toISOString().slice(0, 19) + 'Z', finished_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), time_limit_sec: 2400, progress: {block: faker.helpers.arrayElement(Object.values(TestBlock)), answered: faker.number.int({min: 0}), adaptive_answered: faker.number.int({min: 0}), adaptive_min: 10, adaptive_max: 18, practice_answered: faker.number.int({min: 0}), practice_total: faker.number.int({min: 0})}, vacancy_id: faker.helpers.arrayElement([faker.string.uuid(), null]), ...overrideResponse})

export const getGetNextTestItemResponseCodeSnippetMock = (overrideResponse: Partial<CodeSnippet> = {}): CodeSnippet => ({...{language: faker.helpers.arrayElement(Object.values(CodeLanguage)), source: faker.string.alpha({length: {min: 10, max: 20}})}, ...overrideResponse});

export const getGetNextTestItemResponseTestItemMock = (overrideResponse: Partial<TestItem> = {}): TestItem => ({...{instance_id: faker.string.uuid(), index: faker.number.int({min: 1}), block: faker.helpers.arrayElement(Object.values(TestBlock)), type: faker.helpers.arrayElement(Object.values(ItemType)), competency: {id: faker.string.alpha({length: {min: 10, max: 20}}), name: "Базы данных"}, difficulty_level: faker.number.int({min: 1, max: 5}), title: "Что выведет программа?", prompt: faker.string.alpha({length: {min: 10, max: 20}}), code: faker.helpers.arrayElement([{...getGetNextTestItemResponseCodeSnippetMock()},null,]), options: faker.helpers.arrayElement([Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.alpha({length: {min: 10, max: 20}}), text: faker.string.alpha({length: {min: 10, max: 20}})})),null,]), answer_language: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(CodeLanguage)),null,]), starter_code: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), max_length: faker.helpers.arrayElement([faker.number.int(), null]), public_tests: faker.helpers.arrayElement([Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({name: faker.string.alpha({length: {min: 10, max: 20}}), input: faker.string.alpha({length: {min: 10, max: 20}}), expected: faker.string.alpha({length: {min: 10, max: 20}})})),null,])}, ...overrideResponse});

export const getGetNextTestItemResponseMock = (overrideResponse: Partial<Extract<TestStep, object>> = {}): TestStep => ({status: faker.helpers.arrayElement(['item','ready_to_finish'] as const), item: faker.helpers.arrayElement([{...getGetNextTestItemResponseTestItemMock()},null,]), progress: {block: faker.helpers.arrayElement(Object.values(TestBlock)), answered: faker.number.int({min: 0}), adaptive_answered: faker.number.int({min: 0}), adaptive_min: 10, adaptive_max: 18, practice_answered: faker.number.int({min: 0}), practice_total: faker.number.int({min: 0})}, deadline_at: faker.date.past().toISOString().slice(0, 19) + 'Z', ...overrideResponse})

export const getSubmitTestAnswerResponseMock = (overrideResponse: Partial<Extract<AnswerAck, object>> = {}): AnswerAck => ({accepted: faker.datatype.boolean(), progress: {block: faker.helpers.arrayElement(Object.values(TestBlock)), answered: faker.number.int({min: 0}), adaptive_answered: faker.number.int({min: 0}), adaptive_min: 10, adaptive_max: 18, practice_answered: faker.number.int({min: 0}), practice_total: faker.number.int({min: 0})}, ...overrideResponse})

export const getRunTestCodeResponseMock = (overrideResponse: Partial<Extract<CodeRunResult, object>> = {}): CodeRunResult => ({status: faker.helpers.arrayElement(['ok','compile_error','runtime_error','timeout'] as const), passed: faker.number.int({min: 0}), total: faker.number.int({min: 0}), duration_ms: faker.number.int({min: 0}), cases: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({name: faker.string.alpha({length: {min: 10, max: 20}}), passed: faker.datatype.boolean(), actual: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), stderr: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null])})), ...overrideResponse})

export const getFinishTestResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getFinishTestResponseMock = (overrideResponse: Partial<Extract<TestResult, object>> = {}): TestResult => ({test_id: faker.string.uuid(), specialization: faker.helpers.arrayElement(Object.values(Specialization)), declared_grade: faker.helpers.arrayElement(Object.values(Grade)), outcome: faker.helpers.arrayElement(Object.values(TestOutcome)), assigned_grade: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Grade)),null,]), category: faker.helpers.arrayElement([{...getFinishTestResponseCategoryMock()},null,]), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), theta: 0.84, se: 0.31, confidence: faker.helpers.arrayElement(['high','medium','low'] as const), confirmed_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({skill_id: "postgresql", name: "PostgreSQL", level: faker.helpers.arrayElement(Object.values(SkillLevel)), source: faker.helpers.arrayElement(Object.values(SkillSource)), verified: faker.datatype.boolean(), score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null])})), competencies: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({competency_id: faker.string.alpha({length: {min: 10, max: 20}}), name: faker.string.alpha({length: {min: 10, max: 20}}), score: faker.number.int({min: 0, max: 100}), items: faker.number.int({min: 0})})), suggestion: {action: faker.helpers.arrayElement(['try_higher','try_lower','none'] as const), grade: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Grade)),null,]), available_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), message: "Вы уверенно прошли Middle. Можно попробовать тест на Senior."}, flags: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({code: faker.helpers.arrayElement(['fast_correct','paste','focus_loss'] as const), severity: faker.helpers.arrayElement(['info','warning'] as const), message: faker.string.alpha({length: {min: 10, max: 20}})})), items_answered: faker.number.int(), duration_sec: faker.number.int(), finished_at: faker.date.past().toISOString().slice(0, 19) + 'Z', next_retake_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), next_grade_change_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), trace: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({index: faker.number.int(), difficulty_level: faker.number.int({min: 1, max: 5}), correct: faker.datatype.boolean(), theta: faker.number.float({fractionDigits: 2}), se: faker.number.float({fractionDigits: 2})})), ...overrideResponse})

export const getGetTestResultResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getGetTestResultResponseMock = (overrideResponse: Partial<Extract<TestResult, object>> = {}): TestResult => ({test_id: faker.string.uuid(), specialization: faker.helpers.arrayElement(Object.values(Specialization)), declared_grade: faker.helpers.arrayElement(Object.values(Grade)), outcome: faker.helpers.arrayElement(Object.values(TestOutcome)), assigned_grade: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Grade)),null,]), category: faker.helpers.arrayElement([{...getGetTestResultResponseCategoryMock()},null,]), percentile: faker.helpers.arrayElement([faker.number.int({min: 1, max: 99}), null]), theta: 0.84, se: 0.31, confidence: faker.helpers.arrayElement(['high','medium','low'] as const), confirmed_skills: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({skill_id: "postgresql", name: "PostgreSQL", level: faker.helpers.arrayElement(Object.values(SkillLevel)), source: faker.helpers.arrayElement(Object.values(SkillSource)), verified: faker.datatype.boolean(), score: faker.helpers.arrayElement([faker.number.int({min: 0, max: 100}), null])})), competencies: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({competency_id: faker.string.alpha({length: {min: 10, max: 20}}), name: faker.string.alpha({length: {min: 10, max: 20}}), score: faker.number.int({min: 0, max: 100}), items: faker.number.int({min: 0})})), suggestion: {action: faker.helpers.arrayElement(['try_higher','try_lower','none'] as const), grade: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Grade)),null,]), available_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), message: "Вы уверенно прошли Middle. Можно попробовать тест на Senior."}, flags: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({code: faker.helpers.arrayElement(['fast_correct','paste','focus_loss'] as const), severity: faker.helpers.arrayElement(['info','warning'] as const), message: faker.string.alpha({length: {min: 10, max: 20}})})), items_answered: faker.number.int(), duration_sec: faker.number.int(), finished_at: faker.date.past().toISOString().slice(0, 19) + 'Z', next_retake_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), next_grade_change_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), trace: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({index: faker.number.int(), difficulty_level: faker.number.int({min: 1, max: 5}), correct: faker.datatype.boolean(), theta: faker.number.float({fractionDigits: 2}), se: faker.number.float({fractionDigits: 2})})), ...overrideResponse})

export const getGetMyGradeHistoryResponseMock = (): GradeHistoryEntry[] => (Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), previous_grade: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(Grade)),null,]), changed_at: faker.date.past().toISOString().slice(0, 19) + 'Z', test_id: faker.helpers.arrayElement([faker.string.uuid(), null]), reason: faker.helpers.arrayElement(['test_passed','test_lower','admin'] as const)})))

export const getListShowcaseFamiliesResponseMock = (): ItemFamilyBrief[] => (Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: "sql-window-top-n", title: "Топ-N в группе на оконных функциях", specialization: faker.helpers.arrayElement(Object.values(Specialization)), competency: "Базы данных", type: faker.helpers.arrayElement(Object.values(ItemType)), a: 1.42, b: 0.35})))

export const getGetShowcaseFamilyResponseCodeSnippetMock = (overrideResponse: Partial<CodeSnippet> = {}): CodeSnippet => ({...{language: faker.helpers.arrayElement(Object.values(CodeLanguage)), source: faker.string.alpha({length: {min: 10, max: 20}})}, ...overrideResponse});

export const getGetShowcaseFamilyResponseMock = (): ItemFamily => ({...{id: "sql-window-top-n", title: "Топ-N в группе на оконных функциях", specialization: faker.helpers.arrayElement(Object.values(Specialization)), competency: "Базы данных", type: faker.helpers.arrayElement(Object.values(ItemType)), a: 1.42, b: 0.35},...{description: faker.string.alpha({length: {min: 10, max: 20}}), template: faker.string.alpha({length: {min: 10, max: 20}}), params: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({name: "n", description: "Сколько строк взять в группе", domain: "2..5"})), instances: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({seed: faker.number.int(), params: {}, title: faker.string.alpha({length: {min: 10, max: 20}}), prompt: faker.string.alpha({length: {min: 10, max: 20}}), code: faker.helpers.arrayElement([{...getGetShowcaseFamilyResponseCodeSnippetMock()},null,]), options: faker.helpers.arrayElement([Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.alpha({length: {min: 10, max: 20}}), text: faker.string.alpha({length: {min: 10, max: 20}})})),null,]), correct_answer: faker.string.alpha({length: {min: 10, max: 20}})})), exposure_rate: faker.number.float({min: 0, max: 1, fractionDigits: 2}), calibration_n: faker.number.int()},})


export const getCreateSurveyMockHandler = (overrideResponse?: Survey | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<Survey> | Survey), options?: RequestHandlerOptions) => {
  return http.post('*/surveys', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getCreateSurveyResponseMock(),
      { status: 201
      })
  }, options)
}

export const getListMySurveysMockHandler = (overrideResponse?: Survey[] | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<Survey[]> | Survey[]), options?: RequestHandlerOptions) => {
  return http.get('*/me/surveys', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getListMySurveysResponseMock(),
      { status: 200
      })
  }, options)
}

export const getGetMyTestEligibilityMockHandler = (overrideResponse?: TestEligibility | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<TestEligibility> | TestEligibility), options?: RequestHandlerOptions) => {
  return http.get('*/me/test-eligibility', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetMyTestEligibilityResponseMock(),
      { status: 200
      })
  }, options)
}

export const getStartTestMockHandler = (overrideResponse?: TestSession | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<TestSession> | TestSession), options?: RequestHandlerOptions) => {
  return http.post('*/tests', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getStartTestResponseMock(),
      { status: 201
      })
  }, options)
}

export const getListMyTestsMockHandler = (overrideResponse?: TestSessionSummary[] | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<TestSessionSummary[]> | TestSessionSummary[]), options?: RequestHandlerOptions) => {
  return http.get('*/me/tests', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getListMyTestsResponseMock(),
      { status: 200
      })
  }, options)
}

export const getGetTestMockHandler = (overrideResponse?: TestSession | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<TestSession> | TestSession), options?: RequestHandlerOptions) => {
  return http.get('*/tests/:testId', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetTestResponseMock(),
      { status: 200
      })
  }, options)
}

export const getGetNextTestItemMockHandler = (overrideResponse?: TestStep | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<TestStep> | TestStep), options?: RequestHandlerOptions) => {
  return http.get('*/tests/:testId/next', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetNextTestItemResponseMock(),
      { status: 200
      })
  }, options)
}

export const getSubmitTestAnswerMockHandler = (overrideResponse?: AnswerAck | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<AnswerAck> | AnswerAck), options?: RequestHandlerOptions) => {
  return http.post('*/tests/:testId/answers', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getSubmitTestAnswerResponseMock(),
      { status: 200
      })
  }, options)
}

export const getRunTestCodeMockHandler = (overrideResponse?: CodeRunResult | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<CodeRunResult> | CodeRunResult), options?: RequestHandlerOptions) => {
  return http.post('*/tests/:testId/run', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getRunTestCodeResponseMock(),
      { status: 200
      })
  }, options)
}

export const getFinishTestMockHandler = (overrideResponse?: TestResult | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<TestResult> | TestResult), options?: RequestHandlerOptions) => {
  return http.post('*/tests/:testId/finish', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getFinishTestResponseMock(),
      { status: 200
      })
  }, options)
}

export const getGetTestResultMockHandler = (overrideResponse?: TestResult | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<TestResult> | TestResult), options?: RequestHandlerOptions) => {
  return http.get('*/tests/:testId/result', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetTestResultResponseMock(),
      { status: 200
      })
  }, options)
}

export const getGetMyGradeHistoryMockHandler = (overrideResponse?: GradeHistoryEntry[] | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<GradeHistoryEntry[]> | GradeHistoryEntry[]), options?: RequestHandlerOptions) => {
  return http.get('*/me/grade-history', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetMyGradeHistoryResponseMock(),
      { status: 200
      })
  }, options)
}

export const getListShowcaseFamiliesMockHandler = (overrideResponse?: ItemFamilyBrief[] | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<ItemFamilyBrief[]> | ItemFamilyBrief[]), options?: RequestHandlerOptions) => {
  return http.get('*/assessment/families', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getListShowcaseFamiliesResponseMock(),
      { status: 200
      })
  }, options)
}

export const getGetShowcaseFamilyMockHandler = (overrideResponse?: ItemFamily | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<ItemFamily> | ItemFamily), options?: RequestHandlerOptions) => {
  return http.get('*/assessment/families/:familyId', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetShowcaseFamilyResponseMock(),
      { status: 200
      })
  }, options)
}
export const getAssessmentMock = () => [
  getCreateSurveyMockHandler(),
  getListMySurveysMockHandler(),
  getGetMyTestEligibilityMockHandler(),
  getStartTestMockHandler(),
  getListMyTestsMockHandler(),
  getGetTestMockHandler(),
  getGetNextTestItemMockHandler(),
  getSubmitTestAnswerMockHandler(),
  getRunTestCodeMockHandler(),
  getFinishTestMockHandler(),
  getGetTestResultMockHandler(),
  getGetMyGradeHistoryMockHandler(),
  getListShowcaseFamiliesMockHandler(),
  getGetShowcaseFamilyMockHandler()
]
