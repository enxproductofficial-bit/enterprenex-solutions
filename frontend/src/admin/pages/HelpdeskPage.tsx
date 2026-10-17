import React, { useState, Suspense, lazy } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  X,
  MessageCircle,
  Mail,
  LifeBuoy,
  FileQuestion,
  User,
  Eye
} from 'lucide-react';
import type { SupportTicket } from '../types';

// React.lazy Loaded Preview Drawer
const TicketPreviewDrawer = lazy(() => import('../components/TicketPreviewDrawer'));

// Shimmer Skeleton Fallback while Drawer component loads
const TicketDrawerSkeleton: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="adm-drawer-overlay" onClick={onClose}>
    <div className="adm-preview-drawer" onClick={e => e.stopPropagation()}>
      <div className="adm-drawer-header">
        <div style={{ flex: 1 }}>
          <div className="adm-skeleton-bar" style={{ width: '120px', height: '14px', marginBottom: '8px' }} />
          <div className="adm-skeleton-bar" style={{ width: '85%', height: '22px' }} />
        </div>
        <button className="adm-modal-close" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="adm-drawer-body">
        <div className="adm-skeleton-bar" style={{ height: '70px', borderRadius: '10px' }} />
        <div className="adm-skeleton-bar" style={{ height: '80px', borderRadius: '10px' }} />
        <div className="adm-skeleton-bar" style={{ height: '200px', borderRadius: '10px' }} />
      </div>
    </div>
  </div>
);

