/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { CodeLanguage } from './codeLanguage.js';
import type { CodeSnippet } from './codeSnippet.js';
import type { ItemType } from './itemType.js';
import type { TestBlock } from './testBlock.js';
import type { TestItemCompetency } from './testItemCompetency.js';
import type { TestItemOptions } from './testItemOptions.js';
import type { TestItemPublicTests } from './testItemPublicTests.js';

/**
 * Экземпляр задания. Семейство, параметры и правильный ответ не раскрываются.
 */
export interface TestItem {
  instance_id: string;
  /**
     * Порядковый номер в сессии
     * @minimum 1
     */
  index: number;
  block: TestBlock;
  type: ItemType;
  competency: TestItemCompetency;
  /**
     * Сложность задания (квантиль параметра b), показывается кандидату
     * @minimum 1
     * @maximum 5
     */
  difficulty_level: number;
  title: string;
  /** Текст задания (простая разметка — абзацы через пустую строку, `код` в обратных кавычках) */
  prompt: string;
  /** Фрагмент кода для чтения */
  code: CodeSnippet | null;
  /** Для single_choice и multiple_choice */
  options: TestItemOptions;
  /** Язык ответа для type=code */
  answer_language: CodeLanguage | null;
  /** @nullable */
  starter_code: string | null;
  /**
     * Лимит символов для short_answer и open_text
     * @nullable
     */
  max_length: number | null;
  /** Открытые тесты практического задания */
  public_tests: TestItemPublicTests;
}
