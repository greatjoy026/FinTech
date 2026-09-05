import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checks = [];
function pass(name) { checks.push({ name, ok: true }); }
function fail(name, reason) { checks.push({ name, ok: false, reason }); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }

if (exists('docs/audits/CORE-001-sec018-data-recovery.md')) pass('SEC-018 recovery documentation exists');
else fail('SEC-018 recovery documentation exists', 'missing recovery documentation');

if (exists('docs/runbooks/production-backup-restore.md')) pass('backup/restore runbook exists');
else fail('backup/restore runbook exists', 'missing operational runbook');

const compose = exists('deploy/docker-compose.prod.yml') ? read('deploy/docker-compose.prod.yml') : '';
if (/FINTECH_IMAGE/.test(compose) && /FINTECH_ENV_FILE/.test(compose)) pass('production deployment uses operator-managed image and environment inputs');
else fail('production deployment uses operator-managed image and environment inputs', 'deployment contract missing');

const env = exists('backend/config/env.ts') ? read('backend/config/env.ts') : '';
if (/DATABASE_URL/.test(env) && /REDIS_HOST/.test(env)) pass('database and Redis production configuration are explicit');
else fail('database and Redis production configuration are explicit', 'required dependency configuration missing');

const reliability = exists('backend/reliability/lifecycle.ts') ? read('backend/reliability/lifecycle.ts') : '';
if (/QueueService|shutdown/i.test(reliability)) pass('queue shutdown/recovery boundary remains wired');
else fail('queue shutdown/recovery boundary remains wired', 'reliability lifecycle boundary missing');

const packageJson = exists('package.json') ? JSON.parse(read('package.json')) : {};
if (packageJson.scripts?.['db:migrate:deploy']) pass('explicit production migration command exists');
else fail('explicit production migration command exists', 'db:migrate:deploy script missing');

const workflow = exists('.github/workflows/security-gate.yml') ? read('.github/workflows/security-gate.yml') : '';
if (/data-recovery-security-verify/.test(workflow) || /recovery:security:verify/.test(workflow)) pass('SEC-018 regression gate is wired into CI');
else fail('SEC-018 regression gate is wired into CI', 'CI gate missing');

const docs = exists('docs/audits/CORE-001-sec018-data-recovery.md') ? read('docs/audits/CORE-001-sec018-data-recovery.md') : '';
for (const [label, pattern] of [
  ['RPO is documented', /RPO/i],
  ['RTO is documented', /RTO/i],
  ['PITR prerequisites are documented', /PITR/i],
  ['backup encryption requirements are documented', /encrypt/i],
  ['restore validation is documented', /restore.*(test|valid|drill)/i],
  ['backup access separation is documented', /(least privilege|separate.*access|access.*separ)/i],
  ['production verification limits are documented', /(not verified|operator|infrastructure)/i],
]) {
  if (pattern.test(docs)) pass(label); else fail(label, 'documentation control missing');
}

const failed = checks.filter((c) => !c.ok);
for (const c of checks) console.log(`${c.ok ? 'PASS' : 'FAIL'} ${c.name}${c.reason ? ` — ${c.reason}` : ''}`);
if (failed.length) process.exit(1);
console.log(`SEC-018 data protection and recovery gate PASSED (${checks.length} controls)`);
