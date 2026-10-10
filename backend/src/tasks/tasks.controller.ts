import { Body, Controller, Get, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { AuthGuard, type Identity } from '../auth/auth.guard.js';
import { Database } from '../database/database.service.js';
import { MatchingService } from '../matching/matching.service.js';
import { CreateCompanyTaskBody, SubmitTaskBody, ScoreTaskSubmissionBody } from '../contract/schemas.js';
import { Problem } from '../common/problem.js';
import { parse } from '../common/validation.js';
import { SOLVED_THRESHOLD, taskSignal, validateRubric } from '../common/task-policy.js';
import { candidateInclude, ownProfile } from '../matching/candidate-mapper.js';
import { redactContactText } from '../common/contact-redaction.js';

const taskInclude = { company: true, _count: { select: { assignments: true } } } satisfies Prisma.RegularTaskInclude;
type TaskRow = Prisma.RegularTaskGetPayload<{ include: typeof taskInclude }>;
const assignmentInclude = { task: { include: taskInclude }, submission: true } satisfies Prisma.TaskAssignmentInclude;
type AssignmentRow = Prisma.TaskAssignmentGetPayload<{ include: typeof assignmentInclude }>;
type SubmissionRow = Prisma.TaskSubmissionGetPayload<{}>;
type Request = { identity: Identity };

@Controller()
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly db: Database, private readonly matching: MatchingService) {}
  private async candidate(identity: Identity) {
    if (identity.role !== 'candidate') throw new Problem(403, 'forbidden', 'Доступно кандидату');
    const c = await this.db.candidate.findFirst({ where: { user: { subject: identity.sub } }, include: candidateInclude });
    if (!c) throw new Problem(404, 'not_found', 'Профиль не найден');
    return c;
  }
  private async owned(identity: Identity, id: string) {
    parse(z.uuid(), id);
    const co = await this.matching.company(identity);
    const t = await this.db.regularTask.findFirst({ where: { id, companyId: co.id }, include: taskInclude });
    if (!t) throw new Problem(404, 'not_found', 'Задание не найдено');
    return t;
  }
  private submission(s: SubmissionRow) {
    return { id: s.id, task_id: s.taskId, submitted_at: s.submittedAt.toISOString(), answer_text: s.answerText, code: s.code, language: s.language,
      status: s.status, llm_score: s.llmScore, final_score: s.finalScore, fresh_signal: s.finalScore !== null && s.finalScore >= SOLVED_THRESHOLD, feedback: s.feedback };
  }
  private async view(t: TaskRow, owner: boolean) {
    const submitted = owner ? await this.db.taskSubmission.count({ where: { taskId: t.id } }) : null;
    return { id: t.id, company: { id: t.company.id, name: t.company.name, industry: t.company.industry, city: t.company.city, verified: t.company.verified }, title: t.title, description: t.description,
      kind: t.kind, specializations: t.specializations, grades: t.grades, time_limit_min: t.timeLimitMin, language: t.language, starter_code: t.starterCode, rubric: t.rubric,
      status: t.deadlineAt <= new Date() ? 'closed' : t.status, published_at: t.publishedAt.toISOString(), deadline_at: t.deadlineAt.toISOString(), assigned_count: owner ? t._count.assignments : null, submissions_count: submitted };
  }
  private async assignment(a: AssignmentRow) {
    return { task: await this.view(a.task, false), status: a.status === 'assigned' && a.dueAt <= new Date() ? 'expired' : a.status,
      assigned_at: a.assignedAt.toISOString(), due_at: a.dueAt.toISOString(), submission: a.submission ? this.submission(a.submission) : null };
  }
  @Get('regular-tasks')
  async list(@Req() req: Request) {
    const co = await this.matching.company(req.identity);
    const tasks = await this.db.regularTask.findMany({ where: { companyId: co.id }, include: taskInclude, orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }] });
    return Promise.all(tasks.map(t => this.view(t, true)));
  }
  @Post('regular-tasks')
  async create(@Req() req: Request, @Body() body: unknown) {
    const co = await this.matching.company(req.identity), d = parse(CreateCompanyTaskBody, body);
    const invalid = (pointer: string, detail: string): never => { throw new Problem(422, 'validation_error', detail, { errors: [{ pointer, detail }] }); };
    if (!validateRubric(d.rubric)) invalid('/rubric', 'Нужны уникальные критерии с весами 0..1, сумма равна 1');
    if (d.title.trim().length < 5 || d.description.trim().length < 30) invalid('/title', 'Заполните содержательные название и описание');
    const now = new Date(), deadline = new Date(d.deadline_at);
    if (deadline.getTime() <= now.getTime() + d.time_limit_min * 60000) invalid('/deadline_at', 'До срока сдачи должно оставаться время на выполнение');
    if (d.kind === 'code' && (!d.language || d.language === 'text')) invalid('/language', 'Выберите язык кода');
    if (new Set(d.specializations).size !== d.specializations.length || new Set(d.grades).size !== d.grades.length) invalid('/specializations', 'Категории должны быть уникальными');
    const task = await this.db.regularTask.create({ data: { companyId: co.id, title: d.title.trim(), description: d.description.trim(), kind: d.kind,
      specializations: d.specializations, grades: d.grades, timeLimitMin: d.time_limit_min, language: d.language, starterCode: d.starter_code,
      rubric: d.rubric as Prisma.InputJsonValue, publishedAt: now, deadlineAt: deadline }, include: taskInclude });
    return this.view(task, true);
  }
  @Get('regular-tasks/:id')
  async get(@Req() req: Request, @Param('id') id: string) { return this.view(await this.owned(req.identity, id), true); }
  @Get('me/tasks')
  async myTasks(@Req() req: Request) {
    const c = await this.candidate(req.identity);
    const rows = await this.db.taskAssignment.findMany({ where: { candidateId: c.id }, include: assignmentInclude, orderBy: [{ assignedAt: 'desc' }, { taskId: 'desc' }] });
    return Promise.all(rows.map(a => this.assignment(a)));
  }
  @Get('me/tasks/:id')
  async myTask(@Req() req: Request, @Param('id') id: string) {
    parse(z.uuid(), id);
    const c = await this.candidate(req.identity);
    const a = await this.db.taskAssignment.findUnique({ where: { taskId_candidateId: { taskId: id, candidateId: c.id } }, include: assignmentInclude });
    if (!a) throw new Problem(404, 'not_found', 'Задание не найдено');
    return this.assignment(a);
  }
  @Post('tasks/:id/submissions')
  async submit(@Req() req: Request, @Param('id') id: string, @Body() body: unknown) {
    parse(z.uuid(), id);
    const c = await this.candidate(req.identity), d = parse(SubmitTaskBody, body);
    const text = d.answer_text?.trim() || null, code = d.code?.trim() || null;
    if (!text && !code) throw new Problem(422, 'validation_error', 'Добавьте решение', { errors: [{ pointer: '/answer_text', detail: 'Нужен текст или код' }] });
    const s = await this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${c.id}::uuid FOR UPDATE`;
      const assignment = await tx.taskAssignment.findUnique({ where: { taskId_candidateId: { taskId: id, candidateId: c.id } }, include: { task: true } });
      if (!assignment) throw new Problem(404, 'not_found', 'Задание не найдено');
      if (await tx.taskSubmission.findUnique({ where: { taskId_candidateId: { taskId: id, candidateId: c.id } } })) throw new Problem(409, 'task_already_submitted', 'Решение уже отправлено');
      const now = new Date();
      if (assignment.status !== 'assigned' || assignment.dueAt <= now || assignment.task.deadlineAt <= now || assignment.task.status !== 'active') throw new Problem(409, 'conflict', 'Срок сдачи истёк');
      if (!await tx.consent.findFirst({ where: { candidateId: c.id, type: 'personal_data', revokedAt: null } })) throw new Problem(403, 'consent_required', 'Нужно согласие', { consent_types: ['personal_data'] });
      const language = d.language ?? assignment.task.language;
      if (code && (!language || (assignment.task.language && language !== assignment.task.language))) throw new Problem(422, 'validation_error', 'Проверьте язык', { errors: [{ pointer: '/language', detail: 'Язык должен соответствовать заданию' }] });
      const created = await tx.taskSubmission.create({ data: { taskId: id, candidateId: c.id, answerText: text, code, language } });
      await tx.taskAssignment.update({ where: { taskId_candidateId: { taskId: id, candidateId: c.id } }, data: { status: 'submitted' } });
      await tx.outbox.create({ data: { topic: 'task.submitted', payload: { submission_id: created.id } } });
      return created;
    });
    return this.submission(s);
  }
  private async employerViews(task: TaskRow, submissions: SubmissionRow[]) {
    const rows = await this.db.candidate.findMany({ where: { id: { in: submissions.map(s => s.candidateId) } }, include: candidateInclude });
    const cards = await this.matching.views(task.companyId, rows);
    const byId = new Map(cards.map(c => [c.id, c]));
    const profileById = new Map(rows.map(c => [c.id, ownProfile(c)]));
    return submissions.map(s => {
      const candidate = byId.get(s.candidateId)!;
      const profile = profileById.get(s.candidateId)!;
      const secrets = [profile.full_name, ...profile.full_name.split(/\s+/).filter(x => x.length > 3), profile.email, profile.phone, profile.telegram];
      const view = this.submission(s);
      return { ...view, answer_text: candidate.disclosure.revealed ? view.answer_text : redactContactText(view.answer_text, secrets),
        code: candidate.disclosure.revealed ? view.code : redactContactText(view.code, secrets), candidate };
    });
  }
  @Get('regular-tasks/:id/submissions')
  async submissions(@Req() req: Request, @Param('id') id: string) {
    const task = await this.owned(req.identity, id);
    const rows = await this.db.taskSubmission.findMany({ where: { taskId: id }, orderBy: [{ finalScore: { sort: 'desc', nulls: 'last' } }, { submittedAt: 'asc' }, { id: 'asc' }] });
    return this.employerViews(task, rows);
  }
  @Post('regular-tasks/:id/submissions/:submissionId/score') @HttpCode(200)
  async score(@Req() req: Request, @Param('id') id: string, @Param('submissionId') submissionId: string, @Body() body: unknown) {
    parse(z.uuid(), submissionId);
    const task = await this.owned(req.identity, id), d = parse(ScoreTaskSubmissionBody, body);
    const scored = await this.db.$transaction(async tx => {
      const initial = await tx.taskSubmission.findFirst({ where: { id: submissionId, taskId: task.id } });
      if (!initial) throw new Problem(404, 'not_found', 'Решение не найдено');
      await tx.$queryRaw`SELECT id FROM "Candidate" WHERE id = ${initial.candidateId}::uuid FOR UPDATE`;
      const previous = await tx.taskSubmission.findUniqueOrThrow({ where: { id: submissionId } });
      const s = await tx.taskSubmission.update({ where: { id: submissionId }, data: { finalScore: d.final_score, feedback: d.feedback ?? null, status: 'scored', scoredAt: new Date() } });
      await tx.taskAssignment.update({ where: { taskId_candidateId: { taskId: task.id, candidateId: s.candidateId } }, data: { status: 'reviewed' } });
      const history = await tx.taskSubmission.findMany({ where: { candidateId: s.candidateId, finalScore: { not: null } }, select: { finalScore: true, submittedAt: true } });
      const c = await tx.candidate.findUniqueOrThrow({ where: { id: s.candidateId } });
      await tx.candidate.update({ where: { id: c.id }, data: { profile: { ...(c.profile as Prisma.JsonObject), task_signal: taskSignal(history, new Date()) } as Prisma.InputJsonObject } });
      await tx.audit.create({ data: { actorSubject: req.identity.sub, action: 'task.scored', resourceId: s.id, metadata: { final_score: d.final_score, previous_score: previous.finalScore } } });
      return s;
    });
    return (await this.employerViews(task, [scored]))[0];
  }
}
