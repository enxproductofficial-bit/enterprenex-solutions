import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  ShieldCheck,
  Key,
  Laptop,
  Activity,
  UserCheck,
  Plus,
  RefreshCw,
  CheckCircle2,
  X,
  Globe,
  Trash2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import type { UserRole } from '../types';

export const SecurityPage: React.FC = () => {
  const {
    users,
    auditLogs,
    apiKeys,
    sessions,
    ipSettings,
    detectedIp,
    revokeApiKey,
    generateApiKey,
    revokeSession,
    resetAllData,
    addAllowedIp,
    removeAllowedIp,
    toggleEnforceIpRestriction
  } = useAdmin();

  const [tab, setTab] = useState<'rbac' | 'ip' | 'api' | 'sessions' | 'audit'>('ip');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [keyService, setKeyService] = useState('OpenAI');

  // New IP form state
  const [showAddIpModal, setShowAddIpModal] = useState(false);
  const [newIpAddress, setNewIpAddress] = useState('');
  const [newIpLabel, setNewIpLabel] = useState('');

  // RBAC Matrix
  const ROLES: UserRole[] = ['Super Admin', 'Project Manager', 'Sales Lead', 'Finance Officer', 'HR Manager', 'Developer'];
  const PERMISSIONS = [
    { module: 'Dashboard & Executive KPIs', roles: ['Super Admin', 'Project Manager', 'Sales Lead', 'Finance Officer', 'HR Manager'] },
    { module: 'Client Management (Create/Edit/Delete)', roles: ['Super Admin', 'Project Manager', 'Sales Lead'] },
    { module: 'Project Management & Lifecycle Signoff', roles: ['Super Admin', 'Project Manager', 'Developer'] },
    { module: 'Services Catalogue & Pricing Edit', roles: ['Super Admin', 'Sales Lead'] },
    { module: 'Lead & CRM Sales Pipeline', roles: ['Super Admin', 'Sales Lead'] },
    { module: 'Finance, Invoicing & GST Records', roles: ['Super Admin', 'Finance Officer'] },
    { module: 'Team, Attendance & Leave Approvals', roles: ['Super Admin', 'HR Manager'] },
    { module: 'Task Management & Sprint Kanban', roles: ['Super Admin', 'Project Manager', 'Developer', 'Design'] },
    { module: 'Support & Helpdesk Dispatch', roles: ['Super Admin', 'Project Manager', 'Developer'] },
    { module: 'Document Vault (Confidential & NDAs)', roles: ['Super Admin', 'Project Manager'] },
    { module: 'CMS & Public Website Publishing', roles: ['Super Admin', 'Sales Lead'] },
    { module: 'IP Firewall & API Keys Administration', roles: ['Super Admin'] }
  ];

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    generateApiKey(keyName || 'Custom API Key', keyService);
    setShowKeyModal(false);
    setKeyName('');
  };

  const handleAddIpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpAddress.trim()) return;
    addAllowedIp(newIpAddress, newIpLabel || 'Custom Admin IP');
    setShowAddIpModal(false);
    setNewIpAddress('');
    setNewIpLabel('');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <h1>Admin Governance, IP Firewall & Security Suite</h1>
          <p>Zero-trust IP whitelisting, granular RBAC permissions, real-time audit stream & cryptographic API keys</p>
        </div>
        <div className="adm-page-actions">
          <button className="adm-btn adm-btn-danger" onClick={resetAllData} title="Reset mock data to initial seeds">
            <RefreshCw size={15} />
            <span>Reset Demo Store</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="adm-card" style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
        <div className="adm-tabs" style={{ margin: 0, border: 'none' }}>
          <button className={`adm-tab-btn ${tab === 'ip' ? 'active' : ''}`} onClick={() => setTab('ip')}>
            <Globe size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            IP Whitelisting & Firewall ({ipSettings.allowedIps.length})
          </button>
          <button className={`adm-tab-btn ${tab === 'rbac' ? 'active' : ''}`} onClick={() => setTab('rbac')}>
            RBAC Permission Matrix
          </button>
          <button className={`adm-tab-btn ${tab === 'api' ? 'active' : ''}`} onClick={() => setTab('api')}>
            API Keys Vault ({apiKeys.length})
          </button>
          <button className={`adm-tab-btn ${tab === 'sessions' ? 'active' : ''}`} onClick={() => setTab('sessions')}>
            Active Sessions ({sessions.length})
          </button>
          <button className={`adm-tab-btn ${tab === 'audit' ? 'active' : ''}`} onClick={() => setTab('audit')}>
            Live Audit Stream ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* ── 1. IP WHITELISTING & FIREWALL TAB ── */}
      {tab === 'ip' && (
        <div>
          {/* IP Policy Status Header Banner */}
          <div className="adm-card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: ipSettings.enforceIpRestriction ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)', borderColor: ipSettings.enforceIpRestriction ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className={`adm-badge ${ipSettings.enforceIpRestriction ? 'adm-badge-success' : 'adm-badge-danger'}`}>
                  {ipSettings.enforceIpRestriction ? 'ENFORCED (Strict Zero-Trust)' : 'DISABLED (Open Access)'}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>
                  Admin Portal IP Access Policy
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)', margin: '4px 0 0 0' }}>
                {ipSettings.enforceIpRestriction
                  ? 'Only connections originating from authorized IP addresses below can view or access /admin and /admin/login.'
                  : 'Warning: IP restriction is currently turned off. Anyone on the internet can access the login page.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={toggleEnforceIpRestriction}
                className={`adm-btn ${ipSettings.enforceIpRestriction ? 'adm-btn-secondary' : 'adm-btn-primary'}`}
                style={{ fontSize: '0.82rem' }}
              >
                {ipSettings.enforceIpRestriction ? <ToggleRight size={20} color="var(--adm-success)" /> : <ToggleLeft size={20} />}
                <span>{ipSettings.enforceIpRestriction ? 'Disable Enforcement' : 'Enforce Strict IP Firewall'}</span>
              </button>
            </div>
          </div>

          {/* Current Detected IP Box */}
          <div className="adm-card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Your Current Public IP Address</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <code style={{ background: 'var(--adm-bg)', padding: '2px 8px', borderRadius: '6px', color: 'var(--adm-primary)' }}>{detectedIp}</code>
                {ipSettings.allowedIps.some(e => e.ip === detectedIp) ? (
                  <span className="adm-badge adm-badge-success" style={{ fontSize: '0.7rem' }}>
                    <CheckCircle2 size={12} /> Currently Whitelisted
                  </span>
                ) : (
                  <span className="adm-badge adm-badge-warning" style={{ fontSize: '0.7rem' }}>
                    Not in Whitelist
                  </span>
                )}
              </div>
            </div>

            {!ipSettings.allowedIps.some(e => e.ip === detectedIp) && (
              <button
                className="adm-btn adm-btn-primary adm-btn-sm"
                onClick={() => addAllowedIp(detectedIp, 'Current Admin Session')}
              >
                <Plus size={14} />
                <span>Whitelist My Current IP ({detectedIp})</span>
              </button>
            )}
          </div>

          {/* Allowed IPs Table */}
          <div className="adm-card">
            <div className="adm-card-header">
              <div className="adm-card-title">
                <Globe size={18} color="var(--adm-primary)" />
                Authorized IP Whitelist Registry
              </div>
              <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={() => setShowAddIpModal(true)}>
                <Plus size={15} />
                <span>Add Static IP</span>
              </button>
            </div>

            <div className="adm-table-container">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Authorized IP / Subnet</th>
                    <th>Location / Label</th>
                    <th>Added By</th>
                    <th>Date Added</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ipSettings.allowedIps.map(entry => (
                    <tr key={entry.id}>
                      <td>
                        <code style={{ background: 'var(--adm-bg)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>
                          {entry.ip}
                        </code>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--adm-text-muted)' }}>{entry.label}</td>
                      <td>{entry.addedBy}</td>
                      <td>{entry.addedAt}</td>
                      <td>
                        <span className="adm-badge adm-badge-success">Authorized</span>
                      </td>
                      <td>
                        {entry.ip !== '127.0.0.1' && entry.ip !== '::1' ? (
                          <button
                            className="adm-btn adm-btn-sm adm-btn-danger"
                            onClick={() => removeAllowedIp(entry.id)}
                            title="Remove IP Whitelist"
                          >
                            <Trash2 size={13} />
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>System Default</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal for adding custom IP */}
          {showAddIpModal && (
            <div className="adm-modal-overlay" onClick={() => setShowAddIpModal(false)}>
              <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
                <div className="adm-modal-header">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Add IP to Admin Whitelist</h3>
                  <button className="adm-modal-close" onClick={() => setShowAddIpModal(false)}>
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleAddIpSubmit}>
                  <div className="adm-form-group">
                    <label className="adm-form-label">Static IPv4 or IPv6 Address *</label>
                    <input
                      className="adm-input"
                      required
                      value={newIpAddress}
                      onChange={e => setNewIpAddress(e.target.value)}
                      placeholder="e.g. 103.21.124.50 or 49.36.12.8"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-form-label">Description / Office Label</label>
                    <input
                      className="adm-input"
                      value={newIpLabel}
                      onChange={e => setNewIpLabel(e.target.value)}
                      placeholder="e.g. Mumbai Corporate Office Static Broadband"
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowAddIpModal(false)}>Cancel</button>
                    <button type="submit" className="adm-btn adm-btn-primary">Authorize IP</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 2. RBAC PERMISSION MATRIX ── */}
      {tab === 'rbac' && (
        <div>
          {/* Admin User Accounts */}
          <div className="adm-card" style={{ marginBottom: '1.5rem' }}>
            <div className="adm-card-header">
              <div className="adm-card-title">
                <UserCheck size={18} color="var(--adm-primary)" />
                Authorized Admin Accounts & Roles
              </div>
            </div>

            <div className="adm-grid-3">
              {users.map(u => (
                <div key={u.id} style={{ padding: '1rem', background: 'var(--adm-bg)', borderRadius: 'var(--adm-radius)', border: '1px solid var(--adm-border)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <img src={u.avatar} alt={u.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--adm-primary)', fontWeight: 600 }}>{u.role}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>{u.email}</div>
                  </div>
                  <span className="adm-badge adm-badge-success" style={{ fontSize: '0.65rem' }}>{u.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RBAC Matrix Table */}
          <div className="adm-card">
            <div className="adm-card-header">
              <div className="adm-card-title">
                <ShieldCheck size={18} color="var(--adm-success)" />
                Role-Based Access Control (RBAC) Policy
              </div>
            </div>

            <div className="adm-table-container">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Module / Operation Scope</th>
                    {ROLES.map(r => <th key={r} style={{ textAlign: 'center' }}>{r}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS.map((perm, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: '#fff' }}>{perm.module}</td>
                      {ROLES.map(r => {
                        const hasAccess = perm.roles.includes(r);
                        return (
                          <td key={r} style={{ textAlign: 'center' }}>
                            {hasAccess ? (
                              <CheckCircle2 size={16} color="var(--adm-success)" style={{ display: 'inline' }} />
                            ) : (
                              <span style={{ color: 'var(--adm-text-dim)' }}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. API KEYS MANAGEMENT ── */}
      {tab === 'api' && (
        <div className="adm-card">
          <div className="adm-card-header">
            <div className="adm-card-title">
              <Key size={18} color="var(--adm-warning)" />
              Enterprise Cryptographic API Tokens
            </div>
            <button className="adm-btn adm-btn-primary" onClick={() => setShowKeyModal(true)}>
              <Plus size={15} />
              <span>Generate API Key</span>
            </button>
          </div>

          <div className="adm-table-container">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Token Name & Service</th>
                  <th>Encrypted Key Secret</th>
                  <th>Created Date</th>
                  <th>Last Used</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map(k => (
                  <tr key={k.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{k.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--adm-primary)' }}>{k.service}</div>
                    </td>
                    <td>
                      <code style={{ background: 'var(--adm-bg)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--adm-text-muted)' }}>
                        {k.keyMasked}
                      </code>
                    </td>
                    <td>{k.createdAt}</td>
                    <td>{k.lastUsed}</td>
                    <td>
                      <span className={`adm-badge ${k.status === 'Active' ? 'adm-badge-success' : 'adm-badge-danger'}`}>
                        {k.status}
                      </span>
                    </td>
                    <td>
                      {k.status === 'Active' ? (
                        <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => revokeApiKey(k.id)}>
                          Revoke Access
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--adm-text-dim)' }}>Revoked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showKeyModal && (
            <div className="adm-modal-overlay" onClick={() => setShowKeyModal(false)}>
              <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
                <div className="adm-modal-header">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Generate API Key</h3>
                  <button className="adm-modal-close" onClick={() => setShowKeyModal(false)}>
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleGenerateKey}>
                  <div className="adm-form-group">
                    <label className="adm-form-label">Key Name / Identifier *</label>
                    <input className="adm-input" required value={keyName} onChange={e => setKeyName(e.target.value)} placeholder="e.g. Production Webhook Ingestion" />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-form-label">Service Provider</label>
                    <select className="adm-select" value={keyService} onChange={e => setKeyService(e.target.value)}>
                      <option value="OpenAI">OpenAI GPT-4o API</option>
                      <option value="Razorpay">Razorpay Payment Webhook</option>
                      <option value="WhatsApp Business">WhatsApp Cloud API</option>
                      <option value="AWS S3">Amazon S3 Storage</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowKeyModal(false)}>Cancel</button>
                    <button type="submit" className="adm-btn adm-btn-primary">Generate Secret Key</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 4. ACTIVE SESSIONS ── */}
      {tab === 'sessions' && (
        <div className="adm-card">
          <div className="adm-card-header">
            <div className="adm-card-title">
              <Laptop size={18} color="var(--adm-info)" />
              Active Login Sessions & IP Bindings
            </div>
          </div>

          <div className="adm-table-container">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>User Account</th>
                  <th>Device & Browser</th>
                  <th>IP Address</th>
                  <th>Geo Location</th>
                  <th>Login Time</th>
                  <th>Session Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(sess => (
                  <tr key={sess.id}>
                    <td style={{ fontWeight: 700, color: '#fff' }}>{sess.userName}</td>
                    <td>{sess.device}</td>
                    <td><code>{sess.ipAddress}</code></td>
                    <td>{sess.location}</td>
                    <td>{sess.loginTime}</td>
                    <td>
                      {sess.isCurrent ? (
                        <span className="adm-badge adm-badge-success">Current Active Device</span>
                      ) : (
                        <span className="adm-badge adm-badge-neutral">Authenticated</span>
                      )}
                    </td>
                    <td>
                      {!sess.isCurrent && (
                        <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => revokeSession(sess.id)}>
                          Terminate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 5. AUDIT LOGS ── */}
      {tab === 'audit' && (
        <div className="adm-card">
          <div className="adm-card-header">
            <div className="adm-card-title">
              <Activity size={18} color="var(--adm-primary)" />
              Cryptographic Audit Log Stream
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--adm-text-dim)' }}>
              Immutable System Events
            </span>
          </div>

          <div className="adm-table-container">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User & Role</th>
                  <th>Action Event</th>
                  <th>Module</th>
                  <th>Details</th>
                  <th>Source IP</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ color: 'var(--adm-text-dim)', fontSize: '0.78rem' }}>{log.timestamp}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{log.userName}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--adm-primary)' }}>{log.userRole}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{log.action}</td>
                    <td><span className="adm-badge adm-badge-neutral">{log.module}</span></td>
                    <td style={{ color: 'var(--adm-text-muted)', fontSize: '0.82rem' }}>{log.details}</td>
                    <td><code>{log.ipAddress}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
