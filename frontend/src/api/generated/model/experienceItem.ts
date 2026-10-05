/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Industry } from './industry';

export interface ExperienceItem {
  role: string;
  /**
     * `null`, если кандидат скрыл названия компаний
     * @nullable
     */
  company_name: string | null;
  company_hidden: boolean;
  industry: Industry | null;
  /**
     * Месяц начала YYYY-MM
     * @pattern ^\d{4}-(0[1-9]|1[0-2])$
     */
  start: string;
  /**
     * Месяц окончания, `null` — по настоящее время
     * @nullable
     * @pattern ^\d{4}-(0[1-9]|1[0-2])$
     */
  end: string | null;
  /**
     * @maxLength 1000
     * @nullable
     */
  description: string | null;
}
