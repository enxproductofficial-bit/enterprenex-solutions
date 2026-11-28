"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const integration_service_1 = require("../services/integration.service");
const security_service_1 = require("../services/security.service");
const notification_service_1 = require("../services/notification.service");
const router = (0, express_1.Router)();
// GET /api/v1/emails (List enterprise emails with strict mailbox isolation)
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { category, filterType, search } = req.query;
        const userRole = req.user?.role || '';
        const userEmail = (req.user?.email || '').toLowerCase();
        const isDirectorOrAdmin = userRole === 'Super Admin' ||
            userRole === 'Director' ||
            userRole === 'Managing Director';
        const where = {};
        if (category && category !== 'All')
            where.category = category;
        if (filterType === 'unread')
            where.isUnread = true;
        if (filterType === 'starred')
            where.isStarred = true;
        // Strict mailbox boundary: regular staff strictly only access their own incoming/outgoing mail
        if (!isDirectorOrAdmin) {
            where.AND = [
                {
                    OR: [
                        { senderEmail: { equals: req.user?.email, mode: 'insensitive' } },
                        { recipientEmail: { equals: req.user?.email, mode: 'insensitive' } }
                    ]
                }
            ];
        }
        if (search) {
            const searchCondition = {
                OR: [
                    { subject: { contains: search, mode: 'insensitive' } },
                    { sender: { contains: search, mode: 'insensitive' } },
                    { senderEmail: { contains: search, mode: 'insensitive' } },
                    { body: { contains: search, mode: 'insensitive' } }
                ]
            };
            if (where.AND) {
                where.AND.push(searchCondition);
            }
            else {
                where.OR = searchCondition.OR;
            }
        }
        const emails = await db_1.prisma.enterpriseEmail.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        const parsed = emails.map(e => ({
            ...e,
            attachments: e.attachmentsJson ? JSON.parse(e.attachmentsJson) : []
        }));
        res.json({ emails: parsed });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/v1/emails/:id (Get single email with strict ownership verification)
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const email = await db_1.prisma.enterpriseEmail.findUnique({
            where: { id: req.params.id }
        });
        if (!email) {
            res.status(404).json({ error: 'Email not found.' });
            return;
        }
        const isDirectorOrAdmin = req.user?.role === 'Super Admin' ||
            req.user?.role === 'Director' ||
            req.user?.role === 'Managing Director';
        const isParticipant = email.senderEmail?.toLowerCase() === req.user?.email?.toLowerCase() ||
            email.recipientEmail?.toLowerCase() === req.user?.email?.toLowerCase();
        if (!isDirectorOrAdmin && !isParticipant) {
            res.status(403).json({ error: 'Access denied: You are not authorized to view this confidential correspondence.' });
            return;
        }
        // Auto mark as read on view
        if (email.isUnread) {
            await db_1.prisma.enterpriseEmail.update({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/v1/emails (Send/Compose new email)
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { recipient, recipientEmail, subject, body, category = 'Clients & Sales', attachments = [], securityLevel = 'General Operations' } = req.body;
        if (!recipientEmail || !subject || !body) {
            res.status(400).json({ error: 'Recipient email, subject, and body are required.' });
            return;
        }
        const senderName = req.user?.name || 'Authorized User';
        const senderEmail = req.user?.email;
        if (!senderEmail) {
            res.status(401).json({ error: 'Sender email is required.' });
            return;
        }
        const snippet = body.substring(0, 120).replace(/\n/g, ' ') + '...';
        const now = new Date();
        const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newEmail = await db_1.prisma.enterpriseEmail.create({
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
            await integration_service_1.IntegrationService.sendEmail({
                to: recipientEmail,
                subject,
                template: 'TICKET_STATUS',
                data: {
                    title: subject,
                    ticketNumber: 'COMM-' + Date.now().toString().slice(-4),
                    category,
                    requester: senderName,
                    body
                }
            });
        }
        catch (err) {
            console.warn('[EMAIL DISPATCH DEFERRED - SMTP]:', err);
        }
        // ISO 27001 Audit Entry
        await (0, security_service_1.logAuditSecurityEntry)({
            action: 'EMAIL_DISPATCHED',
            category: 'Internal & Client Communications',
            details: `Sent email "${subject}" to ${recipientEmail} (${category})`,
            actor: senderName
        });
        // Real-Time Notification
        await (0, notification_service_1.emitNotification)({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PATCH /api/v1/emails/:id (Toggle star, unread status, or category)
router.patch('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { isUnread, isStarred, category } = req.body;
        const data = {};
        if (isUnread !== undefined)
            data.isUnread = Boolean(isUnread);
        if (isStarred !== undefined)
            data.isStarred = Boolean(isStarred);
        if (category !== undefined)
            data.category = category;
        const updated = await db_1.prisma.enterpriseEmail.update({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// DELETE /api/v1/emails/:id (Delete email)
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.prisma.enterpriseEmail.delete({ where: { id } });
        res.json({ message: 'Email deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
