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
  ContactChannel,
  DeclineReason,
  Grade,
  Industry,
  InvitationStatus,
  Specialization,
  WorkFormat
} from '../../model';
import type {
  CandidateContacts,
  Category,
  Invitation,
  InvitationPrecheck,
  InvitationResponse,
  InvitationStats,
  VacancyBrief
} from '../../model';


export const getListCompanyInvitationsResponseVacancyBriefMock = (overrideResponse: Partial<VacancyBrief> = {}): VacancyBrief => ({...{id: faker.string.uuid(), title: faker.string.alpha({length: {min: 10, max: 20}}), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}}, ...overrideResponse});

export const getListCompanyInvitationsResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getListCompanyInvitationsResponseInvitationResponseMock = (overrideResponse: Partial<InvitationResponse> = {}): InvitationResponse => ({...{decision: faker.helpers.arrayElement(['accepted','declined','postponed'] as const), reason: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(DeclineReason)),null,]), comment: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), channel: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(ContactChannel)),null,]), call_slot: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), postponed_until: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 10), null]), responded_at: faker.date.past().toISOString().slice(0, 19) + 'Z'}, ...overrideResponse});

export const getListCompanyInvitationsResponseCandidateContactsMock = (overrideResponse: Partial<CandidateContacts> = {}): CandidateContacts => ({...{full_name: "Алексей Смирнов", email: faker.internet.email(), phone: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), telegram: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), preferred_channel: faker.helpers.arrayElement(Object.values(ContactChannel))}, ...overrideResponse});

export const getListCompanyInvitationsResponseMock = (): Invitation[] => (Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(InvitationStatus)), title: "Senior Go-разработчик в платёжный шлюз", description: faker.string.alpha({length: {min: 10, max: 20}}), salary: {"from":250000,"to":320000}, work_format: faker.helpers.arrayElement(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}, company_trust: faker.helpers.arrayElement([{invitations_90d: faker.number.int({min: 0}), acceptance_rate: faker.number.float({min: 0, max: 1, fractionDigits: 2}), withdrawn_after_accept: faker.number.int({min: 0})}, undefined]), contact_person: "Ирина Волкова, руководитель подбора", contact: {channel: faker.helpers.arrayElement(Object.values(ContactChannel)), value: "hr@severcode.ru"}, vacancy: faker.helpers.arrayElement([{...getListCompanyInvitationsResponseVacancyBriefMock()},null,]), candidate: {id: faker.string.uuid(), alias: faker.string.alpha({length: {min: 10, max: 20}}), category: faker.helpers.arrayElement([{...getListCompanyInvitationsResponseCategoryMock()},null,]), percentile: faker.helpers.arrayElement([faker.number.int(), null])}, source: {type: faker.helpers.arrayElement(['search','bank','task_submission','vacancy'] as const), id: faker.helpers.arrayElement([faker.string.uuid(), null])}, created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', sent_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), viewed_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), expires_at: faker.date.past().toISOString().slice(0, 19) + 'Z', response: faker.helpers.arrayElement([{...getListCompanyInvitationsResponseInvitationResponseMock()},null,]), candidate_contacts: faker.helpers.arrayElement([{...getListCompanyInvitationsResponseCandidateContactsMock()},null,]), events: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), at: faker.date.past().toISOString().slice(0, 19) + 'Z', status: faker.helpers.arrayElement(Object.values(InvitationStatus)), actor: faker.helpers.arrayElement(['candidate','employer','system'] as const), note: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null])}))})))

export const getCreateInvitationResponseVacancyBriefMock = (overrideResponse: Partial<VacancyBrief> = {}): VacancyBrief => ({...{id: faker.string.uuid(), title: faker.string.alpha({length: {min: 10, max: 20}}), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}}, ...overrideResponse});

export const getCreateInvitationResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getCreateInvitationResponseInvitationResponseMock = (overrideResponse: Partial<InvitationResponse> = {}): InvitationResponse => ({...{decision: faker.helpers.arrayElement(['accepted','declined','postponed'] as const), reason: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(DeclineReason)),null,]), comment: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), channel: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(ContactChannel)),null,]), call_slot: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), postponed_until: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 10), null]), responded_at: faker.date.past().toISOString().slice(0, 19) + 'Z'}, ...overrideResponse});

export const getCreateInvitationResponseCandidateContactsMock = (overrideResponse: Partial<CandidateContacts> = {}): CandidateContacts => ({...{full_name: "Алексей Смирнов", email: faker.internet.email(), phone: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), telegram: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), preferred_channel: faker.helpers.arrayElement(Object.values(ContactChannel))}, ...overrideResponse});

