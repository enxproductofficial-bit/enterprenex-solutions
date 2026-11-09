import { prisma } from './db';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding Enterprenex EWMS Database...');

  const defaultPasswordHash = await bcrypt.hash('Enx_sol_121006', 10);

  // 1. Seed Users
  const user1 = await prisma.user.findFirst({ where: { employeeId: '202600000001' } });
  if (!user1) {
    await prisma.user.create({
      data: {
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
  }

  const user2 = await prisma.user.findFirst({ where: { employeeId: '202600000002' } });
  if (!user2) {
    await prisma.user.create({
      data: {
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
  }

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

  // 7. Seed Real Enterprise Projects
  await prisma.project.upsert({
    where: { id: 'proj-enx-money' },
    update: {},
    create: {
      id: 'proj-enx-money',
      title: 'ENX Money',
      description: 'GST-based business management application with billing, inventory, ledger, expenses and payment management. Development completed.',
      client: 'Enterprenex Solutions (Internal / Enterprise Products)',
      status: 'Development',
      budget: 0,
      startDate: '2026-01-15',
      deadline: '2026-11-30',
      teamSize: 2,
      completionRate: 75,
      managerName: 'Rohit Pawar',
      managerEmail: 'director@enterprenex.solutions',
      teamMembersJson: JSON.stringify(['Rohit Pawar', 'POLAMREDDY REVANTH REDDY']),
      milestonesJson: JSON.stringify([
        { id: 'ms-em-1', title: 'Phase 1: GST Billing Engine & Invoice Generator', dueDate: '2026-03-31', completed: true },
        { id: 'ms-em-2', title: 'Phase 2: Real-Time Inventory & Multi-Godown Tracking', dueDate: '2026-06-30', completed: true },
        { id: 'ms-em-3', title: 'Phase 3: Ledger, Expenses & Bank Reconciliation', dueDate: '2026-09-30', completed: true },
        { id: 'ms-em-4', title: 'Phase 4: Payment Gateway Integration & UAT Deployment', dueDate: '2026-11-30', completed: false }
      ])
    }
  });

  await prisma.project.upsert({
    where: { id: 'proj-granthsetu' },
    update: {},
    create: {
      id: 'proj-granthsetu',
      title: 'GranthSetu – Abhyasika Management System',
      description: 'Study-centre management platform with student enrollment, live seat allocation, QR admission, payments and admin management. Planning completed; development pending.',
      client: 'GranthSetu Study Centers & Libraries',
      status: 'Planning',
      budget: 0,
      startDate: '2026-03-01',
      deadline: '2026-12-15',
      teamSize: 2,
      completionRate: 35,
      managerName: 'Rohit Pawar',
      managerEmail: 'director@enterprenex.solutions',
      teamMembersJson: JSON.stringify(['Rohit Pawar', 'POLAMREDDY REVANTH REDDY']),
      milestonesJson: JSON.stringify([
        { id: 'ms-gs-1', title: 'Phase 1: Architecture Blueprint, SRS & Database Schema', dueDate: '2026-04-15', completed: true },
        { id: 'ms-gs-2', title: 'Phase 2: QR Admission Engine & Real-Time Seat Allocation Map', dueDate: '2026-07-31', completed: false },
        { id: 'ms-gs-3', title: 'Phase 3: Automated WhatsApp Notifications & Fee Reminders', dueDate: '2026-09-30', completed: false },
        { id: 'ms-gs-4', title: 'Phase 4: Multi-Branch Admin Dashboard & Analytics', dueDate: '2026-12-15', completed: false }
      ])
    }
  });

  // 8. Seed Company Announcements
  await prisma.companyAnnouncement.upsert({
    where: { id: 'ann-1' },
    update: {},
    create: {
      id: 'ann-1',
      title: 'Welcome to Enterprenex Work Management System (EWMS) V2.4',
      content: 'Dear Enterprenex Family, we are proud to introduce our unified enterprise portal covering Daily Attendance Geo-Check, Automated Monthly Payroll, Direct WhatsApp Meeting Dispatch, and our new Company Community. All employees are requested to review project milestones and mark daily punch-in on time.',
      author: 'Rohit Pawar',
      authorRole: 'Managing Director & Lead Architect',
      targetAudience: 'All Employees',
      publishedAt: new Date(),
      readByJson: '["202600000002"]',
      acknowledgedByJson: '["202600000002"]'
    }
  });

  await prisma.companyAnnouncement.upsert({
    where: { id: 'ann-2' },
    update: {},
    create: {
      id: 'ann-2',
      title: 'Google Meet Calendar Sync & WhatsApp Instant Invitations',
      content: 'All sprint planning meetings will now broadcast calendar links directly to team WhatsApp groups. When scheduling any meeting from the Calendar, choose "Schedule & Share on WhatsApp" to notify all attendees automatically with time, agenda, and Google Meet link.',
      author: 'Jyothi Anbhule',
      authorRole: 'Lead Project Manager & Mentor',
      targetAudience: 'All Employees',
      publishedAt: new Date(),
      readByJson: '[]',
      acknowledgedByJson: '[]'
    }
  });

  // 9. Seed CRM Leads
  const existingLeads = await prisma.lead.count();
  if (existingLeads === 0) {
    await prisma.lead.createMany({
      data: [
        {
          id: 'lead-1',
          name: 'Rajesh Sharma',
          company: 'Apex Logistics & Supply Chain',
          email: 'rajesh@apexlogistics.in',
          phone: '+91-9820112233',
          source: 'Website Form',
          status: 'Proposal',
          estimatedValue: 350000,
          serviceInterested: 'Custom ERP & Fleet Management Engine',
          assignedSalesperson: 'Rohit Pawar',
          probability: 60,
          nextFollowUpDate: '2026-11-15',
          notes: 'Client requested architecture demo for ENX Money integration with inventory.'
        },
        {
          id: 'lead-2',
          name: 'Dr. Sunita Deshmukh',
          company: 'Vidya Mandir Educational Trust',
          email: 'contact@vidyamandir.edu.in',
          phone: '+91-9822998877',
          source: 'Referral',
          status: 'Qualified',
          estimatedValue: 120000,
          serviceInterested: 'GranthSetu Abhyasika Platform Deployment',
          assignedSalesperson: 'Rohit Pawar',
          probability: 75,
          nextFollowUpDate: '2026-11-18',
          notes: 'Wants multi-branch student seat allocation and QR entry gates.'
        }
      ]
    });
  }

  // 10. Seed Vault Documents
  const existingDocs = await prisma.vaultDocument.count();
  if (existingDocs === 0) {
    await prisma.vaultDocument.createMany({
      data: [
        {
          id: 'vdoc-1',
          title: 'Enterprenex Standard Master Services Agreement (MSA) 2026',
          category: 'Contracts',
          version: 'v1.0',
          fileFormat: 'PDF',
          fileSize: '1.8 MB',
          uploadedBy: 'Rohit Pawar',
          uploadDate: '2026-01-01',
          accessPermission: 'Admin Only',
          tagsJson: JSON.stringify(['Legal', 'MSA', 'Template', 'Enterprise']),
          url: '#',
          verificationStatus: 'Verified',
          checksumHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
        },
        {
          id: 'vdoc-2',
          title: 'Mutual Non-Disclosure Agreement (NDA) Template',
          category: 'NDA',
          version: 'v1.0',
          fileFormat: 'DOCX',
          fileSize: '420 KB',
          uploadedBy: 'Rohit Pawar',
          uploadDate: '2026-01-01',
          accessPermission: 'Internal',
          tagsJson: JSON.stringify(['Legal', 'NDA', 'Compliance']),
          url: '#',
          verificationStatus: 'Verified',
          checksumHash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
        },
        {
          id: 'vdoc-3',
          title: 'IEEE-830 EWMS Software Requirements Specification (SRS)',
          category: 'Technical Docs',
          version: 'v2.4',
          fileFormat: 'PDF',
          fileSize: '3.4 MB',
          uploadedBy: 'Rohit Pawar',
          uploadDate: '2026-10-17',
          accessPermission: 'Internal',
          tagsJson: JSON.stringify(['Architecture', 'SRS', 'IEEE-830', 'EWMS']),
          url: '#',
          verificationStatus: 'Verified',
          checksumHash: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'
        },
        {
          id: 'vdoc-4',
          title: 'ENX Money GST & Multi-Godown Architecture Blueprint',
          category: 'Technical Docs',
          version: 'v1.2',
          fileFormat: 'PDF',
          fileSize: '2.8 MB',
          uploadedBy: 'Rohit Pawar',
          uploadDate: '2026-09-30',
          accessPermission: 'Confidential',
          tagsJson: JSON.stringify(['ENX Money', 'GST API', 'Database Schema']),
          url: '#',
          verificationStatus: 'Verified',
          checksumHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'
        },
        {
          id: 'vdoc-5',
          title: 'Minutes of Meeting - Official Corporate Directives (Oct 17, 2026)',
          category: 'Technical Docs',
          version: 'v1.0',
          fileFormat: 'PDF',
          fileSize: '512 KB',
          uploadedBy: 'Rohit Pawar',
          uploadDate: '2026-10-17',
          accessPermission: 'Internal',
          tagsJson: JSON.stringify(['MoM', 'Governance', 'Board Directives']),
          url: '#',
          verificationStatus: 'Verified',
          checksumHash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d'
        }
      ]
    });
  }

  // 11. Seed Enterprise Emails & Communications
  const existingEmails = await prisma.enterpriseEmail.count();
  if (existingEmails === 0) {
    await prisma.enterpriseEmail.createMany({
      data: [
        {
          id: 'em-001',
          sender: 'Siddharth Mehta (Vice President)',
          senderEmail: 'smehta@tata-enterprises.com',
          senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          recipient: 'Rohit Pawar (Managing Director)',
          recipientEmail: 'director@enterprenex.solutions',
          subject: 'Enterprise Cloud ERP Phase 2 Milestone Sign-Off & SLA Acceptance',
          snippet: 'We have thoroughly reviewed the performance benchmark reports for the Phase 2 cloud migration. The microservices latency is well within our 45ms SLA...',
          body: 'Dear Mr. Rohit Pawar & Engineering Leadership Team,\n\nWe have thoroughly reviewed the performance benchmark reports and disaster-recovery replication tests conducted for Phase 2 of the Enterprise Cloud Migration architecture.\n\nOn behalf of Tata Enterprise Systems, we are issuing official sign-off for Milestone 2. Please proceed with Phase 3 sprint planning.\n\nWarm regards,\nSiddharth Mehta\nVice President - Corporate Infrastructure',
          timestamp: '10:42 AM',
          date: 'Today',
          category: 'Clients & Sales',
          isUnread: true,
          isStarred: true,
          securityLevel: 'Institutional Restricted',
          attachmentsJson: JSON.stringify([
            { name: 'Tata_ERP_Phase2_Signoff_Signed.pdf', size: '2.4 MB', type: 'pdf' },
            { name: 'Cluster_Failover_Benchmark_Telemetry.xlsx', size: '890 KB', type: 'excel' }
          ])
        },
        {
          id: 'em-002',
          sender: 'DevOps & CI/CD Automated Governance',
          senderEmail: 'devops-alerts@enterprenex.solutions',
          senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
          recipient: 'All Engineering Staff',
          recipientEmail: 'engineering@enterprenex.solutions',
          subject: 'Production Deployment Successful: Kernel v4.12.0 Zero-Downtime Rollout',
          snippet: 'Automated notification: Build #2894 was deployed to production Kubernetes cluster at 04:30 AM IST. All 28 health probes reporting 100% green...',
          body: 'Automated Operations Telemetry Notice:\n\nBuild Identifier: #2894-STABLE (commit b704a84)\nCluster: prod-ind-mumbai-01 (16 Nodes, 64 Pods)\nDeployment Time: 04:30:12 IST (17 Oct 2026)\n\nZero packet loss detected during Canary deployment.',
          timestamp: '04:31 AM',
          date: 'Today',
          category: 'Projects & Delivery',
          isUnread: false,
          isStarred: false,
          securityLevel: 'General Operations',
          attachmentsJson: JSON.stringify([])
        },
        {
          id: 'em-003',
          sender: 'K.K. Singhania & Co. (Chartered Accountants)',
          senderEmail: 'audit@kksinghania-ca.com',
          senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          recipient: 'Rohit Pawar (Director)',
          recipientEmail: 'director@enterprenex.solutions',
          subject: 'Statutory GST & MCA Annual Filing Audit Notification (FY 2025-26)',
          snippet: 'Notice of internal audit readiness: Please find attached the preliminary checklist for MCA AOC-4 and MGT-7 corporate filings...',
          body: 'Dear Mr. Pawar,\n\nPlease find attached the statutory checklist for our upcoming financial year compliance audit.\n\nAll invoices generated through the newly integrated EWMS Billing Engine have matched our GSTR-1 outward records with 100% reconciliation accuracy.\n\nSincerely,\nCA Rajesh Singhania\nPartner, K.K. Singhania & Co.',
          timestamp: 'Yesterday',
          date: 'Yesterday',
          category: 'Finance & Billing',
          isUnread: false,
          isStarred: true,
          securityLevel: 'Confidential',
          attachmentsJson: JSON.stringify([
            { name: 'MCA_Statutory_Audit_Checklist_FY2526.pdf', size: '1.1 MB', type: 'pdf' }
          ])
        }
      ]
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
