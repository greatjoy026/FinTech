import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const server = read('server.ts');
const logger = read('backend/observability/logger.ts');
const metrics = read('backend/observability/metrics.ts');
const health = read('backend/observability/health.ts');
const middleware = read('backend/observability/middleware.ts');
const events = read('backend/observability/security-events.ts');

const checks = [
  ['structured logger exists', logger.includes("service: 'fintech-api'") && logger.includes('JSON.stringify')],
  ['logger redacts sensitive keys', logger.includes('[REDACTED]') && /authorization|password|otp|private.?key/i.test(logger)],
  ['metrics counters exist', metrics.includes('http_requests_total') && metrics.includes('security_events_total')],
  ['Prometheus output exists', metrics.includes('prometheusMetrics') && metrics.includes('# TYPE')],
  ['liveness endpoint exists', health.includes('export function liveness') && server.includes("app.get('/api/health', liveness)")],
  ['readiness endpoint exists', health.includes('export async function readiness') && server.includes("app.get('/api/ready', readiness)")],
  ['readiness checks database', health.includes('prisma.$queryRaw')],
  ['readiness fails safely', health.includes("res.status(ready ? 200 : 503)")],
  ['request observability is wired', middleware.includes('HTTP_REQUEST') && server.includes('observabilityMiddleware')],
  ['security event taxonomy exists', events.includes('AUTH_FAILURE') && events.includes('RATE_LIMITED') && events.includes('AUDIT_FAILURE')],
  ['metrics endpoint is admin protected', server.includes("app.get('/api/metrics', authenticate, requireAdmin")],
  ['startup logs do not expose configuration', server.includes("logger.info('SERVER_STARTED'") && !server.includes('process.env.JWT_SECRET')],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
if (failed.length) process.exit(1);
console.log(`SEC-014 observability gate PASSED (${checks.length} checks)`);
