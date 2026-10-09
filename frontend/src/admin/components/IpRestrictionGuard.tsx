import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { ShieldAlert, ArrowLeft, Key, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface IpRestrictionGuardProps {
  children: React.ReactNode;
}

export const IpRestrictionGuard: React.FC<IpRestrictionGuardProps> = ({ children }) => {
  const { ipSettings, detectedIp, addAllowedIp } = useAdmin();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(true);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);

  useEffect(() => {
    // If IP restriction is not enforced, allow access
    if (!ipSettings.enforceIpRestriction) {
      setIsAllowed(true);
      setChecking(false);
      return;
    }

    const allowedIpsList = ipSettings.allowedIps.map(entry => entry.ip.trim());
    
    // Check if client IP matches target admin IP or private LAN or local loopbacks
    const isTargetAdminIp = detectedIp === '10.206.229.155' || detectedIp.startsWith('10.');
    const isLocal = detectedIp === '127.0.0.1' || 
                    detectedIp === '::1' || 
                    detectedIp === 'localhost' ||
                    window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '10.206.229.155' ||
                    window.location.hostname.startsWith('192.168.') ||
                    window.location.hostname.startsWith('10.');

    const matchesWhitelist = allowedIpsList.includes(detectedIp) || isTargetAdminIp || isLocal;

    setIsAllowed(matchesWhitelist);
    setChecking(false);
  }, [ipSettings, detectedIp]);

  const handleUnlockCurrentIp = (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError('');

    const inputPass = unlockPassword.trim();
    if (inputPass === 'Enx_sol_121006' || inputPass === '7020443880') {
      addAllowedIp(detectedIp, 'Admin Authorized Station (' + detectedIp + ')');
      setUnlockedSuccess(true);
      setTimeout(() => {
        setIsAllowed(true);
      }, 500);
    } else {
      setUnlockError('Incorrect master security password.');
    }
  };

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0c10', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ba3af', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="adm-spinner" />
          <span style={{ fontSize: '0.85rem' }}>Verifying network security clearance...</span>
        </div>
      </div>
    );
  }

  // ── 403 FORBIDDEN IP SCREEN WITH INSTANT AUTHORIZATION ──
  if (!isAllowed) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at 50% 30%, #1e1111 0%, #0a0c10 70%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          fontFamily: "'Outfit', sans-serif"
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            background: '#14171d',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '24px',
            padding: '2.25rem',
            boxShadow: '0 25px 60px rgba(239, 68, 68, 0.15)',
            textAlign: 'center'
          }}
        >
          {/* Security Alert Badge */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
              marginBottom: '1rem'
            }}
          >
            <ShieldAlert size={32} />
          </div>

          <span
            style={{
              display: 'inline-block',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '3px 12px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem'
            }}
          >
            IP Access Restricted
          </span>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem 0' }}>
            Authorize Admin Network
          </h1>

          <p style={{ fontSize: '0.85rem', color: '#9ba3af', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            Your current public network IP <code>{detectedIp}</code> or LAN <code>10.206.229.155</code> is not yet on the whitelist.
          </p>

          {/* Quick Whitelist Authorization Form */}
          <div
            style={{
              background: '#0a0c10',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={14} color="#F66135" />
              <span>Instant IP Authorization Unlock</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.85rem 0' }}>
              Enter the Super Admin master password (<code>7020443880</code>) to instantly authorize IP <strong>{detectedIp}</strong>:
            </p>

            <form onSubmit={handleUnlockCurrentIp}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="password"
                  className="adm-input"
                  style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                  placeholder="Enter master password..."
                  value={unlockPassword}
                  onChange={e => setUnlockPassword(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="adm-btn adm-btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  Authorize IP
                </button>
              </div>

              {unlockError && (
                <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px' }}>
                  {unlockError}
                </div>
              )}

              {unlockedSuccess && (
                <div style={{ color: '#10b981', fontSize: '0.75rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} />
                  <span>IP Authorized successfully! Granting access...</span>
                </div>
              )}
            </form>
          </div>

          {/* Action Button */}
          <button
            onClick={() => navigate('/')}
            className="adm-btn adm-btn-secondary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.65rem', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={15} />
            <span>Return to Public Website</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
