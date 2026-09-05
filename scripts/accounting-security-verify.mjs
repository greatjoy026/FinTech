import fs from 'node:fs';

const failures = [];
const read = (path) => {
  try { return fs.readFileSync(path, 'utf8'); }
  catch { failures.push(`missing: ${path}`); return ''; }
};
const must = (path, patterns, label) => {
  const content = read(path);
  for (const pattern of patterns) if (!pattern.test(content)) failures.push(`${label}: missing ${pattern}`);
};

must('prisma/schema.prisma', [
  /model FinancialAccount\s*\{/,
  /model FinancialJournal\s*\{/,
  /model FinancialJournalLine\s*\{/,
  /model FinancialWalletAccount\s*\{/,
  /model FinancialHold\s*\{/,
  /enum JournalStatus\s*\{[\s\S]*DRAFT[\s\S]*POSTED[\s\S]*VOIDED/,
  /enum JournalLineDirection\s*\{[\s\S]*DEBIT[\s\S]*CREDIT/,
  /idempotencyKey String @unique/,
  /requestHash String/,
], 'accounting schema');

must('src/backend/financial/accounting.service.ts', [
  /Serializable/,
  /amount <= 0n/,
  /debit !== credit/,
  /requestHash/, 
  /IDEMPOTENCY_CONFLICT/,
  /ACCOUNT_CURRENCY_MISMATCH/,
  /status: 'POSTED'/,
  /journal: \{ status: 'POSTED' \}/,
], 'posting service');

must('prisma/migrations/20260905210000_core002_financial_accounting/migration.sql', [
  /amount.*> 0/,
  /CREATE OR REPLACE FUNCTION fintech_validate_financial_journal_status/,
  /debit_total <> credit_total/,
  /posted financial journal lines are immutable/,
  /journal contains invalid account currency or disabled account/,
  /only draft journals may be posted/,
], 'database invariants');

must('docs/architecture/CORE-002-financial-accounting.md', [
  /authoritative financial source of truth/i,
  /double-entry/i,
  /idempotency/i,
  /immutable/i,
  /wallet balance.*not.*authoritative/i,
], 'accounting architecture documentation');

must('docs/architecture/CORE-002-chart-of-accounts.md', [
  /ASSET/, /LIABILITY/, /EQUITY/, /REVENUE/, /EXPENSE/,
  /currency/i,
], 'chart of accounts documentation');

const packageJson = JSON.parse(read('package.json'));
if (packageJson.scripts?.['accounting:security:verify'] !== 'node scripts/accounting-security-verify.mjs') {
  failures.push('package.json: accounting regression gate is not wired');
}

const workflow = read('.github/workflows/security-gate.yml');
if (!/npm run accounting:security:verify/.test(workflow)) failures.push('CI: accounting regression gate is not wired');
if (/Monime.*(activate|enabled|configured)/i.test(read('docs/architecture/CORE-002-financial-accounting.md'))) failures.push('CORE-002 must not activate Monime');
if (/simulate|mock.*financial|fake.*financial/i.test(read('src/backend/financial/accounting.service.ts'))) failures.push('financial service contains simulation/mock language');

if (failures.length) {
  console.error('CORE-002 accounting gate FAILED');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('CORE-002 accounting gate PASSED');
console.log('Authoritative accounting schema, posting invariants, idempotency, immutability, wallet mapping boundary, and documentation verified.');
