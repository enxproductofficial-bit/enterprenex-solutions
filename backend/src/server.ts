import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth.routes';
import employeeRoutes from './routes/employee.routes';
import attendanceRoutes from './routes/attendance.routes';
import taskRoutes from './routes/task.routes';
import kpiRoutes from './routes/kpi.routes';
import leaveRoutes from './routes/leave.routes';
import ticketRoutes from './routes/ticket.routes';
import meetingRoutes from './routes/meeting.routes';
import offerLetterRoutes from './routes/offerLetter.routes';
import notificationRoutes from './routes/notification.routes';
import reportRoutes from './routes/report.routes';
import projectRoutes from './routes/project.routes';
import announcementRoutes from './routes/announcement.routes';
import payrollRoutes from './routes/payroll.routes';
import exitRoutes from './routes/exit.routes';
import assetRoutes from './routes/asset.routes';
import expenseRoutes from './routes/expense.routes';
import dashboardRoutes from './routes/dashboard.routes';
import { initSocketService } from './services/socket.service';
import { securityHeaders, sanitizeInputs, rateLimiter, globalErrorHandler } from './middleware/security';

// Global Process Crash Prevention
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL UNCAUGHT EXCEPTION PREVENTED]:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL UNHANDLED REJECTION PREVENTED]:', reason);
});

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Real-time Socket.IO Server
initSocketService(server);

// Security & Resilience Middlewares
app.use(securityHeaders);
app.use(rateLimiter({ maxRequests: 500, windowMs: 60 * 1000 })); // 500 reqs/min

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(sanitizeInputs);

// Root Route: API Status & Directory
app.get('/', (req, res) => {
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Enterprenex EWMS Backend API v1</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: #0b0f17;
              color: #f8fafc;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .card {
              background: #111827;
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 12px;
              padding: 2.5rem;
              max-width: 650px;
              width: 90%;
              box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            }
            .badge {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              background: rgba(16, 185, 129, 0.15);
              color: #10b981;
              border: 1px solid rgba(16, 185, 129, 0.35);
              padding: 4px 10px;
              border-radius: 9999px;
              font-size: 0.75rem;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .dot {
              width: 8px;
              height: 8px;
              background: #10b981;
              border-radius: 50%;
              box-shadow: 0 0 10px #10b981;
            }
            h1 {
              font-size: 1.5rem;
              font-weight: 800;
              margin: 1rem 0 0.25rem 0;
            }
            p {
              color: #94a3b8;
              font-size: 0.88rem;
              line-height: 1.5;
              margin: 0 0 1.5rem 0;
            }
            .endpoint-list {
              background: #0f172a;
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 8px;
              padding: 1rem;
              font-family: monospace;
              font-size: 0.82rem;
              display: flex;
              flex-direction: column;
              gap: 0.5rem;
              margin-bottom: 1.5rem;
            }
            .endpoint-item {
              display: flex;
              justify-content: space-between;
              color: #cbd5e1;
            }
            .method {
              color: #38bdf8;
              font-weight: 700;
            }
            .btn {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              background: #059669;
              color: #ffffff;
              text-decoration: none;
              padding: 0.65rem 1.25rem;
              border-radius: 8px;
              font-weight: 700;
              font-size: 0.85rem;
              transition: all 0.2s ease;
            }
            .btn:hover {
              background: #10b981;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">
              <span class="dot"></span>
              Server Status: ONLINE &bull; REST API v1
            </div>
            <h1>Enterprenex Solutions Pvt Ltd</h1>
            <p>Workforce Management System (EWMS) &bull; Node.js + Express + Prisma + Socket.IO</p>

            <div class="endpoint-list">
              <div class="endpoint-item"><span><strong class="method">GET</strong> /api/v1/health</span> <span style="color:#10b981">System Health Check</span></div>
              <div class="endpoint-item"><span><strong class="method">POST</strong> /api/v1/auth/login</span> <span>JWT Authentication</span></div>
              <div class="endpoint-item"><span><strong class="method">GET</strong> /api/v1/employees</span> <span>Team Onboarding & Activation</span></div>
              <div class="endpoint-item"><span><strong class="method">GET</strong> /api/v1/offer-letters</span> <span>Offer Letters & PDF Generation</span></div>
              <div class="endpoint-item"><span><strong class="method">GET</strong> /api/v1/tasks</span> <span>Task Assignment & Sprints</span></div>
              <div class="endpoint-item"><span><strong class="method">GET</strong> /api/v1/notifications</span> <span>Live Notifications Stream</span></div>
              <div class="endpoint-item"><span><strong class="method">GET</strong> /api/v1/reports/workforce-summary</span> <span>Executive Reports</span></div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <a href="http://localhost:5173" class="btn">
                <span>Open Frontend Application (Port 5173) &rarr;</span>
              </a>
              <span style="font-size: 0.75rem; color: #64748b;">Port: ${PORT}</span>
            </div>
          </div>
        </body>
      </html>
    `);
    return;
  }

  res.json({
    status: 'ONLINE',
    service: 'Enterprenex Solutions - Enterprise Work Management System (EWMS) API',
    version: '1.0.0',
    apiVersion: 'v1',
    port: PORT,
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth/login',
      employees: '/api/v1/employees',
      offerLetters: '/api/v1/offer-letters',
      tasks: '/api/v1/tasks',
      notifications: '/api/v1/notifications',
      reports: '/api/v1/reports/workforce-summary',
      attendance: '/api/v1/attendance',
      kpis: '/api/v1/kpi'
    },
    frontendUrl: 'http://localhost:5173'
  });
});

// Health Checks
const healthHandler = (req: express.Request, res: express.Response) => {
  res.json({
    status: 'ONLINE',
    service: 'Enterprenex Solutions - Enterprise Work Management System (EWMS) API',
    version: '1.0.0',
    apiVersion: 'v1',
    timestamp: new Date().toISOString()
  });
};

app.get('/api/health', healthHandler);
app.get('/api/v1/health', healthHandler);

// ── REST API v1 Routes ──
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/kpi', kpiRoutes);
app.use('/api/v1/leaves', leaveRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/meetings', meetingRoutes);
app.use('/api/v1/offer-letters', offerLetterRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/payroll', payrollRoutes);
app.use('/api/v1/exit', exitRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// ── Backwards-Compatible /api/ Routes Aliasing ──
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/offer-letters', offerLetterRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/exit', exitRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler & Crash Boundary
app.use(globalErrorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found.` });
});

// Start Server with Socket.IO
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 ENTERPRENEX EWMS BACKEND SERVER IS RUNNING`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`🔌 Socket.IO Real-Time Engine Active`);
  console.log(`======================================================\n`);
});
