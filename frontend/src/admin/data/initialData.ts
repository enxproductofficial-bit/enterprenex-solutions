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
    email: 'director@enterprenexsolution.com',
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
    email: 'manager@enterprenexsolution.com',
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
    email: 'employee@enterprenexsolution.com',
    role: 'Team Member',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    department: 'Engineering & Operations',
    status: 'Active',
    lastLogin: '1 hour ago',
    phone: '+91-9226860060'
  }
];

export const INITIAL_CLIENTS: Client[] = [];

export const INITIAL_PROJECTS: Project[] = [];

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
    email: 'director@enterprenexsolution.com',
    phone: '+91-9226860060',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Cloud Architecture', 'AI Systems'],
    currentProjects: [],
    workloadPercentage: 20,
    joinDate: '2026-01-01',
    salaryMonthly: 150000,
    performanceRating: 5.0,
    status: 'Active',
    approvalStatus: 'Approved'
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
    skills: ['React', 'TypeScript', 'Node.js'],
    currentProjects: [],
    workloadPercentage: 50,
    joinDate: '2026-10-10',
    salaryMonthly: 100000,
    performanceRating: 5.0,
    status: 'Active',
    approvalStatus: 'Approved',
    approvedBy: 'Rohit P. (Managing Director)'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

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

export const INITIAL_TASKS: Task[] = [];

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
    ipAddress: '10.206.229.155',
    timestamp: 'Just now',
    details: 'Zero-trust enterprise governance active for director@enterprenexsolution.com'
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
    ipAddress: '10.206.229.155',
    location: 'India',
    loginTime: 'Just now',
    isCurrent: true
  }
];
