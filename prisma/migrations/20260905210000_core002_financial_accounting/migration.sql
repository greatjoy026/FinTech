CREATE TYPE "FinancialAccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');
CREATE TYPE "FinancialAccountStatus" AS ENUM ('ACTIVE', 'DISABLED');
CREATE TYPE "JournalStatus" AS ENUM ('DRAFT', 'POSTED', 'VOIDED');
CREATE TYPE "JournalLineDirection" AS ENUM ('DEBIT', 'CREDIT');
CREATE TYPE "FinancialHoldStatus" AS ENUM ('ACTIVE', 'RELEASED', 'EXPIRED', 'CAPTURED');

CREATE TABLE "FinancialAccount" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "FinancialAccountType" NOT NULL,
  "currency" VARCHAR(3) NOT NULL,
  "status" "FinancialAccountStatus" NOT NULL DEFAULT 'ACTIVE',
  "parentId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FinancialAccount_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FinancialAccount_code_key" ON "FinancialAccount"("code");
CREATE INDEX "FinancialAccount_type_status_idx" ON "FinancialAccount"("type", "status");
CREATE INDEX "FinancialAccount_currency_status_idx" ON "FinancialAccount"("currency", "status");
CREATE INDEX "FinancialAccount_parentId_idx" ON "FinancialAccount"("parentId");
ALTER TABLE "FinancialAccount" ADD CONSTRAINT "FinancialAccount_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "FinancialAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "FinancialJournal" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "currency" VARCHAR(3) NOT NULL,
  "status" "JournalStatus" NOT NULL DEFAULT 'DRAFT',
  "idempotencyKey" TEXT NOT NULL,
  "requestHash" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "postedAt" TIMESTAMP(3),
  "voidedAt" TIMESTAMP(3),
  CONSTRAINT "FinancialJournal_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FinancialJournal_reference_key" ON "FinancialJournal"("reference");
CREATE UNIQUE INDEX "FinancialJournal_idempotencyKey_key" ON "FinancialJournal"("idempotencyKey");
CREATE INDEX "FinancialJournal_status_createdAt_idx" ON "FinancialJournal"("status", "createdAt");
CREATE INDEX "FinancialJournal_currency_status_idx" ON "FinancialJournal"("currency", "status");

CREATE TABLE "FinancialJournalLine" (
  "id" TEXT NOT NULL,
  "journalId" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "direction" "JournalLineDirection" NOT NULL,
  "amount" BIGINT NOT NULL,
  "description" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FinancialJournalLine_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "FinancialJournalLine_journalId_idx" ON "FinancialJournalLine"("journalId");
CREATE INDEX "FinancialJournalLine_accountId_createdAt_idx" ON "FinancialJournalLine"("accountId", "createdAt");
ALTER TABLE "FinancialJournalLine" ADD CONSTRAINT "FinancialJournalLine_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "FinancialJournal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinancialJournalLine" ADD CONSTRAINT "FinancialJournalLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "FinancialAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "FinancialWalletAccount" (
  "id" TEXT NOT NULL,
  "walletId" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FinancialWalletAccount_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FinancialWalletAccount_walletId_key" ON "FinancialWalletAccount"("walletId");
CREATE UNIQUE INDEX "FinancialWalletAccount_accountId_key" ON "FinancialWalletAccount"("accountId");
ALTER TABLE "FinancialWalletAccount" ADD CONSTRAINT "FinancialWalletAccount_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinancialWalletAccount" ADD CONSTRAINT "FinancialWalletAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "FinancialAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "FinancialHold" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "sourceAccountId" TEXT NOT NULL,
  "destinationAccountId" TEXT NOT NULL,
  "amount" BIGINT NOT NULL,
  "currency" VARCHAR(3) NOT NULL,
  "status" "FinancialHoldStatus" NOT NULL DEFAULT 'ACTIVE',
  "idempotencyKey" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "releasedAt" TIMESTAMP(3),
  "capturedAt" TIMESTAMP(3),
  CONSTRAINT "FinancialHold_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FinancialHold_reference_key" ON "FinancialHold"("reference");
CREATE UNIQUE INDEX "FinancialHold_idempotencyKey_key" ON "FinancialHold"("idempotencyKey");
CREATE INDEX "FinancialHold_sourceAccountId_status_idx" ON "FinancialHold"("sourceAccountId", "status");
CREATE INDEX "FinancialHold_destinationAccountId_status_idx" ON "FinancialHold"("destinationAccountId", "status");
CREATE INDEX "FinancialHold_status_expiresAt_idx" ON "FinancialHold"("status", "expiresAt");
ALTER TABLE "FinancialHold" ADD CONSTRAINT "FinancialHold_sourceAccountId_fkey" FOREIGN KEY ("sourceAccountId") REFERENCES "FinancialAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinancialHold" ADD CONSTRAINT "FinancialHold_destinationAccountId_fkey" FOREIGN KEY ("destinationAccountId") REFERENCES "FinancialAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FinancialAccount" ADD CONSTRAINT "FinancialAccount_currency_format_ck" CHECK ("currency" ~ '^[A-Z]{3}$');
ALTER TABLE "FinancialJournal" ADD CONSTRAINT "FinancialJournal_currency_format_ck" CHECK ("currency" ~ '^[A-Z]{3}$');
ALTER TABLE "FinancialJournalLine" ADD CONSTRAINT "FinancialJournalLine_amount_positive_ck" CHECK ("amount" > 0);
ALTER TABLE "FinancialHold" ADD CONSTRAINT "FinancialHold_amount_positive_ck" CHECK ("amount" > 0);
ALTER TABLE "FinancialHold" ADD CONSTRAINT "FinancialHold_currency_format_ck" CHECK ("currency" ~ '^[A-Z]{3}$');
ALTER TABLE "FinancialHold" ADD CONSTRAINT "FinancialHold_distinct_accounts_ck" CHECK ("sourceAccountId" <> "destinationAccountId");

CREATE OR REPLACE FUNCTION fintech_validate_financial_journal()
RETURNS TRIGGER AS $$
DECLARE
  journal_currency VARCHAR(3);
  debit_total NUMERIC;
  credit_total NUMERIC;
  invalid_currency BOOLEAN;
BEGIN
  SELECT "currency" INTO journal_currency FROM "FinancialJournal" WHERE "id" = COALESCE(NEW."journalId", OLD."journalId");
  IF journal_currency IS NULL THEN
    RAISE EXCEPTION 'financial journal does not exist';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM "FinancialJournalLine" l
    JOIN "FinancialAccount" a ON a."id" = l."accountId"
    WHERE l."journalId" = COALESCE(NEW."journalId", OLD."journalId")
      AND (a."currency" <> journal_currency OR a."status" <> 'ACTIVE')
  ) INTO invalid_currency;
  IF invalid_currency THEN
    RAISE EXCEPTION 'journal lines must use active accounts with the journal currency';
  END IF;

  IF (SELECT "status" FROM "FinancialJournal" WHERE "id" = COALESCE(NEW."journalId", OLD."journalId")) = 'POSTED' THEN
    SELECT COALESCE(SUM(CASE WHEN "direction" = 'DEBIT' THEN "amount" ELSE 0 END), 0),
           COALESCE(SUM(CASE WHEN "direction" = 'CREDIT' THEN "amount" ELSE 0 END), 0)
      INTO debit_total, credit_total
      FROM "FinancialJournalLine"
     WHERE "journalId" = COALESCE(NEW."journalId", OLD."journalId");
    IF debit_total <> credit_total OR debit_total = 0 THEN
      RAISE EXCEPTION 'posted financial journal must have positive, balanced debits and credits';
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fintech_reject_posted_journal_line_change()
RETURNS TRIGGER AS $$
DECLARE journal_status "JournalStatus";
BEGIN
  SELECT "status" INTO journal_status FROM "FinancialJournal" WHERE "id" = COALESCE(NEW."journalId", OLD."journalId");
  IF journal_status = 'POSTED' THEN
    RAISE EXCEPTION 'posted financial journal lines are immutable';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "FinancialJournalLine_validate"
