/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CompanyBrief } from './companyBrief';
import type { Grade } from './grade';
import type { SalaryRange } from './salaryRange';
import type { SkillRef } from './skillRef';
import type { Specialization } from './specialization';
import type { VacancyMatch } from './vacancyMatch';
import type { VacancyMyApplication } from './vacancyMyApplication';
import type { VacancyStatus } from './vacancyStatus';
import type { WorkFormat } from './workFormat';

export interface Vacancy {
  id: string;
  company: CompanyBrief;
  title: string;
  description: string;
  specialization: Specialization;
  grade: Grade;
  must_skills: SkillRef[];
  nice_skills: SkillRef[];
  work_format: WorkFormat;
  /** @nullable */
  city: string | null;
  salary: SalaryRange;
  status: VacancyStatus;
  /** @nullable */
  published_at: string | null;
  created_at: string;
  /**
     * Только для работодателя-владельца
     * @nullable
     */
  applications_count: number | null;
  /** Только для кандидата */
  my_application: VacancyMyApplication;
  /** Соответствие профилю кандидата (только для кандидата с подтверждённым грейдом) */
  match: VacancyMatch;
}
