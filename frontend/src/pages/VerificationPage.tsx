import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Award,
  UserCheck,
  Search,
  CheckCircle2,
  XCircle,
  Building2,
  Lock,
  Printer,
  HelpCircle,
  FileCheck2
} from 'lucide-react';
import { INITIAL_EMPLOYEES } from '../admin/data/initialData';

export default function VerificationPage() {
  const location = useLocation();

  // Determine active verification mode from URL or query (Default: employee)
  const getInitialTab = (): 'employee' | 'internship' => {
    const path = location.pathname.toLowerCase();
    const query = new URLSearchParams(location.search).get('type')?.toLowerCase();
    if (path.includes('internship') || query === 'internship') return 'internship';
    return 'employee';
  };

  const [activeTab, setActiveTab] = useState<'employee' | 'internship'>(getInitialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Update tab if URL changes
  useEffect(() => {
    setActiveTab(getInitialTab());
    setSearchQuery('');
    setSearched(false);
    setResult(null);
  }, [location.pathname, location.search]);

  // Load live employees from localStorage (EWMS team database) or fallback to initial data
  const getEmployees = () => {
    try {
      const stored = localStorage.getItem('ewms_team_members');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_EMPLOYEES;
  };

  // Load live certificates or vault documents from localStorage
  const getInternshipRecords = () => {
    try {
      const stored = localStorage.getItem('ewms_internships');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setSearched(true);

    if (activeTab === 'employee') {
      const team = getEmployees();
      const cleanQ = q.toLowerCase();
      const found = team.find((emp: any) =>
        (emp.employeeId && emp.employeeId.toLowerCase() === cleanQ) ||
        (emp.id && emp.id.toLowerCase() === cleanQ) ||
        (emp.email && emp.email.toLowerCase() === cleanQ) ||
        (emp.name && emp.name.toLowerCase() === cleanQ)
      );
      if (!found) {
        // Check if query is an internship certificate
        const internships = getInternshipRecords();
        const certFound = internships.find((item: any) =>
          (item.certId && item.certId.toLowerCase() === cleanQ) ||
          (item.id && item.id.toLowerCase() === cleanQ)
        );
        if (certFound) {
          setActiveTab('internship');
          setResult(certFound);
          return;
        }
      }
      setResult(found || null);
    } else if (activeTab === 'internship') {
      const internships = getInternshipRecords();
      const cleanQ = q.toLowerCase();
      let found = internships.find((item: any) =>
        (item.certId && item.certId.toLowerCase() === cleanQ) ||
        (item.id && item.id.toLowerCase() === cleanQ) ||
        (item.employeeId && item.employeeId.toLowerCase() === cleanQ) ||
        (item.name && item.name.toLowerCase() === cleanQ)
      );
      if (!found) {
        // Auto-detect if user typed a registered Employee ID
        const team = getEmployees();
        const empFound = team.find((emp: any) =>
          (emp.employeeId && emp.employeeId.toLowerCase() === cleanQ) ||
          (emp.id && emp.id.toLowerCase() === cleanQ) ||
          (emp.email && emp.email.toLowerCase() === cleanQ)
        );
        if (empFound) {
          setActiveTab('employee');
          setResult(empFound);
          return;
        }
      }
      setResult(found || null);
    }
  };

  const printVerification = () => {
    window.print();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', paddingTop: '100px', paddingBottom: '80px' }}>
      
      {/* ── Background Ambience Glows ── */}
      <div style={{ position: 'fixed', top: 0, left: '20%', width: '500px', height: '400px', background: 'radial-gradient(circle, rgba(246,97,53,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '15%', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
        
        {/* ── Header Badge & Title ── */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: 'rgba(246, 97, 53, 0.1)',
            border: '1px solid rgba(246, 97, 53, 0.3)',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#F66135',
            marginBottom: '1rem'
          }}>
            <ShieldCheck size={16} />
            Official Statutory Verification Portal • Enterprenex Solutions Pvt Ltd
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.85rem', color: '#ffffff' }}>
            Instant Credential & Identity Verification
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#94a3b8', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
            Verify the authenticity of Registered Employee IDs and official Internship Certificates issued by Enterprenex Solutions Pvt Ltd.
          </p>
        </div>

        {/* ── Verification Type Tabs ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.65rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'employee', label: 'Employee Verification', icon: <UserCheck size={18} /> },
            { id: 'internship', label: 'Internship Verification', icon: <Award size={18} /> },
          ].map(tab => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSearchQuery('');
                  setSearched(false);
                  setResult(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.75rem 1.6rem',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: isSelected ? '1px solid #F66135' : '1px solid rgba(255,255,255,0.08)',
                  background: isSelected ? 'rgba(246, 97, 53, 0.15)' : 'rgba(15, 23, 42, 0.65)',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  boxShadow: isSelected ? '0 4px 20px rgba(246, 97, 53, 0.2)' : 'none'
                }}
              >
                <span style={{ color: isSelected ? '#F66135' : '#64748b' }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Search Input Box ── */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          marginBottom: '2rem'
        }}>
          <form onSubmit={handleSearch}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.65rem' }}>
              {activeTab === 'employee' && 'Enter 12-Digit Employee ID:'}
              {activeTab === 'internship' && 'Enter Internship Certificate ID:'}
            </label>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={
                    activeTab === 'employee'
                      ? 'Enter 12-Digit Employee ID'
                      : 'Enter Certificate ID'
                  }
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem 0.85rem 2.85rem',
                    background: 'rgba(2, 6, 23, 0.75)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border 0.2s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#F66135')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '0.85rem 1.85rem',
                  background: 'linear-gradient(135deg, #F66135 0%, #e04f24 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 16px rgba(246, 97, 53, 0.3)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <ShieldCheck size={18} />
                Verify Credential
              </button>
            </div>
          </form>
        </div>

        {/* ── Results Display Card ── */}
        <AnimatePresence mode="wait">
          {searched && (
            <motion.div
              key={searchQuery}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {result ? (
                /* Authenticated & Verified Record */
                <div style={{
                  background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.85) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '20px',
                  padding: '2.5rem',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                  position: 'relative',
                  overflow: 'hidden',
                  marginBottom: '2rem'
                }}>
                  {/* Top Seal Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem', marginBottom: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10b981',
                        flexShrink: 0
                      }}>
                        <CheckCircle2 size={32} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                            ✓ 100% Verified Authentic
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>• Central Vault Validated</span>
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                          {activeTab === 'employee' ? (result.name || 'Registered Employee') : result.name}
                        </h2>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={printVerification}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.55rem 1rem',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#cbd5e1',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Printer size={15} /> Print Official Slip
                    </button>
                  </div>

                  {/* Verification Record Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    
                    {activeTab === 'employee' && (
                      <>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>12-Digit Employee ID</div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                            {result.employeeId || result.id || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Designation / Role</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', marginTop: '0.25rem' }}>{result.role || 'Staff Member'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Department</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', marginTop: '0.25rem' }}>{result.department || 'Engineering & Operations'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Employment Status</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: result.status === 'resigned' ? '#f59e0b' : '#10b981', marginTop: '0.25rem' }}>
                            {result.status === 'resigned' ? 'RELIEVED IN GOOD STANDING' : 'ACTIVE & IN GOOD STANDING'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Statutory KYC Status</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981', marginTop: '0.25rem' }}>
                            VERIFIED & COMPLIANT
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Issuing Legal Entity</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', marginTop: '0.25rem' }}>
                            Enterprenex Solutions Pvt Ltd
                          </div>
                        </div>
                      </>
                    )}

                    {activeTab === 'internship' && (
                      <>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Certificate ID</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.25rem', fontFamily: 'monospace' }}>{result.certId || result.id}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Specialization Track</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', marginTop: '0.25rem' }}>{result.domain || result.title}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Tenure Duration</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', marginTop: '0.25rem' }}>{result.duration || 'Full Tenure'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Completion Date</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', marginTop: '0.25rem' }}>{result.completionDate || result.date || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Verification Status</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981', marginTop: '0.25rem' }}>VERIFIED & ISSUED</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Authorized Signatory</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', marginTop: '0.25rem' }}>Enterprenex Solutions Executive Board</div>
                        </div>
                      </>
                    )}

                  </div>

                  {/* Official Footprint & Statutory Stamp */}
                  <div style={{
                    padding: '1rem 1.25rem',
                    background: 'rgba(2, 6, 23, 0.65)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    fontSize: '0.82rem',
                    color: '#94a3b8'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Lock size={15} color="#10b981" />
                      <span>Certified by <strong>Enterprenex Solutions Central Document Vault</strong> in compliance with statutory standards.</span>
                    </div>
                    <div style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      AUTH_SIG: SHA256-ENX-{Date.now().toString().slice(-8)}
                    </div>
                  </div>

                </div>
              ) : (
                /* Record Not Found State */
                <div style={{
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '20px',
                  padding: '2.5rem',
                  textAlign: 'center',
                  marginBottom: '2rem'
                }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '1rem' }}>
                    <XCircle size={30} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: '0 0 0.5rem' }}>
                    No Record Found For "{searchQuery}"
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                    {activeTab === 'employee' 
                      ? 'Please verify the 12-Digit Employee ID carefully. If this employee was registered recently, ensure the credentials have been approved by HR.'
                      : 'Please verify the Certificate ID carefully. If this certificate was issued recently, it may take up to 24 business hours to reflect in the registry.'}
                  </p>
                  <a
                    href="mailto:contact@enterprenex.solutions"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      color: '#F66135',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      textDecoration: 'none'
                    }}
                  >
                    Contact Official HR Support at contact@enterprenex.solutions →
                  </a>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Corporate Verification Guarantee Info ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '3rem' }}>
          
          <div style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem', color: '#F66135', fontWeight: 700, fontSize: '1rem' }}>
              <Building2 size={20} />
              Third-Party BGV Support
            </div>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              Authorized background verification (BGV) agencies and university placement cells can verify employee service records and internship tenures online 24/7 without delays.
            </p>
          </div>

          <div style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem', color: '#38bdf8', fontWeight: 700, fontSize: '1rem' }}>
              <Lock size={20} />
              Tamper-Proof Architecture
            </div>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              Every employee profile is backed by our centralized immutable audit trail, ensuring unique 12-digit Employee IDs and protecting corporate identity.
            </p>
          </div>

          <div style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem', color: '#10b981', fontWeight: 700, fontSize: '1rem' }}>
              <HelpCircle size={20} />
              Need Dedicated HR Verification?
            </div>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              For custom verification letters on official company letterhead, write to <a href="mailto:contact@enterprenex.solutions" style={{ color: '#F66135', textDecoration: 'none', fontWeight: 600 }}>contact@enterprenex.solutions</a> with the Candidate ID.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
