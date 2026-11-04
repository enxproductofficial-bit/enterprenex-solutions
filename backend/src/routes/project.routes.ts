import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { emitNotification } from '../services/notification.service';

const router = Router();

// GET /api/v1/projects (List projects)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, managerEmail } = req.query as Record<string, string>;
    const where: any = {};
    if (status) where.status = status;
    if (managerEmail) where.managerEmail = managerEmail;

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const parsed = projects.map(p => ({
      ...p,
      teamMembers: p.teamMembersJson ? JSON.parse(p.teamMembersJson) : [],
      milestones: p.milestonesJson ? JSON.parse(p.milestonesJson) : []
    }));

    res.json({ projects: parsed });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/projects/:id
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id }
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    res.json({
      project: {
        ...project,
        teamMembers: project.teamMembersJson ? JSON.parse(project.teamMembersJson) : [],
        milestones: project.milestonesJson ? JSON.parse(project.milestonesJson) : []
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/projects (HR / Director / Project Manager creates new project)
router.post('/', authenticateToken, requireRole(['Super Admin', 'Project Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      client,
      status = 'Planning',
      budget = 0,
      startDate,
      deadline,
      teamSize = 3,
      managerName,
      managerEmail,
      teamMembers = [],
      milestones = []
    } = req.body;

    if (!title || !client || !deadline) {
      res.status(400).json({ error: 'Title, client, and deadline are required.' });
      return;
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        client,
        status,
        budget: Number(budget) || 0,
        startDate: startDate || new Date().toISOString().split('T')[0],
        deadline,
        teamSize: Number(teamSize) || teamMembers.length || 3,
        managerName: managerName || req.user?.name || 'Project Manager',
        managerEmail: managerEmail || req.user?.email,
        teamMembersJson: JSON.stringify(teamMembers),
        milestonesJson: JSON.stringify(milestones),
        completionRate: 0
      }
    });

    // Notify assigned members
    if (teamMembers.length > 0) {
      await emitNotification({
        type: 'PROJECT_ASSIGNED',
        title: `Added to Project: ${title}`,
        message: `You were added to the engineering team for ${title} (${client}).`,
        recipientRole: 'Team Member',
        actionUrl: '/projects'
      });
    }

    res.status(201).json({
      message: 'Project created successfully.',
      project: {
        ...project,
        teamMembers,
        milestones
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/projects/:id (Update general project details)
router.patch('/:id', authenticateToken, requireRole(['Super Admin', 'Project Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, client, status, budget, deadline, completionRate } = req.body;

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (client !== undefined) data.client = client;
    if (status !== undefined) data.status = status;
    if (budget !== undefined) data.budget = Number(budget);
    if (deadline !== undefined) data.deadline = deadline;
    if (completionRate !== undefined) data.completionRate = Number(completionRate);

    const updated = await prisma.project.update({
      where: { id },
      data
    });

    res.json({
      message: 'Project details updated.',
      project: updated
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/projects/:id/milestones (Add or update milestones)
router.patch('/:id/milestones', authenticateToken, requireRole(['Super Admin', 'Project Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { milestones, completionRate } = req.body;

    const data: any = {
      milestonesJson: JSON.stringify(milestones || [])
    };
    if (completionRate !== undefined) {
      data.completionRate = Number(completionRate);
    }

    const updated = await prisma.project.update({
      where: { id },
      data
    });

    res.json({
      message: 'Project milestones updated.',
      project: {
        ...updated,
        milestones: JSON.parse(updated.milestonesJson || '[]')
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/projects/:id/team (Update team allocations)
router.patch('/:id/team', authenticateToken, requireRole(['Super Admin', 'Project Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { teamMembers } = req.body;

    const updated = await prisma.project.update({
      where: { id },
      data: {
        teamMembersJson: JSON.stringify(teamMembers || []),
        teamSize: (teamMembers || []).length
      }
    });

    res.json({
      message: 'Project team members updated.',
      project: {
        ...updated,
        teamMembers: JSON.parse(updated.teamMembersJson || '[]')
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

