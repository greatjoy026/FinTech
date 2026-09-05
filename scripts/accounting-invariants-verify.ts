import assert from 'node:assert/strict';
import { normalBalance, validateJournalLines } from '../src/backend/financial/accounting.invariants';

const balanced = [
  { accountId: 'cash', direction: 'DEBIT' as const, amount: 1000n },
  { accountId: 'payable', direction: 'CREDIT' as const, amount: 1000n },
];

assert.deepEqual(validateJournalLines(balanced), { debit: 1000n, credit: 1000n });
assert.equal(normalBalance('ASSET', 1000n, 250n), 750n);
assert.equal(normalBalance('LIABILITY', 250n, 1000n), 750n);

assert.throws(
  () => validateJournalLines([
    { accountId: 'cash', direction: 'DEBIT', amount: 1000n },
    { accountId: 'payable', direction: 'CREDIT', amount: 999n },
  ]),
  /balance/,
);

assert.throws(
  () => validateJournalLines([
    { accountId: 'cash', direction: 'DEBIT', amount: 0n },
    { accountId: 'payable', direction: 'CREDIT', amount: 0n },
  ]),
  /positive/,
);

assert.throws(
  () => validateJournalLines([
    { accountId: 'cash', direction: 'DEBIT', amount: -1n },
    { accountId: 'payable', direction: 'CREDIT', amount: -1n },
  ]),
  /positive/,
);

assert.throws(
  () => validateJournalLines([{ accountId: 'cash', direction: 'DEBIT', amount: 1000n }]),
  /at least two/,
);

console.log('CORE-002 accounting invariant tests PASSED');
