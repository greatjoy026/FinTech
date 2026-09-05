import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { hashSecret, isRefreshable, isReplay, nextOtpAttempt, otpMatches } from '../backend/auth/auth.security';

const otp = '482913';
const otpHash = hashSecret(otp);
assert.notEqual(otpHash, otp, 'OTP must never be persisted as plaintext');
assert.equal(otpMatches(otpHash, otp), true, 'Correct OTP must verify');
assert.equal(otpMatches(otpHash, '000000'), false, 'Incorrect OTP must fail');

assert.deepEqual(nextOtpAttempt(0), { allowed: true, nextAttempts: 1 });
assert.deepEqual(nextOtpAttempt(4), { allowed: false, nextAttempts: 5 });
assert.equal(isRefreshable('ACTIVE', Date.now() + 60_000), true);
assert.equal(isRefreshable('ACTIVE', Date.now() - 1), false);
assert.equal(isRefreshable('ROTATED', Date.now() + 60_000), false);
assert.equal(isReplay('ROTATED'), true);
assert.equal(isReplay('REVOKED'), true);
assert.equal(isReplay('ACTIVE'), false);

const refreshToken = crypto.randomBytes(40).toString('hex');
assert.equal(refreshToken.length, 80, 'Refresh token must have sufficient entropy');
assert.notEqual(hashSecret(refreshToken), refreshToken, 'Refresh token storage value must be hashed');

console.log('AUTH SECURITY VERIFY: all assertions passed');
