import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { generateRelievingLetterPdf } from '../services/pdf.service';
import { emitNotification } from '../services/notification.service';

const router = Router();

// GET /api/v1/exit (List exit requests)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isDirectorOrHr = req.user?.role === 'Super Admin' || req.user?.role === 'Project Manager' || req.user?.role === 'HR Manager' || req.user?.email?.includes('director');
    const { status } = req.query as Record<string, string>;

    const where: any = {};
    if (!isDirectorOrHr) {
      where.OR = [
        { employeeId: req.user?.id },
        { employeeEmail: req.user?.email }
      ];
    }
    if (status) where.status = status;

    const exits = await prisma.exitRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ exits });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/exit/resignation (Employee submits formal resignation)
router.post('/resignation', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
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

    const exit = await prisma.exitRequest.create({
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
    await emitNotification({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/exit/:id/review (Director / HR review and approval)
router.patch('/:id/review', authenticateToken, requireRole(['Super Admin', 'Project Manager', 'HR Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, actualLastWorkingDay, directorRemarks } = req.body;

    if (!['Approved', 'Rejected', 'In Review'].includes(status)) {
      res.status(400).json({ error: 'Status must be Approved, Rejected, or In Review.' });
      return;
    }

    const updated = await prisma.exitRequest.update({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/exit/:id/clearance (Update multi-department clearance checklist)
router.patch('/:id/clearance', authenticateToken, requireRole(['Super Admin', 'Project Manager', 'HR Manager', 'CFO']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      projectHandoverCompleted,
      assetReturnCompleted,
      documentClearanceCompleted,
      financeClearanceCompleted,
      hrApprovalCompleted,
      clearanceRemarks
    } = req.body;

    const data: any = {};
    if (projectHandoverCompleted !== undefined) data.projectHandoverCompleted = Boolean(projectHandoverCompleted);
    if (assetReturnCompleted !== undefined) data.assetReturnCompleted = Boolean(assetReturnCompleted);
    if (documentClearanceCompleted !== undefined) data.documentClearanceCompleted = Boolean(documentClearanceCompleted);
    if (financeClearanceCompleted !== undefined) data.financeClearanceCompleted = Boolean(financeClearanceCompleted);
    if (hrApprovalCompleted !== undefined) data.hrApprovalCompleted = Boolean(hrApprovalCompleted);
    if (clearanceRemarks !== undefined) data.clearanceRemarks = clearanceRemarks;

    const existing = await prisma.exitRequest.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Exit record not found.' });
      return;
    }

    const allClear = 
      (data.projectHandoverCompleted ?? existing.projectHandoverCompleted) &&
      (data.assetReturnCompleted ?? existing.assetReturnCompleted) &&
      (data.documentClearanceCompleted ?? existing.documentClearanceCompleted) &&
      (data.financeClearanceCompleted ?? existing.financeClearanceCompleted) &&
      (data.hrApprovalCompleted ?? existing.hrApprovalCompleted);

    if (allClear) {
      data.status = 'Completed';
      // Mark employee record inactive
      await prisma.employee.updateMany({
        where: { employeeId: existing.employeeId },
        data: { status: 'Resigned' }
      });
    }

    const updated = await prisma.exitRequest.update({
      where: { id },
      data
    });

    res.json({
      message: allClear ? 'All exit clearances completed. Relieving letter ready.' : 'Clearance checklist updated.',
      exit: updated
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/exit/:id/letter (Puppeteer PDF Relieving & Experience Letter)
router.get('/:id/letter', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exit = await prisma.exitRequest.findUnique({
      where: { id: req.params.id }
    });

    if (!exit) {
      res.status(404).json({ error: 'Exit record not found.' });
      return;
    }

    const pdfBuffer = await generateRelievingLetterPdf({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

