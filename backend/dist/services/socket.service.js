"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitRealtimeNotification = exports.getSocketServer = exports.initSocketService = void 0;
const socket_io_1 = require("socket.io");
let io = null;
const initSocketService = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
        }
    });
    io.on('connection', (socket) => {
        // Client joins room based on role or employee ID
        socket.on('join_room', (data) => {
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
exports.initSocketService = initSocketService;
const getSocketServer = () => {
    return io;
};
exports.getSocketServer = getSocketServer;
const emitRealtimeNotification = (notification) => {
    if (!io)
        return;
    const payload = {
        ...notification,
        createdAt: typeof notification.createdAt === 'string' ? notification.createdAt : notification.createdAt.toISOString()
    };
    // Broadcast to specific recipient if defined
    if (notification.recipientEmail) {
        io.to(`email:${notification.recipientEmail.toLowerCase()}`).emit('ewms_notification', payload);
    }
    else if (notification.recipientEmployeeId) {
        io.to(`emp:${notification.recipientEmployeeId}`).emit('ewms_notification', payload);
    }
    else if (notification.recipientRole) {
        io.to(`role:${notification.recipientRole}`).emit('ewms_notification', payload);
        // If sent to HR Manager, also send to Super Admin / Director
        if (notification.recipientRole === 'HR Manager') {
            io.to('role:Super Admin').emit('ewms_notification', payload);
        }
    }
    else {
        // Broadcast to all active sessions
        io.emit('ewms_notification', payload);
    }
};
exports.emitRealtimeNotification = emitRealtimeNotification;