export const getCreateInvitationResponseMock = (overrideResponse: Partial<Extract<Invitation, object>> = {}): Invitation => ({id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(InvitationStatus)), title: "Senior Go-разработчик в платёжный шлюз", description: faker.string.alpha({length: {min: 10, max: 20}}), salary: {"from":250000,"to":320000}, work_format: faker.helpers.arrayElement(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}, company_trust: faker.helpers.arrayElement([{invitations_90d: faker.number.int({min: 0}), acceptance_rate: faker.number.float({min: 0, max: 1, fractionDigits: 2}), withdrawn_after_accept: faker.number.int({min: 0})}, undefined]), contact_person: "Ирина Волкова, руководитель подбора", contact: {channel: faker.helpers.arrayElement(Object.values(ContactChannel)), value: "hr@severcode.ru"}, vacancy: faker.helpers.arrayElement([{...getCreateInvitationResponseVacancyBriefMock()},null,]), candidate: {id: faker.string.uuid(), alias: faker.string.alpha({length: {min: 10, max: 20}}), category: faker.helpers.arrayElement([{...getCreateInvitationResponseCategoryMock()},null,]), percentile: faker.helpers.arrayElement([faker.number.int(), null])}, source: {type: faker.helpers.arrayElement(['search','bank','task_submission','vacancy'] as const), id: faker.helpers.arrayElement([faker.string.uuid(), null])}, created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', sent_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), viewed_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), expires_at: faker.date.past().toISOString().slice(0, 19) + 'Z', response: faker.helpers.arrayElement([{...getCreateInvitationResponseInvitationResponseMock()},null,]), candidate_contacts: faker.helpers.arrayElement([{...getCreateInvitationResponseCandidateContactsMock()},null,]), events: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), at: faker.date.past().toISOString().slice(0, 19) + 'Z', status: faker.helpers.arrayElement(Object.values(InvitationStatus)), actor: faker.helpers.arrayElement(['candidate','employer','system'] as const), note: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null])})), ...overrideResponse})

export const getPrecheckInvitationResponseMock = (overrideResponse: Partial<Extract<InvitationPrecheck, object>> = {}): InvitationPrecheck => ({can_send: faker.datatype.boolean(), salary_ok: faker.datatype.boolean(), already_invited: faker.datatype.boolean(), candidate_available: faker.datatype.boolean(), quota: {limit: 22, used: 7, remaining: 15, period_start: faker.date.past().toISOString().slice(0, 19) + 'Z', period_end: faker.date.past().toISOString().slice(0, 19) + 'Z', penalty: faker.helpers.arrayElement([faker.number.int({min: 0}), undefined]), acceptance_rate: faker.number.float({min: 0, max: 1, fractionDigits: 2}), bonus: faker.number.int({min: 0})}, ...overrideResponse})

export const getGetInvitationStatsResponseMock = (overrideResponse: Partial<Extract<InvitationStats, object>> = {}): InvitationStats => ({days: faker.number.int(), funnel: {sent: faker.number.int(), viewed: faker.number.int(), accepted: faker.number.int(), declined: faker.number.int(), postponed: faker.number.int(), expired: faker.number.int(), withdrawn: faker.number.int(), interview: faker.number.int(), offer: faker.number.int(), hired: faker.number.int()}, decline_reasons: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({reason: faker.helpers.arrayElement(Object.values(DeclineReason)), count: faker.number.int()})), acceptance_rate: faker.number.float({min: 0, max: 1, fractionDigits: 2}), median_response_hours: faker.helpers.arrayElement([faker.number.float({fractionDigits: 2}), null]), ...overrideResponse})

export const getListMyInvitationsResponseVacancyBriefMock = (overrideResponse: Partial<VacancyBrief> = {}): VacancyBrief => ({...{id: faker.string.uuid(), title: faker.string.alpha({length: {min: 10, max: 20}}), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}}, ...overrideResponse});

export const getListMyInvitationsResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getListMyInvitationsResponseInvitationResponseMock = (overrideResponse: Partial<InvitationResponse> = {}): InvitationResponse => ({...{decision: faker.helpers.arrayElement(['accepted','declined','postponed'] as const), reason: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(DeclineReason)),null,]), comment: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), channel: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(ContactChannel)),null,]), call_slot: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), postponed_until: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 10), null]), responded_at: faker.date.past().toISOString().slice(0, 19) + 'Z'}, ...overrideResponse});

export const getListMyInvitationsResponseCandidateContactsMock = (overrideResponse: Partial<CandidateContacts> = {}): CandidateContacts => ({...{full_name: "Алексей Смирнов", email: faker.internet.email(), phone: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), telegram: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), preferred_channel: faker.helpers.arrayElement(Object.values(ContactChannel))}, ...overrideResponse});

