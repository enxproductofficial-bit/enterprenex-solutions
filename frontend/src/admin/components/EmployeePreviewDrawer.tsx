import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  MessageSquare,
  Shield,
  ShieldCheck,
  Key,
  Trash2,
  Check,
  Eye,
  EyeOff,
  Briefcase,
  TrendingUp,
  GraduationCap,
  CheckSquare,
  UserCheck,
  AlertOctagon,
  Calendar,
  Layers
} from 'lucide-react';
import type { Employee, Task } from '../types';

interface EmployeePreviewDrawerProps {
  employee: Employee;
  onClose: () => void;
  isDirector: boolean;
  canManageTeam: boolean;
  onUpdateEmployee: (id: string, updates: Partial<Employee>) => void;
  onApproveLogin?: (employee: Employee) => void;
  onOpenCredentials?: (employee: Employee) => void;
  onOffboard?: (employee: Employee) => void;
  tasks?: Task[];
}

export const EmployeePreviewDrawer: React.FC<EmployeePreviewDrawerProps> = ({
  employee,
  onClose,
  isDirector,
  canManageTeam,
  onUpdateEmployee,
  onApproveLogin,
  onOpenCredentials,
  onOffboard,
  tasks = []
}) => {
  const [showFullAadhaar, setShowFullAadhaar] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const displayEmpId =
    employee.employeeId ||
    (employee.id.startsWith('emp-') ? `EPX-10${employee.id.replace('emp-', '')}` : employee.id);

  const isPending = employee.approvalStatus === 'Pending Director Approval';
  const isRejected = employee.approvalStatus === 'Rejected';
  const isActive = employee.status === 'Active';

  const cleanPhone = (employee.phone || '').replace(/\D/g, '');
  const getWhatsAppLink = () => {
    let raw = cleanPhone;
    if (raw.length === 10) raw = '91' + raw;
    const msg = `Hi ${employee.name}, this is Enterprenex Solutions HR / Management regarding your sprint tasks and workspace updates.`;
    return `https://wa.me/${raw}?text=${encodeURIComponent(msg)}`;
  };

  const maskAadhaar = (num?: string) => {
    if (!num) return 'Not Provided';
    const clean = num.replace(/\s+/g, '');
    if (clean.length < 4) return 'XXXX-XXXX-XXXX';
    if (showFullAadhaar && isDirector) return clean;
    return `XXXX-XXXX-${clean.slice(-4)}`;
  };

  // Find active tasks assigned to this employee (Section 10 / Notebook item 1)
  const assignedTasks = tasks.filter(t => {
    const assigned = (t.assignedTo || '').toLowerCase();
    const empName = (employee.name || '').toLowerCase();
    const empId = (employee.employeeId || '').toLowerCase();
    return assigned.includes(empName) || (empId && assigned.includes(empId));
  });

  const toggleAccountStatus = () => {
    const newStatus = isActive ? 'Inactive' : 'Active';
    onUpdateEmployee(employee.id, { status: newStatus });
  };

  return (
    <div className="adm-drawer-overlay" onClick={onClose}>
      <div
        className="adm-preview-drawer"
        onClick={e => e.stopPropagation()}
        style={{ width: 'clamp(460px, 60vw, 920px)' }}
      >
        {/* ── Drawer Header ── */}
        <div className="adm-drawer-header">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
              <img
                src={employee.avatar}
                alt={employee.name}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  border: isPending ? '2px solid #f59e0b' : isActive ? '2px solid var(--adm-primary)' : '2px solid #94a3b8'
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: isActive ? '#10b981' : '#ef4444',
                  border: '2px solid #fff'
                }}
                title={isActive ? 'Account Active' : 'Account Deactivated'}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                <span className="adm-badge adm-badge-primary" style={{ fontFamily: 'monospace', fontWeight: 800 }}>
                  {displayEmpId}
                </span>
                <span
                  className={`adm-badge ${
                    isActive
                      ? 'adm-badge-success'
                      : employee.status === 'On Leave'
                      ? 'adm-badge-info'
                      : 'adm-badge-danger'
                  }`}
                >
                  {employee.status}
                </span>
                <span
                  className={`adm-badge ${
                    isPending
                      ? 'adm-badge-warning'
                      : isRejected
                      ? 'adm-badge-danger'
                      : 'adm-badge-success'
                  }`}
                >
                  {isPending ? 'Pending Director Review' : isRejected ? 'Access Denied' : 'Portal Approved'}
                </span>
              </div>

              <h2
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: 'var(--adm-text, #1a1a1a)',
                  margin: '2px 0',
                  lineHeight: 1.3
                }}
              >
                {(employee.employeeId === '202600000001' || employee.name?.includes('Rohit P')) ? 'Rohit Pawar' : employee.name}
              </h2>

              <div style={{ fontSize: '0.82rem', color: 'var(--adm-text-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--adm-primary)', fontWeight: 600 }}>{employee.role}</span>
                <span>&bull;</span>
                <span>{employee.department}</span>
                <span>&bull;</span>
                <span>Joined: {employee.joinDate || '2025'}</span>
              </div>
            </div>
          </div>

          <button className="adm-modal-close" onClick={onClose} title="Close Drawer (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* ── Direct Outreach & One-Click Contact Toolbar (Notebook Item 4 & 5) ── */}
        <div
          style={{
            background: 'var(--adm-surface-alt, rgba(0, 0, 0, 0.02))',
            borderBottom: '1px solid var(--adm-border)',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}
        >
          {/* One-Click Contact & Direct Access to Connect */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="adm-btn adm-btn-sm"
              style={{
                background: '#25D366',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="One-Click WhatsApp Contact"
            >
              <MessageCircle size={14} />
              <span>WhatsApp</span>
            </a>

            <a
              href={`tel:${employee.phone}`}
              className="adm-btn adm-btn-sm adm-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title="Direct Call"
            >
              <Phone size={13} />
              <span>Call ({employee.phone})</span>
            </a>

            <a
              href={`mailto:${employee.email}?subject=ENTERPRENEX%20SOLUTIONS%20-%20Workplace%20Update`}
              className="adm-btn adm-btn-sm adm-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title="Official Email"
            >
              <Mail size={13} />
              <span>Email</span>
            </a>

            {/* Direct Access to Connect (Internal Communication Hub) */}
            <a
              href={`https://wa.me/919226860060?text=${encodeURIComponent(`Direct Connect Request with ${employee.name} (${displayEmpId})`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="adm-btn adm-btn-sm adm-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--adm-primary)' }}
              title="Direct Access to Connect via Communication Hub"
            >
              <MessageSquare size={13} />
              <span>Direct Connect</span>
            </a>
          </div>

          {/* Director Controls: Quick Approve & Deactivate/Reactivate */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {isPending && isDirector && (
              <button
                type="button"
                className="adm-btn adm-btn-sm"
                onClick={() => {
                  if (onApproveLogin) {
                    onApproveLogin(employee);
                  } else {
                    onUpdateEmployee(employee.id, {
                      approvalStatus: 'Approved',
                      approvedBy: 'Rohit Pawar (Managing Director)',
                      approvedAt: new Date().toISOString()
                    });
                  }
                }}
                style={{
                  background: 'var(--adm-success)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Check size={14} />
                <span>Approve Portal Login</span>
              </button>
            )}

            {/* Director Account Deactivate / Reactivate Toggle */}
            {isDirector && !(employee.email.includes('director@') || employee.role.includes('Director')) && (
              <button
                type="button"
                onClick={toggleAccountStatus}
                className="adm-btn adm-btn-sm"
                style={{
                  background: isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: isActive ? '#dc2626' : '#059669',
                  border: isActive ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                title={isActive ? 'Deactivate Employee Account' : 'Reactivate Employee Account'}
              >
                <AlertOctagon size={13} />
                <span>{isActive ? 'Deactivate Account' : 'Reactivate Account'}</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Drawer Body ── */}
        <div className="adm-drawer-body" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Key Metrics Grid */}
          <div className="adm-grid-3">
            <div
              style={{
                padding: '0.9rem',
                background: 'var(--adm-surface)',
                borderRadius: '10px',
                border: '1px solid var(--adm-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--adm-text-dim)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                <TrendingUp size={13} />
                <span>Sprint Workload</span>
              </div>
              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  marginTop: '4px',
                  color:
                    employee.workloadPercentage >= 100
                      ? '#ef4444'
                      : employee.workloadPercentage > 70
                      ? 'var(--adm-warning)'
                      : 'var(--adm-success)'
                }}
              >
                {employee.workloadPercentage}%
              </div>
              <div style={{ width: '100%', height: '5px', background: 'var(--adm-border)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, employee.workloadPercentage))}%`,
                    height: '100%',
                    background:
                      employee.workloadPercentage >= 100
                        ? '#ef4444'
                        : employee.workloadPercentage > 70
                        ? 'var(--adm-warning)'
                        : 'var(--adm-success)'
                  }}
                />
              </div>
            </div>

            <div
              style={{
                padding: '0.9rem',
                background: 'var(--adm-surface)',
                borderRadius: '10px',
                border: '1px solid var(--adm-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--adm-text-dim)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                <Briefcase size={13} />
                <span>Department & Hierarchy</span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--adm-text, #1a1a1a)', marginTop: '4px' }}>
                {employee.department}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '2px' }}>
                Manager: <strong>{employee.reportingManager || 'Rohit Pawar (Director)'}</strong>
              </div>
            </div>

            <div
              style={{
                padding: '0.9rem',
                background: 'var(--adm-surface)',
                borderRadius: '10px',
                border: '1px solid var(--adm-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--adm-text-dim)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                <Shield size={13} />
                <span>KYC Verification</span>
              </div>
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  marginTop: '4px',
                  color: employee.kycStatus === 'Verified' ? 'var(--adm-success)' : 'var(--adm-warning)'
                }}
              >
                {employee.kycStatus === 'Verified' ? '✓ Verified' : '⏳ Pending'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '2px' }}>
                Type: {employee.employmentType || 'Full Time'}
              </div>
            </div>
          </div>

          {/* ── 1) TASK ASSIGNED (Notebook Item 1 - "get most Imp") ── */}
          <div
            style={{
              padding: '1rem',
              background: 'var(--adm-surface)',
              borderRadius: '10px',
              border: '1px solid var(--adm-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckSquare size={16} color="var(--adm-primary)" />
                <span>Active Assigned Sprint Tasks ({assignedTasks.length})</span>
              </h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-muted)' }}>
                Section 10 Telemetry
              </span>
            </div>

            {assignedTasks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {assignedTasks.map(t => (
                  <div
                    key={t.id}
                    style={{
                      padding: '0.65rem 0.85rem',
                      background: 'var(--adm-bg, #fafafa)',
                      border: '1px solid var(--adm-border)',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.72rem', color: 'var(--adm-primary)' }}>
                          {t.taskId || t.id}
                        </span>
                        <strong style={{ fontSize: '0.84rem', color: 'var(--adm-text)' }}>{t.title}</strong>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-muted)', marginTop: '2px' }}>
                        {t.projectName} &bull; Est: {t.estimatedHours}h / Logged: {t.loggedHours}h &bull; Due: {t.dueDate}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span className={`adm-badge ${t.priority === 'Urgent' ? 'adm-badge-danger' : 'adm-badge-neutral'}`} style={{ fontSize: '0.68rem' }}>
                        {t.priority}
                      </span>
                      <span className="adm-badge adm-badge-info" style={{ fontSize: '0.68rem' }}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)', fontStyle: 'italic' }}>
                No active sprint tasks currently assigned. Tasks can be delegated from Sprint Backlog & Kanban.
              </div>
            )}
          </div>

          {/* ── 2) SKILL LIST (Notebook Item 2) ── */}
          <div
            style={{
              padding: '1rem',
              background: 'var(--adm-surface)',
              borderRadius: '10px',
              border: '1px solid var(--adm-border)'
            }}
          >
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--adm-text)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={16} color="#6366f1" />
              <span>Competency & Technical Skills ({employee.skills?.length || 0})</span>
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {(employee.skills || []).map((sk, idx) => (
                <span
                  key={idx}
                  className="adm-badge adm-badge-primary"
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  {sk}
                </span>
              ))}
              {(!employee.skills || employee.skills.length === 0) && (
                <span style={{ fontSize: '0.8rem', color: 'var(--adm-text-dim)' }}>No skill tags registered.</span>
              )}
            </div>
          </div>

          {/* ── 3) QUALIFICATION & EDUCATION (Notebook Item 3) ── */}
          <div
            style={{
              padding: '1rem',
              background: 'var(--adm-surface)',
              borderRadius: '10px',
              border: '1px solid var(--adm-border)'
            }}
          >
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--adm-text)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GraduationCap size={16} color="#059669" />
              <span>Educational Qualifications & Background</span>
            </h4>
            <div style={{ padding: '0.75rem 0.9rem', background: 'var(--adm-bg, #fafafa)', border: '1px solid var(--adm-border)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--adm-text)' }}>
                {employee.qualification || 'Bachelor of Engineering (B.E.) in Computer Science & Technology'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--adm-text-muted)', marginTop: '2px' }}>
                Accredited University &bull; Verified Institutional Credentials
              </div>
            </div>
          </div>

          {/* Statutory KYC Vault (Secured - Director only) */}
          <div
            style={{
              padding: '1rem',
              background: 'var(--adm-surface)',
              borderRadius: '10px',
              border: '1px solid var(--adm-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={15} color="var(--adm-success)" />
                <span>Statutory Government KYC & ID Vault</span>
              </h4>
              <span className="adm-badge adm-badge-neutral" style={{ fontSize: '0.68rem' }}>
                Restricted Access
              </span>
            </div>

            <div className="adm-grid-2" style={{ gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--adm-bg)', borderRadius: '8px', border: '1px solid var(--adm-border)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase' }}>PAN Number</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--adm-text)', marginTop: '2px', fontFamily: 'monospace' }}>
                  {employee.panNumber || 'Not Uploaded'}
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: 'var(--adm-bg)', borderRadius: '8px', border: '1px solid var(--adm-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase' }}>Aadhaar Card</span>
                  {isDirector && employee.aadhaarNumber && (
                    <button
                      type="button"
                      onClick={() => setShowFullAadhaar(!showFullAadhaar)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--adm-primary)', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      {showFullAadhaar ? <EyeOff size={11} /> : <Eye size={11} />}
                      <span>{showFullAadhaar ? 'Mask' : 'Reveal'}</span>
                    </button>
                  )}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--adm-text)', marginTop: '2px', fontFamily: 'monospace' }}>
                  {maskAadhaar(employee.aadhaarNumber)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Drawer Footer ── */}
        <div className="adm-drawer-footer">
          <div>
            {canManageTeam && !(employee.email.includes('director@') || employee.role.includes('Director')) && (
              <button
                type="button"
                className="adm-btn adm-btn-sm adm-btn-danger"
                onClick={() => {
                  if (onOffboard) onOffboard(employee);
                }}
                title="Offboard or delete employee"
              >
                <Trash2 size={13} />
                <span>Offboard Staff</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {canManageTeam && (
              <button
                type="button"
                className="adm-btn adm-btn-sm adm-btn-secondary"
                onClick={() => {
                  if (onOpenCredentials) onOpenCredentials(employee);
                }}
                title="Manage workspace credentials"
              >
                <Key size={13} color="#f59e0b" />
                <span>Credentials</span>
              </button>
            )}

            <button type="button" className="adm-btn adm-btn-sm adm-btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePreviewDrawer;
