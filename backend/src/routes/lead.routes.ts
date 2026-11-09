import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { emitNotification } from '../services/notification.service';
import { logAuditSecurityEntry } from '../services/security.service';

const router = Router();

// GET /api/v1/leads (List CRM Leads)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, salesperson } = req.query as Record<string, string>;
    const where: any = {};
    if (status) where.status = status;
    if (salesperson) where.assignedSalesperson = salesperson;

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const parsed = leads.map(l => ({
      ...l,
      activities: l.activitiesJson ? JSON.parse(l.activitiesJson) : []
    }));

    res.json({ leads: parsed });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/leads/:id (Get single lead)
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id }
    });

    if (!lead) {
      res.status(404).json({ error: 'Lead not found.' });
      return;
    }

    res.json({
      lead: {
        ...lead,
        activities: lead.activitiesJson ? JSON.parse(lead.activitiesJson) : []
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/leads (Create new lead)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      company,
      email,
      phone,
      source = 'Website Form',
      status = 'New Lead',
      estimatedValue = 0,
      serviceInterested,
      assignedSalesperson,
      probability = 20,
      nextFollowUpDate,
      notes = '',
      activities = []
    } = req.body;

    if (!name || !company || !serviceInterested) {
      res.status(400).json({ error: 'Name, company, and serviceInterested are required.' });
      return;
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        company,
        email: email || '',
        phone: phone || '',
        source,
        status,
        estimatedValue: Number(estimatedValue) || 0,
        serviceInterested,
        assignedSalesperson: assignedSalesperson || req.user?.name || 'Rohit Pawar',
        probability: Number(probability) || 20,
        nextFollowUpDate: nextFollowUpDate || null,
        notes,
        activitiesJson: JSON.stringify(activities)
      }
    });

    // ISO 27001 Audit Entry
    await logAuditSecurityEntry({
      action: 'CRM_LEAD_CREATED',
      category: 'Sales & Client CRM',
      details: `Created lead for ${name} (${company}) with estimated value ₹${estimatedValue}`,
      actor: req.user?.name || 'Staff'
    });

    // Real-Time Notification
    await emitNotification({
      type: 'LEAD_CREATED',
      title: `New Lead: ${name} (${company})`,
      message: `New prospect interested in ${serviceInterested}. Value: ₹${Number(estimatedValue).toLocaleString('en-IN')}`,
      recipientRole: 'Super Admin',
      actionUrl: '/admin/crm-leads'
    });

    res.status(201).json({
      message: 'Lead created successfully.',
      lead: {
        ...lead,
        activities
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/leads/:id (Update lead details / status)
router.patch('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      company,
      email,
      phone,
      source,
      status,
      estimatedValue,
      serviceInterested,
      assignedSalesperson,
      probability,
      nextFollowUpDate,
      notes,
      activities
    } = req.body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (company !== undefined) data.company = company;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (source !== undefined) data.source = source;
    if (status !== undefined) data.status = status;
    if (estimatedValue !== undefined) data.estimatedValue = Number(estimatedValue);
    if (serviceInterested !== undefined) data.serviceInterested = serviceInterested;
    if (assignedSalesperson !== undefined) data.assignedSalesperson = assignedSalesperson;
    if (probability !== undefined) data.probability = Number(probability);
    if (nextFollowUpDate !== undefined) data.nextFollowUpDate = nextFollowUpDate;
    if (notes !== undefined) data.notes = notes;
    if (activities !== undefined) data.activitiesJson = JSON.stringify(activities);

    const updated = await prisma.lead.update({
      where: { id },
      data
    });

    res.json({
      message: 'Lead updated successfully.',
      lead: {
        ...updated,
        activities: updated.activitiesJson ? JSON.parse(updated.activitiesJson) : []
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/leads/:id/activity (Add an activity entry)
router.post('/:id/activity', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { type = 'Note', summary } = req.body;

    if (!summary) {
      res.status(400).json({ error: 'Activity summary is required.' });
      return;
    }

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      res.status(404).json({ error: 'Lead not found.' });
      return;
    }

    const currentActivities = lead.activitiesJson ? JSON.parse(lead.activitiesJson) : [];
    const newActivity = {
      id: 'act-' + Date.now(),
      type,
      summary,
      date: new Date().toISOString().split('T')[0],
      author: req.user?.name || 'Sales Staff'
    };
    currentActivities.unshift(newActivity);

    const updated = await prisma.lead.update({
      where: { id },
      data: { activitiesJson: JSON.stringify(currentActivities) }
    });

    res.json({
      message: 'Activity logged.',
      activity: newActivity,
      lead: {
        ...updated,
        activities: currentActivities
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/leads/:id (Delete lead)
router.delete('/:id', authenticateToken, requireRole(['Super Admin', 'Project Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.lead.delete({ where: { id } });
    res.json({ message: 'Lead deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

