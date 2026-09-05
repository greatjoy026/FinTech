import fs from 'node:fs';

const required = [
  'docs/audits/CORE-001-sec021-closure-readiness.md',
  '.github/workflows/security-gate.yml',
  'scripts/security-regression-verify.ts',
  'scripts/deployment-security-verify.mjs',
  'scripts/data-recovery-security-verify.mjs',
  'scripts/access-control-security-verify.mjs',
];

const read = (path) => fs.readFileSync(path, 'utf8');
const failures = [];
for (const path of required) {
  if (!fs.existsSync(path)) failures.push(`missing required control/evidence file: ${path}`);
}
if (failures.length === 0) {
  const review = read('docs/audits/CORE-001-sec021-closure-readiness.md');
  for (const marker of ['SEC-004', 'DEFERRED', 'R-001', 'R-002', 'R-003', 'R-004', 'R-005', 'GO-LIVE PREREQUISITE']) {
    if (!review.includes(marker)) failures.push(`closure assessment missing required marker: ${marker}`);
  }
  const workflow = read('.github/workflows/security-gate.yml');
  if (!workflow.includes('architecture-closure:security:verify')) failures.push('SEC-021 gate is not wired into CORE-001 CI');
  if (workflow.includes('MONIME_API_KEY') || workflow.includes('MONIME_SECRET')) failures.push('provider secret appears in workflow source');
}
if (failures.length) {
  console.error('SEC-021 architecture closure gate FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('SEC-021 architecture closure gate PASSED');
