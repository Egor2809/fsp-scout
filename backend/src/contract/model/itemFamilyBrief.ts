/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ItemType } from './itemType.js';
import type { Specialization } from './specialization.js';

export interface ItemFamilyBrief {
  id: string;
  title: string;
  specialization: Specialization;
  competency: string;
  type: ItemType;
  /** Дискриминативность (2PL) */
  a: number;
  /** Сложность (2PL) */
  b: number;
}
