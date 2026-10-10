export const TASK_COOLDOWN_MS = 14 * 86_400_000;
export const FRESH_SIGNAL_MS = 30 * 86_400_000;
export const SOLVED_THRESHOLD = 75;
export function taskEligible(lastAssignedAt: Date | null, now: Date): boolean {
  return !lastAssignedAt || now.getTime() - lastAssignedAt.getTime() >= TASK_COOLDOWN_MS;
}
export function validateRubric(rubric: readonly { criterion: string; weight: number }[]): boolean {
  return rubric.length > 0 && rubric.every(r => r.criterion.trim().length >= 3 && Number.isFinite(r.weight) && r.weight >= 0 && r.weight <= 1)
    && new Set(rubric.map(r => r.criterion.trim().toLocaleLowerCase('ru'))).size === rubric.length
    && Math.abs(rubric.reduce((sum, r) => sum + r.weight, 0) - 1) < 1e-6;
}
export function taskSignal(submissions: readonly { finalScore: number | null; submittedAt: Date }[], now: Date) {
  const solved = submissions.filter(s => s.finalScore !== null && s.finalScore >= SOLVED_THRESHOLD).sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  const last = solved[0]?.submittedAt ?? null;
  return { fresh: Boolean(last && now >= last && now.getTime() - last.getTime() < FRESH_SIGNAL_MS), solved_count: solved.length, last_solved_at: last?.toISOString() ?? null };
}