export const getListMyInvitationsResponseMock = (): Invitation[] => (Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(InvitationStatus)), title: "Senior Go-разработчик в платёжный шлюз", description: faker.string.alpha({length: {min: 10, max: 20}}), salary: {"from":250000,"to":320000}, work_format: faker.helpers.arrayElement(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}, company_trust: faker.helpers.arrayElement([{invitations_90d: faker.number.int({min: 0}), acceptance_rate: faker.number.float({min: 0, max: 1, fractionDigits: 2}), withdrawn_after_accept: faker.number.int({min: 0})}, undefined]), contact_person: "Ирина Волкова, руководитель подбора", contact: {channel: faker.helpers.arrayElement(Object.values(ContactChannel)), value: "hr@severcode.ru"}, vacancy: faker.helpers.arrayElement([{...getListMyInvitationsResponseVacancyBriefMock()},null,]), candidate: {id: faker.string.uuid(), alias: faker.string.alpha({length: {min: 10, max: 20}}), category: faker.helpers.arrayElement([{...getListMyInvitationsResponseCategoryMock()},null,]), percentile: faker.helpers.arrayElement([faker.number.int(), null])}, source: {type: faker.helpers.arrayElement(['search','bank','task_submission','vacancy'] as const), id: faker.helpers.arrayElement([faker.string.uuid(), null])}, created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', sent_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), viewed_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), expires_at: faker.date.past().toISOString().slice(0, 19) + 'Z', response: faker.helpers.arrayElement([{...getListMyInvitationsResponseInvitationResponseMock()},null,]), candidate_contacts: faker.helpers.arrayElement([{...getListMyInvitationsResponseCandidateContactsMock()},null,]), events: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), at: faker.date.past().toISOString().slice(0, 19) + 'Z', status: faker.helpers.arrayElement(Object.values(InvitationStatus)), actor: faker.helpers.arrayElement(['candidate','employer','system'] as const), note: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null])}))})))

export const getGetInvitationResponseVacancyBriefMock = (overrideResponse: Partial<VacancyBrief> = {}): VacancyBrief => ({...{id: faker.string.uuid(), title: faker.string.alpha({length: {min: 10, max: 20}}), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}}, ...overrideResponse});

export const getGetInvitationResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getGetInvitationResponseInvitationResponseMock = (overrideResponse: Partial<InvitationResponse> = {}): InvitationResponse => ({...{decision: faker.helpers.arrayElement(['accepted','declined','postponed'] as const), reason: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(DeclineReason)),null,]), comment: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), channel: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(ContactChannel)),null,]), call_slot: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), postponed_until: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 10), null]), responded_at: faker.date.past().toISOString().slice(0, 19) + 'Z'}, ...overrideResponse});

export const getGetInvitationResponseCandidateContactsMock = (overrideResponse: Partial<CandidateContacts> = {}): CandidateContacts => ({...{full_name: "Алексей Смирнов", email: faker.internet.email(), phone: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), telegram: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), preferred_channel: faker.helpers.arrayElement(Object.values(ContactChannel))}, ...overrideResponse});

export const getGetInvitationResponseMock = (overrideResponse: Partial<Extract<Invitation, object>> = {}): Invitation => ({id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(InvitationStatus)), title: "Senior Go-разработчик в платёжный шлюз", description: faker.string.alpha({length: {min: 10, max: 20}}), salary: {"from":250000,"to":320000}, work_format: faker.helpers.arrayElement(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}, company_trust: faker.helpers.arrayElement([{invitations_90d: faker.number.int({min: 0}), acceptance_rate: faker.number.float({min: 0, max: 1, fractionDigits: 2}), withdrawn_after_accept: faker.number.int({min: 0})}, undefined]), contact_person: "Ирина Волкова, руководитель подбора", contact: {channel: faker.helpers.arrayElement(Object.values(ContactChannel)), value: "hr@severcode.ru"}, vacancy: faker.helpers.arrayElement([{...getGetInvitationResponseVacancyBriefMock()},null,]), candidate: {id: faker.string.uuid(), alias: faker.string.alpha({length: {min: 10, max: 20}}), category: faker.helpers.arrayElement([{...getGetInvitationResponseCategoryMock()},null,]), percentile: faker.helpers.arrayElement([faker.number.int(), null])}, source: {type: faker.helpers.arrayElement(['search','bank','task_submission','vacancy'] as const), id: faker.helpers.arrayElement([faker.string.uuid(), null])}, created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', sent_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), viewed_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), expires_at: faker.date.past().toISOString().slice(0, 19) + 'Z', response: faker.helpers.arrayElement([{...getGetInvitationResponseInvitationResponseMock()},null,]), candidate_contacts: faker.helpers.arrayElement([{...getGetInvitationResponseCandidateContactsMock()},null,]), events: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), at: faker.date.past().toISOString().slice(0, 19) + 'Z', status: faker.helpers.arrayElement(Object.values(InvitationStatus)), actor: faker.helpers.arrayElement(['candidate','employer','system'] as const), note: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null])})), ...overrideResponse})

export const getMarkInvitationViewedResponseVacancyBriefMock = (overrideResponse: Partial<VacancyBrief> = {}): VacancyBrief => ({...{id: faker.string.uuid(), title: faker.string.alpha({length: {min: 10, max: 20}}), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}}, ...overrideResponse});

