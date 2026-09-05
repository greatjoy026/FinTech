import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

function requiredSecret(name: string, minimumLength: number): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`[Config] Missing required environment variable: ${name}`);
  if (value.length < minimumLength) throw new Error(`[Config] Environment variable ${name} must be at least ${minimumLength} characters long`);
  return value;
}

function requireTrustedFirestoreConfig() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  const file = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  const email = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const key = process.env.FIREBASE_PRIVATE_KEY?.trim();
  if (!json && !file && !(email && key)) throw new Error('[Config] Trusted Firestore credentials are required');
  if (!process.env.FIRESTORE_DATABASE_ID?.trim()) throw new Error('[Config] FIRESTORE_DATABASE_ID is required');
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: requiredSecret('JWT_SECRET', 32),
  authDevOtp: isProduction ? undefined : process.env.AUTH_DEV_OTP?.trim() || undefined,
  monimeWebhookSecret: isProduction ? requiredSecret('MONIME_WEBHOOK_SECRET', 32) : process.env.MONIME_WEBHOOK_SECRET?.trim(),
};

requireTrustedFirestoreConfig();
if (isProduction && process.env.AUTH_DEV_OTP) throw new Error('[Config] AUTH_DEV_OTP must not be configured in production');
