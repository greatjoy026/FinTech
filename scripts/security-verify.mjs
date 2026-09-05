import fs from 'node:fs';

const files = {
  rules: fs.readFileSync('firestore.rules', 'utf8'),
  middleware: fs.readFileSync('backend/auth/auth.middleware.ts', 'utf8'),
  auth: fs.readFileSync('backend/auth/auth.service.ts', 'utf8'),
  webhook: fs.readFileSync('src/backend/webhook/webhook.controller.ts', 'utf8'),
  realtime: fs.readFileSync('src/backend/realtime/socket.gateway.ts', 'utf8')
};

const assertions = [
  ['Firestore global deny', /match \/\{document=\*\*\}[^]*allow read, write: if false/],
  ['No middleware fallback JWT secret', !/\|\|\s*['\"]/.test(files.middleware)],
  ['JWT verified with env secret', /jwt\.verify\(authHeader\.slice\(7\), env\.jwtSecret\)/],
  ['OTP is hashed', /codeHash: hashSecret\(code\)/],
  ['Refresh token is hashed', /refreshTokenHash: hashSecret\(refreshToken\)/],
  ['Webhook signature required', /Invalid webhook signature/],
  ['Webhook HMAC', /createHmac\(['\"]sha256/],
  ['Webhook enqueued durably', /enqueueWebhook\(\{ webhookEventId: event\.id \}\)/],
  ['Realtime JWT middleware', /this\.io\.use\(\(socket, next\)/],
  ['Realtime admin authorization', /user\.role !== ['\"]ADMIN['\"]/],
  ['No wildcard socket CORS', !/origin:\s*['\"]\*['\"]/.test(files.realtime)]
];

const failures = assertions.filter(([, check]) => typeof check === 'boolean' ? !check : !check.test(files.rules + files.middleware + files.auth + files.webhook + files.realtime)).map(([name]) => name);
if (failures.length) {
  console.error('Security verification failed:', failures.join(', '));
  process.exit(1);
}
console.log(`Security verification passed (${assertions.length} assertions).`);
