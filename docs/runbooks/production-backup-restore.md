# Production Backup & Restore Runbook

## Purpose
Provide a controlled procedure for protecting and recovering FinTech production data. This runbook complements SEC-015 recovery objectives and SEC-016/017 deployment governance.

## Recovery objectives
- Target RPO: **15 minutes**.
- Target RTO: **60 minutes**.
- These are engineering targets, not evidence that a particular cloud/database provider currently meets them.

## Data classification
PostgreSQL contains authoritative application state and must be treated as sensitive production data. Backup copies inherit the sensitivity of the source database. Redis/BullMQ state is operational state and is recoverable from durable application data plus queued work; it must not be treated as the financial system of record.

## Backup requirements
1. Use managed PostgreSQL backups or an equivalent operator-controlled backup system.
2. Enable point-in-time recovery (PITR) using continuous WAL/archive retention sufficient to meet the 15-minute RPO target.
3. Keep backups encrypted at rest using provider-managed or customer-managed keys according to the production threat model.
4. Keep backup access separate from application runtime credentials. The application must not receive permissions to delete or administer its own backup set.
5. Store backups outside the primary failure domain where supported.
6. Apply retention according to the approved operational/data-retention policy; do not place credentials or backup keys in Git.
7. Monitor backup freshness and failure status.

## Restore procedure
1. Declare the incident and identify the latest known-good recovery point.
2. Stop or isolate application writes if continued writes could worsen corruption or create ambiguity.
3. Restore into an isolated recovery environment first.
4. Verify database connectivity, Prisma schema compatibility, application startup, and critical health/readiness checks.
5. Validate representative records and referential integrity. For financial domains, reconciliation must be performed before restored data is promoted; this runbook does not simulate or alter financial records.
6. Record the recovery point, restore duration, validation results, and operator approvals.
7. Promote the recovered environment only after application and data validation succeeds.
8. Use the SEC-017 immutable release artifact that is compatible with the restored schema.
9. Re-enable traffic and monitor errors, queue depth, readiness, and audit/security events.
10. Preserve incident evidence and document gaps discovered during recovery.

## Migration safety
Database migrations must run through the governed release process using `prisma migrate deploy`. Do not restore a database and blindly run arbitrary historical migrations. Confirm the application version and schema migration state before promotion. Destructive or irreversible schema changes require a separately approved recovery strategy.

## Redis/BullMQ recovery
Redis is a dependency, not the authoritative financial record. If Redis is lost, recover the service according to its infrastructure configuration and allow durable application workflows to reconstruct/retry work where supported. Do not manually invent financial outcomes to compensate for missing queue state. Production Redis persistence, replica/failover configuration, and recovery point must be verified at infrastructure level.

## Restore testing cadence
- Perform a documented restore validation at least quarterly and after material backup/infrastructure changes.
- Test both latest-backup restore and PITR to a selected recovery point.
- Measure actual RPO/RTO during the exercise.
- Track findings to remediation issues.

## Security controls
- Never put database passwords, cloud credentials, encryption keys, backup URLs containing secrets, or provider tokens in the repository or logs.
- Backup operators should have only the permissions required to create, inspect, restore, and retain backups.
- Restore environments must have production-equivalent access controls and must not expose restored data publicly.
- Destroy temporary recovery copies according to the approved retention policy after validation.

## Infrastructure verification boundary
The repository can enforce configuration contracts and recovery procedures, but it cannot prove that a real production database is encrypted, backed up, replicated, or restorable without access to the production infrastructure. Those controls must be verified by the deployment/infrastructure operator and evidenced in the operational record.
