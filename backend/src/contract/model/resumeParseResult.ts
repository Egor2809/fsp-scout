/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { ParsedResumeFields } from './parsedResumeFields.js';
import type { ResumeParseResultConfidence } from './resumeParseResultConfidence.js';

export interface ResumeParseResult {
  resume_id: string;
  file_name: string;
  uploaded_at: string;
  fields: ParsedResumeFields;
  /** Уверенность распознавания по полям (ключ — имя поля из `fields`), 0–1 */
  confidence: ResumeParseResultConfidence;
  warnings: string[];
}
