import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { Problem } from '../common/problem.js';
import { FAMILIES, buildFamily } from './showcase.js';

@Controller('assessment/families')
@UseGuards(AuthGuard)
export class ShowcaseController {
  @Get()
  list() {
    return FAMILIES.map(({ id, title, specialization, competency, type, a, b }) => ({ id, title, specialization, competency, type, a, b }));
  }
  @Get(':id')
  get(@Param('id') id: string) {
    const family = FAMILIES.find(f => f.id === id);
    if (!family) throw new Problem(404, 'not_found', 'Витринное семейство не найдено');
    return buildFamily(family);
  }
}
