import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { emitNotification } from '../services/notification.service';

const router = Router();

// GET /api/v1/assets (List assets)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isDirectorOrHr = req.user?.role === 'Super Admin' || req.user?.role === 'Project Manager' || req.user?.role === 'HR Manager' || req.user?.email?.includes('director');
    const { category, status } = req.query as Record<string, string>;

    const where: any = {};
    if (!isDirectorOrHr) {
      where.assignedToEmployeeId = req.user?.employeeId || req.user?.id;
    }
    if (category) where.category = category;
    if (status) where.status = status;

    const assets = await prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const parsed = assets.map(a => ({
      ...a,
      requests: a.requestsJson ? JSON.parse(a.requestsJson) : []
    }));

    res.json({ assets: parsed });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/assets (Create new asset in inventory)
router.post('/', authenticateToken, requireRole(['Super Admin', 'Project Manager', 'HR Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category, serialNumber, condition = 'Good' } = req.body;

    if (!name || !category) {
      res.status(400).json({ error: 'Asset name and category are required.' });
      return;
    }

    const tag = `ENX-${category.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const asset = await prisma.asset.create({
      data: {
        assetTag: tag,
        name,
        category,
        serialNumber: serialNumber || null,
        condition,
        status: 'Available',
        requestsJson: '[]'
      }
    });

    res.status(201).json({
      message: 'Asset cataloged successfully.',
      asset
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/assets/:id/allocate (Assign asset to employee)
router.patch('/:id/allocate', authenticateToken, requireRole(['Super Admin', 'Project Manager', 'HR Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { employeeId, employeeName } = req.body;

    if (!employeeId || !employeeName) {
      res.status(400).json({ error: 'Employee ID and name are required.' });
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        assignedToEmployeeId: employeeId,
        assignedToEmployeeName: employeeName,
        assignedDate: todayStr,
        returnDate: null,
        status: 'Assigned'
      }
    });

    // Notify employee
    await emitNotification({
      type: 'ASSET_ALLOCATED',
      title: `Asset Allocated: ${updated.name}`,
      message: `Hardware asset ${updated.name} (${updated.assetTag}) has been assigned to you.`,
      recipientRole: 'Team Member',
      recipientEmployeeId: employeeId,
      actionUrl: '/dashboard'
    });

    res.json({
      message: `Asset ${updated.assetTag} allocated to ${employeeName}.`,
      asset: updated
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/assets/:id/return (Return asset to inventory)
router.patch('/:id/return', authenticateToken, requireRole(['Super Admin', 'Project Manager', 'HR Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { condition = 'Good' } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        returnDate: todayStr,
        status: 'Available',
        condition,
        assignedToEmployeeId: null,
        assignedToEmployeeName: null
      }
    });

    res.json({
      message: `Asset ${updated.assetTag} returned to inventory.`,
      asset: updated
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/assets/request (Employee requests hardware/equipment)
router.post('/request', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, reason, urgency = 'Medium' } = req.body;
    const employeeName = req.user?.name || 'Staff Member';
    const employeeId = req.user?.employeeId || req.user?.id || 'EMP-TEMP';

    // Broadcast asset request notification to HR / IT
    await emitNotification({
      type: 'ASSET_REQUESTED',
      title: `Asset Request: ${category}`,
      message: `${employeeName} (${employeeId}) requested ${category} (${urgency} priority): ${reason}`,
      recipientRole: 'Super Admin',
      actionUrl: '/team'
    });

    res.status(201).json({
      message: `Asset request for ${category} submitted to IT & HR management.`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

