import fs from 'node:fs';
import path from 'node:path';

const dist = path.join(process.cwd(), 'dist');
const forbidden = [
  'JWT_SECRET',
  'DATABASE_URL',
  'REDIS_PASSWORD',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_SERVICE_ACCOUNT_JSON',
  'MONIME_API_TOKEN',
  'MONIME_WEBHOOK_SECRET',
  'AUTH_DEV_OTP',
];

function filesUnder(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesUnder(full));
    else out.push(full);
  }
  return out;
}

const files = filesUnder(dist);
if (!files.length) {
  console.error('SEC-011 bundle gate FAILED: dist/ is missing or empty');
  process.exit(1);
}

const findings = [];
for (const file of files) {
  let content;
  try { content = fs.readFileSync(file, 'utf8'); } catch { continue; }
  for (const name of forbidden) {
    if (content.includes(name)) findings.push(`${path.relative(process.cwd(), file)} contains ${name}`);
  }
  if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(content)) findings.push(`${path.relative(process.cwd(), file)} contains a private key`);
}

if (findings.length) {
  console.error('SEC-011 bundle gate FAILED');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}
console.log(`SEC-011 bundle gate PASSED (${files.length} artifact files inspected)`);