export const getMarkInvitationViewedResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getMarkInvitationViewedResponseInvitationResponseMock = (overrideResponse: Partial<InvitationResponse> = {}): InvitationResponse => ({...{decision: faker.helpers.arrayElement(['accepted','declined','postponed'] as const), reason: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(DeclineReason)),null,]), comment: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), channel: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(ContactChannel)),null,]), call_slot: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), postponed_until: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 10), null]), responded_at: faker.date.past().toISOString().slice(0, 19) + 'Z'}, ...overrideResponse});

export const getMarkInvitationViewedResponseCandidateContactsMock = (overrideResponse: Partial<CandidateContacts> = {}): CandidateContacts => ({...{full_name: "Алексей Смирнов", email: faker.internet.email(), phone: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), telegram: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), preferred_channel: faker.helpers.arrayElement(Object.values(ContactChannel))}, ...overrideResponse});

export const getMarkInvitationViewedResponseMock = (overrideResponse: Partial<Extract<Invitation, object>> = {}): Invitation => ({id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(InvitationStatus)), title: "Senior Go-разработчик в платёжный шлюз", description: faker.string.alpha({length: {min: 10, max: 20}}), salary: {"from":250000,"to":320000}, work_format: faker.helpers.arrayElement(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}, company_trust: faker.helpers.arrayElement([{invitations_90d: faker.number.int({min: 0}), acceptance_rate: faker.number.float({min: 0, max: 1, fractionDigits: 2}), withdrawn_after_accept: faker.number.int({min: 0})}, undefined]), contact_person: "Ирина Волкова, руководитель подбора", contact: {channel: faker.helpers.arrayElement(Object.values(ContactChannel)), value: "hr@severcode.ru"}, vacancy: faker.helpers.arrayElement([{...getMarkInvitationViewedResponseVacancyBriefMock()},null,]), candidate: {id: faker.string.uuid(), alias: faker.string.alpha({length: {min: 10, max: 20}}), category: faker.helpers.arrayElement([{...getMarkInvitationViewedResponseCategoryMock()},null,]), percentile: faker.helpers.arrayElement([faker.number.int(), null])}, source: {type: faker.helpers.arrayElement(['search','bank','task_submission','vacancy'] as const), id: faker.helpers.arrayElement([faker.string.uuid(), null])}, created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', sent_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), viewed_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), expires_at: faker.date.past().toISOString().slice(0, 19) + 'Z', response: faker.helpers.arrayElement([{...getMarkInvitationViewedResponseInvitationResponseMock()},null,]), candidate_contacts: faker.helpers.arrayElement([{...getMarkInvitationViewedResponseCandidateContactsMock()},null,]), events: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), at: faker.date.past().toISOString().slice(0, 19) + 'Z', status: faker.helpers.arrayElement(Object.values(InvitationStatus)), actor: faker.helpers.arrayElement(['candidate','employer','system'] as const), note: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null])})), ...overrideResponse})

export const getAcceptInvitationResponseVacancyBriefMock = (overrideResponse: Partial<VacancyBrief> = {}): VacancyBrief => ({...{id: faker.string.uuid(), title: faker.string.alpha({length: {min: 10, max: 20}}), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}}, ...overrideResponse});

export const getAcceptInvitationResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getAcceptInvitationResponseInvitationResponseMock = (overrideResponse: Partial<InvitationResponse> = {}): InvitationResponse => ({...{decision: faker.helpers.arrayElement(['accepted','declined','postponed'] as const), reason: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(DeclineReason)),null,]), comment: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), channel: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(ContactChannel)),null,]), call_slot: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), postponed_until: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 10), null]), responded_at: faker.date.past().toISOString().slice(0, 19) + 'Z'}, ...overrideResponse});

export const getAcceptInvitationResponseCandidateContactsMock = (overrideResponse: Partial<CandidateContacts> = {}): CandidateContacts => ({...{full_name: "Алексей Смирнов", email: faker.internet.email(), phone: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), telegram: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), preferred_channel: faker.helpers.arrayElement(Object.values(ContactChannel))}, ...overrideResponse});

