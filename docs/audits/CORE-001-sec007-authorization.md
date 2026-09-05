# CORE-001 SEC-007 — Authorization & RBAC Hardening

## Status
Implemented on `remediation/core-001-sec007-auth`.

## Trust boundary
- The client may present an access token, but it cannot choose the role used for authorization.
- The JWT identifies the authenticated principal by `userId`.
- The authoritative current role is loaded from trusted server-side Firestore user data by `authenticate`.
- Invalid, missing, unknown, or stale roles fail closed.
- Frontend navigation/state is not an authorization boundary.

## Authorization policy
The server maintains one role set and permission map in `backend/auth/authorization.ts`.

Roles currently recognized by the policy:
`ADMIN`, `CUSTOMER`, `MERCHANT`, `SCHOOL`, `AGENT`, `DRIVER`, `NGO`, `EVENT_ORGANIZER`.

Current protected permissions:
- `read:own` — authenticated principal's own resources.
- `reports:read` — administrative reporting.
- `admin:operations` — administrative operations.

All non-admin vertical roles are deny-by-default for administrative permissions.

## Middleware
`authenticate` validates JWT algorithm, issuer, audience, principal identity, and then resolves the current server-side role.

`requireRole`, `requirePermission`, and `requireAdmin` enforce authorization at the API boundary.

Authorization failures use generic `Unauthorized` / `Forbidden` responses and do not reveal whether a protected resource exists.

## Protected routes verified in this remediation
- `/api/reports/*` requires authenticated `ADMIN` authorization.
- `/api/admin-only` requires authenticated `ADMIN` authorization.
- `/api/protected` requires authentication only.

## Regression gate
`npm run authorization:security:verify` verifies:
- unknown roles are rejected;
- non-admin roles cannot obtain admin permissions;
- admin permissions are granted only to `ADMIN`;
- cross-user resource access is denied;
- empty/invalid principals fail the ownership check.

This remediation does not redesign wallet, ledger, payment-provider, settlement, product, or inventory domains.
