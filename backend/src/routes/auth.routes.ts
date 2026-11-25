import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {
  loginIpRateLimiter,
  authMutex,
  hashPassword,
  verifyPassword,
  shouldUpgradeHash,
  checkAccountLockout,
  recordFailedLogin,
  recordSuccessfulLogin,
  sanitizeStaffUser
} from '../services/authSecurity.service';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'enterprenex_enterprise_jwt_secret_2026_super_secure';

const GENERIC_AUTH_ERROR = 'Invalid credentials. Please verify your official email or 12-digit Employee ID, and password.';

// POST /api/auth/login (Support official email OR 12-digit Employee ID with Argon2id, Rate Limiting & Brute-Force Lockout)
router.post('/login', loginIpRateLimiter, async (req: Request, res: Response): Promise<void> => {
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

    // Concurrency Mutex: Serialize concurrent requests for the exact same identifier to prevent Race Conditions
    await authMutex.runExclusive(normalizedLoginId, async () => {
      // 1. Check account-level lockout status
      const lockoutCheck = await checkAccountLockout(normalizedLoginId);
      if (lockoutCheck.isLocked) {
        res.set('Retry-After', String(lockoutCheck.retryAfterSeconds));
        res.status(429).json({
          error: 'Account Temporarily Restricted',
          message: lockoutCheck.message,
          retryAfterSeconds: lockoutCheck.retryAfterSeconds
        });
        return;
      }

      // 2. Lookup user in User table
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: loginId } },
            { email: { equals: normalizedLoginId } },
            { employeeId: { equals: loginId } },
            { employeeId: { equals: loginId.toUpperCase() } }
          ]
        }
      });

      // 3. Lookup in Employee roster if not found in User table
      if (!user) {
        const emp = await prisma.employee.findFirst({
          where: {
            OR: [
              { employeeId: { equals: loginId } },
              { employeeId: { equals: loginId.toUpperCase() } },
              { employeeId: { equals: normalizedLoginId } },
              { email: { equals: loginId } },
              { email: { equals: normalizedLoginId } },
              { personalEmail: { equals: loginId } },
              { personalEmail: { equals: normalizedLoginId } }
            ]
          }
        });

        if (emp) {
          const rawPassword = password.trim();
          const isPassMatch = emp.password ? await verifyPassword(rawPassword, emp.password) : false;
          const isTempMatch = emp.temporaryPassword ? await verifyPassword(rawPassword, emp.temporaryPassword) : false;
          const validEmpPassword = isPassMatch || isTempMatch;

          if (!validEmpPassword) {
            const failResult = await recordFailedLogin(normalizedLoginId, clientIp);
            if (failResult.isLocked) {
              res.set('Retry-After', String(failResult.retryAfterSeconds));
              res.status(429).json({
                error: 'Account Temporarily Restricted',
                message: failResult.message,
                retryAfterSeconds: failResult.retryAfterSeconds
              });
            } else {
              res.status(401).json({
                error: GENERIC_AUTH_ERROR,
                attemptsRemaining: failResult.remainingAttempts
              });
            }
            return;
          }

          // Provision active user with memory-hardened Argon2id hash
          const defaultHash = emp.password && !shouldUpgradeHash(emp.password) 
            ? emp.password 
            : await hashPassword(rawPassword);

          const empRole = emp.role.includes('Director') ? 'Super Admin' :
            (emp.role.includes('HR') || emp.department === 'Human Resources' ? 'HR Manager' :
            (emp.role.includes('Manager') ? 'Project Manager' :
            (emp.role.includes('Engineer') || emp.role.includes('Developer') ? 'Developer' : 'Team Member')));

          user = await prisma.user.upsert({
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
        const failResult = await recordFailedLogin(normalizedLoginId, clientIp);
        if (failResult.isLocked) {
          res.set('Retry-After', String(failResult.retryAfterSeconds));
          res.status(429).json({
            error: 'Account Temporarily Restricted',
            message: failResult.message,
            retryAfterSeconds: failResult.retryAfterSeconds
          });
        } else {
          res.status(401).json({
            error: GENERIC_AUTH_ERROR,
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

      // Verify password strictly using Argon2id with backward-compatible bcrypt verification
      let validPassword = await verifyPassword(password, user.password);

      if (!validPassword && (user.employeeId || user.email)) {
        const emp = await prisma.employee.findFirst({
          where: {
            OR: [
              { employeeId: user.employeeId || '' },
              { email: user.email },
              { personalEmail: user.email }
            ]
          }
        });
        if (emp) {
          const isEmpPass = emp.password ? await verifyPassword(password, emp.password) : false;
          const isEmpTemp = emp.temporaryPassword ? await verifyPassword(password, emp.temporaryPassword) : false;
          validPassword = Boolean(isEmpPass || isEmpTemp);

          if (validPassword && emp.password) {
            await prisma.user.update({
              where: { id: user.id },
              data: { password: emp.password, mustChangePassword: false }
            }).catch(() => {});
          }
        }
      }

      if (!validPassword) {
        const failResult = await recordFailedLogin(normalizedLoginId, clientIp);
        if (failResult.isLocked) {
          res.set('Retry-After', String(failResult.retryAfterSeconds));
          res.status(429).json({
            error: 'Account Temporarily Restricted',
            message: failResult.message,
            retryAfterSeconds: failResult.retryAfterSeconds
          });
        } else {
          res.status(401).json({
            error: GENERIC_AUTH_ERROR,
            attemptsRemaining: failResult.remainingAttempts
          });
        }
        return;
      }

      // Successful Authentication: Reset failed counters immediately
      await recordSuccessfulLogin(normalizedLoginId, clientIp);

      // Automatic Transparent Hash Upgrade: Upgrade legacy bcrypt hashes to Argon2id
      if (shouldUpgradeHash(user.password)) {
        try {
          const modernArgon2Hash = await hashPassword(password);
          await prisma.user.update({
            where: { id: user.id },
            data: { password: modernArgon2Hash }
          });
          if (user.employeeId) {
            await prisma.employee.updateMany({
              where: {
                OR: [
                  { employeeId: user.employeeId },
                  { email: user.email }
                ]
              },
              data: { password: modernArgon2Hash }
            });
          }
        } catch (upgradeErr) {
          console.warn('[SECURITY INFO]: Non-blocking password upgrade notice', upgradeErr);
        }
      }

      // Check if user requires mandatory first-time password setup
      let mustChangePassword = Boolean(user.mustChangePassword);
      if (!mustChangePassword && user.employeeId) {
        const emp = await prisma.employee.findUnique({ where: { employeeId: user.employeeId } });
        if (emp?.mustChangePassword) {
          mustChangePassword = true;
        }
      }

      // Generate JWT Token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          employeeId: user.employeeId,
          mustChangePassword
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Set Secure, HttpOnly, SameSite Session Cookie
      res.cookie('ewms_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Update last login timestamp
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      }).catch(() => {});

      res.json({
        message: mustChangePassword ? 'Password setup required' : 'Login successful',
        token,
        mustChangePassword,
        user: sanitizeStaffUser(user)
      });
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server authentication failed: ' + error.message });
  }
});

// Helper for password strength validation
const validatePasswordStrength = (pwd: string): { valid: boolean; error?: string } => {
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
router.post('/change-password', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
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

    let user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    if (!user && (req.user?.email || bodyIdentifier)) {
      const emailToSearch = (req.user?.email || bodyIdentifier).toLowerCase();
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: emailToSearch } },
            { employeeId: { equals: bodyIdentifier } },
            { employeeId: { equals: bodyIdentifier.toUpperCase() } },
            { employeeId: { equals: req.user?.employeeId || '' } }
          ]
        }
      });
    }

    // If still not found in User table, search Employee roster table
    if (!user) {
      const emp = await prisma.employee.findFirst({
        where: {
          OR: [
            { id: userId || '' },
            { employeeId: { equals: bodyIdentifier } },
            { employeeId: { equals: bodyIdentifier.toUpperCase() } },
            { employeeId: { equals: req.user?.employeeId || '' } },
            { email: { equals: req.user?.email || '' } },
            { email: { equals: bodyIdentifier.toLowerCase() } },
            { personalEmail: { equals: bodyIdentifier.toLowerCase() } }
          ]
        }
      });

      if (emp) {
        const defaultHash = emp.password || await bcrypt.hash(prevPass, 10);
        user = await prisma.user.upsert({
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
      prevValid = await verifyPassword(prevPass, user.password);
    }
    if (!prevValid) {
      const emp = await prisma.employee.findFirst({
        where: {
          OR: [
            { employeeId: user.employeeId || '' },
            { email: user.email }
          ]
        }
      });
      if (emp) {
        const isEmpPass = emp.password ? await verifyPassword(prevPass, emp.password) : false;
        const isEmpTemp = emp.temporaryPassword ? await verifyPassword(prevPass, emp.temporaryPassword) : false;
        prevValid = isEmpPass || isEmpTemp;
      }
    }

    if (!prevValid) {
      res.status(401).json({ error: 'Access Denied: The previous password you entered is incorrect.' });
      return;
    }

    // Hash new password with Argon2id
    const hashedPassword = await hashPassword(newPassword);

    // Atomically synchronize User and Employee tables using Prisma transaction
    const targetUserId = user.id;
    const targetEmployeeId = user.employeeId || '';
    const targetEmail = user.email;

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: targetUserId },
        data: {
          password: hashedPassword,
          mustChangePassword: false
        }
      }),
      prisma.employee.updateMany({
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
    await recordSuccessfulLogin(user.email.toLowerCase(), req.ip || '127.0.0.1');

    // Record Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: 'EMPLOYEE_PASSWORD_SETUP',
          category: 'Identity & Access',
          details: `User ${user.email} (${user.employeeId || user.id}) completed secure password setup. Temporary password invalidated.`,
          actor: user.name
        }
      });
    } catch {
      // ignore
    }

    // Issue refreshed token with mustChangePassword = false
    const token = jwt.sign(
      {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        name: updatedUser.name,
        employeeId: updatedUser.employeeId,
        mustChangePassword: false
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

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
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to update password: ' + error.message });
  }
});

