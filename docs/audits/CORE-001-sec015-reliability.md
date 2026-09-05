# CORE-001 SEC-015 — Production Reliability, Resilience & Disaster-Recovery Foundations

## Reliability boundary

This task hardens the application lifecycle and infrastructure dependency behavior. It does not implement or simulate financial-domain recovery logic.

### Startup
- Production configuration validation remains fail-fast.
- Fatal asynchronous startup errors terminate the process rather than leaving a partially initialized service running.
- Queue processor initialization is isolated and logged without exposing secrets.

### HTTP shutdown
- SIGTERM and SIGINT initiate one shared, idempotent shutdown promise.
- New HTTP connections stop accepting work through `server.close()` while in-flight requests are allowed to drain.
- A bounded shutdown timer prevents indefinite process hangs.
- Socket.IO connections, BullMQ workers/events/queues, and Prisma are closed before shutdown completes.
- Repeated shutdown signals do not start competing teardown flows.

### Liveness and readiness
- `/api/health` is process liveness only and must remain lightweight.
- `/api/ready` checks PostgreSQL and, when Redis is enabled, Redis connectivity.
- Failed required dependencies return HTTP 503 and a generic status payload; credentials, stack traces, and topology are never returned.
- Redis readiness uses a short timeout and disables offline queueing so a dead Redis instance is not mistaken for a healthy dependency.

## Queue resilience

- BullMQ jobs are persisted in Redis rather than held only in process memory.
- Webhook jobs use deterministic job IDs to prevent duplicate enqueueing of the same event.
- Existing retry policy uses five attempts with exponential backoff for webhook processing.
- Workers are closed gracefully so active jobs can complete or be returned to the queue according to BullMQ lifecycle semantics.
- Payout execution remains intentionally disabled; SEC-015 does not introduce fake provider or financial effects.
- If Redis is unavailable, durable enqueue operations fail rather than acknowledging work as successfully queued.

## Failure-mode policy

| Failure | Expected behavior | Recovery |
|---|---|---|
| PostgreSQL unavailable | Readiness 503; API errors remain generic | Restore DB connectivity; restart only if required |
| Redis unavailable with `ENABLE_REDIS=true` | Readiness 503; durable queue operations fail closed | Restore Redis and allow workers to reconnect/restart |
| Redis disabled | Queue processors remain unavailable; no simulated work | Enable/configure Redis before production queue use |
| Worker/process crash | Persisted BullMQ jobs remain recoverable in Redis | Restart worker/process; inspect failed jobs |
| SIGTERM/SIGINT | Graceful bounded shutdown | Platform restarts process according to deployment policy |
| Shutdown timeout | Error logged without secrets; non-zero exit | Investigate stuck dependency/request and restart |

## Recovery objectives

Initial operational targets for the platform foundation:

- **RPO:** 15 minutes for production PostgreSQL data, subject to the selected managed-database backup/PITR capability.
- **RTO:** 60 minutes for restoration of the API and required infrastructure under normal incident conditions.

These are service objectives, not proof that the current deployment provider meets them. Before production launch, the infrastructure owner must validate that the selected database/Redis/deployment services and backup policies can satisfy them.

## Backup and restore runbook

1. Configure automated PostgreSQL backups and point-in-time recovery with retention sufficient for the approved RPO.
2. Keep backup credentials and encryption keys outside the repository and application logs.
3. Document the database provider, backup retention, restore mechanism, and authorized operators in the deployment environment.
4. For a destructive incident, stop writes or place the affected service into an approved maintenance state before restore.
5. Restore the database to the selected recovery point using the provider's supported mechanism.
6. Validate schema compatibility and run application readiness checks.
7. Validate application invariants and reconciliation controls before returning financial operations to normal.
8. Restore application capacity and queue workers.
9. Review queued/failed jobs and process them through their normal idempotent domain handlers; do not manually fabricate financial outcomes.
10. Record the incident, recovery point, duration, data-loss assessment, and corrective actions.

### Restore testing requirement

A real restore drill must be performed in a controlled environment before production launch and periodically thereafter. This repository change does **not** claim that a provider backup or restore was executed, because no production infrastructure credentials or backup service was supplied.

## Monitoring and incident response

Use the existing structured logs, metrics, liveness/readiness endpoints, and security-event taxonomy from SEC-014. Recommended alert conditions include repeated readiness failures, rate-limit spikes, authentication failures, audit failures, and queue failure/retry growth.

During an incident:
1. Confirm scope using request IDs, metrics, and structured logs.
2. Protect financial operations first; do not bypass authorization or audit controls.
3. Determine whether PostgreSQL, Redis, application process, or external provider dependencies are degraded.
4. Restore infrastructure using the approved runbook.
5. Verify readiness and application invariants.
6. Reconcile outstanding asynchronous work before declaring recovery complete.
7. Document root cause and preventive actions.

## Verification boundary

CI validates reliability contracts, lifecycle wiring, dependency-aware readiness, queue shutdown/retry configuration, and regression gates. Runtime backup/restore execution and real infrastructure failover remain deployment-level responsibilities and must not be represented as completed by CI alone.

## Scope exclusions

- No wallet or ledger redesign.
- No payment-provider execution.
- No settlement redesign.
- No product/inventory changes.
- Monime integration remains deferred.
