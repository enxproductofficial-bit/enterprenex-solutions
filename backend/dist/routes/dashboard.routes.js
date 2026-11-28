"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/v1/dashboard/workspace (Unified Employee "My Workspace" hub)
router.get('/workspace', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id || '';
        const userEmail = req.user?.email || '';
        const userName = req.user?.name || '';
        const today = new Date().toISOString().split('T')[0];
        // 1. Today's attendance
        const todayAttendance = await db_1.prisma.attendanceRecord.findFirst({
            where: {
                date: today,
                OR: [{ employeeId: userId }, { employeeName: userName }]
            }
        });
        // 2. Active tasks assigned to user
        const tasks = await db_1.prisma.task.findMany({
            where: {
                OR: [
                    { assignedTo: userName },
                    { assignedTo: { contains: userName } }
                ]
            },
            orderBy: { dueDate: 'asc' },
            take: 10
        });
        // 3. User's leave balance
        let leaveBalance = await db_1.prisma.leaveBalance.findFirst({
            where: {
                OR: [{ employeeId: userId }, { employeeName: userName }]
            }
        });
        if (!leaveBalance) {
            leaveBalance = {
                id: 'default',
                employeeId: userId,
                employeeName: userName,
                year: 2026,
                casualLeave: 12,
                sickLeave: 10,
                earnedLeave: 15,
                emergencyLeave: 5,
                unpaidLeave: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }
        // 4. Pending / recent leaves
        const recentLeaves = await db_1.prisma.leaveRequest.findMany({
            where: {
                OR: [{ employeeId: userId }, { employeeName: userName }]
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        // 5. Active announcements
        const allAnnouncements = await db_1.prisma.companyAnnouncement.findMany({
            where: { isArchived: false },
            orderBy: { publishedAt: 'desc' },
            take: 5
        });
        const announcements = allAnnouncements.map(a => {
            const readList = a.readByJson ? JSON.parse(a.readByJson) : [];
            return {
                ...a,
                hasRead: readList.includes(userId)
            };
        });
        // 6. Upcoming meetings
        const meetings = await db_1.prisma.scheduledMeeting.findMany({
            where: { status: 'Scheduled' },
            orderBy: { meetingTime: 'asc' },
            take: 5
        });
        // 7. Allocated assets
        const assets = await db_1.prisma.asset.findMany({
            where: {
                assignedToEmployeeId: req.user?.employeeId || userId
            }
        });
        res.json({
            employee: {
                id: userId,
                name: userName,
                email: userEmail,
                role: req.user?.role,
                department: req.user?.department || 'Engineering'
            },
            todayAttendance,
            tasks,
            leaveBalance,
            recentLeaves,
            announcements,
            meetings,
            assets
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/v1/dashboard/executive (Executive & C-Suite summary telemetry - Role Guarded)
router.get('/executive', auth_1.authenticateToken, (0, auth_1.requireRole)(['Super Admin', 'Project Manager', 'HR Manager']), async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const [totalEmployees, pendingOnboarding, pendingOfferLetters, totalProjects, activeTasks, todayAttendance, pendingLeaves, pendingExpenses] = await Promise.all([
            db_1.prisma.employee.count({ where: { status: 'Active' } }),
            db_1.prisma.employee.count({ where: { approvalStatus: 'Pending Approval' } }),
            db_1.prisma.offerLetter.count({ where: { status: 'Pending Approval' } }),
            db_1.prisma.project.count({ where: { status: { in: ['Active', 'Planning'] } } }),
            db_1.prisma.task.count({ where: { status: { notIn: ['Completed', 'Rejected'] } } }),
            db_1.prisma.attendanceRecord.findMany({ where: { date: today } }),
            db_1.prisma.leaveRequest.count({ where: { status: 'Pending' } }),
            db_1.prisma.expense.count({ where: { status: 'Pending' } })
        ]);
        const presentCount = todayAttendance.filter(r => r.status === 'Present').length;
        const lateCount = todayAttendance.filter(r => r.isLate).length;
        res.json({
            summary: {
                totalEmployees,
                pendingOnboarding,
                pendingOfferLetters,
                totalProjects,
                activeTasks,
                presentToday: presentCount,
                lateToday: lateCount,
                pendingLeaves,
                pendingExpenses
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
