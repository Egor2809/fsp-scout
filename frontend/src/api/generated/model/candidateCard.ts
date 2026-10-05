/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Availability } from './availability';
import type { CandidateCardTaskSignal } from './candidateCardTaskSignal';
import type { CandidateContacts } from './candidateContacts';
import type { CandidateRelation } from './candidateRelation';
import type { CandidateSkill } from './candidateSkill';
import type { Category } from './category';
import type { Disclosure } from './disclosure';
import type { ExperienceItem } from './experienceItem';
import type { FspSummary } from './fspSummary';
import type { Industry } from './industry';
import type { SalaryRange } from './salaryRange';
import type { WorkFormat } from './workFormat';

/**
 * Карточка кандидата для работодателя. До раскрытия анонимна: нет ФИО, фото, возраста, контактов,
 * названия компаний скрыты по настройке. `contacts` не `null` только при `disclosure.revealed`.
 */
export interface CandidateCard {
  id: string;
  /** Анонимное имя, стабильное для пары компания–кандидат */
  alias: string;
  category: Category | null;
  grade_confirmed: boolean;
  /**
     * @minimum 1
     * @maximum 99
     * @nullable
     */
  percentile: number | null;
  /**
     * Сила профиля (0–100 + бонус ФСП до 15)
     * @minimum 0
     * @maximum 115
     */
  strength: number;
  skills: CandidateSkill[];
  experience_years: number;
  experience: ExperienceItem[];
  industries: Industry[];
  work_formats: WorkFormat[];
  /**
     * `null`, если кандидат скрыл город
     * @nullable
     */
  city: string | null;
  relocation: boolean;
  salary_expectation: SalaryRange | null;
  availability: Availability;
  /** @nullable */
  last_active_at: string | null;
  /** `null` — кандидат скрыл данные ФСП; `has_history=false` — истории нет (нейтрально) */
  fsp: FspSummary | null;
  task_signal: CandidateCardTaskSignal;
  disclosure: Disclosure;
  contacts: CandidateContacts | null;
  relation: CandidateRelation;
}
