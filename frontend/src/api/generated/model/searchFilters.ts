/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { FspLevel } from './fspLevel';
import type { Grade } from './grade';
import type { Industry } from './industry';
import type { SalaryRange } from './salaryRange';
import type { SearchFiltersAvailabilityItem } from './searchFiltersAvailabilityItem';
import type { Specialization } from './specialization';
import type { WorkFormat } from './workFormat';

export interface SearchFilters {
  specialization: Specialization;
  /** @minItems 1 */
  grades: Grade[];
  /** @maxItems 15 */
  must_skills: string[];
  /** @maxItems 15 */
  nice_skills: string[];
  /** @minItems 1 */
  work_formats: WorkFormat[];
  /** @nullable */
  city: string | null;
  /** Учитывать готовых к переезду из других городов */
  include_relocation: boolean;
  industries: Industry[];
  salary: SalaryRange;
  fsp_only: boolean;
  fsp_level_min: FspLevel | null;
  /** @minItems 1 */
  availability: SearchFiltersAvailabilityItem[];
}
