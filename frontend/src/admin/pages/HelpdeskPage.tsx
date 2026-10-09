import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Send,
  X
} from 'lucide-react';
import type { SupportTicket } from '../types';

export const HelpdeskPage: React.FC = () => {
  const { tickets, clients, employees, addTicket, updateTicketStatus, addTicketReply } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Form state
  const [fSubject, setFSubject] = useState('');
  const [fClientId, setFClientId] = useState(clients[0]?.id || '');
  const [fPriority, setFPriority] = useState<SupportTicket['priority']>('Medium');
  const [fCategory, setFCategory] = useState<SupportTicket['category']>('Bug Fix');
  const [fAssignedTo, setFAssignedTo] = useState(employees[0]?.name || 'Aniket Tambe');

  const filteredTickets = tickets.filter(t => {
    const matchSearch = t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.clientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selClient = clients.find(c => c.id === fClientId);
    addTicket({
      ticketNumber: 'TKT-' + Math.floor(8000 + Math.random() * 1000),
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
  };

  const handleSendReply = (ticketId: string) => {
    if (!replyText.trim()) return;
    addTicketReply(ticketId, replyText);
    if (selectedTicket?.id === ticketId) {
      const newMsg = {
        id: 'msg-' + Date.now(),
        sender: 'Pranav Khaire (Staff)',
        isClient: false,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setSelectedTicket({ ...selectedTicket, messages: [...selectedTicket.messages, newMsg] });
    }
    setReplyText('');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <h1>Customer Support & SLA Helpdesk</h1>
          <p>Multi-tier ticket dispatch, client message threads, resolution logs & real-time SLA countdowns</p>
        </div>
        <div className="adm-page-actions">
          <button className="adm-btn adm-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Open Support Ticket</span>
          </button>
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
            placeholder="Search tickets, subject, client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)', fontWeight: 600 }}>Filter Status:</span>
          {(['All', 'Open', 'In Progress', 'Resolved', 'Closed'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                background: statusFilter === st ? 'var(--adm-primary)' : 'var(--adm-bg)',
                color: statusFilter === st ? '#fff' : 'var(--adm-text-muted)',
                border: '1px solid var(--adm-border)',
                borderRadius: '6px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="adm-table-container">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Ticket # & Subject</th>
              <th>Client Organization</th>
              <th>Category</th>
              <th>Priority</th>
              <th>SLA Status</th>
              <th>Assigned Staff</th>
              <th>Ticket Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map(tkt => (
              <tr key={tkt.id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{tkt.ticketNumber}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)', maxWidth: '280px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {tkt.subject}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{tkt.clientName}</div>
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
                <td>
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
                </td>
                <td>
                  <button className="adm-btn adm-btn-sm adm-btn-secondary" onClick={() => setSelectedTicket(tkt)}>
                    View Thread
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── TICKET THREAD MODAL ── */}
      {selectedTicket && (
        <div className="adm-modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="adm-modal-content adm-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="adm-badge adm-badge-primary">{selectedTicket.ticketNumber}</span>
                  <span className="adm-badge adm-badge-neutral">{selectedTicket.category}</span>
                  <span className={`adm-badge ${selectedTicket.priority === 'Critical' ? 'adm-badge-danger' : 'adm-badge-warning'}`}>
                    {selectedTicket.priority} Priority
                  </span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {selectedTicket.subject}
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)', marginTop: '2px' }}>
                  Client: <strong style={{ color: '#fff' }}>{selectedTicket.clientName}</strong> ({selectedTicket.clientEmail}) • Opened: {selectedTicket.createdAt}
                </div>
              </div>
              <button className="adm-modal-close" onClick={() => setSelectedTicket(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Conversation Thread */}
            <div style={{ minHeight: '220px', maxHeight: '350px', overflowY: 'auto', background: 'var(--adm-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--adm-border)', display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1rem' }}>
              {selectedTicket.messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.isClient ? 'flex-start' : 'flex-end',
                    maxWidth: '80%',
                    background: msg.isClient ? 'var(--adm-surface)' : 'var(--adm-primary-soft)',
                    border: msg.isClient ? '1px solid var(--adm-border)' : '1px solid var(--adm-primary-border)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: msg.isClient ? 'var(--adm-text-dim)' : 'var(--adm-primary)', fontWeight: 700, marginBottom: '4px' }}>
                    <span>{msg.sender}</span>
                    <span style={{ marginLeft: '1rem' }}>{msg.timestamp}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#fff', margin: 0, lineHeight: 1.5 }}>
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Reply Input Box */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="adm-input"
                placeholder="Type reply to client (dispatches email notification)..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSendReply(selectedTicket.id); }}
              />
              <button className="adm-btn adm-btn-primary" onClick={() => handleSendReply(selectedTicket.id)}>
                <Send size={15} />
                <span>Send Reply</span>
              </button>
            </div>

            {/* Footer status buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--adm-border)' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="adm-btn adm-btn-sm adm-btn-secondary"
                  onClick={() => {
                    updateTicketStatus(selectedTicket.id, 'Resolved');
                    setSelectedTicket({ ...selectedTicket, status: 'Resolved' });
                  }}
                >
                  <CheckCircle2 size={13} color="var(--adm-success)" />
                  <span>Mark Resolved</span>
                </button>
              </div>
              <button className="adm-btn adm-btn-secondary" onClick={() => setSelectedTicket(null)}>Close</button>
            </div>

          </div>
        </div>
      )}

      {/* ── OPEN TICKET MODAL ── */}
      {showAddModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Open Support & Helpdesk Ticket</h3>
              <button className="adm-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="adm-form-group">
                <label className="adm-form-label">Subject / Issue Summary *</label>
                <input className="adm-input" required value={fSubject} onChange={e => setFSubject(e.target.value)} placeholder="e.g. 504 Gateway Timeout during peak hours" />
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Client Account</label>
                  <select className="adm-select" value={fClientId} onChange={e => setFClientId(e.target.value)}>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Category</label>
                  <select className="adm-select" value={fCategory} onChange={e => setFCategory(e.target.value as any)}>
                    <option value="Bug Fix">Bug Fix</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Server Issue">Server Issue</option>
                    <option value="Billing">Billing</option>
                    <option value="General Query">General Query</option>
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
                  <label className="adm-form-label">Assigned Engineer</label>
                  <select className="adm-select" value={fAssignedTo} onChange={e => setFAssignedTo(e.target.value)}>
                    {employees.map(e => <option key={e.id} value={e.name}>{e.name} ({e.role})</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">Dispatch Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
