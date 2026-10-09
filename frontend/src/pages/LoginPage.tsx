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
} from 'lucide-react';
import './register/register.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'director' | 'employee' | 'manager'>('director');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    // Simulate login for the selected role
    setTimeout(() => {
      setIsLoading(false);
      setStatusMessage(`Logged in successfully as ${role.toUpperCase()}! Redirecting...`);
      setTimeout(() => {
        if (role === 'director' || role === 'manager') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 1000);
    }, 600);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStatusMessage(`Authenticated via Google for Enterprenex Solutions. Redirecting...`);
      setTimeout(() => navigate('/admin'), 1000);
    }, 600);
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

          {/* Divider */}
          <div className="reg-divider">
            <span>or continue with</span>
          </div>

          {/* Google SSO */}
          <button
            type="button"
            className="reg-btn-google"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Internal Access Notice */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b' }}>
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <Shield size={14} color="#059669" />
              <span>Internal Staff Portal (Approach A)</span>
            </div>
            <div>Public registration is closed. All staff accounts and Employee IDs are generated inside by Enterprenex HR.</div>
          </div>
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
