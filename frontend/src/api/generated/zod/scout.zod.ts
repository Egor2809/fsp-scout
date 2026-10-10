/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import * as zod from 'zod';

/**
 * Создаёт пользователя при первом обращении. Для кандидата возвращает состояние онбординга, для работодателя — компанию.
 * @summary Текущий пользователь
 */
export const GetMeResponse = zod.object({
  "id": zod.uuid(),
  "role": zod.enum(['candidate', 'employer', 'admin']),
  "email": zod.email(),
  "display_name": zod.string(),
  "onboarding": zod.union([zod.object({
  "consents_given": zod.boolean().describe('Даны обязательные согласия (personal_data)'),
  "survey_completed": zod.boolean(),
  "grade_confirmed": zod.boolean(),
  "next_step": zod.enum(['consents', 'survey', 'grade', 'test', 'done']),
  "active_test_id": zod.uuid().nullable()
}),zod.null()]).describe('Только для кандидата'),
  "company": zod.union([zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
}),zod.null()]).describe('Только для работодателя')
})


/**
 * Запускает удаление аккаунта и всех персональных данных (152-ФЗ). Профиль сразу скрывается из выдачи.
 * @summary Удалить аккаунт и данные
 */
export const DeleteMeResponse = zod.object({
  "scheduled_at": zod.iso.datetime({"offset":true})
})


/**
 * @summary Экспорт своих данных (JSON)
 */
export const ExportMyDataResponse = zod.record(zod.string(), zod.unknown())


/**
 * @summary Документы согласий и текущее состояние
 */
export const GetMyConsentsResponse = zod.object({
  "documents": zod.array(zod.object({
  "type": zod.enum(['personal_data', 'profile_visibility', 'fsp_data']).describe('Обработка ПДн / показ профиля работодателям / получение данных ФСП'),
  "version": zod.string(),
  "title": zod.string(),
  "summary": zod.string(),
  "required": zod.boolean().describe('Без него нельзя пользоваться платформой'),
  "document_url": zod.string()
})),
  "consents": zod.array(zod.object({
  "type": zod.enum(['personal_data', 'profile_visibility', 'fsp_data']).describe('Обработка ПДн / показ профиля работодателям / получение данных ФСП'),
  "version": zod.string(),
  "given_at": zod.iso.datetime({"offset":true}),
  "revoked_at": zod.iso.datetime({"offset":true}).nullable()
})).describe('Последняя запись по каждому типу')
})


/**
 * Три отдельных согласия, каждое версионируется. `given: false` отзывает согласие.
 * Отзыв `profile_visibility` скрывает профиль из выдачи. Отзыв `fsp_data` отвязывает ФСП ID.
 * `personal_data` через этот метод не отзывается (для этого `DELETE /me`), попытка даёт `422 validation_error`.
 * @summary Дать или отозвать согласия
 */
export const updateMyConsentsBodyItemsMax = 3;



export const UpdateMyConsentsBody = zod.object({
  "items": zod.array(zod.object({
  "type": zod.enum(['personal_data', 'profile_visibility', 'fsp_data']).describe('Обработка ПДн / показ профиля работодателям / получение данных ФСП'),
  "version": zod.string(),
  "given": zod.boolean()
})).min(1).max(updateMyConsentsBodyItemsMax)
})

export const UpdateMyConsentsResponse = zod.object({
  "documents": zod.array(zod.object({
  "type": zod.enum(['personal_data', 'profile_visibility', 'fsp_data']).describe('Обработка ПДн / показ профиля работодателям / получение данных ФСП'),
  "version": zod.string(),
  "title": zod.string(),
  "summary": zod.string(),
  "required": zod.boolean().describe('Без него нельзя пользоваться платформой'),
  "document_url": zod.string()
})),
  "consents": zod.array(zod.object({
  "type": zod.enum(['personal_data', 'profile_visibility', 'fsp_data']).describe('Обработка ПДн / показ профиля работодателям / получение данных ФСП'),
  "version": zod.string(),
  "given_at": zod.iso.datetime({"offset":true}),
  "revoked_at": zod.iso.datetime({"offset":true}).nullable()
})).describe('Последняя запись по каждому типу')
})


/**
 * @summary Справочники (специализации, грейды, отрасли, навыки с синонимами, города)
 */
export const GetTaxonomyResponse = zod.object({
  "specializations": zod.array(zod.object({
  "id": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "name": zod.string(),
  "competencies": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
}))
})),
  "grades": zod.array(zod.object({
  "id": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "name": zod.string(),
  "experience": zod.string()
})),
  "industries": zod.array(zod.object({
  "id": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "name": zod.string()
})),
  "skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string(),
  "specializations": zod.array(zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик')),
  "competency_id": zod.string(),
  "aliases": zod.array(zod.string())
})),
  "cities": zod.array(zod.string())
})


/**
 * @summary Поиск компаний (для списка «скрыть профиль от компаний»)
 */
export const lookupCompaniesQueryQMax = 100;



export const LookupCompaniesQueryParams = zod.object({
  "q": zod.string().max(lookupCompaniesQueryQMax).optional().describe('Подстрока названия, пусто — первые компании по алфавиту')
})

export const LookupCompaniesResponseItem = zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
})
export const LookupCompaniesResponse = zod.array(LookupCompaniesResponseItem)


/**
 * @summary Свой профиль кандидата (полный, с контактами)
 */
export const getMyProfileResponseAboutMax = 2000;

export const getMyProfileResponseStandingOnePercentileMax = 99;

export const getMyProfileResponseExperienceYearsMin = 0;
export const getMyProfileResponseExperienceYearsMax = 50;

export const getMyProfileResponseExperienceItemStartRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const getMyProfileResponseExperienceItemEndRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const getMyProfileResponseExperienceItemDescriptionMax = 1000;

export const getMyProfileResponseSkillsItemScoreMin = 0;
export const getMyProfileResponseSkillsItemScoreMax = 100;

export const getMyProfileResponseSalaryExpectationOneFromMin = 10000;
export const getMyProfileResponseSalaryExpectationOneFromMax = 10000000;

export const getMyProfileResponseSalaryExpectationOneToMin = 10000;
export const getMyProfileResponseSalaryExpectationOneToMax = 10000000;

export const getMyProfileResponseCompletenessMin = 0;
export const getMyProfileResponseCompletenessMax = 100;



export const GetMyProfileResponse = zod.object({
  "id": zod.uuid(),
  "full_name": zod.string(),
  "email": zod.email(),
  "phone": zod.string().nullable(),
  "telegram": zod.string().nullable(),
  "city": zod.string().nullable(),
  "relocation": zod.boolean(),
  "about": zod.string().max(getMyProfileResponseAboutMax).nullable(),
  "specialization": zod.union([zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),zod.null()]),
  "standing": zod.union([zod.object({
  "category": zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),
  "percentile": zod.int().min(1).max(getMyProfileResponseStandingOnePercentileMax),
  "confirmed_at": zod.iso.datetime({"offset":true}),
  "test_id": zod.uuid(),
  "flags": zod.array(zod.object({
  "code": zod.enum(['fast_correct', 'paste', 'focus_loss']),
  "severity": zod.enum(['info', 'warning'])
}).describe('Сигнал прокторинга подтверждающего теста; не доказывает нарушение')).optional()
}).describe('Подтверждённое место кандидата в категории'),zod.null()]).describe('`null` — грейд не подтверждён'),
  "experience_years": zod.number().min(getMyProfileResponseExperienceYearsMin).max(getMyProfileResponseExperienceYearsMax),
  "experience": zod.array(zod.object({
  "role": zod.string(),
  "company_name": zod.string().nullable().describe('`null`, если кандидат скрыл названия компаний'),
  "company_hidden": zod.boolean(),
  "industry": zod.union([zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),zod.null()]),
  "start": zod.string().regex(getMyProfileResponseExperienceItemStartRegExp).describe('Месяц начала YYYY-MM'),
  "end": zod.string().regex(getMyProfileResponseExperienceItemEndRegExp).nullable().describe('Месяц окончания, `null` — по настоящее время'),
  "description": zod.string().max(getMyProfileResponseExperienceItemDescriptionMax).nullable()
})),
  "skills": zod.array(zod.object({
  "skill_id": zod.string(),
  "name": zod.string(),
  "level": zod.enum(['basic', 'confident', 'advanced']),
  "source": zod.enum(['self', 'resume', 'test', 'fsp', 'task']).describe('self — заявлен, resume — из резюме, test — подтверждён тестом, fsp — из достижений ФСП, task — из регулярного задания'),
  "verified": zod.boolean().describe('Подтверждён тестом, заданием или ФСП'),
  "score": zod.int().min(getMyProfileResponseSkillsItemScoreMin).max(getMyProfileResponseSkillsItemScoreMax).nullable().describe('Балл по навыку в тесте, если подтверждён тестом')
})),
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])),
  "salary_expectation": zod.union([zod.object({
  "from": zod.int().min(getMyProfileResponseSalaryExpectationOneFromMin).max(getMyProfileResponseSalaryExpectationOneFromMax),
  "to": zod.int().min(getMyProfileResponseSalaryExpectationOneToMin).max(getMyProfileResponseSalaryExpectationOneToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),zod.null()]),
  "availability": zod.enum(['active', 'open', 'not_looking']).describe('Ищу активно / открыт к предложениям / не ищу'),
  "completeness": zod.int().min(getMyProfileResponseCompletenessMin).max(getMyProfileResponseCompletenessMax).describe('Полнота профиля, %'),
  "visibility": zod.enum(['visible', 'hidden_no_grade', 'hidden_no_consent', 'hidden_by_candidate']).describe('visible — в выдаче; hidden_no_grade — нет подтверждённого грейда; hidden_no_consent — нет согласия profile_visibility; hidden_by_candidate — кандидат «не ищу» и скрыл профиль'),
  "updated_at": zod.iso.datetime({"offset":true})
})


/**
 * Навыки с `source` `test`/`fsp`/`task` сервер сохраняет сам и не даёт перезаписать; здесь передаются только заявленные (`self`, `resume`).
 * @summary Сохранить профиль (форма или проверенные поля из резюме)
 */
export const updateMyProfileBodyFullNameMin = 2;
export const updateMyProfileBodyFullNameMax = 120;

export const updateMyProfileBodyPhoneRegExp = new RegExp('^\\+?[0-9 ()-]{10,20}$');
export const updateMyProfileBodyTelegramRegExp = new RegExp('^@[A-Za-z0-9_]{4,32}$');
export const updateMyProfileBodyCityMax = 100;

export const updateMyProfileBodyAboutMax = 2000;

export const updateMyProfileBodyExperienceYearsMin = 0;
export const updateMyProfileBodyExperienceYearsMax = 50;

export const updateMyProfileBodyExperienceItemRoleMin = 2;
export const updateMyProfileBodyExperienceItemRoleMax = 120;

export const updateMyProfileBodyExperienceItemCompanyNameMax = 120;

export const updateMyProfileBodyExperienceItemStartRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const updateMyProfileBodyExperienceItemEndRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const updateMyProfileBodyExperienceItemDescriptionMax = 1000;

export const updateMyProfileBodyExperienceMax = 20;

export const updateMyProfileBodySkillsMax = 50;


export const updateMyProfileBodySalaryExpectationFromMin = 10000;
export const updateMyProfileBodySalaryExpectationFromMax = 10000000;

export const updateMyProfileBodySalaryExpectationToMin = 10000;
export const updateMyProfileBodySalaryExpectationToMax = 10000000;



export const UpdateMyProfileBody = zod.object({
  "full_name": zod.string().min(updateMyProfileBodyFullNameMin).max(updateMyProfileBodyFullNameMax),
  "phone": zod.string().regex(updateMyProfileBodyPhoneRegExp).nullish(),
  "telegram": zod.string().regex(updateMyProfileBodyTelegramRegExp).nullish(),
  "city": zod.string().max(updateMyProfileBodyCityMax).nullish(),
  "relocation": zod.boolean(),
  "about": zod.string().max(updateMyProfileBodyAboutMax).nullish(),
  "experience_years": zod.number().min(updateMyProfileBodyExperienceYearsMin).max(updateMyProfileBodyExperienceYearsMax),
  "experience": zod.array(zod.object({
  "role": zod.string().min(updateMyProfileBodyExperienceItemRoleMin).max(updateMyProfileBodyExperienceItemRoleMax),
  "company_name": zod.string().max(updateMyProfileBodyExperienceItemCompanyNameMax).nullish(),
  "industry": zod.union([zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),zod.null()]).optional(),
  "start": zod.string().regex(updateMyProfileBodyExperienceItemStartRegExp),
  "end": zod.string().regex(updateMyProfileBodyExperienceItemEndRegExp).nullish(),
  "description": zod.string().max(updateMyProfileBodyExperienceItemDescriptionMax).nullish()
})).max(updateMyProfileBodyExperienceMax),
  "skills": zod.array(zod.object({
  "skill_id": zod.string(),
  "level": zod.enum(['basic', 'confident', 'advanced']),
  "source": zod.enum(['self', 'resume'])
})).max(updateMyProfileBodySkillsMax),
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])).min(1),
  "salary_expectation": zod.object({
  "from": zod.int().min(updateMyProfileBodySalaryExpectationFromMin).max(updateMyProfileBodySalaryExpectationFromMax),
  "to": zod.int().min(updateMyProfileBodySalaryExpectationToMin).max(updateMyProfileBodySalaryExpectationToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.')
})

export const updateMyProfileResponseAboutMax = 2000;

export const updateMyProfileResponseStandingOnePercentileMax = 99;

export const updateMyProfileResponseExperienceYearsMin = 0;
export const updateMyProfileResponseExperienceYearsMax = 50;

export const updateMyProfileResponseExperienceItemStartRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const updateMyProfileResponseExperienceItemEndRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const updateMyProfileResponseExperienceItemDescriptionMax = 1000;

export const updateMyProfileResponseSkillsItemScoreMin = 0;
export const updateMyProfileResponseSkillsItemScoreMax = 100;

export const updateMyProfileResponseSalaryExpectationOneFromMin = 10000;
export const updateMyProfileResponseSalaryExpectationOneFromMax = 10000000;

export const updateMyProfileResponseSalaryExpectationOneToMin = 10000;
export const updateMyProfileResponseSalaryExpectationOneToMax = 10000000;

export const updateMyProfileResponseCompletenessMin = 0;
export const updateMyProfileResponseCompletenessMax = 100;



export const UpdateMyProfileResponse = zod.object({
  "id": zod.uuid(),
  "full_name": zod.string(),
  "email": zod.email(),
  "phone": zod.string().nullable(),
  "telegram": zod.string().nullable(),
  "city": zod.string().nullable(),
  "relocation": zod.boolean(),
  "about": zod.string().max(updateMyProfileResponseAboutMax).nullable(),
  "specialization": zod.union([zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),zod.null()]),
  "standing": zod.union([zod.object({
  "category": zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),
  "percentile": zod.int().min(1).max(updateMyProfileResponseStandingOnePercentileMax),
  "confirmed_at": zod.iso.datetime({"offset":true}),
  "test_id": zod.uuid(),
  "flags": zod.array(zod.object({
  "code": zod.enum(['fast_correct', 'paste', 'focus_loss']),
  "severity": zod.enum(['info', 'warning'])
}).describe('Сигнал прокторинга подтверждающего теста; не доказывает нарушение')).optional()
}).describe('Подтверждённое место кандидата в категории'),zod.null()]).describe('`null` — грейд не подтверждён'),
  "experience_years": zod.number().min(updateMyProfileResponseExperienceYearsMin).max(updateMyProfileResponseExperienceYearsMax),
  "experience": zod.array(zod.object({
  "role": zod.string(),
  "company_name": zod.string().nullable().describe('`null`, если кандидат скрыл названия компаний'),
  "company_hidden": zod.boolean(),
  "industry": zod.union([zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),zod.null()]),
  "start": zod.string().regex(updateMyProfileResponseExperienceItemStartRegExp).describe('Месяц начала YYYY-MM'),
  "end": zod.string().regex(updateMyProfileResponseExperienceItemEndRegExp).nullable().describe('Месяц окончания, `null` — по настоящее время'),
  "description": zod.string().max(updateMyProfileResponseExperienceItemDescriptionMax).nullable()
})),
  "skills": zod.array(zod.object({
  "skill_id": zod.string(),
  "name": zod.string(),
  "level": zod.enum(['basic', 'confident', 'advanced']),
  "source": zod.enum(['self', 'resume', 'test', 'fsp', 'task']).describe('self — заявлен, resume — из резюме, test — подтверждён тестом, fsp — из достижений ФСП, task — из регулярного задания'),
  "verified": zod.boolean().describe('Подтверждён тестом, заданием или ФСП'),
  "score": zod.int().min(updateMyProfileResponseSkillsItemScoreMin).max(updateMyProfileResponseSkillsItemScoreMax).nullable().describe('Балл по навыку в тесте, если подтверждён тестом')
})),
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])),
  "salary_expectation": zod.union([zod.object({
  "from": zod.int().min(updateMyProfileResponseSalaryExpectationOneFromMin).max(updateMyProfileResponseSalaryExpectationOneFromMax),
  "to": zod.int().min(updateMyProfileResponseSalaryExpectationOneToMin).max(updateMyProfileResponseSalaryExpectationOneToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),zod.null()]),
  "availability": zod.enum(['active', 'open', 'not_looking']).describe('Ищу активно / открыт к предложениям / не ищу'),
  "completeness": zod.int().min(updateMyProfileResponseCompletenessMin).max(updateMyProfileResponseCompletenessMax).describe('Полнота профиля, %'),
  "visibility": zod.enum(['visible', 'hidden_no_grade', 'hidden_no_consent', 'hidden_by_candidate']).describe('visible — в выдаче; hidden_no_grade — нет подтверждённого грейда; hidden_no_consent — нет согласия profile_visibility; hidden_by_candidate — кандидат «не ищу» и скрыл профиль'),
  "updated_at": zod.iso.datetime({"offset":true})
})


/**
 * PDF до 5 МБ, проверяется MIME и сигнатура. Поля не сохраняются в профиль автоматически:
 * кандидат проверяет их на экране сверки и сохраняет через `PUT /me/profile`.
 * @summary Загрузить PDF-резюме и получить распознанные поля
 */
export const UploadMyResumeBody = zod.object({
  "file": zod.instanceof(Blob)
})

export const uploadMyResumeResponseFieldsExperienceItemStartRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const uploadMyResumeResponseFieldsExperienceItemEndRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const uploadMyResumeResponseFieldsExperienceItemDescriptionMax = 1000;

export const uploadMyResumeResponseConfidenceMinOne = 0;
export const uploadMyResumeResponseConfidenceMaxOne = 1;



export const UploadMyResumeResponse = zod.object({
  "resume_id": zod.uuid(),
  "file_name": zod.string(),
  "uploaded_at": zod.iso.datetime({"offset":true}),
  "fields": zod.object({
  "full_name": zod.string().nullable(),
  "email": zod.string().nullable(),
  "phone": zod.string().nullable(),
  "telegram": zod.string().nullable(),
  "city": zod.string().nullable(),
  "experience_years": zod.number().nullable(),
  "roles": zod.array(zod.string()),
  "skills": zod.array(zod.object({
  "raw": zod.string().describe('Как написано в резюме'),
  "skill_id": zod.string().nullable().describe('Нормализованный навык из справочника (через синонимы), `null` — не распознан'),
  "name": zod.string()
})),
  "soft_skills": zod.array(zod.string()),
  "experience": zod.array(zod.object({
  "role": zod.string(),
  "company_name": zod.string().nullable().describe('`null`, если кандидат скрыл названия компаний'),
  "company_hidden": zod.boolean(),
  "industry": zod.union([zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),zod.null()]),
  "start": zod.string().regex(uploadMyResumeResponseFieldsExperienceItemStartRegExp).describe('Месяц начала YYYY-MM'),
  "end": zod.string().regex(uploadMyResumeResponseFieldsExperienceItemEndRegExp).nullable().describe('Месяц окончания, `null` — по настоящее время'),
  "description": zod.string().max(uploadMyResumeResponseFieldsExperienceItemDescriptionMax).nullable()
})),
  "about": zod.string().nullable()
}),
  "confidence": zod.record(zod.string(), zod.number().min(uploadMyResumeResponseConfidenceMinOne).max(uploadMyResumeResponseConfidenceMaxOne)).describe('Уверенность распознавания по полям (ключ — имя поля из `fields`), 0–1'),
  "warnings": zod.array(zod.string())
})


/**
 * @summary Стандартизированный PDF-профиль с QR-кодом проверки
 */
export const DownloadMyProfilePdfResponse = zod.unknown()


/**
 * Анонимная карточка с учётом текущих настроек приватности (`contacts` всегда `null`).
 * @summary Как работодатель видит мою карточку
 */
export const getMyCardPreviewResponsePercentileMax = 99;

export const getMyCardPreviewResponseStrengthMin = 0;
export const getMyCardPreviewResponseStrengthMax = 130;

export const getMyCardPreviewResponseSkillsItemScoreMin = 0;
export const getMyCardPreviewResponseSkillsItemScoreMax = 100;

export const getMyCardPreviewResponseExperienceItemStartRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const getMyCardPreviewResponseExperienceItemEndRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const getMyCardPreviewResponseExperienceItemDescriptionMax = 1000;

export const getMyCardPreviewResponseSalaryExpectationOneFromMin = 10000;
export const getMyCardPreviewResponseSalaryExpectationOneFromMax = 10000000;

export const getMyCardPreviewResponseSalaryExpectationOneToMin = 10000;
export const getMyCardPreviewResponseSalaryExpectationOneToMax = 10000000;

export const getMyCardPreviewResponseFspOneIndexMin = 0;
export const getMyCardPreviewResponseFspOneIndexMax = 100;

export const getMyCardPreviewResponseFspOneBonusMin = 0;
export const getMyCardPreviewResponseFspOneBonusMax = 30;

export const getMyCardPreviewResponseFspOneAchievementsCountMin = 0;



export const getMyCardPreviewResponseFspOneTopAchievementOnePercentileMax = 99;

export const getMyCardPreviewResponseTaskSignalSolvedCountMin = 0;



export const GetMyCardPreviewResponse = zod.object({
  "id": zod.uuid(),
  "alias": zod.string().describe('Анонимное имя, стабильное для пары компания–кандидат'),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "grade_confirmed": zod.boolean(),
  "percentile": zod.int().min(1).max(getMyCardPreviewResponsePercentileMax).nullable(),
  "test_flags": zod.array(zod.object({
  "code": zod.enum(['fast_correct', 'paste', 'focus_loss']),
  "severity": zod.enum(['info', 'warning'])
}).describe('Сигнал прокторинга подтверждающего теста; не доказывает нарушение')).optional(),
  "strength": zod.number().min(getMyCardPreviewResponseStrengthMin).max(getMyCardPreviewResponseStrengthMax).describe('Сила профиля (0–100 + бонус ФСП до 30)'),
  "skills": zod.array(zod.object({
  "skill_id": zod.string(),
  "name": zod.string(),
  "level": zod.enum(['basic', 'confident', 'advanced']),
  "source": zod.enum(['self', 'resume', 'test', 'fsp', 'task']).describe('self — заявлен, resume — из резюме, test — подтверждён тестом, fsp — из достижений ФСП, task — из регулярного задания'),
  "verified": zod.boolean().describe('Подтверждён тестом, заданием или ФСП'),
  "score": zod.int().min(getMyCardPreviewResponseSkillsItemScoreMin).max(getMyCardPreviewResponseSkillsItemScoreMax).nullable().describe('Балл по навыку в тесте, если подтверждён тестом')
})),
  "experience_years": zod.number(),
  "experience": zod.array(zod.object({
  "role": zod.string(),
  "company_name": zod.string().nullable().describe('`null`, если кандидат скрыл названия компаний'),
  "company_hidden": zod.boolean(),
  "industry": zod.union([zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),zod.null()]),
  "start": zod.string().regex(getMyCardPreviewResponseExperienceItemStartRegExp).describe('Месяц начала YYYY-MM'),
  "end": zod.string().regex(getMyCardPreviewResponseExperienceItemEndRegExp).nullable().describe('Месяц окончания, `null` — по настоящее время'),
  "description": zod.string().max(getMyCardPreviewResponseExperienceItemDescriptionMax).nullable()
})),
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])),
  "city": zod.string().nullable().describe('`null`, если кандидат скрыл город'),
  "relocation": zod.boolean(),
  "salary_expectation": zod.union([zod.object({
  "from": zod.int().min(getMyCardPreviewResponseSalaryExpectationOneFromMin).max(getMyCardPreviewResponseSalaryExpectationOneFromMax),
  "to": zod.int().min(getMyCardPreviewResponseSalaryExpectationOneToMin).max(getMyCardPreviewResponseSalaryExpectationOneToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),zod.null()]),
  "availability": zod.enum(['active', 'open', 'not_looking']).describe('Ищу активно / открыт к предложениям / не ищу'),
  "last_active_at": zod.iso.datetime({"offset":true}).nullable(),
  "fsp": zod.union([zod.object({
  "has_history": zod.boolean(),
  "index": zod.int().min(getMyCardPreviewResponseFspOneIndexMin).max(getMyCardPreviewResponseFspOneIndexMax),
  "bonus": zod.number().min(getMyCardPreviewResponseFspOneBonusMin).max(getMyCardPreviewResponseFspOneBonusMax),
  "achievements_count": zod.int().min(getMyCardPreviewResponseFspOneAchievementsCountMin),
  "top_achievement": zod.union([zod.object({
  "id": zod.uuid(),
  "event_id": zod.string(),
  "title": zod.string(),
  "date": zod.iso.date(),
  "level": zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),
  "discipline": zod.enum(['product', 'algorithmic', 'cybersecurity', 'robotics', 'uas']).describe('Продуктовое / алгоритмическое / кибербезопасность / робототехника / БАС'),
  "format": zod.enum(['individual', 'team']),
  "team": zod.string().nullable(),
  "role": zod.string().nullable(),
  "place": zod.int().min(1).nullable(),
  "participants_total": zod.int().min(1).nullable(),
  "percentile": zod.int().min(1).max(getMyCardPreviewResponseFspOneTopAchievementOnePercentileMax).nullable(),
  "result": zod.enum(['winner', 'prize_winner', 'finalist', 'participant']).describe('Победитель / призёр / финалист / участник'),
  "sport_rank": zod.string().nullable().describe('Спортивный разряд'),
  "certificate_url": zod.url().nullable(),
  "verified": zod.boolean().describe('Подпись реестра ФСП проверена')
}),zod.null()]),
  "max_level": zod.union([zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),zod.null()])
}),zod.null()]).describe('`null` — кандидат скрыл данные ФСП; `has_history=false` — истории нет (нейтрально)'),
  "task_signal": zod.object({
  "fresh": zod.boolean().describe('Бейдж «свежий сигнал» за хорошее решение регулярного задания'),
  "solved_count": zod.int().min(getMyCardPreviewResponseTaskSignalSolvedCountMin),
  "last_solved_at": zod.iso.datetime({"offset":true}).nullable()
}),
  "disclosure": zod.object({
  "revealed": zod.boolean(),
  "reason": zod.union([zod.enum(['invitation_accepted', 'application']).describe('Почему компании раскрыты контакты'),zod.null()]),
  "revealed_at": zod.iso.datetime({"offset":true}).nullable(),
  "source_id": zod.uuid().nullable().describe('ID инвайта или отклика')
}),
  "contacts": zod.union([zod.object({
  "full_name": zod.string(),
  "email": zod.email(),
  "phone": zod.string().nullable(),
  "telegram": zod.string().nullable(),
  "preferred_channel": zod.enum(['email', 'phone', 'telegram'])
}),zod.null()]),
  "relation": zod.object({
  "invitation": zod.union([zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed'])
}),zod.null()]),
  "application": zod.union([zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']),
  "vacancy_id": zod.uuid()
}),zod.null()])
}).describe('Отношения кандидата с компанией текущего работодателя')
}).describe('Карточка кандидата для работодателя. До раскрытия анонимна: нет ФИО, фото, возраста, контактов,\nназвания компаний скрыты по настройке. `contacts` не `null` только при `disclosure.revealed`.\n')


/**
 * @summary Настройки приватности
 */
export const getMyPrivacyResponseSalaryFloorMin = 10000;



export const GetMyPrivacyResponse = zod.object({
  "availability": zod.enum(['active', 'open', 'not_looking']).describe('Ищу активно / открыт к предложениям / не ищу'),
  "salary_floor": zod.int().min(getMyPrivacyResponseSalaryFloorMin).nullable().describe('Скрытый минимум (₽/мес на руки). Работодатель его не видит.'),
  "hidden_companies": zod.array(zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
})),
  "show_fsp": zod.boolean().describe('Показывать работодателям достижения ФСП'),
  "show_company_names": zod.boolean().describe('Показывать названия компаний в опыте'),
  "show_city": zod.boolean(),
  "profile_published": zod.boolean().describe('Профиль в выдаче (есть согласие profile_visibility, грейд подтверждён и статус не «не ищу»)')
})


/**
 * @summary Изменить настройки приватности
 */
export const updateMyPrivacyBodySalaryFloorMin = 10000;
export const updateMyPrivacyBodySalaryFloorMax = 10000000;

export const updateMyPrivacyBodyHiddenCompanyIdsMax = 50;



export const UpdateMyPrivacyBody = zod.object({
  "availability": zod.enum(['active', 'open', 'not_looking']).describe('Ищу активно / открыт к предложениям / не ищу'),
  "salary_floor": zod.int().min(updateMyPrivacyBodySalaryFloorMin).max(updateMyPrivacyBodySalaryFloorMax).nullable(),
  "hidden_company_ids": zod.array(zod.uuid()).max(updateMyPrivacyBodyHiddenCompanyIdsMax),
  "show_fsp": zod.boolean(),
  "show_company_names": zod.boolean(),
  "show_city": zod.boolean()
})

export const updateMyPrivacyResponseSalaryFloorMin = 10000;



export const UpdateMyPrivacyResponse = zod.object({
  "availability": zod.enum(['active', 'open', 'not_looking']).describe('Ищу активно / открыт к предложениям / не ищу'),
  "salary_floor": zod.int().min(updateMyPrivacyResponseSalaryFloorMin).nullable().describe('Скрытый минимум (₽/мес на руки). Работодатель его не видит.'),
  "hidden_companies": zod.array(zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
})),
  "show_fsp": zod.boolean().describe('Показывать работодателям достижения ФСП'),
  "show_company_names": zod.boolean().describe('Показывать названия компаний в опыте'),
  "show_city": zod.boolean(),
  "profile_published": zod.boolean().describe('Профиль в выдаче (есть согласие profile_visibility, грейд подтверждён и статус не «не ищу»)')
})


/**
 * Данные опроса обновляют профиль (специализация, стек как `self`, формат, город, ожидания).
 * @summary Пройти опрос (отрасль, специализация, стек, стаж, формат, ожидания)
 */
export const createSurveyBodyIndustriesMax = 5;

export const createSurveyBodyPrimaryStackMax = 15;

export const createSurveyBodyExperienceYearsMin = 0;
export const createSurveyBodyExperienceYearsMax = 50;


export const createSurveyBodyCityMax = 100;

export const createSurveyBodySalaryExpectationFromMin = 10000;
export const createSurveyBodySalaryExpectationFromMax = 10000000;

export const createSurveyBodySalaryExpectationToMin = 10000;
export const createSurveyBodySalaryExpectationToMax = 10000000;



export const CreateSurveyBody = zod.object({
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])).min(1).max(createSurveyBodyIndustriesMax),
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "primary_stack": zod.array(zod.string()).min(1).max(createSurveyBodyPrimaryStackMax).describe('ID навыков из справочника'),
  "experience_years": zod.number().min(createSurveyBodyExperienceYearsMin).max(createSurveyBodyExperienceYearsMax),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])).min(1),
  "city": zod.string().max(createSurveyBodyCityMax).nullable(),
  "relocation": zod.boolean(),
  "salary_expectation": zod.object({
  "from": zod.int().min(createSurveyBodySalaryExpectationFromMin).max(createSurveyBodySalaryExpectationFromMax),
  "to": zod.int().min(createSurveyBodySalaryExpectationToMin).max(createSurveyBodySalaryExpectationToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.')
})

export const createSurveyResponseOneIndustriesMax = 5;

export const createSurveyResponseOnePrimaryStackMax = 15;

export const createSurveyResponseOneExperienceYearsMin = 0;
export const createSurveyResponseOneExperienceYearsMax = 50;


export const createSurveyResponseOneCityMax = 100;

export const createSurveyResponseOneSalaryExpectationFromMin = 10000;
export const createSurveyResponseOneSalaryExpectationFromMax = 10000000;

export const createSurveyResponseOneSalaryExpectationToMin = 10000;
export const createSurveyResponseOneSalaryExpectationToMax = 10000000;



export const CreateSurveyResponse = zod.object({
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])).min(1).max(createSurveyResponseOneIndustriesMax),
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "primary_stack": zod.array(zod.string()).min(1).max(createSurveyResponseOnePrimaryStackMax).describe('ID навыков из справочника'),
  "experience_years": zod.number().min(createSurveyResponseOneExperienceYearsMin).max(createSurveyResponseOneExperienceYearsMax),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])).min(1),
  "city": zod.string().max(createSurveyResponseOneCityMax).nullable(),
  "relocation": zod.boolean(),
  "salary_expectation": zod.object({
  "from": zod.int().min(createSurveyResponseOneSalaryExpectationFromMin).max(createSurveyResponseOneSalaryExpectationFromMax),
  "to": zod.int().min(createSurveyResponseOneSalaryExpectationToMin).max(createSurveyResponseOneSalaryExpectationToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.')
}).and(zod.object({
  "id": zod.uuid(),
  "created_at": zod.iso.datetime({"offset":true})
}))


/**
 * @summary История опросов (новые сверху)
 */
export const listMySurveysResponseOneIndustriesMax = 5;

export const listMySurveysResponseOnePrimaryStackMax = 15;

export const listMySurveysResponseOneExperienceYearsMin = 0;
export const listMySurveysResponseOneExperienceYearsMax = 50;


export const listMySurveysResponseOneCityMax = 100;

export const listMySurveysResponseOneSalaryExpectationFromMin = 10000;
export const listMySurveysResponseOneSalaryExpectationFromMax = 10000000;

export const listMySurveysResponseOneSalaryExpectationToMin = 10000;
export const listMySurveysResponseOneSalaryExpectationToMax = 10000000;



export const ListMySurveysResponseItem = zod.object({
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])).min(1).max(listMySurveysResponseOneIndustriesMax),
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "primary_stack": zod.array(zod.string()).min(1).max(listMySurveysResponseOnePrimaryStackMax).describe('ID навыков из справочника'),
  "experience_years": zod.number().min(listMySurveysResponseOneExperienceYearsMin).max(listMySurveysResponseOneExperienceYearsMax),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])).min(1),
  "city": zod.string().max(listMySurveysResponseOneCityMax).nullable(),
  "relocation": zod.boolean(),
  "salary_expectation": zod.object({
  "from": zod.int().min(listMySurveysResponseOneSalaryExpectationFromMin).max(listMySurveysResponseOneSalaryExpectationFromMax),
  "to": zod.int().min(listMySurveysResponseOneSalaryExpectationToMin).max(listMySurveysResponseOneSalaryExpectationToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.')
}).and(zod.object({
  "id": zod.uuid(),
  "created_at": zod.iso.datetime({"offset":true})
}))
export const ListMySurveysResponse = zod.array(ListMySurveysResponseItem)


/**
 * @summary Какие грейды можно выбрать сейчас и когда следующая попытка
 */
export const GetMyTestEligibilityQueryParams = zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).optional().describe('По умолчанию — из последнего опроса')
})

