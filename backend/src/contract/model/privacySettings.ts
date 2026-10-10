/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Availability } from './availability.js';
import type { CompanyBrief } from './companyBrief.js';

export interface PrivacySettings {
  availability: Availability;
  /**
     * Скрытый минимум (₽/мес на руки). Работодатель его не видит.
     * @minimum 10000
     * @nullable
     */
  salary_floor: number | null;
  hidden_companies: CompanyBrief[];
  /** Показывать работодателям достижения ФСП */
  show_fsp: boolean;
  /** Показывать названия компаний в опыте */
  show_company_names: boolean;
  show_city: boolean;
  /** Профиль в выдаче (есть согласие profile_visibility, грейд подтверждён и статус не «не ищу») */
  readonly profile_published: boolean;
}
