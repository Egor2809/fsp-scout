import { getAssessmentMock } from '@/api/generated/endpoints/assessment/assessment.msw'
import { getCandidatesMock } from '@/api/generated/endpoints/candidates/candidates.msw'
import { getCompanyMock } from '@/api/generated/endpoints/company/company.msw'
import { getFspMock } from '@/api/generated/endpoints/fsp/fsp.msw'
import { getInvitationsMock } from '@/api/generated/endpoints/invitations/invitations.msw'
import { getMeMock } from '@/api/generated/endpoints/me/me.msw'
import { getNeedsMock } from '@/api/generated/endpoints/needs/needs.msw'
import { getProfileMock } from '@/api/generated/endpoints/profile/profile.msw'
import { getSearchesMock } from '@/api/generated/endpoints/searches/searches.msw'
import { getServiceMock } from '@/api/generated/endpoints/service/service.msw'
import { getTasksMock } from '@/api/generated/endpoints/tasks/tasks.msw'
import { getTaxonomyMock } from '@/api/generated/endpoints/taxonomy/taxonomy.msw'
import { getVacanciesMock } from '@/api/generated/endpoints/vacancies/vacancies.msw'

/** Все сгенерированные orval MSW-обработчики (случайные данные по схемам контракта). */
export function getScoutAPIMock() {
  return [
    ...getMeMock(), ...getTaxonomyMock(), ...getProfileMock(), ...getAssessmentMock(), ...getFspMock(), ...getCompanyMock(),
    ...getNeedsMock(), ...getSearchesMock(), ...getCandidatesMock(), ...getInvitationsMock(), ...getVacanciesMock(),
    ...getTasksMock(), ...getServiceMock(),
  ]
}
