import crypto from 'crypto';
import Redis from 'ioredis';
import { env } from '../config/env';

const redis = new Redis({
  host: env.redisHost,
  port: env.redisPort,
  password: env.redisPassword,
  lazyConnect: true,
  maxRetriesPerRequest: null,
});

let connectPromise: Promise<void> | null = null;
const memory = new Map<string, { count: number; resetAt: number }>();

function key(scope: string, value: string): string {
  return `auth:rl:${scope}:${crypto.createHash('sha256').update(value, 'utf8').digest('hex')}`;
}

async function ensureRedis(): Promise<void> {
  if (redis.status === 'ready') return;
  if (!connectPromise) {
    connectPromise = redis.connect().then(() => undefined).finally(() => { connectPromise = null; });
  }
  await connectPromise;
}

function memoryLimit(bucket: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const current = memory.get(bucket);
  if (!current || current.resetAt <= now) {
    memory.set(bucket, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export class AuthRateLimiter {
  static async allow(scope: string, value: string, limit: number, windowSeconds: number): Promise<boolean> {
    if (env.nodeEnv !== 'production') return memoryLimit(key(scope, value), limit, windowSeconds * 1000);

    try {
      await ensureRedis();
      const redisKey = key(scope, value);
      const count = await redis.incr(redisKey);
      if (count === 1) await redis.expire(redisKey, windowSeconds);
      return count <= limit;
    } catch {
      // Authentication abuse controls fail closed in production.
      return false;
    }
  }

  static async withRefreshLock<T>(tokenHash: string, operation: () => Promise<T>): Promise<T> {
    if (env.nodeEnv !== 'production') return operation();

    const lockKey = `auth:refresh-lock:${tokenHash}`;
    const lockValue = crypto.randomBytes(16).toString('hex');
    try {
      await ensureRedis();
      const acquired = await redis.set(lockKey, lockValue, 'EX', 10, 'NX');
      if (acquired !== 'OK') throw new Error('Authentication request is already being processed');
      return await operation();
    } finally {
      try {
        await redis.eval(
          "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
          1,
          lockKey,
          lockValue,
        );
      } catch {
        // The lock has a short TTL; cleanup failure must not expose credentials.
      }
    }
  }
}
