/**
 * Сгенерировано orval из contracts/openapi.yaml (Скаут API 0.1.0). Не редактировать вручную.
 */
import type { Consent } from './consent.js';
import type { ConsentDocument } from './consentDocument.js';

export interface ConsentState {
  documents: ConsentDocument[];
  /** Последняя запись по каждому типу */
  consents: Consent[];
}
