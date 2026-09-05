# CORE-001 SEC-014 — Production Observability, Security Monitoring & Incident Response

## Purpose
Provide production-safe operational visibility without making observability a financial source of truth.

## Implemented controls
- Structured JSON logging through `backend/observability/logger.ts`.
- Recursive redaction of authorization, cookies, tokens, secrets, passwords, OTPs, private keys, API keys and card-security fields.
- Request correlation through the existing `X-Request-ID` middleware.
- HTTP request/error counters and Prometheus-compatible process metrics.
- Security event taxonomy covering authentication failures, refresh replay, authorization denial, rate limiting, audit failures, webhook rejection, configuration failure and privileged operations.
- Liveness endpoint: `GET /api/health`.
- Dependency readiness endpoint: `GET /api/ready`; currently verifies PostgreSQL and returns 503 when unavailable.
- Operational metrics endpoint: `GET /api/metrics`, protected by server authentication and admin authorization.
- Queue startup failures are logged without exposing exception contents.
- Existing abuse-limit 429 events are counted and security-logged.

## Security event policy
Never log credentials, access/refresh tokens, OTP values, authorization headers, cookies, payment-card security values, provider secrets, or full request bodies. Prefer stable identifiers, event names, request IDs, status codes, and bounded metadata.

## Monitoring thresholds
Initial alert thresholds are defined in `backend/observability/security-events.ts` and should be tuned after production baseline collection:

| Signal | Initial alert threshold |
|---|---:|
| Authentication failures | 20/minute |
| Authorization denials | 20/minute |
| Rate-limit responses | 30/minute |
| Audit failures | 1/minute |
| Webhook rejections | 10/minute |
| Readiness failures | 3/minute |

These are detection thresholds, not authorization rules.

## Health semantics
- **Liveness** answers whether the process can serve requests. It does not perform dependency checks.
- **Readiness** verifies required database availability and returns HTTP 503 if the dependency is unavailable.
- Neither endpoint returns credentials, connection strings, stack traces, internal topology, or dependency error details.

## Incident response
1. **Detect** — confirm alert/event, capture timestamp and request/correlation ID.
2. **Triage** — identify affected endpoint, actor class, scope, and blast radius from logs/metrics.
3. **Contain** — revoke affected sessions, restrict abusive principals, disable compromised operational access, or isolate infrastructure as appropriate. Do not mutate financial state solely from an observability signal.
4. **Preserve evidence** — retain relevant structured logs and audit records according to the approved retention policy; do not copy secrets into incident notes.
5. **Recover** — restore healthy dependencies/services, verify readiness, and confirm security gates before normal operation.
6. **Review** — document root cause, detection quality, containment actions, customer impact, corrective controls, and regression tests.

## Retention and minimization
Operational logs should have a defined retention period appropriate to deployment/compliance requirements, with access restricted to authorized operators. Do not retain request bodies by default. Audit records remain authoritative for security-sensitive actions; observability logs are diagnostic and non-authoritative.

## Deployment requirements
Use the deployment platform's centralized log/metrics/alert facilities to collect stdout/stderr and scrape the protected metrics endpoint. Configure alerts from the thresholds above and route them to the operational on-call process. Secrets must be supplied through the existing deployment secret mechanism; they must never be placed in logs or dashboards.

## Scope exclusions
Wallet, ledger, settlement, payment-provider execution, product/inventory domains, and Monime integration are unchanged. Monime remains deferred.
