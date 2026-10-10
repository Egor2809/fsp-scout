import type { IntegrityFlag, TestResultFlagsItem } from '../contract/model/index.js';
import { fitTimingModel, type TimingModel } from './telemetry-flags.ts';

export interface CanaryResponse {
  familyId: string;
  ordinal: number;
  canary: boolean;
  correct: boolean | null;
  serverElapsedMs: number;
}

export interface TimingObservation {
  id: string;
  candidateId: string;
  familyId: string;
  templateVersion: number;
  bankVersion: string;
  specialization: string;
  declaredGrade: string;
  express: boolean;
  correct: boolean | null;
  issuedAt: Date;
  answeredAt: Date | null;
  finishedAt: Date | null;
}

export interface TimingScope {
  candidateId: string;
  bankVersion: string;
  specialization: string;
  declaredGrade: string;
  express: boolean;
  at: Date;
  families: readonly { familyId: string; templateVersion: number }[];
}

export function canaryTimingModels(observations: readonly TimingObservation[], scope: TimingScope): TimingModel[] {
  if (!Number.isFinite(scope.at.getTime())) throw new RangeError('Invalid timing scope');
  const families = new Map(scope.families.map(f => [f.familyId, f.templateVersion]));
  const groups = new Map<string, number[]>(), seen = new Set<string>();
  const sorted = [...observations].sort((a, b) => (b.answeredAt?.getTime() ?? 0) - (a.answeredAt?.getTime() ?? 0) || a.id.localeCompare(b.id));
  for (const item of sorted) {
    if (!item.candidateId || item.candidateId === scope.candidateId || item.correct !== true
      || item.bankVersion !== scope.bankVersion || item.specialization !== scope.specialization
      || item.declaredGrade !== scope.declaredGrade || item.express !== scope.express
      || families.get(item.familyId) !== item.templateVersion || !item.answeredAt || !item.finishedAt) continue;
    const elapsed = item.answeredAt.getTime() - item.issuedAt.getTime();
    if (!Number.isFinite(elapsed) || elapsed <= 0 || !Number.isFinite(item.finishedAt.getTime())
      || item.answeredAt > item.finishedAt || item.finishedAt > scope.at) continue;
    const key = JSON.stringify([item.familyId, item.candidateId]);
    if (seen.has(key)) continue;
    seen.add(key);
    const samples = groups.get(item.familyId) ?? [];
    if (samples.length < 200) samples.push(elapsed);
    groups.set(item.familyId, samples);
  }
  return [...groups].flatMap(([id, samples]) => {
    const model = fitTimingModel(id, samples);
    return model ? [model] : [];
  });
}

export function canaryFlags(responses: readonly CanaryResponse[], models: readonly TimingModel[]): TestResultFlagsItem[] {
  const byFamily = new Map<string, TimingModel>();
  for (const model of models) {
    if (byFamily.has(model.familyId) || !model.familyId || !Number.isInteger(model.sampleSize) || model.sampleSize < 30
      || !Number.isFinite(model.logMean) || !Number.isFinite(model.logSd) || model.logSd < 0.05) throw new RangeError('Invalid timing model');
    byFamily.set(model.familyId, model);
  }
  const ordered = [...responses].sort((a, b) => a.ordinal - b.ordinal);
  const families = new Set<string>(), ordinals = new Set<number>();
  for (const item of ordered) {
    if (!item.familyId || families.has(item.familyId) || ordinals.has(item.ordinal) || !Number.isSafeInteger(item.ordinal) || item.ordinal < 1
      || !Number.isFinite(item.serverElapsedMs) || item.serverElapsedMs < 0) throw new RangeError('Invalid canary telemetry');
    families.add(item.familyId); ordinals.add(item.ordinal);
  }
  const suspicious = ordered.some((item, index) => {
    const before = ordered[index - 1], after = ordered[index + 1], model = byFamily.get(item.familyId);
    return item.canary && item.correct === true && item.serverElapsedMs > 0 && model
      && (Math.log(item.serverElapsedMs) - model.logMean) / model.logSd < -2.5
      && before && after && before.ordinal === item.ordinal - 1 && after.ordinal === item.ordinal + 1
      && !before.canary && !after.canary && before.correct === false && after.correct === false
      && before.serverElapsedMs > 0 && after.serverElapsedMs > 0;
  });
  return suspicious ? [{ code: 'leak_suspected', severity: 'warning',
    message: 'Необычное сочетание скорости и правильности ответов. Возможен доступ к ключам; требуется проверка. Это не доказательство нарушения.' }] : [];
}

export function canaryStandingFlags(previous: readonly IntegrityFlag[], flags: readonly TestResultFlagsItem[]): IntegrityFlag[] {
  const warning = flags.find(f => f.code === 'leak_suspected' && f.severity === 'warning');
  return warning ? [...previous.filter(f => f.code !== warning.code), { code: warning.code, severity: warning.severity }]
    : previous.map(f => ({ ...f }));
}
