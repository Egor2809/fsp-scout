/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { TestResultFlagsItemCode } from './testResultFlagsItemCode';
import type { TestResultFlagsItemSeverity } from './testResultFlagsItemSeverity';

export type TestResultFlagsItem = {
  code: TestResultFlagsItemCode;
  severity: TestResultFlagsItemSeverity;
  message: string;
};
