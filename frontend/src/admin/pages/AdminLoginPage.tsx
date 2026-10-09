import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import type { AdminUser } from '../types';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAdmin();
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

    // Authenticate primary Super Admin credentials
    const isPrimaryAuth = inputEmail === 'abvpcsnagar@gmail.com' && inputPassword === '7020443880';

    if (isPrimaryAuth) {
      const superAdminUser: AdminUser = {
        id: 'usr-1',
        name: 'Enterprenex Super Admin',
        email: 'abvpcsnagar@gmail.com',
        role: 'Super Admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        department: 'Executive Management',
        status: 'Active',
        lastLogin: 'Just now',
        phone: '+91-7020443880'
      };

      setTimeout(() => {
        login(superAdminUser);
        setIsLoading(false);
        navigate('/admin');
      }, 400);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setError('Authentication failed. Invalid email address or security password.');
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
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #F66135 0%, #D94E22 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(246, 97, 53, 0.4)',
              marginBottom: '1rem'
            }}
          >
            <Sparkles size={28} color="#fff" />
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
            <label className="adm-form-label" style={{ color: '#9ba3af' }}>Authorized Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="email"
                className="adm-input"
                style={{ paddingLeft: '2.5rem' }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter authorized email..."
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
      </div>
    </div>
  );
};
