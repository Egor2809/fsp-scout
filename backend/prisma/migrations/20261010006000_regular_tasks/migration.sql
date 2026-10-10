CREATE TABLE "RegularTask" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE RESTRICT,
 "title" TEXT NOT NULL, "description" TEXT NOT NULL, "kind" TEXT NOT NULL,
 "specializations" TEXT[] NOT NULL, "grades" TEXT[] NOT NULL, "timeLimitMin" INTEGER NOT NULL,
 "language" TEXT, "starterCode" TEXT, "rubric" JSONB NOT NULL, "status" TEXT NOT NULL DEFAULT 'active',
 "publishedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT now(), "deadlineAt" TIMESTAMPTZ(3) NOT NULL, "lastAssignmentScanAt" TIMESTAMPTZ(3),
 CHECK ("kind" IN ('code','review','approach')), CHECK ("status" IN ('active','closed')),
 CHECK ("timeLimitMin" BETWEEN 5 AND 30), CHECK ("deadlineAt" > "publishedAt")
);
CREATE INDEX "RegularTask_companyId_publishedAt_idx" ON "RegularTask"("companyId","publishedAt");
CREATE INDEX "RegularTask_status_deadlineAt_idx" ON "RegularTask"("status","deadlineAt");
CREATE TABLE "TaskAssignment" (
 "taskId" UUID NOT NULL REFERENCES "RegularTask"("id") ON DELETE CASCADE,
 "candidateId" UUID NOT NULL REFERENCES "Candidate"("id") ON DELETE CASCADE,
 "status" TEXT NOT NULL DEFAULT 'assigned', "assignedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT now(), "dueAt" TIMESTAMPTZ(3) NOT NULL,
 PRIMARY KEY ("taskId","candidateId"), CHECK ("status" IN ('assigned','submitted','reviewed','expired')), CHECK ("dueAt" > "assignedAt")
);
CREATE INDEX "TaskAssignment_candidateId_assignedAt_idx" ON "TaskAssignment"("candidateId","assignedAt");
CREATE TABLE "TaskSubmission" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "taskId" UUID NOT NULL, "candidateId" UUID NOT NULL,
 "submittedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT now(), "answerText" TEXT, "code" TEXT, "language" TEXT,
 "status" TEXT NOT NULL DEFAULT 'pending', "llmScore" INTEGER, "finalScore" INTEGER, "scoredAt" TIMESTAMPTZ(3), "feedback" TEXT,
 FOREIGN KEY ("taskId","candidateId") REFERENCES "TaskAssignment"("taskId","candidateId") ON DELETE CASCADE,
 CHECK ("status" IN ('pending','scored')), CHECK ("llmScore" BETWEEN 0 AND 100), CHECK ("finalScore" BETWEEN 0 AND 100),
 CHECK (length(trim(COALESCE("answerText",''))) > 0 OR length(trim(COALESCE("code",''))) > 0),
 CHECK (("status" = 'scored') = ("finalScore" IS NOT NULL AND "scoredAt" IS NOT NULL))
);
CREATE UNIQUE INDEX "TaskSubmission_taskId_candidateId_key" ON "TaskSubmission"("taskId","candidateId");
