import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { createNotification } from '../services/notification.service';
import { emitRealtimeNotification } from '../services/socket.service';

const router = Router();

// Module mapping helper
export function getNotificationModule(type: string, actionUrl?: string | null): string {
  const t = (type || '').toUpperCase();
  const url = (actionUrl || '').toLowerCase();

  if (t.includes('OFFER') || url.includes('offer')) return 'Offer Letters';
  if (t.includes('TASK') || url.includes('task')) return 'Tasks';
  if (t.includes('TICKET') || url.includes('support')) return 'Support Desk';
  if (t.includes('INVOICE') || t.includes('EXPENSE') || t.includes('PAYROLL') || url.includes('finance')) return 'Finance';
  if (t.includes('LEAD') || t.includes('CRM') || url.includes('crm')) return 'Enterprise CRM';
  if (t.includes('EMPLOYEE') || t.includes('LEAVE') || t.includes('ATTENDANCE') || t.includes('RESIGNATION') || t.includes('EXIT') || url.includes('team')) return 'Personnel & HR';
  if (t.includes('EMAIL') || t.includes('COMMUNICATION') || url.includes('email')) return 'Communications';
  if (t.includes('DOCUMENT') || t.includes('VAULT') || url.includes('document')) return 'Compliance Vault';
  if (t.includes('MEETING') || url.includes('calendar')) return 'Corporate Calendar';
  if (t.includes('ANNOUNCEMENT') || t.includes('SYSTEM') || t.includes('SECURITY')) return 'System Alerts';
  return 'System Alerts';
}

// Build query conditions based on role & identity
function buildNotificationFilter(user: any) {
  const role = (user?.role || '').toLowerCase();
  const email = (user?.email || '').toLowerCase();
  const dept = (user?.department || '').toLowerCase();

  const isDirector =
    role.includes('admin') ||
    role.includes('director') ||
    role.includes('cmd') ||
    role.includes('ceo') ||
    email.includes('director');

  const isManager =
    role.includes('manager') ||
    role.includes('lead') ||
    role.includes('scrum') ||
    email.includes('manager');

  const isHr =
    role.includes('hr') ||
    dept.includes('human resources') ||
    dept.includes('hr') ||
    email.includes('hr');

  const orConditions: any[] = [];

  // Direct recipient matches
  if (user?.email) {
    orConditions.push({ recipientEmail: user.email });
    orConditions.push({ recipientEmail: user.email.toLowerCase() });
  }
  if (user?.employeeId) {
    orConditions.push({ recipientEmployeeId: user.employeeId });
  }

  // Universal broadcasts
  orConditions.push({ recipientRole: null });
  orConditions.push({ recipientRole: 'ALL' });
  orConditions.push({ recipientRole: 'All' });

  // Role-targeted alerts
  if (isDirector) {
    orConditions.push({ recipientRole: 'Super Admin' });
    orConditions.push({ recipientRole: 'Director / CEO' });
    orConditions.push({ recipientRole: 'Director' });
    orConditions.push({ recipientRole: 'Leadership' });
  }

  if (isManager) {
    orConditions.push({ recipientRole: 'Project Manager' });
    orConditions.push({ recipientRole: 'Manager' });
    orConditions.push({ recipientRole: 'Management' });
  }

  if (isHr) {
    orConditions.push({ recipientRole: 'HR Manager' });
    orConditions.push({ recipientRole: 'HR' });
    orConditions.push({ recipientRole: 'Human Resources' });
  }

  // Standard employee alerts
  orConditions.push({ recipientRole: 'Employee' });
  orConditions.push({ recipientRole: 'Team Member' });
  orConditions.push({ recipientRole: 'Developer' });

  return { orConditions, isDirector, isManager, isHr };
}

