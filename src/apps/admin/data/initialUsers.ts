import { AdminUser } from '../types/user';

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr_8sf7sa',
    name: 'John Doe',
    email: 'john.doe@monivexa.com',
    phoneNumber: '+232 77 123456',
    role: 'CUSTOMER',
    status: 'active',
    balance: 240.50,
    currency: 'USD',
    risk: 'low',
    riskScore: 12,
    kycTier: 'Tier 3 (Enhanced)',
    kycVerified: true,
    dailyLimit: 2500,
    monthlyLimit: 25000,
    lastActive: '10m ago',
    createdAt: '2025-06-12',
    location: 'Freetown, Sierra Leone',
    wallets: [
      { id: 'w_101', name: 'Primary Checking', balance: 240.50, currency: 'USD', isPrimary: true },
      { id: 'w_102', name: 'Savings Vault', balance: 1200.00, currency: 'USD' }
    ],
    devices: [
      { id: 'dev_1', name: 'iPhone 15 Pro', client: 'Monivexa iOS v2.4', lastActive: 'Just now', isCurrent: true },
      { id: 'dev_2', name: 'MacBook Air M2', client: 'Chrome 122 on macOS', lastActive: 'Yesterday' }
    ],
    loginLogs: [
      { id: 'log_1', location: 'Freetown, SL', ip: '197.210.8.44', timestamp: 'Today, 2:40 PM', success: true },
      { id: 'log_2', location: 'Freetown, SL', ip: '197.210.8.44', timestamp: 'Yesterday, 8:50 AM', success: true },
      { id: 'log_3', location: 'London, UK', ip: '82.13.4.99', timestamp: 'Oct 20, 3:15 AM', success: false }
    ],
    transactions: [
      { id: 'tx_1001', description: 'Grocery Purchase - City Mart', date: 'Today, 1:15 PM', amount: 45.20, type: 'debit', status: 'completed' },
      { id: 'tx_1002', description: 'P2P Transfer from Alice Walker', date: 'Yesterday, 4:30 PM', amount: 150.00, type: 'credit', status: 'completed' },
      { id: 'tx_1003', description: 'Utility Bill Payment (EDSA)', date: '3 days ago', amount: 64.30, type: 'debit', status: 'completed' }
    ]
  },
  {
    id: 'usr_w3gfa8',
    name: 'Acme Global Corp',
    email: 'finance@acmeglobal.io',
    phoneNumber: '+234 80 234567',
    role: 'MERCHANT',
    status: 'active',
    balance: 12450.00,
    currency: 'USD',
    risk: 'low',
    riskScore: 18,
    kycTier: 'Tier 3 (Enhanced)',
    kycVerified: true,
    dailyLimit: 50000,
    monthlyLimit: 500000,
    lastActive: 'Just now',
    createdAt: '2025-01-20',
    location: 'Lagos, Nigeria',
    wallets: [
      { id: 'w_201', name: 'Merchant Settlement', balance: 12450.00, currency: 'USD', isPrimary: true },
      { id: 'w_202', name: 'Tax Escrow Reserve', balance: 4500.00, currency: 'USD' }
    ],
    devices: [
      { id: 'dev_3', name: 'Admin Workstation', client: 'Firefox on Linux', lastActive: 'Just now', isCurrent: true },
      { id: 'dev_4', name: 'POS Terminal #04', client: 'Monivexa POS v1.9', lastActive: '5m ago' }
    ],
    loginLogs: [
      { id: 'log_4', location: 'Lagos, NG', ip: '102.89.23.11', timestamp: 'Just now', success: true },
      { id: 'log_5', location: 'Lagos, NG', ip: '102.89.23.11', timestamp: 'Today, 9:00 AM', success: true }
    ],
    transactions: [
      { id: 'tx_2001', description: 'Bulk Checkout Settlement #891', date: 'Today, 2:10 PM', amount: 3200.00, type: 'credit', status: 'completed' },
      { id: 'tx_2002', description: 'Payout to Zenith Bank', date: 'Yesterday, 6:00 PM', amount: 5000.00, type: 'debit', status: 'completed' }
    ]
  },
  {
    id: 'usr_9fasd2',
    name: 'Jane Smith',
    email: 'jane.smith@outlook.com',
    phoneNumber: '+44 79 111222',
    role: 'CUSTOMER',
    status: 'frozen',
    balance: 1200.00,
    currency: 'USD',
    risk: 'high',
    riskScore: 88,
    kycTier: 'Tier 2 (Standard)',
    kycVerified: false,
    dailyLimit: 1000,
    monthlyLimit: 10000,
    lastActive: '2d ago',
    createdAt: '2025-03-10',
    location: 'London, United Kingdom',
    wallets: [
      { id: 'w_301', name: 'Primary Wallet (Frozen)', balance: 1200.00, currency: 'USD', isPrimary: true }
    ],
    devices: [
      { id: 'dev_5', name: 'Pixel 8', client: 'Monivexa Android v2.3', lastActive: '2d ago', isCurrent: true }
    ],
    loginLogs: [
      { id: 'log_6', location: 'London, UK', ip: '82.13.4.99', timestamp: '2 days ago', success: true },
      { id: 'log_7', location: 'Kyiv, UA', ip: '185.220.101.5', timestamp: '2 days ago', success: false }
    ],
    transactions: [
      { id: 'tx_3001', description: 'Cross-border Rapid Wire Flagged', date: '2 days ago', amount: 1200.00, type: 'credit', status: 'pending' }
    ]
  },
  {
    id: 'usr_2ks883',
    name: 'Global Aid Initiative',
    email: 'grants@globalaid.ngo',
    phoneNumber: '+254 71 333444',
    role: 'NGO',
    status: 'review',
    balance: 8500.00,
    currency: 'USD',
    risk: 'medium',
    riskScore: 54,
    kycTier: 'Tier 2 (Standard)',
    kycVerified: false,
    dailyLimit: 20000,
    monthlyLimit: 150000,
    lastActive: '1w ago',
    createdAt: '2024-11-05',
    location: 'Nairobi, Kenya',
    wallets: [
      { id: 'w_401', name: 'Emergency Relief Pool', balance: 8500.00, currency: 'USD', isPrimary: true }
    ],
    devices: [
      { id: 'dev_6', name: 'Aid Director Laptop', client: 'Edge on Windows 11', lastActive: '1w ago' }
    ],
    loginLogs: [
      { id: 'log_8', location: 'Nairobi, KE', ip: '196.201.214.2', timestamp: '1 week ago', success: true }
    ],
    transactions: [
      { id: 'tx_4001', description: 'UN Aid Sub-grant Deposit', date: '1 week ago', amount: 10000.00, type: 'credit', status: 'completed' },
      { id: 'tx_4002', description: 'Field Medical Supply Payment', date: '1 week ago', amount: 1500.00, type: 'debit', status: 'completed' }
    ]
  },
  {
    id: 'usr_m23400',
    name: 'Lincoln High School',
    email: 'bursar@lincolnhigh.edu.sl',
    phoneNumber: '+232 76 998877',
    role: 'SCHOOL',
    status: 'active',
    balance: 45000.00,
    currency: 'USD',
    risk: 'low',
    riskScore: 8,
    kycTier: 'Tier 3 (Enhanced)',
    kycVerified: true,
    dailyLimit: 15000,
    monthlyLimit: 200000,
    lastActive: '1h ago',
    createdAt: '2024-09-01',
    location: 'Freetown, Sierra Leone',
    wallets: [
      { id: 'w_501', name: 'Tuition Collection Vault', balance: 45000.00, currency: 'USD', isPrimary: true }
    ],
    devices: [
      { id: 'dev_7', name: 'Bursary Terminal', client: 'Chrome on Windows 10', lastActive: '1h ago', isCurrent: true }
    ],
    loginLogs: [
      { id: 'log_9', location: 'Freetown, SL', ip: '197.210.12.90', timestamp: 'Today, 11:15 AM', success: true }
    ],
    transactions: [
      { id: 'tx_5001', description: 'Term 2 Tuition Batch (48 Students)', date: 'Today, 10:30 AM', amount: 7200.00, type: 'credit', status: 'completed' },
      { id: 'tx_5002', description: 'Laboratory Supplies Order', date: '3 days ago', amount: 1450.00, type: 'debit', status: 'completed' }
    ]
  },
  {
    id: 'usr_8afasf',
    name: 'Alice Walker',
    email: 'alice.w@fintech.gh',
    phoneNumber: '+233 24 555666',
    role: 'CUSTOMER',
    status: 'active',
    balance: 1420.00,
    currency: 'USD',
    risk: 'low',
    riskScore: 14,
    kycTier: 'Tier 2 (Standard)',
    kycVerified: true,
    dailyLimit: 3000,
    monthlyLimit: 30000,
    lastActive: '4h ago',
    createdAt: '2025-04-18',
    location: 'Accra, Ghana',
    wallets: [
      { id: 'w_601', name: 'Everyday Wallet', balance: 1420.00, currency: 'USD', isPrimary: true }
    ],
    devices: [
      { id: 'dev_8', name: 'Samsung Galaxy S24', client: 'Monivexa Android v2.4', lastActive: '4h ago', isCurrent: true }
    ],
    loginLogs: [
      { id: 'log_10', location: 'Accra, GH', ip: '154.160.10.8', timestamp: 'Today, 8:20 AM', success: true }
    ],
    transactions: [
      { id: 'tx_6001', description: 'Airtime & Mobile Data Top-up', date: 'Today, 8:30 AM', amount: 25.00, type: 'debit', status: 'completed' },
      { id: 'tx_6002', description: 'Salary Disbursal from Employer', date: '4 days ago', amount: 1800.00, type: 'credit', status: 'completed' }
    ]
  },
  {
    id: 'usr_7hfds4',
    name: 'Tech Innovations Ltd',
    email: 'ops@techinnovate.rw',
    phoneNumber: '+250 78 888999',
    role: 'MERCHANT',
    status: 'active',
    balance: 34500.00,
    currency: 'USD',
    risk: 'medium',
    riskScore: 42,
    kycTier: 'Tier 3 (Enhanced)',
    kycVerified: true,
    dailyLimit: 75000,
    monthlyLimit: 750000,
    lastActive: '5m ago',
    createdAt: '2024-12-01',
    location: 'Kigali, Rwanda',
    wallets: [
      { id: 'w_701', name: 'Corporate Operations', balance: 34500.00, currency: 'USD', isPrimary: true }
    ],
    devices: [
      { id: 'dev_9', name: 'DevOps Server Gateway', client: 'API Client v1', lastActive: '5m ago', isCurrent: true }
    ],
    loginLogs: [
      { id: 'log_11', location: 'Kigali, RW', ip: '197.243.16.2', timestamp: 'Just now', success: true }
    ],
    transactions: [
      { id: 'tx_7001', description: 'API Gateway Invoiced Fees', date: 'Today, 2:55 PM', amount: 4850.00, type: 'credit', status: 'completed' }
    ]
  },
  {
    id: 'usr_p49910',
    name: 'Freetown Community Fund',
    email: 'contact@fcfund.sl',
    phoneNumber: '+232 78 445566',
    role: 'NGO',
    status: 'active',
    balance: 19800.00,
    currency: 'USD',
    risk: 'low',
    riskScore: 15,
    kycTier: 'Tier 3 (Enhanced)',
    kycVerified: true,
    dailyLimit: 30000,
    monthlyLimit: 250000,
    lastActive: '30m ago',
    createdAt: '2025-02-14',
    location: 'Freetown, Sierra Leone',
    wallets: [
      { id: 'w_801', name: 'Community Grants Vault', balance: 19800.00, currency: 'USD', isPrimary: true }
    ],
    devices: [
      { id: 'dev_10', name: 'iPad Pro', client: 'Safari on iPadOS', lastActive: '30m ago', isCurrent: true }
    ],
    loginLogs: [
      { id: 'log_12', location: 'Freetown, SL', ip: '197.210.15.30', timestamp: 'Today, 2:15 PM', success: true }
    ],
    transactions: [
      { id: 'tx_8001', description: 'Micro-loan Disbursal #410', date: 'Today, 1:45 PM', amount: 350.00, type: 'debit', status: 'completed' }
    ]
  },
  {
    id: 'usr_k11029',
    name: 'Alpha Logistics',
    email: 'admin@alphalogistics.lr',
    phoneNumber: '+231 77 001122',
    role: 'MERCHANT',
    status: 'suspended',
    balance: 4120.00,
    currency: 'USD',
    risk: 'high',
    riskScore: 79,
    kycTier: 'Tier 1 (Basic)',
    kycVerified: false,
    dailyLimit: 5000,
    monthlyLimit: 50000,
    lastActive: '3d ago',
    createdAt: '2025-05-19',
    location: 'Monrovia, Liberia',
    wallets: [
      { id: 'w_901', name: 'Settlement Escrow', balance: 4120.00, currency: 'USD', isPrimary: true }
    ],
    devices: [
      { id: 'dev_11', name: 'Office Dispatch PC', client: 'Chrome on Windows 10', lastActive: '3d ago' }
    ],
    loginLogs: [
      { id: 'log_13', location: 'Monrovia, LR', ip: '196.223.149.1', timestamp: '3 days ago', success: true }
    ],
    transactions: [
      { id: 'tx_9001', description: 'Chargeback Dispute - Order #8812', date: '3 days ago', amount: 890.00, type: 'debit', status: 'failed' }
    ]
  },
  {
    id: 'usr_d88321',
    name: 'Dr. David Kamara',
    email: 'dkamara@medicare.sl',
    phoneNumber: '+232 79 123987',
    role: 'CUSTOMER',
    status: 'active',
    balance: 6780.00,
    currency: 'USD',
    risk: 'low',
    riskScore: 5,
    kycTier: 'Tier 3 (Enhanced)',
    kycVerified: true,
    dailyLimit: 10000,
    monthlyLimit: 100000,
    lastActive: '12m ago',
    createdAt: '2024-10-11',
    location: 'Bo, Sierra Leone',
    wallets: [
      { id: 'w_1001', name: 'Private Medical Account', balance: 6780.00, currency: 'USD', isPrimary: true }
    ],
    devices: [
      { id: 'dev_12', name: 'iPhone 14', client: 'Monivexa iOS v2.4', lastActive: '12m ago', isCurrent: true }
    ],
    loginLogs: [
      { id: 'log_14', location: 'Bo, SL', ip: '197.210.88.2', timestamp: 'Today, 2:32 PM', success: true }
    ],
    transactions: [
      { id: 'tx_10001', description: 'Consultancy Retainer Fee', date: 'Today, 11:00 AM', amount: 1500.00, type: 'credit', status: 'completed' }
    ]
  }
];
