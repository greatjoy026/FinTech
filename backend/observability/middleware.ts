import type { Request, Response, NextFunction } from 'express';
import { increment } from './metrics';
import { logger } from './logger';

export function observabilityMiddleware(req: Request, res: Response, next: NextFunction): void {
  const started = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - started) / 1_000_000;
    increment('http_requests_total');
    if (res.statusCode >= 400) increment('http_errors_total');
    logger.info('HTTP_REQUEST', {
      requestId: String(req.headers['x-request-id'] ?? ''),
      method: req.method,
      route: req.route?.path ?? req.path,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
    });
  });
  next();
}
