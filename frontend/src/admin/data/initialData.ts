import type {
  AdminUser,
  Client,
  Project,
  ServiceCatalogueItem,
  Lead,
  Invoice,
  ExpenseRecord,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  Task,
  EmployeeKpiScorecard,
  ObjectiveKeyResult,
  SupportTicket,
  VaultDocument,
  CalendarMeeting,
  WebsiteCmsData,
  AuditLog,
  ApiKeyItem,
  UserSession
} from '../types';

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr-1',
    name: 'Rohit P.',
    email: 'director@enterprenex.solutions',
    role: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Executive Board',
    status: 'Active',
    lastLogin: 'Just now',
    phone: '+91-9226860060'
  },
  {
    id: 'usr-2',
    name: 'Operations & HR Lead',
    email: 'hr@enterprenex.solutions',
    role: 'Project Manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Operations & HR Management',
    status: 'Active',
    lastLogin: '10 mins ago',
    phone: '+91-9226860060'
  },
  {
    id: 'usr-3',
    name: 'Engineering Staff (EPX-101)',
    email: 'employee@enterprenex.solutions',
    role: 'Team Member',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    department: 'Engineering & Operations',
    status: 'Active',
    lastLogin: '1 hour ago',
    phone: '+91-9226860060'
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    companyName: 'NexaCorp Systems Ltd',
    industry: 'Enterprise Software & Cloud',
    website: 'https://nexacorpsystems.com',
    gstin: '27AABCN1234A1Z5',
    primaryContact: {
      name: 'Vikramaditya Roy',
      role: 'Chief Technology Officer',
      email: 'v.roy@nexacorpsystems.com',
      phone: '+91-9820154321'
    },
    billingAddress: {
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400051',
      fullAddress: 'Nexa Towers, BKC, Bandra East, Mumbai, MH - 400051'
    },
    status: 'Active',
    slaTier: 'Enterprise (2h SLA)',
    totalBilled: 1850000,
    activeProjectsCount: 2,
    openTicketsCount: 1,
    createdAt: '2026-01-15'
  },
  {
    id: 'cli-2',
    companyName: 'Apex Global Financial Technologies',
    industry: 'FinTech & Banking',
    website: 'https://apexglobalfin.com',
    gstin: '29AAACA5678B1Z2',
    primaryContact: {
      name: 'Anita Shenoy',
      role: 'VP of Engineering',
      email: 'anita.shenoy@apexglobalfin.com',
      phone: '+91-9880234567'
    },
    billingAddress: {
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560100',
      fullAddress: 'Electronic City Phase 1, Hosur Road, Bengaluru, KA - 560100'
    },
    status: 'Active',
    slaTier: 'Enterprise (2h SLA)',
    totalBilled: 2400000,
    activeProjectsCount: 1,
    openTicketsCount: 0,
    createdAt: '2026-02-01'
  },
  {
    id: 'cli-3',
    companyName: 'Vertex Retail & Logistics Cloud',
    industry: 'Retail & Supply Chain',
    website: 'https://vertexretailcloud.io',
    gstin: '07AAACV9012C1Z8',
    primaryContact: {
      name: 'Karan Mehra',
      role: 'Head of Digital Transformation',
      email: 'karan.m@vertexretailcloud.io',
      phone: '+91-9811345678'
    },
    billingAddress: {
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      fullAddress: 'Connaught Place, Barakhamba Road, New Delhi, DL - 110001'
    },
    status: 'Active',
    slaTier: 'Standard (6h SLA)',
    totalBilled: 1200000,
    activeProjectsCount: 1,
    openTicketsCount: 1,
    createdAt: '2026-02-20'
  },
  {
    id: 'cli-4',
    companyName: 'Zenith HealthTech Solutions',
    industry: 'Healthcare & AI Diagnostics',
    website: 'https://zenithhealthtech.com',
    gstin: '36AAACZ3456D1Z4',
    primaryContact: {
      name: 'Dr. Suresh Varma',
      role: 'Director of Technology',
      email: 'suresh.varma@zenithhealthtech.com',
      phone: '+91-9440123456'
    },
    billingAddress: {
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      fullAddress: 'Hitec City, Madhapur, Hyderabad, TS - 500081'
    },
    status: 'Active',
    slaTier: 'Standard (6h SLA)',
    totalBilled: 950000,
    activeProjectsCount: 1,
    openTicketsCount: 0,
    createdAt: '2026-03-01'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'NexaCorp Cloud-Native ERP Modernization',
    clientName: 'NexaCorp Systems Ltd',
    clientId: 'cli-1',
    status: 'Development',
    progress: 65,
    budget: 1850000,
    expenses: 620000,
    startDate: '2026-01-20',
    targetEndDate: '2026-06-30',
    assignedTeam: ['Rohit P.', 'POLAMREDDY REVANTH REDDY'],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
    serviceCategory: 'Custom Enterprise Software',
    description: 'Multi-tenant enterprise ERP modernization with real-time financial reconciliation and RBAC security.',
    milestones: [
      { id: 'ms-1', title: 'Phase 1: Architecture & Data Migration', dueDate: '2026-02-28', completed: true, amount: 650000 },
      { id: 'ms-2', title: 'Phase 2: Core Microservices & APIs', dueDate: '2026-04-30', completed: false, amount: 700000 },
      { id: 'ms-3', title: 'Phase 3: UAT & Production Cutover', dueDate: '2026-06-30', completed: false, amount: 500000 }
    ],
    tasks: [],
    documentsCount: 6,
    priority: 'High'
  },
  {
    id: 'proj-2',
    title: 'Apex Global High-Frequency Trading Analytics',
    clientName: 'Apex Global Financial Technologies',
    clientId: 'cli-2',
    status: 'Development',
    progress: 40,
    budget: 2400000,
    expenses: 850000,
    startDate: '2026-02-10',
    targetEndDate: '2026-08-15',
    assignedTeam: ['Rohit P.', 'POLAMREDDY REVANTH REDDY'],
    techStack: ['Python', 'FastAPI', 'React', 'TimescaleDB', 'Redis'],
    serviceCategory: 'AI/ML Solutions',
    description: 'Sub-millisecond trade analytics ingestion pipeline and predictive volatility monitoring engine.',
    milestones: [
      { id: 'ms-4', title: 'Phase 1: Telemetry Ingestion Architecture', dueDate: '2026-03-31', completed: true, amount: 800000 },
      { id: 'ms-5', title: 'Phase 2: Live Predictive Dashboard', dueDate: '2026-05-31', completed: false, amount: 800000 }
    ],
    tasks: [],
    documentsCount: 4,
    priority: 'Critical'
  },
  {
    id: 'proj-3',
    title: 'Vertex Logistics Fleet & Telematics IoT Suite',
    clientName: 'Vertex Retail & Logistics Cloud',
    clientId: 'cli-3',
    status: 'Planning',
    progress: 25,
    budget: 1200000,
    expenses: 310000,
    startDate: '2026-03-01',
    targetEndDate: '2026-07-31',
    assignedTeam: ['POLAMREDDY REVANTH REDDY'],
    techStack: ['Node.js', 'React Native', 'MQTT', 'PostgreSQL'],
    serviceCategory: 'IoT Solutions',
    description: 'Real-time GPS telematics tracking, geo-fencing alert engine, and fleet maintenance mobile application.',
    milestones: [
      { id: 'ms-6', title: 'Phase 1: Hardware MQTT Broker Setup', dueDate: '2026-04-15', completed: false, amount: 450000 }
    ],
    tasks: [],
    documentsCount: 3,
    priority: 'Medium'
  }
];

