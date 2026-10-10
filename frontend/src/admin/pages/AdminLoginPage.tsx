import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import type { AdminUser } from '../types';

export const AdminLoginPage: React.FC = () => {
  const { login, employees } = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const inputEmail = email.trim().toLowerCase();
    const inputPassword = password.trim();

    const isPasswordValid = inputPassword === 'Enx_sol_121006';
    const isDirector = (inputEmail === 'director@enterprenexsolution.com' || inputEmail === 'rohit@enterprenexsolution.com') && isPasswordValid;
    const isHr = inputEmail === 'hr@enterprenexsolution.com' && isPasswordValid;
    const isManager = inputEmail === 'manager@enterprenexsolution.com' && isPasswordValid;

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
        name: isDirector ? 'Rohit P. (Managing Director)' : isHr ? 'HR Administrator' : 'Operations Manager',
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
          setError(`Account Pending Approval: Employee ID ${matchedEmp.employeeId || matchedEmp.name} is awaiting approval from Managing Director (Rohit P.).`);
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
        phone: matchedEmp.phone || '+91-9226860060'
      };

      setTimeout(() => {
        login(empUser);
        setIsLoading(false);
        navigate('/admin/tasks');
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
        background: '#0a0c10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: "'Outfit', sans-serif"
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#14171d',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Brand Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
          >
            <img src="/images/logo.svg" alt="Enterprenex Logo" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            Enterprenex Admin
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#9ba3af', marginTop: '0.35rem' }}>
            Authorized Personnel & Operations Access Portal
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              color: '#ef4444',
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
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ color: '#9ba3af' }}>Authorized Email or Employee ID</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                className="adm-input"
                style={{ paddingLeft: '2.5rem' }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. 202600000001 or authorized email..."
                required
                autoFocus
              />
            </div>
          </div>

          <div className="adm-form-group">
            <label className="adm-form-label" style={{ color: '#9ba3af' }}>Password / Access Key</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="password"
                className="adm-input"
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password..."
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="adm-btn adm-btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', marginTop: '0.75rem', justifyContent: 'center' }}
          >
            <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate & Sign In'}</span>
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem' }}>
          <Link to="/login" style={{ fontSize: '0.82rem', color: '#34d399', textDecoration: 'none', fontWeight: 600 }}>
            ← Go to Main Workspace Portal (Director / Employee / HR)
          </Link>
          <Link to="/" style={{ fontSize: '0.78rem', color: '#64748b', textDecoration: 'none' }}>
            Back to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
};
