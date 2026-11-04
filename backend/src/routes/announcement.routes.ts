import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { emitNotification } from '../services/notification.service';

const router = Router();

// GET /api/v1/announcements (List announcements visible to current user)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isDirectorOrAdmin = req.user?.role === 'Super Admin' || req.user?.role === 'Project Manager' || req.user?.email?.includes('director');
    const userDept = req.user?.department || '';
    const userId = req.user?.id || '';

    const announcements = await prisma.companyAnnouncement.findMany({
      where: { isArchived: false },
      orderBy: { publishedAt: 'desc' }
    });

    const filtered = announcements.filter(a => {
      if (isDirectorOrAdmin) return true;
      if (a.targetAudience === 'All Employees') return true;
      if (a.targetAudience === 'Specific Department' && a.targetDepartment === userDept) return true;
      if (a.targetAudience === 'Selected Employees' && a.targetEmployeesJson) {
        try {
          const list = JSON.parse(a.targetEmployeesJson);
          return Array.isArray(list) && list.includes(userId);
        } catch {
          return false;
        }
      }
      return false;
    });

    const parsed = filtered.map(a => {
      const readList = a.readByJson ? JSON.parse(a.readByJson) : [];
      const ackList = a.acknowledgedByJson ? JSON.parse(a.acknowledgedByJson) : [];
      return {
        ...a,
        readBy: readList,
        acknowledgedBy: ackList,
        hasRead: readList.includes(userId),
        hasAcknowledged: ackList.includes(userId)
      };
    });

    res.json({ announcements: parsed });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/announcements (Create announcement)
router.post('/', authenticateToken, requireRole(['Super Admin', 'Project Manager', 'HR Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      content,
      targetAudience = 'All Employees',
      targetDepartment,
      targetTeam,
      targetEmployees = [],
      isScheduled = false,
      scheduledFor,
      attachments = []
    } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required.' });
      return;
    }

    const announcement = await prisma.companyAnnouncement.create({
      data: {
        title,
        content,
        targetAudience,
        targetDepartment: targetDepartment || null,
        targetTeam: targetTeam || null,
        targetEmployeesJson: JSON.stringify(targetEmployees),
        attachmentsJson: JSON.stringify(attachments),
        author: req.user?.name || 'Executive Director',
        authorRole: req.user?.role || 'Director',
        isScheduled,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        publishedAt: isScheduled && scheduledFor ? new Date(scheduledFor) : new Date(),
        readByJson: '[]',
        acknowledgedByJson: '[]'
      }
    });

    // Broadcast real-time announcement notification
    await emitNotification({
      type: 'COMPANY_ANNOUNCEMENT',
      title: `📢 Announcement: ${title}`,
      message: `${content.substring(0, 120)}...`,
      actionUrl: '/dashboard'
    });

    res.status(201).json({
      message: 'Announcement published successfully.',
      announcement
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/announcements/:id/read (Mark as read)
router.post('/:id/read', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'unknown';

    const existing = await prisma.companyAnnouncement.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Announcement not found.' });
      return;
    }

    const readList: string[] = existing.readByJson ? JSON.parse(existing.readByJson) : [];
    if (!readList.includes(userId)) {
      readList.push(userId);
      await prisma.companyAnnouncement.update({
        where: { id },
        data: { readByJson: JSON.stringify(readList) }
      });
    }

    res.json({ message: 'Marked as read.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/announcements/:id/acknowledge (Employee acknowledges policy/update)
router.post('/:id/acknowledge', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'unknown';

    const existing = await prisma.companyAnnouncement.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Announcement not found.' });
      return;
    }

    const ackList: string[] = existing.acknowledgedByJson ? JSON.parse(existing.acknowledgedByJson) : [];
    if (!ackList.includes(userId)) {
      ackList.push(userId);
      await prisma.companyAnnouncement.update({
        where: { id },
        data: { acknowledgedByJson: JSON.stringify(ackList) }
      });
    }

    res.json({ message: 'Policy acknowledged successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