export const INITIAL_SERVICES: ServiceCatalogueItem[] = [
  {
    id: 'svc-1',
    name: 'Web Development',
    category: 'Engineering',
    shortDesc: 'Custom high-performance web applications, portals, and scalable SaaS platforms.',
    fullDesc: 'We architect and build enterprise-grade web applications using React, Next.js, Node.js, and cloud-native backends with responsive UX and sub-second load speeds.',
    pricingModel: 'Fixed',
    startingPrice: 150000,
    typicalTimeline: '4 - 8 Weeks',
    technologies: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    features: ['Custom Frontend Architecture', 'REST & GraphQL APIs', 'Role-Based Authentication', 'SEO & Performance Optimized', 'Automated CI/CD'],
    active: true,
    iconName: 'Globe',
    leadsCount: 0
  },
  {
    id: 'svc-2',
    name: 'Mobile App Development',
    category: 'Engineering',
    shortDesc: 'Native and cross-platform mobile apps for iOS and Android with intuitive experiences.',
    fullDesc: 'From consumer apps to internal enterprise tools, we develop fluid cross-platform apps using Flutter and React Native with offline sync and biometrics.',
    pricingModel: 'Fixed',
    startingPrice: 200000,
    typicalTimeline: '6 - 12 Weeks',
    technologies: ['Flutter', 'React Native', 'Swift', 'Kotlin', 'Firebase', 'SQLite'],
    features: ['iOS & Android App Store Ready', 'Push Notifications', 'Offline-First Database', 'Biometric Authentication', 'Payment Gateway SDKs'],
    active: true,
    iconName: 'Smartphone',
    leadsCount: 0
  },
  {
    id: 'svc-3',
    name: 'SaaS Development',
    category: 'Product',
    shortDesc: 'End-to-end multi-tenant SaaS platforms with subscriptions, billing, and analytics.',
    fullDesc: 'Full lifecycle SaaS development: tenant isolation, Stripe/Razorpay billing, webhook integrations, usage metering, and administrative panels.',
    pricingModel: 'Milestone',
    startingPrice: 350000,
    typicalTimeline: '8 - 16 Weeks',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'AWS'],
    features: ['Multi-Tenant Architecture', 'Automated Subscription Billing', 'Granular Role Permissions', 'Audit Trails', 'White-labeling'],
    active: true,
    iconName: 'Layers',
    leadsCount: 0
  },
  {
    id: 'svc-4',
    name: 'AI/ML Solutions',
    category: 'Artificial Intelligence',
    shortDesc: 'Predictive intelligence, custom LLM agents, computer vision, and NLP pipelines.',
    fullDesc: 'We turn enterprise data into predictive value with custom model training, Retrieval-Augmented Generation (RAG), voice automation, and visual QA systems.',
    pricingModel: 'Milestone',
    startingPrice: 300000,
    typicalTimeline: '6 - 14 Weeks',
    technologies: ['Python', 'PyTorch', 'TensorFlow', 'OpenAI', 'LangChain', 'FastAPI'],
    features: ['Custom Model Fine-tuning', 'RAG Knowledge Bases', 'Computer Vision & OCR', 'Conversational AI Bots', 'High-throughput Inference APIs'],
    active: true,
    iconName: 'Brain',
    leadsCount: 0
  },
  {
    id: 'svc-5',
    name: 'IoT Solutions',
    category: 'Embedded & Hardware',
    shortDesc: 'Connected device firmware, MQTT telemetry brokers, and hardware integration.',
    fullDesc: 'End-to-end IoT engineering covering edge device communication, low-latency telemetry processing, remote OTA firmware updates, and live monitoring dashboards.',
    pricingModel: 'Fixed',
    startingPrice: 250000,
    typicalTimeline: '8 - 14 Weeks',
    technologies: ['C/C++', 'ESP32', 'MQTT', 'Go', 'TimescaleDB', 'Grafana'],
    features: ['Secure Device Provisioning', 'Real-time Telemetry Ingestion', 'Geofencing & Alerts', 'Over-The-Air (OTA) Updates', 'Hardware Prototypes'],
    active: true,
    iconName: 'Cpu',
    leadsCount: 0
  },
  {
    id: 'svc-6',
    name: 'Cloud & DevOps',
    category: 'Infrastructure',
    shortDesc: 'Kubernetes orchestration, CI/CD automation, cloud cost optimization, and security audits.',
    fullDesc: 'We architect immutable, fault-tolerant infrastructure on AWS, GCP, and DigitalOcean using Infrastructure-as-Code (Terraform) and GitOps.',
    pricingModel: 'Retainer',
    startingPrice: 100000,
    typicalTimeline: '2 - 6 Weeks',
    technologies: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'GitHub Actions', 'Prometheus'],
    features: ['Zero-downtime Deployments', 'Cloud Cost Reductions', 'Auto-scaling Clusters', 'Automated Backups & DR', 'Security Hardening'],
    active: true,
    iconName: 'Cloud',
    leadsCount: 0
  },
  {
    id: 'svc-7',
    name: 'UI/UX Design',
    category: 'Design',
    shortDesc: 'Conversion-driven user research, wireframing, interactive Figma design systems.',
    fullDesc: 'Design systems that elevate your digital product with human-centered research, intuitive user flows, accessible components, and interactive prototypes.',
    pricingModel: 'Fixed',
    startingPrice: 80000,
    typicalTimeline: '2 - 4 Weeks',
    technologies: ['Figma', 'Adobe XD', 'Protopie', 'Design Tokens', 'UserTesting'],
    features: ['Complete Figma Design System', 'Clickable Hi-Fi Prototypes', 'User Journey Mapping', 'Accessibility WCAG AA Compliance', 'Developer Handoff Specs'],
    active: true,
    iconName: 'Layout',
    leadsCount: 0
  },
  {
    id: 'svc-8',
    name: 'Software Maintenance & Support',
    category: 'Support',
    shortDesc: '24/7 uptime monitoring, security patching, bug resolution, and performance tuning.',
    fullDesc: 'Continuous operational peace of mind with guaranteed SLA response times, routine dependency upgrades, database optimization, and on-call engineers.',
    pricingModel: 'Retainer',
    startingPrice: 50000,
    typicalTimeline: 'Ongoing / Monthly',
    technologies: ['Sentry', 'Datadog', 'UptimeRobot', 'PostgreSQL', 'Docker'],
    features: ['Guaranteed 2-Hour SLA', 'Weekly Security Audits', 'Monthly Database Tuning', 'On-call Emergency Support', 'Detailed Monthly Health Reports'],
    active: true,
    iconName: 'Wrench',
    leadsCount: 0
  },
  {
    id: 'svc-9',
    name: 'Custom Enterprise Software',
    category: 'Enterprise',
    shortDesc: 'Tailored ERP, CRM, inventory, and supply chain automation software.',
    fullDesc: 'Bespoke software systems designed from scratch around your specific business operations, eliminating paper trails and disconnected spreadsheets.',
    pricingModel: 'Milestone',
    startingPrice: 400000,
    typicalTimeline: '10 - 20 Weeks',
    technologies: ['Java', 'Spring Boot', 'React', 'Oracle/Postgres', 'Kafka', 'Microservices'],
    features: ['Custom Workflow Automation', 'Legacy ERP Migration', 'Enterprise SSO & IAM', 'Automated Reporting Engine', 'Unlimited Users License'],
    active: true,
    iconName: 'Boxes',
    leadsCount: 0
  }
];

