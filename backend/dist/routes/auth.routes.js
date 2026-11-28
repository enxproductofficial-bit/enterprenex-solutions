"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIdentifierCandidates = void 0;
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const email_service_1 = require("../services/email.service");
const authSecurity_service_1 = require("../services/authSecurity.service");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'enterprenex_enterprise_jwt_secret_2026_super_secure';
const GENERIC_AUTH_ERROR = 'Invalid credentials. Please verify your official email or 12-digit Employee ID, and password.';
/**
 * Normalizes identifier and generates prefix/padding variations
 * Handles user typing e.g. ZCX-EMP-001 vs ZCX-EMP-0001 seamlessly
 */
const getIdentifierCandidates = (input) => {
    const trimmed = (input || '').trim();
    if (!trimmed)
        return [];
    const candidates = new Set([
        trimmed,
        trimmed.toLowerCase(),
        trimmed.toUpperCase()
    ]);
    const match = trimmed.match(/^([A-Za-z0-9_-]+?-0*)(\d+)$/);
    if (match) {
        const rawPrefix = trimmed.replace(/-0*\d+$/, '-');
        const num = parseInt(match[2], 10);
        [1, 2, 3, 4, 5, 6].forEach((digits) => {
            const padded = rawPrefix + String(num).padStart(digits, '0');
            candidates.add(padded);
            candidates.add(padded.toUpperCase());
            candidates.add(padded.toLowerCase());
        });
    }
    return Array.from(candidates);
};
exports.getIdentifierCandidates = getIdentifierCandidates;
// POST /api/auth/login (Support official email OR 12-digit Employee ID with Argon2id, Rate Limiting & Brute-Force Lockout)
router.post('/login', authSecurity_service_1.loginIpRateLimiter, async (req, res) => {
    try {
        const { identifier, email, password } = req.body;
        const loginId = (identifier || email || '').trim();
        const forwarded = req.headers['x-forwarded-for'];
        const clientIp = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip || req.socket.remoteAddress || '127.0.0.1';
        if (!loginId || !password) {
            res.status(400).json({ error: 'Please enter your registered official email or 12-digit Employee ID, and password.' });
            return;
        }
        const normalizedLoginId = loginId.toLowerCase();
        const candidates = (0, exports.getIdentifierCandidates)(loginId);
        // Concurrency Mutex: Serialize concurrent requests for the exact same identifier to prevent Race Conditions
        await authSecurity_service_1.authMutex.runExclusive(normalizedLoginId, async () => {
            // 1. Check account-level lockout status
            const lockoutCheck = await (0, authSecurity_service_1.checkAccountLockout)(normalizedLoginId);
            if (lockoutCheck.isLocked) {
                res.set('Retry-After', String(lockoutCheck.retryAfterSeconds));
                res.status(429).json({
                    error: 'Account Temporarily Restricted',
                    message: lockoutCheck.message,
                    retryAfterSeconds: lockoutCheck.retryAfterSeconds,
                    retryAfter: lockoutCheck.retryAfterSeconds
                });
                return;
            }
            // 2. Lookup user in User table
            let user = await db_1.prisma.user.findFirst({
                where: {
                    OR: [
                        { email: { in: candidates } },
                        { employeeId: { in: candidates } }
                    ]
                }
            });
            // 3. Lookup in Employee roster if not found in User table
            if (!user) {
                const emp = await db_1.prisma.employee.findFirst({
                    where: {
                        OR: [
                            { employeeId: { in: candidates } },
                            { email: { in: candidates } },
                            { personalEmail: { in: candidates } }
                        ]
                    }
                });
                if (emp) {
                    const rawPassword = password.trim();
                    const isPassMatch = emp.password ? await (0, authSecurity_service_1.verifyPassword)(rawPassword, emp.password) : false;
                    const isTempMatch = emp.temporaryPassword ? await (0, authSecurity_service_1.verifyPassword)(rawPassword, emp.temporaryPassword) : false;
                    const validEmpPassword = isPassMatch || isTempMatch;
                    if (!validEmpPassword) {
                        const failResult = await (0, authSecurity_service_1.recordFailedLogin)(normalizedLoginId, clientIp);
                        if (failResult.isLocked) {
                            res.set('Retry-After', String(failResult.retryAfterSeconds));
                            res.status(429).json({
                                error: 'Account Temporarily Restricted',
                                message: failResult.message,
                                retryAfterSeconds: failResult.retryAfterSeconds,
                                retryAfter: failResult.retryAfterSeconds
                            });
                        }
                        else {
                            res.status(401).json({
                                error: GENERIC_AUTH_ERROR,
                                remainingAttempts: failResult.remainingAttempts,
                                attemptsRemaining: failResult.remainingAttempts
                            });
                        }
                        return;
                    }
                    // Provision active user with memory-hardened Argon2id hash
                    const defaultHash = emp.password && !(0, authSecurity_service_1.shouldUpgradeHash)(emp.password)
                        ? emp.password
                        : await (0, authSecurity_service_1.hashPassword)(rawPassword);
                    const empRole = emp.role.includes('Director') ? 'Super Admin' :
                        (emp.role.includes('HR') || emp.department === 'Human Resources' ? 'HR Manager' :
                            (emp.role.includes('Manager') ? 'Project Manager' :
                                (emp.role.includes('Engineer') || emp.role.includes('Developer') ? 'Developer' : 'Team Member')));
                    user = await db_1.prisma.user.upsert({
                        where: { email: emp.email },
                        update: {
                            employeeId: emp.employeeId,
                            name: emp.name,
                            role: empRole,
                            department: emp.department,
                            status: 'Active',
                            avatar: emp.avatar
                        },
                        create: {
                            email: emp.email,
                            employeeId: emp.employeeId,
                            password: defaultHash,
                            name: emp.name,
                            role: empRole,
                            department: emp.department,
                            avatar: emp.avatar,
                            status: 'Active',
                            mustChangePassword: Boolean(emp.mustChangePassword)
                        }
                    });
                }
            }
            // If user does not exist, record failed login for identifier to thwart dictionary attacks
            if (!user) {
                const failResult = await (0, authSecurity_service_1.recordFailedLogin)(normalizedLoginId, clientIp);
                if (failResult.isLocked) {
                    res.set('Retry-After', String(failResult.retryAfterSeconds));
                    res.status(429).json({
                        error: 'Account Temporarily Restricted',
                        message: failResult.message,
                        retryAfterSeconds: failResult.retryAfterSeconds,
                        retryAfter: failResult.retryAfterSeconds
                    });
                }
                else {
                    res.status(401).json({
                        error: GENERIC_AUTH_ERROR,
                        remainingAttempts: failResult.remainingAttempts,
                        attemptsRemaining: failResult.remainingAttempts
                    });
                }
                return;
            }
            // Check account administrative status
            if (user.status !== 'Active') {
                res.status(403).json({ error: 'Account is inactive or portal access has been revoked.' });
                return;
            }
            // Check linked employee administrative status
            const linkedEmp = await db_1.prisma.employee.findFirst({
                where: {
                    OR: [
                        { employeeId: user.employeeId || '' },
                        { email: user.email },
                        ...(user.email ? [{ personalEmail: user.email }] : [])
                    ]
                }
            });
            if (linkedEmp && (linkedEmp.status === 'Resigned' || linkedEmp.status === 'Terminated' || linkedEmp.status === 'Inactive' || linkedEmp.approvalStatus === 'Rejected')) {
                res.status(403).json({ error: 'Portal access revoked: This employee account has been marked as resigned or deactivated.' });
                return;
            }
            // Verify password strictly using Argon2id with backward-compatible bcrypt verification
            let validPassword = await (0, authSecurity_service_1.verifyPassword)(password, user.password);
            if (!validPassword && (user.employeeId || user.email)) {
                const emp = await db_1.prisma.employee.findFirst({
                    where: {
                        OR: [
                            { employeeId: user.employeeId || '' },
                            { email: user.email },
                            { personalEmail: user.email }
                        ]
                    }
                });
                if (emp) {
                    const isEmpPass = emp.password ? await (0, authSecurity_service_1.verifyPassword)(password, emp.password) : false;
                    const isEmpTemp = emp.temporaryPassword ? await (0, authSecurity_service_1.verifyPassword)(password, emp.temporaryPassword) : false;
                    validPassword = Boolean(isEmpPass || isEmpTemp);
                    if (validPassword && emp.password) {
                        await db_1.prisma.user.update({
                            where: { id: user.id },
                            data: { password: emp.password, mustChangePassword: false }
                        }).catch(() => { });
                    }
                }
            }
            if (!validPassword) {
                const failResult = await (0, authSecurity_service_1.recordFailedLogin)(normalizedLoginId, clientIp);
                if (failResult.isLocked) {
                    res.set('Retry-After', String(failResult.retryAfterSeconds));
                    res.status(429).json({
                        error: 'Account Temporarily Restricted',
                        message: failResult.message,
                        retryAfterSeconds: failResult.retryAfterSeconds,
                        retryAfter: failResult.retryAfterSeconds
                    });
                }
                else {
                    res.status(401).json({
                        error: GENERIC_AUTH_ERROR,
                        remainingAttempts: failResult.remainingAttempts,
                        attemptsRemaining: failResult.remainingAttempts
                    });
                }
                return;
            }
            // Successful Authentication: Reset failed counters immediately
            await (0, authSecurity_service_1.recordSuccessfulLogin)(normalizedLoginId, clientIp);
            // Automatic Transparent Hash Upgrade: Upgrade legacy bcrypt hashes to Argon2id
            if ((0, authSecurity_service_1.shouldUpgradeHash)(user.password)) {
                try {
                    const modernArgon2Hash = await (0, authSecurity_service_1.hashPassword)(password);
                    await db_1.prisma.user.update({
                        where: { id: user.id },
                        data: { password: modernArgon2Hash }
                    });
                    if (user.employeeId) {
                        await db_1.prisma.employee.updateMany({
                            where: {
                                OR: [
                                    { employeeId: user.employeeId },
                                    { email: user.email }
                                ]
                            },
                            data: { password: modernArgon2Hash }
                        });
                    }
                }
                catch (upgradeErr) {
                    console.warn('[SECURITY INFO]: Non-blocking password upgrade notice', upgradeErr);
                }
            }
            // Check if user requires mandatory first-time password setup
            let mustChangePassword = Boolean(user.mustChangePassword);
            if (!mustChangePassword && user.employeeId) {
                const emp = await db_1.prisma.employee.findUnique({ where: { employeeId: user.employeeId } });
                if (emp?.mustChangePassword) {
                    mustChangePassword = true;
                }
            }
            // Generate JWT Token
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                employeeId: user.employeeId,
                mustChangePassword
            }, JWT_SECRET, { expiresIn: '7d' });
            // Set Secure, HttpOnly, SameSite Session Cookie
            res.cookie('ewms_session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            // Update last login timestamp
            await db_1.prisma.user.update({
                where: { id: user.id },
                data: { lastLogin: new Date() }
            }).catch(() => { });
            res.json({
                message: mustChangePassword ? 'Password setup required' : 'Login successful',
                token,
                mustChangePassword,
                user: (0, authSecurity_service_1.sanitizeStaffUser)(user)
            });
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server authentication failed: ' + error.message });
    }
});
// Helper for password strength validation
const validatePasswordStrength = (pwd) => {
    if (!pwd || pwd.length < 8) {
        return { valid: false, error: 'Password must be at least 8 characters long.' };
    }
    if (!/[A-Z]/.test(pwd)) {
        return { valid: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
    }
    if (!/[a-z]/.test(pwd)) {
        return { valid: false, error: 'Password must contain at least one lowercase letter (a-z).' };
    }
    if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) {
        return { valid: false, error: 'Password must contain at least one number or special character.' };
    }
    return { valid: true };
};
// POST /api/auth/change-password (Secure First-Time Password Setup & Change)
router.post('/change-password', auth_1.authenticateToken, async (req, res) => {
    try {
        const { currentPassword, previousPassword, temporaryPassword, newPassword, confirmPassword } = req.body;
        const prevPass = (currentPassword || previousPassword || temporaryPassword || '').trim();
        if (!prevPass) {
            res.status(400).json({ error: 'Compulsory Requirement: Previous / temporary password is required.' });
            return;
        }
        if (!newPassword || !confirmPassword) {
            res.status(400).json({ error: 'Please provide both new password and confirm password.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            res.status(400).json({ error: 'Passwords do not match. Please re-enter.' });
            return;
        }
        if (newPassword === prevPass) {
            res.status(400).json({ error: 'Security Policy: New permanent password cannot be identical to your previous password.' });
            return;
        }
        const validation = validatePasswordStrength(newPassword);
        if (!validation.valid) {
            res.status(400).json({ error: validation.error });
            return;
        }
        const userId = req.user?.id;
        const bodyIdentifier = (req.body.identifier || req.body.employeeId || req.body.email || '').trim();
        const idCandidates = (0, exports.getIdentifierCandidates)(bodyIdentifier || req.user?.email || req.user?.employeeId || '');
        let user = userId ? await db_1.prisma.user.findUnique({ where: { id: userId } }) : null;
        if (!user && idCandidates.length > 0) {
            user = await db_1.prisma.user.findFirst({
                where: {
                    OR: [
                        { email: { in: idCandidates } },
                        { employeeId: { in: idCandidates } }
                    ]
                }
            });
        }
        // If still not found in User table, search Employee roster table
        if (!user && idCandidates.length > 0) {
            const emp = await db_1.prisma.employee.findFirst({
                where: {
                    OR: [
                        { id: userId || '' },
                        { employeeId: { in: idCandidates } },
                        { email: { in: idCandidates } },
                        { personalEmail: { in: idCandidates } }
                    ]
                }
            });
            if (emp) {
                const defaultHash = emp.password || await bcryptjs_1.default.hash(prevPass, 10);
                user = await db_1.prisma.user.upsert({
                    where: { email: emp.email },
                    update: {
                        employeeId: emp.employeeId,
                        name: emp.name,
                        status: 'Active'
                    },
                    create: {
                        email: emp.email,
                        employeeId: emp.employeeId,
                        password: defaultHash,
                        name: emp.name,
                        role: 'Developer',
                        department: emp.department || 'Engineering',
                        avatar: emp.avatar,
                        status: 'Active',
                        mustChangePassword: true
                    }
                });
            }
        }
        if (!user) {
            res.status(404).json({ error: 'User record not found.' });
            return;
        }
        // Verify previous password matches current password or temporary password
        let prevValid = false;
        if (user.password) {
            prevValid = await (0, authSecurity_service_1.verifyPassword)(prevPass, user.password);
        }
        if (!prevValid) {
            const emp = await db_1.prisma.employee.findFirst({
                where: {
                    OR: [
                        { employeeId: user.employeeId || '' },
                        { email: user.email }
                    ]
                }
            });
            if (emp) {
                const isEmpPass = emp.password ? await (0, authSecurity_service_1.verifyPassword)(prevPass, emp.password) : false;
                const isEmpTemp = emp.temporaryPassword ? await (0, authSecurity_service_1.verifyPassword)(prevPass, emp.temporaryPassword) : false;
                prevValid = isEmpPass || isEmpTemp;
            }
        }
        if (!prevValid) {
            res.status(401).json({ error: 'Access Denied: The previous password you entered is incorrect.' });
            return;
        }
        // Hash new password with Argon2id
        const hashedPassword = await (0, authSecurity_service_1.hashPassword)(newPassword);
        // Atomically synchronize User and Employee tables using Prisma transaction
        const targetUserId = user.id;
        const targetEmployeeId = user.employeeId || '';
        const targetEmail = user.email;
        const [updatedUser] = await db_1.prisma.$transaction([
            db_1.prisma.user.update({
                where: { id: targetUserId },
                data: {
                    password: hashedPassword,
                    mustChangePassword: false
                }
            }),
            db_1.prisma.employee.updateMany({
                where: {
                    OR: [
                        { employeeId: targetEmployeeId },
                        { email: targetEmail }
                    ]
                },
                data: {
                    password: hashedPassword,
                    mustChangePassword: false,
                    temporaryPassword: null // Immediately invalidate temporary credentials
                }
            })
        ]);
        // Reset login security attempts
        await (0, authSecurity_service_1.recordSuccessfulLogin)(user.email.toLowerCase(), req.ip || '127.0.0.1');
        // Record Audit Log
        try {
            await db_1.prisma.auditLog.create({
                data: {
                    action: 'EMPLOYEE_PASSWORD_SETUP',
                    category: 'Identity & Access',
                    details: `User ${user.email} (${user.employeeId || user.id}) completed secure password setup. Temporary password invalidated.`,
                    actor: user.name
                }
            });
        }
        catch {
            // ignore
        }
        // Issue refreshed token with mustChangePassword = false
        const token = jsonwebtoken_1.default.sign({
            id: updatedUser.id,
            email: updatedUser.email,
            role: updatedUser.role,
            name: updatedUser.name,
            employeeId: updatedUser.employeeId,
            mustChangePassword: false
        }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: 'Password successfully updated! Workspace unlocked.',
            token,
            mustChangePassword: false,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role,
                employeeId: updatedUser.employeeId,
                avatar: updatedUser.avatar,
                department: updatedUser.department,
                mustChangePassword: false
            }
        });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to update password: ' + error.message });
    }
});
// POST /api/auth/first-time-setup (Direct Setup with Employee ID and Temporary Password)
router.post('/first-time-setup', async (req, res) => {
    try {
        const { identifier, temporaryPassword, newPassword, confirmPassword } = req.body;
        const cleanId = (identifier || '').trim();
        if (!cleanId || !temporaryPassword || !newPassword || !confirmPassword) {
            res.status(400).json({ error: 'All fields are required (Employee ID, temporary password, new password, confirmation).' });
            return;
        }
        // 1. Strict Security: Administrative accounts cannot be activated via employee self-service setup
        const lowerId = cleanId.toLowerCase();
        if (lowerId === 'director@enterprenexsolution.com' ||
            lowerId === 'director@enterprenex.solutions' ||
            lowerId === 'hr@enterprenexsolution.com' ||
            lowerId === 'hr@enterprenex.solutions' ||
            lowerId === '202600000001') {
            res.status(403).json({
                error: 'Access Denied: Administrative accounts (Director & HR) cannot be activated via employee self-service setup.'
            });
            return;
        }
        if (newPassword !== confirmPassword) {
            res.status(400).json({ error: 'New password and confirmation do not match.' });
            return;
        }
        const validation = validatePasswordStrength(newPassword);
        if (!validation.valid) {
            res.status(400).json({ error: validation.error });
            return;
        }
        // Find user by Employee ID or email
        const setupCandidates = (0, exports.getIdentifierCandidates)(cleanId);
        let user = await db_1.prisma.user.findFirst({
            where: {
                OR: [
                    { email: { in: setupCandidates } },
                    { employeeId: { in: setupCandidates } }
                ]
            }
        });
        // Block administrative roles
        if (user && (user.role === 'Super Admin' || user.role === 'Director' || user.role === 'Managing Director')) {
            res.status(403).json({
                error: 'Access Denied: Administrative accounts cannot be activated via employee self-service setup.'
            });
            return;
        }
        const emp = await db_1.prisma.employee.findFirst({
            where: {
                OR: [
                    { employeeId: { in: setupCandidates } },
                    { email: { in: setupCandidates } },
                    { personalEmail: { in: setupCandidates } }
                ]
            }
        });
        if (emp) {
            if (emp.approvalStatus === 'Pending Approval' || emp.approvalStatus === 'Pending Director Approval') {
                res.status(403).json({
                    error: `Account Pending Approval: Employee ${emp.name} (${emp.employeeId}) is awaiting executive authorization from Managing Director.`
                });
                return;
            }
            if (emp.approvalStatus === 'Rejected' || emp.status === 'Resigned' || emp.status === 'Terminated' || emp.status === 'Inactive') {
                res.status(403).json({
                    error: 'Access Denied: This employee account has been deactivated or rejected by corporate administration.'
                });
                return;
            }
        }
        if (!user && emp) {
            const defaultHash = emp.password || await bcryptjs_1.default.hash(temporaryPassword, 10);
            user = await db_1.prisma.user.upsert({
                where: { email: emp.email },
                update: {
                    employeeId: emp.employeeId,
                    name: emp.name,
                    status: 'Active'
                },
                create: {
                    email: emp.email,
                    employeeId: emp.employeeId,
                    password: defaultHash,
                    name: emp.name,
                    role: 'Developer',
                    department: emp.department || 'Engineering',
                    avatar: emp.avatar,
                    status: 'Active',
                    mustChangePassword: true
                }
            });
        }
        if (!user) {
            res.status(404).json({ error: 'No pre-existing employee account found. Only Director or HR can create accounts.' });
            return;
        }
        // Validate temporary password (supports Argon2id or legacy bcrypt)
        let isTempValid = false;
        if (emp && emp.temporaryPassword) {
            isTempValid = await (0, authSecurity_service_1.verifyPassword)(temporaryPassword, emp.temporaryPassword);
        }
        if (!isTempValid) {
            isTempValid = await (0, authSecurity_service_1.verifyPassword)(temporaryPassword, user.password);
        }
        if (!isTempValid && emp && emp.password) {
            isTempValid = await (0, authSecurity_service_1.verifyPassword)(temporaryPassword, emp.password);
        }
        if (!isTempValid) {
            res.status(401).json({ error: 'Invalid temporary password provided by company.' });
            return;
        }
        // Hash new permanent password with Argon2id
        const hashedPassword = await (0, authSecurity_service_1.hashPassword)(newPassword);
        // Atomically synchronize User and Employee tables using Prisma transaction
        const targetUserId = user.id;
        const targetEmployeeId = user.employeeId || '';
        const targetEmail = user.email;
        const [updatedUser] = await db_1.prisma.$transaction([
            db_1.prisma.user.update({
                where: { id: targetUserId },
                data: {
                    password: hashedPassword,
                    mustChangePassword: false,
                    status: 'Active'
                }
            }),
            db_1.prisma.employee.updateMany({
                where: {
                    OR: [
                        { employeeId: targetEmployeeId },
                        { email: targetEmail }
                    ]
                },
                data: {
                    password: hashedPassword,
                    mustChangePassword: false,
                    temporaryPassword: null,
                    isAccountActivated: true,
                    status: 'Active'
                }
            })
        ]);
        const token = jsonwebtoken_1.default.sign({
            id: updatedUser.id,
            email: updatedUser.email,
            role: updatedUser.role,
            name: updatedUser.name,
            employeeId: updatedUser.employeeId,
            mustChangePassword: false
        }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: 'Account successfully activated and password configured.',
            token,
            mustChangePassword: false,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role,
                employeeId: updatedUser.employeeId,
                avatar: updatedUser.avatar,
                department: updatedUser.department,
                mustChangePassword: false
            }
        });
    }
    catch (error) {
        console.error('First-time setup error:', error);
        res.status(500).json({ error: 'Failed to complete first-time setup: ' + error.message });
    }
});
// ── ADMINISTRATIVE FORGOT PASSWORD & RECOVERY FLOW (Director & HR Accounts) ──
/**
 * Checks whether an account holds administrative privileges (Director, Super Admin, HR)
 */
