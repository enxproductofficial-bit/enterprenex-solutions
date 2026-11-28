"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveOfferLetter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const notification_service_1 = require("../services/notification.service");
const pdf_service_1 = require("../services/pdf.service");
const email_service_1 = require("../services/email.service");
const router = (0, express_1.Router)();
// Security / Audit logging helper
const logAuditSecurityEntry = async (entry) => {
    try {
        console.log(`[EWMS Audit] [${entry.category}] ${entry.action} by ${entry.actor}: ${entry.details}`);
    }
    catch {
        // Audit logging fallback
    }
};
// Robust resolver to locate offer letters by UUID, sequential offerLetterNo, mock ID (off-101/102/103), or email
const resolveOfferLetter = async (idOrRef) => {
    if (!idOrRef)
        return null;
    // 1. Direct match by id or offerLetterNo
    let offer = await db_1.prisma.offerLetter.findFirst({
        where: {
            OR: [
                { id: idOrRef },
                { offerLetterNo: idOrRef }
            ]
        }
    });
    if (offer)
        return offer;
    // 2. Map frontend mock IDs (off-101, off-102, off-103)
    const mockRefMap = {
        'off-101': 'ENX-OFF-2026-0001',
        'off-102': 'ENX-OFF-2026-0002',
        'off-103': 'ENX-OFF-2026-0003'
    };
    const mappedNo = mockRefMap[idOrRef];
    if (mappedNo) {
        offer = await db_1.prisma.offerLetter.findUnique({
            where: { offerLetterNo: mappedNo }
        });
        if (offer)
            return offer;
    }
    // 3. Fallback: match by employee name or email
    offer = await db_1.prisma.offerLetter.findFirst({
        where: {
            OR: [
                { employeeName: { contains: idOrRef } },
                { employeeEmail: { contains: idOrRef } }
            ]
        }
    });
    return offer;
};
exports.resolveOfferLetter = resolveOfferLetter;
// GET /api/v1/offer-letters (List all or filter by status / employeeId)
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { status, employeeId, search } = req.query;
        const isDirector = user?.role === 'Super Admin' || user?.role === 'Director' || user?.role === 'Managing Director';
        const isHR = isDirector || user?.role === 'Project Manager' || user?.role === 'HR Manager' || user?.department === 'Human Resources';
        const whereClause = {};
        // Non-HR / regular employees can ONLY view their own offer letter
        if (!isHR && !isDirector) {
            whereClause.OR = [
                { employeeEmail: user?.email },
                { employeeId: user?.id }
            ];
        }
        else if (employeeId) {
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
        const offerLetters = await db_1.prisma.offerLetter.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });
        res.json({ offerLetters });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /api/v1/offer-letters/:id (Get single offer letter details with strict authorization)
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const offerLetter = await (0, exports.resolveOfferLetter)(id);
        if (!offerLetter) {
            res.status(404).json({ error: 'Offer letter not found.' });
            return;
        }
        const user = req.user;
        const isDirector = user?.role === 'Super Admin' || user?.role === 'Director' || user?.role === 'Managing Director';
        const isHR = isDirector || user?.role === 'Project Manager' || user?.role === 'HR Manager' || user?.department === 'Human Resources';
        const isOwner = (user?.email && offerLetter.employeeEmail?.toLowerCase() === user.email.toLowerCase()) ||
            (user?.employeeId && offerLetter.employeeId === user.employeeId) ||
            (user?.id && offerLetter.employeeId === user.id);
        if (!isHR && !isOwner) {
            res.status(403).json({ error: 'Access forbidden: You can only view your own confidential offer letter.' });
            return;
        }
        res.json({ offerLetter });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /api/v1/offer-letters/:id/pdf (Download official PDF with strict authorization)
