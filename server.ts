import express from 'express';
import path from 'path';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import helmet from 'helmet';
import { authRouter } from './backend/auth/auth.controller';
import { authenticate, requireAdmin, type AuthRequest } from './backend/auth/auth.middleware';
import { requirePrivilegedOperation } from './backend/auth/privileged-operations';
import { env } from './backend/config/env';
import { abuseRateLimit } from './backend/http/abuse-rate-limit';
import { requestIdMiddleware, securityMethodGuard, errorHandler, notFoundHandler } from './backend/http/security.middleware';
import { AuditService } from './backend/audit/audit.service';
import { logger } from './backend/observability/logger';
import { observabilityMiddleware } from './backend/observability/middleware';
import { prometheusMetrics } from './backend/observability/metrics';
import { liveness, readiness } from './backend/observability/health';
import { shutdownOnce } from './backend/reliability/lifecycle';
import { webhookController } from './src/backend/webhook/webhook.controller';
import { RealtimeGateway } from './src/backend/realtime/socket.gateway';
import { QueueService } from './src/backend/queue/queue.service';
import { reportingRouter } from './src/backend/reporting/reporting.controller';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);
  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) throw new Error('[Config] PORT must be a valid TCP port');
  const server = http.createServer(app);

  app.disable('x-powered-by');
  app.set('trust proxy', env.trustProxy);
  app.use(requestIdMiddleware);
  app.use(observabilityMiddleware);
  app.use(securityMethodGuard);
  app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === 'production', crossOriginEmbedderPolicy: false }));
  app.use(cors({ origin: (origin, callback) => {
    if (!origin || env.allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin denied'));
  }, credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-ID'], maxAge: 600 }));
  app.use(express.json({ limit: '1mb', verify: (req, _res, buffer) => { (req as typeof req & { rawBody?: Buffer }).rawBody = Buffer.from(buffer); } }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));

  app.use('/api/auth', authRouter);
  app.use('/api/reports', authenticate, requireAdmin, abuseRateLimit({ scope: 'reports', limit: 60, windowSeconds: 60 }), reportingRouter);
  app.post('/api/webhooks/monime', webhookController);
  RealtimeGateway.initialize(server);
  try { QueueService.initializeProcessors(); logger.info('QUEUE_PROCESSORS_INITIALIZED'); }
  catch (error) { logger.error('QUEUE_PROCESSOR_INITIALIZATION_FAILURE', { error: error instanceof Error ? error.name : 'unknown' }); }

  app.get('/api/health', liveness);
  app.get('/api/ready', readiness);
  app.get('/api/metrics', authenticate, requireAdmin, requirePrivilegedOperation('PRODUCTION_ACCESS'), (_req, res) => res.type('text/plain; version=0.0.4').send(prometheusMetrics()));
  app.get('/api/protected', authenticate, abuseRateLimit({ scope: 'protected', limit: 120, windowSeconds: 60 }), (req: AuthRequest, res) => res.json({ message: 'Success', user: req.user }));
  app.get('/api/admin-only', authenticate, requireAdmin, requirePrivilegedOperation('PRODUCTION_ACCESS'), abuseRateLimit({ scope: 'admin-only', limit: 60, windowSeconds: 60 }), async (req: AuthRequest, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      await AuditService.record({ actorId: req.user.userId, role: req.user.role, action: 'ADMIN_API_ACCESS', resource: 'ADMIN_API', resourceId: req.path, outcome: 'SUCCESS', requestId: String(req.headers['x-request-id'] ?? ''), ipAddress: req.ip, device: String(req.headers['user-agent'] ?? '').slice(0, 512) || undefined });
      return res.json({ message: 'Welcome Admin' });
    } catch (error) { return next(error); }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res) => req.path.startsWith('/api/') ? notFoundHandler(req, res) : res.sendFile(path.join(distPath, 'index.html')));
  }
  app.use(notFoundHandler);
  app.use(errorHandler);

  const shutdown = () => { void shutdownOnce(server); };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);

  server.listen(PORT, '0.0.0.0', () => logger.info('SERVER_STARTED', { port: PORT }));
  return server;
}

startServer().catch(error => { logger.error('STARTUP_FATAL', { error: error instanceof Error ? error.name : 'unknown' }); process.exit(1); });
