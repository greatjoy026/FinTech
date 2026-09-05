import crypto from 'crypto';

export const OTP_MAX_ATTEMPTS = 5;

export function hashSecret(value: string): string {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

export function otpMatches(storedHash: string, suppliedCode: string): boolean {
  const suppliedHash = Buffer.from(hashSecret(suppliedCode), 'utf8');
  const expectedHash = Buffer.from(storedHash, 'utf8');
  return suppliedHash.length === expectedHash.length && crypto.timingSafeEqual(suppliedHash, expectedHash);
}

export function nextOtpAttempt(attempts: number): { allowed: boolean; nextAttempts: number } {
  const safeAttempts = Number.isFinite(attempts) && attempts >= 0 ? Math.floor(attempts) : 0;
  const nextAttempts = safeAttempts + 1;
  return { allowed: nextAttempts < OTP_MAX_ATTEMPTS, nextAttempts };
}

export function isRefreshable(status: string, expiresAtMs: number, nowMs = Date.now()): boolean {
  return status === 'ACTIVE' && Number.isFinite(expiresAtMs) && expiresAtMs > nowMs;
}

export function isReplay(status: string): boolean {
  return status === 'ROTATED' || status === 'REVOKED';
}
