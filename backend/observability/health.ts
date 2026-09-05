import type { Request, Response } from 'express';
import Redis from 'ioredis';
import { prisma } from '../../src/backend/db/prisma';
import { logger } from './logger';

const redisEnabled = process.env.ENABLE_REDIS === 'true';

function redisConfig() {
  return {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number.parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    connectTimeout: 1000,
    enableOfflineQueue: false,
  };
}

async function checkRedis(): Promise<boolean> {
  const client = new Redis(redisConfig());
  try {
    await client.connect();
    return (await client.ping()) === 'PONG';
  } catch (error) {
    logger.error('READINESS_REDIS_FAILURE', { error: error instanceof Error ? error.name : 'unknown' });
    return false;
  } finally {
    client.disconnect();
  }
}

export function liveness(_req: Request, res: Response): void {
  res.status(200).json({ status: 'ok', service: 'fintech-api', timestamp: new Date().toISOString() });
}

export async function readiness(_req: Request, res: Response): Promise<void> {
  const checks: Record<string, 'ok' | 'failed'> = { database: 'failed' };
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch (error) {
    logger.error('READINESS_DATABASE_FAILURE', { error: error instanceof Error ? error.name : 'unknown' });
  }

  if (redisEnabled) checks.redis = await checkRedis() ? 'ok' : 'failed';

  const ready = Object.values(checks).every(value => value === 'ok');
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not_ready', checks, timestamp: new Date().toISOString() });
}
