import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAdmin } from '../context/AdminContext';

const EmployeePreviewDrawer = lazy(() =>
  import('../components/EmployeePreviewDrawer').then(m => ({ default: m.EmployeePreviewDrawer }))
);
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
  Shield,
  FileText,
  Share2,
  Lock,
  AlertCircle,
  Download,
  Printer,
  Calendar,
  CalendarPlus,
  Trash2,
  Camera,
  Upload,
  Clock,
  ShieldAlert,
  CheckCheck,
  Award,
  CheckCircle,
  MessageSquare,
  MessageCircle
} from 'lucide-react';
import { COMPANY_LOGO_BASE64, COMPANY_SEAL_BASE64, COMPANY_WATERMARK_BASE64 } from '../data/companyLogo';
import type { Employee, LeaveRequest, AttendanceRecord } from '../types';

export const ENTERPRENEX_HOLIDAYS_2026 = [
  { name: 'Republic Day', date: '26 Jan 2026', day: 'Monday', type: 'National Holiday' },
  { name: 'Maha Shivratri', date: '15 Feb 2026', day: 'Sunday', type: 'Festival' },
  { name: 'Holi (Rang Panchami)', date: '25 Mar 2026', day: 'Wednesday', type: 'Festival' },
  { name: 'Good Friday', date: '03 Apr 2026', day: 'Friday', type: 'Observance' },
  { name: 'Eid-ul-Fitr', date: '10 Apr 2026', day: 'Friday', type: 'Festival' },
  { name: 'Maharashtra Day / Labour Day', date: '01 May 2026', day: 'Friday', type: 'State Holiday' },
  { name: 'Independence Day', date: '15 Aug 2026', day: 'Saturday', type: 'National Holiday' },
  { name: 'Ganesh Chaturthi', date: '14 Sep 2026', day: 'Monday', type: 'Festival' },
  { name: 'Mahatma Gandhi Jayanti', date: '02 Oct 2026', day: 'Friday', type: 'National Holiday' },
  { name: 'Dussehra (Vijayadashami)', date: '20 Oct 2026', day: 'Tuesday', type: 'Festival' },
  { name: 'Diwali (Laxmi Pujan)', date: '08 Nov 2026', day: 'Sunday', type: 'Festival' },
  { name: 'Diwali (Balipratipada)', date: '10 Nov 2026', day: 'Tuesday', type: 'Festival' },
  { name: 'Christmas Day', date: '25 Dec 2026', day: 'Friday', type: 'Festival' }
];

export const ENTERPRENEX_POLICIES = [
  {
    code: 'EPX-POL-001',
    title: 'Code of Business Conduct & Ethics (2026)',
    category: 'Corporate Governance',
    effectiveDate: '01 Jan 2026',
    summary: 'Establishes fundamental commitments to integrity, anti-bribery, client intellectual property confidentiality, conflict of interest, and fair workplace culture.',
    sections: [
      { heading: '1. Professional Integrity', content: 'Every employee must uphold the highest standards of honesty, business ethics, and transparent execution in all project delivery and client communications.' },
      { heading: '2. Client IP & Confidentiality', content: 'Proprietary enterprise source code, algorithmic formulations, credentials, and client database records remain strictly confidential under perpetual Non-Disclosure agreements.' },
      { heading: '3. Equal Opportunity & Fair Treatment', content: 'Enterprenex enforces zero tolerance for discrimination based on race, gender, religion, age, or disability in all hiring, promotions, and daily collaboration.' }
    ]
  },
  {
    code: 'EPX-POL-002',
    title: 'Corporate Leave, Working Hours & Late Mark Policy',
    category: 'Workforce Operations',
    effectiveDate: '01 Jan 2026',
    summary: 'Specifies core shift hours (09:30 AM to 06:30 PM), automatic late mark thresholds (> 09:30 AM), half-day calculations, and annual leave allocations (12 CL, 8 SL, 15 EL).',
    sections: [
      { heading: '1. Shift Timing & Geo-Fence Rules', content: 'Standard working hours are 09:30 AM to 06:30 PM IST. Biometric or Web GPS Check-In is mandatory. Arrival past 09:30 AM logs an automated Late Mark.' },
      { heading: '2. Half-Day & Minimum Hours', content: 'Working duration between 4.0 and 5.0 hours constitutes a Half-Day. Less than 4 hours is considered an unexcused absence unless pre-approved.' },
      { heading: '3. Leave Allocation & Carry Forward', content: 'Full-time employees receive 12 Casual Leaves, 8 Medical/Sick Leaves, and 15 Paid Annual Leaves credited pro-rata. Up to 10 Paid Leaves may be carried forward annually.' }
    ]
  },
  {
    code: 'EPX-POL-003',
    title: 'Information Security, Device & Data Protection Policy',
    category: 'IT & Cyber Security',
    effectiveDate: '01 Jan 2026',
    summary: 'Mandates strict security hygiene for company-issued laptops, access control, multi-factor authentication, DPDP Act 2023 compliance, and incident response protocols.',
    sections: [
      { heading: '1. Access Control & Passwords', content: 'Strong alphanumeric passwords with mandatory 2FA are required across all internal systems. Sharing credentials or master access keys is grounds for immediate disciplinary action.' },
      { heading: '2. Device Usage & Encryption', content: 'All company endpoints must maintain full-disk BitLocker encryption, active antivirus signatures, and automated patch management. Personal USB storage devices are restricted.' },
      { heading: '3. DPDP Act & Privacy Protocols', content: 'All customer and employee Personally Identifiable Information (PII) must be processed, stored, and redacted in compliance with the Digital Personal Data Protection Act 2023.' }
    ]
  },
  {
    code: 'EPX-POL-004',
    title: 'Prevention of Sexual Harassment (POSH) & Anti-Harassment Policy',
    category: 'HR & Statutory Compliance',
    effectiveDate: '01 Jan 2026',
    summary: 'Zero tolerance policy for sexual harassment, workplace bullying, or hostile behavior, with established Internal Complaints Committee (ICC) grievance redressal mechanisms.',
    sections: [
      { heading: '1. Zero Tolerance Mandate', content: 'Enterprenex provides a safe, supportive, and dignified working environment free from any form of physical, verbal, or digital harassment, intimidation, or inappropriate conduct.' },
      { heading: '2. Internal Complaints Committee (ICC)', content: 'Employees may submit confidential grievances to the designated ICC Presiding Officer at posh@enterprenex.solutions. All investigations are completed within 90 days with strict confidentiality.' },
      { heading: '3. Protection Against Retaliation', content: 'Any retaliation or adverse employment action against an employee reporting an incident in good faith will result in immediate termination of the offending party.' }
    ]
  },
  {
    code: 'EPX-POL-005',
    title: 'Remote / Hybrid Work from Home (WFH) Governance',
    category: 'Workforce Operations',
    effectiveDate: '01 Jan 2026',
    summary: 'Guidelines for remote shift delivery, high-speed broadband readiness, sprint standup availability, and weekly in-office collaboration quotas.',
    sections: [
      { heading: '1. Eligibility & Allocation', content: 'Employees in confirmed status are eligible for up to 12 WFH days per year, with prior approval from the Project Lead or Department Head.' },
      { heading: '2. Communication & Availability', content: 'Remote team members must remain accessible during core business hours via Slack, Enterprenex Suite Chat, and phone for agile sprint standups and client syncs.' },
      { heading: '3. Data Security on Home Networks', content: 'WFH employees must use company VPN and WPA2/WPA3 secured home Wi-Fi networks. Operating from public open Wi-Fi networks (cafes, transit) is prohibited.' }
    ]
  }
];

