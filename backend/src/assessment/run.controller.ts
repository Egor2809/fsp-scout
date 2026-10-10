import { Body, Controller, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { Database } from '../database/database.service.js';
import { Problem } from '../common/problem.js';
import { parse } from '../common/validation.js';
import { RunTestCodeBody } from '../contract/schemas.js';
import type { TestItem } from '../contract/model/index.js';
import { JudgeError, runOpenTests } from './piston.js';
import type { SessionPolicy } from './session-state.js';

@Controller('tests')
@UseGuards(AuthGuard)
export class AssessmentRunController {
  constructor(private readonly db: Database) {}
  @Post(':id/run') @HttpCode(200)
  async run(@Req() req: { identity: Identity }, @Param('id') id: string, @Body() body: unknown) {
    if (req.identity.role !== 'candidate') throw new Problem(403, 'forbidden', 'Доступно кандидату');
    parse(z.uuid(), id);
    const data = parse(RunTestCodeBody, body);
    const c = await this.db.candidate.findFirst({ where: { user: { subject: req.identity.sub } }, select: { id: true } });
    if (!c) throw new Problem(404, 'not_found', 'Профиль не найден');
    const prepared = await this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${c.id}::uuid FOR UPDATE`;
      if (!await tx.testSession.findFirst({ where: { id, candidateId: c.id }, select: { id: true } })) throw new Problem(404, 'not_found', 'Тест не найден');
      await tx.$queryRaw`SELECT id FROM "TestSession" WHERE id = ${id}::uuid FOR UPDATE`;
      const test = await tx.testSession.findUniqueOrThrow({ where: { id }, include: { items: true } });
      const now = new Date();
      if (test.status === 'in_progress' && test.deadlineAt <= now) {
        await tx.testSession.update({ where: { id }, data: { status: 'expired', finishedAt: now } });
        return null;
      }
      if (test.status !== 'in_progress') throw new Problem(409, 'test_not_active', 'Тест не активен');
      if (!await tx.consent.findFirst({ where: { candidateId: c.id, type: 'personal_data', revokedAt: null } })) throw new Problem(403, 'consent_required', 'Нужно согласие', { consent_types: ['personal_data'] });
      const item = test.items.find(i => i.id === data.instance_id);
      if (!item) throw new Problem(404, 'not_found', 'Задание не найдено');
      const publicItem = item.publicItem as unknown as TestItem;
      if (item.answeredAt || publicItem.type !== 'code' || publicItem.answer_language !== data.language || !publicItem.public_tests?.length)
        throw new Problem(409, 'conflict', 'Запуск доступен для текущего кодового задания с открытыми тестами');
      if (!['python', 'go', 'javascript'].includes(data.language)) throw new Problem(409, 'conflict', 'Исполнитель этого языка не подключён');
      const url = process.env.PISTON_EXECUTE_URL;
      const policy = test.policy as unknown as SessionPolicy;
      const version = policy.practiceLanguage === data.language ? policy.practiceRuntimeVersion : undefined;
      if (!url || !version) throw new Problem(409, 'conflict', 'Песочница не настроена');
      const attempts = await tx.audit.count({ where: { actorSubject: req.identity.sub, action: 'assessment.code_run', resourceId: id } });
      const recent = await tx.audit.count({ where: { actorSubject: req.identity.sub, action: 'assessment.code_run', resourceId: id, at: { gte: new Date(now.getTime() - 60000) } } });
      if (attempts >= 20 || recent >= 3) throw new Problem(429, 'rate_limited', 'Лимит запусков: 3 в минуту и 20 на тест');
      await tx.audit.create({ data: { actorSubject: req.identity.sub, action: 'assessment.code_run', resourceId: id,
        metadata: { instance_id: item.id, language: data.language }, at: now } });
      return { tests: publicItem.public_tests, deadlineAt: test.deadlineAt, url, version };
    });
    if (!prepared) throw new Problem(409, 'test_not_active', 'Срок теста истёк');
    try {
      const result = await runOpenTests({ code: data.code, language: data.language, tests: prepared.tests, deadlineAt: prepared.deadlineAt }, prepared);
      const active = await this.db.testSession.findFirst({ where: { id, candidateId: c.id, status: 'in_progress', deadlineAt: { gt: new Date() } }, select: { id: true } });
      if (!active) throw new Problem(409, 'test_not_active', 'Тест больше не активен');
      return result;
    } catch (error) {
      if (error instanceof Problem) throw error;
      if (error instanceof JudgeError && error.reason === 'busy') throw new Problem(429, 'rate_limited', 'Песочница занята');
      if (error instanceof JudgeError && error.reason === 'configuration') throw new Problem(409, 'conflict', 'Настройки задания или песочницы не поддерживаются');
      throw new Problem(500, 'internal_error', 'Песочница недоступна');
    }
  }
}
