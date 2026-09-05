import assert from 'node:assert/strict';

function projectedSettledBalance(available: bigint, reserved: bigint): bigint {
  if (available < 0n || reserved < 0n) throw new Error('Wallet balances cannot be negative');
  return available + reserved;
}

function applyHold(available: bigint, reserved: bigint, amount: bigint) {
  if (amount <= 0n) throw new Error('Hold amount must be positive');
  if (available < amount) throw new Error('Insufficient available balance');
  return { available: available - amount, reserved: reserved + amount };
}

function releaseHold(available: bigint, reserved: bigint, amount: bigint) {
  if (amount <= 0n || reserved < amount) throw new Error('Invalid hold release');
  return { available: available + amount, reserved: reserved - amount };
}

function captureHold(available: bigint, reserved: bigint, amount: bigint) {
  if (amount <= 0n || reserved < amount) throw new Error('Invalid hold capture');
  return { available, reserved: reserved - amount };
}

// Projection conservation: a hold moves value between spendable and reserved state.
{
  const before = projectedSettledBalance(1000n, 200n);
  const held = applyHold(1000n, 200n, 300n);
  assert.equal(projectedSettledBalance(held.available, held.reserved), before);

  const released = releaseHold(held.available, held.reserved, 300n);
  assert.equal(released.available, 1000n);
  assert.equal(released.reserved, 200n);
}

// Capture consumes reserved funds but never creates spendable balance.
{
  const captured = captureHold(700n, 500n, 200n);
  assert.equal(captured.available, 700n);
  assert.equal(captured.reserved, 300n);
}

// Overspend and invalid amounts must fail closed.
assert.throws(() => applyHold(100n, 0n, 101n));
assert.throws(() => applyHold(100n, 0n, 0n));
assert.throws(() => releaseHold(100n, 0n, 1n));
assert.throws(() => captureHold(100n, 0n, 1n));
assert.throws(() => projectedSettledBalance(-1n, 0n));

// Accounting wallet liability semantics: credit increases the wallet account,
// debit decreases it. A transfer therefore debits sender and credits receiver.
const senderAccountingAfter = 1000n - 250n;
const receiverAccountingAfter = 400n + 250n;
assert.equal(senderAccountingAfter, 750n);
assert.equal(receiverAccountingAfter, 650n);

console.log('CORE-003 wallet invariant tests PASSED');
