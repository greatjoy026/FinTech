# CORE-004 — Payment & Transaction Processing Foundation

## Scope
CORE-004 establishes the canonical payment intent/attempt domain and a provider-agnostic boundary. It does not integrate Monime or any other external provider.

## Lifecycle
`CREATED -> REQUIRES_ACTION/PENDING/PROCESSING -> SUCCEEDED/FAILED/CANCELLED/EXPIRED`.
Terminal states cannot transition further.

## Financial integrity
Provider status is not itself an accounting entry. A successful provider result must cross an explicit settlement boundary before CORE-002 journals or CORE-003 wallet mutations occur. This prevents duplicate or fabricated financial effects.

## Idempotency
Payment intents require a unique idempotency key and request hash. Reuse with different parameters is rejected. Transaction attempts also have unique idempotency keys and `(paymentIntentId, attemptNumber)` uniqueness.

## Provider boundary
`PaymentProviderAdapter` is the only provider integration boundary. No provider credentials, signatures, URLs, or Monime-specific behavior are introduced by CORE-004.

## Ownership
Payment reads/cancellation require the owning authenticated user. Administrative access must use the existing privileged-operation/RBAC boundary when exposed through an admin controller.

## Deferred work
External provider implementation, webhook reconciliation, authorization/capture/refund provider semantics, receipt/notification delivery, and wallet credit/debit settlement adapters remain explicit follow-on work and must not be simulated by CORE-004.
