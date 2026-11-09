import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { IntegrationService } from '../services/integration.service';
import { logAuditSecurityEntry } from '../services/security.service';
import { emitNotification } from '../services/notification.service';

const router = Router();

// GET /api/v1/emails (List enterprise emails)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, filterType, search } = req.query as Record<string, string>;

    const where: any = {};
    if (category && category !== 'All') where.category = category;
    if (filterType === 'unread') where.isUnread = true;
    if (filterType === 'starred') where.isStarred = true;

    if (search) {
      where.OR = [
        { subject: { contains: search } },
        { sender: { contains: search } },
        { senderEmail: { contains: search } },
        { body: { contains: search } }
      ];
    }

    const emails = await prisma.enterpriseEmail.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const parsed = emails.map(e => ({
      ...e,
      attachments: e.attachmentsJson ? JSON.parse(e.attachmentsJson) : []
    }));

    res.json({ emails: parsed });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/emails/:id (Get single email)
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const email = await prisma.enterpriseEmail.findUnique({
      where: { id: req.params.id }
    });

    if (!email) {
      res.status(404).json({ error: 'Email not found.' });
      return;
    }

    // Auto mark as read on view
    if (email.isUnread) {
      await prisma.enterpriseEmail.update({
        where: { id: req.params.id },
        data: { isUnread: false }
      });
      email.isUnread = false;
    }

    res.json({
      email: {
        ...email,
        attachments: email.attachmentsJson ? JSON.parse(email.attachmentsJson) : []
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/emails (Send/Compose new email)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      recipient,
      recipientEmail,
      subject,
      body,
      category = 'Clients & Sales',
      attachments = [],
      securityLevel = 'General Operations'
    } = req.body;

    if (!recipientEmail || !subject || !body) {
      res.status(400).json({ error: 'Recipient email, subject, and body are required.' });
      return;
    }

    const senderName = req.user?.name || 'Rohit Pawar (Managing Director)';
    const senderEmail = req.user?.email || 'director@enterprenex.solutions';
    const snippet = body.substring(0, 120).replace(/\n/g, ' ') + '...';
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newEmail = await prisma.enterpriseEmail.create({
      data: {
        sender: senderName,
        senderEmail,
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        recipient: recipient || recipientEmail.split('@')[0],
        recipientEmail,
        subject,
        snippet,
        body,
        timestamp,
        date: 'Today',
        category,
        isUnread: false,
        isStarred: false,
        attachmentsJson: JSON.stringify(attachments),
        securityLevel
      }
    });

    // Attempt real email dispatch via IntegrationService (Nodemailer)
    try {
      await IntegrationService.sendEmail({
        to: recipientEmail,
        subject,
        template: 'TICKET_STATUS',
        data: {
          title: subject,
          ticketNumber: 'COMM-' + Date.now().toString().slice(-4),
          category,
          requester: senderName
        }
      });
    } catch (err) {
      console.warn('[EMAIL DISPATCH DEFERRED - SMTP]:', err);
    }

    // ISO 27001 Audit Entry
    await logAuditSecurityEntry({
      action: 'EMAIL_DISPATCHED',
      category: 'Internal & Client Communications',
      details: `Sent email "${subject}" to ${recipientEmail} (${category})`,
      actor: senderName
    });

    // Real-Time Notification
    await emitNotification({
      type: 'EMAIL_SENT',
      title: `Email Dispatched: ${subject}`,
      message: `Sent to ${recipientEmail} by ${senderName}`,
      actionUrl: '/admin/emails'
    });

    res.status(201).json({
      message: 'Email dispatched successfully.',
      email: {
        ...newEmail,
        attachments
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/emails/:id (Toggle star, unread status, or category)
router.patch('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isUnread, isStarred, category } = req.body;

    const data: any = {};
    if (isUnread !== undefined) data.isUnread = Boolean(isUnread);
    if (isStarred !== undefined) data.isStarred = Boolean(isStarred);
    if (category !== undefined) data.category = category;

    const updated = await prisma.enterpriseEmail.update({
      where: { id },
      data
    });

    res.json({
      message: 'Email updated successfully.',
      email: {
        ...updated,
        attachments: updated.attachmentsJson ? JSON.parse(updated.attachmentsJson) : []
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/emails/:id (Delete email)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.enterpriseEmail.delete({ where: { id } });
    res.json({ message: 'Email deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
