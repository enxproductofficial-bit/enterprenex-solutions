import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Plus,
  Search,
  Trash2,
  Phone,
  Mail,
  Send,
  ArrowRight,
  X
} from 'lucide-react';
import type { Lead, LeadStatus } from '../types';

const CRM_STAGES: LeadStatus[] = [
  'New Lead',
  'Contacted',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Won',
  'Lost'
];

export const CrmLeadsPage: React.FC = () => {
  const { leads, services, employees, addLead, updateLeadStatus, addLeadActivity, deleteLead } = useAdmin();
  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline');
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actType, setActType] = useState<'Call' | 'Meeting' | 'Email' | 'Note'>('Call');
  const [actSummary, setActSummary] = useState('');

  // Form state
  const [fName, setFName] = useState('');
  const [fCompany, setFCompany] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fSource, setFSource] = useState<Lead['source']>('Website Form');
  const [fService, setFService] = useState('Web Development');
  const [fValue, setFValue] = useState(750000);
  const [fRep, setFRep] = useState(employees[4]?.name || 'Priya Sharma');
  const [fNotes, setFNotes] = useState('');

  const filteredLeads = leads.filter(l => {
    return l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.serviceInterested.toLowerCase().includes(search.toLowerCase());
  });

  const totalPipelineValue = leads
    .filter(l => l.status !== 'Lost')
    .reduce((sum, l) => sum + l.estimatedValue, 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLead({
      name: fName || 'Prospective Client',
      company: fCompany || 'Enterprise Prospect',
      email: fEmail || 'prospect@company.com',
      phone: fPhone || '+91-9876543210',
      source: fSource,
      status: 'New Lead',
      estimatedValue: Number(fValue),
      serviceInterested: fService,
      assignedSalesperson: fRep,
      probability: 30,
      nextFollowUpDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      notes: fNotes || 'Initial discovery lead.'
    });
    setShowAddModal(false);
    setFName('');
    setFCompany('');
    setFEmail('');
    setFPhone('');
    setFNotes('');
  };

  const handleLogActivity = (leadId: string) => {
    if (!actSummary.trim()) return;
    addLeadActivity(leadId, { type: actType, summary: actSummary });
    setActSummary('');
    if (selectedLead?.id === leadId) {
      const updatedAct = {
        id: 'act-' + Date.now(),
        type: actType,
        summary: actSummary,
        date: new Date().toISOString().split('T')[0],
        author: 'Priya Sharma'
      };
      setSelectedLead({ ...selectedLead, activities: [updatedAct, ...selectedLead.activities] });
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <h1>Lead & CRM Sales Pipeline</h1>
          <p>Track sales opportunities, follow-up touchpoints, conversion probabilities & deal values</p>
        </div>
        <div className="adm-page-actions">
          <div style={{ display: 'flex', background: 'var(--adm-surface)', border: '1px solid var(--adm-border)', borderRadius: 'var(--adm-radius)', padding: '2px' }}>
            <button
              onClick={() => setViewMode('pipeline')}
              style={{
                background: viewMode === 'pipeline' ? 'var(--adm-primary)' : 'transparent',
                color: viewMode === 'pipeline' ? '#fff' : 'var(--adm-text-muted)',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sales Pipeline
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? 'var(--adm-primary)' : 'transparent',
                color: viewMode === 'table' ? '#fff' : 'var(--adm-text-muted)',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              List View
            </button>
          </div>

          <button className="adm-btn adm-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Add Opportunity</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="adm-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-dim)' }} />
          <input
            type="text"
            className="adm-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search leads, companies, services..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase' }}>Active Pipeline Value</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-success)' }}>
              ₹{(totalPipelineValue / 100000).toFixed(1)} Lakhs
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase' }}>Deals in Motion</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
              {leads.filter(l => l.status !== 'Won' && l.status !== 'Lost').length} Prospects
            </div>
          </div>
        </div>
      </div>

      {/* ── 1. SALES PIPELINE KANBAN ── */}
      {viewMode === 'pipeline' && (
        <div className="adm-kanban-board">
          {CRM_STAGES.map(stage => {
            const stageLeads = filteredLeads.filter(l => l.status === stage);
            const stageTotal = stageLeads.reduce((s, l) => s + l.estimatedValue, 0);

            return (
              <div key={stage} className="adm-kanban-column">
                <div className="adm-kanban-column-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{stage}</span>
                      <span className="adm-badge adm-badge-neutral" style={{ fontSize: '0.7rem' }}>{stageLeads.length}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--adm-success)', fontWeight: 600, marginTop: '2px' }}>
                      ₹{(stageTotal / 100000).toFixed(1)}L
                    </div>
                  </div>
                </div>

                <div className="adm-kanban-cards-wrapper">
                  {stageLeads.map(lead => (
                    <div
                      key={lead.id}
                      className="adm-kanban-card"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span className="adm-badge adm-badge-primary" style={{ fontSize: '0.68rem' }}>{lead.serviceInterested}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--adm-success)' }}>
                          ₹{(lead.estimatedValue / 100000).toFixed(1)}L
                        </span>
                      </div>

                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', margin: '4px 0' }}>
                        {lead.company}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginBottom: '8px' }}>
                        Contact: {lead.name}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--adm-text-dim)', paddingTop: '6px', borderTop: '1px solid var(--adm-border)' }}>
                        <span>Prob: {lead.probability}%</span>
                        <span>{lead.source}</span>
                      </div>

                      {/* Advance Stage Button */}
                      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                        {stage !== 'Won' && stage !== 'Lost' && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              const nextIdx = CRM_STAGES.indexOf(stage) + 1;
                              if (nextIdx < CRM_STAGES.length) {
                                updateLeadStatus(lead.id, CRM_STAGES[nextIdx]);
                              }
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--adm-primary)',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              cursor: 'pointer'
                            }}
                          >
                            <span>Move Stage</span>
                            <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--adm-text-dim)', fontSize: '0.78rem' }}>
                      No deals in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 2. LIST VIEW ── */}
      {viewMode === 'table' && (
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Company & Contact</th>
                <th>Service Interested</th>
                <th>Stage</th>
                <th>Estimated Value</th>
                <th>Probability</th>
                <th>Lead Source</th>
                <th>Sales Rep</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => (
                <tr key={lead.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{lead.company}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>{lead.name} • {lead.email}</div>
                  </td>
                  <td><span className="adm-badge adm-badge-neutral">{lead.serviceInterested}</span></td>
                  <td>
                    <select
                      className="adm-select"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', width: 'auto' }}
                      value={lead.status}
                      onChange={e => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                    >
                      {CRM_STAGES.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--adm-success)' }}>
                    ₹{lead.estimatedValue.toLocaleString('en-IN')}
                  </td>
                  <td>{lead.probability}%</td>
                  <td>{lead.source}</td>
                  <td>{lead.assignedSalesperson}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="adm-btn adm-btn-sm adm-btn-secondary" onClick={() => setSelectedLead(lead)}>
                        Activity Logs
                      </button>
                      <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => deleteLead(lead.id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── LEAD DETAILS & ACTIVITY LOG MODAL ── */}
      {selectedLead && (
        <div className="adm-modal-overlay" onClick={() => setSelectedLead(null)}>
          <div className="adm-modal-content adm-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <span className="adm-badge adm-badge-primary" style={{ marginBottom: '4px' }}>{selectedLead.serviceInterested}</span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {selectedLead.company}
                </h2>
                <div style={{ fontSize: '0.82rem', color: 'var(--adm-text-muted)', marginTop: '2px' }}>
                  Contact: <strong style={{ color: '#fff' }}>{selectedLead.name}</strong> • Source: {selectedLead.source}
                </div>
              </div>
              <button className="adm-modal-close" onClick={() => setSelectedLead(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Opportunity Financials & Rep */}
            <div className="adm-grid-3" style={{ marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'var(--adm-bg)', borderRadius: '8px', border: '1px solid var(--adm-border)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase' }}>Estimated Deal Value</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--adm-success)', marginTop: '2px' }}>
                  ₹{selectedLead.estimatedValue.toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'var(--adm-bg)', borderRadius: '8px', border: '1px solid var(--adm-border)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase' }}>Contact Reach</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--adm-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={12} /> {selectedLead.email}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={12} /> {selectedLead.phone}
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'var(--adm-bg)', borderRadius: '8px', border: '1px solid var(--adm-border)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase' }}>Assigned Sales Lead</span>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginTop: '2px' }}>
                  {selectedLead.assignedSalesperson}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-dim)' }}>Next Follow-up: {selectedLead.nextFollowUpDate}</div>
              </div>
            </div>

            {/* Activity History & Logger */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
                Sales Interaction History & Touchpoint Logs
              </h4>

              {/* Logger Form */}
              <div style={{ padding: '1rem', background: 'var(--adm-bg)', borderRadius: '8px', border: '1px solid var(--adm-border)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {(['Call', 'Meeting', 'Email', 'Note'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setActType(t)}
                      style={{
                        background: actType === t ? 'var(--adm-primary)' : 'var(--adm-surface)',
                        color: actType === t ? '#fff' : 'var(--adm-text-muted)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder={`Record ${actType} summary or client outcome...`}
                    value={actSummary}
                    onChange={e => setActSummary(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleLogActivity(selectedLead.id); }}
                  />
                  <button className="adm-btn adm-btn-primary" onClick={() => handleLogActivity(selectedLead.id)}>
                    <Send size={14} />
                    <span>Log</span>
                  </button>
                </div>
              </div>

              {/* Timeline feed */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {selectedLead.activities.map((act, idx) => (
                  <div key={idx} style={{ padding: '0.75rem 1rem', background: 'var(--adm-surface)', borderRadius: '8px', border: '1px solid var(--adm-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="adm-badge adm-badge-primary">{act.type}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>{act.date} • by {act.author}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--adm-text-muted)' }}>{act.summary}</div>
                  </div>
                ))}

                {selectedLead.activities.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--adm-text-dim)', fontSize: '0.8rem' }}>
                    No interactions logged yet.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── ADD OPPORTUNITY MODAL ── */}
      {showAddModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Add Sales Lead Opportunity</h3>
              <button className="adm-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Contact Name *</label>
                  <input className="adm-input" required value={fName} onChange={e => setFName(e.target.value)} placeholder="Prospect Contact Name" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Company / Enterprise *</label>
                  <input className="adm-input" required value={fCompany} onChange={e => setFCompany(e.target.value)} placeholder="Prospect Enterprise Name" />
                </div>
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Email</label>
                  <input className="adm-input" type="email" required value={fEmail} onChange={e => setFEmail(e.target.value)} placeholder="contact@enterprise.com" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Phone Number</label>
                  <input className="adm-input" value={fPhone} onChange={e => setFPhone(e.target.value)} placeholder="+91-98XXXXXXXX" />
                </div>
              </div>

              <div className="adm-grid-3">
                <div className="adm-form-group">
                  <label className="adm-form-label">Service Interested</label>
                  <select className="adm-select" value={fService} onChange={e => setFService(e.target.value)}>
                    {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Est. Deal Value (₹)</label>
                  <input className="adm-input" type="number" required value={fValue} onChange={e => setFValue(Number(e.target.value))} />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Lead Source</label>
                  <select className="adm-select" value={fSource} onChange={e => setFSource(e.target.value as any)}>
                    <option value="Website Form">Website Form</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Referral">Referral</option>
                    <option value="Cold Outreach">Cold Outreach</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Events">Events</option>
                  </select>
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Assigned Sales Executive</label>
                <select className="adm-select" value={fRep} onChange={e => setFRep(e.target.value)}>
                  {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
                </select>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Opportunity Discovery Notes</label>
                <textarea className="adm-textarea" value={fNotes} onChange={e => setFNotes(e.target.value)} placeholder="Requirements, budget discussion, and timeline..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">Add Opportunity</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
