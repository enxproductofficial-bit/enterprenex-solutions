"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const security_service_1 = require("../services/security.service");
const integration_service_1 = require("../services/integration.service");
const notification_service_1 = require("../services/notification.service");
const router = (0, express_1.Router)();
// GET /api/tickets - List tickets with strict RBAC visibility
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const isDirectorOrManager = req.user?.role === 'Super Admin' ||
            req.user?.role === 'Director' ||
            req.user?.role === 'Project Manager';
        let tickets;
        if (isDirectorOrManager) {
            tickets = await db_1.prisma.supportTicket.findMany({
                orderBy: { createdAt: 'desc' }
            });
        }
        else {
            // General employees can ONLY view tickets they personally created
            tickets = await db_1.prisma.supportTicket.findMany({
                where: { requestedByEmail: req.user?.email || 'unknown' },
                orderBy: { createdAt: 'desc' }
            });
        }
        res.json({ tickets });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/tickets - Raise a new operational ticket or paid resource request
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { title, description, category, priority, costEstimate } = req.body;
        if (!title || !description || !category) {
            res.status(400).json({ error: 'Title, description, and category are required.' });
            return;
        }
        // Generate sequential ticket number TKT-2026-XXXX
        const count = await db_1.prisma.supportTicket.count();
        const ticketNumber = `TKT-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
        const newTicket = await db_1.prisma.supportTicket.create({
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
        await (0, security_service_1.logAuditSecurityEntry)({
            action: 'TICKET_RAISED',
            category: 'Support & Resource Request',
            details: `Raised ticket ${ticketNumber} (${category}: "${title}") with estimated cost INR ${costEstimate || 0}`,
            actor: req.user?.name || req.user?.email || 'Staff'
        });
        // Notify manager / technical lead
        await integration_service_1.IntegrationService.sendEmail({
            to: process.env.SUPPORT_NOTIFICATION_EMAIL || 'support@enterprenex.solutions',
            subject: `[EDWMS Ticket] New ${category}: ${ticketNumber}`,
            template: 'TICKET_STATUS',
            data: { ticketNumber, title, category, requester: req.user?.name }
        });
        // Broadcast Real-Time System Notification
        await (0, notification_service_1.emitNotification)({
            type: 'TICKET_RAISED',
            title: `Support Ticket Raised: ${ticketNumber}`,
            message: `${req.user?.name || 'Staff'} raised ticket ${ticketNumber} (${category}: "${title}"). Priority: ${priority || 'Medium'}.`,
            recipientRole: 'Super Admin',
            actionUrl: '/admin/support'
        });
        res.status(201).json({
            message: `Support ticket ${ticketNumber} raised successfully.`,
            ticket: newTicket
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PATCH /api/tickets/:id - Update status / approve resource request (Director or Manager only)
router.patch('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['Super Admin', 'Project Manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, responseNotes, assignedTo } = req.body;
        const ticket = await db_1.prisma.supportTicket.findUnique({ where: { id } });
        if (!ticket) {
            res.status(404).json({ error: 'Ticket not found.' });
            return;
        }
        const updated = await db_1.prisma.supportTicket.update({
            where: { id },
            data: {
                status: status || ticket.status,
                responseNotes: responseNotes !== undefined ? responseNotes : ticket.responseNotes,
                assignedTo: assignedTo || ticket.assignedTo,
                resolvedAt: (status === 'Resolved' || status === 'Approved') ? new Date() : ticket.resolvedAt
            }
        });
        // Audit log
        await (0, security_service_1.logAuditSecurityEntry)({
            action: 'TICKET_STATUS_UPDATED',
            category: 'Governance & Operations',
            details: `Ticket ${ticket.ticketNumber} transitioned to ${status}. Notes: "${responseNotes || 'None'}"`,
            actor: req.user?.name || req.user?.email || 'Manager'
        });
        // Notify requester
        if (ticket.requestedByEmail) {
            await integration_service_1.IntegrationService.sendEmail({
                to: ticket.requestedByEmail,
                subject: `Update on your ticket ${ticket.ticketNumber}: ${status}`,
                template: 'TICKET_STATUS',
                data: { ticketNumber: ticket.ticketNumber, status, notes: responseNotes }
            });
            await (0, notification_service_1.emitNotification)({
                type: 'TICKET_UPDATED',
                title: `Ticket ${ticket.ticketNumber} Updated: ${status || ticket.status}`,
                message: `Your ticket ${ticket.ticketNumber} is now marked as "${status || ticket.status}". Notes: ${responseNotes || 'None'}.`,
                recipientEmail: ticket.requestedByEmail,
                actionUrl: '/admin/support'
            });
        }
        res.json({
            message: `Ticket ${ticket.ticketNumber} updated successfully.`,
            ticket: updated
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// DELETE /api/tickets/:id - Delete ticket (Director / Super Admin only)
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['Super Admin']), async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.prisma.supportTicket.delete({ where: { id } });
        res.json({ message: 'Ticket deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
