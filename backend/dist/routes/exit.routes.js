"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const pdf_service_1 = require("../services/pdf.service");
const notification_service_1 = require("../services/notification.service");
const router = (0, express_1.Router)();
// GET /api/v1/exit (List exit requests)
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const isDirectorOrHr = req.user?.role === 'Super Admin' || req.user?.role === 'Director' || req.user?.role === 'Project Manager' || req.user?.role === 'HR Manager';
        const { status } = req.query;
        const where = {};
        if (!isDirectorOrHr) {
            where.OR = [
                { employeeId: req.user?.id },
                { employeeEmail: req.user?.email }
            ];
        }
        if (status)
            where.status = status;
        const exits = await db_1.prisma.exitRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        res.json({ exits });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/v1/exit/resignation (Employee submits formal resignation)
router.post('/resignation', auth_1.authenticateToken, async (req, res) => {
    try {
        const { proposedLastWorkingDay, reason, noticePeriodDays = 30 } = req.body;
        if (!proposedLastWorkingDay || !reason) {
            res.status(400).json({ error: 'Proposed last working day and reason are mandatory.' });
            return;
        }
        const todayStr = new Date().toISOString().split('T')[0];
        const employeeId = req.user?.employeeId || req.user?.id || 'EMP-TEMP';
        const employeeName = req.user?.name || 'Staff Member';
        const employeeEmail = req.user?.email || 'staff@enterprenex.solutions';
        const department = req.user?.department || 'Engineering';
        const exit = await db_1.prisma.exitRequest.create({
            data: {
                employeeId,
                employeeName,
                employeeEmail,
                department,
                designation: req.user?.role || 'Staff Member',
                resignationDate: todayStr,
                proposedLastWorkingDay,
                reason,
                noticePeriodDays: Number(noticePeriodDays) || 30,
                status: 'Submitted'
            }
        });
        // Alert Director & HR
        await (0, notification_service_1.emitNotification)({
            type: 'RESIGNATION_SUBMITTED',
            title: 'Resignation Submitted',
            message: `${employeeName} (${department}) has submitted resignation with proposed LWD ${proposedLastWorkingDay}.`,
            recipientRole: 'Super Admin',
            actionUrl: '/team'
        });
        res.status(201).json({
            message: 'Resignation submitted successfully and notified to leadership.',
            exit
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PATCH /api/v1/exit/:id/review (Director / HR review and approval)
router.patch('/:id/review', auth_1.authenticateToken, (0, auth_1.requireRole)(['Super Admin', 'Project Manager', 'HR Manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, actualLastWorkingDay, directorRemarks } = req.body;
        if (!['Approved', 'Rejected', 'In Review'].includes(status)) {
            res.status(400).json({ error: 'Status must be Approved, Rejected, or In Review.' });
            return;
        }
        const updated = await db_1.prisma.exitRequest.update({
            where: { id },
            data: {
                status: status === 'Approved' ? 'Clearance Pending' : status,
                directorApprovalStatus: status,
                directorRemarks: directorRemarks || null,
                actualLastWorkingDay: actualLastWorkingDay || null
            }
        });
        res.json({
            message: `Exit request updated to ${status}.`,
            exit: updated
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PATCH /api/v1/exit/:id/clearance (Update multi-department clearance checklist)
router.patch('/:id/clearance', auth_1.authenticateToken, (0, auth_1.requireRole)(['Super Admin', 'Project Manager', 'HR Manager', 'CFO']), async (req, res) => {
    try {
        const { id } = req.params;
        const { projectHandoverCompleted, assetReturnCompleted, documentClearanceCompleted, financeClearanceCompleted, hrApprovalCompleted, clearanceRemarks } = req.body;
        const data = {};
        if (projectHandoverCompleted !== undefined)
            data.projectHandoverCompleted = Boolean(projectHandoverCompleted);
        if (assetReturnCompleted !== undefined)
            data.assetReturnCompleted = Boolean(assetReturnCompleted);
        if (documentClearanceCompleted !== undefined)
            data.documentClearanceCompleted = Boolean(documentClearanceCompleted);
        if (financeClearanceCompleted !== undefined)
            data.financeClearanceCompleted = Boolean(financeClearanceCompleted);
        if (hrApprovalCompleted !== undefined)
            data.hrApprovalCompleted = Boolean(hrApprovalCompleted);
        if (clearanceRemarks !== undefined)
            data.clearanceRemarks = clearanceRemarks;
        const existing = await db_1.prisma.exitRequest.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'Exit record not found.' });
            return;
        }
        const allClear = (data.projectHandoverCompleted ?? existing.projectHandoverCompleted) &&
            (data.assetReturnCompleted ?? existing.assetReturnCompleted) &&
            (data.documentClearanceCompleted ?? existing.documentClearanceCompleted) &&
            (data.financeClearanceCompleted ?? existing.financeClearanceCompleted) &&
            (data.hrApprovalCompleted ?? existing.hrApprovalCompleted);
        const updated = await db_1.prisma.$transaction(async (tx) => {
            if (allClear) {
                data.status = 'Completed';
                await tx.employee.updateMany({
                    where: { employeeId: existing.employeeId },
                    data: { status: 'Resigned' }
                });
            }
            return await tx.exitRequest.update({
                where: { id },
                data
            });
        });
        res.json({
            message: allClear ? 'All exit clearances completed. Relieving letter ready.' : 'Clearance checklist updated.',
            exit: updated
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/v1/exit/:id/letter (Puppeteer PDF Relieving & Experience Letter - Ownership & Role Guarded)
router.get('/:id/letter', auth_1.authenticateToken, async (req, res) => {
    try {
        const exit = await db_1.prisma.exitRequest.findUnique({
            where: { id: req.params.id }
        });
        if (!exit) {
            res.status(404).json({ error: 'Exit record not found.' });
            return;
        }
        const isDirectorOrHr = req.user?.role === 'Super Admin' || req.user?.role === 'Director' || req.user?.role === 'Project Manager' || req.user?.role === 'HR Manager';
        const isOwner = exit.employeeId === req.user?.employeeId || exit.employeeId === req.user?.id || exit.employeeEmail === req.user?.email;
        if (!isDirectorOrHr && !isOwner) {
            res.status(403).json({ error: 'Access forbidden: You are not authorized to download this relieving letter.' });
            return;
        }
        if (exit.status !== 'Approved' && exit.status !== 'Completed') {
            res.status(400).json({ error: 'Relieving letter is only available after exit clearances are formally approved or completed.' });
            return;
        }
        const pdfBuffer = await (0, pdf_service_1.generateRelievingLetterPdf)({
            employeeId: exit.employeeId,
            employeeName: exit.employeeName,
            department: exit.department,
            designation: exit.designation,
            resignationDate: exit.resignationDate,
            actualLastWorkingDay: exit.actualLastWorkingDay || exit.proposedLastWorkingDay
        });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Relieving_Letter_${exit.employeeId}.pdf"`);
        res.send(pdfBuffer);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
