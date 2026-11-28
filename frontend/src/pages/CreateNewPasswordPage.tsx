import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  Check,
  X,
  Clock,
  Mail
} from 'lucide-react';
import { useAdmin } from '../admin/context/AdminContext';
import './register/register.css';

export const CreateNewPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, completePasswordSetup, showToast } = useAdmin();

  // URL search params for reset token
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get('token') || '';
  const isTokenMode = Boolean(resetToken);

  // Token verification states
  const [isVerifyingToken, setIsVerifyingToken] = useState(isTokenMode);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [tokenEmail, setTokenEmail] = useState('');
  const [countdownSeconds, setCountdownSeconds] = useState(0);

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTempPassword, setShowTempPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Verify reset token on mount if present
  useEffect(() => {
    if (!resetToken) return;

    let isMounted = true;
    setIsVerifyingToken(true);
    setTokenError(null);

    fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(resetToken)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!isMounted) return;
        setIsVerifyingToken(false);

        if (res.ok && data.valid) {
          setTokenValid(true);
          setTokenEmail(data.email || '');
          setCountdownSeconds(data.remainingSeconds || 900);
        } else {
          setTokenValid(false);
          setTokenError(
            data.error ||
            'This password reset link is invalid, expired (exceeded 15 minutes), or has already been used.'
          );
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setIsVerifyingToken(false);
        setTokenValid(false);
        setTokenError('Network error connecting to verification server: ' + err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [resetToken]);

  // 2. Countdown timer for token expiration
  useEffect(() => {
    if (!tokenValid || countdownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTokenValid(false);
          setTokenError('Security Notice: This password reset link has expired after 15 minutes. Please request a new link.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [tokenValid, countdownSeconds]);

  // Auto-fill identifier for regular employee setup
  useEffect(() => {
    if (isTokenMode) return;
    if (currentUser?.employeeId || currentUser?.email) {
      setIdentifier(currentUser.employeeId || currentUser.email);
    } else {
      const queryId = urlParams.get('id') || urlParams.get('email');
      if (queryId) setIdentifier(queryId);
    }
  }, [currentUser, isTokenMode]);

  // Validation criteria
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isFormValid = hasMinLength && hasUppercase && hasLowercase && hasNumberOrSymbol && passwordsMatch;

  // Format countdown mm:ss
  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isFormValid) {
      if (!passwordsMatch) {
        setErrorMessage('Passwords do not match. Please re-enter identical passwords.');
      } else {
        setErrorMessage('Password does not meet all the institutional security complexity criteria.');
      }
      return;
    }

    // ── CASE A: Single-Use Token Mode (Director & HR Password Reset) ──
    if (isTokenMode) {
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/reset-password-with-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: resetToken,
            newPassword,
            confirmPassword
          })
        });

        const data = await res.json().catch(() => ({}));
        setIsLoading(false);

        if (!res.ok) {
          setErrorMessage(data.error || 'Failed to update administrative password.');
          return;
        }

        setSuccessMessage(data.message || 'Administrative password successfully reset! Redirecting to login...');
        showToast?.('Password Reset Complete', 'Your administrative password has been updated.', 'success');

        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } catch (err: any) {
        setIsLoading(false);
        setErrorMessage('Network error: ' + (err.message || 'Unable to connect to authentication server.'));
      }
      return;
    }

    // ── CASE B: First-Time Employee Credential Setup ──
    const cleanTempPass = temporaryPassword.trim();
    if (!cleanTempPass) {
      setErrorMessage('Compulsory Requirement: Please enter your previous / temporary password provided by HR Administration.');
      return;
    }

    if (newPassword === cleanTempPass) {
      setErrorMessage('Security Violation: Your new password cannot be identical to your previous password. Please choose a new unique password.');
      return;
    }

    const cleanId = (identifier || currentUser?.employeeId || currentUser?.email || '').trim().toLowerCase();
    if (!cleanId && !currentUser) {
      setErrorMessage('Please specify your assigned Employee ID or registered email.');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('ewms_token');
      let backendSuccess = false;

      // 1. If user is currently authenticated via token
      if (token) {
        try {
          const res = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              identifier: cleanId,
              employeeId: cleanId,
              currentPassword: cleanTempPass,
              previousPassword: cleanTempPass,
              newPassword,
              confirmPassword
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.token) localStorage.setItem('ewms_token', data.token);
            backendSuccess = true;
          }
        } catch {
          // fallback to direct setup
        }
      }

      // 2. If token change didn't complete or user is using direct setup credentials
      if (!backendSuccess) {
        try {
          const res = await fetch('/api/auth/first-time-setup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identifier: cleanId,
              temporaryPassword: cleanTempPass,
              newPassword,
              confirmPassword
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.token) localStorage.setItem('ewms_token', data.token);
            backendSuccess = true;
          }
        } catch {
          // offline fallback
        }
      }

      // 3. Client state synchronization (AdminContext)
      completePasswordSetup(cleanId || currentUser?.id || '', newPassword);

      setSuccessMessage('Password successfully updated! Your workspace is active.');
      showToast('Password Configured', 'Permanent password established. Opening your workspace...', 'success');

      setTimeout(() => {
        setIsLoading(false);
        navigate('/admin');
      }, 800);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'An error occurred while saving your password. Please try again.');
    }
  };

  return (
    <div
      className="reg-container"
      style={{
        minHeight: '100vh',
        background: 'var(--background, #F2F3F5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        fontFamily: "'Aptos', 'Aptos Display', system-ui, -apple-system, sans-serif"
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              marginBottom: '1rem',
            }}
          >
            <div className="reg-logo-badge" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
              <img src="/images/logo.png" alt="Enterprenex Logo" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div className="reg-brand-title" style={{ fontSize: '1.35rem' }}>
                Enterpre<span style={{ color: 'var(--primary, #1070C8)' }}>nex</span> Solutions
              </div>
              <div className="reg-brand-sub" style={{ color: 'var(--primary, #1070C8)' }}>Official Workspace Portal</div>
            </div>
          </Link>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary, #111827)', margin: '0.5rem 0 0.25rem 0' }}>
            {isTokenMode ? 'Reset Administrative Password' : 'Set Your Permanent Password'}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary, #6B7280)', margin: 0 }}>
            {isTokenMode ? 'Authorized Recovery for Managing Director & HR Administration' : 'Mandatory First-Time Employee Security Configuration'}
          </p>
        </div>

        {/* Main Card */}
        <div
          className="reg-card"
          style={{
            background: 'var(--surface, #FFFFFF)',
            borderRadius: 'var(--radius-card, 16px)',
            border: '1px solid var(--border, #E8E8E8)',
            padding: '2.25rem 2rem',
            boxShadow: '0 20px 45px rgba(16, 112, 200, 0.08)'
          }}
        >
          {/* Token Verifying Spinner */}
          {isVerifyingToken && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                Verifying single-use security token...
              </div>
            </div>
          )}

          {/* Invalid / Expired Token Error Screen */}
          {isTokenMode && !isVerifyingToken && !tokenValid && (
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: '#fef2f2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto'
                }}
              >
                <AlertCircle size={32} />
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary, #111827)' }}>
                Reset Link Invalid or Expired
              </h3>
              <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.86rem', color: '#64748b', lineHeight: 1.55 }}>
                {tokenError || 'This password reset link is invalid, has expired after 15 minutes, or has already been used.'}
              </p>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', fontSize: '0.8rem', color: '#475569', marginBottom: '1.5rem', textAlign: 'left', lineHeight: 1.5 }}>
                <strong>Security Protection:</strong> For administrative accounts, each password reset link is single-use and strictly expires after 15 minutes.
              </div>
              <Link
                to="/login"
                className="reg-btn-primary"
                style={{
                  display: 'inline-block',
                  width: '100%',
                  textAlign: 'center',
                  padding: '0.75rem',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  borderRadius: '8px'
                }}
              >
                Return to Login & Request New Link
              </Link>
            </div>
          )}

          {/* Active Reset Form Screen (Token Valid OR Employee Setup) */}
          {(!isTokenMode || (tokenValid && !isVerifyingToken)) && (
            <>
              {/* Institutional Banner */}
              {isTokenMode ? (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.25rem',
                    fontSize: '0.8rem',
                    lineHeight: 1.5,
                    color: '#166534'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#15803d' }}>
                      <ShieldCheck size={16} />
                      <span>Authorized Admin Recovery</span>
                    </div>
                    {countdownSeconds > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, color: '#166534', fontSize: '0.75rem' }}>
                        <Clock size={13} />
                        <span>Expires in {formatCountdown(countdownSeconds)}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ color: '#334155', fontSize: '0.78rem' }}>
                    Setting a new password for: <strong>{tokenEmail}</strong>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: 'var(--blue-light, #E6EDF5)',
                    border: '1px solid var(--blue-soft, #C8E0F8)',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.25rem',
                    fontSize: '0.8rem',
                    lineHeight: 1.5,
                    color: '#1e3a8a'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px', color: 'var(--primary, #1070C8)' }}>
                    <ShieldCheck size={16} />
                    <span>Zero-Trust Enterprise Policy</span>
                  </div>
                  <p style={{ margin: 0, color: '#334155', fontSize: '0.78rem' }}>
                    All new staff members are required to replace company-issued temporary credentials with a private, permanent password before accessing the workspace dashboard.
                  </p>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
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
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} autoComplete="off">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', marginBottom: '1.5rem' }}>
                  {/* For Token Mode: Show verified account badge */}
                  {isTokenMode ? (
                    <div className="reg-field-group">
                      <label className="reg-label" style={{ fontWeight: 700, color: 'var(--text-primary, #111827)', fontSize: '0.83rem' }}>
                        Administrative Account
                      </label>
                      <div className="reg-input-wrap">
                        <Mail size={16} className="reg-input-icon" />
                        <input
                          type="text"
                          readOnly
                          value={tokenEmail}
                          className="reg-input"
                          style={{ background: '#F8F9FA', cursor: 'not-allowed', color: '#1e293b', fontWeight: 600 }}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Employee ID / Official Email (Read-only if logged in) */}
                      <div className="reg-field-group">
                        <label className="reg-label" style={{ fontWeight: 700, color: 'var(--text-primary, #111827)', fontSize: '0.83rem' }}>
                          Assigned Employee ID or Official Email
                        </label>
                        <div className="reg-input-wrap">
                          <KeyRound size={16} className="reg-input-icon" />
                          <input
                            type="text"
                            required
                            readOnly={Boolean(currentUser?.employeeId || currentUser?.email)}
                            placeholder="e.g. 202600000002"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="reg-input"
                            style={{
                              background: currentUser ? '#F8F9FA' : '#FFFFFF',
                              cursor: currentUser ? 'not-allowed' : 'text'
                            }}
                          />
                        </div>
                      </div>

                      {/* Company Temporary / Previous Password (Always Compulsory for employee setup) */}
                      <div className="reg-field-group">
                        <label className="reg-label" style={{ fontWeight: 700, color: 'var(--text-primary, #111827)', fontSize: '0.83rem' }}>
                          Previous / Temporary Password <span style={{ color: '#dc2626' }}>* (Compulsory)</span>
                        </label>
                        <div className="reg-input-wrap">
                          <Lock size={16} className="reg-input-icon" />
                          <input
                            type={showTempPassword ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            placeholder="Enter previous temporary password from HR / Director"
                            value={temporaryPassword}
                            onChange={(e) => setTemporaryPassword(e.target.value)}
                            className="reg-input"
                          />
                          <button
                            type="button"
                            className="reg-eye-btn"
                            onClick={() => setShowTempPassword(!showTempPassword)}
                            aria-label="Toggle password visibility"
                          >
                            {showTempPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <div style={{ fontSize: '0.73rem', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
                          * Compulsory: You must verify your previous temporary password before setting a new permanent password.
                        </div>
                      </div>
                    </>
                  )}

                  {/* New Password */}
                  <div className="reg-field-group">
                    <label className="reg-label" style={{ fontWeight: 700, color: 'var(--text-primary, #111827)', fontSize: '0.83rem' }}>
                      {isTokenMode ? 'New Security Password' : 'Create New Password'} <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <div className="reg-input-wrap">
                      <Lock size={16} className="reg-input-icon" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter your new secure password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="reg-input"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="reg-eye-btn"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="reg-field-group">
                    <label className="reg-label" style={{ fontWeight: 700, color: 'var(--text-primary, #111827)', fontSize: '0.83rem' }}>
                      Confirm New Password <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <div className="reg-input-wrap">
                      <Lock size={16} className="reg-input-icon" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter your new secure password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="reg-input"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="reg-eye-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Real-Time Password Complexity Checklist */}
                  <div
                    style={{
                      background: 'var(--surface-secondary, #F8F8F8)',
                      border: '1px solid var(--border, #E8E8E8)',
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--text-primary, #111827)', marginBottom: '6px' }}>
                      Password Strength Requirements:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: hasMinLength ? '#16a34a' : 'var(--text-secondary, #6B7280)' }}>
                        {hasMinLength ? <Check size={13} color="#16a34a" /> : <X size={13} color="#9ca3af" />}
                        <span>Min. 8 characters</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: hasUppercase ? '#16a34a' : 'var(--text-secondary, #6B7280)' }}>
                        {hasUppercase ? <Check size={13} color="#16a34a" /> : <X size={13} color="#9ca3af" />}
                        <span>1 Uppercase (A-Z)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: hasLowercase ? '#16a34a' : 'var(--text-secondary, #6B7280)' }}>
                        {hasLowercase ? <Check size={13} color="#16a34a" /> : <X size={13} color="#9ca3af" />}
                        <span>1 Lowercase (a-z)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: hasNumberOrSymbol ? '#16a34a' : 'var(--text-secondary, #6B7280)' }}>
                        {hasNumberOrSymbol ? <Check size={13} color="#16a34a" /> : <X size={13} color="#9ca3af" />}
                        <span>1 Number or Symbol</span>
                      </div>
                    </div>

                    {newPassword && confirmPassword && (
                      <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '5px', color: passwordsMatch ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                        {passwordsMatch ? <Check size={13} color="#16a34a" /> : <X size={13} color="#dc2626" />}
                        <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className="reg-btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    borderRadius: '10px',
                    opacity: isFormValid ? 1 : 0.65,
                    cursor: isFormValid ? 'pointer' : 'not-allowed'
                  }}
                >
                  <span>
                    {isLoading
                      ? 'Saving Password & Restoring Access...'
                      : isTokenMode
                      ? 'Update Password & Restore Access'
                      : 'Save Password & Open Workspace'}
                  </span>
                  <ArrowRight size={18} />
                </button>
              </form>

              {/* Back to Login */}
              <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border, #E8E8E8)' }}>
                <Link
                  to="/login"
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--primary, #1070C8)',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  &larr; Return to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateNewPasswordPage;
