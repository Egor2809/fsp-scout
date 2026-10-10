import type { Role } from '@/api/generated/model'

/**
 * Демо-аккаунты для dev-входа на моках. ID совпадают с сидом мок-бэкенда (src/mocks/db/seed.ts).
 * С реальным бэкендом используются отдельно созданные учётки Keycloak; эти персоны там не создаются.
 */
export interface DemoPersona {
  key: string
  userId: string
  role: Role
  displayName: string
  email: string
  title: string
  description: string
}

export const DEMO_PERSONAS: readonly DemoPersona[] = [
  {
    key: 'candidate-fsp',
    userId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    role: 'candidate',
    displayName: 'Алексей Смирнов',
    email: 'a.smirnov@demo.scout',
    title: 'Кандидат с историей ФСП',
    description: 'Backend · Middle, призёр всероссийского этапа ФСП, есть входящие инвайты',
  },
  {
    key: 'candidate-no-fsp',
    userId: '3b241101-e2bb-4255-8caf-4136c566a962',
    role: 'candidate',
    displayName: 'Мария Кузнецова',
    email: 'm.kuznetsova@demo.scout',
    title: 'Кандидат без истории ФСП',
    description: 'Frontend · Junior, показывает пустое состояние «Нет истории ФСП»',
  },
  {
    key: 'employer',
    userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    role: 'employer',
    displayName: 'Ирина Волкова',
    email: 'i.volkova@severcode.ru',
    title: 'Работодатель',
    description: 'Руководитель подбора в «Северном коде» (финтех): подборка, инвайты, вакансии',
  },
]

export const DEMO_COMPANY_ID = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
export const DEMO_CANDIDATE_FSP_ID = 'c56a4180-65aa-42ec-a945-5fd21dec0538'
export const DEMO_CANDIDATE_NO_FSP_ID = 'e4eaaaf2-d142-41e1-b3e4-080027620cdd'
