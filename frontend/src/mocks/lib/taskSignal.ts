interface SubmissionSignal { id: string; candidateId: string; finalScore: number | null; submittedAt: string }

/** Recompute from current reviews; re-reviewing a solution must not increment a counter. */
export function recomputeTaskSignal(submissions: readonly SubmissionSignal[], candidateId: string, now: Date) {
  const unique = new Map(submissions.filter(s => s.candidateId === candidateId).map(s => [s.id, s]))
  const solved = [...unique.values()].filter(s => s.finalScore !== null && s.finalScore >= 75)
    .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt))
  const lastSolvedAt = solved[0]?.submittedAt ?? null
  const age = lastSolvedAt ? now.getTime() - Date.parse(lastSolvedAt) : Infinity
  return { fresh: age >= 0 && age < 30 * 86400000, solvedCount: solved.length, lastSolvedAt }
}