// POST /api/auth/first-time-setup (Direct Setup with Employee ID and Temporary Password)
router.post('/first-time-setup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, temporaryPassword, newPassword, confirmPassword } = req.body;
    const cleanId = (identifier || '').trim();

    if (!cleanId || !temporaryPassword || !newPassword || !confirmPassword) {
      res.status(400).json({ error: 'All fields are required (Employee ID, temporary password, new password, confirmation).' });
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
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: cleanId } },
          { email: { equals: cleanId.toLowerCase() } },
          { employeeId: { equals: cleanId } },
          { employeeId: { equals: cleanId.toUpperCase() } }
        ]
      }
    });

    if (!user) {
      const emp = await prisma.employee.findFirst({
        where: {
          OR: [
            { employeeId: { equals: cleanId } },
            { employeeId: { equals: cleanId.toUpperCase() } },
            { email: { equals: cleanId.toLowerCase() } },
            { personalEmail: { equals: cleanId.toLowerCase() } }
          ]
        }
      });

      if (emp) {
        const defaultHash = emp.password || await bcrypt.hash(temporaryPassword, 10);
        user = await prisma.user.upsert({
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
      res.status(404).json({ error: 'No pre-existing employee account found. Only Director or HR can create accounts.' });
      return;
    }

    // Validate temporary password (supports Argon2id or legacy bcrypt)
    let isTempValid = await verifyPassword(temporaryPassword, user.password);
    if (!isTempValid) {
      const emp = await prisma.employee.findFirst({
        where: {
          OR: [
            { employeeId: user.employeeId || '' },
            { email: user.email }
          ]
        }
      });
      if (emp) {
        const isEmpTemp = emp.temporaryPassword ? await verifyPassword(temporaryPassword, emp.temporaryPassword) : false;
        const isEmpPass = emp.password ? await verifyPassword(temporaryPassword, emp.password) : false;
        isTempValid = isEmpTemp || isEmpPass;
      }
    }

    if (!isTempValid) {
      res.status(401).json({ error: 'Invalid temporary password provided by company.' });
      return;
    }

    // Hash new permanent password with Argon2id
    const hashedPassword = await hashPassword(newPassword);

    // Atomically synchronize User and Employee tables using Prisma transaction
    const targetUserId = user.id;
    const targetEmployeeId = user.employeeId || '';
    const targetEmail = user.email;

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: targetUserId },
        data: {
          password: hashedPassword,
          mustChangePassword: false
        }
      }),
      prisma.employee.updateMany({
        where: {
          OR: [
            { employeeId: targetEmployeeId },
            { email: targetEmail }
          ]
        },
        data: {
          password: hashedPassword,
          mustChangePassword: false,
          temporaryPassword: null
        }
      })
    ]);

    const token = jwt.sign(
      {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        name: updatedUser.name,
        employeeId: updatedUser.employeeId,
        mustChangePassword: false
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

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
  } catch (error: any) {
    console.error('First-time setup error:', error);
    res.status(500).json({ error: 'Failed to complete first-time setup: ' + error.message });
  }
});

