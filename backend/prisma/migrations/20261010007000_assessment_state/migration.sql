ALTER TABLE "TestSession"
 ADD COLUMN "policy" JSONB NOT NULL DEFAULT '{"min":10,"max":18,"targetSe":0.35,"topK":5,"maxExposure":0.2,"practiceTotal":0}',
 ADD COLUMN "bankVersion" TEXT NOT NULL DEFAULT 'unassigned',
 ADD COLUMN "vacancyId" UUID REFERENCES "Vacancy"("id") ON DELETE RESTRICT;
ALTER TABLE "TestItem"
 ADD COLUMN "ordinal" INTEGER,
 ADD COLUMN "block" TEXT NOT NULL DEFAULT 'adaptive',
 ADD COLUMN "competency" TEXT,
 ADD COLUMN "issuedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
 ADD COLUMN "telemetry" JSONB NOT NULL DEFAULT '{}';
WITH numbered AS (
 SELECT id, row_number() OVER (PARTITION BY "sessionId" ORDER BY
  CASE WHEN "publicItem"->>'index' ~ '^[0-9]{1,8}$' THEN ("publicItem"->>'index')::integer ELSE 0 END, id) AS ordinal
 FROM "TestItem"
)
UPDATE "TestItem" i SET "ordinal" = n.ordinal, "competency" = COALESCE(i."publicItem"->'competency'->>'id','unknown')
 FROM numbered n WHERE i.id = n.id;
ALTER TABLE "TestItem" ALTER COLUMN "ordinal" SET NOT NULL, ALTER COLUMN "competency" SET NOT NULL;
ALTER TABLE "TestItem" ADD CHECK ("ordinal" > 0), ADD CHECK ("block" IN ('adaptive','practice','approach'));
CREATE UNIQUE INDEX "TestItem_sessionId_ordinal_key" ON "TestItem"("sessionId","ordinal");
-- Refuse inconsistent existing sessions rather than silently discarding their unanswered items.
CREATE UNIQUE INDEX "TestItem_one_unanswered" ON "TestItem"("sessionId") WHERE "answeredAt" IS NULL;
CREATE TABLE "GradeHistory" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "candidateId" UUID NOT NULL REFERENCES "Candidate"("id") ON DELETE CASCADE,
 "specialization" TEXT NOT NULL, "grade" TEXT NOT NULL, "previousGrade" TEXT, "previousSpecialization" TEXT,
 "changedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT now(), "testId" UUID REFERENCES "TestSession"("id") ON DELETE SET NULL,
 "reason" TEXT NOT NULL CHECK ("reason" IN ('test_passed','test_lower','admin'))
);
CREATE UNIQUE INDEX "GradeHistory_testId_key" ON "GradeHistory"("testId");
CREATE INDEX "GradeHistory_candidateId_changedAt_idx" ON "GradeHistory"("candidateId","changedAt");
