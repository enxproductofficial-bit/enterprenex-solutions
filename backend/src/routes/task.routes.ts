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

// POST /api/tasks/:id/stopwatch/start (Start Anti-Tamper Monitored Stopwatch Session)
router.post('/:id/stopwatch/start', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    const session = await prisma.taskTimeSession.create({
      data: {
        taskId: id,
        startedAt: new Date(),
        lastHeartbeatAt: new Date(),
        durationMinutes: 0,
        verifiedActiveMinutes: 0,
        idleMinutes: 0,
        heartbeatCount: 1,
        isTamperFlagged: false,
        activityNote: `Session initialized by ${req.user?.name || 'Staff'}`
      }
    });

    res.status(201).json({
      message: 'Verified stopwatch session started.',
      sessionId: session.id,
      startedAt: session.startedAt
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tasks/:id/stopwatch/heartbeat (Periodic Liveness & Presence Heartbeat)
router.post('/:id/stopwatch/heartbeat', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId, isTabActive, userActiveRecent } = req.body;
    if (!sessionId) {
      res.status(400).json({ error: 'sessionId is required for presence verification.' });
      return;
    }

    const session = await prisma.taskTimeSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      res.status(404).json({ error: 'Stopwatch session expired or not found.' });
      return;
    }

    const now = new Date();
    const lastHeartbeat = session.lastHeartbeatAt ? new Date(session.lastHeartbeatAt) : new Date(session.startedAt);
    const elapsedMinutes = Math.min(5, Math.max(0.5, (now.getTime() - lastHeartbeat.getTime()) / 60000));

    // If tab was hidden or user was inactive (e.g. watching YouTube / absent)
    const isIdle = !isTabActive || !userActiveRecent;
    const addedActive = isIdle ? 0 : Math.round(elapsedMinutes * 10) / 10;
    const addedIdle = isIdle ? Math.round(elapsedMinutes * 10) / 10 : 0;

    const isTamper = session.isTamperFlagged || (elapsedMinutes > 3.5); // Flag suspicious heartbeat gaps

    const updated = await prisma.taskTimeSession.update({
      where: { id: sessionId },
      data: {
        lastHeartbeatAt: now,
        heartbeatCount: session.heartbeatCount + 1,
        verifiedActiveMinutes: session.verifiedActiveMinutes + Math.round(addedActive),
        idleMinutes: session.idleMinutes + Math.round(addedIdle),
        isTamperFlagged: isTamper
      }
    });

    res.json({
      status: isIdle ? 'PAUSED_IDLE' : 'VERIFIED_ACTIVE',
      verifiedActiveMinutes: updated.verifiedActiveMinutes,
      idleMinutes: updated.idleMinutes,
      isTamperFlagged: updated.isTamperFlagged
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tasks/:id/stopwatch/stop (Stop and Credit ONLY Verified Active Hours)
router.post('/:id/stopwatch/stop', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { sessionId, activityNote } = req.body;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    const session = await prisma.taskTimeSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      res.status(404).json({ error: 'Active session not found.' });
      return;
    }

    const now = new Date();
    // Credit ONLY verified active time - idle/unmonitored time is strictly discarded
    const verifiedHours = Math.max(0.1, Math.round((session.verifiedActiveMinutes / 60) * 100) / 100);
    const totalSessionMinutes = Math.round((now.getTime() - new Date(session.startedAt).getTime()) / 60000);

    const updatedSession = await prisma.taskTimeSession.update({
      where: { id: sessionId },
      data: {
        endedAt: now,
        durationMinutes: totalSessionMinutes,
        activityNote: activityNote || session.activityNote
      }
    });

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        loggedHours: Math.round((task.loggedHours + verifiedHours) * 100) / 100
      }
    });

    res.json({
      message: `Stopwatch session ended. Credited +${verifiedHours} verified hours (${session.idleMinutes} mins idle uncredited).`,
      task: updatedTask,
      session: updatedSession,
      verifiedHours,
      discardedIdleMinutes: session.idleMinutes
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tasks/:id/log-time (Manual time logging with sanity check)
router.put('/:id/log-time', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { hours, sessionMinutes, activityNote } = req.body;

    const numHours = Number(hours || 0);
    if (numHours <= 0) {
      res.status(400).json({ error: 'Hours must be greater than 0.' });
      return;
    }

    // Security check: Reject abnormal single-log spikes (> 12 hours) to prevent sprint skewing
    if (numHours > 12) {
      res.status(400).json({
        error: 'Exceeds maximum permitted single-session log (12 hours). Lead authorization required.'
      });
      return;
    }

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        loggedHours: Math.round((task.loggedHours + numHours) * 100) / 100
      }
    });

    if (sessionMinutes) {
      const now = new Date();
      await prisma.taskTimeSession.create({
        data: {
          taskId: id,
          startedAt: new Date(now.getTime() - Number(sessionMinutes) * 60000),
          endedAt: now,
          durationMinutes: Number(sessionMinutes),
          verifiedActiveMinutes: Number(sessionMinutes),
          activityNote: activityNote || 'Manual logged session'
        }
      });
    }

    res.json({
      message: `Logged +${numHours} hours to task.`,
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
