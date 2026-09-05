import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const server = read('server.ts');
const middleware = read('backend/http/security.middleware.ts');
const env = read('backend/config/env.ts');
const pkg = JSON.parse(read('package.json'));

const checks = [
  ['Helmet security headers configured', /app\.use\(helmet\(/.test(server)],
  ['Express fingerprint disabled', /app\.disable\(['"]x-powered-by['"]\)/.test(server)],
  ['JSON body size limited', /express\.json\(\{[\s\S]*limit:\s*['"]1mb['"]/.test(server)],
  ['URL-encoded body size limited', /express\.urlencoded\(\{[\s\S]*limit:\s*['"]100kb['"]/.test(server)],
  ['CORS is allow-listed', /origin:\s*\(origin,\s*callback\)/.test(server) && /env\.allowedOrigins\.includes\(origin\)/.test(server)],
  ['No wildcard CORS', !/origin:\s*['"]\*['"]/.test(server)],
  ['Trusted origins are configured', /allowedOrigins:\s*configuredOrigins\(\)/.test(env)],
  ['Production requires APP_URL', /if \(isProduction\) throw new Error\('\[Config\] APP_URL is required in production'\)/.test(env)],
  ['Request correlation ID generated', /crypto\.randomUUID\(\)/.test(middleware)],
  ['Request ID response header emitted', /res\.setHeader\(REQUEST_ID_HEADER, requestId\)/.test(middleware)],
  ['Request ID input constrained', /REQUEST_ID_PATTERN/.test(middleware)],
  ['TRACE and CONNECT denied', /req\.method === 'TRACE' \|\| req\.method === 'CONNECT'/.test(middleware)],
  ['Safe 404 response', /error:\s*'Not found'/.test(middleware)],
  ['Safe production error response', /Internal server error/.test(middleware) && !/error\.message/.test(middleware)],
  ['Security verification script registered', pkg.scripts?.['api:security:verify'] === 'node scripts/api-security-verify.mjs'],
];

const failures = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
if (failures.length) {
  console.error(`API security verification failed: ${failures.length} check(s)`);
  process.exit(1);
}
console.log(`API security verification passed: ${checks.length} checks`);
