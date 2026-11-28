"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
dotenv_1.default.config();
const BASE_URL = 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'enterprenex_enterprise_jwt_secret_2026_super_secure';
const results = [];
function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const payload = body ? JSON.stringify(body) : undefined;
        if (payload) {
            headers['Content-Length'] = Buffer.byteLength(payload).toString();
        }
        const req = http_1.default.request(url, {
            method,
            headers,
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                let parsed;
                try {
                    parsed = JSON.parse(data);
                }
                catch {
                    parsed = data;
                }
                resolve({ status: res.statusCode || 0, body: parsed });
            });
        });
        req.on('error', (err) => reject(err));
        if (payload)
            req.write(payload);
        req.end();
    });
}
function assertTest(name, category, condition, status, details) {
    results.push({
        name,
        category,
        passed: condition,
        status,
        details: condition ? details : `FAIL: ${details}`,
    });
}
async function runAllTests() {
    console.log('===============================================================');
    console.log('🧪 ENTERPRENEX EWMS COMPREHENSIVE BACKEND VERIFICATION SUITE');
    console.log('===============================================================\n');
    // Generate tokens
    const directorToken = jsonwebtoken_1.default.sign({
        id: 'usr-director-test',
        email: 'director@enterprenex.solutions',
        role: 'Super Admin',
        name: 'Managing Director',
        employeeId: '202600000001',
        department: 'Executive Board',
    }, JWT_SECRET, { expiresIn: '1h' });
    const employeeToken = jsonwebtoken_1.default.sign({
        id: 'usr-employee-test',
        email: 'engineer.test@enterprenex.solutions',
        role: 'Developer',
        name: 'Test Engineer',
        employeeId: '202600000099',
        department: 'Engineering',
    }, JWT_SECRET, { expiresIn: '1h' });
    const invalidToken = 'ey.invalid.token.signature';
    // 1. Health & Infrastructure
    console.log('--- 1. Testing Core Health & Infrastructure ---');
    try {
        const health = await request('GET', '/api/v1/health');
        assertTest('System Health Check', 'Infrastructure', health.status === 200 && health.body.status === 'ONLINE', health.status, `API is ONLINE (${health.body.version || 'v1'})`);
    }
    catch (err) {
        results.push({ name: 'System Health Check', category: 'Infrastructure', passed: false, error: err.message });
    }
    // 2. Authentication & Security Middleware
    console.log('--- 2. Testing Authentication & Middleware ---');
    try {
        const noToken = await request('GET', '/api/v1/employees');
        assertTest('Strict Missing Token Guard (401)', 'Security - Auth', noToken.status === 401, noToken.status, 'Protected route correctly rejected call with no token');
        const badToken = await request('GET', '/api/v1/employees', undefined, invalidToken);
        assertTest('Invalid Token Signature Guard (403)', 'Security - Auth', badToken.status === 403, badToken.status, 'Tampered token rejected with 403 Forbidden');
        const badLogin = await request('POST', '/api/v1/auth/login', { loginId: 'fake@email.com', password: 'WrongPassword123' });
        assertTest('Invalid Credentials Rejection', 'Security - Auth', badLogin.status === 401 || badLogin.status === 400 || badLogin.status === 404, badLogin.status, `Non-existent or wrong credentials rejected with HTTP ${badLogin.status}`);
    }
    catch (err) {
        results.push({ name: 'Auth Middleware', category: 'Security - Auth', passed: false, error: err.message });
    }
    // 3. Role-Based Access Control (RBAC) Hardening Checks
    console.log('--- 3. Testing Role-Based Access Control (RBAC) ---');
    try {
        // Standard employee should NOT be able to view executive dashboard telemetry
        const execDash = await request('GET', '/api/v1/dashboard/executive', undefined, employeeToken);
        assertTest('Executive Telemetry Guard (/dashboard/executive)', 'RBAC - Executive', execDash.status === 403, execDash.status, 'Standard employee blocked from executive dashboard summary');
        // Standard employee should NOT be able to view workforce confidential summary (CTC, offer letters)
        const workforceRep = await request('GET', '/api/v1/reports/workforce-summary', undefined, employeeToken);
        assertTest('Workforce Financial Report Guard (/reports/workforce-summary)', 'RBAC - Executive', workforceRep.status === 403, workforceRep.status, 'Standard employee blocked from company CTC & offer letter reports');
        // Standard employee should NOT be able to post company announcements
        const createAnnounce = await request('POST', '/api/v1/announcements', { title: 'Unauthorized', content: 'Test' }, employeeToken);
        assertTest('Global Announcement Creation Guard (/announcements)', 'RBAC - Communications', createAnnounce.status === 403, createAnnounce.status, 'Standard employee blocked from broadcasting company announcements');
        // Standard employee should NOT be able to create new enterprise projects
        const createProj = await request('POST', '/api/v1/projects', { title: 'Hack Project', client: 'Test', deadline: '2026-12-31' }, employeeToken);
        assertTest('Project Creation Guard (/projects)', 'RBAC - Projects', createProj.status === 403, createProj.status, 'Standard employee blocked from creating company projects');
        // Standard employee should NOT be able to disburse payroll
        const disbursePay = await request('PATCH', '/api/v1/payroll/any-id-test/pay', { paymentMethod: 'NEFT' }, employeeToken);
        assertTest('Payroll Disbursement Guard (/payroll/:id/pay)', 'RBAC - Finance', disbursePay.status === 403, disbursePay.status, 'Standard employee blocked from releasing payroll funds');
        // Standard employee should NOT be able to disburse expenses
        const reimburseExp = await request('PATCH', '/api/v1/expenses/any-id-test/reimburse', {}, employeeToken);
        assertTest('Expense Reimbursement Guard (/expenses/:id/reimburse)', 'RBAC - Finance', reimburseExp.status === 403, reimburseExp.status, 'Standard employee blocked from approving or releasing expense funds');
    }
    catch (err) {
        results.push({ name: 'RBAC Enforcement', category: 'RBAC', passed: false, error: err.message });
    }
    // 4. Insecure Direct Object Reference (IDOR) & Ownership Checks
    console.log('--- 4. Testing Object-Level Access (IDOR Prevention) ---');
    try {
        // Relieving letter download for non-owner
        const fakeExitId = 'exit-other-user-999';
        const relievingLetter = await request('GET', `/api/v1/exit/${fakeExitId}/letter`, undefined, employeeToken);
        assertTest('Relieving Letter IDOR Guard (/exit/:id/letter)', 'Security - IDOR', relievingLetter.status === 403 || relievingLetter.status === 404, relievingLetter.status, 'Non-owner blocked from downloading another user relieving letter');
        // Cancel leave request owned by another user
        const cancelOtherLeave = await request('POST', `/api/v1/leaves/leave-other-user-999/cancel`, {}, employeeToken);
        assertTest('Leave Cancellation IDOR Guard (/leaves/:id/cancel)', 'Security - IDOR', cancelOtherLeave.status === 403 || cancelOtherLeave.status === 404, cancelOtherLeave.status, 'Employee blocked from cancelling other employees leave requests');
        // Employee KPI scorecard boundary
        const kpiCheck = await request('GET', '/api/v1/kpi', undefined, employeeToken);
        const kpiCount = Array.isArray(kpiCheck.body?.kpis) ? kpiCheck.body.kpis.length : 0;
        assertTest('KPI Scorecard Boundary Filter (/kpi)', 'Security - IDOR', kpiCheck.status === 200 && kpiCount <= 1, kpiCheck.status, `Standard employee query restricted to personal scorecard (returned: ${kpiCount})`);
    }
    catch (err) {
        results.push({ name: 'IDOR Prevention', category: 'Security - IDOR', passed: false, error: err.message });
    }
    // 5. Input Validation & Boundary Checks
    console.log('--- 5. Testing Boundary & Input Validation ---');
    try {
        // Chronological date validation for leave application
        const invalidLeaveDate = await request('POST', '/api/v1/leaves/apply', {
            startDate: '2026-05-10',
            endDate: '2026-05-01', // End date before start date!
            reason: 'Invalid chronological test',
        }, employeeToken);
        assertTest('Leave Chronological Date Validation (startDate <= endDate)', 'Data Integrity', invalidLeaveDate.status === 400, invalidLeaveDate.status, 'Rejected inverted leave date range (start date > end date)');
        // Task manual time log validation
        const negativeHours = await request('PUT', '/api/tasks/fake-task-id/log-time', { hours: -5 }, employeeToken);
        assertTest('Task Negative Hours Validation', 'Data Integrity', negativeHours.status === 400, negativeHours.status, 'Rejected negative work hours log attempt');
        const excessiveHours = await request('PUT', '/api/tasks/fake-task-id/log-time', { hours: 15 }, // Max is 12
        employeeToken);
        assertTest('Task Excessive Hours Cap (<= 12 hours)', 'Data Integrity', excessiveHours.status === 400, excessiveHours.status, 'Rejected single session log exceeding 12-hour limit');
    }
    catch (err) {
        results.push({ name: 'Input Validation', category: 'Data Integrity', passed: false, error: err.message });
    }
    // 6. Authorized Operations with Director Credentials
    console.log('--- 6. Testing Authorized Executive Operations ---');
    try {
        const execDash = await request('GET', '/api/v1/dashboard/executive', undefined, directorToken);
        assertTest('Authorized Executive Telemetry Access', 'Functionality', execDash.status === 200 && typeof execDash.body.summary === 'object', execDash.status, 'Director successfully retrieved executive operations telemetry');
        const projects = await request('GET', '/api/v1/projects', undefined, directorToken);
        assertTest('Authorized Project Portfolio Access', 'Functionality', projects.status === 200 && Array.isArray(projects.body.projects), projects.status, `Project portfolio retrieved (${projects.body.projects?.length || 0} projects)`);
        const employees = await request('GET', '/api/v1/employees', undefined, directorToken);
        assertTest('Authorized Employee Directory Access', 'Functionality', employees.status === 200 && Array.isArray(employees.body.employees), employees.status, `Employee directory retrieved (${employees.body.employees?.length || 0} employees)`);
    }
    catch (err) {
        results.push({ name: 'Executive Operations', category: 'Functionality', passed: false, error: err.message });
    }
    // 7. Database Cleanliness Check
    console.log('--- 7. Verifying Database Cleanliness ---');
    try {
        const rawEmployees = await db_1.prisma.employee.findMany();
        const founderMatches = rawEmployees.filter((e) => e.name.toLowerCase().includes('revanth') ||
            e.name.toLowerCase().includes('polamreddy') ||
            e.email.toLowerCase().includes('revanth'));
        assertTest('Database Zero Dummy / Founder Records Check', 'Data Cleanliness', founderMatches.length === 0, 200, `Found ${founderMatches.length} founder/dummy records in database (Expected: 0)`);
    }
    catch (err) {
        results.push({ name: 'Database Cleanliness', category: 'Data Cleanliness', passed: false, error: err.message });
    }
    // Final Report Summary
    console.log('\n===============================================================');
    console.log('📋 VERIFICATION RESULTS BREAKDOWN:');
    console.log('===============================================================');
    let passedCount = 0;
    for (const r of results) {
        const icon = r.passed ? '✅' : '❌';
        console.log(`${icon} [${r.category}] ${r.name}: ${r.details || r.error}`);
        if (r.passed)
            passedCount++;
    }
    console.log('\n===============================================================');
    console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${results.length - passedCount}`);
    console.log('===============================================================');
    if (passedCount === results.length) {
        console.log('🎉 ALL SYSTEM CHECKS PASSED WITH 100% SUCCESS RATE.');
        process.exit(0);
    }
    else {
        console.error('⚠️ SOME TESTS FAILED. PLEASE REVIEW LOGS.');
        process.exit(1);
    }
}
runAllTests().catch((err) => {
    console.error('FATAL TEST ERROR:', err);
    process.exit(1);
});
