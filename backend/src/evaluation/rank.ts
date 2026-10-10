import type { EvalRankRequest, EvalRankResponse, ExplanationFactor, Grade } from '../contract/model/index.js';
import { parseNeed } from '../needs/need-parser.ts';
const round = (n: number) => Math.round(n * 100) / 100;
const grades: Grade[] = ['junior', 'middle', 'senior', 'lead'];
const GRADE_WEIGHT = 25;
const LEXICAL_WEIGHT = 25;
const stop = new Set('и в на с по для из от до не или но как что это the a an and or of for to in with is'.split(' '));
function resumeText(text: string): string {
  try {
    const value = JSON.parse(text);
    if (!value || typeof value !== 'object' || Array.isArray(value)) return text;
    // JSON Resume contact/name/address/link fields do not participate in matching.
    const result: string[] = [];
    const add = (v: unknown) => { if (typeof v === 'string') result.push(v); };
    add(value.basics?.summary); add(value.basics?.label);
    for (const key of ['work', 'projects', 'skills', 'education', 'certificates']) {
      if (!Array.isArray(value[key])) continue;
      for (const row of value[key]) {
        if (!row || typeof row !== 'object') continue;
        for (const field of ['position', 'summary', 'description', 'area', 'studyType']) add(row[field]);
        if (key === 'skills' || key === 'certificates') add(row.name);
        for (const field of ['keywords', 'highlights']) if (Array.isArray(row[field])) row[field].forEach(add);
      }
    }
    return result.join('\n');
  } catch { return text; }
}
function terms(text: string): Map<string, number> {
  const result = new Map<string, number>();
  for (const word of text.toLocaleLowerCase('ru').match(/[\p{L}\p{N}][\p{L}\p{N}_+#.-]*/gu) ?? []) {
    if (word.length < 2 || word.length > 64 || stop.has(word)) continue;
    result.set(word, (result.get(word) ?? 0) + 1);
  }
  return result;
}
/** External resumes have no trusted test/FSP signals. This ranks textual fit only. */
export function rankExternal(input: EvalRankRequest): EvalRankResponse {
  const candidates = input.candidates.map(c => {
    const text = resumeText(c.text), parsed = parseNeed(text), words = terms(text);
    return { ...c, parsed, words, length: [...words.values()].reduce((a, b) => a + b, 0), skills: new Set([...parsed.must_skills, ...parsed.nice_skills].map(s => s.id)) };
  });
  const df = new Map<string, number>();
  const postings = new Map<string, { index: number; tf: number }[]>();
  candidates.forEach((c, index) => {
    for (const [word, tf] of c.words) {
      df.set(word, (df.get(word) ?? 0) + 1);
      const list = postings.get(word) ?? [];
      list.push({ index, tf });
      postings.set(word, list);
    }
  });
  const averageLength = Math.max(1, candidates.reduce((sum, c) => sum + c.length, 0) / candidates.length);
  return { results: input.vacancies.map(v => {
    const wanted = parseNeed(v.text), query = [...terms(v.text).keys()];
    const weightedSkills = new Map(wanted.must_skills.map(s => [s.id, 2]));
    for (const s of wanted.nice_skills) if (!weightedSkills.has(s.id)) weightedSkills.set(s.id, 1);
    const weights = [...weightedSkills.values()].reduce((a, b) => a + b, 0);
    const idfs = query.map(word => ({ word, idf: Math.log(1 + (candidates.length - (df.get(word) ?? 0) + 0.5) / ((df.get(word) ?? 0) + 0.5)) }));
    const maxLexical = idfs.reduce((sum, t) => sum + t.idf * 2.2, 0);
    const lexicalScores = new Float64Array(candidates.length);
    for (const { word, idf } of idfs) for (const { index, tf } of postings.get(word) ?? []) {
      lexicalScores[index] += idf * tf * 2.2 / (tf + 1.2 * (0.25 + 0.75 * candidates[index]!.length / averageLength));
    }
    const ranking = candidates.map((c, index) => {
      const coverage = weights ? [...weightedSkills].reduce((sum, [id, weight]) => sum + (c.skills.has(id) ? weight : 0), 0) / weights : 0;
      const bm25 = lexicalScores[index]!;
      const lexical = maxLexical ? bm25 / maxLexical : 0;
      const offered = v.salary ?? wanted.salary;
      const salary = !offered || !c.parsed.salary ? 0.5 : offered.from <= c.parsed.salary.to && c.parsed.salary.from <= offered.to ? 1 : 0;
      const format = !wanted.work_formats.length || !c.parsed.work_formats.length ? 0.5 : wanted.work_formats.some(f => c.parsed.work_formats.includes(f)) ? 1 : 0;
      const industry = !wanted.industry || !c.parsed.industry ? 0.5 : wanted.industry === c.parsed.industry ? 1 : 0;
      const declared = c.grade ?? c.parsed.grade;
      const gap = wanted.grade && declared ? grades.indexOf(declared) - grades.indexOf(wanted.grade) : null;
      const grade = gap === null ? 0.5 : gap >= 0 ? 1 - 0.15 * gap : gap === -1 ? 0.35 : 0;
      const factors: ExplanationFactor[] = [
        { kind: 'skills_coverage', label: 'Покрытие требований резюме', contribution: round((87.5 - LEXICAL_WEIGHT - GRADE_WEIGHT) * coverage), polarity: coverage >= 0.7 ? 'positive' : 'neutral', evidence: `${[...weightedSkills.keys()].filter(id => c.skills.has(id)).length} из ${weightedSkills.size} навыков; обязательные имеют вес 2` },
        { kind: 'semantic', label: 'Лексическая релевантность', contribution: round(LEXICAL_WEIGHT * lexical), polarity: lexical > 0 ? 'positive' : 'neutral', evidence: 'Нормированный BM25, без эмбеддингов' },
        { kind: 'conditions', label: 'Формат и зарплата', contribution: round(5 * (salary + format)), polarity: salary === 0 || format === 0 ? 'negative' : 'neutral', evidence: 'Неизвестные условия нейтральны; используются только явно извлечённые данные' },
        { kind: 'industry', label: 'Отрасль', contribution: round(2.5 * industry), polarity: industry === 1 ? 'positive' : 'neutral', evidence: 'Из текста, без подтверждения' },
        { kind: 'conditions', label: 'Заявленный грейд', contribution: round(GRADE_WEIGHT * grade), polarity: grade === 0 ? 'negative' : grade === 1 ? 'positive' : 'neutral', evidence: 'Заявлен в резюме, не является подтверждённой категорией платформы; на грейд ниже — сильный штраф, переквалификация — слабый' },
      ];
      return { candidate_id: c.id, score: round(factors.reduce((sum, f) => sum + f.contribution, 0)), factors };
    }).sort((a, b) => b.score - a.score || a.candidate_id.localeCompare(b.candidate_id)).slice(0, input.top_k ?? 10);
    return { vacancy_id: v.id, ranking };
  }) };
}
export function rankCsv(response: EvalRankResponse): string {
  const cell = (value: string) => {
    const safe = /^[\s\u0000-\u001f]*[=+@-]/u.test(value) ? `'${value}` : value;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  return ['vacancy_id,rank,candidate_id,score,factors', ...response.results.flatMap(r => r.ranking.map((c, i) =>
    [cell(r.vacancy_id), String(i + 1), cell(c.candidate_id), String(c.score), cell(JSON.stringify(c.factors))].join(',')))].join('\r\n') + '\r\n';
}
