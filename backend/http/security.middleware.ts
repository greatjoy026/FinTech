import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import type { IncomingHttpHeaders } from 'http';
import { logger } from '../observability/logger';
import { increment } from '../observability/metrics';

const REQUEST_ID_HEADER = 'X-Request-ID';
const MAX_REQUEST_ID_LENGTH = 128;
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const supplied = req.header(REQUEST_ID_HEADER)?.trim();
  const requestId = supplied && REQUEST_ID_PATTERN.test(supplied) && supplied.length <= MAX_REQUEST_ID_LENGTH ? supplied : crypto.randomUUID();
  res.setHeader(REQUEST_ID_HEADER, requestId);
  (req as Request & { requestId?: string }).requestId = requestId;
  next();
}

export function securityMethodGuard(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'TRACE' || req.method === 'CONNECT') {
    increment('http_errors_total');
    logger.security('HTTP_METHOD_BLOCKED', { requestId: res.getHeader(REQUEST_ID_HEADER), method: req.method });
    return res.status(405).json({ error: 'Method not allowed', requestId: res.getHeader(REQUEST_ID_HEADER) });
  }
  return next();
}

export function notFoundHandler(req: Request, res: Response) {
  return res.status(404).json({ error: 'Not found', requestId: res.getHeader(REQUEST_ID_HEADER) });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  const requestId = res.getHeader(REQUEST_ID_HEADER);
  increment('http_errors_total');
  logger.error('HTTP_UNHANDLED_ERROR', { requestId, error: error instanceof Error ? error.name : 'unknown' });
  if (res.headersSent) return;
  const status = typeof error === 'object' && error !== null && 'status' in error && Number.isInteger((error as { status?: unknown }).status) && Number((error as { status?: unknown }).status) >= 400 && Number((error as { status?: unknown }).status) < 500 ? Number((error as { status: number }).status) : 500;
  const message = status === 413 ? 'Request entity too large' : status === 400 ? 'Invalid request' : 'Internal server error';
  return res.status(status).json({ error: message, requestId });
}

export function hasWildcardOrigin(headers: IncomingHttpHeaders): boolean { return headers.origin === '*'; }