export const GetMyTestEligibilityResponse = zod.object({
  "specialization": zod.union([zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),zod.null()]),
  "current_grade": zod.union([zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),zod.null()]),
  "last_grade_change_at": zod.iso.datetime({"offset":true}).nullable(),
  "next_grade_change_at": zod.iso.datetime({"offset":true}).nullable().describe('Когда подтверждённый грейд снова можно сменить (90 дней)'),
  "active_test_id": zod.uuid().nullable(),
  "grades": zod.array(zod.object({
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "can_start": zod.boolean(),
  "reason": zod.union([zod.enum(['grade_change_cooldown', 'retake_cooldown', 'lower_attempt_used', 'test_in_progress', 'survey_required']).describe('grade_change_cooldown — 90 дней со смены грейда; retake_cooldown — 30 дней с попытки на этот грейд; lower_attempt_used — попытка на грейд ниже после провала уже использована; test_in_progress — есть незавершённый тест; survey_required — нет опроса'),zod.null()]),
  "available_at": zod.iso.datetime({"offset":true}).nullable().describe('Когда станет доступно (если `can_start = false` из-за срока)'),
  "recommended": zod.boolean().describe('Рекомендуем по стажу из опроса')
}))
})


/**
 * @summary Начать тест на заявленный грейд
 */
export const StartTestBody = zod.object({
  "declared_grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).optional().describe('По умолчанию из последнего опроса'),
  "vacancy_id": zod.uuid().nullish().describe('Построить бланк теста под вакансию')
})

export const startTestResponseProgressAnsweredMin = 0;

export const startTestResponseProgressAdaptiveAnsweredMin = 0;

export const startTestResponseProgressPracticeAnsweredMin = 0;

export const startTestResponseProgressPracticeTotalMin = 0;



export const StartTestResponse = zod.object({
  "express": zod.boolean().optional(),
  "id": zod.uuid(),
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "declared_grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "status": zod.enum(['in_progress', 'finished', 'expired', 'abandoned']),
  "started_at": zod.iso.datetime({"offset":true}),
  "deadline_at": zod.iso.datetime({"offset":true}),
  "finished_at": zod.iso.datetime({"offset":true}).nullable(),
  "time_limit_sec": zod.int(),
  "progress": zod.object({
  "block": zod.enum(['adaptive', 'practice', 'approach']).describe('A — адаптивный, B — практика, C — подход (опционально)'),
  "answered": zod.int().min(startTestResponseProgressAnsweredMin).describe('Всего ответов'),
  "adaptive_answered": zod.int().min(startTestResponseProgressAdaptiveAnsweredMin),
  "adaptive_min": zod.int(),
  "adaptive_max": zod.int(),
  "practice_answered": zod.int().min(startTestResponseProgressPracticeAnsweredMin),
  "practice_total": zod.int().min(startTestResponseProgressPracticeTotalMin).describe('0 — практический блок выключен')
}),
  "vacancy_id": zod.uuid().nullable()
})


/**
 * @summary История тестов (новые сверху)
 */
export const listMyTestsResponsePercentileMax = 99;



export const ListMyTestsResponseItem = zod.object({
  "express": zod.boolean().optional(),
  "id": zod.uuid(),
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "declared_grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "status": zod.enum(['in_progress', 'finished', 'expired', 'abandoned']),
  "outcome": zod.union([zod.enum(['passed', 'passed_confident', 'failed']).describe('passed — P(θ ≥ cut) ≥ 0.7; passed_confident — ещё и P(θ ≥ cut следующего) ≥ 0.7; failed'),zod.null()]),
  "assigned_grade": zod.union([zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),zod.null()]),
  "percentile": zod.int().min(1).max(listMyTestsResponsePercentileMax).nullable(),
  "started_at": zod.iso.datetime({"offset":true}),
  "finished_at": zod.iso.datetime({"offset":true}).nullable()
})
export const ListMyTestsResponse = zod.array(ListMyTestsResponseItem)


/**
 * @summary Состояние сессии теста
 */
export const GetTestParams = zod.object({
  "test_id": zod.uuid()
})

export const getTestResponseProgressAnsweredMin = 0;

export const getTestResponseProgressAdaptiveAnsweredMin = 0;

export const getTestResponseProgressPracticeAnsweredMin = 0;

export const getTestResponseProgressPracticeTotalMin = 0;



export const GetTestResponse = zod.object({
  "express": zod.boolean().optional(),
  "id": zod.uuid(),
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "declared_grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "status": zod.enum(['in_progress', 'finished', 'expired', 'abandoned']),
  "started_at": zod.iso.datetime({"offset":true}),
  "deadline_at": zod.iso.datetime({"offset":true}),
  "finished_at": zod.iso.datetime({"offset":true}).nullable(),
  "time_limit_sec": zod.int(),
  "progress": zod.object({
  "block": zod.enum(['adaptive', 'practice', 'approach']).describe('A — адаптивный, B — практика, C — подход (опционально)'),
  "answered": zod.int().min(getTestResponseProgressAnsweredMin).describe('Всего ответов'),
  "adaptive_answered": zod.int().min(getTestResponseProgressAdaptiveAnsweredMin),
  "adaptive_min": zod.int(),
  "adaptive_max": zod.int(),
  "practice_answered": zod.int().min(getTestResponseProgressPracticeAnsweredMin),
  "practice_total": zod.int().min(getTestResponseProgressPracticeTotalMin).describe('0 — практический блок выключен')
}),
  "vacancy_id": zod.uuid().nullable()
})


/**
 * Идемпотентно: пока на текущее задание нет ответа, возвращается оно же.
 * Когда критерий остановки достигнут (SE(θ) < 0.35 после минимума заданий, или максимум,
 * и практический блок сдан), возвращается `status: ready_to_finish` и `item: null`.
 * @summary Следующее задание (CAT)
 */
export const GetNextTestItemParams = zod.object({
  "test_id": zod.uuid()
})


export const getNextTestItemResponseItemOneDifficultyLevelMax = 5;

export const getNextTestItemResponseProgressAnsweredMin = 0;

export const getNextTestItemResponseProgressAdaptiveAnsweredMin = 0;

export const getNextTestItemResponseProgressPracticeAnsweredMin = 0;

export const getNextTestItemResponseProgressPracticeTotalMin = 0;



export const GetNextTestItemResponse = zod.object({
  "status": zod.enum(['item', 'ready_to_finish']),
  "item": zod.union([zod.object({
  "instance_id": zod.uuid(),
  "index": zod.int().min(1).describe('Порядковый номер в сессии'),
  "block": zod.enum(['adaptive', 'practice', 'approach']).describe('A — адаптивный, B — практика, C — подход (опционально)'),
  "type": zod.enum(['single_choice', 'multiple_choice', 'short_answer', 'code', 'open_text']),
  "competency": zod.object({
  "id": zod.string(),
  "name": zod.string()
}),
  "difficulty_level": zod.int().min(1).max(getNextTestItemResponseItemOneDifficultyLevelMax).describe('Сложность задания (квантиль параметра b), показывается кандидату'),
  "title": zod.string(),
  "prompt": zod.string().describe('Текст задания (простая разметка — абзацы через пустую строку, `код` в обратных кавычках)'),
  "code": zod.union([zod.object({
  "language": zod.enum(['python', 'go', 'javascript', 'typescript', 'java', 'sql', 'yaml', 'text']),
  "source": zod.string()
}),zod.null()]).describe('Фрагмент кода для чтения'),
  "options": zod.union([zod.array(zod.object({
  "id": zod.string(),
  "text": zod.string()
})),zod.null()]).describe('Для single_choice и multiple_choice'),
  "answer_language": zod.union([zod.enum(['python', 'go', 'javascript', 'typescript', 'java', 'sql', 'yaml', 'text']),zod.null()]).describe('Язык ответа для type=code'),
  "starter_code": zod.string().nullable(),
  "max_length": zod.int().nullable().describe('Лимит символов для short_answer и open_text'),
  "public_tests": zod.union([zod.array(zod.object({
  "name": zod.string(),
  "input": zod.string(),
  "expected": zod.string()
})),zod.null()]).describe('Открытые тесты практического задания')
}).describe('Экземпляр задания. Семейство, параметры и правильный ответ не раскрываются.'),zod.null()]),
  "progress": zod.object({
  "block": zod.enum(['adaptive', 'practice', 'approach']).describe('A — адаптивный, B — практика, C — подход (опционально)'),
  "answered": zod.int().min(getNextTestItemResponseProgressAnsweredMin).describe('Всего ответов'),
  "adaptive_answered": zod.int().min(getNextTestItemResponseProgressAdaptiveAnsweredMin),
  "adaptive_min": zod.int(),
  "adaptive_max": zod.int(),
  "practice_answered": zod.int().min(getNextTestItemResponseProgressPracticeAnsweredMin),
  "practice_total": zod.int().min(getNextTestItemResponseProgressPracticeTotalMin).describe('0 — практический блок выключен')
}),
  "deadline_at": zod.iso.datetime({"offset":true})
})


/**
 * Правильность ответа во время теста не раскрывается. `rt_ms`, вставки и потеря фокуса идут в модель времени ответа и флаги (не автоматический провал).
 * @summary Ответ на текущее задание
 */
export const SubmitTestAnswerParams = zod.object({
  "test_id": zod.uuid()
})

export const submitTestAnswerBodyAnswerTextMax = 4000;

export const submitTestAnswerBodyAnswerCodeMax = 20000;

export const submitTestAnswerBodyRtMsMin = 0;

export const submitTestAnswerBodyPasteCountMin = 0;

export const submitTestAnswerBodyFocusLostCountMin = 0;



export const SubmitTestAnswerBody = zod.object({
  "instance_id": zod.uuid(),
  "answer": zod.object({
  "option_ids": zod.array(zod.string()).optional(),
  "text": zod.string().max(submitTestAnswerBodyAnswerTextMax).optional(),
  "code": zod.string().max(submitTestAnswerBodyAnswerCodeMax).optional(),
  "language": zod.enum(['python', 'go', 'javascript', 'typescript', 'java', 'sql', 'yaml', 'text']).optional(),
  "skipped": zod.boolean().optional()
}).describe('single_choice/multiple_choice — option_ids; short_answer/open_text — text; code — code + language; skipped — пропуск'),
  "rt_ms": zod.int().min(submitTestAnswerBodyRtMsMin).describe('Время ответа, мс'),
  "paste_count": zod.int().min(submitTestAnswerBodyPasteCountMin).describe('Вставок из буфера на этом задании'),
  "focus_lost_count": zod.int().min(submitTestAnswerBodyFocusLostCountMin).describe('Потерь фокуса вкладки на этом задании')
})

export const submitTestAnswerResponseProgressAnsweredMin = 0;

export const submitTestAnswerResponseProgressAdaptiveAnsweredMin = 0;

export const submitTestAnswerResponseProgressPracticeAnsweredMin = 0;

export const submitTestAnswerResponseProgressPracticeTotalMin = 0;



export const SubmitTestAnswerResponse = zod.object({
  "accepted": zod.boolean(),
  "progress": zod.object({
  "block": zod.enum(['adaptive', 'practice', 'approach']).describe('A — адаптивный, B — практика, C — подход (опционально)'),
  "answered": zod.int().min(submitTestAnswerResponseProgressAnsweredMin).describe('Всего ответов'),
  "adaptive_answered": zod.int().min(submitTestAnswerResponseProgressAdaptiveAnsweredMin),
  "adaptive_min": zod.int(),
  "adaptive_max": zod.int(),
  "practice_answered": zod.int().min(submitTestAnswerResponseProgressPracticeAnsweredMin),
  "practice_total": zod.int().min(submitTestAnswerResponseProgressPracticeTotalMin).describe('0 — практический блок выключен')
})
})


/**
 * @summary Прогнать код практического задания на открытых тестах (песочница)
 */
export const RunTestCodeParams = zod.object({
  "test_id": zod.uuid()
})

export const runTestCodeBodyCodeMax = 20000;



export const RunTestCodeBody = zod.object({
  "instance_id": zod.uuid(),
  "code": zod.string().max(runTestCodeBodyCodeMax),
  "language": zod.enum(['python', 'go', 'javascript', 'typescript', 'java', 'sql', 'yaml', 'text'])
})

export const runTestCodeResponsePassedMin = 0;

export const runTestCodeResponseTotalMin = 0;

export const runTestCodeResponseDurationMsMin = 0;



export const RunTestCodeResponse = zod.object({
  "status": zod.enum(['ok', 'compile_error', 'runtime_error', 'timeout']),
  "passed": zod.int().min(runTestCodeResponsePassedMin),
  "total": zod.int().min(runTestCodeResponseTotalMin),
  "duration_ms": zod.int().min(runTestCodeResponseDurationMsMin),
  "cases": zod.array(zod.object({
  "name": zod.string(),
  "passed": zod.boolean(),
  "actual": zod.string().nullable(),
  "stderr": zod.string().nullable()
}))
})


/**
 * Можно вызвать досрочно (оставшиеся задания считаются пропущенными). Повторный вызов возвращает тот же результат.
 * @summary Завершить тест и получить результат
 */
export const FinishTestParams = zod.object({
  "test_id": zod.uuid()
})

export const finishTestResponsePercentileMax = 99;

export const finishTestResponseConfirmedSkillsItemScoreMin = 0;
export const finishTestResponseConfirmedSkillsItemScoreMax = 100;

export const finishTestResponseCompetenciesItemScoreMin = 0;
export const finishTestResponseCompetenciesItemScoreMax = 100;

export const finishTestResponseCompetenciesItemItemsMin = 0;

export const finishTestResponseTraceItemDifficultyLevelMax = 5;



export const FinishTestResponse = zod.object({
  "express": zod.boolean().optional(),
  "test_id": zod.uuid(),
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "declared_grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "outcome": zod.enum(['passed', 'passed_confident', 'failed']).describe('passed — P(θ ≥ cut) ≥ 0.7; passed_confident — ещё и P(θ ≥ cut следующего) ≥ 0.7; failed'),
  "assigned_grade": zod.union([zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),zod.null()]).describe('Подтверждённый грейд по итогам. При провале — прежний подтверждённый (не понижается принудительно) или `null`'),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "percentile": zod.int().min(1).max(finishTestResponsePercentileMax).nullable().describe('Перцентиль θ внутри категории'),
  "theta": zod.number().describe('Оценка способности θ (EAP)'),
  "se": zod.number().describe('Стандартная ошибка θ'),
  "confidence": zod.enum(['high', 'medium', 'low']).describe('Уверенность с учётом SE и флагов'),
  "confirmed_skills": zod.array(zod.object({
  "skill_id": zod.string(),
  "name": zod.string(),
  "level": zod.enum(['basic', 'confident', 'advanced']),
  "source": zod.enum(['self', 'resume', 'test', 'fsp', 'task']).describe('self — заявлен, resume — из резюме, test — подтверждён тестом, fsp — из достижений ФСП, task — из регулярного задания'),
  "verified": zod.boolean().describe('Подтверждён тестом, заданием или ФСП'),
  "score": zod.int().min(finishTestResponseConfirmedSkillsItemScoreMin).max(finishTestResponseConfirmedSkillsItemScoreMax).nullable().describe('Балл по навыку в тесте, если подтверждён тестом')
})),
  "competencies": zod.array(zod.object({
  "competency_id": zod.string(),
  "name": zod.string(),
  "score": zod.int().min(finishTestResponseCompetenciesItemScoreMin).max(finishTestResponseCompetenciesItemScoreMax),
  "items": zod.int().min(finishTestResponseCompetenciesItemItemsMin)
})),
  "suggestion": zod.object({
  "action": zod.enum(['try_higher', 'try_lower', 'none']),
  "grade": zod.union([zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),zod.null()]),
  "available_at": zod.iso.datetime({"offset":true}).nullable().describe('`null` — доступно сразу'),
  "message": zod.string()
}),
  "flags": zod.array(zod.object({
  "code": zod.enum(['fast_correct', 'paste', 'focus_loss']),
  "severity": zod.enum(['info', 'warning']),
  "message": zod.string()
})),
  "items_answered": zod.int(),
  "duration_sec": zod.int(),
  "finished_at": zod.iso.datetime({"offset":true}),
  "next_retake_at": zod.iso.datetime({"offset":true}).nullable().describe('Повтор на тот же грейд (через 30 дней)'),
  "next_grade_change_at": zod.iso.datetime({"offset":true}).nullable().describe('Следующая смена подтверждённого грейда (через 90 дней)'),
  "trace": zod.array(zod.object({
  "index": zod.int(),
  "difficulty_level": zod.int().min(1).max(finishTestResponseTraceItemDifficultyLevelMax),
  "correct": zod.boolean(),
  "theta": zod.number(),
  "se": zod.number()
})).describe('Траектория CAT по заданиям (для графика «как менялась сложность»)')
})


/**
 * @summary Результат завершённого теста
 */
export const GetTestResultParams = zod.object({
  "test_id": zod.uuid()
})

export const getTestResultResponsePercentileMax = 99;

export const getTestResultResponseConfirmedSkillsItemScoreMin = 0;
export const getTestResultResponseConfirmedSkillsItemScoreMax = 100;

export const getTestResultResponseCompetenciesItemScoreMin = 0;
export const getTestResultResponseCompetenciesItemScoreMax = 100;

export const getTestResultResponseCompetenciesItemItemsMin = 0;

export const getTestResultResponseTraceItemDifficultyLevelMax = 5;



export const GetTestResultResponse = zod.object({
  "express": zod.boolean().optional(),
  "test_id": zod.uuid(),
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "declared_grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "outcome": zod.enum(['passed', 'passed_confident', 'failed']).describe('passed — P(θ ≥ cut) ≥ 0.7; passed_confident — ещё и P(θ ≥ cut следующего) ≥ 0.7; failed'),
  "assigned_grade": zod.union([zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),zod.null()]).describe('Подтверждённый грейд по итогам. При провале — прежний подтверждённый (не понижается принудительно) или `null`'),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "percentile": zod.int().min(1).max(getTestResultResponsePercentileMax).nullable().describe('Перцентиль θ внутри категории'),
  "theta": zod.number().describe('Оценка способности θ (EAP)'),
  "se": zod.number().describe('Стандартная ошибка θ'),
  "confidence": zod.enum(['high', 'medium', 'low']).describe('Уверенность с учётом SE и флагов'),
  "confirmed_skills": zod.array(zod.object({
  "skill_id": zod.string(),
  "name": zod.string(),
  "level": zod.enum(['basic', 'confident', 'advanced']),
  "source": zod.enum(['self', 'resume', 'test', 'fsp', 'task']).describe('self — заявлен, resume — из резюме, test — подтверждён тестом, fsp — из достижений ФСП, task — из регулярного задания'),
  "verified": zod.boolean().describe('Подтверждён тестом, заданием или ФСП'),
  "score": zod.int().min(getTestResultResponseConfirmedSkillsItemScoreMin).max(getTestResultResponseConfirmedSkillsItemScoreMax).nullable().describe('Балл по навыку в тесте, если подтверждён тестом')
})),
  "competencies": zod.array(zod.object({
  "competency_id": zod.string(),
  "name": zod.string(),
  "score": zod.int().min(getTestResultResponseCompetenciesItemScoreMin).max(getTestResultResponseCompetenciesItemScoreMax),
  "items": zod.int().min(getTestResultResponseCompetenciesItemItemsMin)
})),
  "suggestion": zod.object({
  "action": zod.enum(['try_higher', 'try_lower', 'none']),
  "grade": zod.union([zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),zod.null()]),
  "available_at": zod.iso.datetime({"offset":true}).nullable().describe('`null` — доступно сразу'),
  "message": zod.string()
}),
  "flags": zod.array(zod.object({
  "code": zod.enum(['fast_correct', 'paste', 'focus_loss']),
  "severity": zod.enum(['info', 'warning']),
  "message": zod.string()
})),
  "items_answered": zod.int(),
  "duration_sec": zod.int(),
  "finished_at": zod.iso.datetime({"offset":true}),
  "next_retake_at": zod.iso.datetime({"offset":true}).nullable().describe('Повтор на тот же грейд (через 30 дней)'),
  "next_grade_change_at": zod.iso.datetime({"offset":true}).nullable().describe('Следующая смена подтверждённого грейда (через 90 дней)'),
  "trace": zod.array(zod.object({
  "index": zod.int(),
  "difficulty_level": zod.int().min(1).max(getTestResultResponseTraceItemDifficultyLevelMax),
  "correct": zod.boolean(),
  "theta": zod.number(),
  "se": zod.number()
})).describe('Траектория CAT по заданиям (для графика «как менялась сложность»)')
})


/**
 * @summary История подтверждённых грейдов
 */
export const GetMyGradeHistoryResponseItem = zod.object({
  "id": zod.uuid(),
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "previous_grade": zod.union([zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),zod.null()]),
  "changed_at": zod.iso.datetime({"offset":true}),
  "test_id": zod.uuid().nullable(),
  "reason": zod.enum(['test_passed', 'test_lower', 'admin'])
})
export const GetMyGradeHistoryResponse = zod.array(GetMyGradeHistoryResponseItem)


/**
 * Только семейства со статусом `showcase`, выведенные из ротации, поэтому показ не создаёт утечку.
 * @summary Витринные семейства заданий (экран «Как работает тест»)
 */
export const ListShowcaseFamiliesResponseItem = zod.object({
  "id": zod.string(),
  "title": zod.string(),
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "competency": zod.string(),
  "type": zod.enum(['single_choice', 'multiple_choice', 'short_answer', 'code', 'open_text']),
  "a": zod.number().describe('Дискриминативность (2PL)'),
  "b": zod.number().describe('Сложность (2PL)')
})
export const ListShowcaseFamiliesResponse = zod.array(ListShowcaseFamiliesResponseItem)


/**
 * @summary Семейство задания с тремя экземплярами и параметрами IRT
 */
export const GetShowcaseFamilyParams = zod.object({
  "family_id": zod.string()
})


export const getShowcaseFamilyResponseTwoExposureRateMin = 0;
export const getShowcaseFamilyResponseTwoExposureRateMax = 1;



export const GetShowcaseFamilyResponse = zod.object({
  "id": zod.string(),
  "title": zod.string(),
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "competency": zod.string(),
  "type": zod.enum(['single_choice', 'multiple_choice', 'short_answer', 'code', 'open_text']),
  "a": zod.number().describe('Дискриминативность (2PL)'),
  "b": zod.number().describe('Сложность (2PL)')
}).and(zod.object({
  "description": zod.string(),
  "template": zod.string().describe('Шаблон с плейсхолдерами `{{param}}`'),
  "params": zod.array(zod.object({
  "name": zod.string(),
  "description": zod.string(),
  "domain": zod.string()
})),
  "instances": zod.array(zod.object({
  "seed": zod.int(),
  "params": zod.record(zod.string(), zod.unknown()),
  "title": zod.string(),
  "prompt": zod.string(),
  "code": zod.union([zod.object({
  "language": zod.enum(['python', 'go', 'javascript', 'typescript', 'java', 'sql', 'yaml', 'text']),
  "source": zod.string()
}),zod.null()]),
  "options": zod.union([zod.array(zod.object({
  "id": zod.string(),
  "text": zod.string()
})),zod.null()]),
  "correct_answer": zod.string().describe('Только для витрины — вычислен из параметров')
})).min(1),
  "exposure_rate": zod.number().min(getShowcaseFamilyResponseTwoExposureRateMin).max(getShowcaseFamilyResponseTwoExposureRateMax).describe('Доля сессий, где встречалось семейство (цель ≤ 0.2)'),
  "calibration_n": zod.int().describe('Размер выборки калибровки')
}))


/**
 * Если ФСП ID не привязан или истории нет, приходит `linked`/`has_history` = false, `index` = 0, `bonus` = 0 — это нормальный нейтральный случай, не ошибка.
 * @summary Мой профиль ФСП (достижения, индекс, разбивка)
 */
export const getMyFspResponseIndexMin = 0;
export const getMyFspResponseIndexMax = 100;

export const getMyFspResponseBonusMin = 0;
export const getMyFspResponseBonusMax = 30;

export const getMyFspResponseComponentsItemRelevanceMin = 0;
export const getMyFspResponseComponentsItemRelevanceMax = 1;

export const getMyFspResponseComponentsItemDecayMin = 0;
export const getMyFspResponseComponentsItemDecayMax = 1;



export const getMyFspResponseAchievementsItemPercentileMax = 99;



export const GetMyFspResponse = zod.object({
  "linked": zod.boolean(),
  "fsp_id": zod.string().nullable(),
  "verified_at": zod.iso.datetime({"offset":true}).nullable(),
  "has_history": zod.boolean().describe('`false` — нейтральное состояние «Нет истории ФСП» (бонус 0, без штрафа)'),
  "index": zod.int().min(getMyFspResponseIndexMin).max(getMyFspResponseIndexMax).describe('ФСП-индекс'),
  "bonus": zod.number().min(getMyFspResponseBonusMin).max(getMyFspResponseBonusMax).describe('Бонус к силе профиля'),
  "components": zod.array(zod.object({
  "achievement_id": zod.uuid(),
  "title": zod.string(),
  "level_weight": zod.number(),
  "result_weight": zod.number(),
  "relevance": zod.number().min(getMyFspResponseComponentsItemRelevanceMin).max(getMyFspResponseComponentsItemRelevanceMax).describe('Релевантность дисциплины специализации'),
  "decay": zod.number().min(getMyFspResponseComponentsItemDecayMin).max(getMyFspResponseComponentsItemDecayMax).describe('Затухание (период полураспада 2 года)'),
  "contribution": zod.number().describe('Вклад в индекс, баллы')
})),
  "achievements": zod.array(zod.object({
  "id": zod.uuid(),
  "event_id": zod.string(),
  "title": zod.string(),
  "date": zod.iso.date(),
  "level": zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),
  "discipline": zod.enum(['product', 'algorithmic', 'cybersecurity', 'robotics', 'uas']).describe('Продуктовое / алгоритмическое / кибербезопасность / робототехника / БАС'),
  "format": zod.enum(['individual', 'team']),
  "team": zod.string().nullable(),
  "role": zod.string().nullable(),
  "place": zod.int().min(1).nullable(),
  "participants_total": zod.int().min(1).nullable(),
  "percentile": zod.int().min(1).max(getMyFspResponseAchievementsItemPercentileMax).nullable(),
  "result": zod.enum(['winner', 'prize_winner', 'finalist', 'participant']).describe('Победитель / призёр / финалист / участник'),
  "sport_rank": zod.string().nullable().describe('Спортивный разряд'),
  "certificate_url": zod.url().nullable(),
  "verified": zod.boolean().describe('Подпись реестра ФСП проверена')
}))
})


/**
 * В проде привязка идёт через client-initiated account linking Keycloak (IdP `fsp`),
 * `fsp_id` сверяется с брокерской связью. Нужен `fsp_data` в согласиях (`403 consent_required`).
 * @summary Привязать ФСП ID и подтянуть достижения
 */
export const linkMyFspBodyFspIdRegExp = new RegExp('^FSP-\\d{2}-\\d{6}$');


export const LinkMyFspBody = zod.object({
  "fsp_id": zod.string().regex(linkMyFspBodyFspIdRegExp)
})

export const linkMyFspResponseIndexMin = 0;
export const linkMyFspResponseIndexMax = 100;

export const linkMyFspResponseBonusMin = 0;
export const linkMyFspResponseBonusMax = 30;

export const linkMyFspResponseComponentsItemRelevanceMin = 0;
export const linkMyFspResponseComponentsItemRelevanceMax = 1;

export const linkMyFspResponseComponentsItemDecayMin = 0;
export const linkMyFspResponseComponentsItemDecayMax = 1;



export const linkMyFspResponseAchievementsItemPercentileMax = 99;



export const LinkMyFspResponse = zod.object({
  "linked": zod.boolean(),
  "fsp_id": zod.string().nullable(),
  "verified_at": zod.iso.datetime({"offset":true}).nullable(),
  "has_history": zod.boolean().describe('`false` — нейтральное состояние «Нет истории ФСП» (бонус 0, без штрафа)'),
  "index": zod.int().min(linkMyFspResponseIndexMin).max(linkMyFspResponseIndexMax).describe('ФСП-индекс'),
  "bonus": zod.number().min(linkMyFspResponseBonusMin).max(linkMyFspResponseBonusMax).describe('Бонус к силе профиля'),
  "components": zod.array(zod.object({
  "achievement_id": zod.uuid(),
  "title": zod.string(),
  "level_weight": zod.number(),
  "result_weight": zod.number(),
  "relevance": zod.number().min(linkMyFspResponseComponentsItemRelevanceMin).max(linkMyFspResponseComponentsItemRelevanceMax).describe('Релевантность дисциплины специализации'),
  "decay": zod.number().min(linkMyFspResponseComponentsItemDecayMin).max(linkMyFspResponseComponentsItemDecayMax).describe('Затухание (период полураспада 2 года)'),
  "contribution": zod.number().describe('Вклад в индекс, баллы')
})),
  "achievements": zod.array(zod.object({
  "id": zod.uuid(),
  "event_id": zod.string(),
  "title": zod.string(),
  "date": zod.iso.date(),
  "level": zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),
  "discipline": zod.enum(['product', 'algorithmic', 'cybersecurity', 'robotics', 'uas']).describe('Продуктовое / алгоритмическое / кибербезопасность / робототехника / БАС'),
  "format": zod.enum(['individual', 'team']),
  "team": zod.string().nullable(),
  "role": zod.string().nullable(),
  "place": zod.int().min(1).nullable(),
  "participants_total": zod.int().min(1).nullable(),
  "percentile": zod.int().min(1).max(linkMyFspResponseAchievementsItemPercentileMax).nullable(),
  "result": zod.enum(['winner', 'prize_winner', 'finalist', 'participant']).describe('Победитель / призёр / финалист / участник'),
  "sport_rank": zod.string().nullable().describe('Спортивный разряд'),
  "certificate_url": zod.url().nullable(),
  "verified": zod.boolean().describe('Подпись реестра ФСП проверена')
}))
})


/**
 * @summary Отвязать ФСП ID (достижения перестают учитываться)
 */
export const unlinkMyFspResponseIndexMin = 0;
export const unlinkMyFspResponseIndexMax = 100;

export const unlinkMyFspResponseBonusMin = 0;
export const unlinkMyFspResponseBonusMax = 30;

export const unlinkMyFspResponseComponentsItemRelevanceMin = 0;
export const unlinkMyFspResponseComponentsItemRelevanceMax = 1;

export const unlinkMyFspResponseComponentsItemDecayMin = 0;
export const unlinkMyFspResponseComponentsItemDecayMax = 1;



export const unlinkMyFspResponseAchievementsItemPercentileMax = 99;



export const UnlinkMyFspResponse = zod.object({
  "linked": zod.boolean(),
  "fsp_id": zod.string().nullable(),
  "verified_at": zod.iso.datetime({"offset":true}).nullable(),
  "has_history": zod.boolean().describe('`false` — нейтральное состояние «Нет истории ФСП» (бонус 0, без штрафа)'),
  "index": zod.int().min(unlinkMyFspResponseIndexMin).max(unlinkMyFspResponseIndexMax).describe('ФСП-индекс'),
  "bonus": zod.number().min(unlinkMyFspResponseBonusMin).max(unlinkMyFspResponseBonusMax).describe('Бонус к силе профиля'),
  "components": zod.array(zod.object({
  "achievement_id": zod.uuid(),
  "title": zod.string(),
  "level_weight": zod.number(),
  "result_weight": zod.number(),
  "relevance": zod.number().min(unlinkMyFspResponseComponentsItemRelevanceMin).max(unlinkMyFspResponseComponentsItemRelevanceMax).describe('Релевантность дисциплины специализации'),
  "decay": zod.number().min(unlinkMyFspResponseComponentsItemDecayMin).max(unlinkMyFspResponseComponentsItemDecayMax).describe('Затухание (период полураспада 2 года)'),
  "contribution": zod.number().describe('Вклад в индекс, баллы')
})),
  "achievements": zod.array(zod.object({
  "id": zod.uuid(),
  "event_id": zod.string(),
  "title": zod.string(),
  "date": zod.iso.date(),
  "level": zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),
  "discipline": zod.enum(['product', 'algorithmic', 'cybersecurity', 'robotics', 'uas']).describe('Продуктовое / алгоритмическое / кибербезопасность / робототехника / БАС'),
  "format": zod.enum(['individual', 'team']),
  "team": zod.string().nullable(),
  "role": zod.string().nullable(),
  "place": zod.int().min(1).nullable(),
  "participants_total": zod.int().min(1).nullable(),
  "percentile": zod.int().min(1).max(unlinkMyFspResponseAchievementsItemPercentileMax).nullable(),
  "result": zod.enum(['winner', 'prize_winner', 'finalist', 'participant']).describe('Победитель / призёр / финалист / участник'),
  "sport_rank": zod.string().nullable().describe('Спортивный разряд'),
  "certificate_url": zod.url().nullable(),
  "verified": zod.boolean().describe('Подпись реестра ФСП проверена')
}))
})


/**
 * @summary Профиль своей компании
 */
export const getMyCompanyResponseDescriptionMax = 3000;

export const getMyCompanyResponseInnRegExp = new RegExp('^(\\d{10}|\\d{12})$');


