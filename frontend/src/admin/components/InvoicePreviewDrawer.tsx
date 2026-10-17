import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  MessageCircle,
  Mail,
  CreditCard,
  Send
} from 'lucide-react';
import type { Invoice, Client } from '../types';

interface InvoicePreviewDrawerProps {
  invoice: Invoice;
  client?: Client;
  onClose: () => void;
  onMarkPaid: (id: string, method?: string) => void;
  onSendReminder: (id: string) => void;
  onUpdateInvoice?: (id: string, updates: Partial<Invoice>) => void;
}

export const InvoicePreviewDrawer: React.FC<InvoicePreviewDrawerProps> = ({
  invoice,
  client,
  onClose,
  onMarkPaid,
  onSendReminder
}) => {
  const [payMethod, setPayMethod] = useState('NEFT / Bank Transfer');
  const [showPayModal, setShowPayModal] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const clientPhone = client?.primaryContact?.phone || '+91-9876543210';
  const clientEmail = client?.primaryContact?.email || '';

  const getWhatsAppLink = () => {
    let rawDigits = clientPhone.replace(/\D/g, '');
    if (rawDigits.length === 10) {
      rawDigits = '91' + rawDigits;
    }
    const msg = `Dear ${client?.companyName || invoice.clientName}, your ${invoice.type} ${invoice.invoiceNumber} for ₹${invoice.totalAmount.toLocaleString('en-IN')} from ENTERPRENEX SOLUTIONS PVT. LTD. is generated (Payment Due: ${invoice.dueDate}). Bank Transfer Details: HDFC Bank Current A/C 50200088991122 (IFSC: HDFC0001234). Kindly review and process the settlement.`;
    return `https://wa.me/${rawDigits}?text=${encodeURIComponent(msg)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmPaid = () => {
    onMarkPaid(invoice.id, payMethod);
    setShowPayModal(false);
  };

  const cgst = Math.round(invoice.taxAmount / 2);
  const sgst = Math.round(invoice.taxAmount / 2);

  return (
    <div className="adm-drawer-overlay" onClick={onClose}>
      <div
        className="adm-preview-drawer"
        onClick={e => e.stopPropagation()}
        style={{ width: 'clamp(440px, 58vw, 900px)' }}
      >
        {/* ── Drawer Header ── */}
        <div className="adm-drawer-header">
          <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span className="adm-badge adm-badge-primary">{invoice.type}</span>
              <span
                className={`adm-badge ${
                  invoice.status === 'Paid'
                    ? 'adm-badge-success'
                    : invoice.status === 'Pending'
                    ? 'adm-badge-warning'
                    : invoice.status === 'Overdue'
                    ? 'adm-badge-danger'
                    : 'adm-badge-neutral'
                }`}
              >
                {invoice.status.toUpperCase()}
              </span>
              <span className="adm-badge adm-badge-neutral" style={{ fontSize: '0.72rem' }}>
                State Code: 27 (MH)
              </span>
            </div>

            <h2
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--adm-text, #1a1a1a)',
                margin: '4px 0 2px 0',
                lineHeight: 1.3
              }}
            >
              {invoice.invoiceNumber}
            </h2>

            <div style={{ fontSize: '0.82rem', color: 'var(--adm-text-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>Client: <strong style={{ color: 'var(--adm-text, #1a1a1a)' }}>{invoice.clientName}</strong></span>
              <span>&bull;</span>
              <span>Issued: {invoice.issueDate}</span>
              <span>&bull;</span>
              <span>Due: <strong style={{ color: invoice.status === 'Overdue' ? 'var(--adm-danger)' : 'var(--adm-text, #1a1a1a)' }}>{invoice.dueDate}</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              className="adm-btn adm-btn-sm adm-btn-secondary"
              title="Print / Save PDF"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Printer size={14} />
              <span>Print</span>
            </button>

            <button className="adm-modal-close" onClick={onClose} title="Close Drawer (Esc)">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Direct Client Actions Toolbar ── */}
        <div
          style={{
            background: 'var(--adm-surface-alt, rgba(0, 0, 0, 0.02))',
            borderBottom: '1px solid var(--adm-border)',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="adm-btn adm-btn-sm"
              style={{
                background: '#25D366',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Share Invoice on WhatsApp"
            >
              <MessageCircle size={14} />
              <span>WhatsApp Invoice</span>
            </a>

            {clientEmail && (
              <a
                href={`mailto:${clientEmail}?subject=Invoice%20${encodeURIComponent(invoice.invoiceNumber)}%20from%20Enterprenex%20Solutions&body=Dear%20${encodeURIComponent(invoice.clientName)},%0D%0A%0D%0APlease%20find%20attached%20invoice%20${invoice.invoiceNumber}%20amounting%20to%20INR%20${invoice.totalAmount}.%0D%0ADue%20Date:%20${invoice.dueDate}%0D%0A%0D%0ARegards,%0D%0AEnterprenex%20Solutions%20Pvt.%20Ltd.`}
                className="adm-btn adm-btn-sm adm-btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Mail size={13} />
                <span>Email Client</span>
              </a>
            )}

            {invoice.status === 'Pending' && (
              <button
                type="button"
                className="adm-btn adm-btn-sm adm-btn-secondary"
                onClick={() => onSendReminder(invoice.id)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <Send size={13} />
                <span>Send Reminder</span>
              </button>
            )}
          </div>

          <div>
            {invoice.status !== 'Paid' ? (
              <button
                type="button"
                className="adm-btn adm-btn-sm"
                onClick={() => setShowPayModal(true)}
                style={{
                  background: 'var(--adm-success)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle2 size={14} />
                <span>Mark Paid</span>
              </button>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--adm-success)'
                }}
              >
                <CheckCircle2 size={15} />
                <span>Settled {invoice.paymentDate ? `on ${invoice.paymentDate}` : ''}</span>
              </span>
            )}
          </div>
        </div>

        {/* ── Drawer Body: Formal Corporate Invoice Sheet ── */}
        <div className="adm-drawer-body" style={{ padding: '1.25rem 1.5rem', background: 'var(--adm-bg)' }}>
          {/* Paper Document Container */}
          <div
            style={{
              background: '#ffffff',
              color: '#1a1a1a',
              borderRadius: '12px',
              padding: '1.75rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e5e7eb'
            }}
          >
            {/* Header: Company Letterhead */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '2px solid #1070C8',
                paddingBottom: '1.25rem',
                marginBottom: '1.5rem',
                gap: '1rem'
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
                  ENTERPRENEX SOLUTIONS PVT. LTD.
                </h2>
                <div style={{ fontSize: '0.78rem', color: '#4b5563', marginTop: '4px', lineHeight: 1.5 }}>
                  CIN: <strong>U72200MH2024PTC123456</strong> &bull; GSTIN: <strong style={{ color: '#1070C8' }}>27AAACB2212P1ZX</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                  Waluj Mahanagar, Chhatrapati Sambhajinagar, Maharashtra 431136, India
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                  Email: accounts@enterprenex.com &bull; Phone: +91-7020046549
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1070C8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {invoice.type}
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#111827', marginTop: '4px' }}>
                  {invoice.invoiceNumber}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' }}>
                  Date: <strong>{invoice.issueDate}</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                  Due Date: <strong>{invoice.dueDate}</strong>
                </div>
              </div>
            </div>

            {/* Billed To & State Code */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1.5rem',
                gap: '1rem',
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #f3f4f6'
              }}
            >
              <div>
                <span style={{ color: '#9ca3af', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                  Billed To (Client Details):
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginTop: '2px' }}>
                  {invoice.clientName}
                </div>
                {client?.primaryContact && (
                  <div style={{ fontSize: '0.8rem', color: '#4b5563', marginTop: '2px' }}>
                    Attn: {client.primaryContact.name} ({client.primaryContact.role}) &bull; {client.primaryContact.email}
                  </div>
                )}
                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' }}>
                  {typeof client?.billingAddress === 'object' ? client.billingAddress.fullAddress : (client?.billingAddress || client?.address || 'Corporate Office, India')}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                  Client GSTIN: <strong>{client?.gstin || '27AABCE1234M1Z2 (Registered)'}</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#9ca3af', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                  Place of Supply:
                </span>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827', marginTop: '2px' }}>
                  State Code: 27 (Maharashtra)
                </div>
                <div style={{ marginTop: '8px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      background: invoice.status === 'Paid' ? '#dcfce7' : invoice.status === 'Overdue' ? '#fee2e2' : '#fef3c7',
                      color: invoice.status === 'Paid' ? '#166534' : invoice.status === 'Overdue' ? '#991b1b' : '#92400e',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      letterSpacing: '0.03em'
                    }}
                  >
                    STATUS: {invoice.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: '#374151' }}>#</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: '#374151' }}>Deliverable Description</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#374151' }}>Qty</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#374151' }}>Rate (₹)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#374151' }}>GST Rate</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#374151' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 12px', color: '#6b7280' }}>{idx + 1}</td>
                      <td style={{ padding: '12px 12px', fontWeight: 600, color: '#111827' }}>
                        {item.description}
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center', color: '#374151' }}>{item.quantity}</td>
                      <td style={{ padding: '12px 12px', textAlign: 'right', color: '#374151' }}>₹{item.rate.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 12px', textAlign: 'right', color: '#4b5563' }}>18% (9+9)</td>
                      <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
              <div style={{ width: '320px', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#4b5563' }}>
                  <span>Taxable Subtotal:</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>₹{invoice.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#4b5563' }}>
                  <span>Central GST (CGST @ 9%):</span>
                  <span>₹{cgst.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#4b5563' }}>
                  <span>State GST (SGST @ 9%):</span>
                  <span>₹{sgst.toLocaleString('en-IN')}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderTop: '2px solid #111827',
                    fontWeight: 900,
                    fontSize: '1.15rem',
                    color: '#1070C8',
                    marginTop: '4px'
                  }}
                >
                  <span>Grand Total Payable:</span>
                  <span>₹{invoice.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#6b7280' }}>
                  (Inclusive of 18% Total Integrated GST)
                </div>
              </div>
            </div>

            {/* Bank Details & Authorization */}
            <div
              style={{
                padding: '1rem 1.25rem',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.8rem',
                color: '#334155',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <strong style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CreditCard size={14} />
                  <span>Wire Transfer / RTGS / NEFT Remittance Details:</span>
                </strong>
                <div style={{ marginTop: '4px' }}>Bank Name: <strong>HDFC Bank Ltd.</strong> &bull; Account Type: <strong>Current A/C</strong></div>
                <div>Account Number: <strong style={{ letterSpacing: '0.04em' }}>50200088991122</strong></div>
                <div>IFSC Code: <strong>HDFC0001234</strong> &bull; Branch: Waluj MIDC, Sambhajinagar</div>
                <div>UPI VPA: <strong>enterprenex@hdfcbank</strong></div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>For ENTERPRENEX SOLUTIONS PVT. LTD.</div>
                <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.85rem', color: '#2563eb', fontStyle: 'italic', fontWeight: 700 }}>
                    [Digitally Signed by Director]
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Authorized Signatory</div>
              </div>
            </div>

            {/* Terms note */}
            <div style={{ marginTop: '1rem', fontSize: '0.72rem', color: '#9ca3af', lineHeight: 1.4 }}>
              * This is a digitally verified GST Tax Invoice issued under Section 31 of CGST Act, 2017. All payments should be drawn in favor of "Enterprenex Solutions Pvt. Ltd.". In case of queries, contact accounts@enterprenex.com.
            </div>
          </div>
        </div>

        {/* ── Drawer Footer ── */}
        <div className="adm-drawer-footer">
          <button type="button" className="adm-btn adm-btn-secondary" onClick={onClose}>
            Close
          </button>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button type="button" className="adm-btn adm-btn-secondary" onClick={handlePrint}>
              <Printer size={14} />
              <span>Print / PDF</span>
            </button>

            {invoice.status !== 'Paid' && (
              <button
                type="button"
                className="adm-btn"
                onClick={() => setShowPayModal(true)}
                style={{ background: 'var(--adm-success)', color: '#fff', border: 'none', fontWeight: 700 }}
              >
                <CheckCircle2 size={14} />
                <span>Mark Paid</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Quick Mark Paid Dialog ── */}
        {showPayModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              zIndex: 1100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setShowPayModal(false)}
          >
            <div
              style={{
                background: 'var(--adm-surface)',
                border: '1px solid var(--adm-border)',
                borderRadius: '12px',
                padding: '1.5rem',
                width: '380px',
                maxWidth: '90vw'
              }}
              onClick={e => e.stopPropagation()}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--adm-text, #1a1a1a)', margin: '0 0 0.5rem 0' }}>
                Record Payment Settlement
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)', marginBottom: '1rem' }}>
                Mark invoice <strong>{invoice.invoiceNumber}</strong> (₹{invoice.totalAmount.toLocaleString('en-IN')}) as fully settled.
              </p>

              <div className="adm-form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="adm-form-label">Settlement Mode</label>
                <select
                  className="adm-select"
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value)}
                >
                  <option value="NEFT / Bank Transfer">NEFT / Bank Transfer</option>
                  <option value="RTGS Wire Transfer">RTGS Wire Transfer</option>
                  <option value="UPI / QR Payment">UPI / QR Payment</option>
                  <option value="Corporate Credit Card">Corporate Credit Card</option>
                  <option value="Cheque / DD">Cheque / Demand Draft</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="adm-btn adm-btn-secondary"
                  onClick={() => setShowPayModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="adm-btn"
                  onClick={handleConfirmPaid}
                  style={{ background: 'var(--adm-success)', color: '#fff', border: 'none', fontWeight: 700 }}
                >
                  Confirm Settlement
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