// Auto-sync missing alerts from active database records to prevent desynchronization
async function syncActiveSystemAlerts() {
  try {
    // 1. Pending Offer Letters
    const pendingOffers = await prisma.offerLetter.findMany({
      where: { status: 'Pending Approval' }
    });
    for (const offer of pendingOffers) {
      const existing = await prisma.ewmsNotification.findFirst({
        where: {
          type: 'OFFER_PENDING_APPROVAL',
          title: { contains: offer.offerLetterNo }
        }
      });
      if (!existing) {
        await prisma.ewmsNotification.create({
          data: {
            type: 'OFFER_PENDING_APPROVAL',
            title: `Offer Letter Pending Approval: ${offer.offerLetterNo}`,
            message: `Offer letter ${offer.offerLetterNo} for ${offer.employeeName} (${offer.designation}) is awaiting Director review.`,
            recipientRole: 'Super Admin',
            actionUrl: '/admin/offer-letters',
            read: false
          }
        });
      }
    }

    // 2. Open Support Tickets
    const openTickets = await prisma.supportTicket.findMany({
      where: { status: 'Open' },
      take: 5
    });
    for (const tkt of openTickets) {
      const existing = await prisma.ewmsNotification.findFirst({
        where: {
          type: 'TICKET_RAISED',
          title: { contains: tkt.ticketNumber }
        }
      });
      if (!existing) {
        await prisma.ewmsNotification.create({
          data: {
            type: 'TICKET_RAISED',
            title: `Support Ticket Pending: ${tkt.ticketNumber}`,
            message: `Ticket ${tkt.ticketNumber} (${tkt.category}: "${tkt.title}") requires service desk resolution. Priority: ${tkt.priority}.`,
            recipientRole: 'Super Admin',
            actionUrl: '/admin/support',
            read: false
          }
        });
      }
    }

    // 3. Tasks Under Review
    const reviewTasks = await prisma.task.findMany({
      where: { status: 'Under Review' },
      take: 5
    });
    for (const task of reviewTasks) {
      const existing = await prisma.ewmsNotification.findFirst({
        where: {
          type: 'TASK_SUBMITTED',
          title: { contains: task.title }
        }
      });
      if (!existing) {
        await prisma.ewmsNotification.create({
          data: {
            type: 'TASK_SUBMITTED',
            title: `Task Review Submitted: ${task.title}`,
            message: `${task.assignedTo} has submitted work on "${task.title}". Approval is pending.`,
            recipientRole: 'Super Admin',
            actionUrl: '/admin/tasks',
            read: false
          }
        });
      }
    }
  } catch (err) {
    console.warn('[NotificationSync] Warning during active alert sync:', err);
  }
}

// GET /api/notifications (Fetch live notifications for the logged-in user / role)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Run active alerts sync safely in the background
    await syncActiveSystemAlerts();

    const { orConditions } = buildNotificationFilter(user);

    const rawNotifications = await prisma.ewmsNotification.findMany({
      where: orConditions.length > 0 ? { OR: orConditions } : {},
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Decorate notifications with module metadata
    const notifications = rawNotifications.map(n => ({
      ...n,
      module: getNotificationModule(n.type, n.actionUrl)
    }));

    const unreadCount = notifications.filter(n => !n.read).length;

    // Module-specific unread counts
    const moduleCounts: Record<string, number> = {};
    for (const n of notifications) {
      if (!n.read) {
        const m = n.module || 'System Alerts';
        moduleCounts[m] = (moduleCounts[m] || 0) + 1;
      }
    }

    res.json({
      notifications,
      unreadCount,
      moduleCounts
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications (Create / broadcast a new notification)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, title, message, recipientRole, recipientEmail, recipientEmployeeId, actionUrl } = req.body;

    if (!type || !title || !message) {
      res.status(400).json({ error: 'Type, title, and message are required.' });
      return;
    }

    const notif = await createNotification({
      type,
      title,
      message,
      recipientRole,
      recipientEmail,
      recipientEmployeeId,
      actionUrl
    });

    res.status(201).json({ notification: notif });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/:id/read (Mark a single notification as read)
router.put('/:id/read', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await prisma.ewmsNotification.update({
      where: { id },
      data: { read: true }
    });

    // Notify any active socket sessions that this notification was read
    try {
      emitRealtimeNotification({ ...updated, read: true });
    } catch (e) {
      // non-blocking
    }

    res.json({ notification: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/read-all (Mark all visible notifications as read)
router.put('/read-all', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { orConditions } = buildNotificationFilter(user);

    await prisma.ewmsNotification.updateMany({
      where: orConditions.length > 0 ? { OR: orConditions } : {},
      data: { read: true }
    });

    res.json({ message: 'All notifications marked as read', success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
