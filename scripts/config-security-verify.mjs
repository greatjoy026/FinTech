import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const failures = [];
const pass = (name, ok, detail) => {
  if (!ok) failures.push(`${name}: ${detail}`);
};
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const envSource = read('backend/config/env.ts');
const viteConfig = read('vite.config.ts');
const envExample = read('.env.example');
const gitignore = read('.gitignore');
const packageJson = JSON.parse(read('package.json'));

pass('Production JWT secret validation', /requiredSecret\('JWT_SECRET',\s*32\)/.test(envSource), 'JWT_SECRET must be mandatory and at least 32 characters');
pass('Production database validation', /requiredDatabase|requireDatabaseConfig|DATABASE_URL/.test(envSource), 'DATABASE_URL must be validated centrally');
pass('Production Firestore validation', /requireTrustedFirestoreConfig/.test(envSource), 'trusted Firestore configuration must be mandatory');
pass('Production Redis validation', /requireRedisConfig/.test(envSource), 'production Redis configuration must fail closed');
pass('Production origin validation', /configuredOrigins/.test(envSource), 'APP_URL must be centrally validated');
pass('Development OTP blocked in production', /AUTH_DEV_OTP.*must not be configured in production/.test(envSource), 'AUTH_DEV_OTP must never be accepted in production');
pass('Monime remains deferred', !/requiredSecret\(['"]MONIME_/.test(envSource), 'deferred provider credentials must not block current deployment');
pass('No client secret define', !/GEMINI_API_KEY|JWT_SECRET|DATABASE_URL|REDIS_PASSWORD|FIREBASE_PRIVATE_KEY|MONIME_API_TOKEN/.test(viteConfig), 'server secrets must not be statically injected into Vite');
pass('Environment files ignored', /\.env\n/.test(gitignore) && /\.env\.\*/.test(gitignore) && /!\.env\.example/.test(gitignore), 'local env files must be ignored while retaining the template');
pass('Credential file exclusions', /\*\.pem/.test(gitignore) && /\*\.key/.test(gitignore) && /credentials\*\.json/.test(gitignore), 'credential artifacts must be ignored');
pass('Environment template contains no obvious real secret', !/(BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|AKIA[0-9A-Z]{16})/.test(envExample), 'template must not contain credentials');
pass('Security script registered', packageJson.scripts?.['config:security:verify'] === 'node scripts/config-security-verify.mjs', 'package script must be registered');

let trackedFiles = [];
try {
  trackedFiles = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean);
} catch {
  pass('Git tracked-file inventory', false, 'unable to inspect tracked files');
}

const secretAssignment = /(?:JWT_SECRET|DATABASE_PASSWORD|REDIS_PASSWORD|API_KEY|API_TOKEN|CLIENT_SECRET|PRIVATE_KEY|PASSWORD)\s*[:=]\s*["'][^"']{8,}["']/i;
const privateKey = /-----BEGIN [A-Z ]*PRIVATE KEY-----/;
for (const file of trackedFiles) {
  if (file === '.env.example' || file.startsWith('scripts/') || file.startsWith('docs/')) continue;
  if (!/\.(ts|tsx|js|mjs|cjs|json|yaml|yml|toml|env|sh)$/.test(file)) continue;
  let content;
  try { content = read(file); } catch { continue; }
  if (privateKey.test(content)) failures.push(`Hardcoded private key detected in tracked file: ${file}`);
  if (secretAssignment.test(content)) failures.push(`Potential hardcoded secret assignment detected in tracked file: ${file}`);
}

if (failures.length) {
  console.error('SEC-011 configuration/secret gate FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('SEC-011 configuration/secret gate PASSED');
