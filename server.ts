import express from 'express';
import path from 'path';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import helmet from 'helmet';
import { authRouter } from './backend/auth/auth.controller';
import { authenticate, requireAdmin, type AuthRequest } from './backend/auth/auth.middleware';
import { env } from './backend/config/env';
import { webhookController } from './src/backend/webhook/webhook.controller';
import { RealtimeGateway } from './src/backend/realtime/socket.gateway';
import { QueueService } from './src/backend/queue/queue.service';
import { reportingRouter } from './src/backend/reporting/reporting.controller';
import { errorHandler, notFoundHandler, requestIdMiddleware, securityMethodGuard } from './backend/http/security.middleware';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);

  app.disable('x-powered-by');
  app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);

  app.use(requestIdMiddleware);
  app.use(securityMethodGuard);
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false,
  }));
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || env.allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('CORS origin denied'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-ID'],
    maxAge: 600,
  }));

  app.use(express.json({
    limit: '1mb',
    verify: (req, _res, buffer) => { (req as typeof req & { rawBody?: Buffer }).rawBody = Buffer.from(buffer); }
  }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));

  app.use('/api/auth', authRouter);
  app.use('/api/reports', authenticate, requireAdmin, reportingRouter);
  app.post('/api/webhooks/monime', webhookController);

  RealtimeGateway.initialize(server);
  try {
    QueueService.initializeProcessors();
    console.log('[Queue] Processors initialized');
  } catch (e) {
    console.error('[Queue] Processor initialization failed:', e);
  }

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'Monivexa Ops API', timestamp: new Date().toISOString() }));
  app.get('/api/protected', authenticate, (req: AuthRequest, res) => res.json({ message: 'Success', user: req.user }));
  app.get('/api/admin-only', authenticate, requireAdmin, (_req, res) => res.json({ message: 'Welcome Admin' }));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) return notFoundHandler(req, res);
      return res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  server.listen(PORT, '0.0.0.0', () => console.log(`Monivexa Financial Engine running on http://0.0.0.0:${PORT}`));
}

startServer().catch(error => {
  console.error('[Startup] Fatal configuration/startup error:', error instanceof Error ? error.message : 'unknown error');
  process.exit(1);
});
