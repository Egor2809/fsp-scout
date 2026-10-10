/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Specialization } from './specialization.js';

export interface Skill {
  id: string;
  name: string;
  specializations: Specialization[];
  competency_id: string;
  aliases: string[];
}