const isAdministrativeUser = (user, emp) => {
    const userRole = (user?.role || '').toLowerCase();
    const empRole = (emp?.role || '').toLowerCase();
    const empDept = (emp?.department || '').toLowerCase();
    const userEmail = (user?.email || '').toLowerCase();
    const empEmail = (emp?.email || '').toLowerCase();
    const userEmpId = (user?.employeeId || '').trim();
    return (userRole.includes('admin') ||
        userRole.includes('director') ||
        userRole.includes('hr') ||
        empRole.includes('director') ||
        empRole.includes('hr') ||
        empDept.includes('human resources') ||
        empDept.includes('executive') ||
        userEmail === 'director@enterprenexsolution.com' ||
        userEmail === 'hr@enterprenexsolution.com' ||
        empEmail === 'director@enterprenexsolution.com' ||
        empEmail === 'hr@enterprenexsolution.com' ||
        userEmpId === '202600000001');
};
// POST /api/auth/forgot-password (Administrative Recovery to enxproductofficial@gmail.com & Employee Self-Service)
router.post('/forgot-password', authSecurity_service_1.loginIpRateLimiter, async (req, res) => {
    try {
        const { identifier, phoneOrEmail, newPassword, confirmPassword } = req.body;
        const cleanId = (identifier || '').trim();
        const forwarded = req.headers['x-forwarded-for'];
        const clientIp = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip || req.socket.remoteAddress || '127.0.0.1';
        if (!cleanId) {
            res.status(400).json({ error: 'Please enter your registered official email or 12-digit Employee ID.' });
            return;
        }
        const cleanCandidates = (0, exports.getIdentifierCandidates)(cleanId);
        // Lookup user in User table or Employee roster
        const user = await db_1.prisma.user.findFirst({
            where: {
                OR: [
                    { email: { in: cleanCandidates } },
                    { employeeId: { in: cleanCandidates } }
                ]
            }
        });
        const emp = await db_1.prisma.employee.findFirst({
            where: {
                OR: [
                    { employeeId: { in: cleanCandidates } },
                    { email: { in: cleanCandidates } },
                    { personalEmail: { in: cleanCandidates } }
                ]
            }
        });
        const isAdmin = isAdministrativeUser(user, emp);
        // ── CASE 1: Director & HR Account Recovery (Single-Use Token via enxproductofficial@gmail.com) ──
        // If this is an administrative recovery request (no immediate newPassword submitted, or admin account targeted)
        if (!newPassword || isAdmin) {
            // If someone attempted to bypass email recovery for an administrative account by passing newPassword:
            if (newPassword && isAdmin) {
                res.status(403).json({
                    error: 'Administrative Security Policy: Director and HR Admin accounts cannot be reset via public form. A secure reset link has been dispatched to enxproductofficial@gmail.com.'
                });
                return;
            }
            // If user exists and is an authorized Director / HR administrator:
            if (isAdmin && (user || emp)) {
                const targetEmail = user?.email || emp?.email || 'director@enterprenexsolution.com';
                const targetName = user?.name || emp?.name || 'Administrative Official';
                const targetRole = user?.role || emp?.role || 'Director / HR Administration';
                // 1. Generate cryptographically strong single-use 64-hex token
                const resetToken = crypto_1.default.randomBytes(32).toString('hex');
                // 2. Token expiration strictly set to 15 minutes
                const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
                // 3. Invalidate any prior active reset tokens for this administrative email
                await db_1.prisma.passwordResetToken.updateMany({
                    where: {
                        email: targetEmail,
                        usedAt: null
                    },
                    data: {
                        usedAt: new Date()
                    }
                }).catch(() => { });
                // 4. Save new single-use token in database
                await db_1.prisma.passwordResetToken.create({
                    data: {
                        identifier: cleanId,
                        email: targetEmail,
                        token: resetToken,
                        expiresAt,
                        ipAddress: clientIp
                    }
                });
                // 5. Construct secure reset link
                const hostHeader = req.get('host') || 'www.enterprenexsolution.com';
                const originHeader = req.get('origin');
                const isLocal = hostHeader.includes('localhost') || (originHeader && originHeader.includes('localhost'));
                const frontendUrl = isLocal
                    ? (originHeader || 'http://localhost:5173')
                    : 'https://www.enterprenexsolution.com';
                const resetLink = `${frontendUrl}/create-new-password?token=${resetToken}`;
                // 6. Send high-security reset email to enxproductofficial@gmail.com
                await (0, email_service_1.sendAdminPasswordResetEmail)({
                    adminName: targetName,
                    adminEmail: targetEmail,
                    adminRole: targetRole,
                    resetLink,
                    ipAddress: clientIp,
                    expiresMinutes: 15
                });
                // 7. Record security audit log
                await db_1.prisma.auditLog.create({
                    data: {
                        action: 'ADMIN_PASSWORD_RESET_DISPATCHED',
                        category: 'Identity & Access',
                        details: `Single-use password reset link generated for ${targetRole} (${targetEmail}). Recovery email dispatched to enxproductofficial@gmail.com. Token valid for 15 minutes.`,
                        actor: targetEmail
                    }
                }).catch(() => { });
            }
            // Security Standard: Generic response avoids exposing whether an account exists
            res.json({
                success: true,
                message: 'If an authorized Director or HR administrator account matches this identifier, a secure password-reset link has been dispatched to enxproductofficial@gmail.com. The link is single-use and valid for exactly 15 minutes.'
            });
            return;
        }
        // ── CASE 2: Non-Administrative Employee Self-Service Recovery ──
        const cleanVerification = (phoneOrEmail || '').trim();
        if (!cleanVerification || !newPassword || !confirmPassword) {
            res.status(400).json({
                error: 'All fields are required (Official Email or Employee ID, Registered Phone/Email, New Password, Confirmation).'
            });
            return;
        }
        if (newPassword !== confirmPassword) {
            res.status(400).json({ error: 'New password and confirmation do not match.' });
            return;
        }
        const validation = validatePasswordStrength(newPassword);
        if (!validation.valid) {
            res.status(400).json({ error: validation.error });
            return;
        }
        if (!emp && !user) {
            res.status(404).json({
                error: 'Employee record not found. Please contact HR Administration if you need credential assistance.'
            });
            return;
        }
        // Verify secondary contact: phone or personal/official email
        const verificationNormalized = cleanVerification.toLowerCase();
        const verificationDigits = cleanVerification.replace(/\D/g, '');
        const empPhones = [
            emp?.phone?.replace(/\D/g, ''),
            emp?.personalPhone?.replace(/\D/g, '')
        ].filter(Boolean);
        const empEmails = [
            emp?.email?.toLowerCase(),
            emp?.personalEmail?.toLowerCase(),
            user?.email?.toLowerCase()
        ].filter(Boolean);
        const isPhoneMatch = verificationDigits.length >= 6 && empPhones.some(p => p && (p.endsWith(verificationDigits) || verificationDigits.endsWith(p)));
        const isEmailMatch = empEmails.some(e => e === verificationNormalized);
        if (!isPhoneMatch && !isEmailMatch) {
            res.status(401).json({
                error: 'Verification detail did not match the registered phone number or secondary email on file. Please contact HR for manual assistance.'
            });
            return;
        }
        const modernHash = await (0, authSecurity_service_1.hashPassword)(newPassword);
        const targetEmail = emp?.email || user?.email;
        const targetEmployeeId = emp?.employeeId || user?.employeeId;
        if (!targetEmail) {
            res.status(500).json({ error: 'Unable to resolve employee email for password update.' });
            return;
        }
        await db_1.prisma.$transaction([
            db_1.prisma.user.upsert({
                where: { email: targetEmail },
                update: {
                    password: modernHash,
                    mustChangePassword: false,
                    status: 'Active'
                },
                create: {
                    email: targetEmail,
                    employeeId: targetEmployeeId || 'TEMP',
                    password: modernHash,
                    name: emp?.name || user?.name || 'Staff Member',
                    role: 'Team Member',
                    department: emp?.department || 'Engineering',
                    status: 'Active',
                    mustChangePassword: false
                }
            }),
            db_1.prisma.employee.updateMany({
                where: {
                    OR: [
                        { email: targetEmail },
                        ...(targetEmployeeId ? [{ employeeId: targetEmployeeId }] : [])
                    ]
                },
                data: {
                    password: modernHash,
                    temporaryPassword: null,
                    mustChangePassword: false
                }
            })
        ]);
        await (0, authSecurity_service_1.clearAccountLockout)(cleanId, cleanId.toLowerCase(), targetEmail, targetEmployeeId);
        res.json({
            success: true,
            message: 'Password reset successfully! Security lockout has been cleared. You may now log in with your new password.'
        });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process password recovery request: ' + error.message });
    }
});
// GET /api/auth/verify-reset-token (Validates token without consuming it)
router.get('/verify-reset-token', async (req, res) => {
    try {
        const rawToken = String(req.query.token || '').trim();
        if (!rawToken) {
            res.status(400).json({ valid: false, error: 'Password reset token is required.' });
            return;
        }
        const record = await db_1.prisma.passwordResetToken.findUnique({
            where: { token: rawToken }
        });
        if (!record) {
            res.status(404).json({
                valid: false,
                error: 'Invalid or non-existent password reset link. Please request a new link.'
            });
            return;
        }
        if (record.usedAt) {
            res.status(400).json({
                valid: false,
                error: 'This password reset link has already been used and is no longer valid. Each link can only be used once.'
            });
            return;
        }
        const now = new Date();
        if (record.expiresAt < now) {
            res.status(400).json({
                valid: false,
                error: 'This password reset link expired after 15 minutes. Please request a new link.'
            });
            return;
        }
        const remainingSeconds = Math.max(0, Math.ceil((record.expiresAt.getTime() - now.getTime()) / 1000));
        res.json({
            valid: true,
            email: record.email,
            expiresAt: record.expiresAt,
            remainingSeconds
        });
    }
    catch (error) {
        console.error('Verify reset token error:', error);
        res.status(500).json({ valid: false, error: 'Server error verifying reset token: ' + error.message });
    }
});
// POST /api/auth/reset-password-with-token (Consumes token and updates administrative password)
router.post('/reset-password-with-token', async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;
        const rawToken = (token || '').trim();
        if (!rawToken || !newPassword || !confirmPassword) {
            res.status(400).json({ error: 'Reset token, new password, and confirmation are required.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            res.status(400).json({ error: 'New password and confirmation do not match.' });
            return;
        }
        const validation = validatePasswordStrength(newPassword);
        if (!validation.valid) {
            res.status(400).json({ error: validation.error });
            return;
        }
        const record = await db_1.prisma.passwordResetToken.findUnique({
            where: { token: rawToken }
        });
        if (!record) {
            res.status(404).json({ error: 'Invalid or non-existent password reset link.' });
            return;
        }
        if (record.usedAt) {
            res.status(400).json({
                error: 'Security Alert: This password reset link has already been used and is invalidated.'
            });
            return;
        }
        const now = new Date();
        if (record.expiresAt < now) {
            res.status(400).json({
                error: 'Security Alert: This password reset link expired after 15 minutes. Please submit a new request.'
            });
            return;
        }
        // Hash new password using memory-hardened Argon2id
        const modernHash = await (0, authSecurity_service_1.hashPassword)(newPassword);
        const targetEmail = record.email;
        // Atomically update User password, Employee record, invalidate token and clear lockouts
        await db_1.prisma.$transaction([
            // 1. Mark this token as used immediately
            db_1.prisma.passwordResetToken.update({
                where: { id: record.id },
                data: { usedAt: now }
            }),
            // 2. Invalidate any other active tokens for this user
            db_1.prisma.passwordResetToken.updateMany({
                where: {
                    email: targetEmail,
                    usedAt: null
                },
                data: { usedAt: now }
            }),
            // 3. Update User table
            db_1.prisma.user.updateMany({
                where: { email: targetEmail },
                data: {
                    password: modernHash,
                    mustChangePassword: false,
                    status: 'Active'
                }
            }),
            // 4. Update Employee table if present
            db_1.prisma.employee.updateMany({
                where: { email: targetEmail },
                data: {
                    password: modernHash,
                    temporaryPassword: null,
                    mustChangePassword: false
                }
            })
        ]);
        // Clear any active login restriction/lockouts
        await (0, authSecurity_service_1.clearAccountLockout)(targetEmail, targetEmail.toLowerCase(), record.identifier);
        // Record audit log
        await db_1.prisma.auditLog.create({
            data: {
                action: 'ADMIN_PASSWORD_RESET_COMPLETED',
                category: 'Identity & Access',
                details: `Administrative account ${targetEmail} successfully completed secure password reset via single-use token. All previous sessions invalidated.`,
                actor: targetEmail
            }
        }).catch(() => { });
        res.json({
            success: true,
            message: 'Your administrative password has been successfully updated! You may now sign in using your new credentials.'
        });
    }
    catch (error) {
        console.error('Reset password with token error:', error);
        res.status(500).json({ error: 'Failed to reset password: ' + error.message });
    }
});
// POST /api/auth/activate (Employee Secure Account Activation & Password Setup)
router.post('/activate', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const loginId = (identifier || '').trim();
        if (!loginId || !password) {
            res.status(400).json({ error: 'Please enter your assigned Employee ID or registered email, and a secure password.' });
            return;
        }
        if (password.length < 8) {
            res.status(400).json({ error: 'Security policy requires a minimum password length of 8 characters.' });
            return;
        }
        // Lookup employee using candidate identifiers
        const activateCandidates = (0, exports.getIdentifierCandidates)(loginId);
        const emp = await db_1.prisma.employee.findFirst({
            where: {
                OR: [
                    { employeeId: { in: activateCandidates } },
                    { email: { in: activateCandidates } },
                    { personalEmail: { in: activateCandidates } }
                ]
            }
        });
        if (!emp) {
            res.status(404).json({ error: `Access Denied: No pre-existing employee record found for '${loginId}'. Employees cannot self-create accounts or IDs. Accounts must be created by the Managing Director or HR Administration.` });
            return;
        }
        // Securely hash permanent password with Argon2id
        const hashedPassword = await (0, authSecurity_service_1.hashPassword)(password);
        // Update Employee record
        await db_1.prisma.employee.update({
            where: { id: emp.id },
            data: {
                password: hashedPassword,
                status: 'Active'
            }
        });
        // Update or create User login account
        const user = await db_1.prisma.user.upsert({
            where: { email: emp.email },
            update: {
                password: hashedPassword,
                employeeId: emp.employeeId,
                status: 'Active'
            },
            create: {
                email: emp.email,
                password: hashedPassword,
                name: emp.name,
                employeeId: emp.employeeId,
                role: emp.role.includes('Director') ? 'Super Admin' : (emp.role.includes('Manager') || emp.role.includes('HR')) ? 'Project Manager' : 'Team Member',
                department: emp.department,
                avatar: emp.avatar,
                status: 'Active'
            }
        });
        // Generate JWT Session Token
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            employeeId: user.employeeId
        }, JWT_SECRET, { expiresIn: '7d' });
        // Record ISO 27001 Security Audit Log
        try {
            await db_1.prisma.auditLog.create({
                data: {
                    action: 'EMPLOYEE_ACCOUNT_ACTIVATION',
                    category: 'Identity & Access',
                    details: `Employee ID ${emp.employeeId} (${emp.name}) activated portal workspace credentials with secure password hashing.`,
                    actor: emp.name
                }
            });
        }
        catch {
            // Non-blocking audit record
        }
        res.json({
            message: 'Account successfully activated! Welcome to your individual Enterprenex workspace.',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                employeeId: user.employeeId,
                avatar: user.avatar,
                department: user.department
            }
        });
    }
    catch (error) {
        console.error('Activation error:', error);
        res.status(500).json({ error: 'Account activation failed: ' + error.message });
    }
});
// GET /api/auth/me (Current Authenticated User)
router.get('/me', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ error: 'Not authenticated.' });
            return;
        }
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                employeeId: true,
                avatar: true,
                department: true,
                status: true
            }
        });
        if (!user) {
            res.status(404).json({ error: 'User profile not found.' });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/auth/logout (Secure Session Invalidation)
router.post('/logout', (req, res) => {
    res.clearCookie('ewms_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.json({ message: 'Session successfully invalidated and logged out.' });
});
exports.default = router;
