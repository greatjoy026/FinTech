import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checks = [];
function pass(name) { checks.push([name, true]); }
function fail(name) { checks.push([name, false]); }
function read(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }

const dockerfile = read('Dockerfile');
const compose = read('deploy/docker-compose.prod.yml');
const env = read('backend/config/env.ts');
const server = read('server.ts');
const pkg = JSON.parse(read('package.json'));

/docker/i.test(dockerfile) ? pass('production container definition present') : fail('production container definition present');
/USER 10001:10001/.test(dockerfile) ? pass('runtime uses non-root user') : fail('runtime uses non-root user');
/STOPSIGNAL SIGTERM/.test(dockerfile) ? pass('container propagates SIGTERM') : fail('container propagates SIGTERM');
/read_only: true/.test(compose) ? pass('deployment filesystem is read-only') : fail('deployment filesystem is read-only');
/no-new-privileges:true/.test(compose) ? pass('deployment disables privilege escalation') : fail('deployment disables privilege escalation');
/cap_drop:\s*\n\s*- ALL/.test(compose) ? pass('deployment drops Linux capabilities') : fail('deployment drops Linux capabilities');
/FINTECH_IMAGE:\?/.test(compose) ? pass('deployment requires explicit image reference') : fail('deployment requires explicit image reference');
/FINTECH_ENV_FILE:\?/.test(compose) ? pass('deployment requires operator-managed environment file') : fail('deployment requires operator-managed environment file');
/healthcheck:/.test(compose) && /api\/health/.test(compose) ? pass('orchestrator healthcheck targets liveness endpoint') : fail('orchestrator healthcheck targets liveness endpoint');
/db:migrate:deploy/.test(JSON.stringify(pkg.scripts)) ? pass('production migration command is explicit') : fail('production migration command is explicit');
/requiredValue\('DATABASE_URL'\)/.test(env) ? pass('database configuration is mandatory') : fail('database configuration is mandatory');
/isProduction && env\.trustProxy === false/.test(env) ? pass('production trusted-proxy configuration fails closed') : fail('production trusted-proxy configuration fails closed');
/app\.set\('trust proxy', env\.trustProxy\)/.test(server) ? pass('server consumes validated trusted-proxy configuration') : fail('server consumes validated trusted-proxy configuration');
/SHUTDOWN_TIMEOUT_MS/.test(server) || /shutdownOnce/.test(server) ? pass('graceful shutdown lifecycle is wired') : fail('graceful shutdown lifecycle is wired');
!/MONIME_API_TOKEN\s*=\s*['\"]/i.test(dockerfile + compose) ? pass('no provider secret is baked into deployment files') : fail('no provider secret is baked into deployment files');

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}`);
if (failed.length) process.exit(1);
console.log(`SEC-016 deployment security gate PASSED (${checks.length} checks)`);
