import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, getDocs, setDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';

function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code, 'utf8').digest('hex');
}

function secureOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function otpMatches(storedHash: string, suppliedCode: string): boolean {
  const suppliedHash = Buffer.from(hashOtp(suppliedCode), 'utf8');
  const expectedHash = Buffer.from(storedHash, 'utf8');
  return suppliedHash.length === expectedHash.length && crypto.timingSafeEqual(suppliedHash, expectedHash);
}

export class AuthService {
  // 1. Generate OTP
  static async requestOtp(phoneNumber: string) {
    // A deterministic OTP is permitted only for explicitly configured non-production
    // environments. Production always uses a cryptographically secure OTP.
    const code = env.authDevOtp ?? secureOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    const newId = crypto.randomUUID();
    const otpRef = doc(db, 'otp_codes', newId);
    
    try {
      await setDoc(otpRef, {
        phoneNumber,
        codeHash: hashOtp(code),
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: Timestamp.now()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'otp_codes');
    }

    // The actual SMS delivery integration is intentionally outside SEC-002.
    // Never return or log the OTP from the production API response.
    return { message: 'OTP sent successfully' };
  }

  // 2. Verify OTP & Login
  // Authentication establishes identity only. Authorization roles are
  // resolved from trusted server-side user data and are never supplied by
  // the caller during login.
  static async verifyOtpAndLogin(phoneNumber: string, code: string) {
    let otpRecord: any = null;
    let otpId = '';

    try {
      const q = query(
        collection(db, 'otp_codes'),
        where('phoneNumber', '==', phoneNumber)
      );
      const snapshot = await getDocs(q);
      
      const validOtp = snapshot.docs.find(d => {
        const data = d.data();
        const expiresAt = data.expiresAt?.toDate?.();
        return Boolean(expiresAt) && expiresAt > new Date() && typeof data.codeHash === 'string' && otpMatches(data.codeHash, code);
      });

      if (validOtp) {
        otpRecord = validOtp.data();
        otpId = validOtp.id;
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'otp_codes');
    }

    if (!otpRecord) {
      throw new Error('Invalid or expired OTP');
    }

    // Mark used / delete. A future authentication hardening task should make
    // this consume operation transactional against concurrent verification.
    try {
      await deleteDoc(doc(db, 'otp_codes', otpId));
    } catch (e) {}

    // Find or create user. The role is authoritative server-side state.
    let user: any = null;
    let userId = '';
    
    try {
      const uq = query(collection(db, 'users'), where('phoneNumber', '==', phoneNumber));
      const uSnap = await getDocs(uq);
      if (!uSnap.empty) {
        userId = uSnap.docs[0].id;
        user = uSnap.docs[0].data();
      } else {
        userId = crypto.randomUUID();
        user = {
          phoneNumber,
          role: 'CUSTOMER',
          createdAt: Timestamp.now()
        };
        await setDoc(doc(db, 'users', userId), user);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'users');
    }

    // Generate tokens using only the trusted server-side user role.
    return await this.generateTokens(userId, user.role);
  }

  // 3. Generate JWT & Refresh Tokens
  static async generateTokens(userId: string, role: string) {
    const accessToken = jwt.sign({ userId, role }, env.jwtSecret, { expiresIn: '15m' });
    const refreshTokenBase = crypto.randomBytes(40).toString('hex');
    
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const sessionId = crypto.randomUUID();

    try {
      await setDoc(doc(db, 'sessions', sessionId), {
        userId,
        refreshToken: refreshTokenBase,
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: Timestamp.now()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'sessions');
    }

    return {
      accessToken,
      refreshToken: refreshTokenBase,
      userId,
      role
    };
  }

  // 4. Refresh Token
  static async refresh(refreshToken: string) {
    let session: any = null;
    let sessionId = '';
    
    try {
      const q = query(collection(db, 'sessions'), where('refreshToken', '==', refreshToken));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        sessionId = snapshot.docs[0].id;
        session = snapshot.docs[0].data();
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'sessions');
    }

    if (!session || session.expiresAt.toDate() < new Date()) {
      if (sessionId) {
        try { await deleteDoc(doc(db, 'sessions', sessionId)); } catch (e) {}
      }
      throw new Error('Invalid or expired refresh token');
    }

    // Get user to fetch their role
    let role = 'CUSTOMER';
    try {
      const uq = query(collection(db, 'users'), where('__name__', '==', session.userId));
      const usnap = await getDocs(uq);
      if(!usnap.empty) {
        role = usnap.docs[0].data().role;
      }
    } catch (e) {}

    try { await deleteDoc(doc(db, 'sessions', sessionId)); } catch (e) {}
    
    return await this.generateTokens(session.userId, role);
  }

  // 5. Logout
  static async logout(refreshToken: string) {
    try {
      const q = query(collection(db, 'sessions'), where('refreshToken', '==', refreshToken));
      const snapshot = await getDocs(q);
      for(const d of snapshot.docs) {
        await deleteDoc(d.ref);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'sessions');
    }
  }
}
