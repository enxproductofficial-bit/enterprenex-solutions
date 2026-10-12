import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/employees (List all team members)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const formatted = employees.map(e => ({
      ...e,
      skillsMatrix: e.skillsMatrixJson ? JSON.parse(e.skillsMatrixJson) : [],
      education: e.educationJson ? JSON.parse(e.educationJson) : []
    }));

    res.json({ employees: formatted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/employees (Create Employee - Admin / HR only)
router.post('/', authenticateToken, requireRole(['Super Admin', 'Project Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const newEmp = await prisma.employee.create({
      data: {
        employeeId: data.employeeId,
        password: data.password || 'Enx_sol_121006',
        name: data.name,
        role: data.role,
        department: data.department || 'Engineering',
        email: data.email,
        phone: data.phone,
        avatar: data.avatar,
        salaryMonthly: Number(data.salaryMonthly || 50000),
        workloadPercentage: Number(data.workloadPercentage || 100),
        status: data.status || 'Active',
        approvalStatus: data.approvalStatus || 'Approved',
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
        role: data.role.includes('Director') ? 'Super Admin' : data.role.includes('HR') ? 'Project Manager' : 'Team Member',
        department: data.department
      },
      create: {
        email: data.email,
        password: data.password || 'Enx_sol_121006',
        name: data.name,
        employeeId: data.employeeId,
        role: data.role.includes('Director') ? 'Super Admin' : data.role.includes('HR') ? 'Project Manager' : 'Team Member',
        department: data.department,
        avatar: data.avatar
      }
    });

    res.status(201).json({ employee: newEmp });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/employees/:id/skills/verify (1-Click Manager Skill Verification)
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

// PUT /api/employees/:id (Update Employee Details)
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

    const updated = await prisma.employee.update({
      where: { id: emp.id },
      data: {
        name: updates.name,
        role: updates.role,
        department: updates.department,
        salaryMonthly: updates.salaryMonthly !== undefined ? Number(updates.salaryMonthly) : undefined,
        workloadPercentage: updates.workloadPercentage !== undefined ? Number(updates.workloadPercentage) : undefined,
        status: updates.status,
        approvalStatus: updates.approvalStatus,
        panNumber: updates.panNumber,
        aadhaarNumber: updates.aadhaarNumber,
        kycStatus: updates.kycStatus,
        skillsMatrixJson: updates.skillsMatrix ? JSON.stringify(updates.skillsMatrix) : undefined
      }
    });

    res.json({ employee: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
