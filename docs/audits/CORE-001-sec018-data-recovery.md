# CORE-001 SEC-018 — Production Data Protection, Backup, Recovery & Business Continuity

## Status
Implemented at repository level and verified by automated CI controls. Actual production-provider backup, encryption, replication, and restore execution remain infrastructure/operator responsibilities and are explicitly not claimed here.

## Controls

### 1. Recovery objectives
SEC-015 established target objectives of RPO 15 minutes and RTO 60 minutes. SEC-018 carries those targets into the backup and restore runbook.

### 2. PostgreSQL protection
PostgreSQL is authoritative application state. Production requires encrypted backups, continuous WAL/PITR capability, geographically/failure-domain-separated retention where supported, monitored backup freshness, and recovery testing. The application runtime must not have administrative authority over its own backup set.

### 3. Restore validation
Restores must first occur in an isolated recovery environment. Validation includes connectivity, Prisma migration compatibility, application health/readiness, referential integrity, representative data checks, and—where applicable—financial reconciliation before promotion. No financial records are fabricated during recovery.

### 4. Redis/BullMQ
Redis is operational infrastructure and is not treated as the financial source of truth. Recovery requirements and failure handling are documented. Durable application state and queue retry behavior remain the recovery boundary.

### 5. Access and secrets
Backup credentials and encryption keys must remain outside Git and application logs. Backup administration is separated from application runtime access. Temporary recovery environments inherit production data sensitivity and must use equivalent access controls.

### 6. Restore drills
Restore validation is required at least quarterly and after material backup/infrastructure changes. Exercises must measure actual recovery point and recovery time and record evidence/findings.

### 7. Business continuity
Incident handling follows a controlled sequence: declare incident, identify recovery point, isolate writes if necessary, restore to isolated environment, validate, approve promotion, deploy a compatible immutable artifact, restore traffic, monitor, and retain incident evidence.

### 8. Migration governance
Production schema changes continue to use `prisma migrate deploy` under SEC-017 release governance. Restored databases must not be subjected to arbitrary migration sequences without verifying application/schema compatibility.

### 9. Repository verification boundary
Automated checks validate that the runbook, recovery objectives, deployment contracts, migration command, Redis/queue lifecycle boundary, and CI regression gate remain present. They cannot prove a real cloud database's encryption, backup schedule, PITR archive, replica health, or restore success. Such evidence must be captured from production infrastructure during operational verification.

## Non-goals / exclusions
- No wallet, ledger, payment, settlement, product, or inventory redesign.
- Monime remains deferred.
- No production credentials or keys are stored in the repository.
- No production backup/restore result is fabricated.
