# CORE-001 SEC-013 — Security Testing & Regression Coverage Expansion

## Status

Implemented on `remediation/core-001-sec013-security-regression`.

## Purpose

SEC-013 adds executable behavioral regression coverage on top of the individual security gates introduced in SEC-001 through SEC-012. The suite is intentionally deterministic and uses synthetic fixtures only.

## Behavioral coverage

### Authentication and sessions

- OTP hashes are not equal to plaintext OTPs.
- Correct OTPs succeed and incorrect OTPs fail.
- OTP attempts are bounded.
- Expired refresh sessions are rejected.
- Rotated and revoked refresh sessions are not refreshable.
- Rotated/revoked sessions are recognized as replay/reuse states.

### Authorization

- Only configured roles are accepted.
- Unknown roles fail closed.
- Administrative permission is available only to ADMIN.
- Non-admin users cannot access administrative operations.
- Same-user ownership succeeds; cross-user ownership fails.
- Empty/invalid principals fail closed.

### HTTP security boundary

- Request IDs are generated when absent.
- Malformed request IDs are replaced rather than trusted.
- TRACE is rejected with 405.
- Unknown resources return a generic 404 with correlation ID.
- Unexpected errors return a generic 500 without leaking exception details.
- Wildcard origins are detectable and trusted origins are not treated as wildcard.

## Regression composition

The SEC-013 command also executes the existing authentication, authorization, API, abuse, audit, configuration, dependency, and browser-artifact security gates. This makes SEC-013 a single regression entry point while preserving the specialized gates as independently runnable diagnostics.

## Test command

`npm run security:regression:verify`

The command must pass before SEC-013 is considered complete. CI runs it before the TypeScript/build gates.

## Safety rules

- No production credentials or secrets are required.
- No real user data is used.
- No payment-provider calls are made.
- No wallet, ledger, settlement, product, or inventory state is mutated.
- Monime integration remains deferred.

## Failure triage

1. Run `npm run security:regression:verify` to reproduce the complete regression gate.
2. Run the failing specialized gate directly to isolate the affected security domain.
3. Fix the implementation or test contract; do not weaken assertions solely to restore green CI.
4. Re-run TypeScript and production build gates after security changes.
5. Review the resulting diff for secrets, scope creep, and financial-domain side effects.
