# CORE-001 SEC-017 — Production CI/CD & Release Governance Hardening

## Purpose
Establish a controlled release boundary in GitHub Actions so production candidates are reproducible, security-gated, immutable, auditable, and protected against concurrent promotion.

## Release model
1. Development work is validated by the existing CORE-001 Security Gate.
2. A production candidate is created only from a semantic-version tag (`vMAJOR.MINOR.PATCH`).
3. The release workflow checks out the exact tag commit and runs the release governance, security, type-check, and build gates.
4. A Docker image is built from that exact source and pushed to GHCR.
5. The resulting image digest is captured in a release manifest.
6. Build provenance is enabled and an attestation is published through GitHub's supported provenance action.
7. Production promotion is a separate manual workflow and accepts only an `@sha256:` image reference plus the associated release tag.
8. The production workflow targets the GitHub `production` environment boundary and uses non-canceling concurrency so two production promotions cannot run simultaneously.
9. The application image is immutable; environment-specific secrets remain deployment-time configuration.
10. Database migration remains a separate explicit `prisma migrate deploy` release step. Destructive changes require expand/contract compatibility and a recovery plan.

## CI/CD security controls
- Frozen dependency installation with `npm ci`.
- Existing CORE-001 security suite remains mandatory.
- Release-specific regression gate validates workflow controls, migration structure, immutable image requirements, provenance configuration, and deployment invariants.
- Production promotion rejects mutable tags.
- Release and production deployment concurrency use `cancel-in-progress: false`.
- Release workflow does not receive production credentials.
- No credentials are embedded in images, build arguments, labels, or workflow source.

## Provenance
The release workflow enables Docker BuildKit provenance and publishes a GitHub build provenance attestation for the pushed image digest. This establishes a verifiable build-to-source provenance artifact at the GitHub Actions level. It does not by itself prove registry admission enforcement or downstream cloud deployment policy.

## Environment separation
The repository defines a separate `production` GitHub Actions environment as the promotion boundary. Repository workflow source cannot verify whether organization/repository administrators have configured required reviewers, deployment restrictions, or environment secrets, so those settings are an explicit operator verification item rather than a falsely claimed control.

## Migration governance
Never make application startup implicitly perform schema migration. Use `npm run db:migrate:deploy` as a separately observable release operation. Prefer additive schema changes, deploy backward-compatible application code, migrate data, and remove obsolete schema only in a later compatible release.

## Rollback
Application rollback means promoting the previous known-good immutable image digest. Database rollback is not assumed to be automatic; migrations must be backward-compatible or have a tested recovery procedure. A failed application rollout must not silently mutate the database.

## Release auditability
Every candidate records:
- semantic release tag
- exact Git commit
- immutable image digest
- source repository/commit reference
- GitHub Actions workflow execution
- provenance attestation

The release manifest is uploaded as a workflow artifact. Production promotion records the release and digest in workflow logs.

## What is not claimed
This task does not claim:
- actual production deployment execution
- cloud-provider OIDC trust configuration
- organization-level environment reviewers or branch protection configuration unless separately verified
- registry admission enforcement
- production database migration or rollback drill
- production infrastructure availability

Those controls remain deployment-environment verification items.

## Scope exclusions
Wallet, ledger, payment, settlement, product, inventory, and Monime provider execution remain unchanged. Monime remains deferred by project decision.
