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
    name: 'Managing Director',
    email: 'director@enterprenexsolution.com',
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
    email: 'hr@enterprenexsolution.com',
    role: 'Project Manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Operations & HR Management',
    status: 'Active',
    lastLogin: 'Just now',
    phone: '+91-9226860060'
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cl-1',
    companyName: 'Tata Consultancy Services Ltd',
    industry: 'Enterprise Software & Systems',
    website: 'https://www.tcs.com',
    gstin: '27AAACT2727Q1ZB',
    status: 'Active',
    primaryContact: {
      name: 'Rajesh Sharma',
      role: 'Head of Strategic Procurement',
      email: 'rajesh.sharma@tcs-enterprise.com',
      phone: '+91-22-67789999'
    },
    city: 'Mumbai',
    country: 'India',
    address: 'TCS House, Raveline Street, Fort',
    totalRevenue: 1250000,
    activeProjectsCount: 2,
    createdAt: '2026-01-15',
    notes: [
      'Master Service Agreement (MSA) executed for FY2026.',
      'Quarterly security, data confidentiality, and compliance review cleared.'
    ]
  },
  {
    id: 'cl-2',
    companyName: 'Apex FinTech Technologies Pvt Ltd',
    industry: 'Banking & Financial Technology',
    website: 'https://www.apexfintech.in',
    gstin: '27AABCA1234F1Z8',
    status: 'Active',
    primaryContact: {
      name: 'Vikram Mehra',
      role: 'VP of Engineering & Architecture',
      email: 'v.mehra@apexfintech.in',
      phone: '+91-9820198765'
    },
    city: 'Pune',
    country: 'India',
    address: 'Cyber City, Magarpatta',
    totalRevenue: 850000,
    activeProjectsCount: 1,
    createdAt: '2026-02-10',
    notes: [
      'Core payment gateway reconciliation module delivered on schedule.',
      'Statutory NDA and IP assignment covenant signed.'
    ]
  }
];

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_SERVICES: ServiceCatalogueItem[] = [
  {
    id: 'svc-1',
    name: 'Enterprise Web & Full Stack Architecture',
    category: 'Software Engineering',
    shortDesc: 'High-performance, fault-tolerant web applications for scale',
    fullDesc: 'Bespoke enterprise web platforms architected with React, Node.js, and cloud databases. Includes microservices design, SLA-backed resilience, sub-second latency, and bank-grade data security protocols.',
    pricingModel: 'Milestone',
    startingPrice: 350000,
    typicalTimeline: '8-16 Weeks',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Docker'],
    features: [
      'Microservices & Distributed Systems',
      'Bank-Grade End-to-End Encryption',
      'Real-Time WebSockets & Telemetry',
      'High-Throughput Postgres & Redis Pipelines',
      'Zero-Downtime Blue/Green Deployments',
      '99.99% Uptime Guarantee'
    ],
    active: true,
    iconName: 'Globe',
    leadsCount: 0
  },
  {
    id: 'svc-2',
    name: 'AI Agents, Copilots & Automation Pipelines',
    category: 'AI & Data Science',
    shortDesc: 'Autonomous AI agents embedded into your business workflow',
    fullDesc: 'Custom Large Language Model (LLM) fine-tuning, retrieval-augmented generation (RAG) vector pipelines, and agentic workflows that automate customer intelligence, financial reconciliation, and support.',
    pricingModel: 'Retainer',
    startingPrice: 450000,
    typicalTimeline: '6-12 Weeks',
    technologies: ['Python', 'LangChain', 'FastAPI', 'OpenAI', 'PgVector'],
    features: [
      'Multi-Agent System Orchestration',
      'Enterprise Vector Knowledge Bases (Pinecone / PgVector)',
      'Autonomous CRM & Email Handlers',
      'Strict Zero Data Leakage Privacy Boundary',
      'Real-Time Voice & Multi-Modal Copilots'
    ],
    active: true,
    iconName: 'Brain',
    leadsCount: 0
  },
  {
    id: 'svc-3',
    name: 'Cloud Infrastructure, DevOps & Containerization',
    category: 'Cloud Solutions',
    shortDesc: 'Cloud architectures engineered for 99.99% reliability',
    fullDesc: 'Modern infrastructure as code (Terraform), Kubernetes cluster orchestration, and automated CI/CD pipelines across AWS, GCP, and Hybrid Clouds.',
    pricingModel: 'Retainer',
    startingPrice: 180000,
    typicalTimeline: '4-8 Weeks',
    technologies: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'GitHub Actions'],
    features: [
      'Kubernetes (EKS/GKE) Multi-Node Orchestration',
      'Terraform Infrastructure as Code',
      'Automated Multi-Stage CI/CD Deployment Gates',
      'Comprehensive Observability & Tracing',
      '24/7 Automated Disaster Recovery & Failover'
    ],
    active: true,
    iconName: 'Cloud',
    leadsCount: 0
  },
  {
    id: 'svc-4',
    name: 'Mobile Application Development (iOS & Android)',
    category: 'Mobile Engineering',
    shortDesc: 'Native and cross-platform enterprise mobile applications',
    fullDesc: 'Intuitive, fluid iOS and Android mobile software built with React Native and native Swift/Kotlin bridging. Designed for offline-first resilience, hardware biometrics, and push notifications.',
    pricingModel: 'Milestone',
    startingPrice: 280000,
    typicalTimeline: '8-14 Weeks',
    technologies: ['React Native', 'TypeScript', 'iOS Swift', 'Android Kotlin', 'SQLite'],
    features: [
      'React Native & Flutter Cross-Platform',
      'Biometric Local Auth & Security Vaults',
      'Offline-First SQLite / WatermelonDB Sync',
      'Live Push Notification Workflows',
      'App Store & Play Store Compliance Sign-Off'
    ],
    active: true,
    iconName: 'Smartphone',
    leadsCount: 0
  },
  {
    id: 'svc-5',
    name: 'UI/UX Engineering & Modern Design Systems',
    category: 'Product Design',
    shortDesc: 'Intuitive, accessible, and high-converting product interfaces',
    fullDesc: 'Enterprise Figma design systems, WCAG 2.1 AA accessibility compliance audits, interactive motion prototypes, and pixel-perfect component libraries tailored for SaaS dashboards.',
    pricingModel: 'Hourly',
    startingPrice: 120000,
    typicalTimeline: '3-6 Weeks',
    technologies: ['Figma', 'Tailwind CSS', 'Storybook', 'Framer Motion'],
    features: [
      'Complete Figma Component Token Systems',
      'WCAG 2.1 AA Certified Accessibility',
      'Interactive User Journey Flowcharts',
      'Dark/Light Dynamic Mode Theming'
    ],
    active: true,
    iconName: 'Layout',
    leadsCount: 0
  },
  {
    id: 'svc-6',
    name: 'Enterprise Security, Compliance & Code Audits',
    category: 'Security & Governance',
    shortDesc: 'Vulnerability assessment, pen-testing, and compliance',
    fullDesc: 'Static application security testing (SAST), penetration testing, dependency threat analysis, and automated compliance auditing for ISO 27001, SOC 2, and Indian DPDP Act readiness.',
    pricingModel: 'Fixed',
    startingPrice: 150000,
    typicalTimeline: '2-4 Weeks',
    technologies: ['OWASP ZAP', 'Snyk', 'SonarQube', 'Linux Hardening'],
    features: [
      'Full-Stack Vulnerability Assessment & Pen-Testing',
      'OWASP Top 10 Mitigation Roadmap',
      'Secrets & Environment Exposure Redaction',
      'Executive Security Audit Attestation'
    ],
    active: true,
    iconName: 'Shield',
    leadsCount: 0
  }
];

export const INITIAL_LEADS: Lead[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_EXPENSES: ExpenseRecord[] = [];

export const INITIAL_EMPLOYEES: Employee[] = [];

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
    keywords: 'Enterprise Software, AI Agents, Full Stack Engineering, Cloud Infrastructure, Enterprenex',
    ogImage: 'https://www.enterprenexsolution.com/images/og-preview.png'
  }
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_API_KEYS: ApiKeyItem[] = [];

export const INITIAL_SESSIONS: UserSession[] = [];

export const INITIAL_OFFER_LETTERS: OfferLetter[] = [];

export const INITIAL_NOTIFICATIONS: EwmsNotification[] = [];
