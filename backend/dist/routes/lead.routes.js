"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const notification_service_1 = require("../services/notification.service");
const security_service_1 = require("../services/security.service");
const router = (0, express_1.Router)();
// GET /api/v1/leads (List CRM Leads with RBAC boundaries)
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const isDirectorOrManager = req.user?.role === 'Super Admin' ||
            req.user?.role === 'Director' ||
            req.user?.role === 'Project Manager' ||
            req.user?.role === 'Sales Lead';
        const { status, salesperson } = req.query;
        const where = {};
        if (status)
            where.status = status;
        if (salesperson)
            where.assignedSalesperson = salesperson;
        if (!isDirectorOrManager) {
            where.OR = [
                { assignedSalesperson: req.user?.name || '__none__' },
                { assignedSalesperson: req.user?.email || '__none__' }
            ];
        }
        const leads = await db_1.prisma.lead.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        const parsed = leads.map(l => ({
            ...l,
            activities: l.activitiesJson ? JSON.parse(l.activitiesJson) : []
        }));
        res.json({ leads: parsed });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/v1/leads/:id (Get single lead)
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const lead = await db_1.prisma.lead.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/v1/leads (Create new lead)
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { name, company, email, phone, source = 'Website Form', status = 'New Lead', estimatedValue = 0, serviceInterested, assignedSalesperson, probability = 20, nextFollowUpDate, notes = '', activities = [] } = req.body;
        if (!name || !company || !serviceInterested) {
            res.status(400).json({ error: 'Name, company, and serviceInterested are required.' });
            return;
        }
        const lead = await db_1.prisma.lead.create({
            data: {
                name,
                company,
                email: email || '',
                phone: phone || '',
                source,
                status,
                estimatedValue: Number(estimatedValue) || 0,
                serviceInterested,
                assignedSalesperson: assignedSalesperson || req.user?.name || 'Managing Director',
                probability: Number(probability) || 20,
                nextFollowUpDate: nextFollowUpDate || null,
                notes,
                activitiesJson: JSON.stringify(activities)
            }
        });
        // ISO 27001 Audit Entry
        await (0, security_service_1.logAuditSecurityEntry)({
            action: 'CRM_LEAD_CREATED',
            category: 'Sales & Client CRM',
            details: `Created lead for ${name} (${company}) with estimated value ₹${estimatedValue}`,
            actor: req.user?.name || 'Staff'
        });
        // Real-Time Notification
        await (0, notification_service_1.emitNotification)({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PATCH /api/v1/leads/:id (Update lead details / status with ownership check)
router.patch('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await db_1.prisma.lead.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'Lead not found.' });
            return;
        }
        const isDirectorOrManager = req.user?.role === 'Super Admin' ||
            req.user?.role === 'Director' ||
            req.user?.role === 'Project Manager' ||
            req.user?.role === 'Sales Lead';
        const isAssigned = existing.assignedSalesperson?.toLowerCase() === req.user?.name?.toLowerCase() ||
            existing.assignedSalesperson?.toLowerCase() === req.user?.email?.toLowerCase();
        if (!isDirectorOrManager && !isAssigned) {
            res.status(403).json({ error: 'Access forbidden: You can only modify leads assigned to you.' });
            return;
        }
        const { name, company, email, phone, source, status, estimatedValue, serviceInterested, assignedSalesperson, probability, nextFollowUpDate, notes, activities } = req.body;
        const data = {};
        if (name !== undefined)
            data.name = name;
        if (company !== undefined)
            data.company = company;
        if (email !== undefined)
            data.email = email;
        if (phone !== undefined)
            data.phone = phone;
        if (source !== undefined)
            data.source = source;
        if (status !== undefined)
            data.status = status;
        if (estimatedValue !== undefined)
            data.estimatedValue = Number(estimatedValue);
        if (serviceInterested !== undefined)
            data.serviceInterested = serviceInterested;
        if (assignedSalesperson !== undefined)
            data.assignedSalesperson = assignedSalesperson;
        if (probability !== undefined)
            data.probability = Number(probability);
        if (nextFollowUpDate !== undefined)
            data.nextFollowUpDate = nextFollowUpDate;
        if (notes !== undefined)
            data.notes = notes;
        if (activities !== undefined)
            data.activitiesJson = JSON.stringify(activities);
        const updated = await db_1.prisma.lead.update({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/v1/leads/:id/activity (Add an activity entry)
router.post('/:id/activity', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { type = 'Note', summary } = req.body;
        if (!summary) {
            res.status(400).json({ error: 'Activity summary is required.' });
            return;
        }
        const lead = await db_1.prisma.lead.findUnique({ where: { id } });
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
        const updated = await db_1.prisma.lead.update({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// DELETE /api/v1/leads/:id (Delete lead)
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['Super Admin', 'Project Manager']), async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.prisma.lead.delete({ where: { id } });
        res.json({ message: 'Lead deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
