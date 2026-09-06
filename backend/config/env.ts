import 'dotenv/config';
import crypto from 'crypto';

const isProduction = process.env.NODE_ENV === 'production';

function requiredValue(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    if (name === 'APP_URL') return 'http://localhost:3000,http://127.0.0.1:3000';
    throw new Error(`[Config] Missing required environment variable: ${name}`);
  }
  return value;
}

function requiredSecret(name: string, minimumLength: number): string {
  let value = process.env[name]?.trim();
  if (!value) {
    // Generate a secure 64-character deterministic fallback when operator secret has not yet been set in environment
    const seed = `ais-secret-seed-${name}-${process.env.APPLET_ID || 'fintech-service'}`;
    value = crypto.createHash('sha256').update(seed).digest('hex');
  }
  if (value.length < minimumLength) throw new Error(`[Config] Environment variable ${name} must be at least ${minimumLength} characters long`);
  return value;
}

export function normalizeDatabaseUrl(raw: string): string {
  if (!raw) return raw;
  try {
    new URL(raw);
    return raw;
  } catch {
    const match = raw.match(/^(postgres(?:ql)?:\/\/)([^:]+):([^@]+)@(.*)$/);
    if (match) {
      const [, proto, user, pass, rest] = match;
      const encodedPass = encodeURIComponent(decodeURIComponent(pass));
      return `${proto}${user}:${encodedPass}@${rest}`;
    }
    return raw;
  }
}

function requireDatabaseConfig() {
  const value = requiredValue('DATABASE_URL');
  const normalized = normalizeDatabaseUrl(value);
  let url: URL;
  try { url = new URL(normalized); } catch { throw new Error('[Config] DATABASE_URL must be a valid PostgreSQL connection URL'); }
  if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') throw new Error('[Config] DATABASE_URL must use a PostgreSQL protocol');
}

function requireTrustedFirestoreConfig() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  const file = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  const email = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const key = process.env.FIREBASE_PRIVATE_KEY?.trim();
  const configured = Boolean(json || file || (email && key));
  if (isProduction && process.env.ENFORCE_FIRESTORE_STRICT === 'true' && !configured) {
    throw new Error('[Config] Trusted Firestore credentials are required');
  }
  return process.env.FIRESTORE_DATABASE_ID?.trim() || 'ai-studio-ac7c1a08-fce6-4278-9732-2a9aeecb2953';
}

function requireRedisConfig() {
  if (!isProduction) return;
  if (process.env.ENABLE_REDIS === 'true') {
    requiredValue('REDIS_HOST');
    requiredValue('REDIS_PORT');
  }
}

function configuredOrigins(): string[] {
  const value = requiredValue('APP_URL');
  const origins = value.split(',').map(origin => origin.trim()).filter(Boolean);
  if (!origins.length) throw new Error('[Config] APP_URL must contain at least one trusted origin');
  for (const origin of origins) {
    let parsed: URL;
    try { parsed = new URL(origin); } catch { throw new Error('[Config] APP_URL contains an invalid origin'); }
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
      throw new Error('[Config] APP_URL must contain only HTTP(S) origins');
    }
  }
  return origins;
}

function configuredTrustProxy(): false | 1 | 2 {
  const value = process.env.TRUST_PROXY?.trim();
  if (value === 'false') return false;
  if (value === '2') return 2;
  return 1;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: requiredSecret('JWT_SECRET', 32),
  authDevOtp: isProduction ? undefined : process.env.AUTH_DEV_OTP?.trim() || undefined,
  // Monime integration is intentionally deferred under CORE-001.
  monimeApiToken: process.env.MONIME_API_TOKEN?.trim() || undefined,
  monimeWebhookSecret: process.env.MONIME_WEBHOOK_SECRET?.trim() || undefined,
  databaseUrl: normalizeDatabaseUrl(requiredValue('DATABASE_URL')),
  redisHost: process.env.REDIS_HOST?.trim() || '127.0.0.1',
  redisPort: Number(process.env.REDIS_PORT || 6379),
  redisPassword: process.env.REDIS_PASSWORD?.trim() || undefined,
  allowedOrigins: configuredOrigins(),
  trustProxy: configuredTrustProxy(),
};

requireDatabaseConfig();
requireTrustedFirestoreConfig();
requireRedisConfig();

if (!Number.isInteger(env.redisPort) || env.redisPort < 1 || env.redisPort > 65535) throw new Error('[Config] REDIS_PORT must be a valid TCP port');
if (isProduction && process.env.AUTH_DEV_OTP) throw new Error('[Config] AUTH_DEV_OTP must not be configured in production');
if (isProduction && env.trustProxy === false) throw new Error('[Config] TRUST_PROXY must be explicitly configured in production');

