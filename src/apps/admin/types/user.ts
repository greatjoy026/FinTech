export type UserRole = 'CUSTOMER' | 'MERCHANT' | 'NGO' | 'SCHOOL' | 'ADMIN';
export type UserStatus = 'active' | 'frozen' | 'suspended' | 'review';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface UserWallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
  isPrimary?: boolean;
}

export interface UserDevice {
  id: string;
  name: string;
  client: string;
  lastActive: string;
  isCurrent?: boolean;
}

export interface UserLoginLog {
  id: string;
  location: string;
  ip: string;
  timestamp: string;
  success: boolean;
}

export interface UserTransaction {
  id: string;
  description: string;
  date: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  status: UserStatus;
  balance: number;
  currency: string;
  risk: RiskLevel;
  riskScore: number;
  kycTier: string;
  kycVerified: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  lastActive: string;
  createdAt: string;
  location: string;
  wallets: UserWallet[];
  devices: UserDevice[];
  loginLogs: UserLoginLog[];
  transactions: UserTransaction[];
}