export const GetMyCompanyResponse = zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "description": zod.string().max(getMyCompanyResponseDescriptionMax),
  "website": zod.url().nullable(),
  "city": zod.string().nullable(),
  "size": zod.enum(['1-50', '51-200', '201-1000', '1000+']),
  "inn": zod.string().regex(getMyCompanyResponseInnRegExp).nullable().describe('Необязателен в MVP'),
  "contact_email": zod.email(),
  "contact_phone": zod.string().nullable(),
  "verified": zod.boolean(),
  "created_at": zod.iso.datetime({"offset":true})
})


/**
 * @summary Изменить профиль компании
 */
export const updateMyCompanyBodyNameMin = 2;
export const updateMyCompanyBodyNameMax = 120;

export const updateMyCompanyBodyDescriptionMin = 20;
export const updateMyCompanyBodyDescriptionMax = 3000;

export const updateMyCompanyBodyInnRegExp = new RegExp('^(\\d{10}|\\d{12})$');


export const UpdateMyCompanyBody = zod.object({
  "name": zod.string().min(updateMyCompanyBodyNameMin).max(updateMyCompanyBodyNameMax),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "description": zod.string().min(updateMyCompanyBodyDescriptionMin).max(updateMyCompanyBodyDescriptionMax),
  "website": zod.url().nullish(),
  "city": zod.string().nullable(),
  "size": zod.enum(['1-50', '51-200', '201-1000', '1000+']),
  "inn": zod.string().regex(updateMyCompanyBodyInnRegExp).nullish(),
  "contact_email": zod.email(),
  "contact_phone": zod.string().nullish()
})

export const updateMyCompanyResponseDescriptionMax = 3000;

export const updateMyCompanyResponseInnRegExp = new RegExp('^(\\d{10}|\\d{12})$');


export const UpdateMyCompanyResponse = zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "description": zod.string().max(updateMyCompanyResponseDescriptionMax),
  "website": zod.url().nullable(),
  "city": zod.string().nullable(),
  "size": zod.enum(['1-50', '51-200', '201-1000', '1000+']),
  "inn": zod.string().regex(updateMyCompanyResponseInnRegExp).nullable().describe('Необязателен в MVP'),
  "contact_email": zod.email(),
  "contact_phone": zod.string().nullable(),
  "verified": zod.boolean(),
  "created_at": zod.iso.datetime({"offset":true})
})


/**
 * @summary Квота инвайтов на текущую неделю
 */
export const getInvitationQuotaResponseLimitMin = 0;

export const getInvitationQuotaResponseUsedMin = 0;

export const getInvitationQuotaResponseRemainingMin = 0;

export const getInvitationQuotaResponsePenaltyMin = 0;

export const getInvitationQuotaResponseAcceptanceRateMin = 0;
export const getInvitationQuotaResponseAcceptanceRateMax = 1;

export const getInvitationQuotaResponseBonusMin = 0;



export const GetInvitationQuotaResponse = zod.object({
  "limit": zod.int().min(getInvitationQuotaResponseLimitMin).describe('Итоговый лимит на неделю (база + бонус − штраф, не меньше 1)'),
  "used": zod.int().min(getInvitationQuotaResponseUsedMin),
  "remaining": zod.int().min(getInvitationQuotaResponseRemainingMin),
  "period_start": zod.iso.datetime({"offset":true}),
  "period_end": zod.iso.datetime({"offset":true}),
  "penalty": zod.int().min(getInvitationQuotaResponsePenaltyMin).optional().describe('Штраф за отзыв приглашений после согласия кандидата (2 за каждый)'),
  "acceptance_rate": zod.number().min(getInvitationQuotaResponseAcceptanceRateMin).max(getInvitationQuotaResponseAcceptanceRateMax).describe('Доля принятых инвайтов за 90 дней'),
  "bonus": zod.int().min(getInvitationQuotaResponseBonusMin).describe('Прибавка к базовой квоте за долю принятых')
})


/**
 * @summary Вакансии своей компании (все статусы)
 */
export const listMyCompanyVacanciesResponseSalaryFromMin = 10000;
export const listMyCompanyVacanciesResponseSalaryFromMax = 10000000;

export const listMyCompanyVacanciesResponseSalaryToMin = 10000;
export const listMyCompanyVacanciesResponseSalaryToMax = 10000000;

export const listMyCompanyVacanciesResponseMatchOneScoreMin = 0;
export const listMyCompanyVacanciesResponseMatchOneScoreMax = 100;



export const ListMyCompanyVacanciesResponseItem = zod.object({
  "id": zod.uuid(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
}),
  "title": zod.string(),
  "description": zod.string(),
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "must_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "nice_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "work_format": zod.enum(['office', 'hybrid', 'remote']),
  "city": zod.string().nullable(),
  "salary": zod.object({
  "from": zod.int().min(listMyCompanyVacanciesResponseSalaryFromMin).max(listMyCompanyVacanciesResponseSalaryFromMax),
  "to": zod.int().min(listMyCompanyVacanciesResponseSalaryToMin).max(listMyCompanyVacanciesResponseSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "status": zod.enum(['draft', 'published', 'closed']),
  "published_at": zod.iso.datetime({"offset":true}).nullable(),
  "created_at": zod.iso.datetime({"offset":true}),
  "applications_count": zod.int().nullable().describe('Только для работодателя-владельца'),
  "my_application": zod.union([zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'])
}),zod.null()]).describe('Только для кандидата'),
  "match": zod.union([zod.object({
  "score": zod.number().min(listMyCompanyVacanciesResponseMatchOneScoreMin).max(listMyCompanyVacanciesResponseMatchOneScoreMax),
  "chips": zod.array(zod.object({
  "kind": zod.enum(['skills_coverage', 'confirmed_skills', 'semantic', 'industry', 'conditions', 'percentile', 'fsp', 'tasks', 'completeness', 'missing_skill', 'penalty']),
  "label": zod.string(),
  "contribution": zod.number().describe('Вклад в итоговый Score, пункты (со знаком)'),
  "polarity": zod.enum(['positive', 'negative', 'neutral']),
  "evidence": zod.string().nullable()
}).describe('Вклад фактора в скоринг: `{factor, value, contribution, evidence}`'))
}),zod.null()]).describe('Соответствие профилю кандидата (только для кандидата с подтверждённым грейдом)')
})
export const ListMyCompanyVacanciesResponse = zod.array(ListMyCompanyVacanciesResponseItem)


/**
 * Текст разбирается в чипы (специализация, грейд, must/nice-навыки, формат, город, отрасль, вилка, если указана).
 * LLM работает с маскированием ПДн, без ключей — фолбэк на правилах и словаре синонимов.
 * Потребность создаётся черновиком; рекомендации доступны после подтверждения `PUT /needs/{need_id}`
 * с обязательной вилкой.
 * @summary Разобрать потребность из свободного текста
 */
export const createNeedBodyRawTextMin = 20;
export const createNeedBodyRawTextMax = 4000;



export const CreateNeedBody = zod.object({
  "raw_text": zod.string().min(createNeedBodyRawTextMin).max(createNeedBodyRawTextMax)
})

export const createNeedResponseParsedSalaryOneFromMin = 10000;
export const createNeedResponseParsedSalaryOneFromMax = 10000000;

export const createNeedResponseParsedSalaryOneToMin = 10000;
export const createNeedResponseParsedSalaryOneToMax = 10000000;

export const createNeedResponseConfirmedOneSalaryFromMin = 10000;
export const createNeedResponseConfirmedOneSalaryFromMax = 10000000;

export const createNeedResponseConfirmedOneSalaryToMin = 10000;
export const createNeedResponseConfirmedOneSalaryToMax = 10000000;



export const CreateNeedResponse = zod.object({
  "id": zod.uuid(),
  "raw_text": zod.string(),
  "parsed": zod.object({
  "specialization": zod.union([zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),zod.null()]),
  "grade": zod.union([zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),zod.null()]),
  "must_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "nice_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])),
  "city": zod.string().nullable(),
  "industry": zod.union([zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),zod.null()]),
  "salary": zod.union([zod.object({
  "from": zod.int().min(createNeedResponseParsedSalaryOneFromMin).max(createNeedResponseParsedSalaryOneFromMax),
  "to": zod.int().min(createNeedResponseParsedSalaryOneToMin).max(createNeedResponseParsedSalaryOneToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),zod.null()]).describe('Вилка, если найдена в тексте. Всё равно требует подтверждения'),
  "unrecognized": zod.array(zod.string()).describe('Термины, которые не удалось сопоставить со справочником')
}),
  "confirmed": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "must_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "nice_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])),
  "city": zod.string().nullable(),
  "industry": zod.union([zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),zod.null()]),
  "salary": zod.object({
  "from": zod.int().min(createNeedResponseConfirmedOneSalaryFromMin).max(createNeedResponseConfirmedOneSalaryFromMax),
  "to": zod.int().min(createNeedResponseConfirmedOneSalaryToMin).max(createNeedResponseConfirmedOneSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.')
}),zod.null()]).describe('`null` — черновик, ещё не подтверждён'),
  "created_at": zod.iso.datetime({"offset":true}),
  "updated_at": zod.iso.datetime({"offset":true})
})


/**
 * @summary Потребность
 */
export const GetNeedParams = zod.object({
  "need_id": zod.uuid()
})

export const getNeedResponseParsedSalaryOneFromMin = 10000;
export const getNeedResponseParsedSalaryOneFromMax = 10000000;

export const getNeedResponseParsedSalaryOneToMin = 10000;
export const getNeedResponseParsedSalaryOneToMax = 10000000;

export const getNeedResponseConfirmedOneSalaryFromMin = 10000;
export const getNeedResponseConfirmedOneSalaryFromMax = 10000000;

export const getNeedResponseConfirmedOneSalaryToMin = 10000;
export const getNeedResponseConfirmedOneSalaryToMax = 10000000;



export const GetNeedResponse = zod.object({
  "id": zod.uuid(),
  "raw_text": zod.string(),
  "parsed": zod.object({
  "specialization": zod.union([zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),zod.null()]),
  "grade": zod.union([zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),zod.null()]),
  "must_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "nice_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])),
  "city": zod.string().nullable(),
  "industry": zod.union([zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),zod.null()]),
  "salary": zod.union([zod.object({
  "from": zod.int().min(getNeedResponseParsedSalaryOneFromMin).max(getNeedResponseParsedSalaryOneFromMax),
  "to": zod.int().min(getNeedResponseParsedSalaryOneToMin).max(getNeedResponseParsedSalaryOneToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),zod.null()]).describe('Вилка, если найдена в тексте. Всё равно требует подтверждения'),
  "unrecognized": zod.array(zod.string()).describe('Термины, которые не удалось сопоставить со справочником')
}),
  "confirmed": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "must_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "nice_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])),
  "city": zod.string().nullable(),
  "industry": zod.union([zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),zod.null()]),
  "salary": zod.object({
  "from": zod.int().min(getNeedResponseConfirmedOneSalaryFromMin).max(getNeedResponseConfirmedOneSalaryFromMax),
  "to": zod.int().min(getNeedResponseConfirmedOneSalaryToMin).max(getNeedResponseConfirmedOneSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.')
}),zod.null()]).describe('`null` — черновик, ещё не подтверждён'),
  "created_at": zod.iso.datetime({"offset":true}),
  "updated_at": zod.iso.datetime({"offset":true})
})


/**
 * @summary Подтвердить отредактированные чипы и вилку
 */
export const ConfirmNeedParams = zod.object({
  "need_id": zod.uuid()
})

export const confirmNeedBodyMustSkillsMax = 15;

export const confirmNeedBodyNiceSkillsMax = 15;


export const confirmNeedBodySalaryFromMin = 10000;
export const confirmNeedBodySalaryFromMax = 10000000;

export const confirmNeedBodySalaryToMin = 10000;
export const confirmNeedBodySalaryToMax = 10000000;



export const ConfirmNeedBody = zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "must_skills": zod.array(zod.string()).max(confirmNeedBodyMustSkillsMax),
  "nice_skills": zod.array(zod.string()).max(confirmNeedBodyNiceSkillsMax),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])).min(1),
  "city": zod.string().nullable(),
  "industry": zod.union([zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),zod.null()]),
  "salary": zod.object({
  "from": zod.int().min(confirmNeedBodySalaryFromMin).max(confirmNeedBodySalaryFromMax),
  "to": zod.int().min(confirmNeedBodySalaryToMin).max(confirmNeedBodySalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.')
})

export const confirmNeedResponseParsedSalaryOneFromMin = 10000;
export const confirmNeedResponseParsedSalaryOneFromMax = 10000000;

export const confirmNeedResponseParsedSalaryOneToMin = 10000;
export const confirmNeedResponseParsedSalaryOneToMax = 10000000;

export const confirmNeedResponseConfirmedOneSalaryFromMin = 10000;
export const confirmNeedResponseConfirmedOneSalaryFromMax = 10000000;

export const confirmNeedResponseConfirmedOneSalaryToMin = 10000;
export const confirmNeedResponseConfirmedOneSalaryToMax = 10000000;



export const ConfirmNeedResponse = zod.object({
  "id": zod.uuid(),
  "raw_text": zod.string(),
  "parsed": zod.object({
  "specialization": zod.union([zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),zod.null()]),
  "grade": zod.union([zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),zod.null()]),
  "must_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "nice_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])),
  "city": zod.string().nullable(),
  "industry": zod.union([zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),zod.null()]),
  "salary": zod.union([zod.object({
  "from": zod.int().min(confirmNeedResponseParsedSalaryOneFromMin).max(confirmNeedResponseParsedSalaryOneFromMax),
  "to": zod.int().min(confirmNeedResponseParsedSalaryOneToMin).max(confirmNeedResponseParsedSalaryOneToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),zod.null()]).describe('Вилка, если найдена в тексте. Всё равно требует подтверждения'),
  "unrecognized": zod.array(zod.string()).describe('Термины, которые не удалось сопоставить со справочником')
}),
  "confirmed": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "must_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "nice_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])),
  "city": zod.string().nullable(),
  "industry": zod.union([zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),zod.null()]),
  "salary": zod.object({
  "from": zod.int().min(confirmNeedResponseConfirmedOneSalaryFromMin).max(confirmNeedResponseConfirmedOneSalaryFromMax),
  "to": zod.int().min(confirmNeedResponseConfirmedOneSalaryToMin).max(confirmNeedResponseConfirmedOneSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.')
}),zod.null()]).describe('`null` — черновик, ещё не подтверждён'),
  "created_at": zod.iso.datetime({"offset":true}),
  "updated_at": zod.iso.datetime({"offset":true})
})


/**
 * @summary Рекомендованные категории с числом кандидатов и салари-радаром
 */
export const GetNeedCategoriesParams = zod.object({
  "need_id": zod.uuid()
})

export const getNeedCategoriesResponseSalaryFromMin = 10000;
export const getNeedCategoriesResponseSalaryFromMax = 10000000;

export const getNeedCategoriesResponseSalaryToMin = 10000;
export const getNeedCategoriesResponseSalaryToMax = 10000000;

export const getNeedCategoriesResponseItemsItemCandidateCountMin = 0;

export const getNeedCategoriesResponseItemsItemRadarSalaryFromMin = 10000;
export const getNeedCategoriesResponseItemsItemRadarSalaryFromMax = 10000000;

export const getNeedCategoriesResponseItemsItemRadarSalaryToMin = 10000;
export const getNeedCategoriesResponseItemsItemRadarSalaryToMax = 10000000;

export const getNeedCategoriesResponseItemsItemRadarCandidatesTotalMin = 0;

export const getNeedCategoriesResponseItemsItemRadarShareAboveMin = 0;
export const getNeedCategoriesResponseItemsItemRadarShareAboveMax = 1;

export const getNeedCategoriesResponseItemsItemRadarShareWithinMin = 0;
export const getNeedCategoriesResponseItemsItemRadarShareWithinMax = 1;

export const getNeedCategoriesResponseItemsItemRadarShareBelowMin = 0;
export const getNeedCategoriesResponseItemsItemRadarShareBelowMax = 1;

export const getNeedCategoriesResponseItemsItemRadarHistogramItemCountMin = 0;



export const GetNeedCategoriesResponse = zod.object({
  "need_id": zod.uuid(),
  "salary": zod.object({
  "from": zod.int().min(getNeedCategoriesResponseSalaryFromMin).max(getNeedCategoriesResponseSalaryFromMax),
  "to": zod.int().min(getNeedCategoriesResponseSalaryToMin).max(getNeedCategoriesResponseSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "items": zod.array(zod.object({
  "category": zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),
  "kind": zod.enum(['primary', 'adjacent']).describe('Основная или соседняя категория'),
  "candidate_count": zod.int().min(getNeedCategoriesResponseItemsItemCandidateCountMin),
  "median_expectation": zod.int().nullable(),
  "reason": zod.string(),
  "radar": zod.object({
  "category": zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),
  "salary": zod.object({
  "from": zod.int().min(getNeedCategoriesResponseItemsItemRadarSalaryFromMin).max(getNeedCategoriesResponseItemsItemRadarSalaryFromMax),
  "to": zod.int().min(getNeedCategoriesResponseItemsItemRadarSalaryToMin).max(getNeedCategoriesResponseItemsItemRadarSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "candidates_total": zod.int().min(getNeedCategoriesResponseItemsItemRadarCandidatesTotalMin),
  "share_above": zod.number().min(getNeedCategoriesResponseItemsItemRadarShareAboveMin).max(getNeedCategoriesResponseItemsItemRadarShareAboveMax).describe('Доля кандидатов, чьи ожидания (нижняя граница) выше верха вилки'),
  "share_within": zod.number().min(getNeedCategoriesResponseItemsItemRadarShareWithinMin).max(getNeedCategoriesResponseItemsItemRadarShareWithinMax).describe('Доля кандидатов, чьи ожидания пересекаются с вилкой'),
  "share_below": zod.number().min(getNeedCategoriesResponseItemsItemRadarShareBelowMin).max(getNeedCategoriesResponseItemsItemRadarShareBelowMax).describe('Доля кандидатов, чьи ожидания (верхняя граница) ниже низа вилки'),
  "median": zod.int().nullable(),
  "p25": zod.int().nullable(),
  "p75": zod.int().nullable(),
  "histogram": zod.array(zod.object({
  "from": zod.int(),
  "to": zod.int(),
  "count": zod.int().min(getNeedCategoriesResponseItemsItemRadarHistogramItemCountMin)
})),
  "verdict": zod.enum(['below_market', 'in_market', 'above_market']),
  "message": zod.string()
}).describe('Распределение ожиданий кандидатов категории относительно вилки')
}))
})


/**
 * @summary Салари-радар для категории и вилки
 */
export const getSalaryRadarQuerySalaryFromMin = 10000;

export const getSalaryRadarQuerySalaryToMin = 10000;



export const GetSalaryRadarQueryParams = zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']),
  "salary_from": zod.int().min(getSalaryRadarQuerySalaryFromMin),
  "salary_to": zod.int().min(getSalaryRadarQuerySalaryToMin)
})

export const getSalaryRadarResponseSalaryFromMin = 10000;
export const getSalaryRadarResponseSalaryFromMax = 10000000;

export const getSalaryRadarResponseSalaryToMin = 10000;
export const getSalaryRadarResponseSalaryToMax = 10000000;

export const getSalaryRadarResponseCandidatesTotalMin = 0;

export const getSalaryRadarResponseShareAboveMin = 0;
export const getSalaryRadarResponseShareAboveMax = 1;

export const getSalaryRadarResponseShareWithinMin = 0;
export const getSalaryRadarResponseShareWithinMax = 1;

export const getSalaryRadarResponseShareBelowMin = 0;
export const getSalaryRadarResponseShareBelowMax = 1;

export const getSalaryRadarResponseHistogramItemCountMin = 0;



export const GetSalaryRadarResponse = zod.object({
  "category": zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),
  "salary": zod.object({
  "from": zod.int().min(getSalaryRadarResponseSalaryFromMin).max(getSalaryRadarResponseSalaryFromMax),
  "to": zod.int().min(getSalaryRadarResponseSalaryToMin).max(getSalaryRadarResponseSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "candidates_total": zod.int().min(getSalaryRadarResponseCandidatesTotalMin),
  "share_above": zod.number().min(getSalaryRadarResponseShareAboveMin).max(getSalaryRadarResponseShareAboveMax).describe('Доля кандидатов, чьи ожидания (нижняя граница) выше верха вилки'),
  "share_within": zod.number().min(getSalaryRadarResponseShareWithinMin).max(getSalaryRadarResponseShareWithinMax).describe('Доля кандидатов, чьи ожидания пересекаются с вилкой'),
  "share_below": zod.number().min(getSalaryRadarResponseShareBelowMin).max(getSalaryRadarResponseShareBelowMax).describe('Доля кандидатов, чьи ожидания (верхняя граница) ниже низа вилки'),
  "median": zod.int().nullable(),
  "p25": zod.int().nullable(),
  "p75": zod.int().nullable(),
  "histogram": zod.array(zod.object({
  "from": zod.int(),
  "to": zod.int(),
  "count": zod.int().min(getSalaryRadarResponseHistogramItemCountMin)
})),
  "verdict": zod.enum(['below_market', 'in_market', 'above_market']),
  "message": zod.string()
}).describe('Распределение ожиданий кандидатов категории относительно вилки')


/**
 * @summary Подборки компании (новые сверху)
 */



export const listSearchesResponseVersionsItemFiltersMustSkillsMax = 15;

export const listSearchesResponseVersionsItemFiltersNiceSkillsMax = 15;


export const listSearchesResponseVersionsItemFiltersSalaryFromMin = 10000;
export const listSearchesResponseVersionsItemFiltersSalaryFromMax = 10000000;

export const listSearchesResponseVersionsItemFiltersSalaryToMin = 10000;
export const listSearchesResponseVersionsItemFiltersSalaryToMax = 10000000;


export const listSearchesResponseVersionsItemResultsTotalMin = 0;




export const ListSearchesResponseItem = zod.object({
  "id": zod.uuid(),
  "need_id": zod.uuid().nullable(),
  "title": zod.string(),
  "created_at": zod.iso.datetime({"offset":true}),
  "updated_at": zod.iso.datetime({"offset":true}),
  "current_version": zod.int().min(1),
  "versions": zod.array(zod.object({
  "version": zod.int().min(1),
  "created_at": zod.iso.datetime({"offset":true}),
  "label": zod.string().describe('Что изменилось относительно предыдущей версии'),
  "filters": zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grades": zod.array(zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)')).min(1),
  "must_skills": zod.array(zod.string()).max(listSearchesResponseVersionsItemFiltersMustSkillsMax),
  "nice_skills": zod.array(zod.string()).max(listSearchesResponseVersionsItemFiltersNiceSkillsMax),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])).min(1),
  "city": zod.string().nullable(),
  "include_relocation": zod.boolean().describe('Учитывать готовых к переезду из других городов'),
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])),
  "salary": zod.object({
  "from": zod.int().min(listSearchesResponseVersionsItemFiltersSalaryFromMin).max(listSearchesResponseVersionsItemFiltersSalaryFromMax),
  "to": zod.int().min(listSearchesResponseVersionsItemFiltersSalaryToMin).max(listSearchesResponseVersionsItemFiltersSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "fsp_only": zod.boolean(),
  "fsp_level_min": zod.union([zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),zod.null()]),
  "availability": zod.array(zod.enum(['active', 'open'])).min(1)
}),
  "results_total": zod.int().min(listSearchesResponseVersionsItemResultsTotalMin)
})),
  "shortlist": zod.array(zod.object({
  "candidate_id": zod.uuid(),
  "alias": zod.string(),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "added_at": zod.iso.datetime({"offset":true}),
  "added_in_version": zod.int().min(1)
})).describe('Закреплён за подборкой, не теряется при смене версии')
})
export const ListSearchesResponse = zod.array(ListSearchesResponseItem)


/**
 * @summary Создать подборку (версия 1)
 */
export const createSearchBodyTitleMax = 120;


export const createSearchBodyFiltersMustSkillsMax = 15;

export const createSearchBodyFiltersNiceSkillsMax = 15;


export const createSearchBodyFiltersSalaryFromMin = 10000;
export const createSearchBodyFiltersSalaryFromMax = 10000000;

export const createSearchBodyFiltersSalaryToMin = 10000;
export const createSearchBodyFiltersSalaryToMax = 10000000;




export const CreateSearchBody = zod.object({
  "need_id": zod.uuid().nullish(),
  "title": zod.string().max(createSearchBodyTitleMax).optional(),
  "filters": zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grades": zod.array(zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)')).min(1),
  "must_skills": zod.array(zod.string()).max(createSearchBodyFiltersMustSkillsMax),
  "nice_skills": zod.array(zod.string()).max(createSearchBodyFiltersNiceSkillsMax),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])).min(1),
  "city": zod.string().nullable(),
  "include_relocation": zod.boolean().describe('Учитывать готовых к переезду из других городов'),
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])),
  "salary": zod.object({
  "from": zod.int().min(createSearchBodyFiltersSalaryFromMin).max(createSearchBodyFiltersSalaryFromMax),
  "to": zod.int().min(createSearchBodyFiltersSalaryToMin).max(createSearchBodyFiltersSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "fsp_only": zod.boolean(),
  "fsp_level_min": zod.union([zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),zod.null()]),
  "availability": zod.array(zod.enum(['active', 'open'])).min(1)
})
})




export const createSearchResponseVersionsItemFiltersMustSkillsMax = 15;

export const createSearchResponseVersionsItemFiltersNiceSkillsMax = 15;


export const createSearchResponseVersionsItemFiltersSalaryFromMin = 10000;
export const createSearchResponseVersionsItemFiltersSalaryFromMax = 10000000;

export const createSearchResponseVersionsItemFiltersSalaryToMin = 10000;
export const createSearchResponseVersionsItemFiltersSalaryToMax = 10000000;


export const createSearchResponseVersionsItemResultsTotalMin = 0;




export const CreateSearchResponse = zod.object({
  "id": zod.uuid(),
  "need_id": zod.uuid().nullable(),
  "title": zod.string(),
  "created_at": zod.iso.datetime({"offset":true}),
  "updated_at": zod.iso.datetime({"offset":true}),
  "current_version": zod.int().min(1),
  "versions": zod.array(zod.object({
  "version": zod.int().min(1),
  "created_at": zod.iso.datetime({"offset":true}),
  "label": zod.string().describe('Что изменилось относительно предыдущей версии'),
  "filters": zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grades": zod.array(zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)')).min(1),
  "must_skills": zod.array(zod.string()).max(createSearchResponseVersionsItemFiltersMustSkillsMax),
  "nice_skills": zod.array(zod.string()).max(createSearchResponseVersionsItemFiltersNiceSkillsMax),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])).min(1),
  "city": zod.string().nullable(),
  "include_relocation": zod.boolean().describe('Учитывать готовых к переезду из других городов'),
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])),
  "salary": zod.object({
  "from": zod.int().min(createSearchResponseVersionsItemFiltersSalaryFromMin).max(createSearchResponseVersionsItemFiltersSalaryFromMax),
  "to": zod.int().min(createSearchResponseVersionsItemFiltersSalaryToMin).max(createSearchResponseVersionsItemFiltersSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "fsp_only": zod.boolean(),
  "fsp_level_min": zod.union([zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),zod.null()]),
  "availability": zod.array(zod.enum(['active', 'open'])).min(1)
}),
  "results_total": zod.int().min(createSearchResponseVersionsItemResultsTotalMin)
})),
  "shortlist": zod.array(zod.object({
  "candidate_id": zod.uuid(),
  "alias": zod.string(),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "added_at": zod.iso.datetime({"offset":true}),
  "added_in_version": zod.int().min(1)
})).describe('Закреплён за подборкой, не теряется при смене версии')
})


/**
 * @summary Подборка с версиями и шорт-листом
 */
export const GetSearchParams = zod.object({
  "search_id": zod.uuid()
})




export const getSearchResponseVersionsItemFiltersMustSkillsMax = 15;

export const getSearchResponseVersionsItemFiltersNiceSkillsMax = 15;


export const getSearchResponseVersionsItemFiltersSalaryFromMin = 10000;
export const getSearchResponseVersionsItemFiltersSalaryFromMax = 10000000;

export const getSearchResponseVersionsItemFiltersSalaryToMin = 10000;
export const getSearchResponseVersionsItemFiltersSalaryToMax = 10000000;


export const getSearchResponseVersionsItemResultsTotalMin = 0;




export const GetSearchResponse = zod.object({
  "id": zod.uuid(),
  "need_id": zod.uuid().nullable(),
  "title": zod.string(),
  "created_at": zod.iso.datetime({"offset":true}),
  "updated_at": zod.iso.datetime({"offset":true}),
  "current_version": zod.int().min(1),
  "versions": zod.array(zod.object({
  "version": zod.int().min(1),
  "created_at": zod.iso.datetime({"offset":true}),
  "label": zod.string().describe('Что изменилось относительно предыдущей версии'),
  "filters": zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grades": zod.array(zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)')).min(1),
  "must_skills": zod.array(zod.string()).max(getSearchResponseVersionsItemFiltersMustSkillsMax),
  "nice_skills": zod.array(zod.string()).max(getSearchResponseVersionsItemFiltersNiceSkillsMax),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])).min(1),
  "city": zod.string().nullable(),
  "include_relocation": zod.boolean().describe('Учитывать готовых к переезду из других городов'),
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])),
  "salary": zod.object({
  "from": zod.int().min(getSearchResponseVersionsItemFiltersSalaryFromMin).max(getSearchResponseVersionsItemFiltersSalaryFromMax),
  "to": zod.int().min(getSearchResponseVersionsItemFiltersSalaryToMin).max(getSearchResponseVersionsItemFiltersSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "fsp_only": zod.boolean(),
  "fsp_level_min": zod.union([zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),zod.null()]),
  "availability": zod.array(zod.enum(['active', 'open'])).min(1)
}),
  "results_total": zod.int().min(getSearchResponseVersionsItemResultsTotalMin)
})),
  "shortlist": zod.array(zod.object({
  "candidate_id": zod.uuid(),
  "alias": zod.string(),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "added_at": zod.iso.datetime({"offset":true}),
  "added_in_version": zod.int().min(1)
})).describe('Закреплён за подборкой, не теряется при смене версии')
})


/**
 * @summary Уточнить фильтры — создаёт новую версию, шорт-лист сохраняется
 */
export const RefineSearchParams = zod.object({
  "search_id": zod.uuid()
})


export const refineSearchBodyFiltersMustSkillsMax = 15;

export const refineSearchBodyFiltersNiceSkillsMax = 15;


export const refineSearchBodyFiltersSalaryFromMin = 10000;
export const refineSearchBodyFiltersSalaryFromMax = 10000000;

export const refineSearchBodyFiltersSalaryToMin = 10000;
export const refineSearchBodyFiltersSalaryToMax = 10000000;


export const refineSearchBodyLabelMax = 80;



export const RefineSearchBody = zod.object({
  "filters": zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grades": zod.array(zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)')).min(1),
  "must_skills": zod.array(zod.string()).max(refineSearchBodyFiltersMustSkillsMax),
  "nice_skills": zod.array(zod.string()).max(refineSearchBodyFiltersNiceSkillsMax),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])).min(1),
  "city": zod.string().nullable(),
  "include_relocation": zod.boolean().describe('Учитывать готовых к переезду из других городов'),
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])),
  "salary": zod.object({
  "from": zod.int().min(refineSearchBodyFiltersSalaryFromMin).max(refineSearchBodyFiltersSalaryFromMax),
  "to": zod.int().min(refineSearchBodyFiltersSalaryToMin).max(refineSearchBodyFiltersSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "fsp_only": zod.boolean(),
  "fsp_level_min": zod.union([zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),zod.null()]),
  "availability": zod.array(zod.enum(['active', 'open'])).min(1)
}),
  "label": zod.string().max(refineSearchBodyLabelMax).optional().describe('Подпись версии, по умолчанию сервер формирует из разницы фильтров')
})




export const refineSearchResponseVersionsItemFiltersMustSkillsMax = 15;

export const refineSearchResponseVersionsItemFiltersNiceSkillsMax = 15;


export const refineSearchResponseVersionsItemFiltersSalaryFromMin = 10000;
export const refineSearchResponseVersionsItemFiltersSalaryFromMax = 10000000;

export const refineSearchResponseVersionsItemFiltersSalaryToMin = 10000;
export const refineSearchResponseVersionsItemFiltersSalaryToMax = 10000000;


export const refineSearchResponseVersionsItemResultsTotalMin = 0;




export const RefineSearchResponse = zod.object({
  "id": zod.uuid(),
  "need_id": zod.uuid().nullable(),
  "title": zod.string(),
  "created_at": zod.iso.datetime({"offset":true}),
  "updated_at": zod.iso.datetime({"offset":true}),
  "current_version": zod.int().min(1),
  "versions": zod.array(zod.object({
  "version": zod.int().min(1),
  "created_at": zod.iso.datetime({"offset":true}),
  "label": zod.string().describe('Что изменилось относительно предыдущей версии'),
  "filters": zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grades": zod.array(zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)')).min(1),
  "must_skills": zod.array(zod.string()).max(refineSearchResponseVersionsItemFiltersMustSkillsMax),
  "nice_skills": zod.array(zod.string()).max(refineSearchResponseVersionsItemFiltersNiceSkillsMax),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])).min(1),
  "city": zod.string().nullable(),
  "include_relocation": zod.boolean().describe('Учитывать готовых к переезду из других городов'),
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])),
  "salary": zod.object({
  "from": zod.int().min(refineSearchResponseVersionsItemFiltersSalaryFromMin).max(refineSearchResponseVersionsItemFiltersSalaryFromMax),
  "to": zod.int().min(refineSearchResponseVersionsItemFiltersSalaryToMin).max(refineSearchResponseVersionsItemFiltersSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "fsp_only": zod.boolean(),
  "fsp_level_min": zod.union([zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),zod.null()]),
  "availability": zod.array(zod.enum(['active', 'open'])).min(1)
}),
  "results_total": zod.int().min(refineSearchResponseVersionsItemResultsTotalMin)
})),
  "shortlist": zod.array(zod.object({
  "candidate_id": zod.uuid(),
  "alias": zod.string(),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "added_at": zod.iso.datetime({"offset":true}),
  "added_in_version": zod.int().min(1)
})).describe('Закреплён за подборкой, не теряется при смене версии')
})


/**
 * @summary Ранжированная выдача версии с объяснениями
 */
export const GetSearchResultsParams = zod.object({
  "search_id": zod.uuid()
})


