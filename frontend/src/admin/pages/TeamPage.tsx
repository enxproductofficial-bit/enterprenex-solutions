import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Plus,
  CheckCircle2,
  Phone,
  Mail,
  X,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck,
  Share2,
  Lock,
  UserCheck,
  AlertCircle,
  Download,
  Printer,
  CalendarPlus,
  Trash2,
  RotateCcw,
  FileSpreadsheet,
  Calendar,
  Camera,
  Upload,
  Clock,
  ShieldAlert,
  CheckCheck
} from 'lucide-react';
import type { Employee, LeaveRequest } from '../types';

export const TeamPage: React.FC = () => {
  const {
    employees,
    attendance,
    leaves,
    addEmployee,
    updateEmployee,
    addLeaveRequest,
    updateLeaveStatus,
    deleteLeaveRequest,
    markAttendanceToday,
    currentUser,
    showToast
  } = useAdmin();

  const isDirector = currentUser?.role === 'Super Admin' || currentUser?.email === 'director@enterprenexsolution.com';
  const isManagerOrHr =
    currentUser?.role === 'Project Manager' ||
    currentUser?.department === 'Human Resources' ||
    Boolean(currentUser?.email?.includes('hr@') || currentUser?.email?.includes('manager@'));
  const canManageTeam = isDirector || isManagerOrHr;
  const isRegularEmployee = !canManageTeam;

  const [tab, setTab] = useState<'roster' | 'attendance' | 'leaves'>('roster');
  const [rosterFilter, setRosterFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);

  // Form state - Add Member
  const [name, setName] = useState('');
  const [governanceRole, setGovernanceRole] = useState<'Director' | 'Manager (HR)' | 'Employee'>('Employee');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState<Employee['department']>('Engineering');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('React, TypeScript, Node.js');
  const [salary, setSalary] = useState(100000);
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
  const [avatarPreview, setAvatarPreview] = useState('');

  // Photo modal for existing members
  const [photoModalEmp, setPhotoModalEmp] = useState<Employee | null>(null);
  const [customPhotoInput, setCustomPhotoInput] = useState('');

  // Form state - Apply Leave
  const [applicantName, setApplicantName] = useState(currentUser?.name || 'HR Administrator');
  const [leaveType, setLeaveType] = useState<LeaveRequest['type']>('Casual Leave');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveReason, setLeaveReason] = useState('');

  // Photo upload helper
  const handlePhotoFileChange = (file: File, onDone: (dataUrl: string) => void) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('File Too Large', 'Please select an image smaller than 5MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onDone(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 12-Digit Guaranteed Unique Employee ID Generator (guaranteed non-repeating across all employees)
  const generateUnique12DigitId = (): string => {
    const existingIds = new Set(
      employees
        .map(e => (e.employeeId || '').trim().toUpperCase())
        .filter(Boolean)
    );

    const year = new Date().getFullYear().toString(); // "2026" (4 digits)
    let counter = employees.length + 1;
    let candidate = '';

    // First attempt: Year (4 digits) + 8 digits sequential index = 12 digits (e.g. 202600000002)
    while (counter <= 99999999) {
      const padded = counter.toString().padStart(8, '0');
      candidate = `${year}${padded}`;
      if (!existingIds.has(candidate)) {
        return candidate;
      }
      counter++;
    }

    // High entropy fallback: Year + random 8 digits = 12 digits, checking uniqueness
    do {
      const rand8 = Math.floor(10000000 + Math.random() * 90000000).toString();
      candidate = `${year}${rand8}`;
    } while (existingIds.has(candidate));

    return candidate;
  };

  // Employee ID and Password state
  const [empId, setEmpId] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [showEmpPassword, setShowEmpPassword] = useState(false);

  // Duplicate Check across all employees in database
  const isDuplicateId = Boolean(
    empId.trim() &&
    employees.some(e => (e.employeeId || '').trim().toUpperCase() === empId.trim().toUpperCase())
  );

  // Portal credentials management modal state
  const [credentialEmp, setCredentialEmp] = useState<Employee | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showActivePassword, setShowActivePassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const generateRandomPassword = (prefix = 'EPX') => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pass = `${prefix}@`;
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to Clipboard', text, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // CSV Export utility
  const exportToCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row
          .map(field => {
            const str = String(field ?? '').replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Download Complete', `Exported ${filename}`, 'success');
  };

  // Print Report utility
  const printReport = (title: string, tableHtml: string) => {
    const win = window.open('', '_blank');
    if (!win) {
      showToast('Popup Blocked', 'Please allow popups to generate printable report.', 'warning');
      return;
    }
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Enterprenex Solutions</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 2rem; color: #0f172a; margin: 0; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #059669; padding-bottom: 1rem; margin-bottom: 1.5rem; }
            .brand-name { font-size: 1.4rem; font-weight: 800; color: #0f172a; margin: 0; }
            .brand-name span { color: #059669; }
            .report-title { font-size: 1.1rem; font-weight: 700; color: #334155; margin-top: 4px; }
            .meta { font-size: 0.8rem; color: #64748b; text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.85rem; }
            th, td { border: 1px solid #cbd5e1; padding: 0.6rem 0.75rem; text-align: left; }
            th { background: #f8fafc; color: #1e293b; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
            tr:nth-child(even) { background: #f8fafc; }
            .badge { padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 0.75rem; display: inline-block; }
            .badge-success { background: #dcfce7; color: #15803d; }
            .badge-warning { background: #fef3c7; color: #b45309; }
            .badge-danger { background: #fee2e2; color: #b91c1c; }
            .badge-info { background: #e0f2fe; color: #0369a1; }
            .footer { margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; }
            @media print {
              body { padding: 0.5cm; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand-name">Enterpre<span>nex</span> Solutions Pvt Ltd</div>
              <div class="report-title">${title}</div>
            </div>
            <div class="meta">
              <div><strong>Generated by:</strong> ${currentUser?.name || 'Administrator'}</div>
              <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
          ${tableHtml}
          <div class="footer">
            <div>Confidential &bull; Enterprenex Solutions Official HR Management Record</div>
            <div>Authorized Corporate Document</div>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handleExportAttendanceCsv = () => {
    const headers = ['Team Member', 'Date', 'Check In Time', 'Check Out Time', 'Attendance Status'];
    const rows = attendance.map(a => [
      a.employeeName,
      a.date,
      a.checkIn || '-',
      a.checkOut || '-',
      a.status
    ]);
    exportToCsv(`enterprenex-attendance-${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const handlePrintAttendance = () => {
    const rowsHtml = attendance.map(a => `
      <tr>
        <td><strong>${a.employeeName}</strong></td>
        <td>${a.date}</td>
        <td>${a.checkIn || '-'}</td>
        <td>${a.checkOut || '-'}</td>
        <td><span class="badge ${a.status === 'Present' ? 'badge-success' : a.status === 'Late' ? 'badge-warning' : 'badge-danger'}">${a.status}</span></td>
      </tr>
    `).join('');

    const tableHtml = `
      <table>
        <thead>
          <tr>
            <th>Team Member</th>
            <th>Date</th>
            <th>Check In Time</th>
            <th>Check Out Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="5" style="text-align:center;">No attendance records found.</td></tr>'}
        </tbody>
      </table>
    `;
    printReport('Daily Biometric Attendance Report', tableHtml);
  };

  const handleExportLeavesCsv = () => {
    const headers = ['Applicant', 'Leave Type', 'Start Date', 'End Date', 'Reason', 'Approval Status'];
    const rows = leaves.map(l => [
      l.employeeName,
      l.type,
      l.startDate,
      l.endDate,
      l.reason,
      l.status
    ]);
    exportToCsv(`enterprenex-leave-records-${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const handlePrintLeaves = () => {
    const rowsHtml = leaves.map(l => `
      <tr>
        <td><strong>${l.employeeName}</strong></td>
        <td><span class="badge badge-info">${l.type}</span></td>
        <td>${l.startDate} to ${l.endDate}</td>
        <td>${l.reason}</td>
        <td><span class="badge ${l.status === 'Approved' ? 'badge-success' : l.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}">${l.status}</span></td>
      </tr>
    `).join('');

    const tableHtml = `
      <table>
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Leave Type</th>
            <th>Period</th>
            <th>Reason</th>
            <th>Approval Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="5" style="text-align:center;">No leave applications on record.</td></tr>'}
        </tbody>
      </table>
    `;
    printReport('Employee Leave Approvals & Records', tableHtml);
  };

  const handleExportRosterCsv = () => {
    const headers = ['Employee ID', 'Name', 'Role', 'Department', 'Email', 'Phone', 'Monthly Salary (INR)', 'Rating', 'Status'];
    const rows = employees.map(e => [
      e.employeeId || e.id,
      e.name,
      e.role,
      e.department,
      e.email,
      e.phone,
      e.salaryMonthly,
      e.performanceRating,
      e.status
    ]);
    exportToCsv(`enterprenex-employee-directory-${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const openAddMemberModal = () => {
    const auto12DigitId = generateUnique12DigitId();
    setEmpId(auto12DigitId);
    setEmpPassword(generateRandomPassword('EPX'));
    setShowEmpPassword(true);
    setAvatarPreview('');
    setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
    setShowAddModal(true);
  };

  const openApplyLeaveModal = () => {
    setApplicantName(currentUser?.name || (employees[0]?.name ?? 'HR Administrator'));
    setLeaveType('Casual Leave');
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    setLeaveReason('');
    setShowApplyLeaveModal(true);
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmpId = empId.trim() || generateUnique12DigitId();
    const finalPassword = empPassword.trim() || generateRandomPassword('EPX');

    // Duplicate check validation
    const alreadyExists = employees.some(
      emp => (emp.employeeId || '').trim().toUpperCase() === finalEmpId.toUpperCase()
    );

    if (alreadyExists) {
      showToast(
        'Duplicate Employee ID',
        `Employee ID "${finalEmpId}" is already assigned to another staff member! Please click "Auto Generate (12-Digit)".`,
        'error'
      );
      return;
    }

    const initialApprovalStatus: 'Approved' | 'Pending Director Approval' =
      governanceRole === 'Director' || isDirector ? 'Approved' : 'Pending Director Approval';
    const finalAvatar =
      avatarPreview || avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    addEmployee({
      employeeId: finalEmpId,
      password: finalPassword,
      name,
      role: role ? `${role} (${governanceRole})` : `${governanceRole}`,
      department,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@enterprenex.com`,
      phone: phone || '+91-9876543210',
      avatar: finalAvatar,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      currentProjects: [],
      workloadPercentage: 50,
      joinDate: new Date().toISOString().split('T')[0],
      salaryMonthly: Number(salary),
      performanceRating: 5.0,
      status: 'Active',
      approvalStatus: initialApprovalStatus,
      approvedBy: initialApprovalStatus === 'Approved' ? (currentUser?.name || 'Rohit P. (Managing Director)') : undefined,
      approvedAt: initialApprovalStatus === 'Approved' ? new Date().toISOString() : undefined
    });

    if (initialApprovalStatus === 'Pending Director Approval') {
      showToast(
        'Employee Registered - Awaiting Director Approval',
        `Employee ID ${finalEmpId} added. Awaiting Director Approval (Rohit P. - director@enterprenexsolution.com) before workspace portal login is enabled.`,
        'info'
      );
    } else {
      showToast('Employee Added', `Assigned Unique 12-Digit Employee ID: ${finalEmpId} with active portal access.`, 'success');
    }

    setShowAddModal(false);
    setName('');
    setRole('');
    setEmpPassword('');
    setAvatarPreview('');
  };

  const handleApplyLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim()) {
      showToast('Validation Error', 'Please specify the applicant name.', 'error');
      return;
    }
    if (!leaveReason.trim()) {
      showToast('Validation Error', 'Please provide a reason for the leave.', 'error');
      return;
    }

    addLeaveRequest({
      employeeName: applicantName.trim(),
      type: leaveType,
      startDate,
      endDate,
      reason: leaveReason.trim()
    });

    setShowApplyLeaveModal(false);
    setLeaveReason('');
    setTab('leaves');
  };

  const handleUpdatePassword = (emp: Employee) => {
    if (!newPasswordInput.trim()) {
      showToast('Validation Error', 'Please enter or generate a new password.', 'error');
      return;
    }
    updateEmployee(emp.id, { password: newPasswordInput.trim() });
    setCredentialEmp(prev => prev ? { ...prev, password: newPasswordInput.trim() } : null);
    setNewPasswordInput('');
    showToast('Password Updated', `Updated portal password for ${emp.name} (${emp.employeeId || emp.id}).`, 'success');
  };

  const pendingLeavesCount = leaves.filter(l => l.status === 'Pending').length;

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <h1>Team, Attendance & Workforce Ops</h1>
          <p>Employee capacity roster, daily biometric check-ins, leave approvals & payroll rates</p>
        </div>
        <div className="adm-page-actions" style={{ flexWrap: 'wrap' }}>
          {tab === 'roster' && (
            <>
              <button className="adm-btn adm-btn-secondary" onClick={handleExportRosterCsv} title="Download Team Directory as CSV">
                <Download size={15} />
                <span>Export Roster CSV</span>
              </button>
              {canManageTeam && (
                <button className="adm-btn adm-btn-primary" onClick={openAddMemberModal}>
                  <Plus size={16} />
                  <span>Add Team Member</span>
                </button>
              )}
            </>
          )}

          {tab === 'attendance' && (
            <>
              <button className="adm-btn adm-btn-secondary" onClick={handleExportAttendanceCsv} title="Download Attendance Records as CSV">
                <Download size={15} />
                <span>Export CSV</span>
              </button>
              <button className="adm-btn adm-btn-secondary" onClick={handlePrintAttendance} title="Print or Save as PDF Report">
                <Printer size={15} />
                <span>Print / PDF</span>
              </button>
              <button className="adm-btn adm-btn-primary" onClick={() => markAttendanceToday('Present')}>
                <CheckCircle2 size={15} />
                <span>Mark My Attendance Today</span>
              </button>
            </>
          )}

          {tab === 'leaves' && (
            <>
              <button className="adm-btn adm-btn-secondary" onClick={handleExportLeavesCsv} title="Download Leave Records as CSV">
                <Download size={15} />
                <span>Export CSV</span>
              </button>
              <button className="adm-btn adm-btn-secondary" onClick={handlePrintLeaves} title="Print Official Leave Report">
                <Printer size={15} />
                <span>Print / PDF</span>
              </button>
              <button className="adm-btn adm-btn-primary" onClick={openApplyLeaveModal}>
                <CalendarPlus size={16} />
                <span>Apply for Leave</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="adm-card" style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
        <div className="adm-tabs" style={{ margin: 0, border: 'none' }}>
          <button className={`adm-tab-btn ${tab === 'roster' ? 'active' : ''}`} onClick={() => setTab('roster')}>
            Team Directory ({employees.length})
          </button>
          <button className={`adm-tab-btn ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>
            Daily Attendance ({attendance.length})
          </button>
          <button className={`adm-tab-btn ${tab === 'leaves' ? 'active' : ''}`} onClick={() => setTab('leaves')}>
            {canManageTeam ? 'Leave Approvals' : 'Leave Status & Applications'} ({leaves.length})
            {canManageTeam && pendingLeavesCount > 0 && (
              <span className="adm-badge adm-badge-warning" style={{ marginLeft: '6px', fontSize: '0.65rem' }}>
                {pendingLeavesCount} Pending
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── 1. TEAM ROSTER GRID ── */}
      {tab === 'roster' && (() => {
        const pendingEmployees = employees.filter(e => e.approvalStatus === 'Pending Director Approval');
        const approvedEmployees = employees.filter(e => e.approvalStatus === 'Approved' || !e.approvalStatus);

        const displayedEmployees = employees.filter(e => {
          if (rosterFilter === 'pending') return e.approvalStatus === 'Pending Director Approval';
          if (rosterFilter === 'approved') return e.approvalStatus === 'Approved' || !e.approvalStatus;
          return true;
        });

        return (
          <div>
            {/* Director Review Alert Banner */}
            {pendingEmployees.length > 0 && (
              <div
                style={{
                  background: isDirector ? 'rgba(245, 158, 11, 0.12)' : 'rgba(59, 130, 246, 0.1)',
                  border: `1px solid ${isDirector ? 'rgba(245, 158, 11, 0.35)' : 'rgba(59, 130, 246, 0.3)'}`,
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: isDirector ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isDirector ? '#f59e0b' : '#38bdf8'
                    }}
                  >
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>
                      {isDirector
                        ? `Director Action Required: ${pendingEmployees.length} Employee Account(s) Awaiting Your Approval`
                        : `${pendingEmployees.length} Employee Account(s) Submitted & Awaiting Managing Director Approval`}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                      {isDirector
                        ? 'Employees cannot log into the workspace portal until you approve their 12-digit Employee ID and credentials.'
                        : 'Credentials registered by HR are awaiting approval from Managing Director (Rohit P. - director@enterprenexsolution.com).'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {isDirector && (
                    <button
                      className="adm-btn adm-btn-primary"
                      style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
                      onClick={() => {
                        pendingEmployees.forEach(emp => {
                          updateEmployee(emp.id, {
                            approvalStatus: 'Approved',
                            approvedBy: currentUser?.name || 'Rohit P. (Managing Director)',
                            approvedAt: new Date().toISOString()
                          });
                        });
                        showToast(
                          'All Logins Approved',
                          `Authorized portal access for all ${pendingEmployees.length} pending employee(s).`,
                          'success'
                        );
                      }}
                    >
                      <CheckCheck size={14} />
                      <span>Approve All ({pendingEmployees.length})</span>
                    </button>
                  )}
                  <button
                    className="adm-btn adm-btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
                    onClick={() => setRosterFilter(rosterFilter === 'pending' ? 'all' : 'pending')}
                  >
                    {rosterFilter === 'pending' ? 'Show All Members' : `Filter Pending (${pendingEmployees.length})`}
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--adm-text-dim)', fontWeight: 700, marginRight: '4px' }}>
                  FILTER ROSTER:
                </span>
                <button
                  onClick={() => setRosterFilter('all')}
                  className={`adm-btn adm-btn-sm ${rosterFilter === 'all' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                >
                  All ({employees.length})
                </button>
                <button
                  onClick={() => setRosterFilter('pending')}
                  className={`adm-btn adm-btn-sm ${rosterFilter === 'pending' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                >
                  ⏳ Pending Director Review ({pendingEmployees.length})
                </button>
                <button
                  onClick={() => setRosterFilter('approved')}
                  className={`adm-btn adm-btn-sm ${rosterFilter === 'approved' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                >
                  ✓ Approved ({approvedEmployees.length})
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="adm-btn adm-btn-sm adm-btn-secondary" onClick={handleExportRosterCsv}>
                  <Download size={13} />
                  <span>Export CSV</span>
                </button>
                {canManageTeam && (
                  <button className="adm-btn adm-btn-sm adm-btn-primary" onClick={openAddMemberModal}>
                    <Plus size={14} />
                    <span>Add Member</span>
                  </button>
                )}
              </div>
            </div>

            <div className="adm-grid-3">
              {displayedEmployees.map(emp => {
                const displayEmpId = emp.employeeId || (emp.id.startsWith('emp-') ? `EPX-10${emp.id.replace('emp-', '')}` : emp.id);
                const isPending = emp.approvalStatus === 'Pending Director Approval';
                const isRejected = emp.approvalStatus === 'Rejected';
                const isApproved = emp.approvalStatus === 'Approved' || !emp.approvalStatus;

                return (
                  <div
                    key={emp.id}
                    className="adm-card adm-card-hover"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      border: isPending
                        ? '1px solid rgba(245, 158, 11, 0.45)'
                        : isRejected
                        ? '1px solid rgba(239, 68, 68, 0.45)'
                        : undefined
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                      {/* Avatar with Camera Update Button */}
                      <div style={{ position: 'relative', flexShrink: 0, width: '90px', height: '100px' }}>
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="adm-avatar-lg"
                          style={{
                            width: '90px',
                            height: '100px',
                            maxWidth: '90px',
                            maxHeight: '100px',
                            borderRadius: '10px',
                            objectFit: 'cover',
                            display: 'block',
                            border: isPending ? '2px solid #f59e0b' : '2px solid rgba(255, 255, 255, 0.1)'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoModalEmp(emp);
                            setCustomPhotoInput(emp.avatar || '');
                          }}
                          style={{
                            position: 'absolute',
                            bottom: '-4px',
                            right: '-4px',
                            background: '#059669',
                            color: '#fff',
                            border: '2px solid #14171d',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
                          }}
                          title="Change or upload profile photo"
                        >
                          <Camera size={12} />
                        </button>
                      </div>

                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>{emp.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--adm-primary)', fontWeight: 600 }}>{emp.role}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>{emp.department}</div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span className="adm-badge adm-badge-success" style={{ fontSize: '0.65rem' }}>{emp.status}</span>
                        <span className="adm-badge adm-badge-primary" style={{ fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 700 }}>
                          {displayEmpId}
                        </span>
                      </div>
                    </div>

                    {/* Approval Workflow Box */}
                    {isPending && (
                      <div
                        style={{
                          background: 'rgba(245, 158, 11, 0.08)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          marginBottom: '0.85rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f59e0b', fontWeight: 700, fontSize: '0.78rem' }}>
                            <Clock size={13} />
                            <span>Awaiting Director Approval</span>
                          </div>
                          <span className="adm-badge adm-badge-warning" style={{ fontSize: '0.65rem' }}>
                            Login Inactive
                          </span>
                        </div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                          {isDirector
                            ? 'Employee was registered by HR. Click below to approve credentials and enable portal login.'
                            : 'Waiting for Managing Director (Rohit P. - director@enterprenexsolution.com) to approve login access.'}
                        </p>

                        {isDirector ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="adm-btn adm-btn-primary"
                              style={{ flex: 1, padding: '0.35rem 0.6rem', fontSize: '0.75rem', justifyContent: 'center' }}
                              onClick={() => {
                                updateEmployee(emp.id, {
                                  approvalStatus: 'Approved',
                                  approvedBy: currentUser?.name || 'Rohit P. (Managing Director)',
                                  approvedAt: new Date().toISOString()
                                });
                                showToast('Login Approved', `Authorized portal login for ${emp.name} (${displayEmpId}).`, 'success');
                              }}
                            >
                              <Check size={13} />
                              <span>Approve Login Access</span>
                            </button>
                            <button
                              type="button"
                              className="adm-btn adm-btn-danger"
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                              onClick={() => {
                                updateEmployee(emp.id, { approvalStatus: 'Rejected' });
                                showToast('Login Rejected', `Disabled access for ${emp.name}.`, 'warning');
                              }}
                              title="Reject registration"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="adm-btn adm-btn-secondary"
                            style={{ width: '100%', padding: '0.35rem 0.6rem', fontSize: '0.72rem', justifyContent: 'center' }}
                            onClick={() => {
                              const text =
                                `*ENTERPRENEX APPROVAL REQUEST*\n\n` +
                                `Managing Director Rohit P., please approve login for new employee:\n` +
                                `*Name:* ${emp.name}\n` +
                                `*Employee ID:* ${displayEmpId}\n` +
                                `*Official Email:* ${emp.email}\n` +
                                `*Role:* ${emp.role}\n` +
                                `*Approval Portal:* https://www.enterprenexsolution.com/admin/team`;
                              copyToClipboard(text, `req-${emp.id}`);
                            }}
                          >
                            <Share2 size={12} />
                            <span>{copiedKey === `req-${emp.id}` ? 'Request Copied to Clipboard!' : 'Share Approval Request to Director'}</span>
                          </button>
                        )}
                      </div>
                    )}

                    {isRejected && (
                      <div
                        style={{
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '8px',
                          padding: '0.65rem 0.75rem',
                          marginBottom: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>
                          ✕ Login Access Rejected by Director
                        </div>
                        {isDirector && (
                          <button
                            type="button"
                            className="adm-btn adm-btn-primary"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                            onClick={() => {
                              updateEmployee(emp.id, {
                                approvalStatus: 'Approved',
                                approvedBy: currentUser?.name || 'Rohit P. (Managing Director)',
                                approvedAt: new Date().toISOString()
                              });
                              showToast('Login Approved', `Restored portal login for ${emp.name}.`, 'success');
                            }}
                          >
                            Re-Approve
                          </button>
                        )}
                      </div>
                    )}

                    {/* Workload */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                        <span style={{ color: 'var(--adm-text-dim)' }}>Sprint Workload</span>
                        <span style={{
                          fontWeight: 700,
                          color: emp.workloadPercentage > 85 ? 'var(--adm-danger)' : emp.workloadPercentage > 70 ? 'var(--adm-warning)' : 'var(--adm-success)'
                        }}>
                          {emp.workloadPercentage}%
                        </span>
                      </div>
                      <div className="adm-progress-bar">
                        <div
                          className="adm-progress-fill"
                          style={{
                            width: `${emp.workloadPercentage}%`,
                            background: emp.workloadPercentage > 85 ? 'var(--adm-danger)' : emp.workloadPercentage > 70 ? 'var(--adm-warning)' : 'var(--adm-success)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Skills */}
                    <div style={{ marginBottom: '1rem', flex: 1 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {emp.skills.map((sk, idx) => (
                          <span key={idx} className="adm-badge adm-badge-neutral" style={{ fontSize: '0.68rem' }}>{sk}</span>
                        ))}
                      </div>
                    </div>

                    {/* Contact */}
                    <div style={{ background: 'var(--adm-bg)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--adm-border)', fontSize: '0.75rem', color: 'var(--adm-text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={12} color="var(--adm-primary)" /> {emp.email}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={12} color="var(--adm-info)" /> {emp.phone}
                      </div>
                    </div>

                    {/* Credentials & Access Bar */}
                    <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid var(--adm-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="adm-badge adm-badge-neutral" style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.72rem' }}>
                          {displayEmpId}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: isPending ? '#f59e0b' : isRejected ? '#ef4444' : 'var(--adm-success)', fontWeight: 600 }}>
                          {isPending ? 'Approval Pending' : isRejected ? 'Access Denied' : 'Access Active'}
                        </span>
                      </div>

                      {/* Security RBAC: Director credentials protected from HR, and employee credentials only manageable by HR/Director */}
                      {(emp.email === 'director@enterprenexsolution.com' || emp.role.includes('Director') || emp.id === 'emp-1') && !isDirector ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.3rem 0.6rem', background: 'rgba(5, 150, 105, 0.1)', border: '1px solid rgba(5, 150, 105, 0.3)', borderRadius: '6px', fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>
                          <ShieldCheck size={13} />
                          <span>Executive Protected</span>
                        </div>
                      ) : canManageTeam ? (
                        <button
                          className="adm-btn adm-btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', gap: '5px' }}
                          onClick={() => {
                            setCredentialEmp(emp);
                            setNewPasswordInput('');
                            setShowActivePassword(false);
                          }}
                        >
                          <Key size={13} color="#f59e0b" />
                          <span>Portal Credentials</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── 2. ATTENDANCE LOGS ── */}
      {tab === 'attendance' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--adm-text-dim)', fontWeight: 600 }}>
              DAILY BIOMETRIC ATTENDANCE LOGS ({attendance.length} RECORDS)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="adm-btn adm-btn-sm adm-btn-secondary" onClick={handleExportAttendanceCsv}>
                <Download size={13} />
                <span>Export CSV</span>
              </button>
              <button className="adm-btn adm-btn-sm adm-btn-secondary" onClick={handlePrintAttendance}>
                <Printer size={13} />
                <span>Print / PDF</span>
              </button>
              <button className="adm-btn adm-btn-sm adm-btn-primary" onClick={() => markAttendanceToday('Present')}>
                <CheckCircle2 size={13} />
                <span>Mark Attendance</span>
              </button>
            </div>
          </div>

          <div className="adm-table-container">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>Date</th>
                  <th>Check In Time</th>
                  <th>Check Out Time</th>
                  <th>Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--adm-text-dim)' }}>
                      No attendance logged for today. Click "Mark Attendance" above to record your entry.
                    </td>
                  </tr>
                ) : (
                  attendance.map(att => (
                    <tr key={att.id}>
                      <td style={{ fontWeight: 700, color: '#fff' }}>{att.employeeName}</td>
                      <td>{att.date}</td>
                      <td>{att.checkIn || '-'}</td>
                      <td>{att.checkOut || '-'}</td>
                      <td>
                        <span className={`adm-badge ${
                          att.status === 'Present' ? 'adm-badge-success' :
                          att.status === 'Late' ? 'adm-badge-warning' : 'adm-badge-danger'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 3. LEAVE APPROVALS ── */}
      {tab === 'leaves' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--adm-text-dim)', fontWeight: 600 }}>
                {canManageTeam ? 'LEAVE APPLICATIONS & APPROVALS' : 'LEAVE APPLICATIONS & STATUS'} ({leaves.length} TOTAL)
              </span>
              {canManageTeam && (
                pendingLeavesCount > 0 ? (
                  <span className="adm-badge adm-badge-warning">{pendingLeavesCount} Pending Review</span>
                ) : (
                  <span className="adm-badge adm-badge-success">All Reviewed</span>
                )
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="adm-btn adm-btn-sm adm-btn-secondary" onClick={handleExportLeavesCsv}>
                <Download size={13} />
                <span>Export CSV</span>
              </button>
              <button className="adm-btn adm-btn-sm adm-btn-secondary" onClick={handlePrintLeaves}>
                <Printer size={13} />
                <span>Print / PDF</span>
              </button>
              <button className="adm-btn adm-btn-sm adm-btn-primary" onClick={openApplyLeaveModal}>
                <CalendarPlus size={14} />
                <span>Apply for Leave</span>
              </button>
            </div>
          </div>

          <div className="adm-table-container">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Leave Type</th>
                  <th>Dates Requested</th>
                  <th>Reason</th>
                  <th>Approval Status</th>
                  <th>{canManageTeam ? 'Actions / Decision' : 'Action / Status'}</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                        <CalendarPlus size={36} color="var(--adm-primary)" />
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>No Leave Requests on Record</div>
                        <p style={{ color: 'var(--adm-text-dim)', fontSize: '0.82rem', margin: 0, maxWidth: '400px' }}>
                          Employees and staff can submit Sick, Casual, or Paid leave requests. Click below to submit a new leave request.
                        </p>
                        <button className="adm-btn adm-btn-primary" style={{ marginTop: '0.5rem' }} onClick={openApplyLeaveModal}>
                          <CalendarPlus size={15} />
                          <span>Submit Leave Request</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leaves.map(lv => (
                    <tr key={lv.id}>
                      <td style={{ fontWeight: 700, color: '#fff' }}>{lv.employeeName}</td>
                      <td>
                        <span className="adm-badge adm-badge-neutral" style={{ fontWeight: 600 }}>{lv.type}</span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {lv.startDate} {lv.startDate !== lv.endDate ? `to ${lv.endDate}` : ''}
                      </td>
                      <td style={{ color: '#cbd5e1', maxWidth: '280px' }}>{lv.reason}</td>
                      <td>
                        <span className={`adm-badge ${
                          lv.status === 'Approved' ? 'adm-badge-success' :
                          lv.status === 'Rejected' ? 'adm-badge-danger' : 'adm-badge-warning'
                        }`}>
                          {lv.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {canManageTeam ? (
                            lv.status === 'Pending' ? (
                              <>
                                <button
                                  className="adm-btn adm-btn-sm adm-btn-primary"
                                  style={{ padding: '0.3rem 0.65rem', background: '#059669', borderColor: '#059669' }}
                                  onClick={() => updateLeaveStatus(lv.id, 'Approved')}
                                >
                                  <Check size={13} />
                                  <span>Approve</span>
                                </button>
                                <button
                                  className="adm-btn adm-btn-sm adm-btn-danger"
                                  style={{ padding: '0.3rem 0.65rem' }}
                                  onClick={() => updateLeaveStatus(lv.id, 'Rejected')}
                                >
                                  <X size={13} />
                                  <span>Reject</span>
                                </button>
                              </>
                            ) : lv.status === 'Approved' ? (
                              <>
                                <button
                                  className="adm-btn adm-btn-sm adm-btn-secondary"
                                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.72rem' }}
                                  onClick={() => updateLeaveStatus(lv.id, 'Rejected')}
                                  title="Change decision to Rejected"
                                >
                                  Reject
                                </button>
                                <button
                                  className="adm-btn adm-btn-sm adm-btn-secondary"
                                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.72rem' }}
                                  onClick={() => deleteLeaveRequest(lv.id)}
                                  title="Delete this record"
                                >
                                  <Trash2 size={12} color="#ef4444" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="adm-btn adm-btn-sm adm-btn-primary"
                                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.72rem' }}
                                  onClick={() => updateLeaveStatus(lv.id, 'Approved')}
                                  title="Re-approve this leave"
                                >
                                  Approve
                                </button>
                                <button
                                  className="adm-btn adm-btn-sm adm-btn-secondary"
                                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.72rem' }}
                                  onClick={() => deleteLeaveRequest(lv.id)}
                                  title="Delete this record"
                                >
                                  <Trash2 size={12} color="#ef4444" />
                                </button>
                              </>
                            )
                          ) : (
                            // Regular employee view: Cannot approve/reject leaves
                            lv.employeeName.trim().toLowerCase() === (currentUser?.name || '').trim().toLowerCase() ? (
                              lv.status === 'Pending' ? (
                                <button
                                  className="adm-btn adm-btn-sm adm-btn-secondary"
                                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.72rem', color: '#ef4444', gap: '4px' }}
                                  onClick={() => deleteLeaveRequest(lv.id)}
                                  title="Withdraw your leave application"
                                >
                                  <X size={12} />
                                  <span>Withdraw</span>
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.72rem', color: lv.status === 'Approved' ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                  {lv.status === 'Approved' ? '✓ Approved' : '✕ Declined'}
                                </span>
                              )
                            ) : (
                              <span style={{ fontSize: '0.72rem', color: lv.status === 'Approved' ? '#10b981' : lv.status === 'Rejected' ? '#ef4444' : 'var(--adm-text-dim)', fontStyle: 'italic' }}>
                                {lv.status === 'Pending' ? 'Pending HR Review' : lv.status === 'Approved' ? '✓ Approved' : '✕ Declined'}
                              </span>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── APPLY FOR LEAVE MODAL ── */}
      {showApplyLeaveModal && (
        <div className="adm-modal-overlay" onClick={() => setShowApplyLeaveModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Submit Leave Application
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--adm-text-dim)' }}>
                  Request sick leave, casual time off, or personal days for review
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setShowApplyLeaveModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyLeaveSubmit} style={{ marginTop: '1rem' }}>
              <div className="adm-form-group">
                <label className="adm-form-label">Applicant Name *</label>
                <input
                  className="adm-input"
                  required
                  value={applicantName}
                  onChange={e => setApplicantName(e.target.value)}
                  placeholder="Enter employee or staff name"
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Leave Category *</label>
                <select
                  className="adm-select"
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value as any)}
                >
                  <option value="Casual Leave">Casual Leave (Personal / Festival)</option>
                  <option value="Sick Leave">Sick Leave (Medical / Doctor Visit)</option>
                  <option value="Paid Leave">Paid Annual Leave</option>
                  <option value="Unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Start Date *</label>
                  <input
                    className="adm-input"
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                  />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">End Date *</label>
                  <input
                    className="adm-input"
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Reason & Justification *</label>
                <textarea
                  className="adm-textarea"
                  required
                  rows={3}
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  placeholder="Provide concise details for Director / HR review..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowApplyLeaveModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary">
                  <CalendarPlus size={15} />
                  <span>Submit Leave Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD EMPLOYEE MODAL ── */}
      {showAddModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Add Team Member to Roster</h3>
              <button className="adm-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee}>
              {/* Credentials Configuration Box */}
              <div style={{ background: 'rgba(5, 150, 105, 0.08)', border: '1px solid rgba(5, 150, 105, 0.28)', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem', color: '#34d399', fontSize: '0.85rem', fontWeight: 700 }}>
                  <Key size={16} />
                  <span>Unique Portal Access Credentials (Login ID & Password)</span>
                </div>
                <div className="adm-grid-2">
                  <div className="adm-form-group" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="adm-form-label" style={{ margin: 0, fontSize: '0.78rem' }}>
                        Unique Employee ID (12 Digits) *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const freshId = generateUnique12DigitId();
                          setEmpId(freshId);
                          showToast('Generated 12-Digit ID', `Assigned: ${freshId}`, 'info');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#34d399',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontWeight: 600
                        }}
                        title="Auto-generate a non-repeating 12-digit corporate ID"
                      >
                        <RefreshCw size={11} /> Auto Generate (12-Digit)
                      </button>
                    </div>
                    <input
                      className="adm-input"
                      required
                      value={empId}
                      onChange={e => setEmpId(e.target.value.trim().toUpperCase())}
                      placeholder="e.g. 202600000001"
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        borderColor: isDuplicateId ? '#ef4444' : undefined
                      }}
                    />
                    {isDuplicateId ? (
                      <div style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <AlertCircle size={12} />
                        <span>This ID is already assigned! Click "Auto Generate (12-Digit)".</span>
                      </div>
                    ) : empId.trim().length === 12 && /^\d{12}$/.test(empId.trim()) ? (
                      <div style={{ color: '#34d399', fontSize: '0.72rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <Check size={12} />
                        <span>Unique 12-digit ID verified (Guaranteed Non-Repeating)</span>
                      </div>
                    ) : empId.trim().length > 0 ? (
                      <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '4px' }}>
                        Length: {empId.trim().length} digits (12-digit numeric format recommended)
                      </div>
                    ) : null}
                  </div>
                  <div className="adm-form-group" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="adm-form-label" style={{ margin: 0, fontSize: '0.78rem' }}>Initial Access Password *</label>
                      <button
                        type="button"
                        onClick={() => setEmpPassword(generateRandomPassword('EPX'))}
                        style={{ background: 'none', border: 'none', color: '#34d399', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}
                      >
                        <RefreshCw size={11} /> Generate
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="adm-input"
                        type={showEmpPassword ? 'text' : 'password'}
                        required
                        value={empPassword}
                        onChange={e => setEmpPassword(e.target.value)}
                        placeholder="Set portal password"
                        style={{ paddingRight: '2.5rem', fontFamily: 'monospace' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmpPassword(!showEmpPassword)}
                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                      >
                        {showEmpPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>
                <p style={{ margin: '0.65rem 0 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                  The employee can sign in at <strong>enterprenexsolution.com/login</strong> using this unique <strong>12-digit Employee ID</strong> or their email and this password. This ID is permanently unique and will never repeat for any other employee.
                </p>
              </div>

              {/* Profile Photo Upload Box */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--adm-border)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={avatarPreview || avatar}
                    alt="Profile Avatar"
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--adm-primary)',
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                    }}
                  />
                  {avatarPreview && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: '#10b981',
                        border: '2px solid #000'
                      }}
                    />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <label className="adm-form-label" style={{ margin: '0 0 4px 0', fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>
                    Profile Photo (Upload from PC or Mobile)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <label
                      className="adm-btn adm-btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', margin: 0, gap: '6px' }}
                    >
                      <Camera size={13} color="var(--adm-primary)" />
                      <span>{avatarPreview ? 'Change Selected Photo' : 'Upload Employee Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handlePhotoFileChange(file, url => {
                              setAvatarPreview(url);
                              showToast('Photo Loaded', 'Profile photo uploaded successfully.', 'info');
                            });
                          }
                        }}
                      />
                    </label>

                    {avatarPreview && (
                      <button
                        type="button"
                        className="adm-btn adm-btn-secondary"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.72rem' }}
                        onClick={() => {
                          setAvatarPreview('');
                          setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
                        }}
                      >
                        Reset to Default
                      </button>
                    )}
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#94a3b8' }}>
                    Formats: JPG, PNG, WebP. Custom photo will display across team directory, ID card and workspace.
                  </p>
                </div>
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Full Name *</label>
                  <input className="adm-input" required value={name} onChange={e => setName(e.target.value)} placeholder="Enter Employee Full Name" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Governance Role *</label>
                  <select className="adm-select" value={governanceRole} onChange={e => setGovernanceRole(e.target.value as any)}>
                    <option value="Employee">Employee (Engineering / Delivery)</option>
                    <option value="Manager (HR)">Manager (Includes HR & Ops)</option>
                    <option value="Director">Director (Executive Board)</option>
                  </select>
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Specific Role Title *</label>
                <input className="adm-input" required value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior Full Stack Engineer" />
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Department</label>
                  <select className="adm-select" value={department} onChange={e => setDepartment(e.target.value as any)}>
                    <option value="Engineering">Engineering</option>
                    <option value="AI & ML">AI & ML</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Finance & HR">Finance & HR</option>
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Monthly Compensation (₹)</label>
                  <input className="adm-input" type="number" value={salary} onChange={e => setSalary(Number(e.target.value))} />
                </div>
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Email</label>
                  <input className="adm-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@enterprenex.com" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Phone</label>
                  <input className="adm-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91-9876543210" />
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Skills (Comma separated)</label>
                <input className="adm-input" value={skills} onChange={e => setSkills(e.target.value)} placeholder="Python, PyTorch, Docker, Kubernetes" />
              </div>

              {/* Approval Notice */}
              <div
                style={{
                  background: isDirector ? 'rgba(5, 150, 105, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                  border: `1px solid ${isDirector ? 'rgba(5, 150, 105, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.72rem',
                  color: '#cbd5e1'
                }}
              >
                {isDirector ? (
                  <span>
                    ✓ As Managing Director, this employee will be automatically approved for immediate portal login.
                  </span>
                ) : (
                  <span>
                    ⏳ <strong>Director Approval Required:</strong> As HR, after adding this team member, login access will be pending until Managing Director (Rohit P. - director@enterprenexsolution.com) reviews and approves the credentials.
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PORTAL CREDENTIALS & ACCESS MODAL ── */}
      {credentialEmp && (
        <div className="adm-modal-overlay" onClick={() => setCredentialEmp(null)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Employee Portal Credentials
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--adm-text-dim)' }}>
                  {credentialEmp.name} &bull; {credentialEmp.role}
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setCredentialEmp(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              {/* Credentials Overview Card */}
              <div style={{ background: '#0e1217', border: '1px solid var(--adm-border)', borderRadius: '12px', padding: '1.15rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--adm-text-dim)', fontWeight: 600 }}>UNIQUE EMPLOYEE ID</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#34d399', fontSize: '0.95rem' }}>
                      {credentialEmp.employeeId || credentialEmp.id}
                    </span>
                    <button
                      className="adm-btn adm-btn-secondary"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                      onClick={() => copyToClipboard(credentialEmp.employeeId || credentialEmp.id, 'id')}
                    >
                      {copiedKey === 'id' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      <span>{copiedKey === 'id' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--adm-text-dim)', fontWeight: 600 }}>OFFICIAL EMAIL</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#fff', fontSize: '0.85rem' }}>{credentialEmp.email}</span>
                    <button
                      className="adm-btn adm-btn-secondary"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                      onClick={() => copyToClipboard(credentialEmp.email, 'email')}
                    >
                      {copiedKey === 'email' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      <span>{copiedKey === 'email' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--adm-text-dim)', fontWeight: 600 }}>ACTIVE PASSWORD</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b', fontSize: '0.9rem' }}>
                      {showActivePassword ? (credentialEmp.password || 'Enx_sol_121006') : '••••••••••••'}
                    </span>
                    <button
                      className="adm-btn adm-btn-secondary"
                      style={{ padding: '0.2rem 0.4rem' }}
                      onClick={() => setShowActivePassword(!showActivePassword)}
                      title={showActivePassword ? 'Hide password' : 'Show password'}
                    >
                      {showActivePassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button
                      className="adm-btn adm-btn-secondary"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                      onClick={() => copyToClipboard(credentialEmp.password || 'Enx_sol_121006', 'pass')}
                    >
                      {copiedKey === 'pass' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      <span>{copiedKey === 'pass' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Director Approval Status Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--adm-border)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--adm-text-dim)', fontWeight: 600 }}>DIRECTOR APPROVAL</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      className={`adm-badge ${
                        credentialEmp.approvalStatus === 'Approved' || !credentialEmp.approvalStatus
                          ? 'adm-badge-success'
                          : credentialEmp.approvalStatus === 'Rejected'
                          ? 'adm-badge-danger'
                          : 'adm-badge-warning'
                      }`}
                      style={{ fontSize: '0.72rem' }}
                    >
                      {credentialEmp.approvalStatus || 'Approved'}
                    </span>
                    {credentialEmp.approvalStatus === 'Pending Director Approval' && isDirector && (
                      <button
                        type="button"
                        className="adm-btn adm-btn-primary"
                        style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}
                        onClick={() => {
                          updateEmployee(credentialEmp.id, {
                            approvalStatus: 'Approved',
                            approvedBy: currentUser?.name || 'Rohit P. (Managing Director)',
                            approvedAt: new Date().toISOString()
                          });
                          setCredentialEmp(prev => prev ? { ...prev, approvalStatus: 'Approved' } : null);
                          showToast('Login Approved', `Authorized login for ${credentialEmp.name}.`, 'success');
                        }}
                      >
                        Approve Now
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Reset Password Section */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--adm-border)', borderRadius: '12px', padding: '1.15rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} color="var(--adm-primary)" />
                  <span>Reset / Change Employee Password</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      className="adm-input"
                      value={newPasswordInput}
                      onChange={e => setNewPasswordInput(e.target.value)}
                      placeholder="Type new password or generate..."
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>
                  <button
                    type="button"
                    className="adm-btn adm-btn-secondary"
                    onClick={() => setNewPasswordInput(generateRandomPassword('EPX'))}
                    title="Generate secure random password"
                  >
                    <RefreshCw size={14} />
                    <span>Generate</span>
                  </button>
                  <button
                    type="button"
                    className="adm-btn adm-btn-primary"
                    onClick={() => handleUpdatePassword(credentialEmp)}
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Share Onboarding Pack */}
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}
                onClick={() => {
                  const empIdVal = credentialEmp.employeeId || credentialEmp.id;
                  const passVal = credentialEmp.password || 'Enx_sol_121006';
                  const approvalInfo =
                    credentialEmp.approvalStatus === 'Pending Director Approval'
                      ? '⚠️ Status: Pending Director Approval'
                      : '✓ Status: Director Approved & Active';
                  const packText = `*ENTERPRENEX SOLUTIONS - OFFICIAL WORKSPACE ACCESS*\n\n` +
                    `*Employee Name:* ${credentialEmp.name}\n` +
                    `*Employee ID:* ${empIdVal}\n` +
                    `*Official Email:* ${credentialEmp.email}\n` +
                    `*Portal Password:* ${passVal}\n` +
                    `${approvalInfo}\n` +
                    `*Login Portal:* https://www.enterprenexsolution.com/login\n\n` +
                    `_Please keep your credentials confidential._`;
                  copyToClipboard(packText, 'pack');
                }}
              >
                {copiedKey === 'pack' ? <Check size={15} color="#10b981" /> : <Share2 size={15} />}
                <span>{copiedKey === 'pack' ? 'Onboarding Pack Copied to Clipboard!' : 'Copy Full WhatsApp / Email Credentials Pack'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── UPDATE PROFILE PHOTO MODAL ── */}
      {photoModalEmp && (
        <div className="adm-modal-overlay" onClick={() => setPhotoModalEmp(null)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Update Profile Photo
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--adm-text-dim)' }}>
                  {photoModalEmp.name} &bull; {photoModalEmp.employeeId || photoModalEmp.id}
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setPhotoModalEmp(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ textAlign: 'center', margin: '1.5rem 0 1rem' }}>
              <img
                src={customPhotoInput || photoModalEmp.avatar}
                alt={photoModalEmp.name}
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--adm-primary)',
                  boxShadow: '0 0 25px rgba(5, 150, 105, 0.35)',
                  display: 'inline-block'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <label
                className="adm-btn adm-btn-secondary"
                style={{ justifyContent: 'center', padding: '0.65rem', cursor: 'pointer', gap: '8px' }}
              >
                <Camera size={16} color="var(--adm-primary)" />
                <span>Upload From Computer / Phone</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handlePhotoFileChange(file, url => {
                        setCustomPhotoInput(url);
                        showToast('Photo Ready', 'Click "Save Profile Photo" to apply.', 'info');
                      });
                    }
                  }}
                />
              </label>

              <div className="adm-form-group" style={{ margin: 0 }}>
                <label className="adm-form-label" style={{ fontSize: '0.75rem' }}>Or Paste Image Web URL</label>
                <input
                  className="adm-input"
                  value={customPhotoInput}
                  onChange={e => setCustomPhotoInput(e.target.value)}
                  placeholder="https://..."
                  style={{ fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setPhotoModalEmp(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-primary"
                  onClick={() => {
                    if (customPhotoInput.trim()) {
                      updateEmployee(photoModalEmp.id, { avatar: customPhotoInput.trim() });
                      setPhotoModalEmp(null);
                      showToast('Profile Photo Updated', `New photo saved for ${photoModalEmp.name}.`, 'success');
                    } else {
                      showToast('No Photo Selected', 'Please choose a photo to update.', 'warning');
                    }
                  }}
                >
                  Save Profile Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
