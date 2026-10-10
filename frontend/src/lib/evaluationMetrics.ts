/** Independent relevance labels: zero means irrelevant, four means fully relevant. */
export function evaluationMetrics(rankedIds: string[], candidateIds: string[], input: unknown, k = 10) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Разметка должна быть JSON-объектом id: оценка 0–4.')
  const labels = input as Record<string, unknown>
  if (new Set(candidateIds).size !== candidateIds.length || !Number.isInteger(k) || k < 1) throw new Error('Некорректные кандидаты или k.')
  if (Object.keys(labels).length !== candidateIds.length || candidateIds.some(id => !Object.hasOwn(labels, id))) {
    throw new Error('Разметьте каждого кандидата и удалите ID, отсутствующие в резюме.')
  }
  const values = Object.values(labels)
  if (values.some(v => typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > 4)) throw new Error('Оценки релевантности — целые числа от 0 до 4.')
  if (new Set(rankedIds).size !== rankedIds.length || rankedIds.some(id => !candidateIds.includes(id))) throw new Error('API вернул некорректные ID кандидатов.')
  const value = (id: string) => labels[id] as number
  const dcg = (xs: number[]) => xs.reduce((sum, v, i) => sum + (2 ** v - 1) / Math.log2(i + 2), 0)
  const top = rankedIds.slice(0, k)
  const ideal = dcg((values as number[]).slice().sort((a, b) => b - a).slice(0, k))
  const relevant = (values as number[]).filter(v => v > 0).length
  const first = top.findIndex(id => value(id) > 0)
  return { ndcg: ideal ? dcg(top.map(value)) / ideal : 0, recall: relevant ? top.filter(id => value(id) > 0).length / relevant : 0,
    reciprocalRank: first < 0 ? 0 : 1 / (first + 1), relevantCount: relevant }
}
