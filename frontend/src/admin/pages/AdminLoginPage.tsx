import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { EmployeeTermsModal } from '../../components/EmployeeTermsModal';
import type { AdminUser } from '../types';

export const AdminLoginPage: React.FC = () => {
  const { login, employees } = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const inputEmail = email.trim().toLowerCase();
    const inputPassword = password.trim();

    const isPasswordValid = inputPassword === 'Enx_sol_121006';
    const isDirector = (
      inputEmail === 'director@enterprenex.solutions' ||
      inputEmail === 'rohit@enterprenex.solutions' ||
      inputEmail === 'director@enterprenexsolution.com' ||
      inputEmail === 'rohit@enterprenexsolution.com'
    ) && isPasswordValid;
    const isHr = (inputEmail === 'hr@enterprenex.solutions' || inputEmail === 'hr@enterprenexsolution.com') && isPasswordValid;
    const isManager = (inputEmail === 'manager@enterprenex.solutions' || inputEmail === 'manager@enterprenexsolution.com') && isPasswordValid;

    // Check Employee match by Employee ID or Email
    const matchedEmp = employees.find(
      (emp) =>
        (emp.employeeId && emp.employeeId.toLowerCase() === inputEmail) ||
        (emp.email && emp.email.toLowerCase() === inputEmail) ||
        emp.id.toLowerCase() === inputEmail
    );
    const validEmpPassword = matchedEmp?.password || 'Enx_sol_121006';
    const isEmployee = matchedEmp && (inputPassword === validEmpPassword || isPasswordValid);

    if (isDirector || isHr || isManager) {
      const authenticatedUser: AdminUser = {
        id: isDirector ? 'usr-dir' : isHr ? 'usr-hr' : 'usr-mgr',
        name: isDirector ? 'Rohit Pawar (Managing Director)' : isHr ? 'HR Administrator' : 'Operations Manager',
        email: inputEmail,
        role: isDirector ? 'Super Admin' : 'Project Manager',
        avatar: isDirector
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
          : isHr
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        department: isDirector ? 'Executive Management' : isHr ? 'Human Resources' : 'Project Management',
        status: 'Active',
        lastLogin: 'Just now',
        phone: '+91-9226860060'
      };

      setTimeout(() => {
        login(authenticatedUser);
        setIsLoading(false);
        navigate('/admin');
      }, 400);
    } else if (isEmployee && matchedEmp) {
      if (matchedEmp.approvalStatus === 'Pending Director Approval') {
        setTimeout(() => {
          setIsLoading(false);
          setError(`Account Pending Approval: Employee ID ${matchedEmp.employeeId || matchedEmp.name} is awaiting approval from Managing Director (Rohit Pawar).`);
        }, 400);
        return;
      }
      if (matchedEmp.approvalStatus === 'Rejected') {
        setTimeout(() => {
          setIsLoading(false);
          setError(`Access Denied: This staff account has been disabled by the Managing Director.`);
        }, 400);
        return;
      }

      const empUser: AdminUser = {
        id: matchedEmp.id,
        name: matchedEmp.name,
        email: matchedEmp.email,
        role: 'Team Member',
        avatar: matchedEmp.avatar,
        department: matchedEmp.department,
        status: 'Active',
        lastLogin: 'Just now',
        phone: matchedEmp.phone || '+91-9226860060',
        employeeId: matchedEmp.employeeId
      };

      setTimeout(() => {
        login(empUser);
        setIsLoading(false);
        navigate('/admin');
      }, 400);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setError('Authentication failed. Invalid Employee ID/email or password.');
      }, 400);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--background, #F2F3F5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        fontFamily: "'Outfit', sans-serif"
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--surface, #FFFFFF)',
          border: '1px solid var(--border, #E8E8E8)',
          borderRadius: 'var(--radius-card, 16px)',
          padding: '2.5rem',
          boxShadow: '0 20px 50px rgba(16, 112, 200, 0.07)'
        }}
      >
        {/* Brand Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.85rem',
              background: 'transparent',
              padding: 0
            }}
          >
            <img src="/images/logo.png" alt="Enterprenex Logo" style={{ width: '68px', height: '68px', objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary, #111827)', margin: 0, letterSpacing: '-0.02em' }}>
            Director & HR Portal
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #6B7280)', marginTop: '0.35rem' }}>
            Authorized Executive & Institutional Access Portal
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              color: '#dc2626',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '1.25rem'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleFormLogin}>
          <div className="adm-form-group" style={{ marginBottom: '1.15rem' }}>
            <label className="adm-form-label" style={{ color: 'var(--text-secondary, #6B7280)', fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Official Email or Employee ID
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #9CA3AF)' }} />
              <input
                type="text"
                className="reg-input"
                style={{ paddingLeft: '2.5rem' }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="director@enterprenex.solutions"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="adm-form-group" style={{ marginBottom: '1.15rem' }}>
            <label className="adm-form-label" style={{ color: 'var(--text-secondary, #6B7280)', fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Security Password / Master Passkey
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #9CA3AF)' }} />
              <input
                type="password"
                className="reg-input"
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password..."
                required
              />
            </div>
          </div>

          {/* Terms and Conditions Option */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              background: 'var(--blue-light, #E6EDF5)',
              border: '1px solid var(--blue-soft, #C8E0F8)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="adm-terms-checkbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                style={{ width: '15px', height: '15px', accentColor: 'var(--primary, #1070C8)', cursor: 'pointer' }}
              />
              <label htmlFor="adm-terms-checkbox" style={{ color: 'var(--text-primary, #111827)', cursor: 'pointer', fontWeight: 600 }}>
                Agree to Governance Terms
              </label>
            </div>

            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary, #1070C8)',
                fontWeight: 700,
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.78rem'
              }}
            >
              View Institutional Policies
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="reg-btn-primary"
            style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', justifyContent: 'center' }}
          >
            <span>{isLoading ? 'Verifying Executive Clearance...' : 'Authenticate & Open Workspace'}</span>
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border, #E8E8E8)', paddingTop: '1.25rem' }}>
          <Link to="/login" style={{ fontSize: '0.82rem', color: 'var(--primary, #1070C8)', textDecoration: 'none', fontWeight: 700 }}>
            ← Switch to Workforce & Staff Sign In
          </Link>
          <Link to="/" style={{ fontSize: '0.78rem', color: 'var(--text-muted, #9CA3AF)', textDecoration: 'none' }}>
            Back to Public Website
          </Link>
        </div>

        {/* Terms and Conditions Modal */}
        {showTermsModal && (
          <EmployeeTermsModal
            onClose={() => setShowTermsModal(false)}
            onAccept={() => setAgreeTerms(true)}
          />
        )}
      </div>
    </div>
  );
};