export const getSearchResultsQueryPageDefault = 1;

export const getSearchResultsQueryPageSizeDefault = 20;
export const getSearchResultsQueryPageSizeMax = 100;



export const GetSearchResultsQueryParams = zod.object({
  "version": zod.int().min(1).optional().describe('По умолчанию — текущая версия'),
  "page": zod.int().min(1).default(getSearchResultsQueryPageDefault),
  "page_size": zod.int().min(1).max(getSearchResultsQueryPageSizeMax).default(getSearchResultsQueryPageSizeDefault)
})

export const getSearchResultsResponseOneTotalMin = 0;





export const getSearchResultsResponseTwoItemsItemCandidatePercentileMax = 99;

export const getSearchResultsResponseTwoItemsItemCandidateStrengthMin = 0;
export const getSearchResultsResponseTwoItemsItemCandidateStrengthMax = 130;

export const getSearchResultsResponseTwoItemsItemCandidateSkillsItemScoreMin = 0;
export const getSearchResultsResponseTwoItemsItemCandidateSkillsItemScoreMax = 100;

export const getSearchResultsResponseTwoItemsItemCandidateExperienceItemStartRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const getSearchResultsResponseTwoItemsItemCandidateExperienceItemEndRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const getSearchResultsResponseTwoItemsItemCandidateExperienceItemDescriptionMax = 1000;

export const getSearchResultsResponseTwoItemsItemCandidateSalaryExpectationOneFromMin = 10000;
export const getSearchResultsResponseTwoItemsItemCandidateSalaryExpectationOneFromMax = 10000000;

export const getSearchResultsResponseTwoItemsItemCandidateSalaryExpectationOneToMin = 10000;
export const getSearchResultsResponseTwoItemsItemCandidateSalaryExpectationOneToMax = 10000000;

export const getSearchResultsResponseTwoItemsItemCandidateFspOneIndexMin = 0;
export const getSearchResultsResponseTwoItemsItemCandidateFspOneIndexMax = 100;

export const getSearchResultsResponseTwoItemsItemCandidateFspOneBonusMin = 0;
export const getSearchResultsResponseTwoItemsItemCandidateFspOneBonusMax = 30;

export const getSearchResultsResponseTwoItemsItemCandidateFspOneAchievementsCountMin = 0;



export const getSearchResultsResponseTwoItemsItemCandidateFspOneTopAchievementOnePercentileMax = 99;

export const getSearchResultsResponseTwoItemsItemCandidateTaskSignalSolvedCountMin = 0;

export const getSearchResultsResponseTwoItemsItemExplanationScoreMin = 0;
export const getSearchResultsResponseTwoItemsItemExplanationScoreMax = 100;

export const getSearchResultsResponseTwoItemsItemExplanationFitMin = 0;
export const getSearchResultsResponseTwoItemsItemExplanationFitMax = 100;

export const getSearchResultsResponseTwoItemsItemExplanationStrengthMin = 0;
export const getSearchResultsResponseTwoItemsItemExplanationStrengthMax = 130;

export const getSearchResultsResponseTwoItemsItemExplanationChipsMax = 3;



export const GetSearchResultsResponse = zod.object({
  "total": zod.int().min(getSearchResultsResponseOneTotalMin),
  "page": zod.int().min(1),
  "page_size": zod.int().min(1)
}).and(zod.object({
  "search_id": zod.uuid(),
  "version": zod.int().min(1),
  "generated_at": zod.iso.datetime({"offset":true}),
  "items": zod.array(zod.object({
  "rank": zod.int().min(1),
  "candidate": zod.object({
  "id": zod.uuid(),
  "alias": zod.string().describe('Анонимное имя, стабильное для пары компания–кандидат'),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "grade_confirmed": zod.boolean(),
  "percentile": zod.int().min(1).max(getSearchResultsResponseTwoItemsItemCandidatePercentileMax).nullable(),
  "test_flags": zod.array(zod.object({
  "code": zod.enum(['fast_correct', 'paste', 'focus_loss']),
  "severity": zod.enum(['info', 'warning'])
}).describe('Сигнал прокторинга подтверждающего теста; не доказывает нарушение')).optional(),
  "strength": zod.number().min(getSearchResultsResponseTwoItemsItemCandidateStrengthMin).max(getSearchResultsResponseTwoItemsItemCandidateStrengthMax).describe('Сила профиля (0–100 + бонус ФСП до 30)'),
  "skills": zod.array(zod.object({
  "skill_id": zod.string(),
  "name": zod.string(),
  "level": zod.enum(['basic', 'confident', 'advanced']),
  "source": zod.enum(['self', 'resume', 'test', 'fsp', 'task']).describe('self — заявлен, resume — из резюме, test — подтверждён тестом, fsp — из достижений ФСП, task — из регулярного задания'),
  "verified": zod.boolean().describe('Подтверждён тестом, заданием или ФСП'),
  "score": zod.int().min(getSearchResultsResponseTwoItemsItemCandidateSkillsItemScoreMin).max(getSearchResultsResponseTwoItemsItemCandidateSkillsItemScoreMax).nullable().describe('Балл по навыку в тесте, если подтверждён тестом')
})),
  "experience_years": zod.number(),
  "experience": zod.array(zod.object({
  "role": zod.string(),
  "company_name": zod.string().nullable().describe('`null`, если кандидат скрыл названия компаний'),
  "company_hidden": zod.boolean(),
  "industry": zod.union([zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),zod.null()]),
  "start": zod.string().regex(getSearchResultsResponseTwoItemsItemCandidateExperienceItemStartRegExp).describe('Месяц начала YYYY-MM'),
  "end": zod.string().regex(getSearchResultsResponseTwoItemsItemCandidateExperienceItemEndRegExp).nullable().describe('Месяц окончания, `null` — по настоящее время'),
  "description": zod.string().max(getSearchResultsResponseTwoItemsItemCandidateExperienceItemDescriptionMax).nullable()
})),
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])),
  "city": zod.string().nullable().describe('`null`, если кандидат скрыл город'),
  "relocation": zod.boolean(),
  "salary_expectation": zod.union([zod.object({
  "from": zod.int().min(getSearchResultsResponseTwoItemsItemCandidateSalaryExpectationOneFromMin).max(getSearchResultsResponseTwoItemsItemCandidateSalaryExpectationOneFromMax),
  "to": zod.int().min(getSearchResultsResponseTwoItemsItemCandidateSalaryExpectationOneToMin).max(getSearchResultsResponseTwoItemsItemCandidateSalaryExpectationOneToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),zod.null()]),
  "availability": zod.enum(['active', 'open', 'not_looking']).describe('Ищу активно / открыт к предложениям / не ищу'),
  "last_active_at": zod.iso.datetime({"offset":true}).nullable(),
  "fsp": zod.union([zod.object({
  "has_history": zod.boolean(),
  "index": zod.int().min(getSearchResultsResponseTwoItemsItemCandidateFspOneIndexMin).max(getSearchResultsResponseTwoItemsItemCandidateFspOneIndexMax),
  "bonus": zod.number().min(getSearchResultsResponseTwoItemsItemCandidateFspOneBonusMin).max(getSearchResultsResponseTwoItemsItemCandidateFspOneBonusMax),
  "achievements_count": zod.int().min(getSearchResultsResponseTwoItemsItemCandidateFspOneAchievementsCountMin),
  "top_achievement": zod.union([zod.object({
  "id": zod.uuid(),
  "event_id": zod.string(),
  "title": zod.string(),
  "date": zod.iso.date(),
  "level": zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),
  "discipline": zod.enum(['product', 'algorithmic', 'cybersecurity', 'robotics', 'uas']).describe('Продуктовое / алгоритмическое / кибербезопасность / робототехника / БАС'),
  "format": zod.enum(['individual', 'team']),
  "team": zod.string().nullable(),
  "role": zod.string().nullable(),
  "place": zod.int().min(1).nullable(),
  "participants_total": zod.int().min(1).nullable(),
  "percentile": zod.int().min(1).max(getSearchResultsResponseTwoItemsItemCandidateFspOneTopAchievementOnePercentileMax).nullable(),
  "result": zod.enum(['winner', 'prize_winner', 'finalist', 'participant']).describe('Победитель / призёр / финалист / участник'),
  "sport_rank": zod.string().nullable().describe('Спортивный разряд'),
  "certificate_url": zod.url().nullable(),
  "verified": zod.boolean().describe('Подпись реестра ФСП проверена')
}),zod.null()]),
  "max_level": zod.union([zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),zod.null()])
}),zod.null()]).describe('`null` — кандидат скрыл данные ФСП; `has_history=false` — истории нет (нейтрально)'),
  "task_signal": zod.object({
  "fresh": zod.boolean().describe('Бейдж «свежий сигнал» за хорошее решение регулярного задания'),
  "solved_count": zod.int().min(getSearchResultsResponseTwoItemsItemCandidateTaskSignalSolvedCountMin),
  "last_solved_at": zod.iso.datetime({"offset":true}).nullable()
}),
  "disclosure": zod.object({
  "revealed": zod.boolean(),
  "reason": zod.union([zod.enum(['invitation_accepted', 'application']).describe('Почему компании раскрыты контакты'),zod.null()]),
  "revealed_at": zod.iso.datetime({"offset":true}).nullable(),
  "source_id": zod.uuid().nullable().describe('ID инвайта или отклика')
}),
  "contacts": zod.union([zod.object({
  "full_name": zod.string(),
  "email": zod.email(),
  "phone": zod.string().nullable(),
  "telegram": zod.string().nullable(),
  "preferred_channel": zod.enum(['email', 'phone', 'telegram'])
}),zod.null()]),
  "relation": zod.object({
  "invitation": zod.union([zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed'])
}),zod.null()]),
  "application": zod.union([zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']),
  "vacancy_id": zod.uuid()
}),zod.null()])
}).describe('Отношения кандидата с компанией текущего работодателя')
}).describe('Карточка кандидата для работодателя. До раскрытия анонимна: нет ФИО, фото, возраста, контактов,\nназвания компаний скрыты по настройке. `contacts` не `null` только при `disclosure.revealed`.\n'),
  "explanation": zod.object({
  "score": zod.number().min(getSearchResultsResponseTwoItemsItemExplanationScoreMin).max(getSearchResultsResponseTwoItemsItemExplanationScoreMax).describe('Score = 0.6·Fit + 0.4·Strength − штрафы'),
  "fit": zod.number().min(getSearchResultsResponseTwoItemsItemExplanationFitMin).max(getSearchResultsResponseTwoItemsItemExplanationFitMax),
  "strength": zod.number().min(getSearchResultsResponseTwoItemsItemExplanationStrengthMin).max(getSearchResultsResponseTwoItemsItemExplanationStrengthMax),
  "chips": zod.array(zod.object({
  "kind": zod.enum(['skills_coverage', 'confirmed_skills', 'semantic', 'industry', 'conditions', 'percentile', 'fsp', 'tasks', 'completeness', 'missing_skill', 'penalty']),
  "label": zod.string(),
  "contribution": zod.number().describe('Вклад в итоговый Score, пункты (со знаком)'),
  "polarity": zod.enum(['positive', 'negative', 'neutral']),
  "evidence": zod.string().nullable()
}).describe('Вклад фактора в скоринг: `{factor, value, contribution, evidence}`')).max(getSearchResultsResponseTwoItemsItemExplanationChipsMax).describe('Три главных фактора для чипов'),
  "factors": zod.array(zod.object({
  "kind": zod.enum(['skills_coverage', 'confirmed_skills', 'semantic', 'industry', 'conditions', 'percentile', 'fsp', 'tasks', 'completeness', 'missing_skill', 'penalty']),
  "label": zod.string(),
  "contribution": zod.number().describe('Вклад в итоговый Score, пункты (со знаком)'),
  "polarity": zod.enum(['positive', 'negative', 'neutral']),
  "evidence": zod.string().nullable()
}).describe('Вклад фактора в скоринг: `{factor, value, contribution, evidence}`')).describe('Полный список для панели «Почему в подборке»')
}),
  "shortlisted": zod.boolean()
}))
}))


/**
 * @summary Добавить кандидата в шорт-лист (идемпотентно)
 */
export const AddToShortlistParams = zod.object({
  "search_id": zod.uuid(),
  "candidate_id": zod.uuid()
})




export const addToShortlistResponseVersionsItemFiltersMustSkillsMax = 15;

export const addToShortlistResponseVersionsItemFiltersNiceSkillsMax = 15;


export const addToShortlistResponseVersionsItemFiltersSalaryFromMin = 10000;
export const addToShortlistResponseVersionsItemFiltersSalaryFromMax = 10000000;

export const addToShortlistResponseVersionsItemFiltersSalaryToMin = 10000;
export const addToShortlistResponseVersionsItemFiltersSalaryToMax = 10000000;


export const addToShortlistResponseVersionsItemResultsTotalMin = 0;




export const AddToShortlistResponse = zod.object({
  "id": zod.uuid(),
  "need_id": zod.uuid().nullable(),
  "title": zod.string(),
  "created_at": zod.iso.datetime({"offset":true}),
  "updated_at": zod.iso.datetime({"offset":true}),
  "current_version": zod.int().min(1),
  "versions": zod.array(zod.object({
  "version": zod.int().min(1),
  "created_at": zod.iso.datetime({"offset":true}),
  "label": zod.string().describe('Что изменилось относительно предыдущей версии'),
  "filters": zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grades": zod.array(zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)')).min(1),
  "must_skills": zod.array(zod.string()).max(addToShortlistResponseVersionsItemFiltersMustSkillsMax),
  "nice_skills": zod.array(zod.string()).max(addToShortlistResponseVersionsItemFiltersNiceSkillsMax),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])).min(1),
  "city": zod.string().nullable(),
  "include_relocation": zod.boolean().describe('Учитывать готовых к переезду из других городов'),
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])),
  "salary": zod.object({
  "from": zod.int().min(addToShortlistResponseVersionsItemFiltersSalaryFromMin).max(addToShortlistResponseVersionsItemFiltersSalaryFromMax),
  "to": zod.int().min(addToShortlistResponseVersionsItemFiltersSalaryToMin).max(addToShortlistResponseVersionsItemFiltersSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "fsp_only": zod.boolean(),
  "fsp_level_min": zod.union([zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),zod.null()]),
  "availability": zod.array(zod.enum(['active', 'open'])).min(1)
}),
  "results_total": zod.int().min(addToShortlistResponseVersionsItemResultsTotalMin)
})),
  "shortlist": zod.array(zod.object({
  "candidate_id": zod.uuid(),
  "alias": zod.string(),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "added_at": zod.iso.datetime({"offset":true}),
  "added_in_version": zod.int().min(1)
})).describe('Закреплён за подборкой, не теряется при смене версии')
})


/**
 * @summary Убрать кандидата из шорт-листа (идемпотентно)
 */
export const RemoveFromShortlistParams = zod.object({
  "search_id": zod.uuid(),
  "candidate_id": zod.uuid()
})




export const removeFromShortlistResponseVersionsItemFiltersMustSkillsMax = 15;

export const removeFromShortlistResponseVersionsItemFiltersNiceSkillsMax = 15;


export const removeFromShortlistResponseVersionsItemFiltersSalaryFromMin = 10000;
export const removeFromShortlistResponseVersionsItemFiltersSalaryFromMax = 10000000;

export const removeFromShortlistResponseVersionsItemFiltersSalaryToMin = 10000;
export const removeFromShortlistResponseVersionsItemFiltersSalaryToMax = 10000000;


export const removeFromShortlistResponseVersionsItemResultsTotalMin = 0;




export const RemoveFromShortlistResponse = zod.object({
  "id": zod.uuid(),
  "need_id": zod.uuid().nullable(),
  "title": zod.string(),
  "created_at": zod.iso.datetime({"offset":true}),
  "updated_at": zod.iso.datetime({"offset":true}),
  "current_version": zod.int().min(1),
  "versions": zod.array(zod.object({
  "version": zod.int().min(1),
  "created_at": zod.iso.datetime({"offset":true}),
  "label": zod.string().describe('Что изменилось относительно предыдущей версии'),
  "filters": zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grades": zod.array(zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)')).min(1),
  "must_skills": zod.array(zod.string()).max(removeFromShortlistResponseVersionsItemFiltersMustSkillsMax),
  "nice_skills": zod.array(zod.string()).max(removeFromShortlistResponseVersionsItemFiltersNiceSkillsMax),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])).min(1),
  "city": zod.string().nullable(),
  "include_relocation": zod.boolean().describe('Учитывать готовых к переезду из других городов'),
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])),
  "salary": zod.object({
  "from": zod.int().min(removeFromShortlistResponseVersionsItemFiltersSalaryFromMin).max(removeFromShortlistResponseVersionsItemFiltersSalaryFromMax),
  "to": zod.int().min(removeFromShortlistResponseVersionsItemFiltersSalaryToMin).max(removeFromShortlistResponseVersionsItemFiltersSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "fsp_only": zod.boolean(),
  "fsp_level_min": zod.union([zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),zod.null()]),
  "availability": zod.array(zod.enum(['active', 'open'])).min(1)
}),
  "results_total": zod.int().min(removeFromShortlistResponseVersionsItemResultsTotalMin)
})),
  "shortlist": zod.array(zod.object({
  "candidate_id": zod.uuid(),
  "alias": zod.string(),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "added_at": zod.iso.datetime({"offset":true}),
  "added_in_version": zod.int().min(1)
})).describe('Закреплён за подборкой, не теряется при смене версии')
})


/**
 * @summary Банк кандидатов с фильтрами (анонимные карточки)
 */
export const listCandidatesQueryCityMax = 100;

export const listCandidatesQueryFspOnlyDefault = false;
export const listCandidatesQueryVerifiedOnlyDefault = true;
export const listCandidatesQueryActiveWithinDaysMax = 365;

export const listCandidatesQuerySortDefault = `strength`;
export const listCandidatesQueryPageDefault = 1;

export const listCandidatesQueryPageSizeDefault = 20;
export const listCandidatesQueryPageSizeMax = 100;



export const ListCandidatesQueryParams = zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).optional(),
  "grade": zod.array(zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)')).optional().describe('Можно несколько'),
  "skill": zod.array(zod.string()).optional().describe('ID навыков, кандидат должен иметь все'),
  "work_format": zod.array(zod.enum(['office', 'hybrid', 'remote'])).optional(),
  "city": zod.string().max(listCandidatesQueryCityMax).optional(),
  "fsp_only": zod.boolean().default(listCandidatesQueryFspOnlyDefault).describe('Только с достижениями ФСП'),
  "fsp_level_min": zod.enum(['regional', 'national', 'international']).optional().describe('Минимальный уровень достижения ФСП'),
  "verified_only": zod.boolean().default(listCandidatesQueryVerifiedOnlyDefault).describe('Только с подтверждённым грейдом (по умолчанию да)'),
  "active_within_days": zod.int().min(1).max(listCandidatesQueryActiveWithinDaysMax).optional().describe('Актуальность — был активен за N дней'),
  "sort": zod.enum(['strength', 'percentile', 'recent']).default(listCandidatesQuerySortDefault),
  "page": zod.int().min(1).default(listCandidatesQueryPageDefault),
  "page_size": zod.int().min(1).max(listCandidatesQueryPageSizeMax).default(listCandidatesQueryPageSizeDefault)
})

export const listCandidatesResponseOneTotalMin = 0;



export const listCandidatesResponseTwoItemsItemPercentileMax = 99;

export const listCandidatesResponseTwoItemsItemStrengthMin = 0;
export const listCandidatesResponseTwoItemsItemStrengthMax = 130;

export const listCandidatesResponseTwoItemsItemSkillsItemScoreMin = 0;
export const listCandidatesResponseTwoItemsItemSkillsItemScoreMax = 100;

export const listCandidatesResponseTwoItemsItemExperienceItemStartRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const listCandidatesResponseTwoItemsItemExperienceItemEndRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const listCandidatesResponseTwoItemsItemExperienceItemDescriptionMax = 1000;

export const listCandidatesResponseTwoItemsItemSalaryExpectationOneFromMin = 10000;
export const listCandidatesResponseTwoItemsItemSalaryExpectationOneFromMax = 10000000;

export const listCandidatesResponseTwoItemsItemSalaryExpectationOneToMin = 10000;
export const listCandidatesResponseTwoItemsItemSalaryExpectationOneToMax = 10000000;

export const listCandidatesResponseTwoItemsItemFspOneIndexMin = 0;
export const listCandidatesResponseTwoItemsItemFspOneIndexMax = 100;

export const listCandidatesResponseTwoItemsItemFspOneBonusMin = 0;
export const listCandidatesResponseTwoItemsItemFspOneBonusMax = 30;

export const listCandidatesResponseTwoItemsItemFspOneAchievementsCountMin = 0;



export const listCandidatesResponseTwoItemsItemFspOneTopAchievementOnePercentileMax = 99;

export const listCandidatesResponseTwoItemsItemTaskSignalSolvedCountMin = 0;



export const ListCandidatesResponse = zod.object({
  "total": zod.int().min(listCandidatesResponseOneTotalMin),
  "page": zod.int().min(1),
  "page_size": zod.int().min(1)
}).and(zod.object({
  "items": zod.array(zod.object({
  "id": zod.uuid(),
  "alias": zod.string().describe('Анонимное имя, стабильное для пары компания–кандидат'),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "grade_confirmed": zod.boolean(),
  "percentile": zod.int().min(1).max(listCandidatesResponseTwoItemsItemPercentileMax).nullable(),
  "test_flags": zod.array(zod.object({
  "code": zod.enum(['fast_correct', 'paste', 'focus_loss']),
  "severity": zod.enum(['info', 'warning'])
}).describe('Сигнал прокторинга подтверждающего теста; не доказывает нарушение')).optional(),
  "strength": zod.number().min(listCandidatesResponseTwoItemsItemStrengthMin).max(listCandidatesResponseTwoItemsItemStrengthMax).describe('Сила профиля (0–100 + бонус ФСП до 30)'),
  "skills": zod.array(zod.object({
  "skill_id": zod.string(),
  "name": zod.string(),
  "level": zod.enum(['basic', 'confident', 'advanced']),
  "source": zod.enum(['self', 'resume', 'test', 'fsp', 'task']).describe('self — заявлен, resume — из резюме, test — подтверждён тестом, fsp — из достижений ФСП, task — из регулярного задания'),
  "verified": zod.boolean().describe('Подтверждён тестом, заданием или ФСП'),
  "score": zod.int().min(listCandidatesResponseTwoItemsItemSkillsItemScoreMin).max(listCandidatesResponseTwoItemsItemSkillsItemScoreMax).nullable().describe('Балл по навыку в тесте, если подтверждён тестом')
})),
  "experience_years": zod.number(),
  "experience": zod.array(zod.object({
  "role": zod.string(),
  "company_name": zod.string().nullable().describe('`null`, если кандидат скрыл названия компаний'),
  "company_hidden": zod.boolean(),
  "industry": zod.union([zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),zod.null()]),
  "start": zod.string().regex(listCandidatesResponseTwoItemsItemExperienceItemStartRegExp).describe('Месяц начала YYYY-MM'),
  "end": zod.string().regex(listCandidatesResponseTwoItemsItemExperienceItemEndRegExp).nullable().describe('Месяц окончания, `null` — по настоящее время'),
  "description": zod.string().max(listCandidatesResponseTwoItemsItemExperienceItemDescriptionMax).nullable()
})),
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])),
  "city": zod.string().nullable().describe('`null`, если кандидат скрыл город'),
  "relocation": zod.boolean(),
  "salary_expectation": zod.union([zod.object({
  "from": zod.int().min(listCandidatesResponseTwoItemsItemSalaryExpectationOneFromMin).max(listCandidatesResponseTwoItemsItemSalaryExpectationOneFromMax),
  "to": zod.int().min(listCandidatesResponseTwoItemsItemSalaryExpectationOneToMin).max(listCandidatesResponseTwoItemsItemSalaryExpectationOneToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),zod.null()]),
  "availability": zod.enum(['active', 'open', 'not_looking']).describe('Ищу активно / открыт к предложениям / не ищу'),
  "last_active_at": zod.iso.datetime({"offset":true}).nullable(),
  "fsp": zod.union([zod.object({
  "has_history": zod.boolean(),
  "index": zod.int().min(listCandidatesResponseTwoItemsItemFspOneIndexMin).max(listCandidatesResponseTwoItemsItemFspOneIndexMax),
  "bonus": zod.number().min(listCandidatesResponseTwoItemsItemFspOneBonusMin).max(listCandidatesResponseTwoItemsItemFspOneBonusMax),
  "achievements_count": zod.int().min(listCandidatesResponseTwoItemsItemFspOneAchievementsCountMin),
  "top_achievement": zod.union([zod.object({
  "id": zod.uuid(),
  "event_id": zod.string(),
  "title": zod.string(),
  "date": zod.iso.date(),
  "level": zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),
  "discipline": zod.enum(['product', 'algorithmic', 'cybersecurity', 'robotics', 'uas']).describe('Продуктовое / алгоритмическое / кибербезопасность / робототехника / БАС'),
  "format": zod.enum(['individual', 'team']),
  "team": zod.string().nullable(),
  "role": zod.string().nullable(),
  "place": zod.int().min(1).nullable(),
  "participants_total": zod.int().min(1).nullable(),
  "percentile": zod.int().min(1).max(listCandidatesResponseTwoItemsItemFspOneTopAchievementOnePercentileMax).nullable(),
  "result": zod.enum(['winner', 'prize_winner', 'finalist', 'participant']).describe('Победитель / призёр / финалист / участник'),
  "sport_rank": zod.string().nullable().describe('Спортивный разряд'),
  "certificate_url": zod.url().nullable(),
  "verified": zod.boolean().describe('Подпись реестра ФСП проверена')
}),zod.null()]),
  "max_level": zod.union([zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),zod.null()])
}),zod.null()]).describe('`null` — кандидат скрыл данные ФСП; `has_history=false` — истории нет (нейтрально)'),
  "task_signal": zod.object({
  "fresh": zod.boolean().describe('Бейдж «свежий сигнал» за хорошее решение регулярного задания'),
  "solved_count": zod.int().min(listCandidatesResponseTwoItemsItemTaskSignalSolvedCountMin),
  "last_solved_at": zod.iso.datetime({"offset":true}).nullable()
}),
  "disclosure": zod.object({
  "revealed": zod.boolean(),
  "reason": zod.union([zod.enum(['invitation_accepted', 'application']).describe('Почему компании раскрыты контакты'),zod.null()]),
  "revealed_at": zod.iso.datetime({"offset":true}).nullable(),
  "source_id": zod.uuid().nullable().describe('ID инвайта или отклика')
}),
  "contacts": zod.union([zod.object({
  "full_name": zod.string(),
  "email": zod.email(),
  "phone": zod.string().nullable(),
  "telegram": zod.string().nullable(),
  "preferred_channel": zod.enum(['email', 'phone', 'telegram'])
}),zod.null()]),
  "relation": zod.object({
  "invitation": zod.union([zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed'])
}),zod.null()]),
  "application": zod.union([zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']),
  "vacancy_id": zod.uuid()
}),zod.null()])
}).describe('Отношения кандидата с компанией текущего работодателя')
}).describe('Карточка кандидата для работодателя. До раскрытия анонимна: нет ФИО, фото, возраста, контактов,\nназвания компаний скрыты по настройке. `contacts` не `null` только при `disclosure.revealed`.\n'))
}))


/**
 * `contacts` заполнен, только если `disclosure.revealed = true` для компании текущего пользователя.
 * @summary Карточка кандидата (анонимная или раскрытая)
 */
export const GetCandidateParams = zod.object({
  "candidate_id": zod.uuid()
})

export const GetCandidateQueryParams = zod.object({
  "search_id": zod.uuid().optional().describe('Если передан, в ответе есть объяснение из этой подборки (`explanation`)')
})

export const getCandidateResponseOnePercentileMax = 99;

export const getCandidateResponseOneStrengthMin = 0;
export const getCandidateResponseOneStrengthMax = 130;

export const getCandidateResponseOneSkillsItemScoreMin = 0;
export const getCandidateResponseOneSkillsItemScoreMax = 100;

export const getCandidateResponseOneExperienceItemStartRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const getCandidateResponseOneExperienceItemEndRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const getCandidateResponseOneExperienceItemDescriptionMax = 1000;

export const getCandidateResponseOneSalaryExpectationOneFromMin = 10000;
export const getCandidateResponseOneSalaryExpectationOneFromMax = 10000000;

export const getCandidateResponseOneSalaryExpectationOneToMin = 10000;
export const getCandidateResponseOneSalaryExpectationOneToMax = 10000000;

export const getCandidateResponseOneFspOneIndexMin = 0;
export const getCandidateResponseOneFspOneIndexMax = 100;

export const getCandidateResponseOneFspOneBonusMin = 0;
export const getCandidateResponseOneFspOneBonusMax = 30;

export const getCandidateResponseOneFspOneAchievementsCountMin = 0;



export const getCandidateResponseOneFspOneTopAchievementOnePercentileMax = 99;

export const getCandidateResponseOneTaskSignalSolvedCountMin = 0;

export const getCandidateResponseTwoExplanationOneScoreMin = 0;
export const getCandidateResponseTwoExplanationOneScoreMax = 100;

export const getCandidateResponseTwoExplanationOneFitMin = 0;
export const getCandidateResponseTwoExplanationOneFitMax = 100;

export const getCandidateResponseTwoExplanationOneStrengthMin = 0;
export const getCandidateResponseTwoExplanationOneStrengthMax = 130;

export const getCandidateResponseTwoExplanationOneChipsMax = 3;



export const getCandidateResponseTwoAchievementsItemPercentileMax = 99;



export const GetCandidateResponse = zod.object({
  "id": zod.uuid(),
  "alias": zod.string().describe('Анонимное имя, стабильное для пары компания–кандидат'),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "grade_confirmed": zod.boolean(),
  "percentile": zod.int().min(1).max(getCandidateResponseOnePercentileMax).nullable(),
  "test_flags": zod.array(zod.object({
  "code": zod.enum(['fast_correct', 'paste', 'focus_loss']),
  "severity": zod.enum(['info', 'warning'])
}).describe('Сигнал прокторинга подтверждающего теста; не доказывает нарушение')).optional(),
  "strength": zod.number().min(getCandidateResponseOneStrengthMin).max(getCandidateResponseOneStrengthMax).describe('Сила профиля (0–100 + бонус ФСП до 30)'),
  "skills": zod.array(zod.object({
  "skill_id": zod.string(),
  "name": zod.string(),
  "level": zod.enum(['basic', 'confident', 'advanced']),
  "source": zod.enum(['self', 'resume', 'test', 'fsp', 'task']).describe('self — заявлен, resume — из резюме, test — подтверждён тестом, fsp — из достижений ФСП, task — из регулярного задания'),
  "verified": zod.boolean().describe('Подтверждён тестом, заданием или ФСП'),
  "score": zod.int().min(getCandidateResponseOneSkillsItemScoreMin).max(getCandidateResponseOneSkillsItemScoreMax).nullable().describe('Балл по навыку в тесте, если подтверждён тестом')
})),
  "experience_years": zod.number(),
  "experience": zod.array(zod.object({
  "role": zod.string(),
  "company_name": zod.string().nullable().describe('`null`, если кандидат скрыл названия компаний'),
  "company_hidden": zod.boolean(),
  "industry": zod.union([zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),zod.null()]),
  "start": zod.string().regex(getCandidateResponseOneExperienceItemStartRegExp).describe('Месяц начала YYYY-MM'),
  "end": zod.string().regex(getCandidateResponseOneExperienceItemEndRegExp).nullable().describe('Месяц окончания, `null` — по настоящее время'),
  "description": zod.string().max(getCandidateResponseOneExperienceItemDescriptionMax).nullable()
})),
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])),
  "city": zod.string().nullable().describe('`null`, если кандидат скрыл город'),
  "relocation": zod.boolean(),
  "salary_expectation": zod.union([zod.object({
  "from": zod.int().min(getCandidateResponseOneSalaryExpectationOneFromMin).max(getCandidateResponseOneSalaryExpectationOneFromMax),
  "to": zod.int().min(getCandidateResponseOneSalaryExpectationOneToMin).max(getCandidateResponseOneSalaryExpectationOneToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),zod.null()]),
  "availability": zod.enum(['active', 'open', 'not_looking']).describe('Ищу активно / открыт к предложениям / не ищу'),
  "last_active_at": zod.iso.datetime({"offset":true}).nullable(),
  "fsp": zod.union([zod.object({
  "has_history": zod.boolean(),
  "index": zod.int().min(getCandidateResponseOneFspOneIndexMin).max(getCandidateResponseOneFspOneIndexMax),
  "bonus": zod.number().min(getCandidateResponseOneFspOneBonusMin).max(getCandidateResponseOneFspOneBonusMax),
  "achievements_count": zod.int().min(getCandidateResponseOneFspOneAchievementsCountMin),
  "top_achievement": zod.union([zod.object({
  "id": zod.uuid(),
  "event_id": zod.string(),
  "title": zod.string(),
  "date": zod.iso.date(),
  "level": zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),
  "discipline": zod.enum(['product', 'algorithmic', 'cybersecurity', 'robotics', 'uas']).describe('Продуктовое / алгоритмическое / кибербезопасность / робототехника / БАС'),
  "format": zod.enum(['individual', 'team']),
  "team": zod.string().nullable(),
  "role": zod.string().nullable(),
  "place": zod.int().min(1).nullable(),
  "participants_total": zod.int().min(1).nullable(),
  "percentile": zod.int().min(1).max(getCandidateResponseOneFspOneTopAchievementOnePercentileMax).nullable(),
  "result": zod.enum(['winner', 'prize_winner', 'finalist', 'participant']).describe('Победитель / призёр / финалист / участник'),
  "sport_rank": zod.string().nullable().describe('Спортивный разряд'),
  "certificate_url": zod.url().nullable(),
  "verified": zod.boolean().describe('Подпись реестра ФСП проверена')
}),zod.null()]),
  "max_level": zod.union([zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),zod.null()])
}),zod.null()]).describe('`null` — кандидат скрыл данные ФСП; `has_history=false` — истории нет (нейтрально)'),
  "task_signal": zod.object({
  "fresh": zod.boolean().describe('Бейдж «свежий сигнал» за хорошее решение регулярного задания'),
  "solved_count": zod.int().min(getCandidateResponseOneTaskSignalSolvedCountMin),
  "last_solved_at": zod.iso.datetime({"offset":true}).nullable()
}),
  "disclosure": zod.object({
  "revealed": zod.boolean(),
  "reason": zod.union([zod.enum(['invitation_accepted', 'application']).describe('Почему компании раскрыты контакты'),zod.null()]),
  "revealed_at": zod.iso.datetime({"offset":true}).nullable(),
  "source_id": zod.uuid().nullable().describe('ID инвайта или отклика')
}),
  "contacts": zod.union([zod.object({
  "full_name": zod.string(),
  "email": zod.email(),
  "phone": zod.string().nullable(),
  "telegram": zod.string().nullable(),
  "preferred_channel": zod.enum(['email', 'phone', 'telegram'])
}),zod.null()]),
  "relation": zod.object({
  "invitation": zod.union([zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed'])
}),zod.null()]),
  "application": zod.union([zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']),
  "vacancy_id": zod.uuid()
}),zod.null()])
}).describe('Отношения кандидата с компанией текущего работодателя')
}).describe('Карточка кандидата для работодателя. До раскрытия анонимна: нет ФИО, фото, возраста, контактов,\nназвания компаний скрыты по настройке. `contacts` не `null` только при `disclosure.revealed`.\n').and(zod.object({
  "explanation": zod.union([zod.object({
  "score": zod.number().min(getCandidateResponseTwoExplanationOneScoreMin).max(getCandidateResponseTwoExplanationOneScoreMax).describe('Score = 0.6·Fit + 0.4·Strength − штрафы'),
  "fit": zod.number().min(getCandidateResponseTwoExplanationOneFitMin).max(getCandidateResponseTwoExplanationOneFitMax),
  "strength": zod.number().min(getCandidateResponseTwoExplanationOneStrengthMin).max(getCandidateResponseTwoExplanationOneStrengthMax),
  "chips": zod.array(zod.object({
  "kind": zod.enum(['skills_coverage', 'confirmed_skills', 'semantic', 'industry', 'conditions', 'percentile', 'fsp', 'tasks', 'completeness', 'missing_skill', 'penalty']),
  "label": zod.string(),
  "contribution": zod.number().describe('Вклад в итоговый Score, пункты (со знаком)'),
  "polarity": zod.enum(['positive', 'negative', 'neutral']),
  "evidence": zod.string().nullable()
}).describe('Вклад фактора в скоринг: `{factor, value, contribution, evidence}`')).max(getCandidateResponseTwoExplanationOneChipsMax).describe('Три главных фактора для чипов'),
  "factors": zod.array(zod.object({
  "kind": zod.enum(['skills_coverage', 'confirmed_skills', 'semantic', 'industry', 'conditions', 'percentile', 'fsp', 'tasks', 'completeness', 'missing_skill', 'penalty']),
  "label": zod.string(),
  "contribution": zod.number().describe('Вклад в итоговый Score, пункты (со знаком)'),
  "polarity": zod.enum(['positive', 'negative', 'neutral']),
  "evidence": zod.string().nullable()
}).describe('Вклад фактора в скоринг: `{factor, value, contribution, evidence}`')).describe('Полный список для панели «Почему в подборке»')
}),zod.null()]).describe('Объяснение из подборки (если передан `search_id`)'),
  "achievements": zod.array(zod.object({
  "id": zod.uuid(),
  "event_id": zod.string(),
  "title": zod.string(),
  "date": zod.iso.date(),
  "level": zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),
  "discipline": zod.enum(['product', 'algorithmic', 'cybersecurity', 'robotics', 'uas']).describe('Продуктовое / алгоритмическое / кибербезопасность / робототехника / БАС'),
  "format": zod.enum(['individual', 'team']),
  "team": zod.string().nullable(),
  "role": zod.string().nullable(),
  "place": zod.int().min(1).nullable(),
  "participants_total": zod.int().min(1).nullable(),
  "percentile": zod.int().min(1).max(getCandidateResponseTwoAchievementsItemPercentileMax).nullable(),
  "result": zod.enum(['winner', 'prize_winner', 'finalist', 'participant']).describe('Победитель / призёр / финалист / участник'),
  "sport_rank": zod.string().nullable().describe('Спортивный разряд'),
  "certificate_url": zod.url().nullable(),
  "verified": zod.boolean().describe('Подпись реестра ФСП проверена')
})).describe('Достижения ФСП (пусто, если скрыты или нет)')
}))


