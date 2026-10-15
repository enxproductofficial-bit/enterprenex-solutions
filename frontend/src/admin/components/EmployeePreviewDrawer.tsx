import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  Building,
  User,
  Shield,
  ShieldCheck,
  Award,
  Key,
  Trash2,
  Check,
  Clock,
  Eye,
  EyeOff,
  Briefcase,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText
} from 'lucide-react';
import type { Employee } from '../types';

interface EmployeePreviewDrawerProps {
  employee: Employee;
  onClose: () => void;
  isDirector: boolean;
  canManageTeam: boolean;
  onUpdateEmployee: (id: string, updates: Partial<Employee>) => void;
  onApproveLogin?: (employee: Employee) => void;
  onIssueCertificate?: (employee: Employee) => void;
  onOpenCredentials?: (employee: Employee) => void;
  onOffboard?: (employee: Employee) => void;
}

export const EmployeePreviewDrawer: React.FC<EmployeePreviewDrawerProps> = ({
  employee,
  onClose,
  isDirector,
  canManageTeam,
  onUpdateEmployee,
  onApproveLogin,
  onIssueCertificate,
  onOpenCredentials,
  onOffboard
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

  const cleanPhone = (employee.phone || '').replace(/\D/g, '');
  const getWhatsAppLink = () => {
    let raw = cleanPhone;
    if (raw.length === 10) raw = '91' + raw;
    const msg = `Hi ${employee.name}, this is Enterprenex Solutions HR / Management. Regarding your sprint tasks and workspace updates, please connect with us.`;
    return `https://wa.me/${raw}?text=${encodeURIComponent(msg)}`;
  };

  const maskAadhaar = (num?: string) => {
    if (!num) return 'Not Provided';
    const clean = num.replace(/\s+/g, '');
    if (clean.length < 4) return 'XXXX-XXXX-XXXX';
    if (showFullAadhaar && isDirector) return clean;
    return `XXXX-XXXX-${clean.slice(-4)}`;
  };

  return (
    <div className="adm-drawer-overlay" onClick={onClose}>
      <div
        className="adm-preview-drawer"
        onClick={e => e.stopPropagation()}
        style={{ width: 'clamp(440px, 58vw, 900px)' }}
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
                  border: isPending ? '2px solid #f59e0b' : '2px solid var(--adm-primary)'
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: employee.status === 'Active' ? '#10b981' : '#f59e0b',
                  border: '2px solid #fff'
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                <span className="adm-badge adm-badge-primary" style={{ fontFamily: 'monospace', fontWeight: 800 }}>
                  {displayEmpId}
                </span>
                <span
                  className={`adm-badge ${
                    employee.status === 'Active'
                      ? 'adm-badge-success'
                      : employee.status === 'On Leave'
                      ? 'adm-badge-info'
                      : 'adm-badge-warning'
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
                {employee.name}
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

        {/* ── Direct Outreach & Approval Toolbar ── */}
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
              title="Ping staff on WhatsApp"
            >
              <MessageCircle size={14} />
              <span>WhatsApp</span>
            </a>

            <a
              href={`tel:${employee.phone}`}
              className="adm-btn adm-btn-sm adm-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Phone size={13} />
              <span>Call ({employee.phone})</span>
            </a>

            <a
              href={`mailto:${employee.email}?subject=ENTERPRENEX%20SOLUTIONS%20-%20Workplace%20Update`}
              className="adm-btn adm-btn-sm adm-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Mail size={13} />
              <span>Email</span>
            </a>
          </div>

          {/* Director Quick Approve */}
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
                    approvedBy: 'Rohit P. (Managing Director)',
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
        </div>

        {/* ── Drawer Body ── */}
        <div className="adm-drawer-body">
          {/* Key Metrics Grid */}
          <div className="adm-grid-3">
            <div
              style={{
                padding: '1rem',
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
                  fontSize: '1.4rem',
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
              {/* Progress bar */}
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
                padding: '1rem',
                background: 'var(--adm-surface)',
                borderRadius: '10px',
                border: '1px solid var(--adm-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--adm-text-dim)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                <Briefcase size={13} />
                <span>Department</span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--adm-text, #1a1a1a)', marginTop: '4px' }}>
                {employee.department}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '2px' }}>
                Role: {employee.role}
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
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
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  marginTop: '4px',
                  color: employee.kycStatus === 'Verified' ? 'var(--adm-success)' : 'var(--adm-warning)'
                }}
              >
                {employee.kycStatus === 'Verified' ? '✓ Verified' : '⏳ Pending'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '2px' }}>
                PAN: {employee.panNumber || 'Not submitted'}
              </div>
            </div>
          </div>

          {/* Workload Capacity Controller (for managers & director) */}
          {canManageTeam && (
            <div
              style={{
                padding: '1rem',
                background: 'var(--adm-surface)',
                borderRadius: '10px',
                border: '1px solid var(--adm-border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text, #1a1a1a)' }}>
                  Adjust Sprint Allocation & Capacity
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--adm-text-dim)' }}>
                  Current: <strong>{employee.workloadPercentage}%</strong>
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[20, 50, 75].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => onUpdateEmployee(employee.id, { workloadPercentage: pct })}
                    className="adm-btn adm-btn-sm"
                    style={{
                      background: employee.workloadPercentage === pct ? 'var(--adm-primary)' : 'var(--adm-surface-alt, rgba(0, 0, 0, 0.05))',
                      color: employee.workloadPercentage === pct ? '#fff' : 'var(--adm-text-muted)',
                      border: 'none',
                      fontWeight: 600
                    }}
                  >
                    Set {pct}%
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => onUpdateEmployee(employee.id, { workloadPercentage: 100 })}
                  className="adm-btn adm-btn-sm"
                  style={{
                    background: employee.workloadPercentage === 100 ? '#ef4444' : 'rgba(239, 68, 68, 0.15)',
                    color: employee.workloadPercentage === 100 ? '#fff' : '#ef4444',
                    border: 'none',
                    fontWeight: 700
                  }}
                >
                  100% Full Capacity
                </button>
              </div>
            </div>
          )}

          {/* Technical Skills & Specializations */}
          <div
            style={{
              padding: '1rem',
              background: 'var(--adm-surface)',
              borderRadius: '10px',
              border: '1px solid var(--adm-border)'
            }}
          >
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text, #1a1a1a)', margin: '0 0 0.75rem 0' }}>
              Specializations & Skills ({employee.skills?.length || 0})
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
                <span style={{ fontSize: '0.8rem', color: 'var(--adm-text-dim)' }}>No skills tagged yet.</span>
              )}
            </div>
          </div>

          {/* Statutory KYC Vault (Restricted under DPDP Act) */}
          <div
            style={{
              padding: '1rem',
              background: 'var(--adm-surface)',
              borderRadius: '10px',
              border: '1px solid var(--adm-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text, #1a1a1a)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={15} color="var(--adm-success)" />
                <span>Statutory Government KYC Vault</span>
              </h4>
              <span className="adm-badge adm-badge-neutral" style={{ fontSize: '0.68rem' }}>
                Restricted to Director & HR
              </span>
            </div>

            <div className="adm-grid-2" style={{ gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--adm-bg)', borderRadius: '8px', border: '1px solid var(--adm-border)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase' }}>PAN Number</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--adm-text, #1a1a1a)', marginTop: '2px', fontFamily: 'monospace' }}>
                  {employee.panNumber || 'Not Uploaded'}
                </div>
                {employee.panDocUrl && (
                  <a
                    href={employee.panDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.72rem', color: 'var(--adm-primary)', marginTop: '4px', display: 'inline-block' }}
                  >
                    View PAN Document &rarr;
                  </a>
                )}
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
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--adm-text, #1a1a1a)', marginTop: '2px', fontFamily: 'monospace' }}>
                  {maskAadhaar(employee.aadhaarNumber)}
                </div>
                {employee.aadhaarDocUrl && (
                  <a
                    href={employee.aadhaarDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.72rem', color: 'var(--adm-primary)', marginTop: '4px', display: 'inline-block' }}
                  >
                    View Aadhaar Document &rarr;
                  </a>
                )}
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
              <>
                <button
                  type="button"
                  className="adm-btn adm-btn-sm adm-btn-secondary"
                  onClick={() => {
                    if (onIssueCertificate) onIssueCertificate(employee);
                  }}
                  title="Issue Completion or Experience Certificate"
                >
                  <Award size={13} color="#10b981" />
                  <span>Certificate</span>
                </button>

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
              </>
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
