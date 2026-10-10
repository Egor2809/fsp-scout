import { Body, Controller, Post, HttpCode, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { EvalRankBody } from '../contract/schemas.js';
import { Problem } from '../common/problem.js';
import { parse, checkSalary } from '../common/validation.js';
import { rankExternal, rankCsv } from './rank.js';

@Controller('eval')
@UseGuards(AuthGuard)
export class EvaluationController {
  @Post('rank') @HttpCode(200)
  rank(@Req() req: { identity: Identity; headers: { accept?: string } }, @Body() body: unknown,
    @Res({ passthrough: true }) response: { setHeader: (name: string, value: string) => void }) {
    if (!['employer', 'admin'].includes(req.identity.role)) throw new Problem(403, 'forbidden', 'Доступ запрещён');
    const input = parse(EvalRankBody, body);
    if (new Set(input.vacancies.map(v => v.id)).size !== input.vacancies.length || new Set(input.candidates.map(c => c.id)).size !== input.candidates.length) throw new Problem(422, 'validation_error', 'Идентификаторы должны быть уникальными', { errors: [{ pointer: '/candidates', detail: 'Повторяющийся ID' }] });
    input.vacancies.forEach((v, i) => { if (v.salary) checkSalary(v.salary, `/vacancies/${i}/salary`); });
    const result = rankExternal(input);
    if (req.headers.accept?.toLowerCase().split(',').some(s => s.trim().split(';')[0] === 'text/csv' && !/;\s*q=0(?:\.0*)?\s*$/.test(s))) {
      response.setHeader('Content-Type', 'text/csv; charset=utf-8');
      response.setHeader('Content-Disposition', 'attachment; filename="ranking.csv"');
      return rankCsv(result);
    }
    return result;
  }
}
