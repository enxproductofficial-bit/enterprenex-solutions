import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Search,
  Plus,
  Building2,
  Globe,
  Trash2,
  ShieldCheck,
  Send,
  Briefcase,
  MessageSquare,
  X
} from 'lucide-react';
import type { Client } from '../types';

export const ClientsPage: React.FC = () => {
  const { clients, projects, invoices, addClient, updateClient, deleteClient, showToast } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Onboarding' | 'Inactive'>('All');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  // Add Client Form State
  const [formName, setFormName] = useState('');
  const [formIndustry, setFormIndustry] = useState('Technology & SaaS');
  const [formWebsite, setFormWebsite] = useState('');
  const [formGstin, setFormGstin] = useState('');
  const [formContactName, setFormContactName] = useState('');
  const [formContactRole, setFormContactRole] = useState('CTO / Tech Lead');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCity, setFormCity] = useState('Mumbai');
  const [formAddress] = useState('Commercial Plaza');

  // Filter clients
  const filteredClients = clients.filter(c => {
    const matchesSearch = c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.primaryContact.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClient({
      companyName: formName,
      industry: formIndustry,
      website: formWebsite.startsWith('http') ? formWebsite : `https://${formWebsite || 'example.com'}`,
      gstin: formGstin || '27AAACB2212P1ZX',
      status: 'Active',
      primaryContact: {
        name: formContactName || 'Authorized Contact',
        role: formContactRole,
        email: formEmail || 'contact@client.com',
        phone: formPhone || '+91-9820112233'
      },
      address: formAddress,
      city: formCity,
      country: 'India',
      totalRevenue: 0,
      activeProjectsCount: 0,
      notes: ['Client account created. Ready for onboarding kick-off.']
    });
    setShowAddModal(false);
    // Reset
    setFormName('');
    setFormWebsite('');
    setFormGstin('');
    setFormEmail('');
    setFormPhone('');
  };

  const handleAddNote = (clientId: string) => {
    if (!newNoteText.trim() || !selectedClient) return;
    const updatedNotes = [newNoteText, ...selectedClient.notes];
    updateClient(clientId, { notes: updatedNotes });
    setSelectedClient({ ...selectedClient, notes: updatedNotes });
    setNewNoteText('');
    showToast('Note Added', 'Communication note recorded.', 'success');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <h1>Client Management Directory</h1>
          <p>Maintain corporate records, contacts, master agreements, contracts & billing history</p>
        </div>
        <div className="adm-page-actions">
          <button className="adm-btn adm-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Add New Client</span>
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
            placeholder="Search by company, contact, or city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)', fontWeight: 600 }}>Filter Status:</span>
          {(['All', 'Active', 'Onboarding', 'Inactive'] as const).map(st => (
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

      {/* Clients Table */}
      <div className="adm-table-container">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Company & Industry</th>
              <th>Primary Contact</th>
              <th>Location</th>
              <th>Status</th>
              <th>Total Billed</th>
              <th>Contracts/NDA</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map(c => {
              const clientProjects = projects.filter(p => p.clientId === c.id || p.clientName === c.companyName);
              const clientInvoices = invoices.filter(i => i.clientId === c.id || i.clientName === c.companyName);
              const totalBilled = clientInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

              return (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{c.companyName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Building2 size={12} />
                      <span>{c.industry}</span>
                      {c.gstin && <span style={{ color: 'var(--adm-text-dim)' }}>• GSTIN: {c.gstin}</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{c.primaryContact.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>{c.primaryContact.role}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--adm-primary)', marginTop: '2px' }}>{c.primaryContact.email}</div>
                  </td>
                  <td>
                    <div style={{ color: '#fff', fontSize: '0.85rem' }}>{c.city}, {c.country}</div>
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.72rem', color: 'var(--adm-info)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}
                    >
                      <Globe size={11} />
                      {c.website.replace('https://', '')}
                    </a>
                  </td>
                  <td>
                    <span className={`adm-badge ${
                      c.status === 'Active' ? 'adm-badge-success' :
                      c.status === 'Onboarding' ? 'adm-badge-warning' : 'adm-badge-neutral'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--adm-success)', fontSize: '0.92rem' }}>
                      ₹{totalBilled.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>
                      {clientProjects.length} Projects Tracked
                    </div>
                  </td>
                  <td>
                    <span className="adm-badge adm-badge-neutral" style={{ fontSize: '0.72rem' }}>
                      <ShieldCheck size={12} color="var(--adm-success)" />
                      {c.documents.length || 2} Docs Active
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="adm-btn adm-btn-sm adm-btn-secondary"
                        onClick={() => setSelectedClient(c)}
                        title="View Full Profile"
                      >
                        View Profile
                      </button>
                      <button
                        className="adm-btn adm-btn-sm adm-btn-danger"
                        onClick={() => deleteClient(c.id)}
                        title="Delete Client"
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

      {/* ── CLIENT FULL PROFILE DRAWER / MODAL ── */}
      {selectedClient && (
        <div className="adm-modal-overlay" onClick={() => setSelectedClient(null)}>
          <div className="adm-modal-content adm-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--adm-primary-soft)', border: '1px solid var(--adm-primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--adm-primary)' }}>
                  <Building2 size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    {selectedClient.companyName}
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)' }}>
                    {selectedClient.industry} • GSTIN: {selectedClient.gstin || 'N/A'} • {selectedClient.city}, {selectedClient.country}
                  </div>
                </div>
              </div>
              <button className="adm-modal-close" onClick={() => setSelectedClient(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Quick Summary Grid */}
            <div className="adm-grid-3" style={{ marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'var(--adm-bg)', borderRadius: 'var(--adm-radius)', border: '1px solid var(--adm-border)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Primary Contact</span>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem', marginTop: '2px' }}>{selectedClient.primaryContact.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--adm-primary)' }}>{selectedClient.primaryContact.email}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>{selectedClient.primaryContact.phone}</div>
              </div>

              <div style={{ padding: '1rem', background: 'var(--adm-bg)', borderRadius: 'var(--adm-radius)', border: '1px solid var(--adm-border)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Account Status</span>
                <div style={{ marginTop: '4px' }}>
                  <span className="adm-badge adm-badge-success">{selectedClient.status}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '4px' }}>Onboarded: {selectedClient.createdAt}</div>
              </div>

              <div style={{ padding: '1rem', background: 'var(--adm-bg)', borderRadius: 'var(--adm-radius)', border: '1px solid var(--adm-border)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Total Billed Value</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--adm-success)', marginTop: '2px' }}>
                  ₹{invoices.filter(i => i.clientId === selectedClient.id).reduce((s, i) => s + i.totalAmount, 0).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>
                  {invoices.filter(i => i.clientId === selectedClient.id && i.status === 'Paid').length} Paid Invoices
                </div>
              </div>
            </div>

            {/* Associated Projects Section */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase size={16} color="var(--adm-primary)" />
                Client Projects
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {projects.filter(p => p.clientId === selectedClient.id || p.clientName === selectedClient.companyName).map(p => (
                  <div key={p.id} style={{ padding: '0.75rem 1rem', background: 'var(--adm-bg)', borderRadius: '8px', border: '1px solid var(--adm-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>{p.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>Budget: ₹{p.budget.toLocaleString('en-IN')} • Target: {p.targetEndDate}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className="adm-badge adm-badge-primary">{p.status} ({p.progress}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Documents & Contracts */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="var(--adm-success)" />
                Signed Contracts & NDAs
              </h4>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {selectedClient.documents.map(doc => (
                  <div key={doc.id} style={{ padding: '0.65rem 0.85rem', background: 'var(--adm-bg)', borderRadius: '8px', border: '1px solid var(--adm-border)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{doc.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>{doc.type} • {doc.fileSize} • Uploaded {doc.uploadDate}</div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: '0.65rem 0.85rem', background: 'var(--adm-bg)', borderRadius: '8px', border: '1px solid var(--adm-border)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>Master Service Agreement (MSA) 2026</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>Contract • 2.4 MB • Fully Executed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Communication Notes */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={16} color="var(--adm-warning)" />
                Internal Account Notes & Logs
              </h4>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="Add a new client communication log or meeting note..."
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddNote(selectedClient.id); }}
                />
                <button className="adm-btn adm-btn-primary" onClick={() => handleAddNote(selectedClient.id)}>
                  <Send size={14} />
                  <span>Post</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedClient.notes.map((note, idx) => (
                  <div key={idx} style={{ padding: '0.65rem 0.85rem', background: 'var(--adm-bg)', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--adm-text-muted)', borderLeft: '3px solid var(--adm-primary)' }}>
                    {note}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── ADD CLIENT MODAL ── */}
      {showAddModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Register New Corporate Client</h3>
              <button className="adm-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Company Name *</label>
                  <input className="adm-input" required value={formName} onChange={e => setFormName(e.target.value)} placeholder="Enterprise Company Name" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Industry Sector</label>
                  <input className="adm-input" value={formIndustry} onChange={e => setFormIndustry(e.target.value)} placeholder="Industry Sector" />
                </div>
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">GSTIN / Tax Registration</label>
                  <input className="adm-input" value={formGstin} onChange={e => setFormGstin(e.target.value)} placeholder="27AAACB2212P1ZX" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Website URL</label>
                  <input className="adm-input" value={formWebsite} onChange={e => setFormWebsite(e.target.value)} placeholder="https://company.com" />
                </div>
              </div>

              <div className="adm-grid-3">
                <div className="adm-form-group">
                  <label className="adm-form-label">Primary Contact Person *</label>
                  <input className="adm-input" required value={formContactName} onChange={e => setFormContactName(e.target.value)} placeholder="Primary Contact Name" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Designation</label>
                  <input className="adm-input" value={formContactRole} onChange={e => setFormContactRole(e.target.value)} placeholder="Designation / Role" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Contact Email *</label>
                  <input className="adm-input" type="email" required value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="contact@company.com" />
                </div>
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Phone Number</label>
                  <input className="adm-input" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="+91-98XXXXXXXX" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">City</label>
                  <input className="adm-input" value={formCity} onChange={e => setFormCity(e.target.value)} placeholder="Mumbai, Pune, Chhatrapati Sambhajinagar" />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">Register Client</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
