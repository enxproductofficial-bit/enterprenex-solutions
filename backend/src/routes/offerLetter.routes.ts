import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {
  notifyOfferPendingApproval,
  notifyOfferReviewed,
  notifyOfferSent,
  notifyOfferResponse
} from '../services/notification.service';
import { logAuditSecurityEntry } from '../services/security.service';

const router = Router();

// Helper to generate unique Offer Letter Number
const generateOfferLetterNo = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const count = await prisma.offerLetter.count();
  const seq = (count + 1).toString().padStart(4, '0');
  return `ENX-OFF-${currentYear}-${seq}`;
};

// GET /api/offer-letters
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const isDirector = user.role === 'Super Admin' || user.role?.includes('Director') || user.email?.includes('director');
    const isHr = user.role === 'HR Manager' || user.role === 'Project Manager' || user.department === 'Human Resources' || user.email?.includes('hr');

    let offerLetters;
    if (isDirector || isHr) {
      offerLetters = await prisma.offerLetter.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Employees can only see their own Sent, Accepted, or Declined offer letter
      offerLetters = await prisma.offerLetter.findMany({
        where: {
          OR: [
            { employeeEmail: user.email },
            { employeeId: user.employeeId || 'NO_MATCH' }
          ],
          status: { in: ['Sent', 'Accepted', 'Declined', 'Approved'] }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json({ offerLetters });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/offer-letters/:id
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const offerLetter = await prisma.offerLetter.findUnique({ where: { id } });

    if (!offerLetter) {
      res.status(404).json({ error: 'Offer letter not found.' });
      return;
    }

    res.json({ offerLetter });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/offer-letters (HR or Director creates offer letter)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const isDirector = user?.role === 'Super Admin' || user?.role?.includes('Director') || user?.email?.includes('director');
    const isHr = user?.role === 'HR Manager' || user?.role === 'Project Manager' || user?.department === 'Human Resources' || user?.email?.includes('hr');

    if (!isDirector && !isHr) {
      res.status(403).json({ error: 'Only HR or Director can generate offer letters.' });
      return;
    }

    const data = req.body;
    if (!data.employeeId || !data.employeeName || !data.designation) {
      res.status(400).json({ error: 'Employee ID, Name, and Designation are required.' });
      return;
    }

    const offerLetterNo = await generateOfferLetterNo();
    const initialStatus = data.status || (isDirector ? 'Approved' : 'Pending Approval');

    const defaultTerms = data.termsAndConditions || `1. Appointment & Scope of Employment: The candidate will be appointed as ${data.designation} in ${data.department || 'Engineering'} division at Enterprenex Solutions Pvt Ltd.
2. Probation Period: ${data.probationPeriod || '3 Months'} from date of joining. Performance will be reviewed prior to permanent confirmation.
3. Working Hours & Modality: 09:30 AM to 06:30 PM IST (Hybrid/Office as agreed).
4. Compensation & Statutory Deductions: Monthly Gross of INR ${Number(data.salaryMonthly || 50000).toLocaleString('en-IN')}, Annual CTC of INR ${Number(data.ctcAnnual || 600000).toLocaleString('en-IN')}. Subject to applicable TDS and professional taxes.
5. Non-Disclosure & Intellectual Property: All proprietary codebases, algorithm models, client information, and internal documents remain exclusive intellectual property of Enterprenex Solutions Pvt Ltd under perpetual NDA.
6. Separation & Notice Period: 30 days written notice required during probation, 60 days following confirmation.`;

    const offerLetter = await prisma.offerLetter.create({
      data: {
        offerLetterNo,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        employeeEmail: data.employeeEmail || '',
        department: data.department || 'Engineering',
        designation: data.designation,
        joiningDate: data.joiningDate || new Date().toISOString().split('T')[0],
        employmentType: data.employmentType || 'Full-time',
        salaryMonthly: Number(data.salaryMonthly || 50000),
        ctcAnnual: Number(data.ctcAnnual || Number(data.salaryMonthly || 50000) * 12),
        probationPeriod: data.probationPeriod || '3 Months',
        termsAndConditions: defaultTerms,
        status: initialStatus,
        directorRemarks: isDirector ? 'Directly approved by Managing Director.' : null,
        directorApprovedBy: isDirector ? user?.name : null,
        directorApprovedAt: isDirector ? new Date() : null
      }
    });

    if (initialStatus === 'Pending Approval') {
      await notifyOfferPendingApproval(offerLetterNo, data.employeeName, user?.name || 'HR');
    }

    await logAuditSecurityEntry({
      action: 'OFFER_LETTER_CREATED',
      category: 'Talent Acquisition & Governance',
      details: `Offer letter ${offerLetterNo} created for ${data.employeeName} (${data.designation}) with status ${initialStatus}.`,
      actor: user?.name || user?.email || 'HR'
    });

    res.status(201).json({
      message: `Offer letter ${offerLetterNo} created successfully.`,
      offerLetter
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/offer-letters/:id (Update offer letter details)
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.offerLetter.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Offer letter not found.' });
      return;
    }

    const updated = await prisma.offerLetter.update({
      where: { id },
      data: {
        designation: data.designation ?? existing.designation,
        department: data.department ?? existing.department,
        joiningDate: data.joiningDate ?? existing.joiningDate,
        employmentType: data.employmentType ?? existing.employmentType,
        salaryMonthly: data.salaryMonthly !== undefined ? Number(data.salaryMonthly) : existing.salaryMonthly,
        ctcAnnual: data.ctcAnnual !== undefined ? Number(data.ctcAnnual) : existing.ctcAnnual,
        probationPeriod: data.probationPeriod ?? existing.probationPeriod,
        termsAndConditions: data.termsAndConditions ?? existing.termsAndConditions,
        status: data.status ?? existing.status
      }
    });

    res.json({ message: 'Offer letter updated.', offerLetter: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/offer-letters/:id/director-review (Director Approves or Rejects with remarks)
router.put('/:id/director-review', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const isDirector = user?.role === 'Super Admin' || user?.role?.includes('Director') || user?.email?.includes('director');

    if (!isDirector) {
      res.status(403).json({ error: 'Access forbidden: Only Managing Director can approve or reject offer letters.' });
      return;
    }

    const { id } = req.params;
    const { action, remarks } = req.body; // action: 'Approve' | 'Reject'

    if (!action || !['Approve', 'Reject'].includes(action)) {
      res.status(400).json({ error: 'Action must be Approve or Reject.' });
      return;
    }

    const existing = await prisma.offerLetter.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Offer letter not found.' });
      return;
    }

    const newStatus = action === 'Approve' ? 'Approved' : 'Rejected';
    const updated = await prisma.offerLetter.update({
      where: { id },
      data: {
        status: newStatus,
        directorRemarks: remarks || (action === 'Approve' ? 'Approved for dispatch.' : 'Revision requested.'),
        directorApprovedBy: user?.name || 'Managing Director',
        directorApprovedAt: new Date()
      }
    });

    await notifyOfferReviewed(existing.offerLetterNo, existing.employeeName, action === 'Approve', remarks);

    await logAuditSecurityEntry({
      action: `OFFER_LETTER_${action.toUpperCase()}D`,
      category: 'Executive Authorization',
      details: `Offer letter ${existing.offerLetterNo} for ${existing.employeeName} was ${newStatus} by Director with remarks: ${remarks || 'None'}`,
      actor: user?.name || 'Managing Director'
    });

    res.json({
      message: `Offer letter has been ${newStatus.toLowerCase()}.`,
      offerLetter: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/offer-letters/:id/send (HR sends finalized approved offer letter to employee)
router.post('/:id/send', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { id } = req.params;

    const existing = await prisma.offerLetter.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Offer letter not found.' });
      return;
    }

    if (existing.status !== 'Approved') {
      res.status(400).json({ error: 'Only Director-approved offer letters can be dispatched to candidates.' });
      return;
    }

    const updated = await prisma.offerLetter.update({
      where: { id },
      data: {
        status: 'Sent',
        sentAt: new Date()
      }
    });

    await notifyOfferSent(existing.offerLetterNo, existing.employeeName, existing.employeeEmail);

    await logAuditSecurityEntry({
      action: 'OFFER_LETTER_SENT',
      category: 'Talent Acquisition & Governance',
      details: `Offer letter ${existing.offerLetterNo} dispatched to candidate ${existing.employeeName} (${existing.employeeEmail}).`,
      actor: user?.name || 'HR'
    });

    res.json({
      message: `Offer letter ${existing.offerLetterNo} successfully dispatched to ${existing.employeeName}.`,
      offerLetter: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/offer-letters/:id/respond (Candidate/Employee Accepts or Declines)
router.post('/:id/respond', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, remarks } = req.body; // action: 'Accept' | 'Decline'

    if (!action || !['Accept', 'Decline'].includes(action)) {
      res.status(400).json({ error: 'Action must be Accept or Decline.' });
      return;
    }

    const existing = await prisma.offerLetter.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Offer letter not found.' });
      return;
    }

    const newStatus = action === 'Accept' ? 'Accepted' : 'Declined';
    const updated = await prisma.offerLetter.update({
      where: { id },
      data: {
        status: newStatus,
        respondedAt: new Date(),
        candidateResponseRemarks: remarks || null
      }
    });

    await notifyOfferResponse(existing.offerLetterNo, existing.employeeName, action === 'Accept', remarks);

    await logAuditSecurityEntry({
      action: `OFFER_LETTER_${action.toUpperCase()}ED`,
      category: 'Candidate Onboarding Action',
      details: `Candidate ${existing.employeeName} has ${newStatus.toLowerCase()} offer letter ${existing.offerLetterNo}.`,
      actor: req.user?.name || existing.employeeName
    });

    res.json({
      message: `Offer letter successfully ${newStatus.toLowerCase()}.`,
      offerLetter: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/offer-letters/:id
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.offerLetter.delete({ where: { id } });
    res.json({ message: 'Offer letter deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
