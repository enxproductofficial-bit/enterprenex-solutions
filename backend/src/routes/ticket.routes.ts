import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { logAuditSecurityEntry } from '../services/security.service';
import { IntegrationService } from '../services/integration.service';

const router = Router();

// GET /api/tickets - List tickets with strict RBAC visibility
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isDirectorOrManager =
      req.user?.role === 'Super Admin' ||
      req.user?.role === 'Project Manager' ||
      req.user?.email?.includes('director');

    let tickets;
    if (isDirectorOrManager) {
      tickets = await prisma.supportTicket.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // General employees can ONLY view tickets they personally created
      tickets = await prisma.supportTicket.findMany({
        where: { requestedByEmail: req.user?.email || 'unknown' },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json({ tickets });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tickets - Raise a new operational ticket or paid resource request
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, priority, costEstimate } = req.body;

    if (!title || !description || !category) {
      res.status(400).json({ error: 'Title, description, and category are required.' });
      return;
    }

    // Generate sequential ticket number TKT-2026-XXXX
    const count = await prisma.supportTicket.count();
    const ticketNumber = `TKT-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const newTicket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        title,
        description,
        category,
        priority: priority || 'Medium',
        status: 'Open',
        requestedBy: req.user?.name || req.user?.email || 'Employee',
        requestedByEmail: req.user?.email || '',
        costEstimate: Number(costEstimate || 0)
      }
    });

    // ISO 27001 Audit Entry
    await logAuditSecurityEntry({
      action: 'TICKET_RAISED',
      category: 'Support & Resource Request',
      details: `Raised ticket ${ticketNumber} (${category}: "${title}") with estimated cost INR ${costEstimate || 0}`,
      actor: req.user?.name || req.user?.email || 'Staff'
    });

    // Notify manager / technical lead
    await IntegrationService.sendEmail({
      to: 'director@enterprenex.solutions',
      subject: `[EDWMS Ticket] New ${category}: ${ticketNumber}`,
      template: 'TICKET_STATUS',
      data: { ticketNumber, title, category, requester: req.user?.name }
    });

    res.status(201).json({
      message: `Support ticket ${ticketNumber} raised successfully.`,
      ticket: newTicket
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/tickets/:id - Update status / approve resource request (Director or Manager only)
router.patch('/:id', authenticateToken, requireRole(['Super Admin', 'Project Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, responseNotes, assignedTo } = req.body;

    const ticket = await prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found.' });
      return;
    }

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: {
        status: status || ticket.status,
        responseNotes: responseNotes !== undefined ? responseNotes : ticket.responseNotes,
        assignedTo: assignedTo || ticket.assignedTo,
        resolvedAt: (status === 'Resolved' || status === 'Approved') ? new Date() : ticket.resolvedAt
      }
    });

    // Audit log
    await logAuditSecurityEntry({
      action: 'TICKET_STATUS_UPDATED',
      category: 'Governance & Operations',
      details: `Ticket ${ticket.ticketNumber} transitioned to ${status}. Notes: "${responseNotes || 'None'}"`,
      actor: req.user?.name || req.user?.email || 'Manager'
    });

    // Notify requester
    if (ticket.requestedByEmail) {
      await IntegrationService.sendEmail({
        to: ticket.requestedByEmail,
        subject: `Update on your ticket ${ticket.ticketNumber}: ${status}`,
        template: 'TICKET_STATUS',
        data: { ticketNumber: ticket.ticketNumber, status, notes: responseNotes }
      });
    }

    res.json({
      message: `Ticket ${ticket.ticketNumber} updated successfully.`,
      ticket: updated
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tickets/:id - Delete ticket (Director / Super Admin only)
router.delete('/:id', authenticateToken, requireRole(['Super Admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.supportTicket.delete({ where: { id } });
    res.json({ message: 'Ticket deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
