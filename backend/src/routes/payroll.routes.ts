import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { generatePayslipPdf } from '../services/pdf.service';
import { emitNotification } from '../services/notification.service';

const router = Router();

// GET /api/v1/payroll (List payroll records)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isDirectorOrCfo = req.user?.role === 'Super Admin' || req.user?.role === 'Project Manager' || req.user?.role === 'CFO' || req.user?.email?.includes('director');
    const { month, year, employeeId } = req.query as Record<string, string>;

    const where: any = {};
    if (!isDirectorOrCfo) {
      where.OR = [
        { employeeId: req.user?.id },
        { employeeEmail: req.user?.email }
      ];
    } else {
      if (employeeId) where.employeeId = employeeId;
    }

    if (month) where.month = month;
    if (year) where.year = parseInt(year, 10);

    const records = await prisma.payrollRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ payroll: records });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/payroll/generate-batch (CFO / HR / Director runs monthly payroll calculation)
router.post('/generate-batch', authenticateToken, requireRole(['Super Admin', 'Project Manager', 'CFO', 'HR Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { month = 'May 2026', year = 2026 } = req.body;

    const employees = await prisma.employee.findMany({
      where: { status: 'Active' }
    });

    const generated = [];

    for (const emp of employees) {
      // Check if already generated
      const existing = await prisma.payrollRecord.findFirst({
        where: {
          employeeId: emp.employeeId,
          month,
          year: Number(year)
        }
      });

      if (!existing) {
        const grossSalary = emp.salaryMonthly || 50000;
        // Indian Standard Payroll Structure:
        // Basic: 50% of gross
        // HRA: 40% of basic
        // Allowances: remaining
        // PF (Employee): 12% of basic
        // Tax (TDS estimate): 5% of gross if > 50,000, else 0
        const basicSalary = Math.round(grossSalary * 0.5);
        const hra = Math.round(basicSalary * 0.4);
        const allowances = Math.round(grossSalary - (basicSalary + hra));
        const pfEmployee = Math.round(basicSalary * 0.12);
        const pfEmployer = pfEmployee;
        const taxDeduction = grossSalary > 50000 ? Math.round(grossSalary * 0.05) : 200;
        const deductions = 0;
        const netSalary = Math.round(grossSalary - pfEmployee - taxDeduction - deductions);

        const recordNo = `PAY-${year}-${month.substring(0, 3).toUpperCase()}-${emp.employeeId.slice(-4)}`;

        const record = await prisma.payrollRecord.create({
          data: {
            payrollNo: recordNo,
            month,
            year: Number(year),
            employeeId: emp.employeeId,
            employeeName: emp.name,
            employeeEmail: emp.email,
            department: emp.department || 'Engineering',
            designation: emp.designation || emp.role || 'Staff Member',
            basicSalary,
            hra,
            allowances,
            deductions,
            pfEmployee,
            pfEmployer,
            taxDeduction,
            netSalary,
            status: 'Pending Approval'
          }
        });
        generated.push(record);
      }
    }

    // Notify CFO & Director
    await emitNotification({
      type: 'PAYROLL_BATCH_GENERATED',
      title: `Payroll Batch Generated for ${month} ${year}`,
      message: `${generated.length} payslips generated and pending approval.`,
      recipientRole: 'Super Admin',
      actionUrl: '/finance'
    });

    res.status(201).json({
      message: `Batch payroll generated successfully for ${generated.length} active employee(s).`,
      count: generated.length,
      records: generated
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/payroll/:id/approve (Director / CFO 1-click approval)
router.patch('/:id/approve', authenticateToken, requireRole(['Super Admin', 'Project Manager', 'CFO']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const record = await prisma.payrollRecord.update({
      where: { id },
      data: {
        status: 'Approved',
        approvedBy: req.user?.name || 'Chief Financial Officer',
        approvedAt: new Date(),
        remarks: remarks || 'Approved for disbursement'
      }
    });

    res.json({
      message: `Payroll ${record.payrollNo} approved.`,
      record
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/payroll/:id/pay (Mark as paid and record disbursement reference)
router.patch('/:id/pay', authenticateToken, requireRole(['Super Admin', 'Project Manager', 'CFO']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentMethod = 'NEFT/RTGS', paymentReference } = req.body;

    const ref = paymentReference || `UTR-${Date.now()}`;

    const record = await prisma.payrollRecord.update({
      where: { id },
      data: {
        status: 'Paid',
        paidAt: new Date(),
        paymentMethod,
        paymentReference: ref
      }
    });

    // Notify employee of credited salary
    await emitNotification({
      type: 'SALARY_DISBURSED',
      title: `Salary Credited for ${record.month}`,
      message: `Your net salary of ₹${record.netSalary.toLocaleString()} has been processed (Ref: ${ref}).`,
      recipientRole: 'Team Member',
      recipientEmail: record.employeeEmail,
      actionUrl: '/finance'
    });

    res.json({
      message: `Salary disbursement recorded for ${record.employeeName}.`,
      record
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/payroll/:id/payslip (Puppeteer PDF download)
router.get('/:id/payslip', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const record = await prisma.payrollRecord.findUnique({
      where: { id: req.params.id }
    });

    if (!record) {
      res.status(404).json({ error: 'Payroll record not found.' });
      return;
    }

    // Role check: Employee can only download their own payslip
    const isDirectorOrCfo = req.user?.role === 'Super Admin' || req.user?.role === 'Project Manager' || req.user?.role === 'CFO' || req.user?.email?.includes('director');
    if (!isDirectorOrCfo && req.user?.email !== record.employeeEmail && req.user?.id !== record.employeeId) {
      res.status(403).json({ error: 'Unauthorized to download this payslip.' });
      return;
    }

    const pdfBuffer = await generatePayslipPdf(record);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Payslip-${record.payrollNo}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

