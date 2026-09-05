# CORE-003 — Wallet Accounting & Balance Integrity

## Authority model

`FinancialJournal` and `FinancialJournalLine` remain the authoritative record of settled financial activity. `Wallet.availableBalance`, `Wallet.pendingBalance`, and `Wallet.reservedBalance` are operational projections, not independent accounting truth.

Each wallet must map one-to-one to one active `FinancialAccount`. Customer wallet accounts are `LIABILITY` accounts: a credit increases the platform obligation to the wallet holder and a debit decreases it.

## Wallet balance semantics

- **availableBalance** — spendable settled funds.
- **reservedBalance** — settled funds temporarily unavailable because of an active hold.
- **pendingBalance** — funds not yet available for spending; pending lifecycle must be completed by a future domain integration before becoming settled wallet value.
- **projectedSettledBalance** = available + reserved.

The wallet/accounting reconciliation boundary therefore compares `projectedSettledBalance` with the authoritative financial-account balance. `pendingBalance` is reported separately and is not silently treated as settled money.

## Transfer invariant

An internal wallet transfer is one `SERIALIZABLE` PostgreSQL transaction containing:

1. wallet status/currency/mapping validation;
2. divergence checks against authoritative accounting;
3. sufficient-available-funds check;
4. sender/receiver wallet projection updates;
5. one balanced journal: **DEBIT sender liability / CREDIT receiver liability**;
6. immutable wallet transaction records.

If any step fails, the entire transaction rolls back. Serialization failures are retried a bounded number of times.

## Idempotency

Financial journals use the existing CORE-002 idempotency contract. Wallet transfer references are request-hashed so a repeated reference cannot silently execute different parameters. Hold creation uses `FinancialHold.idempotencyKey`.

An idempotent retry returns the existing operation rather than creating a second financial effect. A reused identity with different parameters is rejected as an idempotency conflict.

## Holds

A hold is a reservation, not money creation:

`available -= amount` and `reserved += amount`.

Release reverses that projection movement and creates no journal. Capture consumes reserved funds and creates the actual double-entry accounting transfer from the wallet liability account to the hold destination account. Capture is therefore the point at which financial value moves.

## Concurrency and integrity

Wallet mutations use PostgreSQL transactions with `SERIALIZABLE` isolation. Hold creation uses an atomic conditional update requiring sufficient available balance. Database constraints reject negative available, pending, or reserved balances.

No new authoritative mutable wallet balance is introduced. Existing wallet balance columns remain projections because they are required by the current application model; reconciliation detects divergence rather than treating them as the accounting ledger.

## Recovery and reconciliation

`WalletService.reconcileWallet()` reports:

- authoritative accounting balance;
- projected settled balance;
- pending balance;
- difference;
- `MATCHED` or `DIVERGED` status.

A `DIVERGED` wallet must not be silently repaired by editing balances. Operators must identify the missing/incorrect accounting or projection event and apply a documented corrective/reversal journal through the financial domain.

## Scope boundary

CORE-003 does not implement external payment-provider/Monime integration, settlement, product, or inventory changes. Provider integration remains deferred by project decision.

## Promotion and verification

The CORE-003 implementation must be promoted only after the complete CORE-001, CORE-002, and CORE-003 security, invariant, type-check, build, dependency, configuration, and artifact gates pass against the exact promotion head.
