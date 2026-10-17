import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { logAuditSecurityEntry } from '../services/security.service';

const router = Router();

// GET /api/meetings - Fetch all scheduled corporate meetings
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let meetings = await prisma.scheduledMeeting.findMany({
      orderBy: { meetingTime: 'asc' }
    });

    // If empty, auto-seed the official upcoming team-wide meeting
    if (meetings.length === 0) {
      const tomorrow7PM = new Date();
      tomorrow7PM.setDate(tomorrow7PM.getDate() + 1);
      tomorrow7PM.setHours(19, 0, 0, 0); // 7:00 PM

      const defaultMeeting = await prisma.scheduledMeeting.create({
        data: {
          title: 'Enterprenex Team-Wide All-Hands & SDLC Governance Review',
          agenda: 'Review SDLC architectural documentation, strict RBAC compliance, anti-tamper time-tracking protocols, and Oct 25 onboarding readiness with PM (Jyoti).',
          meetUrl: 'https://meet.google.com/enx-edwm-all',
          meetingTime: tomorrow7PM.toISOString(),
          durationMinutes: 60,
          organizer: 'Rohit Pawar (Managing Director)',
          department: 'All Hands',
          attendeesJson: JSON.stringify(['Engineering Squad', 'Jyoti (Project Manager)', 'HR Operations', 'Design Team']),
          status: 'Scheduled'
        }
      });
      meetings = [defaultMeeting];
    }

    const formatted = meetings.map(m => ({
      ...m,
      attendees: m.attendeesJson ? JSON.parse(m.attendeesJson) : []
    }));

    res.json({ meetings: formatted });
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