// POST /api/auth/activate (Employee Secure Account Activation & Password Setup)
router.post('/activate', async (req: Request, res: Response): Promise<void> => {
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

    // Lookup employee
    const emp = await prisma.employee.findFirst({
      where: {
        OR: [
          { employeeId: { equals: loginId } },
          { email: { equals: loginId } }
        ]
      }
    });

    if (!emp) {
      res.status(404).json({ error: `Access Denied: No pre-existing employee record found for '${loginId}'. Employees cannot self-create accounts or IDs. Accounts must be created by the Managing Director or HR Administration.` });
      return;
    }

    if (emp.approvalStatus === 'Pending Director Approval') {
      res.status(403).json({ error: `Account Pending Approval: Employee ID ${emp.employeeId || emp.name} has been registered by HR and is awaiting executive authorization from Managing Director. Portal activation will be enabled once approved.` });
      return;
    }

    // Securely hash permanent password with Argon2id
    const hashedPassword = await hashPassword(password);

    // Update Employee record
    await prisma.employee.update({
      where: { id: emp.id },
      data: {
        password: hashedPassword,
        status: 'Active'
      }
    });

    // Update or create User login account
    const user = await prisma.user.upsert({
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
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        employeeId: user.employeeId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Record ISO 27001 Security Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: 'EMPLOYEE_ACCOUNT_ACTIVATION',
          category: 'Identity & Access',
          details: `Employee ID ${emp.employeeId} (${emp.name}) activated portal workspace credentials with secure password hashing.`,
          actor: emp.name
        }
      });
    } catch {
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
  } catch (error: any) {
    console.error('Activation error:', error);
    res.status(500).json({ error: 'Account activation failed: ' + error.message });
  }
});

// GET /api/auth/me (Current Authenticated User)
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    const user = await prisma.user.findUnique({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/logout (Secure Session Invalidation)
router.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie('ewms_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.json({ message: 'Session successfully invalidated and logged out.' });
});

export default router;
