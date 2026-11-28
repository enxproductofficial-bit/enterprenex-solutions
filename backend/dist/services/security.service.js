"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAuditSecurityEntry = exports.generateSecureTemporaryPassword = exports.generateSecureEmployeeId = void 0;
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../db");
/**
 * Server-Side Security & Identity Service
 * Keeps password generation, employee ID generation, and secret handling
 * STRICTLY on the backend to avoid DevTools exposure.
 */
const generateSecureEmployeeId = async (department = 'Engineering') => {
    const currentYear = new Date().getFullYear(); // e.g. 2026
    const prefix = department.toLowerCase().includes('director') ? 'ZCX-DIR' :
        department.toLowerCase().includes('hr') || department.toLowerCase().includes('manager') ? 'ZCX-MGR' :
            'ZCX-EMP';
    // Count existing employees to create sequential identifier
    const totalEmployees = await db_1.prisma.employee.count();
    const nextSeq = totalEmployees + 1;
    const seqPadded = nextSeq.toString().padStart(4, '0');
    let candidateId = `${prefix}-${seqPadded}`;
    // Ensure collision-free uniqueness
    let exists = await db_1.prisma.employee.findUnique({ where: { employeeId: candidateId } });
    let attempt = 0;
    while (exists && attempt < 100) {
        attempt++;
        const randomSuffix = crypto_1.default.randomInt(1000, 9999);
        candidateId = `${prefix}-${randomSuffix}`;
        exists = await db_1.prisma.employee.findUnique({ where: { employeeId: candidateId } });
    }
    return candidateId;
};
exports.generateSecureEmployeeId = generateSecureEmployeeId;
/**
 * Generate a cryptographically secure temporary password / activation token on the backend
 */
const generateSecureTemporaryPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    const bytes = crypto_1.default.randomBytes(12);
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars[bytes[i] % chars.length];
    }
    return password;
};
exports.generateSecureTemporaryPassword = generateSecureTemporaryPassword;
/**
 * Log ISO 27001 Audit Entry to Database
 */
const logAuditSecurityEntry = async (data) => {
    try {
        await db_1.prisma.auditLog.create({
            data: {
                action: data.action,
                category: data.category,
                details: data.details,
                actor: data.actor || 'System',
                ipAddress: data.ipAddress || '127.0.0.1'
            }
        });
    }
    catch (err) {
        console.error('[AUDIT LOG ERROR]: Failed to persist audit log', err);
    }
};
exports.logAuditSecurityEntry = logAuditSecurityEntry;
