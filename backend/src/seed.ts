import { prisma } from './db';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding Enterprenex EWMS Database...');

  const defaultPasswordHash = await bcrypt.hash('Enx_sol_121006', 10);

  // 1. Seed Users
  await prisma.user.upsert({
    where: { email: 'director@enterprenex.solutions' },
    update: {},
    create: {
      email: 'director@enterprenex.solutions',
      password: defaultPasswordHash,
      name: 'Rohit Pawar',
      role: 'Super Admin',
      employeeId: '202600000001',
      department: 'Engineering',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'Active'
    }
  });

  await prisma.user.upsert({
    where: { email: 'revanth@enterprenex.solutions' },
    update: {},
    create: {
      email: 'revanth@enterprenex.solutions',
      password: defaultPasswordHash,
      name: 'POLAMREDDY REVANTH REDDY',
      role: 'Developer',
      employeeId: '202600000002',
      department: 'Engineering',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'Active'
    }
  });

  // 2. Seed Employees
  await prisma.employee.upsert({
    where: { employeeId: '202600000001' },
    update: {},
    create: {
      employeeId: '202600000001',
      name: 'Rohit Pawar',
      role: 'Managing Director & Lead Architect',
      department: 'Engineering',
      email: 'director@enterprenex.solutions',
      phone: '+91-9226860060',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      salaryMonthly: 150000,
      workloadPercentage: 45,
      performanceRating: 5.0,
      status: 'Active',
      approvalStatus: 'Approved',
      panNumber: 'AAXPE1206M',
      aadhaarNumber: '782390124567',
      kycStatus: 'Verified',
      employmentType: 'Full Time',
      workMode: 'Hybrid',
      kpiScore: 96.0,
      okrScore: 95.0,
      skillsMatrixJson: JSON.stringify([
        { name: 'System Architecture', category: 'Architecture', level: 'Expert', rating: 5, verifiedRating: 5, isVerified: true, verifiedBy: 'Board' },
        { name: 'Cloud Infrastructure (AWS)', category: 'Cloud', level: 'Expert', rating: 5, verifiedRating: 5, isVerified: true, verifiedBy: 'Board' },
        { name: 'AI & Machine Learning', category: 'AI/ML', level: 'Advanced', rating: 4, verifiedRating: 5, isVerified: true, verifiedBy: 'Board' },
        { name: 'React / Next.js', category: 'Frontend', level: 'Expert', rating: 5, verifiedRating: 5, isVerified: true, verifiedBy: 'Board' },
        { name: 'Node.js & Microservices', category: 'Backend', level: 'Expert', rating: 5, verifiedRating: 5, isVerified: true, verifiedBy: 'Board' }
      ]),
      joinDate: '2026-01-01'
    }
  });

  await prisma.employee.upsert({
    where: { employeeId: '202600000002' },
    update: {},
    create: {
      employeeId: '202600000002',
      name: 'POLAMREDDY REVANTH REDDY',
      role: 'Full Stack Engineer & AI Specialist',
      department: 'Engineering',
      email: 'revanth@enterprenex.solutions',
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
        { name: 'React 19 & Next.js', category: 'Frontend', level: 'Expert', rating: 5, verifiedRating: 5, isVerified: true, verifiedBy: 'Rohit Pawar' },
        { name: 'TypeScript & JavaScript', category: 'Frontend', level: 'Advanced', rating: 4, verifiedRating: 4, isVerified: true, verifiedBy: 'Rohit Pawar' },
        { name: 'Node.js & Express', category: 'Backend', level: 'Advanced', rating: 4, verifiedRating: 4, isVerified: true, verifiedBy: 'Rohit Pawar' },
        { name: 'PostgreSQL & Database Architecture', category: 'Database', level: 'Advanced', rating: 4, verifiedRating: 4, isVerified: true, verifiedBy: 'Rohit Pawar' },
        { name: 'Tailwind CSS & Minimalist Design', category: 'Frontend', level: 'Expert', rating: 5, verifiedRating: 5, isVerified: true, verifiedBy: 'Rohit Pawar' },
        { name: 'Cloud Deployment & Vercel', category: 'Cloud & DevOps', level: 'Intermediate', rating: 3, verifiedRating: 4, isVerified: true, verifiedBy: 'Rohit Pawar' }
      ]),
      joinDate: '2026-02-01'
    }
  });

  // 3. Seed Attendance Records
  const existingAtt = await prisma.attendanceRecord.count();
  if (existingAtt === 0) {
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
          employeeName: 'POLAMREDDY REVANTH REDDY',
          date: today,
          checkIn: '09:20 AM',
          checkOut: '-',
          status: 'Present'
        },
        {
          id: 'att-3',
          employeeId: '202600000003',
          employeeName: 'Ananya Sharma',
          date: today,
          checkIn: '-',
          checkOut: '-',
          status: 'Absent',
          absenceReason: 'No Intimation Provided',
          absenceNotes: 'Awaiting check-in intimation. Direct outreach pending from HR Lead.',
          notifiedViaJson: JSON.stringify(['WhatsApp'])
        }
      ]
    });
  }

  // 4. Seed Tasks
  const existingTasks = await prisma.task.count();
  if (existingTasks === 0) {
    await prisma.task.createMany({
      data: [
        {
          id: 'tsk-101',
          title: 'Live Task Stopwatch & Time Tracker',
          description: 'Implement real-time start/pause/stop stopwatch controls on active task cards with automatic session logging.',
          projectId: 'prj-1',
          projectName: 'Enterprise Web & AI Systems',
          assignedTo: 'POLAMREDDY REVANTH REDDY',
          reviewer: 'Rohit Pawar',
          priority: 'High',
          status: 'In Progress',
          dueDate: '2026-10-14',
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
          assignedTo: 'POLAMREDDY REVANTH REDDY',
          reviewer: 'Rohit Pawar',
          priority: 'Urgent',
          status: 'To Do',
          dueDate: '2026-10-15',
          loggedHours: 2.0,
          estimatedHours: 8,
          tagsJson: JSON.stringify(['Capacity', 'Planning', 'Workload'])
        }
      ]
    });
  }

  // 5. Seed KPI Scorecards
  await prisma.kpiScorecard.upsert({
    where: { employeeId: '202600000002' },
    update: {},
    create: {
      employeeId: '202600000002',
      employeeName: 'POLAMREDDY REVANTH REDDY',
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

  // 6. Seed OKRs
  const existingOkrs = await prisma.objectiveKeyResult.count();
  if (existingOkrs === 0) {
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
  }

  console.log('✅ Enterprenex EWMS Database Seeded Successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
