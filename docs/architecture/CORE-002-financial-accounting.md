# CORE-002 — Financial Accounting Architecture

## Purpose
CORE-002 establishes the authoritative accounting boundary for the FinTech platform. New financial effects must be represented by immutable, balanced, double-entry journals in PostgreSQL.

## Source of truth
`FinancialJournal` and `FinancialJournalLine` are the **authoritative financial source of truth** for new financial activity. The pre-existing `JournalTransaction`, `LedgerEntry`, and `LedgerAccount` models remain for compatibility but are not authoritative for new CORE-002 postings.

Wallet fields such as `availableBalance`, `pendingBalance`, and `reservedBalance` are operational projections. **Wallet balances are not authoritative accounting state.** The `FinancialWalletAccount` mapping associates a wallet with exactly one accounting account; future wallet workflows must post accounting entries rather than silently mutating a monetary balance.

## Double-entry invariant
Every posted journal must contain at least two positive lines and:

`sum(DEBIT amounts) = sum(CREDIT amounts) > 0`

All lines must reference active accounts whose three-letter ISO-style currency code matches the journal currency. Amounts are integer minor units represented by PostgreSQL `BIGINT` and TypeScript `bigint`; no floating-point money arithmetic is permitted.

## Journal lifecycle
- `DRAFT`: lines may be assembled inside the posting transaction.
- `POSTED`: immutable accounting event. Posting is allowed only from `DRAFT` and requires a balanced journal.
- `VOIDED`: terminal administrative state for a posted journal. A void does not delete or rewrite history; financial correction should be represented by a separate reversal/adjustment journal.

Posted journal lines cannot be updated or deleted by database trigger enforcement.

## Idempotency
Every journal has a unique `idempotencyKey` and a SHA-256 `requestHash`. Repeating the same key and equivalent request returns the original journal. Reusing the key for a different request fails with an idempotency conflict. Posting executes under PostgreSQL `SERIALIZABLE` isolation to protect the check/create/post sequence against concurrent requests.

## Balance calculation
Account balance is derived from posted journal lines:
- ASSET and EXPENSE: debits increase normal balance; credits decrease it.
- LIABILITY, EQUITY and REVENUE: credits increase normal balance; debits decrease it.

There is deliberately no mutable `balance` column on `FinancialAccount`. This prevents a second authoritative monetary state from drifting away from the journal.

## Holds / reservations boundary
`FinancialHold` models a reservation relationship and lifecycle without creating money. A hold is not a posted accounting transaction by itself. Capture/release workflows must later be implemented as explicit domain operations that create the appropriate journals and state transitions atomically.

## Wallet mapping
`FinancialWalletAccount` is a one-to-one mapping between a wallet and its accounting account. It does not automatically change wallet balances and does not introduce a provider integration.

## Error policy
Financial domain failures use typed, non-sensitive error codes. API layers must map them to safe client responses without exposing SQL, account internals, credentials, or stack traces.

## Out of scope
- Monime/provider activation.
- Payment checkout/provider execution.
- Settlement/reconciliation workflows.
- Product verticals.
- Inventory.
- Regulatory certification.
