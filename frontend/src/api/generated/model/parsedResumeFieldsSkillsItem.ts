/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */

export type ParsedResumeFieldsSkillsItem = {
  /** Как написано в резюме */
  raw: string;
  /**
     * Нормализованный навык из справочника (через синонимы), `null` — не распознан
     * @nullable
     */
  skill_id: string | null;
  name: string;
};
