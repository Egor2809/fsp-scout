ALTER TABLE "Invitation" ADD COLUMN "viewedAt" TIMESTAMPTZ(3);
ALTER TABLE "Invitation" ADD COLUMN response JSONB;
CREATE TABLE "Disclosure" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" UUID NOT NULL REFERENCES "Company"(id),
  "candidateId" UUID NOT NULL REFERENCES "Candidate"(id),
  "sourceId" UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('invitation_accepted', 'application')),
  at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("companyId", "candidateId")
);
