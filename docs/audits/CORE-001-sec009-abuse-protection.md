# CORE-001 SEC-009 — Application Abuse Protection & Rate-Limit Boundary

## Status

Implemented on `remediation/core-001-sec009-abuse-protection`.

## Boundary

SEC-006 remains authoritative for authentication-specific throttling: OTP request/verification and refresh-token serialization are not duplicated here.

SEC-009 protects authenticated, non-authentication API operations that can be repeatedly invoked by a client:

- `/api/protected`: 120 requests/minute per authenticated user.
- `/api/admin-only`: 60 requests/minute per authenticated user.
- `/api/reports/*`: 60 requests/minute per authenticated user, after authentication and admin authorization.

The health endpoint and deferred Monime webhook endpoint are intentionally excluded. Webhook ingestion remains governed by its existing signature/deduplication boundary and deferred provider-contract work.

## Enforcement

- Development/test environments use a bounded in-process fallback so local verification does not require Redis.
- Production uses Redis for distributed counters, supporting multiple API instances.
- Production fails closed when Redis cannot enforce the mandatory abuse control.
- Counters use SHA-256-derived Redis keys; raw identities are not stored in keys.
- Authenticated requests are keyed by the server-validated user ID.
- Anonymous requests use Express's server-derived `req.ip` only.
- The limiter does not parse `X-Forwarded-For` or other client-controlled forwarding headers.
- `TRUST_PROXY` remains an explicit deployment setting. It must only be enabled when the deployment's trusted reverse proxy strips/replaces untrusted forwarding headers.
- `429` responses are generic and include `Retry-After` plus the request correlation ID.

## Operational assumptions

Rate limits are abuse controls, not business authorization or financial invariants. They must never be treated as a substitute for authentication, authorization, idempotency, ledger controls, payment-provider verification, or fraud detection.

Limits are intentionally conservative at this foundation stage and should be tuned from observed traffic after product-specific endpoints are introduced. New sensitive endpoints must explicitly opt into a documented limiter rather than inheriting a broad global limit that could interfere with durable workers or health checks.

## Verification

The CI security workflow must execute:

- `npm run security:verify`
- `npm run auth:security:verify`
- `npm run authorization:security:verify`
- `npm run api:security:verify`
- `npm run abuse:security:verify`
- TypeScript compilation
- Production build

No credentials or simulated financial effects are introduced by SEC-009.
