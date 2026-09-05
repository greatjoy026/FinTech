import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { FirestoreServer } from '../firestore';
import { env } from '../config/env';

function hashSecret(value: string): string { return crypto.createHash('sha256').update(value, 'utf8').digest('hex'); }
function secureOtp(): string { return crypto.randomInt(100000, 1000000).toString(); }
function otpMatches(storedHash: string, suppliedCode: string): boolean {
  const suppliedHash = Buffer.from(hashSecret(suppliedCode), 'utf8');
  const expectedHash = Buffer.from(storedHash, 'utf8');
  return suppliedHash.length === expectedHash.length && crypto.timingSafeEqual(suppliedHash, expectedHash);
}

export class AuthService {
  static async requestOtp(phoneNumber: string) {
    const code = env.authDevOtp ?? secureOtp();
    await FirestoreServer.set('otp_codes', crypto.randomUUID(), { phoneNumber, codeHash: hashSecret(code), expiresAt: new Date(Date.now() + 5 * 60 * 1000), createdAt: new Date() });
    return { message: 'OTP sent successfully' };
  }

  static async verifyOtpAndLogin(phoneNumber: string, code: string) {
    const records = await FirestoreServer.findByField('otp_codes', 'phoneNumber', phoneNumber);
    const valid = records.find(record => new Date(record.data.expiresAt).getTime() > Date.now() && typeof record.data.codeHash === 'string' && otpMatches(record.data.codeHash, code));
    if (!valid) throw new Error('Invalid or expired OTP');
    await FirestoreServer.delete('otp_codes', valid.id);

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

  static async generateTokens(userId: string, role: string) {
    const accessToken = jwt.sign({ userId, role }, env.jwtSecret, { expiresIn: '15m' });
    const refreshToken = crypto.randomBytes(40).toString('hex');
    await FirestoreServer.set('sessions', crypto.randomUUID(), { userId, refreshTokenHash: hashSecret(refreshToken), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), createdAt: new Date() });
    return { accessToken, refreshToken, userId, role };
  }

  static async refresh(refreshToken: string) {
    const sessions = await FirestoreServer.findByField('sessions', 'refreshTokenHash', hashSecret(refreshToken));
    const session = sessions.find(s => new Date(s.data.expiresAt).getTime() > Date.now());
    if (!session) throw new Error('Invalid or expired refresh token');
    const user = await FirestoreServer.get('users', String(session.data.userId));
    const role = String(user.data.role ?? 'CUSTOMER');
    await FirestoreServer.delete('sessions', session.id);
    return this.generateTokens(String(session.data.userId), role);
  }

  static async logout(refreshToken: string) {
    const sessions = await FirestoreServer.findByField('sessions', 'refreshTokenHash', hashSecret(refreshToken));
    for (const session of sessions) await FirestoreServer.delete('sessions', session.id);
  }
}
