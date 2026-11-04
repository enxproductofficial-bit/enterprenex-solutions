import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/notifications (Fetch live notifications for the logged-in user / role)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const isDirector = user.role === 'Super Admin' || user.role?.includes('Director') || user.email?.includes('director');
    const isHr = user.role === 'HR Manager' || user.role === 'Project Manager' || user.department === 'Human Resources' || user.email?.includes('hr');

    // Build query criteria
    const orConditions: any[] = [];

    if (user.email) {
      orConditions.push({ recipientEmail: user.email });
    }
    if (user.employeeId) {
      orConditions.push({ recipientEmployeeId: user.employeeId });
    }

    if (isDirector) {
      orConditions.push({ recipientRole: 'Super Admin' });
      orConditions.push({ recipientRole: null });
    }
    if (isHr) {
      orConditions.push({ recipientRole: 'Project Manager' });
      orConditions.push({ recipientRole: 'HR Manager' });
    }

    const notifications = await prisma.ewmsNotification.findMany({
      where: orConditions.length > 0 ? { OR: orConditions } : {},
      orderBy: { createdAt: 'desc' },
      take: 40
    });

    res.json({ notifications });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await prisma.ewmsNotification.update({
      where: { id },
      data: { read: true }
    });
    res.json({ notification: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const isDirector = user?.role === 'Super Admin';
    const isHr = user?.role === 'Project Manager' || user?.role === 'HR Manager';

    const orConditions: any[] = [];
    if (user?.email) orConditions.push({ recipientEmail: user.email });
    if (user?.employeeId) orConditions.push({ recipientEmployeeId: user.employeeId });
    if (isDirector) orConditions.push({ recipientRole: 'Super Admin' });
    if (isHr) orConditions.push({ recipientRole: 'Project Manager' }, { recipientRole: 'HR Manager' });

    await prisma.ewmsNotification.updateMany({
      where: orConditions.length > 0 ? { OR: orConditions } : {},
      data: { read: true }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
