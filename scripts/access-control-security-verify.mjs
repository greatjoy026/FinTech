import fs from 'node:fs';

const failures = [];
const read = (p) => fs.readFileSync(p, 'utf8');
const mustContain = (path, patterns) => {
  const text = read(path);
  for (const [name, pattern] of patterns) if (!pattern.test(text)) failures.push(`${path}: missing ${name}`);
};

mustContain('backend/auth/authorization.ts', [
  ['server-side privileged permission', /PRIVILEGED_OPERATIONS/],
  ['ADMIN privileged permission', /ADMIN:.*PRIVILEGED_OPERATIONS/s],
  ['deny-by-default role map', /Readonly<Record<Role, readonly Permission\[\]>>/],
]);

mustContain('backend/auth/auth.middleware.ts', [
  ['trusted Firestore role lookup', /FirestoreServer\.get\('users'/],
  ['JWT algorithm restriction', /algorithms:\s*\['HS256'\]/],
  ['generic unauthorized response', /Unauthorized/],
]);

mustContain('backend/auth/privileged-operations.ts', [
  ['privileged operation allow-list', /PRIVILEGED_OPERATION_NAMES/],
  ['privileged permission enforcement', /admin:privileged/],
  ['audit on authorization decision', /AuditService\.record/],
  ['request role not used as authority', /trusted authenticated principal/],
]);

mustContain('.github/workflows/security-gate.yml', [
  ['least-privilege workflow permissions', /permissions:\s*\n\s*contents:\s*read/],
  ['authorization regression gate', /authorization:security:verify/],
  ['SEC-019 access-control gate', /access-control:security:verify/],
]);

const codeowners = fs.existsSync('.github/CODEOWNERS') ? read('.github/CODEOWNERS') : '';
if (!codeowners.includes('/backend/auth/') || !codeowners.includes('/.github/workflows/')) {
  failures.push('.github/CODEOWNERS: privileged security paths are not covered');
}

if (failures.length) {
  console.error('SEC-019 access-control gate FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('SEC-019 access-control gate PASSED');
console.log('Verified: server-side privileged permission boundary, trusted-role enforcement, privileged-operation audit, least-privilege workflow permissions, and CODEOWNERS coverage.');
