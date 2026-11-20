import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { emitNotification } from '../services/notification.service';

const router = Router();

// Helper: Calculate number of days between two dates inclusive
function calculateDays(start: string, end: string): number {
  try {
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    if (diff < 0) return 1;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  } catch {
    return 1;
  }
}

// GET /api/v1/leaves (List leave requests)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isDirectorOrHr =
      req.user?.role === 'Super Admin' ||
      req.user?.role === 'Project Manager' ||
      req.user?.role === 'HR Manager' ||
      req.user?.email?.includes('director') ||
      req.user?.email?.includes('hr');

    const { status, type } = req.query as Record<string, string>;

    const where: any = {};
    if (!isDirectorOrHr) {
      where.OR = [
        ...(req.user?.employeeId ? [{ employeeId: req.user.employeeId }] : []),
        ...(req.user?.id ? [{ employeeId: req.user.id }] : []),
        ...(req.user?.name ? [{ employeeName: { contains: req.user.name, mode: 'insensitive' } }] : [])
      ];
    }
    if (status) where.status = status;
    if (type) where.type = type;

    const leaves = await prisma.leaveRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ leaves });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/leaves/balance (Fetch current employee leave balances)
router.get('/balance', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const empId = req.user?.employeeId || req.user?.id || 'unknown';
    const empName = req.user?.name || 'Staff Member';

    let balance = await prisma.leaveBalance.findFirst({
      where: {
        OR: [
          { employeeId: empId },
          ...(req.user?.id ? [{ employeeId: req.user.id }] : []),
          { employeeName: empName }
        ]
      }
    });

    if (!balance) {
      // Initialize default leave balance
      balance = await prisma.leaveBalance.create({
        data: {
          employeeId: empId,
          employeeName: empName,
          casualLeave: 12,
          sickLeave: 10,
          earnedLeave: 15,
          emergencyLeave: 5,
          unpaidLeave: 0
        }
      });
    }

    res.json({ balance });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/leaves/apply (Employee submits leave application)
router.post('/apply', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, startDate, endDate, reason, documentUrl } = req.body;
    const empId = req.user?.employeeId || req.user?.id || 'unknown';
    const empName = req.user?.name || 'Staff Member';

    if (!startDate || !endDate || !reason) {
      res.status(400).json({ error: 'Start date, end date, and reason are required.' });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      res.status(400).json({ error: 'Start date cannot be after end date.' });
      return;
    }

    const leaveDays = calculateDays(startDate, endDate);
    if (leaveDays <= 0) {
      res.status(400).json({ error: 'Leave duration must be at least 1 day.' });
      return;
    }

    // Overlapping check
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        employeeName: empName,
        status: { in: ['Pending', 'Approved'] },
        OR: [
          { startDate: { lte: endDate }, endDate: { gte: startDate } }
        ]
      }
    });

    if (overlapping) {
      res.status(400).json({
        error: `Overlapping leave request detected between ${overlapping.startDate} and ${overlapping.endDate} (${overlapping.status}).`
      });
      return;
    }

    const newLeave = await prisma.leaveRequest.create({
      data: {
        employeeId: empId,
        employeeName: empName,
        type: type || 'Casual Leave',
        startDate,
        endDate,
        leaveDays,
        reason,
        documentUrl: documentUrl || null,
        status: 'Pending'
      }
    });

    // Notify HR and Director
    await emitNotification({
      type: 'LEAVE_SUBMITTED',
      title: 'New Leave Application',
      message: `${empName} applied for ${leaveDays} day(s) of ${type} (${startDate} to ${endDate}).`,
      recipientRole: 'Super Admin',
      actionUrl: '/team'
    });

    res.status(201).json({
      message: 'Leave application submitted successfully for review.',
      leave: newLeave
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Backward-compatible POST /
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, startDate, endDate, reason, documentUrl } = req.body;
    const empId = req.user?.employeeId || req.user?.id || 'unknown';
    const empName = req.user?.name || 'Staff Member';

    if (!startDate || !endDate || !reason) {
      res.status(400).json({ error: 'Start date, end date, and reason are required.' });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      res.status(400).json({ error: 'Start date cannot be after end date.' });
      return;
    }

    const leaveDays = calculateDays(startDate, endDate);
    if (leaveDays <= 0) {
      res.status(400).json({ error: 'Leave duration must be at least 1 day.' });
      return;
    }

    const newLeave = await prisma.leaveRequest.create({
      data: {
        employeeId: empId,
        employeeName: empName,
        type: type || 'Casual Leave',
        startDate,
        endDate,
        leaveDays,
        reason,
        documentUrl: documentUrl || null,
        status: 'Pending'
      }
    });

    res.status(201).json({
      message: 'Leave application submitted successfully.',
      leave: newLeave
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/leaves/:id/review (Approve or Reject by HR or Director)
router.patch('/:id/review', authenticateToken, requireRole(['Super Admin', 'Project Manager', 'HR Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, remarks, directorApprovalStatus } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      res.status(400).json({ error: 'Status must be either Approved or Rejected.' });
      return;
    }

    const existing = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Leave request not found.' });
      return;
    }

    // Atomic transaction: Status update + Leave balance deduction executed atomically
    const updated = await prisma.$transaction(async (tx) => {
      const leave = await tx.leaveRequest.update({
        where: { id },
        data: {
          status,
          rejectionReason: status === 'Rejected' ? remarks : null,
          directorApprovalStatus: directorApprovalStatus || (status === 'Approved' ? 'Approved' : 'Rejected'),
          approvedBy: req.user?.name || 'Managing Director'
        }
      });

      if (status === 'Approved') {
        const balance = await tx.leaveBalance.findFirst({
          where: {
            OR: [
              { employeeId: existing.employeeId || '' },
              { employeeName: existing.employeeName }
            ]
          }
        });

        if (balance) {
          const days = existing.leaveDays;
          const updateData: any = {};
          if (existing.type === 'Casual Leave') updateData.casualLeave = Math.max(0, balance.casualLeave - days);
          else if (existing.type === 'Sick Leave') updateData.sickLeave = Math.max(0, balance.sickLeave - days);
          else if (existing.type === 'Earned Leave') updateData.earnedLeave = Math.max(0, balance.earnedLeave - days);
          else if (existing.type === 'Emergency Leave') updateData.emergencyLeave = Math.max(0, balance.emergencyLeave - days);
          else if (existing.type === 'Unpaid Leave') updateData.unpaidLeave = balance.unpaidLeave + days;

          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: updateData
          });
        }
      }

      return leave;
    });

    // Notify applicant
    await emitNotification({
      type: 'LEAVE_STATUS_UPDATED',
      title: `Leave Application ${status}`,
      message: `Your leave request for ${existing.startDate} to ${existing.endDate} has been ${status.toLowerCase()} by ${req.user?.name || 'Management'}.${remarks ? ` Remarks: ${remarks}` : ''}`,
      recipientRole: 'Team Member',
      recipientEmail: existing.employeeId || undefined,
      actionUrl: '/dashboard'
    });

    res.json({
      message: `Leave application marked as ${status}.`,
      leave: updated
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/leaves/:id/cancel (Applicant cancels pending leave)
router.post('/:id/cancel', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.leaveRequest.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ error: 'Leave application not found.' });
      return;
    }

    const isDirectorOrHr =
      req.user?.role === 'Super Admin' ||
      req.user?.role === 'HR Manager' ||
      req.user?.email?.includes('director') ||
      req.user?.email?.includes('hr');

    const isOwner =
      (req.user?.employeeId && existing.employeeId === req.user.employeeId) ||
      (req.user?.id && existing.employeeId === req.user.id) ||
      (req.user?.name && existing.employeeName.toLowerCase() === req.user.name.toLowerCase());

    if (!isDirectorOrHr && !isOwner) {
      res.status(403).json({ error: 'Access denied: You can only cancel your own leave requests.' });
      return;
    }

    if (existing.status !== 'Pending') {
      res.status(400).json({ error: `Only pending leave applications can be cancelled. Current status is ${existing.status}.` });
      return;
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: { status: 'Cancelled' }
    });

    res.json({
      message: 'Leave application cancelled successfully.',
      leave: updated
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Backward-compatible PUT /:id/status
router.put('/:id/status', authenticateToken, requireRole(['Super Admin', 'Project Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'Rejected' ? remarks : null,
        approvedBy: req.user?.name || 'Managing Director'
      }
    });
    res.json({ message: `Leave status updated to ${status}.`, leave: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
