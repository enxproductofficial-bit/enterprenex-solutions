import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { emitNotification } from '../services/notification.service';

const router = Router();

// Helper: Calculate working hours between two HH:MM AM/PM strings
function calculateHours(checkIn: string, checkOut: string, breakMinutes: number = 0): number {
  try {
    const parseTime = (t: string) => {
      const parts = t.trim().match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!parts) return null;
      let hours = parseInt(parts[1], 10);
      const minutes = parseInt(parts[2], 10);
      const meridian = parts[3] ? parts[3].toUpperCase() : null;
      if (meridian === 'PM' && hours < 12) hours += 12;
      if (meridian === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const inMins = parseTime(checkIn);
    const outMins = parseTime(checkOut);
    if (inMins === null || outMins === null || outMins <= inMins) return 0;
    const totalWorkingMins = Math.max(0, outMins - inMins - breakMinutes);
    return Math.round((totalWorkingMins / 60) * 10) / 10;
  } catch {
    return 0;
  }
}

// GET /api/v1/attendance (List records with optional filtering)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isDirectorOrHr = req.user?.role === 'Super Admin' || req.user?.role === 'Project Manager' || req.user?.email?.includes('director') || req.user?.role === 'HR Manager';
    const { employeeId, department, date, month } = req.query as Record<string, string>;

    const where: any = {};

    if (!isDirectorOrHr) {
      where.OR = [
        { employeeId: req.user?.id },
        { employeeName: { contains: req.user?.name || '' } }
      ];
    } else {
      if (employeeId) where.employeeId = employeeId;
      if (department) where.department = department;
    }

    if (date) where.date = date;
    if (month) where.date = { startsWith: month }; // format: YYYY-MM

    const records = await prisma.attendanceRecord.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    res.json({ attendance: records });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/attendance/summary (Executive & HR overview stats)
router.get('/summary', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = await prisma.attendanceRecord.findMany({
      where: { date: today }
    });

    const present = todayRecords.filter(r => r.status === 'Present').length;
    const late = todayRecords.filter(r => r.isLate).length;
    const halfDay = todayRecords.filter(r => r.status === 'Half Day').length;
    const onLeave = todayRecords.filter(r => r.status === 'On Leave').length;
    const totalEmployees = await prisma.employee.count({ where: { status: 'Active' } });
    const absent = Math.max(0, totalEmployees - (present + halfDay + onLeave));

    res.json({
      date: today,
      totalEmployees,
      present,
      late,
      halfDay,
      absent,
      onLeave,
      attendanceRate: totalEmployees > 0 ? Math.round(((present + halfDay * 0.5) / totalEmployees) * 100) : 100
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/attendance/check-in
router.post('/check-in', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const userId = req.user?.id || 'unknown';
    const userName = req.user?.name || 'Staff Member';
    const dept = req.user?.department || 'Engineering';

    // Rule: Shift begins at 09:30 AM. Later is marked Late.
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);

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
      res.status(400).json({ error: 'You have already checked in today.', record: existing });
      return;
    }

    const record = await prisma.attendanceRecord.create({
      data: {
        employeeId: userId,
        employeeName: userName,
        department: dept,
        date: today,
        checkIn: timeStr,
        checkOut: '-',
        status: isLate ? 'Late' : 'Present',
        isLate,
        workingHours: 0,
        breakMinutes: 0
      }
    });

    res.status(201).json({
      message: `Check-in recorded at ${timeStr}.${isLate ? ' (Marked as Late Arrival)' : ''}`,
      record
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/attendance/check-out
router.post('/check-out', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { breakMinutes = 0 } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const userId = req.user?.id || 'unknown';
    const userName = req.user?.name || 'Staff Member';

    const existing = await prisma.attendanceRecord.findFirst({
      where: {
        date: today,
        OR: [
          { employeeId: userId },
          { employeeName: userName }
        ]
      }
    });

    if (!existing) {
      res.status(400).json({ error: 'Cannot check out without an active check-in record for today.' });
      return;
    }

    if (existing.checkOut && existing.checkOut !== '-') {
      res.status(400).json({ error: 'Check-out has already been completed for today.', record: existing });
      return;
    }

    const workingHours = calculateHours(existing.checkIn || timeStr, timeStr, breakMinutes);
    // Standard shifts conclude at 18:00 (6:00 PM). Earlier checkout flagged.
    const isEarlyCheckout = now.getHours() < 18;

    const updated = await prisma.attendanceRecord.update({
      where: { id: existing.id },
      data: {
        checkOut: timeStr,
        workingHours,
        breakMinutes,
        isEarlyCheckout,
        status: workingHours < 4 ? 'Half Day' : existing.status
      }
    });

    res.json({
      message: `Check-out recorded at ${timeStr}. Total logged working time: ${workingHours} hrs.`,
      record: updated
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/attendance/:id/correct (HR / Director manual correction with mandatory remarks)
router.patch('/:id/correct', authenticateToken, requireRole(['Super Admin', 'Project Manager', 'HR Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, status, breakMinutes, correctionRemarks } = req.body;

    if (!correctionRemarks || correctionRemarks.trim().length < 5) {
      res.status(400).json({ error: 'A mandatory justification remark (minimum 5 characters) is required for attendance modifications.' });
      return;
    }

    const existing = await prisma.attendanceRecord.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Attendance record not found.' });
      return;
    }

    const workingHours = checkIn && checkOut ? calculateHours(checkIn, checkOut, breakMinutes || existing.breakMinutes || 0) : existing.workingHours;

    const updated = await prisma.attendanceRecord.update({
      where: { id },
      data: {
        checkIn: checkIn || existing.checkIn,
        checkOut: checkOut || existing.checkOut,
        status: status || existing.status,
        breakMinutes: breakMinutes !== undefined ? breakMinutes : existing.breakMinutes,
        workingHours,
        correctionRemarks,
        correctedBy: req.user?.name || 'HR Admin',
        correctedAt: new Date()
      }
    });

    // Notify employee of attendance correction
    await emitNotification({
      type: 'ATTENDANCE_CORRECTED',
      title: 'Attendance Record Corrected',
      message: `Your attendance record for ${updated.date} was updated by ${req.user?.name || 'HR'}: ${correctionRemarks}`,
      recipientRole: 'Team Member',
      recipientEmail: updated.employeeId,
      actionUrl: '/dashboard'
    });

    res.json({
      message: 'Attendance record corrected successfully.',
      record: updated
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Legacy punch alias
router.post('/punch', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const userId = req.user?.id || 'unknown';
    const userName = req.user?.name || 'Staff Member';
    const dept = req.user?.department || 'Engineering';

    const existing = await prisma.attendanceRecord.findFirst({
      where: {
        date: today,
        OR: [{ employeeId: userId }, { employeeName: userName }]
      }
    });

    if (!existing) {
      const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);
      const record = await prisma.attendanceRecord.create({
        data: {
          employeeId: userId,
          employeeName: userName,
          department: dept,
          date: today,
          checkIn: timeStr,
          checkOut: '-',
          status: isLate ? 'Late' : 'Present',
          isLate,
          workingHours: 0,
          breakMinutes: 0
        }
      });
      res.status(201).json({ message: `Check-in recorded at ${timeStr}.`, record });
      return;
    }

    if (existing.checkOut && existing.checkOut !== '-') {
      res.status(400).json({ error: 'You have already checked in and out for today.' });
      return;
    }

    const workingHours = calculateHours(existing.checkIn || timeStr, timeStr, 0);
    const updated = await prisma.attendanceRecord.update({
      where: { id: existing.id },
      data: {
        checkOut: timeStr,
        workingHours,
        status: workingHours < 4 ? 'Half Day' : existing.status
      }
    });

    res.json({ message: `Check-out recorded at ${timeStr}.`, record: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