export const getAcceptInvitationResponseMock = (overrideResponse: Partial<Extract<Invitation, object>> = {}): Invitation => ({id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(InvitationStatus)), title: "Senior Go-разработчик в платёжный шлюз", description: faker.string.alpha({length: {min: 10, max: 20}}), salary: {"from":250000,"to":320000}, work_format: faker.helpers.arrayElement(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}, company_trust: faker.helpers.arrayElement([{invitations_90d: faker.number.int({min: 0}), acceptance_rate: faker.number.float({min: 0, max: 1, fractionDigits: 2}), withdrawn_after_accept: faker.number.int({min: 0})}, undefined]), contact_person: "Ирина Волкова, руководитель подбора", contact: {channel: faker.helpers.arrayElement(Object.values(ContactChannel)), value: "hr@severcode.ru"}, vacancy: faker.helpers.arrayElement([{...getAcceptInvitationResponseVacancyBriefMock()},null,]), candidate: {id: faker.string.uuid(), alias: faker.string.alpha({length: {min: 10, max: 20}}), category: faker.helpers.arrayElement([{...getAcceptInvitationResponseCategoryMock()},null,]), percentile: faker.helpers.arrayElement([faker.number.int(), null])}, source: {type: faker.helpers.arrayElement(['search','bank','task_submission','vacancy'] as const), id: faker.helpers.arrayElement([faker.string.uuid(), null])}, created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', sent_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), viewed_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), expires_at: faker.date.past().toISOString().slice(0, 19) + 'Z', response: faker.helpers.arrayElement([{...getAcceptInvitationResponseInvitationResponseMock()},null,]), candidate_contacts: faker.helpers.arrayElement([{...getAcceptInvitationResponseCandidateContactsMock()},null,]), events: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), at: faker.date.past().toISOString().slice(0, 19) + 'Z', status: faker.helpers.arrayElement(Object.values(InvitationStatus)), actor: faker.helpers.arrayElement(['candidate','employer','system'] as const), note: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null])})), ...overrideResponse})

export const getDeclineInvitationResponseVacancyBriefMock = (overrideResponse: Partial<VacancyBrief> = {}): VacancyBrief => ({...{id: faker.string.uuid(), title: faker.string.alpha({length: {min: 10, max: 20}}), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}}, ...overrideResponse});

export const getDeclineInvitationResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getDeclineInvitationResponseInvitationResponseMock = (overrideResponse: Partial<InvitationResponse> = {}): InvitationResponse => ({...{decision: faker.helpers.arrayElement(['accepted','declined','postponed'] as const), reason: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(DeclineReason)),null,]), comment: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), channel: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(ContactChannel)),null,]), call_slot: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), postponed_until: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 10), null]), responded_at: faker.date.past().toISOString().slice(0, 19) + 'Z'}, ...overrideResponse});

export const getDeclineInvitationResponseCandidateContactsMock = (overrideResponse: Partial<CandidateContacts> = {}): CandidateContacts => ({...{full_name: "Алексей Смирнов", email: faker.internet.email(), phone: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), telegram: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), preferred_channel: faker.helpers.arrayElement(Object.values(ContactChannel))}, ...overrideResponse});

export const getDeclineInvitationResponseMock = (overrideResponse: Partial<Extract<Invitation, object>> = {}): Invitation => ({id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(InvitationStatus)), title: "Senior Go-разработчик в платёжный шлюз", description: faker.string.alpha({length: {min: 10, max: 20}}), salary: {"from":250000,"to":320000}, work_format: faker.helpers.arrayElement(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}, company_trust: faker.helpers.arrayElement([{invitations_90d: faker.number.int({min: 0}), acceptance_rate: faker.number.float({min: 0, max: 1, fractionDigits: 2}), withdrawn_after_accept: faker.number.int({min: 0})}, undefined]), contact_person: "Ирина Волкова, руководитель подбора", contact: {channel: faker.helpers.arrayElement(Object.values(ContactChannel)), value: "hr@severcode.ru"}, vacancy: faker.helpers.arrayElement([{...getDeclineInvitationResponseVacancyBriefMock()},null,]), candidate: {id: faker.string.uuid(), alias: faker.string.alpha({length: {min: 10, max: 20}}), category: faker.helpers.arrayElement([{...getDeclineInvitationResponseCategoryMock()},null,]), percentile: faker.helpers.arrayElement([faker.number.int(), null])}, source: {type: faker.helpers.arrayElement(['search','bank','task_submission','vacancy'] as const), id: faker.helpers.arrayElement([faker.string.uuid(), null])}, created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', sent_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), viewed_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), expires_at: faker.date.past().toISOString().slice(0, 19) + 'Z', response: faker.helpers.arrayElement([{...getDeclineInvitationResponseInvitationResponseMock()},null,]), candidate_contacts: faker.helpers.arrayElement([{...getDeclineInvitationResponseCandidateContactsMock()},null,]), events: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), at: faker.date.past().toISOString().slice(0, 19) + 'Z', status: faker.helpers.arrayElement(Object.values(InvitationStatus)), actor: faker.helpers.arrayElement(['candidate','employer','system'] as const), note: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null])})), ...overrideResponse})

export const getPostponeInvitationResponseVacancyBriefMock = (overrideResponse: Partial<VacancyBrief> = {}): VacancyBrief => ({...{id: faker.string.uuid(), title: faker.string.alpha({length: {min: 10, max: 20}}), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}}, ...overrideResponse});

