import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  FileText,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Send,
  Eye,
  Trash2,
  Printer,
  Clock,
  Briefcase,
  Calendar,
  Building,
  DollarSign,
  User,
  ShieldCheck,
  AlertCircle,
  X,
  FileCheck
} from 'lucide-react';
import type { OfferLetter, OfferLetterStatus } from '../types';

export const OfferLettersPage: React.FC = () => {
  const {
    currentUser,
    offerLetters,
    employees,
    createOfferLetter,
    directorReviewOfferLetter,
    sendOfferLetter,
    respondOfferLetter,
    deleteOfferLetter,
    showToast
  } = useAdmin();

  // Role checks
  const isDirector =
    currentUser?.role === 'Super Admin' ||
    currentUser?.email === 'director@enterprenex.solutions' ||
    currentUser?.email === 'director@enterprenexsolution.com';

  const isHR =
    isDirector ||
    currentUser?.role === 'Project Manager' ||
    currentUser?.role === 'HR Manager' ||
    currentUser?.department === 'Human Resources';

  const isEmployee = !isDirector && !isHR;

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals state
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
  const [selectedOfferForPreview, setSelectedOfferForPreview] = useState<OfferLetter | null>(null);
  const [reviewOffer, setReviewOffer] = useState<OfferLetter | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState<string>('');
  const [reviewAction, setReviewAction] = useState<'Approve' | 'Reject'>('Approve');
  const [respondOffer, setRespondOffer] = useState<OfferLetter | null>(null);
  const [respondRemarks, setRespondRemarks] = useState<string>('');

  // New Offer Form State
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formDept, setFormDept] = useState<string>('Engineering');
  const [formDesignation, setFormDesignation] = useState<string>('Software Engineer');
  const [formJoinDate, setFormJoinDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formEmpType, setFormEmpType] = useState<string>('Full-time');
  const [formSalary, setFormSalary] = useState<number>(50000);
  const [formProbation, setFormProbation] = useState<string>('3 Months');
  const [formTerms, setFormTerms] = useState<string>(
`1. Working Hours & Modality: Regular work hours are 09:30 AM to 06:30 PM IST, Monday through Friday, operating under a Hybrid arrangement.
2. Probation Period: You will undergo a 3-month probation period evaluating technical capability, cultural alignment, and KPI benchmarks.
3. Intellectual Property & Confidentiality: All intellectual properties, source codes, architectural designs, algorithms, and documentation developed during your tenure remain the exclusive property of Enterprenex Solutions Pvt Ltd.
4. Non-Compete & NDA: You agree not to engage in competing commercial engineering activities or disclose proprietary client information during and for 12 months following your employment.
5. Notice Period: Following probation, a notice period of 30 days is required by either party for voluntary separation.`
  );

  // Auto-fill employee details when selected
  const handleEmployeeSelect = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = employees.find(e => e.employeeId === empId || e.id === empId);
    if (emp) {
      setFormName(emp.name);
      setFormEmail(emp.email);
      setFormDept(emp.department || 'Engineering');
      setFormDesignation(emp.role || 'Software Engineer');
      setFormSalary(emp.salaryMonthly || 50000);
      if (emp.employmentType) setFormEmpType(emp.employmentType);
      if (emp.probationPeriod) setFormProbation(emp.probationPeriod);
      if (emp.joinDate) setFormJoinDate(emp.joinDate);
    }
  };

  const handleGenerateSubmit = async (e: React.FormEvent, submitForApproval = true) => {
    e.preventDefault();
    if (!formName || !formEmail) {
      showToast('Validation Error', 'Candidate name and email are mandatory.', 'error');
      return;
    }

    try {
      await createOfferLetter({
        employeeId: selectedEmpId || undefined,
        employeeName: formName,
        employeeEmail: formEmail,
        department: formDept,
        designation: formDesignation,
        joiningDate: formJoinDate,
        employmentType: formEmpType,
        salaryMonthly: Number(formSalary),
        ctcAnnual: Number(formSalary) * 12,
        probationPeriod: formProbation,
        termsAndConditions: formTerms,
        status: submitForApproval ? 'Pending Approval' : 'Draft'
      });

      setShowGenerateModal(false);
      resetForm();
    } catch {
      // toast handled in context
    }
  };

  const resetForm = () => {
    setSelectedEmpId('');
    setFormName('');
    setFormEmail('');
    setFormDept('Engineering');
    setFormDesignation('Software Engineer');
    setFormJoinDate(new Date().toISOString().split('T')[0]);
    setFormEmpType('Full-time');
    setFormSalary(50000);
    setFormProbation('3 Months');
  };

  const handleDirectorReviewSubmit = async () => {
    if (!reviewOffer) return;
    try {
      await directorReviewOfferLetter(reviewOffer.id, reviewAction, reviewRemarks);
      setReviewOffer(null);
      setReviewRemarks('');
    } catch {
      // toast handled in context
    }
  };

  const handleCandidateRespondSubmit = async (decision: 'Accept' | 'Decline') => {
    if (!respondOffer) return;
    try {
      await respondOfferLetter(respondOffer.id, decision, respondRemarks);
      setRespondOffer(null);
      setRespondRemarks('');
    } catch {
      // toast handled in context
    }
  };

  // Filtered letters based on role & search
  const visibleOffers = offerLetters.filter(offer => {
    // If regular employee, only show their own offer letter
    if (isEmployee) {
      const isMine =
        offer.employeeEmail.toLowerCase() === currentUser?.email?.toLowerCase() ||
        offer.employeeId === currentUser?.id;
      if (!isMine) return false;
    }

    // Status tab filter
    if (activeTab !== 'All' && offer.status !== activeTab) {
      return false;
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNo = offer.offerLetterNo.toLowerCase().includes(q);
      const matchName = offer.employeeName.toLowerCase().includes(q);
      const matchEmail = offer.employeeEmail.toLowerCase().includes(q);
      const matchDept = offer.department.toLowerCase().includes(q);
      const matchRole = offer.designation.toLowerCase().includes(q);
      return matchNo || matchName || matchEmail || matchDept || matchRole;
    }

    return true;
  });

  // Status counts
  const pendingCount = offerLetters.filter(o => o.status === 'Pending Approval').length;
  const approvedCount = offerLetters.filter(o => o.status === 'Approved').length;
  const sentCount = offerLetters.filter(o => o.status === 'Sent').length;
  const acceptedCount = offerLetters.filter(o => o.status === 'Accepted').length;

  const getStatusBadge = (status: OfferLetterStatus) => {
    switch (status) {
      case 'Approved':
        return <span className="adm-badge adm-badge-success"><CheckCircle size={12} style={{ marginRight: 4 }} /> Approved</span>;
      case 'Pending Approval':
        return <span className="adm-badge adm-badge-warning"><Clock size={12} style={{ marginRight: 4 }} /> Pending Approval</span>;
      case 'Sent':
        return <span className="adm-badge adm-badge-info"><Send size={12} style={{ marginRight: 4 }} /> Sent to Candidate</span>;
      case 'Accepted':
        return <span className="adm-badge adm-badge-primary"><FileCheck size={12} style={{ marginRight: 4 }} /> Accepted</span>;
      case 'Rejected':
        return <span className="adm-badge adm-badge-danger"><XCircle size={12} style={{ marginRight: 4 }} /> Rejected</span>;
      case 'Declined':
        return <span className="adm-badge adm-badge-neutral"><XCircle size={12} style={{ marginRight: 4 }} /> Declined</span>;
      case 'Draft':
      default:
        return <span className="adm-badge adm-badge-neutral"><FileText size={12} style={{ marginRight: 4 }} /> Draft</span>;
    }
  };

  return (
    <div className="adm-page">
      {/* Header */}
      <div className="adm-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={24} style={{ color: 'var(--adm-primary)' }} />
            Offer Letter Management
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--adm-text-muted)', fontSize: '0.875rem' }}>
            Generate, review, approve, and track executive employment contracts and offer letters.
          </p>
        </div>

        {isHR && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setShowGenerateModal(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.2rem', fontWeight: 600 }}
            >
              <Plus size={18} />
              Generate Offer Letter
            </button>
          </div>
        )}
      </div>

      {/* Metric Cards Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="adm-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--adm-text-muted)', fontSize: '0.85rem' }}>
            <span>Total Offer Letters</span>
            <FileText size={18} style={{ color: 'var(--adm-primary)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--adm-text-main)' }}>
            {offerLetters.length}
          </div>
        </div>

        <div className="adm-card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--adm-text-muted)', fontSize: '0.85rem' }}>
            <span>Pending Director Review</span>
            <Clock size={18} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.5rem', color: '#f59e0b' }}>
            {pendingCount}
          </div>
        </div>

        <div className="adm-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--adm-text-muted)', fontSize: '0.85rem' }}>
            <span>Approved by Director</span>
            <CheckCircle size={18} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.5rem', color: '#10b981' }}>
            {approvedCount}
          </div>
        </div>

        <div className="adm-card" style={{ padding: '1.25rem', borderLeft: '4px solid #38bdf8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--adm-text-muted)', fontSize: '0.85rem' }}>
            <span>Dispatched / Accepted</span>
            <Send size={18} style={{ color: '#38bdf8' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--adm-text-main)' }}>
            {sentCount + acceptedCount} <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>({acceptedCount} signed)</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Tabs */}
      <div className="adm-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['All', 'Pending Approval', 'Approved', 'Sent', 'Accepted', 'Draft', 'Rejected', 'Declined'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-ghost'}`}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.825rem',
                  borderRadius: '8px',
                  fontWeight: activeTab === tab ? 700 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {tab}
                {tab === 'Pending Approval' && pendingCount > 0 && (
                  <span style={{ background: '#f59e0b', color: '#fff', borderRadius: '999px', padding: '1px 6px', fontSize: '0.7rem' }}>
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', minWidth: '240px', flex: '1', maxWidth: '360px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by candidate, ref no, dept..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="adm-input"
              style={{ width: '100%', paddingLeft: '2rem', height: '36px', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      {/* Table / List */}
      <div className="adm-card" style={{ overflow: 'hidden' }}>
        {visibleOffers.length === 0 ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--adm-text-muted)' }}>
            <FileText size={48} style={{ opacity: 0.3, marginBottom: '0.8rem' }} />
            <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>No offer letters found.</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
              {isHR ? 'Click "Generate Offer Letter" above to prepare an offer for a candidate.' : 'No employment contracts currently assigned to your account.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--adm-surface-soft)', borderBottom: '1px solid var(--adm-border)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Offer Ref</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Candidate</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Role & Dept</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Joining Date</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Compensation</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleOffers.map(offer => (
                  <tr key={offer.id} style={{ borderBottom: '1px solid var(--adm-border)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--adm-primary)' }}>
                      {offer.offerLetterNo}
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--adm-text-main)' }}>{offer.employeeName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)' }}>{offer.employeeEmail}</div>
                      {offer.employeeId && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-muted)', fontFamily: 'monospace' }}>ID: {offer.employeeId}</div>
                      )}
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{offer.designation}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)' }}>{offer.department} • {offer.employmentType}</div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} style={{ color: 'var(--adm-text-muted)' }} />
                        <span>{offer.joiningDate}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '2px' }}>
                        Probation: {offer.probationPeriod}
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: '#10b981' }}>
                        ₹{offer.salaryMonthly.toLocaleString('en-IN')}<span style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', fontWeight: 400 }}>/mo</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>
                        ₹{offer.ctcAnnual.toLocaleString('en-IN')} CTC
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      {getStatusBadge(offer.status)}
                      {offer.directorRemarks && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '4px', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={offer.directorRemarks}>
                          Note: {offer.directorRemarks}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {/* Preview / Print PDF button */}
                        <button
                          className="btn btn-ghost"
                          title="Preview Professional PDF"
                          onClick={() => setSelectedOfferForPreview(offer)}
                          style={{ padding: '0.4rem 0.65rem', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                        >
                          <Eye size={14} /> Preview PDF
                        </button>

                        {/* Director Review Action */}
                        {isDirector && offer.status === 'Pending Approval' && (
                          <button
                            className="btn btn-primary"
                            onClick={() => {
                              setReviewOffer(offer);
                              setReviewAction('Approve');
                              setReviewRemarks('');
                            }}
                            style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', background: '#f59e0b', borderColor: '#f59e0b', color: '#fff' }}
                          >
                            <ShieldCheck size={14} /> Review & Approve
                          </button>
                        )}

                        {/* HR Send Action */}
                        {isHR && offer.status === 'Approved' && (
                          <button
                            className="btn btn-primary"
                            onClick={() => sendOfferLetter(offer.id)}
                            style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                          >
                            <Send size={14} /> Send Offer
                          </button>
                        )}

                        {/* Candidate Accept/Decline Action */}
                        {(isEmployee || isHR) && offer.status === 'Sent' && (
                          <button
                            className="btn btn-primary"
                            onClick={() => {
                              setRespondOffer(offer);
                              setRespondRemarks('');
                            }}
                            style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', background: '#10b981', borderColor: '#10b981', color: '#fff' }}
                          >
                            <FileCheck size={14} /> Accept / Decline
                          </button>
                        )}

                        {/* Delete Action (only for Drafts or Rejected, HR only) */}
                        {isHR && (offer.status === 'Draft' || offer.status === 'Rejected') && (
                          <button
                            className="btn btn-ghost"
                            title="Delete Offer"
                            onClick={() => {
                              if (window.confirm(`Delete offer letter ${offer.offerLetterNo}?`)) {
                                deleteOfferLetter(offer.id);
                              }
                            }}
                            style={{ padding: '0.4rem 0.5rem', color: '#ef4444' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 1. GENERATE OFFER LETTER MODAL ── */}
      {showGenerateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="adm-card" style={{ maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--adm-border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} style={{ color: 'var(--adm-primary)' }} />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Generate Employment Offer Letter</h2>
              </div>
              <button onClick={() => setShowGenerateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--adm-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={e => handleGenerateSubmit(e, true)}>
              {/* Select Existing Employee */}
              <div className="adm-form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Select Registered Employee (Auto-populates details)
                </label>
                <select
                  value={selectedEmpId}
                  onChange={e => handleEmployeeSelect(e.target.value)}
                  className="adm-input"
                  style={{ width: '100%', height: '38px' }}
                >
                  <option value="">-- Or enter new candidate details manually --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.employeeId || emp.id}>
                      {emp.name} ({emp.employeeId || 'ID Pending'}) - {emp.role} [{emp.approvalStatus || 'Active'}]
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="adm-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="Candidate full name"
                    className="adm-input"
                    style={{ width: '100%', height: '38px' }}
                  />
                </div>

                <div className="adm-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    className="adm-input"
                    style={{ width: '100%', height: '38px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="adm-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Designation / Job Title *</label>
                  <input
                    type="text"
                    required
                    value={formDesignation}
                    onChange={e => setFormDesignation(e.target.value)}
                    placeholder="e.g. Senior Full-Stack Developer"
                    className="adm-input"
                    style={{ width: '100%', height: '38px' }}
                  />
                </div>

                <div className="adm-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Department *</label>
                  <select
                    value={formDept}
                    onChange={e => setFormDept(e.target.value)}
                    className="adm-input"
                    style={{ width: '100%', height: '38px' }}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                    <option value="Design & UX">Design & UX</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Product & Operations">Product & Operations</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="adm-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={formJoinDate}
                    onChange={e => setFormJoinDate(e.target.value)}
                    className="adm-input"
                    style={{ width: '100%', height: '38px' }}
                  />
                </div>

                <div className="adm-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Employment Type</label>
                  <select
                    value={formEmpType}
                    onChange={e => setFormEmpType(e.target.value)}
                    className="adm-input"
                    style={{ width: '100%', height: '38px' }}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Intern">Intern</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div className="adm-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Probation Period</label>
                  <select
                    value={formProbation}
                    onChange={e => setFormProbation(e.target.value)}
                    className="adm-input"
                    style={{ width: '100%', height: '38px' }}
                  >
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="1 Month">1 Month</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="adm-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Monthly Salary (INR) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={formSalary}
                    onChange={e => setFormSalary(Number(e.target.value))}
                    className="adm-input"
                    style={{ width: '100%', height: '38px' }}
                  />
                </div>

                <div className="adm-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Annual CTC (Calculated)</label>
                  <div style={{ height: '38px', display: 'flex', alignItems: 'center', padding: '0 0.85rem', background: 'var(--adm-surface-soft)', border: '1px solid var(--adm-border)', borderRadius: '6px', fontWeight: 700, color: '#10b981' }}>
                    ₹{(formSalary * 12).toLocaleString('en-IN')} / Year
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="adm-form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Company Terms and Conditions
                </label>
                <textarea
                  rows={5}
                  value={formTerms}
                  onChange={e => setFormTerms(e.target.value)}
                  className="adm-input"
                  style={{ width: '100%', padding: '0.6rem', fontSize: '0.825rem', fontFamily: 'sans-serif' }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--adm-border)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowGenerateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={e => handleGenerateSubmit(e, false)}
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ShieldCheck size={16} />
                  Submit for Director Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 2. DIRECTOR REVIEW / APPROVAL MODAL ── */}
      {reviewOffer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="adm-card" style={{ maxWidth: '540px', width: '100%', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--adm-border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} style={{ color: '#f59e0b' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Director Offer Letter Review</h3>
              </div>
              <button onClick={() => setReviewOffer(null)} style={{ background: 'none', border: 'none', color: 'var(--adm-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: 'var(--adm-surface-soft)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--adm-text-muted)' }}>Offer Ref:</span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{reviewOffer.offerLetterNo}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--adm-text-muted)' }}>Candidate:</span>
                <span style={{ fontWeight: 600 }}>{reviewOffer.employeeName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--adm-text-muted)' }}>Role & Department:</span>
                <span>{reviewOffer.designation} ({reviewOffer.department})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--adm-text-muted)' }}>Annual CTC:</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>₹{reviewOffer.ctcAnnual.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--adm-text-muted)' }}>Joining Date:</span>
                <span>{reviewOffer.joiningDate}</span>
              </div>
            </div>

            <div className="adm-form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Decision</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  className={`btn ${reviewAction === 'Approve' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setReviewAction('Approve')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: reviewAction === 'Approve' ? '#10b981' : undefined, borderColor: reviewAction === 'Approve' ? '#10b981' : undefined, color: reviewAction === 'Approve' ? '#fff' : undefined }}
                >
                  <CheckCircle size={16} /> Approve Offer
                </button>
                <button
                  type="button"
                  className={`btn ${reviewAction === 'Reject' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setReviewAction('Reject')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: reviewAction === 'Reject' ? '#ef4444' : undefined, borderColor: reviewAction === 'Reject' ? '#ef4444' : undefined, color: reviewAction === 'Reject' ? '#fff' : undefined }}
                >
                  <XCircle size={16} /> Reject / Rework
                </button>
              </div>
            </div>

            <div className="adm-form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                Director Remarks & Feedback
              </label>
              <textarea
                rows={3}
                placeholder="Add executive guidance, compensation adjustments, or approval notes..."
                value={reviewRemarks}
                onChange={e => setReviewRemarks(e.target.value)}
                className="adm-input"
                style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={() => setReviewOffer(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleDirectorReviewSubmit}
                style={{ background: reviewAction === 'Approve' ? '#10b981' : '#ef4444', borderColor: reviewAction === 'Approve' ? '#10b981' : '#ef4444', color: '#fff' }}
              >
                Submit {reviewAction} Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. CANDIDATE ACCEPT / DECLINE MODAL ── */}
      {respondOffer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="adm-card" style={{ maxWidth: '500px', width: '100%', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--adm-border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Employment Offer Response</h3>
              <button onClick={() => setRespondOffer(null)} style={{ background: 'none', border: 'none', color: 'var(--adm-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--adm-text-muted)', marginBottom: '1rem' }}>
              Please review the offer letter terms and formally record your decision for {respondOffer.offerLetterNo}.
            </p>

            <div className="adm-form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Remarks / Feedback (Optional)</label>
              <textarea
                rows={3}
                placeholder="e.g. Delighted to join Enterprenex Solutions on the scheduled date..."
                value={respondRemarks}
                onChange={e => setRespondRemarks(e.target.value)}
                className="adm-input"
                style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={() => setRespondOffer(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => handleCandidateRespondSubmit('Decline')}
                style={{ background: '#ef4444', borderColor: '#ef4444', color: '#fff' }}
              >
                Decline Offer
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleCandidateRespondSubmit('Accept')}
                style={{ background: '#10b981', borderColor: '#10b981', color: '#fff' }}
              >
                Accept Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. PROFESSIONAL HIGH-DEFINITION PRINT/PDF MODAL ── */}
      {selectedOfferForPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
          <div style={{ maxWidth: '850px', width: '100%', maxHeight: '92vh', overflowY: 'auto', background: '#fff', color: '#1e293b', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)', position: 'relative' }}>
            {/* Top Toolbar (Non-printable) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: '#0f172a', color: '#fff', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: '#38bdf8' }} />
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  Official Document Preview – {selectedOfferForPreview.offerLetterNo}
                </span>
                <span style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                  {selectedOfferForPreview.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => window.print()}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', border: 'none', padding: '0.45rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  <Printer size={16} /> Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedOfferForPreview(null)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable A4 Letterhead Body */}
            <div id="printable-offer-letter" style={{ padding: '3rem', fontFamily: "'Inter', system-ui, -apple-system, sans-serif", fontSize: '0.9rem', lineHeight: '1.6', position: 'relative' }}>
              {/* Background Watermark */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.035, pointerEvents: 'none', zIndex: 0 }}>
                <span style={{ fontSize: '10rem', fontWeight: 900, transform: 'rotate(-30deg)', userSelect: 'none' }}>ENTERPRENEX</span>
              </div>

              {/* Letterhead Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '1.5rem', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '42px', height: '42px', background: '#0f172a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.4rem' }}>
                      E
                    </div>
                    <div>
                      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>
                        ENTERPRENEX SOLUTIONS PVT LTD
                      </h1>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Empowering Enterprise Engineering • CIN: U72900PN2026PTC239841
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#475569' }}>
                  <div>Corporate Headquarters: Pune, MH, India</div>
                  <div>Web: https://enterprenexsolution.com</div>
                  <div>HR Contact: hr@enterprenex.solutions</div>
                  <div>Official Dispatch: {selectedOfferForPreview.createdAt.split('T')[0]}</div>
                </div>
              </div>

              {/* Reference & Date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                <div>REF: <span style={{ fontFamily: 'monospace', color: '#0f172a' }}>{selectedOfferForPreview.offerLetterNo}</span></div>
                <div>Date of Issuance: {new Date(selectedOfferForPreview.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>

              {/* Addressee */}
              <div style={{ marginBottom: '1.5rem', color: '#0f172a' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>To,</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>{selectedOfferForPreview.employeeName}</div>
                <div style={{ color: '#475569' }}>Email: {selectedOfferForPreview.employeeEmail}</div>
                {selectedOfferForPreview.employeeId && (
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Employee ID: {selectedOfferForPreview.employeeId}</div>
                )}
              </div>

              {/* Subject */}
              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderLeft: '4px solid #0f172a', marginBottom: '1.5rem', fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                SUBJECT: LETTER OF APPOINTMENT AND FORMAL EMPLOYMENT OFFER
              </div>

              {/* Letter Opening */}
              <div style={{ marginBottom: '1.25rem', color: '#334155' }}>
                <p style={{ margin: '0 0 0.8rem' }}>Dear <strong>{selectedOfferForPreview.employeeName}</strong>,</p>
                <p style={{ margin: 0 }}>
                  We are pleased to extend this formal offer of employment for the position of <strong>{selectedOfferForPreview.designation}</strong> in our <strong>{selectedOfferForPreview.department}</strong> division at <strong>Enterprenex Solutions Private Limited</strong>. Based on your technical background, credentials, and interview evaluations, we are confident you will make vital contributions to our engineering roadmap.
                </p>
              </div>

              {/* Key Position Details Table */}
              <div style={{ marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0f172a', marginBottom: '0.6rem' }}>
                  1. Terms of Engagement & Compensation Breakup
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                      <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, width: '40%', color: '#475569' }}>Designation</td>
                      <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700, color: '#0f172a' }}>{selectedOfferForPreview.designation}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: '#475569' }}>Department</td>
                      <td style={{ padding: '0.6rem 0.8rem' }}>{selectedOfferForPreview.department}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                      <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: '#475569' }}>Employment Type</td>
                      <td style={{ padding: '0.6rem 0.8rem' }}>{selectedOfferForPreview.employmentType}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: '#475569' }}>Official Date of Joining</td>
                      <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700, color: '#0f172a' }}>{selectedOfferForPreview.joiningDate}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                      <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: '#475569' }}>Probation Period</td>
                      <td style={{ padding: '0.6rem 0.8rem' }}>{selectedOfferForPreview.probationPeriod}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: '#475569' }}>Monthly Gross Remuneration</td>
                      <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700, color: '#0f172a' }}>
                        ₹{selectedOfferForPreview.salaryMonthly.toLocaleString('en-IN')} / Month
                      </td>
                    </tr>
                    <tr style={{ background: '#f0fdf4', borderTop: '2px solid #cbd5e1' }}>
                      <td style={{ padding: '0.6rem 0.8rem', fontWeight: 800, color: '#166534' }}>Annual Cost to Company (CTC)</td>
                      <td style={{ padding: '0.6rem 0.8rem', fontWeight: 800, color: '#166534', fontSize: '0.95rem' }}>
                        ₹{selectedOfferForPreview.ctcAnnual.toLocaleString('en-IN')} per annum
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Terms and Conditions */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0f172a', marginBottom: '0.6rem' }}>
                  2. General Terms, Code of Conduct & Policies
                </h4>
                <div style={{ background: '#f8fafc', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px', whiteSpace: 'pre-line', fontSize: '0.825rem', color: '#334155' }}>
                  {selectedOfferForPreview.termsAndConditions}
                </div>
              </div>

              {/* Signatures Block */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #cbd5e1' }}>
                <div>
                  <div style={{ height: '50px', display: 'flex', alignItems: 'flex-end', marginBottom: '8px' }}>
                    <span style={{ fontFamily: "'Brush Script MT', cursive, sans-serif", fontSize: '1.8rem', color: '#0f172a' }}>
                      Rohit Pawar
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>Rohit Pawar</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Managing Director & Chief Executive</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Enterprenex Solutions Pvt Ltd</div>
                  {selectedOfferForPreview.directorApprovedAt && (
                    <div style={{ fontSize: '0.7rem', color: '#166534', marginTop: '4px' }}>
                      ✓ Digitally Authorized: {new Date(selectedOfferForPreview.directorApprovedAt).toLocaleString()}
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ height: '50px', display: 'flex', alignItems: 'flex-end', marginBottom: '8px' }}>
                    {selectedOfferForPreview.status === 'Accepted' ? (
                      <span style={{ fontFamily: "'Brush Script MT', cursive, sans-serif", fontSize: '1.8rem', color: '#166534' }}>
                        {selectedOfferForPreview.employeeName}
                      </span>
                    ) : (
                      <div style={{ width: '100%', borderBottom: '1px dashed #94a3b8' }} />
                    )}
                  </div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedOfferForPreview.employeeName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Candidate Signature & Acceptance</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Status: {selectedOfferForPreview.status === 'Accepted' ? `Accepted on ${selectedOfferForPreview.respondedAt ? new Date(selectedOfferForPreview.respondedAt).toLocaleDateString() : 'Record'}` : 'Pending Signature'}
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div style={{ marginTop: '2.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.8rem', textAlign: 'center', fontSize: '0.7rem', color: '#94a3b8' }}>
                This is a computer-generated authorized document under the Enterprenex Workforce Management System (EWMS). Reference No: {selectedOfferForPreview.offerLetterNo}.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferLettersPage;
