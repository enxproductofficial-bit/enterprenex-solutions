import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  AdminUser,
  Client,
  Project,
  ProjectStatus,
  ServiceCatalogueItem,
  Lead,
  LeadStatus,
  Invoice,
  ExpenseRecord,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  Task,
  TaskColumn,
  SupportTicket,
  VaultDocument,
  CalendarMeeting,
  WebsiteCmsData,
  AuditLog,
  ApiKeyItem,
  UserSession,
  IpSecuritySettings,
  IpWhitelistEntry
} from '../types';
import {
  INITIAL_ADMIN_USERS,
  INITIAL_CLIENTS,
  INITIAL_PROJECTS,
  INITIAL_SERVICES,
  INITIAL_LEADS,
  INITIAL_INVOICES,
  INITIAL_EXPENSES,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVES,
  INITIAL_TASKS,
  INITIAL_TICKETS,
  INITIAL_DOCUMENTS,
  INITIAL_MEETINGS,
  INITIAL_CMS,
  INITIAL_AUDIT_LOGS,
  INITIAL_API_KEYS,
  INITIAL_SESSIONS
} from '../data/initialData';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

const INITIAL_IP_SETTINGS: IpSecuritySettings = {
  enforceIpRestriction: false,
  allowedIps: [
    { id: 'ip-admin-1', ip: '10.206.229.155', label: 'Primary Admin Station (10.206.229.155)', addedBy: 'Security Policy', addedAt: '2026-01-01' },
    { id: 'ip-local-1', ip: '127.0.0.1', label: 'Local Development IPv4', addedBy: 'System', addedAt: '2026-01-01' },
    { id: 'ip-local-2', ip: '::1', label: 'Localhost IPv6', addedBy: 'System', addedAt: '2026-01-01' }
  ]
};

interface AdminContextType {
  currentUser: AdminUser | null;
  users: AdminUser[];
  clients: Client[];
  projects: Project[];
  services: ServiceCatalogueItem[];
  leads: Lead[];
  invoices: Invoice[];
  expenses: ExpenseRecord[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  tasks: Task[];
  tickets: SupportTicket[];
  documents: VaultDocument[];
  meetings: CalendarMeeting[];
  cms: WebsiteCmsData;
  auditLogs: AuditLog[];
  apiKeys: ApiKeyItem[];
  sessions: UserSession[];
  toasts: ToastNotification[];
  ipSettings: IpSecuritySettings;
  detectedIp: string;

  // Auth & Session
  login: (user: AdminUser) => void;
  logout: () => void;
  switchUser: (userId: string) => void;

  // Toast
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Client actions
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'documents' | 'paymentHistory'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Project actions
  addProject: (project: Omit<Project, 'id' | 'documentsCount' | 'tasks'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  updateProjectStatus: (id: string, status: ProjectStatus) => void;
  deleteProject: (id: string) => void;

  // Service actions
  addService: (service: Omit<ServiceCatalogueItem, 'id' | 'leadsCount'>) => void;
  updateService: (id: string, updates: Partial<ServiceCatalogueItem>) => void;
  toggleServiceActive: (id: string) => void;
  deleteService: (id: string) => void;

  // Lead actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'activities'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  addLeadActivity: (leadId: string, activity: { type: 'Call' | 'Meeting' | 'Email' | 'Note'; summary: string }) => void;
  deleteLead: (id: string) => void;

  // Finance actions
  addInvoice: (invoice: Omit<Invoice, 'id' | 'paidAmount'>) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  markInvoicePaid: (id: string, method?: string) => void;
  sendPaymentReminder: (id: string) => void;
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;

  // Team actions
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  updateLeaveStatus: (id: string, status: 'Approved' | 'Rejected') => void;
  markAttendanceToday: (status: 'Present' | 'Late' | 'Half Day' | 'Absent') => void;

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'comments' | 'loggedHours'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskColumn) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addTaskComment: (taskId: string, text: string) => void;
  logTaskTime: (taskId: string, hours: number) => void;
  deleteTask: (id: string) => void;

  // Helpdesk actions
  addTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'messages'>) => void;
  updateTicketStatus: (id: string, status: SupportTicket['status']) => void;
  addTicketReply: (ticketId: string, text: string) => void;

  // Document actions
  uploadDocument: (doc: Omit<VaultDocument, 'id' | 'uploadDate' | 'uploadedBy'>) => void;
  deleteDocument: (id: string) => void;

