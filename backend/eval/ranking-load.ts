import { rankExternal } from '../src/evaluation/rank.ts';

// Synthetic size check, not evidence of ranking quality or HTTP capacity.
const input = {
  vacancies: Array.from({ length: 100 }, (_, i) => ({ id: `v${i}`, text: `Backend Python PostgreSQL Redis опыт ${i}` })),
  candidates: Array.from({ length: 2000 }, (_, i) => ({ id: `c${i}`, text: `Python PostgreSQL опыт разработки API уникальный${i}` })),
  top_k: 10,
};
const start = performance.now();
const result = rankExternal(input);
console.log(JSON.stringify({ vacancies: result.results.length, candidates: input.candidates.length,
  ranked: result.results.reduce((sum, row) => sum + row.ranking.length, 0), elapsed_ms: Math.round(performance.now() - start),
  heap_mb: Math.round(process.memoryUsage().heapUsed / 1048576) }));
