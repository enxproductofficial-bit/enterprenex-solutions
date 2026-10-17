// TypeScript interfaces for Enterprenex Admin & Operations Suite

export type UserRole = 'Super Admin' | 'Project Manager' | 'Sales Lead' | 'Finance Officer' | 'HR Manager' | 'Developer' | 'Team Member';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  phone?: string;
  employeeId?: string;
  mustChangePassword?: boolean;
}

// 1. Dashboard Metrics
export interface DashboardStats {
  totalClients: number;
  activeProjects: number;
  completedProjects: number;
  pendingProjects: number;
  monthlyRevenue: number;
  outstandingPayments: number;
  newLeads: number;
  activeTickets: number;
  teamWorkloadPercentage: number;
}

// 2. Client Management
export interface ClientContact {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface ClientDocument {
  id: string;
  title: string;
  type: 'NDA' | 'Contract' | 'SOW' | 'Invoice' | 'Tax ID';
  uploadDate: string;
  fileSize: string;
  url: string;
}

export interface ClientPaymentRecord {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  method: string;
}

export interface ClientBillingAddress {
  city: string;
  state: string;
  pincode: string;
  fullAddress: string;
}

export interface Client {
  id: string;
  companyName: string;
  industry: string;
  website: string;
  gstin?: string;
  status: 'Active' | 'Onboarding' | 'Lead' | 'Inactive';
  primaryContact: ClientContact;
  additionalContacts?: ClientContact[];
  address?: string;
  billingAddress?: string | ClientBillingAddress;
  city?: string;
  country?: string;
  slaTier?: string;
  totalBilled?: number;
  totalRevenue?: number;
  activeProjectsCount?: number;
  openTicketsCount?: number;
  notes?: string[];
  documents?: ClientDocument[];
  paymentHistory?: ClientPaymentRecord[];
  createdAt: string;
}

// 3. Project Management
export type ProjectStatus = 
  | 'Lead'
  | 'Proposal'
  | 'Planning'
  | 'Development'
  | 'Testing'
  | 'Review'
  | 'Delivered'
  | 'Maintenance';

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  amount?: number;
}

export interface ProjectTaskItem {
  id: string;
  title: string;
  assignedTo: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
}

export interface Project {
  id: string;
  title: string;
  clientName: string;
  clientId: string;
  status: ProjectStatus;
  progress: number; // 0 to 100
  budget: number;
  expenses: number;
  startDate: string;
  targetEndDate: string;
  assignedTeam: string[]; // employee ids or names
  techStack: string[];
  serviceCategory: string;
  description: string;
  milestones: ProjectMilestone[];
  tasks: ProjectTaskItem[];
  documentsCount: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

// 4. Services Management
export interface ServiceCatalogueItem {
  id: string;
  name: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  pricingModel: 'Fixed' | 'Hourly' | 'Retainer' | 'Milestone';
  startingPrice: number;
  typicalTimeline: string;
  technologies: string[];
  features: string[];
  active: boolean;
  iconName: string;
  leadsCount: number;
}

// 5. CRM & Leads
export type LeadStatus = 'New Lead' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export interface LeadActivity {
  id: string;
  type: 'Call' | 'Meeting' | 'Email' | 'Note';
  summary: string;
  date: string;
  author: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: 'Website Form' | 'LinkedIn' | 'Referral' | 'Cold Outreach' | 'WhatsApp' | 'Events';
  status: LeadStatus;
  estimatedValue: number;
  serviceInterested: string;
  assignedSalesperson: string;
  probability: number; // 0 - 100%
  nextFollowUpDate: string;
  notes: string;
  activities: LeadActivity[];
  createdAt: string;
}

// 6. Finance & Billing
export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Draft';

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  taxPercent: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientId: string;
  projectId?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number; // GST 18%
  totalAmount: number;
  status: InvoiceStatus;
  paidAmount: number;
  paymentDate?: string;
  paymentMethod?: string;
  type: 'Tax Invoice' | 'Quotation' | 'Proforma';
}

export interface ExpenseRecord {
  id: string;
  category: 'Infrastructure & Cloud' | 'Software Licenses' | 'Office & Admin' | 'Salaries & Contractors' | 'Marketing';
  description: string;
  amount: number;
  date: string;
  vendor: string;
  receiptUrl?: string;
  paidBy: string;
}

