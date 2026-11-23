import React, { useState, useRef } from 'react';
import { useAdmin } from '../context/AdminContext';
import { 
  X, Briefcase, Users, Target, FileText, CheckSquare, LifeBuoy, 
  UploadCloud, FileCheck, Maximize2, Minimize2, Plus, Trash2, 
  Calculator, Building, Calendar, Sparkles, RefreshCw, Layers, ShieldCheck
} from 'lucide-react';
import type { ProjectStatus, TaskPriority, TaskColumn, VaultDocument } from '../types';
import { INITIAL_CLIENTS, INITIAL_PROJECTS } from '../data/initialData';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'project' | 'client' | 'lead' | 'invoice' | 'task' | 'ticket' | 'document';
}

interface LineItemRow {
  id: string;
  description: string;
  sacCode: string;
  quantity: number;
  rate: number;
  taxPercent: number;
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({ isOpen, onClose, defaultTab = 'project' }) => {
  const { addProject, addClient, addLead, addInvoice, addTask, addTicket, uploadDocument, clients, projects, employees, services, currentUser } = useAdmin();
  const safeClients = Array.isArray(clients) ? clients : [];
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeEmployees = Array.isArray(employees) ? employees : [];
  const safeServices = Array.isArray(services) ? services : [];
  const fallbackServices = [
    { id: 's-1', name: 'Web Development' },
    { id: 's-2', name: 'AI/ML Solutions' },
    { id: 's-3', name: 'Cloud Architecture and DevOps' },
    { id: 's-4', name: 'Mobile Application' }
  ];
  const activeServiceList = safeServices.length > 0 ? safeServices : fallbackServices;
  const isEmployee = currentUser?.role === 'Team Member' || currentUser?.role === 'Developer';
  const [activeTab, setActiveTab] = useState<'project' | 'client' | 'lead' | 'invoice' | 'task' | 'ticket' | 'document'>(isEmployee ? 'ticket' : defaultTab);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Form states
  // 1. Project form
  const [pTitle, setPTitle] = useState('');
  const [pClientId, setPClientId] = useState(safeClients[0]?.id || '');
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
  const [tProjectId, setTProjectId] = useState(safeProjects[0]?.id || '');
  const [tAssignedTo, setTAssignedTo] = useState(employees[0]?.name || 'Assigned Engineer');
  const [tPriority, setTPriority] = useState<TaskPriority>('Medium');
  const [tStatus] = useState<TaskColumn>('To Do');
  const [tDue, setTDue] = useState('2026-03-01');
  const [tDesc, setTDesc] = useState('');

  // 5. Executive Invoice & Quotation Workspace States
  const [docType, setDocType] = useState<'Tax Invoice' | 'Quotation' | 'Proforma'>('Tax Invoice');
  const [docNumber, setDocNumber] = useState('INV-2026-' + Math.floor(1000 + Math.random() * 9000));
  const [iClientId, setIClientId] = useState(safeClients[0]?.id || '');
  const [iProjectId, setIProjectId] = useState(safeProjects[0]?.id || '');
  const [iIssueDate, setIIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [iDue, setIDue] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [gstType, setGstType] = useState<'intra' | 'inter' | 'zero'>('intra');
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent');
  const [discountVal, setDiscountVal] = useState<number>(0);
  const [paymentTerms, setPaymentTerms] = useState('50% mobilization advance against PO, 50% upon milestone deliverables sign-off.');
  const [quotationValidity, setQuotationValidity] = useState('Quotation valid for 30 calendar days from issue date.');
  const [clientPoRef, setClientPoRef] = useState('');

  const [lineItems, setLineItems] = useState<LineItemRow[]>([
    {
      id: 'it-1',
      description: 'Enterprise Cloud Architecture & Distributed Microservices Engineering',
      sacCode: '998314',
      quantity: 1,
      rate: 250000,
      taxPercent: 18
    },
    {
      id: 'it-2',
      description: 'API Gateway Integration, Security Auditing & CI/CD Pipeline Setup',
      sacCode: '998313',
      quantity: 1,
      rate: 150000,
      taxPercent: 18
    }
  ]);

  const handleAddLineItem = () => {
    setLineItems(prev => [
      ...prev,
      {
        id: 'it-' + Date.now(),
        description: '',
        sacCode: '998314',
        quantity: 1,
        rate: 50000,
        taxPercent: 18
      }
    ]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(prev => prev.filter(it => it.id !== id));
  };

  const handleUpdateLineItem = (id: string, field: keyof LineItemRow, val: any) => {
    setLineItems(prev => prev.map(it => it.id === id ? { ...it, [field]: val } : it));
  };

  const handleDocTypeChange = (newType: 'Tax Invoice' | 'Quotation' | 'Proforma') => {
    setDocType(newType);
    const prefix = newType === 'Quotation' ? 'QT-2026-' : newType === 'Proforma' ? 'PI-2026-' : 'INV-2026-';
    setDocNumber(prefix + Math.floor(1000 + Math.random() * 9000));
  };

  const handleRegenerateDocNumber = () => {
    const prefix = docType === 'Quotation' ? 'QT-2026-' : docType === 'Proforma' ? 'PI-2026-' : 'INV-2026-';
    setDocNumber(prefix + Math.floor(1000 + Math.random() * 9000));
  };

  const handleApplyPresetDays = (days: number) => {
    const d = new Date(iIssueDate || Date.now());
    d.setDate(d.getDate() + days);
    setIDue(d.toISOString().split('T')[0]);
  };

  const handleApplyGlobalTax = (taxRate: number) => {
    setLineItems(prev => prev.map(it => ({ ...it, taxPercent: taxRate })));
  };

  // Live Financial Calculations
  const subtotal = lineItems.reduce((acc, it) => acc + ((Number(it.quantity) || 0) * (Number(it.rate) || 0)), 0);
  const computedDiscount = discountType === 'percent'
    ? Math.round((subtotal * (Number(discountVal) || 0)) / 100)
    : Math.min(subtotal, Number(discountVal) || 0);
  const taxableAmount = Math.max(0, subtotal - computedDiscount);

  let totalTax = 0;
  if (gstType !== 'zero') {
    lineItems.forEach(it => {
      const lineTotal = (Number(it.quantity) || 0) * (Number(it.rate) || 0);
      const lineRatio = subtotal > 0 ? lineTotal / subtotal : 0;
      const lineTaxable = taxableAmount * lineRatio;
      const lineTax = Math.round((lineTaxable * (Number(it.taxPercent) || 0)) / 100);
      totalTax += lineTax;
    });
  }
  const cgst = gstType === 'intra' ? Math.round(totalTax / 2) : 0;
  const sgst = gstType === 'intra' ? (totalTax - cgst) : 0;
  const igst = gstType === 'inter' ? totalTax : 0;
  const grandTotal = taxableAmount + totalTax;

  const currentSelectedClient = safeClients.find(c => c.id === iClientId) || safeClients[0];

  // 6. Ticket form
  const [tkSubject, setTkSubject] = useState('');
  const [tkClientName, setTkClientName] = useState(safeClients[0]?.companyName || '');
  const [tkClientEmail, setTkClientEmail] = useState(safeClients[0]?.primaryContact?.email || currentUser?.email || '');
  const [tkPriority, setTkPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [tkCategory, setTkCategory] = useState<string>('Bug Fix');
  const [tkAssignedTo, setTkAssignedTo] = useState(employees[0]?.name || 'Support Specialist');

  // 7. Document form
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dFile, setDFile] = useState<File | null>(null);
  const [dTitle, setDTitle] = useState('');
  const [dCategory, setDCategory] = useState<VaultDocument['category']>('Contracts');
  const [dPermission, setDPermission] = useState<VaultDocument['accessPermission']>('Internal');

  if (!isOpen) return null;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const selClient = safeClients.find(c => c.id === pClientId) || safeClients[0];
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
      assignedTeam: employees.length > 0 ? [employees[0].name] : ['Enterprenex Engineering Squad'],
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
    const selPrj = safeProjects.find(p => p.id === tProjectId) || safeProjects[0];
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
    const selClient = safeClients.find(c => c.id === iClientId) || safeClients[0];

    addInvoice({
      invoiceNumber: docNumber || ((docType === 'Quotation' ? 'QT-2026-' : 'INV-2026-') + Date.now().toString().slice(-4)),
      clientName: selClient ? selClient.companyName : 'Enterprise Client',
      clientId: selClient?.id || iClientId,
      projectId: iProjectId || undefined,
      issueDate: iIssueDate,
      dueDate: iDue,
      items: lineItems.map(it => ({
        description: it.description || 'Enterprise Technology Deliverable Scope',
        quantity: Number(it.quantity) || 1,
        rate: Number(it.rate) || 0,
        taxPercent: Number(it.taxPercent) || 18,
        amount: (Number(it.quantity) || 1) * (Number(it.rate) || 0)
      })),
      subtotal,
      taxAmount: totalTax,
      totalAmount: grandTotal,
      status: docType === 'Quotation' ? 'Draft' : 'Pending',
      type: docType
    });
    onClose();
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    addTicket({
      ticketNumber: 'TKT-2026-' + Date.now().toString().slice(-4),
      subject: tkSubject || (tkCategory + ' - ' + (currentUser?.name || 'Staff')),
      clientName: tkClientName || 'Enterprenex Operations',
      clientEmail: tkClientEmail || currentUser?.email || 'support@enterprenex.solutions',
      priority: tkPriority,
      status: 'Open',
      assignedTo: tkAssignedTo,
      category: tkCategory as any,
      slaHoursRemaining: tkPriority === 'Critical' ? 2 : tkPriority === 'High' ? 4 : 24
    });
    onClose();
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    let fFormat = 'PDF';
    let fSize = '1.0 MB';

    if (dFile) {
      fFormat = dFile.name.split('.').pop()?.toUpperCase() || 'PDF';
      const sizeMb = (dFile.size / (1024 * 1024)).toFixed(1);
      const sizeKb = (dFile.size / 1024).toFixed(0);
      fSize = dFile.size > 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`;

      const reader = new FileReader();
      reader.onload = () => {
        const docUrl = (reader.result as string) || '#';
        uploadDocument({
          title: dTitle || dFile.name,
          category: dCategory,
          version: 'v1.0',
          fileFormat: fFormat,
          fileSize: fSize,
          accessPermission: dPermission,
          tags: ['Vault', 'Uploaded', fFormat],
          url: docUrl
        });
        onClose();
      };
      reader.readAsDataURL(dFile);
    } else {
      uploadDocument({
        title: dTitle || 'Untitled Document',
        category: dCategory,
        version: 'v1.0',
        fileFormat: fFormat,
        fileSize: fSize,
        accessPermission: dPermission,
        tags: ['Vault', 'Created'],
        url: '#'
      });
      onClose();
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div 
        className={`adm-modal-content ${activeTab === 'invoice' ? 'adm-modal-xl' : 'adm-modal-lg'}`}
        style={activeTab === 'invoice' ? {
          maxWidth: isFullScreen ? '98vw' : '1160px',
          width: '96vw',
          maxHeight: isFullScreen ? '96vh' : '92vh',
          height: isFullScreen ? '96vh' : 'auto',
          overflowY: 'auto',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        } : {}}
        onClick={e => e.stopPropagation()}
      >
        <div className="adm-modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeTab === 'invoice' ? 'Executive Quotation & Invoice Suite' : 'Quick Create Action'}
              {activeTab === 'invoice' && (
                <span className="adm-badge adm-badge-primary" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                  GST Compliant
                </span>
              )}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)' }}>
              {activeTab === 'invoice' 
                ? 'Issue GST-compliant commercial quotations, proforma estimates, and tax invoices'
                : 'Instantly record items across Enterprenex enterprise operations'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {activeTab === 'invoice' && (
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                style={{ padding: '5px 10px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                onClick={() => setIsFullScreen(!isFullScreen)}
                title={isFullScreen ? 'Exit Fullscreen' : 'Expand Fullscreen Workspace'}
              >
                {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                <span>{isFullScreen ? 'Contract View' : 'Full Screen'}</span>
              </button>
            )}
            <button className="adm-modal-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Buttons - Scoped by RBAC (Zero direct CRUD for general workforce) */}
        <div className="adm-tabs" style={{ marginBottom: '1.25rem' }}>
          {!isEmployee ? (
            <>
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
                <FileText size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> Quotation / Invoice
              </button>
              <button className={`adm-tab-btn ${activeTab === 'ticket' ? 'active' : ''}`} onClick={() => setActiveTab('ticket')}>
                <LifeBuoy size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> Ticket
              </button>
              <button className={`adm-tab-btn ${activeTab === 'document' ? 'active' : ''}`} onClick={() => setActiveTab('document')}>
                <UploadCloud size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> Document
              </button>
            </>
          ) : (
            <button className="adm-tab-btn active" onClick={() => setActiveTab('ticket')}>
              <LifeBuoy size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> Submit Operational / Paid Resource Request
            </button>
          )}
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
                <label className="adm-form-label">Client Account *</label>
                <select className="adm-select" value={pClientId} onChange={e => setPClientId(e.target.value)}>
                  {safeClients.length === 0 ? (
                    <option value="">-- No Corporate Clients Registered (Add Client First) --</option>
                  ) : (
                    <>
                      <option value="">-- Choose Corporate Client Account --</option>
                      {safeClients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                    </>
                  )}
                </select>
              </div>
            </div>
            <div className="adm-grid-3">
              <div className="adm-form-group">
                <label className="adm-form-label">Service Category</label>
                <select className="adm-select" value={pCategory} onChange={e => setPCategory(e.target.value)}>
                  {activeServiceList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
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
                <input className="adm-input" required value={cName} onChange={e => setCName(e.target.value)} placeholder="Enterprise Company Name" />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Industry</label>
                <input className="adm-input" value={cIndustry} onChange={e => setCIndustry(e.target.value)} placeholder="Industry / Domain" />
              </div>
            </div>
            <div className="adm-grid-3">
              <div className="adm-form-group">
                <label className="adm-form-label">Primary Contact Person</label>
                <input className="adm-input" value={cContactName} onChange={e => setCContactName(e.target.value)} placeholder="Primary Contact Name" />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Email</label>
                <input className="adm-input" type="email" value={cEmail} onChange={e => setCEmail(e.target.value)} placeholder="contact@company.com" />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Phone</label>
                <input className="adm-input" value={cPhone} onChange={e => setCPhone(e.target.value)} placeholder="+91-98XXXXXXXX" />
              </div>
            </div>
            <div className="adm-grid-3">
              <div className="adm-form-group">
                <label className="adm-form-label">GSTIN / Tax ID</label>
                <input className="adm-input" value={cGstin} onChange={e => setCGstin(e.target.value)} placeholder="27AAACB2212P1ZX" />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Website URL</label>
                <input className="adm-input" value={cWebsite} onChange={e => setCWebsite(e.target.value)} placeholder="https://company.com" />
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
                <input className="adm-input" required value={lName} onChange={e => setLName(e.target.value)} placeholder="Prospect Contact Name" />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Company / Organization *</label>
                <input className="adm-input" required value={lCompany} onChange={e => setLCompany(e.target.value)} placeholder="Prospect Enterprise Name" />
              </div>
            </div>
            <div className="adm-grid-3">
              <div className="adm-form-group">
                <label className="adm-form-label">Email</label>
                <input className="adm-input" type="email" value={lEmail} onChange={e => setLEmail(e.target.value)} placeholder="prospect@company.com" />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Phone</label>
                <input className="adm-input" value={lPhone} onChange={e => setLPhone(e.target.value)} placeholder="+91-98XXXXXXXX" />
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
                  {activeServiceList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
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
                  {safeProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
            </div>
            <div className="adm-grid-3">
              <div className="adm-form-group">
                <label className="adm-form-label">Assignee</label>
                <select className="adm-select" value={tAssignedTo} onChange={e => setTAssignedTo(e.target.value)}>
                  {safeEmployees.map(emp => <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>)}
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

        {/* 5. EXECUTIVE INVOICE & QUOTATION WORKSPACE */}
        {activeTab === 'invoice' && (
          <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Document Type Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--adm-border)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--adm-text-muted)' }}>Document Mode:</span>
                <div style={{ display: 'flex', gap: '4px', background: 'var(--adm-bg, #0f141c)', padding: '3px', borderRadius: '8px', border: '1px solid var(--adm-border)' }}>
                  <button
                    type="button"
                    onClick={() => handleDocTypeChange('Tax Invoice')}
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.8rem',
                      fontWeight: docType === 'Tax Invoice' ? 700 : 500,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      background: docType === 'Tax Invoice' ? 'var(--adm-primary, #6366f1)' : 'transparent',
                      color: docType === 'Tax Invoice' ? '#fff' : 'var(--adm-text-muted)'
                    }}
                  >
                    Tax Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDocTypeChange('Quotation')}
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.8rem',
                      fontWeight: docType === 'Quotation' ? 700 : 500,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      background: docType === 'Quotation' ? '#10b981' : 'transparent',
                      color: docType === 'Quotation' ? '#fff' : 'var(--adm-text-muted)'
                    }}
                  >
                    Commercial Quotation
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDocTypeChange('Proforma')}
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.8rem',
                      fontWeight: docType === 'Proforma' ? 700 : 500,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      background: docType === 'Proforma' ? '#f59e0b' : 'transparent',
                      color: docType === 'Proforma' ? '#fff' : 'var(--adm-text-muted)'
                    }}
                  >
                    Proforma Invoice
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--adm-text-muted)' }}>
                <ShieldCheck size={14} style={{ color: '#10b981' }} />
                <span>GST Act 2017 & HSN/SAC Billing Engine</span>
              </div>
            </div>

            {/* Document Header Metadata Grid */}
            <div className="adm-grid-4" style={{ gap: '0.85rem' }}>
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{docType === 'Quotation' ? 'Quotation Ref #' : 'Invoice Ref #'} *</span>
                  <button type="button" onClick={handleRegenerateDocNumber} title="Generate new sequence" style={{ background: 'transparent', border: 'none', color: 'var(--adm-primary)', cursor: 'pointer', padding: 0 }}>
                    <RefreshCw size={12} />
                  </button>
                </label>
                <input className="adm-input" required value={docNumber} onChange={e => setDocNumber(e.target.value)} />
              </div>
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-form-label">Issue Date *</label>
                <input className="adm-input" type="date" required value={iIssueDate} onChange={e => setIIssueDate(e.target.value)} />
              </div>
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{docType === 'Quotation' ? 'Validity Date *' : 'Payment Due Date *'}</span>
                  <span style={{ fontSize: '0.72rem', display: 'flex', gap: '4px' }}>
                    <button type="button" onClick={() => handleApplyPresetDays(15)} style={{ background: 'none', border: 'none', color: 'var(--adm-primary)', cursor: 'pointer', padding: 0 }}>+15d</button>
                    <button type="button" onClick={() => handleApplyPresetDays(30)} style={{ background: 'none', border: 'none', color: 'var(--adm-primary)', cursor: 'pointer', padding: 0 }}>+30d</button>
                  </span>
                </label>
                <input className="adm-input" type="date" required value={iDue} onChange={e => setIDue(e.target.value)} />
              </div>
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-form-label">Associated Project</label>
                <select className="adm-select" value={iProjectId} onChange={e => setIProjectId(e.target.value)}>
                  <option value="">-- General Enterprise Account --</option>
                  {safeProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
            </div>

            {/* Client Account Selector & Live Details Card */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--adm-border)', borderRadius: '10px', padding: '1rem' }}>
              <div className="adm-form-group" style={{ marginBottom: currentSelectedClient ? '0.75rem' : 0 }}>
                <label className="adm-form-label">Select Client *</label>
                <select className="adm-select" value={iClientId} onChange={e => setIClientId(e.target.value)}>
                  {safeClients.length === 0 ? (
                    <option value="">-- No Corporate Clients Registered (Add Client First) --</option>
                  ) : (
                    <>
                      <option value="">-- Choose Corporate Client Account --</option>
                      {safeClients.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.companyName} {c.industry ? `(${c.industry})` : ''}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {currentSelectedClient && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: 'var(--adm-bg, #0f141c)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8rem' }}>
                  <div>
                    <div style={{ color: 'var(--adm-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Corporate Entity</div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{currentSelectedClient.companyName}</div>
                    <div style={{ color: 'var(--adm-text-muted)', fontSize: '0.75rem' }}>{currentSelectedClient.industry}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--adm-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>GSTIN & Tax Registration</div>
                    <div style={{ fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={13} /> {currentSelectedClient.gstin || '27AABCA1234F1Z5'}
                    </div>
                    <div style={{ color: 'var(--adm-text-muted)', fontSize: '0.75rem' }}>Active State Tax Filing</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--adm-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Primary Commercial Contact</div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{currentSelectedClient.primaryContact?.name || 'Authorized Signatory'}</div>
                    <div style={{ color: 'var(--adm-text-muted)', fontSize: '0.75rem' }}>{currentSelectedClient.primaryContact?.email || 'accounts@client.com'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--adm-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Billing Location</div>
                    <div style={{ color: '#fff', fontSize: '0.78rem' }}>{currentSelectedClient.city || 'Mumbai'}, India</div>
                    <div style={{ color: 'var(--adm-text-muted)', fontSize: '0.72rem' }}>State Place of Supply: 27 (MH)</div>
                  </div>
                </div>
              )}
            </div>

            {/* GST & Tax Controls Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '0.65rem 0.85rem', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Tax Application:</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <input type="radio" name="gstType" checked={gstType === 'intra'} onChange={() => setGstType('intra')} />
                  <span>Intra-State (CGST 9% + SGST 9%)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <input type="radio" name="gstType" checked={gstType === 'inter'} onChange={() => setGstType('inter')} />
                  <span>Inter-State (IGST 18%)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <input type="radio" name="gstType" checked={gstType === 'zero'} onChange={() => setGstType('zero')} />
                  <span>Zero-Rated / Export (0%)</span>
                </label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>Quick Tax:</span>
                <button type="button" onClick={() => handleApplyGlobalTax(18)} className="adm-btn adm-btn-secondary" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>18%</button>
                <button type="button" onClick={() => handleApplyGlobalTax(12)} className="adm-btn adm-btn-secondary" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>12%</button>
                <button type="button" onClick={() => handleApplyGlobalTax(5)} className="adm-btn adm-btn-secondary" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>5%</button>
                <button type="button" onClick={() => handleApplyGlobalTax(0)} className="adm-btn adm-btn-secondary" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>0%</button>
              </div>
            </div>

            {/* Deliverables / Line Items Table */}
            <div style={{ background: 'var(--adm-card-bg, #161d27)', border: '1px solid var(--adm-border)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--adm-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Deliverables & Scope Breakdown</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>{lineItems.length} Deliverable Item(s)</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--adm-border)', color: 'var(--adm-text-muted)' }}>
                      <th style={{ padding: '8px 12px', width: '36px' }}>#</th>
                      <th style={{ padding: '8px 12px', minWidth: '260px' }}>Scope & Milestone Description *</th>
                      <th style={{ padding: '8px 12px', width: '100px' }}>SAC/HSN</th>
                      <th style={{ padding: '8px 12px', width: '80px' }}>Qty</th>
                      <th style={{ padding: '8px 12px', width: '130px' }}>Unit Rate (₹)</th>
                      <th style={{ padding: '8px 12px', width: '90px' }}>GST %</th>
                      <th style={{ padding: '8px 12px', width: '130px', textAlign: 'right' }}>Total (₹)</th>
                      <th style={{ padding: '8px 12px', width: '40px', textAlign: 'center' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => {
                      const itemTotal = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '8px 12px', color: 'var(--adm-text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <input
                              className="adm-input"
                              style={{ width: '100%', fontSize: '0.82rem', padding: '6px 8px' }}
                              value={item.description}
                              onChange={e => handleUpdateLineItem(item.id, 'description', e.target.value)}
                              placeholder="e.g. Milestone 1: Distributed Architecture & Cloud Deployment"
                              required
                            />
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <input
                              className="adm-input"
                              style={{ width: '100%', fontSize: '0.82rem', padding: '6px 8px' }}
                              value={item.sacCode}
                              onChange={e => handleUpdateLineItem(item.id, 'sacCode', e.target.value)}
                              placeholder="998314"
                            />
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <input
                              className="adm-input"
                              type="number"
                              min="1"
                              style={{ width: '100%', fontSize: '0.82rem', padding: '6px 8px' }}
                              value={item.quantity}
                              onChange={e => handleUpdateLineItem(item.id, 'quantity', Number(e.target.value))}
                              required
                            />
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <input
                              className="adm-input"
                              type="number"
                              min="0"
                              style={{ width: '100%', fontSize: '0.82rem', padding: '6px 8px' }}
                              value={item.rate}
                              onChange={e => handleUpdateLineItem(item.id, 'rate', Number(e.target.value))}
                              required
                            />
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <select
                              className="adm-select"
                              style={{ width: '100%', fontSize: '0.82rem', padding: '6px 8px' }}
                              value={item.taxPercent}
                              onChange={e => handleUpdateLineItem(item.id, 'taxPercent', Number(e.target.value))}
                            >
                              <option value="18">18%</option>
                              <option value="12">12%</option>
                              <option value="5">5%</option>
                              <option value="0">0%</option>
                            </select>
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#fff' }}>
                            ₹{itemTotal.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(item.id)}
                              disabled={lineItems.length <= 1}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: lineItems.length <= 1 ? 'rgba(255,255,255,0.1)' : '#ef4444',
                                cursor: lineItems.length <= 1 ? 'not-allowed' : 'pointer',
                                padding: '4px'
                              }}
                              title="Delete Item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--adm-border)' }}>
                <button
                  type="button"
                  className="adm-btn adm-btn-secondary"
                  onClick={handleAddLineItem}
                  style={{ fontSize: '0.8rem', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} /> Add Deliverable Item
                </button>
              </div>
            </div>

            {/* Commercial Adjustments & Financial Summary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {/* Left Column: Commercial Terms & Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="adm-form-group" style={{ marginBottom: 0 }}>
                  <label className="adm-form-label">Commercial Terms & Payment Milestones</label>
                  <textarea
                    className="adm-textarea"
                    rows={3}
                    value={paymentTerms}
                    onChange={e => setPaymentTerms(e.target.value)}
                    placeholder="e.g. 50% mobilization advance, balance upon final acceptance testing sign-off."
                  />
                </div>
                <div className="adm-grid-2" style={{ gap: '0.75rem' }}>
                  <div className="adm-form-group" style={{ marginBottom: 0 }}>
                    <label className="adm-form-label">Client PO / Contract Ref</label>
                    <input
                      className="adm-input"
                      value={clientPoRef}
                      onChange={e => setClientPoRef(e.target.value)}
                      placeholder="PO-2026-ENX-001"
                    />
                  </div>
                  <div className="adm-form-group" style={{ marginBottom: 0 }}>
                    <label className="adm-form-label">Quotation Validity</label>
                    <input
                      className="adm-input"
                      value={quotationValidity}
                      onChange={e => setQuotationValidity(e.target.value)}
                      placeholder="30 Calendar Days"
                    />
                  </div>
                </div>
                <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--adm-border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>
                  <strong style={{ color: '#fff' }}>Settlement Account:</strong> HDFC Bank Current A/C 50200088991122 (IFSC: HDFC0001234) • ENTERPRENEX SOLUTIONS PVT. LTD.
                </div>
              </div>

              {/* Right Column: Live Computation Card */}
              <div style={{ background: 'var(--adm-bg, #0f141c)', border: '1px solid var(--adm-border)', borderRadius: '10px', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--adm-text-muted)' }}>Deliverable Subtotal:</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {/* Discount Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '6px 0', borderTop: '1px dashed var(--adm-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--adm-text-muted)' }}>Commercial Discount:</span>
                    <select
                      value={discountType}
                      onChange={e => setDiscountType(e.target.value as any)}
                      style={{ background: 'transparent', border: '1px solid var(--adm-border)', borderRadius: '4px', color: '#fff', fontSize: '0.72rem', padding: '2px 4px' }}
                    >
                      <option value="percent">% Discount</option>
                      <option value="flat">₹ Flat</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      value={discountVal}
                      onChange={e => setDiscountVal(Number(e.target.value))}
                      style={{ width: '60px', background: 'transparent', border: '1px solid var(--adm-border)', borderRadius: '4px', color: '#fff', fontSize: '0.75rem', padding: '2px 4px' }}
                    />
                  </div>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>- ₹{computedDiscount.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '6px 0', borderTop: '1px solid var(--adm-border)' }}>
                  <span style={{ color: 'var(--adm-text-muted)' }}>Taxable Value:</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>₹{taxableAmount.toLocaleString('en-IN')}</span>
                </div>

                {/* GST Breakdown */}
                {gstType === 'intra' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--adm-text-muted)' }}>Central GST (CGST 9%):</span>
                      <span style={{ color: '#fff' }}>₹{cgst.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--adm-text-muted)' }}>State GST (SGST 9%):</span>
                      <span style={{ color: '#fff' }}>₹{sgst.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                )}

                {gstType === 'inter' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--adm-text-muted)' }}>Integrated GST (IGST 18%):</span>
                    <span style={{ color: '#fff' }}>₹{igst.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {gstType === 'zero' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#10b981' }}>
                    <span>Zero-Rated (Export / SEZ Supply):</span>
                    <span>₹0 (0% GST)</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.85rem', borderTop: '2px solid var(--adm-border)' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
                      {docType === 'Quotation' ? 'Total Quotation Estimate:' : 'Total Payable (Incl. GST):'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-muted)' }}>Indian Rupees (INR)</div>
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--adm-border)' }}>
              <button type="button" className="adm-btn adm-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="adm-btn adm-btn-primary" style={{ padding: '8px 24px', fontWeight: 700 }}>
                {docType === 'Quotation' ? 'Generate Commercial Quotation' : docType === 'Proforma' ? 'Generate Proforma Invoice' : 'Issue Official Tax Invoice'}
              </button>
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
                  {safeEmployees.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                </select>
              </div>
            </div>
            <div className="adm-grid-2">
              <div className="adm-form-group">
                <label className="adm-form-label">Category</label>
                <select className="adm-select" value={tkCategory} onChange={e => setTkCategory(e.target.value as any)}>
                  <option value="Payout Period Query">Payout Period / Payroll Query</option>
                  <option value="Paid Resource Request">Paid Resource / Infrastructure Request</option>
                  <option value="Operational Request">Operational / Administrative Request</option>
                  <option value="Bug Fix">Technical Bug Report</option>
                  <option value="Feature Request">Sprint Feature Request</option>
                  <option value="Server Issue">Server / Cloud Issue</option>
                  <option value="General Query">General Inquiry</option>
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
                background: 'rgba(16, 112, 200, 0.04)',
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