/**
 * @summary Инвайты компании
 */
export const ListCompanyInvitationsQueryParams = zod.object({
  "status": zod.array(zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed'])).optional(),
  "candidate_id": zod.uuid().optional()
})

export const listCompanyInvitationsResponseSalaryFromMin = 10000;
export const listCompanyInvitationsResponseSalaryFromMax = 10000000;

export const listCompanyInvitationsResponseSalaryToMin = 10000;
export const listCompanyInvitationsResponseSalaryToMax = 10000000;

export const listCompanyInvitationsResponseCompanyTrustInvitations90dMin = 0;

export const listCompanyInvitationsResponseCompanyTrustAcceptanceRateMin = 0;
export const listCompanyInvitationsResponseCompanyTrustAcceptanceRateMax = 1;

export const listCompanyInvitationsResponseCompanyTrustWithdrawnAfterAcceptMin = 0;

export const listCompanyInvitationsResponseContactValueMin = 3;
export const listCompanyInvitationsResponseContactValueMax = 120;



export const ListCompanyInvitationsResponseItem = zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed']),
  "title": zod.string(),
  "description": zod.string(),
  "salary": zod.object({
  "from": zod.int().min(listCompanyInvitationsResponseSalaryFromMin).max(listCompanyInvitationsResponseSalaryFromMax),
  "to": zod.int().min(listCompanyInvitationsResponseSalaryToMin).max(listCompanyInvitationsResponseSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "work_format": zod.enum(['office', 'hybrid', 'remote']),
  "city": zod.string().nullable(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
}),
  "company_trust": zod.object({
  "invitations_90d": zod.int().min(listCompanyInvitationsResponseCompanyTrustInvitations90dMin),
  "acceptance_rate": zod.number().min(listCompanyInvitationsResponseCompanyTrustAcceptanceRateMin).max(listCompanyInvitationsResponseCompanyTrustAcceptanceRateMax),
  "withdrawn_after_accept": zod.int().min(listCompanyInvitationsResponseCompanyTrustWithdrawnAfterAcceptMin)
}).optional().describe('Надёжность компании за 90 дней — защита кандидата от фиктивных вакансий'),
  "contact_person": zod.string(),
  "contact": zod.object({
  "channel": zod.enum(['email', 'phone', 'telegram']),
  "value": zod.string().min(listCompanyInvitationsResponseContactValueMin).max(listCompanyInvitationsResponseContactValueMax)
}).describe('Как компания предлагает связаться'),
  "vacancy": zod.union([zod.object({
  "id": zod.uuid(),
  "title": zod.string(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
})
}),zod.null()]),
  "candidate": zod.object({
  "id": zod.uuid(),
  "alias": zod.string(),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "percentile": zod.int().nullable()
}),
  "source": zod.object({
  "type": zod.enum(['search', 'bank', 'task_submission', 'vacancy']),
  "id": zod.uuid().nullable()
}),
  "created_at": zod.iso.datetime({"offset":true}),
  "sent_at": zod.iso.datetime({"offset":true}).nullable(),
  "viewed_at": zod.iso.datetime({"offset":true}).nullable(),
  "expires_at": zod.iso.datetime({"offset":true}).describe('Срок ответа (по умолчанию 7 дней с отправки)'),
  "response": zod.union([zod.object({
  "decision": zod.enum(['accepted', 'declined', 'postponed']),
  "reason": zod.union([zod.enum(['salary', 'stack', 'format', 'company', 'not_looking', 'other']).describe('Вилка, стек, формат, компания, не ищу, другое'),zod.null()]),
  "comment": zod.string().nullable(),
  "channel": zod.union([zod.enum(['email', 'phone', 'telegram']),zod.null()]).describe('Канал, который выбрал кандидат при принятии'),
  "call_slot": zod.iso.datetime({"offset":true}).nullable().describe('Удобный слот созвона (опционально)'),
  "postponed_until": zod.iso.date().nullable(),
  "responded_at": zod.iso.datetime({"offset":true})
}),zod.null()]),
  "candidate_contacts": zod.union([zod.object({
  "full_name": zod.string(),
  "email": zod.email(),
  "phone": zod.string().nullable(),
  "telegram": zod.string().nullable(),
  "preferred_channel": zod.enum(['email', 'phone', 'telegram'])
}),zod.null()]).describe('Только для работодателя и только после принятия'),
  "events": zod.array(zod.object({
  "id": zod.uuid(),
  "at": zod.iso.datetime({"offset":true}),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed']),
  "actor": zod.enum(['candidate', 'employer', 'system']),
  "note": zod.string().nullable()
}))
})
export const ListCompanyInvitationsResponse = zod.array(ListCompanyInvitationsResponseItem)


/**
 * @summary Отправить инвайт с открытой вилкой
 */
export const createInvitationBodyTitleMin = 5;
export const createInvitationBodyTitleMax = 120;

export const createInvitationBodyDescriptionMin = 50;
export const createInvitationBodyDescriptionMax = 3000;

export const createInvitationBodySalaryFromMin = 10000;
export const createInvitationBodySalaryFromMax = 10000000;

export const createInvitationBodySalaryToMin = 10000;
export const createInvitationBodySalaryToMax = 10000000;

export const createInvitationBodyCityMax = 100;

export const createInvitationBodyContactPersonMin = 2;
export const createInvitationBodyContactPersonMax = 120;

export const createInvitationBodyContactValueMin = 3;
export const createInvitationBodyContactValueMax = 120;

export const createInvitationBodyResponseDaysDefault = 7;
export const createInvitationBodyResponseDaysMin = 3;
export const createInvitationBodyResponseDaysMax = 14;



export const CreateInvitationBody = zod.object({
  "candidate_id": zod.uuid(),
  "title": zod.string().min(createInvitationBodyTitleMin).max(createInvitationBodyTitleMax),
  "description": zod.string().min(createInvitationBodyDescriptionMin).max(createInvitationBodyDescriptionMax).describe('Описание предложения'),
  "salary": zod.object({
  "from": zod.int().min(createInvitationBodySalaryFromMin).max(createInvitationBodySalaryFromMax),
  "to": zod.int().min(createInvitationBodySalaryToMin).max(createInvitationBodySalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "work_format": zod.enum(['office', 'hybrid', 'remote']),
  "city": zod.string().max(createInvitationBodyCityMax).nullable(),
  "contact_person": zod.string().min(createInvitationBodyContactPersonMin).max(createInvitationBodyContactPersonMax),
  "contact": zod.object({
  "channel": zod.enum(['email', 'phone', 'telegram']),
  "value": zod.string().min(createInvitationBodyContactValueMin).max(createInvitationBodyContactValueMax)
}).describe('Как компания предлагает связаться'),
  "response_days": zod.int().min(createInvitationBodyResponseDaysMin).max(createInvitationBodyResponseDaysMax).default(createInvitationBodyResponseDaysDefault),
  "vacancy_id": zod.uuid().nullish(),
  "source": zod.object({
  "type": zod.enum(['search', 'bank', 'task_submission', 'vacancy']),
  "id": zod.uuid().nullable()
}).optional()
})

export const createInvitationResponseSalaryFromMin = 10000;
export const createInvitationResponseSalaryFromMax = 10000000;

export const createInvitationResponseSalaryToMin = 10000;
export const createInvitationResponseSalaryToMax = 10000000;

export const createInvitationResponseCompanyTrustInvitations90dMin = 0;

export const createInvitationResponseCompanyTrustAcceptanceRateMin = 0;
export const createInvitationResponseCompanyTrustAcceptanceRateMax = 1;

export const createInvitationResponseCompanyTrustWithdrawnAfterAcceptMin = 0;

export const createInvitationResponseContactValueMin = 3;
export const createInvitationResponseContactValueMax = 120;



export const CreateInvitationResponse = zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed']),
  "title": zod.string(),
  "description": zod.string(),
  "salary": zod.object({
  "from": zod.int().min(createInvitationResponseSalaryFromMin).max(createInvitationResponseSalaryFromMax),
  "to": zod.int().min(createInvitationResponseSalaryToMin).max(createInvitationResponseSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "work_format": zod.enum(['office', 'hybrid', 'remote']),
  "city": zod.string().nullable(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
}),
  "company_trust": zod.object({
  "invitations_90d": zod.int().min(createInvitationResponseCompanyTrustInvitations90dMin),
  "acceptance_rate": zod.number().min(createInvitationResponseCompanyTrustAcceptanceRateMin).max(createInvitationResponseCompanyTrustAcceptanceRateMax),
  "withdrawn_after_accept": zod.int().min(createInvitationResponseCompanyTrustWithdrawnAfterAcceptMin)
}).optional().describe('Надёжность компании за 90 дней — защита кандидата от фиктивных вакансий'),
  "contact_person": zod.string(),
  "contact": zod.object({
  "channel": zod.enum(['email', 'phone', 'telegram']),
  "value": zod.string().min(createInvitationResponseContactValueMin).max(createInvitationResponseContactValueMax)
}).describe('Как компания предлагает связаться'),
  "vacancy": zod.union([zod.object({
  "id": zod.uuid(),
  "title": zod.string(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
})
}),zod.null()]),
  "candidate": zod.object({
  "id": zod.uuid(),
  "alias": zod.string(),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "percentile": zod.int().nullable()
}),
  "source": zod.object({
  "type": zod.enum(['search', 'bank', 'task_submission', 'vacancy']),
  "id": zod.uuid().nullable()
}),
  "created_at": zod.iso.datetime({"offset":true}),
  "sent_at": zod.iso.datetime({"offset":true}).nullable(),
  "viewed_at": zod.iso.datetime({"offset":true}).nullable(),
  "expires_at": zod.iso.datetime({"offset":true}).describe('Срок ответа (по умолчанию 7 дней с отправки)'),
  "response": zod.union([zod.object({
  "decision": zod.enum(['accepted', 'declined', 'postponed']),
  "reason": zod.union([zod.enum(['salary', 'stack', 'format', 'company', 'not_looking', 'other']).describe('Вилка, стек, формат, компания, не ищу, другое'),zod.null()]),
  "comment": zod.string().nullable(),
  "channel": zod.union([zod.enum(['email', 'phone', 'telegram']),zod.null()]).describe('Канал, который выбрал кандидат при принятии'),
  "call_slot": zod.iso.datetime({"offset":true}).nullable().describe('Удобный слот созвона (опционально)'),
  "postponed_until": zod.iso.date().nullable(),
  "responded_at": zod.iso.datetime({"offset":true})
}),zod.null()]),
  "candidate_contacts": zod.union([zod.object({
  "full_name": zod.string(),
  "email": zod.email(),
  "phone": zod.string().nullable(),
  "telegram": zod.string().nullable(),
  "preferred_channel": zod.enum(['email', 'phone', 'telegram'])
}),zod.null()]).describe('Только для работодателя и только после принятия'),
  "events": zod.array(zod.object({
  "id": zod.uuid(),
  "at": zod.iso.datetime({"offset":true}),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed']),
  "actor": zod.enum(['candidate', 'employer', 'system']),
  "note": zod.string().nullable()
}))
})


/**
 * Ответ булев, порог кандидата не раскрывается. Ограничен по частоте (не больше 10 проверок на кандидата в час).
 * @summary Проверить до отправки — вилка, квота, активный инвайт
 */
export const precheckInvitationBodySalaryFromMin = 10000;
export const precheckInvitationBodySalaryFromMax = 10000000;

export const precheckInvitationBodySalaryToMin = 10000;
export const precheckInvitationBodySalaryToMax = 10000000;



export const PrecheckInvitationBody = zod.object({
  "candidate_id": zod.uuid(),
  "salary": zod.object({
  "from": zod.int().min(precheckInvitationBodySalaryFromMin).max(precheckInvitationBodySalaryFromMax),
  "to": zod.int().min(precheckInvitationBodySalaryToMin).max(precheckInvitationBodySalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.')
})

export const precheckInvitationResponseQuotaLimitMin = 0;

export const precheckInvitationResponseQuotaUsedMin = 0;

export const precheckInvitationResponseQuotaRemainingMin = 0;

export const precheckInvitationResponseQuotaPenaltyMin = 0;

export const precheckInvitationResponseQuotaAcceptanceRateMin = 0;
export const precheckInvitationResponseQuotaAcceptanceRateMax = 1;

export const precheckInvitationResponseQuotaBonusMin = 0;



export const PrecheckInvitationResponse = zod.object({
  "can_send": zod.boolean(),
  "salary_ok": zod.boolean().describe('`false` — «вилка ниже ожиданий кандидата», без цифры порога'),
  "already_invited": zod.boolean(),
  "candidate_available": zod.boolean().describe('`false` — кандидат не ищет работу или скрыт'),
  "quota": zod.object({
  "limit": zod.int().min(precheckInvitationResponseQuotaLimitMin).describe('Итоговый лимит на неделю (база + бонус − штраф, не меньше 1)'),
  "used": zod.int().min(precheckInvitationResponseQuotaUsedMin),
  "remaining": zod.int().min(precheckInvitationResponseQuotaRemainingMin),
  "period_start": zod.iso.datetime({"offset":true}),
  "period_end": zod.iso.datetime({"offset":true}),
  "penalty": zod.int().min(precheckInvitationResponseQuotaPenaltyMin).optional().describe('Штраф за отзыв приглашений после согласия кандидата (2 за каждый)'),
  "acceptance_rate": zod.number().min(precheckInvitationResponseQuotaAcceptanceRateMin).max(precheckInvitationResponseQuotaAcceptanceRateMax).describe('Доля принятых инвайтов за 90 дней'),
  "bonus": zod.int().min(precheckInvitationResponseQuotaBonusMin).describe('Прибавка к базовой квоте за долю принятых')
})
})


/**
 * @summary Воронка и причины отказов компании
 */
export const getInvitationStatsQueryDaysDefault = 90;
export const getInvitationStatsQueryDaysMin = 7;
export const getInvitationStatsQueryDaysMax = 365;



export const GetInvitationStatsQueryParams = zod.object({
  "days": zod.int().min(getInvitationStatsQueryDaysMin).max(getInvitationStatsQueryDaysMax).default(getInvitationStatsQueryDaysDefault)
})

export const getInvitationStatsResponseAcceptanceRateMin = 0;
export const getInvitationStatsResponseAcceptanceRateMax = 1;



export const GetInvitationStatsResponse = zod.object({
  "days": zod.int(),
  "funnel": zod.object({
  "sent": zod.int(),
  "viewed": zod.int(),
  "accepted": zod.int(),
  "declined": zod.int(),
  "postponed": zod.int(),
  "expired": zod.int(),
  "withdrawn": zod.int(),
  "interview": zod.int(),
  "offer": zod.int(),
  "hired": zod.int()
}),
  "decline_reasons": zod.array(zod.object({
  "reason": zod.enum(['salary', 'stack', 'format', 'company', 'not_looking', 'other']).describe('Вилка, стек, формат, компания, не ищу, другое'),
  "count": zod.int()
})),
  "acceptance_rate": zod.number().min(getInvitationStatsResponseAcceptanceRateMin).max(getInvitationStatsResponseAcceptanceRateMax),
  "median_response_hours": zod.number().nullable()
})


/**
 * @summary Входящие инвайты кандидата
 */
export const ListMyInvitationsQueryParams = zod.object({
  "status": zod.array(zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed'])).optional()
})

export const listMyInvitationsResponseSalaryFromMin = 10000;
export const listMyInvitationsResponseSalaryFromMax = 10000000;

export const listMyInvitationsResponseSalaryToMin = 10000;
export const listMyInvitationsResponseSalaryToMax = 10000000;

export const listMyInvitationsResponseCompanyTrustInvitations90dMin = 0;

export const listMyInvitationsResponseCompanyTrustAcceptanceRateMin = 0;
export const listMyInvitationsResponseCompanyTrustAcceptanceRateMax = 1;

export const listMyInvitationsResponseCompanyTrustWithdrawnAfterAcceptMin = 0;

export const listMyInvitationsResponseContactValueMin = 3;
export const listMyInvitationsResponseContactValueMax = 120;



export const ListMyInvitationsResponseItem = zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed']),
  "title": zod.string(),
  "description": zod.string(),
  "salary": zod.object({
  "from": zod.int().min(listMyInvitationsResponseSalaryFromMin).max(listMyInvitationsResponseSalaryFromMax),
  "to": zod.int().min(listMyInvitationsResponseSalaryToMin).max(listMyInvitationsResponseSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "work_format": zod.enum(['office', 'hybrid', 'remote']),
  "city": zod.string().nullable(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
}),
  "company_trust": zod.object({
  "invitations_90d": zod.int().min(listMyInvitationsResponseCompanyTrustInvitations90dMin),
  "acceptance_rate": zod.number().min(listMyInvitationsResponseCompanyTrustAcceptanceRateMin).max(listMyInvitationsResponseCompanyTrustAcceptanceRateMax),
  "withdrawn_after_accept": zod.int().min(listMyInvitationsResponseCompanyTrustWithdrawnAfterAcceptMin)
}).optional().describe('Надёжность компании за 90 дней — защита кандидата от фиктивных вакансий'),
  "contact_person": zod.string(),
  "contact": zod.object({
  "channel": zod.enum(['email', 'phone', 'telegram']),
  "value": zod.string().min(listMyInvitationsResponseContactValueMin).max(listMyInvitationsResponseContactValueMax)
}).describe('Как компания предлагает связаться'),
  "vacancy": zod.union([zod.object({
  "id": zod.uuid(),
  "title": zod.string(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
})
}),zod.null()]),
  "candidate": zod.object({
  "id": zod.uuid(),
  "alias": zod.string(),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "percentile": zod.int().nullable()
}),
  "source": zod.object({
  "type": zod.enum(['search', 'bank', 'task_submission', 'vacancy']),
  "id": zod.uuid().nullable()
}),
  "created_at": zod.iso.datetime({"offset":true}),
  "sent_at": zod.iso.datetime({"offset":true}).nullable(),
  "viewed_at": zod.iso.datetime({"offset":true}).nullable(),
  "expires_at": zod.iso.datetime({"offset":true}).describe('Срок ответа (по умолчанию 7 дней с отправки)'),
  "response": zod.union([zod.object({
  "decision": zod.enum(['accepted', 'declined', 'postponed']),
  "reason": zod.union([zod.enum(['salary', 'stack', 'format', 'company', 'not_looking', 'other']).describe('Вилка, стек, формат, компания, не ищу, другое'),zod.null()]),
  "comment": zod.string().nullable(),
  "channel": zod.union([zod.enum(['email', 'phone', 'telegram']),zod.null()]).describe('Канал, который выбрал кандидат при принятии'),
  "call_slot": zod.iso.datetime({"offset":true}).nullable().describe('Удобный слот созвона (опционально)'),
  "postponed_until": zod.iso.date().nullable(),
  "responded_at": zod.iso.datetime({"offset":true})
}),zod.null()]),
  "candidate_contacts": zod.union([zod.object({
  "full_name": zod.string(),
  "email": zod.email(),
  "phone": zod.string().nullable(),
  "telegram": zod.string().nullable(),
  "preferred_channel": zod.enum(['email', 'phone', 'telegram'])
}),zod.null()]).describe('Только для работодателя и только после принятия'),
  "events": zod.array(zod.object({
  "id": zod.uuid(),
  "at": zod.iso.datetime({"offset":true}),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed']),
  "actor": zod.enum(['candidate', 'employer', 'system']),
  "note": zod.string().nullable()
}))
})
export const ListMyInvitationsResponse = zod.array(ListMyInvitationsResponseItem)


/**
 * @summary Инвайт (кандидату — свой, работодателю — своей компании)
 */
export const GetInvitationParams = zod.object({
  "invitation_id": zod.uuid()
})

export const getInvitationResponseSalaryFromMin = 10000;
export const getInvitationResponseSalaryFromMax = 10000000;

export const getInvitationResponseSalaryToMin = 10000;
export const getInvitationResponseSalaryToMax = 10000000;

export const getInvitationResponseCompanyTrustInvitations90dMin = 0;

export const getInvitationResponseCompanyTrustAcceptanceRateMin = 0;
export const getInvitationResponseCompanyTrustAcceptanceRateMax = 1;

export const getInvitationResponseCompanyTrustWithdrawnAfterAcceptMin = 0;

export const getInvitationResponseContactValueMin = 3;
export const getInvitationResponseContactValueMax = 120;



export const GetInvitationResponse = zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed']),
  "title": zod.string(),
  "description": zod.string(),
  "salary": zod.object({
  "from": zod.int().min(getInvitationResponseSalaryFromMin).max(getInvitationResponseSalaryFromMax),
  "to": zod.int().min(getInvitationResponseSalaryToMin).max(getInvitationResponseSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "work_format": zod.enum(['office', 'hybrid', 'remote']),
  "city": zod.string().nullable(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
}),
  "company_trust": zod.object({
  "invitations_90d": zod.int().min(getInvitationResponseCompanyTrustInvitations90dMin),
  "acceptance_rate": zod.number().min(getInvitationResponseCompanyTrustAcceptanceRateMin).max(getInvitationResponseCompanyTrustAcceptanceRateMax),
  "withdrawn_after_accept": zod.int().min(getInvitationResponseCompanyTrustWithdrawnAfterAcceptMin)
}).optional().describe('Надёжность компании за 90 дней — защита кандидата от фиктивных вакансий'),
  "contact_person": zod.string(),
  "contact": zod.object({
  "channel": zod.enum(['email', 'phone', 'telegram']),
  "value": zod.string().min(getInvitationResponseContactValueMin).max(getInvitationResponseContactValueMax)
}).describe('Как компания предлагает связаться'),
  "vacancy": zod.union([zod.object({
  "id": zod.uuid(),
  "title": zod.string(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
})
}),zod.null()]),
  "candidate": zod.object({
  "id": zod.uuid(),
  "alias": zod.string(),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "percentile": zod.int().nullable()
}),
  "source": zod.object({
  "type": zod.enum(['search', 'bank', 'task_submission', 'vacancy']),
  "id": zod.uuid().nullable()
}),
  "created_at": zod.iso.datetime({"offset":true}),
  "sent_at": zod.iso.datetime({"offset":true}).nullable(),
  "viewed_at": zod.iso.datetime({"offset":true}).nullable(),
  "expires_at": zod.iso.datetime({"offset":true}).describe('Срок ответа (по умолчанию 7 дней с отправки)'),
  "response": zod.union([zod.object({
  "decision": zod.enum(['accepted', 'declined', 'postponed']),
  "reason": zod.union([zod.enum(['salary', 'stack', 'format', 'company', 'not_looking', 'other']).describe('Вилка, стек, формат, компания, не ищу, другое'),zod.null()]),
  "comment": zod.string().nullable(),
  "channel": zod.union([zod.enum(['email', 'phone', 'telegram']),zod.null()]).describe('Канал, который выбрал кандидат при принятии'),
  "call_slot": zod.iso.datetime({"offset":true}).nullable().describe('Удобный слот созвона (опционально)'),
  "postponed_until": zod.iso.date().nullable(),
  "responded_at": zod.iso.datetime({"offset":true})
}),zod.null()]),
  "candidate_contacts": zod.union([zod.object({
  "full_name": zod.string(),
  "email": zod.email(),
  "phone": zod.string().nullable(),
  "telegram": zod.string().nullable(),
  "preferred_channel": zod.enum(['email', 'phone', 'telegram'])
}),zod.null()]).describe('Только для работодателя и только после принятия'),
  "events": zod.array(zod.object({
  "id": zod.uuid(),
  "at": zod.iso.datetime({"offset":true}),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed']),
  "actor": zod.enum(['candidate', 'employer', 'system']),
  "note": zod.string().nullable()
}))
})


/**
 * @summary Отметить просмотр (sent → viewed, идемпотентно)
 */
export const MarkInvitationViewedParams = zod.object({
  "invitation_id": zod.uuid()
})

export const markInvitationViewedResponseSalaryFromMin = 10000;
export const markInvitationViewedResponseSalaryFromMax = 10000000;

export const markInvitationViewedResponseSalaryToMin = 10000;
export const markInvitationViewedResponseSalaryToMax = 10000000;

export const markInvitationViewedResponseCompanyTrustInvitations90dMin = 0;

export const markInvitationViewedResponseCompanyTrustAcceptanceRateMin = 0;
export const markInvitationViewedResponseCompanyTrustAcceptanceRateMax = 1;

export const markInvitationViewedResponseCompanyTrustWithdrawnAfterAcceptMin = 0;

export const markInvitationViewedResponseContactValueMin = 3;
export const markInvitationViewedResponseContactValueMax = 120;



export const MarkInvitationViewedResponse = zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed']),
  "title": zod.string(),
  "description": zod.string(),
  "salary": zod.object({
  "from": zod.int().min(markInvitationViewedResponseSalaryFromMin).max(markInvitationViewedResponseSalaryFromMax),
  "to": zod.int().min(markInvitationViewedResponseSalaryToMin).max(markInvitationViewedResponseSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "work_format": zod.enum(['office', 'hybrid', 'remote']),
  "city": zod.string().nullable(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
}),
  "company_trust": zod.object({
  "invitations_90d": zod.int().min(markInvitationViewedResponseCompanyTrustInvitations90dMin),
  "acceptance_rate": zod.number().min(markInvitationViewedResponseCompanyTrustAcceptanceRateMin).max(markInvitationViewedResponseCompanyTrustAcceptanceRateMax),
  "withdrawn_after_accept": zod.int().min(markInvitationViewedResponseCompanyTrustWithdrawnAfterAcceptMin)
}).optional().describe('Надёжность компании за 90 дней — защита кандидата от фиктивных вакансий'),
  "contact_person": zod.string(),
  "contact": zod.object({
  "channel": zod.enum(['email', 'phone', 'telegram']),
  "value": zod.string().min(markInvitationViewedResponseContactValueMin).max(markInvitationViewedResponseContactValueMax)
}).describe('Как компания предлагает связаться'),
  "vacancy": zod.union([zod.object({
  "id": zod.uuid(),
  "title": zod.string(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
})
}),zod.null()]),
  "candidate": zod.object({
  "id": zod.uuid(),
  "alias": zod.string(),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "percentile": zod.int().nullable()
}),
  "source": zod.object({
  "type": zod.enum(['search', 'bank', 'task_submission', 'vacancy']),
  "id": zod.uuid().nullable()
}),
  "created_at": zod.iso.datetime({"offset":true}),
  "sent_at": zod.iso.datetime({"offset":true}).nullable(),
  "viewed_at": zod.iso.datetime({"offset":true}).nullable(),
  "expires_at": zod.iso.datetime({"offset":true}).describe('Срок ответа (по умолчанию 7 дней с отправки)'),
  "response": zod.union([zod.object({
  "decision": zod.enum(['accepted', 'declined', 'postponed']),
  "reason": zod.union([zod.enum(['salary', 'stack', 'format', 'company', 'not_looking', 'other']).describe('Вилка, стек, формат, компания, не ищу, другое'),zod.null()]),
  "comment": zod.string().nullable(),
  "channel": zod.union([zod.enum(['email', 'phone', 'telegram']),zod.null()]).describe('Канал, который выбрал кандидат при принятии'),
  "call_slot": zod.iso.datetime({"offset":true}).nullable().describe('Удобный слот созвона (опционально)'),
  "postponed_until": zod.iso.date().nullable(),
  "responded_at": zod.iso.datetime({"offset":true})
}),zod.null()]),
  "candidate_contacts": zod.union([zod.object({
  "full_name": zod.string(),
  "email": zod.email(),
  "phone": zod.string().nullable(),
  "telegram": zod.string().nullable(),
  "preferred_channel": zod.enum(['email', 'phone', 'telegram'])
}),zod.null()]).describe('Только для работодателя и только после принятия'),
  "events": zod.array(zod.object({
  "id": zod.uuid(),
  "at": zod.iso.datetime({"offset":true}),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed']),
  "actor": zod.enum(['candidate', 'employer', 'system']),
  "note": zod.string().nullable()
}))
})


/**
 * @summary Принять — контакты раскрываются компании
 */
export const AcceptInvitationParams = zod.object({
  "invitation_id": zod.uuid()
})

export const acceptInvitationBodyMessageMax = 1000;



export const AcceptInvitationBody = zod.object({
  "channel": zod.enum(['email', 'phone', 'telegram']).describe('Канал связи из своих контактов (должен быть заполнен в профиле)'),
  "call_slot": zod.iso.datetime({"offset":true}).nullish(),
  "message": zod.string().max(acceptInvitationBodyMessageMax).nullish()
})

export const acceptInvitationResponseSalaryFromMin = 10000;
export const acceptInvitationResponseSalaryFromMax = 10000000;

export const acceptInvitationResponseSalaryToMin = 10000;
export const acceptInvitationResponseSalaryToMax = 10000000;

export const acceptInvitationResponseCompanyTrustInvitations90dMin = 0;

export const acceptInvitationResponseCompanyTrustAcceptanceRateMin = 0;
export const acceptInvitationResponseCompanyTrustAcceptanceRateMax = 1;

export const acceptInvitationResponseCompanyTrustWithdrawnAfterAcceptMin = 0;

export const acceptInvitationResponseContactValueMin = 3;
export const acceptInvitationResponseContactValueMax = 120;



export const AcceptInvitationResponse = zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed']),
  "title": zod.string(),
  "description": zod.string(),
  "salary": zod.object({
  "from": zod.int().min(acceptInvitationResponseSalaryFromMin).max(acceptInvitationResponseSalaryFromMax),
  "to": zod.int().min(acceptInvitationResponseSalaryToMin).max(acceptInvitationResponseSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "work_format": zod.enum(['office', 'hybrid', 'remote']),
  "city": zod.string().nullable(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
}),
  "company_trust": zod.object({
  "invitations_90d": zod.int().min(acceptInvitationResponseCompanyTrustInvitations90dMin),
  "acceptance_rate": zod.number().min(acceptInvitationResponseCompanyTrustAcceptanceRateMin).max(acceptInvitationResponseCompanyTrustAcceptanceRateMax),
  "withdrawn_after_accept": zod.int().min(acceptInvitationResponseCompanyTrustWithdrawnAfterAcceptMin)
}).optional().describe('Надёжность компании за 90 дней — защита кандидата от фиктивных вакансий'),
  "contact_person": zod.string(),
  "contact": zod.object({
  "channel": zod.enum(['email', 'phone', 'telegram']),
  "value": zod.string().min(acceptInvitationResponseContactValueMin).max(acceptInvitationResponseContactValueMax)
}).describe('Как компания предлагает связаться'),
  "vacancy": zod.union([zod.object({
  "id": zod.uuid(),
  "title": zod.string(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
})
}),zod.null()]),
  "candidate": zod.object({
  "id": zod.uuid(),
  "alias": zod.string(),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "percentile": zod.int().nullable()
}),
  "source": zod.object({
  "type": zod.enum(['search', 'bank', 'task_submission', 'vacancy']),
  "id": zod.uuid().nullable()
}),
  "created_at": zod.iso.datetime({"offset":true}),
  "sent_at": zod.iso.datetime({"offset":true}).nullable(),
  "viewed_at": zod.iso.datetime({"offset":true}).nullable(),
  "expires_at": zod.iso.datetime({"offset":true}).describe('Срок ответа (по умолчанию 7 дней с отправки)'),
  "response": zod.union([zod.object({
  "decision": zod.enum(['accepted', 'declined', 'postponed']),
  "reason": zod.union([zod.enum(['salary', 'stack', 'format', 'company', 'not_looking', 'other']).describe('Вилка, стек, формат, компания, не ищу, другое'),zod.null()]),
  "comment": zod.string().nullable(),
  "channel": zod.union([zod.enum(['email', 'phone', 'telegram']),zod.null()]).describe('Канал, который выбрал кандидат при принятии'),
  "call_slot": zod.iso.datetime({"offset":true}).nullable().describe('Удобный слот созвона (опционально)'),
  "postponed_until": zod.iso.date().nullable(),
  "responded_at": zod.iso.datetime({"offset":true})
}),zod.null()]),
  "candidate_contacts": zod.union([zod.object({
  "full_name": zod.string(),
  "email": zod.email(),
  "phone": zod.string().nullable(),
  "telegram": zod.string().nullable(),
  "preferred_channel": zod.enum(['email', 'phone', 'telegram'])
}),zod.null()]).describe('Только для работодателя и только после принятия'),
  "events": zod.array(zod.object({
  "id": zod.uuid(),
  "at": zod.iso.datetime({"offset":true}),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed']),
  "actor": zod.enum(['candidate', 'employer', 'system']),
  "note": zod.string().nullable()
}))
})


/**
 * @summary Отклонить с причиной
 */
export const DeclineInvitationParams = zod.object({
  "invitation_id": zod.uuid()
})

export const declineInvitationBodyCommentMax = 500;



export const DeclineInvitationBody = zod.object({
  "reason": zod.enum(['salary', 'stack', 'format', 'company', 'not_looking', 'other']).describe('Вилка, стек, формат, компания, не ищу, другое'),
  "comment": zod.string().max(declineInvitationBodyCommentMax).nullish().describe('Обязателен при `reason = other`')
})

export const declineInvitationResponseSalaryFromMin = 10000;
export const declineInvitationResponseSalaryFromMax = 10000000;

export const declineInvitationResponseSalaryToMin = 10000;
export const declineInvitationResponseSalaryToMax = 10000000;

export const declineInvitationResponseCompanyTrustInvitations90dMin = 0;

export const declineInvitationResponseCompanyTrustAcceptanceRateMin = 0;
export const declineInvitationResponseCompanyTrustAcceptanceRateMax = 1;

export const declineInvitationResponseCompanyTrustWithdrawnAfterAcceptMin = 0;

export const declineInvitationResponseContactValueMin = 3;
export const declineInvitationResponseContactValueMax = 120;



export const DeclineInvitationResponse = zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed']),
  "title": zod.string(),
  "description": zod.string(),
  "salary": zod.object({
  "from": zod.int().min(declineInvitationResponseSalaryFromMin).max(declineInvitationResponseSalaryFromMax),
  "to": zod.int().min(declineInvitationResponseSalaryToMin).max(declineInvitationResponseSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "work_format": zod.enum(['office', 'hybrid', 'remote']),
  "city": zod.string().nullable(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
}),
  "company_trust": zod.object({
  "invitations_90d": zod.int().min(declineInvitationResponseCompanyTrustInvitations90dMin),
  "acceptance_rate": zod.number().min(declineInvitationResponseCompanyTrustAcceptanceRateMin).max(declineInvitationResponseCompanyTrustAcceptanceRateMax),
  "withdrawn_after_accept": zod.int().min(declineInvitationResponseCompanyTrustWithdrawnAfterAcceptMin)
}).optional().describe('Надёжность компании за 90 дней — защита кандидата от фиктивных вакансий'),
  "contact_person": zod.string(),
  "contact": zod.object({
  "channel": zod.enum(['email', 'phone', 'telegram']),
  "value": zod.string().min(declineInvitationResponseContactValueMin).max(declineInvitationResponseContactValueMax)
}).describe('Как компания предлагает связаться'),
  "vacancy": zod.union([zod.object({
  "id": zod.uuid(),
  "title": zod.string(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
})
}),zod.null()]),
  "candidate": zod.object({
  "id": zod.uuid(),
  "alias": zod.string(),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "percentile": zod.int().nullable()
}),
  "source": zod.object({
  "type": zod.enum(['search', 'bank', 'task_submission', 'vacancy']),
  "id": zod.uuid().nullable()
}),
  "created_at": zod.iso.datetime({"offset":true}),
  "sent_at": zod.iso.datetime({"offset":true}).nullable(),
  "viewed_at": zod.iso.datetime({"offset":true}).nullable(),
  "expires_at": zod.iso.datetime({"offset":true}).describe('Срок ответа (по умолчанию 7 дней с отправки)'),
  "response": zod.union([zod.object({
  "decision": zod.enum(['accepted', 'declined', 'postponed']),
  "reason": zod.union([zod.enum(['salary', 'stack', 'format', 'company', 'not_looking', 'other']).describe('Вилка, стек, формат, компания, не ищу, другое'),zod.null()]),
  "comment": zod.string().nullable(),
  "channel": zod.union([zod.enum(['email', 'phone', 'telegram']),zod.null()]).describe('Канал, который выбрал кандидат при принятии'),
  "call_slot": zod.iso.datetime({"offset":true}).nullable().describe('Удобный слот созвона (опционально)'),
  "postponed_until": zod.iso.date().nullable(),
  "responded_at": zod.iso.datetime({"offset":true})
}),zod.null()]),
  "candidate_contacts": zod.union([zod.object({
  "full_name": zod.string(),
  "email": zod.email(),
  "phone": zod.string().nullable(),
  "telegram": zod.string().nullable(),
  "preferred_channel": zod.enum(['email', 'phone', 'telegram'])
}),zod.null()]).describe('Только для работодателя и только после принятия'),
  "events": zod.array(zod.object({
  "id": zod.uuid(),
  "at": zod.iso.datetime({"offset":true}),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed']),
  "actor": zod.enum(['candidate', 'employer', 'system']),
  "note": zod.string().nullable()
}))
})


/**
 * @summary «Не сейчас» — отложить до срока ответа (один раз)
 */
export const PostponeInvitationParams = zod.object({
  "invitation_id": zod.uuid()
})

export const PostponeInvitationBody = zod.object({
  "until": zod.iso.date().nullish().describe('До какой даты отложить (не позже `expires_at`)')
})

export const postponeInvitationResponseSalaryFromMin = 10000;
export const postponeInvitationResponseSalaryFromMax = 10000000;

export const postponeInvitationResponseSalaryToMin = 10000;
export const postponeInvitationResponseSalaryToMax = 10000000;

export const postponeInvitationResponseCompanyTrustInvitations90dMin = 0;

export const postponeInvitationResponseCompanyTrustAcceptanceRateMin = 0;
export const postponeInvitationResponseCompanyTrustAcceptanceRateMax = 1;

export const postponeInvitationResponseCompanyTrustWithdrawnAfterAcceptMin = 0;

export const postponeInvitationResponseContactValueMin = 3;
export const postponeInvitationResponseContactValueMax = 120;



export const PostponeInvitationResponse = zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed']),
  "title": zod.string(),
  "description": zod.string(),
  "salary": zod.object({
  "from": zod.int().min(postponeInvitationResponseSalaryFromMin).max(postponeInvitationResponseSalaryFromMax),
  "to": zod.int().min(postponeInvitationResponseSalaryToMin).max(postponeInvitationResponseSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "work_format": zod.enum(['office', 'hybrid', 'remote']),
  "city": zod.string().nullable(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
}),
  "company_trust": zod.object({
  "invitations_90d": zod.int().min(postponeInvitationResponseCompanyTrustInvitations90dMin),
  "acceptance_rate": zod.number().min(postponeInvitationResponseCompanyTrustAcceptanceRateMin).max(postponeInvitationResponseCompanyTrustAcceptanceRateMax),
  "withdrawn_after_accept": zod.int().min(postponeInvitationResponseCompanyTrustWithdrawnAfterAcceptMin)
}).optional().describe('Надёжность компании за 90 дней — защита кандидата от фиктивных вакансий'),
  "contact_person": zod.string(),
  "contact": zod.object({
  "channel": zod.enum(['email', 'phone', 'telegram']),
  "value": zod.string().min(postponeInvitationResponseContactValueMin).max(postponeInvitationResponseContactValueMax)
}).describe('Как компания предлагает связаться'),
  "vacancy": zod.union([zod.object({
  "id": zod.uuid(),
  "title": zod.string(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
})
}),zod.null()]),
  "candidate": zod.object({
  "id": zod.uuid(),
  "alias": zod.string(),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "percentile": zod.int().nullable()
}),
  "source": zod.object({
  "type": zod.enum(['search', 'bank', 'task_submission', 'vacancy']),
  "id": zod.uuid().nullable()
}),
  "created_at": zod.iso.datetime({"offset":true}),
  "sent_at": zod.iso.datetime({"offset":true}).nullable(),
  "viewed_at": zod.iso.datetime({"offset":true}).nullable(),
  "expires_at": zod.iso.datetime({"offset":true}).describe('Срок ответа (по умолчанию 7 дней с отправки)'),
  "response": zod.union([zod.object({
  "decision": zod.enum(['accepted', 'declined', 'postponed']),
  "reason": zod.union([zod.enum(['salary', 'stack', 'format', 'company', 'not_looking', 'other']).describe('Вилка, стек, формат, компания, не ищу, другое'),zod.null()]),
  "comment": zod.string().nullable(),
  "channel": zod.union([zod.enum(['email', 'phone', 'telegram']),zod.null()]).describe('Канал, который выбрал кандидат при принятии'),
  "call_slot": zod.iso.datetime({"offset":true}).nullable().describe('Удобный слот созвона (опционально)'),
  "postponed_until": zod.iso.date().nullable(),
  "responded_at": zod.iso.datetime({"offset":true})
}),zod.null()]),
  "candidate_contacts": zod.union([zod.object({
  "full_name": zod.string(),
  "email": zod.email(),
  "phone": zod.string().nullable(),
  "telegram": zod.string().nullable(),
  "preferred_channel": zod.enum(['email', 'phone', 'telegram'])
}),zod.null()]).describe('Только для работодателя и только после принятия'),
  "events": zod.array(zod.object({
  "id": zod.uuid(),
  "at": zod.iso.datetime({"offset":true}),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed']),
  "actor": zod.enum(['candidate', 'employer', 'system']),
  "note": zod.string().nullable()
}))
})


