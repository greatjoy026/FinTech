import fs from 'node:fs';

const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
const service = fs.readFileSync('src/backend/wallet/wallet.service.ts', 'utf8');
const accounting = fs.readFileSync('src/backend/financial/accounting.service.ts', 'utf8');
const migration = fs.readFileSync('prisma/migrations/20260905220000_core003_wallet_integrity/migration.sql', 'utf8');

const required = [
  ['one-to-one wallet/account mapping', /walletId String @unique[\s\S]*accountId String @unique/],
  ['wallet monetary values are BigInt', /availableBalance BigInt[\s\S]*pendingBalance BigInt[\s\S]*reservedBalance BigInt/],
  ['wallet transaction request hash', /model WalletTransaction[\s\S]*requestHash String\?/],
  ['financial hold idempotency', /model FinancialHold[\s\S]*idempotencyKey String @unique/],
  ['wallet non-negative database constraint', /Wallet_balance_nonnegative_check/],
];
for (const [name, pattern] of required) if (!pattern.test(name.includes('database') ? migration : schema)) throw new Error(`Wallet gate failed: ${name}`);

const serviceChecks = [
  ['wallet mapping validation', /WALLET_ACCOUNT_MAPPING_MISSING/],
  ['liability wallet accounts', /account\.type !== 'LIABILITY'/],
  ['currency enforcement', /CURRENCY_MISMATCH|ACCOUNT_CURRENCY_MISMATCH/],
  ['serializable wallet transactions', /TransactionIsolationLevel\.Serializable/],
  ['bounded serialization retry', /attempt < 3/],
  ['sufficient funds protection', /availableBalance < amount|availableBalance: \{ gte: amount \}/],
  ['atomic accounting posting', /postJournalInTransaction/],
  ['hold reserve lifecycle', /createHold[\s\S]*reservedBalance/],
  ['hold release', /releaseHold[\s\S]*status: 'RELEASED'/],
  ['hold capture', /captureHold[\s\S]*WALLET_HOLD_CAPTURE/],
  ['reconciliation boundary', /reconcileWallet[\s\S]*DIVERGED/],
  ['no legacy LedgerEngine dependency', !/LedgerEngine/.test(service) ],
];
for (const [name, check] of serviceChecks) {
  const ok = typeof check === 'boolean' ? check : check.test(service);
  if (!ok) throw new Error(`Wallet gate failed: ${name}`);
}

if (!/Serializable/.test(accounting)) throw new Error('Wallet gate failed: accounting serialization boundary');
if (!/FinancialJournalLine/.test(accounting)) throw new Error('Wallet gate failed: authoritative accounting lines');
if (!/requestHash/.test(service)) throw new Error('Wallet gate failed: wallet request hashing');
if (/setImmediate\s*\(/.test(service)) throw new Error('Wallet gate failed: post-response work detected');

console.log('CORE-003 wallet security gate PASSED');
