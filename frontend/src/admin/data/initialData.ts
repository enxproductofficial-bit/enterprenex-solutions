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
  CommunityAnnouncement,
  ChatMessage,
  WebsiteCmsData,
  AuditLog,
  ApiKeyItem,
  UserSession,
  OfferLetter,
  EwmsNotification
} from '../types';

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr-1',
    name: 'Rohit Pawar',
    email: 'director@enterprenex.solutions',
    role: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Executive Board',
    status: 'Active',
    lastLogin: 'Just now',
    phone: '+91-9226860060',
    employeeId: '202600000001'
  },
  {
    id: 'usr-2',
    name: 'HR Administrator',
    email: 'hr@enterprenex.solutions',
    role: 'Project Manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Operations & HR Management',
    status: 'Active',
    lastLogin: 'Just now',
    phone: '+91-9226860060'
  },
  {
    id: 'usr-3',
    name: 'POLAMREDDY REVANTH REDDY',
    email: 'revanth@enterprenex.solutions',
    role: 'Developer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Engineering',
    status: 'Active',
    lastLogin: 'Just now',
    phone: '+919440829762',
    employeeId: 'ZCX-EMP-0001'
  }
];

export const INITIAL_CLIENTS: Client[] = [];

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_SERVICES: ServiceCatalogueItem[] = [
  {
    id: 'svc-1',
    name: 'Enterprise Web & Full Stack Architecture',
    category: 'Software Engineering',
    tagline: 'High-performance, fault-tolerant web applications for scale',
    description: 'Bespoke enterprise web platforms architected with React, Node.js, and cloud databases. Includes microservices design, SLA-backed resilience, sub-second latency, and bank-grade data security protocols.',
    iconName: 'Globe',
    slaTier: 'Platinum',
    turnaroundWeeks: '8-16 Weeks',
    features: [
      'Microservices & Distributed Systems',
      'Bank-Grade End-to-End Encryption',
      'Real-Time WebSockets & Telemetry',
      'High-Throughput Postgres & Redis Pipelines',
      'Zero-Downtime Blue/Green Deployments',
      '99.99% Uptime Guarantee'
    ],
    pricingModel: 'Fixed Scope / Milestones',
    startingPrice: 350000,
    activeContracts: 0,
    status: 'Active'
  },
  {
    id: 'svc-2',
    name: 'AI Agents, Copilots & Automation Pipelines',
    category: 'AI & Data Science',
    tagline: 'Autonomous AI agents embedded into your business workflow',
    description: 'Custom Large Language Model (LLM) fine-tuning, retrieval-augmented generation (RAG) vector pipelines, and agentic workflows that automate customer intelligence, financial reconciliation, and support.',
    iconName: 'Bot',
    slaTier: 'Diamond',
    turnaroundWeeks: '6-12 Weeks',
    features: [
      'Multi-Agent System Orchestration',
      'Enterprise Vector Knowledge Bases (Pinecone / PgVector)',
      'Autonomous CRM & Email Handlers',
      'Strict Zero Data Leakage Privacy Boundary',
      'Real-Time Voice & Multi-Modal Copilots'
    ],
    pricingModel: 'Retainer + Performance',
    startingPrice: 450000,
    activeContracts: 0,
    status: 'Active'
  },
  {
    id: 'svc-3',
    name: 'Cloud Infrastructure, DevOps & Containerization',
    category: 'Cloud Solutions',
    tagline: 'Cloud architectures engineered for 99.99% reliability',
    description: 'Modern infrastructure as code (Terraform), Kubernetes cluster orchestration, and automated CI/CD pipelines across AWS, GCP, and Hybrid Clouds.',
    iconName: 'Cloud',
    slaTier: 'Platinum',
    turnaroundWeeks: '4-8 Weeks',
    features: [
      'Kubernetes (EKS/GKE) Multi-Node Orchestration',
      'Terraform Infrastructure as Code',
      'Automated Multi-Stage CI/CD Deployment Gates',
      'Comprehensive Observability & Tracing',
      '24/7 Automated Disaster Recovery & Failover'
    ],
    pricingModel: 'Monthly Managed Services',
    startingPrice: 180000,
    activeContracts: 0,
    status: 'Active'
  },
  {
    id: 'svc-4',
    name: 'Mobile Application Development (iOS & Android)',
    category: 'Mobile Engineering',
    tagline: 'Native and cross-platform enterprise mobile applications',
    description: 'Intuitive, fluid iOS and Android mobile software built with React Native and native Swift/Kotlin bridging. Designed for offline-first resilience, hardware biometrics, and push notifications.',
    iconName: 'Smartphone',
    slaTier: 'Gold',
    turnaroundWeeks: '8-14 Weeks',
    features: [
      'React Native & Flutter Cross-Platform',
      'Biometric Local Auth & Security Vaults',
      'Offline-First SQLite / WatermelonDB Sync',
      'Live Push Notification Workflows',
      'App Store & Play Store Compliance Sign-Off'
    ],
    pricingModel: 'Fixed Milestone',
    startingPrice: 280000,
    activeContracts: 0,
    status: 'Active'
  },
  {
    id: 'svc-5',
    name: 'UI/UX Engineering & Modern Design Systems',
    category: 'Product Design',
    tagline: 'Intuitive, accessible, and high-converting product interfaces',
    description: 'Enterprise Figma design systems, WCAG 2.1 AA accessibility compliance audits, interactive motion prototypes, and pixel-perfect component libraries tailored for SaaS dashboards.',
    iconName: 'Layers',
    slaTier: 'Gold',
    turnaroundWeeks: '3-6 Weeks',
    features: [
      'Complete Figma Component Token Systems',
      'WCAG 2.1 AA Certified Accessibility',
      'Interactive User Journey Flowcharts',
      'Dark/Light Dynamic Mode Theming'
    ],
    pricingModel: 'Sprint Based',
    startingPrice: 120000,
    activeContracts: 0,
    status: 'Active'
  },
  {
    id: 'svc-6',
    name: 'Enterprise Security, Compliance & Code Audits',
    category: 'Security & Governance',
    tagline: 'Vulnerability assessment, pen-testing, and compliance',
    description: 'Static application security testing (SAST), penetration testing, dependency threat analysis, and automated compliance auditing for ISO 27001, SOC 2, and Indian DPDP Act readiness.',
    iconName: 'Shield',
    slaTier: 'Diamond',
    turnaroundWeeks: '2-4 Weeks',
    features: [
      'Full-Stack Vulnerability Assessment & Pen-Testing',
      'OWASP Top 10 Mitigation Roadmap',
      'Secrets & Environment Exposure Redaction',
      'Executive Security Audit Attestation'
    ],
    pricingModel: 'Audit Package',
    startingPrice: 150000,
    activeContracts: 0,
    status: 'Active'
  }
];

