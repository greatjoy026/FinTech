import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { hashSecret, isRefreshable, isReplay, nextOtpAttempt, otpMatches } from '../backend/auth/auth.security';
import {
  PERMISSIONS,
  canAccessAdminOperations,
  canAccessUserResource,
  hasPermission,
  isRole,
} from '../backend/auth/authorization';
import {
  errorHandler,
  hasWildcardOrigin,
  notFoundHandler,
  requestIdMiddleware,
  securityMethodGuard,
} from '../backend/http/security.middleware';

function runGate(command: string, args: string[]): void {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    throw new Error(`Security regression sub-gate failed: ${command} ${args.join(' ')}`);
  }
}

// Authentication/session behavior.
const otp = '482913';
const otpHash = hashSecret(otp);
assert.notEqual(otpHash, otp);
assert.equal(otpMatches(otpHash, otp), true);
assert.equal(otpMatches(otpHash, '000000'), false);
assert.deepEqual(nextOtpAttempt(0), { allowed: true, nextAttempts: 1 });
assert.deepEqual(nextOtpAttempt(4), { allowed: false, nextAttempts: 5 });
assert.equal(isRefreshable('ACTIVE', Date.now() + 60_000), true);
assert.equal(isRefreshable('ACTIVE', Date.now() - 1), false);
assert.equal(isRefreshable('ROTATED', Date.now() + 60_000), false);
assert.equal(isReplay('ROTATED'), true);
assert.equal(isReplay('REVOKED'), true);
assert.equal(isReplay('ACTIVE'), false);

// Authorization behavior: invalid roles and cross-user access fail closed.
assert.equal(isRole('ADMIN'), true);
assert.equal(isRole('CUSTOMER'), true);
assert.equal(isRole('SUPERADMIN'), false);
assert.equal(hasPermission('ADMIN', PERMISSIONS.ADMIN_OPERATIONS), true);
assert.equal(hasPermission('CUSTOMER', PERMISSIONS.ADMIN_OPERATIONS), false);
assert.equal(canAccessAdminOperations('ADMIN'), true);
assert.equal(canAccessAdminOperations('CUSTOMER'), false);
assert.equal(canAccessUserResource('user-a', 'user-a'), true);
assert.equal(canAccessUserResource('user-a', 'user-b'), false);
assert.equal(canAccessUserResource('', 'user-b'), false);

// HTTP boundary behavior using real middleware functions with minimal test doubles.
const response = {
  headers: new Map<string, string>(),
  statusCode: 200,
  body: undefined as unknown,
  setHeader(name: string, value: string) { this.headers.set(name.toLowerCase(), String(value)); },
  getHeader(name: string) { return this.headers.get(name.toLowerCase()); },
  status(code: number) { this.statusCode = code; return this; },
  json(body: unknown) { this.body = body; return this; },
  headersSent: false,
};
const request = {
  method: 'GET',
  headers: {},
  header(name: string) { return this.headers[name.toLowerCase()]; },
  path: '/api/missing',
};
let nextCalls = 0;
requestIdMiddleware(request as never, response as never, () => { nextCalls += 1; });
assert.equal(nextCalls, 1);
assert.match(String(response.getHeader('X-Request-ID')), /^[0-9a-f-]{36}$/);
assert.equal(typeof response.getHeader('X-Request-ID'), 'string');

const invalidIdResponse = { ...response, headers: new Map<string, string>(), statusCode: 200, body: undefined };
const invalidIdRequest = {
  ...request,
  headers: { 'x-request-id': 'bad id with spaces' },
  header(name: string) { return this.headers[name.toLowerCase()]; },
};
requestIdMiddleware(invalidIdRequest as never, invalidIdResponse as never, () => undefined);
assert.match(String(invalidIdResponse.getHeader('X-Request-ID')), /^[0-9a-f-]{36}$/);

const methodResponse = { ...response, headers: new Map([['x-request-id', 'req-test']]), statusCode: 200, body: undefined };
const methodRequest = { ...request, method: 'TRACE' };
assert.equal(securityMethodGuard(methodRequest as never, methodResponse as never, () => undefined), methodResponse);
assert.equal(methodResponse.statusCode, 405);
assert.deepEqual(methodResponse.body, { error: 'Method not allowed', requestId: 'req-test' });

const missingResponse = { ...response, headers: new Map([['x-request-id', 'req-404']]), statusCode: 200, body: undefined };
notFoundHandler(request as never, missingResponse as never);
assert.equal(missingResponse.statusCode, 404);
assert.deepEqual(missingResponse.body, { error: 'Not found', requestId: 'req-404' });

const errorResponse = { ...response, headers: new Map([['x-request-id', 'req-500']]), statusCode: 200, body: undefined, headersSent: false };
errorHandler(new Error('secret database details'), request as never, errorResponse as never, () => undefined);
assert.equal(errorResponse.statusCode, 500);
assert.deepEqual(errorResponse.body, { error: 'Internal server error', requestId: 'req-500' });
assert.equal(JSON.stringify(errorResponse.body).includes('secret database details'), false);

assert.equal(hasWildcardOrigin({ origin: '*' }), true);
assert.equal(hasWildcardOrigin({ origin: 'https://trusted.example' }), false);

// Run the established security gates as part of the regression suite so a behavioral
// regression cannot bypass an existing foundation control.
runGate('npm', ['run', 'auth:security:verify']);
runGate('npm', ['run', 'authorization:security:verify']);
runGate('npm', ['run', 'api:security:verify']);
runGate('npm', ['run', 'abuse:security:verify']);
runGate('npm', ['run', 'audit:security:verify']);
runGate('npm', ['run', 'config:security:verify']);
runGate('npm', ['run', 'dependency:security:verify']);
runGate('npm', ['run', 'bundle:security:verify']);

console.log('SEC-013 SECURITY REGRESSION VERIFY: all behavioral and foundation regression assertions passed');
