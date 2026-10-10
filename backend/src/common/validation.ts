import type { ZodType } from 'zod';
import { Problem } from './problem.js';

export function parse<T>(schema: ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (result.success) return result.data;
  throw new Problem(422, 'validation_error', 'Проверьте поля', {
    errors: result.error.issues.map(issue => ({
      pointer: '/' + issue.path.map(x => String(x).replaceAll('~', '~0').replaceAll('/', '~1')).join('/'),
      detail: issue.message,
    })),
  });
}

export function checkSalary(salary: { from: number; to: number }, pointer: string): void {
  if (salary.from > salary.to) throw new Problem(422, 'salary_range_invalid', 'Некорректная вилка', {
    errors: [{ pointer: `${pointer}/to`, detail: 'Верхняя граница должна быть не меньше нижней' }],
  });
}
