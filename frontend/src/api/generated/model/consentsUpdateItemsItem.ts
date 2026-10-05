/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ConsentType } from './consentType';

export type ConsentsUpdateItemsItem = {
  type: ConsentType;
  version: string;
  given: boolean;
};
