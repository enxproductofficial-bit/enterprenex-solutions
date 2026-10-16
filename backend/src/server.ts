import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth.routes';
import employeeRoutes from './routes/employee.routes';
import attendanceRoutes from './routes/attendance.routes';
import taskRoutes from './routes/task.routes';
import kpiRoutes from './routes/kpi.routes';
import leaveRoutes from './routes/leave.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Root Route: API Status & Directory
app.get('/', (req, res) => {
  // Return HTML if accessed via web browser, otherwise JSON
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Enterprenex EWMS Backend API</title>
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
              max-width: 620px;
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
              Server Status: ONLINE
            </div>
            <h1>Enterprenex Solutions Pvt Ltd</h1>
            <p>Enterprise Work Management System (EWMS) &bull; Node.js + Prisma API Server</p>

            <div class="endpoint-list">
              <div class="endpoint-item"><span><strong class="method">GET</strong> /api/health</span> <span style="color:#10b981">System Health Check</span></div>
              <div class="endpoint-item"><span><strong class="method">POST</strong> /api/auth/login</span> <span>JWT Authentication</span></div>
              <div class="endpoint-item"><span><strong class="method">GET</strong> /api/employees</span> <span>Team & Skill Matrix</span></div>
              <div class="endpoint-item"><span><strong class="method">GET</strong> /api/tasks</span> <span>Tasks & Stopwatch Logs</span></div>
              <div class="endpoint-item"><span><strong class="method">GET</strong> /api/attendance</span> <span>Biometric Attendance</span></div>
              <div class="endpoint-item"><span><strong class="method">GET</strong> /api/kpi</span> <span>Weighted KPI Scorecards</span></div>
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
    port: PORT,
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/login',
      employees: '/api/employees',
      tasks: '/api/tasks',
      attendance: '/api/attendance',
      kpis: '/api/kpi'
    },
    frontendUrl: 'http://localhost:5173'
  });
});

// Health & Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Enterprenex Solutions - Enterprise Work Management System (EWMS) API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/leaves', leaveRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found.` });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 ENTERPRENEX EWMS BACKEND SERVER IS RUNNING`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});
