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

export interface Client {
  id: string;
  companyName: string;
  industry: string;
  website: string;
  gstin?: string;
  status: 'Active' | 'Onboarding' | 'Lead' | 'Inactive';
  primaryContact: ClientContact;
  additionalContacts?: ClientContact[];
  address: string;
  city: string;
  country: string;
  totalRevenue: number;
  activeProjectsCount: number;
  notes: string[];
  documents: ClientDocument[];
  paymentHistory: ClientPaymentRecord[];
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
  name: string;
  role: string;
  department: 'Engineering' | 'AI & ML' | 'Design' | 'Product' | 'Sales & Marketing' | 'Finance & HR';
  email: string;
  phone: string;
  avatar: string;
  skills: string[];
  currentProjects: string[];
  workloadPercentage: number;
  joinDate: string;
  salaryMonthly: number;
  performanceRating: number; // 1-5
  status: 'Active' | 'On Leave' | 'Remote';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Late' | 'Half Day' | 'Absent';
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

// 8. Tasks
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskColumn = 'To Do' | 'In Progress' | 'In Review' | 'Testing' | 'Done' | 'Blocked';

export interface TaskComment {
  id: string;
  author: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  assignedTo: string; // Employee name
  priority: TaskPriority;
  status: TaskColumn;
  dueDate: string;
  subtasks: { id: string; title: string; completed: boolean }[];
  comments: TaskComment[];
  loggedHours: number;
  estimatedHours: number;
  tags: string[];
  createdAt: string;
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
  category: 'Bug Fix' | 'Feature Request' | 'Server Issue' | 'Billing' | 'General Query';
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
  accessPermission: 'Public' | 'Internal' | 'Confidential' | 'Admin Only';
  tags: string[];
  url: string;
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