// 7. Team & Employees
export interface Employee {
  id: string;
  employeeId: string;
  password?: string;
  mustChangePassword?: boolean;
  temporaryPassword?: string;
  name: string;
  role: string;
  designation?: string;
  department: 'Engineering' | 'AI & ML' | 'Design' | 'Product' | 'Sales & Marketing' | 'Finance & HR';
  reportingManager?: string;
  qualification?: string;
  email: string;
  phone: string;
  personalEmail?: string;
  personalPhone?: string;
  avatar: string;
  skills: string[];
  currentProjects: string[];
  workloadPercentage: number;
  joinDate: string;
  salaryMonthly: number;
  performanceRating: number; // 1-5
  status: 'Active' | 'On Leave' | 'Remote' | 'Resigned' | 'Terminated' | 'Inactive';
  approvalStatus?: 'Approved' | 'Pending Director Approval' | 'Rejected';
  approvedBy?: string;
  approvedAt?: string;
  panNumber?: string;
  panDocUrl?: string;
  aadhaarNumber?: string;
  aadhaarDocUrl?: string;
  kycStatus?: 'Verified' | 'Pending Verification' | 'Rejected' | 'Not Submitted';
  kycVerifiedBy?: string;
  kycVerifiedAt?: string;
  employmentType?: 'Full Time' | 'Part Time' | 'Intern' | 'Contract' | 'Freelancer';
  workMode?: 'Office' | 'Remote' | 'Hybrid';
  kpiScore?: number;
  okrScore?: number;
  skillsMatrix?: {
    name: string;
    category: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    rating: number; // 1-5
    verifiedRating?: number;
    isVerified?: boolean;
    verifiedBy?: string;
  }[];
  education?: {
    degree: string;
    institute: string;
    specialization: string;
    startYear: string;
    endYear: string;
    score: string;
  }[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Late' | 'Half Day' | 'Absent';
  absenceReason?: string;
  absenceNotes?: string;
  notifiedVia?: string[];
  recordedBy?: string;
  recordedAt?: string;
}

export interface LeaveRequest {
  id: string;
  employeeName: string;
  type: 'Sick Leave' | 'Casual Leave' | 'Paid Leave' | 'Unpaid';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

// 8. Tasks (EWMS Workflow)
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

// EWMS Section 10: 9-Stage Task Lifecycle Progression + backward compatibility
export type TaskColumn =
  | 'Backlog'
  | 'To Do'
  | 'In Progress'
  | 'Blocked'
  | 'In Review'
  | 'Revision Required'
  | 'Approved'
  | 'Completed'
  | 'Cancelled'
  | 'Changes Required'
  | 'Assigned'
  | 'Done'
  | 'Testing';

export interface TaskComment {
  id: string;
  author: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size?: string;
  url?: string;
  type?: string;
  uploadedAt?: string;
}

export interface TaskAcceptanceCriteria {
  id: string;
  text: string;
  met: boolean;
}

export interface TaskTimeSession {
  id: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  activityNote?: string;
}

// EWMS Section 10 Architecture Blueprint: 18 Specification Fields
export interface Task {
  id: string;
  taskId?: string; // 1. Task ID (e.g. TSK-2026-001)
  title: string; // 2. Task Title
  description: string; // 3. Description
  projectId: string; // 4. Project
  projectName: string;
  module?: string; // 5. Module (e.g. Core Engine, Billing, Security)
  assignedBy?: string; // 6. Assigned By (e.g. Rohit Pawar - Technical Director)
  assignedTo: string; // 7. Assigned To (Employee name)
  reviewer?: string; // 8. Reviewer (Peer/Lead Reviewer)
  priority: TaskPriority; // 9. Priority
  status: TaskColumn; // 10. Status (9-Stage Lifecycle)
  startDate?: string; // 11. Start Date
  dueDate: string; // 12. Due Date
  estimatedHours: number; // 13. Estimated Hours
  loggedHours: number; // 14. Actual Hours / Logged Hours
  dependencies?: string[] | string; // 15. Dependencies (e.g. TSK-101)
  attachments?: TaskAttachment[]; // 16. Attachments
  comments: TaskComment[]; // 17. Comments
  acceptanceCriteria?: TaskAcceptanceCriteria[]; // 18. Acceptance Criteria
  subtasks: { id: string; title: string; completed: boolean }[];
  tags: string[];
  createdAt: string;
  reviewNotes?: string;
  timeSessions?: TaskTimeSession[];
}

// 8b. EWMS KPI & Performance Interfaces
export interface KpiMetricItem {
  id: string;
  name: string;
  weight: number; // Percentage, e.g. 25
  target: string;
  actual: string;
  score: number; // 0 - 100
}

export interface EmployeeKpiScorecard {
  employeeId: string;
  employeeName: string;
  roleTemplate: 'Software Developer' | 'UI/UX Designer' | 'QA Engineer' | 'DevOps Engineer' | 'Intern';
  period: string;
  metrics: KpiMetricItem[];
  finalKpiScore: number; // calculated weighted sum
  updatedAt: string;
}

export interface ObjectiveKeyResult {
  id: string;
  objectiveTitle: string;
  department: string;
  ownerName: string;
  period: string;
  progressPercent: number;
  keyResults: {
    id: string;
    title: string;
    target: string;
    current: string;
    progressPercent: number;
  }[];
}

export interface SelfAssessmentRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  accomplishments: string;
  challenges: string;
  skillsImproved: string;
  supportNeeded: string;
  nextPeriodGoals: string;
  submittedAt: string;
  managerRating?: number;
  managerFeedback?: string;
  status: 'Draft' | 'Submitted' | 'Reviewed';
}

// 9. Support & Helpdesk
export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  clientName: string;
  clientEmail: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Waiting on Client' | 'Resolved' | 'Closed';
  assignedTo: string;
  category: 'Bug Fix' | 'Feature Request' | 'Server Issue' | 'Billing' | 'General Query' | 'Attendance Correction' | 'Certificate Request' | 'Leave & Permission' | 'HR & Stipend' | 'IT & Setup';
  slaHoursRemaining: number;
  createdAt: string;
  messages: {
    id: string;
    sender: string;
    isClient: boolean;
    text: string;
    timestamp: string;
  }[];
}

