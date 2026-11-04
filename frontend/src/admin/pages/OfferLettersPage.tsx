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
  Download,
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
    downloadOfferLetterPdf,
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
  const [formDept, setFormDept] = useState<string>('IT');
  const [formDesignation, setFormDesignation] = useState<string>('Web Development Intern');
  const [formJoinDate, setFormJoinDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formEmpType, setFormEmpType] = useState<string>('Intern');
  const [formSalary, setFormSalary] = useState<number>(0);
  const [formProbation, setFormProbation] = useState<string>('3 (Three) Months from the Date of Joining');
  const [formAddress, setFormAddress] = useState<string>('Burdwan, West Bengal');
  const [formPlaceOfJoining, setFormPlaceOfJoining] = useState<string>('chh sambhajinagar,Maharashtra,india');
  const [formWorkMode, setFormWorkMode] = useState<string>('online');
  const [formWorkingHours, setFormWorkingHours] = useState<string>('4 to 6 hours per day, as assigned by the Reporting Manager');
  const [formWorkingDays, setFormWorkingDays] = useState<string>('Monday - saturday');
  const [formReportingManager, setFormReportingManager] = useState<string>('Rohit pawar');
  const [formSignatoryType, setFormSignatoryType] = useState<'Director' | 'HR'>('HR');
  const [formSignatoryName, setFormSignatoryName] = useState<string>('Rohit Pawar');
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
      if ((emp as any).address) setFormAddress((emp as any).address);
      if ((emp as any).reportingManager) setFormReportingManager((emp as any).reportingManager);
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
        status: submitForApproval ? 'Pending Approval' : 'Draft',
        candidateAddress: formAddress,
        placeOfJoining: formPlaceOfJoining,
        workMode: formWorkMode,
        workingHours: formWorkingHours,
        workingDays: formWorkingDays,
        reportingManager: formReportingManager,
        signatoryName: formSignatoryType === 'Director' ? (formSignatoryName || 'Rohit Pawar') : (currentUser?.name || 'Operations Officer'),
        signatoryRole: formSignatoryType === 'Director' ? 'Managing Director' : 'Operations Officer',
        signatoryDepartment: formSignatoryType === 'Director' ? 'Board of Directors, Enterprenex Solutions Pvt Ltd' : 'HR Team, Enterprenex Solutions Pvt Ltd'
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
    setFormDept('IT');
    setFormDesignation('Web Development Intern');
    setFormJoinDate(new Date().toISOString().split('T')[0]);
    setFormEmpType('Intern');
    setFormSalary(0);
    setFormProbation('3 (Three) Months from the Date of Joining');
    setFormAddress('Burdwan, West Bengal');
    setFormPlaceOfJoining('chh sambhajinagar,Maharashtra,india');
    setFormWorkMode('online');
    setFormWorkingHours('4 to 6 hours per day, as assigned by the Reporting Manager');
    setFormWorkingDays('Monday - saturday');
    setFormReportingManager('Rohit pawar');
    setFormSignatoryType('HR');
    setFormSignatoryName('Rohit Pawar');
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

                        {/* Download Official PDF */}
                        <button
                          className="btn btn-ghost"
                          title="Download Official PDF (Server-side Puppeteer)"
                          onClick={() => downloadOfferLetterPdf(offer.id, offer.offerLetterNo)}
                          style={{ padding: '0.4rem 0.65rem', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                        >
                          <Download size={14} /> Download PDF
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
                    <option value="IT">IT</option>
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
                    <option value="3 (Three) Months from the Date of Joining">3 (Three) Months from the Date of Joining</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="1 Month">1 Month</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="adm-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Monthly Salary / Stipend (INR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={formSalary}
                    onChange={e => setFormSalary(Number(e.target.value))}
                    className="adm-input"
                    style={{ width: '100%', height: '38px' }}
                  />
                  <small style={{ color: 'var(--adm-text-muted)', fontSize: '0.72rem' }}>Enter 0 for unpaid internship</small>
                </div>

                <div className="adm-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Annual CTC (Calculated)</label>
                  <div style={{ height: '38px', display: 'flex', alignItems: 'center', padding: '0 0.85rem', background: 'var(--adm-surface-soft)', border: '1px solid var(--adm-border)', borderRadius: '6px', fontWeight: 700, color: '#10b981' }}>
                    {formSalary > 0 ? `₹${(formSalary * 12).toLocaleString('en-IN')} / Year` : 'Unpaid Internship'}
                  </div>
                </div>
              </div>

              {/* Template Specific Details (Matching 2-Page Letterhead) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="adm-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Candidate Address</label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={e => setFormAddress(e.target.value)}
                    placeholder="e.g. Burdwan, West Bengal"
                    className="adm-input"
                    style={{ width: '100%', height: '38px' }}
                  />
                </div>

                <div className="adm-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Reporting Manager</label>
                  <input
                    type="text"
                    value={formReportingManager}
                    onChange={e => setFormReportingManager(e.target.value)}
                    placeholder="e.g. Rohit pawar"
                    className="adm-input"
                    style={{ width: '100%', height: '38px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="adm-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Place of Joining</label>
                  <input
                    type="text"
                    value={formPlaceOfJoining}
                    onChange={e => setFormPlaceOfJoining(e.target.value)}
                    placeholder="chh sambhajinagar,Maharashtra,india"
                    className="adm-input"
                    style={{ width: '100%', height: '38px' }}
                  />
                </div>

                <div className="adm-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Work Mode</label>
                  <select
                    value={formWorkMode}
                    onChange={e => setFormWorkMode(e.target.value)}
                    className="adm-input"
                    style={{ width: '100%', height: '38px' }}
                  >
                    <option value="online">Online / Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="on-site">On-site / Chhatrapati Sambhajinagar</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="adm-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Working Hours</label>
                  <input
                    type="text"
                    value={formWorkingHours}
                    onChange={e => setFormWorkingHours(e.target.value)}
                    placeholder="4 to 6 hours per day, as assigned by the Reporting Manager"
                    className="adm-input"
                    style={{ width: '100%', height: '38px' }}
                  />
                </div>

                <div className="adm-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Working Days</label>
                  <input
                    type="text"
                    value={formWorkingDays}
                    onChange={e => setFormWorkingDays(e.target.value)}
                    placeholder="Monday - saturday"
                    className="adm-input"
                    style={{ width: '100%', height: '38px' }}
                  />
                </div>
              </div>

              {/* Signatory Person (Director vs HR) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="adm-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Signatory Authority *</label>
                  <select
                    value={formSignatoryType}
                    onChange={e => {
                      const val = e.target.value as 'Director' | 'HR';
                      setFormSignatoryType(val);
                      if (val === 'Director') {
                        setFormSignatoryName('Rohit Pawar');
                      } else {
                        setFormSignatoryName(currentUser?.name || 'Operations Officer');
                      }
                    }}
                    className="adm-input"
                    style={{ width: '100%', height: '38px' }}
                  >
                    <option value="Director">Managing Director (Rohit Pawar - Board of Directors)</option>
                    <option value="HR">HR Team (Operations Officer)</option>
                  </select>
                </div>

                <div className="adm-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Signatory Officer Name</label>
                  <input
                    type="text"
                    value={formSignatoryName}
                    onChange={e => setFormSignatoryName(e.target.value)}
                    className="adm-input"
                    style={{ width: '100%', height: '38px' }}
                  />
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
                  onClick={() => downloadOfferLetterPdf(selectedOfferForPreview.id, selectedOfferForPreview.offerLetterNo)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#059669', color: '#fff', border: 'none', padding: '0.45rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  <Download size={16} /> Download Puppeteer PDF
                </button>

                <button
                  onClick={() => setSelectedOfferForPreview(null)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable A4 2-Page Letterhead Body */}
            {(() => {
              const offer = selectedOfferForPreview;
              const isInternship = true;

              const department = offer.department && offer.department !== 'Engineering' ? offer.department : 'IT';
              const reportingTo = offer.reportingManager || 'Rohit pawar';
              const placeOfJoining = offer.placeOfJoining || 'chh sambhajinagar,Maharashtra,india';
              const workMode = offer.workMode || 'online';
              const durationText = offer.probationPeriod || '3 (Three) Months from the Date of Joining';

              const formatJoiningDate = (raw?: string | null): string => {
                if (!raw) {
                  const today = new Date();
                  const d = String(today.getDate()).padStart(2, '0');
                  const m = today.toLocaleString('en-US', { month: 'short' });
                  const y = today.getFullYear();
                  return `${d}${m}${y}`;
                }
                if (/^\d{1,2}[A-Za-z]{3}\d{4}$/.test(raw.trim())) {
                  return raw.trim();
                }
                const parsed = new Date(raw);
                if (!isNaN(parsed.getTime())) {
                  const d = String(parsed.getDate()).padStart(2, '0');
                  const m = parsed.toLocaleString('en-US', { month: 'short' });
                  const y = parsed.getFullYear();
                  return `${d}${m}${y}`;
                }
                return raw;
              };

              const startDate = formatJoiningDate(offer.joiningDate);
              const workingHours = offer.workingHours || '4 to 6 hours per day, as assigned by the Reporting Manager';
              const workingDays = offer.workingDays || 'Monday - saturday';
              const address = offer.candidateAddress || 'Burdwan, West Bengal';
              const stipendText = 'This is an unpaid internship. No monetary compensation shall be provided for the duration of the internship.';

              const dateObj = new Date(offer.createdAt);
              const formattedDate = `${dateObj.getDate()} ${dateObj.toLocaleString('en-US', { month: 'short' })} ${dateObj.getFullYear()}`;

              const signatoryName = offer.signatoryName || 'Rohit Pawar';
              const signatoryRole = offer.signatoryRole || 'Operations Officer';
              const signatoryDepartment = offer.signatoryDepartment || 'HR Team, Enterprenex Solutions Pvt Ltd';

              return (
                <div id="printable-offer-letter" style={{ background: '#f1f5f9', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
                  <style>{`
                    @media print {
                      body * { visibility: hidden !important; }
                      #printable-offer-letter, #printable-offer-letter * { visibility: visible !important; }
                      #printable-offer-letter {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        padding: 0 !important;
                        background: none !important;
                        gap: 0 !important;
                      }
                      .offer-preview-sheet {
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 !important;
                        width: 100% !important;
                        min-height: 285mm !important;
                        page-break-after: always !important;
                        padding: 12mm 18mm 12mm 18mm !important;
                      }
                      .no-print { display: none !important; }
                    }
                  `}</style>

                  {/* ════════ PAGE 1 ════════ */}
                  <div
                    className="offer-preview-sheet"
                    style={{
                      width: '100%',
                      maxWidth: '780px',
                      background: '#ffffff',
                      color: '#1a1a1a',
                      padding: '2.5rem 3rem 2rem 3rem',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      borderRadius: '4px',
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      fontSize: '0.86rem',
                      lineHeight: '1.45',
                      boxSizing: 'border-box',
                      minHeight: '1050px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      {/* Page 1 Header */}
                      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                        <img
                          src="/images/enterprenex-logo.png"
                          alt="Enterprenex Logo"
                          style={{ width: '56px', height: '56px', objectFit: 'contain', margin: '0 auto 4px auto', display: 'block' }}
                        />
                        <div style={{ fontFamily: "'Cinzel', Georgia, 'Times New Roman', serif", fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.8px', color: '#0f172a' }}>
                          ENTERPRENEX SOLUTIONS PVT LTD
                        </div>
                        <div style={{ fontSize: '0.78rem', fontStyle: 'italic', color: '#475569', marginBottom: '8px' }}>
                          www.enterprenexsolution.com
                        </div>
                        <div style={{ height: '2.5px', background: '#c28b38', width: '100%', marginBottom: '12px' }} />
                      </div>

                      {/* Date Row */}
                      <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', marginBottom: '12px' }}>
                        Date: {formattedDate}
                      </div>

                      {/* To Block */}
                      <div style={{ fontSize: '0.88rem', lineHeight: '1.4', marginBottom: '14px', color: '#0f172a' }}>
                        <strong>To,</strong><br />
                        <strong>{offer.employeeName.toUpperCase()}</strong><br />
                        <span style={{ color: '#334155' }}>{address}</span>
                      </div>

                      {/* Title */}
                      <div style={{ textAlign: 'center', fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.5px', color: '#0f172a', textDecoration: 'underline', marginBottom: '14px' }}>
                        OFFER LETTER FOR INTERNSHIP
                      </div>

                      {/* Salutation */}
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', marginBottom: '10px' }}>
                        Dear {offer.employeeName.toUpperCase()},
                      </div>

                      {/* Intro Paragraph */}
                      <p style={{ margin: '0 0 14px 0', textAlign: 'justify', color: '#1f2937' }}>
                        We are pleased to offer you the position of <strong>{offer.designation}</strong> at Enterprenex Solutions Pvt Ltd. We were impressed with your profile during the selection process and believe you will be a valuable addition to our team. Please find below the terms and conditions of your internship.
                      </p>

                      {/* Internship Details */}
                      <div style={{ fontSize: '0.94rem', fontWeight: 800, letterSpacing: '0.4px', color: '#0f172a', marginBottom: '2px' }}>
                        INTERNSHIP DETAILS
                      </div>
                      <div style={{ height: '1px', background: '#0f172a', width: '100%', marginBottom: '8px' }} />

                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', lineHeight: '1.5', marginBottom: '14px' }}>
                        <tbody>
                          <tr>
                            <td style={{ fontWeight: 700, color: '#0f172a', width: '28%', padding: '2px 0' }}>Intern Name:</td>
                            <td style={{ color: '#1f2937', padding: '2px 0' }}><strong>{offer.employeeName.toUpperCase()}</strong></td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 700, color: '#0f172a', padding: '2px 0' }}>Intern ID:</td>
                            <td style={{ color: '#1f2937', padding: '2px 0' }}>{offer.employeeId || offer.offerLetterNo}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 700, color: '#0f172a', padding: '2px 0' }}>Position / Role:</td>
                            <td style={{ color: '#1f2937', padding: '2px 0' }}>{offer.designation}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 700, color: '#0f172a', padding: '2px 0' }}>Department:</td>
                            <td style={{ color: '#1f2937', padding: '2px 0' }}>{department}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 700, color: '#0f172a', padding: '2px 0' }}>Reporting To:</td>
                            <td style={{ color: '#1f2937', padding: '2px 0' }}>{reportingTo}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 700, color: '#0f172a', padding: '2px 0' }}>Place of Joining:</td>
                            <td style={{ color: '#1f2937', padding: '2px 0' }}>{placeOfJoining}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 700, color: '#0f172a', padding: '2px 0' }}>Work Mode:</td>
                            <td style={{ color: '#1f2937', padding: '2px 0' }}>{workMode}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 700, color: '#0f172a', padding: '2px 0' }}>Duration:</td>
                            <td style={{ color: '#1f2937', padding: '2px 0' }}>{durationText}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 700, color: '#0f172a', padding: '2px 0' }}>Start Date:</td>
                            <td style={{ color: '#1f2937', padding: '2px 0' }}>{startDate}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 700, color: '#0f172a', padding: '2px 0' }}>Working Hours:</td>
                            <td style={{ color: '#1f2937', padding: '2px 0' }}>{workingHours}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 700, color: '#0f172a', padding: '2px 0' }}>Working Days:</td>
                            <td style={{ color: '#1f2937', padding: '2px 0' }}>{workingDays}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 700, color: '#0f172a', padding: '2px 0' }}>Stipend:</td>
                            <td style={{ color: '#1f2937', padding: '2px 0' }}>{stipendText}</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Terms & General Policies - Bullets 1 to 4 */}
                      <div style={{ fontSize: '0.94rem', fontWeight: 800, letterSpacing: '0.4px', color: '#0f172a', marginBottom: '2px' }}>
                        TERMS & GENERAL POLICIES
                      </div>
                      <div style={{ height: '1px', background: '#0f172a', width: '100%', marginBottom: '8px' }} />

                      <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.83rem', lineHeight: '1.45', color: '#1f2937' }}>
                        <li style={{ marginBottom: '4px', textAlign: 'justify' }}>
                          This {isInternship ? 'internship' : 'employment'} is for a fixed period of {durationText} from the date of joining and may be extended or converted into a full-time offer at the sole discretion of the Company, based on performance.
                        </li>
                        <li style={{ marginBottom: '4px', textAlign: 'justify' }}>
                          The {isInternship ? 'intern' : 'employee'} is expected to maintain regular attendance and complete assigned tasks within the given deadlines with due diligence and professionalism.
                        </li>
                        <li style={{ marginBottom: '4px', textAlign: 'justify' }}>
                          The {isInternship ? 'intern' : 'employee'} shall report to their designated Reporting Manager / Department Lead and follow the task and reporting structure communicated to them.
                        </li>
                        <li style={{ marginBottom: '4px', textAlign: 'justify' }}>
                          All work, content, code, designs, strategies, documents, and materials created during the {isInternship ? 'internship' : 'employment'} shall remain the exclusive property of Enterprenex Solutions Pvt Ltd.
                        </li>
                      </ul>
                    </div>

                    {/* Page 1 Footer */}
                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                      <div style={{ height: '2px', background: '#c28b38', width: '100%', marginBottom: '6px' }} />
                      <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: '1.35' }}>
                        enterprenexsolutionpvtltd@gmail.com &nbsp;|&nbsp; +91-9226860060<br />
                        Plot No. 148, Shrinand Plaza, CIDCO Waluj Mahanagar 1, Chhatrapati Sambhajinagar, MH 431136
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>
                        Page 1 of 2
                      </div>
                    </div>
                  </div>

                  {/* ════════ PAGE 2 ════════ */}
                  <div
                    className="offer-preview-sheet"
                    style={{
                      width: '100%',
                      maxWidth: '780px',
                      background: '#ffffff',
                      color: '#1a1a1a',
                      padding: '2.5rem 3rem 2rem 3rem',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      borderRadius: '4px',
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      fontSize: '0.86rem',
                      lineHeight: '1.45',
                      boxSizing: 'border-box',
                      minHeight: '1050px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      {/* Page 2 Header */}
                      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                        <img
                          src="/images/enterprenex-logo.png"
                          alt="Enterprenex Logo"
                          style={{ width: '56px', height: '56px', objectFit: 'contain', margin: '0 auto 4px auto', display: 'block' }}
                        />
                        <div style={{ fontFamily: "'Cinzel', Georgia, 'Times New Roman', serif", fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.8px', color: '#0f172a' }}>
                          ENTERPRENEX SOLUTIONS PVT LTD
                        </div>
                        <div style={{ fontSize: '0.78rem', fontStyle: 'italic', color: '#475569', marginBottom: '8px' }}>
                          www.enterprenexsolution.com
                        </div>
                        <div style={{ height: '2.5px', background: '#c28b38', width: '100%', marginBottom: '14px' }} />
                      </div>

                      {/* Terms & General Policies - Bullets 5 to 10 */}
                      <ul style={{ paddingLeft: '1.25rem', margin: '0 0 16px 0', fontSize: '0.83rem', lineHeight: '1.45', color: '#1f2937' }}>
                        <li style={{ marginBottom: '4px', textAlign: 'justify' }}>
                          The {isInternship ? 'intern' : 'employee'} shall maintain strict confidentiality regarding the Company's business information, client data, social media credentials, internal tools, and processes, both during and after the {isInternship ? 'internship' : 'employment'} period.
                        </li>
                        <li style={{ marginBottom: '4px', textAlign: 'justify' }}>
                          The {isInternship ? 'intern' : 'employee'} shall not engage in any activity that conflicts with the interests of the Company, including but not limited to sharing confidential information with third parties.
                        </li>
                        <li style={{ marginBottom: '4px', textAlign: 'justify' }}>
                          The {isInternship ? 'intern' : 'employee'} is expected to adhere to the Company's code of conduct, maintain professional behavior, and respect fellow team members at all times.
                        </li>
                        <li style={{ marginBottom: '4px', textAlign: 'justify' }}>
                          This {isInternship ? 'internship' : 'employment'} does not guarantee any full-time employment offer upon completion, unless communicated separately in writing by the Company.
                        </li>
                        <li style={{ marginBottom: '4px', textAlign: 'justify' }}>
                          Either party (the Company or the {isInternship ? 'Intern' : 'Employee'}) may terminate this {isInternship ? 'internship' : 'employment'} by providing 10 (ten) days' written notice to the other party.
                        </li>
                        <li style={{ marginBottom: '4px', textAlign: 'justify' }}>
                          In case of unsatisfactory performance, misconduct, or breach of any terms mentioned herein, the Company reserves the right to terminate the {isInternship ? 'internship' : 'employment'} without prior notice.
                        </li>
                      </ul>

                      {/* On Successful Completion */}
                      <div style={{ fontSize: '0.94rem', fontWeight: 800, letterSpacing: '0.4px', color: '#0f172a', marginBottom: '2px' }}>
                        ON SUCCESSFUL COMPLETION
                      </div>
                      <div style={{ height: '1px', background: '#0f172a', width: '100%', marginBottom: '8px' }} />
                      <p style={{ margin: '0 0 14px 0', textAlign: 'justify', color: '#1f2937', fontSize: '0.84rem' }}>
                        Upon successful completion of the {isInternship ? 'internship' : 'probation'} period and satisfactory performance, the {isInternship ? 'intern' : 'employee'} shall be provided with a Letter of Recommendation and an Experience/Completion Certificate from Enterprenex Solutions Pvt Ltd.
                      </p>

                      {/* Acceptance Section */}
                      <div style={{ fontSize: '0.94rem', fontWeight: 800, letterSpacing: '0.4px', color: '#0f172a', textDecoration: 'underline', marginBottom: '6px' }}>
                        ACCEPTANCE
                      </div>
                      <p style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '0.84rem' }}>
                        Please sign and return a copy of this letter as a token of your acceptance of the above terms and conditions of the {isInternship ? 'internship' : 'employment'} offer.
                      </p>
                      <p style={{ margin: '0 0 18px 0', color: '#1f2937', fontSize: '0.84rem' }}>
                        We look forward to having you on board and wish you a great learning experience at Enterprenex Solutions Pvt Ltd.
                      </p>

                      {/* Signatory Block */}
                      <div style={{ margin: '16px 0 24px 0', fontSize: '0.88rem', lineHeight: '1.35' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
                          For Enterprenex Solutions Pvt Ltd,
                        </div>
                        <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                          Rohit Pawar
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                          Operations Officer
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                          HR Team, Enterprenex Solutions Pvt Ltd
                        </div>
                      </div>

                      {/* Candidate Acceptance Form */}
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                        Acceptance by Intern
                      </div>
                      <div style={{ fontSize: '0.85rem', lineHeight: '2.1', color: '#0f172a' }}>
                        <div>Signature: ______________________________</div>
                        <div>Name: ______________________________</div>
                        <div>Date: ______________________________</div>
                      </div>
                    </div>

                    {/* Page 2 Footer */}
                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                      <div style={{ height: '2px', background: '#c28b38', width: '100%', marginBottom: '6px' }} />
                      <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: '1.35' }}>
                        enterprenexsolutionpvtltd@gmail.com &nbsp;|&nbsp; +91-9226860060<br />
                        Plot No. 148, Shrinand Plaza, CIDCO Waluj Mahanagar 1, Chhatrapati Sambhajinagar, MH 431136
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>
                        Page 2 of 2
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferLettersPage;

