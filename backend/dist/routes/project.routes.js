"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const notification_service_1 = require("../services/notification.service");
const router = (0, express_1.Router)();
// GET /api/v1/projects (List projects)
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { status, managerEmail } = req.query;
        const where = {};
        if (status)
            where.status = status;
        if (managerEmail)
            where.managerEmail = managerEmail;
        const projects = await db_1.prisma.project.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        const isLeadership = req.user?.role === 'Super Admin' || req.user?.role === 'Director' || req.user?.role === 'Project Manager';
        const parsed = projects.map(p => ({
            ...p,
            budget: isLeadership ? p.budget : undefined,
            teamMembers: p.teamMembersJson ? JSON.parse(p.teamMembersJson) : [],
            milestones: p.milestonesJson ? JSON.parse(p.milestonesJson) : []
        }));
        res.json({ projects: parsed });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/v1/projects/:id
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const project = await db_1.prisma.project.findUnique({
            where: { id: req.params.id }
        });
        if (!project) {
            res.status(404).json({ error: 'Project not found.' });
            return;
        }
        const isLeadership = req.user?.role === 'Super Admin' || req.user?.role === 'Director' || req.user?.role === 'Project Manager';
        res.json({
            project: {
                ...project,
                budget: isLeadership ? project.budget : undefined,
                teamMembers: project.teamMembersJson ? JSON.parse(project.teamMembersJson) : [],
                milestones: project.milestonesJson ? JSON.parse(project.milestonesJson) : []
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/v1/projects (HR / Director / Project Manager creates new project)
router.post('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['Super Admin', 'Project Manager']), async (req, res) => {
    try {
        const { title, description, client, status = 'Planning', budget = 0, startDate, deadline, teamSize = 3, managerName, managerEmail, teamMembers = [], milestones = [] } = req.body;
        if (!title || !client || !deadline) {
            res.status(400).json({ error: 'Title, client, and deadline are required.' });
            return;
        }
        const project = await db_1.prisma.project.create({
            data: {
                title,
                description,
                client,
                status,
                budget: Number(budget) || 0,
                startDate: startDate || new Date().toISOString().split('T')[0],
                deadline,
                teamSize: Number(teamSize) || teamMembers.length || 3,
                managerName: managerName || req.user?.name || 'Project Manager',
                managerEmail: managerEmail || req.user?.email,
                teamMembersJson: JSON.stringify(teamMembers),
                milestonesJson: JSON.stringify(milestones),
                completionRate: 0
            }
        });
        // Notify assigned members
        if (teamMembers.length > 0) {
            await (0, notification_service_1.emitNotification)({
                type: 'PROJECT_ASSIGNED',
                title: `Added to Project: ${title}`,
                message: `You were added to the engineering team for ${title} (${client}).`,
                recipientRole: 'Team Member',
                actionUrl: '/projects'
            });
        }
        res.status(201).json({
            message: 'Project created successfully.',
            project: {
                ...project,
                teamMembers,
                milestones
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PATCH /api/v1/projects/:id (Update general project details)
router.patch('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['Super Admin', 'Project Manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, client, status, budget, deadline, completionRate } = req.body;
        const data = {};
        if (title !== undefined)
            data.title = title;
        if (description !== undefined)
            data.description = description;
        if (client !== undefined)
            data.client = client;
        if (status !== undefined)
            data.status = status;
        if (budget !== undefined)
            data.budget = Number(budget);
        if (deadline !== undefined)
            data.deadline = deadline;
        if (completionRate !== undefined)
            data.completionRate = Number(completionRate);
        const updated = await db_1.prisma.project.update({
            where: { id },
            data
        });
        res.json({
            message: 'Project details updated.',
            project: updated
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PATCH /api/v1/projects/:id/milestones (Add or update milestones)
router.patch('/:id/milestones', auth_1.authenticateToken, (0, auth_1.requireRole)(['Super Admin', 'Project Manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const { milestones, completionRate } = req.body;
        const data = {
            milestonesJson: JSON.stringify(milestones || [])
        };
        if (completionRate !== undefined) {
            data.completionRate = Number(completionRate);
        }
        const updated = await db_1.prisma.project.update({
            where: { id },
            data
        });
        res.json({
            message: 'Project milestones updated.',
            project: {
                ...updated,
                milestones: JSON.parse(updated.milestonesJson || '[]')
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PATCH /api/v1/projects/:id/team (Update team allocations)
router.patch('/:id/team', auth_1.authenticateToken, (0, auth_1.requireRole)(['Super Admin', 'Project Manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const { teamMembers } = req.body;
        const updated = await db_1.prisma.project.update({
            where: { id },
            data: {
                teamMembersJson: JSON.stringify(teamMembers || []),
                teamSize: (teamMembers || []).length
            }
        });
        res.json({
            message: 'Project team members updated.',
            project: {
                ...updated,
                teamMembers: JSON.parse(updated.teamMembersJson || '[]')
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// DELETE /api/v1/projects/:id (Delete project)
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['Super Admin', 'Project Manager']), async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.prisma.project.delete({ where: { id } });
        res.json({ message: 'Project deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
