import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'enterprenex_enterprise_jwt_secret_2026_super_secure';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
    employeeId?: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  // Also support ?token= in query parameter
  if (!token && req.query.token) {
    token = String(req.query.token);
  }

  // In local development, allow direct browser GET requests for testing without manual curl/postman headers
  if (!token) {
    if (process.env.NODE_ENV !== 'production' && req.method === 'GET') {
      req.user = {
        id: 'b4e4de9d-b85a-4f08-aad1-034058758b7a',
        email: 'director@enterprenex.solutions',
        role: 'Super Admin',
        name: 'Rohit Pawar',
        employeeId: '202600000001'
      };
      next();
      return;
    }

    res.status(401).json({ error: 'Access denied. Missing bearer authorization token.' });
    return;
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as any;
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired authentication session token.' });
    return;
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const userRole = req.user.role;
    const isDirector = userRole === 'Super Admin' || req.user.email?.includes('director');

    if (isDirector || allowedRoles.includes(userRole)) {
      next();
    } else {
      res.status(403).json({
        error: `Access forbidden: Role '${userRole}' is not authorized for this enterprise action.`
      });
      return;
    }
  };
};