export const INITIAL_LEADS: Lead[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_EXPENSES: ExpenseRecord[] = [];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    employeeId: '202600000001',
    password: 'Enx_sol_121006',
    name: 'Rohit P.',
    role: 'Managing Director & Lead Architect',
    department: 'Engineering',
    email: 'director@enterprenex.solutions',
    phone: '+91-9226860060',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Cloud Architecture', 'AI Systems'],
    currentProjects: [],
    workloadPercentage: 45,
    joinDate: '2026-01-01',
    salaryMonthly: 150000,
    performanceRating: 5.0,
    status: 'Active',
    approvalStatus: 'Approved',
    panNumber: 'AAXPE1206M',
    aadhaarNumber: '782390124567',
    kycStatus: 'Verified',
    kycVerifiedBy: 'Executive Board',
    kycVerifiedAt: '2026-01-01T00:00:00.000Z',
    employmentType: 'Full Time',
    workMode: 'Hybrid',
    kpiScore: 96.0,
    okrScore: 95.0,
    skillsMatrix: [
      { name: 'System Architecture', category: 'Architecture', level: 'Expert', rating: 5, verifiedRating: 5, isVerified: true, verifiedBy: 'Board' },
      { name: 'Cloud Infrastructure (AWS)', category: 'Cloud', level: 'Expert', rating: 5, verifiedRating: 5, isVerified: true, verifiedBy: 'Board' },
      { name: 'AI & Machine Learning', category: 'AI/ML', level: 'Advanced', rating: 4, verifiedRating: 5, isVerified: true, verifiedBy: 'Board' },
      { name: 'React / Next.js', category: 'Frontend', level: 'Expert', rating: 5, verifiedRating: 5, isVerified: true, verifiedBy: 'Board' },
      { name: 'Node.js & Microservices', category: 'Backend', level: 'Expert', rating: 5, verifiedRating: 5, isVerified: true, verifiedBy: 'Board' }
    ],
    education: [
      { degree: 'Master of Technology in Computer Systems', institute: 'Premier Institute of Technology', specialization: 'Cloud & Distributed Systems', startYear: '2016', endYear: '2018', score: '9.2 CGPA' }
    ]
  },
  {
    id: 'emp-2',
    employeeId: '202600000002',
    password: 'Enx_sol_121006',
    name: 'POLAMREDDY REVANTH REDDY',
    role: 'Full Stack Developer (Employee)',
    department: 'Engineering',
    email: 'polamreddyrevanth.82@gmail.com',
    phone: '+91-9440829762',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Vite'],
    currentProjects: [],
    workloadPercentage: 75,
    joinDate: '2026-10-10',
    salaryMonthly: 100000,
    performanceRating: 5.0,
    status: 'Active',
    approvalStatus: 'Approved',
    approvedBy: 'Rohit P. (Managing Director)',
    panNumber: 'PRRPS8209K',
    aadhaarNumber: '674389012345',
    kycStatus: 'Verified',
    kycVerifiedBy: 'Rohit P. (Managing Director)',
    kycVerifiedAt: '2026-10-10T08:00:00.000Z',
    employmentType: 'Full Time',
    workMode: 'Hybrid',
    kpiScore: 91.5,
    okrScore: 88.0,
    skillsMatrix: [
      { name: 'React & Next.js', category: 'Frontend', level: 'Advanced', rating: 4, verifiedRating: 4, isVerified: true, verifiedBy: 'Rohit P.' },
      { name: 'TypeScript & JavaScript', category: 'Frontend', level: 'Advanced', rating: 4, verifiedRating: 4, isVerified: true, verifiedBy: 'Rohit P.' },
      { name: 'Node.js & Express', category: 'Backend', level: 'Intermediate', rating: 4, verifiedRating: 3, isVerified: true, verifiedBy: 'Rohit P.' },
      { name: 'PostgreSQL & Database Architecture', category: 'Database', level: 'Intermediate', rating: 3, verifiedRating: 3, isVerified: true, verifiedBy: 'Rohit P.' },
      { name: 'Tailwind CSS & Minimalist Design', category: 'Frontend', level: 'Expert', rating: 5, verifiedRating: 5, isVerified: true, verifiedBy: 'Rohit P.' },
      { name: 'Cloud Deployment & Vercel', category: 'DevOps', level: 'Intermediate', rating: 3, verifiedRating: 4, isVerified: true, verifiedBy: 'Rohit P.' }
    ],
    education: [
      { degree: 'B.Tech in Computer Science & Engineering', institute: 'Engineering Institute of Technology', specialization: 'Software Systems & AI', startYear: '2022', endYear: '2026', score: '8.4 CGPA' }
    ]
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    employeeId: '202600000001',
    employeeName: 'Rohit P.',
    date: '2026-10-12',
    checkIn: '09:05 AM',
    checkOut: '-',
    status: 'Present'
  },
  {
    id: 'att-2',
    employeeId: '202600000002',
    employeeName: 'POLAMREDDY REVANTH REDDY',
    date: '2026-10-12',
    checkIn: '09:20 AM',
    checkOut: '-',
    status: 'Present'
  },
  {
    id: 'att-3',
    employeeId: '202600000003',
    employeeName: 'Ananya Sharma',
    date: '2026-10-12',
    checkIn: '-',
    checkOut: '-',
    status: 'Absent',
    absenceReason: 'No Intimation Provided',
    absenceNotes: 'Awaiting check-in intimation. Direct outreach pending from HR Lead.',
    notifiedVia: ['WhatsApp'],
    recordedBy: 'Rohit P. (Managing Director)',
    recordedAt: '2026-10-12T10:15:00.000Z'
  }
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'lv-1',
    employeeName: 'Rohit P.',
    type: 'Casual Leave',
    startDate: '2026-10-15',
    endDate: '2026-10-16',
    reason: 'Client technical architecture review & summit',
    status: 'Pending'
  },
  {
    id: 'lv-2',
    employeeName: 'HR Administrator',
    type: 'Casual Leave',
    startDate: '2026-10-20',
    endDate: '2026-10-21',
    reason: 'Personal family engagement & festival',
    status: 'Pending'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'tsk-101',
    title: 'Live Task Stopwatch & Time Tracker',
    description: 'Implement real-time start/pause/stop stopwatch controls on active task cards with automatic session logging.',
    projectId: 'prj-1',
    projectName: 'Enterprise Web & AI Systems',
    assignedTo: 'POLAMREDDY REVANTH REDDY',
    reviewer: 'Rohit P.',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2026-10-14',
    loggedHours: 6.5,
    estimatedHours: 10,
    tags: ['Timer', 'Stopwatch', 'EWMS'],
    createdAt: '2026-10-11',
    subtasks: [
      { id: 'st-1', title: 'Start/Pause state machine with localStorage persistence', completed: true },
      { id: 'st-2', title: 'Real-time elapsed seconds counter & display', completed: true },
      { id: 'st-3', title: 'Auto-logging into cumulative task hours', completed: false }
    ],
    comments: [
      { id: 'tc-1', author: 'Rohit P.', authorAvatar: '', text: 'Ensure the timer interface stays clean and minimalist without distracting the developer.', createdAt: 'Yesterday' }
    ]
  },
  {
    id: 'tsk-102',
    title: 'Workload & Capacity Redistribution Engine',
    description: 'Calculate weekly capacity 40h vs assigned tasks. Display Available (<70%), Healthy (70-100%), and Overloaded (>100%) badges.',
    projectId: 'prj-1',
    projectName: 'Enterprise Web & AI Systems',
    assignedTo: 'POLAMREDDY REVANTH REDDY',
    reviewer: 'Rohit P.',
    priority: 'Urgent',
    status: 'In Progress',
    dueDate: '2026-10-15',
    loggedHours: 2.0,
    estimatedHours: 8,
    tags: ['Capacity', 'Planning', 'Workload'],
    createdAt: '2026-10-11',
    subtasks: [
      { id: 'st-4', title: 'Calculate employee capacity percentage', completed: true },
      { id: 'st-5', title: 'Visual capacity meter on Directory & Task modal', completed: false }
    ],
    comments: []
  },
  {
    id: 'tsk-103',
    title: 'IT Skill Matrix & Manager Verification Flow',
    description: 'Add skill matrix table comparing team competencies across stacks with Beginner to Expert badges and Manager ratings.',
    projectId: 'prj-1',
    projectName: 'Enterprise Web & AI Systems',
    assignedTo: 'POLAMREDDY REVANTH REDDY',
    reviewer: 'Rohit P.',
    priority: 'Medium',
    status: 'In Review',
    dueDate: '2026-10-16',
    loggedHours: 12.0,
    estimatedHours: 12,
    tags: ['Skills', 'Matrix', 'Verification'],
    createdAt: '2026-10-10',
    subtasks: [
      { id: 'st-6', title: 'Interactive skills grid with self-rating', completed: true },
      { id: 'st-7', title: 'Manager verification badge and score', completed: true }
    ],
    comments: [
      { id: 'tc-2', author: 'POLAMREDDY REVANTH REDDY', authorAvatar: '', text: 'Submitted for Lead review approval.', createdAt: 'Just now' }
    ]
  },
  {
    id: 'tsk-104',
    title: 'Role-Specific Weighted KPI & OKR Engine',
    description: 'Implement weighted KPI formula (On-Time Delivery 25%, Quality 25%, Bug Rate 15%, Documentation 10%, etc.) out of 100.',
    projectId: 'prj-1',
    projectName: 'Enterprise Web & AI Systems',
    assignedTo: 'Rohit P.',
    reviewer: 'Rohit P.',
    priority: 'High',
    status: 'Done',
    dueDate: '2026-10-18',
    loggedHours: 14.0,
    estimatedHours: 14,
    tags: ['KPI', 'OKR', 'Analytics'],
    createdAt: '2026-10-09',
    subtasks: [
      { id: 'st-8', title: 'Weighted formula computation', completed: true },
      { id: 'st-9', title: 'Objective key results tracking bars', completed: true }
    ],
    comments: [
      { id: 'tc-3', author: 'Rohit P.', authorAvatar: '', text: 'Architecture approved. Meets Section 15-17 EWMS blueprint.', createdAt: '2 days ago' }
    ]
  },
  {
    id: 'tsk-105',
    title: 'Enterprise API Gateway & Security Policy Audit',
    description: 'Audit RBAC middleware and configure CORS & rate limiting rules for production API endpoints.',
    projectId: 'prj-1',
    projectName: 'Enterprise Web & AI Systems',
    assignedTo: 'POLAMREDDY REVANTH REDDY',
    reviewer: 'Rohit P.',
    priority: 'Medium',
    status: 'To Do',
    dueDate: '2026-10-22',
    loggedHours: 0,
    estimatedHours: 6,
    tags: ['Security', 'API', 'Audit'],
    createdAt: '2026-10-14',
    subtasks: [
      { id: 'st-10', title: 'Verify statutory identity token validation', completed: false },
      { id: 'st-11', title: 'Test rate limiter on public auth endpoints', completed: false }
    ],
    comments: []
  }
];

