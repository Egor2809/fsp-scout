/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ItemFamilyBrief } from './itemFamilyBrief';
import type { ItemFamilyParamsItem } from './itemFamilyParamsItem';
import type { ItemInstancePreview } from './itemInstancePreview';

export type ItemFamily = ItemFamilyBrief & {
  description: string;
  /** Шаблон с плейсхолдерами `{{param}}` */
  template: string;
  params: ItemFamilyParamsItem[];
  /** @minItems 1 */
  instances: ItemInstancePreview[];
  /**
     * Доля сессий, где встречалось семейство (цель ≤ 0.2)
     * @minimum 0
     * @maximum 1
     */
  exposure_rate: number;
  /** Размер выборки калибровки */
  calibration_n: number;
};
