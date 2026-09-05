import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

function requiredSecret(name: string, minimumLength: number): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`[Config] Missing required environment variable: ${name}`);
  }

  if (value.length < minimumLength) {
    throw new Error(`[Config] Environment variable ${name} must be at least ${minimumLength} characters long`);
  }

  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: requiredSecret('JWT_SECRET', 32),
  authDevOtp: isProduction ? undefined : process.env.AUTH_DEV_OTP?.trim() || undefined,
};

if (isProduction && process.env.AUTH_DEV_OTP) {
  throw new Error('[Config] AUTH_DEV_OTP must not be configured in production');
}
