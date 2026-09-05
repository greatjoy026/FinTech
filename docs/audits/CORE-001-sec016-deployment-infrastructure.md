# CORE-001 SEC-016 — Production Deployment & Infrastructure Hardening

## Purpose
This task establishes repository-level production deployment controls without claiming cloud-provider controls that are outside the repository.

## Verified repository controls
- Production image uses a multi-stage Node 22 Alpine build.
- Runtime image runs as UID/GID `10001:10001`, not root.
- Runtime filesystem is read-only in the production Compose baseline.
- `/tmp` is an isolated, bounded tmpfs with `noexec` and `nosuid`.
- Linux capabilities are dropped and `no-new-privileges` is enabled.
- Process count, memory, and CPU limits are bounded in the Compose baseline.
- Container stop signal is SIGTERM and the application has a bounded graceful shutdown lifecycle from SEC-015.
- Secrets are supplied through an operator-managed environment file; credentials are not copied into the image.
- `.dockerignore` excludes `.env` files, logs, local dependencies, and build output from the build context.
- Image selection is explicit through `FINTECH_IMAGE`; operators should use immutable digests rather than mutable tags.
- Application healthcheck targets `/api/health`; orchestration should use `/api/ready` for dependency-aware readiness.
- Production trusted-proxy configuration is explicit through `TRUST_PROXY` and fails closed when absent.
- Database migration execution is explicit through `npm run db:migrate:deploy` and is intentionally separate from application startup.

## Deployment sequence
1. Build and scan the image in CI.
2. Publish the image using an immutable digest.
3. Provision secrets through the deployment platform, never through source control or the image.
4. Verify PostgreSQL and Redis endpoints and credentials are reachable from the application network.
5. Run `npm run db:migrate:deploy` as a release/migration step using the exact application image or release environment.
6. Start the application using the immutable image.
7. Wait for `/api/ready` before routing traffic.
8. Route external TLS traffic through a managed reverse proxy/load balancer. TLS termination is an infrastructure responsibility and must be configured there.
9. During rollout, keep the previous healthy revision available until the new revision is ready.
10. Roll back the application image if health/readiness fails. Database migrations must be backward-compatible before rollout; destructive schema changes require a separate expand/contract release.

## Trusted proxy and TLS
`TRUST_PROXY=1` is appropriate only when exactly one trusted reverse-proxy hop sits in front of the application. Use `2` only when two trusted hops are guaranteed. Do not enable proxy trust merely because a request contains `X-Forwarded-For`.

TLS certificates, HSTS policy, firewall/security groups, load-balancer configuration, DNS, and private networking must be configured and verified in the actual deployment environment. They are not falsely represented as repository-enforced controls.

## Resource and connection policy
The supplied Compose baseline uses a 768 MiB memory limit, one CPU, and a 256-process limit as conservative starting points. Operators should load-test and tune these values before production. PostgreSQL and Redis connection capacity must be sized consistently with the number of application replicas and database limits.

## Migration and rollback policy
Never run destructive migrations automatically during application process startup. Use `prisma migrate deploy` as a separately observable release step. Prefer additive changes first, deploy compatible application code, migrate data, then remove obsolete schema in a later release.

A failed application deployment may be rolled back to the previous image. A database migration is not automatically reversible; schema changes therefore require expand/contract planning and a tested recovery path.

## Secrets
Required production secrets remain deployment-time values. Do not put them in Docker build arguments, Dockerfiles, Compose source, GitHub workflow YAML, browser bundles, or image labels. Rotate credentials through the secret manager and redeploy; never commit replacement secrets.

## What is not claimed
This repository does not claim to have verified:
- a specific cloud provider's IAM policies
- actual firewall/security-group rules
- production TLS certificates
- managed PostgreSQL/Redis backup settings
- registry signing or admission-controller enforcement
- a real production migration or rollback drill
- a real production container scan result

Those controls must be verified in the target infrastructure before go-live.
