import { z } from 'zod';
import { parse } from './validation.js';

const paging = z.object({ page: z.coerce.number().int().min(1).default(1), page_size: z.coerce.number().int().min(1).max(100).default(20) });
export function pagination(query: Record<string, unknown>) { return parse(paging, query); }
export function page<T>(items: T[], query: { page: number; page_size: number }) {
  return { items: items.slice((query.page - 1) * query.page_size, query.page * query.page_size), total: items.length, page: query.page, page_size: query.page_size };
}
export const strings = (value: unknown): string[] => value === undefined ? [] : Array.isArray(value) ? value.map(String) : [String(value)];
