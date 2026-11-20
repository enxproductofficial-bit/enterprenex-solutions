import { prisma } from './db';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🧹 Cleaning and resetting Enterprenex EWMS Database to production ready condition...');

  // 1. Wipe all transactional/demo data cleanly
  await prisma.taskComment.deleteMany({}).catch(() => {});
  await prisma.taskTimeSession.deleteMany({}).catch(() => {});
  await prisma.task.deleteMany({}).catch(() => {});
  await prisma.supportTicket.deleteMany({}).catch(() => {});
  await prisma.scheduledMeeting.deleteMany({}).catch(() => {});
  await prisma.companyAnnouncement.deleteMany({}).catch(() => {});
  await prisma.payrollRecord.deleteMany({}).catch(() => {});
  await prisma.exitRequest.deleteMany({}).catch(() => {});
  await prisma.asset.deleteMany({}).catch(() => {});
  await prisma.ewmsNotification.deleteMany({}).catch(() => {});
  await prisma.lead.deleteMany({}).catch(() => {});
  await prisma.vaultDocument.deleteMany({}).catch(() => {});
  await prisma.enterpriseEmail.deleteMany({}).catch(() => {});
  await prisma.attendanceRecord.deleteMany({}).catch(() => {});
  await prisma.leaveRequest.deleteMany({}).catch(() => {});
  await prisma.leaveBalance.deleteMany({}).catch(() => {});
  await prisma.invoice.deleteMany({}).catch(() => {});
  await prisma.expense.deleteMany({}).catch(() => {});
  await prisma.project.deleteMany({}).catch(() => {});
  await prisma.auditLog.deleteMany({}).catch(() => {});
  await prisma.kpiScorecard.deleteMany({}).catch(() => {});
  await prisma.objectiveKeyResult.deleteMany({}).catch(() => {});
  await prisma.offerLetter.deleteMany({}).catch(() => {});

  // 2. Remove any test users not in official company roster
  await prisma.user.deleteMany({
    where: {
      email: {
        notIn: [
          'director@enterprenex.solutions',
          'hr@enterprenex.solutions'
        ]
      }
    }
  }).catch(() => {});

  // 3. Remove all test employee records for fresh production deployment
  await prisma.employee.deleteMany({}).catch(() => {});

  // 4. Ensure official administrative accounts exist with initial seed credentials
  const seedPass = process.env.INITIAL_ADMIN_SEED_PASS || 'Enterprenex@Director2026';
  const defaultPasswordHash = await bcrypt.hash(seedPass, 10);

  // Director / Super Admin
  await prisma.user.upsert({
    where: { email: 'director@enterprenex.solutions' },
    update: {
      name: 'Managing Director',
      password: defaultPasswordHash,
      role: 'Super Admin',
      status: 'Active',
      mustChangePassword: false,
      employeeId: '202600000001'
    },
    create: {
      email: 'director@enterprenex.solutions',
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
  await prisma.user.upsert({
    where: { email: 'hr@enterprenex.solutions' },
    update: {
      password: defaultPasswordHash,
      role: 'Project Manager',
      status: 'Active',
      mustChangePassword: false
    },
    create: {
      email: 'hr@enterprenex.solutions',
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
    await prisma.$disconnect();
  });