  // Calendar actions
  addMeeting: (meeting: Omit<CalendarMeeting, 'id'>) => void;
  deleteMeeting: (id: string) => void;

  // CMS actions
  updateCms: (updates: Partial<WebsiteCmsData>) => void;
  updateEnquiryStatus: (id: string, status: 'New' | 'Contacted' | 'Archived') => void;

  // Security actions
  revokeApiKey: (id: string) => void;
  generateApiKey: (name: string, service: string) => void;
  revokeSession: (id: string) => void;
  resetAllData: () => void;

  // IP Restriction actions
  addAllowedIp: (ip: string, label: string) => void;
  removeAllowedIp: (id: string) => void;
  toggleEnforceIpRestriction: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const STORAGE_KEY = 'enterprenex_admin_v2_clean';

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [users] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [services, setServices] = useState<ServiceCatalogueItem[]>(INITIAL_SERVICES);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [documents, setDocuments] = useState<VaultDocument[]>(INITIAL_DOCUMENTS);
  const [meetings, setMeetings] = useState<CalendarMeeting[]>(INITIAL_MEETINGS);
  const [cms, setCms] = useState<WebsiteCmsData>(INITIAL_CMS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(INITIAL_API_KEYS);
  const [sessions, setSessions] = useState<UserSession[]>(INITIAL_SESSIONS);
  const [ipSettings, setIpSettings] = useState<IpSecuritySettings>(INITIAL_IP_SETTINGS);
  const [detectedIp, setDetectedIp] = useState<string>('10.206.229.155');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Detect client public IP on mount
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => {
        if (data && data.ip) {
          setDetectedIp(data.ip);
        }
      })
      .catch(() => {
        setDetectedIp('10.206.229.155');
      });
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.clients) setClients(parsed.clients);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.services) setServices(parsed.services);
        if (parsed.leads) setLeads(parsed.leads);
        if (parsed.invoices) setInvoices(parsed.invoices);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.employees) {
          const sanitized = parsed.employees.map((emp: any) => {
            if (emp.email === 'abvpcsnagar@gmail.com' || emp.phone?.includes('7020443880')) {
              return {
                ...emp,
                name: 'Enterprenex Director',
                email: 'director@enterprenexsolution.com',
                phone: '+91-9226860060'
              };
            }
            return emp;
          });
          setEmployees(sanitized);
        }
        if (parsed.attendance) setAttendance(parsed.attendance);
        if (parsed.leaves) setLeaves(parsed.leaves);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.tickets) setTickets(parsed.tickets);
        if (parsed.documents) setDocuments(parsed.documents);
        if (parsed.meetings) setMeetings(parsed.meetings);
        if (parsed.cms) setCms(parsed.cms);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.apiKeys) setApiKeys(parsed.apiKeys);
        if (parsed.currentUser) {
          const cur = parsed.currentUser;
          if (cur.email === 'abvpcsnagar@gmail.com' || cur.phone?.includes('7020443880')) {
            setCurrentUser({
              ...cur,
              name: 'Company Director',
              email: 'director@enterprenexsolution.com',
              phone: '+91-9226860060'
            });
          } else {
            setCurrentUser(cur);
          }
        }
        if (parsed.ipSettings) setIpSettings(parsed.ipSettings);
      }
    } catch (e) {
      console.warn('Could not parse saved admin state:', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          currentUser,
          clients,
          projects,
          services,
          leads,
          invoices,
          expenses,
          employees,
          attendance,
          leaves,
          tasks,
          tickets,
          documents,
          meetings,
          cms,
          auditLogs,
          apiKeys,
          ipSettings
        })
      );
    } catch (e) {
      console.warn('Could not save admin state:', e);
    }
  }, [
    isLoaded,
    currentUser,
    clients,
    projects,
    services,
    leads,
    invoices,
    expenses,
    employees,
    attendance,
    leaves,
    tasks,
    tickets,
    documents,
    meetings,
    cms,
    auditLogs,
    apiKeys,
    ipSettings
  ]);

  const showToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = 'toast-' + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const logAction = (action: string, moduleName: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      userId: currentUser?.id || 'usr-1',
      userName: currentUser?.name || 'Admin',
      userRole: currentUser?.role || 'Super Admin',
      action,
      module: moduleName,
      ipAddress: detectedIp || '10.206.229.155',
      timestamp: 'Just now',
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const login = (user: AdminUser) => {
    setCurrentUser(user);
    logAction('User Logged In', 'Authentication', `${user.name} (${user.email}) logged in successfully.`);
    showToast('Welcome back', `Logged in as ${user.name}`, 'success');
  };

  const logout = () => {
    if (currentUser) {
      logAction('User Logged Out', 'Authentication', `${currentUser.name} signed out.`);
    }
    setCurrentUser(null);
    showToast('Logged Out', 'You have been safely signed out.', 'info');
  };

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      logAction('Role Switched', 'Authentication', `Switched active profile to ${found.name} (${found.role})`);
      showToast('Profile Switched', `Now acting as ${found.name} (${found.role})`, 'info');
    }
  };

  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'documents' | 'paymentHistory'>) => {
    const newClient: Client = {
      ...clientData,
      id: 'clt-' + Date.now(),
      documents: [],
      paymentHistory: [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    setClients(prev => [newClient, ...prev]);
    logAction('Created Client', 'Client Management', `Added ${newClient.companyName}`);
    showToast('Client Created', `${newClient.companyName} was added to the directory.`, 'success');
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    logAction('Updated Client', 'Client Management', `Updated client record for ID: ${id}`);
    showToast('Client Updated', 'Client details saved successfully.', 'success');
  };

  const deleteClient = (id: string) => {
    const client = clients.find(c => c.id === id);
    setClients(prev => prev.filter(c => c.id !== id));
    logAction('Deleted Client', 'Client Management', `Removed client ${client?.companyName || id}`);
    showToast('Client Removed', 'Client has been deleted.', 'warning');
  };

  const addProject = (projectData: Omit<Project, 'id' | 'documentsCount' | 'tasks'>) => {
    const newProject: Project = {
      ...projectData,
      id: 'prj-' + Date.now(),
      documentsCount: 0,
      tasks: []
    };
    setProjects(prev => [newProject, ...prev]);
    logAction('Created Project', 'Project Management', `Created project ${newProject.title} for ${newProject.clientName}`);
    showToast('Project Created', `${newProject.title} is now tracked in pipeline.`, 'success');
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    logAction('Updated Project', 'Project Management', `Modified project details for ID: ${id}`);
    showToast('Project Updated', 'Project updated successfully.', 'success');
  };

  const updateProjectStatus = (id: string, status: ProjectStatus) => {
    const prj = projects.find(p => p.id === id);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    logAction('Project Status Changed', 'Project Management', `Moved ${prj?.title || id} to ${status}`);
    showToast('Status Updated', `Project status changed to ${status}.`, 'info');
  };

  const deleteProject = (id: string) => {
    const prj = projects.find(p => p.id === id);
    setProjects(prev => prev.filter(p => p.id !== id));
    logAction('Deleted Project', 'Project Management', `Removed project ${prj?.title || id}`);
    showToast('Project Deleted', 'Project has been removed.', 'warning');
  };

  const addService = (serviceData: Omit<ServiceCatalogueItem, 'id' | 'leadsCount'>) => {
    const newService: ServiceCatalogueItem = {
      ...serviceData,
      id: 'svc-' + Date.now(),
      leadsCount: 0
    };
    setServices(prev => [...prev, newService]);
    logAction('Added Service', 'Services Management', `Added ${newService.name} to catalogue`);
    showToast('Service Added', `${newService.name} added to service offerings.`, 'success');
  };

  const updateService = (id: string, updates: Partial<ServiceCatalogueItem>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    logAction('Updated Service', 'Services Management', `Updated service parameters for ID: ${id}`);
    showToast('Service Updated', 'Service catalogue updated.', 'success');
  };

  const toggleServiceActive = (id: string) => {
    const svc = services.find(s => s.id === id);
    if (!svc) return;
    const newState = !svc.active;
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: newState } : s));
    logAction('Toggled Service Status', 'Services Management', `${svc.name} is now ${newState ? 'Active' : 'Inactive'}`);
    showToast('Service Status', `${svc.name} is now ${newState ? 'Active' : 'Inactive'}.`, 'info');
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    showToast('Service Removed', 'Service removed from catalogue.', 'warning');
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'activities'>) => {
    const newLead: Lead = {
      ...leadData,
      id: 'lead-' + Date.now(),
      activities: [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    setLeads(prev => [newLead, ...prev]);
    logAction('Created Lead', 'Lead & CRM', `Added lead ${newLead.name} (${newLead.company})`);
    showToast('Lead Added', `Lead for ${newLead.company} created.`, 'success');
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    showToast('Lead Updated', 'Lead details saved.', 'success');
  };

  const updateLeadStatus = (id: string, status: LeadStatus) => {
    const lead = leads.find(l => l.id === id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    logAction('Lead Stage Moved', 'Lead & CRM', `Moved ${lead?.company || id} to ${status}`);
    showToast('Pipeline Updated', `${lead?.company} moved to ${status}.`, 'info');
  };

  const addLeadActivity = (leadId: string, activity: { type: 'Call' | 'Meeting' | 'Email' | 'Note'; summary: string }) => {
    const newAct = {
      id: 'act-' + Date.now(),
      ...activity,
      date: new Date().toISOString().split('T')[0],
      author: currentUser?.name || 'Sales Rep'
    };
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, activities: [newAct, ...l.activities] } : l));
    showToast('Activity Logged', `${activity.type} recorded.`, 'success');
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    showToast('Lead Deleted', 'Lead removed from CRM.', 'warning');
  };

  const addInvoice = (invData: Omit<Invoice, 'id' | 'paidAmount'>) => {
    const newInv: Invoice = {
      ...invData,
      id: 'inv-' + Date.now(),
      paidAmount: invData.status === 'Paid' ? invData.totalAmount : 0
    };
    setInvoices(prev => [newInv, ...prev]);
    logAction('Generated Invoice', 'Finance & Billing', `Created invoice ${newInv.invoiceNumber} for ₹${newInv.totalAmount.toLocaleString('en-IN')}`);
    showToast('Invoice Created', `${newInv.invoiceNumber} generated for ${newInv.clientName}.`, 'success');
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv));
    showToast('Invoice Updated', 'Invoice saved.', 'success');
  };

  const markInvoicePaid = (id: string, method = 'Direct Bank Transfer') => {
    const inv = invoices.find(i => i.id === id);
    setInvoices(prev => prev.map(i => i.id === id ? {
      ...i,
      status: 'Paid',
      paidAmount: i.totalAmount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: method
    } : i));
    logAction('Invoice Paid', 'Finance & Billing', `Marked ${inv?.invoiceNumber} as Paid (₹${inv?.totalAmount.toLocaleString('en-IN')})`);
    showToast('Payment Recorded', `${inv?.invoiceNumber} marked as Fully Paid.`, 'success');
  };

  const sendPaymentReminder = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    showToast('Reminder Sent', `Automated payment reminder sent to ${inv?.clientName}.`, 'info');
  };

  const addExpense = (expData: Omit<ExpenseRecord, 'id'>) => {
    const newExp: ExpenseRecord = {
      ...expData,
      id: 'exp-' + Date.now()
    };
    setExpenses(prev => [newExp, ...prev]);
    logAction('Recorded Expense', 'Finance & Billing', `Added ₹${newExp.amount.toLocaleString('en-IN')} for ${newExp.description}`);
    showToast('Expense Logged', `Recorded ₹${newExp.amount.toLocaleString('en-IN')}.`, 'success');
  };

  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...empData,
      id: 'emp-' + Date.now()
    };
    setEmployees(prev => [...prev, newEmp]);
    logAction('Added Employee', 'Team Management', `Added ${newEmp.name} to ${newEmp.department}`);
    showToast('Team Member Added', `${newEmp.name} added to the organization roster.`, 'success');
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    showToast('Employee Updated', 'Employee record updated.', 'success');
  };

  const updateLeaveStatus = (id: string, status: 'Approved' | 'Rejected') => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    logAction('Leave Request Processed', 'Team Management', `Leave ID ${id} set to ${status}`);
    showToast('Leave Request', `Leave request has been ${status}.`, 'info');
  };

  const markAttendanceToday = (status: 'Present' | 'Late' | 'Half Day' | 'Absent') => {
    if (!currentUser) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];
    const newAtt: AttendanceRecord = {
      id: 'att-' + Date.now(),
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      date: dateStr,
      checkIn: timeStr,
      checkOut: '-',
      status
    };
    setAttendance(prev => [newAtt, ...prev]);
    showToast('Attendance Checked In', `Marked as ${status} at ${timeStr}.`, 'success');
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'comments' | 'loggedHours'>) => {
    const newTask: Task = {
      ...taskData,
      id: 'task-' + Date.now(),
      comments: [],
      loggedHours: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => [newTask, ...prev]);
    logAction('Created Task', 'Task Management', `Created task: ${newTask.title}`);
    showToast('Task Created', `Added "${newTask.title}" to ${newTask.status}.`, 'success');
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    showToast('Task Updated', 'Task saved.', 'success');
  };

  const updateTaskStatus = (id: string, status: TaskColumn) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    showToast('Task Moved', `Task shifted to ${status}.`, 'info');
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st)
      };
    }));
  };

  const addTaskComment = (taskId: string, text: string) => {
    const newComment = {
      id: 'cm-' + Date.now(),
      author: currentUser?.name || 'Admin',
      authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      text,
      createdAt: 'Just now'
    };
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t));
    showToast('Comment Added', 'Your comment was posted.', 'success');
  };

  const logTaskTime = (taskId: string, hours: number) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, loggedHours: t.loggedHours + hours } : t));
    showToast('Time Logged', `Logged +${hours} hours on task.`, 'success');
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast('Task Deleted', 'Task removed.', 'warning');
  };

  const addTicket = (tktData: Omit<SupportTicket, 'id' | 'createdAt' | 'messages'>) => {
    const newTicket: SupportTicket = {
      ...tktData,
      id: 'tkt-' + Date.now(),
      createdAt: new Date().toLocaleString(),
      messages: []
    };
    setTickets(prev => [newTicket, ...prev]);
    logAction('Created Ticket', 'Support & Helpdesk', `Opened ticket ${newTicket.ticketNumber}: ${newTicket.subject}`);
    showToast('Ticket Opened', `Support ticket ${newTicket.ticketNumber} created.`, 'success');
  };

  const updateTicketStatus = (id: string, status: SupportTicket['status']) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    showToast('Ticket Updated', `Ticket marked as ${status}.`, 'info');
  };

  const addTicketReply = (ticketId: string, text: string) => {
    const newMsg = {
      id: 'msg-' + Date.now(),
      sender: `${currentUser?.name || 'Enterprenex Support'} (Staff)`,
      isClient: false,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, messages: [...t.messages, newMsg] } : t));
    showToast('Reply Sent', 'Client response dispatched.', 'success');
  };

  const uploadDocument = (docData: Omit<VaultDocument, 'id' | 'uploadDate' | 'uploadedBy'>) => {
    const newDoc: VaultDocument = {
      ...docData,
      id: 'vdoc-' + Date.now(),
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: currentUser?.name || 'Admin'
    };
    setDocuments(prev => [newDoc, ...prev]);
    logAction('Uploaded Document', 'Document Vault', `Uploaded ${newDoc.title} (${newDoc.category})`);
    showToast('Document Uploaded', `${newDoc.title} secured in central vault.`, 'success');
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    showToast('Document Deleted', 'File deleted from vault.', 'warning');
  };

  const addMeeting = (meetData: Omit<CalendarMeeting, 'id'>) => {
    const newMeeting: CalendarMeeting = {
      ...meetData,
      id: 'meet-' + Date.now()
    };
    setMeetings(prev => [...prev, newMeeting]);
    showToast('Event Scheduled', `"${newMeeting.title}" added to calendar.`, 'success');
  };

  const deleteMeeting = (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
    showToast('Event Cancelled', 'Event removed from calendar.', 'info');
  };

  const updateCms = (updates: Partial<WebsiteCmsData>) => {
    setCms(prev => ({ ...prev, ...updates }));
    logAction('Updated Website Content', 'CMS & Website', 'Published updates to public website content');
    showToast('CMS Published', 'Website content updated live.', 'success');
  };

  const updateEnquiryStatus = (id: string, status: 'New' | 'Contacted' | 'Archived') => {
    setCms(prev => ({
      ...prev,
      contactEnquiries: prev.contactEnquiries.map(e => e.id === id ? { ...e, status } : e)
    }));
    showToast('Enquiry Updated', `Status changed to ${status}.`, 'info');
  };

  const revokeApiKey = (id: string) => {
    setApiKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'Revoked' } : k));
    logAction('Revoked API Key', 'Admin & Security', `Revoked key with ID: ${id}`);
    showToast('API Key Revoked', 'API token access has been revoked.', 'warning');
  };

  const generateApiKey = (name: string, service: string) => {
    const newKey: ApiKeyItem = {
      id: 'key-' + Date.now(),
      name,
      service,
      keyMasked: 'sk-live-' + Math.random().toString(36).substr(2, 6) + '********************',
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      status: 'Active'
    };
    setApiKeys(prev => [newKey, ...prev]);
    logAction('Created API Key', 'Admin & Security', `Generated new API key for ${name}`);
    showToast('API Key Generated', `New key for ${service} generated.`, 'success');
  };

  const revokeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    logAction('Terminated Session', 'Admin & Security', `Remotely terminated session ID: ${id}`);
    showToast('Session Terminated', 'Remote session logged out.', 'info');
  };

  // IP Restriction Operations
  const addAllowedIp = (ip: string, label: string) => {
    const newEntry: IpWhitelistEntry = {
      id: 'ip-' + Date.now(),
      ip: ip.trim(),
      label: label.trim() || 'Authorized IP',
      addedBy: currentUser?.name || 'Admin',
      addedAt: new Date().toISOString().split('T')[0]
    };
    setIpSettings(prev => ({
      ...prev,
      allowedIps: [newEntry, ...prev.allowedIps]
    }));
    logAction('Added Whitelist IP', 'Security Firewall', `Whitelisted IP ${ip} (${label})`);
    showToast('IP Whitelisted', `Added ${ip} to authorized IP list.`, 'success');
  };

  const removeAllowedIp = (id: string) => {
    const target = ipSettings.allowedIps.find(entry => entry.id === id);
    setIpSettings(prev => ({
      ...prev,
      allowedIps: prev.allowedIps.filter(entry => entry.id !== id)
    }));
    logAction('Removed Whitelist IP', 'Security Firewall', `Removed IP ${target?.ip || id}`);
    showToast('IP Removed', 'IP removed from whitelist.', 'warning');
  };

  const toggleEnforceIpRestriction = () => {
    const newState = !ipSettings.enforceIpRestriction;
    setIpSettings(prev => ({
      ...prev,
      enforceIpRestriction: newState
    }));
    logAction('Toggled IP Firewall', 'Security Firewall', `IP Restriction Enforcement set to ${newState ? 'ACTIVE' : 'DISABLED'}`);
    showToast('Firewall Policy Updated', `IP Restriction is now ${newState ? 'ENFORCED (Strict Mode)' : 'DISABLED (Open Mode)'}.`, 'info');
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setClients(INITIAL_CLIENTS);
    setProjects(INITIAL_PROJECTS);
    setServices(INITIAL_SERVICES);
    setLeads(INITIAL_LEADS);
    setInvoices(INITIAL_INVOICES);
    setExpenses(INITIAL_EXPENSES);
    setEmployees(INITIAL_EMPLOYEES);
    setAttendance(INITIAL_ATTENDANCE);
    setLeaves(INITIAL_LEAVES);
    setTasks(INITIAL_TASKS);
    setTickets(INITIAL_TICKETS);
    setDocuments(INITIAL_DOCUMENTS);
    setMeetings(INITIAL_MEETINGS);
    setCms(INITIAL_CMS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setApiKeys(INITIAL_API_KEYS);
    setSessions(INITIAL_SESSIONS);
    setIpSettings(INITIAL_IP_SETTINGS);
    setCurrentUser(null);
    showToast('System Reset', 'All enterprise store data reset to clean state.', 'warning');
  };

  return (
    <AdminContext.Provider
      value={{
        currentUser,
        users,
        clients,
        projects,
        services,
        leads,
        invoices,
        expenses,
        employees,
        attendance,
        leaves,
        tasks,
        tickets,
        documents,
        meetings,
        cms,
        auditLogs,
        apiKeys,
        sessions,
        toasts,
        ipSettings,
        detectedIp,
        login,
        logout,
        switchUser,
        showToast,
        removeToast,
        addClient,
        updateClient,
        deleteClient,
        addProject,
        updateProject,
        updateProjectStatus,
        deleteProject,
        addService,
        updateService,
        toggleServiceActive,
        deleteService,
        addLead,
        updateLead,
        updateLeadStatus,
        addLeadActivity,
        deleteLead,
        addInvoice,
        updateInvoice,
        markInvoicePaid,
        sendPaymentReminder,
        addExpense,
        addEmployee,
        updateEmployee,
        updateLeaveStatus,
        markAttendanceToday,
        addTask,
        updateTask,
        updateTaskStatus,
        toggleSubtask,
        addTaskComment,
        logTaskTime,
        deleteTask,
        addTicket,
        updateTicketStatus,
        addTicketReply,
        uploadDocument,
        deleteDocument,
        addMeeting,
        deleteMeeting,
        updateCms,
        updateEnquiryStatus,
        revokeApiKey,
        generateApiKey,
        revokeSession,
        resetAllData,
        addAllowedIp,
        removeAllowedIp,
        toggleEnforceIpRestriction
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
