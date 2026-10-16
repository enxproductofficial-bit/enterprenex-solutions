import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/attendance (List records)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isDirectorOrHr = req.user?.role === 'Super Admin' || req.user?.role === 'Project Manager' || req.user?.email?.includes('director');
    
    let records;
    if (isDirectorOrHr) {
      records = await prisma.attendanceRecord.findMany({
        orderBy: { date: 'desc' }
      });
    } else {
      // Regular employees only see their own attendance history
      records = await prisma.attendanceRecord.findMany({
        where: {
          OR: [
            { employeeId: req.user?.id },
            { employeeName: { contains: req.user?.name || '' } }
          ]
        },
        orderBy: { date: 'desc' }
      });
    }

    res.json({ attendance: records });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/attendance/punch (Check in or check out)
router.post('/punch', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status = 'Present' } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const userId = req.user?.id || 'unknown';
    const userName = req.user?.name || 'Staff Member';

    // Check if entry already exists for today
    const existing = await prisma.attendanceRecord.findFirst({
      where: {
        date: today,
        OR: [
          { employeeId: userId },
          { employeeName: userName }
        ]
      }
    });

    if (existing) {
      if (!existing.checkOut || existing.checkOut === '-') {
        // Punch out
        const updated = await prisma.attendanceRecord.update({
          where: { id: existing.id },
          data: { 
            checkOut: timeStr,
            status: status !== 'Present' ? status : existing.status
          }
        });
        res.json({ message: `Check-out recorded at ${timeStr}.`, record: updated });
        return;
      } else {
        res.status(400).json({ error: 'You have already checked in and out for today.' });
        return;
      }
    }

    // New Check-in
    const record = await prisma.attendanceRecord.create({
      data: {
        employeeId: userId,
        employeeName: userName,
        date: today,
        checkIn: timeStr,
        checkOut: '-',
        status
      }
    });

    res.status(201).json({ message: `Check-in recorded at ${timeStr}.`, record });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/attendance/:id/absence-note (RBAC: Record unexcused absence note and outreach details)
router.put('/:id/absence-note', authenticateToken, requireRole(['Super Admin', 'Project Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { absenceReason, absenceNotes, notifiedVia } = req.body;

    const record = await prisma.attendanceRecord.update({
      where: { id },
      data: {
        absenceReason,
        absenceNotes,
        notifiedViaJson: notifiedVia ? JSON.stringify(notifiedVia) : undefined,
        recordedBy: req.user?.name || 'Managing Director',
        recordedAt: new Date()
      }
    });

    res.json({
      message: 'Absence incident note logged successfully.',
      record
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
