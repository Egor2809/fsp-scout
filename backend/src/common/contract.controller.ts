import { Controller, Get } from '@nestjs/common';
import contract from '../contract/openapi.json' with { type: 'json' };

@Controller()
export class ContractController {
  @Get('openapi.json')
  get() { return contract; }
}
