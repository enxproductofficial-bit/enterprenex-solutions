"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const notification_service_1 = require("../services/notification.service");
const router = (0, express_1.Router)();
// GET /api/v1/expenses (List expenses)
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const isDirectorOrCfo = req.user?.role === 'Super Admin' || req.user?.role === 'Director' || req.user?.role === 'Project Manager' || req.user?.role === 'CFO' || req.user?.role === 'HR Manager';
        const { status, category } = req.query;
        const where = {};
        if (!isDirectorOrCfo) {
            where.OR = [
                { employeeId: req.user?.id },
                { employeeName: req.user?.name }
            ];
        }
        if (status)
            where.status = status;
        if (category)
            where.category = category;
        const expenses = await db_1.prisma.expense.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        res.json({ expenses });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/v1/expenses (Submit expense claim)
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { title, category, amount, date, description, receiptUrl } = req.body;
        if (!title || !category || amount === undefined || amount === null) {
            res.status(400).json({ error: 'Title, category, and amount are required.' });
            return;
        }
        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            res.status(400).json({ error: 'Valid positive expense amount is required.' });
            return;
        }
        const employeeName = req.user?.name || 'Staff Member';
        const employeeId = req.user?.employeeId || req.user?.id || 'EMP-TEMP';
        const department = req.user?.department || 'Engineering';
        const expense = await db_1.prisma.expense.create({
            data: {
                title,
                category,
                amount: numericAmount,
                date: date || new Date().toISOString().split('T')[0],
                description: description || null,
                receiptUrl: receiptUrl || null,
                employeeId,
                employeeName,
                department,
                status: 'Pending'
            }
        });
        // Alert CFO / Management
        await (0, notification_service_1.emitNotification)({
            type: 'EXPENSE_SUBMITTED',
            title: 'New Expense Claim Submitted',
            message: `${employeeName} submitted an expense claim of ₹${Number(amount).toLocaleString()} for ${category}: ${title}`,
            recipientRole: 'Super Admin',
            actionUrl: '/finance'
        });
        res.status(201).json({
            message: 'Expense claim submitted for financial review.',
            expense
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PATCH /api/v1/expenses/:id/review (Multi-tier approval)
router.patch('/:id/review', auth_1.authenticateToken, (0, auth_1.requireRole)(['Super Admin', 'Project Manager', 'CFO', 'HR Manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body;
        if (!['HR Approved', 'Director Approved', 'Rejected'].includes(status)) {
            res.status(400).json({ error: 'Invalid expense approval status.' });
            return;
        }
        const updated = await db_1.prisma.expense.update({
            where: { id },
            data: {
                status,
                remarks: remarks || null,
                reviewedBy: req.user?.name || 'CFO',
                reviewedAt: new Date()
            }
        });
        // Notify employee
        await (0, notification_service_1.emitNotification)({
            type: 'EXPENSE_REVIEWED',
            title: `Expense Claim ${status}`,
            message: `Your claim of ₹${updated.amount} for "${updated.title}" was updated to ${status}.${remarks ? ` Remarks: ${remarks}` : ''}`,
            recipientRole: 'Team Member',
            actionUrl: '/finance'
        });
        res.json({
            message: `Expense claim updated to ${status}.`,
            expense: updated
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PATCH /api/v1/expenses/:id/reimburse (Mark as disbursed/reimbursed strictly with prior executive approval)
router.patch('/:id/reimburse', auth_1.authenticateToken, (0, auth_1.requireRole)(['Super Admin', 'Project Manager', 'CFO']), async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await db_1.prisma.expense.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'Expense record not found.' });
            return;
        }
        if (existing.status !== 'Director Approved' && existing.status !== 'HR Approved') {
            res.status(400).json({
                error: `Reimbursement blocked: Expense status is '${existing.status}'. Prior executive approval is mandatory before release of funds.`
            });
            return;
        }
        const updated = await db_1.prisma.expense.update({
            where: { id },
            data: {
                status: 'Reimbursed',
                reimbursedAt: new Date()
            }
        });
        res.json({
            message: `Expense ${updated.title} marked as Reimbursed.`,
            expense: updated
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
