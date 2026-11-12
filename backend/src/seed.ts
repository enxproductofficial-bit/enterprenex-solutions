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
          'hr@enterprenex.solutions',
          'revanth@enterprenex.solutions',
          'polamreddyrevanth.82@gmail.com'
        ]
      }
    }
  }).catch(() => {});

  // 3. Remove any test employees not in official company roster
  await prisma.employee.deleteMany({
    where: {
      employeeId: {
        notIn: ['202600000001', '202600000002', 'ZCX-EMP-0001']
      }
    }
  }).catch(() => {});

  // 4. Ensure official permanent founding users exist with master password Enx_sol_121006
  const defaultPasswordHash = await bcrypt.hash('Enx_sol_121006', 10);

  // Director / Super Admin
  await prisma.user.upsert({
    where: { email: 'director@enterprenex.solutions' },
    update: {
      password: defaultPasswordHash,
      role: 'Super Admin',
      status: 'Active',
      mustChangePassword: false,
      employeeId: '202600000001'
    },
    create: {
      email: 'director@enterprenex.solutions',
      password: defaultPasswordHash,
      name: 'Rohit Pawar',
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

  // Polamreddy Revanth Reddy
  await prisma.user.upsert({
    where: { email: 'polamreddyrevanth.82@gmail.com' },
    update: {
      employeeId: 'ZCX-EMP-0001',
      password: defaultPasswordHash,
      role: 'Developer',
      status: 'Active',
      mustChangePassword: false
    },
    create: {
      email: 'polamreddyrevanth.82@gmail.com',
      password: defaultPasswordHash,
      name: 'POLAMREDDY REVANTH REDDY',
      role: 'Developer',
      employeeId: 'ZCX-EMP-0001',
      department: 'Engineering',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'Active',
      mustChangePassword: false
    }
  });

  await prisma.user.upsert({
    where: { email: 'revanth@enterprenex.solutions' },
    update: {
      employeeId: '202600000002',
      password: defaultPasswordHash,
      role: 'Developer',
      status: 'Active',
      mustChangePassword: false
    },
    create: {
      email: 'revanth@enterprenex.solutions',
      password: defaultPasswordHash,
      name: 'POLAMREDDY REVANTH REDDY',
      role: 'Developer',
      employeeId: '202600000002',
      department: 'Engineering',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'Active',
      mustChangePassword: false
    }
  });

  // 5. Ensure official employees exist
  await prisma.employee.upsert({
    where: { employeeId: '202600000001' },
    update: {
      status: 'Active',
      approvalStatus: 'Approved',
      isAccountActivated: true
    },
    create: {
      employeeId: '202600000001',
      name: 'Rohit Pawar',
      role: 'Managing Director & Lead Architect',
      department: 'Executive Board',
      email: 'director@enterprenex.solutions',
      phone: '+91-9226860060',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      salaryMonthly: 150000,
      workloadPercentage: 0,
      performanceRating: 5.0,
      status: 'Active',
      approvalStatus: 'Approved',
      isAccountActivated: true,
      panNumber: 'AAXPE1206M',
      aadhaarNumber: '782390124567',
      kycStatus: 'Verified',
      employmentType: 'Full Time',
      workMode: 'Hybrid',
      joinDate: '2026-01-01'
    }
  });

  await prisma.employee.upsert({
    where: { employeeId: 'ZCX-EMP-0001' },
    update: {
      approvalStatus: 'Approved',
      isAccountActivated: true,
      status: 'Active',
      password: defaultPasswordHash
    },
    create: {
      employeeId: 'ZCX-EMP-0001',
      name: 'POLAMREDDY REVANTH REDDY',
      role: 'Full Stack Developer (Employee)',
      department: 'Engineering',
      email: 'revanth@enterprenex.solutions',
      personalEmail: 'polamreddyrevanth.82@gmail.com',
      phone: '+919440829762',
      personalPhone: '+919440829762',
      password: defaultPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      salaryMonthly: 85000,
      workloadPercentage: 0,
      performanceRating: 5.0,
      status: 'Active',
      approvalStatus: 'Approved',
      isAccountActivated: true,
      joinDate: '2026-11-10'
    }
  });

  await prisma.employee.upsert({
    where: { employeeId: '202600000002' },
    update: {
      approvalStatus: 'Approved',
      isAccountActivated: true,
      status: 'Active'
    },
    create: {
      employeeId: '202600000002',
      name: 'POLAMREDDY REVANTH REDDY',
      role: 'Full Stack Engineer & AI Specialist',
      department: 'Engineering',
      email: 'revanth@enterprenex.solutions',
      phone: '+91-9876543210',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      salaryMonthly: 85000,
      workloadPercentage: 0,
      performanceRating: 5.0,
      status: 'Active',
      approvalStatus: 'Approved',
      isAccountActivated: true,
      panNumber: 'BBYPR4591K',
      aadhaarNumber: '918234567812',
      kycStatus: 'Verified',
      employmentType: 'Full Time',
      workMode: 'Hybrid',
      joinDate: '2026-02-01'
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
