import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server | null = null;

export const initSocketService = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }
  });

  io.on('connection', (socket: Socket) => {
    // Client joins room based on role or employee ID
    socket.on('join_room', (data: { role?: string; employeeId?: string; email?: string }) => {
      if (data.role) {
        socket.join(`role:${data.role}`);
      }
      if (data.employeeId) {
        socket.join(`emp:${data.employeeId}`);
      }
      if (data.email) {
        socket.join(`email:${data.email.toLowerCase()}`);
      }
    });

    socket.on('disconnect', () => {
      // socket disconnected
    });
  });

  return io;
};

export const getSocketServer = (): Server | null => {
  return io;
};

export const emitRealtimeNotification = (notification: {
  id: string;
  type: string;
  title: string;
  message: string;
  recipientRole?: string | null;
  recipientEmail?: string | null;
  recipientEmployeeId?: string | null;
  actionUrl?: string | null;
  createdAt: string | Date;
}) => {
  if (!io) return;

  const payload = {
    ...notification,
    createdAt: typeof notification.createdAt === 'string' ? notification.createdAt : notification.createdAt.toISOString()
  };

  // Broadcast to specific recipient if defined
  if (notification.recipientEmail) {
    io.to(`email:${notification.recipientEmail.toLowerCase()}`).emit('ewms_notification', payload);
  } else if (notification.recipientEmployeeId) {
    io.to(`emp:${notification.recipientEmployeeId}`).emit('ewms_notification', payload);
  } else if (notification.recipientRole) {
    io.to(`role:${notification.recipientRole}`).emit('ewms_notification', payload);
    // If sent to HR Manager, also send to Super Admin / Director
    if (notification.recipientRole === 'HR Manager') {
      io.to('role:Super Admin').emit('ewms_notification', payload);
    }
  } else {
    // Broadcast to all active sessions
    io.emit('ewms_notification', payload);
  }
};

