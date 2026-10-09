import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Plus,
  CheckCircle2,
  Phone,
  Mail,
  X
} from 'lucide-react';
import type { Employee } from '../types';

export const TeamPage: React.FC = () => {
  const { employees, attendance, leaves, addEmployee, updateLeaveStatus, markAttendanceToday } = useAdmin();
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

  const nextEmpId = `EPX-${100 + employees.length + 1}`;

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    addEmployee({
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
    setShowAddModal(false);
    setName('');
    setRole('');
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
          <button className="adm-btn adm-btn-primary" onClick={() => setShowAddModal(true)}>
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
          {employees.map(emp => (
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
                  <span className="adm-badge adm-badge-neutral" style={{ fontSize: '0.65rem', fontFamily: 'monospace' }}>
                    {emp.id.startsWith('emp-') ? `EPX-10${emp.id.replace('emp-', '')}` : emp.id}
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

              {/* Contact & Rating */}
              <div style={{ background: 'var(--adm-bg)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--adm-border)', fontSize: '0.75rem', color: 'var(--adm-text-muted)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={12} color="var(--adm-primary)" /> {emp.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={12} color="var(--adm-info)" /> {emp.phone}
                </div>
              </div>
            </div>
          ))}
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
              {/* Auto Generated ID notice */}
              <div style={{ background: 'rgba(5, 150, 105, 0.1)', border: '1px solid rgba(5, 150, 105, 0.3)', padding: '0.65rem 0.85rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Auto-Assigned Employee ID:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{nextEmpId}</span>
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Full Name *</label>
                  <input className="adm-input" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rahul Deshmukh" />
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

    </div>
  );
};
