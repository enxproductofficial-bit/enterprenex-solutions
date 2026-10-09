import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Download,
  CreditCard,
  X,
  FileCheck
} from 'lucide-react';
import type { Invoice, ExpenseRecord } from '../types';

export const FinancePage: React.FC = () => {
  const { invoices, expenses, clients, projects, addInvoice, markInvoicePaid, sendPaymentReminder, addExpense } = useAdmin();
  const [tab, setTab] = useState<'invoices' | 'expenses' | 'gst'>('invoices');
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
            <span className="adm-kpi-label">Total Expenses</span>
            <div className="adm-kpi-icon" style={{ background: 'var(--adm-danger-soft)', color: 'var(--adm-danger)' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div className="adm-kpi-value">₹{(totalExpenses / 100000).toFixed(1)}L</div>
          <div className="adm-kpi-footer">
            <span>Cloud & Operations</span>
          </div>
        </div>

        <div className="adm-kpi-card">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Net Operating Margin</span>
            <div className="adm-kpi-icon" style={{ background: 'var(--adm-primary-soft)', color: 'var(--adm-primary)' }}>
              <FileCheck size={18} />
            </div>
          </div>
          <div className="adm-kpi-value">
            {totalPaidRevenue > 0 ? Math.round(((totalPaidRevenue - totalExpenses) / totalPaidRevenue) * 100) : 0}%
          </div>
          <div className="adm-kpi-footer">
            <span className="adm-trend-up">Healthy Margin</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="adm-card" style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="adm-tabs" style={{ margin: 0, border: 'none' }}>
          <button className={`adm-tab-btn ${tab === 'invoices' ? 'active' : ''}`} onClick={() => setTab('invoices')}>
            Invoices & Quotations ({invoices.length})
          </button>
          <button className={`adm-tab-btn ${tab === 'expenses' ? 'active' : ''}`} onClick={() => setTab('expenses')}>
            Expenses Ledger ({expenses.length})
          </button>
          <button className={`adm-tab-btn ${tab === 'gst' ? 'active' : ''}`} onClick={() => setTab('gst')}>
            GST Compliance Breakdown
          </button>
        </div>

        {tab === 'invoices' && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-dim)' }} />
              <input
                type="text"
                className="adm-input"
                style={{ paddingLeft: '2.2rem', padding: '0.35rem 0.5rem 0.35rem 2.2rem', fontSize: '0.8rem' }}
                placeholder="Search invoices..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(inv => (
                <tr key={inv.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{inv.invoiceNumber}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--adm-primary)' }}>{inv.type}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{inv.clientName}</div>
                  </td>
                  <td>{inv.issueDate}</td>
                  <td>{inv.dueDate}</td>
                  <td>₹{inv.subtotal.toLocaleString('en-IN')}</td>
                  <td>₹{inv.taxAmount.toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 800, color: '#fff' }}>
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
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="adm-btn adm-btn-sm adm-btn-secondary" onClick={() => setSelectedInvoice(inv)}>
                        View PDF
                      </button>
                      {inv.status === 'Pending' && (
                        <>
                          <button className="adm-btn adm-btn-sm adm-btn-primary" onClick={() => markInvoicePaid(inv.id)}>
                            Mark Paid
                          </button>
                          <button className="adm-btn adm-btn-sm adm-btn-secondary" onClick={() => sendPaymentReminder(inv.id)} title="Send Reminder">
                            Remind
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
                  <td style={{ fontWeight: 600, color: '#fff' }}>{exp.description}</td>
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
                      <td style={{ fontWeight: 700, color: '#fff' }}>{inv.clientName}</td>
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

      {/* ── PRINTABLE INVOICE VIEW MODAL ── */}
      {selectedInvoice && (
        <div className="adm-modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="adm-modal-content adm-modal-lg" onClick={e => e.stopPropagation()} style={{ background: '#fff', color: '#111' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #F66135', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#111', margin: 0 }}>
                  ENTERPRENEX SOLUTIONS PVT. LTD.
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '4px' }}>
                  CIN: U72200MH2024PTC123456 • GSTIN: 27AAACB2212P1ZX
                </div>
                <div style={{ fontSize: '0.8rem', color: '#555' }}>
                  Waluj Mahanagar, Chhatrapati Sambhajinagar, Maharashtra 431136
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#F66135', textTransform: 'uppercase' }}>
                  {selectedInvoice.type}
                </span>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111', marginTop: '4px' }}>{selectedInvoice.invoiceNumber}</div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>Date: {selectedInvoice.issueDate}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div>
                <strong style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.75rem' }}>Billed To:</strong>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111', marginTop: '2px' }}>{selectedInvoice.clientName}</div>
                <div style={{ color: '#555' }}>State Code: 27 (Maharashtra)</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.75rem' }}>Payment Status:</strong>
                <div style={{ marginTop: '2px' }}>
                  <span style={{ display: 'inline-block', padding: '3px 10px', background: selectedInvoice.status === 'Paid' ? '#dcfce7' : '#fef3c7', color: selectedInvoice.status === 'Paid' ? '#166534' : '#92400e', borderRadius: '4px', fontWeight: 700, fontSize: '0.82rem' }}>
                    {selectedInvoice.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ color: '#555', marginTop: '4px' }}>Due Date: {selectedInvoice.dueDate}</div>
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f4f4f5', borderBottom: '1px solid #e4e4e7', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px' }}>Item & Description</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Rate (₹)</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Tax (18%)</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f4f4f5' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{item.description}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹{item.rate.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>18%</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>₹{item.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculations Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
              <div style={{ width: '280px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: '#666' }}>Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>₹{selectedInvoice.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: '#666' }}>CGST (9%):</span>
                  <span>₹{Math.round(selectedInvoice.taxAmount / 2).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: '#666' }}>SGST (9%):</span>
                  <span>₹{Math.round(selectedInvoice.taxAmount / 2).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #111', fontWeight: 800, fontSize: '1.1rem', color: '#F66135' }}>
                  <span>Total Due:</span>
                  <span>₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Bank details & Sign */}
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Bank Account Details:</strong>
                <div>Bank: HDFC Bank Ltd • Current A/C: 50200088991122</div>
                <div>IFSC: HDFC0001234 • Branch: Waluj MIDC</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: '#111' }}>Enterprenex Solutions Pvt. Ltd.</div>
                <div style={{ fontSize: '0.72rem', color: '#888', marginTop: '2px' }}>Authorized Signatory (Digital)</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="adm-btn adm-btn-secondary" onClick={() => setSelectedInvoice(null)}>Close</button>
              <button className="adm-btn adm-btn-primary" onClick={() => window.print()}>
                <Download size={14} />
                <span>Print / Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE INVOICE MODAL ── */}
      {showAddInvoiceModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddInvoiceModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Generate Tax Invoice / Quotation</h3>
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Record Company Expense</h3>
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
