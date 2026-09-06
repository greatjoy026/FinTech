-- CORE-003 wallet transaction integrity metadata.
-- Existing wallet transactions remain compatible; NULL requestHash is permitted
-- for legacy records. New wallet financial operations must populate it.
ALTER TABLE "WalletTransaction"
  ADD COLUMN "requestHash" TEXT;

CREATE INDEX "WalletTransaction_walletId_createdAt_idx"
  ON "WalletTransaction"("walletId", "createdAt");

ALTER TABLE "Wallet"
  ADD CONSTRAINT "Wallet_balance_nonnegative_check"
  CHECK (
    "availableBalance" >= 0
    AND "pendingBalance" >= 0
    AND "reservedBalance" >= 0
  );

ALTER TABLE "Wallet"
  ADD CONSTRAINT "Wallet_reserved_not_above_available_plus_reserved_check"
  CHECK ("availableBalance" + "reservedBalance" >= 0);
