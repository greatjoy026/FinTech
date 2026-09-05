import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const server = read('server.ts');
const limiter = read('backend/http/abuse-rate-limit.ts');
const env = read('backend/config/env.ts');
const pkg = JSON.parse(read('package.json'));

const checks = [
  ['Dedicated abuse limiter exists', /export function abuseRateLimit/.test(limiter)],
  ['Production limiter uses Redis', /if \(env\.nodeEnv !== 'production'\).*memoryAllow/.test(limiter)],
  ['Production limiter fails closed', /Production API abuse controls fail closed/.test(limiter) && /allowed: false/.test(limiter)],
  ['Distributed counter is atomic', /await redis\.incr\(key\)/.test(limiter)],
  ['Rate-limit window is bounded', /await redis\.expire\(key, windowSeconds\)/.test(limiter)],
  ['Retry-After is emitted', /res\.setHeader\('Retry-After', String\(result\.retryAfter\)\)/.test(limiter)],
  ['Abuse response is generic', /error: 'Too many requests'/.test(limiter) && !/error\.message/.test(limiter)],
  ['Identity uses authenticated principal when available', /userId\?/.test(limiter) && /user:\$\{principal\}/.test(limiter)],
  ['Fallback identity uses server-derived req.ip', /return `ip:\$\{req\.ip \|\| 'unknown'\}`/.test(limiter)],
  ['No client X-Forwarded-For parsing', !/x-forwarded-for|X-Forwarded-For/.test(limiter)],
  ['Reports route protected', /abuseRateLimit\(\{ scope: 'reports'/.test(server)],
  ['Protected route limited', /abuseRateLimit\(\{ scope: 'protected'/.test(server)],
  ['Admin route limited', /abuseRateLimit\(\{ scope: 'admin-only'/.test(server)],
  ['Health check excluded', !/api\/health[^\n]*abuseRateLimit/.test(server)],
  ['Authentication limits remain separate', !/authRouter.*abuseRateLimit/.test(server)],
  ['Redis production configuration remains mandatory', /function requireRedisConfig/.test(env) && /REDIS_HOST is required in production/.test(env)],
  ['Abuse verification script registered', pkg.scripts?.['abuse:security:verify'] === 'node scripts/abuse-security-verify.mjs'],
];

const failures = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
if (failures.length) {
  console.error(`Abuse security verification failed: ${failures.length} check(s)`);
  process.exit(1);
}
console.log(`Abuse security verification passed: ${checks.length} checks`);
