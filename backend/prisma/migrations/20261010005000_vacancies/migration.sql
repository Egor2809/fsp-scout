CREATE TABLE "Vacancy" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE RESTRICT,
 "title" TEXT NOT NULL, "description" TEXT NOT NULL, "specialization" TEXT NOT NULL, "grade" TEXT NOT NULL,
 "mustSkills" TEXT[] NOT NULL, "niceSkills" TEXT[] NOT NULL, "workFormat" TEXT NOT NULL, "city" TEXT,
 "salaryFrom" INTEGER NOT NULL, "salaryTo" INTEGER NOT NULL, "status" TEXT NOT NULL DEFAULT 'draft',
 "publishedAt" TIMESTAMPTZ(3), "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ(3) NOT NULL,
 CONSTRAINT "Vacancy_salary_check" CHECK ("salaryFrom" >= 10000 AND "salaryTo" >= "salaryFrom" AND "salaryTo" <= 10000000),
 CONSTRAINT "Vacancy_status_check" CHECK ("status" IN ('draft','published','closed'))
);
CREATE INDEX "Vacancy_companyId_createdAt_idx" ON "Vacancy"("companyId","createdAt");
CREATE INDEX "Vacancy_status_specialization_grade_publishedAt_idx" ON "Vacancy"("status","specialization","grade","publishedAt");
CREATE TABLE "Application" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "vacancyId" UUID NOT NULL REFERENCES "Vacancy"("id") ON DELETE RESTRICT,
 "candidateId" UUID NOT NULL REFERENCES "Candidate"("id") ON DELETE CASCADE, "status" TEXT NOT NULL DEFAULT 'submitted',
 "coverLetter" TEXT, "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ(3) NOT NULL,
 CONSTRAINT "Application_status_check" CHECK ("status" IN ('submitted','viewed','interview','offer','hired','rejected','withdrawn'))
);
CREATE UNIQUE INDEX "Application_vacancyId_candidateId_key" ON "Application"("vacancyId","candidateId");
CREATE INDEX "Application_candidateId_createdAt_idx" ON "Application"("candidateId","createdAt");
CREATE TABLE "ApplicationEvent" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "applicationId" UUID NOT NULL REFERENCES "Application"("id") ON DELETE CASCADE,
 "status" TEXT NOT NULL, "actor" TEXT NOT NULL, "note" TEXT, "at" TIMESTAMPTZ(3) NOT NULL DEFAULT now()
);
CREATE INDEX "ApplicationEvent_applicationId_at_idx" ON "ApplicationEvent"("applicationId","at");
ALTER TABLE "Invitation" ADD COLUMN "vacancyId" UUID REFERENCES "Vacancy"("id") ON DELETE RESTRICT;
