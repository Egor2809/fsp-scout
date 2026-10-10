CREATE TABLE "Survey" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "candidateId" UUID NOT NULL REFERENCES "Candidate"(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Survey_candidateId_createdAt_idx" ON "Survey"("candidateId", "createdAt");
