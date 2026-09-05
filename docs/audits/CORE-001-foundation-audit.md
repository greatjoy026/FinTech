# CORE-001 — FinTech Foundation Audit

**Status:** Baseline audit complete — remediation planning
**Branch:** `remediation/core-001-foundation`
**Audited baseline:** `main` at `bd765fb283be2afb1ffbe0172cd7d3ea891a71fb`
**Scope:** Security, identity, financial integrity, database, payments, webhooks, queues, realtime, QA, operations, and architecture.

## Executive Decision

The repository is an architectural prototype/foundation, not production-ready for real-money operations. Do not expand high-risk financial functionality until the P0 security controls and P1 financial invariants below are implemented and tested.

## P0 — Critical Findings

### SEC-001 — Client-controlled role assignment
`POST /api/auth/verify-otp` accepts `role`, and `AuthService.verifyOtpAndLogin()` uses that value when updating or creating a user. The login UI explicitly allows selecting ADMIN, MERCHANT, SCHOOL, NGO, and other roles. This creates a privilege-escalation path.

**Required remediation:** remove role from the authentication trust boundary. Resolve roles only from a trusted server-side identity/organization record. Role changes must use an authorized administrative workflow and audit trail.

### SEC-002 — Hardcoded authentication secrets/test credentials
Authentication has a fallback JWT secret and a fixed OTP. The provider integration also has a fallback token. These must not exist in production code paths.

**Required remediation:** fail fast when required secrets are absent; generate cryptographically random OTPs; hash OTPs at rest where appropriate; enforce expiry, attempt limits, replay protection, and delivery-provider integration.

### SEC-003 — Firestore authorization model is unsafe
The Firestore rules permit public reads/lists and unauthenticated writes for users, sessions, and OTP documents. Schema validation does not compensate for exposing authentication/session material publicly.

**Required remediation:** use a trusted server-side Firestore access model and deny public access to sessions/OTP/authentication data. Rework the client/server Firebase boundary before production.

### SEC-004 — Webhook signature verification disabled
The Monime webhook controller reads the signature but the verification code is commented out.

**Required remediation:** verify the provider signature over the exact raw request body before parsing/trusting the event; reject invalid signatures; persist verified event identity; make processing idempotent.

### SEC-005 — Realtime admin subscription is unauthenticated
The Socket.IO gateway accepts an arbitrary token and joins the caller to `admin-room` without verification.

**Required remediation:** authenticate the socket connection and authorize room membership server-side. Never expose operational/admin events to unauthenticated clients.

## P1 — Financial Integrity Findings

### FIN-001 — Wallet transfers bypass the ledger
`WalletService.transfer()` directly changes wallet balances and explicitly skips wallet-to-ledger account mapping. This allows wallet state and accounting state to diverge.

**Required remediation:** make the ledger authoritative. A transfer must create a balanced journal transaction and associated wallet state changes within an atomic consistency boundary.

### FIN-002 — Ledger API only models one debit and one credit
The ledger engine currently accepts exactly one debit account, one credit account, and one amount. The domain requires multi-line journals for fees, taxes, settlement, suspense, FX, reversals, and other real financial events.

**Required remediation:** introduce a journal + journal-line model/API and enforce `sum(debits) == sum(credits)` before posting.

### FIN-003 — Ledger balance cache can become non-authoritative
`LedgerAccount.balance` is documented as a quick reference while calculated balance is derived from entries. There is no invariant/verification mechanism ensuring the cached balance stays synchronized.

**Required remediation:** define the cache as a projection, update it atomically with journal posting, and provide reconciliation/invariant checks.

### FIN-004 — Wallet transfer concurrency risk
The transfer checks the balance and then decrements it. The implementation does not establish a clear row-locking or optimistic-concurrency invariant for concurrent withdrawals/transfers.

**Required remediation:** implement database-level concurrency control and test simultaneous transfers against the same wallet.

### FIN-005 — No general idempotency layer
Payment, transfer, payout, webhook, refund, and settlement operations require durable idempotency semantics.

**Required remediation:** add an operation/idempotency record with actor, operation, request hash, state, response metadata, and expiry; enforce uniqueness at the database layer.

