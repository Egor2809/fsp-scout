CREATE TABLE "DeletedIdentity" (
  "identityHash" TEXT NOT NULL,
  "requestedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMPTZ(3),
  CONSTRAINT "DeletedIdentity_pkey" PRIMARY KEY ("identityHash")
);
