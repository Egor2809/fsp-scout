import { Controller, Get, Header } from '@nestjs/common';
import { taxonomy, SKILL_BY_ID } from '../common/taxonomy-data.ts';

export const skills = SKILL_BY_ID;

@Controller('taxonomy')
export class TaxonomyController {
  @Get()
  @Header('Cache-Control', 'public, max-age=3600')
  get() { return taxonomy; }
}
