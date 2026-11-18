import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
    employeeId?: string;
    department?: string;
  };
}
// AUTHENTICATE TOKEN

export const authenticateToken = ( req: AuthRequest, res: Response,next: NextFunction): void => {
  const authHeader = req.headers['authorization'];

  // Require a Bearer token
  if (!authHeader || !authHeader.startsWith('Bearer ')) { res.status(401).json({
      error: 'Access denied. Missing bearer authorization token.'
    });
    return;
  }

  const token = authHeader.slice(7).trim();

  if (!token) { res.status(401).json({
      error: 'Access denied. Missing bearer authorization token.'
    });
    return;
  }

  // Require JWT secret configuration
  if (!JWT_SECRET) { res.status(500).json({
      error: 'Authentication service is not configured.'
    });
    return;
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as AuthRequest['user'];

    // Validate required user information
    if (!verified || !verified.id || !verified.role) { res.status(401).json({
        error: 'Invalid authentication token.'
      });
      return;
    }

    req.user = verified;
    next();

  } catch { res.status(401).json({
      error: 'Invalid or expired authentication token.'
    });
  }
};

// OPTIONAL AUTHENTICATION
export const optionalAuth = ( req: AuthRequest, res: Response, next: NextFunction ): void => {
  const authHeader = req.headers['authorization'];
// No token is acceptable for optional authentication
  if (!authHeader) { next();
    return;
  }
// Reject malformed authorization headers
  if (!authHeader.startsWith('Bearer ')) { res.status(401).json({
      error: 'Invalid authorization header.'
    });
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    res.status(401).json({
      error: 'Missing bearer token.'
    });
    return;
  }

  // Require JWT secret configuration
  if (!JWT_SECRET) {
    res.status(500).json({
      error: 'Authentication service is not configured.'
    });
    return;
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as AuthRequest['user'];

    if (!verified || !verified.id || !verified.role) { res.status(401).json({
        error: 'Invalid authentication token.'
      });
      return;
    }

    req.user = verified;
    next();

  } catch {
    res.status(401).json({
      error: 'Invalid or expired authentication token.'
    });
  }
};

// ROLE-BASED AUTHORIZATION

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const userRole = req.user.role || '';
    const userEmail = (req.user.email || '').toLowerCase();

    const isDirector =
      userRole === 'Super Admin' ||
      userRole === 'Director / CEO' ||
      userRole.includes('Director') ||
      userRole.includes('CMD') ||
      userEmail.includes('director');

    const isManager =
      isDirector ||
      userRole === 'Project Manager' ||
      userRole === 'Manager' ||
      userRole.includes('Manager') ||
      userEmail.includes('manager');

    const isHR =
      isDirector ||
      userRole === 'HR Manager' ||
      userRole === 'HR' ||
      userRole.includes('HR') ||
      req.user.department === 'Human Resources' ||
      userEmail.includes('hr');

    // Director has universal access across all modules
    if (isDirector) {
      next();
      return;
    }

    // Match role against allowed list with aliases
    const isAuthorized = !allowedRoles || allowedRoles.some(allowed => {
      if (allowed === userRole) return true;
      if (allowed === 'Super Admin' && isDirector) return true;
      if (allowed === 'Project Manager' && isManager) return true;
      if (allowed === 'HR Manager' && isHR) return true;
      if ((allowed === 'Team Member' || allowed === 'Developer') && (userRole === 'Employee' || userRole === 'Developer' || userRole === 'Team Member')) return true;
      return false;
    });

    if (isAuthorized) {
      next();
    } else {
      res.status(403).json({
        error: `Access forbidden: Role '${userRole}' is not authorized for this enterprise action.`
      });
      return;
    }
  };
};