export const INITIAL_KPIS: EmployeeKpiScorecard[] = [
  {
    employeeId: '202600000002',
    employeeName: 'POLAMREDDY REVANTH REDDY',
    roleTemplate: 'Software Developer',
    period: 'October 2026',
    updatedAt: '2026-10-12',
    finalKpiScore: 91.5,
    metrics: [
      { id: 'kpi-1', name: 'On-time Task Delivery', weight: 25, target: '90%', actual: '94%', score: 94 },
      { id: 'kpi-2', name: 'Code Quality & Architecture', weight: 25, target: '85%', actual: '92%', score: 92 },
      { id: 'kpi-3', name: 'Low Defect / Bug Escape Rate', weight: 15, target: '<5%', actual: '3.2%', score: 90 },
      { id: 'kpi-4', name: 'Technical Contribution & Design', weight: 15, target: '80%', actual: '88%', score: 88 },
      { id: 'kpi-5', name: 'Technical Documentation & SOPs', weight: 10, target: '85%', actual: '86%', score: 86 },
      { id: 'kpi-6', name: 'Team Collaboration & Reviews', weight: 10, target: '90%', actual: '95%', score: 95 }
    ]
  },
  {
    employeeId: '202600000001',
    employeeName: 'Rohit P.',
    roleTemplate: 'Software Developer',
    period: 'October 2026',
    updatedAt: '2026-10-12',
    finalKpiScore: 96.0,
    metrics: [
      { id: 'kpi-1', name: 'On-time Task Delivery', weight: 25, target: '95%', actual: '98%', score: 98 },
      { id: 'kpi-2', name: 'Code Quality & Architecture', weight: 25, target: '90%', actual: '96%', score: 96 },
      { id: 'kpi-3', name: 'Low Defect / Bug Escape Rate', weight: 15, target: '<3%', actual: '1.5%', score: 96 },
      { id: 'kpi-4', name: 'Technical Contribution & Design', weight: 15, target: '90%', actual: '95%', score: 95 },
      { id: 'kpi-5', name: 'Technical Documentation & SOPs', weight: 10, target: '90%', actual: '92%', score: 92 },
      { id: 'kpi-6', name: 'Team Collaboration & Reviews', weight: 10, target: '95%', actual: '98%', score: 98 }
    ]
  }
];

