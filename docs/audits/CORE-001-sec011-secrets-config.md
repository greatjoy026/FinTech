# CORE-001 SEC-011 — Secrets, Configuration & Deployment Integrity

## Status
Implemented on `remediation/core-001-sec011-secrets-config`.

## Configuration trust boundary

`backend/config/env.ts` is the authoritative server-side configuration boundary. Production startup fails closed when mandatory database, JWT, Firestore, Redis, or trusted-origin configuration is absent or invalid.

Required production configuration:

- `DATABASE_URL` — valid PostgreSQL connection URL.
- `JWT_SECRET` — at least 32 characters; generate a unique cryptographically random value per environment.
- `APP_URL` — one or more explicit HTTP(S) origins, comma-separated when multiple trusted origins are required.
- `FIRESTORE_DATABASE_ID` plus one supported trusted Firestore credential method.
- `REDIS_HOST` and `REDIS_PORT` — mandatory in production because distributed abuse/auth controls require Redis.

Optional values such as `REDIS_PASSWORD` are server-only. `AUTH_DEV_OTP` is rejected in production.

Monime credentials remain optional because the provider integration is intentionally deferred. SEC-011 does not activate or simulate provider behavior.

## Client/server separation

Vite no longer defines or injects `GEMINI_API_KEY` into the browser bundle. Server secrets must never be represented as `VITE_*` variables or passed through Vite `define` configuration. Only explicitly public browser configuration may be exposed to client code.

## Secret-file hygiene

`.env` files, private-key/certificate files, credential JSON files, and related local secret artifacts are ignored by Git. `.env.example` contains placeholders only and must never contain real credentials.

## Logging

Production Prisma logging is limited to errors. Query logging is retained only outside production because verbose database query logging can expose sensitive SQL parameters.

Startup failure logs emit configuration error categories/messages only; secret values are never included.

## Automated verification

CI runs:

1. `npm run config:security:verify` — source/configuration and tracked-file secret hygiene.
2. `npm run lint` — TypeScript gate.
3. `npm run build` — production build gate.
4. `npm run bundle:security:verify` — scans generated artifacts for server-only secret names and private keys.

The checks require no real credentials and never print secret values.

## Deployment assumptions

Production secrets must be supplied by the deployment platform's secret manager/environment injection mechanism. Do not commit `.env` files, service-account JSON, private keys, provider tokens, database passwords, or JWT secrets.

Before a production deployment, configure secrets in the runtime environment and verify startup. CI intentionally validates the configuration contract statically rather than storing real credentials.

## Scope exclusions

This task does not redesign wallet, ledger, payment-provider, settlement, product, or inventory domains. Monime-specific setup remains deferred.
