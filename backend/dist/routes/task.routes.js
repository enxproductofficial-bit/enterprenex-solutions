"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const notification_service_1 = require("../services/notification.service");
const security_service_1 = require("../services/security.service");
const router = (0, express_1.Router)();
// GET /api/tasks
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const tasks = await db_1.prisma.task.findMany({
            orderBy: { createdAt: 'desc' }
        });
        const formatted = tasks.map(t => ({
            ...t,
            subtasks: t.subtasksJson ? JSON.parse(t.subtasksJson) : [],
            tags: t.tagsJson ? JSON.parse(t.tagsJson) : [],
            attachments: t.attachmentsJson ? JSON.parse(t.attachmentsJson) : [],
            supportingDocuments: t.supportingDocumentsJson ? JSON.parse(t.supportingDocumentsJson) : [],
            comments: [],
            acceptanceCriteria: []
        }));
        res.json({ tasks: formatted });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/tasks (Create task - HR or Director Assignment)
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const data = req.body;
        const user = req.user;
        const isDirector = user?.role === 'Super Admin' || user?.role === 'Director' || user?.role === 'Managing Director';
        const isHr = user?.role === 'HR' || user?.role === 'HR Manager' || user?.role === 'Project Manager' || user?.department === 'Human Resources';
        if (!isDirector && !isHr) {
            res.status(403).json({ error: 'Access forbidden: Only HR or Director can assign enterprise tasks.' });
            return;
        }
        if (!data.title || !data.assignedTo || !data.dueDate) {
            res.status(400).json({ error: 'Task Title, Assigned Employee, and Due Date are required.' });
            return;
        }
        const assignedByRole = isDirector ? 'Director' : (user?.role === 'HR Manager' ? 'HR' : 'Project Manager');
        const assignedByName = user?.name || (isDirector ? 'Managing Director' : 'HR Lead');
        const task = await db_1.prisma.task.create({
            data: {
                title: data.title,
                description: data.description || '',
                projectId: data.projectId || 'prj-internal',
                projectName: data.projectName || 'Internal Operations',
                assignedTo: data.assignedTo,
                department: data.department || 'Engineering',
                assignedBy: data.assignedBy || assignedByName,
                assignedByRole,
                reviewer: data.reviewer || (isDirector ? 'Managing Director' : assignedByName),
                priority: data.priority || 'Medium',
                status: data.status || 'Assigned',
                startDate: data.startDate || new Date().toISOString().split('T')[0],
                dueDate: data.dueDate,
                estimatedHours: Number(data.estimatedHours || 8),
                tagsJson: JSON.stringify(data.tags || ['Enterprise Task', data.department || 'Operations']),
                attachmentsJson: JSON.stringify(data.attachments || []),
                subtasksJson: JSON.stringify(data.subtasks || [
                    { id: 'st-1', title: 'Review specifications & requirements', completed: false },
                    { id: 'st-2', title: 'Execute implementation & verify quality', completed: false },
                    { id: 'st-3', title: 'Submit deliverable with remarks & attachments', completed: false }
                ])
            }
        });
        // Notify assigned employee
        await (0, notification_service_1.notifyTaskAssigned)(task.id, task.title, task.assignedTo, task.assignedTo, task.assignedBy || assignedByName, task.dueDate);
        await (0, security_service_1.logAuditSecurityEntry)({
            action: 'TASK_ASSIGNED',
            category: 'Operations Governance',
            details: `Task "${task.title}" assigned to ${task.assignedTo} by ${task.assignedBy} (${assignedByRole}). Due: ${task.dueDate}.`,
            actor: user?.name || 'Authorized Lead'
        });
        res.status(201).json({
            message: `Task "${task.title}" assigned successfully to ${task.assignedTo}.`,
            task
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/tasks/:id/submit (Employee submits completed task with remarks & docs)
router.post('/:id/submit', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { completionRemarks, supportingDocuments } = req.body;
        const task = await db_1.prisma.task.findUnique({ where: { id } });
        if (!task) {
            res.status(404).json({ error: 'Task not found.' });
            return;
        }
        const updated = await db_1.prisma.task.update({
            where: { id },
            data: {
                status: 'Under Review',
                completionRemarks: completionRemarks || 'Task completed and submitted for review.',
                supportingDocumentsJson: JSON.stringify(supportingDocuments || []),
                submittedAt: new Date()
            }
        });
        await (0, notification_service_1.notifyTaskCompletedSubmitted)(task.id, task.title, req.user?.name || task.assignedTo, task.assignedBy || 'Lead');
        // Also append to task comments
        await db_1.prisma.taskComment.create({
            data: {
                taskId: id,
                author: req.user?.name || 'Assignee',
                text: `🚀 TASK SUBMITTED FOR REVIEW: ${completionRemarks || 'Work completed. Awaiting review.'}`
            }
        });
        await (0, security_service_1.logAuditSecurityEntry)({
            action: 'TASK_SUBMITTED_FOR_REVIEW',
            category: 'Workforce Operations',
            details: `Task "${task.title}" submitted as completed by ${req.user?.name || task.assignedTo}.`,
            actor: req.user?.name || task.assignedTo
        });
        res.json({
            message: 'Task submitted for review successfully.',
            task: updated
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/tasks/:id/director-review (HR/Director Review: Approve or Reject task)
router.post('/:id/director-review', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { action, remarks } = req.body; // action: 'Approve' | 'Reject'
        const user = req.user;
        const isDirectorOrManager = user?.role === 'Super Admin' ||
            user?.role === 'Director' ||
            user?.role === 'Project Manager' ||
            user?.role === 'HR Manager';
        if (!isDirectorOrManager) {
            res.status(403).json({ error: 'Access forbidden: Only HR or Director can review task submissions.' });
            return;
        }
        if (!action || !['Approve', 'Reject'].includes(action)) {
            res.status(400).json({ error: 'Action must be Approve or Reject.' });
            return;
        }
        const task = await db_1.prisma.task.findUnique({ where: { id } });
        if (!task) {
            res.status(404).json({ error: 'Task not found.' });
            return;
        }
        const isApprove = action === 'Approve';
        const newStatus = isApprove ? 'Completed' : 'Rejected';
        const updated = await db_1.prisma.task.update({
            where: { id },
            data: {
                status: newStatus,
                reviewNotes: remarks || (isApprove ? 'Approved by Lead.' : 'Revisions required.'),
                reviewedBy: user?.name || 'Lead',
                reviewedAt: new Date()
            }
        });
        await (0, notification_service_1.notifyTaskReviewed)(task.id, task.title, isApprove, remarks, task.assignedTo);
        // Comment to thread
        await db_1.prisma.taskComment.create({
            data: {
                taskId: id,
                author: user?.name || 'Reviewer',
                text: isApprove
                    ? `✅ TASK APPROVED & COMPLETED: ${remarks || 'Deliverable verified and signed off.'}`
                    : `❌ REVISIONS REQUIRED: ${remarks || 'Please update and resubmit.'}`
            }
        });
        await (0, security_service_1.logAuditSecurityEntry)({
            action: `TASK_REVIEW_${action.toUpperCase()}`,
            category: 'Operations Review',
            details: `Task "${task.title}" was ${newStatus} by ${user?.name}. Remarks: ${remarks || 'None'}.`,
            actor: user?.name || 'Lead'
        });
        res.json({
            message: `Task submission ${isApprove ? 'Approved and marked Completed' : 'Returned with revision remarks'}.`,
            task: updated
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PUT /api/tasks/:id/reassign (Director or HR Reassignment)
router.put('/:id/reassign', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedTo, dueDate, priority, notes } = req.body;
        const user = req.user;
        const isDirectorOrManager = user?.role === 'Super Admin' ||
            user?.role === 'Project Manager' ||
            user?.role === 'HR Manager';
        if (!isDirectorOrManager) {
            res.status(403).json({ error: 'Access forbidden: Only HR or Director can reassign tasks.' });
            return;
        }
        const task = await db_1.prisma.task.findUnique({ where: { id } });
        if (!task) {
            res.status(404).json({ error: 'Task not found.' });
            return;
        }
        const updated = await db_1.prisma.task.update({
            where: { id },
            data: {
                assignedTo,
                dueDate: dueDate || task.dueDate,
                priority: priority || task.priority,
                status: 'Assigned',
                reviewNotes: notes ? `Reassigned by ${user?.name}: ${notes}` : task.reviewNotes
            }
        });
        await (0, notification_service_1.notifyTaskAssigned)(task.id, task.title, assignedTo, assignedTo, user?.name || 'Lead', updated.dueDate);
        res.json({
            message: `Task reassigned to ${assignedTo}.`,
            task: updated
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/tasks/:id/stopwatch/start (Start Anti-Tamper Monitored Stopwatch Session)
router.post('/:id/stopwatch/start', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const task = await db_1.prisma.task.findUnique({ where: { id } });
        if (!task) {
            res.status(404).json({ error: 'Task not found.' });
            return;
        }
        const user = req.user;
        const isDirectorOrManager = user?.role === 'Super Admin' ||
            user?.role === 'Director' ||
            user?.role === 'Project Manager' ||
            user?.role === 'HR Manager';
        const isAssignee = (user?.employeeId && task.assignedTo.includes(user.employeeId)) ||
            (user?.name && task.assignedTo.toLowerCase().includes(user.name.toLowerCase())) ||
            (user?.email && task.assignedTo.toLowerCase().includes(user.email.toLowerCase()));
        if (!isDirectorOrManager && !isAssignee) {
            res.status(403).json({ error: 'Access forbidden: You can only submit deliverables for tasks assigned to you.' });
            return;
        }
        const session = await db_1.prisma.taskTimeSession.create({
            data: {
                taskId: id,
                employeeName: req.user?.name || task.assignedTo || 'Staff Member',
                startedAt: new Date(),
                lastHeartbeatAt: new Date(),
                durationMinutes: 0,
                verifiedActiveMinutes: 0,
                idleMinutes: 0,
                heartbeatCount: 1,
                isTamperFlagged: false,
                activityNote: `Session initialized by ${req.user?.name || 'Staff'}`
            }
        });
        res.status(201).json({
            message: 'Verified stopwatch session started.',
            sessionId: session.id,
            startedAt: session.startedAt
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/tasks/:id/stopwatch/heartbeat (Periodic Liveness & Presence Heartbeat)
router.post('/:id/stopwatch/heartbeat', auth_1.authenticateToken, async (req, res) => {
    try {
        const { sessionId, isTabActive, userActiveRecent } = req.body;
        if (!sessionId) {
            res.status(400).json({ error: 'sessionId is required for presence verification.' });
            return;
        }
        const session = await db_1.prisma.taskTimeSession.findUnique({ where: { id: sessionId } });
        if (!session) {
            res.status(404).json({ error: 'Stopwatch session not found.' });
            return;
        }
        const now = new Date();
        const isActive = isTabActive !== false && userActiveRecent !== false;
        const updated = await db_1.prisma.taskTimeSession.update({
            where: { id: sessionId },
            data: {
                lastHeartbeatAt: now,
                heartbeatCount: session.heartbeatCount + 1,
                verifiedActiveMinutes: isActive ? session.verifiedActiveMinutes + 1 : session.verifiedActiveMinutes,
                idleMinutes: !isActive ? session.idleMinutes + 1 : session.idleMinutes,
                isTamperFlagged: session.isTamperFlagged || (!isTabActive && session.idleMinutes > 15)
            }
        });
        res.json({
            success: true,
            verifiedActiveMinutes: updated.verifiedActiveMinutes,
            idleMinutes: updated.idleMinutes,
            isTamperFlagged: updated.isTamperFlagged
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/tasks/:id/stopwatch/stop (Stop Stopwatch Session & Commit Verified Hours)
router.post('/:id/stopwatch/stop', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { sessionId, activityNote } = req.body;
        const task = await db_1.prisma.task.findUnique({ where: { id } });
        if (!task) {
            res.status(404).json({ error: 'Task not found.' });
            return;
        }
        const user = req.user;
        const isDirectorOrManager = user?.role === 'Super Admin' ||
            user?.role === 'Director' ||
            user?.role === 'Project Manager' ||
            user?.role === 'HR Manager';
        const isAssignee = (user?.employeeId && task.assignedTo.includes(user.employeeId)) ||
            (user?.name && task.assignedTo.toLowerCase().includes(user.name.toLowerCase())) ||
            (user?.email && task.assignedTo.toLowerCase().includes(user.email.toLowerCase()));
        if (!isDirectorOrManager && !isAssignee) {
            res.status(403).json({ error: 'Access forbidden: You can only submit deliverables for tasks assigned to you.' });
            return;
        }
        if (!sessionId) {
            res.status(400).json({ error: 'sessionId is required.' });
            return;
        }
        const session = await db_1.prisma.taskTimeSession.findUnique({ where: { id: sessionId } });
        if (!session) {
            res.status(404).json({ error: 'Session not found.' });
            return;
        }
        const endedAt = new Date();
        const totalMinutes = Math.max(1, Math.round((endedAt.getTime() - session.startedAt.getTime()) / 60000));
        const verifiedActiveMins = session.verifiedActiveMinutes > 0 ? session.verifiedActiveMinutes : totalMinutes;
        const hoursEarned = Math.round((verifiedActiveMins / 60) * 100) / 100;
        const updatedTask = await db_1.prisma.$transaction(async (tx) => {
            await tx.taskTimeSession.update({
                where: { id: sessionId },
                data: {
                    endedAt,
                    durationMinutes: totalMinutes,
                    activityNote: activityNote || 'Completed sprint session'
                }
            });
            return await tx.task.update({
                where: { id },
                data: {
                    loggedHours: Math.round((task.loggedHours + hoursEarned) * 100) / 100
                }
            });
        });
        res.json({
            message: `Stopwatch session closed. Logged +${hoursEarned} verified hours.`,
            hoursAdded: hoursEarned,
            totalLoggedHours: updatedTask.loggedHours,
            verifiedActiveMinutes: verifiedActiveMins,
            task: updatedTask
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PUT /api/tasks/:id/log-time (Manual Fallback Time Logging)
router.put('/:id/log-time', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { hours, sessionMinutes, activityNote } = req.body;
        const numHours = Number(hours);
        if (isNaN(numHours) || numHours <= 0) {
            res.status(400).json({ error: 'Invalid hours value provided.' });
            return;
        }
        if (numHours > 12) {
            res.status(400).json({
                error: 'Exceeds maximum permitted single-session log (12 hours). Lead authorization required.'
            });
            return;
        }
        const task = await db_1.prisma.task.findUnique({ where: { id } });
        if (!task) {
            res.status(404).json({ error: 'Task not found.' });
            return;
        }
        const updated = await db_1.prisma.task.update({
            where: { id },
            data: {
                loggedHours: Math.round((task.loggedHours + numHours) * 100) / 100
            }
        });
        res.json({
            message: `Logged +${numHours} hours to task.`,
            task: updated
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PUT /api/tasks/:id (General Task Updates with Status Control)
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const task = await db_1.prisma.task.findUnique({ where: { id } });
        if (!task) {
            res.status(404).json({ error: 'Task not found.' });
            return;
        }
        const user = req.user;
        const isDirectorOrManager = user?.role === 'Super Admin' ||
            user?.role === 'Director' ||
            user?.role === 'Project Manager' ||
            user?.role === 'HR Manager';
        const isAssignee = (user?.employeeId && task.assignedTo.includes(user.employeeId)) ||
            (user?.name && task.assignedTo.toLowerCase().includes(user.name.toLowerCase())) ||
            (user?.email && task.assignedTo.toLowerCase().includes(user.email.toLowerCase()));
        if (!isDirectorOrManager && !isAssignee) {
            res.status(403).json({ error: 'Access forbidden: You can only submit deliverables for tasks assigned to you.' });
            return;
        }
        // Rule: General employees cannot mark tasks as Completed without review
        if (updates.status && (updates.status === 'Completed' || updates.status === 'Approved')) {
            if (!isDirectorOrManager) {
                res.status(403).json({
                    error: 'Access forbidden: Only HR, Project Managers, or Directors can approve and mark tasks as Completed.'
                });
                return;
            }
        }
        const updated = await db_1.prisma.task.update({
            where: { id },
            data: {
                title: isDirectorOrManager && updates.title !== undefined ? updates.title : task.title,
                description: isDirectorOrManager && updates.description !== undefined ? updates.description : task.description,
                status: updates.status || task.status,
                dueDate: isDirectorOrManager && updates.dueDate !== undefined ? updates.dueDate : task.dueDate,
                startDate: isDirectorOrManager && updates.startDate !== undefined ? updates.startDate : task.startDate,
                priority: isDirectorOrManager && updates.priority !== undefined ? updates.priority : task.priority,
                department: isDirectorOrManager && updates.department !== undefined ? updates.department : task.department,
                assignedTo: isDirectorOrManager && updates.assignedTo !== undefined ? updates.assignedTo : task.assignedTo,
                reviewer: isDirectorOrManager && updates.reviewer !== undefined ? updates.reviewer : task.reviewer,
                loggedHours: updates.loggedHours !== undefined ? Number(updates.loggedHours) : task.loggedHours,
                subtasksJson: updates.subtasks ? JSON.stringify(updates.subtasks) : task.subtasksJson,
                reviewNotes: updates.reviewNotes !== undefined ? updates.reviewNotes : task.reviewNotes,
                completionRemarks: updates.completionRemarks !== undefined ? updates.completionRemarks : task.completionRemarks
            }
        });
        res.json({ message: 'Task updated successfully.', task: updated });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/tasks/:id/comments
router.post('/:id/comments', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        if (!text || !text.trim()) {
            res.status(400).json({ error: 'Comment text is required.' });
            return;
        }
        const comment = await db_1.prisma.taskComment.create({
            data: {
                taskId: id,
                author: req.user?.name || 'Team Member',
                authorAvatar: req.user?.avatar || null,
                text: text.trim()
            }
        });
        res.status(201).json({ comment });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/tasks/:id/comments
router.get('/:id/comments', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const comments = await db_1.prisma.taskComment.findMany({
            where: { taskId: id },
            orderBy: { createdAt: 'asc' }
        });
        res.json({ comments });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// DELETE /api/tasks/:id
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['Super Admin', 'Project Manager', 'HR Manager']), async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.prisma.task.delete({ where: { id } });
        res.json({ message: 'Task deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
