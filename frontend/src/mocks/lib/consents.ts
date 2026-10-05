import type { ConsentDocument } from '@/api/generated/model'

export const CONSENT_VERSION = '2026-09'

export const CONSENT_DOCUMENTS: ConsentDocument[] = [
  {
    type: 'personal_data',
    version: CONSENT_VERSION,
    title: 'Согласие на обработку персональных данных',
    summary:
      'Мы храним ФИО, контакты, опыт и результаты тестов, чтобы подобрать вам предложения. Контакты шифруются и раскрываются компании только после вашего согласия на инвайт или отклика.',
    required: true,
    document_url: '/legal/personal-data',
  },
  {
    type: 'profile_visibility',
    version: CONSENT_VERSION,
    title: 'Согласие на показ профиля работодателям',
    summary:
      'Работодатели увидят анонимную карточку: категорию, перцентиль, подтверждённые навыки, формат и ожидания. Без ФИО, фото и контактов. Можно отозвать в любой момент — профиль скроется из выдачи.',
    required: false,
    document_url: '/legal/profile-visibility',
  },
  {
    type: 'fsp_data',
    version: CONSENT_VERSION,
    title: 'Согласие на получение данных ФСП',
    summary:
      'Разрешает получать ваши достижения из реестра Федерации спортивного программирования по ФСП ID. Нужно только для привязки ФСП ID — можно дать позже.',
    required: false,
    document_url: '/legal/fsp-data',
  },
]
