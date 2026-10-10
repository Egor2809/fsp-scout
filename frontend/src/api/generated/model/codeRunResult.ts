/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CodeRunResultCasesItem } from './codeRunResultCasesItem';
import type { CodeRunResultStatus } from './codeRunResultStatus';

export interface CodeRunResult {
  status: CodeRunResultStatus;
  /** @minimum 0 */
  passed: number;
  /** @minimum 0 */
  total: number;
  /** @minimum 0 */
  duration_ms: number;
  cases: CodeRunResultCasesItem[];
}
