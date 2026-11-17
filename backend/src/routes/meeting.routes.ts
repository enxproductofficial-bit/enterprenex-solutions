import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { logAuditSecurityEntry } from '../services/security.service';

const router = Router();

// GET /api/meetings - Fetch scheduled corporate meetings with attendee access restriction
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const userRole = user.role || '';
    const userEmail = (user.email || '').toLowerCase();
    const userName = (user.name || '').toLowerCase();
    const userEmpId = (user.employeeId || '').toLowerCase();
    const userDept = (user.department || '').toLowerCase();

    const isDirectorOrManager =
      userRole === 'Super Admin' ||
      userRole.includes('Director') ||
      userRole === 'Project Manager' ||
      userRole.includes('Manager') ||
      userEmail.includes('director') ||
      userEmail.includes('manager');

    const meetings = await prisma.scheduledMeeting.findMany({
      orderBy: { meetingTime: 'asc' }
    });

    const formatted = meetings.map(m => {
      let attendees: string[] = [];
      try {
        attendees = m.attendeesJson ? JSON.parse(m.attendeesJson) : [];
      } catch {
        attendees = [];
      }

      let rsvp: Record<string, string> = {};
      try {
        rsvp = m.rsvpJson ? JSON.parse(m.rsvpJson) : {};
      } catch {
        rsvp = {};
      }

      let actionItems: any[] = [];
      try {
        actionItems = m.actionItemsJson ? JSON.parse(m.actionItemsJson) : [];
      } catch {
        actionItems = [];
      }

      return {
        ...m,
        attendees,
        rsvp,
        actionItems
      };
    });

    // Enforce attendee boundary: Non-managers only see meetings where they are invited, or company-wide / departmental meetings
    const filteredMeetings = isDirectorOrManager
      ? formatted
      : formatted.filter(m => {
          const isOrganizer = m.organizer?.toLowerCase() === userName;
          const isDeptMeeting = m.department && m.department.toLowerCase() === userDept;
          const isInvited = m.attendees.some(att => {
            const a = String(att).toLowerCase();
            return (
              a.includes('all') ||
              a.includes('everyone') ||
              a.includes(userName) ||
              a.includes(userEmail) ||
              (userEmpId && a.includes(userEmpId))
            );
          });
          return isOrganizer || isInvited || isDeptMeeting;
        });

    res.json({ meetings: filteredMeetings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/meetings/:id/rsvp - Submit participant RSVP (validated against attendee list)
router.patch('/:id/rsvp', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { id } = req.params;
    const { status = 'Accepted' } = req.body;
    const userName = user.name || 'Staff Member';
    const userEmail = (user.email || '').toLowerCase();

    const existing = await prisma.scheduledMeeting.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Meeting not found.' });
      return;
    }

    // Check invitation permission
    const isDirectorOrManager =
      user.role === 'Super Admin' ||
      user.role?.includes('Director') ||
      user.role === 'Project Manager';

    let attendees: string[] = [];
    try {
      attendees = existing.attendeesJson ? JSON.parse(existing.attendeesJson) : [];
    } catch {
      attendees = [];
    }

    const isInvited =
      isDirectorOrManager ||
      existing.organizer?.toLowerCase() === userName.toLowerCase() ||
      attendees.some(att => {
        const a = String(att).toLowerCase();
        return a.includes('all') || a.includes('everyone') || a.includes(userName.toLowerCase()) || a.includes(userEmail);
      });

    if (!isInvited) {
      res.status(403).json({ error: 'Access forbidden: You cannot RSVP to a meeting you were not invited to.' });
      return;
    }

    const rsvpMap: Record<string, string> = existing.rsvpJson ? JSON.parse(existing.rsvpJson) : {};
    rsvpMap[userName] = status;

    const updated = await prisma.scheduledMeeting.update({
      where: { id },
      data: { rsvpJson: JSON.stringify(rsvpMap) }
    });

    res.json({
      message: `RSVP updated to ${status}.`,
      meeting: {
        ...updated,
        rsvp: rsvpMap
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/meetings/:id/notes - Save meeting notes and action items
router.patch('/:id/notes', authenticateToken, requireRole(['Super Admin', 'Project Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes, actionItems } = req.body;

    const updated = await prisma.scheduledMeeting.update({
      where: { id },
      data: {
        notes: notes || undefined,
        actionItemsJson: actionItems ? JSON.stringify(actionItems) : undefined
      }
    });

    res.json({
      message: 'Meeting notes and action items saved.',
      meeting: updated
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/meetings - Schedule a new corporate meeting (Manager or Director only)
router.post('/', authenticateToken, requireRole(['Super Admin', 'Project Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, agenda, meetUrl, meetingTime, durationMinutes, department, attendees } = req.body;

    if (!title || !meetingTime) {
      res.status(400).json({ error: 'Title and meetingTime are required.' });
      return;
    }

    const meeting = await prisma.scheduledMeeting.create({
      data: {
        title,
        agenda: agenda || 'Sprint coordination and delivery review',
        meetUrl: meetUrl || 'https://meet.google.com/enx-sync-room',
        meetingTime,
        durationMinutes: Number(durationMinutes || 45),
        organizer: req.user?.name || 'Managing Director',
        department: department || 'Engineering',
        attendeesJson: JSON.stringify(attendees || ['All Team Members']),
        status: 'Scheduled'
      }
    });

    await logAuditSecurityEntry({
      action: 'MEETING_SCHEDULED',
      category: 'Corporate Coordination',
      details: `Scheduled meeting "${title}" at ${meetingTime}. Meet link: ${meeting.meetUrl}`,
      actor: req.user?.name || req.user?.email || 'Leader'
    });

    res.status(201).json({
      message: 'Meeting scheduled successfully.',
      meeting
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/meetings/:id - Cancel meeting (Director only)
router.delete('/:id', authenticateToken, requireRole(['Super Admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.scheduledMeeting.delete({ where: { id } });
    res.json({ message: 'Meeting cancelled successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
