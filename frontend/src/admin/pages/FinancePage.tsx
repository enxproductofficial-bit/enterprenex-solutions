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
  DollarSign
} from 'lucide-react';
import type { Invoice, ExpenseRecord, Employee } from '../types';
import { COMPANY_LOGO_BASE64, COMPANY_SEAL_BASE64, COMPANY_WATERMARK_BASE64 } from '../data/companyLogo';

const InvoicePreviewDrawer = lazy(() =>
  import('../components/InvoicePreviewDrawer').then(m => ({ default: m.InvoicePreviewDrawer }))
);

export const FinancePage: React.FC = () => {
  const { invoices, expenses, clients, projects, employees, addInvoice, updateInvoice, markInvoicePaid, sendPaymentReminder, addExpense, showToast } = useAdmin();
  const [tab, setTab] = useState<'invoices' | 'expenses' | 'payroll' | 'gst'>('invoices');
  const [selectedPayMonth, setSelectedPayMonth] = useState('October 2026');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

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

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <h1>Finance, Invoicing & GST Accounting</h1>
          <p>Generate GST compliant tax invoices, quotations, expense ledger, and real-time cashflow</p>
        </div>
        <div className="adm-page-actions">
          <button className="adm-btn adm-btn-secondary" onClick={() => setShowAddExpenseModal(true)}>
            <Plus size={15} />
            <span>Record Expense</span>
          </button>
          <button className="adm-btn adm-btn-primary" onClick={() => setShowAddInvoiceModal(true)}>
            <Plus size={16} />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="adm-grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="adm-kpi-card">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Cash Inflow (Paid)</span>
            <div className="adm-kpi-icon" style={{ background: 'var(--adm-success-soft)', color: 'var(--adm-success)' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="adm-kpi-value">₹{(totalPaidRevenue / 100000).toFixed(1)}L</div>
          <div className="adm-kpi-footer">
            <span className="adm-trend-up">100% Realized</span>
          </div>
        </div>

        <div className="adm-kpi-card">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Accounts Receivable (Due)</span>
            <div className="adm-kpi-icon" style={{ background: 'var(--adm-warning-soft)', color: 'var(--adm-warning)' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="adm-kpi-value">₹{(totalOutstanding / 100000).toFixed(1)}L</div>
          <div className="adm-kpi-footer">
            <span style={{ color: 'var(--adm-warning)' }}>{invoices.filter(i => i.status === 'Pending').length} Invoices Pending</span>
          </div>
        </div>

        <div className="adm-kpi-card">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Total Expenses Logged</span>
            <div className="adm-kpi-icon" style={{ background: 'var(--adm-danger-soft)', color: 'var(--adm-danger)' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div className="adm-kpi-value">₹{(totalExpenses / 100000).toFixed(1)}L</div>
          <div className="adm-kpi-footer">
            <span style={{ color: 'var(--adm-text-dim)' }}>Across {expenses.length} Records</span>
          </div>
        </div>

        <div className="adm-kpi-card">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Operating Margin</span>
            <div className="adm-kpi-icon" style={{ background: 'var(--adm-primary-soft)', color: 'var(--adm-primary)' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="adm-kpi-value" style={{ color: 'var(--adm-success)' }}>
            {totalPaidRevenue > 0 ? Math.round(((totalPaidRevenue - totalExpenses) / totalPaidRevenue) * 100) : 0}%
          </div>
          <div className="adm-kpi-footer">
            <span className="adm-trend-up">Profitable Cashflow</span>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--adm-border)', marginBottom: '1.5rem', gap: '1rem' }}>
        <button
          onClick={() => setTab('invoices')}
          style={{
            padding: '0.6rem 1rem',
            background: 'transparent',
            border: 'none',
            borderBottom: tab === 'invoices' ? '2px solid var(--adm-primary)' : '2px solid transparent',
            color: tab === 'invoices' ? 'var(--adm-primary)' : 'var(--adm-text-muted)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          Invoices & Quotations ({invoices.length})
        </button>
        <button
          onClick={() => setTab('expenses')}
          style={{
            padding: '0.6rem 1rem',
            background: 'transparent',
            border: 'none',
            borderBottom: tab === 'expenses' ? '2px solid var(--adm-primary)' : '2px solid transparent',
            color: tab === 'expenses' ? 'var(--adm-primary)' : 'var(--adm-text-muted)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          Expense Ledger ({expenses.length})
        </button>
        <button
          onClick={() => setTab('payroll')}
          style={{
            padding: '0.6rem 1rem',
            background: 'transparent',
            border: 'none',
            borderBottom: tab === 'payroll' ? '2px solid var(--adm-primary)' : '2px solid transparent',
            color: tab === 'payroll' ? 'var(--adm-primary)' : 'var(--adm-text-muted)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          Automated Payroll & Slips ({employees.length})
        </button>
        <button
          onClick={() => setTab('gst')}
          style={{
            padding: '0.6rem 1rem',
            background: 'transparent',
            border: 'none',
            borderBottom: tab === 'gst' ? '2px solid var(--adm-primary)' : '2px solid transparent',
            color: tab === 'gst' ? 'var(--adm-primary)' : 'var(--adm-text-muted)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          GST Remittance Summary
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="adm-card" style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-dim)' }} />
          <input
            type="text"
            className="adm-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search by client or invoice #..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {tab === 'invoices' && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--adm-text-dim)' }}>Filter:</span>
            <select
              className="adm-select"
              style={{ width: 'auto', padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        )}
      </div>

      {/* ── 1. INVOICES TABLE ── */}
      {tab === 'invoices' && (
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Invoice / Quotation #</th>
                <th>Client Account</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Subtotal</th>
                <th>GST (18%)</th>
                <th>Total Payable</th>
                <th>Status</th>
                <th className="adm-table-sticky-right" style={{ minWidth: '160px' }}>Actions</th>
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
                    <td className="adm-table-sticky-right" style={{ minWidth: '160px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button className="adm-btn adm-btn-sm adm-btn-secondary" onClick={() => setSelectedInvoice(inv)}>
                          Preview PDF
                        </button>
                        {inv.status === 'Pending' && (
                          <>
                            <button
                              className="adm-btn adm-btn-sm adm-btn-primary"
                              onClick={() => {
                                markInvoicePaid(inv.id);
                                if (selectedInvoice?.id === inv.id) {
                                  setSelectedInvoice({ ...inv, status: 'Paid', paymentDate: new Date().toISOString().split('T')[0] });
                                }
                              }}
                            >
                              Mark Paid
                            </button>
                            <button
                              className="adm-btn adm-btn-sm adm-btn-secondary"
                              onClick={() => sendPaymentReminder(inv.id)}
                              title="Send Reminder"
                            >
                              <Send size={12} />
                            </button>
                          </>
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

    </div>
  );
};
