import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

export class RealtimeGateway {
  private static io: SocketServer;

  static initialize(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: '*', // Adjust for production
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`[Realtime] Client connected: ${socket.id}`);

      // Allow admins to subscribe to global operational events
      socket.on('subscribe:admin', (token) => {
        // Verify token here -> normally verify Admin JWT
        socket.join('admin-room');
        socket.emit('system', { message: 'Subscribed to admin broadcasts' });
      });

      socket.on('disconnect', () => {
        console.log(`[Realtime] Client disconnected: ${socket.id}`);
      });
    });
  }

  static broadcastAdminEvent(event: string, payload: any) {
    if (this.io) {
      this.io.to('admin-room').emit(`admin:${event}`, payload);
    }
  }

  static broadcastUserEvent(userId: string, event: string, payload: any) {
    if (this.io) {
      this.io.to(`user-${userId}`).emit(`user:${event}`, payload);
    }
  }
}
