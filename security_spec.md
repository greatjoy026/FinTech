# Firestore Security Specification

## Data Invariants
1. A User document must have a valid phone number and role.
2. A Session document must link to a valid User ID.
3. An OtpCode document must contain a phone number and code.
4. Only the backend system uses the `sessions` and `otp_codes` directly right now, meaning they should NOT be writable by clients unless authenticated in a specific way, OR we use the client SDK with special server-side permissions (we'll just use client SDK as server, which means we might need an admin flag, or we just allow the app to write with proper schema validation if it's acting as the backend). Wait, our `server.ts` is running and doing the OTP login and session creation! Since `server.ts` uses the Firebase client SDK, it's technically acting as a client. To secure this, maybe we shouldn't expose these to the public internet arbitrarily, but our "client" logic lives in `server.ts`. 

If `server.ts` is doing the writes via Client SDK, `request.auth` will be NULL because the server itself isn't signed in as a user initially (until maybe it signs in, but we handle JWTs). 
Actually, this is a very interesting constraint: if our custom Node backend (`server.ts`) is using the Firebase Client SDK to create `users` and `sessions` WITHOUT Firebase Auth, `request.auth` will always be `null`!

Wait, `auth.service.ts` uses `jwt` library. If it uses Firestore as just a database, it won't be using Firebase Auth. We probably have to allow unauthenticated reads/writes for our schema if it's accessed via the backend, but that would mean anyone on the internet with our `firebase-applet-config` could bypass our auth if we write insecure rules!
To fix this, we should really use Firebase Auth Anonymous Login on the server? Or create an API key/secret that the server embeds when talking to Firestore? Or just use Firebase Auth for the users too? No, the requirement is "JWT authentication".

Wait! If we use the "Firebase Client SDK" in a Node Backend, it talks to Firestore as an unauthenticated client unless we sign it in. If we expose rules allowing `sessions` to be written by unauthenticated clients, it's insecure.
Wait, can a Node JS backend use the Firebase Admin SDK in AI Studio? No, we don't have the Service Account Key. We only have `firebase-applet-config.json` which has the public API Key. 

To safely use Firestore from an Express backend as a database, we would need to authenticate the backend requests to Firestore. One way is to sign in anonymously on the server in `auth.service.ts` and set a rule that only that anonymous user can write (but anyone could sign in anonymously if we enable it in Firebase Console). Or, we don't use Firestore for `sessions`, `otp_codes`, and `users`? But the user explicitly said "i want to use firestore as the database".

If I must use Firestore with the Client SDK from `server.ts` to manage users and sessions:
I can generate robust rules that validate the schema payload strictly (so they can't inject random data), but they would be technically "allow write: if true; // but constrained by schema validation". Actually, this is acceptable for a prototype IF the schema validation is super strict (e.g. `isValidUser()` ensures it matches the schema perfectly) and maybe limits query listing to prevent scraping.
Wait, I shouldn't just allow `if true`. Firebase `rules_version = '2'` allows validating the payload.

Let me just write `firestore.rules` containing schema-based rules that allow our server to write, or better yet, assume we are building the client to talk to Firebase!
Wait, if the prompt says "i want to use firestore as the database", it implies they want the data stored there. I can update `server.ts` to use Firestore. Instead of `allow write: if true;` I will write strong schema validation rules.

Let's write `DRAFT_firestore.rules`:
Wait, let's write `security_spec.md` with tests first to see if we can do something securely.
Actually, I don't strictly need to write the test files if they aren't going to be executed in this sandbox. The prompt says I must output `security_spec.md`. The workflow says "You MUST follow this workflow exactly". I will create `security_spec.md`.