export const HelpdeskPage: React.FC = () => {
  const { tickets, clients, employees, addTicket, updateTicketStatus, addTicketReply, currentUser, showToast } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isLazyLoading, setIsLazyLoading] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  const handleStatusFilterChange = (st: string) => {
    setIsLazyLoading(true);
    setStatusFilter(st);
    setTimeout(() => setIsLazyLoading(false), 140);
  };

  // Determine user role
  const userRole = currentUser?.role || 'Super Admin';
  const isEmployee = userRole === 'Team Member' || userRole === 'Developer';

  // Admin form state
  const [fSubject, setFSubject] = useState('');
  const [fClientId, setFClientId] = useState(clients[0]?.id || '');
  const [fPriority, setFPriority] = useState<SupportTicket['priority']>('Medium');
  const [fCategory, setFCategory] = useState<SupportTicket['category']>('Bug Fix');
  const [fAssignedTo, setFAssignedTo] = useState(employees[0]?.name || currentUser?.name || 'Support Specialist');

  // Employee specific form state
  const [empCategory, setEmpCategory] = useState<SupportTicket['category']>('Attendance Correction');
  const [empPriority, setEmpPriority] = useState<SupportTicket['priority']>('Medium');
  const [empSubject, setEmpSubject] = useState('');
  const [empDescription, setEmpDescription] = useState('');

  // Ticket creation success modal state
  const [createdTicketInfo, setCreatedTicketInfo] = useState<{
    ticketNumber: string;
    subject: string;
    category: string;
    priority: string;
    description: string;
    whatsappUrl: string;
    emailUrl: string;
  } | null>(null);


  // Filter tickets for current user view
  const filteredTickets = tickets.filter(t => {
    // If employee, only show tickets created by them or involving them
    if (isEmployee) {
      const matchEmp = 
        t.clientEmail?.toLowerCase() === currentUser?.email?.toLowerCase() ||
        t.clientName?.toLowerCase().includes((currentUser?.name || '').toLowerCase()) ||
        (currentUser?.employeeId && (t.clientName?.includes(currentUser.employeeId) || t.subject?.includes(currentUser.employeeId)));
      if (!matchEmp) return false;
    }

    const matchSearch = t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.clientName.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticketNumber = 'TKT-' + Math.floor(8000 + Math.random() * 1000);

    if (isEmployee) {
      const employeeLabel = `${currentUser?.name || 'Staff Member'} (${currentUser?.employeeId || currentUser?.id || 'ID'})`;
      const employeeEmail = currentUser?.email || 'contact@enterprenex.solutions';
      const cleanSubject = empSubject.trim() || `${empCategory} Request`;

      addTicket({
        ticketNumber,
        subject: cleanSubject,
        clientName: employeeLabel,
        clientEmail: employeeEmail,
        priority: empPriority,
        status: 'Open',
        assignedTo: 'HR Support / Rohit Pawar',
        category: empCategory,
        slaHoursRemaining: empPriority === 'Critical' ? 2 : empPriority === 'High' ? 6 : 24
      });

      // Prepare WhatsApp & Email URLs
      const whatsappText = 
`*ENTERPRENEX SUPPORT TICKET: ${ticketNumber}*
*Employee Name:* ${currentUser?.name || 'Staff'}
*Employee ID:* ${currentUser?.employeeId || currentUser?.id || 'N/A'}
*Official Email:* ${employeeEmail}
*Category:* ${empCategory}
*Priority:* ${empPriority}
*Subject:* ${cleanSubject}

*Details / Grievance:*
${empDescription.trim() || 'Ticket raised from Enterprenex Employee Portal.'}

*Submitted Date:* ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;

      const whatsappUrl = `https://wa.me/919226860060?text=${encodeURIComponent(whatsappText)}`;

      const emailSubject = `[${ticketNumber}] ${empCategory}: ${cleanSubject} - ${currentUser?.name || 'Employee'}`;
      const emailBody = 
`Respected HR & Support Team,

I have submitted a support ticket through the Enterprenex Employee Portal:

Ticket ID: ${ticketNumber}
Employee Name: ${currentUser?.name || 'Staff'}
Employee ID: ${currentUser?.employeeId || currentUser?.id || 'N/A'}
Registered Email: ${employeeEmail}
Category: ${empCategory}
Priority: ${empPriority}
Subject: ${cleanSubject}

Issue Details:
${empDescription.trim() || 'Please review my query and update me.'}

Thank you,
${currentUser?.name || 'Employee'}
Enterprenex Solutions Pvt Ltd`;

      const emailUrl = `mailto:contact@enterprenex.solutions?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      setShowAddModal(false);
      setCreatedTicketInfo({
        ticketNumber,
        subject: cleanSubject,
        category: empCategory,
        priority: empPriority,
        description: empDescription,
        whatsappUrl,
        emailUrl
      });

      setEmpSubject('');
      setEmpDescription('');
      showToast('Ticket Raised', `Ticket #${ticketNumber} created successfully! Dispatching links prepared.`, 'success');

    } else {
      // Admin / Manager creating a client ticket
      const selClient = clients.find(c => c.id === fClientId);
      addTicket({
        ticketNumber,
        subject: fSubject || 'Technical Query',
        clientName: selClient ? selClient.companyName : 'Enterprise Client',
        clientEmail: selClient ? selClient.primaryContact.email : 'client@enterprise.com',
        priority: fPriority,
        status: 'Open',
        assignedTo: fAssignedTo,
        category: fCategory,
        slaHoursRemaining: fPriority === 'Critical' ? 1.5 : fPriority === 'High' ? 4 : 24
      });
      setShowAddModal(false);
      setFSubject('');
      showToast('Ticket Created', `Support Ticket #${ticketNumber} registered.`, 'success');
    }
  };

  const handleSendReply = (ticketId: string) => {
    if (!replyText.trim()) return;
    addTicketReply(ticketId, replyText);
    if (selectedTicket?.id === ticketId) {
      const newMsg = {
        id: 'msg-' + Date.now(),
        sender: currentUser?.name ? `${currentUser.name} (${currentUser.role})` : 'Support Staff',
        isClient: isEmployee,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setSelectedTicket({ ...selectedTicket, messages: [...selectedTicket.messages, newMsg] });
    }
    setReplyText('');
  };

  const getTicketWhatsAppUrl = (tkt: SupportTicket) => {
    const text = 
`*ENTERPRENEX SUPPORT TICKET: ${tkt.ticketNumber}*
*Subject:* ${tkt.subject}
*Requester:* ${tkt.clientName} (${tkt.clientEmail})
*Category:* ${tkt.category}
*Status:* ${tkt.status}
*Priority:* ${tkt.priority}

*Enterprenex Helpdesk Portal:* https://www.enterprenexsolution.com/admin/support`;
    return `https://wa.me/919226860060?text=${encodeURIComponent(text)}`;
  };

  const getTicketEmailUrl = (tkt: SupportTicket) => {
    const subject = `[${tkt.ticketNumber}] ${tkt.category}: ${tkt.subject}`;
    const body = 
`Regarding Ticket #${tkt.ticketNumber}
Requester: ${tkt.clientName}
Email: ${tkt.clientEmail}
Category: ${tkt.category}
Status: ${tkt.status}
Priority: ${tkt.priority}

Enterprenex Portal: https://www.enterprenexsolution.com/admin/support`;
    return `mailto:contact@enterprenex.solutions?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <h1>{isEmployee ? 'Service Desk & Institutional Grievance Governance' : 'Enterprise Service Desk, Incident Response & SLA Governance'}</h1>
          <p>
            {isEmployee
              ? 'Statutory HR inquiries, attendance regularization petitions, credential requests, and IT incident logging directly governed under ISO 20000 / ITIL frameworks'
              : 'Multi-tier incident dispatch (P1–P4), client communications audit trail, resolution telemetry, and contractual SLA response countdowns'}
          </p>
        </div>
        <div className="adm-page-actions">
          <button className="adm-btn adm-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>{isEmployee ? 'Log Institutional Incident' : 'Open Statutory Ticket'}</span>
          </button>
        </div>
      </div>

      {/* Official Company Direct Channels Hero Card (Especially for Employees) */}
      <div
        className="adm-card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, rgba(16, 112, 200, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1px solid rgba(16, 112, 200, 0.25)',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '280px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: 'rgba(16, 112, 200, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--adm-primary)'
            }}
          >
            <LifeBuoy size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--adm-text)', fontSize: '1rem' }}>
              Official Enterprise Support Channels
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)', marginTop: '2px' }}>
              Tickets raised here are connected directly to Company Mailbox & HR WhatsApp Line
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* WhatsApp Direct Link */}
          <a
            href="https://wa.me/919226860060?text=Hello%20Enterprenex%20Support%20Team%2C%20I%20have%20an%20inquiry%20regarding%20my%20employee%20account."
            target="_blank"
            rel="noopener noreferrer"
            className="adm-btn"
            style={{
              background: '#25D366',
              color: 'var(--adm-text)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              padding: '0.55rem 1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none'
            }}
          >
            <MessageCircle size={15} />
            <span>Company WhatsApp (+91-9226860060)</span>
          </a>

          {/* Email Direct Link */}
          <a
            href="mailto:contact@enterprenex.solutions?subject=Employee%20Support%20Query"
            className="adm-btn adm-btn-secondary"
            style={{
              fontWeight: 700,
              fontSize: '0.82rem',
              padding: '0.55rem 1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none'
            }}
          >
            <Mail size={15} color="var(--adm-primary)" />
            <span>contact@enterprenex.solutions</span>
          </a>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="adm-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-dim)' }} />
          <input
            type="text"
            className="adm-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder={isEmployee ? "Search your tickets, category..." : "Search tickets, subject, client..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)', fontWeight: 600 }}>Filter Status:</span>
          {(['All', 'Open', 'In Progress', 'Resolved', 'Closed'] as const).map(st => {
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => handleStatusFilterChange(st)}
                className={isSelected ? 'adm-btn adm-btn-primary adm-btn-sm' : 'adm-btn adm-btn-secondary adm-btn-sm'}
                style={{
                  borderRadius: '20px',
                  padding: '0.45rem 1rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Viewport adaptation hint */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.74rem', color: 'var(--adm-text-dim)' }}>
        <span>Showing {filteredTickets.length} ticket records</span>
        <span>⇄ Auto-fit viewport: Click any row or &quot;View&quot; for instant preview drawer</span>
      </div>

      {/* Tickets Table */}
      <div className="adm-table-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className="adm-table" style={{ minWidth: '950px' }}>
          <thead>
            <tr>
              <th>Ticket # & Subject</th>
              <th>{isEmployee ? 'Requester / Employee' : 'Client Organization'}</th>
              <th>Category</th>
              <th>Priority</th>
              <th>SLA Status</th>
              <th>Assigned Staff</th>
              <th>Ticket Status</th>
              <th className="adm-table-sticky-right" style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLazyLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={`skel-${idx}`} className="adm-skeleton-row">
                  <td><div className="adm-skeleton-bar" style={{ width: '150px' }} /></td>
                  <td><div className="adm-skeleton-bar" style={{ width: '130px' }} /></td>
                  <td><div className="adm-skeleton-bar" style={{ width: '85px' }} /></td>
                  <td><div className="adm-skeleton-bar" style={{ width: '65px' }} /></td>
                  <td><div className="adm-skeleton-bar" style={{ width: '85px' }} /></td>
                  <td><div className="adm-skeleton-bar" style={{ width: '110px' }} /></td>
                  <td><div className="adm-skeleton-bar" style={{ width: '70px' }} /></td>
                  <td className="adm-table-sticky-right"><div className="adm-skeleton-bar" style={{ width: '65px' }} /></td>
                </tr>
              ))
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--adm-text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <FileQuestion size={36} color="var(--adm-primary)" />
                    <div style={{ fontWeight: 700, color: 'var(--adm-text)', fontSize: '1rem' }}>
                      {isEmployee ? 'No tickets raised yet' : 'No matching tickets found'}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', maxWidth: '400px', color: 'var(--adm-text-dim)' }}>
                      {isEmployee
                        ? 'Have an attendance issue, need a certificate, or have an HR query? Click "Raise a Ticket" above.'
                        : 'Adjust your search query or status filter to see other helpdesk records.'}
                    </p>
                    {isEmployee && (
                      <button className="adm-btn adm-btn-primary" style={{ marginTop: '0.5rem' }} onClick={() => setShowAddModal(true)}>
                        <Plus size={15} />
                        <span>Raise Your First Ticket</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredTickets.map(tkt => (
                <tr
                  key={tkt.id}
                  className={`adm-table-row-clickable ${selectedTicket?.id === tkt.id ? 'adm-table-row-active' : ''}`}
                  onClick={() => setSelectedTicket(tkt)}
                  title="Click to open preview drawer"
                >
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--adm-text, #1a1a1a)' }}>{tkt.ticketNumber}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)', lineHeight: 1.4, maxWidth: '300px' }}>
                      <span>
                        {tkt.subject && tkt.subject.length > 46 && !expandedSubjects[tkt.id]
                          ? `${tkt.subject.slice(0, 44)}...`
                          : tkt.subject}
                      </span>
                      {tkt.subject && tkt.subject.length > 46 && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setExpandedSubjects(prev => ({ ...prev, [tkt.id]: !prev[tkt.id] }));
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#12c990',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            padding: '0 4px',
                            fontWeight: 700,
                            textDecoration: 'underline'
                          }}
                        >
                          {expandedSubjects[tkt.id] ? 'less' : 'more'}
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--adm-text, #1a1a1a)' }}>{tkt.clientName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>{tkt.clientEmail}</div>
                  </td>
                  <td><span className="adm-badge adm-badge-neutral">{tkt.category}</span></td>
                  <td>
                    <span className={`adm-badge ${
                      tkt.priority === 'Critical' ? 'adm-badge-danger' :
                      tkt.priority === 'High' ? 'adm-badge-warning' : 'adm-badge-neutral'
                    }`}>
                      {tkt.priority}
                    </span>
                  </td>
                  <td>
                    {tkt.status !== 'Resolved' && tkt.status !== 'Closed' ? (
                      <span style={{ fontSize: '0.78rem', color: tkt.slaHoursRemaining < 2 ? 'var(--adm-danger)' : 'var(--adm-warning)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {tkt.slaHoursRemaining}h remaining
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--adm-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> Resolved in SLA
                      </span>
                    )}
                  </td>
                  <td>{tkt.assignedTo}</td>
                  <td onClick={e => e.stopPropagation()}>
                    {isEmployee ? (
                      <span className={`adm-badge ${
                        tkt.status === 'Resolved' ? 'adm-badge-success' :
                        tkt.status === 'In Progress' ? 'adm-badge-warning' :
                        tkt.status === 'Closed' ? 'adm-badge-neutral' : 'adm-badge-primary'
                      }`}>
                        {tkt.status}
                      </span>
                    ) : (
                      <select
                        className="adm-select"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', width: 'auto' }}
                        value={tkt.status}
                        onChange={e => updateTicketStatus(tkt.id, e.target.value as any)}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    )}
                  </td>
                  <td className="adm-table-sticky-right" onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        className="adm-btn adm-btn-sm adm-btn-secondary"
                        onClick={() => setSelectedTicket(tkt)}
                        style={{ gap: '4px' }}
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                      <a
                        href={getTicketWhatsAppUrl(tkt)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="adm-btn adm-btn-sm"
                        style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#25D366', border: '1px solid rgba(37, 211, 102, 0.3)', padding: '0.3rem 0.5rem' }}
                        title="Share on WhatsApp (+91-9226860060)"
                      >
                        <MessageCircle size={13} />
                      </a>
                      <a
                        href={getTicketEmailUrl(tkt)}
                        className="adm-btn adm-btn-sm"
                        style={{ background: 'rgba(16, 112, 200, 0.15)', color: 'var(--adm-primary)', border: '1px solid rgba(16, 112, 200, 0.3)', padding: '0.3rem 0.5rem' }}
                        title="Send via Email (contact@enterprenex.solutions)"
                      >
                        <Mail size={13} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── LAZY-LOADED SCREEN-ADAPTIVE SLIDING PREVIEW DRAWER ── */}
      {selectedTicket && (
        <Suspense fallback={<TicketDrawerSkeleton onClose={() => setSelectedTicket(null)} />}>
          <TicketPreviewDrawer
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onReply={handleSendReply}
            onUpdateStatus={(tId, st) => {
              updateTicketStatus(tId, st);
              setSelectedTicket(prev => prev ? { ...prev, status: st } : null);
            }}
            isEmployee={isEmployee}
            getWhatsAppUrl={getTicketWhatsAppUrl}
            getEmailUrl={getTicketEmailUrl}
          />
        </Suspense>
      )}

      {/* ── RAISE TICKET MODAL ── */}
      {showAddModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="adm-modal-content adm-modal-md" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                  {isEmployee ? 'Raise an Employee Support Ticket' : 'Open Support & Helpdesk Ticket'}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)', margin: '3px 0 0 0' }}>
                  {isEmployee
                    ? 'Submit your request. It will be recorded and linked with HR Mail & WhatsApp.'
                    : 'Dispatch technical support or client servicing tickets.'}
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              {isEmployee ? (
                <>
                  {/* Pre-filled Employee Info Banner */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--adm-border)',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <User size={16} color="var(--adm-primary)" />
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--adm-text)' }}>
                          {currentUser?.name || 'Staff Member'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>
                          ID: {currentUser?.employeeId || currentUser?.id || 'Staff'} • {currentUser?.email}
                        </div>
                      </div>
                    </div>
                    <span className="adm-badge adm-badge-primary">Auto-Linked</span>
                  </div>

                  {/* Category & Priority Grid */}
                  <div className="adm-grid-2">
                    <div className="adm-form-group">
                      <label className="adm-form-label">Category *</label>
                      <select
                        className="adm-select"
                        value={empCategory}
                        onChange={e => setEmpCategory(e.target.value as any)}
                        required
                      >
                        <option value="Attendance Correction">🕒 Attendance Correction</option>
                        <option value="Certificate Request">🎓 Certificate Request</option>
                        <option value="Leave & Permission">🌴 Leave & Permission</option>
                        <option value="HR & Stipend">💼 HR & Stipend / Payroll</option>
                        <option value="IT & Setup">💻 IT & System Setup</option>
                        <option value="General Query">❓ General Query / Grievance</option>
                      </select>
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-form-label">Priority Level *</label>
                      <select
                        className="adm-select"
                        value={empPriority}
                        onChange={e => setEmpPriority(e.target.value as any)}
                        required
                      >
                        <option value="Low">Low (Standard SLA)</option>
                        <option value="Medium">Medium (Regular 24h)</option>
                        <option value="High">High (Priority 6h)</option>
                        <option value="Critical">Critical / Urgent (2h SLA)</option>
                      </select>
                    </div>
                  </div>

                  {/* Subject Input */}
                  <div className="adm-form-group">
                    <label className="adm-form-label">Subject / Issue Summary *</label>
                    <input
                      className="adm-input"
                      required
                      value={empSubject}
                      onChange={e => setEmpSubject(e.target.value)}
                      placeholder={
                        empCategory === 'Attendance Correction'
                          ? 'e.g. Missed punch-in for 10th October 2026'
                          : empCategory === 'Certificate Request'
                          ? 'e.g. Request for Internship Completion Certificate'
                          : 'e.g. Summary of issue or query...'
                      }
                    />
                  </div>

                  {/* Detailed Description */}
                  <div className="adm-form-group">
                    <label className="adm-form-label">Description & Details *</label>
                    <textarea
                      className="adm-textarea"
                      rows={4}
                      required
                      value={empDescription}
                      onChange={e => setEmpDescription(e.target.value)}
                      placeholder="Please explain the details of your request so HR/Support can take immediate action..."
                    />
                  </div>

                  {/* Notice about Company Mail and WhatsApp linking */}
                  <div
                    style={{
                      background: 'rgba(37, 211, 102, 0.08)',
                      border: '1px solid rgba(37, 211, 102, 0.25)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <CheckCircle2 size={16} color="#25D366" />
                    <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                      After submission, you will receive 1-click buttons to send this directly to <strong>contact@enterprenex.solutions</strong> and <strong>+91-9226860060</strong> on WhatsApp.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {/* Admin / Manager Form */}
                  <div className="adm-form-group">
                    <label className="adm-form-label">Subject / Issue Summary *</label>
                    <input
                      className="adm-input"
                      required
                      value={fSubject}
                      onChange={e => setFSubject(e.target.value)}
                      placeholder="e.g. 504 Gateway Timeout during peak hours"
                    />
                  </div>

                  <div className="adm-grid-2">
                    <div className="adm-form-group">
                      <label className="adm-form-label">Client Account *</label>
                      <select className="adm-select" value={fClientId} onChange={e => setFClientId(e.target.value)}>
                        <option value="internal">Enterprenex Solutions Pvt Ltd (Internal / Operations)</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.companyName} {c.industry ? `(${c.industry})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="adm-form-group">
                      <label className="adm-form-label">Category *</label>
                      <select className="adm-select" value={fCategory} onChange={e => setFCategory(e.target.value as any)}>
                        <option value="Bug Fix">Bug Fix</option>
                        <option value="Feature Request">Feature Request</option>
                        <option value="Server Issue">Server Issue</option>
                        <option value="Billing">Billing</option>
                        <option value="General Query">General Query</option>
                        <option value="Attendance Correction">Attendance Correction</option>
                        <option value="Certificate Request">Certificate Request</option>
                        <option value="Leave & Permission">Leave & Permission</option>
                        <option value="HR & Stipend">HR & Stipend</option>
                        <option value="IT & Setup">IT & Setup</option>
                      </select>
                    </div>
                  </div>

                  <div className="adm-grid-2">
                    <div className="adm-form-group">
                      <label className="adm-form-label">Priority</label>
                      <select className="adm-select" value={fPriority} onChange={e => setFPriority(e.target.value as any)}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical (1h SLA)</option>
                      </select>
                    </div>
                    <div className="adm-form-group">
                      <label className="adm-form-label">Assigned Engineer *</label>
                      <select className="adm-select" value={fAssignedTo} onChange={e => setFAssignedTo(e.target.value)}>
                        {employees.map(e => (
                          <option key={e.id} value={e.name}>
                            {e.name} — {e.role}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary">
                  {isEmployee ? 'Submit Ticket' : 'Dispatch Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TICKET CREATED SUCCESS & DISPATCH MODAL ── */}
      {createdTicketInfo && (
        <div className="adm-modal-overlay" onClick={() => setCreatedTicketInfo(null)}>
          <div className="adm-modal-content adm-modal-md" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '2px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                  margin: '0 auto 1.25rem'
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <span className="adm-badge adm-badge-success" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                Ticket #{createdTicketInfo.ticketNumber} Raised Successfully
              </span>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--adm-text)', marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                {createdTicketInfo.subject}
              </h2>
              <p style={{ color: 'var(--adm-text-muted)', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                Your ticket has been logged in the system. Use the buttons below to dispatch it immediately to Company Email and WhatsApp.
              </p>

              {/* 1-Click Dispatch Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                <a
                  href={createdTicketInfo.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="adm-btn"
                  style={{
                    background: '#25D366',
                    color: 'var(--adm-text)',
                    border: 'none',
                    fontWeight: 700,
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  <MessageCircle size={18} />
                  <span>Send Ticket via WhatsApp (+91-9226860060)</span>
                </a>

                <a
                  href={createdTicketInfo.emailUrl}
                  className="adm-btn"
                  style={{
                    background: 'var(--adm-primary)',
                    color: 'var(--adm-text)',
                    border: 'none',
                    fontWeight: 700,
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  <Mail size={18} />
                  <span>Send Ticket to contact@enterprenex.solutions</span>
                </a>
              </div>

              <div style={{ borderTop: '1px solid var(--adm-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                <button
                  className="adm-btn adm-btn-secondary"
                  onClick={() => setCreatedTicketInfo(null)}
                >
                  Done & Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
