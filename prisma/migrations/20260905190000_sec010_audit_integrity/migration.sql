ALTER TABLE "AuditLog"
  ADD COLUMN "outcome" TEXT NOT NULL DEFAULT 'SUCCESS',
  ADD COLUMN "requestId" TEXT,
  ADD COLUMN "metadata" JSONB,
  ADD COLUMN "integrityHash" TEXT;

UPDATE "AuditLog"
SET "integrityHash" = md5(
  coalesce("id", '') || '|' ||
  coalesce("actor", '') || '|' ||
  coalesce("action", '') || '|' ||
  coalesce("resource", '') || '|' ||
  coalesce("resourceId", '') || '|' ||
  coalesce("createdAt"::text, '')
)
WHERE "integrityHash" IS NULL;

ALTER TABLE "AuditLog"
  ALTER COLUMN "integrityHash" SET NOT NULL;

CREATE UNIQUE INDEX "AuditLog_integrityHash_key" ON "AuditLog"("integrityHash");
CREATE INDEX "AuditLog_actor_createdAt_idx" ON "AuditLog"("actor", "createdAt");
CREATE INDEX "AuditLog_resource_resourceId_createdAt_idx" ON "AuditLog"("resource", "resourceId", "createdAt");
CREATE INDEX "AuditLog_requestId_idx" ON "AuditLog"("requestId");
