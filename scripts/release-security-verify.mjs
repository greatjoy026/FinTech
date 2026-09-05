import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fail = (message) => {
  console.error(`SEC-017 release gate FAILED: ${message}`);
  process.exit(1);
};
const pass = (message) => console.log(`SEC-017 release gate: ${message}`);

const requiredFiles = [
  '.github/workflows/security-gate.yml',
  '.github/workflows/release.yml',
  '.github/workflows/production-promote.yml',
  'Dockerfile',
  'deploy/docker-compose.prod.yml',
  'package-lock.json',
  'package.json',
  'prisma/schema.prisma',
  'docs/audits/CORE-001-sec017-cicd-governance.md',
];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`missing ${file}`);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (packageJson.scripts?.['db:migrate:deploy'] !== 'prisma migrate deploy') {
  fail('database deployment must use prisma migrate deploy as an explicit release step');
}

const securityGate = fs.readFileSync(path.join(root, '.github/workflows/security-gate.yml'), 'utf8');
for (const gate of [
  'npm run security:verify',
  'npm run security:regression:verify',
  'npm run auth:security:verify',
  'npm run authorization:security:verify',
  'npm run api:security:verify',
  'npm run abuse:security:verify',
  'npm run audit:security:verify',
  'npm run config:security:verify',
  'npm run dependency:security:verify',
  'npm audit --audit-level=high',
  'npm run lint',
  'npm run build',
  'npm run bundle:security:verify',
]) {
  if (!securityGate.includes(gate)) fail(`CORE-001 security gate missing ${gate}`);
}

const release = fs.readFileSync(path.join(root, '.github/workflows/release.yml'), 'utf8');
const promote = fs.readFileSync(path.join(root, '.github/workflows/production-promote.yml'), 'utf8');
if (!release.includes("tags:\n      - 'v*.*.*'")) fail('release workflow must be tag-triggered');
if (!release.includes('concurrency:') || !release.includes('cancel-in-progress: false')) fail('release concurrency must prevent overlapping releases');
if (!release.includes('docker/build-push-action@v6')) fail('release must build through the controlled Docker action');
if (!release.includes('provenance: true')) fail('image build provenance must be enabled');
if (!release.includes('actions/attest-build-provenance@v2')) fail('build provenance attestation must be configured');
if (!release.includes('steps.build.outputs.digest')) fail('release manifest must record the immutable image digest');
if (!promote.includes("environment: production")) fail('production promotion must target the production environment boundary');
if (!promote.includes('concurrency:') || !promote.includes('cancel-in-progress: false')) fail('production promotion concurrency must prevent overlapping deployments');
if (!promote.includes("@sha256:")) fail('production promotion must require an immutable digest');
if (!promote.includes('db:migrate:deploy')) fail('production promotion must enforce the explicit migration command');

const migrationsDir = path.join(root, 'prisma', 'migrations');
if (!fs.existsSync(migrationsDir)) fail('prisma migration directory is missing');
const migrations = fs.readdirSync(migrationsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory());
if (migrations.length === 0) fail('no Prisma migrations found');
for (const migration of migrations) {
  const sql = path.join(migrationsDir, migration.name, 'migration.sql');
  if (!fs.existsSync(sql)) fail(`migration ${migration.name} has no migration.sql`);
}

const compose = fs.readFileSync(path.join(root, 'deploy/docker-compose.prod.yml'), 'utf8');
if (!compose.includes('FINTECH_IMAGE:?')) fail('production Compose must require an explicit image reference');
if (!compose.includes('FINTECH_ENV_FILE:?')) fail('production Compose must require an operator-managed environment file');
if (!compose.includes('read_only: true')) fail('production Compose must use a read-only filesystem');

pass(`verified ${migrations.length} migration directories, immutable release controls, promotion concurrency, provenance, and mandatory CORE-001 gates`);
