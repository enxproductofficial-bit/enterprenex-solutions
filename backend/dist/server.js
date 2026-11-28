"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.DATABASE_URL) {
    console.error('[CRITICAL SECURITY ERROR]: DATABASE_URL is not set in environment.');
}
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const employee_routes_1 = __importDefault(require("./routes/employee.routes"));
const attendance_routes_1 = __importDefault(require("./routes/attendance.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const kpi_routes_1 = __importDefault(require("./routes/kpi.routes"));
const leave_routes_1 = __importDefault(require("./routes/leave.routes"));
const ticket_routes_1 = __importDefault(require("./routes/ticket.routes"));
const meeting_routes_1 = __importDefault(require("./routes/meeting.routes"));
const offerLetter_routes_1 = __importDefault(require("./routes/offerLetter.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const announcement_routes_1 = __importDefault(require("./routes/announcement.routes"));
const payroll_routes_1 = __importDefault(require("./routes/payroll.routes"));
const exit_routes_1 = __importDefault(require("./routes/exit.routes"));
const asset_routes_1 = __importDefault(require("./routes/asset.routes"));
const expense_routes_1 = __importDefault(require("./routes/expense.routes"));
const lead_routes_1 = __importDefault(require("./routes/lead.routes"));
const document_routes_1 = __importDefault(require("./routes/document.routes"));
const email_routes_1 = __importDefault(require("./routes/email.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const socket_service_1 = require("./services/socket.service");
const security_1 = require("./middleware/security");
const db_1 = require("./db");
const argon2_1 = __importDefault(require("argon2"));
async function ensureEssentialAccounts() {
    try {
        const director = await db_1.prisma.user.findFirst({
            where: { email: 'director@enterprenexsolution.com' }
        });
        if (!director) {
            const directorHash = await argon2_1.default.hash('Enx_sol_121006', { type: argon2_1.default.argon2id });
            await db_1.prisma.user.create({
                data: {
                    email: 'director@enterprenexsolution.com',
                    password: directorHash,
                    name: 'Managing Director',
                    role: 'Super Admin',
                    employeeId: '202600000001',
                    department: 'Executive Board',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                    status: 'Active',
                    mustChangePassword: false
                }
            });
            console.log('[DB INIT] Ensured Managing Director account exists and active.');
        }
        const hr = await db_1.prisma.user.findFirst({
            where: { email: 'hr@enterprenexsolution.com' }
        });
        if (!hr) {
            const hrHash = await argon2_1.default.hash('Enx_sol_121006', { type: argon2_1.default.argon2id });
            await db_1.prisma.user.create({
                data: {
                    email: 'hr@enterprenexsolution.com',
                    password: hrHash,
                    name: 'HR Administrator',
                    role: 'Project Manager',
                    department: 'Human Resources',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                    status: 'Active',
                    mustChangePassword: false
                }
            });
            console.log('[DB INIT] Ensured HR Administrator account exists and active.');
        }
        const emp = await db_1.prisma.employee.findFirst({
            where: { employeeId: 'ZCX-EMP-0001' }
        });
        if (!emp) {
            await db_1.prisma.employee.create({
                data: {
                    employeeId: 'ZCX-EMP-0001',
                    name: 'POLAMREDDY REVANTH REDDY',
                    email: 'polamreddyrevanth.82@gmail.com',
                    phone: '+919440829762',
                    role: 'Full Stack (Employee)',
                    department: 'Engineering',
                    personalEmail: 'polamreddyrevanth.82@gmail.com',
                    personalPhone: '+919440829762',
                    salaryMonthly: 50000,
                    ctcAnnual: 600000,
                    status: 'Active',
                    approvalStatus: 'Approved',
                    isAccountActivated: true
                }
            });
            console.log('[DB INIT] Ensured employee POLAMREDDY REVANTH REDDY exists.');
        }
        const empUser = await db_1.prisma.user.findFirst({
            where: { email: 'polamreddyrevanth.82@gmail.com' }
        });
        if (!empUser) {
            const empHash = await argon2_1.default.hash('Enx@PDEN995', { type: argon2_1.default.argon2id });
            await db_1.prisma.user.create({
                data: {
                    email: 'polamreddyrevanth.82@gmail.com',
                    employeeId: 'ZCX-EMP-0001',
                    password: empHash,
                    name: 'POLAMREDDY REVANTH REDDY',
                    role: 'Team Member',
                    department: 'Engineering',
                    status: 'Active',
                    mustChangePassword: true
                }
            });
            console.log('[DB INIT] Ensured employee user login exists.');
        }
    }
    catch (err) {
        console.warn('[DB INIT] Note on ensuring essential accounts:', err.message);
    }
}
// Verify database connection on startup
(async () => {
    try {
        await db_1.prisma.$queryRaw `SELECT 1`;
        console.log('[DB INIT] Verified PostgreSQL database connection is active and healthy.');
        await ensureEssentialAccounts();
    }
    catch (err) {
        console.warn('[DB INIT] Database connection note:', err.message);
    }
})();
// Global Process Crash Prevention
process.on('uncaughtException', (err) => {
    console.error('[CRITICAL UNCAUGHT EXCEPTION PREVENTED]:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRITICAL UNHANDLED REJECTION PREVENTED]:', reason);
});
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const PORT = process.env.PORT || 5000;
// Initialize Real-time Socket.IO Server
(0, socket_service_1.initSocketService)(server);
// Security & Resilience Middlewares
app.use(security_1.securityHeaders);
app.use((0, security_1.rateLimiter)({ maxRequests: 500, windowMs: 60 * 1000 })); // 500 reqs/min
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(security_1.sanitizeInputs);
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
const healthHandler = (req, res) => {
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
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/employees', employee_routes_1.default);
app.use('/api/v1/attendance', attendance_routes_1.default);
app.use('/api/v1/tasks', task_routes_1.default);
app.use('/api/v1/kpi', kpi_routes_1.default);
app.use('/api/v1/leaves', leave_routes_1.default);
app.use('/api/v1/tickets', ticket_routes_1.default);
app.use('/api/v1/meetings', meeting_routes_1.default);
app.use('/api/v1/offer-letters', offerLetter_routes_1.default);
app.use('/api/v1/notifications', notification_routes_1.default);
app.use('/api/v1/reports', report_routes_1.default);
app.use('/api/v1/projects', project_routes_1.default);
app.use('/api/v1/announcements', announcement_routes_1.default);
app.use('/api/v1/payroll', payroll_routes_1.default);
app.use('/api/v1/exit', exit_routes_1.default);
app.use('/api/v1/assets', asset_routes_1.default);
app.use('/api/v1/expenses', expense_routes_1.default);
app.use('/api/v1/leads', lead_routes_1.default);
app.use('/api/v1/documents', document_routes_1.default);
app.use('/api/v1/emails', email_routes_1.default);
app.use('/api/v1/dashboard', dashboard_routes_1.default);
// ── Backwards-Compatible /api/ Routes Aliasing ──
app.use('/api/auth', auth_routes_1.default);
app.use('/api/employees', employee_routes_1.default);
app.use('/api/attendance', attendance_routes_1.default);
app.use('/api/tasks', task_routes_1.default);
app.use('/api/kpi', kpi_routes_1.default);
app.use('/api/leaves', leave_routes_1.default);
app.use('/api/tickets', ticket_routes_1.default);
app.use('/api/meetings', meeting_routes_1.default);
app.use('/api/offer-letters', offerLetter_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.use('/api/projects', project_routes_1.default);
app.use('/api/announcements', announcement_routes_1.default);
app.use('/api/payroll', payroll_routes_1.default);
app.use('/api/exit', exit_routes_1.default);
app.use('/api/assets', asset_routes_1.default);
app.use('/api/expenses', expense_routes_1.default);
app.use('/api/leads', lead_routes_1.default);
app.use('/api/documents', document_routes_1.default);
app.use('/api/emails', email_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
// Global Error Handler & Crash Boundary
app.use(security_1.globalErrorHandler);
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
