import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { generateSecureEmployeeId, generateSecureTemporaryPassword, logAuditSecurityEntry } from '../services/security.service';
import { notifyNewEmployeeRegistered, notifyEmployeeApproved, notifyAccountActivated } from '../services/notification.service';
import bcrypt from 'bcryptjs';

const router = Router();

// POST /api/employees/generate-id (Generate Unique Sequential Collision-Free Employee ID Server-Side)
router.post('/generate-id', authenticateToken, requireRole(['Super Admin', 'Project Manager', 'HR Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { department } = req.body;
    const employeeId = await generateSecureEmployeeId(department || 'Engineering');
    res.json({ employeeId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/employees (List all team members - with privacy sanitization for employees)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isDirector =
      req.user?.role === 'Super Admin' ||
      req.user?.role?.includes('Director') ||
      req.user?.email?.includes('director');

    const isHr =
      req.user?.role === 'HR' ||
      req.user?.role === 'HR Manager' ||
      req.user?.department === 'Human Resources' ||
      req.user?.department === 'HR' ||
      req.user?.role?.includes('HR') ||
      req.user?.email?.includes('hr');

    const isManager = req.user?.role === 'Project Manager';
    const isDirectorOrManager = isDirector || isManager || isHr;
    const canViewAllPersonalContacts = isDirector || isHr;

    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const formatted = employees.map(e => {
      const isSelf = req.user?.email === e.email || req.user?.employeeId === e.employeeId || req.user?.id === e.id;
      const canViewSensitiveHr = isDirectorOrManager || isSelf;
      const canViewPersonalContact = canViewAllPersonalContacts || isSelf;

      return {
        ...e,
        name: (e.employeeId === '202600000001' || e.name === 'Rohit P.' || e.name === 'Rohit P' || e.name?.includes('Rohit P')) ? 'Rohit Pawar' : e.name,
        // Zero-Trust Data Privacy: Personal email & personal phone are STRICTLY private (HR & Director only, or Self)
        personalEmail: canViewPersonalContact ? e.personalEmail : undefined,
        personalPhone: canViewPersonalContact ? e.personalPhone : undefined,
        address: canViewPersonalContact ? e.address : undefined,
        salaryMonthly: canViewSensitiveHr ? e.salaryMonthly : undefined,
        ctcAnnual: canViewSensitiveHr ? e.ctcAnnual : undefined,
        panNumber: canViewSensitiveHr ? e.panNumber : undefined,
        panDocUrl: canViewSensitiveHr ? e.panDocUrl : undefined,
        aadhaarNumber: canViewSensitiveHr ? e.aadhaarNumber : undefined,
        aadhaarDocUrl: canViewSensitiveHr ? e.aadhaarDocUrl : undefined,
        resumeUrl: canViewSensitiveHr ? e.resumeUrl : undefined,
        documents: e.documentsJson ? JSON.parse(e.documentsJson) : [],
        skillsMatrix: e.skillsMatrixJson ? JSON.parse(e.skillsMatrixJson) : [],
        education: e.educationJson ? JSON.parse(e.educationJson) : []
      };
    });

    res.json({ employees: formatted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/employees (HR Employee Onboarding & Registration)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isDirector = req.user?.role === 'Super Admin' || req.user?.role?.includes('Director') || req.user?.email?.includes('director');
    const isHr = req.user?.role === 'HR' || req.user?.role === 'HR Manager' || req.user?.department === 'Human Resources' || req.user?.department === 'HR' || req.user?.role?.includes('HR') || req.user?.email?.includes('hr');
    const isManager = req.user?.role === 'Project Manager';

    if (!isDirector && !isHr && !isManager) {
      res.status(403).json({ error: 'Access forbidden: Only HR or Director can register new employees.' });
      return;
    }

    const data = req.body;
    if (!data.name || !data.email) {
      res.status(400).json({ error: 'Employee Full Name and Email Address are required.' });
      return;
    }

    // Auto-generate employee ID if not provided
    const assignedEmployeeId = data.employeeId || await generateSecureEmployeeId(data.department || 'Engineering');

    // Default status: Pending Approval as required
    const initialApprovalStatus = isDirector ? (data.approvalStatus || 'Approved') : 'Pending Approval';

    // Temporary password generation
    const rawPassword = data.password || generateSecureTemporaryPassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const monthlySalary = Number(data.salaryMonthly || 50000);
    const annualCtc = Number(data.ctcAnnual || monthlySalary * 12);

    const newEmp = await prisma.employee.create({
      data: {
        employeeId: assignedEmployeeId,
        password: hashedPassword,
        name: data.name,
        role: data.role || data.designation || 'Team Member',
        department: data.department || 'Engineering',
        email: data.email.trim().toLowerCase(),
        phone: data.phone || data.mobileNumber || '+91-9000000000',
        personalEmail: data.personalEmail || data.email,
        personalPhone: data.personalPhone || data.phone || data.mobileNumber,
        avatar: data.avatar || data.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        address: data.address || null,
        reportingManager: data.reportingManager || 'Rohit Pawar (Managing Director)',
        probationPeriod: data.probationPeriod || '3 Months',
        resumeUrl: data.resumeUrl || null,
        documentsJson: JSON.stringify(data.documents || data.requiredDocuments || []),
        salaryMonthly: monthlySalary,
        ctcAnnual: annualCtc,
        workloadPercentage: Number(data.workloadPercentage || 100),
        status: data.status || 'Active',
        approvalStatus: initialApprovalStatus,
        panNumber: data.panNumber || null,
        panDocUrl: data.panDocUrl || null,
        aadhaarNumber: data.aadhaarNumber || null,
        aadhaarDocUrl: data.aadhaarDocUrl || null,
        kycStatus: data.kycStatus || 'Not Submitted',
        employmentType: data.employmentType || 'Full-time',
        workMode: data.workMode || 'Hybrid',
        mustChangePassword: true,
        temporaryPassword: rawPassword,
        isAccountActivated: isDirector && initialApprovalStatus === 'Approved',
        skillsMatrixJson: JSON.stringify(data.skillsMatrix || []),
        educationJson: JSON.stringify(data.education || []),
        joinDate: data.joinDate || data.joiningDate || new Date().toISOString().split('T')[0]
      }
    });

    // Notify Director if registered by HR and pending approval
    if (initialApprovalStatus === 'Pending Approval') {
      await notifyNewEmployeeRegistered(
        newEmp.name,
        assignedEmployeeId,
        newEmp.department,
        req.user?.name || 'HR'
      );
    }

    // ISO 27001 Security Audit Log
    await logAuditSecurityEntry({
      action: 'EMPLOYEE_REGISTERED',
      category: 'Human Capital Governance',
      details: `Registered onboarding employee ${assignedEmployeeId} (${data.name}, ${data.department}) with status ${initialApprovalStatus}.`,
      actor: req.user?.name || req.user?.email || 'HR'
    });

    res.status(201).json({
      message: initialApprovalStatus === 'Pending Approval'
        ? `Employee ${data.name} (${assignedEmployeeId}) registered successfully with status 'Pending Approval'. Awaiting Director authorization.`
        : `Employee ${data.name} (${assignedEmployeeId}) created and activated.`,
      employee: newEmp,
      temporaryPassword: isDirector ? rawPassword : undefined
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/employees/:id/approval (Director reviews & approves/rejects onboarding)
router.put('/:id/approval', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const isDirector = user?.role === 'Super Admin' || user?.role?.includes('Director') || user?.email?.includes('director');

    if (!isDirector) {
      res.status(403).json({ error: 'Access forbidden: Only Managing Director can approve or reject employee registrations.' });
      return;
    }

    const { id } = req.params;
    const { action, remarks } = req.body; // action: 'Approve' | 'Reject'

    if (!action || !['Approve', 'Reject'].includes(action)) {
      res.status(400).json({ error: 'Action must be Approve or Reject.' });
      return;
    }

    const emp = await prisma.employee.findFirst({
      where: { OR: [{ id }, { employeeId: id }] }
    });

    if (!emp) {
      res.status(404).json({ error: 'Employee not found.' });
      return;
    }

    const isApprove = action === 'Approve';
    const updated = await prisma.employee.update({
      where: { id: emp.id },
      data: {
        approvalStatus: isApprove ? 'Approved' : 'Rejected',
        approvalRemarks: remarks || (isApprove ? 'Approved by Managing Director.' : 'Rejected during onboarding review.'),
        approvedBy: user?.name || 'Managing Director',
        approvedAt: new Date()
      }
    });

    await notifyEmployeeApproved(emp.name, emp.employeeId, isApprove, remarks);

    await logAuditSecurityEntry({
      action: `EMPLOYEE_ONBOARDING_${action.toUpperCase()}`,
      category: 'Executive Authorization',
      details: `Managing Director ${isApprove ? 'approved' : 'rejected'} onboarding for ${emp.name} (${emp.employeeId}). Remarks: ${remarks || 'None'}`,
      actor: user?.name || 'Managing Director'
    });

    res.json({
      message: `Employee onboarding ${isApprove ? 'Approved' : 'Rejected'}.`,
      employee: updated
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/employees/:id/activate (HR/Director Activates Employee Account)
router.post('/:id/activate', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const isDirector = user?.role === 'Super Admin' || user?.role?.includes('Director') || user?.email?.includes('director');
    const isHr = user?.role === 'HR' || user?.role === 'HR Manager' || user?.role === 'Project Manager' || user?.department === 'Human Resources';

    if (!isDirector && !isHr) {
      res.status(403).json({ error: 'Access forbidden: Only HR or Director can activate employee accounts.' });
      return;
    }

    const { id } = req.params;
    const { assignedRole } = req.body;

    const emp = await prisma.employee.findFirst({
      where: { OR: [{ id }, { employeeId: id }] }
    });

    if (!emp) {
      res.status(404).json({ error: 'Employee not found.' });
      return;
    }

    if (emp.approvalStatus !== 'Approved') {
      res.status(400).json({ error: 'Cannot activate account: Employee onboarding must be approved by the Director first.' });
      return;
    }

    // Generate secure temporary password
    const temporaryPassword = generateSecureTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Determine target User role
    const finalRole = assignedRole || (
      emp.role.includes('Director') ? 'Super Admin' :
      emp.role.includes('HR') || emp.department === 'Human Resources' ? 'HR Manager' :
      emp.role.includes('Manager') ? 'Project Manager' :
      emp.role.includes('Engineer') || emp.role.includes('Developer') ? 'Developer' :
      'Team Member'
    );

    // Update Employee record
    const updatedEmp = await prisma.employee.update({
      where: { id: emp.id },
      data: {
        password: hashedPassword,
        temporaryPassword,
        mustChangePassword: true,
        isAccountActivated: true,
        accountActivatedAt: new Date(),
        accountActivatedBy: user?.name || 'HR',
        status: 'Active'
      }
    });

    // Create or activate User login account
    await prisma.user.upsert({
      where: { email: emp.email },
      update: {
        name: emp.name,
        employeeId: emp.employeeId,
        password: hashedPassword,
        mustChangePassword: true,
        role: finalRole,
        department: emp.department,
        status: 'Active',
        avatar: emp.avatar
      },
      create: {
        email: emp.email,
        password: hashedPassword,
        name: emp.name,
        employeeId: emp.employeeId,
        mustChangePassword: true,
        role: finalRole,
        department: emp.department,
        avatar: emp.avatar,
        status: 'Active'
      }
    });

    await notifyAccountActivated(emp.name, emp.email, finalRole);

    await logAuditSecurityEntry({
      action: 'EMPLOYEE_ACCOUNT_ACTIVATED',
      category: 'Access Control & Provisioning',
      details: `Activated portal account for ${emp.name} (${emp.employeeId}) with role ${finalRole}. Temporary credentials generated.`,
      actor: user?.name || 'HR'
    });

    res.json({
      message: `Account for ${emp.name} has been activated with role ${finalRole}.`,
      employeeId: emp.employeeId,
      email: emp.email,
      role: finalRole,
      temporaryPassword // Returned once securely to HR for initial handover
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/employees/:id (Director Only)
router.delete('/:id', authenticateToken, requireRole(['Super Admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const emp = await prisma.employee.findFirst({
      where: { OR: [{ id }, { employeeId: id }] }
    });

    if (!emp) {
      res.status(404).json({ error: 'Employee not found.' });
      return;
    }

    if (emp.role?.includes('Director') || emp.employeeId === '202600000001') {
      res.status(403).json({ error: 'Executive Director accounts cannot be deleted.' });
      return;
    }

    await prisma.employee.delete({ where: { id: emp.id } });
    await prisma.user.deleteMany({ where: { OR: [{ email: emp.email }, { employeeId: emp.employeeId }] } });

    res.json({ message: `Employee account ${emp.name} (${emp.employeeId}) successfully purged.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/employees/:id/skills/verify (Manager / Director Verification Only)
router.put('/:id/skills/verify', authenticateToken, requireRole(['Super Admin', 'Project Manager', 'HR Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { skillName, verifiedRating } = req.body;

    const emp = await prisma.employee.findFirst({
      where: { OR: [{ id }, { employeeId: id }] }
    });

    if (!emp) {
      res.status(404).json({ error: 'Employee not found.' });
      return;
    }

    const currentSkills: any[] = emp.skillsMatrixJson ? JSON.parse(emp.skillsMatrixJson) : [];
    const updatedSkills = currentSkills.map(s => {
      if (s.name.toLowerCase() === skillName.toLowerCase()) {
        return {
          ...s,
          verifiedRating: Number(verifiedRating),
          isVerified: true,
          verifiedBy: req.user?.name || 'Authorized Lead',
          verifiedAt: new Date().toISOString()
        };
      }
      return s;
    });

    const updated = await prisma.employee.update({
      where: { id: emp.id },
      data: { skillsMatrixJson: JSON.stringify(updatedSkills) }
    });

    res.json({ message: `Skill ${skillName} verified at Level ${verifiedRating}/5.`, employee: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/employees/me/contact (Self-Service: Employees Updating Personal Phone & Personal Email)
router.put('/me/contact', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { personalPhone, personalEmail, phone, address } = req.body;

    const emp = await prisma.employee.findFirst({
      where: {
        OR: [
          { email: user.email },
          { employeeId: user.employeeId || 'NO_MATCH' }
        ]
      }
    });

    if (!emp) {
      res.status(404).json({ error: 'Employee profile not found.' });
      return;
    }

    const updated = await prisma.employee.update({
      where: { id: emp.id },
      data: {
        personalPhone: personalPhone !== undefined ? personalPhone : emp.personalPhone,
        personalEmail: personalEmail !== undefined ? personalEmail : emp.personalEmail,
        phone: phone !== undefined ? phone : emp.phone,
        address: address !== undefined ? address : emp.address
      }
    });

    res.json({ message: 'Personal contact details successfully updated.', employee: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/employees/:id (Update Employee Record)
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const emp = await prisma.employee.findFirst({
      where: { OR: [{ id }, { employeeId: id }] }
    });

    if (!emp) {
      res.status(404).json({ error: 'Employee not found.' });
      return;
    }

    const isDirector = req.user?.role === 'Super Admin' || req.user?.role?.includes('Director') || req.user?.email?.includes('director');
    const isHr = req.user?.role === 'HR' || req.user?.role === 'HR Manager' || req.user?.department === 'Human Resources' || req.user?.department === 'HR' || req.user?.role?.includes('HR') || req.user?.email?.includes('hr');
    const isManager = req.user?.role === 'Project Manager';
    const isSelf = req.user?.email === emp.email || req.user?.employeeId === emp.employeeId;

    if (!isDirector && !isHr && !isManager && !isSelf) {
      res.status(403).json({ error: 'Access forbidden: Employees cannot modify other employee accounts.' });
      return;
    }

    if (!isDirector) {
      if (updates.role && updates.role !== emp.role) {
        res.status(403).json({ error: 'Access forbidden: Employees and Managers cannot alter account roles.' });
        return;
      }
      if (updates.salaryMonthly !== undefined && updates.salaryMonthly !== emp.salaryMonthly) {
        res.status(403).json({ error: 'Access forbidden: Employees cannot modify compensation records.' });
        return;
      }
    }

    const canUpdateContact = isDirector || isHr || isSelf;

    const updated = await prisma.employee.update({
      where: { id: emp.id },
      data: {
        name: isDirector ? updates.name : undefined,
        role: isDirector ? updates.role : undefined,
        department: isDirector || isManager || isHr ? updates.department : undefined,
        phone: canUpdateContact && updates.phone !== undefined ? updates.phone : emp.phone,
        personalEmail: canUpdateContact && updates.personalEmail !== undefined ? updates.personalEmail : emp.personalEmail,
        personalPhone: canUpdateContact && updates.personalPhone !== undefined ? updates.personalPhone : emp.personalPhone,
        address: canUpdateContact && updates.address !== undefined ? updates.address : emp.address,
        reportingManager: isDirector || isHr ? updates.reportingManager : undefined,
        probationPeriod: isDirector || isHr ? updates.probationPeriod : undefined,
        avatar: updates.avatar !== undefined ? updates.avatar : emp.avatar,
        salaryMonthly: isDirector && updates.salaryMonthly !== undefined ? Number(updates.salaryMonthly) : undefined,
        ctcAnnual: isDirector && updates.ctcAnnual !== undefined ? Number(updates.ctcAnnual) : undefined,
        workloadPercentage: (isDirector || isManager) && updates.workloadPercentage !== undefined ? Number(updates.workloadPercentage) : undefined,
        status: isDirector ? updates.status : undefined,
        approvalStatus: isDirector ? updates.approvalStatus : undefined,
        panNumber: isDirector ? updates.panNumber : undefined,
        aadhaarNumber: isDirector ? updates.aadhaarNumber : undefined,
        kycStatus: isDirector || isManager ? updates.kycStatus : undefined,
        skillsMatrixJson: updates.skillsMatrix ? JSON.stringify(updates.skillsMatrix) : undefined,
        educationJson: updates.education ? JSON.stringify(updates.education) : undefined
      }
    });

    res.json({ message: 'Employee record successfully updated.', employee: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
