import express from 'express';
import path from 'path';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import { authRouter } from './backend/auth/auth.controller';
import { authenticate, requireRole } from './backend/auth/auth.middleware';
import { webhookController } from './src/backend/webhook/webhook.controller';
import { RealtimeGateway } from './src/backend/realtime/socket.gateway';
import { QueueService } from './src/backend/queue/queue.service';
import { reportingRouter } from './src/backend/reporting/reporting.controller';

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const server = http.createServer(app);

  app.use(express.json());

  // Attach API routes
  app.use('/api/auth', authRouter);
  app.use('/api/reports', authenticate, reportingRouter);
  app.post('/api/webhooks/monime', webhookController);

  // Initialize Realtime & Queues
  RealtimeGateway.initialize(server);
  try {
    QueueService.initializeProcessors();
    console.log('[Queue] Processors initialized');
  } catch (e) {
    console.warn('[Queue] Redis connection delayed or failing');
  }

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Monivexa Ops API', timestamp: new Date().toISOString() });
  });

  // Example protected route
  app.get('/api/protected', authenticate, (req: any, res) => {
    res.json({ message: 'Success', user: req.user });
  });
  
  app.get('/api/admin-only', authenticate, requireRole(['ADMIN']), (req: any, res) => {
    res.json({ message: 'Welcome Admin' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Monivexa Financial Engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

