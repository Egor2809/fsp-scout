/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { TestResultFlagsItemCode } from './testResultFlagsItemCode.js';
import type { TestResultFlagsItemSeverity } from './testResultFlagsItemSeverity.js';

export type TestResultFlagsItem = {
  code: TestResultFlagsItemCode;
  severity: TestResultFlagsItemSeverity;
  message: string;
};
