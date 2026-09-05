import fs from 'node:fs';

const failures = [];
const read = (path) => {
  try { return fs.readFileSync(path, 'utf8'); }
  catch { failures.push(`missing: ${path}`); return ''; }
};
const mustContain = (path, patterns, label) => {
  const content = read(path);
  for (const pattern of patterns) {
    if (!pattern.test(content)) failures.push(`${label}: missing ${pattern}`);
  }
};

mustContain('docs/governance/CORE-001-security-control-framework.md', [
  /Control register/i, /Owner/i, /Evidence/i, /External-control boundary/i
], 'control framework');

mustContain('docs/governance/CORE-001-operational-risk-register.md', [
  /RISK-001/, /RISK-010/, /Likelihood/i, /Impact/i, /Residual risk/i
], 'risk register');

mustContain('docs/governance/CORE-001-security-policies.md', [
  /Access governance/i, /Change governance/i, /Security exceptions/i, /Vendor and provider risk/i
], 'security policies');

mustContain('docs/governance/CORE-001-incident-escalation.md', [
  /SEV-1 Critical/i, /Regulatory and contractual escalation/i, /Incident lifecycle/i
], 'incident escalation');

mustContain('.github/CODEOWNERS', [
  /\/backend\/auth\//, /\/\.github\/workflows\//
], 'CODEOWNERS coverage');

mustContain('.github/workflows/security-gate.yml', [
  /npm run governance:security:verify/
], 'CI governance gate');

const packageJson = JSON.parse(read('package.json'));
if (packageJson.scripts?.['governance:security:verify'] !== 'node scripts/governance-security-verify.mjs') {
  failures.push('package.json: governance verification script is not wired');
}

const allGovernance = [
  read('docs/governance/CORE-001-security-control-framework.md'),
  read('docs/governance/CORE-001-operational-risk-register.md'),
  read('docs/governance/CORE-001-security-policies.md'),
  read('docs/governance/CORE-001-incident-escalation.md')
].join('\n');
if (/ISO\s*27001\s*certified|SOC\s*2\s*certified|PCI DSS\s*certified|external audit completed/i.test(allGovernance)) {
  failures.push('governance docs contain an unsupported certification/audit claim');
}
if (!/Monime remains a deferred|Monime.*deferred/i.test(allGovernance)) {
  failures.push('vendor governance must preserve the deferred Monime boundary');
}
if (/password\s*[:=]\s*['"][^'"]+['"]|JWT_SECRET\s*[:=]\s*['"][^'"]+['"]|BEGIN PRIVATE KEY/i.test(allGovernance)) {
  failures.push('governance docs contain credential-like material');
}

if (failures.length) {
  console.error('SEC-020 governance gate FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('SEC-020 governance gate PASSED');
console.log('Control framework, risk register, policy baseline, incident escalation, ownership coverage, CI wiring, and compliance-boundary claims verified.');