## P1 — Payment and Event Processing

### PAY-001 — Provider integration is still mocked
Payment intent creation returns a fabricated checkout URL and the actual provider request is commented out. Payment status verification returns `SUCCESS` without contacting the provider.

**Required remediation:** isolate provider adapters from financial posting, implement real provider calls, timeouts, retries, provider-reference tracking, and explicit state transitions.

### PAY-002 — Webhook processing uses `setImmediate`
The webhook endpoint performs asynchronous financial processing after returning HTTP 200. This is not durable and can lose work on process restart.

**Required remediation:** verify and persist the event, enqueue a durable job, then acknowledge only according to the provider contract.

### PAY-003 — Queue processors are placeholders
BullMQ workers currently log jobs and contain comments for future financial work.

**Required remediation:** implement durable workers with retry policy, idempotency, dead-letter handling, structured logging, and reconciliation of failed jobs.

## Database Findings

- Financial status/type/role/currency fields are mostly unconstrained strings.
- Wallet `userId` has no relational integrity with the external identity store.
- Missing explicit transfer, payment-attempt, refund, chargeback, settlement-batch/item, reconciliation-run/item, hold/reservation, and idempotency domain models.
- Approval workflow has a simple status field rather than a complete state machine.
- Financial mutation records need stronger immutability and reversal semantics.

## Authorization Findings

Two role vocabularies currently coexist:

1. Authentication roles such as `ADMIN`, `CUSTOMER`, `MERCHANT`, `SCHOOL`, `NGO`, and `PAYROLL_MANAGER`.
2. RBAC roles such as `super_admin`, `finance_officer`, `fraud_analyst`, `compliance_officer`, and vertical-specific roles.

**Decision:** establish one canonical authorization model: identity → organization/tenant → role → permission → resource/action. Frontend route guards are UX controls only; backend authorization is authoritative.

## API/Operations Findings

The Express bootstrap currently has minimal middleware and protection. Before production it needs, at minimum, strict request validation, rate limiting, security headers, request correlation IDs, structured error handling, strict CORS, body-size limits, graceful shutdown, health/readiness checks, and consistent API versioning.

Reporting currently requires authentication but lacks a clearly enforced export permission. CSV generation also uses naive comma joining and requires proper escaping.

## QA Baseline

No meaningful automated financial/security test suite was identified in the audited tree.

Required test layers:

- unit tests for domain invariants
- database/integration tests
- API contract tests
- authentication/authorization security tests
- webhook signature and replay tests
- idempotency tests
- concurrent transfer/withdrawal tests
- ledger balance and double-entry invariant tests
- provider failure/retry tests
- end-to-end critical user journeys

## Definition-of-Done Gate

A financial feature is **not Done** unless:

- architecture boundary is approved
- backend authorization is enforced
- inputs are validated
- financial mutations are atomic
- ledger invariants pass
- idempotency is implemented where required
- concurrency behavior is proven
- audit evidence exists
- failure/retry/reversal behavior is defined
- automated tests pass
- operational logging/monitoring exists
- documentation is updated
- security review passes

## Remediation Sequence

1. **SEC-001** Remove client-controlled roles.
2. **SEC-002** Remove hardcoded/fallback auth/provider secrets and OTP.
3. **SEC-003** Lock down Firestore authentication/session data.
4. **SEC-004** Implement webhook signature verification and durable event intake.
5. **SEC-005** Secure realtime authorization.
6. **AUTHZ-001** Establish canonical roles/permissions.
7. **FIN-001** Establish authoritative ledger/journal model.
8. **FIN-002** Integrate wallet operations with ledger.
9. **FIN-003** Add idempotency and concurrency controls.
10. **PAY-001** Replace mocked provider flows with a provider adapter.
11. **OPS-001** Harden Express/Redis/DB operational behavior.
12. **QA-001** Build the automated financial/security test foundation.
13. **RECON-001** Implement settlement/reconciliation controls.
14. Resume vertical business-module expansion only after the foundation gate passes.

## Explicit Scope Boundary

This audit does **not** redesign the inventory/product domain, school product workflows, merchant UX, or other vertical business features. Those remain separate tasks. The objective is to make the shared platform safe enough to support them.
