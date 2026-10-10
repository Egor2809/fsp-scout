ALTER TABLE "Candidate" ADD COLUMN "confirmedSpecialization" TEXT;
UPDATE "Candidate" SET "confirmedSpecialization" = profile->'standing'->'category'->>'specialization' WHERE grade IS NOT NULL;
CREATE INDEX "Candidate_confirmedSpecialization_grade_idx" ON "Candidate"("confirmedSpecialization", grade);
