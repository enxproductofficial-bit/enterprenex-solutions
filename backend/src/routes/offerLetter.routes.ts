import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {
  notifyOfferPendingApproval,
  notifyOfferReviewed,
  notifyOfferSent,
  notifyOfferResponse
} from '../services/notification.service';
import { generateOfferLetterPdf } from '../services/pdf.service';
import { sendOfferLetterEmail } from '../services/email.service';

const router = Router();

// Security / Audit logging helper
const logAuditSecurityEntry = async (entry: {
  action: string;
  category: string;
  details: string;
  actor: string;
}) => {
  try {
    console.log(`[EWMS Audit] [${entry.category}] ${entry.action} by ${entry.actor}: ${entry.details}`);
  } catch {
    // Audit logging fallback
  }
};

// GET /api/v1/offer-letters (List all or filter by status / employeeId)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { status, employeeId, search } = req.query as Record<string, string>;

    const isDirector = user?.role === 'Super Admin' || user?.role?.includes('Director') || user?.email?.includes('director');
    const isHR = isDirector || user?.role === 'Project Manager' || user?.role === 'HR Manager' || user?.department === 'Human Resources';

    const whereClause: any = {};

    // Non-HR / regular employees can ONLY view their own offer letter
    if (!isHR && !isDirector) {
      whereClause.OR = [
        { employeeEmail: user?.email },
        { employeeId: user?.id }
      ];
    } else if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    if (status && status !== 'All') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { offerLetterNo: { contains: search } },
        { employeeName: { contains: search } },
        { employeeEmail: { contains: search } },
        { department: { contains: search } }
      ];
    }

    const offerLetters = await prisma.offerLetter.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ offerLetters });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/offer-letters/:id (Get single offer letter details)
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

// GET /api/v1/offer-letters/:id/pdf (Download official PDF generated via Puppeteer)
router.get('/:id/pdf', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const offer = await prisma.offerLetter.findUnique({ where: { id } });

    if (!offer) {
      res.status(404).json({ error: 'Offer letter not found.' });
      return;
    }

    const pdfBuffer = await generateOfferLetterPdf(offer);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Enterprenex_Offer_Letter_${offer.offerLetterNo}.pdf"`);
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error('[Puppeteer PDF Generation Error]', err);
    res.status(500).json({ error: 'Failed to generate PDF: ' + err.message });
  }
});

// POST /api/v1/offer-letters (HR creates an offer letter)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const isDirector = user?.role === 'Super Admin' || user?.role?.includes('Director') || user?.email?.includes('director');
    const isHR = isDirector || user?.role === 'Project Manager' || user?.role === 'HR Manager' || user?.department === 'Human Resources';

    if (!isHR) {
      res.status(403).json({ error: 'Access forbidden: Only HR or Director can generate offer letters.' });
      return;
    }

    const {
      employeeId,
      employeeName,
      employeeEmail,
      department,
      designation,
      joiningDate,
      employmentType,
      salaryMonthly,
      ctcAnnual,
      probationPeriod,
      termsAndConditions,
      status // 'Draft' | 'Pending Approval'
    } = req.body;

    if (!employeeName || !employeeEmail || !department || !designation || !joiningDate) {
      res.status(400).json({ error: 'Missing required offer letter fields.' });
      return;
    }

    // Generate unique sequential reference: ENX-OFF-2026-XXXX
    const count = await prisma.offerLetter.count();
    const offerLetterNo = `ENX-OFF-2026-${(count + 1).toString().padStart(4, '0')}`;

    const defaultTerms = `1. Working Hours & Modality: Regular work hours are 09:30 AM to 06:30 PM IST, Monday through Friday.\n2. Probation Period: ${probationPeriod || '3 Months'} performance benchmark and peer review period.\n3. Intellectual Property: All source code, product IP, blueprints, and materials created remain exclusive Enterprenex Solutions property.\n4. Confidentiality & Non-Disclosure: Strict corporate NDA applies to all client deliverables and architecture.\n5. Notice Period: 30 days written notice required following successful probation.`;

    const monthly = Number(salaryMonthly) || 50000;
    const annual = ctcAnnual ? Number(ctcAnnual) : monthly * 12;

    const offerLetter = await prisma.offerLetter.create({
      data: {
        offerLetterNo,
        employeeId: employeeId || null,
        employeeName,
        employeeEmail,
        department,
        designation,
        joiningDate,
        employmentType: employmentType || 'Full-time',
        salaryMonthly: monthly,
        ctcAnnual: annual,
        probationPeriod: probationPeriod || '3 Months',
        termsAndConditions: termsAndConditions || defaultTerms,
        status: status || 'Pending Approval'
      }
    });

    if (offerLetter.status === 'Pending Approval') {
      await notifyOfferPendingApproval(offerLetter.offerLetterNo, offerLetter.employeeName, user?.name || 'HR Team');
    }

    await logAuditSecurityEntry({
      action: 'OFFER_LETTER_CREATED',
      category: 'Talent Acquisition & Governance',
      details: `Offer letter ${offerLetter.offerLetterNo} drafted for ${offerLetter.employeeName} (${offerLetter.department}) with CTC ${annual}`,
      actor: user?.name || 'HR Manager'
    });

    res.status(201).json({
      message: 'Offer letter drafted successfully.',
      offerLetter
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/v1/offer-letters/:id (Update offer letter details)
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

// PUT /api/v1/offer-letters/:id/director-review (Director Approves or Rejects with remarks)
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
        directorApprovedBy: user?.name || 'Rohit Pawar (Managing Director)',
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

// POST /api/v1/offer-letters/:id/send (HR sends approved offer letter via Nodemailer with PDF attachment)
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

    // Generate Puppeteer PDF & Send Email
    let emailDispatched = false;
    try {
      const pdfBuffer = await generateOfferLetterPdf(updated);
      emailDispatched = await sendOfferLetterEmail(updated, pdfBuffer);
    } catch (e) {
      console.warn('PDF or Email generation warning:', e);
    }

    await notifyOfferSent(existing.offerLetterNo, existing.employeeName, existing.employeeEmail);

    await logAuditSecurityEntry({
      action: 'OFFER_LETTER_SENT',
      category: 'Talent Acquisition & Governance',
      details: `Offer letter ${existing.offerLetterNo} dispatched to candidate ${existing.employeeName} (${existing.employeeEmail}). Email sent: ${emailDispatched}`,
      actor: user?.name || 'HR'
    });

    res.json({
      message: `Offer letter ${existing.offerLetterNo} successfully dispatched to ${existing.employeeName}.`,
      offerLetter: updated,
      emailSent: emailDispatched
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/offer-letters/:id/respond (Candidate/Employee Accepts or Declines)
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
      action: `OFFER_LETTER_${newStatus.toUpperCase()}`,
      category: 'Candidate Onboarding Acceptance',
      details: `Offer letter ${existing.offerLetterNo} was ${newStatus} by ${existing.employeeName}. Remarks: ${remarks || 'None'}`,
      actor: existing.employeeName
    });

    res.json({
      message: `Offer letter has been ${newStatus.toLowerCase()}.`,
      offerLetter: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/v1/offer-letters/:id (HR deletes a draft or rejected offer letter)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.offerLetter.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Offer letter not found.' });
      return;
    }

    await prisma.offerLetter.delete({ where: { id } });
    res.json({ message: 'Offer letter deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
