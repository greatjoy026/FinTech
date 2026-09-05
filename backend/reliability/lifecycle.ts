import type { Server } from 'http';
import { prisma } from '../../src/backend/db/prisma';
import { QueueService } from '../../src/backend/queue/queue.service';
import { logger } from '../observability/logger';

const DEFAULT_SHUTDOWN_TIMEOUT_MS = 15_000;

let shutdownPromise: Promise<void> | null = null;

export function shutdownOnce(server: Server, exit: (code: number) => void = process.exit): Promise<void> {
  if (shutdownPromise) return shutdownPromise;

  shutdownPromise = (async () => {
    let forceTimer: NodeJS.Timeout | undefined;
    try {
      logger.info('SERVER_SHUTDOWN_STARTED');
      forceTimer = setTimeout(() => {
        logger.error('SERVER_SHUTDOWN_TIMEOUT');
        exit(1);
      }, Number(process.env.SHUTDOWN_TIMEOUT_MS) || DEFAULT_SHUTDOWN_TIMEOUT_MS);
      forceTimer.unref();

      await new Promise<void>((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
      });

      await QueueService.shutdown();
      await prisma.$disconnect();
      logger.info('SERVER_SHUTDOWN_COMPLETED');
      if (forceTimer) clearTimeout(forceTimer);
    } catch (error) {
      if (forceTimer) clearTimeout(forceTimer);
      logger.error('SERVER_SHUTDOWN_FAILURE', { error: error instanceof Error ? error.name : 'unknown' });
      exit(1);
    }
  })();

  return shutdownPromise;
}