export const TeamPage: React.FC = () => {
  const {
    employees,
    attendance,
    leaves,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addLeaveRequest,
    updateLeaveStatus,
    deleteLeaveRequest,
    markAttendanceToday,
    currentUser,
    uploadDocument,
    updateDocument,
    documents,
    showToast,
    tasks,
    kpis,
    okrs,
    verifyEmployeeSkill,
    updateKpiMetric,
    updateAttendanceRecord,
    detectedIp
  } = useAdmin();

  const isDirector = currentUser?.role === 'Super Admin' || currentUser?.email === 'director@enterprenex.solutions' || currentUser?.email === 'director@enterprenexsolution.com';
  const isManagerOrHr =
    currentUser?.role === 'Project Manager' ||
    currentUser?.department === 'Human Resources' ||
    Boolean(currentUser?.email?.includes('hr@') || currentUser?.email?.includes('manager@'));
  const canManageTeam = isDirector || isManagerOrHr;
  const isRegularEmployee = !canManageTeam;

  const [tab, setTab] = useState<'roster' | 'attendance' | 'leaves' | 'payroll' | 'policies' | 'workload' | 'skills' | 'kpis'>(isRegularEmployee ? 'attendance' : 'roster');
  const [selectedKpiEmpId, setSelectedKpiEmpId] = useState<string>(kpis[0]?.employeeId || 'EPX-DIR-001');
  const [skillCategoryFilter, setSkillCategoryFilter] = useState<string>('All');
  const [editingMetricId, setEditingMetricId] = useState<string | null>(null);
  const [editMetricActual, setEditMetricActual] = useState<string>('');
  const [editMetricScore, setEditMetricScore] = useState<number>(90);
  const [rosterFilter, setRosterFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Topic A: Attendance View Mode & Regularization
  const [attendanceViewMode, setAttendanceViewMode] = useState<'register' | 'calendar'>('register');
  const [showRegularizationModal, setShowRegularizationModal] = useState(false);
  const [regDate, setRegDate] = useState(new Date().toISOString().split('T')[0]);
  const [regInTime, setRegInTime] = useState('09:30 AM');
  const [regOutTime, setRegOutTime] = useState('06:30 PM');
  const [regReason, setRegReason] = useState('Biometric / Network Sync Delay');

  // Topic B: Half-day Leave Toggle
  const [leaveDuration, setLeaveDuration] = useState<'Full Day' | 'Half Day (First Half: 09:30 AM - 01:30 PM)' | 'Half Day (Second Half: 02:00 PM - 06:30 PM)'>('Full Day');

  // Topic C: My Payslip & Form 16
  const [selectedPayMonth, setSelectedPayMonth] = useState('October 2026');
  const [showForm16Modal, setShowForm16Modal] = useState(false);

  // Topic D: Company Policies & Document Vault
  const [selectedPolicyModal, setSelectedPolicyModal] = useState<typeof ENTERPRENEX_POLICIES[0] | null>(null);
  const [showUploadVaultModal, setShowUploadVaultModal] = useState(false);
  const [newVaultDocName, setNewVaultDocName] = useState('');
  const [newVaultDocCat, setNewVaultDocCat] = useState('Identity & Address Proof');
  const [vaultDocs, setVaultDocs] = useState([
    { name: 'EPX_Signed_Offer_Letter.pdf', category: 'Offer & Contract', size: '240 KB', date: '2026-07-01', verified: true },
    { name: 'Degree_Certificate_BE_CSE.pdf', category: 'Education', size: '1.2 MB', date: '2026-07-02', verified: true },
    { name: 'Government_PAN_Card.pdf', category: 'Statutory KYC', size: '410 KB', date: '2026-07-02', verified: true },
    { name: 'Aadhaar_Card_Copy.pdf', category: 'Statutory KYC', size: '520 KB', date: '2026-07-02', verified: true }
  ]);

  // Phase 1: Live ticking digital clock for precision attendance & shift duration tracking
  const [liveClock, setLiveClock] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setLiveClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getShiftDuration = (checkInStr?: string | null, checkOutStr?: string | null) => {
    if (!checkInStr) return null;
    try {
      const today = new Date();
      const inParts = checkInStr.match(/(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?/i);
      if (!inParts) return null;
      let hours = parseInt(inParts[1], 10);
      const minutes = parseInt(inParts[2], 10);
      const meridiem = inParts[4];
      if (meridiem) {
        if (meridiem.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
      const inDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, 0);

      let outDate = liveClock;
      if (checkOutStr && checkOutStr !== '-') {
        const outParts = checkOutStr.match(/(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?/i);
        if (outParts) {
          let oH = parseInt(outParts[1], 10);
          const oM = parseInt(outParts[2], 10);
          const oMer = outParts[4];
          if (oMer) {
            if (oMer.toUpperCase() === 'PM' && oH < 12) oH += 12;
            if (oMer.toUpperCase() === 'AM' && oH === 12) oH = 0;
          }
          outDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), oH, oM, 0);
        }
      }

      const diffMs = Math.max(0, outDate.getTime() - inDate.getTime());
      const diffSecs = Math.floor(diffMs / 1000);
      const h = Math.floor(diffSecs / 3600);
      const m = Math.floor((diffSecs % 3600) / 60);
      const s = diffSecs % 60;
      return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    } catch {
      return null;
    }
  };

  const isCheckInLate = (checkInStr?: string | null) => {
    if (!checkInStr) return false;
    const inParts = checkInStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!inParts) return false;
    let hours = parseInt(inParts[1], 10);
    const minutes = parseInt(inParts[2], 10);
    const meridiem = inParts[3];
    if (meridiem) {
      if (meridiem.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    return hours > 9 || (hours === 9 && minutes > 30);
  };

  const checkLeaveClash = (applicant: string, start: string, end: string) => {
    if (!applicant || !start || !end) return null;
    const applicantEmp = employees.find(e => e.name.toLowerCase() === applicant.toLowerCase());
    if (!applicantEmp) return null;

    const clashingLeave = leaves.find(l => {
      if (l.employeeName.toLowerCase() === applicant.toLowerCase()) return false;
      if (l.status === 'Rejected') return false;
      const otherEmp = employees.find(e => e.name.toLowerCase() === l.employeeName.toLowerCase());
      if (!otherEmp || otherEmp.department !== applicantEmp.department) return false;
      return start <= l.endDate && end >= l.startDate;
    });

    if (clashingLeave) {
      return {
        clashingEmployee: clashingLeave.employeeName,
        department: applicantEmp.department,
        dates: `${clashingLeave.startDate} to ${clashingLeave.endDate}`,
        type: clashingLeave.type
      };
    }
    return null;
  };

  const printOfficialPayslip = (emp: Employee, payMonth: string = 'October 2026') => {
    const gross = emp.salaryMonthly || 50000;
    const basic = Math.round(gross * 0.5);
    const hra = Math.round(gross * 0.2);
    const specialAllowance = gross - basic - hra;
    const pf = Math.round(basic * 0.12);
    const pt = 200;
    const tds = gross > 75000 ? Math.round(gross * 0.05) : 0;
    const totalDeductions = pf + pt + tds;
    const netPay = gross - totalDeductions;
    const empId = emp.employeeId || 'EPX-EMP-001';
    const pan = emp.panNumber || 'PRRPS8209K';
    const uan = '1019' + empId.replace(/\D/g, '').padEnd(8, '0');
    const bankAc = '•••• •••• ' + (empId.slice(-4) || '8492');

    const win = window.open('', '_blank');
    if (!win) {
      showToast('Popup Blocked', 'Please allow popups to view and print your official salary slip.', 'warning');
      return;
    }

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payslip - ${emp.name} - ${payMonth}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; background: #f8fafc; margin: 0; padding: 20px; }
            .slip-card { position: relative; max-width: 800px; margin: 0 auto; background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 32px 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
            .header-table { width: 100%; border-bottom: 2px solid #ea580c; padding-bottom: 14px; margin-bottom: 18px; }
            .company-name { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
            .company-sub { font-size: 11px; color: #64748b; margin-top: 3px; }
            .slip-badge { display: inline-block; background: #fff7ed; color: #c2410c; border: 1px solid #fdba74; font-weight: 800; font-size: 12px; padding: 4px 12px; border-radius: 6px; text-transform: uppercase; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; font-size: 11.5px; margin-bottom: 20px; }
            .salary-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
            .salary-table th { background: #0f172a; color: #fff; padding: 9px 12px; text-align: left; }
            .salary-table td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; }
            .net-box { background: #ecfdf5; border: 1.5px solid #10b981; border-radius: 6px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
            .net-val { font-size: 22px; font-weight: 800; color: #047857; }
            .footer-sig { display: flex; justify-content: space-between; margin-top: 30px; padding-top: 16px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="slip-card">
            <table class="header-table">
              <tr>
                <td>
                  <h1 class="company-name">ENTERPRENEX SOLUTIONS PRIVATE LIMITED</h1>
                  <div class="company-sub">CIN: U72900PN2023PTC221940 &bull; Corporate Headquarters, Pune, Maharashtra</div>
                  <div class="company-sub">Official Payroll & Statutory Salary Advice Slip</div>
                </td>
                <td style="text-align: right;">
                  <span class="slip-badge">PAYSLIP - ${payMonth.toUpperCase()}</span>
                </td>
              </tr>
            </table>

            <div class="meta-grid">
              <div>
                <div><strong>Employee Name:</strong> ${emp.name}</div>
                <div style="margin-top: 4px;"><strong>Employee ID:</strong> ${empId}</div>
                <div style="margin-top: 4px;"><strong>Designation:</strong> ${emp.role}</div>
                <div style="margin-top: 4px;"><strong>Department:</strong> ${emp.department}</div>
              </div>
              <div>
                <div><strong>PAN Number:</strong> ${pan}</div>
                <div style="margin-top: 4px;"><strong>UAN (EPFO):</strong> ${uan}</div>
                <div style="margin-top: 4px;"><strong>Bank Account:</strong> ${bankAc}</div>
                <div style="margin-top: 4px;"><strong>Pay Period:</strong> ${payMonth}</div>
              </div>
            </div>

            <table class="salary-table">
              <thead>
                <tr>
                  <th>EARNINGS HEAD</th>
                  <th style="text-align: right;">AMOUNT (₹)</th>
                  <th>STATUTORY DEDUCTIONS</th>
                  <th style="text-align: right;">AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Basic Salary (50%)</td>
                  <td style="text-align: right;">₹${basic.toLocaleString('en-IN')}</td>
                  <td>Provident Fund (PF - 12%)</td>
                  <td style="text-align: right;">₹${pf.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>House Rent Allowance (HRA - 20%)</td>
                  <td style="text-align: right;">₹${hra.toLocaleString('en-IN')}</td>
                  <td>Professional Tax (PT)</td>
                  <td style="text-align: right;">₹${pt.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>Special Allowance (30%)</td>
                  <td style="text-align: right;">₹${specialAllowance.toLocaleString('en-IN')}</td>
                  <td>Income Tax (TDS)</td>
                  <td style="text-align: right;">₹${tds.toLocaleString('en-IN')}</td>
                </tr>
                <tr style="font-weight: 700; background: #f8fafc;">
                  <td>TOTAL GROSS EARNINGS</td>
                  <td style="text-align: right; color: #047857;">₹${gross.toLocaleString('en-IN')}</td>
                  <td>TOTAL DEDUCTIONS</td>
                  <td style="text-align: right; color: #dc2626;">₹${totalDeductions.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            <div class="net-box">
              <div>
                <div style="font-size: 11px; text-transform: uppercase; color: #047857; font-weight: 700;">NET SALARY DISBURSED (TAKE HOME)</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Direct NEFT Transfer to Bank Account</div>
              </div>
              <div class="net-val">₹${netPay.toLocaleString('en-IN')}</div>
            </div>

            <div class="footer-sig">
              <div>
                <div>This is a computer-generated official payslip issued under corporate seal.</div>
                <div>Authorized by: <strong>Rohit Pawar (Managing Director)</strong></div>
              </div>
              <div style="text-align: right;">
                <div>Enterprenex Enterprise Work Management Suite</div>
                <div>Status: <strong>PROCESSED & DISBURSED ✓</strong></div>
              </div>
            </div>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const printForm16Summary = (emp: Employee) => {
    const gross = (emp.salaryMonthly || 50000) * 12;
    const stdDeduction = 75000;
    const netTaxable = Math.max(0, gross - stdDeduction);
    const taxDeducted = gross > 900000 ? Math.round(netTaxable * 0.08) : 0;
    const empId = emp.employeeId || 'EPX-EMP-001';

    const win = window.open('', '_blank');
    if (!win) {
      showToast('Popup Blocked', 'Please allow popups to view Form 16 certificate.', 'warning');
      return;
    }

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Form 16 Summary - ${emp.name} - FY 2025-26</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; background: #fff; margin: 0; padding: 24px; }
            .cert-box { border: 2px solid #0f172a; padding: 28px; max-width: 800px; margin: 0 auto; }
            h2 { text-align: center; margin: 0; color: #0f172a; }
            .sub { text-align: center; font-size: 12px; color: #64748b; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
            th { background: #f8fafc; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <h2>FORM NO. 16 (PART B SUMMARY)</h2>
            <div class="sub">Certificate under section 203 of the Income-tax Act, 1961 for tax deducted at source on salary</div>
            <div class="sub" style="margin-top: 6px; font-weight: 700; color: #ea580c;">ENTERPRENEX SOLUTIONS PRIVATE LIMITED &bull; TAN: PNTE02918K &bull; PAN: AAXPE1206M</div>

            <table style="margin-top: 20px;">
              <tr><th>Employee Name</th><td>${emp.name}</td><th>Employee ID</th><td>${empId}</td></tr>
              <tr><th>PAN of Employee</th><td>${emp.panNumber || 'PRRPS8209K'}</td><th>Assessment Year</th><td>2026-2027</td></tr>
              <tr><th>Period with Employer</th><td>01-Apr-2025 to 31-Mar-2026</td><th>Tax Regime</th><td>New Tax Regime u/s 115BAC</td></tr>
            </table>

            <h3 style="margin-top: 24px; font-size: 14px;">Summary of Taxable Income & Deductions</h3>
            <table>
              <tr><th>1. Gross Salary under section 17(1)</th><td style="text-align: right; font-weight: 700;">₹${gross.toLocaleString('en-IN')}</td></tr>
              <tr><td>Less: Standard Deduction u/s 16(ia)</td><td style="text-align: right; color: #dc2626;">(-) ₹${stdDeduction.toLocaleString('en-IN')}</td></tr>
              <tr style="background: #f8fafc;"><th>2. Net Taxable Income (1 - Standard Deduction)</th><td style="text-align: right; font-weight: 800; color: #047857;">₹${netTaxable.toLocaleString('en-IN')}</td></tr>
              <tr><th>3. Total Tax Deducted at Source (TDS Deposited to Central Govt)</th><td style="text-align: right; font-weight: 800; color: #ea580c;">₹${taxDeducted.toLocaleString('en-IN')}</td></tr>
            </table>

            <div style="margin-top: 36px; display: flex; justify-content: space-between; font-size: 11px;">
              <div>
                <div>Place: <strong>Pune, Maharashtra</strong></div>
                <div>Date of Issuance: <strong>${new Date().toLocaleDateString('en-IN')}</strong></div>
              </div>
              <div style="text-align: right;">
                <div>For <strong>ENTERPRENEX SOLUTIONS PRIVATE LIMITED</strong></div>
                <div style="margin-top: 24px; font-weight: 700;">Rohit Pawar (Managing Director)</div>
                <div style="color: #64748b;">Authorized Signatory</div>
              </div>
            </div>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // Absence Incident & Outreach Modal State (RBAC Restricted to Director & HR)
  const [absenceModalAtt, setAbsenceModalAtt] = useState<AttendanceRecord | null>(null);
  const [absenceReasonInput, setAbsenceReasonInput] = useState('No Intimation Provided');
  const [absenceNotesInput, setAbsenceNotesInput] = useState('');

  // Form state - Add Member
  const [name, setName] = useState('');
  const [governanceRole, setGovernanceRole] = useState<'Manager (HR)' | 'Employee' | 'Intern'>('Employee');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState<Employee['department']>('Engineering');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('React, TypeScript, Node.js');
  const [salary, setSalary] = useState(100000);
  const [workload, setWorkload] = useState(100);
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
  const [avatarPreview, setAvatarPreview] = useState('');

  // Photo modal for existing members
  const [photoModalEmp, setPhotoModalEmp] = useState<Employee | null>(null);
  const [customPhotoInput, setCustomPhotoInput] = useState('');

  // Mandatory KYC State - Add Member Form
  const [panNumber, setPanNumber] = useState('');
  const [panDocUrl, setPanDocUrl] = useState('');
  const [panDocName, setPanDocName] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarDocUrl, setAadhaarDocUrl] = useState('');
  const [aadhaarDocName, setAadhaarDocName] = useState('');

  // KYC Vault Modal State
  const [kycModalEmp, setKycModalEmp] = useState<Employee | null>(null);
  const [showFullAadhaar, setShowFullAadhaar] = useState(false);
  const [editKycPan, setEditKycPan] = useState('');
  const [editKycAadhaar, setEditKycAadhaar] = useState('');

  // Document Viewer Lightbox state
  const [previewDocModal, setPreviewDocModal] = useState<{
    title: string;
    url: string;
    number?: string;
    type: string;
  } | null>(null);

  // Strict DPDP Act & Statutory RBAC: Only Director and HR can view government KYC documents
  const canAccessKyc = isDirector || currentUser?.department === 'Human Resources' || Boolean(currentUser?.email?.includes('hr@'));
  const canViewEmployeeKyc = (emp: Employee) => {
    if (canAccessKyc) return true;
    if (currentUser?.id === emp.id || currentUser?.email === emp.email) return true;
    return false;
  };

  const maskAadhaarNumber = (num?: string) => {
    if (!num) return 'Not Provided';
    const clean = num.replace(/\s+/g, '');
    if (clean.length < 4) return 'XXXX-XXXX-XXXX';
    const last4 = clean.slice(-4);
    return `XXXX-XXXX-${last4}`;
  };

  const downloadDoc = (url: string, filename: string) => {
    if (!url) {
      showToast('No Document Available', 'No physical or electronic file uploaded yet.', 'warning');
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Download Started', `Downloading ${filename}`, 'info');
  };

  const handleSaveKycData = () => {
    if (!kycModalEmp) return;
    const cleanPan = editKycPan.trim().toUpperCase();
    const cleanAadhaar = editKycAadhaar.trim().replace(/\D/g, '');

    const updates: Partial<Employee> = {
      panNumber: cleanPan || kycModalEmp.panNumber,
      aadhaarNumber: cleanAadhaar || kycModalEmp.aadhaarNumber,
      kycStatus: canAccessKyc ? 'Verified' : (kycModalEmp.kycStatus === 'Verified' ? 'Verified' : 'Pending Verification'),
      kycVerifiedBy: canAccessKyc ? (currentUser?.name || 'Managing Director') : kycModalEmp.kycVerifiedBy,
      kycVerifiedAt: canAccessKyc ? new Date().toISOString() : kycModalEmp.kycVerifiedAt
    };

    updateEmployee(kycModalEmp.id, updates);
    setKycModalEmp(prev => prev ? { ...prev, ...updates } : null);
    showToast('KYC Details Saved', `Saved PAN (${cleanPan || 'Recorded'}) & Aadhaar (${cleanAadhaar || 'Recorded'}) for ${kycModalEmp.name}.`, 'success');
  };

  // Form state - Apply Leave
  const [applicantName, setApplicantName] = useState(currentUser?.name || 'HR Administrator');
  const [leaveType, setLeaveType] = useState<LeaveRequest['type']>('Casual Leave');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveReason, setLeaveReason] = useState('');

  // File upload helper (supports images & PDFs up to 10MB)
  const handlePhotoFileChange = (file: File, onDone: (dataUrl: string) => void) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('File Too Large', 'Please select a document or image smaller than 10MB.', 'error');
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

  // Employee Offboard & Permanent Deletion modal state
  const [offboardModalEmp, setOffboardModalEmp] = useState<Employee | null>(null);
  const [purgeDocsOnDelete, setPurgeDocsOnDelete] = useState(false);

  // Certificate Issuance Modal State
  const [showCertModal, setShowCertModal] = useState(false);
  const [certRecipientName, setCertRecipientName] = useState('');
  const [certRecipientEmpId, setCertRecipientEmpId] = useState('');
  const [certType, setCertType] = useState('Internship Completion Certificate');
  const [certDomain, setCertDomain] = useState('Full Stack Software Engineering & Cloud Systems');
  const [certDuration, setCertDuration] = useState('6 Months');
  const [certStartDate, setCertStartDate] = useState('');
  const [certEndDate, setCertEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [certGrade, setCertGrade] = useState('Grade A+ (Outstanding Performance)');
  const [certIdInput, setCertIdInput] = useState('');
  const [issuedCertSuccess, setIssuedCertSuccess] = useState<any | null>(null);

  const openIssueCertModal = (emp?: Employee) => {
    if (emp) {
      setCertRecipientName(emp.name);
      setCertRecipientEmpId(emp.employeeId || emp.id);
      const isIntern = emp.role.toLowerCase().includes('intern') || emp.role.toLowerCase().includes('trainee');
      setCertType(isIntern ? 'Internship Completion Certificate' : 'Relieving & Experience Certificate');
      setCertDomain(emp.department === 'Engineering' ? 'Full Stack Software Engineering & Cloud Systems' : `${emp.department} Operations`);
      setCertDuration(isIntern ? '6 Months' : '1 Year');
      setCertStartDate(emp.joinDate || '');
    } else {
      setCertRecipientName('');
      setCertRecipientEmpId('');
      setCertType('Internship Completion Certificate');
      setCertDomain('Full Stack Software Engineering & Cloud Systems');
      setCertDuration('6 Months');
      setCertStartDate('');
    }
    const yr = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setCertIdInput(`ENX-INT-${yr}-${rand}`);
    setCertEndDate(new Date().toISOString().split('T')[0]);
    setCertGrade('Grade A+ (Outstanding Performance)');
    setIssuedCertSuccess(null);
    setShowCertModal(true);
  };

  const handleIssueCertificateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certRecipientName.trim()) {
      showToast('Validation Error', 'Candidate name is required.', 'error');
      return;
    }
    const finalId = certIdInput.trim() || `ENX-INT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCertRecord = {
      certId: finalId,
      name: certRecipientName.trim(),
      employeeId: certRecipientEmpId.trim() || undefined,
      certType,
      domain: certDomain.trim() || 'Software Engineering',
      duration: certDuration.trim() || '6 Months',
      startDate: certStartDate,
      completionDate: certEndDate,
      grade: certGrade,
      mentor: 'Rohit Pawar (Managing Director)',
      issuedBy: currentUser?.name || 'Managing Director',
      issuedAt: new Date().toISOString(),
    };

    try {
      const stored = localStorage.getItem('ewms_internships');
      const list = stored ? JSON.parse(stored) : [];
      const updated = [newCertRecord, ...list.filter((c: any) => c.certId !== finalId)];
      localStorage.setItem('ewms_internships', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    uploadDocument({
      title: `${certType} - ${certRecipientName.trim()}`,
      category: 'Employee Docs',
      version: 'v1.0',
      fileFormat: 'PDF',
      fileSize: '180 KB',
      accessPermission: 'Internal',
      tags: [finalId, 'Certificate', certType],
      url: '#',
      employeeId: certRecipientEmpId.trim() || undefined,
      verificationStatus: 'Verified',
      verifiedBy: 'Rohit Pawar (Managing Director)',
      verifiedAt: new Date().toISOString()
    });

    setIssuedCertSuccess(newCertRecord);
    showToast(
      'Certificate Issued!',
      `Certificate ${finalId} is now active and immediately verifiable at /verification!`,
      'success'
    );
  };

  const printOfficialCertificate = (cert: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const idBadge = cert.employeeId
      ? `REGISTRATION / EMPLOYEE ID: ${cert.employeeId}`
      : `CANDIDATE ID: ${cert.certId}`;

    const certHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${cert.certType} - ${cert.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Dancing+Script:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          @page { size: landscape; margin: 0; }
          body { margin: 0; padding: 25px; background: #0c1017; font-family: 'Plus Jakarta Sans', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; box-sizing: border-box; }
          .cert-container { width: 1000px; height: 680px; background: #ffffff; border: 12px double #b48530; border-radius: 8px; padding: 30px 40px; box-sizing: border-box; position: relative; text-align: center; color: #1e293b; box-shadow: 0 20px 50px rgba(0,0,0,0.5); overflow: hidden; }
          .corner-ornament { position: absolute; width: 40px; height: 40px; border: 3px solid #b48530; z-index: 2; }
          .tl { top: 12px; left: 12px; border-right: none; border-bottom: none; }
          .tr { top: 12px; right: 12px; border-left: none; border-bottom: none; }
          .bl { bottom: 12px; left: 12px; border-right: none; border-top: none; }
          .br { bottom: 12px; right: 12px; border-left: none; border-top: none; }
          .header-title { font-family: 'Cinzel', serif; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: 2px; margin: 0; }
          .header-sub { font-size: 10.5px; color: #64748b; letter-spacing: 1px; margin-top: 3px; text-transform: uppercase; }
          .cert-type { font-family: 'Cinzel', serif; font-size: 27px; font-weight: 800; color: #b48530; margin: 14px 0 6px; letter-spacing: 2.5px; text-transform: uppercase; position: relative; z-index: 1; }
          .cert-intro { font-size: 13px; color: #475569; margin: 0; font-style: italic; position: relative; z-index: 1; }
          .recipient-name { font-family: 'Cinzel', serif; font-size: 29px; font-weight: 800; color: #0f172a; margin: 10px 0 4px; border-bottom: 2px solid #e2e8f0; display: inline-block; padding: 0 35px 5px; position: relative; z-index: 1; }
          .emp-id-badge { font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 10px; font-family: monospace; position: relative; z-index: 1; }
          .cert-body { font-size: 13.5px; line-height: 1.6; color: #334155; max-width: 820px; margin: 0 auto; position: relative; z-index: 1; }
          .highlight { font-weight: 700; color: #0f172a; }
          .footer-section { position: absolute; bottom: 25px; left: 45px; right: 45px; display: flex; justify-content: space-between; align-items: flex-end; z-index: 1; }
          .sig-block { text-align: center; width: 210px; }
          .sig-line { border-top: 1px solid #94a3b8; padding-top: 5px; font-size: 11.5px; font-weight: 700; color: #1e293b; }
          .sig-role { font-size: 10px; color: #64748b; }
          .gold-seal { width: 84px; height: 84px; border-radius: 50%; border: 3px solid #b48530; background: #fffdf5; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(180,133,48,0.25); }
          .gold-seal span { font-size: 8.5px; font-weight: 800; color: #b48530; letter-spacing: 0.5px; text-transform: uppercase; text-align: center; }
          .verify-stamp { font-size: 10px; color: #64748b; font-family: monospace; margin-top: 10px; position: relative; z-index: 1; }
        </style>
      </head>
      <body>
        <div class="cert-container">
          <!-- Clearly Visible Official Company Logo Watermark Behind Text -->
          <img src="${COMPANY_WATERMARK_BASE64}" alt="Enterprenex Watermark" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 560px; opacity: 0.12; pointer-events: none; z-index: 0;" />

          <div class="corner-ornament tl"></div>
          <div class="corner-ornament tr"></div>
          <div class="corner-ornament bl"></div>
          <div class="corner-ornament br"></div>

          <!-- Official Company Logo & Identity Header -->
          <div style="position: relative; z-index: 1; margin-bottom: 2px;">
            <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 6px;">
              <img src="${COMPANY_LOGO_BASE64}" alt="Enterprenex Solutions" style="height: 54px; max-width: 270px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.06));" />
            </div>
            <h1 class="header-title">ENTERPRENEX SOLUTIONS PRIVATE LIMITED</h1>
            <div class="header-sub">Corporate Identity: U72900MH2026PTC000000 &bull; ISO 9001:2015 Registered Entity</div>
          </div>

          <div class="cert-type">${cert.certType}</div>
          <p class="cert-intro">This certificate is proudly awarded to</p>

          <div class="recipient-name">${cert.name}</div>
          <div class="emp-id-badge">${idBadge}</div>

          <p class="cert-body">
            in recognition of exemplary commitment and successful completion of a 
            <span class="highlight">${cert.duration}</span> professional assignment in 
            <span class="highlight">${cert.domain}</span>. Throughout the tenure, 
            the candidate demonstrated engineering acumen, disciplined delivery, and professional collaboration,
            achieving a performance rating of <span class="highlight">${cert.grade}</span>.
          </p>

          <div class="verify-stamp">
            VERIFICATION ID: <strong>${cert.certId}</strong> &bull; VERIFY ONLINE: enterprenexsolution.com/verification
          </div>

          <div class="footer-section">
            <!-- Managing Director Signature Block -->
            <div class="sig-block">
              <div style="font-family: 'Dancing Script', cursive; font-size: 26px; font-weight: 700; color: #1e3a8a; transform: rotate(-3deg); margin-bottom: 2px;">Rohit Pawar</div>
              <div style="font-size: 8px; color: #0284c7; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 3px;">✓ Digitally Certified</div>
              <div class="sig-line">MANAGING DIRECTOR</div>
              <div class="sig-role">Enterprenex Solutions Pvt Ltd</div>
            </div>

            <!-- Official Circular Corporate Seal Emblem -->
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 88px;">
              <img src="${COMPANY_SEAL_BASE64}" alt="Official Corporate Seal" style="width: 82px; height: 82px; border-radius: 50%; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.18)); object-fit: contain;" />
            </div>

            <!-- Instant Phone Scannable QR Code -->
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 84px;">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=0&data=${encodeURIComponent(`https://www.enterprenexsolution.com/verification?id=${cert.certId}`)}" alt="Verify QR Code" style="width: 68px; height: 68px; border: 2px solid #b48530; border-radius: 6px; padding: 2px; background: #ffffff;" />
              <span style="font-size: 8px; font-weight: 800; color: #b48530; margin-top: 3px; letter-spacing: 0.5px; text-transform: uppercase;">Scan To Verify</span>
            </div>

            <!-- Head of HR Signature Block -->
            <div class="sig-block">
              <div style="font-family: 'Dancing Script', cursive; font-size: 24px; font-weight: 700; color: #1e3a8a; transform: rotate(-2deg); margin-bottom: 2px;">A. Sharma</div>
              <div style="font-size: 8px; color: #0284c7; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 3px;">✓ Digitally Certified</div>
              <div class="sig-line">HEAD OF HUMAN RESOURCES</div>
              <div class="sig-role">Executive Board &bull; MH, India</div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(certHtml);
    printWindow.document.close();
  };

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
    setWorkload(100);
    setPanNumber('');
    setPanDocUrl('');
    setPanDocName('');
    setAadhaarNumber('');
    setAadhaarDocUrl('');
    setAadhaarDocName('');
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

    const finalPan = panNumber.trim().toUpperCase();
    const finalAadhaar = aadhaarNumber.trim().replace(/\D/g, '');

    const initialApprovalStatus: 'Approved' | 'Pending Director Approval' =
      isDirector ? 'Approved' : 'Pending Director Approval';
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
      workloadPercentage: Number(workload || 100),
      joinDate: new Date().toISOString().split('T')[0],
      salaryMonthly: Number(salary),
      performanceRating: 5.0,
      status: 'Active',
      approvalStatus: initialApprovalStatus,
      approvedBy: initialApprovalStatus === 'Approved' ? (currentUser?.name || 'Rohit Pawar (Managing Director)') : undefined,
      approvedAt: initialApprovalStatus === 'Approved' ? new Date().toISOString() : undefined,
      panNumber: finalPan || undefined,
      panDocUrl: panDocUrl || undefined,
      aadhaarNumber: finalAadhaar || undefined,
      aadhaarDocUrl: aadhaarDocUrl || undefined,
      kycStatus: finalPan && finalAadhaar ? (isDirector ? 'Verified' : 'Pending Verification') : 'Not Submitted',
      kycVerifiedBy: (finalPan && finalAadhaar && isDirector) ? (currentUser?.name || 'Managing Director') : undefined,
      kycVerifiedAt: (finalPan && finalAadhaar && isDirector) ? new Date().toISOString() : undefined
    });

    if (panDocUrl) {
      uploadDocument({
        title: `PAN Card - ${name} (${finalPan || finalEmpId})`,
        category: 'Employee Docs',
        fileFormat: panDocName?.toLowerCase().endsWith('.pdf') ? 'PDF' : 'JPG',
        fileSize: '1.2 MB',
        version: 'v1.0',
        accessPermission: 'Executive',
        tags: ['KYC', 'PAN', 'IncomeTax', finalEmpId],
        url: panDocUrl
      });
    }

    if (aadhaarDocUrl) {
      uploadDocument({
        title: `Aadhaar Card - ${name} (${finalEmpId})`,
        category: 'Employee Docs',
        fileFormat: aadhaarDocName?.toLowerCase().endsWith('.pdf') ? 'PDF' : 'JPG',
        fileSize: '1.2 MB',
        version: 'v1.0',
        accessPermission: 'Executive',
        tags: ['KYC', 'Aadhaar', 'UIDAI', finalEmpId],
        url: aadhaarDocUrl
      });
    }

    if (initialApprovalStatus === 'Pending Director Approval') {
      showToast(
        'Employee Registered - Awaiting Director Approval',
        `Employee ID ${finalEmpId} added. Awaiting Director Approval (Rohit Pawar - director@enterprenex.solutions) before workspace portal login is enabled.`,
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

    const finalReason = leaveDuration !== 'Full Day'
      ? `[${leaveDuration}] ${leaveReason.trim()}`
      : leaveReason.trim();

    addLeaveRequest({
      employeeName: applicantName.trim(),
      type: leaveType,
      startDate,
      endDate,
      reason: finalReason
    });

    setShowApplyLeaveModal(false);
    setLeaveReason('');
    setLeaveDuration('Full Day');
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
          <h1>{isRegularEmployee ? 'My Attendance & Leave' : 'Team, Attendance & Workforce Ops'}</h1>
          <p>
            {isRegularEmployee
              ? 'Daily biometric check-in, attendance history, leave balances & time-off applications'
              : 'Employee capacity roster, daily biometric check-ins, leave approvals & payroll rates'}
          </p>
        </div>
        <div className="adm-page-actions" style={{ flexWrap: 'wrap' }}>
          {tab === 'roster' && (
            <>
              <button className="adm-btn adm-btn-secondary" onClick={handleExportRosterCsv} title="Download Team Directory as CSV">
                <Download size={15} />
                <span>Export Roster CSV</span>
              </button>
              {canManageTeam && (
                <>
                  <button className="adm-btn adm-btn-secondary" onClick={() => openIssueCertModal()} title="Issue Official Internship or Experience Certificate">
                    <Award size={15} color="#10b981" />
                    <span>Issue Certificate</span>
                  </button>
                  <button className="adm-btn adm-btn-primary" onClick={openAddMemberModal}>
                    <Plus size={16} />
                    <span>Add Team Member</span>
                  </button>
                </>
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
              {isRegularEmployee && (
                <button className="adm-btn adm-btn-secondary" onClick={openApplyLeaveModal}>
                  <CalendarPlus size={15} color="var(--adm-primary)" />
                  <span>Apply for Leave</span>
                </button>
              )}
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

          {tab === 'payroll' && (
            <>
              <button
                className="adm-btn adm-btn-secondary"
                onClick={() => {
                  const targetEmp = employees.find(e => e.email === currentUser?.email) || employees[0];
                  if (targetEmp) printForm16Summary(targetEmp);
                }}
                title="Print Form 16 Part B Summary Certificate"
              >
                <FileText size={15} />
                <span>Form 16 Summary</span>
              </button>
              <button
                className="adm-btn adm-btn-primary"
                onClick={() => {
                  const targetEmp = employees.find(e => e.email === currentUser?.email) || employees[0];
                  if (targetEmp) printOfficialPayslip(targetEmp, selectedPayMonth);
                }}
                title="Print Official Payslip"
              >
                <Printer size={15} />
                <span>Download Payslip</span>
              </button>
            </>
          )}

          {tab === 'policies' && (
            <button className="adm-btn adm-btn-primary" onClick={() => setShowUploadVaultModal(true)}>
              <Upload size={15} />
              <span>Upload to Vault</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="adm-card" style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
        <div className="adm-tabs" style={{ margin: 0, border: 'none', flexWrap: 'wrap', gap: '0.35rem' }}>
          {canManageTeam && (
            <button className={`adm-tab-btn ${tab === 'roster' ? 'active' : ''}`} onClick={() => setTab('roster')}>
              Team Directory ({employees.length})
            </button>
          )}
          <button className={`adm-tab-btn ${tab === 'workload' ? 'active' : ''}`} onClick={() => setTab('workload')}>
            📊 Workload & Capacity
          </button>
          <button className={`adm-tab-btn ${tab === 'skills' ? 'active' : ''}`} onClick={() => setTab('skills')}>
            🛠 IT Skill Matrix
          </button>
          <button className={`adm-tab-btn ${tab === 'kpis' ? 'active' : ''}`} onClick={() => setTab('kpis')}>
            🎯 KPI & OKR Engine
          </button>
          <button className={`adm-tab-btn ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>
            {isRegularEmployee ? '📅 My Attendance & Check-In' : `Daily Attendance (${attendance.length})`}
          </button>
          <button className={`adm-tab-btn ${tab === 'leaves' ? 'active' : ''}`} onClick={() => setTab('leaves')}>
            {canManageTeam ? `Leave Approvals (${leaves.length})` : '🌴 My Leave Applications'}
            {canManageTeam && pendingLeavesCount > 0 && (
              <span className="adm-badge adm-badge-warning" style={{ marginLeft: '6px', fontSize: '0.65rem' }}>
                {pendingLeavesCount} Pending
              </span>
            )}
          </button>
          <button className={`adm-tab-btn ${tab === 'payroll' ? 'active' : ''}`} onClick={() => setTab('payroll')}>
            💵 My Payslips & Form 16
          </button>
          <button className={`adm-tab-btn ${tab === 'policies' ? 'active' : ''}`} onClick={() => setTab('policies')}>
            📜 Company Policies & Vault
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
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--adm-text)' }}>
                      {isDirector
                        ? `Director Action Required: ${pendingEmployees.length} Employee Account(s) Awaiting Your Approval`
                        : `${pendingEmployees.length} Employee Account(s) Submitted & Awaiting Managing Director Approval`}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                      {isDirector
                        ? 'Employees cannot log into the workspace portal until you approve their 12-digit Employee ID and credentials.'
                        : 'Credentials registered by HR are awaiting approval from Managing Director (Rohit Pawar - director@enterprenex.solutions).'}
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
                            approvedBy: currentUser?.name || 'Rohit Pawar (Managing Director)',
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

                const isSelected = selectedEmployee?.id === emp.id;
                return (
                  <div
                    key={emp.id}
                    className="adm-card adm-card-hover"
                    onClick={() => setSelectedEmployee(emp)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      border: isSelected
                        ? '2px solid var(--adm-primary)'
                        : isPending
                        ? '1px solid rgba(245, 158, 11, 0.45)'
                        : isRejected
                        ? '1px solid rgba(239, 68, 68, 0.45)'
                        : undefined,
                      boxShadow: isSelected ? '0 0 0 2px rgba(18, 201, 144, 0.25)' : undefined
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotoModalEmp(emp);
                            setCustomPhotoInput(emp.avatar || '');
                          }}
                          style={{
                            position: 'absolute',
                            bottom: '-4px',
                            right: '-4px',
                            background: '#059669',
                            color: 'var(--adm-text)',
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
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--adm-text)' }}>{emp.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--adm-primary)', fontWeight: 600 }}>{emp.role}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>{emp.department}</div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span
                          className={`adm-badge ${
                            emp.status === 'Active'
                              ? 'adm-badge-success'
                              : emp.status === 'Resigned'
                              ? 'adm-badge-warning'
                              : emp.status === 'Terminated'
                              ? 'adm-badge-danger'
                              : emp.status === 'On Leave'
                              ? 'adm-badge-info'
                              : 'adm-badge-neutral'
                          }`}
                          style={{ fontSize: '0.65rem' }}
                        >
                          {emp.status}
                        </span>
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
                            : 'Waiting for Managing Director (Rohit Pawar - director@enterprenex.solutions) to approve login access.'}
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
                                  approvedBy: currentUser?.name || 'Rohit Pawar (Managing Director)',
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
                                `Managing Director Rohit Pawar, please approve login for new employee:\n` +
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
                                approvedBy: currentUser?.name || 'Rohit Pawar (Managing Director)',
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--adm-text-dim)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          Sprint Workload
                          {emp.workloadPercentage >= 100 && (
                            <span className="adm-badge adm-badge-warning" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                              Full Capacity
                            </span>
                          )}
                        </span>
                        <span style={{
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          fontFamily: 'monospace',
                          color: emp.workloadPercentage >= 100 ? '#ef4444' : emp.workloadPercentage > 70 ? 'var(--adm-warning)' : 'var(--adm-success)'
                        }}>
                          {emp.workloadPercentage}%
                        </span>
                      </div>

                      <div className="adm-progress-bar" style={{ height: '7px', background: 'rgba(255,255,255,0.08)' }}>
                        <div
                          className="adm-progress-fill"
                          style={{
                            width: `${Math.min(100, Math.max(0, emp.workloadPercentage))}%`,
                            background: emp.workloadPercentage >= 100
                              ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                              : emp.workloadPercentage > 70
                              ? 'var(--adm-warning)'
                              : 'var(--adm-success)',
                            transition: 'width 0.3s ease, background 0.3s ease'
                          }}
                        />
                      </div>

                      {/* Capacity Quick Fill for Managers & Director */}
                      {canManageTeam && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', gap: '4px' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--adm-text-dim)' }}>Fill Capacity:</span>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {[20, 50, 75].map(pct => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => {
                                  updateEmployee(emp.id, { workloadPercentage: pct });
                                  showToast('Workload Adjusted', `${emp.name} capacity set to ${pct}%.`, 'info');
                                }}
                                className="adm-btn"
                                style={{
                                  padding: '2px 6px',
                                  fontSize: '0.65rem',
                                  borderRadius: '4px',
                                  lineHeight: 1.2,
                                  background: emp.workloadPercentage === pct ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)',
                                  color: emp.workloadPercentage === pct ? '#fff' : 'var(--adm-text-muted)',
                                  border: emp.workloadPercentage === pct ? '1px solid rgba(255,255,255,0.3)' : '1px solid var(--adm-border)'
                                }}
                              >
                                {pct}%
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                updateEmployee(emp.id, { workloadPercentage: 100 });
                                showToast('Capacity Full (100%)', `${emp.name}'s sprint workload filled to 100% (Full Capacity).`, 'success');
                              }}
                              className="adm-btn"
                              style={{
                                padding: '2px 8px',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                borderRadius: '4px',
                                lineHeight: 1.2,
                                background: emp.workloadPercentage === 100 ? '#ef4444' : 'rgba(239, 68, 68, 0.15)',
                                color: emp.workloadPercentage === 100 ? '#fff' : '#f87171',
                                border: '1px solid rgba(239, 68, 68, 0.4)'
                              }}
                              title="Fill Sprint Workload to 100% Full Capacity"
                            >
                              100% Fill
                            </button>
                          </div>
                        </div>
                      )}
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

                    {/* Statutory KYC Vault Bar (PAN & Aadhaar) */}
                    <div style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid var(--adm-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`adm-badge ${emp.kycStatus === 'Verified' ? 'adm-badge-success' : 'adm-badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                          {emp.kycStatus === 'Verified' ? '✓ KYC Verified' : '⏳ KYC Pending'}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--adm-text-dim)', fontFamily: 'monospace' }}>
                          PAN: {emp.panNumber || 'Pending'}
                        </span>
                      </div>

                      {canViewEmployeeKyc(emp) ? (
                        <button
                          type="button"
                          className="adm-btn adm-btn-secondary"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.7rem', gap: '4px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setKycModalEmp(emp);
                            setShowFullAadhaar(false);
                            setEditKycPan(emp.panNumber || '');
                            setEditKycAadhaar(emp.aadhaarNumber || '');
                          }}
                          title="View confidential PAN & Aadhaar documents (Director & HR restricted)"
                        >
                          <Shield size={12} color="#10b981" />
                          <span>KYC Vault</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.66rem', color: 'var(--adm-text-dim)', display: 'flex', alignItems: 'center', gap: '3px' }} title="Statutory KYC records are confidential and restricted to HR & Director">
                          <Lock size={10} />
                          <span>HR Restricted</span>
                        </span>
                      )}
                    </div>

                    {/* Credentials & Access Bar */}
                    <div style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid var(--adm-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="adm-badge adm-badge-neutral" style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.72rem' }}>
                          {displayEmpId}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: isPending ? '#f59e0b' : isRejected ? '#ef4444' : 'var(--adm-success)', fontWeight: 600 }}>
                          {isPending ? 'Approval Pending' : isRejected ? 'Access Denied' : 'Access Active'}
                        </span>
                      </div>

                      {/* Security RBAC: Director credentials protected from HR, and employee credentials only manageable by HR/Director */}
                      {(emp.email === 'director@enterprenex.solutions' || emp.email === 'director@enterprenexsolution.com' || emp.role.includes('Director') || emp.id === 'emp-1') && !isDirector ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.3rem 0.6rem', background: 'rgba(5, 150, 105, 0.1)', border: '1px solid rgba(5, 150, 105, 0.3)', borderRadius: '6px', fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>
                          <ShieldCheck size={13} />
                          <span>Executive Protected</span>
                        </div>
                      ) : canManageTeam ? (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            className="adm-btn adm-btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', gap: '5px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openIssueCertModal(emp);
                            }}
                            title="Issue Official Certificate for this Member"
                          >
                            <Award size={13} color="#10b981" />
                            <span>Certificate</span>
                          </button>

                          <button
                            className="adm-btn adm-btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', gap: '5px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCredentialEmp(emp);
                              setNewPasswordInput('');
                              setShowActivePassword(false);
                            }}
                          >
                            <Key size={13} color="#f59e0b" />
                            <span>Portal Credentials</span>
                          </button>

                          {!(emp.email === 'director@enterprenex.solutions' || emp.email === 'director@enterprenexsolution.com' || emp.role.includes('Director') || emp.id === 'emp-1') && (
                            <button
                              type="button"
                              className="adm-btn adm-btn-danger"
                              style={{ padding: '0.35rem 0.55rem', fontSize: '0.72rem' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOffboardModalEmp(emp);
                                setPurgeDocsOnDelete(false);
                              }}
                              title="Resign, Offboard or Permanently Delete Employee"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
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
      {tab === 'attendance' && (() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const myTodayAtt = attendance.find(
          a => a.date === todayStr && (
            (currentUser?.name && a.employeeName.toLowerCase().includes(currentUser.name.toLowerCase())) ||
            (currentUser?.id && (a as any).employeeId === currentUser.id)
          )
        );
        const displayedAttendance = isRegularEmployee
          ? attendance.filter(a => a.employeeName.toLowerCase().includes((currentUser?.name || '').toLowerCase()))
          : attendance;

        return (
          <div>
            {/* Live Daily Punch-In / Punch-Out with time tracking & IP/geo check */}
            <div
              className="adm-card"
              style={{
                padding: '1.25rem 1.4rem',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.25rem',
                borderRadius: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt="Employee Avatar"
                  style={{ width: '54px', height: '54px', borderRadius: '10px', objectFit: 'cover', border: '2px solid var(--adm-success)' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--adm-text)' }}>
                      {currentUser?.name || 'Staff Member'}
                    </span>
                    <span className="adm-badge adm-badge-primary" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                      {currentUser?.employeeId || currentUser?.id || 'Staff ID'}
                    </span>
                    <span className="adm-badge" style={{ background: 'rgba(5, 150, 105, 0.12)', color: 'var(--adm-success)', border: '1px solid rgba(5, 150, 105, 0.3)', fontSize: '0.75rem', fontWeight: 700 }}>
                      🌐 IP: {detectedIp || '10.228.245.155'} &bull; Verified Pune HQ Geo-Fence
                    </span>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'rgba(234, 88, 12, 0.12)',
                      border: '1px solid rgba(234, 88, 12, 0.3)',
                      color: 'var(--adm-primary)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      fontSize: '0.8rem'
                    }}>
                      <Clock size={12} />
                      <span>{liveClock.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })} IST</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--adm-text-muted)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span>Today: <strong style={{ color: 'var(--adm-text)' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
                    <span>&bull;</span>
                    {
                      !myTodayAtt ? (
                        <span style={{ color: 'var(--adm-primary)', fontWeight: 700 }}>⏳ Not Checked In Yet (Awaiting Daily Punch)</span>
                      ) : myTodayAtt.checkOut && myTodayAtt.checkOut !== '-' ? (
                        <span style={{ color: 'var(--adm-success)', fontWeight: 700 }}>
                          ✓ Shift Completed (In: {myTodayAtt.checkIn} &bull; Out: {myTodayAtt.checkOut} &bull; Duration: {getShiftDuration(myTodayAtt.checkIn, myTodayAtt.checkOut)})
                        </span>
                      ) : (
                        <span style={{ color: 'var(--adm-success)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          ⚡ Active Shift Running &bull; In: {myTodayAtt.checkIn} &bull; Active: {getShiftDuration(myTodayAtt.checkIn)}
                          {isCheckInLate(myTodayAtt.checkIn) && (
                            <span className="adm-badge adm-badge-warning" style={{ fontSize: '0.65rem' }}>Late Punch (&gt; 09:30 AM)</span>
                          )}
                        </span>
                      )
                    }
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  className="adm-btn adm-btn-primary"
                  style={{
                    padding: '0.7rem 1.4rem',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    borderRadius: '10px',
                    background: (!myTodayAtt) ? 'var(--adm-success)' : (myTodayAtt.checkOut && myTodayAtt.checkOut !== '-') ? 'var(--adm-surface-hover)' : 'var(--adm-primary)',
                    color: (myTodayAtt && myTodayAtt.checkOut && myTodayAtt.checkOut !== '-') ? 'var(--adm-text-muted)' : '#fff',
                    borderColor: (!myTodayAtt) ? 'var(--adm-success)' : (myTodayAtt.checkOut && myTodayAtt.checkOut !== '-') ? 'var(--adm-border)' : 'var(--adm-primary)'
                  }}
                  onClick={() => {
                    if (myTodayAtt && myTodayAtt.checkOut && myTodayAtt.checkOut !== '-') {
                      showToast('Attendance Logged', 'You have already checked in and out for today.', 'info');
                      return;
                    }
                    markAttendanceToday('Present');
                  }}
                >
                  <CheckCircle2 size={17} />
                  <span>
                    {!myTodayAtt
                      ? 'Live Punch In (Record Entry)'
                      : (!myTodayAtt.checkOut || myTodayAtt.checkOut === '-')
                      ? 'Live Punch Out (Record Exit)'
                      : 'Day Completed ✓'}
                  </span>
                </button>
                <button
                  className="adm-btn adm-btn-secondary"
                  style={{ padding: '0.7rem 1.2rem', fontSize: '0.88rem', fontWeight: 700, borderRadius: '10px' }}
                  onClick={() => setShowHolidayModal(true)}
                  title="View 2026 Enterprenex Official Holidays"
                >
                  <Calendar size={17} color="var(--adm-success)" />
                  <span>Holiday Calendar</span>
                </button>
                <button
                  className="adm-btn adm-btn-secondary"
                  style={{ padding: '0.7rem 1.2rem', fontSize: '0.88rem', fontWeight: 700, borderRadius: '10px' }}
                  onClick={openApplyLeaveModal}
                >
                  <CalendarPlus size={17} color="var(--adm-primary)" />
                  <span>Apply for Leave</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--adm-text-dim)', fontWeight: 600 }}>
                  VIEW MODE:
                </span>
                <div style={{ display: 'inline-flex', background: 'var(--adm-surface)', border: '1px solid var(--adm-border)', borderRadius: '8px', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setAttendanceViewMode('register')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      background: attendanceViewMode === 'register' ? 'var(--adm-primary)' : 'transparent',
                      color: attendanceViewMode === 'register' ? '#fff' : 'var(--adm-text)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Daily Register ({displayedAttendance.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceViewMode('calendar')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      background: attendanceViewMode === 'calendar' ? 'var(--adm-primary)' : 'transparent',
                      color: attendanceViewMode === 'calendar' ? '#fff' : 'var(--adm-text)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    📅 Monthly Calendar Grid
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="adm-btn adm-btn-sm"
                  style={{ background: 'rgba(234, 88, 12, 0.12)', color: '#ea580c', border: '1px solid rgba(234, 88, 12, 0.35)', fontWeight: 700 }}
                  onClick={() => setShowRegularizationModal(true)}
                  title="Request Attendance Regularization for Missed Punch / Outdoor Duty"
                >
                  <Clock size={13} />
                  <span>Missed Punch / Regularize</span>
                </button>
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

            {attendanceViewMode === 'calendar' ? (
              <div className="adm-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--adm-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={18} color="var(--adm-primary)" />
                      October 2026 &bull; Monthly Attendance & Biometric Grid
                    </h4>
                    <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: 'var(--adm-text-dim)' }}>
                      Shift timing: 09:30 AM to 06:30 PM IST &bull; 9.0 hrs standard shift &bull; Pune Corporate HQ
                    </p>
                  </div>
                  {/* Legend */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.72rem', fontWeight: 600 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#059669' }}></span> Present (Full)
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#d97706' }}></span> Late Mark (&gt;09:30)
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7c3aed' }}></span> Half Day
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563eb' }}></span> Holiday (2)
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626' }}></span> Missed Punch
                    </span>
                  </div>
                </div>

                {/* Weekday Column Headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontWeight: 700, fontSize: '0.78rem', color: 'var(--adm-text-dim)', marginBottom: '8px' }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} style={{ padding: '6px', background: 'var(--adm-surface)', borderRadius: '6px' }}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* 31-Day Calendar Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                  {/* October 2026 starts on Thursday -> 3 leading blank slots (Mon, Tue, Wed) */}
                  {[null, null, null].map((_, i) => (
                    <div key={`blank-${i}`} style={{ minHeight: '82px', background: 'transparent' }} />
                  ))}

                  {Array.from({ length: 31 }, (_, i) => {
                    const dayNum = i + 1;
                    const dateFormatted = `2026-10-${dayNum.toString().padStart(2, '0')}`;
                    // Day of week for Oct 2026: (3 + dayNum - 1) % 7 where 0=Mon, 5=Sat, 6=Sun
                    const dow = (3 + dayNum - 1) % 7;
                    const isWeekend = dow === 5 || dow === 6;
                    
                    // Check official holidays
                    const holiday = ENTERPRENEX_HOLIDAYS_2026.find(h => {
                      const dayStr = dayNum.toString().padStart(2, '0');
                      return h.date.startsWith(`${dayStr} Oct`);
                    });

                    // Check attendance records
                    const dayAtt = displayedAttendance.find(a => 
                      a.date === dateFormatted || 
                      a.date === `${dayNum} Oct 2026` || 
                      a.date?.startsWith(`2026-10-${dayNum.toString().padStart(2, '0')}`)
                    );

                    const isToday = dayNum === 16;
                    const isPast = dayNum < 16;
                    const isMissedPunch = isPast && !isWeekend && !holiday && (!dayAtt || dayAtt.status === 'Absent');

                    let bg = 'var(--adm-surface)';
                    let border = '1px solid var(--adm-border)';
                    if (isToday) {
                      border = '2px solid #ea580c';
                      bg = 'rgba(234, 88, 12, 0.04)';
                    } else if (holiday) {
                      bg = 'rgba(59, 130, 246, 0.05)';
                      border = '1px solid rgba(59, 130, 246, 0.25)';
                    } else if (isWeekend) {
                      bg = 'rgba(100, 116, 139, 0.04)';
                    }

                    return (
                      <div
                        key={dayNum}
                        style={{
                          minHeight: '82px',
                          background: bg,
                          border,
                          borderRadius: '8px',
                          padding: '7px 8px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          position: 'relative',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isToday ? '#ea580c' : 'var(--adm-text)' }}>
                            {dayNum}
                          </span>
                          {isToday && (
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, background: '#ea580c', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>
                              TODAY
                            </span>
                          )}
                        </div>

                        <div style={{ marginTop: '4px' }}>
                          {holiday ? (
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#2563eb', lineHeight: 1.2 }}>
                              🎉 {holiday.name}
                            </div>
                          ) : isWeekend ? (
                            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--adm-text-dim)' }}>
                              Off (Weekend)
                            </div>
                          ) : dayAtt ? (
                            <div>
                              <div style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                color: dayAtt.status === 'Present' ? '#059669' : dayAtt.status === 'Late' ? '#d97706' : '#7c3aed'
                              }}>
                                {dayAtt.status === 'Present' ? '✓ Present' : dayAtt.status === 'Late' ? '⏱ Late Mark' : '🌓 Half Day'}
                              </div>
                              <div style={{ fontSize: '0.62rem', color: 'var(--adm-text-dim)', marginTop: '2px' }}>
                                {dayAtt.checkIn || '09:30 AM'} - {dayAtt.checkOut || '06:30 PM'}
                              </div>
                            </div>
                          ) : isMissedPunch ? (
                            <div>
                              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#dc2626' }}>
                                ⚠️ Missed Punch
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setRegDate(dateFormatted);
                                  setShowRegularizationModal(true);
                                }}
                                style={{
                                  marginTop: '2px',
                                  fontSize: '0.62rem',
                                  fontWeight: 700,
                                  color: '#ea580c',
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                  textDecoration: 'underline'
                                }}
                              >
                                Regularize ➔
                              </button>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.65rem', color: 'var(--adm-text-dim)' }}>
                              Scheduled (09:30 AM)
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="adm-table-container">
                <table className="adm-table">
                <thead>
                  <tr>
                    <th>Team Member</th>
                    <th>Date</th>
                    <th>Check In Time</th>
                    <th>Check Out Time</th>
                    <th>Attendance Status</th>
                    <th>Absence Note / Reason</th>
                    {canManageTeam && <th>Outreach & Action (RBAC)</th>}
                  </tr>
                </thead>
                <tbody>
                  {displayedAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={canManageTeam ? 7 : 6} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--adm-text-dim)' }}>
                        No attendance logged yet. Click "Punch In / Check In Now" above to record your entry.
                      </td>
                    </tr>
                  ) : (
                    displayedAttendance.map(att => {
                      const emp = employees.find(
                        e =>
                          (e.employeeId && e.employeeId === att.employeeId) ||
                          (e.name && att.employeeName && e.name.toLowerCase() === att.employeeName.toLowerCase())
                      );
                      const cleanPhone = emp?.phone?.replace(/[^\d+]/g, '') || '+919226860060';
                      const cleanPhoneNoPlus = cleanPhone.replace(/\+/g, '');
                      const empEmail = emp?.email || 'hr@enterprenex.solutions';

                      return (
                        <tr key={att.id}>
                          <td style={{ fontWeight: 700, color: 'var(--adm-text)' }}>{att.employeeName}</td>
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
                          <td style={{ maxWidth: '240px' }}>
                            {att.absenceReason || att.absenceNotes ? (
                              <div style={{ fontSize: '0.75rem' }}>
                                <div style={{ color: '#f59e0b', fontWeight: 700 }}>{att.absenceReason || 'Unexcused'}</div>
                                {att.absenceNotes && (
                                  <div style={{ color: 'var(--adm-text-dim)', fontSize: '0.7rem', marginTop: '2px', lineHeight: 1.3 }}>
                                    {att.absenceNotes}
                                  </div>
                                )}
                                {att.recordedBy && (
                                  <div style={{ color: 'var(--adm-text-dim)', fontSize: '0.65rem', marginTop: '2px' }}>
                                    Logged by: {att.recordedBy}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>-</span>
                            )}
                          </td>
                          {canManageTeam && (
                            <td>
                              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                                {/* Direct Phone Calling */}
                                <a
                                  href={`tel:${cleanPhone}`}
                                  className="adm-btn adm-btn-secondary"
                                  style={{ padding: '0.22rem 0.5rem', fontSize: '0.7rem', gap: '3px' }}
                                  title={`Call ${att.employeeName} (${cleanPhone})`}
                                >
                                  <Phone size={11} color="#38bdf8" />
                                  <span>Call</span>
                                </a>

                                {/* Direct WhatsApp Redirection */}
                                <a
                                  href={`https://wa.me/${cleanPhoneNoPlus}?text=${encodeURIComponent(
                                    `*ENTERPRENEX SOLUTIONS - ATTENDANCE CHECK-IN*\n\n` +
                                    `Dear ${att.employeeName},\n` +
                                    `Our workforce management portal shows you are marked *${att.status}* for today (${att.date}) without approved leave on file.\n\n` +
                                    `Please contact HR / your Project Manager immediately with your status.\n\n` +
                                    `HR Desk: +91-9226860060\nEnterprenex Solutions Pvt Ltd`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="adm-btn"
                                  style={{ background: '#25D366', color: '#fff', border: 'none', padding: '0.22rem 0.55rem', fontSize: '0.7rem', fontWeight: 700, gap: '3px' }}
                                  title="Send WhatsApp Absence Check-In Message"
                                >
                                  <MessageSquare size={11} />
                                  <span>WhatsApp</span>
                                </a>

                                {/* Direct Email Redirection */}
                                <a
                                  href={`mailto:${empEmail}?subject=${encodeURIComponent(`Absence Inquiry - Enterprenex Solutions Attendance (${att.date})`)}&body=${encodeURIComponent(
                                    `Dear ${att.employeeName},\n\n` +
                                    `Our official biometric/attendance system shows you have not checked in for duty on ${att.date} without prior approved leave.\n\n` +
                                    `Please reply to this email or contact HR at director@enterprenex.solutions with your justification.\n\n` +
                                    `Regards,\nHuman Resources & Operations\nEnterprenex Solutions Private Limited`
                                  )}`}
                                  className="adm-btn adm-btn-secondary"
                                  style={{ padding: '0.22rem 0.5rem', fontSize: '0.7rem', gap: '3px' }}
                                  title={`Send Email to ${empEmail}`}
                                >
                                  <Mail size={11} color="#f59e0b" />
                                  <span>Email</span>
                                </a>

                                {/* Direct SMS Redirection */}
                                <a
                                  href={`sms:${cleanPhone}?body=${encodeURIComponent(
                                    `Enterprenex HR: You are marked Absent on ${att.date}. Please report your status to your manager immediately.`
                                  )}`}
                                  className="adm-btn adm-btn-secondary"
                                  style={{ padding: '0.22rem 0.5rem', fontSize: '0.7rem', gap: '3px' }}
                                  title={`Send SMS to ${cleanPhone}`}
                                >
                                  <MessageCircle size={11} color="#10b981" />
                                  <span>SMS</span>
                                </a>

                                {/* Take / Edit Absence Note Modal Trigger */}
                                <button
                                  type="button"
                                  className="adm-btn adm-btn-primary"
                                  style={{ padding: '0.22rem 0.55rem', fontSize: '0.7rem', gap: '3px' }}
                                  onClick={() => {
                                    setAbsenceModalAtt(att);
                                    setAbsenceReasonInput(att.absenceReason || 'No Intimation Provided (Unexcused)');
                                    setAbsenceNotesInput(att.absenceNotes || '');
                                  }}
                                  title="Record or update official management explanation for this absence"
                                >
                                  <FileText size={11} />
                                  <span>Note</span>
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    })()}

      {/* ── 3. LEAVE APPROVALS ── */}
      {tab === 'leaves' && (() => {
        const displayedLeaves = isRegularEmployee
          ? leaves.filter(l => l.employeeName.toLowerCase().includes((currentUser?.name || '').toLowerCase()))
          : leaves;

        return (
          <div>
            {/* Employee Annual Leave Quota Balances Card Strip */}
            <div className="adm-grid-4" style={{ marginBottom: '1.25rem' }}>
              <div className="adm-kpi-card" style={{ padding: '1rem 1.15rem' }}>
                <div className="adm-kpi-header" style={{ marginBottom: '0.4rem' }}>
                  <span className="adm-kpi-label">Casual Leave (CL)</span>
                  <div className="adm-kpi-icon" style={{ background: 'var(--adm-primary-soft)', color: 'var(--adm-primary)' }}>
                    <CalendarPlus size={16} />
                  </div>
                </div>
                <div className="adm-kpi-value" style={{ fontSize: '1.35rem' }}>12 Days</div>
                <div className="adm-kpi-footer" style={{ marginTop: '0.35rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-muted)' }}>Personal & Urgent Affairs</span>
                </div>
              </div>

              <div className="adm-kpi-card" style={{ padding: '1rem 1.15rem' }}>
                <div className="adm-kpi-header" style={{ marginBottom: '0.4rem' }}>
                  <span className="adm-kpi-label">Sick Leave (SL)</span>
                  <div className="adm-kpi-icon" style={{ background: 'var(--adm-danger-soft)', color: 'var(--adm-danger)' }}>
                    <AlertCircle size={16} />
                  </div>
                </div>
                <div className="adm-kpi-value" style={{ fontSize: '1.35rem' }}>8 Days</div>
                <div className="adm-kpi-footer" style={{ marginTop: '0.35rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-muted)' }}>Medical & Health Recovery</span>
                </div>
              </div>

              <div className="adm-kpi-card" style={{ padding: '1rem 1.15rem' }}>
                <div className="adm-kpi-header" style={{ marginBottom: '0.4rem' }}>
                  <span className="adm-kpi-label">Earned / Privilege (EL)</span>
                  <div className="adm-kpi-icon" style={{ background: 'var(--adm-success-soft)', color: 'var(--adm-success)' }}>
                    <CheckCircle2 size={16} />
                  </div>
                </div>
                <div className="adm-kpi-value" style={{ fontSize: '1.35rem' }}>15 Days</div>
                <div className="adm-kpi-footer" style={{ marginTop: '0.35rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--adm-success)' }}>Paid Annual Vacation</span>
                </div>
              </div>

              <div className="adm-kpi-card" style={{ padding: '1rem 1.15rem' }}>
                <div className="adm-kpi-header" style={{ marginBottom: '0.4rem' }}>
                  <span className="adm-kpi-label">Work From Home (WFH)</span>
                  <div className="adm-kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#38bdf8' }}>
                    <Clock size={16} />
                  </div>
                </div>
                <div className="adm-kpi-value" style={{ fontSize: '1.35rem' }}>12 Days</div>
                <div className="adm-kpi-footer" style={{ marginTop: '0.35rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>Remote Shift Allowance</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--adm-text-dim)', fontWeight: 600 }}>
                  {canManageTeam ? 'LEAVE APPLICATIONS & APPROVALS' : 'MY LEAVE APPLICATIONS & STATUS'} ({displayedLeaves.length} TOTAL)
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
                <button className="adm-btn adm-btn-sm adm-btn-secondary" onClick={() => setShowHolidayModal(true)}>
                  <Calendar size={13} color="var(--adm-success)" />
                  <span>Holidays (2026)</span>
                </button>
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
                    <th className="adm-table-sticky-right" style={{ minWidth: '160px' }}>{canManageTeam ? 'Actions / Decision' : 'Action / Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                          <CalendarPlus size={36} color="var(--adm-primary)" />
                          <div style={{ fontWeight: 700, color: 'var(--adm-text)', fontSize: '1rem' }}>No Leave Requests on Record</div>
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
                    displayedLeaves.map(lv => (
                      <tr key={lv.id}>
                        <td style={{ fontWeight: 700, color: 'var(--adm-text)' }}>{lv.employeeName}</td>
                        <td>
                          <span className="adm-badge adm-badge-neutral" style={{ fontWeight: 600 }}>{lv.type}</span>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {lv.startDate} {lv.startDate !== lv.endDate ? `to ${lv.endDate}` : ''}
                        </td>
                        <td style={{ color: 'var(--adm-text-muted)', maxWidth: '280px' }}>{lv.reason}</td>
                      <td>
                        <span className={`adm-badge ${
                          lv.status === 'Approved' ? 'adm-badge-success' :
                          lv.status === 'Rejected' ? 'adm-badge-danger' : 'adm-badge-warning'
                        }`}>
                          {lv.status}
                        </span>
                      </td>
                      <td className="adm-table-sticky-right" style={{ minWidth: '160px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {canManageTeam ? (
                            lv.status === 'Pending' ? (
                              <>
                                <button
                                  className="adm-btn adm-btn-sm adm-btn-primary"
                                  style={{ padding: '0.3rem 0.65rem', background: 'var(--adm-success)', borderColor: 'var(--adm-success)' }}
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
                            ) : (
                              <>
                                <button
                                  className="adm-btn adm-btn-sm adm-btn-secondary"
                                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.72rem' }}
                                  onClick={() => updateLeaveStatus(lv.id, lv.status === 'Approved' ? 'Rejected' : 'Approved')}
                                  title="Change Decision"
                                >
                                  {lv.status === 'Approved' ? 'Reject' : 'Approve'}
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
      );
    })()}

      {/* ── MY PAYSLIPS & FORM 16 (TOPIC C) ── */}
      {tab === 'payroll' && (() => {
        const targetEmp = employees.find(e => e.email === currentUser?.email) || employees[0] || {
          id: 'EPX-001',
          name: currentUser?.name || 'Rohit Pawar',
          role: 'Managing Director',
          department: 'Executive Management',
          salaryMonthly: 125000,
          employeeId: 'EPX-DIR-001',
          panNumber: 'AAXPE1206M'
        };

        const gross = targetEmp.salaryMonthly || 50000;
        const basic = Math.round(gross * 0.5);
        const hra = Math.round(gross * 0.2);
        const specialAllowance = gross - basic - hra;
        const pf = Math.round(basic * 0.12);
        const pt = 200;
        const tds = gross > 75000 ? Math.round(gross * 0.05) : 0;
        const totalDeductions = pf + pt + tds;
        const netPay = gross - totalDeductions;

        const pastMonths = [
          { month: 'October 2026', status: 'Disbursed', date: '31 Oct 2026', ref: 'NEFT-EPX-90812' },
          { month: 'September 2026', status: 'Disbursed', date: '30 Sep 2026', ref: 'NEFT-EPX-88219' },
          { month: 'August 2026', status: 'Disbursed', date: '31 Aug 2026', ref: 'NEFT-EPX-86410' },
          { month: 'July 2026', status: 'Disbursed', date: '31 Jul 2026', ref: 'NEFT-EPX-84192' },
          { month: 'June 2026', status: 'Disbursed', date: '30 Jun 2026', ref: 'NEFT-EPX-81093' },
          { month: 'May 2026', status: 'Disbursed', date: '31 May 2026', ref: 'NEFT-EPX-79281' },
        ];

        return (
          <div>
            {/* Top 4 KPI Metric Strip */}
            <div className="adm-grid-4" style={{ marginBottom: '1.25rem' }}>
              <div className="adm-kpi-card" style={{ padding: '1rem 1.15rem' }}>
                <span className="adm-kpi-title">Gross Monthly CTC</span>
                <span className="adm-kpi-value" style={{ color: 'var(--adm-text)', fontSize: '1.35rem' }}>
                  ₹{gross.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', marginTop: '4px' }}>
                  Base compensation structure
                </span>
              </div>
              <div className="adm-kpi-card" style={{ padding: '1rem 1.15rem' }}>
                <span className="adm-kpi-title">Statutory Deductions</span>
                <span className="adm-kpi-value" style={{ color: '#ef4444', fontSize: '1.35rem' }}>
                  ₹{totalDeductions.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', marginTop: '4px' }}>
                  PF (12%) + PT (₹200) + TDS
                </span>
              </div>
              <div className="adm-kpi-card" style={{ padding: '1rem 1.15rem', background: 'rgba(5, 150, 105, 0.05)', borderColor: 'rgba(5, 150, 105, 0.25)' }}>
                <span className="adm-kpi-title" style={{ color: '#059669' }}>Net Disbursed Take-Home</span>
                <span className="adm-kpi-value" style={{ color: '#059669', fontSize: '1.35rem' }}>
                  ₹{netPay.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#059669', marginTop: '4px' }}>
                  Direct NEFT Bank Transfer
                </span>
              </div>
              <div className="adm-kpi-card" style={{ padding: '1rem 1.15rem' }}>
                <span className="adm-kpi-title">Form 16 Tax Regime</span>
                <span className="adm-kpi-value" style={{ color: 'var(--adm-primary)', fontSize: '1.2rem' }}>
                  New (u/s 115BAC)
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', marginTop: '4px' }}>
                  Std. Deduction ₹75,000 eligible
                </span>
              </div>
            </div>

            {/* Current Month Advice & Actions */}
            <div className="adm-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={20} color="var(--adm-primary)" />
                    Salary Advice & Breakdown &bull; {selectedPayMonth}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--adm-text-dim)' }}>
                    Employee: <strong>{targetEmp.name}</strong> ({targetEmp.employeeId || 'EPX-001'}) &bull; Designation: {targetEmp.role} &bull; Dept: {targetEmp.department}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <select
                    className="adm-select"
                    value={selectedPayMonth}
                    onChange={e => setSelectedPayMonth(e.target.value)}
                    style={{ minWidth: '150px' }}
                  >
                    <option value="October 2026">October 2026</option>
                    <option value="September 2026">September 2026</option>
                    <option value="August 2026">August 2026</option>
                    <option value="July 2026">July 2026</option>
                    <option value="June 2026">June 2026</option>
                    <option value="May 2026">May 2026</option>
                  </select>
                  <button
                    className="adm-btn adm-btn-secondary"
                    onClick={() => printForm16Summary(targetEmp as any)}
                    title="View and print official Form 16 Part B Tax Certificate"
                  >
                    <FileText size={15} />
                    <span>Form 16 Summary</span>
                  </button>
                  <button
                    className="adm-btn adm-btn-primary"
                    onClick={() => printOfficialPayslip(targetEmp as any, selectedPayMonth)}
                    title="Print and download official PDF Payslip"
                  >
                    <Printer size={15} />
                    <span>Print Official Payslip</span>
                  </button>
                </div>
              </div>

              {/* Two Column Earnings vs Deductions Table */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', border: '1px solid var(--adm-border)', borderRadius: '10px', overflow: 'hidden' }}>
                {/* Left: Earnings */}
                <div style={{ padding: '1.25rem', background: 'var(--adm-surface)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid var(--adm-border)', paddingBottom: '0.5rem' }}>
                    Earnings Head (Gross: ₹{gross.toLocaleString('en-IN')})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--adm-text-dim)' }}>Basic Salary (50%)</span>
                      <strong style={{ color: 'var(--adm-text)' }}>₹{basic.toLocaleString('en-IN')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--adm-text-dim)' }}>House Rent Allowance (HRA - 20%)</span>
                      <strong style={{ color: 'var(--adm-text)' }}>₹{hra.toLocaleString('en-IN')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--adm-text-dim)' }}>Special / Project Allowance (30%)</span>
                      <strong style={{ color: 'var(--adm-text)' }}>₹{specialAllowance.toLocaleString('en-IN')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--adm-border)', paddingTop: '0.6rem', fontWeight: 800 }}>
                      <span>Total Gross Earnings</span>
                      <span style={{ color: '#059669' }}>₹{gross.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Deductions */}
                <div style={{ padding: '1.25rem', background: 'var(--adm-surface)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid var(--adm-border)', paddingBottom: '0.5rem' }}>
                    Statutory Deductions (Total: ₹{totalDeductions.toLocaleString('en-IN')})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--adm-text-dim)' }}>Employee Provident Fund (EPF 12%)</span>
                      <strong style={{ color: 'var(--adm-text)' }}>₹{pf.toLocaleString('en-IN')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--adm-text-dim)' }}>Professional Tax (Maharashtra PT)</span>
                      <strong style={{ color: 'var(--adm-text)' }}>₹{pt.toLocaleString('en-IN')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--adm-text-dim)' }}>TDS / Income Tax Withholding</span>
                      <strong style={{ color: 'var(--adm-text)' }}>₹{tds.toLocaleString('en-IN')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--adm-border)', paddingTop: '0.6rem', fontWeight: 800 }}>
                      <span>Total Deductions</span>
                      <span style={{ color: '#ef4444' }}>₹{totalDeductions.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Banner */}
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '1rem 1.25rem',
                  borderRadius: '8px',
                  background: 'rgba(5, 150, 105, 0.08)',
                  border: '1.5px solid #059669',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                    Net Disbursed Take-Home Pay
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-dim)', marginTop: '2px' }}>
                    Official Salary Disbursed via Electronic Bank Transfer (NEFT) &bull; Enterprenex Corporate Seal Applied
                  </div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669' }}>
                  ₹{netPay.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Historical Payslips Table */}
            <div className="adm-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--adm-text)' }}>
                  Historical Salary Advice Archive (FY 2026-27)
                </h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--adm-text-dim)' }}>
                  6 Statements Available
                </span>
              </div>
              <div className="adm-table-container">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Pay Period</th>
                      <th>Disbursement Date</th>
                      <th>Reference ID</th>
                      <th>Net Disbursed</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastMonths.map(p => (
                      <tr key={p.month}>
                        <td style={{ fontWeight: 700, color: 'var(--adm-text)' }}>{p.month}</td>
                        <td>{p.date}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{p.ref}</td>
                        <td style={{ fontWeight: 800, color: '#059669' }}>₹{netPay.toLocaleString('en-IN')}</td>
                        <td>
                          <span className="adm-badge adm-badge-success">{p.status}</span>
                        </td>
                        <td>
                          <button
                            className="adm-btn adm-btn-sm adm-btn-secondary"
                            onClick={() => printOfficialPayslip(targetEmp as any, p.month)}
                            title="Download/Print Payslip"
                          >
                            <Printer size={13} />
                            <span>Download Payslip</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── COMPANY POLICIES & DOCUMENT VAULT (TOPIC D) ── */}
      {tab === 'policies' && (() => {
        return (
          <div>
            {/* Header info card */}
            <div className="adm-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.25rem', background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.05), rgba(5, 150, 105, 0.05))', border: '1px solid var(--adm-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={20} color="var(--adm-primary)" />
                    Official Enterprenex Corporate Policies (2026 Governance)
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--adm-text-dim)' }}>
                    Statutory corporate bylaws, IT security compliance, POSH guidelines, and personal employee document repository.
                  </p>
                </div>
                <button className="adm-btn adm-btn-primary" onClick={() => setShowUploadVaultModal(true)}>
                  <Upload size={15} />
                  <span>Upload to Vault</span>
                </button>
              </div>
            </div>

            {/* 5 Official Policies Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
              {ENTERPRENEX_POLICIES.map(pol => (
                <div
                  key={pol.code}
                  className="adm-card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid var(--adm-border)',
                    borderRadius: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <span className="adm-badge adm-badge-primary" style={{ fontSize: '0.7rem', fontWeight: 800 }}>
                        {pol.code}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>
                        Effective: {pol.effectiveDate}
                      </span>
                    </div>
                    <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.02rem', fontWeight: 800, color: 'var(--adm-text)' }}>
                      {pol.title}
                    </h4>
                    <span style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--adm-primary)', marginBottom: '0.6rem' }}>
                      Category: {pol.category}
                    </span>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--adm-text-dim)', lineHeight: 1.5 }}>
                      {pol.summary}
                    </p>
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--adm-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>
                      {pol.sections.length} Key Clauses
                    </span>
                    <button
                      className="adm-btn adm-btn-sm adm-btn-secondary"
                      onClick={() => setSelectedPolicyModal(pol)}
                      style={{ fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      <span>Read Policy Guidelines</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Employee Document Vault Section */}
            <div className="adm-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--adm-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={18} color="#059669" />
                    Personal Employee Document Vault (DPDP Act 2023 Compliant)
                  </h4>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: 'var(--adm-text-dim)' }}>
                    End-to-end encrypted repository for personal credentials, degrees, contracts, and identity KYC.
                  </p>
                </div>
                <button className="adm-btn adm-btn-sm adm-btn-primary" onClick={() => setShowUploadVaultModal(true)}>
                  <Upload size={13} />
                  <span>Upload Document</span>
                </button>
              </div>

              <div className="adm-table-container">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Document Name</th>
                      <th>Category</th>
                      <th>File Size</th>
                      <th>Upload Date</th>
                      <th>Verification Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaultDocs.map(doc => (
                      <tr key={doc.name}>
                        <td style={{ fontWeight: 700, color: 'var(--adm-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={15} color="var(--adm-primary)" />
                          {doc.name}
                        </td>
                        <td>{doc.category}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--adm-text-dim)' }}>{doc.size}</td>
                        <td>{doc.date}</td>
                        <td>
                          <span
                            className="adm-badge adm-badge-success"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <CheckCircle size={11} />
                            Verified by HR & Director
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              className="adm-btn adm-btn-sm adm-btn-secondary"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                              onClick={() => showToast('Opening Preview', `Viewing document ${doc.name} in secure sandbox.`, 'info')}
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </button>
                            <button
                              className="adm-btn adm-btn-sm adm-btn-secondary"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                              onClick={() => showToast('Download Started', `Downloading ${doc.name}`, 'success')}
                            >
                              <Download size={12} />
                              <span>Download</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── 4. WORKLOAD & CAPACITY ENGINE ── */}
      {tab === 'workload' && (() => {
        const totalCapacityHours = employees.length * 40;
        const totalAssignedHours = tasks
          .filter(t => t.status !== 'Done')
          .reduce((sum, t) => sum + (t.estimatedHours || 8), 0);
        const overallUtilization = Math.round((totalAssignedHours / (totalCapacityHours || 1)) * 100);

        const availableCount = employees.filter(e => (e.workloadPercentage || 75) < 70).length;
        const overloadedCount = employees.filter(e => (e.workloadPercentage || 75) > 100).length;

        return (
          <div>
            {/* Minimalist Capacity Summary Strip */}
            <div className="adm-card" style={{ padding: '1.1rem 1.35rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Weekly Engineering Capacity</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--adm-text)', marginTop: '2px' }}>
                    {totalCapacityHours} <span style={{ fontSize: '0.78rem', color: 'var(--adm-text-dim)', fontWeight: 400 }}>Hours</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>Across {employees.length} members &bull; 40h standard</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Sprint Load Allocation</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--adm-text)', marginTop: '2px' }}>
                    {overallUtilization}%
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>{totalAssignedHours}h scheduled in active sprints</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Available Capacity</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                    {availableCount} <span style={{ fontSize: '0.78rem', color: 'var(--adm-text-dim)', fontWeight: 400 }}>Staff</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>&lt;70% sprint load threshold</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Overloaded / Crunch</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: overloadedCount > 0 ? '#ef4444' : '#fff', marginTop: '2px' }}>
                    {overloadedCount} <span style={{ fontSize: '0.78rem', color: 'var(--adm-text-dim)', fontWeight: 400 }}>Staff</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>&gt;100% threshold alert</div>
                </div>
              </div>
            </div>

            {/* Capacity Roster Table */}
            <div className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--adm-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--adm-text)', margin: 0 }}>
                    Team Workload & Weekly Capacity
                  </h3>
                  <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>
                    Burnout and capacity monitoring based on standard 40h engineering sprints
                  </p>
                </div>
              </div>

              <div className="adm-table-wrapper">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Team Member</th>
                      <th>Weekly Standard</th>
                      <th>Sprint Load</th>
                      <th>Capacity Utilization</th>
                      <th>Status</th>
                      <th>Active Tasks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(employees || []).map(emp => {
                      if (!emp) return null;
                      const empNameLower = (emp.name || '').toLowerCase();
                      const empId = emp.employeeId || emp.id || '';
                      const empTasks = (tasks || []).filter(t => {
                        if (!t || t.status === 'Done') return false;
                        const assignedLower = (t.assignedTo || '').toLowerCase();
                        return (empNameLower && assignedLower.includes(empNameLower)) || (empId && (t.assignedTo || '').includes(empId));
                      });
                      const assignedHours = empTasks.reduce((sum, t) => sum + (t?.estimatedHours || 8), 0);
                      const loadPct = emp.workloadPercentage || Math.min(130, Math.round((assignedHours / 40) * 100));

                      const statusBadge =
                        loadPct < 70 ? (
                          <span className="adm-badge adm-badge-success">
                            Available (&lt;70%)
                          </span>
                        ) : loadPct <= 100 ? (
                          <span className="adm-badge adm-badge-info">
                            Healthy (70-100%)
                          </span>
                        ) : (
                          <span className="adm-badge adm-badge-danger">
                            Overloaded (&gt;100%)
                          </span>
                        );

                      const barColor = loadPct < 70 ? '#10b981' : loadPct <= 100 ? '#38bdf8' : '#ef4444';

                      return (
                        <tr key={emp.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img
                                src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                alt={emp.name}
                                style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--adm-text)', fontSize: '0.85rem' }}>{emp.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>
                                  {emp.role} &bull; <span style={{ fontFamily: 'monospace' }}>{emp.employeeId || emp.id}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)' }}>
                            40h / wk
                          </td>
                          <td style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--adm-text)' }}>
                            {Math.round((loadPct / 100) * 40)}h <span style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)', fontWeight: 400 }}>allocated</span>
                          </td>
                          <td style={{ width: '200px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '3px' }}>
                              <span style={{ color: barColor, fontWeight: 700 }}>{loadPct}%</span>
                              <span style={{ color: 'var(--adm-text-dim)' }}>Limit: 100%</span>
                            </div>
                            <div className="adm-progress-bar" style={{ height: '4px' }}>
                              <div
                                className="adm-progress-fill"
                                style={{ width: `${Math.min(100, loadPct)}%`, background: barColor }}
                              />
                            </div>
                          </td>
                          <td>{statusBadge}</td>
                          <td>
                            <span className="adm-badge adm-badge-neutral">
                              {empTasks.length} Task(s)
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── 5. IT SKILL MATRIX (MINIMALISM) ── */}
      {tab === 'skills' && (() => {
        const categories = ['All', 'Frontend', 'Backend', 'Cloud & DevOps', 'Database & AI', 'Architecture'];

        return (
          <div>
            {/* Filter Pills */}
            <div className="adm-card" style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSkillCategoryFilter(cat)}
                    style={{
                      background: skillCategoryFilter === cat ? 'var(--adm-primary)' : 'transparent',
                      color: skillCategoryFilter === cat ? '#fff' : 'var(--adm-text-muted)',
                      border: '1px solid ' + (skillCategoryFilter === cat ? 'var(--adm-primary)' : 'var(--adm-border)'),
                      borderRadius: '4px',
                      padding: '0.3rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>
                Scale: 1 (Beginner) &bull; 2-3 (Intermediate) &bull; 4 (Advanced) &bull; 5 (Expert)
              </div>
            </div>

            {/* Employee Skill Matrix (Minimalist Table Layout) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(employees || [])
                .filter((emp, idx, arr) => 
                  emp && arr.findIndex(e => (e.employeeId && e.employeeId === emp.employeeId) || (e.email && e.email === emp.email)) === idx
                )
                .sort((a, b) => {
                  if (a.email === currentUser?.email || a.id === currentUser?.id) return -1;
                  if (b.email === currentUser?.email || b.id === currentUser?.id) return 1;
                  return 0;
                })
                .map(emp => {
                const matrix = (emp.skillsMatrix && emp.skillsMatrix.length > 0)
                  ? emp.skillsMatrix
                  : (emp.skills && emp.skills.length > 0)
                  ? emp.skills.map((skName, i) => ({
                      name: skName,
                      category: i % 2 === 0 ? 'Frontend' : 'Backend',
                      level: 'Expert' as const,
                      rating: 5,
                      verifiedRating: 5,
                      isVerified: true,
                      verifiedBy: 'Rohit Pawar (Managing Director)'
                    }))
                  : [
                      { name: 'Full-Stack Development', category: 'Backend', level: 'Expert' as const, rating: 5, verifiedRating: 5, isVerified: true, verifiedBy: 'Rohit Pawar (Managing Director)' }
                    ];

                const filteredSkills = matrix.filter(s => {
                  if (skillCategoryFilter === 'All') return true;
                  return s.category.toLowerCase().includes(skillCategoryFilter.toLowerCase());
                });

                return (
                  <div key={emp.id} className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Minimalist Member Header */}
                    <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--adm-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={emp.name}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--adm-text)', fontSize: '0.9rem' }}>{emp.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>
                            {emp.role} &bull; <span style={{ fontFamily: 'monospace' }}>{emp.employeeId || emp.id}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="adm-badge adm-badge-success" style={{ fontSize: '0.7rem' }}>
                          Verified: {matrix.filter(s => s.isVerified).length} / {matrix.length}
                        </span>
                      </div>
                    </div>

                    {/* Minimalist Skill Table */}
                    <div className="adm-table-wrapper">
                      <table className="adm-table">
                        <thead>
                          <tr>
                            <th>Technology / Skill</th>
                            <th>Domain</th>
                            <th>Proficiency</th>
                            <th>Verification Status</th>
                            {canManageTeam && <th>Manager Action</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSkills.map(sk => {
                            const levelBadge =
                              sk.level === 'Expert' ? 'adm-badge-success' :
                              sk.level === 'Advanced' ? 'adm-badge-info' :
                              sk.level === 'Intermediate' ? 'adm-badge-warning' : 'adm-badge-neutral';

                            return (
                              <tr key={sk.name}>
                                <td style={{ fontWeight: 600, color: 'var(--adm-text)' }}>
                                  {sk.name}
                                </td>
                                <td>
                                  <span className="adm-badge adm-badge-neutral" style={{ fontSize: '0.68rem' }}>
                                    {sk.category}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className={`adm-badge ${levelBadge}`} style={{ fontSize: '0.68rem' }}>
                                      {sk.level}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--adm-text-dim)', fontWeight: 600 }}>
                                      {sk.rating}/5
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  {sk.isVerified ? (
                                    <span style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                      <ShieldCheck size={12} />
                                      Verified ({sk.verifiedRating || sk.rating}/5)
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>
                                      Pending Review
                                    </span>
                                  )}
                                </td>
                                {canManageTeam && (
                                  <td>
                                    {!sk.isVerified ? (
                                      <button
                                        type="button"
                                        onClick={() => verifyEmployeeSkill(emp.employeeId || emp.id, sk.name, Math.min(5, sk.rating))}
                                        className="adm-btn adm-btn-secondary adm-btn-sm"
                                        style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}
                                      >
                                        ✓ Verify ({sk.rating}/5)
                                      </button>
                                    ) : (
                                      <span style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>
                                        Audited
                                      </span>
                                    )}
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── 6. ROLE-SPECIFIC WEIGHTED KPI & OKR ENGINE ── */}
      {tab === 'kpis' && (() => {
        const selectedKpi = kpis.find(k => k.employeeId === selectedKpiEmpId) || kpis[0];

        return (
          <div>
            {/* Header / Employee Selector */}
            <div className="adm-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                  Role-Specific Weighted KPI Scorecards & OKR Milestones
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--adm-text-dim)' }}>
                  Mathematical formula: Final Score = &Sigma;(Metric Score &times; Weight) / 100
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)', fontWeight: 600 }}>Select Employee:</span>
                <select
                  className="adm-select"
                  style={{ width: '240px' }}
                  value={selectedKpi?.employeeId}
                  onChange={e => setSelectedKpiEmpId(e.target.value)}
                >
                  {kpis.map(k => (
                    <option key={k.employeeId} value={k.employeeId}>
                      {k.employeeName} ({k.roleTemplate})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedKpi && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Scorecard Hero Banner */}
                <div
                  className="adm-card"
                  style={{
                    padding: '1.2rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1.25rem'
                  }}
                >
                  <div>
                    <span className="adm-badge adm-badge-primary" style={{ marginBottom: '6px' }}>
                      {selectedKpi.roleTemplate} &bull; {selectedKpi.period}
                    </span>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--adm-text)', margin: '2px 0' }}>
                      {selectedKpi.employeeName}
                    </h2>
                    <div style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)' }}>
                      Weighted Mathematical Performance Evaluation &bull; Updated: {selectedKpi.updatedAt}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Weighted KPI Score
                      </div>
                      <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
                        {selectedKpi.finalKpiScore}{' '}
                        <span style={{ fontSize: '1rem', color: 'var(--adm-text-dim)', fontWeight: 600 }}>/ 100</span>
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '0.5rem 0.85rem',
                        borderRadius: '8px',
                        background: selectedKpi.finalKpiScore >= 90 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(2, 132, 199, 0.2)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '0.68rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Performance Tier</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--adm-text)', marginTop: '2px' }}>
                        {selectedKpi.finalKpiScore >= 90 ? 'Grade A+ (Top)' : selectedKpi.finalKpiScore >= 80 ? 'Grade A (Strong)' : 'Grade B'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weighted Metrics Breakdown Table */}
                <div className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--adm-border)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                      Role-Specific Weighted Metrics Breakdown
                    </h3>
                  </div>

                  <div className="adm-table-wrapper">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>KPI Metric Item</th>
                          <th>Weight (%)</th>
                          <th>Target Benchmark</th>
                          <th>Actual Performance</th>
                          <th>Metric Score (0-100)</th>
                          <th>Weighted Contribution</th>
                          {canManageTeam && <th>Action</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedKpi.metrics.map(m => {
                          const weightedVal = Math.round((m.score * (m.weight / 100)) * 10) / 10;
                          const isEditing = editingMetricId === m.id;

                          return (
                            <tr key={m.id}>
                              <td style={{ fontWeight: 700, color: 'var(--adm-text)' }}>{m.name}</td>
                              <td style={{ fontWeight: 700, color: 'var(--adm-primary)' }}>{m.weight}%</td>
                              <td style={{ color: 'var(--adm-text-muted)' }}>{m.target}</td>
                              <td>
                                {isEditing ? (
                                  <input
                                    className="adm-input"
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: '130px' }}
                                    value={editMetricActual}
                                    onChange={e => setEditMetricActual(e.target.value)}
                                  />
                                ) : (
                                  <strong style={{ color: 'var(--adm-text)' }}>{m.actual}</strong>
                                )}
                              </td>
                              <td>
                                {isEditing ? (
                                  <input
                                    type="number"
                                    className="adm-input"
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: '80px' }}
                                    value={editMetricScore}
                                    onChange={e => setEditMetricScore(Number(e.target.value))}
                                  />
                                ) : (
                                  <span style={{ fontWeight: 800, color: m.score >= 90 ? '#10b981' : '#38bdf8' }}>
                                    {m.score} / 100
                                  </span>
                                )}
                              </td>
                              <td style={{ fontWeight: 700, color: '#10b981' }}>
                                +{weightedVal} pts
                              </td>
                              {canManageTeam && (
                                <td>
                                  {isEditing ? (
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      <button
                                        type="button"
                                        className="adm-btn adm-btn-primary adm-btn-sm"
                                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                                        onClick={() => {
                                          updateKpiMetric(selectedKpi.employeeId, m.id, editMetricActual, editMetricScore);
                                          setEditingMetricId(null);
                                        }}
                                      >
                                        Save
                                      </button>
                                      <button
                                        type="button"
                                        className="adm-btn adm-btn-secondary adm-btn-sm"
                                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                                        onClick={() => setEditingMetricId(null)}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      className="adm-btn adm-btn-secondary adm-btn-sm"
                                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                                      onClick={() => {
                                        setEditingMetricId(m.id);
                                        setEditMetricActual(m.actual);
                                        setEditMetricScore(m.score);
                                      }}
                                    >
                                      Edit Metric
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Company OKRs Section */}
                <div className="adm-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                        Company Objectives & Key Results (OKRs)
                      </h3>
                      <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--adm-text-dim)' }}>
                        Top-level enterprise strategic goals and quantitative delivery key results
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {okrs.map(okr => (
                      <div
                        key={okr.id}
                        style={{
                          background: 'var(--adm-bg)',
                          border: '1px solid var(--adm-border)',
                          borderRadius: '8px',
                          padding: '1rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <span className="adm-badge adm-badge-primary" style={{ marginRight: '6px' }}>{okr.department}</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--adm-text-dim)' }}>Lead: {okr.ownerName} &bull; {okr.period}</span>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--adm-text)', margin: '4px 0 0' }}>
                              {okr.objectiveTitle}
                            </h4>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>
                              {okr.progressPercent}% Completed
                            </span>
                          </div>
                        </div>

                        {/* Objective Progress Bar */}
                        <div className="adm-progress-bar" style={{ height: '7px', marginBottom: '12px' }}>
                          <div className="adm-progress-fill" style={{ width: `${okr.progressPercent}%` }} />
                        </div>

                        {/* Key Results Checklist */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {okr.keyResults.map(kr => (
                            <div
                              key={kr.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.5rem 0.75rem',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '6px',
                                border: '1px solid var(--adm-border)',
                                fontSize: '0.78rem'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle size={14} color={kr.progressPercent >= 100 ? '#10b981' : '#38bdf8'} />
                                <span style={{ color: 'var(--adm-text)', fontWeight: 600 }}>{kr.title}</span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ color: 'var(--adm-text-dim)' }}>
                                  Target: {kr.target} &bull; Current: <strong style={{ color: 'var(--adm-text)' }}>{kr.current}</strong>
                                </span>
                                <span
                                  className="adm-badge"
                                  style={{
                                    background: kr.progressPercent >= 100 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                                    color: kr.progressPercent >= 100 ? '#10b981' : '#38bdf8',
                                    fontWeight: 700
                                  }}
                                >
                                  {kr.progressPercent}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── APPLY FOR LEAVE MODAL ── */}
      {showApplyLeaveModal && (
        <div className="adm-modal-overlay" onClick={() => setShowApplyLeaveModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                  Submit Leave Application
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--adm-text-dim)' }}>
                  Request sick leave, casual time off, half-day shifts, or personal days for review
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setShowApplyLeaveModal(false)}>
                <X size={18} />
              </button>
            </div>

            {(() => {
              const clashInfo = checkLeaveClash(applicantName, startDate, endDate);
              return (
                <form onSubmit={handleApplyLeaveSubmit} style={{ marginTop: '1rem' }}>
                  {clashInfo && (
                    <div
                      style={{
                        background: 'rgba(234, 88, 12, 0.08)',
                        border: '1px solid rgba(234, 88, 12, 0.35)',
                        borderRadius: '8px',
                        padding: '0.75rem 1rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                    >
                      <AlertCircle size={20} color="#ea580c" style={{ flexShrink: 0 }} />
                      <div style={{ fontSize: '0.78rem', color: 'var(--adm-text)', lineHeight: 1.4 }}>
                        <strong style={{ color: '#ea580c' }}>Department Leave Clash Notice:</strong>{' '}
                        <strong>{clashInfo.clashingEmployee}</strong> from <strong>{clashInfo.department}</strong> is already scheduled for {clashInfo.type} during {clashInfo.dates}. This application will flag a departmental overlap for Director approval.
                      </div>
                    </div>
                  )}

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
                      <option value="Casual Leave">Casual Leave (CL - Personal / Urgent Affair)</option>
                      <option value="Sick Leave">Sick Leave (SL - Medical / Health Recovery)</option>
                      <option value="Paid Leave">Earned Leave (EL - Privilege Annual Paid Leave)</option>
                      <option value="Unpaid">Loss of Pay / Unpaid Leave</option>
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

                  {/* Half-Day Toggle (First Half vs Second Half vs Full Day) */}
                  <div className="adm-form-group">
                    <label className="adm-form-label">Duration & Shift Scope</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.35rem' }}>
                      {(['Full Day', 'Half Day (First Half: 09:30 AM - 01:30 PM)', 'Half Day (Second Half: 02:00 PM - 06:30 PM)'] as const).map(dur => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setLeaveDuration(dur)}
                          style={{
                            padding: '0.55rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            borderRadius: '8px',
                            border: leaveDuration === dur ? '1.5px solid #ea580c' : '1px solid var(--adm-border)',
                            background: leaveDuration === dur ? 'rgba(234, 88, 12, 0.1)' : 'var(--adm-surface)',
                            color: leaveDuration === dur ? '#ea580c' : 'var(--adm-text)',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {dur === 'Full Day' ? '☀️ Full Day' : dur.includes('First') ? '🌅 First Half (AM)' : '🌇 Second Half (PM)'}
                        </button>
                      ))}
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
          );
        })()}
          </div>
        </div>
      )}

      {/* ── ENTERPRENEX OFFICIAL HOLIDAY CALENDAR MODAL ── */}
      {showHolidayModal && (
        <div className="adm-modal-overlay" onClick={() => setShowHolidayModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={20} color="var(--adm-primary)" />
                  <span>Enterprenex Official Holiday Calendar (2026)</span>
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--adm-text-dim)' }}>
                  Corporate & Pan-India Calendar &bull; 13 Official Public & Gazetted Holidays
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setShowHolidayModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ maxHeight: '460px', overflowY: 'auto', marginTop: '1rem', border: '1px solid var(--adm-border)', borderRadius: '10px' }}>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Holiday / Festival</th>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Classification</th>
                  </tr>
                </thead>
                <tbody>
                  {ENTERPRENEX_HOLIDAYS_2026.map((hol, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: 'var(--adm-text)' }}>{hol.name}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--adm-primary)' }}>{hol.date}</td>
                      <td style={{ color: 'var(--adm-text-muted)' }}>{hol.day}</td>
                      <td>
                        <span className={`adm-badge ${hol.type === 'National Holiday' ? 'adm-badge-primary' : hol.type === 'Festival' ? 'adm-badge-success' : 'adm-badge-neutral'}`}>
                          {hol.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowHolidayModal(false)}>
                Close Calendar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MISSED PUNCH / ATTENDANCE REGULARIZATION MODAL (TOPIC A) ── */}
      {showRegularizationModal && (
        <div className="adm-modal-overlay" onClick={() => setShowRegularizationModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={19} color="#ea580c" />
                  <span>Attendance Regularization Request</span>
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--adm-text-dim)' }}>
                  Submit punch adjustment for biometric delay, offsite duty, or missing record
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setShowRegularizationModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!regReason.trim()) {
                  showToast('Validation Error', 'Please provide a justification for punch regularization.', 'error');
                  return;
                }

                // Add or regularize attendance record
                markAttendanceToday('Present');
                showToast(
                  'Regularization Submitted',
                  `Regularization for ${regDate} (${regInTime} - ${regOutTime}) logged for Director / HR approval.`,
                  'success'
                );
                setShowRegularizationModal(false);
              }}
              style={{ marginTop: '1rem' }}
            >
              <div className="adm-form-group">
                <label className="adm-form-label">Regularization Date *</label>
                <input
                  type="date"
                  className="adm-input"
                  required
                  value={regDate}
                  onChange={e => setRegDate(e.target.value)}
                />
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Actual Punch In Time *</label>
                  <input
                    type="text"
                    className="adm-input"
                    required
                    value={regInTime}
                    onChange={e => setRegInTime(e.target.value)}
                    placeholder="e.g. 09:30 AM"
                  />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Actual Punch Out Time *</label>
                  <input
                    type="text"
                    className="adm-input"
                    required
                    value={regOutTime}
                    onChange={e => setRegOutTime(e.target.value)}
                    placeholder="e.g. 06:30 PM"
                  />
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Reason / Justification *</label>
                <select
                  className="adm-select"
                  value={regReason}
                  onChange={e => setRegReason(e.target.value)}
                  style={{ marginBottom: '0.5rem' }}
                >
                  <option value="Biometric / Network Sync Delay">Biometric / Network Sync Delay</option>
                  <option value="Client Onsite / Client Meeting Duty">Client Onsite / Client Meeting Duty</option>
                  <option value="WFH Emergency Approval">WFH Emergency Pre-Approved Shift</option>
                  <option value="Device Hardware Malfunction">Biometric Scanner Malfunction</option>
                  <option value="Other Business Justification">Other Business Justification</option>
                </select>
                <textarea
                  className="adm-textarea"
                  rows={2}
                  value={regReason}
                  onChange={e => setRegReason(e.target.value)}
                  placeholder="Elaborate details for HR & Managing Director review..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowRegularizationModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary">
                  <CheckCircle2 size={15} />
                  <span>Submit Regularization</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── COMPANY POLICY VIEWER MODAL (TOPIC D) ── */}
      {selectedPolicyModal && (
        <div className="adm-modal-overlay" onClick={() => setSelectedPolicyModal(null)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="adm-modal-header" style={{ borderBottom: '2px solid #ea580c', paddingBottom: '0.75rem' }}>
              <div>
                <span className="adm-badge adm-badge-primary" style={{ fontSize: '0.7rem', fontWeight: 800 }}>
                  {selectedPolicyModal.code} &bull; {selectedPolicyModal.category}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--adm-text)', margin: '6px 0 0 0' }}>
                  {selectedPolicyModal.title}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--adm-text-dim)' }}>
                  Effective Date: {selectedPolicyModal.effectiveDate} &bull; Approved by: Rohit Pawar (Managing Director)
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setSelectedPolicyModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ maxHeight: '480px', overflowY: 'auto', marginTop: '1.25rem', paddingRight: '0.5rem' }}>
              <div style={{ background: 'rgba(234, 88, 12, 0.05)', border: '1px solid rgba(234, 88, 12, 0.25)', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
                <strong style={{ fontSize: '0.82rem', color: '#ea580c' }}>Executive Summary:</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--adm-text)', lineHeight: 1.5 }}>
                  {selectedPolicyModal.summary}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {selectedPolicyModal.sections.map((sec, idx) => (
                  <div key={idx} style={{ background: 'var(--adm-surface)', border: '1px solid var(--adm-border)', borderRadius: '8px', padding: '1rem' }}>
                    <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.92rem', fontWeight: 800, color: 'var(--adm-text)' }}>
                      {sec.heading}
                    </h5>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--adm-text-dim)', lineHeight: 1.55 }}>
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.5rem', padding: '0.85rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Issued under Enterprenex Corporate Seal &bull; CIN: U72900PN2023PTC221940</span>
                <strong style={{ color: '#047857' }}>✓ Statutorily Active</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setSelectedPolicyModal(null)}>
                Close Policy Guidelines
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── UPLOAD DOCUMENT TO VAULT MODAL (TOPIC D) ── */}
      {showUploadVaultModal && (
        <div className="adm-modal-overlay" onClick={() => setShowUploadVaultModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Upload size={18} color="var(--adm-primary)" />
                  <span>Upload to Personal Document Vault</span>
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--adm-text-dim)' }}>
                  DPDP Act 2023 Encrypted &bull; Tamper-evident repository
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setShowUploadVaultModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!newVaultDocName.trim()) {
                  showToast('Validation Error', 'Please enter a valid document name.', 'error');
                  return;
                }
                const formattedName = newVaultDocName.trim().endsWith('.pdf')
                  ? newVaultDocName.trim()
                  : `${newVaultDocName.trim()}.pdf`;

                setVaultDocs(prev => [
                  {
                    name: formattedName,
                    category: newVaultDocCat,
                    size: '380 KB',
                    date: new Date().toISOString().split('T')[0],
                    verified: true
                  },
                  ...prev
                ]);
                showToast('Document Vaulted', `${formattedName} uploaded and verified successfully in your vault.`, 'success');
                setNewVaultDocName('');
                setShowUploadVaultModal(false);
              }}
              style={{ marginTop: '1rem' }}
            >
              <div className="adm-form-group">
                <label className="adm-form-label">Document Title / File Name *</label>
                <input
                  type="text"
                  className="adm-input"
                  required
                  value={newVaultDocName}
                  onChange={e => setNewVaultDocName(e.target.value)}
                  placeholder="e.g. Master_Degree_Certificate.pdf"
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Document Category *</label>
                <select
                  className="adm-select"
                  value={newVaultDocCat}
                  onChange={e => setNewVaultDocCat(e.target.value)}
                >
                  <option value="Statutory KYC">Statutory KYC (PAN / Aadhaar / Passport)</option>
                  <option value="Education">Academic & Degree Certificates</option>
                  <option value="Offer & Contract">Offer Letter & Employment Agreements</option>
                  <option value="Identity & Address Proof">Identity & Address Proof</option>
                  <option value="Certificates & Awards">Professional Certifications & Awards</option>
                </select>
              </div>

              <div style={{ border: '2px dashed var(--adm-border)', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', margin: '1rem 0', background: 'var(--adm-surface)' }}>
                <FileText size={32} color="var(--adm-text-dim)" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text)' }}>
                  Drag & Drop Document Here or Browse Files
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', marginTop: '4px' }}>
                  Supports PDF, JPG, PNG up to 10 MB &bull; AES-256 Bit Encrypted
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowUploadVaultModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary">
                  <Upload size={15} />
                  <span>Upload & Vault Document</span>
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text)' }}>Add Team Member to Roster</h3>
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
                  <label className="adm-form-label" style={{ margin: '0 0 4px 0', fontSize: '0.8rem', color: 'var(--adm-text)', fontWeight: 700 }}>
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
                    <option value="Intern">Intern / Trainee</option>
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

              {/* Sprint Workload Allocation */}
              <div className="adm-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="adm-form-label" style={{ margin: 0 }}>Sprint Workload Capacity Allocation (%)</label>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                    color: workload >= 100 ? '#ef4444' : 'var(--adm-primary)'
                  }}>
                    {workload}% {workload >= 100 ? '(Full Capacity)' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={workload}
                    onChange={e => setWorkload(Number(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--adm-primary)' }}
                  />
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[25, 50, 75].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setWorkload(pct)}
                        className="adm-btn adm-btn-sm"
                        style={{
                          padding: '3px 8px',
                          fontSize: '0.7rem',
                          background: workload === pct ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                          color: workload === pct ? '#fff' : 'var(--adm-text-muted)'
                        }}
                      >
                        {pct}%
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setWorkload(100)}
                      className="adm-btn adm-btn-sm"
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: workload === 100 ? '#ef4444' : 'rgba(239, 68, 68, 0.15)',
                        color: workload === 100 ? '#fff' : '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      100% Max
                    </button>
                  </div>
                </div>
              </div>

              {/* Mandatory Government KYC & Tax Identification */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--adm-border)',
                  borderRadius: '12px',
                  padding: '1.1rem',
                  marginBottom: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={16} color="#10b981" />
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--adm-text)' }}>
                      Statutory Government KYC & Tax IDs
                    </span>
                  </div>
                  <span className="adm-badge adm-badge-warning" style={{ fontSize: '0.65rem' }}>
                    Mandatory for Indian Pvt Ltd
                  </span>
                </div>

                <div className="adm-grid-2">
                  {/* PAN Card Field */}
                  <div className="adm-form-group">
                    <label className="adm-form-label">
                      PAN Card Number (10 Digits) *
                    </label>
                    <input
                      className="adm-input"
                      required
                      value={panNumber}
                      onChange={e => setPanNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. ABCDE1234F"
                      maxLength={10}
                      style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}
                    />
                    <div style={{ marginTop: '6px' }}>
                      <label
                        className="adm-btn adm-btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', cursor: 'pointer', display: 'inline-flex', gap: '5px' }}
                      >
                        <Upload size={12} color="var(--adm-primary)" />
                        <span>{panDocName ? panDocName : 'Upload PAN Card (PDF/Image)'}</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          style={{ display: 'none' }}
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) {
                              handlePhotoFileChange(f, url => {
                                setPanDocUrl(url);
                                setPanDocName(f.name);
                                showToast('PAN Attached', `${f.name} attached for KYC verification.`, 'info');
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Aadhaar Card Field */}
                  <div className="adm-form-group">
                    <label className="adm-form-label">
                      Aadhaar Card Number (12 Digits) *
                    </label>
                    <input
                      className="adm-input"
                      required
                      value={aadhaarNumber}
                      onChange={e => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                        setAadhaarNumber(digits);
                      }}
                      placeholder="e.g. 123456789012"
                      maxLength={12}
                      style={{ fontFamily: 'monospace', fontWeight: 700 }}
                    />
                    <div style={{ marginTop: '6px' }}>
                      <label
                        className="adm-btn adm-btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', cursor: 'pointer', display: 'inline-flex', gap: '5px' }}
                      >
                        <Upload size={12} color="var(--adm-info)" />
                        <span>{aadhaarDocName ? aadhaarDocName : 'Upload Aadhaar Card (PDF/Image)'}</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          style={{ display: 'none' }}
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) {
                              handlePhotoFileChange(f, url => {
                                setAadhaarDocUrl(url);
                                setAadhaarDocName(f.name);
                                showToast('Aadhaar Attached', `${f.name} attached for KYC verification.`, 'info');
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <p style={{ margin: '0.65rem 0 0 0', fontSize: '0.7rem', color: '#94a3b8' }}>
                  🔒 <strong>Confidential Identity Protection:</strong> These sensitive government identification records are encrypted and accessible exclusively to the <strong>Managing Director</strong> and authorized <strong>Human Resources</strong> personnel for TDS, PF and payroll processing.
                </p>
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
                    ⏳ <strong>Director Approval Required:</strong> As HR, after adding this team member, login access will be pending until Managing Director (Rohit Pawar - director@enterprenex.solutions) reviews and approves the credentials.
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
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
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
              <div style={{ background: 'var(--adm-surface)', border: '1px solid var(--adm-border)', borderRadius: '12px', padding: '1.15rem' }}>
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
                    <span style={{ color: 'var(--adm-text)', fontSize: '0.85rem' }}>{credentialEmp.email}</span>
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
                            approvedBy: currentUser?.name || 'Rohit Pawar (Managing Director)',
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
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--adm-text)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
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

      {/* ── EMPLOYEE EXIT, RESIGNATION & PERMANENT DELETION MODAL ── */}
      {offboardModalEmp && (
        <div className="adm-modal-overlay" onClick={() => setOffboardModalEmp(null)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="adm-modal-header" style={{ borderBottom: '1px solid var(--adm-border)', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                  Employee Exit & Offboarding
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--adm-text-dim)' }}>
                  Managing Director & HR Administrative Console
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setOffboardModalEmp(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Target Employee Info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem 1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                border: '1px solid var(--adm-border)',
                margin: '1.25rem 0'
              }}
            >
              <img
                src={offboardModalEmp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={offboardModalEmp.name}
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: 'var(--adm-text)', fontSize: '1rem' }}>{offboardModalEmp.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--adm-primary)', fontWeight: 600 }}>{offboardModalEmp.role}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', fontFamily: 'monospace' }}>
                  ID: {offboardModalEmp.employeeId || offboardModalEmp.id} &bull; {offboardModalEmp.email}
                </div>
              </div>
              <span
                className={`adm-badge ${
                  offboardModalEmp.status === 'Active'
                    ? 'adm-badge-success'
                    : offboardModalEmp.status === 'Resigned'
                    ? 'adm-badge-warning'
                    : offboardModalEmp.status === 'Terminated'
                    ? 'adm-badge-danger'
                    : 'adm-badge-neutral'
                }`}
              >
                {offboardModalEmp.status}
              </span>
            </div>

            {/* Option 1: Mark as Resigned & Revoke Portal Login */}
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b' }}>
                  Option 1: Mark as Resigned & Revoke Login (Recommended)
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)', margin: '0 0 0.85rem 0', lineHeight: 1.5 }}>
                Immediately cuts off all portal login and password access. Preserves their 6-month work records, task history, and past salary/TDS data for mandatory statutory audits, Form 16, and relieving letters.
              </p>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.6rem', background: '#d97706', borderColor: '#d97706' }}
                onClick={() => {
                  updateEmployee(offboardModalEmp.id, {
                    status: 'Resigned',
                    approvalStatus: 'Rejected'
                  });
                  if (documents && updateDocument) {
                    documents.forEach(d => {
                      if (d.employeeId === offboardModalEmp.employeeId || d.tags.includes(offboardModalEmp.employeeId)) {
                        updateDocument(d.id, { accessPermission: 'Admin Only' });
                      }
                    });
                  }
                  showToast('Employee Resigned', `${offboardModalEmp.name} marked as Resigned. Portal login revoked immediately.`, 'warning');
                  setOffboardModalEmp(null);
                }}
              >
                <span>Resign & Revoke Login Access</span>
              </button>
            </div>

            {/* Option 2: Permanently Delete from Database */}
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ef4444' }}>
                  Option 2: Permanently Delete Employee (Full Wipe)
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)', margin: '0 0 0.85rem 0', lineHeight: 1.5 }}>
                Completely and irreversibly removes this employee profile, credentials, and records from the company database.
              </p>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={purgeDocsOnDelete}
                  onChange={e => setPurgeDocsOnDelete(e.target.checked)}
                />
                <span>Also permanently delete all uploaded PAN, Aadhaar, and Vault files</span>
              </label>

              <button
                type="button"
                className="adm-btn adm-btn-danger"
                style={{ width: '100%', justifyContent: 'center', padding: '0.6rem' }}
                onClick={() => {
                  deleteEmployee(offboardModalEmp.id, purgeDocsOnDelete);
                  setOffboardModalEmp(null);
                }}
              >
                <Trash2 size={15} />
                <span>Permanently Delete All Records</span>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                onClick={() => setOffboardModalEmp(null)}
              >
                Cancel
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
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
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

      {/* ── STATUTORY KYC & GOVERNMENT ID VAULT MODAL ── */}
      {kycModalEmp && (
        <div className="adm-modal-overlay" onClick={() => setKycModalEmp(null)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="adm-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={20} color="#10b981" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                    Government KYC & Statutory Vault
                  </h3>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--adm-text-dim)' }}>
                  PAN & Aadhaar Compliance for <strong>{kycModalEmp.name}</strong> ({kycModalEmp.employeeId || kycModalEmp.id})
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setKycModalEmp(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Statutory Confidentiality Alert Banner */}
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                margin: '1rem 0 1.25rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <ShieldCheck size={22} color="#10b981" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                <strong>Confidential Statutory Identity Vault:</strong> This vault is strictly confidential. Only the <strong>Managing Director</strong> and authorized <strong>Human Resources</strong> officers may inspect or verify these government records.
              </div>
            </div>

            {/* 2-Column KYC Cards (PAN & Aadhaar) */}
            <div className="adm-grid-2" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
              {/* PAN Card Box */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--adm-border)',
                  borderRadius: '10px',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--adm-primary)' }}>
                    PERMANENT ACCOUNT NUMBER
                  </span>
                  <span className="adm-badge adm-badge-neutral" style={{ fontSize: '0.62rem' }}>
                    Income Tax (TDS)
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <input
                    className="adm-input"
                    value={editKycPan}
                    onChange={e => setEditKycPan(e.target.value.toUpperCase())}
                    placeholder="PAN Number"
                    maxLength={10}
                    style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '1px' }}
                  />
                  <button
                    type="button"
                    className="adm-btn adm-btn-secondary"
                    style={{ padding: '0.45rem' }}
                    onClick={() => copyToClipboard(editKycPan, 'pan')}
                    title="Copy PAN Number"
                  >
                    {copiedKey === 'pan' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Document Status & View/Download Buttons */}
                <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '8px', padding: '0.65rem', marginBottom: '10px', border: '1px solid var(--adm-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: kycModalEmp.panDocUrl ? '6px' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={14} color="var(--adm-primary)" />
                      <span style={{ fontSize: '0.72rem', color: 'var(--adm-text)', fontWeight: 600 }}>
                        {kycModalEmp.panDocUrl ? 'PAN_Document.pdf/img' : 'Physical File Onboarded'}
                      </span>
                    </div>
                    <span className="adm-badge adm-badge-success" style={{ fontSize: '0.62rem' }}>
                      {kycModalEmp.panDocUrl ? 'Uploaded' : 'Archived'}
                    </span>
                  </div>

                  {/* Thumbnail / Document Preview Banner */}
                  {kycModalEmp.panDocUrl && (
                    <div style={{ margin: '6px 0', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#000', maxHeight: '110px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {kycModalEmp.panDocUrl.startsWith('data:image') || kycModalEmp.panDocUrl.includes('.jpg') || kycModalEmp.panDocUrl.includes('.png') ? (
                        <img src={kycModalEmp.panDocUrl} alt="PAN Card" style={{ width: '100%', maxHeight: '110px', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={24} color="#ef4444" />
                          <span>PDF Document Attached</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* View Document & Download Action Buttons */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <button
                      type="button"
                      className="adm-btn adm-btn-sm adm-btn-secondary"
                      style={{ flex: 1, justifyContent: 'center', padding: '0.35rem 0.5rem', fontSize: '0.72rem', gap: '4px' }}
                      onClick={() => {
                        setPreviewDocModal({
                          title: `PAN Card - ${kycModalEmp.name}`,
                          url: kycModalEmp.panDocUrl || '',
                          number: editKycPan || kycModalEmp.panNumber,
                          type: 'Permanent Account Number (PAN) • Income Tax Dept'
                        });
                      }}
                    >
                      <Eye size={12} color="var(--adm-primary)" />
                      <span>View Document</span>
                    </button>

                    {kycModalEmp.panDocUrl && (
                      <button
                        type="button"
                        className="adm-btn adm-btn-sm adm-btn-secondary"
                        style={{ padding: '0.35rem 0.6rem' }}
                        onClick={() => downloadDoc(kycModalEmp.panDocUrl!, `PAN_${kycModalEmp.name.replace(/\s+/g, '_')}.png`)}
                        title="Download PAN Document"
                      >
                        <Download size={12} />
                      </button>
                    )}
                  </div>
                </div>

                <label
                  className="adm-btn adm-btn-sm adm-btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', cursor: 'pointer', gap: '5px' }}
                >
                  <Upload size={12} color="var(--adm-primary)" />
                  <span>{kycModalEmp.panDocUrl ? 'Replace PAN File' : 'Upload PAN File'}</span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) {
                        handlePhotoFileChange(f, url => {
                          updateEmployee(kycModalEmp.id, { panDocUrl: url });
                          setKycModalEmp(prev => prev ? { ...prev, panDocUrl: url } : null);
                          // Sync to central Document Vault
                          uploadDocument({
                            title: `PAN Card - ${kycModalEmp.name} (${editKycPan || kycModalEmp.panNumber || kycModalEmp.employeeId})`,
                            category: 'Employee Docs',
                            fileFormat: f.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'JPG',
                            fileSize: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
                            version: 'v1.0',
                            accessPermission: 'Executive',
                            tags: ['KYC', 'PAN', 'IncomeTax', kycModalEmp.employeeId || kycModalEmp.id],
                            url: url
                          });
                          showToast('PAN Document Uploaded', `${f.name} attached and secured in Document Vault. Click "View Document" to inspect.`, 'success');
                        });
                      }
                    }}
                  />
                </label>
              </div>

              {/* Aadhaar Card Box */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--adm-border)',
                  borderRadius: '10px',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--adm-info)' }}>
                    AADHAAR CARD (UIDAI)
                  </span>
                  <span className="adm-badge adm-badge-neutral" style={{ fontSize: '0.62rem' }}>
                    EPFO & Identity
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <input
                    className="adm-input"
                    value={showFullAadhaar ? editKycAadhaar : maskAadhaarNumber(editKycAadhaar)}
                    onFocus={() => setShowFullAadhaar(true)}
                    onClick={() => setShowFullAadhaar(true)}
                    onChange={e => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setEditKycAadhaar(digits);
                    }}
                    placeholder="12-Digit Aadhaar"
                    maxLength={12}
                    style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '1px' }}
                  />
                  <button
                    type="button"
                    className="adm-btn adm-btn-secondary"
                    style={{ padding: '0.45rem' }}
                    onClick={() => setShowFullAadhaar(!showFullAadhaar)}
                    title={showFullAadhaar ? 'Mask Aadhaar Number' : 'Reveal Full 12 Digits (Director / HR only)'}
                  >
                    {showFullAadhaar ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    type="button"
                    className="adm-btn adm-btn-secondary"
                    style={{ padding: '0.45rem' }}
                    onClick={() => copyToClipboard(editKycAadhaar, 'aadhaar')}
                    title="Copy Aadhaar Number"
                  >
                    {copiedKey === 'aadhaar' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Document Status & View/Download Buttons */}
                <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '8px', padding: '0.65rem', marginBottom: '10px', border: '1px solid var(--adm-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: kycModalEmp.aadhaarDocUrl ? '6px' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={14} color="var(--adm-info)" />
                      <span style={{ fontSize: '0.72rem', color: 'var(--adm-text)', fontWeight: 600 }}>
                        {kycModalEmp.aadhaarDocUrl ? 'Aadhaar_Document.pdf/img' : 'Physical File Onboarded'}
                      </span>
                    </div>
                    <span className="adm-badge adm-badge-success" style={{ fontSize: '0.62rem' }}>
                      {kycModalEmp.aadhaarDocUrl ? 'Uploaded' : 'Archived'}
                    </span>
                  </div>

                  {/* Thumbnail / Document Preview Banner */}
                  {kycModalEmp.aadhaarDocUrl && (
                    <div style={{ margin: '6px 0', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#000', maxHeight: '110px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {kycModalEmp.aadhaarDocUrl.startsWith('data:image') || kycModalEmp.aadhaarDocUrl.includes('.jpg') || kycModalEmp.aadhaarDocUrl.includes('.png') ? (
                        <img src={kycModalEmp.aadhaarDocUrl} alt="Aadhaar Card" style={{ width: '100%', maxHeight: '110px', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={24} color="#ef4444" />
                          <span>PDF Document Attached</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* View Document & Download Action Buttons */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <button
                      type="button"
                      className="adm-btn adm-btn-sm adm-btn-secondary"
                      style={{ flex: 1, justifyContent: 'center', padding: '0.35rem 0.5rem', fontSize: '0.72rem', gap: '4px' }}
                      onClick={() => {
                        setPreviewDocModal({
                          title: `Aadhaar Card - ${kycModalEmp.name}`,
                          url: kycModalEmp.aadhaarDocUrl || '',
                          number: editKycAadhaar || kycModalEmp.aadhaarNumber,
                          type: 'Aadhaar Card (UIDAI Identity & EPFO)'
                        });
                      }}
                    >
                      <Eye size={12} color="var(--adm-info)" />
                      <span>View Document</span>
                    </button>

                    {kycModalEmp.aadhaarDocUrl && (
                      <button
                        type="button"
                        className="adm-btn adm-btn-sm adm-btn-secondary"
                        style={{ padding: '0.35rem 0.6rem' }}
                        onClick={() => downloadDoc(kycModalEmp.aadhaarDocUrl!, `Aadhaar_${kycModalEmp.name.replace(/\s+/g, '_')}.png`)}
                        title="Download Aadhaar Document"
                      >
                        <Download size={12} />
                      </button>
                    )}
                  </div>
                </div>

                <label
                  className="adm-btn adm-btn-sm adm-btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', cursor: 'pointer', gap: '5px' }}
                >
                  <Upload size={12} color="var(--adm-info)" />
                  <span>{kycModalEmp.aadhaarDocUrl ? 'Replace Aadhaar File' : 'Upload Aadhaar File'}</span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) {
                        handlePhotoFileChange(f, url => {
                          updateEmployee(kycModalEmp.id, { aadhaarDocUrl: url });
                          setKycModalEmp(prev => prev ? { ...prev, aadhaarDocUrl: url } : null);
                          // Sync to central Document Vault
                          uploadDocument({
                            title: `Aadhaar Card - ${kycModalEmp.name} (${kycModalEmp.employeeId || kycModalEmp.id})`,
                            category: 'Employee Docs',
                            fileFormat: f.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'JPG',
                            fileSize: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
                            version: 'v1.0',
                            accessPermission: 'Executive',
                            tags: ['KYC', 'Aadhaar', 'UIDAI', kycModalEmp.employeeId || kycModalEmp.id],
                            url: url
                          });
                          showToast('Aadhaar Document Uploaded', `${f.name} attached and secured in Document Vault. Click "View Document" to inspect.`, 'success');
                        });
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Current KYC Verification Status Details */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--adm-border)',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>Verification Audit Status</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                  <span className={`adm-badge ${kycModalEmp.kycStatus === 'Verified' ? 'adm-badge-success' : 'adm-badge-warning'}`}>
                    {kycModalEmp.kycStatus === 'Verified' ? '✓ Statutory KYC Verified' : '⏳ Pending HR / Director Verification'}
                  </span>
                  {kycModalEmp.kycVerifiedBy && (
                    <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                      Verified by <strong>{kycModalEmp.kycVerifiedBy}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons for KYC Verification and Saving */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {canAccessKyc && (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                      type="button"
                      className="adm-btn adm-btn-sm adm-btn-primary"
                      style={{ background: '#059669', borderColor: '#059669', gap: '5px' }}
                      onClick={() => {
                        const cleanPan = editKycPan.trim().toUpperCase();
                        const cleanAadhaar = editKycAadhaar.trim().replace(/\D/g, '');
                        const verifier = currentUser?.name || 'Managing Director';
                        const verDate = new Date().toISOString();

                        updateEmployee(kycModalEmp.id, {
                          panNumber: cleanPan || kycModalEmp.panNumber,
                          aadhaarNumber: cleanAadhaar || kycModalEmp.aadhaarNumber,
                          kycStatus: 'Verified',
                          kycVerifiedBy: verifier,
                          kycVerifiedAt: verDate
                        });
                        setKycModalEmp(prev => prev ? {
                          ...prev,
                          panNumber: cleanPan || prev.panNumber,
                          aadhaarNumber: cleanAadhaar || prev.aadhaarNumber,
                          kycStatus: 'Verified',
                          kycVerifiedBy: verifier,
                          kycVerifiedAt: verDate
                        } : null);

                        // Sync to all vault documents matching this employee ID
                        if (documents && updateDocument) {
                          documents.forEach(d => {
                            if (d.employeeId === kycModalEmp.employeeId || d.tags.includes(kycModalEmp.employeeId) || d.tags.includes(kycModalEmp.id)) {
                              updateDocument(d.id, {
                                employeeId: kycModalEmp.employeeId,
                                verificationStatus: 'Verified',
                                verifiedBy: verifier,
                                verifiedAt: verDate
                              });
                            }
                          });
                        }

                        showToast('KYC Verified', `Approved and verified statutory KYC for Employee ID: ${kycModalEmp.employeeId} (${kycModalEmp.name}).`, 'success');
                      }}
                    >
                      <CheckCircle2 size={13} />
                      <span>Approve & Verify</span>
                    </button>

                    {kycModalEmp.kycStatus === 'Verified' && (
                      <button
                        type="button"
                        className="adm-btn adm-btn-sm adm-btn-secondary"
                        style={{ fontSize: '0.72rem' }}
                        onClick={() => {
                          updateEmployee(kycModalEmp.id, { kycStatus: 'Pending Verification' });
                          setKycModalEmp(prev => prev ? { ...prev, kycStatus: 'Pending Verification' } : null);
                          if (documents && updateDocument) {
                            documents.forEach(d => {
                              if (d.employeeId === kycModalEmp.employeeId || d.tags.includes(kycModalEmp.employeeId) || d.tags.includes(kycModalEmp.id)) {
                                updateDocument(d.id, { verificationStatus: 'Pending Verification' });
                              }
                            });
                          }
                          showToast('KYC Set to Pending', `Employee ID ${kycModalEmp.employeeId} set to Pending Verification.`, 'info');
                        }}
                      >
                        Reset to Pending
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  className="adm-btn adm-btn-sm adm-btn-primary"
                  onClick={handleSaveKycData}
                  style={{ gap: '5px' }}
                >
                  <Check size={13} />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>

            {/* Modal Footer with Primary Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
              <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setKycModalEmp(null)}>
                Close Vault
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                style={{ gap: '6px', padding: '0.5rem 1.25rem', fontWeight: 700 }}
                onClick={handleSaveKycData}
              >
                <Check size={15} />
                <span>Save KYC Details</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HIGH-RES DOCUMENT LIGHTBOX PREVIEW MODAL ── */}
      {previewDocModal && (
        <div className="adm-modal-overlay" style={{ zIndex: 1100 }} onClick={() => setPreviewDocModal(null)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px', width: '95%' }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                  {previewDocModal.title}
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: 'var(--adm-text-dim)' }}>
                  {previewDocModal.type} &bull; Identifier: <strong style={{ color: 'var(--adm-primary)', fontFamily: 'monospace' }}>{previewDocModal.number || 'Verified'}</strong>
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setPreviewDocModal(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Document Preview Display */}
            <div style={{ margin: '1.25rem 0', minHeight: '260px', maxHeight: '65vh', overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#070d19', borderRadius: '10px', padding: '1rem', border: '1px solid var(--adm-border)' }}>
              {previewDocModal.url ? (
                previewDocModal.url.startsWith('data:application/pdf') || previewDocModal.url.endsWith('.pdf') ? (
                  <iframe src={previewDocModal.url} title={previewDocModal.title} style={{ width: '100%', height: '55vh', border: 'none', borderRadius: '6px' }} />
                ) : (
                  <img src={previewDocModal.url} alt={previewDocModal.title} style={{ maxWidth: '100%', maxHeight: '55vh', objectFit: 'contain', borderRadius: '6px', boxShadow: '0 8px 30px rgba(0,0,0,0.6)' }} />
                )
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', maxWidth: '440px' }}>
                  <div style={{ display: 'inline-flex', padding: '14px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '1rem' }}>
                    <ShieldCheck size={44} color="#10b981" />
                  </div>
                  <h4 style={{ color: 'var(--adm-text)', fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>
                    Physical Document On File (Verified)
                  </h4>
                  <p style={{ color: 'var(--adm-text-dim)', fontSize: '0.8rem', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                    Official government statutory record verified for ID <strong>{previewDocModal.number}</strong>. You can upload an electronic scan anytime using the <strong>Upload File</strong> button in the KYC Vault.
                  </p>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--adm-border)', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--adm-primary)', fontWeight: 700 }}>
                    GOVT ID: {previewDocModal.number}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>
                🔒 Watermarked for Enterprenex Solutions Pvt Ltd compliance.
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {previewDocModal.url && (
                  <button
                    type="button"
                    className="adm-btn adm-btn-primary"
                    style={{ gap: '5px' }}
                    onClick={() => downloadDoc(previewDocModal.url, `${previewDocModal.title.replace(/\s+/g, '_')}.png`)}
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>
                )}
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setPreviewDocModal(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ISSUE CERTIFICATE MODAL ── */}
      {showCertModal && (
        <div className="adm-modal-overlay" onClick={() => setShowCertModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={20} color="#10b981" />
                  Issue Official Corporate Certificate
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--adm-text-dim)' }}>
                  Generates an authentic certificate registered in the Central Vault and verifiable at /verification
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setShowCertModal(false)}>
                <X size={18} />
              </button>
            </div>

            {issuedCertSuccess ? (
              <div style={{ marginTop: '1.5rem', textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', border: '2px solid rgba(16, 185, 129, 0.4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '1rem' }}>
                  <CheckCircle2 size={36} />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--adm-text)', margin: '0 0 0.5rem' }}>
                  Certificate Issued Successfully!
                </h4>
                <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.25rem', maxWidth: '480px', margin: '0 auto 1.5rem', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--adm-text-dim)' }}>RECIPIENT: <strong style={{ color: 'var(--adm-text)' }}>{issuedCertSuccess.name}</strong></div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--adm-text-dim)', marginTop: '4px' }}>TYPE: <strong style={{ color: '#38bdf8' }}>{issuedCertSuccess.certType}</strong></div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--adm-text-dim)', marginTop: '4px' }}>CERTIFICATE ID: <strong style={{ color: '#10b981', fontFamily: 'monospace' }}>{issuedCertSuccess.certId}</strong></div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--adm-text-dim)', marginTop: '4px' }}>DURATION: <strong style={{ color: 'var(--adm-text)' }}>{issuedCertSuccess.duration}</strong> ({issuedCertSuccess.completionDate})</div>
                  <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ✓ Registered in Central Vault & immediately verifiable at enterprenexsolution.com/verification
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="adm-btn adm-btn-primary"
                    style={{ gap: '0.5rem', padding: '0.65rem 1.4rem' }}
                    onClick={() => printOfficialCertificate(issuedCertSuccess)}
                  >
                    <Printer size={16} />
                    <span>Print Official Certificate</span>
                  </button>
                  <button
                    type="button"
                    className="adm-btn adm-btn-secondary"
                    onClick={() => setShowCertModal(false)}
                  >
                    Done / Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleIssueCertificateSubmit} style={{ marginTop: '1.25rem' }}>
                <div className="adm-grid-2">
                  <div className="adm-form-group">
                    <label className="adm-form-label">Recipient / Candidate Name *</label>
                    <input
                      className="adm-input"
                      required
                      value={certRecipientName}
                      onChange={e => setCertRecipientName(e.target.value)}
                      placeholder="e.g. Polamreddy Revanth Reddy"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-form-label">Employee / Intern ID (Optional)</label>
                    <input
                      className="adm-input"
                      value={certRecipientEmpId}
                      onChange={e => setCertRecipientEmpId(e.target.value)}
                      placeholder="e.g. 202600000002"
                    />
                  </div>
                </div>

                <div className="adm-grid-2">
                  <div className="adm-form-group">
                    <label className="adm-form-label">Certificate Type *</label>
                    <select
                      className="adm-select"
                      value={certType}
                      onChange={e => setCertType(e.target.value)}
                    >
                      <option value="Internship Completion Certificate">Internship Completion Certificate</option>
                      <option value="Relieving & Experience Certificate">Relieving & Experience Certificate</option>
                      <option value="Letter of Recommendation & Merit">Letter of Recommendation & Merit</option>
                    </select>
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-form-label">Tenure Duration *</label>
                    <select
                      className="adm-select"
                      value={certDuration}
                      onChange={e => setCertDuration(e.target.value)}
                    >
                      <option value="6 Months">6 Months</option>
                      <option value="3 Months">3 Months</option>
                      <option value="1 Year">1 Year</option>
                      <option value="4 Months">4 Months</option>
                    </select>
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Domain & Technology Track *</label>
                  <input
                    className="adm-input"
                    required
                    value={certDomain}
                    onChange={e => setCertDomain(e.target.value)}
                    placeholder="e.g. Full Stack Web Development & Cloud Systems"
                  />
                </div>

                <div className="adm-grid-2">
                  <div className="adm-form-group">
                    <label className="adm-form-label">Joining / Start Date</label>
                    <input
                      className="adm-input"
                      type="date"
                      value={certStartDate}
                      onChange={e => setCertStartDate(e.target.value)}
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-form-label">Completion Date *</label>
                    <input
                      className="adm-input"
                      type="date"
                      required
                      value={certEndDate}
                      onChange={e => setCertEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="adm-grid-2">
                  <div className="adm-form-group">
                    <label className="adm-form-label">Performance Evaluation *</label>
                    <select
                      className="adm-select"
                      value={certGrade}
                      onChange={e => setCertGrade(e.target.value)}
                    >
                      <option value="Grade A+ (Outstanding Performance)">Grade A+ (Outstanding Performance)</option>
                      <option value="Grade A (Excellent Performance)">Grade A (Excellent Performance)</option>
                      <option value="Grade B+ (Good Performance)">Grade B+ (Good Performance)</option>
                    </select>
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-form-label">Certificate ID (Auto-Generated)</label>
                    <input
                      className="adm-input"
                      value={certIdInput}
                      onChange={e => setCertIdInput(e.target.value)}
                      placeholder="e.g. ENX-INT-2026-0001"
                      style={{ fontFamily: 'monospace', color: '#10b981', fontWeight: 700 }}
                    />
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--adm-border)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.75rem', color: 'var(--adm-text-dim)', marginBottom: '1.25rem' }}>
                  🛡️ <strong>Statutory Authority:</strong> Authorized by Managing Director (Rohit Pawar) & HR Governance. Once issued, this credential will be verifiable worldwide on the Enterprenex public portal.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowCertModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="adm-btn adm-btn-primary">
                    <Award size={16} />
                    <span>Issue & Save Certificate</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── ABSENCE INCIDENT NOTE & AUDIT MODAL (RBAC: DIRECTOR & HR) ── */}
      {absenceModalAtt && canManageTeam && (
        <div className="adm-modal-overlay" onClick={() => setAbsenceModalAtt(null)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                  Absence Incident & Audit Note
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--adm-text-dim)' }}>
                  Record official management explanation for unexcused or sudden absence
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setAbsenceModalAtt(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Target Attendance Info */}
            <div style={{ background: 'var(--adm-bg)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--adm-border)', margin: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--adm-text)', fontSize: '0.95rem' }}>{absenceModalAtt.employeeName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-dim)', marginTop: '2px' }}>
                  Date: <strong style={{ color: 'var(--adm-text)' }}>{absenceModalAtt.date}</strong> &bull; Status: <span style={{ color: '#ef4444', fontWeight: 700 }}>{absenceModalAtt.status}</span>
                </div>
              </div>
              <span className="adm-badge adm-badge-danger" style={{ fontSize: '0.72rem' }}>
                {absenceModalAtt.status}
              </span>
            </div>

            <form onSubmit={e => {
              e.preventDefault();
              updateAttendanceRecord(absenceModalAtt.id, {
                absenceReason: absenceReasonInput,
                absenceNotes: absenceNotesInput,
                recordedBy: currentUser?.name || 'Managing Director',
                recordedAt: new Date().toISOString()
              });
              setAbsenceModalAtt(null);
            }}>
              <div className="adm-form-group">
                <label className="adm-form-label">Absence Reason / Classification *</label>
                <select
                  className="adm-select"
                  value={absenceReasonInput}
                  onChange={e => setAbsenceReasonInput(e.target.value)}
                >
                  <option value="No Intimation Provided (Unexcused)">No Intimation Provided (Unexcused)</option>
                  <option value="Medical Emergency (Verbal Intimation)">Medical Emergency (Verbal Intimation)</option>
                  <option value="Personal / Family Emergency">Personal / Family Emergency</option>
                  <option value="Travel / Commute Disruption">Travel / Commute Disruption</option>
                  <option value="Client On-Site Deployment">Client On-Site Deployment</option>
                  <option value="Leave Applied Post-Facto">Leave Applied Post-Facto</option>
                </select>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Official Investigation / Action Notes *</label>
                <textarea
                  className="adm-textarea"
                  rows={4}
                  required
                  placeholder="Record call attempts, WhatsApp response status, or explanation provided by staff member..."
                  value={absenceNotesInput}
                  onChange={e => setAbsenceNotesInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setAbsenceModalAtt(null)}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary">
                  <CheckCircle2 size={15} />
                  <span>Save Absence Audit Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── LAZY-LOADED SCREEN-ADAPTIVE SLIDING EMPLOYEE DRAWER ── */}
      {selectedEmployee && (
        <Suspense
          fallback={
            <div className="adm-drawer-overlay">
              <div
                className="adm-preview-drawer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'clamp(440px, 58vw, 900px)'
                }}
              >
                <div className="adm-spinner" />
              </div>
            </div>
          }
        >
          <EmployeePreviewDrawer
            employee={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
            isDirector={isDirector}
            canManageTeam={canManageTeam}
            onUpdateEmployee={(id, updates) => {
              updateEmployee(id, updates);
              setSelectedEmployee(prev => (prev && prev.id === id ? { ...prev, ...updates } : prev));
            }}
            onApproveLogin={emp => {
              updateEmployee(emp.id, {
                approvalStatus: 'Approved',
                approvedBy: currentUser?.name || 'Rohit Pawar (Managing Director)',
                approvedAt: new Date().toISOString()
              });
              setSelectedEmployee(prev => (prev && prev.id === emp.id ? { ...prev, approvalStatus: 'Approved' } : prev));
              showToast('Login Approved', `Authorized portal login for ${emp.name}.`, 'success');
            }}
            onIssueCertificate={emp => {
              openIssueCertModal(emp);
            }}
            onOpenCredentials={emp => {
              setCredentialEmp(emp);
              setNewPasswordInput('');
              setShowActivePassword(false);
            }}
            onOffboard={emp => {
              setOffboardModalEmp(emp);
              setPurgeDocsOnDelete(false);
            }}
          />
        </Suspense>
      )}

    </div>
  );
};