/**
 * @summary Отозвать активный инвайт
 */
export const WithdrawInvitationParams = zod.object({
  "invitation_id": zod.uuid()
})

export const withdrawInvitationBodyNoteMax = 500;



export const WithdrawInvitationBody = zod.object({
  "note": zod.string().max(withdrawInvitationBodyNoteMax).nullish()
})

export const withdrawInvitationResponseSalaryFromMin = 10000;
export const withdrawInvitationResponseSalaryFromMax = 10000000;

export const withdrawInvitationResponseSalaryToMin = 10000;
export const withdrawInvitationResponseSalaryToMax = 10000000;

export const withdrawInvitationResponseCompanyTrustInvitations90dMin = 0;

export const withdrawInvitationResponseCompanyTrustAcceptanceRateMin = 0;
export const withdrawInvitationResponseCompanyTrustAcceptanceRateMax = 1;

export const withdrawInvitationResponseCompanyTrustWithdrawnAfterAcceptMin = 0;

export const withdrawInvitationResponseContactValueMin = 3;
export const withdrawInvitationResponseContactValueMax = 120;



export const WithdrawInvitationResponse = zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed']),
  "title": zod.string(),
  "description": zod.string(),
  "salary": zod.object({
  "from": zod.int().min(withdrawInvitationResponseSalaryFromMin).max(withdrawInvitationResponseSalaryFromMax),
  "to": zod.int().min(withdrawInvitationResponseSalaryToMin).max(withdrawInvitationResponseSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "work_format": zod.enum(['office', 'hybrid', 'remote']),
  "city": zod.string().nullable(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
}),
  "company_trust": zod.object({
  "invitations_90d": zod.int().min(withdrawInvitationResponseCompanyTrustInvitations90dMin),
  "acceptance_rate": zod.number().min(withdrawInvitationResponseCompanyTrustAcceptanceRateMin).max(withdrawInvitationResponseCompanyTrustAcceptanceRateMax),
  "withdrawn_after_accept": zod.int().min(withdrawInvitationResponseCompanyTrustWithdrawnAfterAcceptMin)
}).optional().describe('Надёжность компании за 90 дней — защита кандидата от фиктивных вакансий'),
  "contact_person": zod.string(),
  "contact": zod.object({
  "channel": zod.enum(['email', 'phone', 'telegram']),
  "value": zod.string().min(withdrawInvitationResponseContactValueMin).max(withdrawInvitationResponseContactValueMax)
}).describe('Как компания предлагает связаться'),
  "vacancy": zod.union([zod.object({
  "id": zod.uuid(),
  "title": zod.string(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
})
}),zod.null()]),
  "candidate": zod.object({
  "id": zod.uuid(),
  "alias": zod.string(),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "percentile": zod.int().nullable()
}),
  "source": zod.object({
  "type": zod.enum(['search', 'bank', 'task_submission', 'vacancy']),
  "id": zod.uuid().nullable()
}),
  "created_at": zod.iso.datetime({"offset":true}),
  "sent_at": zod.iso.datetime({"offset":true}).nullable(),
  "viewed_at": zod.iso.datetime({"offset":true}).nullable(),
  "expires_at": zod.iso.datetime({"offset":true}).describe('Срок ответа (по умолчанию 7 дней с отправки)'),
  "response": zod.union([zod.object({
  "decision": zod.enum(['accepted', 'declined', 'postponed']),
  "reason": zod.union([zod.enum(['salary', 'stack', 'format', 'company', 'not_looking', 'other']).describe('Вилка, стек, формат, компания, не ищу, другое'),zod.null()]),
  "comment": zod.string().nullable(),
  "channel": zod.union([zod.enum(['email', 'phone', 'telegram']),zod.null()]).describe('Канал, который выбрал кандидат при принятии'),
  "call_slot": zod.iso.datetime({"offset":true}).nullable().describe('Удобный слот созвона (опционально)'),
  "postponed_until": zod.iso.date().nullable(),
  "responded_at": zod.iso.datetime({"offset":true})
}),zod.null()]),
  "candidate_contacts": zod.union([zod.object({
  "full_name": zod.string(),
  "email": zod.email(),
  "phone": zod.string().nullable(),
  "telegram": zod.string().nullable(),
  "preferred_channel": zod.enum(['email', 'phone', 'telegram'])
}),zod.null()]).describe('Только для работодателя и только после принятия'),
  "events": zod.array(zod.object({
  "id": zod.uuid(),
  "at": zod.iso.datetime({"offset":true}),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed']),
  "actor": zod.enum(['candidate', 'employer', 'system']),
  "note": zod.string().nullable()
}))
})


/**
 * @summary Продвинуть после принятия (interview → offer → hired | closed)
 */
export const UpdateInvitationStageParams = zod.object({
  "invitation_id": zod.uuid()
})

export const updateInvitationStageBodyNoteMax = 500;



export const UpdateInvitationStageBody = zod.object({
  "status": zod.enum(['interview', 'offer', 'hired', 'closed']),
  "note": zod.string().max(updateInvitationStageBodyNoteMax).nullish()
})

export const updateInvitationStageResponseSalaryFromMin = 10000;
export const updateInvitationStageResponseSalaryFromMax = 10000000;

export const updateInvitationStageResponseSalaryToMin = 10000;
export const updateInvitationStageResponseSalaryToMax = 10000000;

export const updateInvitationStageResponseCompanyTrustInvitations90dMin = 0;

export const updateInvitationStageResponseCompanyTrustAcceptanceRateMin = 0;
export const updateInvitationStageResponseCompanyTrustAcceptanceRateMax = 1;

export const updateInvitationStageResponseCompanyTrustWithdrawnAfterAcceptMin = 0;

export const updateInvitationStageResponseContactValueMin = 3;
export const updateInvitationStageResponseContactValueMax = 120;



export const UpdateInvitationStageResponse = zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed']),
  "title": zod.string(),
  "description": zod.string(),
  "salary": zod.object({
  "from": zod.int().min(updateInvitationStageResponseSalaryFromMin).max(updateInvitationStageResponseSalaryFromMax),
  "to": zod.int().min(updateInvitationStageResponseSalaryToMin).max(updateInvitationStageResponseSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "work_format": zod.enum(['office', 'hybrid', 'remote']),
  "city": zod.string().nullable(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
}),
  "company_trust": zod.object({
  "invitations_90d": zod.int().min(updateInvitationStageResponseCompanyTrustInvitations90dMin),
  "acceptance_rate": zod.number().min(updateInvitationStageResponseCompanyTrustAcceptanceRateMin).max(updateInvitationStageResponseCompanyTrustAcceptanceRateMax),
  "withdrawn_after_accept": zod.int().min(updateInvitationStageResponseCompanyTrustWithdrawnAfterAcceptMin)
}).optional().describe('Надёжность компании за 90 дней — защита кандидата от фиктивных вакансий'),
  "contact_person": zod.string(),
  "contact": zod.object({
  "channel": zod.enum(['email', 'phone', 'telegram']),
  "value": zod.string().min(updateInvitationStageResponseContactValueMin).max(updateInvitationStageResponseContactValueMax)
}).describe('Как компания предлагает связаться'),
  "vacancy": zod.union([zod.object({
  "id": zod.uuid(),
  "title": zod.string(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
})
}),zod.null()]),
  "candidate": zod.object({
  "id": zod.uuid(),
  "alias": zod.string(),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "percentile": zod.int().nullable()
}),
  "source": zod.object({
  "type": zod.enum(['search', 'bank', 'task_submission', 'vacancy']),
  "id": zod.uuid().nullable()
}),
  "created_at": zod.iso.datetime({"offset":true}),
  "sent_at": zod.iso.datetime({"offset":true}).nullable(),
  "viewed_at": zod.iso.datetime({"offset":true}).nullable(),
  "expires_at": zod.iso.datetime({"offset":true}).describe('Срок ответа (по умолчанию 7 дней с отправки)'),
  "response": zod.union([zod.object({
  "decision": zod.enum(['accepted', 'declined', 'postponed']),
  "reason": zod.union([zod.enum(['salary', 'stack', 'format', 'company', 'not_looking', 'other']).describe('Вилка, стек, формат, компания, не ищу, другое'),zod.null()]),
  "comment": zod.string().nullable(),
  "channel": zod.union([zod.enum(['email', 'phone', 'telegram']),zod.null()]).describe('Канал, который выбрал кандидат при принятии'),
  "call_slot": zod.iso.datetime({"offset":true}).nullable().describe('Удобный слот созвона (опционально)'),
  "postponed_until": zod.iso.date().nullable(),
  "responded_at": zod.iso.datetime({"offset":true})
}),zod.null()]),
  "candidate_contacts": zod.union([zod.object({
  "full_name": zod.string(),
  "email": zod.email(),
  "phone": zod.string().nullable(),
  "telegram": zod.string().nullable(),
  "preferred_channel": zod.enum(['email', 'phone', 'telegram'])
}),zod.null()]).describe('Только для работодателя и только после принятия'),
  "events": zod.array(zod.object({
  "id": zod.uuid(),
  "at": zod.iso.datetime({"offset":true}),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed']),
  "actor": zod.enum(['candidate', 'employer', 'system']),
  "note": zod.string().nullable()
}))
})


/**
 * Для кандидата в каждой вакансии есть `match` (соответствие его профилю) и `my_application`.
 * @summary Каталог опубликованных вакансий
 */
export const listVacanciesQueryQMax = 100;

export const listVacanciesQueryPageDefault = 1;

export const listVacanciesQueryPageSizeDefault = 20;
export const listVacanciesQueryPageSizeMax = 100;



export const ListVacanciesQueryParams = zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).optional(),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).optional(),
  "work_format": zod.enum(['office', 'hybrid', 'remote']).optional(),
  "q": zod.string().max(listVacanciesQueryQMax).optional(),
  "page": zod.int().min(1).default(listVacanciesQueryPageDefault),
  "page_size": zod.int().min(1).max(listVacanciesQueryPageSizeMax).default(listVacanciesQueryPageSizeDefault)
})

export const listVacanciesResponseOneTotalMin = 0;



export const listVacanciesResponseTwoItemsItemSalaryFromMin = 10000;
export const listVacanciesResponseTwoItemsItemSalaryFromMax = 10000000;

export const listVacanciesResponseTwoItemsItemSalaryToMin = 10000;
export const listVacanciesResponseTwoItemsItemSalaryToMax = 10000000;

export const listVacanciesResponseTwoItemsItemMatchOneScoreMin = 0;
export const listVacanciesResponseTwoItemsItemMatchOneScoreMax = 100;



export const ListVacanciesResponse = zod.object({
  "total": zod.int().min(listVacanciesResponseOneTotalMin),
  "page": zod.int().min(1),
  "page_size": zod.int().min(1)
}).and(zod.object({
  "items": zod.array(zod.object({
  "id": zod.uuid(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
}),
  "title": zod.string(),
  "description": zod.string(),
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "must_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "nice_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "work_format": zod.enum(['office', 'hybrid', 'remote']),
  "city": zod.string().nullable(),
  "salary": zod.object({
  "from": zod.int().min(listVacanciesResponseTwoItemsItemSalaryFromMin).max(listVacanciesResponseTwoItemsItemSalaryFromMax),
  "to": zod.int().min(listVacanciesResponseTwoItemsItemSalaryToMin).max(listVacanciesResponseTwoItemsItemSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "status": zod.enum(['draft', 'published', 'closed']),
  "published_at": zod.iso.datetime({"offset":true}).nullable(),
  "created_at": zod.iso.datetime({"offset":true}),
  "applications_count": zod.int().nullable().describe('Только для работодателя-владельца'),
  "my_application": zod.union([zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'])
}),zod.null()]).describe('Только для кандидата'),
  "match": zod.union([zod.object({
  "score": zod.number().min(listVacanciesResponseTwoItemsItemMatchOneScoreMin).max(listVacanciesResponseTwoItemsItemMatchOneScoreMax),
  "chips": zod.array(zod.object({
  "kind": zod.enum(['skills_coverage', 'confirmed_skills', 'semantic', 'industry', 'conditions', 'percentile', 'fsp', 'tasks', 'completeness', 'missing_skill', 'penalty']),
  "label": zod.string(),
  "contribution": zod.number().describe('Вклад в итоговый Score, пункты (со знаком)'),
  "polarity": zod.enum(['positive', 'negative', 'neutral']),
  "evidence": zod.string().nullable()
}).describe('Вклад фактора в скоринг: `{factor, value, contribution, evidence}`'))
}),zod.null()]).describe('Соответствие профилю кандидата (только для кандидата с подтверждённым грейдом)')
}))
}))


/**
 * @summary Создать вакансию
 */
export const createVacancyBodyTitleMin = 5;
export const createVacancyBodyTitleMax = 120;

export const createVacancyBodyDescriptionMin = 50;
export const createVacancyBodyDescriptionMax = 5000;

export const createVacancyBodyMustSkillsMax = 15;

export const createVacancyBodyNiceSkillsMax = 15;

export const createVacancyBodySalaryFromMin = 10000;
export const createVacancyBodySalaryFromMax = 10000000;

export const createVacancyBodySalaryToMin = 10000;
export const createVacancyBodySalaryToMax = 10000000;



