import crypto from 'crypto';
import { prisma } from '../db';

/**
 * Server-Side Security & Identity Service
 * Keeps password generation, employee ID generation, and secret handling
 * STRICTLY on the backend to avoid DevTools exposure.
 */

export const generateSecureEmployeeId = async (department: string = 'Engineering'): Promise<string> => {
  const currentYear = new Date().getFullYear(); // e.g. 2026
  const prefix = department.toLowerCase().includes('director') ? 'ZCX-DIR' :
                 department.toLowerCase().includes('hr') || department.toLowerCase().includes('manager') ? 'ZCX-MGR' :
                 'ZCX-EMP';

  // Count existing employees to create sequential identifier
  const totalEmployees = await prisma.employee.count();
  const nextSeq = totalEmployees + 1;
  const seqPadded = nextSeq.toString().padStart(4, '0');

  let candidateId = `${prefix}-${seqPadded}`;

  // Ensure collision-free uniqueness
  let exists = await prisma.employee.findUnique({ where: { employeeId: candidateId } });
  let attempt = 0;
  while (exists && attempt < 100) {
    attempt++;
    const randomSuffix = crypto.randomInt(1000, 9999);
    candidateId = `${prefix}-${randomSuffix}`;
    exists = await prisma.employee.findUnique({ where: { employeeId: candidateId } });
  }

  return candidateId;
};

/**
 * Generate a cryptographically secure temporary password / activation token on the backend
 */
export const generateSecureTemporaryPassword = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
  const bytes = crypto.randomBytes(12);
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
};

/**
 * Log ISO 27001 Audit Entry to Database
 */
export const logAuditSecurityEntry = async (data: {
  action: string;
  category: string;
  details: string;
  actor: string;
  ipAddress?: string;
}): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        category: data.category,
        details: data.details,
        actor: data.actor || 'System',
        ipAddress: data.ipAddress || '127.0.0.1'
      }
    });
  } catch (err) {
    console.error('[AUDIT LOG ERROR]: Failed to persist audit log', err);
  }
};