AFTER INSERT OR UPDATE OR DELETE ON "FinancialJournalLine"
FOR EACH ROW EXECUTE FUNCTION fintech_validate_financial_journal();

CREATE TRIGGER "FinancialJournalLine_immutable"
BEFORE UPDATE OR DELETE ON "FinancialJournalLine"
FOR EACH ROW EXECUTE FUNCTION fintech_reject_posted_journal_line_change();

CREATE OR REPLACE FUNCTION fintech_validate_financial_journal_status()
RETURNS TRIGGER AS $$
DECLARE debit_total NUMERIC; credit_total NUMERIC; invalid_currency BOOLEAN;
BEGIN
  IF NEW."status" = 'POSTED' THEN
    IF OLD."status" <> 'DRAFT' THEN RAISE EXCEPTION 'only draft journals may be posted'; END IF;
    IF NEW."postedAt" IS NULL THEN NEW."postedAt" = CURRENT_TIMESTAMP; END IF;
    SELECT EXISTS (
      SELECT 1 FROM "FinancialJournalLine" l
      JOIN "FinancialAccount" a ON a."id" = l."accountId"
      WHERE l."journalId" = NEW."id" AND (a."currency" <> NEW."currency" OR a."status" <> 'ACTIVE')
    ) INTO invalid_currency;
    IF invalid_currency THEN RAISE EXCEPTION 'journal contains invalid account currency or disabled account'; END IF;
    SELECT COALESCE(SUM(CASE WHEN "direction" = 'DEBIT' THEN "amount" ELSE 0 END), 0),
           COALESCE(SUM(CASE WHEN "direction" = 'CREDIT' THEN "amount" ELSE 0 END), 0)
      INTO debit_total, credit_total FROM "FinancialJournalLine" WHERE "journalId" = NEW."id";
    IF debit_total = 0 OR debit_total <> credit_total THEN
      RAISE EXCEPTION 'financial journal must balance before posting';
    END IF;
  ELSIF NEW."status" = 'VOIDED' THEN
    IF OLD."status" <> 'POSTED' THEN RAISE EXCEPTION 'only posted journals may be voided'; END IF;
    IF NEW."voidedAt" IS NULL THEN NEW."voidedAt" = CURRENT_TIMESTAMP; END IF;
  ELSIF NEW."status" = 'DRAFT' AND OLD."status" <> 'DRAFT' THEN
    RAISE EXCEPTION 'posted or voided journals cannot return to draft';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "FinancialJournal_status_validate"
BEFORE UPDATE OF "status", "postedAt", "voidedAt" ON "FinancialJournal"
FOR EACH ROW EXECUTE FUNCTION fintech_validate_financial_journal_status();
