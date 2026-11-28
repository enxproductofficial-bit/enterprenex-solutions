"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const notification_service_1 = require("../services/notification.service");
const router = (0, express_1.Router)();
// GET /api/v1/announcements (List announcements visible to current user)
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const isDirectorOrAdmin = req.user?.role === 'Super Admin' || req.user?.role === 'Director' || req.user?.role === 'Project Manager';
        const userDept = req.user?.department || '';
        const userId = req.user?.id || '';
        const announcements = await db_1.prisma.companyAnnouncement.findMany({
            where: { isArchived: false },
            orderBy: { publishedAt: 'desc' }
        });
        const filtered = announcements.filter(a => {
            if (isDirectorOrAdmin)
                return true;
            if (a.targetAudience === 'All Employees')
                return true;
            if (a.targetAudience === 'Specific Department' && a.targetDepartment === userDept)
                return true;
            if (a.targetAudience === 'Selected Employees' && a.targetEmployeesJson) {
                try {
                    const list = JSON.parse(a.targetEmployeesJson);
                    return Array.isArray(list) && list.includes(userId);
                }
                catch {
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/v1/announcements (Create announcement)
router.post('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['Super Admin', 'Project Manager', 'HR Manager']), async (req, res) => {
    try {
        const { title, content, targetAudience = 'All Employees', targetDepartment, targetTeam, targetEmployees = [], isScheduled = false, scheduledFor, attachments = [] } = req.body;
        if (!title || !content) {
            res.status(400).json({ error: 'Title and content are required.' });
            return;
        }
        const announcement = await db_1.prisma.companyAnnouncement.create({
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
        await (0, notification_service_1.emitNotification)({
            type: 'COMPANY_ANNOUNCEMENT',
            title: `📢 Announcement: ${title}`,
            message: `${content.substring(0, 120)}...`,
            actionUrl: '/dashboard'
        });
        res.status(201).json({
            message: 'Announcement published successfully.',
            announcement
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/v1/announcements/:id/read (Mark as read)
router.post('/:id/read', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id || 'unknown';
        const existing = await db_1.prisma.companyAnnouncement.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'Announcement not found.' });
            return;
        }
        const readList = existing.readByJson ? JSON.parse(existing.readByJson) : [];
        if (!readList.includes(userId)) {
            readList.push(userId);
            await db_1.prisma.companyAnnouncement.update({
                where: { id },
                data: { readByJson: JSON.stringify(readList) }
            });
        }
        res.json({ message: 'Marked as read.' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/v1/announcements/:id/acknowledge (Employee acknowledges policy/update)
router.post('/:id/acknowledge', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id || 'unknown';
        const existing = await db_1.prisma.companyAnnouncement.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'Announcement not found.' });
            return;
        }
        const ackList = existing.acknowledgedByJson ? JSON.parse(existing.acknowledgedByJson) : [];
        if (!ackList.includes(userId)) {
            ackList.push(userId);
            await db_1.prisma.companyAnnouncement.update({
                where: { id },
                data: { acknowledgedByJson: JSON.stringify(ackList) }
            });
        }
        res.json({ message: 'Policy acknowledged successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
