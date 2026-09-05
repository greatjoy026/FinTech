import fs from 'node:fs';

const files = {
  rules: fs.readFileSync('firestore.rules', 'utf8'),
  middleware: fs.readFileSync('backend/auth/auth.middleware.ts', 'utf8'),
  auth: fs.readFileSync('backend/auth/auth.service.ts', 'utf8'),
  webhook: fs.readFileSync('src/backend/webhook/webhook.controller.ts', 'utf8'),
  realtime: fs.readFileSync('src/backend/realtime/socket.gateway.ts', 'utf8')
};

const assertions = [
  ['Firestore global deny', /match \/\{document=\*\*\}[^]*allow read, write: if false/.test(files.rules)],
  ['No middleware fallback JWT secret', !/\|\|\s*['\"]/.test(files.middleware)],
  ['JWT verified with env secret', /jwt\.verify\(authHeader\.slice\(7\), env\.jwtSecret,\s*\{/.test(files.middleware)],
  ['JWT issuer and audience enforced', /issuer:\s*['\"]fintech-auth['\"][\s\S]*audience:\s*['\"]fintech-api['\"]/.test(files.middleware)],
  ['OTP is hashed', /codeHash: hashSecret\(code\)/.test(files.auth)],
  ['Refresh token is hashed', /refreshTokenHash: hashSecret\(refreshToken\)/.test(files.auth)],
  ['Webhook signature required', /Invalid webhook signature/.test(files.webhook)],
  ['Webhook HMAC', /createHmac\(['\"]sha256/.test(files.webhook)],
  ['Webhook enqueued durably', /enqueueWebhook\(\{\s*webhookEventId:\s*(?:event|storedEvent|existing)\.id\s*\}\)/.test(files.webhook)],
  ['Realtime JWT middleware', /this\.io\.use\(\(socket, next\)/.test(files.realtime)],
  ['Realtime admin authorization', /user\.role !== ['\"]ADMIN['\"]/.test(files.realtime)],
  ['No wildcard socket CORS', !/origin:\s*['\"]\*['\"]/.test(files.realtime)]
];

const failures = assertions.filter(([, passed]) => !passed).map(([name]) => name);
if (failures.length) {
  console.error('Security verification failed:', failures.join(', '));
  process.exit(1);
}
console.log(`Security verification passed (${assertions.length} assertions).`);
