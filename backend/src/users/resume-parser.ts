import type { ParsedResumeFields } from '../contract/model/index.js';
import { parseNeed } from '../needs/need-parser.ts';

/** Conservative extraction: unknown fields stay null/empty for candidate confirmation. */
export function parseResumeText(text: string): { fields: ParsedResumeFields; confidence: Record<string, number>; warnings: string[] } {
  const normalized = text.normalize('NFKC');
  const email = normalized.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0] ?? null;
  const phone = normalized.match(/(?:\+7|8)[ (.-]*\d{3}[ ).-]*\d{3}[ .-]*\d{2}[ .-]*\d{2}(?!\d)/)?.[0] ?? null;
  const telegram = normalized.match(/(?:t\.me\/|telegram\s*[:：]?\s*@?)([a-z][a-z0-9_]{4,31})\b/i)?.[1] ?? null;
  const parsed = parseNeed(normalized);
  const skills = [...parsed.must_skills, ...parsed.nice_skills].map(s => ({ raw: s.name, name: s.name, skill_id: s.id }));
  const fields: ParsedResumeFields = { full_name: null, email, phone, telegram: telegram ? `@${telegram}` : null,
    city: parsed.city, experience_years: null, roles: [], skills, soft_skills: [], experience: [], about: null };
  const confidence: Record<string, number> = {};
  if (email) confidence.email = 0.8;
  if (phone) confidence.phone = 0.7;
  if (telegram) confidence.telegram = 0.7;
  if (parsed.city) confidence.city = 0.4;
  if (skills.length) confidence.skills = 0.6;
  return { fields, confidence, warnings: [
    'Распознавание по правилам; значения уверенности эвристические, не откалиброванные вероятности.',
    'Имя, должности и история работы требуют ручного заполнения. Упоминание навыка не подтверждает владение им.',
    ...(!normalized.trim() ? ['В PDF нет текстового слоя. Для сканированного резюме требуется OCR.'] : []),
  ] };
}
