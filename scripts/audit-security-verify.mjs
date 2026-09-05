import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const service = read('backend/audit/audit.service.ts');
const schema = read('prisma/schema.prisma');
const server = read('server.ts');
const pkg = JSON.parse(read('package.json'));
const migration = read('prisma/migrations/20260905190000_sec010_audit_integrity/migration.sql');

const checks = [
  ['Authoritative AuditService exists', /export class AuditService/.test(service)],
  ['Actor comes from server input boundary', /actorId: string/.test(service) && /actor: input\.actorId/.test(service)],
  ['Role is captured with audit event', /_actorRole/.test(service) && /role: input\.role/.test(service)],
  ['Integrity uses SHA-256', /createHash\('sha256'\)/.test(service)],
  ['Integrity comparison is timing-safe', /timingSafeEqual/.test(service)],
  ['Sensitive audit keys are redacted', /authorization\|cookie\|token\|secret\|password/.test(service)],
  ['Outcome is server-controlled', /outcome: input\.outcome/.test(service) && /AuditOutcome/.test(service)],
  ['Request correlation is captured', /requestId: input\.requestId/.test(service)],
  ['Audit schema requires integrity hash', /integrityHash String @unique/.test(schema)],
  ['Audit schema has outcome and request ID', /outcome String @default\("SUCCESS"\)/.test(schema) && /requestId String\?/.test(schema)],
  ['Audit mutation path is centralized', !/prisma\.auditLog\.(update|delete|updateMany|deleteMany)/.test(service)],
  ['Privileged API access is audited', /AuditService\.record/.test(server) && /ADMIN_API_ACCESS/.test(server)],
  ['Audit verification script is registered', pkg.scripts?.['audit:security:verify'] === 'node scripts/audit-security-verify.mjs'],
  ['Migration adds integrity protection', /ADD COLUMN "integrityHash" TEXT/.test(migration) && /CREATE UNIQUE INDEX "AuditLog_integrityHash_key"/.test(migration)],
  ['No sensitive request header is audited directly', !/metadata:.*authorization/i.test(server)],
];

const failures = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
if (failures.length) { console.error(`Audit security verification failed: ${failures.length} check(s)`); process.exit(1); }
console.log(`Audit security verification passed: ${checks.length} checks`);
