# CORE-001 SEC-006 — Authentication & Session Security

## Status
Implementation complete on the remediation branch; CI verification is required before review/merge.

## Controls implemented

### OTP
- Production OTPs remain cryptographically random.
- Only SHA-256 OTP hashes are persisted.
- OTP records expire after five minutes.
- OTP verification is single-use; the record is deleted after successful verification.
- Verification attempts are bounded to five attempts per OTP.
- OTP requests are throttled by phone number and source IP.
- Verification attempts are throttled by phone number and source IP.
- Production rate limiting uses Redis and fails closed if Redis is unavailable.
- Authentication responses are normalized so account existence and rate-limit state are not disclosed.

### Refresh sessions
- Refresh tokens are generated with 40 random bytes and persisted only as SHA-256 hashes.
- Each login creates a session token family.
- Refresh creates a replacement token in the same family and marks the previous session `ROTATED`.
- A rotated/revoked refresh token is treated as replay and revokes the entire token family.
- Production refresh operations are serialized with a short-lived Redis lock keyed by the refresh-token hash.
- Expired sessions are revoked.
- Logout is idempotent and revokes the matching session.
- Access tokens use HS256 with an explicit issuer, audience, and 15-minute expiry.

## Production dependency
Redis is required for production authentication abuse throttling and refresh-token serialization. The application fails closed rather than silently falling back to an unsafe in-memory control.

## Verification
`npm run auth:security:verify` executes regression assertions for OTP hashing/matching, attempt bounds, refreshable/replay states, token entropy, and hashed refresh-token storage. The CI security workflow executes this gate before TypeScript and production build checks.

The CI workflow previously exposed a TypeScript failure during this task. The Redis lock implementation was corrected to avoid relying on an untyped dynamic overload; the latest branch head contains that correction and this documentation commit triggers a fresh CI run.

This task does not implement or redesign wallet, ledger, payment-provider, settlement, product, or inventory behavior.
