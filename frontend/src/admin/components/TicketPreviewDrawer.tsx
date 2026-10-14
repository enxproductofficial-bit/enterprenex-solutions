import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  Mail,
  Send,
  CheckCircle2,
  Clock
} from 'lucide-react';
import type { SupportTicket } from '../types';

interface TicketPreviewDrawerProps {
  ticket: SupportTicket;
  onClose: () => void;
  onReply: (ticketId: string, text: string) => void;
  onUpdateStatus: (ticketId: string, status: 'Open' | 'In Progress' | 'Resolved' | 'Closed') => void;
  isEmployee: boolean;
  getWhatsAppUrl: (ticket: SupportTicket) => string;
  getEmailUrl: (ticket: SupportTicket) => string;
}

export const TicketPreviewDrawer: React.FC<TicketPreviewDrawerProps> = ({
  ticket,
  onClose,
  onReply,
  onUpdateStatus,
  isEmployee,
  getWhatsAppUrl,
  getEmailUrl
}) => {
  const [replyText, setReplyText] = useState('');
  const [status, setStatus] = useState(ticket.status);

  const handleSend = () => {
    if (!replyText.trim()) return;
    onReply(ticket.id, replyText.trim());
    setReplyText('');
  };

  const handleStatusChange = (newStatus: 'Open' | 'In Progress' | 'Resolved' | 'Closed') => {
    setStatus(newStatus);
    onUpdateStatus(ticket.id, newStatus);
  };

  return (
    <div className="adm-drawer-overlay" onClick={onClose}>
      <div className="adm-preview-drawer" onClick={e => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="adm-drawer-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span className="adm-badge adm-badge-primary">{ticket.ticketNumber}</span>
              <span className="adm-badge adm-badge-neutral">{ticket.category}</span>
              <span
                className={`adm-badge ${
                  ticket.priority === 'Critical'
                    ? 'adm-badge-danger'
                    : ticket.priority === 'High'
                    ? 'adm-badge-warning'
                    : 'adm-badge-neutral'
                }`}
              >
                {ticket.priority} Priority
              </span>
              <span
                className={`adm-badge ${
                  status === 'Resolved'
                    ? 'adm-badge-success'
                    : status === 'In Progress'
                    ? 'adm-badge-warning'
                    : 'adm-badge-neutral'
                }`}
              >
                {status}
              </span>
            </div>

            <h2
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--adm-text, #1a1a1a)',
                margin: '4px 0 0 0',
                lineHeight: 1.35,
                wordBreak: 'break-word'
              }}
            >
              {ticket.subject}
            </h2>

            <div style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)', marginTop: '4px' }}>
              Requester: <strong style={{ color: 'var(--adm-text, #1a1a1a)' }}>{ticket.clientName}</strong> &bull; Opened: {ticket.createdAt}
            </div>
          </div>

          <button className="adm-modal-close" onClick={onClose} title="Close Preview (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="adm-drawer-body">
          {/* Quick Dispatch Action Bar */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              padding: '0.75rem',
              background: 'var(--adm-bg, #f8f8f9)',
              borderRadius: '10px',
              border: '1px solid var(--adm-border, rgba(0, 0, 0, 0.06))',
              flexDirection: 'column'
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--adm-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Instant Action & Dispatch
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <a
                href={getWhatsAppUrl(ticket)}
                target="_blank"
                rel="noopener noreferrer"
                className="adm-btn adm-btn-sm"
                style={{
                  background: '#25D366',
                  color: '#fff',
                  border: 'none',
                  textDecoration: 'none',
                  fontWeight: 600,
                  flex: 1,
                  minWidth: '180px',
                  justifyContent: 'center'
                }}
              >
                <MessageCircle size={14} />
                <span>WhatsApp (+91-9226860060)</span>
              </a>
              <a
                href={getEmailUrl(ticket)}
                className="adm-btn adm-btn-sm adm-btn-secondary"
                style={{
                  textDecoration: 'none',
                  fontWeight: 600,
                  flex: 1,
                  minWidth: '180px',
                  justifyContent: 'center'
                }}
              >
                <Mail size={14} color="var(--adm-primary)" />
                <span>Email Support</span>
              </a>
            </div>
          </div>

          {/* Ticket Metadata Grid */}
          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'var(--adm-bg, #f8f8f9)',
              borderRadius: '10px',
              border: '1px solid var(--adm-border, rgba(0, 0, 0, 0.06))',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.75rem'
            }}
          >
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                Requester Email
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--adm-text, #1a1a1a)', wordBreak: 'break-all' }}>
                {ticket.clientEmail || 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                Assigned Staff
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--adm-text, #1a1a1a)' }}>
                {ticket.assignedTo || 'Unassigned'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                SLA Status
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: status === 'Resolved' ? '#12c990' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {status === 'Resolved' ? (
                  <>
                    <CheckCircle2 size={13} />
                    <span>Resolved in SLA</span>
                  </>
                ) : (
                  <>
                    <Clock size={13} />
                    <span>{ticket.slaHoursRemaining}h remaining</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Discussion Thread */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--adm-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Conversation Thread ({ticket.messages?.length || 0})
            </div>
            <div
              style={{
                flex: 1,
                minHeight: '180px',
                maxHeight: '340px',
                overflowY: 'auto',
                background: 'var(--adm-bg, #f8f8f9)',
                padding: '0.85rem',
                borderRadius: '10px',
                border: '1px solid var(--adm-border, rgba(0, 0, 0, 0.06))',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              {!ticket.messages || ticket.messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--adm-text-dim)', fontSize: '0.82rem' }}>
                  No messages logged in this thread yet. Write below to update.
                </div>
              ) : (
                ticket.messages.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: msg.isClient ? 'flex-start' : 'flex-end',
                      maxWidth: '85%',
                      background: msg.isClient ? 'var(--adm-surface, #ffffff)' : '#1a1a1a',
                      color: msg.isClient ? 'var(--adm-text, #1a1a1a)' : '#ffffff',
                      border: msg.isClient ? '1px solid var(--adm-border, rgba(0,0,0,0.06))' : 'none',
                      borderRadius: '12px',
                      padding: '0.65rem 0.85rem',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.68rem',
                        color: msg.isClient ? 'var(--adm-text-dim)' : 'rgba(255,255,255,0.7)',
                        fontWeight: 600,
                        marginBottom: '3px',
                        gap: '1rem'
                      }}
                    >
                      <span>{msg.sender}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', margin: 0, lineHeight: 1.45, wordBreak: 'break-word' }}>
                      {msg.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reply Input Box */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
            <input
              type="text"
              className="adm-input"
              placeholder={isEmployee ? 'Write message for HR / Support...' : 'Type reply to ticket requester...'}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSend();
              }}
            />
            <button className="adm-btn adm-btn-primary" onClick={handleSend}>
              <Send size={14} />
              <span>Send</span>
            </button>
          </div>
        </div>

        {/* Drawer Footer with Quick Status Changes */}
        <div className="adm-drawer-footer">
          {!isEmployee && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className="adm-btn adm-btn-sm adm-btn-secondary"
                onClick={() => handleStatusChange('In Progress')}
                style={{ fontWeight: status === 'In Progress' ? 700 : 500 }}
              >
                In Progress
              </button>
              <button
                className="adm-btn adm-btn-sm"
                onClick={() => handleStatusChange('Resolved')}
                style={{
                  background: status === 'Resolved' ? 'rgba(18, 201, 144, 0.2)' : 'rgba(18, 201, 144, 0.1)',
                  color: '#0b9e71',
                  border: '1px solid rgba(18, 201, 144, 0.3)',
                  fontWeight: 700,
                  gap: '4px'
                }}
              >
                <CheckCircle2 size={13} />
                <span>Mark Resolved</span>
              </button>
            </div>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <button className="adm-btn adm-btn-secondary adm-btn-sm" onClick={onClose}>
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPreviewDrawer;
