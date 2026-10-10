CREATE TABLE "ProfileCertificate" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "candidateId" UUID NOT NULL REFERENCES "Candidate"(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  "tokenHash" TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  "issuedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  "revokedAt" TIMESTAMPTZ(3)
);
CREATE UNIQUE INDEX "ProfileCertificate_tokenHash_key" ON "ProfileCertificate" ("tokenHash");
CREATE INDEX "ProfileCertificate_candidateId_issuedAt_idx" ON "ProfileCertificate" ("candidateId", "issuedAt");
CREATE INDEX "ProfileCertificate_expiresAt_idx" ON "ProfileCertificate" ("expiresAt");
