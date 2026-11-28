"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function seed() {
    console.log('🧹 Cleaning and resetting Enterprenex EWMS Database to production ready condition...');
    // 1. Wipe all transactional/demo data cleanly
    await db_1.prisma.taskComment.deleteMany({}).catch(() => { });
    await db_1.prisma.taskTimeSession.deleteMany({}).catch(() => { });
    await db_1.prisma.task.deleteMany({}).catch(() => { });
    await db_1.prisma.supportTicket.deleteMany({}).catch(() => { });
    await db_1.prisma.scheduledMeeting.deleteMany({}).catch(() => { });
    await db_1.prisma.companyAnnouncement.deleteMany({}).catch(() => { });
    await db_1.prisma.payrollRecord.deleteMany({}).catch(() => { });
    await db_1.prisma.exitRequest.deleteMany({}).catch(() => { });
    await db_1.prisma.asset.deleteMany({}).catch(() => { });
    await db_1.prisma.ewmsNotification.deleteMany({}).catch(() => { });
    await db_1.prisma.lead.deleteMany({}).catch(() => { });
    await db_1.prisma.vaultDocument.deleteMany({}).catch(() => { });
    await db_1.prisma.enterpriseEmail.deleteMany({}).catch(() => { });
    await db_1.prisma.attendanceRecord.deleteMany({}).catch(() => { });
    await db_1.prisma.leaveRequest.deleteMany({}).catch(() => { });
    await db_1.prisma.leaveBalance.deleteMany({}).catch(() => { });
    await db_1.prisma.invoice.deleteMany({}).catch(() => { });
    await db_1.prisma.expense.deleteMany({}).catch(() => { });
    await db_1.prisma.project.deleteMany({}).catch(() => { });
    await db_1.prisma.auditLog.deleteMany({}).catch(() => { });
    await db_1.prisma.kpiScorecard.deleteMany({}).catch(() => { });
    await db_1.prisma.objectiveKeyResult.deleteMany({}).catch(() => { });
    await db_1.prisma.offerLetter.deleteMany({}).catch(() => { });
    // 2. Remove any test users not in official company roster
    await db_1.prisma.user.deleteMany({
        where: {
            email: {
                notIn: [
                    'director@enterprenexsolution.com',
                    'hr@enterprenexsolution.com'
                ]
            }
        }
    }).catch(() => { });
    // 3. Remove all test employee records for fresh production deployment
    await db_1.prisma.employee.deleteMany({}).catch(() => { });
    // 4. Ensure official administrative accounts exist with initial seed credentials
    const seedPass = process.env.INITIAL_ADMIN_SEED_PASS || 'Enx_sol_121006';
    const defaultPasswordHash = await bcryptjs_1.default.hash(seedPass, 10);
    // Director / Super Admin
    await db_1.prisma.user.upsert({
        where: { email: 'director@enterprenexsolution.com' },
        update: {
            name: 'Managing Director',
            password: defaultPasswordHash,
            role: 'Super Admin',
            status: 'Active',
            mustChangePassword: false,
            employeeId: '202600000001'
        },
        create: {
            email: 'director@enterprenexsolution.com',
            password: defaultPasswordHash,
            name: 'Managing Director',
            role: 'Super Admin',
            employeeId: '202600000001',
            department: 'Executive Board',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            status: 'Active',
            mustChangePassword: false
        }
    });
    // HR Administrator
    await db_1.prisma.user.upsert({
        where: { email: 'hr@enterprenexsolution.com' },
        update: {
            password: defaultPasswordHash,
            role: 'Project Manager',
            status: 'Active',
            mustChangePassword: false
        },
        create: {
            email: 'hr@enterprenexsolution.com',
            password: defaultPasswordHash,
            name: 'HR Administrator',
            role: 'Project Manager',
            department: 'Human Resources',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            status: 'Active',
            mustChangePassword: false
        }
    });
    console.log('✅ Enterprenex EWMS Database cleaned and primed for production use.');
}
seed()
    .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
})
    .finally(async () => {
    await db_1.prisma.$disconnect();
});
