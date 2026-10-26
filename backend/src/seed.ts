import { prisma } from './db';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('======================================================');
  console.log('🌱 SEEDING ENTERPRENEX SOLUTIONS EWMS DATABASE');
  console.log('======================================================\n');

  // Master demo password for all seeded enterprise roles
  const defaultPasswordHash = await bcrypt.hash('Enx_sol_121006', 10);

  // Clean reset of demo tables to eliminate duplicate key collisions
  console.log('🧹 Preparing clean database state...');
  await prisma.kpiScorecard.deleteMany({});
  await prisma.objectiveKeyResult.deleteMany({});
  await prisma.attendanceRecord.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.user.deleteMany({});

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. SEED USERS (Role-Based Access Control Credentials)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('👤 Seeding Enterprise Users...');

  // 1a. Managing Director / CEO (Executive Portal)
  await prisma.user.create({
    data: {
      email: 'director@enterprenex.solutions',
      password: defaultPasswordHash,
      name: 'Rohit Pawar',
      role: 'Director / CEO',
      employeeId: '202600000001',
      department: 'Executive Leadership',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'Active'
    }
  });

  // 1b. Lead Project Manager (Jyothi Anbhule)
  await prisma.user.create({
    data: {
      email: 'manager@enterprenex.solutions',
      password: defaultPasswordHash,
      name: 'Jyothi Anbhule',
      role: 'Manager',
      employeeId: '202600000002',
      department: 'Project Management',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      status: 'Active'
    }
  });

  // 1c. HR Administrator (Sneha Patil)
  await prisma.user.create({
    data: {
      email: 'hr@enterprenex.solutions',
      password: defaultPasswordHash,
      name: 'Sneha Patil',
      role: 'HR',
      employeeId: '202600000003',
      department: 'Human Resources',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      status: 'Active'
    }
  });

  // 1d. Senior Full Stack Engineer (Revanth Reddy)
  await prisma.user.create({
    data: {
      email: 'developer@enterprenex.solutions',
      password: defaultPasswordHash,
      name: 'Revanth Reddy',
      role: 'Employee',
      employeeId: '202600000004',
      department: 'Engineering',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'Active'
    }
  });

  // 1e. Cloud & DevOps Engineer (Vikram Verma)
  await prisma.user.create({
    data: {
      email: 'vikram@enterprenex.solutions',
      password: defaultPasswordHash,
      name: 'Vikram Verma',
      role: 'Employee',
      employeeId: '202600000005',
      department: 'DevOps & Cloud',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      status: 'Active'
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. SEED EMPLOYEES (EWMS Directory & KYC Vault)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('📋 Seeding Employee Profiles & KYC Records...');

  // 2a. Rohit Pawar
  await prisma.employee.create({
    data: {
      employeeId: '202600000001',
      name: 'Rohit Pawar',
      role: 'Managing Director & Lead Architect',
      department: 'Executive Leadership',
      email: 'director@enterprenex.solutions',
      phone: '+91-9226860060',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      salaryMonthly: 180000,
      workloadPercentage: 45,
      performanceRating: 5.0,
      status: 'Active',
      approvalStatus: 'Approved',
      panNumber: 'AAXPE1206M',
      aadhaarNumber: '782390124567',
      kycStatus: 'Verified',
      employmentType: 'Full Time',
      workMode: 'Hybrid',
      kpiScore: 98.0,
      okrScore: 96.0,
      skillsMatrixJson: JSON.stringify([
        { name: 'Enterprise Architecture', category: 'Architecture', level: 'Expert', rating: 5, verifiedRating: 5, isVerified: true, verifiedBy: 'Board' },
        { name: 'Cloud Infrastructure (AWS/GCP)', category: 'Cloud', level: 'Expert', rating: 5, verifiedRating: 5, isVerified: true, verifiedBy: 'Board' },
        { name: 'Executive Operations', category: 'Leadership', level: 'Expert', rating: 5, verifiedRating: 5, isVerified: true, verifiedBy: 'Board' }
      ]),
      joinDate: '2026-01-01'
    }
  });

  // 2b. Jyothi Anbhule (Lead Project Manager & Mentor)
  await prisma.employee.create({
    data: {
      employeeId: '202600000002',
      name: 'Jyothi Anbhule',
      role: 'Lead Project Manager & Mentor',
      department: 'Project Management',
      email: 'manager@enterprenex.solutions',
      phone: '+91-9876543201',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      salaryMonthly: 120000,
      workloadPercentage: 65,
      performanceRating: 4.9,
      status: 'Active',
      approvalStatus: 'Approved',
      panNumber: 'BBYPA3120J',
      aadhaarNumber: '654321098765',
      kycStatus: 'Verified',
      employmentType: 'Full Time',
      workMode: 'Hybrid',
      kpiScore: 96.5,
      okrScore: 94.0,
      skillsMatrixJson: JSON.stringify([
        { name: 'Agile & Sprint Governance', category: 'Management', level: 'Expert', rating: 5, verifiedRating: 5, isVerified: true, verifiedBy: 'Rohit Pawar' },
        { name: 'Blocker Escalation & Review Gates', category: 'Operations', level: 'Expert', rating: 5, verifiedRating: 5, isVerified: true, verifiedBy: 'Rohit Pawar' },
        { name: 'Engineering Mentorship', category: 'Leadership', level: 'Advanced', rating: 4, verifiedRating: 5, isVerified: true, verifiedBy: 'Rohit Pawar' }
      ]),
      joinDate: '2026-01-10'
    }
  });

  // 2c. Sneha Patil (Head of HR Operations)
  await prisma.employee.create({
    data: {
      employeeId: '202600000003',
      name: 'Sneha Patil',
      role: 'Head of HR & People Operations',
      department: 'Human Resources',
      email: 'hr@enterprenex.solutions',
      phone: '+91-9876543202',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      salaryMonthly: 95000,
      workloadPercentage: 55,
      performanceRating: 4.8,
      status: 'Active',
      approvalStatus: 'Approved',
      panNumber: 'CCYPP4592L',
      aadhaarNumber: '876543210987',
      kycStatus: 'Verified',
      employmentType: 'Full Time',
      workMode: 'Office',
      kpiScore: 95.0,
      okrScore: 92.5,
      skillsMatrixJson: JSON.stringify([
        { name: 'Statutory Compliance & KYC', category: 'HR', level: 'Expert', rating: 5, verifiedRating: 5, isVerified: true, verifiedBy: 'Rohit Pawar' },
        { name: 'Attendance & Leave Policy', category: 'HR', level: 'Expert', rating: 5, verifiedRating: 5, isVerified: true, verifiedBy: 'Rohit Pawar' }
      ]),
      joinDate: '2026-01-15'
    }
  });

  // 2d. Revanth Reddy (Senior Full Stack Engineer)
  await prisma.employee.create({
    data: {
      employeeId: '202600000004',
      name: 'Revanth Reddy',
      role: 'Senior Full Stack Engineer',
      department: 'Engineering',
      email: 'developer@enterprenex.solutions',
      phone: '+91-9876543210',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      salaryMonthly: 85000,
      workloadPercentage: 75,
      performanceRating: 4.9,
      status: 'Active',
      approvalStatus: 'Approved',
      panNumber: 'BBYPR4591K',
      aadhaarNumber: '918234567812',
      kycStatus: 'Verified',
      employmentType: 'Full Time',
      workMode: 'Hybrid',
      kpiScore: 94.2,
      okrScore: 92.0,
      skillsMatrixJson: JSON.stringify([
        { name: 'React 19 & Next.js', category: 'Frontend', level: 'Expert', rating: 5, verifiedRating: 5, isVerified: true, verifiedBy: 'Jyothi Anbhule' },
        { name: 'TypeScript & Node.js', category: 'Full Stack', level: 'Advanced', rating: 4, verifiedRating: 4, isVerified: true, verifiedBy: 'Jyothi Anbhule' },
        { name: 'PostgreSQL & Prisma ORM', category: 'Database', level: 'Advanced', rating: 4, verifiedRating: 4, isVerified: true, verifiedBy: 'Jyothi Anbhule' }
      ]),
      joinDate: '2026-02-01'
    }
  });

  // 2e. Vikram Verma (Cloud & DevOps Engineer)
  await prisma.employee.create({
    data: {
      employeeId: '202600000005',
      name: 'Vikram Verma',
      role: 'Cloud Infrastructure & DevOps Engineer',
      department: 'DevOps & Cloud',
      email: 'vikram@enterprenex.solutions',
      phone: '+91-9876543204',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      salaryMonthly: 80000,
      workloadPercentage: 70,
      performanceRating: 4.7,
      status: 'Active',
      approvalStatus: 'Approved',
      panNumber: 'DDYPV5812N',
      aadhaarNumber: '543210987654',
      kycStatus: 'Verified',
      employmentType: 'Full Time',
      workMode: 'Remote',
      kpiScore: 93.0,
      okrScore: 90.0,
      skillsMatrixJson: JSON.stringify([
        { name: 'Docker & Kubernetes', category: 'DevOps', level: 'Advanced', rating: 4, verifiedRating: 4, isVerified: true, verifiedBy: 'Jyothi Anbhule' },
        { name: 'CI/CD Pipelines & GitHub Actions', category: 'DevOps', level: 'Expert', rating: 5, verifiedRating: 5, isVerified: true, verifiedBy: 'Jyothi Anbhule' }
      ]),
      joinDate: '2026-02-15'
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. SEED ATTENDANCE RECORDS (Live Telemetry Demo)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('⏱️ Seeding Attendance Records...');
  const today = new Date().toISOString().split('T')[0];
  await prisma.attendanceRecord.createMany({
    data: [
      {
        id: 'att-1',
        employeeId: '202600000001',
        employeeName: 'Rohit Pawar',
        date: today,
        checkIn: '09:05 AM',
        checkOut: '-',
        status: 'Present'
      },
      {
        id: 'att-2',
        employeeId: '202600000002',
        employeeName: 'Jyothi Anbhule',
        date: today,
        checkIn: '09:12 AM',
        checkOut: '-',
        status: 'Present'
      },
      {
        id: 'att-3',
        employeeId: '202600000003',
        employeeName: 'Sneha Patil',
        date: today,
        checkIn: '09:15 AM',
        checkOut: '-',
        status: 'Present'
      },
      {
        id: 'att-4',
        employeeId: '202600000004',
        employeeName: 'Revanth Reddy',
        date: today,
        checkIn: '09:20 AM',
        checkOut: '-',
        status: 'Present'
      },
      {
        id: 'att-5',
        employeeId: '202600000005',
        employeeName: 'Vikram Verma',
        date: today,
        checkIn: '-',
        checkOut: '-',
        status: 'Absent',
        absenceReason: 'Statutory Leave Approved',
        absenceNotes: 'Planned remote DevOps cluster maintenance leave pre-authorized by Jyothi Anbhule.'
      }
    ]
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. SEED SPRINT TASKS (Assigned Across Personas & Review Gates)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('📌 Seeding Sprint Tasks & Review Gates...');
  await prisma.task.createMany({
    data: [
      {
        id: 'tsk-101',
        title: 'Live Task Stopwatch & Time Tracker',
        description: 'Implement real-time start/pause/stop stopwatch controls on active task cards with automatic session logging.',
        projectId: 'prj-1',
        projectName: 'Enterprise Web & AI Systems',
        assignedTo: 'Revanth Reddy',
        reviewer: 'Jyothi Anbhule',
        priority: 'High',
        status: 'In Progress',
        dueDate: '2026-10-30',
        loggedHours: 6.5,
        estimatedHours: 10,
        tagsJson: JSON.stringify(['Timer', 'Stopwatch', 'EWMS']),
        subtasksJson: JSON.stringify([
          { id: 'st-1', title: 'Start/Pause state machine with localStorage persistence', completed: true },
          { id: 'st-2', title: 'Real-time elapsed seconds counter & display', completed: true },
          { id: 'st-3', title: 'Auto-logging into cumulative task hours', completed: false }
        ])
      },
      {
        id: 'tsk-102',
        title: 'Workload & Capacity Redistribution Engine',
        description: 'Calculate weekly capacity 40h vs assigned tasks. Display Available (<70%), Healthy (70-100%), and Overloaded (>100%) badges.',
        projectId: 'prj-1',
        projectName: 'Enterprise Web & AI Systems',
        assignedTo: 'Vikram Verma',
        reviewer: 'Jyothi Anbhule',
        priority: 'Urgent',
        status: 'In Review',
        dueDate: '2026-10-31',
        loggedHours: 7.5,
        estimatedHours: 8,
        tagsJson: JSON.stringify(['Capacity', 'Planning', 'Workload'])
      },
      {
        id: 'tsk-103',
        title: 'KYC Vault & Statutory Compliance Records',
        description: 'Secure encryption and preview system for employee government identification files.',
        projectId: 'prj-2',
        projectName: 'Institutional HR & Compliance',
        assignedTo: 'Sneha Patil',
        reviewer: 'Rohit Pawar',
        priority: 'Medium',
        status: 'Completed',
        dueDate: '2026-10-25',
        loggedHours: 12.0,
        estimatedHours: 12,
        tagsJson: JSON.stringify(['Security', 'KYC', 'Compliance'])
      }
    ]
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. SEED KPI SCORECARDS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('📊 Seeding KPI Scorecards...');
  await prisma.kpiScorecard.create({
    data: {
      employeeId: '202600000004',
      employeeName: 'Revanth Reddy',
      roleTemplate: 'Software Developer',
      period: 'Q1 2026',
      finalKpiScore: 94.2,
      metricsJson: JSON.stringify([
        { id: 'm-1', name: 'Sprint Velocity & On-Time Delivery', weight: 30, target: '95% On-Time', actual: '94% Delivered', score: 92 },
        { id: 'm-2', name: 'Code Quality & Bug-Free Deployments', weight: 25, target: '<2 Minor Bugs/Sprint', actual: '0 Critical Bugs', score: 98 },
        { id: 'm-3', name: 'Stopwatch Task Tracking Discipline', weight: 25, target: '100% Time Logged', actual: '96% Accurately Logged', score: 95 },
        { id: 'm-4', name: 'Technical Mentorship & Code Reviews', weight: 20, target: '2 Reviews/Week', actual: '3 Reviews/Week', score: 90 }
      ])
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. SEED OKRs (Company Strategic Goals)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('🎯 Seeding Institutional OKRs...');
  await prisma.objectiveKeyResult.create({
    data: {
      id: 'okr-1',
      objectiveTitle: 'Launch Enterprise EWMS v1.0 & Client Onboarding Platform',
      department: 'Engineering',
      ownerName: 'Rohit Pawar',
      period: 'Q1 2026',
      progressPercent: 88,
      keyResultsJson: JSON.stringify([
        { id: 'kr-1', title: 'Live Task Stopwatch & Sprint Review pipeline deployed', target: '100%', current: '100%', progressPercent: 100 },
        { id: 'kr-2', title: 'Biometric Daily Check-In & Statutory KYC Vault active', target: '100%', current: '95%', progressPercent: 95 },
        { id: 'kr-3', title: 'Sub-second API response latency on enterprise dashboards', target: '<1.0s', current: '0.8s', progressPercent: 90 }
      ])
    }
  });

  console.log('\n======================================================');
  console.log('✅ ENTERPRENEX EWMS SEEDED SUCCESSFULLY');
  console.log('======================================================');
  console.log('🔑 UNAMBIGUOUS TEST CREDENTIALS (Password: Enx_sol_121006):');
  console.log('  1. Director / CEO : director@enterprenex.solutions (Rohit Pawar)');
  console.log('  2. Project Manager : manager@enterprenex.solutions  (Jyothi Anbhule)');
  console.log('  3. HR Admin        : hr@enterprenex.solutions       (Sneha Patil)');
  console.log('  4. Developer Staff : developer@enterprenex.solutions(Revanth Reddy)');
  console.log('  5. Cloud / DevOps  : vikram@enterprenex.solutions   (Vikram Verma)');
  console.log('======================================================\n');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
