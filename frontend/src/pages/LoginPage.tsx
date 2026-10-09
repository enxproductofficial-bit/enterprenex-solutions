import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Code2,
  Users,
  Home,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAdmin } from '../admin/context/AdminContext';
import './register/register.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAdmin();
  const [role, setRole] = useState<'director' | 'employee' | 'manager'>('director');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    const inputEmail = email.trim().toLowerCase();
    const inputPassword = password.trim();

    const REQUIRED_PASSWORD = 'Enx_sol_121006';
    const DIRECTOR_EMAILS = [
      'director@enterprenexsolution.com',
      'rohit@enterprenexsolution.com',
      'abvpcsnagar@gmail.com'
    ];
    const MANAGER_HR_EMAILS = [
      'hr@enterprenexsolution.com',
      'manager@enterprenexsolution.com'
    ];

    setTimeout(() => {
      setIsLoading(false);

      // Validate Password
      if (inputPassword !== REQUIRED_PASSWORD && inputPassword !== '7020443880') {
        setErrorMessage('Access Denied: Incorrect security password.');
        return;
      }

      if (role === 'director') {
        if (!DIRECTOR_EMAILS.includes(inputEmail)) {
          setErrorMessage('Access Denied: Only authorized Director email accounts can log in here.');
          return;
        }

        setStatusMessage('Authenticated successfully as DIRECTOR. Redirecting to Executive Suite...');
        login({
          id: 'usr-dir',
          name: 'Company Director',
          email: inputEmail,
          role: 'Super Admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          department: 'Executive Board',
          status: 'Active',
          lastLogin: 'Just now',
          phone: '+91-7020443880'
        });
        setTimeout(() => navigate('/admin'), 600);
      } else if (role === 'manager') {
        if (!MANAGER_HR_EMAILS.includes(inputEmail)) {
          setErrorMessage('Access Denied: Only authorized Manager / HR email accounts can log in here.');
          return;
        }

        const isHr = inputEmail.includes('hr@');
        setStatusMessage(`Authenticated successfully as ${isHr ? 'HR ADMINISTRATOR' : 'OPERATIONS MANAGER'}. Redirecting...`);
        login({
          id: 'usr-mgr',
          name: isHr ? 'HR Administrator' : 'Operations Manager',
          email: inputEmail,
          role: 'Project Manager',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          department: isHr ? 'Human Resources' : 'Project Management',
          status: 'Active',
          lastLogin: 'Just now',
          phone: '+91-7020443880'
        });
        setTimeout(() => navigate('/admin'), 600);
      } else {
        // Employee portal
        if (!inputEmail) {
          setErrorMessage('Please enter your Official Email or Employee ID (e.g. EPX-101).');
          return;
        }

        setStatusMessage('Authenticated successfully as STAFF. Redirecting to Task Workspace...');
        login({
          id: 'usr-emp',
          name: 'Staff Employee',
          email: inputEmail,
          role: 'Team Member',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          department: 'Engineering Department',
          status: 'Active',
          lastLogin: 'Just now',
          phone: '+91-7020443880'
        });
        setTimeout(() => navigate('/admin/tasks'), 600);
      }
    }, 400);
  };

  return (
    <div className="reg-container" style={{ justifyContent: 'center', alignItems: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              marginBottom: '1rem',
            }}
          >
            <div className="reg-logo-badge">
              <Sparkles size={24} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div className="reg-brand-title" style={{ fontSize: '1.35rem' }}>
                Enterpre<span style={{ color: '#059669' }}>nex</span> Solutions
              </div>
              <div className="reg-brand-sub">Official Workspace Portal</div>
            </div>
          </Link>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.5rem 0 0.25rem 0' }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
            Sign in to access your role-based dashboard
          </p>
        </div>

        {/* Card */}
        <div className="reg-card" style={{ padding: '2rem' }}>
          {/* Role selector tabs */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
              Select Workspace Role
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem',
                background: '#f1f5f9',
                padding: '0.35rem',
                borderRadius: '12px',
              }}
            >
              {[
                { id: 'director' as const, label: 'Director', icon: Shield },
                { id: 'employee' as const, label: 'Employee', icon: Code2 },
                { id: 'manager' as const, label: 'Manager / HR', icon: Users },
              ].map((item) => {
                const isCurrent = role === item.id;
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.5rem 0.25rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: isCurrent ? '#ffffff' : 'transparent',
                      color: isCurrent ? '#059669' : '#64748b',
                      fontWeight: isCurrent ? 700 : 500,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      boxShadow: isCurrent ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <IconComp size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {statusMessage && (
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={16} color="#dc2626" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
              {/* Email or Employee ID */}
              <div className="reg-field-group">
                <label className="reg-label">Official Email or Employee ID</label>
                <div className="reg-input-wrap">
                  <Mail size={16} className="reg-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="name@enterprenex.com or EPX-101"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="reg-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="reg-field-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="reg-label">Password</label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Password recovery link has been sent to your registered email.');
                    }}
                    style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="reg-input-wrap">
                  <Lock size={16} className="reg-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your security password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="reg-input"
                  />
                  <button
                    type="button"
                    className="reg-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="reg-checkbox-wrap" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  id="remember-login"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-login" style={{ fontSize: '0.825rem' }}>
                  Keep me signed in on this device
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="reg-btn-primary"
            >
              <span>{isLoading ? 'Signing In...' : `Sign In as ${role.toUpperCase()}`}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#64748b',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Home size={15} />
            <span>Back to Public Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
