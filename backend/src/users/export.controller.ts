import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { Database } from '../database/database.service.js';
import { Problem } from '../common/problem.js';

@Controller('me')
@UseGuards(AuthGuard)
export class ExportController {
  constructor(private readonly db: Database) {}

  @Get('export')
  async export(@Req() req: { identity: Identity }, @Res({ passthrough: true }) response: { setHeader(name: string, value: string): void }) {
    if (!['candidate', 'employer'].includes(req.identity.role)) throw new Problem(403, 'forbidden', 'Доступ запрещён');
    const data = await this.db.$transaction(async tx => {
      const user = await tx.user.findUnique({ where: { subject: req.identity.sub }, select: {
        id: true, subject: true, email: true, displayName: true, role: true, createdAt: true,
      } });
      if (!user) throw new Problem(404, 'not_found', 'Учётная запись не найдена');
      // A consistent snapshot; no company-wide candidate records or private assessment keys.
      const memberships = await tx.membership.findMany({ where: { userId: user.id }, select: { companyId: true } });
      const candidate = await tx.candidate.findUnique({ where: { userId: user.id }, include: {
        consents: true, surveys: true, gradeHistory: true, fspLink: { select: { fspId: true, verifiedAt: true } },
        disclosures: true,
        tests: { select: {
          id: true, specialization: true, declaredGrade: true, status: true, startedAt: true,
          deadlineAt: true, finishedAt: true, result: true, vacancyId: true,
          items: { orderBy: { ordinal: 'asc' }, select: {
            id: true, ordinal: true, block: true, competency: true, publicItem: true,
            issuedAt: true, answer: true, answeredAt: true, telemetry: true,
          } },
        } },
        invitations: { select: {
          id: true, companyId: true, status: true, salaryFrom: true, salaryTo: true,
          offer: true, response: true, sentAt: true, expiresAt: true, viewedAt: true,
          postponedOnce: true, vacancyId: true,
        } },
        applications: { select: {
          id: true, vacancyId: true, status: true, coverLetter: true, createdAt: true, updatedAt: true,
        } },
        taskAssignments: { select: {
          taskId: true, status: true, assignedAt: true, dueAt: true,
          submission: { select: {
            id: true, submittedAt: true, answerText: true, code: true, language: true,
            status: true, llmScore: true, finalScore: true, scoredAt: true, feedback: true,
          } },
        } },
      } });
      return { schema_version: 1, exported_at: new Date().toISOString(), user, memberships, candidate };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead, timeout: 30000 });
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Disposition', 'attachment; filename="scout-personal-data.json"');
    return data;
  }
}
