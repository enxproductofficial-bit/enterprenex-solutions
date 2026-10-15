import React, { useState, Suspense, lazy } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Plus,
  Search,
  Trash2,
  ArrowRight,
  X,
  Building,
  Mail,
  Phone,
  DollarSign
} from 'lucide-react';
import type { Lead, LeadStatus } from '../types';

const LeadPreviewDrawer = lazy(() =>
  import('../components/LeadPreviewDrawer').then(m => ({ default: m.LeadPreviewDrawer }))
);

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
  const { leads, services, employees, addLead, updateLead, updateLeadStatus, addLeadActivity, deleteLead } = useAdmin();
  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline');
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

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
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text, #1a1a1a)' }}>
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
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text, #1a1a1a)' }}>{stage}</span>
                      <span className="adm-badge adm-badge-neutral" style={{ fontSize: '0.7rem' }}>{stageLeads.length}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--adm-success)', fontWeight: 600, marginTop: '2px' }}>
                      ₹{(stageTotal / 100000).toFixed(1)}L
                    </div>
                  </div>
                </div>

                <div className="adm-kanban-cards-wrapper">
                  {stageLeads.map(lead => {
                    const isSelected = selectedLead?.id === lead.id;
                    return (
                      <div
                        key={lead.id}
                        className="adm-kanban-card"
                        onClick={() => setSelectedLead(lead)}
                        style={{
                          cursor: 'pointer',
                          borderColor: isSelected ? 'var(--adm-primary)' : undefined,
                          boxShadow: isSelected ? '0 0 0 2px rgba(18, 201, 144, 0.25)' : undefined
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span className="adm-badge adm-badge-primary" style={{ fontSize: '0.68rem' }}>{lead.serviceInterested}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--adm-success)' }}>
                            ₹{(lead.estimatedValue / 100000).toFixed(1)}L
                          </span>
                        </div>

                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--adm-text, #1a1a1a)', margin: '4px 0' }}>
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
                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--adm-primary)', fontWeight: 600 }}>
                            View Details &rarr;
                          </span>
                          {stage !== 'Won' && stage !== 'Lost' && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                const nextIdx = CRM_STAGES.indexOf(stage) + 1;
                                if (nextIdx < CRM_STAGES.length) {
                                  updateLeadStatus(lead.id, CRM_STAGES[nextIdx]);
                                  if (selectedLead?.id === lead.id) {
                                    setSelectedLead({ ...lead, status: CRM_STAGES[nextIdx] });
                                  }
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
                              <span>Advance</span>
                              <ArrowRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

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
                <th className="adm-table-sticky-right" style={{ minWidth: '160px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => {
                const isSelected = selectedLead?.id === lead.id;
                return (
                  <tr
                    key={lead.id}
                    className={isSelected ? 'adm-table-row-clickable adm-table-row-active' : 'adm-table-row-clickable'}
                    onClick={() => setSelectedLead(lead)}
                  >
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--adm-text, #1a1a1a)' }}>{lead.company}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>{lead.name} • {lead.email}</div>
                    </td>
                    <td><span className="adm-badge adm-badge-neutral">{lead.serviceInterested}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <select
                        className="adm-select"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', width: 'auto' }}
                        value={lead.status}
                        onChange={e => {
                          const newStatus = e.target.value as LeadStatus;
                          updateLeadStatus(lead.id, newStatus);
                          if (selectedLead?.id === lead.id) {
                            setSelectedLead({ ...lead, status: newStatus });
                          }
                        }}
                      >
                        {CRM_STAGES.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--adm-success)' }}>
                      ₹{lead.estimatedValue.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className="adm-badge adm-badge-info" style={{ fontWeight: 700 }}>
                        {lead.probability}%
                      </span>
                    </td>
                    <td>{lead.source}</td>
                    <td>{lead.assignedSalesperson}</td>
                    <td className="adm-table-sticky-right" style={{ minWidth: '160px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          className="adm-btn adm-btn-sm adm-btn-secondary"
                          onClick={() => setSelectedLead(lead)}
                        >
                          Preview Drawer
                        </button>
                        <button
                          className="adm-btn adm-btn-sm adm-btn-danger"
                          onClick={() => {
                            if (window.confirm(`Delete lead "${lead.company}"?`)) {
                              deleteLead(lead.id);
                              if (selectedLead?.id === lead.id) setSelectedLead(null);
                            }
                          }}
                          title="Delete Lead"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── LAZY-LOADED SCREEN-ADAPTIVE SLIDING LEAD DRAWER ── */}
      {selectedLead && (
        <Suspense
          fallback={
            <div className="adm-drawer-overlay">
              <div
                className="adm-preview-drawer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'clamp(440px, 56vw, 860px)'
                }}
              >
                <div className="adm-spinner" />
              </div>
            </div>
          }
        >
          <LeadPreviewDrawer
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onUpdateStatus={(id, status) => {
              updateLeadStatus(id, status);
              setSelectedLead(prev => (prev && prev.id === id ? { ...prev, status } : prev));
            }}
            onUpdateLead={(id, updates) => {
              updateLead(id, updates);
              setSelectedLead(prev => (prev && prev.id === id ? { ...prev, ...updates } : prev));
            }}
            onLogActivity={(id, type, summary) => {
              addLeadActivity(id, { type, summary });
              const newAct = {
                id: 'act-' + Date.now(),
                type,
                summary,
                date: new Date().toISOString().split('T')[0],
                author: 'Sales Rep'
              };
              setSelectedLead(prev => (prev && prev.id === id ? { ...prev, activities: [newAct, ...prev.activities] } : prev));
            }}
            onDeleteLead={id => {
              deleteLead(id);
              setSelectedLead(null);
            }}
          />
        </Suspense>
      )}

      {/* ── ADD OPPORTUNITY MODAL ── */}
      {showAddModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text, #1a1a1a)' }}>
                Add Sales Lead Opportunity
              </h3>
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
