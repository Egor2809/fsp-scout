ALTER TABLE "Outbox"
  ADD COLUMN "availableAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "claimUntil" TIMESTAMPTZ(3),
  ADD COLUMN "claimToken" UUID,
  ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "failedAt" TIMESTAMPTZ(3),
  ADD COLUMN "lastErrorCode" TEXT;
CREATE INDEX "Outbox_dispatch_idx" ON "Outbox" ("topic", "deliveredAt", "failedAt", "availableAt");
