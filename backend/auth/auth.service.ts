import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { FirestoreServer } from '../firestore';
import { env } from '../config/env';
import { AuthRateLimiter } from './auth.rate-limit';
import { hashSecret, isRefreshable, isReplay, nextOtpAttempt, otpMatches } from './auth.security';

const OTP_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const GENERIC_AUTH_ERROR = 'Authentication failed';

function secureOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function genericAuthError(): Error {
  return new Error(GENERIC_AUTH_ERROR);
}

export class AuthService {
  static async requestOtp(phoneNumber: string, clientIp = 'unknown') {
    const phoneAllowed = await AuthRateLimiter.allow('otp-phone', phoneNumber, 3, 15 * 60);
    const ipAllowed = await AuthRateLimiter.allow('otp-ip', clientIp, 10, 60 * 60);
    if (!phoneAllowed || !ipAllowed) throw genericAuthError();

    const code = env.authDevOtp ?? secureOtp();
    await FirestoreServer.set('otp_codes', crypto.randomUUID(), {
      phoneNumber,
      codeHash: hashSecret(code),
      attempts: 0,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
      createdAt: new Date(),
    });
    return { message: 'OTP sent successfully' };
  }

  static async verifyOtpAndLogin(phoneNumber: string, code: string, clientIp = 'unknown') {
    const allowed = await AuthRateLimiter.allow('otp-verify-phone', phoneNumber, 5, 10 * 60);
    const ipAllowed = await AuthRateLimiter.allow('otp-verify-ip', clientIp, 20, 10 * 60);
    if (!allowed || !ipAllowed) throw genericAuthError();

    const records = await FirestoreServer.findByField('otp_codes', 'phoneNumber', phoneNumber);
    const candidates = records
      .filter(record => new Date(record.data.expiresAt).getTime() > Date.now())
      .sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime());
    const current = candidates[0];
    if (!current) throw genericAuthError();

    const attempts = Number(current.data.attempts ?? 0);
    if (attempts >= 5) {
      await FirestoreServer.delete('otp_codes', current.id);
      throw genericAuthError();
    }

    if (typeof current.data.codeHash !== 'string' || !otpMatches(current.data.codeHash, code)) {
      const result = nextOtpAttempt(attempts);
      if (!result.allowed) await FirestoreServer.delete('otp_codes', current.id);
      else await FirestoreServer.set('otp_codes', current.id, { attempts: result.nextAttempts });
      throw genericAuthError();
    }

    await FirestoreServer.delete('otp_codes', current.id);

    const users = await FirestoreServer.findByField('users', 'phoneNumber', phoneNumber);
    let userId: string;
    let role: string;
    if (users.length) {
      userId = users[0].id;
      role = String(users[0].data.role ?? 'CUSTOMER');
    } else {
      userId = crypto.randomUUID();
      role = 'CUSTOMER';
      await FirestoreServer.set('users', userId, { phoneNumber, role, createdAt: new Date() });
    }
    return this.generateTokens(userId, role);
  }

  static async generateTokens(userId: string, role: string, familyId: string = crypto.randomUUID()) {
    const accessToken = jwt.sign({ userId, role }, env.jwtSecret, {
      expiresIn: '15m',
      algorithm: 'HS256',
      issuer: 'fintech-auth',
      audience: 'fintech-api',
    });
    const refreshToken = crypto.randomBytes(40).toString('hex');
    await FirestoreServer.set('sessions', crypto.randomUUID(), {
      userId,
      familyId,
      refreshTokenHash: hashSecret(refreshToken),
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      createdAt: new Date(),
    });
    return { accessToken, refreshToken, userId, role };
  }

  static async revokeFamily(familyId: string) {
    const sessions = await FirestoreServer.findByField('sessions', 'familyId', familyId);
    await Promise.all(sessions.map(session => FirestoreServer.set('sessions', session.id, {
      status: 'REVOKED',
      revokedAt: new Date(),
    })));
  }

  static async refresh(refreshToken: string) {
    const tokenHash = hashSecret(refreshToken);
    return AuthRateLimiter.withRefreshLock(tokenHash, async () => {
      const sessions = await FirestoreServer.findByField('sessions', 'refreshTokenHash', tokenHash);
      const session = sessions[0];
      if (!session) throw genericAuthError();

      const expiresAt = new Date(session.data.expiresAt).getTime();
      const status = String(session.data.status ?? 'ACTIVE');
      if (!isRefreshable(status, expiresAt)) {
        if (isReplay(status)) {
          const familyId = String(session.data.familyId ?? '');
          if (familyId) await this.revokeFamily(familyId);
        } else {
          await FirestoreServer.set('sessions', session.id, { status: 'REVOKED', revokedAt: new Date() });
        }
        throw genericAuthError();
      }

      const userId = String(session.data.userId);
      const user = await FirestoreServer.get('users', userId);
      const role = String(user.data.role ?? 'CUSTOMER');
      const familyId = String(session.data.familyId);

      await FirestoreServer.set('sessions', session.id, { status: 'ROTATED', rotatedAt: new Date() });
      return this.generateTokens(userId, role, familyId);
    });
  }

  static async logout(refreshToken: string) {
    const tokenHash = hashSecret(refreshToken);
    const sessions = await FirestoreServer.findByField('sessions', 'refreshTokenHash', tokenHash);
    await Promise.all(sessions.map(session => FirestoreServer.set('sessions', session.id, {
      status: 'REVOKED',
      revokedAt: new Date(),
    })));
  }
}
