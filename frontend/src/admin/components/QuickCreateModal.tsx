import React, { useState, useRef } from 'react';
import { useAdmin } from '../context/AdminContext';
import { X, Briefcase, Users, Target, FileText, CheckSquare, LifeBuoy, UploadCloud, FileCheck } from 'lucide-react';
import type { ProjectStatus, TaskPriority, TaskColumn, VaultDocument } from '../types';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'project' | 'client' | 'lead' | 'invoice' | 'task' | 'ticket' | 'document';
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({ isOpen, onClose, defaultTab = 'project' }) => {
  const { addProject, addClient, addLead, addInvoice, addTask, addTicket, uploadDocument, clients, projects, employees, services } = useAdmin();
  const [activeTab, setActiveTab] = useState<'project' | 'client' | 'lead' | 'invoice' | 'task' | 'ticket' | 'document'>(defaultTab);

  // Form states
  // 1. Project form
  const [pTitle, setPTitle] = useState('');
  const [pClientId, setPClientId] = useState(clients[0]?.id || '');
  const [pBudget, setPBudget] = useState(1000000);
  const [pCategory, setPCategory] = useState('Web Development');
  const [pStatus, setPStatus] = useState<ProjectStatus>('Planning');
  const [pEnd, setPEnd] = useState('2026-06-30');
  const [pDesc, setPDesc] = useState('');

  // 2. Client form
  const [cName, setCName] = useState('');
  const [cIndustry, setCIndustry] = useState('Technology & Software');
  const [cWebsite, setCWebsite] = useState('');
  const [cGstin, setCGstin] = useState('');
  const [cContactName, setCContactName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cCity, setCCity] = useState('Mumbai');

  // 3. Lead form
  const [lName, setLName] = useState('');
  const [lCompany, setLCompany] = useState('');
  const [lEmail, setLEmail] = useState('');
  const [lPhone, setLPhone] = useState('');
  const [lValue, setLValue] = useState(500000);
  const [lService, setLService] = useState('AI/ML Solutions');
  const [lSource, setLSource] = useState<'Website Form' | 'LinkedIn' | 'Referral' | 'Cold Outreach' | 'WhatsApp' | 'Events'>('Website Form');

  // 4. Task form
  const [tTitle, setTTitle] = useState('');
  const [tProjectId, setTProjectId] = useState(projects[0]?.id || '');
  const [tAssignedTo, setTAssignedTo] = useState(employees[0]?.name || 'Enterprenex Admin');
  const [tPriority, setTPriority] = useState<TaskPriority>('Medium');
  const [tStatus] = useState<TaskColumn>('To Do');
  const [tDue, setTDue] = useState('2026-03-01');
  const [tDesc, setTDesc] = useState('');

  // 5. Invoice form
  const [iClientId, setIClientId] = useState(clients[0]?.id || '');
  const [iAmount, setIAmount] = useState(500000);
  const [iDesc, setIDesc] = useState('Milestone Delivery & Service Retainer');
  const [iDue, setIDue] = useState('2026-03-15');

  // 6. Ticket form
  const [tkSubject, setTkSubject] = useState('');
  const [tkClientName, setTkClientName] = useState(clients[0]?.companyName || '');
  const [tkClientEmail, setTkClientEmail] = useState(clients[0]?.primaryContact?.email || '');
  const [tkPriority, setTkPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [tkCategory, setTkCategory] = useState<'Bug Fix' | 'Feature Request' | 'Server Issue' | 'Billing' | 'General Query'>('Bug Fix');
  const [tkAssignedTo, setTkAssignedTo] = useState(employees[0]?.name || 'Enterprenex Admin');

  // 7. Document form
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dFile, setDFile] = useState<File | null>(null);
  const [dTitle, setDTitle] = useState('');
  const [dCategory, setDCategory] = useState<VaultDocument['category']>('Contracts');
  const [dPermission, setDPermission] = useState<VaultDocument['accessPermission']>('Internal');

  if (!isOpen) return null;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const selClient = clients.find(c => c.id === pClientId);
    addProject({
      title: pTitle || 'New Enterprise Project',
      clientName: selClient ? selClient.companyName : 'Enterprise Client',
      clientId: pClientId,
      status: pStatus,
      progress: 10,
      budget: Number(pBudget),
      expenses: 0,
      startDate: new Date().toISOString().split('T')[0],
      targetEndDate: pEnd,
      assignedTeam: [employees[0]?.name || 'Enterprenex Admin'],
      techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      serviceCategory: pCategory,
      description: pDesc || 'Comprehensive enterprise software development scope.',
      milestones: [
        { id: 'ms-' + Date.now(), title: 'Phase 1: Architecture & Wireframing', dueDate: pEnd, completed: false, amount: Number(pBudget) * 0.4 }
      ],
      priority: 'High'
    });
    onClose();
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    addClient({
      companyName: cName || 'New Client Enterprise',
      industry: cIndustry,
      website: cWebsite || 'https://example.com',
      gstin: cGstin || '27AAACB9999P1ZX',
      status: 'Active',
      primaryContact: {
        name: cContactName || 'Authorized Representative',
        role: 'Director / Project Head',
        email: cEmail || 'contact@client.com',
        phone: cPhone || '+91-9988776655'
      },
      address: 'Commercial Business District',
      city: cCity,
      country: 'India',
      totalRevenue: 0,
      activeProjectsCount: 0,
      notes: ['Client onboarded via Quick Action.']
    });
    onClose();
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    addLead({
      name: lName || 'Prospective Lead',
      company: lCompany || 'Enterprise Prospect',
      email: lEmail || 'lead@prospect.com',
      phone: lPhone || '+91-9876543210',
      source: lSource,
      status: 'New Lead',
      estimatedValue: Number(lValue),
      serviceInterested: lService,
      assignedSalesperson: 'Enterprenex Admin',
      probability: 40,
      nextFollowUpDate: '2026-03-01',
      notes: 'Captured via Quick Action.'
    });
    onClose();
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const selPrj = projects.find(p => p.id === tProjectId);
    addTask({
      title: tTitle || 'Task Item',
      description: tDesc || 'Task description and acceptance criteria.',
      projectId: tProjectId,
      projectName: selPrj ? selPrj.title : 'General Engineering',
      assignedTo: tAssignedTo,
      priority: tPriority,
      status: tStatus,
      dueDate: tDue,
      subtasks: [
        { id: 'st-1', title: 'Implement feature architecture', completed: false },
        { id: 'st-2', title: 'Code review and QA tests', completed: false }
      ],
      estimatedHours: 8,
      tags: ['Sprint Feature', 'Enterprenex']
    });
    onClose();
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const selClient = clients.find(c => c.id === iClientId);
    const subtotal = Number(iAmount);
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;

    addInvoice({
      invoiceNumber: 'INV-2026-' + Math.floor(100 + Math.random() * 900),
      clientName: selClient ? selClient.companyName : 'Enterprise Client',
      clientId: iClientId,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: iDue,
      items: [
        { description: iDesc, quantity: 1, rate: subtotal, taxPercent: 18, amount: subtotal }
      ],
      subtotal,
      taxAmount: tax,
      totalAmount: total,
      status: 'Pending',
      type: 'Tax Invoice'
    });
    onClose();
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    addTicket({
      ticketNumber: 'TKT-' + Math.floor(8000 + Math.random() * 1000),
      subject: tkSubject || 'Technical Query / Support Request',
      clientName: tkClientName,
      clientEmail: tkClientEmail,
      priority: tkPriority,
      status: 'Open',
      assignedTo: tkAssignedTo,
      category: tkCategory,
      slaHoursRemaining: tkPriority === 'Critical' ? 2 : tkPriority === 'High' ? 4 : 24
    });
    onClose();
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    let docUrl = '#';
    let fFormat = 'PDF';
    let fSize = '1.0 MB';

    if (dFile) {
      docUrl = URL.createObjectURL(dFile);
      fFormat = dFile.name.split('.').pop()?.toUpperCase() || 'PDF';
      const sizeMb = (dFile.size / (1024 * 1024)).toFixed(1);
      const sizeKb = (dFile.size / 1024).toFixed(0);
      fSize = dFile.size > 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`;
    }

    uploadDocument({
      title: dTitle || (dFile ? dFile.name : 'Untitled Document'),
      category: dCategory,
      version: 'v1.0',
      fileFormat: fFormat,
      fileSize: fSize,
      accessPermission: dPermission,
      tags: ['Vault', 'Uploaded'],
      url: docUrl
    });
    onClose();
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal-content adm-modal-lg" onClick={e => e.stopPropagation()}>
        <div className="adm-modal-header">
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Quick Create Action</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)' }}>Instantly record items across Enterprenex enterprise operations</p>
          </div>
          <button className="adm-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="adm-tabs" style={{ marginBottom: '1.25rem' }}>
          <button className={`adm-tab-btn ${activeTab === 'project' ? 'active' : ''}`} onClick={() => setActiveTab('project')}>
            <Briefcase size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> Project
          </button>
          <button className={`adm-tab-btn ${activeTab === 'client' ? 'active' : ''}`} onClick={() => setActiveTab('client')}>
            <Users size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> Client
          </button>
          <button className={`adm-tab-btn ${activeTab === 'lead' ? 'active' : ''}`} onClick={() => setActiveTab('lead')}>
            <Target size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> CRM Lead
          </button>
          <button className={`adm-tab-btn ${activeTab === 'task' ? 'active' : ''}`} onClick={() => setActiveTab('task')}>
            <CheckSquare size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> Task
          </button>
          <button className={`adm-tab-btn ${activeTab === 'invoice' ? 'active' : ''}`} onClick={() => setActiveTab('invoice')}>
            <FileText size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> Invoice
          </button>
          <button className={`adm-tab-btn ${activeTab === 'ticket' ? 'active' : ''}`} onClick={() => setActiveTab('ticket')}>
            <LifeBuoy size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> Ticket
          </button>
          <button className={`adm-tab-btn ${activeTab === 'document' ? 'active' : ''}`} onClick={() => setActiveTab('document')}>
            <UploadCloud size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> Document
          </button>
        </div>

        {/* 1. PROJECT FORM */}
        {activeTab === 'project' && (
          <form onSubmit={handleCreateProject}>
            <div className="adm-grid-2">
              <div className="adm-form-group">
                <label className="adm-form-label">Project Title *</label>
                <input className="adm-input" required value={pTitle} onChange={e => setPTitle(e.target.value)} placeholder="e.g. HealthCare AI Scanner" />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Client *</label>
                <select className="adm-select" value={pClientId} onChange={e => setPClientId(e.target.value)}>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                </select>
              </div>
            </div>
            <div className="adm-grid-3">
              <div className="adm-form-group">
                <label className="adm-form-label">Service Category</label>
                <select className="adm-select" value={pCategory} onChange={e => setPCategory(e.target.value)}>
                  {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Total Budget (₹)</label>
                <input className="adm-input" type="number" value={pBudget} onChange={e => setPBudget(Number(e.target.value))} />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Target End Date</label>
                <input className="adm-input" type="date" value={pEnd} onChange={e => setPEnd(e.target.value)} />
              </div>
            </div>
            <div className="adm-grid-2">
              <div className="adm-form-group">
                <label className="adm-form-label">Initial Status</label>
                <select className="adm-select" value={pStatus} onChange={e => setPStatus(e.target.value as ProjectStatus)}>
                  <option value="Lead">Lead</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Planning">Planning</option>
                  <option value="Development">Development</option>
                </select>
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Scope Summary</label>
                <input className="adm-input" value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="Key objectives & tech stack requirements..." />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="adm-btn adm-btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="adm-btn adm-btn-primary">Create Project</button>
            </div>
          </form>
        )}

        {/* 2. CLIENT FORM */}
        {activeTab === 'client' && (
          <form onSubmit={handleCreateClient}>
            <div className="adm-grid-2">
              <div className="adm-form-group">
                <label className="adm-form-label">Company Name *</label>
                <input className="adm-input" required value={cName} onChange={e => setCName(e.target.value)} placeholder="e.g. Apex Industrial Systems" />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Industry</label>
                <input className="adm-input" value={cIndustry} onChange={e => setCIndustry(e.target.value)} placeholder="e.g. Logistics & Supply Chain" />
              </div>
            </div>
            <div className="adm-grid-3">
              <div className="adm-form-group">
                <label className="adm-form-label">Primary Contact Person</label>
                <input className="adm-input" value={cContactName} onChange={e => setCContactName(e.target.value)} placeholder="e.g. Vikramaditya Mehta" />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Email</label>
                <input className="adm-input" type="email" value={cEmail} onChange={e => setCEmail(e.target.value)} placeholder="contact@company.com" />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Phone</label>
                <input className="adm-input" value={cPhone} onChange={e => setCPhone(e.target.value)} placeholder="+91-9820112233" />
              </div>
            </div>
            <div className="adm-grid-3">
              <div className="adm-form-group">
                <label className="adm-form-label">GSTIN / Tax ID</label>
                <input className="adm-input" value={cGstin} onChange={e => setCGstin(e.target.value)} placeholder="27AAACB2212P1ZX" />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Website URL</label>
                <input className="adm-input" value={cWebsite} onChange={e => setCWebsite(e.target.value)} placeholder="https://apex.com" />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">City</label>
                <input className="adm-input" value={cCity} onChange={e => setCCity(e.target.value)} placeholder="Mumbai, Pune, Bengaluru" />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="adm-btn adm-btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="adm-btn adm-btn-primary">Add Client</button>
            </div>
          </form>
        )}

        {/* 3. LEAD FORM */}
        {activeTab === 'lead' && (
          <form onSubmit={handleCreateLead}>
            <div className="adm-grid-2">
              <div className="adm-form-group">
                <label className="adm-form-label">Prospect Name *</label>
                <input className="adm-input" required value={lName} onChange={e => setLName(e.target.value)} placeholder="e.g. Sameer Joshi" />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Company / Organization *</label>
                <input className="adm-input" required value={lCompany} onChange={e => setLCompany(e.target.value)} placeholder="e.g. Apex Logistics" />
              </div>
            </div>
            <div className="adm-grid-3">
              <div className="adm-form-group">
                <label className="adm-form-label">Email</label>
                <input className="adm-input" type="email" value={lEmail} onChange={e => setLEmail(e.target.value)} placeholder="sameer@apex.in" />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Phone</label>
                <input className="adm-input" value={lPhone} onChange={e => setLPhone(e.target.value)} placeholder="+91-9890123456" />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Estimated Deal Value (₹)</label>
                <input className="adm-input" type="number" value={lValue} onChange={e => setLValue(Number(e.target.value))} />
              </div>
            </div>
            <div className="adm-grid-2">
              <div className="adm-form-group">
                <label className="adm-form-label">Service Interested</label>
                <select className="adm-select" value={lService} onChange={e => setLService(e.target.value)}>
                  {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Lead Source</label>
                <select className="adm-select" value={lSource} onChange={e => setLSource(e.target.value as any)}>
                  <option value="Website Form">Website Contact Form</option>
                  <option value="LinkedIn">LinkedIn Outreach</option>
                  <option value="Referral">Client Referral</option>
                  <option value="Cold Outreach">Cold Outreach</option>
                  <option value="WhatsApp">WhatsApp Inbound</option>
                  <option value="Events">Tech Summit / Event</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="adm-btn adm-btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="adm-btn adm-btn-primary">Add CRM Lead</button>
            </div>
          </form>
        )}

        {/* 4. TASK FORM */}
        {activeTab === 'task' && (
          <form onSubmit={handleCreateTask}>
            <div className="adm-grid-2">
              <div className="adm-form-group">
                <label className="adm-form-label">Task Title *</label>
                <input className="adm-input" required value={tTitle} onChange={e => setTTitle(e.target.value)} placeholder="e.g. Implement Webhook Dispatcher" />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Associated Project</label>
                <select className="adm-select" value={tProjectId} onChange={e => setTProjectId(e.target.value)}>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
            </div>
            <div className="adm-grid-3">
              <div className="adm-form-group">
                <label className="adm-form-label">Assignee</label>
                <select className="adm-select" value={tAssignedTo} onChange={e => setTAssignedTo(e.target.value)}>
                  {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>)}
                </select>
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Priority</label>
                <select className="adm-select" value={tPriority} onChange={e => setTPriority(e.target.value as any)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Due Date</label>
                <input className="adm-input" type="date" value={tDue} onChange={e => setTDue(e.target.value)} />
              </div>
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Task Description</label>
              <textarea className="adm-textarea" value={tDesc} onChange={e => setTDesc(e.target.value)} placeholder="Details, API specs, and completion criteria..." />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="adm-btn adm-btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="adm-btn adm-btn-primary">Create Task</button>
            </div>
          </form>
        )}

        {/* 5. INVOICE FORM */}
        {activeTab === 'invoice' && (
          <form onSubmit={handleCreateInvoice}>
            <div className="adm-grid-2">
              <div className="adm-form-group">
                <label className="adm-form-label">Select Client *</label>
                <select className="adm-select" value={iClientId} onChange={e => setIClientId(e.target.value)}>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                </select>
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Subtotal Amount (₹ Excl. GST) *</label>
                <input className="adm-input" type="number" required value={iAmount} onChange={e => setIAmount(Number(e.target.value))} />
              </div>
            </div>
            <div className="adm-grid-2">
              <div className="adm-form-group">
                <label className="adm-form-label">Line Item Description</label>
                <input className="adm-input" value={iDesc} onChange={e => setIDesc(e.target.value)} />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Payment Due Date</label>
                <input className="adm-input" type="date" value={iDue} onChange={e => setIDue(e.target.value)} />
              </div>
            </div>
            <div style={{ padding: '0.85rem 1rem', background: 'var(--adm-bg)', borderRadius: 'var(--adm-radius)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--adm-text-muted)' }}>Subtotal:</span>
                <span>₹{iAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--adm-text-muted)' }}>GST (18%):</span>
                <span>₹{Math.round(iAmount * 0.18).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--adm-primary)' }}>
                <span>Total Payable:</span>
                <span>₹{Math.round(iAmount * 1.18).toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="adm-btn adm-btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="adm-btn adm-btn-primary">Generate Invoice</button>
            </div>
          </form>
        )}

        {/* 6. TICKET FORM */}
        {activeTab === 'ticket' && (
          <form onSubmit={handleCreateTicket}>
            <div className="adm-grid-2">
              <div className="adm-form-group">
                <label className="adm-form-label">Ticket Subject *</label>
                <input className="adm-input" required value={tkSubject} onChange={e => setTkSubject(e.target.value)} placeholder="e.g. 500 error on API checkout endpoint" />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Client Organization</label>
                <input className="adm-input" value={tkClientName} onChange={e => setTkClientName(e.target.value)} />
              </div>
            </div>
            <div className="adm-grid-2">
              <div className="adm-form-group">
                <label className="adm-form-label">Client Email</label>
                <input className="adm-input" type="email" value={tkClientEmail} onChange={e => setTkClientEmail(e.target.value)} placeholder="client@company.com" />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Assign Support Staff</label>
                <select className="adm-select" value={tkAssignedTo} onChange={e => setTkAssignedTo(e.target.value)}>
                  {employees.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                </select>
              </div>
            </div>
            <div className="adm-grid-2">
              <div className="adm-form-group">
                <label className="adm-form-label">Category</label>
                <select className="adm-select" value={tkCategory} onChange={e => setTkCategory(e.target.value as any)}>
                  <option value="Bug Fix">Bug Fix</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Server Issue">Server Issue</option>
                  <option value="Billing">Billing Query</option>
                  <option value="General Query">General Query</option>
                </select>
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Priority</label>
                <select className="adm-select" value={tkPriority} onChange={e => setTkPriority(e.target.value as any)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical (1h SLA)</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="adm-btn adm-btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="adm-btn adm-btn-primary">Open Support Ticket</button>
            </div>
          </form>
        )}

        {/* 7. DOCUMENT UPLOAD FORM */}
        {activeTab === 'document' && (
          <form onSubmit={handleCreateDocument}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  const f = e.target.files[0];
                  setDFile(f);
                  if (!dTitle) setDTitle(f.name.replace(/\.[^/.]+$/, ''));
                }
              }}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--adm-primary)',
                background: 'rgba(246, 97, 53, 0.04)',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: '1.25rem'
              }}
            >
              {dFile ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                  <FileCheck size={28} color="var(--adm-success)" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>{dFile.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>
                      {(dFile.size / 1024).toFixed(0)} KB • Click to change file
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <UploadCloud size={32} color="var(--adm-primary)" style={{ margin: '0 auto 6px auto' }} />
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>Click to select document file</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-muted)' }}>PDF, Word, Excel, ZIP, Images</div>
                </div>
              )}
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Document Title *</label>
              <input className="adm-input" required value={dTitle} onChange={e => setDTitle(e.target.value)} placeholder="e.g. Master Services Agreement" />
            </div>

            <div className="adm-grid-2">
              <div className="adm-form-group">
                <label className="adm-form-label">Category</label>
                <select className="adm-select" value={dCategory} onChange={e => setDCategory(e.target.value as any)}>
                  <option value="Contracts">Contracts</option>
                  <option value="NDA">NDA</option>
                  <option value="Proposals">Proposals</option>
                  <option value="Quotations">Quotations</option>
                  <option value="Invoices">Invoices</option>
                  <option value="Technical Docs">Technical Docs</option>
                  <option value="Client Docs">Client Docs</option>
                  <option value="Employee Docs">Employee Docs</option>
                </select>
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Access Level</label>
                <select className="adm-select" value={dPermission} onChange={e => setDPermission(e.target.value as any)}>
                  <option value="Internal">Internal (All Staff)</option>
                  <option value="Confidential">Confidential</option>
                  <option value="Admin Only">Admin Only</option>
                  <option value="Public">Public</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="adm-btn adm-btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="adm-btn adm-btn-primary">Upload Document</button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
