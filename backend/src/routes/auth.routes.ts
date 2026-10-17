import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'enterprenex_enterprise_jwt_secret_2026_super_secure';

// POST /api/auth/login (Support official email OR 12-digit Employee ID)
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, email, password } = req.body;
    const loginId = (identifier || email || '').trim();

    if (!loginId || !password) {
      res.status(400).json({ error: 'Please enter your registered official email or 12-digit Employee ID, and password.' });
      return;
    }

    // Lookup user by email OR employeeId
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: loginId } },
          { employeeId: { equals: loginId } }
        ]
      }
    });

    if (!user) {
      res.status(401).json({ error: 'Account not found. Verify your official credentials.' });
      return;
    }

    if (user.status !== 'Active') {
      res.status(403).json({ error: 'Account is inactive or portal access has been revoked.' });
      return;
    }

    // Verify password (supports bcrypt hash or direct initial fallback)
    const validPassword = await bcrypt.compare(password, user.password).catch(() => false) || password === user.password;
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
      return;
    }

    // Generate JWT Token
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

    res.json({
      message: 'Login successful',
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
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server authentication failed: ' + error.message });
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
      res.status(404).json({ error: 'Employee record not found. Please verify your Employee ID with HR or Director.' });
      return;
    }

    if (emp.approvalStatus === 'Pending Director Approval') {
      res.status(403).json({ error: 'Account pending Director approval. Login and activation will be enabled once approved by Managing Director.' });
      return;
    }

    // Securely hash permanent password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

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

export default router;
