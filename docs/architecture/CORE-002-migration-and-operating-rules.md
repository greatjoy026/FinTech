# CORE-002 — Migration and Operating Rules

## Migration policy
The accounting schema is introduced by an explicit Prisma migration. Production changes must use `prisma migrate deploy`; schema changes must never be applied through ad-hoc production table edits.

## Posting transaction
A financial posting performs account validation, idempotency lookup, journal creation, line creation, and journal posting in one PostgreSQL `SERIALIZABLE` transaction. If any stage fails, the entire transaction is rolled back.

## Database enforcement
Application validation is defense in depth. PostgreSQL additionally enforces:
- positive monetary amounts;
- three-letter uppercase currency format;
- foreign-key integrity;
- active-account/currency checks before posting;
- balanced debits and credits before posting;
- valid journal state transitions;
- immutability of posted journal lines.

## Corrections
Accounting history is append-only at the line level after posting. A mistaken posting is corrected by a new reversal or adjustment journal, not by editing/deleting the original lines.

## Operational reconciliation
Future reconciliation processes must compare external/provider/operational records against the authoritative journal. They must never repair discrepancies by directly changing accounting balances.

## Failure handling
- Serialization failures are retried a bounded number of times.
- Idempotency-key conflicts are detected by request fingerprint.
- Domain failures return typed errors.
- Database failures propagate to the existing centralized error boundary.
- No queue, webhook, provider, or product workflow is allowed to create a financial effect without a successful accounting transaction.
