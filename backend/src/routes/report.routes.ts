import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/v1/reports/workforce-summary
router.get('/workforce-summary', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    // Employees metrics
    const [
      totalEmployees,
      pendingOnboarding,
      employeesList,
      offerLettersList,
      tasksList
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({
        where: {
          approvalStatus: {
            in: ['Pending Approval', 'Pending Director Approval']
          }
        }
      }),
      prisma.employee.findMany({
        select: {
          id: true,
          employeeId: true,
          name: true,
          department: true,
          role: true,
          joinDate: true,
          approvalStatus: true,
          status: true,
          createdAt: true
        }
      }),
      prisma.offerLetter.findMany({
        select: {
          id: true,
          status: true,
          department: true,
          ctcAnnual: true,
          createdAt: true
        }
      }),
      prisma.task.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          assignedTo: true,
          department: true,
          projectName: true,
          dueDate: true,
          loggedHours: true,
          estimatedHours: true
        }
      })
    ]);

    const newlyJoinedEmployees = employeesList.filter(e => {
      if (e.joinDate && e.joinDate >= thirtyDaysAgoStr) return true;
      const createdDate = new Date(e.createdAt).toISOString().split('T')[0];
      return createdDate >= thirtyDaysAgoStr;
    }).length;

    // Offer letters metrics
    const totalOffers = offerLettersList.length;
    const pendingOffers = offerLettersList.filter(o => o.status === 'Pending Approval').length;
    const approvedOffers = offerLettersList.filter(o => o.status === 'Approved').length;
    const rejectedOffers = offerLettersList.filter(o => o.status === 'Rejected').length;
    const acceptedOffers = offerLettersList.filter(o => o.status === 'Accepted').length;

    // Tasks metrics
    const totalTasks = tasksList.length;
    const pendingTasks = tasksList.filter(t => ['Assigned', 'Accepted', 'To Do', 'Backlog'].includes(t.status)).length;
    const inProgressTasks = tasksList.filter(t => t.status === 'In Progress').length;
    const underReviewTasks = tasksList.filter(t => ['Under Review', 'In Review'].includes(t.status)).length;
    const completedTasks = tasksList.filter(t => ['Completed', 'Approved', 'Done'].includes(t.status)).length;
    const overdueTasks = tasksList.filter(t => {
      const isComplete = ['Completed', 'Approved', 'Done', 'Cancelled'].includes(t.status);
      return !isComplete && t.dueDate && t.dueDate < todayStr;
    }).length;

    res.json({
      summary: {
        totalEmployees,
        newlyJoinedEmployees,
        pendingOnboarding,
        totalOffers,
        pendingOffers,
        approvedOffers,
        rejectedOffers,
        acceptedOffers,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        underReviewTasks,
        completedTasks,
        overdueTasks
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/reports/employee-performance (with filtering by employee, department, project, date, status)
router.get('/employee-performance', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { employeeId, department, project, startDate, endDate, status } = req.query as Record<string, string>;

    const whereTask: any = {};

    if (department && department !== 'All') {
      whereTask.department = department;
    }
    if (project && project !== 'All') {
      whereTask.projectName = project;
    }
    if (status && status !== 'All') {
      whereTask.status = status;
    }
    if (startDate || endDate) {
      whereTask.dueDate = {};
      if (startDate) whereTask.dueDate.gte = startDate;
      if (endDate) whereTask.dueDate.lte = endDate;
    }

    const [employees, allTasks] = await Promise.all([
      prisma.employee.findMany({
        where: employeeId ? { OR: [{ id: employeeId }, { employeeId }] } : {},
        select: {
          id: true,
          employeeId: true,
          name: true,
          department: true,
          role: true,
          workloadPercentage: true,
          performanceRating: true
        }
      }),
      prisma.task.findMany({
        where: whereTask,
        select: {
          id: true,
          title: true,
          status: true,
          assignedTo: true,
          department: true,
          projectName: true,
          dueDate: true,
          loggedHours: true,
          estimatedHours: true
        }
      })
    ]);

    const todayStr = new Date().toISOString().split('T')[0];

    const performanceData = employees.map(emp => {
      const empTasks = allTasks.filter(t => {
        const assigned = (t.assignedTo || '').toLowerCase();
        const empName = (emp.name || '').toLowerCase();
        const eId = (emp.employeeId || '').toLowerCase();
        return (empName && assigned.includes(empName)) || (eId && assigned.includes(eId));
      });

      const total = empTasks.length;
      const completed = empTasks.filter(t => ['Completed', 'Approved', 'Done'].includes(t.status)).length;
      const inProgress = empTasks.filter(t => t.status === 'In Progress').length;
      const pending = empTasks.filter(t => ['Assigned', 'Accepted', 'To Do', 'Backlog'].includes(t.status)).length;
      const underReview = empTasks.filter(t => ['Under Review', 'In Review'].includes(t.status)).length;
      const overdue = empTasks.filter(t => {
        const isDone = ['Completed', 'Approved', 'Done', 'Cancelled'].includes(t.status);
        return !isDone && t.dueDate && t.dueDate < todayStr;
      }).length;

      const totalLoggedHours = empTasks.reduce((acc, t) => acc + (t.loggedHours || 0), 0);
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 100;

      return {
        employee: {
          id: emp.id,
          employeeId: emp.employeeId,
          name: emp.name,
          department: emp.department,
          role: emp.role,
          workloadPercentage: emp.workloadPercentage,
          performanceRating: emp.performanceRating
        },
        metrics: {
          totalTasks: total,
          completedTasks: completed,
          inProgressTasks: inProgress,
          pendingTasks: pending,
          underReviewTasks: underReview,
          overdueTasks: overdue,
          totalLoggedHours,
          completionRate
        }
      };
    });

    res.json({ performance: performanceData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
