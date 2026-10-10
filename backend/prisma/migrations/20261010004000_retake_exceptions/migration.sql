ALTER TABLE "TestSession" ADD COLUMN "exceptionParentId" UUID;
CREATE UNIQUE INDEX "TestSession_exceptionParentId_key" ON "TestSession"("exceptionParentId");
ALTER TABLE "TestSession" ADD CONSTRAINT "TestSession_exceptionParentId_fkey"
  FOREIGN KEY ("exceptionParentId") REFERENCES "TestSession"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "TestSession" ADD CONSTRAINT "TestSession_not_own_exception"
  CHECK ("exceptionParentId" IS NULL OR "exceptionParentId" <> "id");
