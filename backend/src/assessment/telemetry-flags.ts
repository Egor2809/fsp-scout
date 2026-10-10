import type { TestResultFlagsItem } from '../contract/model/index.js';

export interface TimingModel { familyId: string; sampleSize: number; logMean: number; logSd: number }
export interface TelemetryResponse {
  familyId: string; correct: boolean | null; difficulty: number;
  serverElapsedMs: number; pasteCount: number; focusLostCount: number;
}

/** Caller supplies independent, deduplicated, same-version observations in milliseconds. */
export function fitTimingModel(familyId: string, observations: readonly number[], minimumSize = 30): TimingModel | null {
  if (!familyId || !Number.isInteger(minimumSize) || minimumSize < 30 || observations.some(n => !Number.isFinite(n) || n <= 0))
    throw new RangeError('Invalid timing observations');
  if (observations.length < minimumSize) return null;
  const logs = observations.map(Math.log);
  const logMean = logs.reduce((sum, value) => sum + value, 0) / logs.length;
  const logSd = Math.sqrt(logs.reduce((sum, value) => sum + (value - logMean) ** 2, 0) / (logs.length - 1));
  if (logSd < 0.05) return null; // Degenerate samples cannot justify extremely strong anomaly claims.
  return { familyId, sampleSize: observations.length, logMean, logSd };
}

/** Signals for review only: no outcome/grade decisions are made from browser events. */
export function telemetryFlags(responses: readonly TelemetryResponse[], theta: number, models: readonly TimingModel[]): TestResultFlagsItem[] {
  if (!Number.isFinite(theta)) throw new RangeError('Invalid ability');
  const modelByFamily = new Map<string, TimingModel>();
  for (const model of models) {
    if (modelByFamily.has(model.familyId) || !model.familyId || !Number.isInteger(model.sampleSize) || model.sampleSize < 30
      || !Number.isFinite(model.logMean) || !Number.isFinite(model.logSd) || model.logSd < 0.05) throw new RangeError('Invalid timing model');
    modelByFamily.set(model.familyId, model);
  }
  let pastes = 0, focus = 0, fast = 0;
  const seen = new Set<string>();
  for (const response of responses) {
    if (!response.familyId || seen.has(response.familyId)) throw new RangeError('Duplicate or missing family telemetry');
    seen.add(response.familyId);
    if (!Number.isFinite(response.difficulty) || !Number.isFinite(response.serverElapsedMs) || response.serverElapsedMs < 0
      || ![response.pasteCount, response.focusLostCount].every(n => Number.isSafeInteger(n) && n >= 0)) throw new RangeError('Invalid telemetry');
    pastes += response.pasteCount; focus += response.focusLostCount;
    const model = modelByFamily.get(response.familyId);
    if (model && response.correct === true && response.difficulty >= theta && response.serverElapsedMs > 0
      && (Math.log(response.serverElapsedMs) - model.logMean) / model.logSd < -2.5) fast++;
  }
  const flags: TestResultFlagsItem[] = [];
  if (fast >= 2) flags.push({ code: 'fast_correct', severity: 'warning', message: `Быстрые верные ответы на ${fast} сложных заданиях относительно модели времени. Нужна проверка; это не доказательство нарушения.` });
  if (pastes) flags.push({ code: 'paste', severity: 'info', message: `Зарегистрированы вставки: ${pastes}. События браузера не доказывают нарушение.` });
  if (focus) flags.push({ code: 'focus_loss', severity: 'info', message: `Зарегистрированы потери фокуса: ${focus}. Причины могут быть техническими или связаны с доступностью.` });
  return flags;
}