export const getPostponeInvitationResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getPostponeInvitationResponseInvitationResponseMock = (overrideResponse: Partial<InvitationResponse> = {}): InvitationResponse => ({...{decision: faker.helpers.arrayElement(['accepted','declined','postponed'] as const), reason: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(DeclineReason)),null,]), comment: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), channel: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(ContactChannel)),null,]), call_slot: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), postponed_until: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 10), null]), responded_at: faker.date.past().toISOString().slice(0, 19) + 'Z'}, ...overrideResponse});

export const getPostponeInvitationResponseCandidateContactsMock = (overrideResponse: Partial<CandidateContacts> = {}): CandidateContacts => ({...{full_name: "Алексей Смирнов", email: faker.internet.email(), phone: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), telegram: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), preferred_channel: faker.helpers.arrayElement(Object.values(ContactChannel))}, ...overrideResponse});

export const getPostponeInvitationResponseMock = (overrideResponse: Partial<Extract<Invitation, object>> = {}): Invitation => ({id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(InvitationStatus)), title: "Senior Go-разработчик в платёжный шлюз", description: faker.string.alpha({length: {min: 10, max: 20}}), salary: {"from":250000,"to":320000}, work_format: faker.helpers.arrayElement(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}, company_trust: faker.helpers.arrayElement([{invitations_90d: faker.number.int({min: 0}), acceptance_rate: faker.number.float({min: 0, max: 1, fractionDigits: 2}), withdrawn_after_accept: faker.number.int({min: 0})}, undefined]), contact_person: "Ирина Волкова, руководитель подбора", contact: {channel: faker.helpers.arrayElement(Object.values(ContactChannel)), value: "hr@severcode.ru"}, vacancy: faker.helpers.arrayElement([{...getPostponeInvitationResponseVacancyBriefMock()},null,]), candidate: {id: faker.string.uuid(), alias: faker.string.alpha({length: {min: 10, max: 20}}), category: faker.helpers.arrayElement([{...getPostponeInvitationResponseCategoryMock()},null,]), percentile: faker.helpers.arrayElement([faker.number.int(), null])}, source: {type: faker.helpers.arrayElement(['search','bank','task_submission','vacancy'] as const), id: faker.helpers.arrayElement([faker.string.uuid(), null])}, created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', sent_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), viewed_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), expires_at: faker.date.past().toISOString().slice(0, 19) + 'Z', response: faker.helpers.arrayElement([{...getPostponeInvitationResponseInvitationResponseMock()},null,]), candidate_contacts: faker.helpers.arrayElement([{...getPostponeInvitationResponseCandidateContactsMock()},null,]), events: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), at: faker.date.past().toISOString().slice(0, 19) + 'Z', status: faker.helpers.arrayElement(Object.values(InvitationStatus)), actor: faker.helpers.arrayElement(['candidate','employer','system'] as const), note: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null])})), ...overrideResponse})

export const getWithdrawInvitationResponseVacancyBriefMock = (overrideResponse: Partial<VacancyBrief> = {}): VacancyBrief => ({...{id: faker.string.uuid(), title: faker.string.alpha({length: {min: 10, max: 20}}), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}}, ...overrideResponse});

export const getWithdrawInvitationResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getWithdrawInvitationResponseInvitationResponseMock = (overrideResponse: Partial<InvitationResponse> = {}): InvitationResponse => ({...{decision: faker.helpers.arrayElement(['accepted','declined','postponed'] as const), reason: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(DeclineReason)),null,]), comment: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), channel: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(ContactChannel)),null,]), call_slot: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), postponed_until: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 10), null]), responded_at: faker.date.past().toISOString().slice(0, 19) + 'Z'}, ...overrideResponse});

export const getWithdrawInvitationResponseCandidateContactsMock = (overrideResponse: Partial<CandidateContacts> = {}): CandidateContacts => ({...{full_name: "Алексей Смирнов", email: faker.internet.email(), phone: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), telegram: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), preferred_channel: faker.helpers.arrayElement(Object.values(ContactChannel))}, ...overrideResponse});

