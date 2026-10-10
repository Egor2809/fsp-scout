/** Relevance judgments must come from an independent labeled dataset. Missing labels are nonrelevant. */
export function rankingMetrics(rankedIds: readonly string[], judgments: Readonly<Record<string, number>>, k: number) {
  if (!Number.isInteger(k) || k < 1) throw new RangeError('k must be a positive integer');
  const labels = Object.values(judgments);
  if (labels.some(value => !Number.isFinite(value) || value < 0 || value > 4)) throw new RangeError('relevance must be between 0 and 4');
  if (new Set(rankedIds).size !== rankedIds.length) throw new Error('ranking contains duplicate candidates');
  const top = rankedIds.slice(0, k);
  const relevance = (id: string) => Object.hasOwn(judgments, id) ? judgments[id] : 0;
  const dcg = (values: readonly number[]) => values.reduce((sum, value, index) => sum + (2 ** value - 1) / Math.log2(index + 2), 0);
  const ideal = dcg([...labels].sort((a, b) => b - a).slice(0, k));
  const relevantCount = labels.filter(value => value > 0).length;
  const first = top.findIndex(id => relevance(id) > 0);
  return {
    ndcg: ideal ? dcg(top.map(relevance)) / ideal : 0,
    recall: relevantCount ? top.filter(id => relevance(id) > 0).length / relevantCount : 0,
    reciprocalRank: first < 0 ? 0 : 1 / (first + 1),
    relevantCount,
  };
}