export const CreateVacancyBody = zod.object({
  "title": zod.string().min(createVacancyBodyTitleMin).max(createVacancyBodyTitleMax),
  "description": zod.string().min(createVacancyBodyDescriptionMin).max(createVacancyBodyDescriptionMax),
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "must_skills": zod.array(zod.string()).min(1).max(createVacancyBodyMustSkillsMax),
  "nice_skills": zod.array(zod.string()).max(createVacancyBodyNiceSkillsMax),
  "work_format": zod.enum(['office', 'hybrid', 'remote']),
  "city": zod.string().nullable(),
  "salary": zod.object({
  "from": zod.int().min(createVacancyBodySalaryFromMin).max(createVacancyBodySalaryFromMax),
  "to": zod.int().min(createVacancyBodySalaryToMin).max(createVacancyBodySalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "status": zod.enum(['draft', 'published', 'closed'])
})

export const createVacancyResponseSalaryFromMin = 10000;
export const createVacancyResponseSalaryFromMax = 10000000;

export const createVacancyResponseSalaryToMin = 10000;
export const createVacancyResponseSalaryToMax = 10000000;

export const createVacancyResponseMatchOneScoreMin = 0;
export const createVacancyResponseMatchOneScoreMax = 100;



export const CreateVacancyResponse = zod.object({
  "id": zod.uuid(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
}),
  "title": zod.string(),
  "description": zod.string(),
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "must_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "nice_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "work_format": zod.enum(['office', 'hybrid', 'remote']),
  "city": zod.string().nullable(),
  "salary": zod.object({
  "from": zod.int().min(createVacancyResponseSalaryFromMin).max(createVacancyResponseSalaryFromMax),
  "to": zod.int().min(createVacancyResponseSalaryToMin).max(createVacancyResponseSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "status": zod.enum(['draft', 'published', 'closed']),
  "published_at": zod.iso.datetime({"offset":true}).nullable(),
  "created_at": zod.iso.datetime({"offset":true}),
  "applications_count": zod.int().nullable().describe('Только для работодателя-владельца'),
  "my_application": zod.union([zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'])
}),zod.null()]).describe('Только для кандидата'),
  "match": zod.union([zod.object({
  "score": zod.number().min(createVacancyResponseMatchOneScoreMin).max(createVacancyResponseMatchOneScoreMax),
  "chips": zod.array(zod.object({
  "kind": zod.enum(['skills_coverage', 'confirmed_skills', 'semantic', 'industry', 'conditions', 'percentile', 'fsp', 'tasks', 'completeness', 'missing_skill', 'penalty']),
  "label": zod.string(),
  "contribution": zod.number().describe('Вклад в итоговый Score, пункты (со знаком)'),
  "polarity": zod.enum(['positive', 'negative', 'neutral']),
  "evidence": zod.string().nullable()
}).describe('Вклад фактора в скоринг: `{factor, value, contribution, evidence}`'))
}),zod.null()]).describe('Соответствие профилю кандидата (только для кандидата с подтверждённым грейдом)')
})


/**
 * @summary Вакансия
 */
export const GetVacancyParams = zod.object({
  "vacancy_id": zod.uuid()
})

export const getVacancyResponseSalaryFromMin = 10000;
export const getVacancyResponseSalaryFromMax = 10000000;

export const getVacancyResponseSalaryToMin = 10000;
export const getVacancyResponseSalaryToMax = 10000000;

export const getVacancyResponseMatchOneScoreMin = 0;
export const getVacancyResponseMatchOneScoreMax = 100;



export const GetVacancyResponse = zod.object({
  "id": zod.uuid(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
}),
  "title": zod.string(),
  "description": zod.string(),
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "must_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "nice_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "work_format": zod.enum(['office', 'hybrid', 'remote']),
  "city": zod.string().nullable(),
  "salary": zod.object({
  "from": zod.int().min(getVacancyResponseSalaryFromMin).max(getVacancyResponseSalaryFromMax),
  "to": zod.int().min(getVacancyResponseSalaryToMin).max(getVacancyResponseSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "status": zod.enum(['draft', 'published', 'closed']),
  "published_at": zod.iso.datetime({"offset":true}).nullable(),
  "created_at": zod.iso.datetime({"offset":true}),
  "applications_count": zod.int().nullable().describe('Только для работодателя-владельца'),
  "my_application": zod.union([zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'])
}),zod.null()]).describe('Только для кандидата'),
  "match": zod.union([zod.object({
  "score": zod.number().min(getVacancyResponseMatchOneScoreMin).max(getVacancyResponseMatchOneScoreMax),
  "chips": zod.array(zod.object({
  "kind": zod.enum(['skills_coverage', 'confirmed_skills', 'semantic', 'industry', 'conditions', 'percentile', 'fsp', 'tasks', 'completeness', 'missing_skill', 'penalty']),
  "label": zod.string(),
  "contribution": zod.number().describe('Вклад в итоговый Score, пункты (со знаком)'),
  "polarity": zod.enum(['positive', 'negative', 'neutral']),
  "evidence": zod.string().nullable()
}).describe('Вклад фактора в скоринг: `{factor, value, contribution, evidence}`'))
}),zod.null()]).describe('Соответствие профилю кандидата (только для кандидата с подтверждённым грейдом)')
})


/**
 * @summary Изменить вакансию своей компании
 */
export const UpdateVacancyParams = zod.object({
  "vacancy_id": zod.uuid()
})

export const updateVacancyBodyTitleMin = 5;
export const updateVacancyBodyTitleMax = 120;

export const updateVacancyBodyDescriptionMin = 50;
export const updateVacancyBodyDescriptionMax = 5000;

export const updateVacancyBodyMustSkillsMax = 15;

export const updateVacancyBodyNiceSkillsMax = 15;

export const updateVacancyBodySalaryFromMin = 10000;
export const updateVacancyBodySalaryFromMax = 10000000;

export const updateVacancyBodySalaryToMin = 10000;
export const updateVacancyBodySalaryToMax = 10000000;



export const UpdateVacancyBody = zod.object({
  "title": zod.string().min(updateVacancyBodyTitleMin).max(updateVacancyBodyTitleMax),
  "description": zod.string().min(updateVacancyBodyDescriptionMin).max(updateVacancyBodyDescriptionMax),
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "must_skills": zod.array(zod.string()).min(1).max(updateVacancyBodyMustSkillsMax),
  "nice_skills": zod.array(zod.string()).max(updateVacancyBodyNiceSkillsMax),
  "work_format": zod.enum(['office', 'hybrid', 'remote']),
  "city": zod.string().nullable(),
  "salary": zod.object({
  "from": zod.int().min(updateVacancyBodySalaryFromMin).max(updateVacancyBodySalaryFromMax),
  "to": zod.int().min(updateVacancyBodySalaryToMin).max(updateVacancyBodySalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "status": zod.enum(['draft', 'published', 'closed'])
})

export const updateVacancyResponseSalaryFromMin = 10000;
export const updateVacancyResponseSalaryFromMax = 10000000;

export const updateVacancyResponseSalaryToMin = 10000;
export const updateVacancyResponseSalaryToMax = 10000000;

export const updateVacancyResponseMatchOneScoreMin = 0;
export const updateVacancyResponseMatchOneScoreMax = 100;



export const UpdateVacancyResponse = zod.object({
  "id": zod.uuid(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
}),
  "title": zod.string(),
  "description": zod.string(),
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "must_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "nice_skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
})),
  "work_format": zod.enum(['office', 'hybrid', 'remote']),
  "city": zod.string().nullable(),
  "salary": zod.object({
  "from": zod.int().min(updateVacancyResponseSalaryFromMin).max(updateVacancyResponseSalaryFromMax),
  "to": zod.int().min(updateVacancyResponseSalaryToMin).max(updateVacancyResponseSalaryToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),
  "status": zod.enum(['draft', 'published', 'closed']),
  "published_at": zod.iso.datetime({"offset":true}).nullable(),
  "created_at": zod.iso.datetime({"offset":true}),
  "applications_count": zod.int().nullable().describe('Только для работодателя-владельца'),
  "my_application": zod.union([zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'])
}),zod.null()]).describe('Только для кандидата'),
  "match": zod.union([zod.object({
  "score": zod.number().min(updateVacancyResponseMatchOneScoreMin).max(updateVacancyResponseMatchOneScoreMax),
  "chips": zod.array(zod.object({
  "kind": zod.enum(['skills_coverage', 'confirmed_skills', 'semantic', 'industry', 'conditions', 'percentile', 'fsp', 'tasks', 'completeness', 'missing_skill', 'penalty']),
  "label": zod.string(),
  "contribution": zod.number().describe('Вклад в итоговый Score, пункты (со знаком)'),
  "polarity": zod.enum(['positive', 'negative', 'neutral']),
  "evidence": zod.string().nullable()
}).describe('Вклад фактора в скоринг: `{factor, value, contribution, evidence}`'))
}),zod.null()]).describe('Соответствие профилю кандидата (только для кандидата с подтверждённым грейдом)')
})


/**
 * @summary Откликнуться (раскрывает контакты этой компании)
 */
export const ApplyToVacancyParams = zod.object({
  "vacancy_id": zod.uuid()
})

export const applyToVacancyBodyCoverLetterMax = 2000;



export const ApplyToVacancyBody = zod.object({
  "cover_letter": zod.string().max(applyToVacancyBodyCoverLetterMax).nullish()
})

export const ApplyToVacancyResponse = zod.object({
  "id": zod.uuid(),
  "vacancy": zod.object({
  "id": zod.uuid(),
  "title": zod.string(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
})
}),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']),
  "cover_letter": zod.string().nullable(),
  "created_at": zod.iso.datetime({"offset":true}),
  "updated_at": zod.iso.datetime({"offset":true}),
  "events": zod.array(zod.object({
  "at": zod.iso.datetime({"offset":true}),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']),
  "actor": zod.enum(['candidate', 'employer', 'system']),
  "note": zod.string().nullable()
}))
})


/**
 * @summary Отклики на вакансию, отсортированные скорингом
 */
export const ListVacancyApplicationsParams = zod.object({
  "vacancy_id": zod.uuid()
})

export const listVacancyApplicationsResponseTwoCandidatePercentileMax = 99;

export const listVacancyApplicationsResponseTwoCandidateStrengthMin = 0;
export const listVacancyApplicationsResponseTwoCandidateStrengthMax = 130;

export const listVacancyApplicationsResponseTwoCandidateSkillsItemScoreMin = 0;
export const listVacancyApplicationsResponseTwoCandidateSkillsItemScoreMax = 100;

export const listVacancyApplicationsResponseTwoCandidateExperienceItemStartRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const listVacancyApplicationsResponseTwoCandidateExperienceItemEndRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const listVacancyApplicationsResponseTwoCandidateExperienceItemDescriptionMax = 1000;

export const listVacancyApplicationsResponseTwoCandidateSalaryExpectationOneFromMin = 10000;
export const listVacancyApplicationsResponseTwoCandidateSalaryExpectationOneFromMax = 10000000;

export const listVacancyApplicationsResponseTwoCandidateSalaryExpectationOneToMin = 10000;
export const listVacancyApplicationsResponseTwoCandidateSalaryExpectationOneToMax = 10000000;

export const listVacancyApplicationsResponseTwoCandidateFspOneIndexMin = 0;
export const listVacancyApplicationsResponseTwoCandidateFspOneIndexMax = 100;

export const listVacancyApplicationsResponseTwoCandidateFspOneBonusMin = 0;
export const listVacancyApplicationsResponseTwoCandidateFspOneBonusMax = 30;

export const listVacancyApplicationsResponseTwoCandidateFspOneAchievementsCountMin = 0;



export const listVacancyApplicationsResponseTwoCandidateFspOneTopAchievementOnePercentileMax = 99;

export const listVacancyApplicationsResponseTwoCandidateTaskSignalSolvedCountMin = 0;

export const listVacancyApplicationsResponseTwoExplanationScoreMin = 0;
export const listVacancyApplicationsResponseTwoExplanationScoreMax = 100;

export const listVacancyApplicationsResponseTwoExplanationFitMin = 0;
export const listVacancyApplicationsResponseTwoExplanationFitMax = 100;

export const listVacancyApplicationsResponseTwoExplanationStrengthMin = 0;
export const listVacancyApplicationsResponseTwoExplanationStrengthMax = 130;

export const listVacancyApplicationsResponseTwoExplanationChipsMax = 3;



export const ListVacancyApplicationsResponseItem = zod.object({
  "id": zod.uuid(),
  "vacancy": zod.object({
  "id": zod.uuid(),
  "title": zod.string(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
})
}),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']),
  "cover_letter": zod.string().nullable(),
  "created_at": zod.iso.datetime({"offset":true}),
  "updated_at": zod.iso.datetime({"offset":true}),
  "events": zod.array(zod.object({
  "at": zod.iso.datetime({"offset":true}),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']),
  "actor": zod.enum(['candidate', 'employer', 'system']),
  "note": zod.string().nullable()
}))
}).and(zod.object({
  "candidate": zod.object({
  "id": zod.uuid(),
  "alias": zod.string().describe('Анонимное имя, стабильное для пары компания–кандидат'),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "grade_confirmed": zod.boolean(),
  "percentile": zod.int().min(1).max(listVacancyApplicationsResponseTwoCandidatePercentileMax).nullable(),
  "test_flags": zod.array(zod.object({
  "code": zod.enum(['fast_correct', 'paste', 'focus_loss']),
  "severity": zod.enum(['info', 'warning'])
}).describe('Сигнал прокторинга подтверждающего теста; не доказывает нарушение')).optional(),
  "strength": zod.number().min(listVacancyApplicationsResponseTwoCandidateStrengthMin).max(listVacancyApplicationsResponseTwoCandidateStrengthMax).describe('Сила профиля (0–100 + бонус ФСП до 30)'),
  "skills": zod.array(zod.object({
  "skill_id": zod.string(),
  "name": zod.string(),
  "level": zod.enum(['basic', 'confident', 'advanced']),
  "source": zod.enum(['self', 'resume', 'test', 'fsp', 'task']).describe('self — заявлен, resume — из резюме, test — подтверждён тестом, fsp — из достижений ФСП, task — из регулярного задания'),
  "verified": zod.boolean().describe('Подтверждён тестом, заданием или ФСП'),
  "score": zod.int().min(listVacancyApplicationsResponseTwoCandidateSkillsItemScoreMin).max(listVacancyApplicationsResponseTwoCandidateSkillsItemScoreMax).nullable().describe('Балл по навыку в тесте, если подтверждён тестом')
})),
  "experience_years": zod.number(),
  "experience": zod.array(zod.object({
  "role": zod.string(),
  "company_name": zod.string().nullable().describe('`null`, если кандидат скрыл названия компаний'),
  "company_hidden": zod.boolean(),
  "industry": zod.union([zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),zod.null()]),
  "start": zod.string().regex(listVacancyApplicationsResponseTwoCandidateExperienceItemStartRegExp).describe('Месяц начала YYYY-MM'),
  "end": zod.string().regex(listVacancyApplicationsResponseTwoCandidateExperienceItemEndRegExp).nullable().describe('Месяц окончания, `null` — по настоящее время'),
  "description": zod.string().max(listVacancyApplicationsResponseTwoCandidateExperienceItemDescriptionMax).nullable()
})),
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])),
  "city": zod.string().nullable().describe('`null`, если кандидат скрыл город'),
  "relocation": zod.boolean(),
  "salary_expectation": zod.union([zod.object({
  "from": zod.int().min(listVacancyApplicationsResponseTwoCandidateSalaryExpectationOneFromMin).max(listVacancyApplicationsResponseTwoCandidateSalaryExpectationOneFromMax),
  "to": zod.int().min(listVacancyApplicationsResponseTwoCandidateSalaryExpectationOneToMin).max(listVacancyApplicationsResponseTwoCandidateSalaryExpectationOneToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),zod.null()]),
  "availability": zod.enum(['active', 'open', 'not_looking']).describe('Ищу активно / открыт к предложениям / не ищу'),
  "last_active_at": zod.iso.datetime({"offset":true}).nullable(),
  "fsp": zod.union([zod.object({
  "has_history": zod.boolean(),
  "index": zod.int().min(listVacancyApplicationsResponseTwoCandidateFspOneIndexMin).max(listVacancyApplicationsResponseTwoCandidateFspOneIndexMax),
  "bonus": zod.number().min(listVacancyApplicationsResponseTwoCandidateFspOneBonusMin).max(listVacancyApplicationsResponseTwoCandidateFspOneBonusMax),
  "achievements_count": zod.int().min(listVacancyApplicationsResponseTwoCandidateFspOneAchievementsCountMin),
  "top_achievement": zod.union([zod.object({
  "id": zod.uuid(),
  "event_id": zod.string(),
  "title": zod.string(),
  "date": zod.iso.date(),
  "level": zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),
  "discipline": zod.enum(['product', 'algorithmic', 'cybersecurity', 'robotics', 'uas']).describe('Продуктовое / алгоритмическое / кибербезопасность / робототехника / БАС'),
  "format": zod.enum(['individual', 'team']),
  "team": zod.string().nullable(),
  "role": zod.string().nullable(),
  "place": zod.int().min(1).nullable(),
  "participants_total": zod.int().min(1).nullable(),
  "percentile": zod.int().min(1).max(listVacancyApplicationsResponseTwoCandidateFspOneTopAchievementOnePercentileMax).nullable(),
  "result": zod.enum(['winner', 'prize_winner', 'finalist', 'participant']).describe('Победитель / призёр / финалист / участник'),
  "sport_rank": zod.string().nullable().describe('Спортивный разряд'),
  "certificate_url": zod.url().nullable(),
  "verified": zod.boolean().describe('Подпись реестра ФСП проверена')
}),zod.null()]),
  "max_level": zod.union([zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),zod.null()])
}),zod.null()]).describe('`null` — кандидат скрыл данные ФСП; `has_history=false` — истории нет (нейтрально)'),
  "task_signal": zod.object({
  "fresh": zod.boolean().describe('Бейдж «свежий сигнал» за хорошее решение регулярного задания'),
  "solved_count": zod.int().min(listVacancyApplicationsResponseTwoCandidateTaskSignalSolvedCountMin),
  "last_solved_at": zod.iso.datetime({"offset":true}).nullable()
}),
  "disclosure": zod.object({
  "revealed": zod.boolean(),
  "reason": zod.union([zod.enum(['invitation_accepted', 'application']).describe('Почему компании раскрыты контакты'),zod.null()]),
  "revealed_at": zod.iso.datetime({"offset":true}).nullable(),
  "source_id": zod.uuid().nullable().describe('ID инвайта или отклика')
}),
  "contacts": zod.union([zod.object({
  "full_name": zod.string(),
  "email": zod.email(),
  "phone": zod.string().nullable(),
  "telegram": zod.string().nullable(),
  "preferred_channel": zod.enum(['email', 'phone', 'telegram'])
}),zod.null()]),
  "relation": zod.object({
  "invitation": zod.union([zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed'])
}),zod.null()]),
  "application": zod.union([zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']),
  "vacancy_id": zod.uuid()
}),zod.null()])
}).describe('Отношения кандидата с компанией текущего работодателя')
}).describe('Контакты раскрыты (отклик = согласие на раскрытие этой компании)'),
  "explanation": zod.object({
  "score": zod.number().min(listVacancyApplicationsResponseTwoExplanationScoreMin).max(listVacancyApplicationsResponseTwoExplanationScoreMax).describe('Score = 0.6·Fit + 0.4·Strength − штрафы'),
  "fit": zod.number().min(listVacancyApplicationsResponseTwoExplanationFitMin).max(listVacancyApplicationsResponseTwoExplanationFitMax),
  "strength": zod.number().min(listVacancyApplicationsResponseTwoExplanationStrengthMin).max(listVacancyApplicationsResponseTwoExplanationStrengthMax),
  "chips": zod.array(zod.object({
  "kind": zod.enum(['skills_coverage', 'confirmed_skills', 'semantic', 'industry', 'conditions', 'percentile', 'fsp', 'tasks', 'completeness', 'missing_skill', 'penalty']),
  "label": zod.string(),
  "contribution": zod.number().describe('Вклад в итоговый Score, пункты (со знаком)'),
  "polarity": zod.enum(['positive', 'negative', 'neutral']),
  "evidence": zod.string().nullable()
}).describe('Вклад фактора в скоринг: `{factor, value, contribution, evidence}`')).max(listVacancyApplicationsResponseTwoExplanationChipsMax).describe('Три главных фактора для чипов'),
  "factors": zod.array(zod.object({
  "kind": zod.enum(['skills_coverage', 'confirmed_skills', 'semantic', 'industry', 'conditions', 'percentile', 'fsp', 'tasks', 'completeness', 'missing_skill', 'penalty']),
  "label": zod.string(),
  "contribution": zod.number().describe('Вклад в итоговый Score, пункты (со знаком)'),
  "polarity": zod.enum(['positive', 'negative', 'neutral']),
  "evidence": zod.string().nullable()
}).describe('Вклад фактора в скоринг: `{factor, value, contribution, evidence}`')).describe('Полный список для панели «Почему в подборке»')
})
}))
export const ListVacancyApplicationsResponse = zod.array(ListVacancyApplicationsResponseItem)


/**
 * Бланк строится из навыков и весов вакансии при её сохранении; этот метод отдаёт текущий.
 * @summary «Вакансия → бланк теста» (доли компетенций)
 */
export const GetVacancyTestBlueprintParams = zod.object({
  "vacancy_id": zod.uuid()
})

export const getVacancyTestBlueprintResponseExtractedSkillsItemWeightMin = 0;
export const getVacancyTestBlueprintResponseExtractedSkillsItemWeightMax = 1;

export const getVacancyTestBlueprintResponseCompetenciesItemShareMin = 0;
export const getVacancyTestBlueprintResponseCompetenciesItemShareMax = 1;



export const GetVacancyTestBlueprintResponse = zod.object({
  "vacancy_id": zod.uuid(),
  "vacancy_title": zod.string(),
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "extracted_skills": zod.array(zod.object({
  "skill": zod.object({
  "id": zod.string(),
  "name": zod.string()
}),
  "weight": zod.number().min(getVacancyTestBlueprintResponseExtractedSkillsItemWeightMin).max(getVacancyTestBlueprintResponseExtractedSkillsItemWeightMax),
  "importance": zod.enum(['must', 'nice'])
})),
  "competencies": zod.array(zod.object({
  "competency_id": zod.string(),
  "name": zod.string(),
  "share": zod.number().min(getVacancyTestBlueprintResponseCompetenciesItemShareMin).max(getVacancyTestBlueprintResponseCompetenciesItemShareMax),
  "families_count": zod.int(),
  "skills": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string()
}))
})).describe('Доли компетенций в бланке, сумма share = 1'),
  "adaptive_items": zod.object({
  "min": zod.int(),
  "max": zod.int()
}),
  "practice": zod.union([zod.object({
  "title": zod.string(),
  "language": zod.enum(['python', 'go', 'javascript', 'typescript', 'java', 'sql', 'yaml', 'text'])
}),zod.null()]),
  "generated_at": zod.iso.datetime({"offset":true})
})


/**
 * @summary Мои отклики
 */
export const ListMyApplicationsResponseItem = zod.object({
  "id": zod.uuid(),
  "vacancy": zod.object({
  "id": zod.uuid(),
  "title": zod.string(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
})
}),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']),
  "cover_letter": zod.string().nullable(),
  "created_at": zod.iso.datetime({"offset":true}),
  "updated_at": zod.iso.datetime({"offset":true}),
  "events": zod.array(zod.object({
  "at": zod.iso.datetime({"offset":true}),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']),
  "actor": zod.enum(['candidate', 'employer', 'system']),
  "note": zod.string().nullable()
}))
})
export const ListMyApplicationsResponse = zod.array(ListMyApplicationsResponseItem)


/**
 * @summary Отозвать свой отклик
 */
export const WithdrawApplicationParams = zod.object({
  "application_id": zod.uuid()
})

export const WithdrawApplicationResponse = zod.object({
  "id": zod.uuid(),
  "vacancy": zod.object({
  "id": zod.uuid(),
  "title": zod.string(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
})
}),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']),
  "cover_letter": zod.string().nullable(),
  "created_at": zod.iso.datetime({"offset":true}),
  "updated_at": zod.iso.datetime({"offset":true}),
  "events": zod.array(zod.object({
  "at": zod.iso.datetime({"offset":true}),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']),
  "actor": zod.enum(['candidate', 'employer', 'system']),
  "note": zod.string().nullable()
}))
})


/**
 * @summary Сменить статус отклика (работодатель)
 */
export const UpdateApplicationStatusParams = zod.object({
  "application_id": zod.uuid()
})

export const updateApplicationStatusBodyNoteMax = 500;



export const UpdateApplicationStatusBody = zod.object({
  "status": zod.enum(['viewed', 'interview', 'offer', 'hired', 'rejected']),
  "note": zod.string().max(updateApplicationStatusBodyNoteMax).nullish()
})

export const updateApplicationStatusResponseTwoCandidatePercentileMax = 99;

export const updateApplicationStatusResponseTwoCandidateStrengthMin = 0;
export const updateApplicationStatusResponseTwoCandidateStrengthMax = 130;

export const updateApplicationStatusResponseTwoCandidateSkillsItemScoreMin = 0;
export const updateApplicationStatusResponseTwoCandidateSkillsItemScoreMax = 100;

export const updateApplicationStatusResponseTwoCandidateExperienceItemStartRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const updateApplicationStatusResponseTwoCandidateExperienceItemEndRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const updateApplicationStatusResponseTwoCandidateExperienceItemDescriptionMax = 1000;

export const updateApplicationStatusResponseTwoCandidateSalaryExpectationOneFromMin = 10000;
export const updateApplicationStatusResponseTwoCandidateSalaryExpectationOneFromMax = 10000000;

export const updateApplicationStatusResponseTwoCandidateSalaryExpectationOneToMin = 10000;
export const updateApplicationStatusResponseTwoCandidateSalaryExpectationOneToMax = 10000000;

export const updateApplicationStatusResponseTwoCandidateFspOneIndexMin = 0;
export const updateApplicationStatusResponseTwoCandidateFspOneIndexMax = 100;

export const updateApplicationStatusResponseTwoCandidateFspOneBonusMin = 0;
export const updateApplicationStatusResponseTwoCandidateFspOneBonusMax = 30;

export const updateApplicationStatusResponseTwoCandidateFspOneAchievementsCountMin = 0;



export const updateApplicationStatusResponseTwoCandidateFspOneTopAchievementOnePercentileMax = 99;

export const updateApplicationStatusResponseTwoCandidateTaskSignalSolvedCountMin = 0;

export const updateApplicationStatusResponseTwoExplanationScoreMin = 0;
export const updateApplicationStatusResponseTwoExplanationScoreMax = 100;

export const updateApplicationStatusResponseTwoExplanationFitMin = 0;
export const updateApplicationStatusResponseTwoExplanationFitMax = 100;

export const updateApplicationStatusResponseTwoExplanationStrengthMin = 0;
export const updateApplicationStatusResponseTwoExplanationStrengthMax = 130;

export const updateApplicationStatusResponseTwoExplanationChipsMax = 3;



export const UpdateApplicationStatusResponse = zod.object({
  "id": zod.uuid(),
  "vacancy": zod.object({
  "id": zod.uuid(),
  "title": zod.string(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
})
}),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']),
  "cover_letter": zod.string().nullable(),
  "created_at": zod.iso.datetime({"offset":true}),
  "updated_at": zod.iso.datetime({"offset":true}),
  "events": zod.array(zod.object({
  "at": zod.iso.datetime({"offset":true}),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']),
  "actor": zod.enum(['candidate', 'employer', 'system']),
  "note": zod.string().nullable()
}))
}).and(zod.object({
  "candidate": zod.object({
  "id": zod.uuid(),
  "alias": zod.string().describe('Анонимное имя, стабильное для пары компания–кандидат'),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "grade_confirmed": zod.boolean(),
  "percentile": zod.int().min(1).max(updateApplicationStatusResponseTwoCandidatePercentileMax).nullable(),
  "test_flags": zod.array(zod.object({
  "code": zod.enum(['fast_correct', 'paste', 'focus_loss']),
  "severity": zod.enum(['info', 'warning'])
}).describe('Сигнал прокторинга подтверждающего теста; не доказывает нарушение')).optional(),
  "strength": zod.number().min(updateApplicationStatusResponseTwoCandidateStrengthMin).max(updateApplicationStatusResponseTwoCandidateStrengthMax).describe('Сила профиля (0–100 + бонус ФСП до 30)'),
  "skills": zod.array(zod.object({
  "skill_id": zod.string(),
  "name": zod.string(),
  "level": zod.enum(['basic', 'confident', 'advanced']),
  "source": zod.enum(['self', 'resume', 'test', 'fsp', 'task']).describe('self — заявлен, resume — из резюме, test — подтверждён тестом, fsp — из достижений ФСП, task — из регулярного задания'),
  "verified": zod.boolean().describe('Подтверждён тестом, заданием или ФСП'),
  "score": zod.int().min(updateApplicationStatusResponseTwoCandidateSkillsItemScoreMin).max(updateApplicationStatusResponseTwoCandidateSkillsItemScoreMax).nullable().describe('Балл по навыку в тесте, если подтверждён тестом')
})),
  "experience_years": zod.number(),
  "experience": zod.array(zod.object({
  "role": zod.string(),
  "company_name": zod.string().nullable().describe('`null`, если кандидат скрыл названия компаний'),
  "company_hidden": zod.boolean(),
  "industry": zod.union([zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),zod.null()]),
  "start": zod.string().regex(updateApplicationStatusResponseTwoCandidateExperienceItemStartRegExp).describe('Месяц начала YYYY-MM'),
  "end": zod.string().regex(updateApplicationStatusResponseTwoCandidateExperienceItemEndRegExp).nullable().describe('Месяц окончания, `null` — по настоящее время'),
  "description": zod.string().max(updateApplicationStatusResponseTwoCandidateExperienceItemDescriptionMax).nullable()
})),
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])),
  "city": zod.string().nullable().describe('`null`, если кандидат скрыл город'),
  "relocation": zod.boolean(),
  "salary_expectation": zod.union([zod.object({
  "from": zod.int().min(updateApplicationStatusResponseTwoCandidateSalaryExpectationOneFromMin).max(updateApplicationStatusResponseTwoCandidateSalaryExpectationOneFromMax),
  "to": zod.int().min(updateApplicationStatusResponseTwoCandidateSalaryExpectationOneToMin).max(updateApplicationStatusResponseTwoCandidateSalaryExpectationOneToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),zod.null()]),
  "availability": zod.enum(['active', 'open', 'not_looking']).describe('Ищу активно / открыт к предложениям / не ищу'),
  "last_active_at": zod.iso.datetime({"offset":true}).nullable(),
  "fsp": zod.union([zod.object({
  "has_history": zod.boolean(),
  "index": zod.int().min(updateApplicationStatusResponseTwoCandidateFspOneIndexMin).max(updateApplicationStatusResponseTwoCandidateFspOneIndexMax),
  "bonus": zod.number().min(updateApplicationStatusResponseTwoCandidateFspOneBonusMin).max(updateApplicationStatusResponseTwoCandidateFspOneBonusMax),
  "achievements_count": zod.int().min(updateApplicationStatusResponseTwoCandidateFspOneAchievementsCountMin),
  "top_achievement": zod.union([zod.object({
  "id": zod.uuid(),
  "event_id": zod.string(),
  "title": zod.string(),
  "date": zod.iso.date(),
  "level": zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),
  "discipline": zod.enum(['product', 'algorithmic', 'cybersecurity', 'robotics', 'uas']).describe('Продуктовое / алгоритмическое / кибербезопасность / робототехника / БАС'),
  "format": zod.enum(['individual', 'team']),
  "team": zod.string().nullable(),
  "role": zod.string().nullable(),
  "place": zod.int().min(1).nullable(),
  "participants_total": zod.int().min(1).nullable(),
  "percentile": zod.int().min(1).max(updateApplicationStatusResponseTwoCandidateFspOneTopAchievementOnePercentileMax).nullable(),
  "result": zod.enum(['winner', 'prize_winner', 'finalist', 'participant']).describe('Победитель / призёр / финалист / участник'),
  "sport_rank": zod.string().nullable().describe('Спортивный разряд'),
  "certificate_url": zod.url().nullable(),
  "verified": zod.boolean().describe('Подпись реестра ФСП проверена')
}),zod.null()]),
  "max_level": zod.union([zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),zod.null()])
}),zod.null()]).describe('`null` — кандидат скрыл данные ФСП; `has_history=false` — истории нет (нейтрально)'),
  "task_signal": zod.object({
  "fresh": zod.boolean().describe('Бейдж «свежий сигнал» за хорошее решение регулярного задания'),
  "solved_count": zod.int().min(updateApplicationStatusResponseTwoCandidateTaskSignalSolvedCountMin),
  "last_solved_at": zod.iso.datetime({"offset":true}).nullable()
}),
  "disclosure": zod.object({
  "revealed": zod.boolean(),
  "reason": zod.union([zod.enum(['invitation_accepted', 'application']).describe('Почему компании раскрыты контакты'),zod.null()]),
  "revealed_at": zod.iso.datetime({"offset":true}).nullable(),
  "source_id": zod.uuid().nullable().describe('ID инвайта или отклика')
}),
  "contacts": zod.union([zod.object({
  "full_name": zod.string(),
  "email": zod.email(),
  "phone": zod.string().nullable(),
  "telegram": zod.string().nullable(),
  "preferred_channel": zod.enum(['email', 'phone', 'telegram'])
}),zod.null()]),
  "relation": zod.object({
  "invitation": zod.union([zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed'])
}),zod.null()]),
  "application": zod.union([zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']),
  "vacancy_id": zod.uuid()
}),zod.null()])
}).describe('Отношения кандидата с компанией текущего работодателя')
}).describe('Контакты раскрыты (отклик = согласие на раскрытие этой компании)'),
  "explanation": zod.object({
  "score": zod.number().min(updateApplicationStatusResponseTwoExplanationScoreMin).max(updateApplicationStatusResponseTwoExplanationScoreMax).describe('Score = 0.6·Fit + 0.4·Strength − штрафы'),
  "fit": zod.number().min(updateApplicationStatusResponseTwoExplanationFitMin).max(updateApplicationStatusResponseTwoExplanationFitMax),
  "strength": zod.number().min(updateApplicationStatusResponseTwoExplanationStrengthMin).max(updateApplicationStatusResponseTwoExplanationStrengthMax),
  "chips": zod.array(zod.object({
  "kind": zod.enum(['skills_coverage', 'confirmed_skills', 'semantic', 'industry', 'conditions', 'percentile', 'fsp', 'tasks', 'completeness', 'missing_skill', 'penalty']),
  "label": zod.string(),
  "contribution": zod.number().describe('Вклад в итоговый Score, пункты (со знаком)'),
  "polarity": zod.enum(['positive', 'negative', 'neutral']),
  "evidence": zod.string().nullable()
}).describe('Вклад фактора в скоринг: `{factor, value, contribution, evidence}`')).max(updateApplicationStatusResponseTwoExplanationChipsMax).describe('Три главных фактора для чипов'),
  "factors": zod.array(zod.object({
  "kind": zod.enum(['skills_coverage', 'confirmed_skills', 'semantic', 'industry', 'conditions', 'percentile', 'fsp', 'tasks', 'completeness', 'missing_skill', 'penalty']),
  "label": zod.string(),
  "contribution": zod.number().describe('Вклад в итоговый Score, пункты (со знаком)'),
  "polarity": zod.enum(['positive', 'negative', 'neutral']),
  "evidence": zod.string().nullable()
}).describe('Вклад фактора в скоринг: `{factor, value, contribution, evidence}`')).describe('Полный список для панели «Почему в подборке»')
})
}))


/**
 * Система раздаёт задания кандидатам подходящих категорий, не чаще одного в 2 недели на человека.
 * @summary Регулярные задания, назначенные мне
 */
export const listMyTasksResponseTaskTimeLimitMinMin = 5;
export const listMyTasksResponseTaskTimeLimitMinMax = 30;

export const listMyTasksResponseTaskRubricItemCriterionMin = 3;
export const listMyTasksResponseTaskRubricItemCriterionMax = 200;

export const listMyTasksResponseTaskRubricItemWeightMin = 0;
export const listMyTasksResponseTaskRubricItemWeightMax = 1;

export const listMyTasksResponseSubmissionOneLlmScoreMin = 0;
export const listMyTasksResponseSubmissionOneLlmScoreMax = 100;

export const listMyTasksResponseSubmissionOneFinalScoreMin = 0;
export const listMyTasksResponseSubmissionOneFinalScoreMax = 100;



export const ListMyTasksResponseItem = zod.object({
  "task": zod.object({
  "id": zod.uuid(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
}),
  "title": zod.string(),
  "description": zod.string(),
  "kind": zod.enum(['code', 'review', 'approach']).describe('Мини-код / ревью фрагмента / «предложи подход»'),
  "specializations": zod.array(zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик')),
  "grades": zod.array(zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)')),
  "time_limit_min": zod.int().min(listMyTasksResponseTaskTimeLimitMinMin).max(listMyTasksResponseTaskTimeLimitMinMax),
  "language": zod.union([zod.enum(['python', 'go', 'javascript', 'typescript', 'java', 'sql', 'yaml', 'text']),zod.null()]),
  "starter_code": zod.string().nullable(),
  "rubric": zod.array(zod.object({
  "criterion": zod.string().min(listMyTasksResponseTaskRubricItemCriterionMin).max(listMyTasksResponseTaskRubricItemCriterionMax),
  "weight": zod.number().min(listMyTasksResponseTaskRubricItemWeightMin).max(listMyTasksResponseTaskRubricItemWeightMax)
})),
  "status": zod.enum(['active', 'closed']),
  "published_at": zod.iso.datetime({"offset":true}).nullable(),
  "deadline_at": zod.iso.datetime({"offset":true}),
  "assigned_count": zod.int().nullable().describe('Только для работодателя'),
  "submissions_count": zod.int().nullable().describe('Только для работодателя')
}),
  "status": zod.enum(['assigned', 'submitted', 'reviewed', 'expired']),
  "assigned_at": zod.iso.datetime({"offset":true}),
  "due_at": zod.iso.datetime({"offset":true}),
  "submission": zod.union([zod.object({
  "id": zod.uuid(),
  "task_id": zod.uuid(),
  "submitted_at": zod.iso.datetime({"offset":true}),
  "answer_text": zod.string().nullable(),
  "code": zod.string().nullable(),
  "language": zod.union([zod.enum(['python', 'go', 'javascript', 'typescript', 'java', 'sql', 'yaml', 'text']),zod.null()]),
  "status": zod.enum(['pending', 'scored']),
  "llm_score": zod.int().min(listMyTasksResponseSubmissionOneLlmScoreMin).max(listMyTasksResponseSubmissionOneLlmScoreMax).nullable().describe('Предварительная оценка по рубрике (LLM)'),
  "final_score": zod.int().min(listMyTasksResponseSubmissionOneFinalScoreMin).max(listMyTasksResponseSubmissionOneFinalScoreMax).nullable().describe('Итоговая оценка работодателя'),
  "fresh_signal": zod.boolean().describe('Решение дало бейдж «свежий сигнал»'),
  "feedback": zod.string().nullable()
}),zod.null()])
})
export const ListMyTasksResponse = zod.array(ListMyTasksResponseItem)


/**
 * @summary Назначенное задание
 */
export const GetMyTaskParams = zod.object({
  "task_id": zod.uuid()
})

export const getMyTaskResponseTaskTimeLimitMinMin = 5;
export const getMyTaskResponseTaskTimeLimitMinMax = 30;

export const getMyTaskResponseTaskRubricItemCriterionMin = 3;
export const getMyTaskResponseTaskRubricItemCriterionMax = 200;

export const getMyTaskResponseTaskRubricItemWeightMin = 0;
export const getMyTaskResponseTaskRubricItemWeightMax = 1;

export const getMyTaskResponseSubmissionOneLlmScoreMin = 0;
export const getMyTaskResponseSubmissionOneLlmScoreMax = 100;

export const getMyTaskResponseSubmissionOneFinalScoreMin = 0;
export const getMyTaskResponseSubmissionOneFinalScoreMax = 100;



export const GetMyTaskResponse = zod.object({
  "task": zod.object({
  "id": zod.uuid(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
}),
  "title": zod.string(),
  "description": zod.string(),
  "kind": zod.enum(['code', 'review', 'approach']).describe('Мини-код / ревью фрагмента / «предложи подход»'),
  "specializations": zod.array(zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик')),
  "grades": zod.array(zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)')),
  "time_limit_min": zod.int().min(getMyTaskResponseTaskTimeLimitMinMin).max(getMyTaskResponseTaskTimeLimitMinMax),
  "language": zod.union([zod.enum(['python', 'go', 'javascript', 'typescript', 'java', 'sql', 'yaml', 'text']),zod.null()]),
  "starter_code": zod.string().nullable(),
  "rubric": zod.array(zod.object({
  "criterion": zod.string().min(getMyTaskResponseTaskRubricItemCriterionMin).max(getMyTaskResponseTaskRubricItemCriterionMax),
  "weight": zod.number().min(getMyTaskResponseTaskRubricItemWeightMin).max(getMyTaskResponseTaskRubricItemWeightMax)
})),
  "status": zod.enum(['active', 'closed']),
  "published_at": zod.iso.datetime({"offset":true}).nullable(),
  "deadline_at": zod.iso.datetime({"offset":true}),
  "assigned_count": zod.int().nullable().describe('Только для работодателя'),
  "submissions_count": zod.int().nullable().describe('Только для работодателя')
}),
  "status": zod.enum(['assigned', 'submitted', 'reviewed', 'expired']),
  "assigned_at": zod.iso.datetime({"offset":true}),
  "due_at": zod.iso.datetime({"offset":true}),
  "submission": zod.union([zod.object({
  "id": zod.uuid(),
  "task_id": zod.uuid(),
  "submitted_at": zod.iso.datetime({"offset":true}),
  "answer_text": zod.string().nullable(),
  "code": zod.string().nullable(),
  "language": zod.union([zod.enum(['python', 'go', 'javascript', 'typescript', 'java', 'sql', 'yaml', 'text']),zod.null()]),
  "status": zod.enum(['pending', 'scored']),
  "llm_score": zod.int().min(getMyTaskResponseSubmissionOneLlmScoreMin).max(getMyTaskResponseSubmissionOneLlmScoreMax).nullable().describe('Предварительная оценка по рубрике (LLM)'),
  "final_score": zod.int().min(getMyTaskResponseSubmissionOneFinalScoreMin).max(getMyTaskResponseSubmissionOneFinalScoreMax).nullable().describe('Итоговая оценка работодателя'),
  "fresh_signal": zod.boolean().describe('Решение дало бейдж «свежий сигнал»'),
  "feedback": zod.string().nullable()
}),zod.null()])
})


/**
 * @summary Сдать решение регулярного задания
 */
export const SubmitTaskParams = zod.object({
  "task_id": zod.uuid()
})

export const submitTaskBodyAnswerTextMax = 4000;

export const submitTaskBodyCodeMax = 20000;



export const SubmitTaskBody = zod.object({
  "answer_text": zod.string().max(submitTaskBodyAnswerTextMax).nullish(),
  "code": zod.string().max(submitTaskBodyCodeMax).nullish(),
  "language": zod.union([zod.enum(['python', 'go', 'javascript', 'typescript', 'java', 'sql', 'yaml', 'text']),zod.null()]).optional()
}).describe('Нужно хотя бы одно из `answer_text`, `code`')

export const submitTaskResponseLlmScoreMin = 0;
export const submitTaskResponseLlmScoreMax = 100;

export const submitTaskResponseFinalScoreMin = 0;
export const submitTaskResponseFinalScoreMax = 100;



export const SubmitTaskResponse = zod.object({
  "id": zod.uuid(),
  "task_id": zod.uuid(),
  "submitted_at": zod.iso.datetime({"offset":true}),
  "answer_text": zod.string().nullable(),
  "code": zod.string().nullable(),
  "language": zod.union([zod.enum(['python', 'go', 'javascript', 'typescript', 'java', 'sql', 'yaml', 'text']),zod.null()]),
  "status": zod.enum(['pending', 'scored']),
  "llm_score": zod.int().min(submitTaskResponseLlmScoreMin).max(submitTaskResponseLlmScoreMax).nullable().describe('Предварительная оценка по рубрике (LLM)'),
  "final_score": zod.int().min(submitTaskResponseFinalScoreMin).max(submitTaskResponseFinalScoreMax).nullable().describe('Итоговая оценка работодателя'),
  "fresh_signal": zod.boolean().describe('Решение дало бейдж «свежий сигнал»'),
  "feedback": zod.string().nullable()
})


