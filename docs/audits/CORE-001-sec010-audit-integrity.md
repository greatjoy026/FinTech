# CORE-001 SEC-010 — Audit Logging & Security Event Integrity

## Trust boundary

`AuditService` is the authoritative application write path for security and administrative audit events. Callers provide the server-derived principal and operation context; clients never define the authoritative actor, role, timestamp, outcome, or integrity hash.

## Event contents

Each event records actor ID, role, action, resource/resource ID, outcome, request correlation ID when available, server-derived IP/device context, optional before/after state, and sanitized metadata.

Sensitive keys such as authorization/cookies/tokens/secrets/passwords/OTPs/API keys/card security values are redacted before persistence.

## Integrity

Each event receives a SHA-256 digest over the canonical event representation. Integrity verification uses a timing-safe comparison. The database enforces uniqueness and non-nullability of `integrityHash` after the SEC-010 migration.

This is tamper-evidence at the application/data boundary; database administrators with direct write access remain outside the application trust boundary.

## Mutation/deletion policy

The application does not expose update/delete operations for audit records. The former duplicate legacy audit service under `src/backend/audit/` was removed so there is one authoritative application audit write path. Future administrative tooling must treat audit records as append-only. Retention/archival should be implemented as controlled infrastructure rather than destructive application CRUD.

## Failure semantics

Security/administrative events that are explicitly recorded through `AuditService.record()` propagate persistence errors to the caller. They must not be converted into successful business responses. This provides fail-closed behavior for the protected operation currently instrumented by SEC-010.

## Correlation

SEC-008 request IDs are accepted as correlation context. SEC-009 rate-limit responses remain generic and are not used as a substitute for audit records. Financial state remains outside this task's scope and is not simulated or mutated by audit code.

## Migration

Apply `prisma/migrations/20260905190000_sec010_audit_integrity/migration.sql` through the normal controlled deployment migration process before enabling the strengthened schema in an existing environment.
