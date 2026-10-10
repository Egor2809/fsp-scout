import type { ZodType } from 'zod';
import { Problem } from './problem.js';
import { MAX_OFFER_SPREAD, offerSpreadOk } from './invitation-state.js';

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

export function checkOfferSalary(salary: { from: number; to: number }, pointer: string): void {
  checkSalary(salary, pointer);
  if (!offerSpreadOk(salary)) throw new Problem(422, 'salary_range_invalid', 'Вилка слишком широкая', {
    errors: [{ pointer: `${pointer}/to`, detail: `Верхняя граница не больше чем в ${MAX_OFFER_SPREAD} раза выше нижней` }],
  });
}
export function checkSalary(salary: { from: number; to: number }, pointer: string): void {
  if (salary.from > salary.to) throw new Problem(422, 'salary_range_invalid', 'Некорректная вилка', {
    errors: [{ pointer: `${pointer}/to`, detail: 'Верхняя граница должна быть не меньше нижней' }],
  });
}
