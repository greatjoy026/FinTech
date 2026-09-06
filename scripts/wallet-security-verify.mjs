import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const schema = read('prisma/schema.prisma');
const service = read('src/backend/wallet/wallet.service.ts');
const accounting = read('src/backend/financial/accounting.service.ts');
const migration = read('prisma/migrations/20260905220000_core003_wallet_integrity/migration.sql');

const assertIncludes = (source, name, fragments) => {
  for (const fragment of fragments) {
    if (!source.includes(fragment)) throw new Error(`Wallet gate failed: ${name}: missing ${fragment}`);
  }
};

assertIncludes(schema, 'wallet/account mapping', [
  'model FinancialWalletAccount',
  'walletId String @unique',
  'accountId String @unique',
]);
assertIncludes(schema, 'wallet balance representation', [
  'availableBalance BigInt @default(0)',
  'pendingBalance BigInt @default(0)',
  'reservedBalance BigInt @default(0)',
]);
assertIncludes(schema, 'wallet transaction integrity', [
  'model WalletTransaction',
  'requestHash String?',
]);
assertIncludes(schema, 'financial hold idempotency', [
  'model FinancialHold',
  'idempotencyKey String @unique',
]);
assertIncludes(migration, 'wallet database invariants', [
  'Wallet_balance_nonnegative_check',
  '"availableBalance" >= 0',
  '"pendingBalance" >= 0',
  '"reservedBalance" >= 0',
]);

assertIncludes(service, 'wallet authorization and mapping', [
  'WALLET_ACCOUNT_MAPPING_MISSING',
  "type !== 'LIABILITY'",
  'ACCOUNT_CURRENCY_MISMATCH',
]);
assertIncludes(service, 'transactional integrity', [
  'TransactionIsolationLevel.Serializable',
  'attempt < 3',
  'postJournalInTransaction',
]);
assertIncludes(service, 'fund protection', [
  'Insufficient available balance',
  'availableBalance: { gte: amount }',
]);
assertIncludes(service, 'hold lifecycle', [
  'createHold',
  'reservedBalance: { increment: amount }',
  "status: 'RELEASED'",
  'WALLET_HOLD_CAPTURE',
]);
assertIncludes(service, 'reconciliation', [
  'reconcileWallet',
  "status: projected === balance.balance ? 'MATCHED' : 'DIVERGED'",
]);
assertIncludes(service, 'idempotency', [
  'requestHash',
  'IDEMPOTENCY_CONFLICT',
]);
if (service.includes('LedgerEngine')) throw new Error('Wallet gate failed: legacy LedgerEngine dependency remains');
if (service.includes('setImmediate(')) throw new Error('Wallet gate failed: post-response financial work detected');

assertIncludes(schema, 'authoritative accounting schema', [
  'model FinancialJournalLine',
  'amount BigInt',
  'direction JournalLineDirection',
]);
assertIncludes(accounting, 'authoritative accounting service', [
  'financialJournalLine',
  'TransactionIsolationLevel.Serializable',
  'postJournalInTransaction',
]);

console.log('CORE-003 wallet security gate PASSED');
