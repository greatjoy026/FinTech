import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { Redis } from 'ioredis';
import { env } from '../config/env';
import { logger } from '../observability/logger';
import { increment } from '../observability/metrics';

const redis = new Redis({ host: env.redisHost, port: env.redisPort, password: env.redisPassword, lazyConnect: true, maxRetriesPerRequest: null });
redis.on('error', () => {});
let connectPromise: Promise<void> | null = null;
const memory = new Map<string, { count: number; resetAt: number }>();
function digest(value: string): string { return crypto.createHash('sha256').update(value, 'utf8').digest('hex'); }
function bucketKey(scope: string, identity: string): string { return `api:abuse:${scope}:${digest(identity)}`; }
function memoryAllow(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfter: number } {
  const now = Date.now(); const current = memory.get(key);
  if (!current || current.resetAt <= now) { memory.set(key, { count: 1, resetAt: now + windowMs }); return { allowed: true, retryAfter: 0 }; }
  const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  if (current.count >= limit) return { allowed: false, retryAfter };
  current.count += 1; return { allowed: true, retryAfter: 0 };
}
async function ensureRedis(): Promise<void> {
  if (redis.status === 'ready') return;
  if (!connectPromise) connectPromise = redis.connect().then(() => undefined).finally(() => { connectPromise = null; });
  await connectPromise;
}
export type AbuseRateLimitOptions = { scope: string; limit: number; windowSeconds: number };
export async function checkAbuseRateLimit(scope: string, identity: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; retryAfter: number }> {
  const key = bucketKey(scope, identity);
  if (env.nodeEnv !== 'production') return memoryAllow(key, limit, windowSeconds * 1000);
  try { await ensureRedis(); const count = await redis.incr(key); if (count === 1) await redis.expire(key, windowSeconds); if (count <= limit) return { allowed: true, retryAfter: 0 }; const ttl = await redis.ttl(key); return { allowed: false, retryAfter: Math.max(1, ttl) }; }
  catch { logger.error('ABUSE_LIMITER_UNAVAILABLE', { scope });
    return { allowed: false, retryAfter: 1 };
  }
}
function identityFor(req: Request): string {
  const principal = (req as Request & { user?: { userId?: string } }).user?.userId;
  if (principal) return `user:${principal}`;
  return `ip:${req.ip || 'unknown'}`;
}
export function abuseRateLimit(options: AbuseRateLimitOptions) {
  if (!Number.isInteger(options.limit) || options.limit < 1) throw new Error('Invalid abuse rate-limit configuration');
  if (!Number.isInteger(options.windowSeconds) || options.windowSeconds < 1) throw new Error('Invalid abuse rate-limit window');
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = await checkAbuseRateLimit(options.scope, identityFor(req), options.limit, options.windowSeconds);
    if (!result.allowed) { increment('rate_limit_responses_total'); logger.security('RATE_LIMITED', { requestId: res.getHeader('X-Request-ID'), scope: options.scope }); res.setHeader('Retry-After', String(result.retryAfter)); return res.status(429).json({ error: 'Too many requests', requestId: res.getHeader('X-Request-ID') }); }
    return next();
  };
}
