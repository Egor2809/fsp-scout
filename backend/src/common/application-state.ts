import type { ApplicationStatus } from '../contract/model/applicationStatus.js';
const employerMoves: Partial<Record<ApplicationStatus, readonly ApplicationStatus[]>> = {
  submitted: ['viewed', 'interview', 'rejected'], viewed: ['interview', 'rejected'],
  interview: ['offer', 'rejected'], offer: ['hired', 'rejected'],
};
export function applicationTransition(from: ApplicationStatus, to: ApplicationStatus, actor: 'candidate' | 'employer'): boolean {
  if (actor === 'candidate') return to === 'withdrawn' && ['submitted', 'viewed', 'interview', 'offer'].includes(from);
  return (employerMoves[from] ?? []).includes(to);
}
