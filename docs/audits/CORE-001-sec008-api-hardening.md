# CORE-001 SEC-008 — API Security Boundary Hardening

## Objective
Harden the Express HTTP boundary without changing wallet, ledger, payment-provider, settlement, product, or inventory behavior.

## Implemented

- Security headers are applied with Helmet.
- Express `X-Powered-By` fingerprinting is disabled.
- JSON request bodies are limited to 1 MB.
- URL-encoded request bodies are limited to 100 KB and use non-nested parsing.
- CORS is allow-listed from `APP_URL`; wildcard origins are not permitted.
- Production requires `APP_URL` so the trusted browser origin boundary cannot silently fall back.
- A bounded `X-Request-ID` may be propagated; otherwise a UUID is generated. The ID is returned in the response for operational correlation.
- TRACE and CONNECT are rejected with HTTP 405.
- API 404 responses are generic and include only the safe request ID.
- Unhandled errors are logged with request ID only and return generic client-safe messages. Internal error messages/stacks are not returned.
- Production SPA fallback does not intercept unknown `/api/*` routes.

## Trust boundary

The browser/client may supply an access token and an optional correlation ID, but neither is trusted for authorization. Authentication and authorization remain server-side responsibilities from SEC-001 through SEC-007. CORS controls browser-origin access; it is not an authorization mechanism.

`X-Request-ID` is treated as an operational identifier only. It must match a restricted character set and length bound and must never contain secrets or user data.

## Request limits

The 1 MB JSON limit is intentionally conservative for normal API operations. The webhook route continues to capture the raw JSON bytes through the existing parser verification hook for signature processing. Large binary/file workflows are outside this security-boundary change.

## Error policy

Clients receive generic 400/413/500 responses. Server logs contain the correlation ID and a generic event marker rather than request bodies, authorization headers, tokens, or raw exception messages.

## Verification

The CI security workflow runs:

1. `npm run security:verify`
2. `npm run auth:security:verify`
3. `npm run authorization:security:verify`
4. `npm run api:security:verify`
5. `npm run lint`
6. `npm run build`

The API security regression gate statically verifies the security boundary, including security headers, body limits, CORS allow-listing, production origin requirements, request IDs, restricted methods, safe 404s, and safe error handling.

## Deferred

SEC-004 Monime webhook signature canonicalization/provider setup remains explicitly deferred and is not a dependency of SEC-008.
