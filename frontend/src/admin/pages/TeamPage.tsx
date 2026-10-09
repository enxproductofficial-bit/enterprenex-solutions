import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Plus,
  CheckCircle2,
  Phone,
  Mail,
  X,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck,
  Share2,
  Lock,
  UserCheck
} from 'lucide-react';
import type { Employee } from '../types';

export const TeamPage: React.FC = () => {
  const { employees, attendance, leaves, addEmployee, updateEmployee, updateLeaveStatus, markAttendanceToday, showToast } = useAdmin();
  const [tab, setTab] = useState<'roster' | 'attendance' | 'leaves'>('roster');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [governanceRole, setGovernanceRole] = useState<'Director' | 'Manager (HR)' | 'Employee'>('Employee');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState<Employee['department']>('Engineering');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('React, TypeScript, Node.js');
  const [salary, setSalary] = useState(100000);

  // Employee ID and Password state
  const nextEmpId = `EPX-${100 + employees.length + 1}`;
  const [empId, setEmpId] = useState(nextEmpId);
  const [empPassword, setEmpPassword] = useState('');
  const [showEmpPassword, setShowEmpPassword] = useState(false);

  // Portal credentials management modal state
  const [credentialEmp, setCredentialEmp] = useState<Employee | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showActivePassword, setShowActivePassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const generateRandomPassword = (prefix = 'EPX') => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pass = `${prefix}@`;
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to Clipboard', text, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const openAddMemberModal = () => {
    setEmpId(`EPX-${100 + employees.length + 1}`);
    setEmpPassword(generateRandomPassword('EPX'));
    setShowEmpPassword(true);
    setShowAddModal(true);
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmpId = empId.trim() || nextEmpId;
    const finalPassword = empPassword.trim() || generateRandomPassword('EPX');

    addEmployee({
      employeeId: finalEmpId,
      password: finalPassword,
      name,
      role: role ? `${role} (${governanceRole})` : `${governanceRole}`,
      department,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@enterprenex.com`,
      phone: phone || '+91-9876543210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      currentProjects: [],
      workloadPercentage: 50,
      joinDate: new Date().toISOString().split('T')[0],
      salaryMonthly: Number(salary),
      performanceRating: 5.0,
      status: 'Active'
    });
    showToast('Employee Added', `Assigned Employee ID: ${finalEmpId} with individual portal access.`, 'success');
    setShowAddModal(false);
    setName('');
    setRole('');
    setEmpPassword('');
  };

  const handleUpdatePassword = (emp: Employee) => {
    if (!newPasswordInput.trim()) {
      showToast('Validation Error', 'Please enter or generate a new password.', 'error');
      return;
    }
    updateEmployee(emp.id, { password: newPasswordInput.trim() });
    setCredentialEmp(prev => prev ? { ...prev, password: newPasswordInput.trim() } : null);
    setNewPasswordInput('');
    showToast('Password Updated', `Updated portal password for ${emp.name} (${emp.employeeId || emp.id}).`, 'success');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <h1>Team, Attendance & Workforce Ops</h1>
          <p>Employee capacity roster, daily biometric check-ins, leave approvals & payroll rates</p>
        </div>
        <div className="adm-page-actions">
          <button className="adm-btn adm-btn-secondary" onClick={() => markAttendanceToday('Present')}>
            <CheckCircle2 size={15} />
            <span>Mark My Attendance Today</span>
          </button>
          <button className="adm-btn adm-btn-primary" onClick={openAddMemberModal}>
            <Plus size={16} />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="adm-card" style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
        <div className="adm-tabs" style={{ margin: 0, border: 'none' }}>
          <button className={`adm-tab-btn ${tab === 'roster' ? 'active' : ''}`} onClick={() => setTab('roster')}>
            Team Directory ({employees.length})
          </button>
          <button className={`adm-tab-btn ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>
            Daily Attendance ({attendance.length})
          </button>
          <button className={`adm-tab-btn ${tab === 'leaves' ? 'active' : ''}`} onClick={() => setTab('leaves')}>
            Leave Approvals ({leaves.length})
          </button>
        </div>
      </div>

      {/* ── 1. TEAM ROSTER GRID ── */}
      {tab === 'roster' && (
        <div className="adm-grid-3">
          {employees.map(emp => {
            const displayEmpId = emp.employeeId || (emp.id.startsWith('emp-') ? `EPX-10${emp.id.replace('emp-', '')}` : emp.id);
            return (
              <div key={emp.id} className="adm-card adm-card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                  <img src={emp.avatar} alt={emp.name} className="adm-avatar-lg" />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>{emp.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--adm-primary)', fontWeight: 600 }}>{emp.role}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>{emp.department}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span className="adm-badge adm-badge-success" style={{ fontSize: '0.65rem' }}>{emp.status}</span>
                    <span className="adm-badge adm-badge-primary" style={{ fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 700 }}>
                      {displayEmpId}
                    </span>
                  </div>
                </div>

                {/* Workload */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                    <span style={{ color: 'var(--adm-text-dim)' }}>Sprint Workload</span>
                    <span style={{
                      fontWeight: 700,
                      color: emp.workloadPercentage > 85 ? 'var(--adm-danger)' : emp.workloadPercentage > 70 ? 'var(--adm-warning)' : 'var(--adm-success)'
                    }}>
                      {emp.workloadPercentage}%
                    </span>
                  </div>
                  <div className="adm-progress-bar">
                    <div
                      className="adm-progress-fill"
                      style={{
                        width: `${emp.workloadPercentage}%`,
                        background: emp.workloadPercentage > 85 ? 'var(--adm-danger)' : emp.workloadPercentage > 70 ? 'var(--adm-warning)' : 'var(--adm-success)'
                      }}
                    />
                  </div>
                </div>

                {/* Skills */}
                <div style={{ marginBottom: '1rem', flex: 1 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {emp.skills.map((sk, idx) => (
                      <span key={idx} className="adm-badge adm-badge-neutral" style={{ fontSize: '0.68rem' }}>{sk}</span>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div style={{ background: 'var(--adm-bg)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--adm-border)', fontSize: '0.75rem', color: 'var(--adm-text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={12} color="var(--adm-primary)" /> {emp.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={12} color="var(--adm-info)" /> {emp.phone}
                  </div>
                </div>

                {/* Credentials & Access Bar */}
                <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid var(--adm-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="adm-badge adm-badge-neutral" style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.72rem' }}>
                      {displayEmpId}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>Access Active</span>
                  </div>
                  <button
                    className="adm-btn adm-btn-secondary"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', gap: '5px' }}
                    onClick={() => {
                      setCredentialEmp(emp);
                      setNewPasswordInput('');
                      setShowActivePassword(false);
                    }}
                  >
                    <Key size={13} color="#f59e0b" />
                    <span>Portal Credentials</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 2. ATTENDANCE LOGS ── */}
      {tab === 'attendance' && (
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Date</th>
                <th>Check In Time</th>
                <th>Check Out Time</th>
                <th>Attendance Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map(att => (
                <tr key={att.id}>
                  <td style={{ fontWeight: 700, color: '#fff' }}>{att.employeeName}</td>
                  <td>{att.date}</td>
                  <td>{att.checkIn}</td>
                  <td>{att.checkOut}</td>
                  <td>
                    <span className={`adm-badge ${
                      att.status === 'Present' ? 'adm-badge-success' :
                      att.status === 'Late' ? 'adm-badge-warning' : 'adm-badge-danger'
                    }`}>
                      {att.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 3. LEAVE APPROVALS ── */}
      {tab === 'leaves' && (
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(lv => (
                <tr key={lv.id}>
                  <td style={{ fontWeight: 700, color: '#fff' }}>{lv.employeeName}</td>
                  <td><span className="adm-badge adm-badge-neutral">{lv.type}</span></td>
                  <td>{lv.startDate} to {lv.endDate}</td>
                  <td style={{ color: 'var(--adm-text-muted)' }}>{lv.reason}</td>
                  <td>
                    <span className={`adm-badge ${
                      lv.status === 'Approved' ? 'adm-badge-success' :
                      lv.status === 'Rejected' ? 'adm-badge-danger' : 'adm-badge-warning'
                    }`}>
                      {lv.status}
                    </span>
                  </td>
                  <td>
                    {lv.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="adm-btn adm-btn-sm adm-btn-primary" onClick={() => updateLeaveStatus(lv.id, 'Approved')}>
                          Approve
                        </button>
                        <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => updateLeaveStatus(lv.id, 'Rejected')}>
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── ADD EMPLOYEE MODAL ── */}
      {showAddModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Add Team Member to Roster</h3>
              <button className="adm-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee}>
              {/* Credentials Configuration Box */}
              <div style={{ background: 'rgba(5, 150, 105, 0.08)', border: '1px solid rgba(5, 150, 105, 0.28)', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem', color: '#34d399', fontSize: '0.85rem', fontWeight: 700 }}>
                  <Key size={16} />
                  <span>Unique Portal Access Credentials (Login ID & Password)</span>
                </div>
                <div className="adm-grid-2">
                  <div className="adm-form-group" style={{ margin: 0 }}>
                    <label className="adm-form-label" style={{ fontSize: '0.78rem' }}>Unique Employee ID *</label>
                    <input
                      className="adm-input"
                      required
                      value={empId}
                      onChange={e => setEmpId(e.target.value.toUpperCase())}
                      placeholder="e.g. EPX-102"
                      style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.04em' }}
                    />
                  </div>
                  <div className="adm-form-group" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="adm-form-label" style={{ margin: 0, fontSize: '0.78rem' }}>Initial Access Password *</label>
                      <button
                        type="button"
                        onClick={() => setEmpPassword(generateRandomPassword('EPX'))}
                        style={{ background: 'none', border: 'none', color: '#34d399', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}
                      >
                        <RefreshCw size={11} /> Generate
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="adm-input"
                        type={showEmpPassword ? 'text' : 'password'}
                        required
                        value={empPassword}
                        onChange={e => setEmpPassword(e.target.value)}
                        placeholder="Set portal password"
                        style={{ paddingRight: '2.5rem', fontFamily: 'monospace' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmpPassword(!showEmpPassword)}
                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                      >
                        {showEmpPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                  The employee can sign in at <strong>enterprenexsolution.com/login</strong> using this <strong>Employee ID</strong> or their email and this password.
                </p>
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Full Name *</label>
                  <input className="adm-input" required value={name} onChange={e => setName(e.target.value)} placeholder="Enter Employee Full Name" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Governance Role *</label>
                  <select className="adm-select" value={governanceRole} onChange={e => setGovernanceRole(e.target.value as any)}>
                    <option value="Employee">Employee (Engineering / Delivery)</option>
                    <option value="Manager (HR)">Manager (Includes HR & Ops)</option>
                    <option value="Director">Director (Executive Board)</option>
                  </select>
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Specific Role Title *</label>
                <input className="adm-input" required value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior Full Stack Engineer" />
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Department</label>
                  <select className="adm-select" value={department} onChange={e => setDepartment(e.target.value as any)}>
                    <option value="Engineering">Engineering</option>
                    <option value="AI & ML">AI & ML</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Finance & HR">Finance & HR</option>
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Monthly Compensation (₹)</label>
                  <input className="adm-input" type="number" value={salary} onChange={e => setSalary(Number(e.target.value))} />
                </div>
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Email</label>
                  <input className="adm-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@enterprenex.com" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Phone</label>
                  <input className="adm-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91-9876543210" />
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Skills (Comma separated)</label>
                <input className="adm-input" value={skills} onChange={e => setSkills(e.target.value)} placeholder="Python, PyTorch, Docker, Kubernetes" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PORTAL CREDENTIALS & ACCESS MODAL ── */}
      {credentialEmp && (
        <div className="adm-modal-overlay" onClick={() => setCredentialEmp(null)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Employee Portal Credentials
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--adm-text-dim)' }}>
                  {credentialEmp.name} &bull; {credentialEmp.role}
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setCredentialEmp(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              {/* Credentials Overview Card */}
              <div style={{ background: '#0e1217', border: '1px solid var(--adm-border)', borderRadius: '12px', padding: '1.15rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--adm-text-dim)', fontWeight: 600 }}>UNIQUE EMPLOYEE ID</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#34d399', fontSize: '0.95rem' }}>
                      {credentialEmp.employeeId || credentialEmp.id}
                    </span>
                    <button
                      className="adm-btn adm-btn-secondary"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                      onClick={() => copyToClipboard(credentialEmp.employeeId || credentialEmp.id, 'id')}
                    >
                      {copiedKey === 'id' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      <span>{copiedKey === 'id' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--adm-text-dim)', fontWeight: 600 }}>OFFICIAL EMAIL</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#fff', fontSize: '0.85rem' }}>{credentialEmp.email}</span>
                    <button
                      className="adm-btn adm-btn-secondary"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                      onClick={() => copyToClipboard(credentialEmp.email, 'email')}
                    >
                      {copiedKey === 'email' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      <span>{copiedKey === 'email' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--adm-text-dim)', fontWeight: 600 }}>ACTIVE PASSWORD</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b', fontSize: '0.9rem' }}>
                      {showActivePassword ? (credentialEmp.password || 'Enx_sol_121006') : '••••••••••••'}
                    </span>
                    <button
                      className="adm-btn adm-btn-secondary"
                      style={{ padding: '0.2rem 0.4rem' }}
                      onClick={() => setShowActivePassword(!showActivePassword)}
                      title={showActivePassword ? 'Hide password' : 'Show password'}
                    >
                      {showActivePassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button
                      className="adm-btn adm-btn-secondary"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                      onClick={() => copyToClipboard(credentialEmp.password || 'Enx_sol_121006', 'pass')}
                    >
                      {copiedKey === 'pass' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      <span>{copiedKey === 'pass' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Reset Password Section */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--adm-border)', borderRadius: '12px', padding: '1.15rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} color="var(--adm-primary)" />
                  <span>Reset / Change Employee Password</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      className="adm-input"
                      value={newPasswordInput}
                      onChange={e => setNewPasswordInput(e.target.value)}
                      placeholder="Type new password or generate..."
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>
                  <button
                    type="button"
                    className="adm-btn adm-btn-secondary"
                    onClick={() => setNewPasswordInput(generateRandomPassword('EPX'))}
                    title="Generate secure random password"
                  >
                    <RefreshCw size={14} />
                    <span>Generate</span>
                  </button>
                  <button
                    type="button"
                    className="adm-btn adm-btn-primary"
                    onClick={() => handleUpdatePassword(credentialEmp)}
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Share Onboarding Pack */}
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}
                onClick={() => {
                  const empIdVal = credentialEmp.employeeId || credentialEmp.id;
                  const passVal = credentialEmp.password || 'Enx_sol_121006';
                  const packText = `*ENTERPRENEX SOLUTIONS - OFFICIAL WORKSPACE ACCESS*\n\n` +
                    `*Employee Name:* ${credentialEmp.name}\n` +
                    `*Employee ID:* ${empIdVal}\n` +
                    `*Official Email:* ${credentialEmp.email}\n` +
                    `*Portal Password:* ${passVal}\n` +
                    `*Login Portal:* https://www.enterprenexsolution.com/login\n\n` +
                    `_Please log in and keep your credentials confidential._`;
                  copyToClipboard(packText, 'pack');
                }}
              >
                {copiedKey === 'pack' ? <Check size={15} color="#10b981" /> : <Share2 size={15} />}
                <span>{copiedKey === 'pack' ? 'Onboarding Pack Copied to Clipboard!' : 'Copy Full WhatsApp / Email Credentials Pack'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
