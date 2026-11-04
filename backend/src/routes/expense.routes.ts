import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { emitNotification } from '../services/notification.service';

const router = Router();

// GET /api/v1/expenses (List expenses)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isDirectorOrCfo = req.user?.role === 'Super Admin' || req.user?.role === 'Project Manager' || req.user?.role === 'CFO' || req.user?.role === 'HR Manager' || req.user?.email?.includes('director');
    const { status, category } = req.query as Record<string, string>;

    const where: any = {};
    if (!isDirectorOrCfo) {
      where.OR = [
        { employeeId: req.user?.id },
        { employeeName: req.user?.name }
      ];
    }
    if (status) where.status = status;
    if (category) where.category = category;

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ expenses });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/expenses (Submit expense claim)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, category, amount, date, description, receiptUrl } = req.body;

    if (!title || !category || !amount) {
      res.status(400).json({ error: 'Title, category, and amount are required.' });
      return;
    }

    const employeeName = req.user?.name || 'Staff Member';
    const employeeId = req.user?.employeeId || req.user?.id || 'EMP-TEMP';
    const department = req.user?.department || 'Engineering';

    const expense = await prisma.expense.create({
      data: {
        title,
        category,
        amount: Number(amount),
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
    await emitNotification({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/expenses/:id/review (Multi-tier approval)
router.patch('/:id/review', authenticateToken, requireRole(['Super Admin', 'Project Manager', 'CFO', 'HR Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!['HR Approved', 'Director Approved', 'Rejected'].includes(status)) {
      res.status(400).json({ error: 'Invalid expense approval status.' });
      return;
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        status,
        remarks: remarks || null,
        reviewedBy: req.user?.name || 'CFO',
        reviewedAt: new Date()
      }
    });

    // Notify employee
    await emitNotification({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/expenses/:id/reimburse (Mark as disbursed/reimbursed)
router.patch('/:id/reimburse', authenticateToken, requireRole(['Super Admin', 'Project Manager', 'CFO']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const updated = await prisma.expense.update({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

