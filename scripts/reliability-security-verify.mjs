import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = path => fs.readFileSync(path, 'utf8');
const server = read('server.ts');
const lifecycle = read('backend/reliability/lifecycle.ts');
const queue = read('src/backend/queue/queue.service.ts');
const health = read('backend/observability/health.ts');
const pkg = JSON.parse(read('package.json'));

assert.match(server, /shutdownOnce\(server\)/);
assert.match(server, /process\.once\('SIGTERM'/);
assert.match(server, /process\.once\('SIGINT'/);
assert.match(lifecycle, /shutdownPromise/);
assert.match(lifecycle, /server\.close/);
assert.match(lifecycle, /RealtimeGateway\.shutdown/);
assert.match(lifecycle, /QueueService\.shutdown/);
assert.match(lifecycle, /prisma\.\$disconnect/);
assert.match(lifecycle, /SHUTDOWN_TIMEOUT_MS/);
assert.match(queue, /worker\.close\(\)/);
assert.match(queue, /event\.close\(\)/);
assert.match(queue, /queue\.close\(\)/);
assert.match(queue, /attempts: 5/);
assert.match(queue, /backoff: \{ type: 'exponential'/);
assert.match(health, /prisma\.\$queryRaw/);
assert.match(health, /checks\.redis/);
assert.match(health, /503/);
assert.match(health, /enableOfflineQueue: false/);
assert.equal(pkg.scripts['reliability:security:verify'], 'node scripts/reliability-security-verify.mjs');

const forbidden = [
  /process\.exit\(0\)/,
  /financial.*simulation/i,
  /fake.*financial/i,
];
for (const pattern of forbidden) assert.doesNotMatch(queue, pattern);

console.log('SEC-015 reliability regression gate PASSED');