export const INITIAL_LEADS: Lead[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_EXPENSES: ExpenseRecord[] = [];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    employeeId: '202600000001',
    name: 'Rohit Pawar',
    role: 'Managing Director & Lead Architect',
    department: 'Engineering',
    email: 'director@enterprenex.solutions',
    phone: '+91-9226860060',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
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
    kpiScore: 96.0,
    okrScore: 95.0,
    joinDate: '2026-01-01'
  },
  {
    id: 'emp-2',
    employeeId: 'ZCX-EMP-0001',
    name: 'POLAMREDDY REVANTH REDDY',
    role: 'Full Stack Developer (Employee)',
    department: 'Engineering',
    email: 'revanth@enterprenex.solutions',
    personalEmail: 'polamreddyrevanth.82@gmail.com',
    phone: '+919440829762',
    personalPhone: '+919440829762',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
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
    kpiScore: 94.2,
    okrScore: 92.0,
    joinDate: '2026-11-10'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_LEAVES: LeaveRequest[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_KPIS: EmployeeKpiScorecard[] = [];

export const INITIAL_OKRS: ObjectiveKeyResult[] = [];

export const INITIAL_TICKETS: SupportTicket[] = [];

export const INITIAL_DOCUMENTS: VaultDocument[] = [];

export const INITIAL_MEETINGS: CalendarMeeting[] = [];

export const INITIAL_ANNOUNCEMENTS: CommunityAnnouncement[] = [];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];

export const INITIAL_CMS: WebsiteCmsData = {
  hero: {
    badge: 'Enterprise Software & AI Excellence',
    title: 'Transforming Business Through Autonomous Digital Engineering',
    subtitle: 'Enterprenex Solutions engineers enterprise cloud infrastructures, bespoke full-stack applications, and autonomous AI pipelines.',
    primaryCtaText: 'Explore Enterprise Suite',
    primaryCtaLink: '/services',
    secondaryCtaText: 'Schedule Consultation',
    secondaryCtaLink: '/contact'
  },
  metrics: [
    { label: 'Uptime SLA', value: '99.99%', description: 'Guaranteed enterprise platform availability' },
    { label: 'Enterprise Security', value: 'ISO 27001', description: 'Certified statutory compliance' },
    { label: 'Code Review Rigor', value: '100%', description: 'Automated static analysis & manual audit' },
    { label: 'Customer Trust', value: 'Tier-1', description: 'Selected by high-growth startups' }
  ],
  companyInfo: {
    registeredName: 'Enterprenex Solutions Pvt Ltd',
    cin: 'U72900MH2024PTC412345',
    gstin: '27AABCE1234F1Z5',
    registeredOffice: 'Plot No. 148, Shrinand Plaza, CIDCO Waluj Mahanagar 1, Aurangabad, MH 431136 IN',
    directorName: 'Rohit Pawar',
    leadDeveloperName: 'Polamreddy Revanth Reddy',
    directorEmail: 'director@enterprenex.solutions',
    hrEmail: 'hr@enterprenex.solutions',
    contactEmail: 'contact@enterprenex.solutions',
    phone: '+91-9226860060'
  }
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_API_KEYS: ApiKeyItem[] = [];

export const INITIAL_SESSIONS: UserSession[] = [];

export const INITIAL_OFFER_LETTERS: OfferLetter[] = [];

export const INITIAL_NOTIFICATIONS: EwmsNotification[] = [];