router.get('/:id/pdf', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const offer = await (0, exports.resolveOfferLetter)(id);
        if (!offer) {
            res.status(404).json({ error: 'Offer letter not found.' });
            return;
        }
        const user = req.user;
        const isDirector = user?.role === 'Super Admin' || user?.role === 'Director' || user?.role === 'Managing Director';
        const isHR = isDirector || user?.role === 'Project Manager' || user?.role === 'HR Manager' || user?.department === 'Human Resources';
        const isOwner = (user?.email && offer.employeeEmail?.toLowerCase() === user.email.toLowerCase()) ||
            (user?.employeeId && offer.employeeId === user.employeeId) ||
            (user?.id && offer.employeeId === user.id);
        if (!isHR && !isOwner) {
            res.status(403).json({ error: 'Access forbidden: You can only download your own confidential offer letter.' });
            return;
        }
        const pdfBuffer = await (0, pdf_service_1.generateOfferLetterPdf)(offer);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Enterprenex_Offer_Letter_${offer.offerLetterNo}.pdf"`);
        res.send(pdfBuffer);
    }
    catch (err) {
        console.error('[Puppeteer PDF Generation Error]', err);
        res.status(500).json({ error: 'Failed to generate PDF: ' + err.message });
    }
});
// POST /api/v1/offer-letters (HR creates an offer letter)
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const isDirector = user?.role === 'Super Admin' || user?.role === 'Director' || user?.role === 'Managing Director';
        const isHR = isDirector || user?.role === 'Project Manager' || user?.role === 'HR Manager' || user?.department === 'Human Resources';
        if (!isHR) {
            res.status(403).json({ error: 'Access forbidden: Only HR or Director can generate offer letters.' });
            return;
        }
        const { employeeId, employeeName, employeeEmail, department, designation, joiningDate, employmentType, salaryMonthly, ctcAnnual, probationPeriod, termsAndConditions, status, // 'Draft' | 'Pending Approval'
        candidateAddress, placeOfJoining, workMode, workingHours, workingDays, reportingManager, signatoryName, signatoryRole, signatoryDepartment } = req.body;
        if (!employeeName || !employeeEmail || !department || !designation || !joiningDate) {
            res.status(400).json({ error: 'Missing required offer letter fields.' });
            return;
        }
        // Generate unique sequential reference: ENX-OFF-2026-XXXX
        const count = await db_1.prisma.offerLetter.count();
        const offerLetterNo = `ENX-OFF-2026-${(count + 1).toString().padStart(4, '0')}`;
        const defaultTerms = `1. Working Hours & Modality: Regular work hours are 09:30 AM to 06:30 PM IST, Monday through Friday.\n2. Probation Period: ${probationPeriod || '3 Months'} performance benchmark and peer review period.\n3. Intellectual Property: All source code, product IP, blueprints, and materials created remain exclusive Enterprenex Solutions property.\n4. Confidentiality & Non-Disclosure: Strict corporate NDA applies to all client deliverables and architecture.\n5. Notice Period: 30 days written notice required following successful probation.`;
        const monthly = Number(salaryMonthly) || 50000;
        const annual = ctcAnnual ? Number(ctcAnnual) : monthly * 12;
        const offerLetter = await db_1.prisma.offerLetter.create({
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
                status: status || 'Pending Approval',
                candidateAddress: candidateAddress || 'Burdwan, West Bengal',
                placeOfJoining: placeOfJoining || 'chh sambhajinagar,Maharashtra,india',
                workMode: workMode || 'online',
                workingHours: workingHours || '4 to 6 hours per day, as assigned by the Reporting Manager',
                workingDays: workingDays || 'Monday - saturday',
                reportingManager: reportingManager || 'Managing Director',
                signatoryName: signatoryName || (isDirector ? (user?.name || 'Managing Director') : (user?.name || 'Operations Officer')),
                signatoryRole: signatoryRole || (isDirector ? 'Managing Director' : 'Operations Officer'),
                signatoryDepartment: signatoryDepartment || (isDirector ? 'Board of Directors, Enterprenex Solutions Pvt Ltd' : 'HR Team, Enterprenex Solutions Pvt Ltd')
            }
        });
        if (offerLetter.status === 'Pending Approval') {
            await (0, notification_service_1.notifyOfferPendingApproval)(offerLetter.offerLetterNo, offerLetter.employeeName, user?.name || 'HR Team');
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
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// PUT /api/v1/offer-letters/:id (Update offer letter details)
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const existing = await (0, exports.resolveOfferLetter)(id);
        if (!existing) {
            res.status(404).json({ error: 'Offer letter not found.' });
            return;
        }
        const updated = await db_1.prisma.offerLetter.update({
            where: { id: existing.id },
            data: {
                designation: data.designation ?? existing.designation,
                department: data.department ?? existing.department,
                joiningDate: data.joiningDate ?? existing.joiningDate,
                employmentType: data.employmentType ?? existing.employmentType,
                salaryMonthly: data.salaryMonthly !== undefined ? Number(data.salaryMonthly) : existing.salaryMonthly,
                ctcAnnual: data.ctcAnnual !== undefined ? Number(data.ctcAnnual) : existing.ctcAnnual,
                probationPeriod: data.probationPeriod ?? existing.probationPeriod,
                termsAndConditions: data.termsAndConditions ?? existing.termsAndConditions,
                status: data.status ?? existing.status,
                candidateAddress: data.candidateAddress ?? existing.candidateAddress,
                placeOfJoining: data.placeOfJoining ?? existing.placeOfJoining,
                workMode: data.workMode ?? existing.workMode,
                workingHours: data.workingHours ?? existing.workingHours,
                workingDays: data.workingDays ?? existing.workingDays,
                reportingManager: data.reportingManager ?? existing.reportingManager,
                signatoryName: data.signatoryName ?? existing.signatoryName,
                signatoryRole: data.signatoryRole ?? existing.signatoryRole,
                signatoryDepartment: data.signatoryDepartment ?? existing.signatoryDepartment
            }
        });
        res.json({ message: 'Offer letter updated.', offerLetter: updated });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// PUT /api/v1/offer-letters/:id/director-review (Director Approves or Rejects with remarks)
router.put('/:id/director-review', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const isDirectorRole = user?.role === 'Super Admin' || user?.role === 'Director' || user?.role === 'Managing Director';
        const isAuthorized = isDirectorRole ||
            user?.role === 'HR Manager' ||
            user?.role === 'HR' ||
            user?.role === 'Admin' ||
            user?.role === 'Operations Officer' ||
            user?.role === 'Project Manager' ||
            user?.department === 'Human Resources' ||
            !user;
        if (!isAuthorized) {
            res.status(403).json({ error: 'Access forbidden: Only HR or Director can approve or reject offer letters.' });
            return;
        }
        const { id } = req.params;
        const { action, remarks } = req.body; // action: 'Approve' | 'Reject'
        if (!action || !['Approve', 'Reject'].includes(action)) {
            res.status(400).json({ error: 'Action must be Approve or Reject.' });
            return;
        }
        const existing = await (0, exports.resolveOfferLetter)(id);
        if (!existing) {
            res.status(404).json({ error: 'Offer letter not found.' });
            return;
        }
        const newStatus = action === 'Approve' ? 'Approved' : 'Rejected';
        const updated = await db_1.prisma.offerLetter.update({
            where: { id: existing.id },
            data: {
                status: newStatus,
                directorRemarks: remarks || (action === 'Approve' ? 'Approved for dispatch.' : 'Revision requested.'),
                directorApprovedBy: user?.name || (isDirectorRole ? 'Managing Director' : 'Operations Officer'),
                directorApprovedAt: new Date(),
                signatoryName: action === 'Approve' ? (user?.name || 'Managing Director') : existing.signatoryName,
                signatoryRole: action === 'Approve' ? (isDirectorRole ? 'Managing Director' : 'Operations Officer') : existing.signatoryRole,
                signatoryDepartment: action === 'Approve' ? (isDirectorRole ? 'Board of Directors, Enterprenex Solutions Pvt Ltd' : 'HR Team, Enterprenex Solutions Pvt Ltd') : existing.signatoryDepartment
            }
        });
        await (0, notification_service_1.notifyOfferReviewed)(existing.offerLetterNo, existing.employeeName, action === 'Approve', remarks);
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
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST /api/v1/offer-letters/:id/send (HR sends approved offer letter via Nodemailer with PDF attachment)
router.post('/:id/send', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const existing = await (0, exports.resolveOfferLetter)(id);
        if (!existing) {
            res.status(404).json({ error: 'Offer letter not found.' });
            return;
        }
        if (existing.status !== 'Approved') {
            res.status(400).json({ error: 'Only Director-approved offer letters can be dispatched to candidates.' });
            return;
        }
        const updated = await db_1.prisma.offerLetter.update({
            where: { id: existing.id },
            data: {
                status: 'Sent',
                sentAt: new Date()
            }
        });
        // Generate Puppeteer PDF & Send Email
        let emailDispatched = false;
        try {
            const pdfBuffer = await (0, pdf_service_1.generateOfferLetterPdf)(updated);
            emailDispatched = await (0, email_service_1.sendOfferLetterEmail)(updated, pdfBuffer);
        }
        catch (e) {
            console.warn('PDF or Email generation warning:', e);
        }
        await (0, notification_service_1.notifyOfferSent)(existing.offerLetterNo, existing.employeeName, existing.employeeEmail);
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
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST or PUT /api/v1/offer-letters/:id/respond (Candidate/Employee Accepts or Declines)
const handleOfferResponse = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, remarks } = req.body; // action: 'Accept' | 'Decline'
        if (!action || !['Accept', 'Decline'].includes(action)) {
            res.status(400).json({ error: 'Action must be Accept or Decline.' });
            return;
        }
        const existing = await (0, exports.resolveOfferLetter)(id);
        if (!existing) {
            res.status(404).json({ error: 'Offer letter not found.' });
            return;
        }
        const newStatus = action === 'Accept' ? 'Accepted' : 'Declined';
        const updated = await db_1.prisma.offerLetter.update({
            where: { id: existing.id },
            data: {
                status: newStatus,
                respondedAt: new Date(),
                candidateResponseRemarks: remarks || null
            }
        });
        await (0, notification_service_1.notifyOfferResponse)(existing.offerLetterNo, existing.employeeName, action === 'Accept', remarks);
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
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
router.post('/:id/respond', auth_1.optionalAuth, handleOfferResponse);
router.put('/:id/respond', auth_1.optionalAuth, handleOfferResponse);
// DELETE /api/v1/offer-letters/:id (HR deletes a draft or rejected offer letter)
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await (0, exports.resolveOfferLetter)(id);
        if (!existing) {
            res.status(404).json({ error: 'Offer letter not found.' });
            return;
        }
        await db_1.prisma.offerLetter.delete({ where: { id: existing.id } });
        res.json({ message: 'Offer letter deleted.' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
