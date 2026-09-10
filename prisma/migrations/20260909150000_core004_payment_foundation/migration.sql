ALTER TABLE "PaymentIntent" ADD COLUMN "idempotencyKey" TEXT;
ALTER TABLE "PaymentIntent" ADD COLUMN "requestHash" TEXT;
ALTER TABLE "PaymentIntent" ADD COLUMN "ownerUserId" TEXT;
ALTER TABLE "PaymentIntent" ADD COLUMN "walletId" TEXT;
ALTER TABLE "PaymentIntent" ADD COLUMN "failureCode" TEXT;
ALTER TABLE "PaymentIntent" ADD COLUMN "failureReason" TEXT;
ALTER TABLE "PaymentIntent" ADD COLUMN "expiresAt" TIMESTAMP(3);
ALTER TABLE "PaymentIntent" ADD COLUMN "succeededAt" TIMESTAMP(3);
ALTER TABLE "PaymentIntent" ADD COLUMN "cancelledAt" TIMESTAMP(3);
ALTER TABLE "PaymentIntent" ADD COLUMN "failedAt" TIMESTAMP(3);
ALTER TABLE "PaymentIntent" ALTER COLUMN "provider" DROP DEFAULT;
CREATE UNIQUE INDEX "PaymentIntent_idempotencyKey_key" ON "PaymentIntent"("idempotencyKey");
CREATE INDEX "PaymentIntent_ownerUserId_createdAt_idx" ON "PaymentIntent"("ownerUserId", "createdAt");
CREATE INDEX "PaymentIntent_status_createdAt_idx" ON "PaymentIntent"("status", "createdAt");
CREATE TABLE "PaymentTransaction" (
  "id" TEXT NOT NULL,
  "paymentIntentId" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "attemptNumber" INTEGER NOT NULL,
  "status" TEXT NOT NULL,
  "amount" BIGINT NOT NULL,
  "currency" TEXT NOT NULL,
  "provider" TEXT,
  "providerRef" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "requestHash" TEXT NOT NULL,
  "failureCode" TEXT,
  "failureReason" TEXT,
  "metadata" JSONB,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PaymentTransaction_reference_key" ON "PaymentTransaction"("reference");
CREATE UNIQUE INDEX "PaymentTransaction_idempotencyKey_key" ON "PaymentTransaction"("idempotencyKey");
CREATE UNIQUE INDEX "PaymentTransaction_paymentIntentId_attemptNumber_key" ON "PaymentTransaction"("paymentIntentId", "attemptNumber");
CREATE INDEX "PaymentTransaction_paymentIntentId_createdAt_idx" ON "PaymentTransaction"("paymentIntentId", "createdAt");
CREATE INDEX "PaymentTransaction_status_createdAt_idx" ON "PaymentTransaction"("status", "createdAt");
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_paymentIntentId_fkey" FOREIGN KEY ("paymentIntentId") REFERENCES "PaymentIntent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
