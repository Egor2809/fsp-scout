export interface ItemParameters { a: number; b: number }
export interface ItemResponse extends ItemParameters { correct: boolean }

function validate(item: ItemParameters): void {
  if (!Number.isFinite(item.a) || item.a <= 0 || !Number.isFinite(item.b)) throw new RangeError('Invalid IRT parameters');
}
export function probability(theta: number, item: ItemParameters): number {
  validate(item);
  if (!Number.isFinite(theta)) throw new RangeError('Invalid theta');
  const x = item.a * (theta - item.b);
  return x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x));
}
export function information(theta: number, item: ItemParameters): number {
  const p = probability(theta, item);
  return item.a ** 2 * p * (1 - p);
}
function softplus(x: number): number { return Math.max(0, x) + Math.log1p(Math.exp(-Math.abs(x))); }

/** Discrete EAP with a N(0,1) prior; log-space likelihood avoids underflow. */
export function estimate(responses: readonly ItemResponse[]) {
  for (const response of responses) validate(response);
  const grid = Array.from({ length: 401 }, (_, i) => -5 + i * 0.025);
  const logs = grid.map(theta => responses.reduce((sum, r) => {
    const x = r.a * (theta - r.b);
    return sum - softplus(r.correct ? -x : x);
  }, -(theta ** 2) / 2));
  const peak = Math.max(...logs);
  const weights = logs.map(x => Math.exp(x - peak));
  const total = weights.reduce((a, b) => a + b, 0);
  const posterior = weights.map(x => x / total);
  const theta = grid.reduce((sum, x, i) => sum + x * posterior[i]!, 0);
  const variance = grid.reduce((sum, x, i) => sum + (x - theta) ** 2 * posterior[i]!, 0);
  return { theta, se: Math.sqrt(variance), probabilityAbove: (cut: number) => {
    if (!Number.isFinite(cut)) throw new RangeError('Invalid grade cut');
    return grid.reduce((sum, x, i) => sum + (x >= cut ? posterior[i]! : 0), 0);
  } };
}
