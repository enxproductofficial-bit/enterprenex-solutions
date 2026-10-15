import React, { useEffect } from 'react';
import { X, FileText, CheckCircle2 } from 'lucide-react';

interface EmployeeTermsModalProps {
  onClose: () => void;
  onAccept?: () => void;
}

export const EmployeeTermsModal: React.FC<EmployeeTermsModalProps> = ({ onClose, onAccept }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAcceptAndClose = () => {
    if (onAccept) onAccept();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          color: '#0f172a',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '2px solid #059669',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FileText size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
                Employee Terms & Conditions and Workplace Policies
              </h2>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                ENTERPRENEX SOLUTIONS PRIVATE LIMITED &bull; CIN: U72200MH2024PTC123456
              </div>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            padding: '1.5rem 1.75rem',
            overflowY: 'auto',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            color: '#334155'
          }}
        >
          {/* Company Brief Note */}
          <div
            style={{
              padding: '0.85rem 1rem',
              background: '#f1f5f9',
              borderRadius: '8px',
              borderLeft: '4px solid #059669',
              marginBottom: '1.25rem',
              fontSize: '0.8rem',
              color: '#475569'
            }}
          >
            <strong>Official Employment & Engagement Agreement:</strong> By accessing the Enterprenex Solutions
            Workforce Portal, logging attendance, executing project deliverables, or utilizing company credentials,
            you unconditionally agree to comply with all corporate rules, codes of conduct, and statutory obligations
            detailed below.
          </div>

          {/* Section 1 */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
              1. Corporate Identity & Authority
            </h3>
            <p style={{ margin: 0 }}>
              Enterprenex Solutions Private Limited is a registered corporate enterprise incorporated under the
              Companies Act, with registered office located in Chhatrapati Sambhajinagar (Aurangabad), Maharashtra,
              India. All appointments, credentials, and project authorizations are governed exclusively by the Board of
              Directors and Executive Management.
            </p>
          </div>

          {/* Section 2 */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
              2. Portal Login, 12-Digit Employee ID & Credentials Security
            </h3>
            <p style={{ margin: 0 }}>
              Each team member is provisioned a unique 12-digit Employee Identification Number (e.g. 202600000002) and
              confidential login password. You are strictly responsible for maintaining credential secrecy. Sharing,
              transferring, or permitting third-party access to company credentials or the internal EWMS workspace constitutes
              a severe security violation resulting in immediate termination and legal action.
            </p>
          </div>

          {/* Section 3 */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
              3. Attendance, Biometric Compliance & Working Hours
            </h3>
            <p style={{ margin: 0 }}>
              Employees and interns must log daily duty check-in and check-out via the authorized workspace biometric /
              attendance system. Any absence without prior formal leave application approved by the Managing Director or
              Human Resources shall be recorded as an Unexcused Absence and subjected to payroll deduction and
              administrative review.
            </p>
          </div>

          {/* Section 4 */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
              4. Client Confidentiality & Non-Disclosure (NDA)
            </h3>
            <p style={{ margin: 0 }}>
              All client contracts, specifications, source codes, proprietary software architectures, AI models,
              financial records, and trade secrets handled during your tenure are strictly confidential. You shall not
              copy, export, leak, upload to personal drives, or disclose any proprietary information to any external
              entity during or after your tenure.
            </p>
          </div>

          {/* Section 5 */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
              5. Intellectual Property (IP) Ownership
            </h3>
            <p style={{ margin: 0 }}>
              All inventions, computer programs, codebase repositories, technical documentation, designs, AI agents,
              and patents authored, designed, or developed by you during your employment or internship are the sole and
              exclusive intellectual property of Enterprenex Solutions Private Limited without right to personal claim or
              royalty.
            </p>
          </div>

          {/* Section 6 */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
              6. Professional Code of Conduct & POSH Compliance
            </h3>
            <p style={{ margin: 0 }}>
              Enterprenex Solutions enforces a zero-tolerance policy against sexual harassment, workplace bullying,
              substance abuse, discrimination, or fraud in full compliance with the POSH Act and Indian Labour
              legislations. Violators face immediate dismissal and referral to law enforcement authorities.
            </p>
          </div>

          {/* Section 7 */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
              7. Resignation, Notice Period & Asset Handover
            </h3>
            <p style={{ margin: 0 }}>
              Staff members seeking separation must serve the notice period specified in their appointment offer. All
              source code repositories, access tokens, project documents, and physical company assets must be formally
              handed over to the management. Completion certificates and experience relieving letters will only be
              issued upon completion of full exit clearance approved by the Managing Director.
            </p>
          </div>

          {/* Section 8 */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
              8. Jurisdiction & Governing Law
            </h3>
            <p style={{ margin: 0 }}>
              This policy and all employment matters are construed under the laws of the Republic of India. Any
              disputes shall be subject to the exclusive jurisdiction of the competent courts of Chhatrapati
              Sambhajinagar (Aurangabad), Maharashtra.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b' }}>
            <CheckCircle2 size={15} color="#059669" />
            <span>Updated & Enforced for FY 2025-26</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleAcceptAndClose}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                background: '#059669',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CheckCircle2 size={16} />
              <span>I Acknowledge & Agree</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
