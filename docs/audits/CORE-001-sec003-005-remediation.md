# CORE-001 SEC-003 → SEC-005 remediation

## SEC-003 — Firestore authorization boundary
Authentication/session/OTP collections are now server-authoritative. The backend uses Google service-account OAuth credentials with the Firestore REST API; these credentials are never committed. Firestore client rules default-deny the authentication collections and the database fallback rule denies all other access until an explicit application authorization model exists.

Required runtime configuration:
- `JWT_SECRET`
- `FIRESTORE_DATABASE_ID`
- one trusted credential source: `FIREBASE_SERVICE_ACCOUNT_JSON`, `GOOGLE_APPLICATION_CREDENTIALS`, or `FIREBASE_PROJECT_ID` + `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY`

Do not put service-account JSON, private keys, or production secrets in source control.

Refresh tokens are stored only as SHA-256 hashes. OTP values are also hashed and remain time-limited.

## SEC-004 — Webhook ingestion security
Webhook requests require `MONIME_WEBHOOK_SECRET` and HMAC-SHA256 verification before persistence. A timestamp, when supplied by the provider, is checked for a five-minute replay window. The raw request body is retained for signature verification. Events are deduplicated using a deterministic event ID, persisted before acknowledgement, and dispatched to BullMQ. There is no post-response `setImmediate` financial processing.

The current worker intentionally does not post ledger/wallet effects: those effects remain disabled until the authoritative payment/ledger transaction boundary is implemented and tested. This is safer than silently simulating money movement.

Provider-specific signature formatting must be confirmed against the provider's current API documentation before production go-live.

## SEC-005 — Realtime authorization
Socket.IO connections now require a valid JWT. Every authenticated socket joins only its own user room. The global admin room requires the server-issued `ADMIN` role. Client-supplied tokens on the `subscribe:admin` event are no longer trusted. Socket CORS uses the configured `APP_URL` rather than `*`.

Realtime is notification-only and must never be treated as authoritative financial state.