/**
 * @summary Регулярные задания компании
 */
export const listCompanyTasksResponseTimeLimitMinMin = 5;
export const listCompanyTasksResponseTimeLimitMinMax = 30;

export const listCompanyTasksResponseRubricItemCriterionMin = 3;
export const listCompanyTasksResponseRubricItemCriterionMax = 200;

export const listCompanyTasksResponseRubricItemWeightMin = 0;
export const listCompanyTasksResponseRubricItemWeightMax = 1;



export const ListCompanyTasksResponseItem = zod.object({
  "id": zod.uuid(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
}),
  "title": zod.string(),
  "description": zod.string(),
  "kind": zod.enum(['code', 'review', 'approach']).describe('Мини-код / ревью фрагмента / «предложи подход»'),
  "specializations": zod.array(zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик')),
  "grades": zod.array(zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)')),
  "time_limit_min": zod.int().min(listCompanyTasksResponseTimeLimitMinMin).max(listCompanyTasksResponseTimeLimitMinMax),
  "language": zod.union([zod.enum(['python', 'go', 'javascript', 'typescript', 'java', 'sql', 'yaml', 'text']),zod.null()]),
  "starter_code": zod.string().nullable(),
  "rubric": zod.array(zod.object({
  "criterion": zod.string().min(listCompanyTasksResponseRubricItemCriterionMin).max(listCompanyTasksResponseRubricItemCriterionMax),
  "weight": zod.number().min(listCompanyTasksResponseRubricItemWeightMin).max(listCompanyTasksResponseRubricItemWeightMax)
})),
  "status": zod.enum(['active', 'closed']),
  "published_at": zod.iso.datetime({"offset":true}).nullable(),
  "deadline_at": zod.iso.datetime({"offset":true}),
  "assigned_count": zod.int().nullable().describe('Только для работодателя'),
  "submissions_count": zod.int().nullable().describe('Только для работодателя')
})
export const ListCompanyTasksResponse = zod.array(ListCompanyTasksResponseItem)


/**
 * @summary Опубликовать регулярное задание
 */
export const createCompanyTaskBodyTitleMin = 5;
export const createCompanyTaskBodyTitleMax = 120;

export const createCompanyTaskBodyDescriptionMin = 30;
export const createCompanyTaskBodyDescriptionMax = 4000;



export const createCompanyTaskBodyTimeLimitMinMin = 5;
export const createCompanyTaskBodyTimeLimitMinMax = 30;

export const createCompanyTaskBodyStarterCodeMax = 10000;

export const createCompanyTaskBodyRubricItemCriterionMin = 3;
export const createCompanyTaskBodyRubricItemCriterionMax = 200;

export const createCompanyTaskBodyRubricItemWeightMin = 0;
export const createCompanyTaskBodyRubricItemWeightMax = 1;

export const createCompanyTaskBodyRubricMax = 6;



export const CreateCompanyTaskBody = zod.object({
  "title": zod.string().min(createCompanyTaskBodyTitleMin).max(createCompanyTaskBodyTitleMax),
  "description": zod.string().min(createCompanyTaskBodyDescriptionMin).max(createCompanyTaskBodyDescriptionMax),
  "kind": zod.enum(['code', 'review', 'approach']).describe('Мини-код / ревью фрагмента / «предложи подход»'),
  "specializations": zod.array(zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик')).min(1),
  "grades": zod.array(zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)')).min(1),
  "time_limit_min": zod.int().min(createCompanyTaskBodyTimeLimitMinMin).max(createCompanyTaskBodyTimeLimitMinMax),
  "language": zod.union([zod.enum(['python', 'go', 'javascript', 'typescript', 'java', 'sql', 'yaml', 'text']),zod.null()]),
  "starter_code": zod.string().max(createCompanyTaskBodyStarterCodeMax).nullable(),
  "rubric": zod.array(zod.object({
  "criterion": zod.string().min(createCompanyTaskBodyRubricItemCriterionMin).max(createCompanyTaskBodyRubricItemCriterionMax),
  "weight": zod.number().min(createCompanyTaskBodyRubricItemWeightMin).max(createCompanyTaskBodyRubricItemWeightMax)
})).min(1).max(createCompanyTaskBodyRubricMax),
  "deadline_at": zod.iso.datetime({"offset":true})
})

export const createCompanyTaskResponseTimeLimitMinMin = 5;
export const createCompanyTaskResponseTimeLimitMinMax = 30;

export const createCompanyTaskResponseRubricItemCriterionMin = 3;
export const createCompanyTaskResponseRubricItemCriterionMax = 200;

export const createCompanyTaskResponseRubricItemWeightMin = 0;
export const createCompanyTaskResponseRubricItemWeightMax = 1;



export const CreateCompanyTaskResponse = zod.object({
  "id": zod.uuid(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
}),
  "title": zod.string(),
  "description": zod.string(),
  "kind": zod.enum(['code', 'review', 'approach']).describe('Мини-код / ревью фрагмента / «предложи подход»'),
  "specializations": zod.array(zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик')),
  "grades": zod.array(zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)')),
  "time_limit_min": zod.int().min(createCompanyTaskResponseTimeLimitMinMin).max(createCompanyTaskResponseTimeLimitMinMax),
  "language": zod.union([zod.enum(['python', 'go', 'javascript', 'typescript', 'java', 'sql', 'yaml', 'text']),zod.null()]),
  "starter_code": zod.string().nullable(),
  "rubric": zod.array(zod.object({
  "criterion": zod.string().min(createCompanyTaskResponseRubricItemCriterionMin).max(createCompanyTaskResponseRubricItemCriterionMax),
  "weight": zod.number().min(createCompanyTaskResponseRubricItemWeightMin).max(createCompanyTaskResponseRubricItemWeightMax)
})),
  "status": zod.enum(['active', 'closed']),
  "published_at": zod.iso.datetime({"offset":true}).nullable(),
  "deadline_at": zod.iso.datetime({"offset":true}),
  "assigned_count": zod.int().nullable().describe('Только для работодателя'),
  "submissions_count": zod.int().nullable().describe('Только для работодателя')
})


/**
 * @summary Регулярное задание компании
 */
export const GetCompanyTaskParams = zod.object({
  "task_id": zod.uuid()
})

export const getCompanyTaskResponseTimeLimitMinMin = 5;
export const getCompanyTaskResponseTimeLimitMinMax = 30;

export const getCompanyTaskResponseRubricItemCriterionMin = 3;
export const getCompanyTaskResponseRubricItemCriterionMax = 200;

export const getCompanyTaskResponseRubricItemWeightMin = 0;
export const getCompanyTaskResponseRubricItemWeightMax = 1;



export const GetCompanyTaskResponse = zod.object({
  "id": zod.uuid(),
  "company": zod.object({
  "id": zod.uuid(),
  "name": zod.string(),
  "industry": zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),
  "city": zod.string().nullable(),
  "verified": zod.boolean().describe('Проверенный работодатель (ИНН/домен почты)')
}),
  "title": zod.string(),
  "description": zod.string(),
  "kind": zod.enum(['code', 'review', 'approach']).describe('Мини-код / ревью фрагмента / «предложи подход»'),
  "specializations": zod.array(zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик')),
  "grades": zod.array(zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)')),
  "time_limit_min": zod.int().min(getCompanyTaskResponseTimeLimitMinMin).max(getCompanyTaskResponseTimeLimitMinMax),
  "language": zod.union([zod.enum(['python', 'go', 'javascript', 'typescript', 'java', 'sql', 'yaml', 'text']),zod.null()]),
  "starter_code": zod.string().nullable(),
  "rubric": zod.array(zod.object({
  "criterion": zod.string().min(getCompanyTaskResponseRubricItemCriterionMin).max(getCompanyTaskResponseRubricItemCriterionMax),
  "weight": zod.number().min(getCompanyTaskResponseRubricItemWeightMin).max(getCompanyTaskResponseRubricItemWeightMax)
})),
  "status": zod.enum(['active', 'closed']),
  "published_at": zod.iso.datetime({"offset":true}).nullable(),
  "deadline_at": zod.iso.datetime({"offset":true}),
  "assigned_count": zod.int().nullable().describe('Только для работодателя'),
  "submissions_count": zod.int().nullable().describe('Только для работодателя')
})


/**
 * @summary Решения задания (анонимные карточки авторов, лучшие сверху)
 */
export const ListTaskSubmissionsParams = zod.object({
  "task_id": zod.uuid()
})

export const listTaskSubmissionsResponseOneLlmScoreMin = 0;
export const listTaskSubmissionsResponseOneLlmScoreMax = 100;

export const listTaskSubmissionsResponseOneFinalScoreMin = 0;
export const listTaskSubmissionsResponseOneFinalScoreMax = 100;

export const listTaskSubmissionsResponseTwoCandidatePercentileMax = 99;

export const listTaskSubmissionsResponseTwoCandidateStrengthMin = 0;
export const listTaskSubmissionsResponseTwoCandidateStrengthMax = 130;

export const listTaskSubmissionsResponseTwoCandidateSkillsItemScoreMin = 0;
export const listTaskSubmissionsResponseTwoCandidateSkillsItemScoreMax = 100;

export const listTaskSubmissionsResponseTwoCandidateExperienceItemStartRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const listTaskSubmissionsResponseTwoCandidateExperienceItemEndRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const listTaskSubmissionsResponseTwoCandidateExperienceItemDescriptionMax = 1000;

export const listTaskSubmissionsResponseTwoCandidateSalaryExpectationOneFromMin = 10000;
export const listTaskSubmissionsResponseTwoCandidateSalaryExpectationOneFromMax = 10000000;

export const listTaskSubmissionsResponseTwoCandidateSalaryExpectationOneToMin = 10000;
export const listTaskSubmissionsResponseTwoCandidateSalaryExpectationOneToMax = 10000000;

export const listTaskSubmissionsResponseTwoCandidateFspOneIndexMin = 0;
export const listTaskSubmissionsResponseTwoCandidateFspOneIndexMax = 100;

export const listTaskSubmissionsResponseTwoCandidateFspOneBonusMin = 0;
export const listTaskSubmissionsResponseTwoCandidateFspOneBonusMax = 30;

export const listTaskSubmissionsResponseTwoCandidateFspOneAchievementsCountMin = 0;



export const listTaskSubmissionsResponseTwoCandidateFspOneTopAchievementOnePercentileMax = 99;

export const listTaskSubmissionsResponseTwoCandidateTaskSignalSolvedCountMin = 0;



export const ListTaskSubmissionsResponseItem = zod.object({
  "id": zod.uuid(),
  "task_id": zod.uuid(),
  "submitted_at": zod.iso.datetime({"offset":true}),
  "answer_text": zod.string().nullable(),
  "code": zod.string().nullable(),
  "language": zod.union([zod.enum(['python', 'go', 'javascript', 'typescript', 'java', 'sql', 'yaml', 'text']),zod.null()]),
  "status": zod.enum(['pending', 'scored']),
  "llm_score": zod.int().min(listTaskSubmissionsResponseOneLlmScoreMin).max(listTaskSubmissionsResponseOneLlmScoreMax).nullable().describe('Предварительная оценка по рубрике (LLM)'),
  "final_score": zod.int().min(listTaskSubmissionsResponseOneFinalScoreMin).max(listTaskSubmissionsResponseOneFinalScoreMax).nullable().describe('Итоговая оценка работодателя'),
  "fresh_signal": zod.boolean().describe('Решение дало бейдж «свежий сигнал»'),
  "feedback": zod.string().nullable()
}).and(zod.object({
  "candidate": zod.object({
  "id": zod.uuid(),
  "alias": zod.string().describe('Анонимное имя, стабильное для пары компания–кандидат'),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "grade_confirmed": zod.boolean(),
  "percentile": zod.int().min(1).max(listTaskSubmissionsResponseTwoCandidatePercentileMax).nullable(),
  "test_flags": zod.array(zod.object({
  "code": zod.enum(['fast_correct', 'paste', 'focus_loss']),
  "severity": zod.enum(['info', 'warning'])
}).describe('Сигнал прокторинга подтверждающего теста; не доказывает нарушение')).optional(),
  "strength": zod.number().min(listTaskSubmissionsResponseTwoCandidateStrengthMin).max(listTaskSubmissionsResponseTwoCandidateStrengthMax).describe('Сила профиля (0–100 + бонус ФСП до 30)'),
  "skills": zod.array(zod.object({
  "skill_id": zod.string(),
  "name": zod.string(),
  "level": zod.enum(['basic', 'confident', 'advanced']),
  "source": zod.enum(['self', 'resume', 'test', 'fsp', 'task']).describe('self — заявлен, resume — из резюме, test — подтверждён тестом, fsp — из достижений ФСП, task — из регулярного задания'),
  "verified": zod.boolean().describe('Подтверждён тестом, заданием или ФСП'),
  "score": zod.int().min(listTaskSubmissionsResponseTwoCandidateSkillsItemScoreMin).max(listTaskSubmissionsResponseTwoCandidateSkillsItemScoreMax).nullable().describe('Балл по навыку в тесте, если подтверждён тестом')
})),
  "experience_years": zod.number(),
  "experience": zod.array(zod.object({
  "role": zod.string(),
  "company_name": zod.string().nullable().describe('`null`, если кандидат скрыл названия компаний'),
  "company_hidden": zod.boolean(),
  "industry": zod.union([zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),zod.null()]),
  "start": zod.string().regex(listTaskSubmissionsResponseTwoCandidateExperienceItemStartRegExp).describe('Месяц начала YYYY-MM'),
  "end": zod.string().regex(listTaskSubmissionsResponseTwoCandidateExperienceItemEndRegExp).nullable().describe('Месяц окончания, `null` — по настоящее время'),
  "description": zod.string().max(listTaskSubmissionsResponseTwoCandidateExperienceItemDescriptionMax).nullable()
})),
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])),
  "city": zod.string().nullable().describe('`null`, если кандидат скрыл город'),
  "relocation": zod.boolean(),
  "salary_expectation": zod.union([zod.object({
  "from": zod.int().min(listTaskSubmissionsResponseTwoCandidateSalaryExpectationOneFromMin).max(listTaskSubmissionsResponseTwoCandidateSalaryExpectationOneFromMax),
  "to": zod.int().min(listTaskSubmissionsResponseTwoCandidateSalaryExpectationOneToMin).max(listTaskSubmissionsResponseTwoCandidateSalaryExpectationOneToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),zod.null()]),
  "availability": zod.enum(['active', 'open', 'not_looking']).describe('Ищу активно / открыт к предложениям / не ищу'),
  "last_active_at": zod.iso.datetime({"offset":true}).nullable(),
  "fsp": zod.union([zod.object({
  "has_history": zod.boolean(),
  "index": zod.int().min(listTaskSubmissionsResponseTwoCandidateFspOneIndexMin).max(listTaskSubmissionsResponseTwoCandidateFspOneIndexMax),
  "bonus": zod.number().min(listTaskSubmissionsResponseTwoCandidateFspOneBonusMin).max(listTaskSubmissionsResponseTwoCandidateFspOneBonusMax),
  "achievements_count": zod.int().min(listTaskSubmissionsResponseTwoCandidateFspOneAchievementsCountMin),
  "top_achievement": zod.union([zod.object({
  "id": zod.uuid(),
  "event_id": zod.string(),
  "title": zod.string(),
  "date": zod.iso.date(),
  "level": zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),
  "discipline": zod.enum(['product', 'algorithmic', 'cybersecurity', 'robotics', 'uas']).describe('Продуктовое / алгоритмическое / кибербезопасность / робототехника / БАС'),
  "format": zod.enum(['individual', 'team']),
  "team": zod.string().nullable(),
  "role": zod.string().nullable(),
  "place": zod.int().min(1).nullable(),
  "participants_total": zod.int().min(1).nullable(),
  "percentile": zod.int().min(1).max(listTaskSubmissionsResponseTwoCandidateFspOneTopAchievementOnePercentileMax).nullable(),
  "result": zod.enum(['winner', 'prize_winner', 'finalist', 'participant']).describe('Победитель / призёр / финалист / участник'),
  "sport_rank": zod.string().nullable().describe('Спортивный разряд'),
  "certificate_url": zod.url().nullable(),
  "verified": zod.boolean().describe('Подпись реестра ФСП проверена')
}),zod.null()]),
  "max_level": zod.union([zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),zod.null()])
}),zod.null()]).describe('`null` — кандидат скрыл данные ФСП; `has_history=false` — истории нет (нейтрально)'),
  "task_signal": zod.object({
  "fresh": zod.boolean().describe('Бейдж «свежий сигнал» за хорошее решение регулярного задания'),
  "solved_count": zod.int().min(listTaskSubmissionsResponseTwoCandidateTaskSignalSolvedCountMin),
  "last_solved_at": zod.iso.datetime({"offset":true}).nullable()
}),
  "disclosure": zod.object({
  "revealed": zod.boolean(),
  "reason": zod.union([zod.enum(['invitation_accepted', 'application']).describe('Почему компании раскрыты контакты'),zod.null()]),
  "revealed_at": zod.iso.datetime({"offset":true}).nullable(),
  "source_id": zod.uuid().nullable().describe('ID инвайта или отклика')
}),
  "contacts": zod.union([zod.object({
  "full_name": zod.string(),
  "email": zod.email(),
  "phone": zod.string().nullable(),
  "telegram": zod.string().nullable(),
  "preferred_channel": zod.enum(['email', 'phone', 'telegram'])
}),zod.null()]),
  "relation": zod.object({
  "invitation": zod.union([zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed'])
}),zod.null()]),
  "application": zod.union([zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']),
  "vacancy_id": zod.uuid()
}),zod.null()])
}).describe('Отношения кандидата с компанией текущего работодателя')
}).describe('Карточка кандидата для работодателя. До раскрытия анонимна: нет ФИО, фото, возраста, контактов,\nназвания компаний скрыты по настройке. `contacts` не `null` только при `disclosure.revealed`.\n')
}))
export const ListTaskSubmissionsResponse = zod.array(ListTaskSubmissionsResponseItem)


/**
 * @summary Итоговая оценка решения по рубрике (последнее слово за человеком)
 */
export const ScoreTaskSubmissionParams = zod.object({
  "task_id": zod.uuid(),
  "submission_id": zod.uuid()
})

export const scoreTaskSubmissionBodyFinalScoreMin = 0;
export const scoreTaskSubmissionBodyFinalScoreMax = 100;

export const scoreTaskSubmissionBodyFeedbackMax = 2000;



export const ScoreTaskSubmissionBody = zod.object({
  "final_score": zod.int().min(scoreTaskSubmissionBodyFinalScoreMin).max(scoreTaskSubmissionBodyFinalScoreMax),
  "feedback": zod.string().max(scoreTaskSubmissionBodyFeedbackMax).nullish()
})

export const scoreTaskSubmissionResponseOneLlmScoreMin = 0;
export const scoreTaskSubmissionResponseOneLlmScoreMax = 100;

export const scoreTaskSubmissionResponseOneFinalScoreMin = 0;
export const scoreTaskSubmissionResponseOneFinalScoreMax = 100;

export const scoreTaskSubmissionResponseTwoCandidatePercentileMax = 99;

export const scoreTaskSubmissionResponseTwoCandidateStrengthMin = 0;
export const scoreTaskSubmissionResponseTwoCandidateStrengthMax = 130;

export const scoreTaskSubmissionResponseTwoCandidateSkillsItemScoreMin = 0;
export const scoreTaskSubmissionResponseTwoCandidateSkillsItemScoreMax = 100;

export const scoreTaskSubmissionResponseTwoCandidateExperienceItemStartRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const scoreTaskSubmissionResponseTwoCandidateExperienceItemEndRegExp = new RegExp('^\\d{4}-(0[1-9]|1[0-2])$');
export const scoreTaskSubmissionResponseTwoCandidateExperienceItemDescriptionMax = 1000;

export const scoreTaskSubmissionResponseTwoCandidateSalaryExpectationOneFromMin = 10000;
export const scoreTaskSubmissionResponseTwoCandidateSalaryExpectationOneFromMax = 10000000;

export const scoreTaskSubmissionResponseTwoCandidateSalaryExpectationOneToMin = 10000;
export const scoreTaskSubmissionResponseTwoCandidateSalaryExpectationOneToMax = 10000000;

export const scoreTaskSubmissionResponseTwoCandidateFspOneIndexMin = 0;
export const scoreTaskSubmissionResponseTwoCandidateFspOneIndexMax = 100;

export const scoreTaskSubmissionResponseTwoCandidateFspOneBonusMin = 0;
export const scoreTaskSubmissionResponseTwoCandidateFspOneBonusMax = 30;

export const scoreTaskSubmissionResponseTwoCandidateFspOneAchievementsCountMin = 0;



export const scoreTaskSubmissionResponseTwoCandidateFspOneTopAchievementOnePercentileMax = 99;

export const scoreTaskSubmissionResponseTwoCandidateTaskSignalSolvedCountMin = 0;



export const ScoreTaskSubmissionResponse = zod.object({
  "id": zod.uuid(),
  "task_id": zod.uuid(),
  "submitted_at": zod.iso.datetime({"offset":true}),
  "answer_text": zod.string().nullable(),
  "code": zod.string().nullable(),
  "language": zod.union([zod.enum(['python', 'go', 'javascript', 'typescript', 'java', 'sql', 'yaml', 'text']),zod.null()]),
  "status": zod.enum(['pending', 'scored']),
  "llm_score": zod.int().min(scoreTaskSubmissionResponseOneLlmScoreMin).max(scoreTaskSubmissionResponseOneLlmScoreMax).nullable().describe('Предварительная оценка по рубрике (LLM)'),
  "final_score": zod.int().min(scoreTaskSubmissionResponseOneFinalScoreMin).max(scoreTaskSubmissionResponseOneFinalScoreMax).nullable().describe('Итоговая оценка работодателя'),
  "fresh_signal": zod.boolean().describe('Решение дало бейдж «свежий сигнал»'),
  "feedback": zod.string().nullable()
}).and(zod.object({
  "candidate": zod.object({
  "id": zod.uuid(),
  "alias": zod.string().describe('Анонимное имя, стабильное для пары компания–кандидат'),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "grade_confirmed": zod.boolean(),
  "percentile": zod.int().min(1).max(scoreTaskSubmissionResponseTwoCandidatePercentileMax).nullable(),
  "test_flags": zod.array(zod.object({
  "code": zod.enum(['fast_correct', 'paste', 'focus_loss']),
  "severity": zod.enum(['info', 'warning'])
}).describe('Сигнал прокторинга подтверждающего теста; не доказывает нарушение')).optional(),
  "strength": zod.number().min(scoreTaskSubmissionResponseTwoCandidateStrengthMin).max(scoreTaskSubmissionResponseTwoCandidateStrengthMax).describe('Сила профиля (0–100 + бонус ФСП до 30)'),
  "skills": zod.array(zod.object({
  "skill_id": zod.string(),
  "name": zod.string(),
  "level": zod.enum(['basic', 'confident', 'advanced']),
  "source": zod.enum(['self', 'resume', 'test', 'fsp', 'task']).describe('self — заявлен, resume — из резюме, test — подтверждён тестом, fsp — из достижений ФСП, task — из регулярного задания'),
  "verified": zod.boolean().describe('Подтверждён тестом, заданием или ФСП'),
  "score": zod.int().min(scoreTaskSubmissionResponseTwoCandidateSkillsItemScoreMin).max(scoreTaskSubmissionResponseTwoCandidateSkillsItemScoreMax).nullable().describe('Балл по навыку в тесте, если подтверждён тестом')
})),
  "experience_years": zod.number(),
  "experience": zod.array(zod.object({
  "role": zod.string(),
  "company_name": zod.string().nullable().describe('`null`, если кандидат скрыл названия компаний'),
  "company_hidden": zod.boolean(),
  "industry": zod.union([zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other']),zod.null()]),
  "start": zod.string().regex(scoreTaskSubmissionResponseTwoCandidateExperienceItemStartRegExp).describe('Месяц начала YYYY-MM'),
  "end": zod.string().regex(scoreTaskSubmissionResponseTwoCandidateExperienceItemEndRegExp).nullable().describe('Месяц окончания, `null` — по настоящее время'),
  "description": zod.string().max(scoreTaskSubmissionResponseTwoCandidateExperienceItemDescriptionMax).nullable()
})),
  "industries": zod.array(zod.enum(['fintech', 'ecom', 'gov', 'telecom', 'gamedev', 'edtech', 'medtech', 'manufacturing', 'other'])),
  "work_formats": zod.array(zod.enum(['office', 'hybrid', 'remote'])),
  "city": zod.string().nullable().describe('`null`, если кандидат скрыл город'),
  "relocation": zod.boolean(),
  "salary_expectation": zod.union([zod.object({
  "from": zod.int().min(scoreTaskSubmissionResponseTwoCandidateSalaryExpectationOneFromMin).max(scoreTaskSubmissionResponseTwoCandidateSalaryExpectationOneFromMax),
  "to": zod.int().min(scoreTaskSubmissionResponseTwoCandidateSalaryExpectationOneToMin).max(scoreTaskSubmissionResponseTwoCandidateSalaryExpectationOneToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),zod.null()]),
  "availability": zod.enum(['active', 'open', 'not_looking']).describe('Ищу активно / открыт к предложениям / не ищу'),
  "last_active_at": zod.iso.datetime({"offset":true}).nullable(),
  "fsp": zod.union([zod.object({
  "has_history": zod.boolean(),
  "index": zod.int().min(scoreTaskSubmissionResponseTwoCandidateFspOneIndexMin).max(scoreTaskSubmissionResponseTwoCandidateFspOneIndexMax),
  "bonus": zod.number().min(scoreTaskSubmissionResponseTwoCandidateFspOneBonusMin).max(scoreTaskSubmissionResponseTwoCandidateFspOneBonusMax),
  "achievements_count": zod.int().min(scoreTaskSubmissionResponseTwoCandidateFspOneAchievementsCountMin),
  "top_achievement": zod.union([zod.object({
  "id": zod.uuid(),
  "event_id": zod.string(),
  "title": zod.string(),
  "date": zod.iso.date(),
  "level": zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),
  "discipline": zod.enum(['product', 'algorithmic', 'cybersecurity', 'robotics', 'uas']).describe('Продуктовое / алгоритмическое / кибербезопасность / робототехника / БАС'),
  "format": zod.enum(['individual', 'team']),
  "team": zod.string().nullable(),
  "role": zod.string().nullable(),
  "place": zod.int().min(1).nullable(),
  "participants_total": zod.int().min(1).nullable(),
  "percentile": zod.int().min(1).max(scoreTaskSubmissionResponseTwoCandidateFspOneTopAchievementOnePercentileMax).nullable(),
  "result": zod.enum(['winner', 'prize_winner', 'finalist', 'participant']).describe('Победитель / призёр / финалист / участник'),
  "sport_rank": zod.string().nullable().describe('Спортивный разряд'),
  "certificate_url": zod.url().nullable(),
  "verified": zod.boolean().describe('Подпись реестра ФСП проверена')
}),zod.null()]),
  "max_level": zod.union([zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),zod.null()])
}),zod.null()]).describe('`null` — кандидат скрыл данные ФСП; `has_history=false` — истории нет (нейтрально)'),
  "task_signal": zod.object({
  "fresh": zod.boolean().describe('Бейдж «свежий сигнал» за хорошее решение регулярного задания'),
  "solved_count": zod.int().min(scoreTaskSubmissionResponseTwoCandidateTaskSignalSolvedCountMin),
  "last_solved_at": zod.iso.datetime({"offset":true}).nullable()
}),
  "disclosure": zod.object({
  "revealed": zod.boolean(),
  "reason": zod.union([zod.enum(['invitation_accepted', 'application']).describe('Почему компании раскрыты контакты'),zod.null()]),
  "revealed_at": zod.iso.datetime({"offset":true}).nullable(),
  "source_id": zod.uuid().nullable().describe('ID инвайта или отклика')
}),
  "contacts": zod.union([zod.object({
  "full_name": zod.string(),
  "email": zod.email(),
  "phone": zod.string().nullable(),
  "telegram": zod.string().nullable(),
  "preferred_channel": zod.enum(['email', 'phone', 'telegram'])
}),zod.null()]),
  "relation": zod.object({
  "invitation": zod.union([zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['draft', 'sent', 'viewed', 'postponed', 'accepted', 'declined', 'expired', 'withdrawn', 'interview', 'offer', 'hired', 'closed'])
}),zod.null()]),
  "application": zod.union([zod.object({
  "id": zod.uuid(),
  "status": zod.enum(['submitted', 'viewed', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']),
  "vacancy_id": zod.uuid()
}),zod.null()])
}).describe('Отношения кандидата с компанией текущего работодателя')
}).describe('Карточка кандидата для работодателя. До раскрытия анонимна: нет ФИО, фото, возраста, контактов,\nназвания компаний скрыты по настройке. `contacts` не `null` только при `disclosure.revealed`.\n')
}))


/**
 * @summary Проверка подлинности PDF-профиля по QR
 */
export const verifyProfilePathProfileTokenMin = 16;
export const verifyProfilePathProfileTokenMax = 128;



export const VerifyProfileParams = zod.object({
  "profile_token": zod.string().min(verifyProfilePathProfileTokenMin).max(verifyProfilePathProfileTokenMax)
})

export const VerifyProfileResponse = zod.object({
  "valid": zod.boolean(),
  "full_name": zod.string(),
  "category": zod.union([zod.object({
  "specialization": zod.enum(['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst']).describe('Backend, Frontend, Mobile, QA, DevOps/SRE, Data/ML, Аналитик'),
  "grade": zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),
  "label": zod.string()
}).describe('Категория «специализация × грейд»'),zod.null()]),
  "percentile": zod.int().nullable(),
  "confirmed_at": zod.iso.datetime({"offset":true}).nullable(),
  "fsp_achievements_count": zod.int(),
  "issued_at": zod.iso.datetime({"offset":true})
})


/**
 * Отдаёт top-K с объяснениями. `Accept: text/csv` — тот же результат в CSV.
 * @summary Режим проверки жюри — ранжирование внешних пар «вакансия–кандидат»
 */
export const evalRankBodyTopKDefault = 10;
export const evalRankBodyTopKMax = 100;

export const evalRankBodyVacanciesItemTextMax = 8000;

export const evalRankBodyVacanciesItemSalaryOneFromMin = 10000;
export const evalRankBodyVacanciesItemSalaryOneFromMax = 10000000;

export const evalRankBodyVacanciesItemSalaryOneToMin = 10000;
export const evalRankBodyVacanciesItemSalaryOneToMax = 10000000;

export const evalRankBodyVacanciesMax = 100;

export const evalRankBodyCandidatesItemTextMax = 20000;

export const evalRankBodyCandidatesMax = 2000;



export const EvalRankBody = zod.object({
  "top_k": zod.int().min(1).max(evalRankBodyTopKMax).default(evalRankBodyTopKDefault),
  "vacancies": zod.array(zod.object({
  "id": zod.string(),
  "text": zod.string().max(evalRankBodyVacanciesItemTextMax),
  "salary": zod.union([zod.object({
  "from": zod.int().min(evalRankBodyVacanciesItemSalaryOneFromMin).max(evalRankBodyVacanciesItemSalaryOneFromMax),
  "to": zod.int().min(evalRankBodyVacanciesItemSalaryOneToMin).max(evalRankBodyVacanciesItemSalaryOneToMax)
}).describe('Вилка в рублях в месяц на руки. `from ≤ to`, иначе 422 `salary_range_invalid`.'),zod.null()]).optional()
})).min(1).max(evalRankBodyVacanciesMax),
  "candidates": zod.array(zod.object({
  "id": zod.string(),
  "text": zod.string().max(evalRankBodyCandidatesItemTextMax).describe('Текст резюме или JSON Resume, сериализованный в строку'),
  "grade": zod.union([zod.enum(['junior', 'middle', 'senior', 'lead']).describe('Junior (до 1 года), Middle (1–3), Senior (3–6), Lead (6+)'),zod.null()]).optional()
})).min(1).max(evalRankBodyCandidatesMax)
})

export const EvalRankResponse = zod.object({
  "results": zod.array(zod.object({
  "vacancy_id": zod.string(),
  "ranking": zod.array(zod.object({
  "candidate_id": zod.string(),
  "score": zod.number(),
  "factors": zod.array(zod.object({
  "kind": zod.enum(['skills_coverage', 'confirmed_skills', 'semantic', 'industry', 'conditions', 'percentile', 'fsp', 'tasks', 'completeness', 'missing_skill', 'penalty']),
  "label": zod.string(),
  "contribution": zod.number().describe('Вклад в итоговый Score, пункты (со знаком)'),
  "polarity": zod.enum(['positive', 'negative', 'neutral']),
  "evidence": zod.string().nullable()
}).describe('Вклад фактора в скоринг: `{factor, value, contribution, evidence}`'))
}))
}))
})


/**
 * @summary Вебхук реестра ФСП (achievement.created)
 */
export const FspWebhookHeader = zod.object({
  "X-FSP-Signature": zod.string().describe('HMAC-SHA256 тела запроса общим секретом')
})



export const fspWebhookBodyAchievementPercentileMax = 99;



export const FspWebhookBody = zod.object({
  "event": zod.enum(['achievement.created']),
  "fsp_id": zod.string(),
  "occurred_at": zod.iso.datetime({"offset":true}),
  "achievement": zod.object({
  "id": zod.uuid(),
  "event_id": zod.string(),
  "title": zod.string(),
  "date": zod.iso.date(),
  "level": zod.enum(['regional', 'national', 'international']).describe('Региональный / всероссийский / международный'),
  "discipline": zod.enum(['product', 'algorithmic', 'cybersecurity', 'robotics', 'uas']).describe('Продуктовое / алгоритмическое / кибербезопасность / робототехника / БАС'),
  "format": zod.enum(['individual', 'team']),
  "team": zod.string().nullable(),
  "role": zod.string().nullable(),
  "place": zod.int().min(1).nullable(),
  "participants_total": zod.int().min(1).nullable(),
  "percentile": zod.int().min(1).max(fspWebhookBodyAchievementPercentileMax).nullable(),
  "result": zod.enum(['winner', 'prize_winner', 'finalist', 'participant']).describe('Победитель / призёр / финалист / участник'),
  "sport_rank": zod.string().nullable().describe('Спортивный разряд'),
  "certificate_url": zod.url().nullable(),
  "verified": zod.boolean().describe('Подпись реестра ФСП проверена')
})
})

export const FspWebhookResponse = zod.void()
