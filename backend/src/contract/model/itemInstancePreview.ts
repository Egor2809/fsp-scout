/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CodeSnippet } from './codeSnippet.js';
import type { ItemInstancePreviewOptions } from './itemInstancePreviewOptions.js';
import type { ItemInstancePreviewParams } from './itemInstancePreviewParams.js';

export interface ItemInstancePreview {
  seed: number;
  params: ItemInstancePreviewParams;
  title: string;
  prompt: string;
  code: CodeSnippet | null;
  options: ItemInstancePreviewOptions;
  /** Только для витрины — вычислен из параметров */
  correct_answer: string;
}
