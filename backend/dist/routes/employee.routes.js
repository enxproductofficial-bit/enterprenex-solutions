"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const security_service_1 = require("../services/security.service");
const notification_service_1 = require("../services/notification.service");
const email_service_1 = require("../services/email.service");
const authSecurity_service_1 = require("../services/authSecurity.service");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = (0, express_1.Router)();
// Helper to sanitize employee records before returning via API (zero credential leakage)
const sanitizeEmployee = (e, isDirectorOrManager, canViewAllPersonalContacts, isDirector, isSelf) => {
    const { password: _p, temporaryPassword: _tp, ...safeEmployee } = e;
    return {
        ...safeEmployee,
        name: e.name,
        personalEmail: (canViewAllPersonalContacts || isSelf) ? e.personalEmail : undefined,
        personalPhone: (canViewAllPersonalContacts || isSelf) ? e.personalPhone : undefined,
        address: (canViewAllPersonalContacts || isSelf) ? e.address : undefined,
        salaryMonthly: (isDirectorOrManager || isSelf) ? e.salaryMonthly : undefined,
        ctcAnnual: (isDirectorOrManager || isSelf) ? e.ctcAnnual : undefined,
        panNumber: (isDirectorOrManager || isSelf) ? (isDirector ? e.panNumber : (e.panNumber ? 'XXXX-XXXX-XXXX' : undefined)) : undefined,
        panDocUrl: isDirector ? e.panDocUrl : undefined,
        aadhaarNumber: (isDirectorOrManager || isSelf) ? (isDirector ? e.aadhaarNumber : (e.aadhaarNumber ? `XXXX-XXXX-${String(e.aadhaarNumber).slice(-4)}` : undefined)) : undefined,
        aadhaarDocUrl: isDirector ? e.aadhaarDocUrl : undefined,
        resumeUrl: (isDirectorOrManager || isSelf) ? e.resumeUrl : undefined,
        documents: e.documentsJson ? (typeof e.documentsJson === 'string' ? JSON.parse(e.documentsJson) : e.documentsJson) : [],
        skillsMatrix: e.skillsMatrixJson ? (typeof e.skillsMatrixJson === 'string' ? JSON.parse(e.skillsMatrixJson) : e.skillsMatrixJson) : [],
        education: e.educationJson ? (typeof e.educationJson === 'string' ? JSON.parse(e.educationJson) : e.educationJson) : []
    };
};
// Helper for single employee response sanitation
const sanitizeSingleEmployee = (e) => {
    if (!e)
        return e;
    const { password: _p, temporaryPassword: _tp, ...safeEmployee } = e;
    return safeEmployee;
};
// POST /api/employees/generate-id (Generate Unique Sequential Collision-Free Employee ID Server-Side)
router.post('/generate-id', auth_1.authenticateToken, (0, auth_1.requireRole)(['Super Admin', 'Project Manager', 'HR Manager']), async (req, res) => {
    try {
        const { department } = req.body;
        const employeeId = await (0, security_service_1.generateSecureEmployeeId)(department || 'Engineering');
        res.json({ employeeId });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/employees (List all team members - with privacy sanitization for employees)
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const isDirector = Boolean(req.user?.role === 'Super Admin' ||
            req.user?.role === 'Director' ||
            req.user?.role === 'Managing Director');
        const isHr = Boolean(req.user?.role === 'HR' ||
            req.user?.role === 'HR Manager' ||
            req.user?.department === 'Human Resources' ||
            req.user?.department === 'HR' ||
            req.user?.role?.includes('HR') ||
            req.user?.email?.includes('hr'));
        const isManager = Boolean(req.user?.role === 'Project Manager');
        const isDirectorOrManager = isDirector || isManager || isHr;
        const canViewAllPersonalContacts = isDirector || isHr;
        const employees = await db_1.prisma.employee.findMany({
            orderBy: { createdAt: 'desc' }
        });
        const formatted = employees.map(e => {
            const isSelf = req.user?.email === e.email || req.user?.employeeId === e.employeeId || req.user?.id === e.id;
            return sanitizeEmployee(e, isDirectorOrManager, canViewAllPersonalContacts, isDirector, isSelf);
        });
        res.json({ employees: formatted });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/employees (HR & Director Employee Onboarding & Registration)
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const isDirector = req.user?.role === 'Super Admin' || req.user?.role === 'Director' || req.user?.role === 'Managing Director';
        const isHr = req.user?.role === 'HR' || req.user?.role === 'HR Manager' || req.user?.department === 'Human Resources' || req.user?.department === 'HR' || req.user?.role?.includes('HR') || req.user?.email?.includes('hr') || req.user?.role === 'Project Manager';
        const isManager = req.user?.role === 'Project Manager';
        if (!isDirector && !isHr && !isManager) {
            res.status(403).json({ error: 'Access forbidden: Only HR or Director can register new employees.' });
            return;
        }
        const data = req.body;
        const cleanEmail = (data.email || '').trim().toLowerCase();
        const cleanName = (data.name || '').trim();
        if (!cleanName || !cleanEmail) {
            res.status(400).json({ error: 'Employee Full Name and Email Address are required.' });
            return;
        }
        // Auto-generate employee ID if not provided (12-digit sequential format)
        const assignedEmployeeId = (data.employeeId || '').trim() || await (0, security_service_1.generateSecureEmployeeId)(data.department || 'Engineering');
        // Immediate Active Login Access: Approved and Active for all newly created staff
        const initialApprovalStatus = 'Approved';
        const initialAccountStatus = data.status || 'Active';
        // Password setup: use provided password or generate secure temporary password
        const rawPassword = (data.password || data.initialPassword || data.temporaryPassword || '').trim() || (0, security_service_1.generateSecureTemporaryPassword)();
        const hashedPassword = await (0, authSecurity_service_1.hashPassword)(rawPassword);
        const monthlySalary = Number(data.salaryMonthly || 50000);
        if (isNaN(monthlySalary) || monthlySalary < 0) {
            res.status(400).json({ error: 'Monthly salary must be a valid positive number.' });
            return;
        }
        const annualCtc = Number(data.ctcAnnual || monthlySalary * 12);
        // Determine strict RBAC User Role (Never accidentally grant Admin/Director privileges to employees)
        const rawRole = (data.role || data.designation || '').toLowerCase();
        const userRole = rawRole.includes('director') ? 'Super Admin' :
            (rawRole.includes('hr') || data.department === 'Human Resources' ? 'HR Manager' :
                (rawRole.includes('manager') ? 'Project Manager' :
                    (rawRole.includes('engineer') || rawRole.includes('developer') ? 'Developer' : 'Team Member')));
        // Atomic Transaction: Upsert Employee Profile + Auto-provision User Account + Allocate Default Leave Balance
        const { newEmp } = await db_1.prisma.$transaction(async (tx) => {
            const empData = {
                employeeId: assignedEmployeeId,
                password: hashedPassword,
                temporaryPassword: hashedPassword,
                name: cleanName,
                role: data.role || data.designation || 'Team Member',
                department: data.department || 'Engineering',
                email: cleanEmail,
                phone: data.phone || data.mobileNumber || '+91-9000000000',
                personalEmail: data.personalEmail || cleanEmail,
                personalPhone: data.personalPhone || data.phone || data.mobileNumber,
                avatar: data.avatar || data.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                address: data.address || null,
                reportingManager: data.reportingManager || 'Managing Director',
                probationPeriod: data.probationPeriod || '3 Months',
                resumeUrl: data.resumeUrl || null,
                documentsJson: JSON.stringify(data.documents || data.requiredDocuments || []),
                salaryMonthly: monthlySalary,
                ctcAnnual: annualCtc,
                workloadPercentage: Number(data.workloadPercentage || 100),
                status: initialAccountStatus,
                approvalStatus: initialApprovalStatus,
                panNumber: data.panNumber || null,
                panDocUrl: data.panDocUrl || null,
                aadhaarNumber: data.aadhaarNumber || null,
                aadhaarDocUrl: data.aadhaarDocUrl || null,
                kycStatus: data.kycStatus || 'Not Submitted',
                employmentType: data.employmentType || 'Full-time',
                workMode: data.workMode || 'Hybrid',
                mustChangePassword: true,
                isAccountActivated: true,
                skillsMatrixJson: JSON.stringify(data.skillsMatrix || []),
                educationJson: JSON.stringify(data.education || []),
                joinDate: data.joinDate || data.joiningDate || new Date().toISOString().split('T')[0]
            };
            const emp = await tx.employee.upsert({
                where: { email: cleanEmail },
                update: empData,
                create: empData
            });
            await tx.user.upsert({
                where: { email: emp.email },
                update: {
                    employeeId: emp.employeeId,
                    password: hashedPassword,
                    name: emp.name,
                    role: userRole,
                    department: emp.department,
                    status: 'Active',
                    avatar: emp.avatar,
                    mustChangePassword: true
                },
                create: {
                    email: emp.email,
                    employeeId: emp.employeeId,
                    password: hashedPassword,
                    name: emp.name,
                    role: userRole,
                    department: emp.department,
                    avatar: emp.avatar,
                    status: 'Active',
                    mustChangePassword: true
                }
            });
            await tx.leaveBalance.upsert({
                where: { employeeId: emp.employeeId },
                update: {},
                create: {
                    employeeId: emp.employeeId,
                    employeeName: emp.name,
                    casualLeave: 12,
                    sickLeave: 10,
                    earnedLeave: 15,
                    emergencyLeave: 5,
                    unpaidLeave: 0
                }
            });
            return { newEmp: emp };
        });
        // ISO 27001 Security Audit Log
        await (0, security_service_1.logAuditSecurityEntry)({
            action: 'EMPLOYEE_REGISTERED',
            category: 'Human Capital Governance',
            details: `Registered onboarding employee ${assignedEmployeeId} (${cleanName}, ${data.department}) with active immediate login credentials.`,
            actor: req.user?.name || req.user?.email || 'HR'
        });
        res.status(201).json({
            success: true,
            message: `Employee ${cleanName} (${assignedEmployeeId}) registered and activated. Immediate workspace access established.`,
            employee: sanitizeSingleEmployee(newEmp),
            user: {
                email: cleanEmail,
                employeeId: assignedEmployeeId,
                name: cleanName,
                role: userRole,
                status: 'Active'
            },
            temporaryPassword: rawPassword
        });
    }
    catch (error) {
        console.error('Create employee error:', error);
        res.status(500).json({ error: error.message });
    }
});
// PUT /api/employees/:id/approval (Director reviews & approves/rejects onboarding)
router.put('/:id/approval', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const isDirector = user?.role === 'Super Admin' || user?.role === 'Director' || user?.role === 'Managing Director';
        if (!isDirector) {
            res.status(403).json({ error: 'Access forbidden: Only Managing Director can approve or reject employee registrations.' });
            return;
        }
        const { id } = req.params;
        const { action, remarks } = req.body; // action: 'Approve' | 'Reject'
        if (!action || !['Approve', 'Reject'].includes(action)) {
            res.status(400).json({ error: 'Action must be Approve or Reject.' });
            return;
        }
        const emp = await db_1.prisma.employee.findFirst({
            where: { OR: [{ id }, { employeeId: id }] }
        });
        if (!emp) {
            res.status(404).json({ error: 'Employee not found.' });
            return;
        }
        const isApprove = action === 'Approve';
        const updated = await db_1.prisma.employee.update({
            where: { id: emp.id },
            data: {
                approvalStatus: isApprove ? 'Approved' : 'Rejected',
                approvalRemarks: remarks || (isApprove ? 'Approved by Managing Director.' : 'Rejected during onboarding review.'),
                approvedBy: user?.name || 'Managing Director',
                approvedAt: new Date()
            }
        });
        await (0, notification_service_1.notifyEmployeeApproved)(emp.name, emp.employeeId, isApprove, remarks);
        await (0, security_service_1.logAuditSecurityEntry)({
            action: `EMPLOYEE_ONBOARDING_${action.toUpperCase()}`,
            category: 'Executive Authorization',
            details: `Managing Director ${isApprove ? 'approved' : 'rejected'} onboarding for ${emp.name} (${emp.employeeId}). Remarks: ${remarks || 'None'}`,
            actor: user?.name || 'Managing Director'
        });
        res.json({
            message: `Employee onboarding ${isApprove ? 'Approved' : 'Rejected'}.`,
            employee: sanitizeSingleEmployee(updated)
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/employees/:id/activate (HR/Director Activates Employee Account)
router.post('/:id/activate', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const isDirector = user?.role === 'Super Admin' || user?.role === 'Director' || user?.role === 'Managing Director';
        const isHr = user?.role === 'HR' || user?.role === 'HR Manager' || user?.role === 'Project Manager' || user?.department === 'Human Resources';
        if (!isDirector && !isHr) {
            res.status(403).json({ error: 'Access forbidden: Only HR or Director can activate employee accounts.' });
            return;
        }
        const { id } = req.params;
        const { assignedRole } = req.body;
        const emp = await db_1.prisma.employee.findFirst({
            where: { OR: [{ id }, { employeeId: id }] }
        });
        if (!emp) {
            res.status(404).json({ error: 'Employee not found.' });
            return;
        }
        // Generate secure temporary password
        const temporaryPassword = req.body.password || (0, security_service_1.generateSecureTemporaryPassword)();
        const hashedPassword = await bcryptjs_1.default.hash(temporaryPassword, 10);
        // Determine target User role
        const finalRole = assignedRole || (emp.role.includes('Director') ? 'Super Admin' :
            emp.role.includes('HR') || emp.department === 'Human Resources' ? 'HR Manager' :
                emp.role.includes('Manager') ? 'Project Manager' :
                    emp.role.includes('Engineer') || emp.role.includes('Developer') ? 'Developer' :
                        'Team Member');
        // Update Employee and User records in an atomic transaction
        const [updatedEmp] = await db_1.prisma.$transaction([
            db_1.prisma.employee.update({
                where: { id: emp.id },
                data: {
                    approvalStatus: 'Approved',
                    password: hashedPassword,
                    temporaryPassword: hashedPassword,
                    mustChangePassword: true,
                    isAccountActivated: true,
                    accountActivatedAt: new Date(),
                    accountActivatedBy: user?.name || 'HR',
                    status: 'Active'
                }
            }),
            db_1.prisma.user.upsert({
                where: { email: emp.email },
                update: {
                    name: emp.name,
                    employeeId: emp.employeeId,
                    password: hashedPassword,
                    mustChangePassword: true,
                    role: finalRole,
                    department: emp.department,
                    status: 'Active',
                    avatar: emp.avatar
                },
                create: {
                    email: emp.email,
                    password: hashedPassword,
                    name: emp.name,
                    employeeId: emp.employeeId,
                    mustChangePassword: true,
                    role: finalRole,
                    department: emp.department,
                    avatar: emp.avatar,
                    status: 'Active'
                }
            })
        ]);
        await (0, notification_service_1.notifyAccountActivated)(emp.name, emp.email, finalRole);
        // Dispatches secure email credentials via Nodemailer
        (0, email_service_1.sendAccountCredentialsEmail)({
            name: emp.name,
            email: emp.email,
            role: finalRole,
            employeeId: emp.employeeId
        }, temporaryPassword).catch(err => console.warn('[Email Warning] Credentials email delivery deferred:', err));
        await (0, security_service_1.logAuditSecurityEntry)({
            action: 'EMPLOYEE_ACCOUNT_ACTIVATED',
            category: 'Access Control & Provisioning',
            details: `Activated portal account for ${emp.name} (${emp.employeeId}) with role ${finalRole}. Temporary credentials generated.`,
            actor: user?.name || 'HR'
        });
        res.json({
            message: `Account for ${emp.name} has been activated with role ${finalRole}.`,
            employeeId: emp.employeeId,
            email: emp.email,
            role: finalRole,
            temporaryPassword // Returned once securely to HR for initial handover
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// DELETE /api/employees/:id (Director Only)
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const isDirector = req.user?.role === 'Super Admin' || req.user?.role === 'Director' || req.user?.role === 'Managing Director';
        const isHr = req.user?.role === 'HR' || req.user?.role === 'HR Manager' || req.user?.department === 'Human Resources' || req.user?.role?.includes('HR') || req.user?.email?.includes('hr') || req.user?.role === 'Project Manager';
        if (!isDirector && !isHr) {
            res.status(403).json({ error: 'Access forbidden: Only HR or Director can delete employee records.' });
            return;
        }
        const { id } = req.params;
        const emp = await db_1.prisma.employee.findFirst({
            where: {
                OR: [
                    { id },
                    { employeeId: id },
                    { employeeId: id.toUpperCase() }
                ]
            }
        });
        if (!emp) {
            res.status(404).json({ error: 'Employee not found.' });
            return;
        }
        if (emp.role === 'Super Admin' || emp.role === 'Director' || emp.role === 'Managing Director' || emp.email === 'director@enterprenexsolution.com') {
            res.status(403).json({ error: 'Executive Director accounts cannot be deleted.' });
            return;
        }
        // Atomic cascade delete
        await db_1.prisma.$transaction([
            db_1.prisma.leaveBalance.deleteMany({ where: { employeeId: emp.employeeId } }),
            db_1.prisma.leaveRequest.deleteMany({ where: { OR: [{ employeeId: emp.employeeId }, { employeeId: emp.id }] } }),
            db_1.prisma.attendanceRecord.deleteMany({ where: { employeeId: emp.employeeId } }),
            db_1.prisma.payrollRecord.deleteMany({ where: { employeeId: emp.employeeId } }),
            db_1.prisma.task.deleteMany({ where: { OR: [{ assignedTo: emp.name }, { assignedTo: emp.email }, { assignedTo: emp.employeeId }] } }),
            db_1.prisma.kpiScorecard.deleteMany({ where: { OR: [{ employeeId: emp.employeeId }, { employeeId: emp.id }] } }),
            db_1.prisma.user.deleteMany({ where: { OR: [{ email: emp.email }, { employeeId: emp.employeeId }] } }),
            db_1.prisma.loginSecurity.deleteMany({
                where: {
                    identifier: { in: [emp.email, emp.employeeId, emp.email.toLowerCase(), emp.employeeId.toLowerCase()] }
                }
            }),
            db_1.prisma.employee.delete({ where: { id: emp.id } })
        ]);
        res.json({ success: true, message: `Employee account ${emp.name} (${emp.employeeId}) successfully purged from database.` });
    }
    catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({ error: error.message });
    }
});
// PUT /api/employees/:id/skills/verify (Manager / Director Verification Only)
router.put('/:id/skills/verify', auth_1.authenticateToken, (0, auth_1.requireRole)(['Super Admin', 'Project Manager', 'HR Manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const { skillName, verifiedRating } = req.body;
        const emp = await db_1.prisma.employee.findFirst({
            where: { OR: [{ id }, { employeeId: id }] }
        });
        if (!emp) {
            res.status(404).json({ error: 'Employee not found.' });
            return;
        }
        const currentSkills = emp.skillsMatrixJson ? (typeof emp.skillsMatrixJson === 'string' ? JSON.parse(emp.skillsMatrixJson) : emp.skillsMatrixJson) : [];
        const updatedSkills = currentSkills.map(s => {
            if (s.name.toLowerCase() === skillName.toLowerCase()) {
                return {
                    ...s,
                    verifiedRating: Number(verifiedRating),
                    isVerified: true,
                    verifiedBy: req.user?.name || 'Authorized Lead',
                    verifiedAt: new Date().toISOString()
                };
            }
            return s;
        });
        const updated = await db_1.prisma.employee.update({
            where: { id: emp.id },
            data: { skillsMatrixJson: JSON.stringify(updatedSkills) }
        });
        res.json({ message: `Skill ${skillName} verified at Level ${verifiedRating}/5.`, employee: sanitizeSingleEmployee(updated) });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PUT /api/employees/me/contact (Self-Service: Employees Updating Personal Phone & Personal Email)
router.put('/me/contact', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ error: 'Unauthorized.' });
            return;
        }
        const { personalPhone, personalEmail, phone, address } = req.body;
        const emp = await db_1.prisma.employee.findFirst({
            where: {
                OR: [
                    { email: user.email },
                    { employeeId: user.employeeId || 'NO_MATCH' }
                ]
            }
        });
        if (!emp) {
            res.status(404).json({ error: 'Employee profile not found.' });
            return;
        }
        const updated = await db_1.prisma.employee.update({
            where: { id: emp.id },
            data: {
                personalPhone: personalPhone !== undefined ? personalPhone : emp.personalPhone,
                personalEmail: personalEmail !== undefined ? personalEmail : emp.personalEmail,
                phone: phone !== undefined ? phone : emp.phone,
                address: address !== undefined ? address : emp.address
            }
        });
        res.json({ message: 'Personal contact details successfully updated.', employee: sanitizeSingleEmployee(updated) });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PUT /api/employees/:id (Update Employee Record)
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const emp = await db_1.prisma.employee.findFirst({
            where: { OR: [{ id }, { employeeId: id }] }
        });
        if (!emp) {
            res.status(404).json({ error: 'Employee not found.' });
            return;
        }
        const isDirector = req.user?.role === 'Super Admin' || req.user?.role === 'Director' || req.user?.role === 'Managing Director';
        const isHr = req.user?.role === 'HR' || req.user?.role === 'HR Manager' || req.user?.department === 'Human Resources' || req.user?.department === 'HR' || req.user?.role?.includes('HR') || req.user?.email?.includes('hr');
        const isManager = req.user?.role === 'Project Manager';
        const isSelf = req.user?.email === emp.email || req.user?.employeeId === emp.employeeId;
        if (!isDirector && !isHr && !isManager && !isSelf) {
            res.status(403).json({ error: 'Access forbidden: Employees cannot modify other employee accounts.' });
            return;
        }
        if (!isDirector) {
            if (updates.role && updates.role !== emp.role) {
                res.status(403).json({ error: 'Access forbidden: Employees and Managers cannot alter account roles.' });
                return;
            }
            if (updates.salaryMonthly !== undefined && updates.salaryMonthly !== emp.salaryMonthly) {
                res.status(403).json({ error: 'Access forbidden: Employees cannot modify compensation records.' });
                return;
            }
        }
        const canUpdateContact = isDirector || isHr || isSelf;
        const canUpdatePassword = isDirector || isHr || isSelf;
        const newHash = (canUpdatePassword && updates.password) ? await bcryptjs_1.default.hash(updates.password.trim(), 10) : undefined;
        const updated = await db_1.prisma.employee.update({
            where: { id: emp.id },
            data: {
                name: isDirector ? updates.name : undefined,
                role: isDirector ? updates.role : undefined,
                department: isDirector || isManager || isHr ? updates.department : undefined,
                password: newHash,
                temporaryPassword: newHash ? null : undefined,
                mustChangePassword: updates.password ? false : undefined,
                phone: canUpdateContact && updates.phone !== undefined ? updates.phone : emp.phone,
                personalEmail: canUpdateContact && updates.personalEmail !== undefined ? updates.personalEmail : emp.personalEmail,
                personalPhone: canUpdateContact && updates.personalPhone !== undefined ? updates.personalPhone : emp.personalPhone,
                address: canUpdateContact && updates.address !== undefined ? updates.address : emp.address,
                reportingManager: isDirector || isHr ? updates.reportingManager : undefined,
                probationPeriod: isDirector || isHr ? updates.probationPeriod : undefined,
                avatar: updates.avatar !== undefined ? updates.avatar : emp.avatar,
                salaryMonthly: isDirector && updates.salaryMonthly !== undefined ? Number(updates.salaryMonthly) : undefined,
                ctcAnnual: isDirector && updates.ctcAnnual !== undefined ? Number(updates.ctcAnnual) : undefined,
                workloadPercentage: (isDirector || isManager) && updates.workloadPercentage !== undefined ? Number(updates.workloadPercentage) : undefined,
                status: isDirector || isHr ? updates.status : undefined,
                approvalStatus: isDirector || isHr ? (updates.approvalStatus || 'Approved') : undefined,
                panNumber: isDirector ? updates.panNumber : undefined,
                aadhaarNumber: isDirector ? updates.aadhaarNumber : undefined,
                kycStatus: isDirector || isManager ? updates.kycStatus : undefined,
                skillsMatrixJson: updates.skillsMatrix ? JSON.stringify(updates.skillsMatrix) : undefined,
                educationJson: updates.education ? JSON.stringify(updates.education) : undefined
            }
        });
        // Synchronize password and status with User authentication table atomically
        if (newHash || updates.status || updates.role) {
            await db_1.prisma.user.updateMany({
                where: {
                    OR: [
                        { email: emp.email },
                        { employeeId: emp.employeeId }
                    ]
                },
                data: {
                    ...(newHash ? { password: newHash, mustChangePassword: false } : {}),
                    ...(updates.status ? { status: updates.status } : {})
                }
            }).catch(err => console.warn('User update sync fallback:', err));
        }
        res.json({ message: 'Employee record successfully updated.', employee: sanitizeSingleEmployee(updated) });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/employees/generate-password (Secure server-side password generator — Director/Manager/HR only)
router.post('/generate-password', auth_1.authenticateToken, (0, auth_1.requireRole)(['Super Admin', 'Project Manager', 'HR Manager']), async (req, res) => {
    try {
        const password = (0, security_service_1.generateSecureTemporaryPassword)();
        res.json({ password });
    }
    catch (error) {
        res.status(500).json({ error: 'Secure password generation failed.' });
    }
});
exports.default = router;
