import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface SocketUser { userId: string; role: string }

export class RealtimeGateway {
  private static io: SocketServer;

  static initialize(server: HttpServer) {
    const configuredOrigin = process.env.APP_URL?.trim();
    this.io = new SocketServer(server, {
      cors: { origin: configuredOrigin ? configuredOrigin : false, methods: ['GET', 'POST'] }
    });

    this.io.use((socket, next) => {
      try {
        const authToken = typeof socket.handshake.auth?.token === 'string' ? socket.handshake.auth.token : undefined;
        const header = socket.handshake.headers.authorization;
        const token = authToken ?? (header?.startsWith('Bearer ') ? header.slice(7) : undefined);
        if (!token) return next(new Error('Unauthorized'));
        const payload = jwt.verify(token, env.jwtSecret) as { userId?: string; role?: string };
        if (!payload.userId || !payload.role) return next(new Error('Unauthorized'));
        socket.data.user = { userId: payload.userId, role: payload.role } satisfies SocketUser;
        next();
      } catch { next(new Error('Unauthorized')); }
    });

    this.io.on('connection', socket => {
      const user = socket.data.user as SocketUser;
      socket.join(`user-${user.userId}`);

      socket.on('subscribe:admin', () => {
        if (user.role !== 'ADMIN') {
          socket.emit('system:error', { error: 'Forbidden' });
          return;
        }
        socket.join('admin-room');
        socket.emit('system', { message: 'Subscribed to admin broadcasts' });
      });

      socket.on('disconnect', () => console.log(`[Realtime] Client disconnected: ${socket.id}`));
    });
  }

  static broadcastAdminEvent(event: string, payload: unknown) { this.io?.to('admin-room').emit(`admin:${event}`, payload); }
  static broadcastUserEvent(userId: string, event: string, payload: unknown) { this.io?.to(`user-${userId}`).emit(`user:${event}`, payload); }
}
