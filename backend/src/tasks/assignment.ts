import type { PrismaClient } from '@prisma/client';
import { candidateInclude, snapshot } from '../matching/candidate-mapper.js';
import { published } from '../matching/matching.js';
import { TASK_COOLDOWN_MS } from '../common/task-policy.js';

/** A worker batch is bounded; candidate locks serialize the global two-week rule. */
export async function assignRegularTasks(db: PrismaClient): Promise<void> {
  const now = new Date();
  await db.regularTask.updateMany({ where: { status: 'active', deadlineAt: { lte: now } }, data: { status: 'closed' } });
  await db.taskAssignment.updateMany({ where: { status: 'assigned', dueAt: { lte: now } }, data: { status: 'expired' } });
  const taskIds = await db.$queryRaw<{ id: string }[]>`SELECT t.id FROM "RegularTask" t
    WHERE t.status = 'active' AND t."deadlineAt" > ${now}
    AND (SELECT count(*) FROM "TaskAssignment" a WHERE a."taskId" = t.id) < 25
    ORDER BY t."lastAssignmentScanAt" ASC NULLS FIRST, t."publishedAt", t.id LIMIT 100`;
  const tasks = await db.regularTask.findMany({ where: { id: { in: taskIds.map(t => t.id) } }, orderBy: [{ publishedAt: 'asc' }, { id: 'asc' }] });
  for (const task of tasks) await db.$transaction(async tx => {
    const now = new Date();
    const locked = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "RegularTask" WHERE id = ${task.id}::uuid AND status = 'active' AND "deadlineAt" > ${now} FOR UPDATE SKIP LOCKED`;
    if (!locked.length) return;
    await tx.regularTask.update({ where: { id: task.id }, data: { lastAssignmentScanAt: now } });
    const count = await tx.taskAssignment.count({ where: { taskId: task.id } });
    const remaining = 25 - count;
    if (remaining <= 0) return;
    const cutoff = new Date(now.getTime() - TASK_COOLDOWN_MS);
    const candidates = await tx.$queryRaw<{ id: string }[]>`SELECT c.id FROM "Candidate" c
      WHERE c."confirmedSpecialization" = ANY(${task.specializations}::text[]) AND c.grade = ANY(${task.grades}::text[])
      AND COALESCE(c.profile->>'availability', 'active') <> 'not_looking'
      AND c.profile->'standing' IS NOT NULL AND c.profile->'standing' <> 'null'::jsonb
      AND NOT COALESCE(c.privacy->'hidden_company_ids' @> jsonb_build_array(${task.companyId}::text), false)
      AND EXISTS (SELECT 1 FROM "Consent" s WHERE s."candidateId" = c.id AND s.type = 'profile_visibility' AND s."revokedAt" IS NULL)
      AND EXISTS (SELECT 1 FROM "Consent" s WHERE s."candidateId" = c.id AND s.type = 'personal_data' AND s."revokedAt" IS NULL)
      AND NOT EXISTS (SELECT 1 FROM "TaskAssignment" a WHERE a."candidateId" = c.id AND (a."assignedAt" > ${cutoff} OR a."taskId" = ${task.id}::uuid))
      ORDER BY c."lastActiveAt" DESC, c.id LIMIT 200`;
    let assigned = 0;
    for (const candidate of candidates) {
      if (assigned >= remaining || task.deadlineAt <= new Date()) break;
      const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "Candidate" WHERE id = ${candidate.id}::uuid FOR UPDATE SKIP LOCKED`;
      if (!rows.length) continue;
      const fresh = await tx.candidate.findUniqueOrThrow({ where: { id: candidate.id }, include: candidateInclude });
      if (!published(snapshot(fresh), task.companyId) || !task.specializations.includes(fresh.confirmedSpecialization!) || !task.grades.includes(fresh.grade!)) continue;
      if (!fresh.consents.some(c => c.type === 'personal_data' && !c.revokedAt)) continue;
      if (await tx.taskAssignment.findFirst({ where: { candidateId: candidate.id, OR: [{ assignedAt: { gt: cutoff } }, { taskId: task.id }] } })) continue;
      await tx.taskAssignment.create({ data: { taskId: task.id, candidateId: candidate.id, assignedAt: now, dueAt: task.deadlineAt } });
      assigned++;
    }
  }, { timeout: 15000 });
}
