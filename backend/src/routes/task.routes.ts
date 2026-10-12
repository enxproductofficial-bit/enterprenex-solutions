import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/tasks
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const formatted = tasks.map(t => ({
      ...t,
      subtasks: t.subtasksJson ? JSON.parse(t.subtasksJson) : [],
      tags: t.tagsJson ? JSON.parse(t.tagsJson) : []
    }));

    res.json({ tasks: formatted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tasks (Create task)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        projectName: data.projectName,
        assignedTo: data.assignedTo,
        reviewer: data.reviewer || 'Rohit P.',
        priority: data.priority || 'Medium',
        status: data.status || 'To Do',
        dueDate: data.dueDate,
        estimatedHours: Number(data.estimatedHours || 8),
        tagsJson: JSON.stringify(data.tags || ['Sprint Feature']),
        subtasksJson: JSON.stringify(data.subtasks || [
          { id: 'st-1', title: 'Architecture and core business logic', completed: false },
          { id: 'st-2', title: 'Unit testing & QA review checklist', completed: false }
        ])
      }
    });

    res.status(201).json({ task });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tasks/:id/log-time (Log stopwatch or manual time)
router.put('/:id/log-time', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { hours, sessionMinutes, activityNote } = req.body;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        loggedHours: Math.round((task.loggedHours + Number(hours || 0)) * 100) / 100
      }
    });

    // If session logged from live stopwatch
    if (sessionMinutes) {
      const now = new Date();
      await prisma.taskTimeSession.create({
        data: {
          taskId: id,
          startedAt: new Date(now.getTime() - Number(sessionMinutes) * 60000),
          endedAt: now,
          durationMinutes: Number(sessionMinutes),
          activityNote: activityNote || 'Stopwatch active session'
        }
      });
    }

    res.json({
      message: `Logged +${hours} hours to task.`,
      task: updated
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tasks/:id/review (Review Pipeline: Submit, Approve, Rework)
router.put('/:id/review', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // action: "submit" | "approve" | "rework"

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    let newStatus = task.status;
    if (action === 'submit') {
      newStatus = 'In Review';
    } else if (action === 'approve') {
      newStatus = 'Done';
    } else if (action === 'rework') {
      newStatus = 'Changes Required';
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        status: newStatus,
        reviewNotes: notes || task.reviewNotes
      }
    });

    res.json({
      message: `Task status updated to '${newStatus}'.`,
      task: updated
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
