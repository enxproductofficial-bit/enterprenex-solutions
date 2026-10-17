import React, { useState, Suspense, lazy } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  X,
  FileCheck,
  Send,
  Printer,
  Download,
  Building2,
  Users,
  Receipt,
  Calendar,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShieldCheck,
  CheckCheck,
  FileText,
  AlertTriangle,
  Layers,
  Briefcase
} from 'lucide-react';
import type { Invoice, ExpenseRecord, Employee } from '../types';
import { COMPANY_LOGO_BASE64, COMPANY_SEAL_BASE64, COMPANY_WATERMARK_BASE64 } from '../data/companyLogo';

const InvoicePreviewDrawer = lazy(() =>
  import('../components/InvoicePreviewDrawer').then(m => ({ default: m.InvoicePreviewDrawer }))
);

export const FinancePage: React.FC = () => {
  const { invoices, expenses, clients, projects, employees, addInvoice, updateInvoice, markInvoicePaid, sendPaymentReminder, addExpense, showToast } = useAdmin();
  const [tab, setTab] = useState<'dashboard' | 'invoices' | 'payables' | 'contracts' | 'expenses' | 'payroll' | 'gst'>('dashboard');
  const [selectedPayMonth, setSelectedPayMonth] = useState('October 2026');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // Client Payment Record Modal State
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [payAmountInput, setPayAmountInput] = useState<number>(0);
  const [payMethodInput, setPayMethodInput] = useState<string>('NEFT / Bank Transfer');
  const [payRefInput, setPayRefInput] = useState<string>('');

  // Payment Reminder Modal State
  const [reminderModalInvoice, setReminderModalInvoice] = useState<Invoice | null>(null);
  const [reminderChannel, setReminderChannel] = useState<'Email' | 'WhatsApp' | 'Both'>('Both');

  // Vendor Bills Management State
  const [vendorBills, setVendorBills] = useState([
    { id: 'vb-1', vendor: 'Amazon Web Services (AWS)', billNo: 'AWS-INV-84920', category: 'Cloud Infrastructure', dueDate: '2026-10-28', amount: 210000, status: 'Approved', poNumber: 'PO-2026-081' },
    { id: 'vb-2', vendor: 'GitHub Enterprise Suite', billNo: 'GH-2026-9281', category: 'Developer Tooling', dueDate: '2026-11-02', amount: 65000, status: 'Approved', poNumber: 'PO-2026-084' },
    { id: 'vb-3', vendor: 'CyberSecurity SOC 2 Auditor', billNo: 'CYBER-4892', category: 'Compliance Audit', dueDate: '2026-11-10', amount: 150000, status: 'Pending Approval', poNumber: 'PO-2026-089' },
    { id: 'vb-4', vendor: 'Google Cloud Platform (GCP)', billNo: 'GCP-77491', category: 'AI Inference Hosting', dueDate: '2026-11-05', amount: 125000, status: 'Approved', poNumber: 'PO-2026-092' },
    { id: 'vb-5', vendor: 'Corporate Legal Advisory', billNo: 'LEX-2026-104', category: 'Legal & Retainer', dueDate: '2026-11-15', amount: 80000, status: 'Pending Approval', poNumber: 'PO-2026-095' }
  ]);

  // Client Contracts & SLA Directory State
  const [contracts, setContracts] = useState([
    {
      id: 'ctr-1',
      clientName: 'Apex Health Innovations',
      projectName: 'HealthCare Diagnostics AI Portal',
      contractNo: 'MSA-2026-01',
      version: 'v2.0',
      totalValue: 4500000,
      startDate: '2026-01-15',
      expiryDate: '2027-03-31',
      renewalDate: '2027-02-15',
      signatureStatus: 'Digitally Signed (DocuSign)',
      slaUptime: '99.95%',
      incidentSla: '1 Hour Critical SLA',
      accountOwner: 'Rohit Pawar',
      satisfactionRating: 4.9,
      renewalAlertActive: true
    },
    {
      id: 'ctr-2',
      clientName: 'Horizon FinTech Capital',
      projectName: 'FinTech Automated KYC & Compliance',
      contractNo: 'MSA-2026-02',
      version: 'v1.2',
      totalValue: 6000000,
      startDate: '2026-02-01',
      expiryDate: '2026-12-31',
      renewalDate: '2026-11-15',
      signatureStatus: 'Digitally Signed (DocuSign)',
      slaUptime: '99.9%',
      incidentSla: '2 Hour High SLA',
      accountOwner: 'Jyoti (PM)',
      satisfactionRating: 5.0,
      renewalAlertActive: true
    },
    {
      id: 'ctr-3',
      clientName: 'Velocity Logistics Pvt Ltd',
      projectName: 'Smart Logistics Supply Chain ERP',
      contractNo: 'MSA-2026-03',
      version: 'v1.0',
      totalValue: 3500000,
      startDate: '2025-11-01',
      expiryDate: '2026-10-31',
      renewalDate: '2026-10-20',
      signatureStatus: 'Under Renewal Negotiation',
      slaUptime: '99.5%',
      incidentSla: '4 Hour Standard SLA',
      accountOwner: 'Rohit Pawar',
      satisfactionRating: 4.7,
      renewalAlertActive: true
    }
  ]);

  // Corporate Liquid Treasury Reserves
  const bankBalances = [
    { bank: 'HDFC Bank Ltd', accountName: 'Primary Operational Account', accountNo: 'A/C 5020008492019', balance: 4285000, type: 'Operating Current', ifsc: 'HDFC0000240' },
    { bank: 'ICICI Bank Ltd', accountName: 'Statutory GST & Tax Reserve', accountNo: 'A/C 104928109284', balance: 1450000, type: 'Tax Reserve', ifsc: 'ICIC0000104' },
    { bank: 'Kotak Mahindra Bank', accountName: 'Client Project Escrow Reserve', accountNo: 'A/C 82019482910', balance: 1800000, type: 'Escrow Liquidity', ifsc: 'KKBK0000921' }
  ];
  const totalLiquidReserves = bankBalances.reduce((sum, b) => sum + b.balance, 0);

  // Upcoming Payment Obligations
  const paymentObligations = [
    { id: 'ob-1', title: 'Workforce Monthly Payroll Disbursement', beneficiary: `${employees.length} Personnel`, dueDate: '25 Oct 2026', amount: 1850000, category: 'Payroll', priority: 'Mandatory' },
    { id: 'ob-2', title: 'AWS Cloud Compute & Database SLA', beneficiary: 'Amazon Web Services', dueDate: '28 Oct 2026', amount: 210000, category: 'Infrastructure', priority: 'High' },
    { id: 'ob-3', title: 'Statutory GST (GSTR-3B) Filing Remittance', beneficiary: 'Government of India (CBIC)', dueDate: '05 Nov 2026', amount: 540000, category: 'Taxation', priority: 'Mandatory' },
    { id: 'ob-4', title: 'CyberSecurity & SOC 2 Compliance Audit Retainer', beneficiary: 'Audit Partner', dueDate: '10 Nov 2026', amount: 150000, category: 'Compliance', priority: 'Normal' }
  ];
  const totalUpcomingObligations = paymentObligations.reduce((sum, o) => sum + o.amount, 0);

  // Contractor & Freelancer Disbursements State
  const [contractorPayments, setContractorPayments] = useState([
    { id: 'cp-1', name: 'Aarav Mehta', role: 'Principal UX/UI Specialist', milestone: 'Design System & Micro-Interactions Delivery', amount: 85000, tds: 8500, netPay: 76500, status: 'Approved', dueDate: '2026-10-29' },
    { id: 'cp-2', name: 'Dr. Vikramaditya Rao', role: 'AI / LLM Fine-Tuning Consultant', milestone: 'Enterprise Retrieval-Augmented Generation Validation', amount: 140000, tds: 14000, netPay: 126000, status: 'Pending Approval', dueDate: '2026-11-04' },
    { id: 'cp-3', name: 'Sneha Patel', role: 'Security Penetration Tester', milestone: 'SOC 2 Pre-Assessment Penetration Audit', amount: 95000, tds: 9500, netPay: 85500, status: 'Approved', dueDate: '2026-11-12' }
  ]);

  // Approved Employee Reimbursements State
  const [reimbursements, setReimbursements] = useState([
    { id: 'rm-1', employee: 'Rahul Sharma', title: 'Client Onsite Solution Architecture (Bangalore Hub)', amount: 14850, receiptAttached: true, status: 'Approved', approvedBy: 'Rohit Pawar', disburseDate: '2026-10-25' },
    { id: 'rm-2', employee: 'Ananya Verma', title: 'AWS Certified Solutions Architect Official Exam Fee', amount: 12500, receiptAttached: true, status: 'Approved', approvedBy: 'Jyoti (PM)', disburseDate: '2026-10-25' },
    { id: 'rm-3', employee: 'Devendra K.', title: 'Client Dinner & Partner Engagement Hospitality', amount: 8400, receiptAttached: true, status: 'Pending Approval', approvedBy: 'Rohit Pawar', disburseDate: '2026-11-01' }
  ]);

  // Purchase Orders (PO) State
  const [purchaseOrders, setPurchaseOrders] = useState([
    { id: 'PO-2026-081', vendor: 'Amazon Web Services (AWS)', item: 'Annual Reserved Cloud Instances & Kubernetes Cluster', amount: 2520000, status: 'Executed', date: '2026-08-15', authorizedBy: 'Rohit Pawar' },
    { id: 'PO-2026-084', vendor: 'GitHub Enterprise Inc.', item: 'Enterprise Suite Tier 2 (50 CI/CD Developer Seats)', amount: 780000, status: 'Active', date: '2026-09-01', authorizedBy: 'Rohit Pawar' },
    { id: 'PO-2026-089', vendor: 'CyberSecurity SOC 2 Auditor', item: 'Type II Attestation & Institutional Pen Test Audit', amount: 450000, status: 'In Review', date: '2026-10-10', authorizedBy: 'Rohit Pawar' }
  ]);

  // New Contract Modal State
  const [showAddContractModal, setShowAddContractModal] = useState(false);
  const [newCtrClient, setNewCtrClient] = useState('');
  const [newCtrProject, setNewCtrProject] = useState('');
  const [newCtrValue, setNewCtrValue] = useState(2500000);
  const [newCtrSla, setNewCtrSla] = useState('99.9% Uptime');

  // Form states
  const [fClientId, setFClientId] = useState(clients[0]?.id || '');
  const [fProjectId, setFProjectId] = useState(projects[0]?.id || '');
  const [fAmount, setFAmount] = useState(500000);
  const [fDesc, setFDesc] = useState('Enterprise Milestone Delivery & Software Services');
  const [fDueDate, setFDueDate] = useState('2026-03-15');
  const [fType, setFType] = useState<Invoice['type']>('Tax Invoice');

  // Expense form state
  const [eCategory, setECategory] = useState<ExpenseRecord['category']>('Infrastructure & Cloud');
  const [eDesc, setEDesc] = useState('');
  const [eAmount, setEAmount] = useState(45000);
  const [eVendor, setEVendor] = useState('AWS Cloud');
  const [ePaidBy, setEPaidBy] = useState('Corporate Credit Card');

  const totalPaidRevenue = invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const totalOutstanding = invoices
    .filter(i => i.status === 'Pending' || i.status === 'Overdue')
    .reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalAccountsPayable = vendorBills.filter(v => v.status !== 'Disbursed').reduce((sum, v) => sum + v.amount, 0);

  const filteredInvoices = invoices.filter(i => {
    const matchSearch = i.clientName.toLowerCase().includes(search.toLowerCase()) ||
      i.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const selectedClient = clients.find(c => c.id === selectedInvoice?.clientId || c.companyName === selectedInvoice?.clientName);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const selClient = clients.find(c => c.id === fClientId);
    const subtotal = Number(fAmount);
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;

    addInvoice({
      invoiceNumber: (fType === 'Tax Invoice' ? 'INV-2026-' : 'QUOT-2026-') + Math.floor(100 + Math.random() * 900),
      clientName: selClient ? selClient.companyName : 'Enterprise Client',
      clientId: fClientId,
      projectId: fProjectId,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: fDueDate,
      items: [
        { description: fDesc, quantity: 1, rate: subtotal, taxPercent: 18, amount: subtotal }
      ],
      subtotal,
      taxAmount: tax,
      totalAmount: total,
      status: fType === 'Quotation' ? 'Draft' : 'Pending',
      type: fType
    });
    setShowAddInvoiceModal(false);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      category: eCategory,
      description: eDesc || 'Operational expense',
      amount: Number(eAmount),
      date: new Date().toISOString().split('T')[0],
      vendor: eVendor,
      paidBy: ePaidBy
    });
    setShowAddExpenseModal(false);
    setEDesc('');
  };

  // Helper: Number to Indian Rupee Words
  const numberToWords = (num: number): string => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const numStr = num.toString();
    if (numStr.length > 9) return 'Rupees Large Amount Only';
    const n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Crore ' : '';
    str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Lakh ' : '';
    str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Thousand ' : '';
    str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'Hundred ' : '';
    str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) : '';
    return str.trim() ? `Rupees ${str.trim()} Only` : 'Rupees Zero Only';
  };

  // Statutory Indian Payroll Formula: Basic (50%), HRA (30%), Allowance (20%), PF (12% of Basic), PT (₹200), TDS
  const calculateSalaryBreakdown = (monthlyGross: number) => {
    const gross = Number(monthlyGross) || 50000;
    const basic = Math.round(gross * 0.50);
    const hra = Math.round(gross * 0.30);
    const specialAllowance = gross - basic - hra;
    const pf = Math.round(basic * 0.12);
    const pt = 200;
    const tds = gross > 75000 ? Math.round(gross * 0.05) : 0;
    const totalDeductions = pf + pt + tds;
    const netPay = gross - totalDeductions;
    return { gross, basic, hra, specialAllowance, pf, pt, tds, totalDeductions, netPay };
  };

  const totalMonthlyPayrollGross = employees.reduce((acc, emp) => acc + (emp.salaryMonthly || 50000), 0);
  const totalMonthlyPayrollDeductions = employees.reduce((acc, emp) => acc + calculateSalaryBreakdown(emp.salaryMonthly || 50000).totalDeductions, 0);
  const totalMonthlyPayrollNet = totalMonthlyPayrollGross - totalMonthlyPayrollDeductions;

  const printOfficialPayslip = (emp: Employee, payMonth: string) => {
    const win = window.open('', '_blank');
    if (!win) {
      showToast('Popup Blocked', 'Please allow popups to open the official salary slip printable window.', 'warning');
      return;
    }

    const { gross, basic, hra, specialAllowance, pf, pt, tds, totalDeductions, netPay } = calculateSalaryBreakdown(emp.salaryMonthly || 50000);
    const words = numberToWords(netPay);
    const empId = emp.employeeId || 'EPX-EMP-001';
    const pan = emp.panNumber || 'PRRPS8209K';
    const uan = '1019' + empId.replace(/\D/g, '').padEnd(8, '0');
    const bankAc = '•••• •••• ' + (empId.slice(-4) || '8492');

    const payslipHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payslip - ${emp.name} - ${payMonth}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Dancing+Script:wght@700&display=swap');
            @page { size: A4 portrait; margin: 15mm; }
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              color: #1e293b;
              background: #f8fafc;
              margin: 0;
              padding: 20px;
              box-sizing: border-box;
            }
            .slip-card {
              position: relative;
              max-width: 800px;
              margin: 0 auto;
              background: #ffffff;
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              padding: 32px 36px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.06);
              overflow: hidden;
            }
            .watermark {
              position: absolute;
              top: 52%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 500px;
              opacity: 0.08;
              pointer-events: none;
              z-index: 0;
            }
            .content {
              position: relative;
              z-index: 1;
            }
            .header-table {
              width: 100%;
              border-bottom: 2px solid #ea580c;
              padding-bottom: 14px;
              margin-bottom: 18px;
            }
            .company-name {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: 0.5px;
              margin: 0;
            }
            .company-sub {
              font-size: 11px;
              color: #64748b;
              margin-top: 3px;
              line-height: 1.4;
            }
            .slip-badge {
              display: inline-block;
              background: #fff7ed;
              color: #c2410c;
              border: 1px solid #fdba74;
              font-weight: 800;
              font-size: 12px;
              padding: 4px 12px;
              border-radius: 6px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px 24px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 14px 16px;
              font-size: 11.5px;
              margin-bottom: 20px;
            }
            .meta-item {
              display: flex;
              justify-content: space-between;
              border-bottom: 1px dashed #e2e8f0;
              padding-bottom: 4px;
            }
            .meta-item:last-child {
              border-bottom: none;
            }
            .meta-label {
              color: #64748b;
              font-weight: 600;
            }
            .meta-value {
              font-weight: 700;
              color: #0f172a;
            }
            .pay-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
              margin-bottom: 16px;
            }
            .pay-table th {
              background: #0f172a;
              color: #ffffff;
              font-weight: 700;
              padding: 8px 12px;
              text-align: left;
            }
            .pay-table th.amount {
              text-align: right;
            }
            .pay-table td {
              padding: 8px 12px;
              border-bottom: 1px solid #e2e8f0;
            }
            .pay-table td.amount {
              text-align: right;
              font-weight: 600;
              color: #1e293b;
            }
            .pay-table tr.total-row td {
              background: #f1f5f9;
              font-weight: 800;
              border-top: 2px solid #cbd5e1;
              color: #0f172a;
            }
            .net-box {
              background: #f0fdf4;
              border: 1.5px solid #86efac;
              border-radius: 8px;
              padding: 14px 18px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 24px;
            }
            .net-title {
              font-size: 13px;
              font-weight: 700;
              color: #166534;
            }
            .net-words {
              font-size: 11px;
              color: #15803d;
              font-style: italic;
              margin-top: 3px;
            }
            .net-value {
              font-size: 22px;
              font-weight: 800;
              color: #15803d;
            }
            .signatures-grid {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 30px;
              padding-top: 15px;
            }
            .sig-box {
              text-align: center;
              width: 200px;
            }
            .sig-script {
              font-family: 'Dancing Script', cursive;
              font-size: 26px;
              color: #1e3a8a;
              margin-bottom: 2px;
              transform: rotate(-3deg);
            }
            .sig-line {
              border-top: 1px solid #94a3b8;
              font-size: 10.5px;
              font-weight: 700;
              color: #0f172a;
              padding-top: 4px;
            }
            .seal-img {
              width: 78px;
              height: 78px;
              object-fit: contain;
              filter: drop-shadow(0 2px 6px rgba(0,0,0,0.15));
            }
            .statutory-note {
              font-size: 9.5px;
              color: #94a3b8;
              text-align: center;
              margin-top: 24px;
              line-height: 1.4;
              border-top: 1px solid #e2e8f0;
              padding-top: 8px;
            }
            @media print {
              body { background: #ffffff; padding: 0; }
              .slip-card { border: none; box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="slip-card">
            <img class="watermark" src="${COMPANY_WATERMARK_BASE64}" alt="Enterprenex Watermark" />

            <div class="content">
              <!-- Header -->
              <table class="header-table">
                <tr>
                  <td style="vertical-align: top;">
                    <img src="${COMPANY_LOGO_BASE64}" alt="Enterprenex Solutions" style="height: 48px; object-fit: contain; margin-bottom: 6px;" />
                    <h1 class="company-name">ENTERPRENEX SOLUTIONS PRIVATE LIMITED</h1>
                    <div class="company-sub">
                      Corporate Identity: U72900MH2026PTC000000 &bull; ISO 9001:2015 Certified Entity<br/>
                      Registered Office: Enterprise Technology Corridor, Pune, Maharashtra 411014, India
                    </div>
                  </td>
                  <td style="text-align: right; vertical-align: top;">
                    <div class="slip-badge">MONTHLY SALARY SLIP</div>
                    <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 8px;">
                      ${payMonth.toUpperCase()}
                    </div>
                    <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
                      Generated on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Employee Details Grid -->
              <div class="meta-grid">
                <div>
                  <div class="meta-item"><span class="meta-label">Employee ID:</span> <span class="meta-value">${empId}</span></div>
                  <div class="meta-item"><span class="meta-label">Employee Name:</span> <span class="meta-value">${emp.name}</span></div>
                  <div class="meta-item"><span class="meta-label">Designation:</span> <span class="meta-value">${emp.role}</span></div>
                  <div class="meta-item"><span class="meta-label">Department:</span> <span class="meta-value">${emp.department || 'Engineering'}</span></div>
                  <div class="meta-item"><span class="meta-label">Work Mode:</span> <span class="meta-value">${emp.workMode || 'Hybrid'}</span></div>
                </div>
                <div>
                  <div class="meta-item"><span class="meta-label">Bank Account:</span> <span class="meta-value">HDFC Bank (${bankAc})</span></div>
                  <div class="meta-item"><span class="meta-label">Income Tax PAN:</span> <span class="meta-value">${pan}</span></div>
                  <div class="meta-item"><span class="meta-label">PF / UAN Number:</span> <span class="meta-value">${uan}</span></div>
                  <div class="meta-item"><span class="meta-label">Payable Days:</span> <span class="meta-value">30 / 30 Days</span></div>
                  <div class="meta-item"><span class="meta-label">Loss of Pay (LOP):</span> <span class="meta-value">0 Days</span></div>
                </div>
              </div>

              <!-- Earnings & Deductions Table -->
              <table class="pay-table">
                <thead>
                  <tr>
                    <th style="width: 32%;">Earnings Component</th>
                    <th class="amount" style="width: 18%;">Amount (₹)</th>
                    <th style="width: 32%;">Statutory Deductions</th>
                    <th class="amount" style="width: 18%;">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Basic Pay (50%)</td>
                    <td class="amount">₹${basic.toLocaleString('en-IN')}</td>
                    <td>Provident Fund (PF 12%)</td>
                    <td class="amount">₹${pf.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td>House Rent Allowance (HRA 30%)</td>
                    <td class="amount">₹${hra.toLocaleString('en-IN')}</td>
                    <td>Professional Tax (PT)</td>
                    <td class="amount">₹${pt.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td>Special / City Allowance (20%)</td>
                    <td class="amount">₹${specialAllowance.toLocaleString('en-IN')}</td>
                    <td>Tax Deducted at Source (TDS)</td>
                    <td class="amount">₹${tds.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr class="total-row">
                    <td>Gross Monthly Earnings (A)</td>
                    <td class="amount">₹${gross.toLocaleString('en-IN')}</td>
                    <td>Total Deductions (B)</td>
                    <td class="amount">₹${totalDeductions.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Net Take Home Box -->
              <div class="net-box">
                <div>
                  <div class="net-title">NET TAKE-HOME DISBURSEMENT (A - B)</div>
                  <div class="net-words">${words}</div>
                </div>
                <div class="net-value">₹${netPay.toLocaleString('en-IN')}</div>
              </div>

              <!-- Signatures & Seal -->
              <div class="signatures-grid">
                <div class="sig-box">
                  <div style="font-size: 10px; color: #64748b; font-weight: 600; margin-bottom: 28px;">EMPLOYEE SIGNATURE</div>
                  <div class="sig-line">${emp.name} (Recipient)</div>
                </div>

                <div>
                  <img class="seal-img" src="${COMPANY_SEAL_BASE64}" alt="Official Enterprenex Seal" />
                </div>

                <div class="sig-box">
                  <div class="sig-script">Rohit Pawar</div>
                  <div class="sig-line">MANAGING DIRECTOR</div>
                  <div style="font-size: 9px; color: #64748b;">Enterprenex Solutions Pvt. Ltd.</div>
                </div>
              </div>

              <!-- Footer Note -->
              <div class="statutory-note">
                This is a confidential computer-generated payslip authorized under Enterprenex Enterprise Work Management System (EWMS) governance.<br/>
                For payroll discrepancies, please contact hr@enterprenex.solutions within 5 days of salary credit.
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    win.document.write(payslipHtml);
    win.document.close();
  };

  const printPaymentReceipt = (inv: Invoice, amount: number, ref: string, method: string) => {
    const win = window.open('', '_blank');
    if (!win) {
      showToast('Popup Blocked', 'Please allow popups to open the official payment receipt printable window.', 'warning');
      return;
    }

    const words = numberToWords(amount);
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${inv.invoiceNumber}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Playfair+Display:ital,wght@1,600&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; margin: 0; padding: 28px; color: #0f172a; }
            .receipt-card { max-width: 680px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 20px; }
            .brand h2 { margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 0.5px; }
            .brand p { margin: 3px 0 0; font-size: 10.5px; color: #64748b; }
            .badge { background: #dcfce7; color: #166534; font-weight: 700; font-size: 11px; padding: 5px 12px; border-radius: 6px; display: inline-block; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
            .item { font-size: 12.5px; }
            .item span { display: block; font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; }
            .amount-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; text-align: center; margin: 20px 0; }
            .amount-val { font-size: 26px; font-weight: 800; color: #059669; }
            .sig-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 36px; padding-top: 18px; border-top: 1px dashed #cbd5e1; }
            .seal { width: 85px; height: auto; }
            .sig-text { font-family: 'Dancing Script', cursive; font-size: 22px; color: #1e3a8a; }
            @media print { body { background: #fff; padding: 0; } .receipt-card { box-shadow: none; border: none; } }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header">
              <div class="brand">
                <img src="${COMPANY_LOGO_BASE64}" style="height: 38px; margin-bottom: 6px;" alt="Logo"/>
                <h2>ENTERPRENEX SOLUTIONS PRIVATE LIMITED</h2>
                <p>CIN: U72900MH2024PTC419201 | GSTIN: 27AAACB2212P1ZX</p>
                <p>Corporate Office: Mumbai, Maharashtra, India</p>
              </div>
              <div style="text-align: right;">
                <div class="badge">OFFICIAL PAYMENT RECEIPT</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 8px;">Receipt No: RCT-${Date.now().toString().slice(-6)}</div>
                <div style="font-size: 11px; color: #64748b;">Date: ${new Date().toLocaleDateString('en-IN')}</div>
              </div>
            </div>

            <div class="grid">
              <div class="item"><span>Received From:</span><strong>${inv.clientName}</strong></div>
              <div class="item"><span>Against Invoice:</span><strong>${inv.invoiceNumber}</strong></div>
              <div class="item"><span>Payment Mode:</span><strong>${method}</strong></div>
              <div class="item"><span>Transaction / UTR Ref:</span><strong>${ref || 'BANK-TXN-' + Math.floor(Math.random()*899999+100000)}</strong></div>
            </div>

            <div class="amount-box">
              <span style="font-size: 10.5px; color: #475569; font-weight: 700; text-transform: uppercase;">Total Settlement Remitted</span>
              <div class="amount-val">₹${amount.toLocaleString('en-IN')}</div>
              <div style="font-size: 11.5px; color: #334155; margin-top: 4px;">(${words})</div>
            </div>

            <div class="sig-row">
              <div style="font-size: 10.5px; color: #64748b; line-height: 1.5;">
                Thank you for partnering with Enterprenex.<br/>
                Computer-generated receipt authorized under EWMS Treasury.
              </div>
              <img src="${COMPANY_SEAL_BASE64}" class="seal" alt="Seal" />
              <div style="text-align: right;">
                <div class="sig-text">Rohit Pawar</div>
                <div style="font-size: 11px; font-weight: 700;">Authorized Signatory</div>
                <div style="font-size: 10px; color: #64748b;">Enterprenex Solutions Pvt. Ltd.</div>
              </div>
            </div>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `;
    win.document.write(receiptHtml);
    win.document.close();
  };

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <h1>Fiscal Operations, Statutory Tax Invoicing & Treasury</h1>
          <p>Statutory GST tax invoices under Rule 46 CGST Act, commercial quotations, expenditure general ledger, compliant payroll (EPF/PT), and fiscal treasury analytics</p>
        </div>
        <div className="adm-page-actions">
          <button className="adm-btn adm-btn-secondary" onClick={() => setShowAddExpenseModal(true)}>
            <Plus size={15} />
            <span>Record Expenditure</span>
          </button>
          <button className="adm-btn adm-btn-primary" onClick={() => setShowAddInvoiceModal(true)}>
            <Plus size={16} />
            <span>Issue Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="adm-grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="adm-kpi-card">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Realized Fiscal Inflow (Settled)</span>
            <div className="adm-kpi-icon" style={{ background: 'var(--adm-success-soft)', color: 'var(--adm-success)' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="adm-kpi-value" style={{ fontVariantNumeric: 'tabular-nums' }}>₹{(totalPaidRevenue / 100000).toFixed(2)}L</div>
          <div className="adm-kpi-footer">
            <span className="adm-trend-up">100% Realized Liquidity</span>
          </div>
        </div>

        <div className="adm-kpi-card">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Accounts Receivable (Outstanding)</span>
            <div className="adm-kpi-icon" style={{ background: 'var(--adm-warning-soft)', color: 'var(--adm-warning)' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="adm-kpi-value" style={{ fontVariantNumeric: 'tabular-nums' }}>₹{(totalOutstanding / 100000).toFixed(2)}L</div>
          <div className="adm-kpi-footer">
            <span style={{ color: 'var(--adm-warning)' }}>{invoices.filter(i => i.status === 'Pending').length} Remittance Claims Outstanding</span>
          </div>
        </div>

        <div className="adm-kpi-card">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Corporate Operating Expenditure</span>
            <div className="adm-kpi-icon" style={{ background: 'var(--adm-danger-soft)', color: 'var(--adm-danger)' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div className="adm-kpi-value" style={{ fontVariantNumeric: 'tabular-nums' }}>₹{(totalExpenses / 100000).toFixed(2)}L</div>
          <div className="adm-kpi-footer">
            <span style={{ color: 'var(--adm-text-dim)' }}>Across {expenses.length} Audited General Ledger Records</span>
          </div>
        </div>

        <div className="adm-kpi-card">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Net Operating Margin Realization</span>
            <div className="adm-kpi-icon" style={{ background: 'var(--adm-primary-soft)', color: 'var(--adm-primary)' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="adm-kpi-value" style={{ color: 'var(--adm-success)', fontVariantNumeric: 'tabular-nums' }}>
            {totalPaidRevenue > 0 ? Math.round(((totalPaidRevenue - totalExpenses) / totalPaidRevenue) * 100) : 0}%
          </div>
          <div className="adm-kpi-footer">
            <span className="adm-trend-up">Positive Institutional Cashflow</span>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--adm-border)', marginBottom: '1.5rem', gap: '0.75rem', flexWrap: 'wrap', overflowX: 'auto' }}>
        <button
          onClick={() => setTab('dashboard')}
          style={{
            padding: '0.6rem 0.9rem',
            background: 'transparent',
            border: 'none',
            borderBottom: tab === 'dashboard' ? '2px solid var(--adm-primary)' : '2px solid transparent',
            color: tab === 'dashboard' ? 'var(--adm-primary)' : 'var(--adm-text-muted)',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer'
          }}
        >
          1. Finance Dashboard & P&L
        </button>
        <button
          onClick={() => setTab('invoices')}
          style={{
            padding: '0.6rem 0.9rem',
            background: 'transparent',
            border: 'none',
            borderBottom: tab === 'invoices' ? '2px solid var(--adm-primary)' : '2px solid transparent',
            color: tab === 'invoices' ? 'var(--adm-primary)' : 'var(--adm-text-muted)',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer'
          }}
        >
          2. Client Invoices & Receivables ({invoices.length})
        </button>
        <button
          onClick={() => setTab('payables')}
          style={{
            padding: '0.6rem 0.9rem',
            background: 'transparent',
            border: 'none',
            borderBottom: tab === 'payables' ? '2px solid var(--adm-primary)' : '2px solid transparent',
            color: tab === 'payables' ? 'var(--adm-primary)' : 'var(--adm-text-muted)',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer'
          }}
        >
          3. Vendor Bills & Payments ({vendorBills.length})
        </button>
        <button
          onClick={() => setTab('contracts')}
          style={{
            padding: '0.6rem 0.9rem',
            background: 'transparent',
            border: 'none',
            borderBottom: tab === 'contracts' ? '2px solid var(--adm-primary)' : '2px solid transparent',
            color: tab === 'contracts' ? 'var(--adm-primary)' : 'var(--adm-text-muted)',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer'
          }}
        >
          4. Contracts & SLA Management ({contracts.length})
        </button>
        <button
          onClick={() => setTab('expenses')}
          style={{
            padding: '0.6rem 0.9rem',
            background: 'transparent',
            border: 'none',
            borderBottom: tab === 'expenses' ? '2px solid var(--adm-primary)' : '2px solid transparent',
            color: tab === 'expenses' ? 'var(--adm-primary)' : 'var(--adm-text-muted)',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer'
          }}
        >
          5. Operating Expenses ({expenses.length})
        </button>
        <button
          onClick={() => setTab('payroll')}
          style={{
            padding: '0.6rem 0.9rem',
            background: 'transparent',
            border: 'none',
            borderBottom: tab === 'payroll' ? '2px solid var(--adm-primary)' : '2px solid transparent',
            color: tab === 'payroll' ? 'var(--adm-primary)' : 'var(--adm-text-muted)',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer'
          }}
        >
          6. Statutory Payroll ({employees.length})
        </button>
        <button
          onClick={() => setTab('gst')}
          style={{
            padding: '0.6rem 0.9rem',
            background: 'transparent',
            border: 'none',
            borderBottom: tab === 'gst' ? '2px solid var(--adm-primary)' : '2px solid transparent',
            color: tab === 'gst' ? 'var(--adm-primary)' : 'var(--adm-text-muted)',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer'
          }}
        >
          7. GST Tax Returns
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="adm-card" style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: '340px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-dim)' }} />
          <input
            type="text"
            className="adm-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search by client entity or invoice serial..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {tab === 'invoices' && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--adm-text-dim)' }}>Settlement Status:</span>
            <select
              className="adm-select"
              style={{ width: 'auto', padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Settled / Paid</option>
              <option value="Pending">Pending Remittance</option>
              <option value="Draft">Draft Instrument</option>
            </select>
          </div>
        )}
      </div>

      {/* ── 0. EXECUTIVE FINANCE DASHBOARD & P&L ── */}
      {tab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Liquid Treasury Reserves & Bank Balances */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--adm-text)' }}>
                Corporate Liquid Treasury Reserves & Connected Bank Balances
              </div>
              <span className="adm-badge adm-badge-success" style={{ fontSize: '0.75rem' }}>
                Total Treasury Reserves: ₹{(totalLiquidReserves / 100000).toFixed(2)}L
              </span>
            </div>
            <div className="adm-grid-3">
              {bankBalances.map((b, idx) => (
                <div key={idx} className="adm-card" style={{ padding: '1rem 1.25rem', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--adm-text)' }}>{b.bank}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--adm-text-muted)' }}>{b.accountName}</div>
                    </div>
                    <span className="adm-badge adm-badge-neutral" style={{ fontSize: '0.68rem' }}>{b.type}</span>
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--adm-success)', margin: '0.5rem 0' }}>
                    ₹{(b.balance / 100000).toFixed(2)}L
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--adm-text-dim)', borderTop: '1px solid var(--adm-border)', paddingTop: '0.4rem' }}>
                    <span>{b.accountNo}</span>
                    <span>IFSC: {b.ifsc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accounts Receivable & Payable Comparison */}
          <div className="adm-grid-2">
            <div className="adm-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowDownRight size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--adm-text)' }}>Accounts Receivable (Inflows)</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-muted)' }}>Outstanding client milestone invoices</div>
                  </div>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>
                  ₹{(totalOutstanding / 100000).toFixed(2)}L
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {invoices.filter(i => i.status === 'Pending' || i.status === 'Overdue').slice(0, 3).map(i => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--adm-bg)', borderRadius: '6px', fontSize: '0.82rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--adm-text)' }}>{i.clientName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-muted)' }}>Due: {i.dueDate} &bull; {i.invoiceNumber}</div>
                    </div>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>₹{i.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="adm-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowUpRight size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--adm-text)' }}>Accounts Payable (Outflows)</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-muted)' }}>Vendor infrastructure bills & retainers</div>
                  </div>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ef4444' }}>
                  ₹{(totalAccountsPayable / 100000).toFixed(2)}L
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {vendorBills.filter(v => v.status !== 'Disbursed').slice(0, 3).map(v => (
                  <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--adm-bg)', borderRadius: '6px', fontSize: '0.82rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--adm-text)' }}>{v.vendor}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-muted)' }}>Due: {v.dueDate} &bull; {v.category}</div>
                    </div>
                    <span style={{ fontWeight: 700, color: '#ef4444' }}>₹{v.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project-Wise Revenue & Margin Matrix */}
          <div className="adm-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--adm-text)', marginBottom: '1rem' }}>
              Project-Wise Revenue, Direct Delivery Costs & Profitability Margins
            </div>
            <div className="adm-table-container">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Enterprise Project & Client</th>
                    <th>Committed Contract Value</th>
                    <th>Invoiced Realization</th>
                    <th>Direct Cloud & Labor Cost</th>
                    <th>Net Profit Contribution</th>
                    <th>EBITDA Health</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--adm-text)' }}>HealthCare Diagnostics AI Portal</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-muted)' }}>Client: Apex Health Innovations</div>
                    </td>
                    <td>₹45,00,000</td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>₹45,00,000</td>
                    <td style={{ color: '#ef4444' }}>₹18,20,000</td>
                    <td style={{ fontWeight: 800, color: 'var(--adm-primary)' }}>₹26,80,000 (59.5%)</td>
                    <td><span className="adm-badge adm-badge-success">High Margin</span></td>
                  </tr>
                  <tr>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--adm-text)' }}>FinTech Automated KYC Engine</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-muted)' }}>Client: Horizon FinTech Capital</div>
                    </td>
                    <td>₹60,00,000</td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>₹60,00,000</td>
                    <td style={{ color: '#ef4444' }}>₹24,00,000</td>
                    <td style={{ fontWeight: 800, color: 'var(--adm-primary)' }}>₹36,00,000 (60.0%)</td>
                    <td><span className="adm-badge adm-badge-success">High Margin</span></td>
                  </tr>
                  <tr>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--adm-text)' }}>Smart Logistics Supply Chain ERP</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-muted)' }}>Client: Velocity Logistics Pvt Ltd</div>
                    </td>
                    <td>₹35,00,000</td>
                    <td style={{ fontWeight: 700, color: '#f59e0b' }}>₹20,00,000</td>
                    <td style={{ color: '#ef4444' }}>₹16,00,000</td>
                    <td style={{ fontWeight: 800, color: 'var(--adm-primary)' }}>₹19,00,000 (54.3%)</td>
                    <td><span className="adm-badge adm-badge-primary">Optimal Margin</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Payment Obligations Calendar */}
          <div className="adm-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--adm-text)' }}>Upcoming Payment Obligations Calendar</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>Scheduled liabilities, statutory tax dates, and payroll releases</div>
              </div>
              <span className="adm-badge adm-badge-warning">Obligations: ₹{(totalUpcomingObligations / 100000).toFixed(2)}L</span>
            </div>
            <div className="adm-table-container">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Obligation / Description</th>
                    <th>Beneficiary / Entity</th>
                    <th>Due Date</th>
                    <th>Amount (₹)</th>
                    <th>Priority Level</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentObligations.map(ob => (
                    <tr key={ob.id}>
                      <td style={{ fontWeight: 700, color: 'var(--adm-text)' }}>{ob.title}</td>
                      <td>{ob.beneficiary}</td>
                      <td><span style={{ fontWeight: 600 }}>{ob.dueDate}</span></td>
                      <td style={{ fontWeight: 800, color: '#ef4444' }}>₹{ob.amount.toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`adm-badge ${ob.priority === 'Mandatory' ? 'adm-badge-danger' : 'adm-badge-warning'}`}>
                          {ob.priority}
                        </span>
                      </td>
                      <td>
                        <button className="adm-btn adm-btn-sm adm-btn-secondary" onClick={() => showToast('Disbursement Scheduled', `Payment for ${ob.title} queued in treasury.`, 'info')}>
                          Schedule Disburse
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 1. INVOICES TABLE ── */}
      {tab === 'invoices' && (
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Tax Invoice / Proforma Instrument</th>
                <th>Contracted Client Entity</th>
                <th>Statutory Execution Date</th>
                <th>Contractual Due Date</th>
                <th>Taxable Base Value</th>
                <th>Statutory GST (18%)</th>
                <th>Total Remittance Payable</th>
                <th>Settlement Standing</th>
                <th className="adm-table-sticky-right" style={{ minWidth: '160px' }}>Fiscal Administration</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(inv => {
                const isSelected = selectedInvoice?.id === inv.id;
                return (
                  <tr
                    key={inv.id}
                    className={isSelected ? 'adm-table-row-clickable adm-table-row-active' : 'adm-table-row-clickable'}
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--adm-text, #1a1a1a)' }}>{inv.invoiceNumber}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--adm-primary)' }}>{inv.type}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--adm-text, #1a1a1a)' }}>{inv.clientName}</div>
                    </td>
                    <td>{inv.issueDate}</td>
                    <td>{inv.dueDate}</td>
                    <td>₹{inv.subtotal.toLocaleString('en-IN')}</td>
                    <td>₹{inv.taxAmount.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 800, color: 'var(--adm-text, #1a1a1a)' }}>
                      ₹{inv.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`adm-badge ${
                        inv.status === 'Paid' ? 'adm-badge-success' :
                        inv.status === 'Pending' ? 'adm-badge-warning' :
                        inv.status === 'Overdue' ? 'adm-badge-danger' : 'adm-badge-neutral'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="adm-table-sticky-right" style={{ minWidth: '180px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button className="adm-btn adm-btn-sm adm-btn-secondary" onClick={() => setSelectedInvoice(inv)}>
                          Preview PDF
                        </button>
                        {inv.status !== 'Paid' && (
                          <>
                            <button
                              className="adm-btn adm-btn-sm adm-btn-primary"
                              onClick={() => {
                                setPaymentModalInvoice(inv);
                                setPayAmountInput(inv.totalAmount - (inv.paidAmount || 0));
                                setPayRefInput('');
                              }}
                              title="Record full or partial client payment"
                            >
                              Record Payment
                            </button>
                            <button
                              className="adm-btn adm-btn-sm adm-btn-secondary"
                              onClick={() => setReminderModalInvoice(inv)}
                              title="Send Automated Reminder"
                            >
                              <Send size={12} />
                            </button>
                          </>
                        )}
                        {inv.status === 'Paid' && (
                          <button
                            className="adm-btn adm-btn-sm adm-btn-secondary"
                            onClick={() => printPaymentReceipt(inv, inv.totalAmount, inv.paymentReference || 'BANK-TXN-748921', inv.paymentMethod || 'NEFT / RTGS')}
                            title="Print Official Payment Receipt"
                          >
                            <Receipt size={12} />
                            <span>Receipt</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 3. VENDOR BILLS, PURCHASE ORDERS & PAYABLES ── */}
      {tab === 'payables' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Payables KPI Summary */}
          <div className="adm-kpi-grid">
            <div className="adm-kpi-card">
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">Total Accounts Payable</span>
                <div className="adm-kpi-icon" style={{ background: 'var(--adm-danger-soft)', color: 'var(--adm-danger)' }}>
                  <CreditCard size={18} />
                </div>
              </div>
              <div className="adm-kpi-value">₹{(vendorBills.reduce((s, b) => s + b.amount, 0) / 100000).toFixed(2)}L</div>
              <div className="adm-kpi-footer">
                <span style={{ color: 'var(--adm-text-dim)' }}>Across {vendorBills.length} Active Vendor Obligations</span>
              </div>
            </div>

            <div className="adm-kpi-card">
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">Pending Executive Approvals</span>
                <div className="adm-kpi-icon" style={{ background: 'var(--adm-warning-soft)', color: 'var(--adm-warning)' }}>
                  <AlertTriangle size={18} />
                </div>
              </div>
              <div className="adm-kpi-value" style={{ color: 'var(--adm-warning)' }}>
                {vendorBills.filter(b => b.status === 'Pending Approval').length} Bills
              </div>
              <div className="adm-kpi-footer">
                <span style={{ color: 'var(--adm-warning)', fontWeight: 600 }}>Requires Director Sign-off</span>
              </div>
            </div>

            <div className="adm-kpi-card">
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">Active Purchase Orders</span>
                <div className="adm-kpi-icon" style={{ background: 'var(--adm-primary-soft)', color: 'var(--adm-primary)' }}>
                  <FileText size={18} />
                </div>
              </div>
              <div className="adm-kpi-value">₹{(purchaseOrders.reduce((s, p) => s + p.amount, 0) / 100000).toFixed(2)}L</div>
              <div className="adm-kpi-footer">
                <span style={{ color: 'var(--adm-text-dim)' }}>{purchaseOrders.length} Executed PO Agreements</span>
              </div>
            </div>

            <div className="adm-kpi-card">
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">Contractor Net Disbursements</span>
                <div className="adm-kpi-icon" style={{ background: 'var(--adm-success-soft)', color: 'var(--adm-success)' }}>
                  <Users size={18} />
                </div>
              </div>
              <div className="adm-kpi-value">₹{(contractorPayments.reduce((s, c) => s + c.netPay, 0) / 100000).toFixed(2)}L</div>
              <div className="adm-kpi-footer">
                <span style={{ color: 'var(--adm-success)', fontWeight: 600 }}>TDS Deducted (Sec 194J 10%)</span>
              </div>
            </div>
          </div>

          {/* Sub-section 1: Vendor Invoices & Operating Bills */}
          <div className="adm-card" style={{ padding: '1.25rem', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                  Corporate Vendor Bills & Cloud Infrastructure Invoices
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--adm-text-dim)', margin: '2px 0 0 0' }}>
                  Audited accounts payable records &bull; Director dual-authorization required for disburse
                </p>
              </div>
              <button
                className="adm-btn adm-btn-secondary adm-btn-sm"
                onClick={() => showToast('Vendor Ingestion', 'Upload vendor invoice PDF to OCR parser.', 'info')}
              >
                <Plus size={14} />
                <span>Add Vendor Bill</span>
              </button>
            </div>

            <div className="adm-table-container">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Vendor / Infrastructure Entity</th>
                    <th>Bill Number</th>
                    <th>PO Reference</th>
                    <th>Category</th>
                    <th>Due Date</th>
                    <th>Bill Amount (₹)</th>
                    <th>Approval Status</th>
                    <th style={{ textAlign: 'right' }}>Executive Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorBills.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 700, color: 'var(--adm-text)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Building2 size={16} color="var(--adm-primary)" />
                          <span>{b.vendor}</span>
                        </div>
                      </td>
                      <td><code>{b.billNo}</code></td>
                      <td><span className="adm-badge adm-badge-neutral">{b.poNumber}</span></td>
                      <td>{b.category}</td>
                      <td><span style={{ fontWeight: 600 }}>{b.dueDate}</span></td>
                      <td style={{ fontWeight: 800, color: 'var(--adm-danger)' }}>
                        ₹{b.amount.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`adm-badge ${b.status === 'Approved' ? 'adm-badge-success' : 'adm-badge-warning'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          {b.status === 'Pending Approval' ? (
                            <button
                              className="adm-btn adm-btn-sm adm-btn-primary"
                              onClick={() => {
                                setVendorBills(prev => prev.map(item => item.id === b.id ? { ...item, status: 'Approved' } : item));
                                showToast('Bill Authorized', `Payment for ${b.vendor} authorized by Managing Director.`, 'success');
                              }}
                            >
                              Authorize Payment
                            </button>
                          ) : (
                            <button
                              className="adm-btn adm-btn-sm adm-btn-secondary"
                              onClick={() => showToast('Payment Wire Initiated', `Disbursement of ₹${b.amount.toLocaleString('en-IN')} queued to HDFC CMS gateway.`, 'info')}
                            >
                              Wire Disburse
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sub-section 2: Contractor & Freelancer Disbursements */}
          <div className="adm-card" style={{ padding: '1.25rem', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                  Contractor & Freelancer Specialist Disbursements
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--adm-text-dim)', margin: '2px 0 0 0' }}>
                  Milestone-based service fee settlements with automated Section 194J TDS deduction
                </p>
              </div>
            </div>

            <div className="adm-table-container">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Specialist Consultant</th>
                    <th>Role & Expertise</th>
                    <th>Milestone Deliverable</th>
                    <th>Gross Fee</th>
                    <th>TDS (10%)</th>
                    <th>Net Settlement (₹)</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {contractorPayments.map(cp => (
                    <tr key={cp.id}>
                      <td style={{ fontWeight: 700, color: 'var(--adm-text)' }}>{cp.name}</td>
                      <td><span className="adm-badge adm-badge-neutral">{cp.role}</span></td>
                      <td style={{ color: 'var(--adm-text-dim)', maxWidth: '240px' }}>{cp.milestone}</td>
                      <td>₹{cp.amount.toLocaleString('en-IN')}</td>
                      <td style={{ color: 'var(--adm-primary)' }}>-₹{cp.tds.toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 800, color: 'var(--adm-success)' }}>₹{cp.netPay.toLocaleString('en-IN')}</td>
                      <td>{cp.dueDate}</td>
                      <td>
                        <span className={`adm-badge ${cp.status === 'Approved' ? 'adm-badge-success' : 'adm-badge-warning'}`}>
                          {cp.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {cp.status === 'Pending Approval' ? (
                          <button
                            className="adm-btn adm-btn-sm adm-btn-primary"
                            onClick={() => {
                              setContractorPayments(prev => prev.map(p => p.id === cp.id ? { ...p, status: 'Approved' } : p));
                              showToast('Milestone Approved', `Settlement for ${cp.name} signed off.`, 'success');
                            }}
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            className="adm-btn adm-btn-sm adm-btn-secondary"
                            onClick={() => showToast('Disbursement Queued', `Remittance of ₹${cp.netPay.toLocaleString('en-IN')} scheduled to ${cp.name}.`, 'info')}
                          >
                            Disburse
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sub-section 3: Approved Workforce Reimbursements & Purchase Orders Grid */}
          <div className="adm-grid-2">
            {/* Approved Reimbursements */}
            <div className="adm-card" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--adm-text)', marginBottom: '0.85rem' }}>
                Approved Workforce Reimbursements
              </h3>
              <div className="adm-table-container">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Expense Purpose</th>
                      <th>Amount</th>
                      <th>Approval</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reimbursements.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 700 }}>{r.employee}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--adm-text-dim)' }}>
                          {r.title}
                          {r.receiptAttached && <div style={{ color: 'var(--adm-success)', fontSize: '0.72rem' }}>✓ GST Bill Attached</div>}
                        </td>
                        <td style={{ fontWeight: 800, color: 'var(--adm-danger)' }}>₹{r.amount.toLocaleString('en-IN')}</td>
                        <td>
                          <span className="adm-badge adm-badge-success">{r.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Corporate Purchase Orders */}
            <div className="adm-card" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--adm-text)', marginBottom: '0.85rem' }}>
                Purchase Orders (PO) Registry
              </h3>
              <div className="adm-table-container">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>PO Ref</th>
                      <th>Vendor & Scope</th>
                      <th>Value</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.map(po => (
                      <tr key={po.id}>
                        <td><code>{po.id}</code></td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{po.vendor}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>{po.item}</div>
                        </td>
                        <td style={{ fontWeight: 800 }}>₹{(po.amount / 100000).toFixed(2)}L</td>
                        <td>
                          <span className={`adm-badge ${po.status === 'Executed' ? 'adm-badge-success' : 'adm-badge-primary'}`}>
                            {po.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. CONTRACTS & SLA MANAGEMENT ── */}
      {tab === 'contracts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Contracts Header KPI */}
          <div className="adm-kpi-grid">
            <div className="adm-kpi-card">
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">Active Contract Capital</span>
                <div className="adm-kpi-icon" style={{ background: 'var(--adm-success-soft)', color: 'var(--adm-success)' }}>
                  <ShieldCheck size={18} />
                </div>
              </div>
              <div className="adm-kpi-value">₹{(contracts.reduce((s, c) => s + c.totalValue, 0) / 10000000).toFixed(2)} Cr</div>
              <div className="adm-kpi-footer">
                <span style={{ color: 'var(--adm-text-dim)' }}>Across {contracts.length} Institutional MSAs</span>
              </div>
            </div>

            <div className="adm-kpi-card">
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">SLA Uptime Standard</span>
                <div className="adm-kpi-icon" style={{ background: 'var(--adm-primary-soft)', color: 'var(--adm-primary)' }}>
                  <Clock size={18} />
                </div>
              </div>
              <div className="adm-kpi-value" style={{ color: 'var(--adm-primary)' }}>99.9%</div>
              <div className="adm-kpi-footer">
                <span style={{ color: 'var(--adm-success)', fontWeight: 600 }}>100% Milestone Compliance</span>
              </div>
            </div>

            <div className="adm-kpi-card">
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">Digitally Executed MSAs</span>
                <div className="adm-kpi-icon" style={{ background: 'var(--adm-surface-hover)', color: 'var(--adm-text)' }}>
                  <CheckCheck size={18} />
                </div>
              </div>
              <div className="adm-kpi-value">{contracts.filter(c => c.signatureStatus.includes('DocuSign')).length} MSAs</div>
              <div className="adm-kpi-footer">
                <span style={{ color: 'var(--adm-text-dim)' }}>Legally Enforceable Digital Seals</span>
              </div>
            </div>

            <div className="adm-kpi-card">
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">Renewal Notifications</span>
                <div className="adm-kpi-icon" style={{ background: 'var(--adm-warning-soft)', color: 'var(--adm-warning)' }}>
                  <Calendar size={18} />
                </div>
              </div>
              <div className="adm-kpi-value" style={{ color: 'var(--adm-warning)' }}>3 Alerts Active</div>
              <div className="adm-kpi-footer">
                <span style={{ color: 'var(--adm-warning)' }}>Automated 30-Day Notice</span>
              </div>
            </div>
          </div>

          {/* Master Contracts Directory Table */}
          <div className="adm-card" style={{ padding: '1.25rem', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                  Master Service Agreements (MSA) & Service Level Agreements (SLA)
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--adm-text-dim)', margin: '2px 0 0 0' }}>
                  Institutional client contracts, version revisions, digital DocuSign execution, SLA uptime, and renewal reminders
                </p>
              </div>

              <button className="adm-btn adm-btn-primary" onClick={() => setShowAddContractModal(true)}>
                <Plus size={16} />
                <span>Commission Master Contract / SOW</span>
              </button>
            </div>

            <div className="adm-table-container">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Contract Ref & Version</th>
                    <th>Client & Project Scope</th>
                    <th>Contract Value (₹)</th>
                    <th>Effective Term</th>
                    <th>Renewal Date</th>
                    <th>Execution Status</th>
                    <th>SLA Guarantee</th>
                    <th>Account Owner</th>
                    <th>Satisfaction</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map(ctr => (
                    <tr key={ctr.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--adm-text)' }}>{ctr.contractNo}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--adm-primary)' }}>{ctr.version} &bull; Legally Bound</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--adm-text)' }}>{ctr.clientName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>{ctr.projectName}</div>
                      </td>
                      <td style={{ fontWeight: 800, color: 'var(--adm-success)' }}>
                        ₹{(ctr.totalValue / 100000).toFixed(1)}L
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>
                        <div>{ctr.startDate}</div>
                        <div style={{ color: 'var(--adm-text-dim)' }}>to {ctr.expiryDate}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#f59e0b' }}>{ctr.renewalDate}</span>
                        {ctr.renewalAlertActive && <div style={{ fontSize: '0.7rem', color: 'var(--adm-success)' }}>🔔 Auto-Alert On</div>}
                      </td>
                      <td>
                        <span className={`adm-badge ${ctr.signatureStatus.includes('DocuSign') ? 'adm-badge-success' : 'adm-badge-warning'}`}>
                          {ctr.signatureStatus}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{ctr.slaUptime}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>{ctr.incidentSla}</div>
                      </td>
                      <td>
                        <span className="adm-badge adm-badge-neutral">{ctr.accountOwner}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: '#eab308' }}>★ {ctr.satisfactionRating}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            className="adm-btn adm-btn-sm adm-btn-secondary"
                            onClick={() => showToast('MSA Versioning', `Viewing version history and amendments for ${ctr.contractNo}`, 'info')}
                            title="View Versions & Amendments"
                          >
                            Amendments
                          </button>
                          <button
                            className="adm-btn adm-btn-sm adm-btn-secondary"
                            onClick={() => showToast('Renewal Notification', `Automated 30-day renewal notification queued for ${ctr.clientName}.`, 'success')}
                            title="Trigger Renewal Reminder"
                          >
                            <Calendar size={12} />
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
      )}

      {/* ── 2. EXPENSES TABLE ── */}
      {tab === 'expenses' && (
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Expense Category</th>
                <th>Description</th>
                <th>Vendor / Payee</th>
                <th>Payment Mode</th>
                <th>Date</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id}>
                  <td><span className="adm-badge adm-badge-neutral">{exp.category}</span></td>
                  <td style={{ fontWeight: 600, color: 'var(--adm-text, #1a1a1a)' }}>{exp.description}</td>
                  <td>{exp.vendor}</td>
                  <td>{exp.paidBy}</td>
                  <td>{exp.date}</td>
                  <td style={{ fontWeight: 700, color: 'var(--adm-danger)' }}>
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 2b. AUTOMATED PAYROLL & SALARY SLIPS GENERATOR ── */}
      {tab === 'payroll' && (
        <div>
          {/* Executive Payroll KPI Summary Grid */}
          <div className="adm-kpi-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="adm-kpi-card" style={{ padding: '1.2rem 1.4rem' }}>
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">Total Monthly Payroll</span>
                <div className="adm-kpi-icon" style={{ background: 'var(--adm-primary-soft)', color: 'var(--adm-primary)' }}>
                  <DollarSign size={18} />
                </div>
              </div>
              <div className="adm-kpi-value">₹{(totalMonthlyPayrollGross / 100000).toFixed(2)}L</div>
              <div className="adm-kpi-footer">
                <span style={{ color: 'var(--adm-text-dim)' }}>Gross Allocation &bull; {employees.length} Staff</span>
              </div>
            </div>

            <div className="adm-kpi-card" style={{ padding: '1.2rem 1.4rem' }}>
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">Statutory Deductions (PF/PT/TDS)</span>
                <div className="adm-kpi-icon" style={{ background: 'rgba(234, 88, 12, 0.12)', color: 'var(--adm-primary)' }}>
                  <Receipt size={18} />
                </div>
              </div>
              <div className="adm-kpi-value" style={{ color: 'var(--adm-primary)' }}>
                ₹{totalMonthlyPayrollDeductions.toLocaleString('en-IN')}
              </div>
              <div className="adm-kpi-footer">
                <span style={{ color: 'var(--adm-text-dim)' }}>PF (12%) + PT (₹200) + TDS Slabs</span>
              </div>
            </div>

            <div className="adm-kpi-card" style={{ padding: '1.2rem 1.4rem' }}>
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">Net Take-Home Disbursed</span>
                <div className="adm-kpi-icon" style={{ background: 'rgba(5, 150, 105, 0.12)', color: 'var(--adm-success)' }}>
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div className="adm-kpi-value" style={{ color: 'var(--adm-success)' }}>
                ₹{(totalMonthlyPayrollNet / 100000).toFixed(2)}L
              </div>
              <div className="adm-kpi-footer">
                <span style={{ color: 'var(--adm-text-dim)' }}>100% On-Time Bank Wire Transfer</span>
              </div>
            </div>

            <div className="adm-kpi-card" style={{ padding: '1.2rem 1.4rem' }}>
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">Pay Cycle Period</span>
                <div className="adm-kpi-icon" style={{ background: 'var(--adm-surface-hover)', color: 'var(--adm-text)' }}>
                  <Calendar size={18} />
                </div>
              </div>
              <div className="adm-kpi-value" style={{ fontSize: '1.2rem', marginTop: '0.2rem' }}>
                {selectedPayMonth}
              </div>
              <div className="adm-kpi-footer">
                <span style={{ color: 'var(--adm-success)', fontWeight: 700 }}>✓ Payroll Engine Processed</span>
              </div>
            </div>
          </div>

          {/* Payroll Control & Employee Table */}
          <div className="adm-card" style={{ padding: '1.25rem 1.4rem', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                  Enterprenex Workforce Payroll & Statutory Payslips
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--adm-text-dim)', margin: '2px 0 0 0' }}>
                  Statutory 50-30-20 CTC structure &bull; Click "Generate Payslip" to download official Enterprenex letterhead slip
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--adm-text-muted)' }}>Month:</span>
                  <select
                    className="adm-select"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    value={selectedPayMonth}
                    onChange={e => setSelectedPayMonth(e.target.value)}
                  >
                    <option value="October 2026">October 2026 (Current Cycle)</option>
                    <option value="September 2026">September 2026</option>
                    <option value="August 2026">August 2026</option>
                    <option value="July 2026">July 2026</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="adm-table-container">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Employee Name & ID</th>
                    <th>Department & Role</th>
                    <th>Gross Monthly</th>
                    <th>Basic (50%)</th>
                    <th>HRA (30%)</th>
                    <th>Allowance (20%)</th>
                    <th>PF Deduct (12%)</th>
                    <th>Net Take-Home</th>
                    <th style={{ textAlign: 'center' }}>Official Payslip</th>
                  </tr>
                </thead>
                <tbody>
                  {employees
                    .filter(emp =>
                      emp.name.toLowerCase().includes(search.toLowerCase()) ||
                      (emp.employeeId && emp.employeeId.toLowerCase().includes(search.toLowerCase())) ||
                      (emp.department && emp.department.toLowerCase().includes(search.toLowerCase()))
                    )
                    .map(emp => {
                      const breakdown = calculateSalaryBreakdown(emp.salaryMonthly || 50000);
                      return (
                        <tr key={emp.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--adm-text)' }}>{emp.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', fontFamily: 'monospace' }}>
                              {emp.employeeId || 'EPX-EMP'}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.84rem', color: 'var(--adm-text)' }}>{emp.role}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>{emp.department || 'Engineering'}</div>
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--adm-text)' }}>
                            ₹{breakdown.gross.toLocaleString('en-IN')}
                          </td>
                          <td style={{ color: 'var(--adm-text-muted)' }}>
                            ₹{breakdown.basic.toLocaleString('en-IN')}
                          </td>
                          <td style={{ color: 'var(--adm-text-muted)' }}>
                            ₹{breakdown.hra.toLocaleString('en-IN')}
                          </td>
                          <td style={{ color: 'var(--adm-text-muted)' }}>
                            ₹{breakdown.specialAllowance.toLocaleString('en-IN')}
                          </td>
                          <td style={{ color: 'var(--adm-primary)' }}>
                            -₹{breakdown.pf.toLocaleString('en-IN')}
                          </td>
                          <td style={{ fontWeight: 800, color: 'var(--adm-success)' }}>
                            ₹{breakdown.netPay.toLocaleString('en-IN')}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="adm-btn adm-btn-sm adm-btn-primary"
                              style={{
                                padding: '0.4rem 0.85rem',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                borderRadius: '8px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                              onClick={() => printOfficialPayslip(emp, selectedPayMonth)}
                              title="Download & Print Official Letterhead Payslip"
                            >
                              <Printer size={13} />
                              <span>Generate Payslip</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. GST BREAKDOWN ── */}
      {tab === 'gst' && (
        <div className="adm-card">
          <div className="adm-card-header">
            <div className="adm-card-title">
              <FileCheck size={18} color="var(--adm-success)" />
              GST Filing & Tax Remittance Breakdown (FY 2025-26)
            </div>
            <span className="adm-badge adm-badge-success">GSTIN: 27AAACB2212P1ZX</span>
          </div>

          <div className="adm-table-container">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Client Company</th>
                  <th>Client GSTIN</th>
                  <th>Taxable Turnover</th>
                  <th>CGST (9%)</th>
                  <th>SGST (9%)</th>
                  <th>Total GST (18%)</th>
                </tr>
              </thead>
              <tbody>
                {invoices.filter(i => i.status === 'Paid').map(inv => {
                  const subtotal = inv.subtotal;
                  const cgst = Math.round(subtotal * 0.09);
                  const sgst = Math.round(subtotal * 0.09);
                  const totalGst = cgst + sgst;

                  return (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 700, color: 'var(--adm-text, #1a1a1a)' }}>{inv.clientName}</td>
                      <td><code>27AAACB{inv.id.replace('inv-', '99')}P1ZX</code></td>
                      <td>₹{subtotal.toLocaleString('en-IN')}</td>
                      <td>₹{cgst.toLocaleString('en-IN')}</td>
                      <td>₹{sgst.toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 700, color: 'var(--adm-primary)' }}>₹{totalGst.toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── LAZY-LOADED SCREEN-ADAPTIVE SLIDING INVOICE DRAWER ── */}
      {selectedInvoice && (
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
          <InvoicePreviewDrawer
            invoice={selectedInvoice}
            client={selectedClient}
            onClose={() => setSelectedInvoice(null)}
            onMarkPaid={(id, method) => {
              markInvoicePaid(id, method);
              setSelectedInvoice(prev =>
                prev && prev.id === id
                  ? {
                      ...prev,
                      status: 'Paid',
                      paymentDate: new Date().toISOString().split('T')[0],
                      paymentMethod: method
                    }
                  : prev
              );
            }}
            onSendReminder={id => {
              sendPaymentReminder(id);
            }}
            onUpdateInvoice={(id, updates) => {
              updateInvoice(id, updates);
              setSelectedInvoice(prev => (prev && prev.id === id ? { ...prev, ...updates } : prev));
            }}
          />
        </Suspense>
      )}

      {/* ── CREATE INVOICE MODAL ── */}
      {showAddInvoiceModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddInvoiceModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text, #1a1a1a)' }}>
                Generate Tax Invoice / Quotation
              </h3>
              <button className="adm-modal-close" onClick={() => setShowAddInvoiceModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice}>
              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Select Client *</label>
                  <select className="adm-select" value={fClientId} onChange={e => setFClientId(e.target.value)}>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Associated Project</label>
                  <select className="adm-select" value={fProjectId} onChange={e => setFProjectId(e.target.value)}>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
              </div>

              <div className="adm-grid-3">
                <div className="adm-form-group">
                  <label className="adm-form-label">Document Type</label>
                  <select className="adm-select" value={fType} onChange={e => setFType(e.target.value as any)}>
                    <option value="Tax Invoice">Tax Invoice</option>
                    <option value="Quotation">Quotation / Proforma</option>
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Subtotal (₹ Excl. GST) *</label>
                  <input className="adm-input" type="number" required value={fAmount} onChange={e => setFAmount(Number(e.target.value))} />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Payment Due Date</label>
                  <input className="adm-input" type="date" value={fDueDate} onChange={e => setFDueDate(e.target.value)} />
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Deliverable Line Item Description</label>
                <input className="adm-input" value={fDesc} onChange={e => setFDesc(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowAddInvoiceModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">Generate Document</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RECORD EXPENSE MODAL ── */}
      {showAddExpenseModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddExpenseModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text, #1a1a1a)' }}>
                Record Company Expense
              </h3>
              <button className="adm-modal-close" onClick={() => setShowAddExpenseModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateExpense}>
              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Expense Category</label>
                  <select className="adm-select" value={eCategory} onChange={e => setECategory(e.target.value as any)}>
                    <option value="Infrastructure & Cloud">Infrastructure & Cloud (AWS/GCP)</option>
                    <option value="Software Licenses">Software Licenses & Tooling</option>
                    <option value="Office & Admin">Office Rent & Utilities</option>
                    <option value="Salaries & Contractors">Salaries & Specialist Consultants</option>
                    <option value="Marketing">Marketing & Client Travel</option>
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Amount (₹) *</label>
                  <input className="adm-input" type="number" required value={eAmount} onChange={e => setEAmount(Number(e.target.value))} />
                </div>
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Vendor / Payee</label>
                  <input className="adm-input" value={eVendor} onChange={e => setEVendor(e.target.value)} placeholder="e.g. AWS Cloud, Figma" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Paid Via</label>
                  <input className="adm-input" value={ePaidBy} onChange={e => setEPaidBy(e.target.value)} placeholder="Corporate Credit Card / Bank" />
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Expense Description</label>
                <textarea className="adm-textarea" value={eDesc} onChange={e => setEDesc(e.target.value)} placeholder="Purpose and justification for expense..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowAddExpenseModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RECORD CLIENT PAYMENT (PARTIAL & FULL) MODAL ── */}
      {paymentModalInvoice && (
        <div className="adm-modal-overlay" onClick={() => setPaymentModalInvoice(null)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                  Record Client Payment Remittance
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--adm-text-dim)', margin: '2px 0 0 0' }}>
                  Invoice: {paymentModalInvoice.invoiceNumber} &bull; Client: {paymentModalInvoice.clientName}
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setPaymentModalInvoice(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const existingPaid = paymentModalInvoice.paidAmount || 0;
              const newTotalPaid = existingPaid + Number(payAmountInput);
              const isFullyPaid = newTotalPaid >= paymentModalInvoice.totalAmount;
              const ref = payRefInput || `CMS-UTR-${Date.now().toString().slice(-6)}`;

              updateInvoice(paymentModalInvoice.id, {
                paidAmount: newTotalPaid,
                paymentMethod: payMethodInput,
                paymentReference: ref,
                paymentDate: new Date().toISOString().split('T')[0],
                status: isFullyPaid ? 'Paid' : 'Pending'
              });

              showToast(
                isFullyPaid ? 'Settlement Completed' : 'Partial Payment Recorded',
                `Recorded ₹${Number(payAmountInput).toLocaleString('en-IN')} via ${payMethodInput} (Ref: ${ref}).`,
                'success'
              );

              // Auto-generate official payment receipt
              printPaymentReceipt(paymentModalInvoice, Number(payAmountInput), ref, payMethodInput);

              setPaymentModalInvoice(null);
            }}>
              <div style={{ background: 'var(--adm-surface-hover)', padding: '12px 14px', borderRadius: '8px', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-dim)' }}>Total Invoice Value</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--adm-text)' }}>
                    ₹{paymentModalInvoice.totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-dim)' }}>Currently Outstanding</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--adm-danger)' }}>
                    ₹{(paymentModalInvoice.totalAmount - (paymentModalInvoice.paidAmount || 0)).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Payment Amount Received (₹) *</label>
                <input
                  className="adm-input"
                  type="number"
                  required
                  min={1}
                  max={paymentModalInvoice.totalAmount - (paymentModalInvoice.paidAmount || 0)}
                  value={payAmountInput}
                  onChange={e => setPayAmountInput(Number(e.target.value))}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', marginTop: '4px', display: 'block' }}>
                  Partial payments permitted. Remaining balance remains tracked in Accounts Receivable.
                </span>
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Remittance Channel *</label>
                  <select
                    className="adm-select"
                    value={payMethodInput}
                    onChange={e => setPayMethodInput(e.target.value)}
                  >
                    <option value="NEFT / Bank Transfer">NEFT / Bank Transfer (HDFC CMS)</option>
                    <option value="RTGS Immediate Wire">RTGS Immediate Wire Transfer</option>
                    <option value="IMPS Instant Transfer">IMPS Instant Transfer</option>
                    <option value="Corporate Escrow Account">Corporate Escrow Account</option>
                    <option value="Corporate UPI Gateway">Corporate UPI Gateway</option>
                    <option value="International Wire (SWIFT)">International Wire (SWIFT / USD)</option>
                  </select>
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Bank UTR / Transaction Ref</label>
                  <input
                    className="adm-input"
                    value={payRefInput}
                    onChange={e => setPayRefInput(e.target.value)}
                    placeholder="e.g. HDFC20261017992"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderTop: '1px solid var(--adm-border)', marginTop: '1rem' }}>
                <CheckCircle2 size={16} color="var(--adm-success)" />
                <span style={{ fontSize: '0.8rem', color: 'var(--adm-text-dim)' }}>
                  An official computer-generated Enterprenex Payment Receipt will be generated automatically.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setPaymentModalInvoice(null)}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary">
                  <Receipt size={14} />
                  <span>Confirm Payment & Print Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── AUTOMATED PAYMENT REMINDER MODAL ── */}
      {reminderModalInvoice && (
        <div className="adm-modal-overlay" onClick={() => setReminderModalInvoice(null)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                  Automated Payment Reminder Protocol
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--adm-text-dim)', margin: '2px 0 0 0' }}>
                  Statutory reminder notification with direct HDFC Bank wire instructions
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setReminderModalInvoice(null)}>
                <X size={18} />
              </button>
            </div>

            <div>
              <div className="adm-form-group">
                <label className="adm-form-label">Dispatch Channels</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '4px' }}>
                  {(['Both', 'WhatsApp', 'Email'] as const).map(ch => (
                    <label key={ch} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
                      <input
                        type="radio"
                        name="reminderChannel"
                        checked={reminderChannel === ch}
                        onChange={() => setReminderChannel(ch)}
                      />
                      <span>{ch === 'Both' ? 'WhatsApp & Official Email (Recommended)' : ch}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Automated Message Preview</label>
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', fontSize: '0.82rem', color: '#1e293b', lineHeight: 1.6, fontFamily: 'monospace' }}>
                  <strong>Subject: Gentle Payment Reminder - Enterprenex Tax Invoice #{reminderModalInvoice.invoiceNumber}</strong><br/><br/>
                  Dear {reminderModalInvoice.clientName} Accounts Team,<br/><br/>
                  Greetings from Enterprenex Solutions Private Limited.<br/>
                  This is a gentle institutional reminder that Tax Invoice <strong>#{reminderModalInvoice.invoiceNumber}</strong> for the amount of <strong>₹{(reminderModalInvoice.totalAmount - (reminderModalInvoice.paidAmount || 0)).toLocaleString('en-IN')}</strong>, due on <strong>{reminderModalInvoice.dueDate}</strong>, remains outstanding.<br/><br/>
                  <strong>Bank Settlement Details:</strong><br/>
                  &bull; Beneficiary: Enterprenex Solutions Pvt. Ltd.<br/>
                  &bull; Bank: HDFC Bank Ltd (Primary Operating Account)<br/>
                  &bull; A/C No: 5020008492019 &bull; IFSC: HDFC0000240<br/><br/>
                  Kindly arrange the remittance at your earliest convenience and reply with the UTR number for immediate reconciliation.<br/><br/>
                  Sincerely,<br/>
                  Directorate of Finance & Commercial Operations<br/>
                  Enterprenex Solutions Pvt. Ltd.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button className="adm-btn adm-btn-secondary" onClick={() => setReminderModalInvoice(null)}>
                  Cancel
                </button>
                <button
                  className="adm-btn adm-btn-primary"
                  onClick={() => {
                    sendPaymentReminder(reminderModalInvoice.id);
                    showToast(
                      'Payment Reminder Dispatched',
                      `Automated notification successfully sent via ${reminderChannel} to ${reminderModalInvoice.clientName}.`,
                      'success'
                    );
                    setReminderModalInvoice(null);
                  }}
                >
                  <Send size={14} />
                  <span>Send Reminder via {reminderChannel}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── COMMISSION NEW MASTER CONTRACT / SOW MODAL ── */}
      {showAddContractModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddContractModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                  Commission Master Service Agreement (MSA)
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--adm-text-dim)', margin: '2px 0 0 0' }}>
                  Execute institutional client contract with DocuSign digital workflow and SLA bindings
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setShowAddContractModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const newCtr = {
                id: `ctr-${Date.now()}`,
                clientName: newCtrClient || clients[0]?.companyName || 'Enterprise Partner',
                projectName: newCtrProject || 'Turnkey Cloud Transformation',
                contractNo: `MSA-2026-0${contracts.length + 1}`,
                version: 'v1.0',
                totalValue: Number(newCtrValue),
                startDate: new Date().toISOString().split('T')[0],
                expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
                renewalDate: new Date(Date.now() + 335 * 86400000).toISOString().split('T')[0],
                signatureStatus: 'Digitally Signed (DocuSign)',
                slaUptime: newCtrSla,
                incidentSla: '2 Hour High SLA',
                accountOwner: 'Rohit Pawar (Director)',
                satisfactionRating: 5.0,
                renewalAlertActive: true
              };

              setContracts(prev => [newCtr, ...prev]);
              showToast('Contract Executed', `Master Service Agreement ${newCtr.contractNo} commissioned with DocuSign seal.`, 'success');
              setShowAddContractModal(false);
              setNewCtrProject('');
            }}>
              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Client Entity *</label>
                  <select
                    className="adm-select"
                    value={newCtrClient}
                    onChange={e => setNewCtrClient(e.target.value)}
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.companyName}>{c.companyName}</option>
                    ))}
                  </select>
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Total Contract Value (₹) *</label>
                  <input
                    className="adm-input"
                    type="number"
                    required
                    value={newCtrValue}
                    onChange={e => setNewCtrValue(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Project Scope / Engagement Title *</label>
                <input
                  className="adm-input"
                  required
                  placeholder="e.g. Enterprise Cloud ERP Modernization & Microservices"
                  value={newCtrProject}
                  onChange={e => setNewCtrProject(e.target.value)}
                />
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">SLA Uptime Commitment</label>
                  <select
                    className="adm-select"
                    value={newCtrSla}
                    onChange={e => setNewCtrSla(e.target.value)}
                  >
                    <option value="99.95% Uptime">99.95% Uptime (Mission-Critical Tier 1)</option>
                    <option value="99.9% Uptime">99.9% Uptime (Enterprise Standard)</option>
                    <option value="99.5% Uptime">99.5% Uptime (Core Cloud Tier)</option>
                  </select>
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Account Ownership</label>
                  <input className="adm-input" readOnly value="Rohit Pawar (Managing Director)" />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowAddContractModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary">
                  <ShieldCheck size={14} />
                  <span>Execute Contract with DocuSign</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