// 10. Documents
export interface VaultDocument {
  id: string;
  title: string;
  category: 'Contracts' | 'NDA' | 'Proposals' | 'Quotations' | 'Invoices' | 'Technical Docs' | 'Client Docs' | 'Employee Docs';
  version: string;
  fileFormat: string;
  fileSize: string;
  uploadedBy: string;
  uploadDate: string;
  accessPermission: 'Public' | 'Internal' | 'Confidential' | 'Admin Only' | 'Executive';
  tags: string[];
  url: string;
  employeeId?: string;
  verificationStatus?: 'Verified' | 'Pending Verification' | 'Rejected' | 'Not Submitted';
  verifiedBy?: string;
  verifiedAt?: string;
}

// 11. Calendar & Meetings
export interface CalendarMeeting {
  id: string;
  title: string;
  type: 'Client Presentation' | 'Sprint Planning' | 'Lead Follow-up' | 'Project Milestone' | 'Internal Sync';
  date: string; // YYYY-MM-DD
  time: string; // e.g. 10:30 AM - 11:30 AM
  attendees: string[];
  location: string; // e.g. Google Meet, Zoom, Office Boardroom
  meetUrl?: string;
  description: string;
}

// 11b. Community Announcements & Director Bulletins
export interface CommunityAnnouncement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  isDirectorPost: boolean;
  priority: 'Urgent' | 'General' | 'Policy' | 'Celebration';
  postedAt: string;
  likes: number;
  likedBy?: string[];
  tags?: string[];
  meetingLink?: string;
}

// 11c. Employee 1-on-1 and Group Chat
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  channelId: string; // 'general' or 1-on-1 employee ID
  recipientId?: string;
  recipientName?: string;
  message: string;
  timestamp: string;
  isDirector: boolean;
}


// 12. CMS & Website Editor
export interface WebsiteCmsData {
  hero: {
    badge: string;
    heading: string;
    subheading: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  testimonials: {
    id: string;
    name: string;
    role: string;
    company: string;
    rating: number;
    quote: string;
    approved: boolean;
  }[];
  portfolioItems: {
    id: string;
    title: string;
    category: string;
    description: string;
    metric: string;
    techStack: string[];
    featured: boolean;
  }[];
  blogPosts: {
    id: string;
    title: string;
    slug: string;
    category: string;
    author: string;
    date: string;
    readTime: string;
    status: 'Published' | 'Draft';
    excerpt: string;
  }[];
  faqs: {
    id: string;
    question: string;
    answer: string;
    category: string;
  }[];
  contactEnquiries: {
    id: string;
    name: string;
    email: string;
    phone: string;
    service: string;
    message: string;
    submittedAt: string;
    status: 'New' | 'Contacted' | 'Archived';
  }[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    ogImage: string;
  };
}

// 13. Audit & Security
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  ipAddress: string;
  timestamp: string;
  details: string;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  service: string;
  keyMasked: string;
  createdAt: string;
  lastUsed: string;
  status: 'Active' | 'Revoked';
}

export interface UserSession {
  id: string;
  userName: string;
  device: string;
  ipAddress: string;
  location: string;
  loginTime: string;
  isCurrent: boolean;
}

// 14. IP Restriction & Firewall Security
export interface IpWhitelistEntry {
  id: string;
  ip: string;
  label: string;
  addedBy: string;
  addedAt: string;
}

export interface IpSecuritySettings {
  enforceIpRestriction: boolean;
  allowedIps: IpWhitelistEntry[];
}
