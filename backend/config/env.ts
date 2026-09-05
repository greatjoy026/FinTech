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

function requireRedisConfig() {
  if (!isProduction) return;
  if (!process.env.REDIS_HOST?.trim()) throw new Error('[Config] REDIS_HOST is required in production');
  if (!process.env.REDIS_PORT?.trim()) throw new Error('[Config] REDIS_PORT is required in production');
}

function configuredOrigins(): string[] {
  const value = process.env.APP_URL?.trim();
  if (!value) {
    if (isProduction) throw new Error('[Config] APP_URL is required in production');
    return ['http://localhost:3000'];
  }
  return value.split(',').map(origin => origin.trim()).filter(Boolean);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: requiredSecret('JWT_SECRET', 32),
  authDevOtp: isProduction ? undefined : process.env.AUTH_DEV_OTP?.trim() || undefined,
  monimeWebhookSecret: isProduction ? requiredSecret('MONIME_WEBHOOK_SECRET', 32) : process.env.MONIME_WEBHOOK_SECRET?.trim(),
  redisHost: process.env.REDIS_HOST?.trim() || '127.0.0.1',
  redisPort: Number(process.env.REDIS_PORT || 6379),
  redisPassword: process.env.REDIS_PASSWORD?.trim() || undefined,
  allowedOrigins: configuredOrigins(),
};

requireTrustedFirestoreConfig();
requireRedisConfig();

if (!Number.isInteger(env.redisPort) || env.redisPort < 1 || env.redisPort > 65535) {
  throw new Error('[Config] REDIS_PORT must be a valid TCP port');
}

if (isProduction && process.env.AUTH_DEV_OTP) throw new Error('[Config] AUTH_DEV_OTP must not be configured in production');
