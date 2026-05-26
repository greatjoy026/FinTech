import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, getDocs, setDoc, doc, deleteDoc, Timestamp, orderBy, limit } from 'firebase/firestore';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_dev_only';

export class AuthService {
  // 1. Generate OTP
  static async requestOtp(phoneNumber: string) {
    const code = '123456'; 
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    const newId = crypto.randomUUID();
    const otpRef = doc(db, 'otp_codes', newId);
    
    try {
      await setDoc(otpRef, {
        phoneNumber,
        code,
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: Timestamp.now()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'otp_codes');
    }

    return { message: 'OTP sent successfully' };
  }

  // 2. Verify OTP & Login
  static async verifyOtpAndLogin(phoneNumber: string, code: string, role?: string) {
    let otpRecord: any = null;
    let otpId = '';

    try {
      const q = query(
        collection(db, 'otp_codes'),
        where('phoneNumber', '==', phoneNumber),
        where('code', '==', code)
      );
      const snapshot = await getDocs(q);
      
      const validOtps = snapshot.docs.filter(d => {
        const data = d.data();
        return data.expiresAt.toDate() > new Date();
      });

      if (validOtps.length > 0) {
        // Just take the first valid one
        const d = validOtps[0];
        otpRecord = d.data();
        otpId = d.id;
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'otp_codes');
    }

    if (!otpRecord) {
      throw new Error('Invalid or expired OTP');
    }

    // Mark used / delete
    try {
      await deleteDoc(doc(db, 'otp_codes', otpId));
    } catch (e) {}

    // Find or create user
    let user: any = null;
    let userId = '';
    
    try {
      const uq = query(collection(db, 'users'), where('phoneNumber', '==', phoneNumber));
      const uSnap = await getDocs(uq);
      if (!uSnap.empty) {
        userId = uSnap.docs[0].id;
        user = uSnap.docs[0].data();
        // For testing prototype: Update their role to whatever they selected
        if (role && user.role !== role) {
          user.role = role;
          try {
            await setDoc(doc(db, 'users', userId), { role: role }, { merge: true });
          } catch (e) {
            handleFirestoreError(e, OperationType.UPDATE, 'users');
          }
        }
      } else {
        userId = crypto.randomUUID();
        user = {
          phoneNumber,
          role: role || 'CUSTOMER',
          createdAt: Timestamp.now()
        };
        await setDoc(doc(db, 'users', userId), user);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'users');
    }

    // Generate tokens
    return await this.generateTokens(userId, user.role);
  }

  // 3. Generate JWT & Refresh Tokens
  static async generateTokens(userId: string, role: string) {
    const accessToken = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '15m' });
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

