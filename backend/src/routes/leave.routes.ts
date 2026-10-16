import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/leaves (List leave requests)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isDirectorOrHr = req.user?.role === 'Super Admin' || req.user?.role === 'Project Manager' || req.user?.email?.includes('director');
    
    let leaves;
    if (isDirectorOrHr) {
      leaves = await prisma.leaveRequest.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } else {
      leaves = await prisma.leaveRequest.findMany({
        where: {
          employeeName: { contains: req.user?.name || '' }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json({ leaves });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/leaves (Submit a new leave application)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { employeeName, type, startDate, endDate, reason } = req.body;
    const name = employeeName || req.user?.name || 'Staff Member';

    const newLeave = await prisma.leaveRequest.create({
      data: {
        employeeName: name,
        type: type || 'Casual Leave',
        startDate,
        endDate,
        reason: reason || 'Personal Work',
        status: 'Pending'
      }
    });

    res.status(201).json({ message: 'Leave request submitted successfully.', leave: newLeave });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/leaves/:id/status (1-Click Approve / Reject by Director or HR)
router.put('/:id/status', authenticateToken, requireRole(['Super Admin', 'Project Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      res.status(400).json({ error: 'Invalid leave status.' });
      return;
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        approvedBy: req.user?.name || 'Managing Director'
      }
    });

    res.json({ message: `Leave status updated to ${status}.`, leave: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
