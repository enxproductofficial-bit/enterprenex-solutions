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
        reviewer: data.reviewer || 'Rohit Pawar',
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

// PUT /api/tasks/:id (General Task Updates with RBAC Status Control)
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    const isDirectorOrManager =
      req.user?.role === 'Super Admin' ||
      req.user?.role === 'Project Manager' ||
      req.user?.email?.includes('director');

    // Rule: General employees CANNOT unilaterally mark tasks as Approved or Completed
    if (updates.status && (updates.status === 'Approved' || updates.status === 'Completed')) {
      if (!isDirectorOrManager) {
        res.status(403).json({
          error: 'Access forbidden: Only Project Managers or Directors can approve and mark tasks as Completed.'
        });
        return;
      }
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: isDirectorOrManager ? updates.title : undefined,
        description: isDirectorOrManager ? updates.description : undefined,
        status: updates.status || task.status,
        dueDate: isDirectorOrManager ? updates.dueDate : undefined,
        priority: isDirectorOrManager ? updates.priority : undefined,
        assignedTo: isDirectorOrManager ? updates.assignedTo : undefined,
        reviewer: isDirectorOrManager ? updates.reviewer : undefined,
        loggedHours: updates.loggedHours !== undefined ? Number(updates.loggedHours) : undefined,
        subtasksJson: updates.subtasks ? JSON.stringify(updates.subtasks) : undefined,
        reviewNotes: updates.reviewNotes !== undefined ? updates.reviewNotes : undefined
      }
    });

    res.json({ message: 'Task updated successfully.', task: updated });
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

    const isDirectorOrManager =
      req.user?.role === 'Super Admin' ||
      req.user?.role === 'Project Manager' ||
      req.user?.email?.includes('director');

    // RBAC: Only authorized Managers or Directors can Approve or Request Rework
    if (action === 'approve' || action === 'rework') {
      if (!isDirectorOrManager) {
        res.status(403).json({
          error: 'Access forbidden: Only authorized Project Managers or Directors can approve tasks or request revisions.'
        });
        return;
      }
    }

    let newStatus = task.status;
    if (action === 'submit') {
      newStatus = 'In Review';
    } else if (action === 'approve') {
      newStatus = 'Approved';
    } else if (action === 'rework') {
      newStatus = 'Revision Required';
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

// POST /api/tasks/:id/report-blocker (Employee Blocker Reporting)
router.post('/:id/report-blocker', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { blockerReason } = req.body;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        status: 'Blocked',
        reviewNotes: `⚠️ BLOCKER REPORTED by ${req.user?.name || 'Assignee'}: ${blockerReason}`
      }
    });

    // Post to comments thread as well
    await prisma.taskComment.create({
      data: {
        taskId: id,
        author: req.user?.name || 'Assignee',
        text: `⚠️ BLOCKER ESCALATION: ${blockerReason}`
      }
    });

    res.json({ message: 'Task flagged as Blocked and escalated to Manager/Lead.', task: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tasks/:id/request-extension (Employee Deadline Extension Request)
router.post('/:id/request-extension', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { requestedDate, reason } = req.body;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    const commentText = `⏳ DEADLINE EXTENSION REQUESTED: ${req.user?.name || 'Assignee'} requested new deadline of ${requestedDate}. Reason: ${reason}`;

    await prisma.taskComment.create({
      data: {
        taskId: id,
        author: req.user?.name || 'Assignee',
        text: commentText
      }
    });

    res.json({ message: 'Deadline extension request logged and sent to Manager.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tasks/:id (Managers and Directors Only)
router.delete('/:id', authenticateToken, requireRole(['Super Admin', 'Project Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
