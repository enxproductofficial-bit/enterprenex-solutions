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
