# CORE-001 SEC-019 — Production Access Control, IAM & Privileged Operations

## Implemented repository controls

- Application roles are authoritative on the server; JWTs identify the principal and the current role is reloaded from trusted server-side user state.
- Privileged operations have a dedicated `admin:privileged` permission and an explicit operation allow-list.
- Privileged authorization decisions are audited through the authoritative `AuditService`.
- Authorization is fail-closed and generic `Forbidden` responses are used.
- Security-sensitive source paths are covered by `.github/CODEOWNERS`.
- GitHub Actions workflows use least-privilege `contents: read` permissions.
- SEC-019 has a dedicated regression gate and is included in the CORE-001 Security Gate.

## Privileged operation model

`PRODUCTION_ACCESS`, `SECURITY_CONFIGURATION`, `BACKUP_RECOVERY_ADMINISTRATION`, and `IDENTITY_ADMINISTRATION` are reserved operation classes. Application code must call `requirePrivilegedOperation()` rather than infer authority from request body, query string, URL parameters, or client-provided roles.

This boundary is an authorization control, not a replacement for infrastructure IAM.

## GitHub verification

Repository inspection on 2026-09-05 found **no active repository rulesets**. The available integration could not read branch protection because GitHub returned HTTP 403 for the branch-protection endpoint. Therefore this task does not falsely claim that main-branch protection, required CODEOWNER reviews, required status checks, or environment protection are enabled.

`CODEOWNERS` is present and covers authentication, configuration, audit, reliability, deployment, workflow, and deployment directories. Its enforcement depends on GitHub branch/ruleset configuration.

## IAM / infrastructure boundary

The repository cannot establish cloud IAM, production database roles, backup-admin roles, MFA policies, break-glass identities, or cloud OIDC trust. Those are operator/platform controls and must be configured outside source control. Production deployment must use distinct identities for CI, application runtime, database administration, and backup/recovery administration.

No credentials, secrets, access tokens, or provider keys are stored in this repository.

## Required production IAM controls

1. Human production access requires MFA and least privilege.
2. Routine application identities must not have database-owner or backup-administrator privileges.
3. CI deployment identity must be restricted to deployment operations and must not inherit runtime application privileges.
4. Production and non-production identities must be separate.
5. Break-glass access must be separately protected, time-bound, logged, and reviewed after use.
6. Database administrative credentials must not be available to application containers.
7. Backup encryption keys must be separated from application runtime credentials.
8. Privileged access must be auditable and periodically reviewed.

## Evidence policy

A repository regression pass proves only repository-enforced controls. It does not prove the external IAM requirements above. Before production go-live, the operator must attach evidence for GitHub protection, identity/MFA configuration, cloud IAM, database roles, backup access, and break-glass controls.

## Scope exclusions

No wallet, ledger, payment, settlement, product, inventory, or Monime implementation was changed by SEC-019. Monime remains deferred.
