import assert from 'node:assert/strict';
import { assertTransition, canTransition, isTerminal } from '../src/backend/payment/payment.state';

assert.equal(canTransition('CREATED', 'PROCESSING'), true);
assert.equal(canTransition('PROCESSING', 'SUCCEEDED'), true);
assert.equal(canTransition('SUCCEEDED', 'PROCESSING'), false);
assert.equal(canTransition('CANCELLED', 'SUCCEEDED'), false);
assert.equal(isTerminal('SUCCEEDED'), true);
assert.equal(isTerminal('FAILED'), true);
assert.equal(isTerminal('CANCELLED'), true);
assert.equal(isTerminal('EXPIRED'), true);
assert.equal(isTerminal('PROCESSING'), false);
assert.throws(() => assertTransition('SUCCEEDED', 'CANCELLED'), /Illegal payment transition/);
assert.throws(() => assertTransition('CREATED', 'SUCCEEDED'), /Illegal payment transition/);
console.log('CORE-004 executable payment invariants: PASS');
