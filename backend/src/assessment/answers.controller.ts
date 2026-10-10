import { Body, Controller, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { Database } from '../database/database.service.js';
import { SubmitTestAnswerBody } from '../contract/schemas.js';
import type { Answer, TestItem } from '../contract/model/index.js';
import { Problem } from '../common/problem.js';
import { parse } from '../common/validation.js';
import { gradeAnswer, InvalidAnswer, type ExpectedAnswer } from './grading.js';
import { answerDisposition, canonicalAnswer, currentItem, progress, type IssuedItem, type SessionPolicy } from './session-state.js';
import { CODE_JOB_TOPIC } from './code-job.js';

@Controller('tests')
@UseGuards(AuthGuard)
export class AssessmentAnswersController {
  constructor(private readonly db: Database) {}
  @Post(':id/answers') @HttpCode(200)
  async answer(@Req() req: { identity: Identity }, @Param('id') id: string, @Body() body: unknown) {
    if (req.identity.role !== 'candidate') throw new Problem(403, 'forbidden', 'Доступно кандидату');
    parse(z.uuid(), id);
    const data = parse(SubmitTestAnswerBody, body);
    const c = await this.db.candidate.findFirst({ where: { user: { subject: req.identity.sub } }, select: { id: true } });
    if (!c) throw new Problem(404, 'not_found', 'Профиль не найден');
    const result = await this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${c.id}::uuid FOR UPDATE`;
      const owned = await tx.testSession.findFirst({ where: { id, candidateId: c.id }, select: { id: true } });
      if (!owned) throw new Problem(404, 'not_found', 'Тест не найден');
      await tx.$queryRaw`SELECT id FROM "TestSession" WHERE id = ${id}::uuid FOR UPDATE`;
      const session = await tx.testSession.findUniqueOrThrow({ where: { id }, include: { items: { orderBy: { ordinal: 'asc' } } } });
      const item = session.items.find(i => i.id === data.instance_id);
      if (!item) throw new Problem(404, 'not_found', 'Задание не найдено в тесте');
      const policy = session.policy as unknown as SessionPolicy;
      const disposition = answerDisposition(item as IssuedItem, currentItem(session.items as IssuedItem[]), item.answer !== null && canonicalAnswer(item.answer as unknown as Answer) === canonicalAnswer(data.answer));
      if (disposition === 'replay') return { accepted: true, progress: progress(session.items as IssuedItem[], policy) };
      if (disposition === 'conflict') throw new Problem(409, 'conflict', 'Ответ уже принят и не может быть заменён');
      if (disposition !== 'accept') throw new Problem(409, 'conflict', 'Отвечать можно только на текущее задание');
      const now = new Date();
      if (session.status === 'in_progress' && session.deadlineAt <= now) {
        await tx.testSession.update({ where: { id }, data: { status: 'expired', finishedAt: now } });
        return null; // Commit the deadline transition before reporting the conflict.
      }
      if (session.status !== 'in_progress') throw new Problem(409, 'test_not_active', 'Тест не активен');
      if (!await tx.consent.findFirst({ where: { candidateId: c.id, type: 'personal_data', revokedAt: null } })) throw new Problem(403, 'consent_required', 'Нужно согласие', { consent_types: ['personal_data'] });
      let graded;
      try { graded = gradeAnswer(item.publicItem as unknown as TestItem, item.expectedAnswer as unknown as ExpectedAnswer, data.answer); }
      catch (error) {
        if (error instanceof InvalidAnswer) throw new Problem(422, 'validation_error', 'Проверьте ответ', { errors: [{ pointer: error.pointer, detail: error.message }] });
        throw error;
      }
      if (graded.status === 'pending') {
        const expected = item.expectedAnswer as unknown as ExpectedAnswer;
        if (graded.reason !== 'sandbox' || expected.kind !== 'sandbox' || !expected.tests?.length || !policy.practiceRuntimeVersion || !process.env.PISTON_EXECUTE_URL)
          throw new Problem(409, 'conflict', 'Оценщик этого типа задания ещё не подключён');
      }
      const acceptedAt = new Date();
      if (session.deadlineAt <= acceptedAt) {
        await tx.testSession.update({ where: { id }, data: { status: 'expired', finishedAt: acceptedAt } });
        return null;
      }
      const saved = await tx.testItem.update({ where: { id: item.id }, data: { answer: data.answer as Prisma.InputJsonObject, correct: graded.status === 'pending' ? null : graded.correct, answeredAt: acceptedAt,
        telemetry: { client_rt_ms: data.rt_ms, server_elapsed_ms: Math.max(0, acceptedAt.getTime() - item.issuedAt.getTime()), paste_count: data.paste_count, focus_lost_count: data.focus_lost_count } } });
      if (graded.status === 'pending') await tx.outbox.create({ data: { topic: CODE_JOB_TOPIC,
        payload: { itemId: item.id, sessionId: id, candidateId: c.id } } });
      return { accepted: true, progress: progress(session.items.map(i => i.id === item.id ? saved : i) as IssuedItem[], policy) };
    });
    if (!result) throw new Problem(409, 'test_not_active', 'Срок теста истёк');
    return result;
  }
}
