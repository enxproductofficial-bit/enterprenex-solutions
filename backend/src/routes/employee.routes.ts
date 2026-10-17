import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/employees (List all team members - with privacy sanitization for employees)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isDirectorOrManager =
      req.user?.role === 'Super Admin' ||
      req.user?.role === 'Project Manager' ||
      req.user?.email?.includes('director');

    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const formatted = employees.map(e => {
      const isSelf = req.user?.email === e.email || req.user?.employeeId === e.employeeId || req.user?.id === e.id;
      const canViewSensitiveHr = isDirectorOrManager || isSelf;

      return {
        ...e,
        name: (e.employeeId === '202600000001' || e.name === 'Rohit P.' || e.name === 'Rohit P' || e.name?.includes('Rohit P')) ? 'Rohit Pawar' : e.name,
        // Zero-Trust Data Privacy: Never expose private HR compensation or KYC documents of other staff to general employees
        salaryMonthly: canViewSensitiveHr ? e.salaryMonthly : undefined,
        panNumber: canViewSensitiveHr ? e.panNumber : undefined,
        panDocUrl: canViewSensitiveHr ? e.panDocUrl : undefined,
        aadhaarNumber: canViewSensitiveHr ? e.aadhaarNumber : undefined,
        aadhaarDocUrl: canViewSensitiveHr ? e.aadhaarDocUrl : undefined,
        skillsMatrix: e.skillsMatrixJson ? JSON.parse(e.skillsMatrixJson) : [],
        education: e.educationJson ? JSON.parse(e.educationJson) : []
      };
    });

    res.json({ employees: formatted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/employees (Create Employee - Director or Authorized Manager only)
router.post('/', authenticateToken, requireRole(['Super Admin', 'Project Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const isDirector = req.user?.role === 'Super Admin' || req.user?.email?.includes('director');

    // Rule: Manager-created accounts must be approved by Director before activation
    const initialApprovalStatus = isDirector ? (data.approvalStatus || 'Approved') : 'Pending Director Approval';

    // Rule: Password securely hashed using bcrypt (Zero-Trust Password Policy)
    const rawPassword = data.password || 'Enx_sol_121006';
    const hashedPassword = await import('bcryptjs').then(b => b.hash(rawPassword, 10));

    const newEmp = await prisma.employee.create({
      data: {
        employeeId: data.employeeId,
        password: hashedPassword,
        name: data.name,
        role: data.role,
        department: data.department || 'Engineering',
        email: data.email,
        phone: data.phone,
        avatar: data.avatar,
        salaryMonthly: Number(data.salaryMonthly || 50000),
        workloadPercentage: Number(data.workloadPercentage || 100),
        status: data.status || 'Active',
        approvalStatus: initialApprovalStatus,
        panNumber: data.panNumber,
        panDocUrl: data.panDocUrl,
        aadhaarNumber: data.aadhaarNumber,
        aadhaarDocUrl: data.aadhaarDocUrl,
        kycStatus: data.kycStatus || 'Not Submitted',
        employmentType: data.employmentType || 'Full Time',
        workMode: data.workMode || 'Hybrid',
        skillsMatrixJson: JSON.stringify(data.skillsMatrix || []),
        educationJson: JSON.stringify(data.education || []),
        joinDate: data.joinDate || new Date().toISOString().split('T')[0]
      }
    });

    // Also create portal User login account
    await prisma.user.upsert({
      where: { email: data.email },
      update: {
        name: data.name,
        employeeId: data.employeeId,
        role: data.role.includes('Director') ? 'Super Admin' : (data.role.includes('Manager') || data.role.includes('HR')) ? 'Project Manager' : 'Team Member',
        department: data.department,
        status: initialApprovalStatus === 'Approved' ? 'Active' : 'Inactive'
      },
      create: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        employeeId: data.employeeId,
        role: data.role.includes('Director') ? 'Super Admin' : (data.role.includes('Manager') || data.role.includes('HR')) ? 'Project Manager' : 'Team Member',
        department: data.department,
        avatar: data.avatar,
        status: initialApprovalStatus === 'Approved' ? 'Active' : 'Inactive'
      }
    });

    res.status(201).json({
      message: isDirector
        ? 'Employee account provisioned and active.'
        : 'Employee record created. Pending Managing Director approval before login is enabled.',
      employee: newEmp
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/employees/:id (Director Only - Employees cannot delete accounts)
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
router.put('/:id/skills/verify', authenticateToken, requireRole(['Super Admin', 'Project Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
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

    const currentMatrix = emp.skillsMatrixJson ? JSON.parse(emp.skillsMatrixJson) : [];
    const updatedMatrix = currentMatrix.map((sk: any) => {
      if (sk.name.toLowerCase() === skillName.toLowerCase()) {
        return {
          ...sk,
          verifiedRating: Number(verifiedRating || 5),
          isVerified: true,
          verifiedBy: req.user?.name || 'Managing Director'
        };
      }
      return sk;
    });

    const updated = await prisma.employee.update({
      where: { id: emp.id },
      data: { skillsMatrixJson: JSON.stringify(updatedMatrix) }
    });

    res.json({
      message: `Verified skill '${skillName}' at ${verifiedRating}/5 by ${req.user?.name}`,
      skillsMatrix: updatedMatrix
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/employees/:id (Update Details with Backend RBAC Restrictions)
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

    const isDirector = req.user?.role === 'Super Admin' || req.user?.email?.includes('director');
    const isManager = req.user?.role === 'Project Manager';
    const isSelf = req.user?.email === emp.email || req.user?.employeeId === emp.employeeId || req.user?.id === emp.id;

    // RBAC: An employee cannot edit other staff members
    if (!isDirector && !isManager && !isSelf) {
      res.status(403).json({ error: 'Access forbidden: Employees cannot modify other employee accounts.' });
      return;
    }

    // RBAC: Non-directors cannot change roles, compensation, or reporting relationships
    if (!isDirector) {
      if (updates.role && updates.role !== emp.role) {
        res.status(403).json({ error: 'Access forbidden: Employees and Managers cannot alter account roles.' });
        return;
      }
      if (updates.salaryMonthly !== undefined && updates.salaryMonthly !== emp.salaryMonthly) {
        res.status(403).json({ error: 'Access forbidden: Employees cannot modify compensation records.' });
        return;
      }
      if (!isManager && updates.department && updates.department !== emp.department) {
        res.status(403).json({ error: 'Access forbidden: Department changes require Director or Manager authorization.' });
        return;
      }
      if (updates.approvalStatus && updates.approvalStatus !== emp.approvalStatus) {
        res.status(403).json({ error: 'Access forbidden: Account approval status can only be modified by the Director.' });
        return;
      }
    }

    const updated = await prisma.employee.update({
      where: { id: emp.id },
      data: {
        name: isDirector ? updates.name : undefined,
        role: isDirector ? updates.role : undefined,
        department: isDirector || isManager ? updates.department : undefined,
        phone: updates.phone !== undefined ? updates.phone : emp.phone,
        avatar: updates.avatar !== undefined ? updates.avatar : emp.avatar,
        salaryMonthly: isDirector && updates.salaryMonthly !== undefined ? Number(updates.salaryMonthly) : undefined,
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
