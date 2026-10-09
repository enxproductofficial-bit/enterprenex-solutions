import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Home,
  Globe,
  Check,
  Shield,
  Briefcase,
  Code2,
  Users,
  User,
  Building,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Tag,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import './register/register.css';

export type RoleType = 'director' | 'employee' | 'manager';

interface RoleInfo {
  id: RoleType;
  title: string;
  badge: string;
  roleHighlight: string;
  desc: string;
  boxText: string;
  features: string[];
}

const ROLES: RoleInfo[] = [
  {
    id: 'director',
    title: 'Director',
    badge: 'Executive Governance',
    roleHighlight: 'Director account',
    desc: 'For executive leadership, board members, and directors steering company strategy, compliance, and enterprise growth.',
    boxText: 'Executive dashboard, board oversight, strategic P&L management, and corporate authorization.',
    features: [
      'Full enterprise governance',
      'Financial oversight & P&L',
      'Company-wide audit & compliance',
      'Strategic roadmaps & approvals',
    ],
  },
  {
    id: 'employee',
    title: 'Employee',
    badge: 'Engineering & Delivery',
    roleHighlight: 'Employee account',
    desc: 'For software developers, engineers, designers, and specialists executing client projects and product deliverables.',
    boxText: 'Project sprints, timesheet tracking, code repository integration, and milestone deliverables.',
    features: [
      'Project sprints & task boards',
      'Timesheet & daily work logs',
      'Direct collaboration & tickets',
      'Performance & milestone tracker',
    ],
  },
  {
    id: 'manager',
    title: 'Manager (Includes HR)',
    badge: 'Operations & HR Management',
    roleHighlight: 'Manager & HR account',
    desc: 'For department managers, team leads, project managers, and HR administrators coordinating people and workflows.',
    boxText: 'Team supervision, HR policies, onboarding/offboarding, leave approvals, and resource allocation.',
    features: [
      'Comprehensive HR & People operations',
      'Team velocity & sprint planning',
      'Leave, payroll & performance approvals',
      'Resource allocation & client coordination',
    ],
  },
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // Current Step: 1 to 5
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English - English');
  const [selectedRole, setSelectedRole] = useState<RoleType>('director');
  
  const [fullName, setFullName] = useState<string>('');
  const [organization, setOrganization] = useState<string>('Enterprenex Solutions');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [country, setCountry] = useState<string>('India');
  const [referralCode, setReferralCode] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // OTP State (Step 4)
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string>('849201');
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [otpDeliveryStatus, setOtpDeliveryStatus] = useState<'idle' | 'delivered' | 'sandbox_mode'>('idle');
  const [otpTimer, setOtpTimer] = useState<number>(54);
  const [otpResent, setOtpResent] = useState<boolean>(false);

  // Active Role Object
  const currentRoleData = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  const handleNextFromStep1 = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep2 = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dispatchOtpEmail = async (targetEmail: string, code: string) => {
    setIsSendingOtp(true);
    const apiKey = import.meta.env.VITE_RESEND_API_KEY;
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: 'Enterprenex Solutions <onboarding@resend.dev>',
          to: [targetEmail.trim()],
          subject: `🔐 Your Enterprenex Verification Code: ${code}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px; max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
              <h2 style="color: #0f172a; margin-top: 0; font-size: 22px;">Enterprenex Solutions</h2>
              <p style="color: #475569; font-size: 15px;">Hello <strong>${fullName || 'Colleague'}</strong>,</p>
              <p style="color: #475569; font-size: 15px;">Use the following 6-digit one-time verification code to activate your <strong>${currentRoleData.title}</strong> workspace:</p>
              <div style="background: #ecfdf5; border: 2px dashed #059669; padding: 18px; border-radius: 12px; text-align: center; margin: 24px 0;">
                <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #047857; font-family: monospace;">${code}</span>
              </div>
              <p style="color: #64748b; font-size: 13px;">This security code will expire in 10 minutes. If you did not request this registration, you can safely ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">Enterprenex Solutions Pvt Ltd • Enterprise Workspace Platform</p>
            </div>
          `,
        }),
      });

      await res.json().catch(() => ({}));
      if (res.ok) {
        setOtpDeliveryStatus('delivered');
      } else {
        // Resend sandbox limitation or unverified domain
        setOtpDeliveryStatus('sandbox_mode');
      }
    } catch {
      setOtpDeliveryStatus('sandbox_mode');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleNextFromStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid work email address.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Please enter your phone number.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setFormError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    // Generate random 6-digit code
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newCode);

    // Send email
    dispatchOtpEmail(email, newCode);

    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      setFormError('Please enter the complete 6-digit verification code.');
      return;
    }

    // Allow generated OTP or master development code '123456'
    if (fullCode === generatedOtp || fullCode === '123456') {
      setFormError('');
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setFormError(`Invalid verification code. Please enter ${generatedOtp} (or 123456 for test).`);
    }
  };

  const handleResendOtp = () => {
    setOtp(['', '', '', '', '', '']);
    setOtpTimer(60);
    setOtpResent(true);
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newCode);
    dispatchOtpEmail(email, newCode);
    setTimeout(() => setOtpResent(false), 3000);
  };

  const handleBack = () => {
    if (currentStep > 1 && currentStep < 5) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <div className="reg-container">
      {/* Top Header */}
      <header className="reg-header">
        <Link to="/" className="reg-brand" aria-label="Enterprenex Solutions">
          <div className="reg-logo-badge">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="reg-brand-title">
              Enterpre<span style={{ color: '#059669' }}>nex</span> Solutions
            </div>
            <div className="reg-brand-sub">Enterprise Workspace Portal</div>
          </div>
        </Link>

        <div className="reg-header-actions">
          <button type="button" onClick={handleBack} className="reg-btn-nav">
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <Link to="/" className="reg-btn-nav">
            <Home size={16} />
            <span>Home</span>
          </Link>

          <div className="reg-lang-select">
            <Globe size={15} color="#059669" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              aria-label="Select application language"
            >
              <option value="English - English">English - English</option>
              <option value="Hindi - हिन्दी">Hindi - हिन्दी</option>
              <option value="Spanish - Español">Spanish - Español</option>
              <option value="German - Deutsch">German - Deutsch</option>
            </select>
          </div>
        </div>
      </header>

      {/* Stepper Progress Bar (Steps 1 to 5) */}
      <div className="reg-stepper-wrap">
        <div className="reg-stepper-card">
          <div className="reg-step-line">
            <div
              className="reg-step-line-progress"
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />
          </div>

          {[
            { step: 1, label: 'Language' },
            { step: 2, label: 'Account Type' },
            { step: 3, label: 'Create Account' },
            { step: 4, label: 'Verify OTP' },
            { step: 5, label: 'Complete' },
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;

            return (
              <div
                key={item.step}
                className={`reg-step-item ${isActive ? 'active' : ''} ${
                  isCompleted ? 'completed' : ''
                }`}
              >
                <div className="reg-step-circle">
                  {isCompleted ? <Check size={18} /> : item.step}
                </div>
                <div className="reg-step-label">{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form Content */}
      <main className="reg-main-content">
        {/* ========================================================================= */}
        {/* STEP 1: LANGUAGE SELECTION (Matches Photo 2)                             */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="reg-card" style={{ maxWidth: '640px', margin: '0 auto' }}>
            <span className="reg-badge-step">STEP 1</span>
            <h1 className="reg-title">Select application language</h1>
            <p className="reg-subtitle">
              This language is saved to your account and used automatically whenever you sign in to Enterprenex Solutions.
            </p>

            <div style={{ marginBottom: '2rem' }}>
              <label
                htmlFor="language-select"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.5rem',
                }}
              >
                Language
              </label>

              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                }}
              >
                <Globe size={18} color="#059669" style={{ marginRight: '0.75rem' }} />
                <select
                  id="language-select"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <option value="English - English">English - English</option>
                  <option value="Hindi - हिन्दी">Hindi - हिन्दी</option>
                  <option value="Spanish - Español">Spanish - Español</option>
                  <option value="German - Deutsch">German - Deutsch</option>
                  <option value="French - Français">French - Français</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextFromStep1}
              className="reg-btn-primary"
            >
              <span>Continue</span>
              <ArrowRight size={18} />
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: '#64748b' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}
              >
                Login to Your Account
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: ACCOUNT TYPE / 3 ROLES (Matches Photo 3)                          */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="reg-card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <span className="reg-badge-step">STEP 2</span>
                <h1 className="reg-title" style={{ fontSize: '1.65rem' }}>
                  Choose your account workspace
                </h1>
                <p className="reg-subtitle" style={{ marginBottom: 0 }}>
                  Choose the workspace that best matches your official role at <strong>Enterprenex Solutions</strong>.
                </p>
              </div>

              <div
                style={{
                  background: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                }}
              >
                Selected: {currentRoleData.title}
              </div>
            </div>

            {/* 3 Role Cards: Director, Employee, Manager (HR) */}
            <div className="reg-roles-grid">
              {ROLES.map((role) => {
                const isSelected = selectedRole === role.id;
                return (
                  <div
                    key={role.id}
                    className={`reg-role-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <div className="reg-role-check">
                      {isSelected && <Check size={14} />}
                    </div>

                    <span className="reg-role-badge">{role.badge}</span>

                    <div className="reg-role-icon">
                      {role.id === 'director' && <Shield size={26} />}
                      {role.id === 'employee' && <Code2 size={26} />}
                      {role.id === 'manager' && <Users size={26} />}
                    </div>

                    <h2 className="reg-role-title">{role.title}</h2>
                    <p className="reg-role-desc">{role.desc}</p>

                    <div className="reg-role-highlight-box">{role.boxText}</div>

                    <ul className="reg-role-features">
                      {role.features.map((feat, idx) => (
                        <li key={idx} className="reg-role-feature-item">
                          <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Verification notice bar (matches Photo 3) */}
            <div className="reg-notice-banner">
              <div className="reg-notice-text">
                <Shield size={22} color="#059669" style={{ flexShrink: 0 }} />
                <div>
                  <strong>Email verification is required for every account</strong>
                  <div style={{ fontSize: '0.8rem', color: '#15803d' }}>
                    A one-time password will be sent before the workspace is activated.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextFromStep2}
                className="reg-btn-primary"
                style={{ width: 'auto', padding: '0.65rem 1.5rem', whiteSpace: 'nowrap' }}
              >
                <span>Continue</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: CREATE ACCOUNT DETAILS (Matches Photo 4)                         */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="reg-split-layout">
            {/* Left Column: Form */}
            <div className="reg-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="reg-badge-step">STEP 3</span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#059669',
                    fontWeight: 700,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Change role
                </button>
              </div>

              <h1 className="reg-title" style={{ fontSize: '1.65rem' }}>
                Create account details
              </h1>
              <p className="reg-subtitle" style={{ marginBottom: '1.25rem' }}>
                Add the information needed for secure onboarding and role-based routing at <strong>Enterprenex Solutions</strong>.
              </p>

              {/* Role pill badge row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Workspace</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                    {currentRoleData.title}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Verification</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>Email OTP</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Access</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#059669' }}>Instant setup</div>
                </div>
              </div>

              {formError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    marginBottom: '1.25rem',
                  }}
                >
                  {formError}
                </div>
              )}

              <form onSubmit={handleNextFromStep3}>
                <div className="reg-form-grid">
                  {/* Full Name */}
                  <div className="reg-field-group">
                    <label className="reg-label">Full Name</label>
                    <div className="reg-input-wrap">
                      <User size={16} className="reg-input-icon" />
                      <input
                        type="text"
                        required
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="reg-input"
                      />
                    </div>
                  </div>

                  {/* Organization Name */}
                  <div className="reg-field-group">
                    <label className="reg-label">Organization / Company Name</label>
                    <div className="reg-input-wrap">
                      <Building size={16} className="reg-input-icon" />
                      <input
                        type="text"
                        required
                        placeholder="Enterprenex Solutions"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="reg-input"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="reg-field-group">
                    <label className="reg-label">Email Address</label>
                    <div className="reg-input-wrap">
                      <Mail size={16} className="reg-input-icon" />
                      <input
                        type="email"
                        required
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="reg-input"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="reg-field-group">
                    <label className="reg-label">Phone Number</label>
                    <div className="reg-input-wrap">
                      <Phone size={16} className="reg-input-icon" />
                      <input
                        type="tel"
                        required
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="reg-input"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="reg-field-group">
                    <label className="reg-label">Password</label>
                    <div className="reg-input-wrap">
                      <Lock size={16} className="reg-input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Create a password"
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

                  {/* Confirm Password */}
                  <div className="reg-field-group">
                    <label className="reg-label">Confirm Password</label>
                    <div className="reg-input-wrap">
                      <Lock size={16} className="reg-input-icon" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="reg-input"
                      />
                      <button
                        type="button"
                        className="reg-eye-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Country */}
                  <div className="reg-field-group">
                    <label className="reg-label">Country</label>
                    <div className="reg-input-wrap">
                      <Globe size={16} className="reg-input-icon" />
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="reg-input"
                      >
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                      </select>
                    </div>
                  </div>

                  {/* Referral Code */}
                  <div className="reg-field-group">
                    <label className="reg-label">Referral Code (Optional)</label>
                    <div className="reg-input-wrap">
                      <Tag size={16} className="reg-input-icon" />
                      <input
                        type="text"
                        placeholder="Enter referral code"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        className="reg-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms checkbox */}
                <div className="reg-checkbox-wrap">
                  <input
                    type="checkbox"
                    id="terms-check"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <label htmlFor="terms-check">
                    I agree to <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>
                  </label>
                </div>

                {/* Next Step */}
                <button type="submit" className="reg-btn-primary">
                  <span>Next Step</span>
                  <ArrowRight size={18} />
                </button>
              </form>

              {/* Divider & Google SSO */}
              <div className="reg-divider">
                <span>or continue with</span>
              </div>

              <button
                type="button"
                className="reg-btn-google"
                onClick={() => {
                  alert(
                    `Signing in with Google for Enterprenex Solutions (${currentRoleData.title} workspace)...`
                  );
                }}
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

              <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: '#64748b' }}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}
                >
                  Login to Your Account
                </Link>
              </div>
            </div>

            {/* Right Column: Selected Role Summary Card (Matches Photo 4) */}
            <div className="reg-sidebar-card">
              <div className="reg-sidebar-hero">
                <div className="reg-sidebar-hero-shape" />
                <div style={{ textAlign: 'center', zIndex: 2, color: '#ffffff' }}>
                  {selectedRole === 'director' && <Shield size={48} />}
                  {selectedRole === 'employee' && <Code2 size={48} />}
                  {selectedRole === 'manager' && <Users size={48} />}
                </div>
              </div>

              <div className="reg-sidebar-body">
                <div className="reg-role-badge-pill">
                  <Briefcase size={13} />
                  <span>{currentRoleData.roleHighlight}</span>
                </div>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                  {currentRoleData.title} account
                </h2>

                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {currentRoleData.desc}
                </p>

                <ul className="reg-role-features" style={{ marginBottom: '1.5rem' }}>
                  {currentRoleData.features.map((feat, idx) => (
                    <li key={idx} className="reg-role-feature-item">
                      <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Change account type
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: VERIFY OTP                                                       */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="reg-card" style={{ maxWidth: '580px', margin: '0 auto', textAlign: 'center' }}>
            <span className="reg-badge-step">STEP 4</span>
            <h1 className="reg-title">Verify your email address</h1>
            <p className="reg-subtitle">
              We have dispatched a 6-digit verification code to <br />
              <strong style={{ color: '#0f172a' }}>{email || 'your-email@enterprenex.com'}</strong>
            </p>

            {isSendingOtp && (
              <div style={{ fontSize: '0.85rem', color: '#059669', marginBottom: '1rem', fontWeight: 600 }}>
                Sending security verification email...
              </div>
            )}

            {/* Sandbox Notice & Instant Autofill */}
            {otpDeliveryStatus === 'sandbox_mode' && (
              <div
                style={{
                  background: '#fefce8',
                  border: '1px solid #fef08a',
                  color: '#854d0e',
                  padding: '0.9rem 1.15rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  textAlign: 'left',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <span>⚠️ Test Mode / Sandbox Notice</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#713f12', lineHeight: 1.4 }}>
                  Resend only delivers test emails to <code>enterprenexsolutionpvtltd@gmail.com</code> until your custom domain is verified. For local testing, your verification code is:
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '0.65rem',
                    background: '#ffffff',
                    border: '1.5px solid #fde047',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                  }}
                >
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '3px', color: '#059669' }}>
                    {generatedOtp}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const digits = generatedOtp.split('');
                      setOtp(digits);
                    }}
                    style={{
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Auto-fill Code
                  </button>
                </div>
              </div>
            )}

            {otpDeliveryStatus === 'delivered' && (
              <div
                style={{
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#065f46',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '1.25rem',
                }}
              >
                ✅ Real email dispatched successfully! Please check your inbox or spam folder.
              </div>
            )}

            {formError && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  marginBottom: '1.25rem',
                }}
              >
                {formError}
              </div>
            )}

            {/* 6 Digit Inputs */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.6rem',
                margin: '2rem 0',
              }}
            >
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  style={{
                    width: '50px',
                    height: '58px',
                    textAlign: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    border: '2px solid #cbd5e1',
                    borderRadius: '12px',
                    color: '#0f172a',
                    background: '#ffffff',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#059669')}
                  onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                />
              ))}
            </div>

            <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: '#64748b' }}>
              {otpResent ? (
                <span style={{ color: '#059669', fontWeight: 600 }}>A new verification code has been sent!</span>
              ) : otpTimer > 0 ? (
                <span>Resend code in <strong>{otpTimer}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#059669',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <RefreshCw size={14} />
                  Resend verification code
                </button>
              )}
            </div>

            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
              💡 Testing hint: You can enter <strong style={{ color: '#059669' }}>123456</strong> to verify instantly.
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              className="reg-btn-primary"
            >
              <span>Verify & Activate Account</span>
              <ArrowRight size={18} />
            </button>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Change email address
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: COMPLETE                                                         */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="reg-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <span className="reg-badge-step">STEP 5</span>

            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 0 10px rgba(5, 150, 105, 0.12)',
                margin: '1.5rem 0',
              }}
            >
              <CheckCircle2 size={46} />
            </div>

            <h1 className="reg-title">Workspace Activated!</h1>
            <p className="reg-subtitle" style={{ maxWidth: '440px', margin: '0 auto 2rem auto' }}>
              Welcome to <strong>Enterprenex Solutions</strong>, {fullName || 'Colleague'}! Your{' '}
              <strong style={{ color: '#059669' }}>{currentRoleData.title}</strong> account is ready for operation.
            </p>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.25rem',
                textAlign: 'left',
                marginBottom: '2rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.825rem', color: '#64748b' }}>Account Name:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{fullName || 'Enterprenex User'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.825rem', color: '#64748b' }}>Assigned Role:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>{currentRoleData.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.825rem', color: '#64748b' }}>Company Domain:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{organization}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to="/login"
                className="reg-btn-primary"
                style={{ textDecoration: 'none' }}
              >
                <span>Proceed to Login</span>
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/"
                style={{
                  padding: '0.85rem',
                  borderRadius: '12px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                }}
              >
                Back to Public Website
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RegisterPage;
