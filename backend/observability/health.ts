import type { Request, Response } from 'express';
import { prisma } from '../../src/backend/db/prisma';
import { logger } from './logger';

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
  const ready = Object.values(checks).every(value => value === 'ok');
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not_ready', checks, timestamp: new Date().toISOString() });
}
