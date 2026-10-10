/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { IntegrityFlagCode } from './integrityFlagCode.js';
import type { IntegrityFlagSeverity } from './integrityFlagSeverity.js';

/**
 * Сигнал прокторинга подтверждающего теста; не доказывает нарушение
 */
export interface IntegrityFlag {
  code: IntegrityFlagCode;
  severity: IntegrityFlagSeverity;
}
