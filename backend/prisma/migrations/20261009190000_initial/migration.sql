CREATE TABLE "User" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "subject" TEXT NOT NULL UNIQUE,
  "email" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Company" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "industry" TEXT NOT NULL DEFAULT 'other',
  "description" TEXT NOT NULL DEFAULT '',
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "quotaBase" INTEGER NOT NULL DEFAULT 20,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Membership" (
  "userId" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  PRIMARY KEY ("userId", "companyId")
);

CREATE TABLE "Candidate" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL UNIQUE,
  "surveyCompleted" BOOLEAN NOT NULL DEFAULT false,
  "specialization" TEXT,
  "grade" TEXT,
  "theta" DOUBLE PRECISION,
  "standardError" DOUBLE PRECISION,
  "gradeChangedAt" TIMESTAMPTZ(3),
  "salaryFloor" INTEGER,
  "profile" JSONB NOT NULL DEFAULT '{}',
  "privacy" JSONB NOT NULL DEFAULT '{}',
  "updatedAt" TIMESTAMPTZ(3) NOT NULL
);

CREATE TABLE "Consent" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "candidateId" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "givenAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMPTZ(3)
);

CREATE TABLE "TestSession" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "candidateId" UUID NOT NULL,
  "specialization" TEXT NOT NULL,
  "declaredGrade" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'in_progress',
  "seed" INTEGER NOT NULL,
  "startedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deadlineAt" TIMESTAMPTZ(3) NOT NULL,
  "finishedAt" TIMESTAMPTZ(3),
  "result" JSONB
);

CREATE TABLE "TestItem" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionId" UUID NOT NULL,
  "familyId" TEXT NOT NULL,
  "templateVersion" INTEGER NOT NULL,
  "parameters" JSONB NOT NULL,
  "publicItem" JSONB NOT NULL,
  "expectedAnswer" JSONB NOT NULL,
  "discrimination" DOUBLE PRECISION NOT NULL,
  "difficulty" DOUBLE PRECISION NOT NULL,
  "answer" JSONB,
  "correct" BOOLEAN,
  "answeredAt" TIMESTAMPTZ(3),
  UNIQUE ("sessionId", "familyId")
);

CREATE TABLE "Invitation" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" UUID NOT NULL,
  "candidateId" UUID NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'sent',
  "salaryFrom" INTEGER NOT NULL,
  "salaryTo" INTEGER NOT NULL,
  "offer" JSONB NOT NULL,
  "postponedOnce" BOOLEAN NOT NULL DEFAULT false,
  "sentAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMPTZ(3) NOT NULL
);

CREATE TABLE "InvitationEvent" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "invitationId" UUID NOT NULL,
  "status" TEXT NOT NULL,
  "actor" TEXT NOT NULL,
  "note" TEXT,
  "at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Audit" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "actorSubject" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "resourceId" TEXT NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Outbox" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "topic" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deliveredAt" TIMESTAMPTZ(3)
);

ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE;

ALTER TABLE "Membership" ADD CONSTRAINT "Membership_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE;

ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE;

CREATE INDEX "Candidate_specialization_grade_idx" ON "Candidate" ("specialization", "grade");

ALTER TABLE "Consent" ADD CONSTRAINT "Consent_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE CASCADE;

CREATE INDEX "Consent_candidateId_type_idx" ON "Consent" ("candidateId", "type");

ALTER TABLE "TestSession" ADD CONSTRAINT "TestSession_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE CASCADE;

CREATE INDEX "TestSession_candidateId_startedAt_idx" ON "TestSession" ("candidateId", "startedAt");

ALTER TABLE "TestItem" ADD CONSTRAINT "TestItem_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TestSession" ("id") ON DELETE CASCADE;

ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT;

ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE RESTRICT;

CREATE INDEX "Invitation_companyId_sentAt_idx" ON "Invitation" ("companyId", "sentAt");

CREATE INDEX "Invitation_candidateId_status_idx" ON "Invitation" ("candidateId", "status");

ALTER TABLE "InvitationEvent" ADD CONSTRAINT "InvitationEvent_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation" ("id") ON DELETE CASCADE;

CREATE INDEX "Audit_resourceId_at_idx" ON "Audit" ("resourceId", "at");

CREATE INDEX "Outbox_deliveredAt_createdAt_idx" ON "Outbox" ("deliveredAt", "createdAt");

CREATE UNIQUE INDEX "one_active_test_per_candidate" ON "TestSession" ("candidateId") WHERE status = 'in_progress';

CREATE UNIQUE INDEX "one_active_invitation_per_pair" ON "Invitation" ("companyId", "candidateId") WHERE status IN ('sent', 'viewed', 'postponed');

CREATE UNIQUE INDEX "one_active_consent_per_type" ON "Consent" ("candidateId", type) WHERE "revokedAt" IS NULL;

ALTER TABLE "Invitation" ADD CONSTRAINT "salary_range_valid" CHECK ("salaryFrom" >= 10000 AND "salaryTo" >= "salaryFrom" AND "salaryTo" <= 10000000);

ALTER TABLE "Candidate" ADD CONSTRAINT "salary_floor_valid" CHECK ("salaryFloor" IS NULL OR "salaryFloor" BETWEEN 10000 AND 10000000);

ALTER TABLE "TestItem" ADD CONSTRAINT "irt_discrimination_positive" CHECK (discrimination > 0);

ALTER TABLE "User" ADD CONSTRAINT "role_valid" CHECK (role IN ('candidate', 'employer', 'admin'));

ALTER TABLE "TestSession" ADD CONSTRAINT "deadline_after_start" CHECK ("deadlineAt" > "startedAt");
