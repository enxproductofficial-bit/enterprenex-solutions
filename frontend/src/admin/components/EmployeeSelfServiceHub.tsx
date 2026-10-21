import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Clock,
  Coffee,
  FileText,
  DollarSign,
  Laptop,
  Award,
  CheckCircle2,
  Plus,
  Download,
  Printer,
  X,
  Send,
  Building2,
  CheckSquare,
  FileCheck
} from 'lucide-react';
import type { Task, Employee } from '../types';

interface EmployeeSelfServiceHubProps {
  currentEmpProfile: Employee | any;
  myTasks: Task[];
  attendancePunchedIn: boolean;
  punchInTime: string;
  onToggleAttendance: () => void;
}

export const EmployeeSelfServiceHub: React.FC<EmployeeSelfServiceHubProps> = ({
  currentEmpProfile,
  attendancePunchedIn,
  punchInTime,
  onToggleAttendance
}) => {
  const {
    leaves,
    addLeaveRequest,
    showToast,
    projects
  } = useAdmin();

  // Active Hub Tab (Sections 4.1 to 4.5 of User Manual)
  const [activeTab, setActiveTab] = useState<'attendance' | 'leaves' | 'timesheet' | 'requests' | 'goals'>('attendance');

  // ── 4.1 BREAK MODE & REGULARIZATION STATES ──
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakType, setBreakType] = useState<'Tea Break' | 'Lunch Break'>('Tea Break');
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [showRegularizeModal, setShowRegularizeModal] = useState(false);
  const [regDate, setRegDate] = useState(new Date().toISOString().split('T')[0]);
  const [regTime, setRegTime] = useState('09:30');
  const [regType, setRegType] = useState<'Missed Check-in' | 'Missed Check-out' | 'Wrong Punch Time'>('Missed Check-in');
  const [regReason, setRegReason] = useState('');

  // Break Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isOnBreak) {
      interval = setInterval(() => {
        setBreakSeconds(s => s + 1);
      }, 1000);
    } else {
      setBreakSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isOnBreak]);

  const formatBreakTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  const handleStartBreak = (type: 'Tea Break' | 'Lunch Break') => {
    setBreakType(type);
    setIsOnBreak(true);
    showToast('Break Started', `${type} timer initiated. Enjoy your break!`, 'info');
  };

  const handleEndBreak = () => {
    setIsOnBreak(false);
    showToast('Shift Resumed', `Welcome back from ${breakType}! Break time logged.`, 'success');
  };

  const handleRegularizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regReason.trim()) {
      showToast('Missing Explanation', 'Please state the accurate reason for attendance regularization.', 'warning');
      return;
    }
    showToast('Regularization Submitted', `Missed punch request for ${regDate} routed to ${currentEmpProfile?.reportingManager || 'Reporting Manager'} for approval.`, 'success');
    setShowRegularizeModal(false);
    setRegReason('');
  };

  // ── 4.2 LEAVE BALANCES & APPLY LEAVE ──
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState<'Paid Leave' | 'Casual Leave' | 'Sick Leave'>('Paid Leave');
  const [leaveStart, setLeaveStart] = useState(new Date().toISOString().split('T')[0]);
  const [leaveEnd, setLeaveEnd] = useState(new Date().toISOString().split('T')[0]);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');

  // Sample Leave Balances
  const leaveBalances = {
    paid: 12,
    casual: 6,
    sick: 5
  };

  const myLeaveHistory = (leaves || []).filter(l =>
    l && (l.employeeName === currentEmpProfile?.name || l.employeeName?.includes(currentEmpProfile?.name?.split(' ')[0] || 'Staff'))
  );

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) {
      showToast('Reason Required', 'Please provide a justification for your leave request.', 'warning');
      return;
    }
    addLeaveRequest({
      employeeName: currentEmpProfile?.name || 'Staff Member',
      type: leaveType,
      startDate: leaveStart,
      endDate: isHalfDay ? `${leaveStart} (Half Day)` : leaveEnd,
      reason: leaveReason.trim()
    });
    showToast('Leave Applied', `${leaveType} request submitted for review to ${currentEmpProfile?.reportingManager || 'Lead'}.`, 'success');
    setShowApplyLeaveModal(false);
    setLeaveReason('');
  };

  // ── 4.3 TIMESHEETS & WORK HOURS ──
  const [timesheetEntries, setTimesheetEntries] = useState([
    { id: 'ts-1', day: 'Monday', date: '2026-10-19', project: 'Enterprise EWMS Core', task: 'RBAC Permission Matrix Implementation', hours: 8, billable: true, status: 'Approved' },
    { id: 'ts-2', day: 'Tuesday', date: '2026-10-20', project: 'Enterprenex Cloud Suite', task: 'Attendance Regularization API & DB Sync', hours: 7.5, billable: true, status: 'Approved' },
    { id: 'ts-3', day: 'Wednesday', date: '2026-10-21', project: 'Client Portal Modernization', task: 'Sprint Review & Standup Meetings', hours: 8, billable: true, status: 'Pending Review' }
  ]);

  const [newTsProject, setNewTsProject] = useState('Enterprise EWMS Core');
  const [newTsTask, setNewTsTask] = useState('');
  const [newTsHours, setNewTsHours] = useState('4');
  const [newTsBillable, setNewTsBillable] = useState(true);

  const handleAddTimesheetEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTsTask.trim()) {
      showToast('Task Description Required', 'Please specify the work completed.', 'warning');
      return;
    }
    const hrs = parseFloat(newTsHours) || 1;
    const newEntry = {
      id: 'ts-' + Date.now(),
      day: 'Today',
      date: new Date().toISOString().split('T')[0],
      project: newTsProject,
      task: newTsTask.trim(),
      hours: hrs,
      billable: newTsBillable,
      status: 'Logged'
    };
    setTimesheetEntries([newEntry, ...timesheetEntries]);
    setNewTsTask('');
    showToast('Hours Logged', `${hrs} hrs recorded on ${newTsProject}.`, 'success');
  };

  const handleSubmitTimesheetForApproval = () => {
    showToast('Timesheet Submitted', 'Weekly timesheet has been submitted to your reporting manager for signoff.', 'success');
  };

  // ── 4.4 SELF-SERVICE REQUESTS & DOCUMENTS (ESS) ──
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);

  // Expense Claim state
  const [expenseCategory, setExpenseCategory] = useState<'Travel & Commute' | 'Client Meeting & Meals' | 'Software Tool / License' | 'Office Stationery'>('Travel & Commute');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseProject, setExpenseProject] = useState('General Operations');
  const [expenseNotes, setExpenseNotes] = useState('');

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || parseFloat(expenseAmount) <= 0) {
      showToast('Amount Required', 'Please enter a valid expense amount.', 'warning');
      return;
    }
    showToast('Expense Claim Submitted', `Claim for ₹${expenseAmount} (${expenseCategory}) submitted for finance reimbursement.`, 'success');
    setShowExpenseModal(false);
    setExpenseAmount('');
    setExpenseNotes('');
  };

  // Letter Request state
  const [letterType, setLetterType] = useState<'Bonafide Certificate' | 'Experience Letter' | 'Address Proof Letter' | 'Visa NOC Certificate'>('Bonafide Certificate');
  const [letterPurpose, setLetterPurpose] = useState('');

  const handleLetterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterPurpose.trim()) {
      showToast('Purpose Required', 'Please specify the reason/institution for the letter.', 'warning');
      return;
    }
    showToast('Document Request Sent', `${letterType} request submitted to HR Operations. Document will be issued within 48 hours.`, 'success');
    setShowLetterModal(false);
    setLetterPurpose('');
  };

  // Asset Request state
  const [assetType, setAssetType] = useState<'MacBook / High-Performance Laptop' | '27" External 4K Display' | 'Wireless Keyboard & Ergonomic Mouse' | 'Developer Security YubiKey / Token'>('MacBook / High-Performance Laptop');
  const [assetJustification, setAssetJustification] = useState('');

  const handleAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetJustification.trim()) {
      showToast('Justification Required', 'Please provide a business justification for hardware allocation.', 'warning');
      return;
    }
    showToast('Asset Allocation Requested', `Hardware requisition for ${assetType} submitted to IT Asset Administration.`, 'success');
    setShowAssetModal(false);
    setAssetJustification('');
  };

  // Monthly Salary Computations for Payslip
  const baseSalary = currentEmpProfile?.salaryMonthly || 45000;
  const basic = Math.round(baseSalary * 0.5);
  const hra = Math.round(baseSalary * 0.3);
  const specialAllowance = baseSalary - basic - hra;
  const pf = 1800;
  const pt = 200;
  const tds = Math.round(baseSalary * 0.05);
  const totalDeductions = pf + pt + tds;
  const netPay = baseSalary - totalDeductions;

  return (
    <div className="adm-card" style={{ padding: '1.5rem', borderRadius: '18px', border: '1px solid var(--adm-border)' }}>
      {/* ── HEADER & NAVIGATION TABS (Section 4 Sub-Sections) ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--adm-border)', paddingBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.12)', color: 'var(--adm-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={18} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
              Employee Self-Service (ESS) & Workspace Suite
            </h2>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--adm-text-muted)' }}>
            Official EWMS User Manual Section 4 compliance: Attendance, Leaves, Timesheets, ESS Documents, and Goals
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--adm-bg)', padding: '4px', borderRadius: '10px', border: '1px solid var(--adm-border)', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            style={{
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'attendance' ? 'var(--adm-primary)' : 'transparent',
              color: activeTab === 'attendance' ? '#ffffff' : 'var(--adm-text-dim)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Clock size={13} />
            <span>4.1 Shifts & Breaks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leaves')}
            style={{
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'leaves' ? 'var(--adm-primary)' : 'transparent',
              color: activeTab === 'leaves' ? '#ffffff' : 'var(--adm-text-dim)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Coffee size={13} />
            <span>4.2 Leaves</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timesheet')}
            style={{
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'timesheet' ? 'var(--adm-primary)' : 'transparent',
              color: activeTab === 'timesheet' ? '#ffffff' : 'var(--adm-text-dim)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <CheckSquare size={13} />
            <span>4.3 Timesheet</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            style={{
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'requests' ? 'var(--adm-primary)' : 'transparent',
              color: activeTab === 'requests' ? '#ffffff' : 'var(--adm-text-dim)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <FileText size={13} />
            <span>4.4 ESS Documents</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('goals')}
            style={{
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'goals' ? 'var(--adm-primary)' : 'transparent',
              color: activeTab === 'goals' ? '#ffffff' : 'var(--adm-text-dim)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Award size={13} />
            <span>4.5 Goals & OKRs</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: 4.1 ATTENDANCE, BREAKS & REGULARIZATION ── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'attendance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="adm-grid-3">
            {/* Shift Check-in Card */}
            <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'var(--adm-bg)', border: '1px solid var(--adm-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--adm-text-dim)' }}>Shift Status</span>
                <span className={`adm-badge ${attendancePunchedIn ? 'adm-badge-success' : 'adm-badge-warning'}`}>
                  {attendancePunchedIn ? 'Active On Duty' : 'Shift Not Punched'}
                </span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--adm-text)', marginBottom: '4px' }}>
                {attendancePunchedIn ? punchInTime : '--:--'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--adm-text-muted)', marginBottom: '1rem' }}>
                Shift: Standard General (09:30 AM – 06:30 PM IST)
              </div>
              <button
                type="button"
                onClick={onToggleAttendance}
                className="adm-btn adm-btn-primary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '0.55rem' }}
              >
                <Clock size={14} />
                <span>{attendancePunchedIn ? 'Check Out For Today' : 'Punch Check In Now'}</span>
              </button>
            </div>

            {/* Break Recording Card (Section 4.1 requirement) */}
            <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'var(--adm-bg)', border: '1px solid var(--adm-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--adm-text-dim)' }}>Break Tracker</span>
                {isOnBreak && (
                  <span className="adm-badge adm-badge-warning">
                    On {breakType}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: isOnBreak ? '#f59e0b' : 'var(--adm-text)', marginBottom: '4px' }}>
                {isOnBreak ? formatBreakTime(breakSeconds) : '00:00'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--adm-text-muted)', marginBottom: '1rem' }}>
                Allocated Daily: 45 min Lunch &bull; 15 min Tea
              </div>
              {isOnBreak ? (
                <button
                  type="button"
                  onClick={handleEndBreak}
                  className="adm-btn adm-btn-success"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '0.55rem' }}
                >
                  <CheckCircle2 size={14} />
                  <span>End Break & Resume Work</span>
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    disabled={!attendancePunchedIn}
                    onClick={() => handleStartBreak('Tea Break')}
                    className="adm-btn adm-btn-secondary"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '0.55rem' }}
                    title={!attendancePunchedIn ? 'Please punch in first' : 'Start 15-min Tea Break'}
                  >
                    <Coffee size={13} color="#f59e0b" />
                    <span>Tea Break</span>
                  </button>
                  <button
                    type="button"
                    disabled={!attendancePunchedIn}
                    onClick={() => handleStartBreak('Lunch Break')}
                    className="adm-btn adm-btn-secondary"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '0.55rem' }}
                    title={!attendancePunchedIn ? 'Please punch in first' : 'Start 45-min Lunch Break'}
                  >
                    <Clock size={13} color="#10b981" />
                    <span>Lunch</span>
                  </button>
                </div>
              )}
            </div>

            {/* Attendance Regularization Card (Section 4.1 requirement) */}
            <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'var(--adm-bg)', border: '1px solid var(--adm-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--adm-text-dim)' }}>Regularization</span>
                <span className="adm-badge adm-badge-info">SOP Approved</span>
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--adm-text)', marginBottom: '4px' }}>
                Missed a Punch?
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--adm-text-muted)', marginBottom: '1rem', lineHeight: 1.4 }}>
                Submit formal missed-punch request with reason to manager for audit-trail compliance.
              </div>
              <button
                type="button"
                onClick={() => setShowRegularizeModal(true)}
                className="adm-btn adm-btn-secondary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '0.55rem', border: '1px solid var(--adm-primary)', color: 'var(--adm-primary)' }}
              >
                <Plus size={14} />
                <span>Request Regularization</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: 4.2 APPLY FOR LEAVE & LEAVE BALANCES ── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'leaves' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Balance Cards Row */}
          <div className="adm-grid-3">
            <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'var(--adm-bg)', border: '1px solid var(--adm-border)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--adm-text-dim)' }}>Paid Annual Leave</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--adm-primary)', margin: '4px 0' }}>{leaveBalances.paid} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--adm-text-muted)' }}>days remaining</span></div>
              <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>Accrued 1.5 days / month</div>
            </div>

            <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'var(--adm-bg)', border: '1px solid var(--adm-border)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--adm-text-dim)' }}>Casual Leave (CL)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', margin: '4px 0' }}>{leaveBalances.casual} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--adm-text-muted)' }}>days remaining</span></div>
              <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>Valid for personal emergency / half-days</div>
            </div>

            <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'var(--adm-bg)', border: '1px solid var(--adm-border)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--adm-text-dim)' }}>Sick & Medical Leave</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', margin: '4px 0' }}>{leaveBalances.sick} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--adm-text-muted)' }}>days remaining</span></div>
              <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>Medical certificate for &gt; 2 consecutive days</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>My Leave Requests & Status History</h3>
            <button
              type="button"
              onClick={() => setShowApplyLeaveModal(true)}
              className="adm-btn adm-btn-primary adm-btn-sm"
            >
              <Plus size={14} />
              <span>Apply New Leave</span>
            </button>
          </div>

          {/* Leave Requests Table */}
          <div className="adm-table-container">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myLeaveHistory.length > 0 ? (
                  myLeaveHistory.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 700, color: 'var(--adm-text)' }}>{l.type}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)' }}>{l.startDate} &rarr; {l.endDate}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--adm-text)' }}>{l.reason}</td>
                      <td>
                        <span className={`adm-badge ${l.status === 'Approved' ? 'adm-badge-success' : l.status === 'Rejected' ? 'adm-badge-danger' : 'adm-badge-warning'}`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--adm-text-dim)', padding: '1.5rem' }}>
                      No active leave requests filed. All leave balances are intact.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 3: 4.3 TIMESHEETS & WORK HOURS ── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'timesheet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick Logger Form */}
          <form onSubmit={handleAddTimesheetEntry} style={{ padding: '1rem', background: 'var(--adm-bg)', borderRadius: '12px', border: '1px solid var(--adm-border)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--adm-text)', marginBottom: '0.75rem' }}>
              Log Work Hours (Billable / Non-Billable Allocation)
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                value={newTsProject}
                onChange={e => setNewTsProject(e.target.value)}
                className="adm-input"
                style={{ flex: 1, minWidth: '180px', fontSize: '0.8rem' }}
              >
                {(projects || []).map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
                <option value="Internal Operations">Internal Operations</option>
              </select>

              <input
                type="text"
                placeholder="Work description / Deliverable completed..."
                value={newTsTask}
                onChange={e => setNewTsTask(e.target.value)}
                className="adm-input"
                style={{ flex: 2, minWidth: '220px', fontSize: '0.8rem' }}
              />

              <input
                type="number"
                step="0.5"
                min="0.5"
                max="16"
                value={newTsHours}
                onChange={e => setNewTsHours(e.target.value)}
                className="adm-input"
                style={{ width: '85px', fontSize: '0.8rem' }}
                placeholder="Hours"
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--adm-text)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newTsBillable}
                  onChange={e => setNewTsBillable(e.target.checked)}
                  style={{ accentColor: 'var(--adm-primary)' }}
                />
                Billable
              </label>

              <button type="submit" className="adm-btn adm-btn-primary" style={{ fontSize: '0.78rem', padding: '0.5rem 0.9rem' }}>
                <Plus size={13} />
                <span>Log Time</span>
              </button>
            </div>
          </form>

          {/* Timesheet Entries Table */}
          <div className="adm-table-container">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Day & Date</th>
                  <th>Project Name</th>
                  <th>Deliverable / Task</th>
                  <th>Hours</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {timesheetEntries.map(ts => (
                  <tr key={ts.id}>
                    <td style={{ fontWeight: 700, color: 'var(--adm-text)' }}>{ts.day} <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>({ts.date})</span></td>
                    <td style={{ color: 'var(--adm-primary)', fontWeight: 600 }}>{ts.project}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--adm-text)' }}>{ts.task}</td>
                    <td style={{ fontWeight: 800, color: 'var(--adm-text)' }}>{ts.hours} hrs</td>
                    <td>
                      <span className={`adm-badge ${ts.billable ? 'adm-badge-success' : 'adm-badge-info'}`} style={{ fontSize: '0.68rem' }}>
                        {ts.billable ? 'Billable' : 'Internal'}
                      </span>
                    </td>
                    <td>
                      <span className={`adm-badge ${ts.status === 'Approved' ? 'adm-badge-success' : 'adm-badge-warning'}`} style={{ fontSize: '0.68rem' }}>
                        {ts.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--adm-bg)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--adm-text)', fontWeight: 700 }}>
              Total Logged This Week: <strong style={{ color: 'var(--adm-primary)' }}>{timesheetEntries.reduce((acc, t) => acc + t.hours, 0)} Hours</strong>
            </span>
            <button
              type="button"
              onClick={handleSubmitTimesheetForApproval}
              className="adm-btn adm-btn-primary adm-btn-sm"
            >
              <Send size={13} />
              <span>Submit Timesheet For Manager Signoff</span>
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 4: 4.4 ESS REQUESTS & DOCUMENTS (PAYSLIP, EXPENSES, LETTERS) ── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="adm-grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {/* 1. Payslip & Tax Forms */}
            <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'var(--adm-bg)', border: '1px solid var(--adm-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <FileText size={18} />
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--adm-text)' }}>Payslips & Form 16</h4>
                <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--adm-text-muted)', lineHeight: 1.4 }}>
                  Download official monthly salary slips and IT computation sheets.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPayslipModal(true)}
                className="adm-btn adm-btn-secondary"
                style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', fontSize: '0.78rem' }}
              >
                <Download size={13} />
                <span>View Latest Payslip</span>
              </button>
            </div>

            {/* 2. Expense Claims */}
            <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'var(--adm-bg)', border: '1px solid var(--adm-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)', color: 'var(--adm-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <DollarSign size={18} />
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--adm-text)' }}>Expense Reimbursement</h4>
                <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--adm-text-muted)', lineHeight: 1.4 }}>
                  Submit claims for client travel, meals, SaaS licenses, or hardware purchases.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExpenseModal(true)}
                className="adm-btn adm-btn-secondary"
                style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', fontSize: '0.78rem' }}
              >
                <Plus size={13} />
                <span>Claim Expense</span>
              </button>
            </div>

            {/* 3. Official HR Letters */}
            <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'var(--adm-bg)', border: '1px solid var(--adm-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <FileCheck size={18} />
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--adm-text)' }}>Letters & Certificates</h4>
                <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--adm-text-muted)', lineHeight: 1.4 }}>
                  Request Bonafide letter, Address Proof, Visa NOC or Experience certificate.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLetterModal(true)}
                className="adm-btn adm-btn-secondary"
                style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', fontSize: '0.78rem' }}
              >
                <Send size={13} />
                <span>Request Document</span>
              </button>
            </div>

            {/* 4. IT Assets & Devices */}
            <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'var(--adm-bg)', border: '1px solid var(--adm-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <Laptop size={18} />
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--adm-text)' }}>IT Assets & Hardware</h4>
                <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--adm-text-muted)', lineHeight: 1.4 }}>
                  Requisition laptops, external monitors, security keys, and accessories.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAssetModal(true)}
                className="adm-btn adm-btn-secondary"
                style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', fontSize: '0.78rem' }}
              >
                <Plus size={13} />
                <span>Request IT Asset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 5: 4.5 PERSONAL GOALS, OKRS & SKILLS ── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'goals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="adm-grid-2" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
            {/* OKRs & Goals */}
            <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'var(--adm-bg)', border: '1px solid var(--adm-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--adm-text)' }}>
                  Active Objectives & Key Results (OKRs)
                </h4>
                <span className="adm-badge adm-badge-success">Q4 2026 Active</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--adm-text)', marginBottom: '4px' }}>
                    <span>Deliver Sprint Tasks within Committed SLA (&lt; 48h turnaround)</span>
                    <span style={{ color: 'var(--adm-primary)' }}>92%</span>
                  </div>
                  <div style={{ width: '100%', height: '7px', background: 'var(--adm-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '92%', height: '100%', background: 'var(--adm-primary)' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--adm-text)', marginBottom: '4px' }}>
                    <span>Code Review Quality & Zero Critical Regressions</span>
                    <span style={{ color: '#10b981' }}>100%</span>
                  </div>
                  <div style={{ width: '100%', height: '7px', background: 'var(--adm-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', background: '#10b981' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--adm-text)', marginBottom: '4px' }}>
                    <span>Complete Enterprise Security & ISO-27001 Certification</span>
                    <span style={{ color: '#f59e0b' }}>75%</span>
                  </div>
                  <div style={{ width: '100%', height: '7px', background: 'var(--adm-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '75%', height: '100%', background: '#f59e0b' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Verified Rating */}
            <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'var(--adm-bg)', border: '1px solid var(--adm-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--adm-text)' }}>
                  Verified Skills Matrix
                </h4>
                <span className="adm-badge adm-badge-primary">HR Validated</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(currentEmpProfile?.skills && currentEmpProfile.skills.length > 0 ? currentEmpProfile.skills : ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Cloud Architecture']).map((skill: string, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'var(--adm-surface)', borderRadius: '8px', border: '1px solid var(--adm-border)' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--adm-text)' }}>{skill}</span>
                    <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> Level 4 (Advanced)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODALS (REGULARIZATION, APPLY LEAVE, PAYSLIP, EXPENSE, LETTER, ASSET) ── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}

      {/* 1. Missed Punch Regularization Modal */}
      {showRegularizeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div className="adm-card" style={{ width: '100%', maxWidth: '480px', padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="var(--adm-primary)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--adm-text)' }}>Attendance Regularization</h3>
              </div>
              <button type="button" onClick={() => setShowRegularizeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--adm-text-dim)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegularizeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--adm-text-dim)', marginBottom: '4px', display: 'block' }}>Regularization Date</label>
                <input type="date" value={regDate} onChange={e => setRegDate(e.target.value)} className="adm-input" style={{ width: '100%' }} required />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--adm-text-dim)', marginBottom: '4px', display: 'block' }}>Type of Request</label>
                  <select value={regType} onChange={e => setRegType(e.target.value as any)} className="adm-input" style={{ width: '100%' }}>
                    <option value="Missed Check-in">Missed Check-in</option>
                    <option value="Missed Check-out">Missed Check-out</option>
                    <option value="Wrong Punch Time">Wrong Punch Time</option>
                  </select>
                </div>
                <div style={{ width: '120px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--adm-text-dim)', marginBottom: '4px', display: 'block' }}>Actual Time</label>
                  <input type="time" value={regTime} onChange={e => setRegTime(e.target.value)} className="adm-input" style={{ width: '100%' }} required />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--adm-text-dim)', marginBottom: '4px', display: 'block' }}>Accurate Reason / Justification</label>
                <textarea
                  rows={3}
                  value={regReason}
                  onChange={e => setRegReason(e.target.value)}
                  placeholder="e.g. On-site client meeting at Bangalore tech park, mobile network latency..."
                  className="adm-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowRegularizeModal(false)} className="adm-btn adm-btn-secondary">Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">Submit to Manager</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Apply Leave Modal */}
      {showApplyLeaveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div className="adm-card" style={{ width: '100%', maxWidth: '480px', padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Coffee size={18} color="var(--adm-primary)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--adm-text)' }}>Apply For Leave</h3>
              </div>
              <button type="button" onClick={() => setShowApplyLeaveModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--adm-text-dim)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--adm-text-dim)', marginBottom: '4px', display: 'block' }}>Leave Category</label>
                <select value={leaveType} onChange={e => setLeaveType(e.target.value as any)} className="adm-input" style={{ width: '100%' }}>
                  <option value="Paid Leave">Paid Annual Leave (Balance: {leaveBalances.paid})</option>
                  <option value="Casual Leave">Casual Leave - CL (Balance: {leaveBalances.casual})</option>
                  <option value="Sick Leave">Sick / Medical Leave (Balance: {leaveBalances.sick})</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--adm-text-dim)', marginBottom: '4px', display: 'block' }}>Start Date</label>
                  <input type="date" value={leaveStart} onChange={e => setLeaveStart(e.target.value)} className="adm-input" style={{ width: '100%' }} required />
                </div>
                {!isHalfDay && (
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--adm-text-dim)', marginBottom: '4px', display: 'block' }}>End Date</label>
                    <input type="date" value={leaveEnd} onChange={e => setLeaveEnd(e.target.value)} className="adm-input" style={{ width: '100%' }} required />
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--adm-text)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isHalfDay} onChange={e => setIsHalfDay(e.target.checked)} style={{ accentColor: 'var(--adm-primary)' }} />
                  <span>Half-Day Leave (Morning or Afternoon Shift)</span>
                </label>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--adm-text-dim)', marginBottom: '4px', display: 'block' }}>Reason for Leave</label>
                <textarea
                  rows={3}
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  placeholder="State the reason clearly for approval..."
                  className="adm-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowApplyLeaveModal(false)} className="adm-btn adm-btn-secondary">Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Official Payslip Viewer Modal */}
      {showPayslipModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div className="adm-card" style={{ width: '100%', maxWidth: '640px', padding: '2rem', borderRadius: '18px', background: '#ffffff', color: '#0f172a' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1070C8', letterSpacing: '-0.3px' }}>
                  ENTERPRENEX SOLUTIONS PVT LTD
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                  CIN: U72200MH2026PTC000000 &bull; Corporate Headquarters, Pune, MH, India
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
                  SALARY SLIP FOR THE MONTH OF OCTOBER 2026
                </div>
              </div>
              <button type="button" onClick={() => setShowPayslipModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {/* Employee Meta Table */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.78rem', marginBottom: '1.25rem', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
              <div><strong style={{ color: '#475569' }}>Employee Name:</strong> {currentEmpProfile?.name || 'Staff Member'}</div>
              <div><strong style={{ color: '#475569' }}>Employee ID:</strong> {currentEmpProfile?.employeeId || '202600000002'}</div>
              <div><strong style={{ color: '#475569' }}>Designation:</strong> {currentEmpProfile?.designation || currentEmpProfile?.role || 'Senior Software Engineer'}</div>
              <div><strong style={{ color: '#475569' }}>Department:</strong> {currentEmpProfile?.department || 'Engineering'}</div>
              <div><strong style={{ color: '#475569' }}>Bank Account:</strong> HDFC Bank ****5012</div>
              <div><strong style={{ color: '#475569' }}>PAN Number:</strong> {currentEmpProfile?.panNumber || 'AAXPE1206M'}</div>
            </div>

            {/* Earnings & Deductions Table */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              {/* Earnings */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#f1f5f9', padding: '6px 10px', fontWeight: 800, fontSize: '0.78rem', color: '#0f172a' }}>Earnings</div>
                <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.76rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Basic Salary</span><strong>₹{basic.toLocaleString('en-IN')}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>House Rent Allowance (HRA)</span><strong>₹{hra.toLocaleString('en-IN')}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Special Allowance</span><strong>₹{specialAllowance.toLocaleString('en-IN')}</strong></div>
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#10b981' }}>
                    <span>Gross Earnings</span><span>₹{baseSalary.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#f1f5f9', padding: '6px 10px', fontWeight: 800, fontSize: '0.78rem', color: '#0f172a' }}>Deductions</div>
                <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.76rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Provident Fund (PF)</span><strong>₹{pf.toLocaleString('en-IN')}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Professional Tax (PT)</span><strong>₹{pt.toLocaleString('en-IN')}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>TDS / Income Tax</span><strong>₹{tds.toLocaleString('en-IN')}</strong></div>
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#ef4444' }}>
                    <span>Total Deductions</span><span>₹{totalDeductions.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Pay Banner */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '10px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#1e40af', fontWeight: 700 }}>NET TAKE-HOME SALARY</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>₹{netPay.toLocaleString('en-IN')}</div>
              </div>
              <span className="adm-badge adm-badge-success" style={{ fontSize: '0.72rem' }}>Transferred to Bank</span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                className="adm-btn adm-btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              >
                <Printer size={14} />
                <span>Print Payslip</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Downloaded', 'Official Payslip PDF saved to device.', 'success');
                  setShowPayslipModal(false);
                }}
                className="adm-btn adm-btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              >
                <Download size={14} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Expense Claim Modal */}
      {showExpenseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div className="adm-card" style={{ width: '100%', maxWidth: '480px', padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} color="var(--adm-primary)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--adm-text)' }}>Submit Expense Claim</h3>
              </div>
              <button type="button" onClick={() => setShowExpenseModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--adm-text-dim)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--adm-text-dim)', marginBottom: '4px', display: 'block' }}>Expense Category</label>
                <select value={expenseCategory} onChange={e => setExpenseCategory(e.target.value as any)} className="adm-input" style={{ width: '100%' }}>
                  <option value="Travel & Commute">Travel & Commute</option>
                  <option value="Client Meeting & Meals">Client Meeting & Meals</option>
                  <option value="Software Tool / License">Software Tool / License</option>
                  <option value="Office Stationery">Office Stationery</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--adm-text-dim)', marginBottom: '4px', display: 'block' }}>Amount (₹ INR)</label>
                  <input type="number" step="1" min="1" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} placeholder="e.g. 1500" className="adm-input" style={{ width: '100%' }} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--adm-text-dim)', marginBottom: '4px', display: 'block' }}>Project Allocated</label>
                  <select value={expenseProject} onChange={e => setExpenseProject(e.target.value)} className="adm-input" style={{ width: '100%' }}>
                    {(projects || []).map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                    <option value="General Operations">General Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--adm-text-dim)', marginBottom: '4px', display: 'block' }}>Purpose / Receipt Notes</label>
                <textarea
                  rows={3}
                  value={expenseNotes}
                  onChange={e => setExpenseNotes(e.target.value)}
                  placeholder="Detail the expense purpose and receipt reference number..."
                  className="adm-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowExpenseModal(false)} className="adm-btn adm-btn-secondary">Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">Submit For Reimbursement</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Letter Request Modal */}
      {showLetterModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div className="adm-card" style={{ width: '100%', maxWidth: '480px', padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck size={18} color="var(--adm-primary)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--adm-text)' }}>Request Official HR Document</h3>
              </div>
              <button type="button" onClick={() => setShowLetterModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--adm-text-dim)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLetterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--adm-text-dim)', marginBottom: '4px', display: 'block' }}>Document / Letter Type</label>
                <select value={letterType} onChange={e => setLetterType(e.target.value as any)} className="adm-input" style={{ width: '100%' }}>
                  <option value="Bonafide Certificate">Bonafide / Proof of Employment Letter</option>
                  <option value="Experience Letter">Experience & Relieving Certificate</option>
                  <option value="Address Proof Letter">Official Address Proof Certificate</option>
                  <option value="Visa NOC Certificate">Visa No-Objection Certificate (NOC)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--adm-text-dim)', marginBottom: '4px', display: 'block' }}>Recipient Entity & Purpose</label>
                <textarea
                  rows={3}
                  value={letterPurpose}
                  onChange={e => setLetterPurpose(e.target.value)}
                  placeholder="e.g. Bank loan application, Passport verification, Embassy submission..."
                  className="adm-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowLetterModal(false)} className="adm-btn adm-btn-secondary">Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">Submit to HR Operations</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. IT Asset Request Modal */}
      {showAssetModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div className="adm-card" style={{ width: '100%', maxWidth: '480px', padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Laptop size={18} color="var(--adm-primary)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--adm-text)' }}>IT Asset Allocation Request</h3>
              </div>
              <button type="button" onClick={() => setShowAssetModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--adm-text-dim)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--adm-text-dim)', marginBottom: '4px', display: 'block' }}>Hardware Requisition</label>
                <select value={assetType} onChange={e => setAssetType(e.target.value as any)} className="adm-input" style={{ width: '100%' }}>
                  <option value="MacBook / High-Performance Laptop">MacBook / High-Performance Development Laptop</option>
                  <option value="27&quot; External 4K Display">27" External 4K Display Monitor</option>
                  <option value="Wireless Keyboard & Ergonomic Mouse">Wireless Keyboard & Ergonomic Mouse</option>
                  <option value="Developer Security YubiKey / Token">Developer Security YubiKey / Hardware Token</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--adm-text-dim)', marginBottom: '4px', display: 'block' }}>Business Justification</label>
                <textarea
                  rows={3}
                  value={assetJustification}
                  onChange={e => setAssetJustification(e.target.value)}
                  placeholder="Specify why this asset is required for active project deliverables..."
                  className="adm-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAssetModal(false)} className="adm-btn adm-btn-secondary">Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">Submit to IT Administration</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