export const getWithdrawInvitationResponseMock = (overrideResponse: Partial<Extract<Invitation, object>> = {}): Invitation => ({id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(InvitationStatus)), title: "Senior Go-разработчик в платёжный шлюз", description: faker.string.alpha({length: {min: 10, max: 20}}), salary: {"from":250000,"to":320000}, work_format: faker.helpers.arrayElement(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}, company_trust: faker.helpers.arrayElement([{invitations_90d: faker.number.int({min: 0}), acceptance_rate: faker.number.float({min: 0, max: 1, fractionDigits: 2}), withdrawn_after_accept: faker.number.int({min: 0})}, undefined]), contact_person: "Ирина Волкова, руководитель подбора", contact: {channel: faker.helpers.arrayElement(Object.values(ContactChannel)), value: "hr@severcode.ru"}, vacancy: faker.helpers.arrayElement([{...getWithdrawInvitationResponseVacancyBriefMock()},null,]), candidate: {id: faker.string.uuid(), alias: faker.string.alpha({length: {min: 10, max: 20}}), category: faker.helpers.arrayElement([{...getWithdrawInvitationResponseCategoryMock()},null,]), percentile: faker.helpers.arrayElement([faker.number.int(), null])}, source: {type: faker.helpers.arrayElement(['search','bank','task_submission','vacancy'] as const), id: faker.helpers.arrayElement([faker.string.uuid(), null])}, created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', sent_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), viewed_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), expires_at: faker.date.past().toISOString().slice(0, 19) + 'Z', response: faker.helpers.arrayElement([{...getWithdrawInvitationResponseInvitationResponseMock()},null,]), candidate_contacts: faker.helpers.arrayElement([{...getWithdrawInvitationResponseCandidateContactsMock()},null,]), events: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), at: faker.date.past().toISOString().slice(0, 19) + 'Z', status: faker.helpers.arrayElement(Object.values(InvitationStatus)), actor: faker.helpers.arrayElement(['candidate','employer','system'] as const), note: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null])})), ...overrideResponse})

export const getUpdateInvitationStageResponseVacancyBriefMock = (overrideResponse: Partial<VacancyBrief> = {}): VacancyBrief => ({...{id: faker.string.uuid(), title: faker.string.alpha({length: {min: 10, max: 20}}), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}}, ...overrideResponse});

export const getUpdateInvitationStageResponseCategoryMock = (overrideResponse: Partial<Category> = {}): Category => ({...{specialization: faker.helpers.arrayElement(Object.values(Specialization)), grade: faker.helpers.arrayElement(Object.values(Grade)), label: "Backend · Middle"}, ...overrideResponse});

export const getUpdateInvitationStageResponseInvitationResponseMock = (overrideResponse: Partial<InvitationResponse> = {}): InvitationResponse => ({...{decision: faker.helpers.arrayElement(['accepted','declined','postponed'] as const), reason: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(DeclineReason)),null,]), comment: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), channel: faker.helpers.arrayElement([faker.helpers.arrayElement(Object.values(ContactChannel)),null,]), call_slot: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), postponed_until: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 10), null]), responded_at: faker.date.past().toISOString().slice(0, 19) + 'Z'}, ...overrideResponse});

export const getUpdateInvitationStageResponseCandidateContactsMock = (overrideResponse: Partial<CandidateContacts> = {}): CandidateContacts => ({...{full_name: "Алексей Смирнов", email: faker.internet.email(), phone: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), telegram: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), preferred_channel: faker.helpers.arrayElement(Object.values(ContactChannel))}, ...overrideResponse});

export const getUpdateInvitationStageResponseMock = (overrideResponse: Partial<Extract<Invitation, object>> = {}): Invitation => ({id: faker.string.uuid(), status: faker.helpers.arrayElement(Object.values(InvitationStatus)), title: "Senior Go-разработчик в платёжный шлюз", description: faker.string.alpha({length: {min: 10, max: 20}}), salary: {"from":250000,"to":320000}, work_format: faker.helpers.arrayElement(Object.values(WorkFormat)), city: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), company: {id: faker.string.uuid(), name: "Северный код", industry: faker.helpers.arrayElement(Object.values(Industry)), city: "Москва", verified: faker.datatype.boolean()}, company_trust: faker.helpers.arrayElement([{invitations_90d: faker.number.int({min: 0}), acceptance_rate: faker.number.float({min: 0, max: 1, fractionDigits: 2}), withdrawn_after_accept: faker.number.int({min: 0})}, undefined]), contact_person: "Ирина Волкова, руководитель подбора", contact: {channel: faker.helpers.arrayElement(Object.values(ContactChannel)), value: "hr@severcode.ru"}, vacancy: faker.helpers.arrayElement([{...getUpdateInvitationStageResponseVacancyBriefMock()},null,]), candidate: {id: faker.string.uuid(), alias: faker.string.alpha({length: {min: 10, max: 20}}), category: faker.helpers.arrayElement([{...getUpdateInvitationStageResponseCategoryMock()},null,]), percentile: faker.helpers.arrayElement([faker.number.int(), null])}, source: {type: faker.helpers.arrayElement(['search','bank','task_submission','vacancy'] as const), id: faker.helpers.arrayElement([faker.string.uuid(), null])}, created_at: faker.date.past().toISOString().slice(0, 19) + 'Z', sent_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), viewed_at: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 19) + 'Z', null]), expires_at: faker.date.past().toISOString().slice(0, 19) + 'Z', response: faker.helpers.arrayElement([{...getUpdateInvitationStageResponseInvitationResponseMock()},null,]), candidate_contacts: faker.helpers.arrayElement([{...getUpdateInvitationStageResponseCandidateContactsMock()},null,]), events: Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => ({id: faker.string.uuid(), at: faker.date.past().toISOString().slice(0, 19) + 'Z', status: faker.helpers.arrayElement(Object.values(InvitationStatus)), actor: faker.helpers.arrayElement(['candidate','employer','system'] as const), note: faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null])})), ...overrideResponse})


