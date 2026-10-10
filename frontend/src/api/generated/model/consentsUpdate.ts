/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ConsentsUpdateItemsItem } from './consentsUpdateItemsItem';

export interface ConsentsUpdate {
  /**
     * @minItems 1
     * @maxItems 3
     */
  items: ConsentsUpdateItemsItem[];
}
