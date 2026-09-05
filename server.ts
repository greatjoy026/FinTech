import express from 'express';
import path from 'path';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import { authRouter } from './backend/auth/auth.controller';
import { authenticate, requireAdmin, type AuthRequest } from './backend/auth/auth.middleware';
import { webhookController } from './src/backend/webhook/webhook.controller';
import { RealtimeGateway } from './src/backend/realtime/socket.gateway';
import { QueueService } from './src/backend/queue/queue.service';
import { reportingRouter } from './src/backend/reporting/reporting.controller';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);

  app.use(express.json({
    limit: '1mb',
    verify: (req, _res, buffer) => { (req as typeof req & { rawBody?: Buffer }).rawBody = Buffer.from(buffer); }
  }));

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
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  server.listen(PORT, '0.0.0.0', () => console.log(`Monivexa Financial Engine running on http://0.0.0.0:${PORT}`));
}

startServer().catch(error => {
  console.error('[Startup] Fatal configuration/startup error:', error);
  process.exit(1);
});
