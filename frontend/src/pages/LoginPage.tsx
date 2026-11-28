import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Home,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  Phone
} from 'lucide-react';
import { useAdmin } from '../admin/context/AdminContext';
import type { UserRole } from '../admin/types';
import { EmployeeTermsModal } from '../components/EmployeeTermsModal';
import './register/register.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, employees, updateEmployee, showToast } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);

  // Progressive countdown timer for temporary security lockouts
  React.useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setErrorMessage(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Employee Account Activation States
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activateId, setActivateId] = useState('');
  const [activatePreviousPassword, setActivatePreviousPassword] = useState('');
  const [activatePassword, setActivatePassword] = useState('');
  const [activateConfirmPassword, setActivateConfirmPassword] = useState('');
  const [showActivatePrevPassword, setShowActivatePrevPassword] = useState(false);
  const [showActivatePassword, setShowActivatePassword] = useState(false);
  const [showActivateConfirmPassword, setShowActivateConfirmPassword] = useState(false);
  const [activateError, setActivateError] = useState<string | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  // Forgot Password Self-Service Recovery States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotVerification, setForgotVerification] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [showForgotConfirmPass, setShowForgotConfirmPass] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    const cleanId = forgotIdentifier.trim();
    const cleanVerif = forgotVerification.trim();
    const cleanPass = forgotPassword.trim();
    const cleanConfirm = forgotConfirmPassword.trim();

    if (!cleanId || !cleanVerif || !cleanPass || !cleanConfirm) {
      setForgotError('Please fill in all recovery fields.');
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setForgotError('New password and confirmation do not match.');
      return;
    }

    if (cleanPass.length < 8) {
      setForgotError('Password must be at least 8 characters long with uppercase, lowercase, and numbers/symbols.');
      return;
    }

    setIsForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanId,
          phoneOrEmail: cleanVerif,
          newPassword: cleanPass,
          confirmPassword: cleanConfirm
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setIsForgotLoading(false);
        setForgotError(data.error || 'Failed to verify employee details. Please contact HR Administration.');
        return;
      }

      setIsForgotLoading(false);
      setShowForgotModal(false);
      setLockoutSeconds(0); // Immediately lift any temporary lockout
      setErrorMessage(null);
      setStatusMessage('Password reset successfully! Security restriction cleared. You may now sign in.');
      setEmail(cleanId);
      setPassword('');
      showToast?.('Password reset successful. Account restriction lifted.', 'success');
    } catch (err: any) {
      setIsForgotLoading(false);
      setForgotError('Network error: ' + (err.message || 'Unable to connect to authentication server.'));
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) {
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please review and agree to the Employee Terms & Conditions before signing in.');
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    const rawInput = email.trim();
    const inputPassword = password.trim();

    if (!rawInput || !inputPassword) {
      setIsLoading(false);
      setErrorMessage('Please provide both your official identifier and security password.');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: rawInput, password: inputPassword })
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429) {
        setIsLoading(false);
        const retrySec = data.retryAfter || (data.lockoutMinutes ? data.lockoutMinutes * 60 : 900);
        setLockoutSeconds(retrySec);
        setErrorMessage(null); // Eliminate dual banner: single countdown banner displays when lockoutSeconds > 0
        return;
      }

      if (!res.ok) {
        setIsLoading(false);
        const remAttempts = data.remainingAttempts !== undefined ? data.remainingAttempts : data.attemptsRemaining;
        if (remAttempts !== undefined && remAttempts <= 3 && remAttempts > 0) {
          setErrorMessage(`Invalid credentials. Please verify your official email or 12-digit Employee ID, and password. Warning: ${remAttempts} attempt(s) remaining before 15-minute temporary lockout.`);
        } else {
          setErrorMessage(data.error || 'Invalid credentials. Please verify your official email or 12-digit Employee ID, and password.');
        }
        return;
      }

      // Success
      if (data.token) {
        localStorage.setItem('ewms_token', data.token);
      }
      setIsLoading(false);
      const userObj = data.user;
      const mustChange = Boolean(data.mustChangePassword || userObj?.mustChangePassword);

      login({
        id: userObj.id,
        name: userObj.name,
        email: userObj.email,
        role: (userObj.role as UserRole) || 'Team Member',
        avatar: userObj.avatar,
        department: userObj.department,
        status: 'Active',
        lastLogin: 'Just now',
        employeeId: userObj.employeeId,
        mustChangePassword: mustChange
      });

      if (mustChange) {
        setStatusMessage(`Welcome ${userObj.name}! Initial credentials verified. Redirecting to mandatory password setup...`);
        setTimeout(() => navigate('/create-new-password'), 500);
      } else {
        setStatusMessage(`Authenticated successfully as ${userObj.name}. Opening Workspace...`);
        setTimeout(() => navigate('/admin'), 500);
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Unable to connect to authentication server. Please check your connection and try again.');
    }
  };

  const handleActivateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActivateError(null);
    setIsActivating(true);

    const cleanId = activateId.trim().toLowerCase();
    const cleanPrevPass = activatePreviousPassword.trim();

    if (!cleanId) {
      setIsActivating(false);
      setActivateError('Please enter your assigned Employee ID or official email.');
      return;
    }

    // COMPULSORY CHECK: Previous / Temporary password is required
    if (!cleanPrevPass) {
      setIsActivating(false);
      setActivateError('Compulsory Requirement: Please enter your previous / temporary password provided by HR or Director.');
      return;
    }

    if (!activatePassword) {
      setIsActivating(false);
      setActivateError('Please enter your new permanent password.');
      return;
    }

    if (activatePassword.length < 8) {
      setIsActivating(false);
      setActivateError('Password must be at least 8 characters long in compliance with Enterprenex security policies.');
      return;
    }

    if (activatePassword !== activateConfirmPassword) {
      setIsActivating(false);
      setActivateError('Passwords do not match. Please re-enter identical passwords.');
      return;
    }

    if (activatePassword === cleanPrevPass) {
      setIsActivating(false);
      setActivateError('Security Violation: Your new password cannot be identical to your previous temporary password. Please create a new unique password.');
      return;
    }

    // MANDATORY RULE: Employees cannot create their own accounts or IDs.
    // The account MUST already be created and granted by the Director or HR.
    const matchedEmp = employees.find(
      (emp) =>
        (emp.employeeId && emp.employeeId.toLowerCase() === cleanId) ||
        emp.id.toLowerCase() === cleanId ||
        (emp.email && emp.email.toLowerCase() === cleanId)
    );

    if (!matchedEmp) {
      setIsActivating(false);
      setActivateError(
        `Access Denied: No pre-existing account found for '${activateId}'. Employees cannot create their own IDs or register accounts. An account must first be created and provisioned by the Managing Director or HR Administration. Please contact HR to set up your profile.`
      );
      return;
    }

    // Verify Previous / Temporary Password against employee record
    const empPass = (matchedEmp.password || '').trim();
    const tempPass = (matchedEmp.temporaryPassword || '').trim();
    const isPrevValid =
      cleanPrevPass === empPass ||
      (tempPass && cleanPrevPass === tempPass);

    if (!isPrevValid) {
      setIsActivating(false);
      setActivateError(
        'Access Denied: The previous / temporary password you entered is incorrect. You must provide the exact temporary password issued by HR Administration.'
      );
      return;
    }

    // If account was created by HR, check if Director approval is pending
    if (matchedEmp.approvalStatus === 'Pending Director Approval') {
      setIsActivating(false);
      setActivateError(
        `Account Pending Approval: Employee ID ${matchedEmp.employeeId || matchedEmp.name} has been registered by HR and is awaiting executive authorization from Managing Director. Portal activation will be enabled once the Director approves.`
      );
      return;
    }

    if (matchedEmp.approvalStatus === 'Rejected' || matchedEmp.status === 'Terminated' || matchedEmp.status === 'Resigned') {
      setIsActivating(false);
      setActivateError(
        `Access Denied: This employee record has been marked as ${matchedEmp.status || 'Rejected'} by corporate administration. Please contact HR Administration.`
      );
      return;
    }

    // Update employee password and status
    updateEmployee(matchedEmp.id, {
      password: activatePassword,
      temporaryPassword: undefined,
      mustChangePassword: false,
      status: 'Active'
    });

    // Sync with backend API if accessible
    try {
      fetch('/api/auth/first-time-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanId,
          temporaryPassword: cleanPrevPass,
          newPassword: activatePassword,
          confirmPassword: activateConfirmPassword
        })
      }).catch(() => {});
    } catch {
      // ignore
    }

    setTimeout(() => {
      setIsActivating(false);
      setShowActivationModal(false);
      showToast('Account Activated', `Welcome to Enterprenex, ${matchedEmp.name}! Your workspace is active.`, 'success');

      login({
        id: matchedEmp.id,
        name: matchedEmp.name,
        email: matchedEmp.email,
        role: 'Team Member',
        avatar: matchedEmp.avatar,
        department: matchedEmp.department,
        status: 'Active',
        lastLogin: 'Just now',
        phone: matchedEmp.phone || '+91-9226860060',
        employeeId: matchedEmp.employeeId,
        mustChangePassword: false
      });

      navigate('/admin');
    }, 600);
  };

  return (
    <div className="reg-container" style={{ justifyContent: 'center', alignItems: 'center', padding: '2.5rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
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

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary, #111827)', margin: '0.5rem 0 0.25rem 0' }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary, #6B7280)', margin: 0 }}>
            Sign in using credentials provided by HR Administration
          </p>
        </div>

        {/* Card */}
        <div className="reg-card" style={{ padding: '2.25rem 2rem' }}>

          {statusMessage && (
            <div
              style={{
                background: 'var(--blue-light, #E6EDF5)',
                border: '1px solid var(--blue-soft, #C8E0F8)',
                color: 'var(--primary, #1070C8)',
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

          {/* Mutually exclusive banners: When lockoutSeconds > 0, show ONLY the calm, reassuring 15-minute countdown banner */}
          {lockoutSeconds > 0 ? (
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#92400e',
                padding: '0.9rem 1rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                marginBottom: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
            >
              <AlertCircle size={18} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ fontWeight: 700, color: '#92400e' }}>
                  Temporary Security Lockout Active
                </div>
                <div style={{ color: '#78350f', fontSize: '0.82rem', lineHeight: 1.45 }}>
                  Login is temporarily paused for 15 minutes due to 4 consecutive incorrect attempts.
                  Retry allowed in <strong>{Math.floor(lockoutSeconds / 60)}m {lockoutSeconds % 60}s</strong>. Access will be automatically restored.
                </div>
                <div style={{ marginTop: '4px', fontSize: '0.8rem' }}>
                  Forgot your password?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setForgotIdentifier(email);
                      setForgotError(null);
                      setShowForgotModal(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--primary, #1070C8)',
                      fontWeight: 700,
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                  >
                    Reset password securely now
                  </button>
                </div>
              </div>
            </div>
          ) : errorMessage ? (
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
          ) : null}

          {/* Form */}
          <form onSubmit={handleLoginSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', marginBottom: '1.5rem' }}>
              {/* Official Email or Employee ID */}
              <div className="reg-field-group">
                <label className="reg-label" style={{ fontWeight: 700, color: '#334155', fontSize: '0.85rem' }}>
                  Official Email or Employee ID
                </label>
                <div className="reg-input-wrap">
                  <Mail size={16} className="reg-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your registered email or 12-digit Employee ID"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="reg-input"
                    autoComplete="username"
                  />
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                  Enter credentials provided by Enterprenex HR Administration
                </div>
              </div>

              {/* Password */}
              <div className="reg-field-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="reg-label" style={{ fontWeight: 700, color: '#334155', fontSize: '0.85rem' }}>
                    Security Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotIdentifier(email);
                      setForgotError(null);
                      setShowForgotModal(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.78rem',
                      color: 'var(--primary, #1070C8)',
                      fontWeight: 600,
                      textDecoration: 'none',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Forgot password?
                  </button>
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
                    autoComplete="current-password"
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

              {/* Remember me & Terms */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div className="reg-checkbox-wrap" style={{ margin: 0 }}>
                  <input
                    type="checkbox"
                    id="remember-login"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-login" style={{ fontSize: '0.825rem', color: 'var(--text-secondary, #6B7280)' }}>
                    Keep me signed in
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    id="employee-terms-checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{ width: '15px', height: '15px', accentColor: 'var(--primary, #1070C8)', cursor: 'pointer' }}
                  />
                  <label htmlFor="employee-terms-checkbox" style={{ color: 'var(--text-secondary, #6B7280)', cursor: 'pointer', fontSize: '0.825rem' }}>
                    I agree to{' '}
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
                        fontSize: '0.825rem',
                        padding: 0
                      }}
                    >
                      Terms & Policies
                    </button>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || lockoutSeconds > 0}
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
                borderRadius: '10px'
              }}
            >
              <span>{lockoutSeconds > 0 ? `Sign-in Paused (${Math.floor(lockoutSeconds / 60)}m ${lockoutSeconds % 60}s)` : isLoading ? 'Verifying RBAC Credentials...' : 'Sign In to Workspace Portal'}</span>
              <ArrowRight size={18} />
            </button>
            {/* First-time Employee Account Activation Trigger */}
            <div style={{ marginTop: '1.25rem', textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border, #E8E8E8)' }}>
              <button
                type="button"
                onClick={() => {
                  setActivateError(null);
                  setShowActivationModal(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary, #1070C8)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>First-time Employee? Activate Account & Set Password &rarr;</span>
              </button>
            </div>
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

        {/* Terms and Conditions Modal */}
        {showTermsModal && (
          <EmployeeTermsModal
            onClose={() => setShowTermsModal(false)}
            onAccept={() => setAgreeTerms(true)}
          />
        )}

        {/* Employee Account Activation Modal */}
        {showActivationModal && (
          <div className="adm-modal-overlay" onClick={() => setShowActivationModal(false)}>
            <div
              className="adm-modal"
              onClick={e => e.stopPropagation()}
              style={{
                maxWidth: '480px',
                background: 'var(--surface, #FFFFFF)',
                borderRadius: '16px',
                padding: '1.75rem',
                border: '1px solid var(--border, #E8E8E8)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.18)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'var(--blue-light, #E6EDF5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary, #1070C8)'
                    }}
                  >
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary, #111827)' }}>
                      Activate Employee Workspace
                    </h3>
                    <div style={{ fontSize: '0.74rem', color: 'var(--primary, #1070C8)', fontWeight: 600 }}>
                      Pre-Provisioned Corporate Accounts Only
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowActivationModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary, #6B7280)', fontSize: '1.25rem', padding: '4px' }}
                >
                  ✕
                </button>
              </div>

              {/* Strict Institutional Policy Notice */}
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
                  <ShieldCheck size={15} />
                  <span>Director & HR Pre-Authorization Required</span>
                </div>
                <p style={{ margin: 0, color: '#334155', fontSize: '0.78rem' }}>
                  Employees <strong>cannot</strong> create their own IDs. Only the <strong>Director</strong> or <strong>HR Administration</strong> can create employee accounts and grant portal access. If your account has already been registered by management, enter your assigned ID or official email below to set your permanent password.
                </p>
              </div>

              {activateError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    lineHeight: 1.45
                  }}
                >
                  <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>{activateError}</div>
                </div>
              )}

              <form onSubmit={handleActivateAccountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary, #111827)', display: 'block', marginBottom: '4px' }}>
                    Assigned 12-Digit Employee ID or Official Email <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 202600000002 or name@enterprenex.com"
                    className="reg-input"
                    value={activateId}
                    onChange={e => setActivateId(e.target.value)}
                    style={{ width: '100%' }}
                  />
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary, #6B7280)', marginTop: '4px' }}>
                    Must match an existing profile already created by Director or HR.
                  </div>
                </div>

                {/* COMPULSORY PREVIOUS / TEMPORARY PASSWORD */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary, #111827)', display: 'block', marginBottom: '4px' }}>
                    Previous / Temporary Password <span style={{ color: '#dc2626' }}>* (Compulsory)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showActivatePrevPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter previous temporary password from HR..."
                      className="reg-input"
                      value={activatePreviousPassword}
                      onChange={e => setActivatePreviousPassword(e.target.value)}
                      style={{ width: '100%', paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowActivatePrevPassword(!showActivatePrevPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary, #6B7280)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      aria-label="Toggle password visibility"
                    >
                      {showActivatePrevPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div style={{ fontSize: '0.73rem', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
                    * Compulsory: You must enter the temporary password provided by HR to verify identity.
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary, #111827)', display: 'block', marginBottom: '4px' }}>
                    New Secure Password (Min. 8 Characters) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showActivatePassword ? 'text' : 'password'}
                      required
                      placeholder="Create strong permanent password..."
                      className="reg-input"
                      value={activatePassword}
                      onChange={e => setActivatePassword(e.target.value)}
                      style={{ width: '100%', paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowActivatePassword(!showActivatePassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary, #6B7280)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      aria-label="Toggle password visibility"
                    >
                      {showActivatePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary, #111827)', display: 'block', marginBottom: '4px' }}>
                    Confirm New Password <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showActivateConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter new permanent password..."
                      className="reg-input"
                      value={activateConfirmPassword}
                      onChange={e => setActivateConfirmPassword(e.target.value)}
                      style={{ width: '100%', paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowActivateConfirmPassword(!showActivateConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary, #6B7280)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      aria-label="Toggle password visibility"
                    >
                      {showActivateConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="adm-btn adm-btn-secondary"
                    onClick={() => setShowActivationModal(false)}
                    style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isActivating}
                    className="reg-btn-primary"
                    style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '8px' }}
                  >
                    {isActivating ? 'Verifying Account...' : 'Set Password & Activate'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Forgot Password Self-Service Recovery Modal */}
        {showForgotModal && (
          <div className="adm-modal-overlay" onClick={() => setShowForgotModal(false)}>
            <div
              className="adm-modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '480px',
                background: 'var(--surface, #FFFFFF)',
                borderRadius: '16px',
                padding: '1.75rem',
                border: '1px solid var(--border, #E8E8E8)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.18)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'var(--blue-light, #E6EDF5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary, #1070C8)'
                    }}
                  >
                    <KeyRound size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary, #111827)' }}>
                      Reset Security Password
                    </h3>
                    <div style={{ fontSize: '0.74rem', color: 'var(--primary, #1070C8)', fontWeight: 600 }}>
                      Self-Service Password Recovery
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary, #6B7280)', fontSize: '1.25rem', padding: '4px' }}
                >
                  ✕
                </button>
              </div>

              {/* Lockout clearance notice */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.8rem',
                  lineHeight: 1.45,
                  color: '#166534'
                }}
              >
                <strong>Security Protection:</strong> Resetting your password securely clears any temporary login restriction immediately so you can sign in without waiting for the 15-minute countdown.
              </div>

              {forgotError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    marginBottom: '1rem'
                  }}
                >
                  {forgotError}
                </div>
              )}

              <form onSubmit={handleForgotPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary, #111827)', display: 'block', marginBottom: '4px' }}>
                    Official Email or Employee ID <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. employee@enterprenexsolution.com or 202600000001"
                      className="reg-input"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      style={{ width: '100%', paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary, #111827)', display: 'block', marginBottom: '4px' }}>
                    Registered Phone Number or Secondary Email <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      required
                      placeholder="Enter registered mobile number or personal email"
                      className="reg-input"
                      value={forgotVerification}
                      onChange={(e) => setForgotVerification(e.target.value)}
                      style={{ width: '100%', paddingLeft: '2.5rem' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
                    Used strictly to verify your identity against company records
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary, #111827)', display: 'block', marginBottom: '4px' }}>
                    New Password <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type={showForgotPass ? 'text' : 'password'}
                      required
                      placeholder="Min 8 characters (uppercase, lowercase, number/symbol)"
                      className="reg-input"
                      value={forgotPassword}
                      onChange={(e) => setForgotPassword(e.target.value)}
                      style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotPass(!showForgotPass)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary, #6B7280)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      aria-label="Toggle password visibility"
                    >
                      {showForgotPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary, #111827)', display: 'block', marginBottom: '4px' }}>
                    Confirm New Password <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type={showForgotConfirmPass ? 'text' : 'password'}
                      required
                      placeholder="Re-enter your new password"
                      className="reg-input"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirmPass(!showForgotConfirmPass)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary, #6B7280)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      aria-label="Toggle password visibility"
                    >
                      {showForgotConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="adm-btn adm-btn-secondary"
                    onClick={() => setShowForgotModal(false)}
                    style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="reg-btn-primary"
                    style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '8px' }}
                  >
                    {isForgotLoading ? 'Resetting Password...' : 'Reset Password & Restore Access'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