export const INITIAL_OKRS: ObjectiveKeyResult[] = [
  {
    id: 'okr-1',
    objectiveTitle: 'Deliver Enterprise EWMS Operations Platform (Q4 2026)',
    department: 'Engineering & Operations',
    ownerName: 'POLAMREDDY REVANTH REDDY',
    period: 'Q4 2026',
    progressPercent: 88,
    keyResults: [
      { id: 'kr-1', title: 'Deploy Live Task Stopwatch & Real-Time Session Tracker', target: '100%', current: '100%', progressPercent: 100 },
      { id: 'kr-2', title: 'Implement Workload Capacity Engine (Healthy vs Overloaded)', target: '100%', current: '85%', progressPercent: 85 },
      { id: 'kr-3', title: 'Roll out IT Skill Matrix & Role-Based Weighted KPI Engine', target: '100%', current: '80%', progressPercent: 80 }
    ]
  },
  {
    id: 'okr-2',
    objectiveTitle: 'Scale Enterprise Cloud Infrastructure & 99.9% High Availability',
    department: 'DevOps & Architecture',
    ownerName: 'Rohit P.',
    period: 'Q4 2026',
    progressPercent: 92,
    keyResults: [
      { id: 'kr-4', title: 'Sub-second API response time (<200ms latency)', target: '200ms', current: '145ms', progressPercent: 95 },
      { id: 'kr-5', title: 'Enforce Zero-Trust IP Whitelisting & RBAC across modules', target: '100%', current: '90%', progressPercent: 90 }
    ]
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [];

export const INITIAL_DOCUMENTS: VaultDocument[] = [
  {
    id: 'vdoc-1',
    title: 'Enterprenex Standard Master Services Agreement (MSA) 2026',
    category: 'Contracts',
    version: 'v1.0',
    fileFormat: 'PDF',
    fileSize: '1.8 MB',
    uploadedBy: 'Admin',
    uploadDate: '2026-01-01',
    accessPermission: 'Admin Only',
    tags: ['Legal', 'MSA', 'Template'],
    url: '#'
  },
  {
    id: 'vdoc-2',
    title: 'Mutual Non-Disclosure Agreement (NDA) Template',
    category: 'NDA',
    version: 'v1.0',
    fileFormat: 'DOCX',
    fileSize: '420 KB',
    uploadedBy: 'Admin',
    uploadDate: '2026-01-01',
    accessPermission: 'Internal',
    tags: ['Legal', 'NDA'],
    url: '#'
  }
];

export const INITIAL_MEETINGS: CalendarMeeting[] = [];

export const INITIAL_CMS: WebsiteCmsData = {
  hero: {
    badge: 'Enterprise Software & AI Excellence',
    heading: 'Engineering Scalable Software & AI Solutions for Tomorrow’s Leaders',
    subheading: 'We design, engineer, and deploy high-performance web platforms, mobile apps, SaaS ecosystems, and custom AI systems that accelerate enterprise growth.',
    ctaPrimary: 'Explore Our Services',
    ctaSecondary: 'Schedule a Consultation'
  },
  testimonials: [],
  portfolioItems: [],
  blogPosts: [
    {
      id: 'blg-1',
      title: 'Building Zero-Downtime Microservices on Kubernetes for Fintech',
      slug: 'zero-downtime-fintech-kubernetes',
      category: 'Engineering',
      author: 'Enterprenex Engineering',
      date: 'Feb 15, 2026',
      readTime: '6 min read',
      status: 'Published',
      excerpt: 'How we engineered a blue-green deployment pipeline with automated rollback guarantees for high-volume financial transaction gateways.'
    }
  ],
  faqs: [
    {
      id: 'faq-1',
      question: 'What is Enterprenex Solutions’ typical project engagement model?',
      answer: 'We offer flexible engagement models tailored to client needs: Fixed-Scope Delivery with milestone-based signoffs, Dedicated Engineering Squads, and Monthly Retainer Support.',
      category: 'General'
    },
    {
      id: 'faq-2',
      question: 'How do you guarantee IP protection and code security?',
      answer: 'All projects begin with comprehensive mutual NDAs and clear IP assignment clauses. Code repositories are isolated on private enterprise instances with strict zero-trust access controls.',
      category: 'Security'
    }
  ],
  contactEnquiries: [],
  seo: {
    metaTitle: 'Enterprenex Solutions Pvt Ltd | Enterprise Software & AI Engineering',
    metaDescription: 'Empowering global enterprises with bespoke web development, mobile applications, SaaS architectures, and cutting-edge AI & IoT solutions.',
    keywords: 'Software Development India, AI Solutions, SaaS Development, Mobile Apps, Cloud Engineering, Enterprenex Solutions',
    ogImage: '/images/hero.png'
  }
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'usr-1',
    userName: 'Rohit P. (Director)',
    userRole: 'Super Admin',
    action: 'Platform Active',
    module: 'Admin & Security',
    ipAddress: '10.228.245.155',
    timestamp: 'Just now',
    details: 'Zero-trust enterprise governance active for director@enterprenex.solutions'
  }
];

export const INITIAL_API_KEYS: ApiKeyItem[] = [
  {
    id: 'key-1',
    name: 'OpenAI Enterprise Production',
    service: 'OpenAI API',
    keyMasked: 'sk-proj-99a**********************81Fz',
    createdAt: '2026-01-01',
    lastUsed: 'Just now',
    status: 'Active'
  }
];

export const INITIAL_SESSIONS: UserSession[] = [
  {
    id: 'sess-1',
    userName: 'Rohit P. (Director)',
    device: 'Authorized Executive Workstation',
    ipAddress: '10.228.245.155',
    location: 'India',
    loginTime: 'Just now',
    isCurrent: true
  }
];
