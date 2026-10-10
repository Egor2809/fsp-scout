ALTER TABLE "Candidate" ADD COLUMN "lastActiveAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE TABLE "Need" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" UUID NOT NULL REFERENCES "Company"(id),
  "rawText" TEXT NOT NULL, parsed JSONB NOT NULL, confirmed JSONB,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL
);
CREATE INDEX "Need_companyId_createdAt_idx" ON "Need"("companyId", "createdAt");
CREATE TABLE "Search" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" UUID NOT NULL REFERENCES "Company"(id),
  "needId" UUID REFERENCES "Need"(id), title TEXT NOT NULL,
  "currentVersion" INTEGER NOT NULL DEFAULT 1 CHECK ("currentVersion" >= 1),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL
);
CREATE INDEX "Search_companyId_updatedAt_idx" ON "Search"("companyId", "updatedAt");
CREATE TABLE "SearchVersion" (
  "searchId" UUID NOT NULL REFERENCES "Search"(id) ON DELETE CASCADE,
  version INTEGER NOT NULL CHECK(version >= 1), label TEXT NOT NULL,
  filters JSONB NOT NULL, "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY("searchId", version)
);
CREATE TABLE "Shortlist" (
  "searchId" UUID NOT NULL REFERENCES "Search"(id) ON DELETE CASCADE,
  "candidateId" UUID NOT NULL REFERENCES "Candidate"(id),
  "addedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "addedInVersion" INTEGER NOT NULL CHECK("addedInVersion" >= 1),
  PRIMARY KEY("searchId", "candidateId")
);