export const getListCompanyInvitationsMockHandler = (overrideResponse?: Invitation[] | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<Invitation[]> | Invitation[]), options?: RequestHandlerOptions) => {
  return http.get('*/invitations', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getListCompanyInvitationsResponseMock(),
      { status: 200
      })
  }, options)
}

export const getCreateInvitationMockHandler = (overrideResponse?: Invitation | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<Invitation> | Invitation), options?: RequestHandlerOptions) => {
  return http.post('*/invitations', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getCreateInvitationResponseMock(),
      { status: 201
      })
  }, options)
}

export const getPrecheckInvitationMockHandler = (overrideResponse?: InvitationPrecheck | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<InvitationPrecheck> | InvitationPrecheck), options?: RequestHandlerOptions) => {
  return http.post('*/invitations/precheck', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getPrecheckInvitationResponseMock(),
      { status: 200
      })
  }, options)
}

export const getGetInvitationStatsMockHandler = (overrideResponse?: InvitationStats | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<InvitationStats> | InvitationStats), options?: RequestHandlerOptions) => {
  return http.get('*/invitations/stats', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetInvitationStatsResponseMock(),
      { status: 200
      })
  }, options)
}

export const getListMyInvitationsMockHandler = (overrideResponse?: Invitation[] | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<Invitation[]> | Invitation[]), options?: RequestHandlerOptions) => {
  return http.get('*/me/invitations', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getListMyInvitationsResponseMock(),
      { status: 200
      })
  }, options)
}

export const getGetInvitationMockHandler = (overrideResponse?: Invitation | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<Invitation> | Invitation), options?: RequestHandlerOptions) => {
  return http.get('*/invitations/:invitationId', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetInvitationResponseMock(),
      { status: 200
      })
  }, options)
}

export const getMarkInvitationViewedMockHandler = (overrideResponse?: Invitation | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<Invitation> | Invitation), options?: RequestHandlerOptions) => {
  return http.post('*/invitations/:invitationId/view', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getMarkInvitationViewedResponseMock(),
      { status: 200
      })
  }, options)
}

export const getAcceptInvitationMockHandler = (overrideResponse?: Invitation | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<Invitation> | Invitation), options?: RequestHandlerOptions) => {
  return http.post('*/invitations/:invitationId/accept', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getAcceptInvitationResponseMock(),
      { status: 200
      })
  }, options)
}

export const getDeclineInvitationMockHandler = (overrideResponse?: Invitation | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<Invitation> | Invitation), options?: RequestHandlerOptions) => {
  return http.post('*/invitations/:invitationId/decline', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getDeclineInvitationResponseMock(),
      { status: 200
      })
  }, options)
}

export const getPostponeInvitationMockHandler = (overrideResponse?: Invitation | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<Invitation> | Invitation), options?: RequestHandlerOptions) => {
  return http.post('*/invitations/:invitationId/postpone', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getPostponeInvitationResponseMock(),
      { status: 200
      })
  }, options)
}

export const getWithdrawInvitationMockHandler = (overrideResponse?: Invitation | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<Invitation> | Invitation), options?: RequestHandlerOptions) => {
  return http.post('*/invitations/:invitationId/withdraw', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getWithdrawInvitationResponseMock(),
      { status: 200
      })
  }, options)
}

export const getUpdateInvitationStageMockHandler = (overrideResponse?: Invitation | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<Invitation> | Invitation), options?: RequestHandlerOptions) => {
  return http.post('*/invitations/:invitationId/stage', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getUpdateInvitationStageResponseMock(),
      { status: 200
      })
  }, options)
}
export const getInvitationsMock = () => [
  getListCompanyInvitationsMockHandler(),
  getCreateInvitationMockHandler(),
  getPrecheckInvitationMockHandler(),
  getGetInvitationStatsMockHandler(),
  getListMyInvitationsMockHandler(),
  getGetInvitationMockHandler(),
  getMarkInvitationViewedMockHandler(),
  getAcceptInvitationMockHandler(),
  getDeclineInvitationMockHandler(),
  getPostponeInvitationMockHandler(),
  getWithdrawInvitationMockHandler(),
  getUpdateInvitationStageMockHandler()
]
