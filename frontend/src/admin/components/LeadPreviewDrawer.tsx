import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  User,
  Building,
  DollarSign,
  TrendingUp,
  Clock,
  Send,
  Trash2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import type { Lead, LeadStatus, LeadActivity } from '../types';

export const CRM_STAGES: LeadStatus[] = [
  'New Lead',
  'Contacted',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Won',
  'Lost'
];

interface LeadPreviewDrawerProps {
  lead: Lead;
  onClose: () => void;
  onUpdateStatus: (leadId: string, status: LeadStatus) => void;
  onUpdateLead?: (leadId: string, updates: Partial<Lead>) => void;
  onLogActivity: (leadId: string, type: 'Call' | 'Meeting' | 'Email' | 'Note', summary: string) => void;
  onDeleteLead: (leadId: string) => void;
}

export const LeadPreviewDrawer: React.FC<LeadPreviewDrawerProps> = ({
  lead,
  onClose,
  onUpdateStatus,
  onUpdateLead,
  onLogActivity,
  onDeleteLead
}) => {
  const [actType, setActType] = useState<'Call' | 'Meeting' | 'Email' | 'Note'>('Call');
  const [actSummary, setActSummary] = useState('');
  const [nextFollowUp, setNextFollowUp] = useState(lead.nextFollowUpDate || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(lead.notes || '');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Sync state if lead prop changes
  useEffect(() => {
    setNextFollowUp(lead.nextFollowUpDate || '');
    setNotesDraft(lead.notes || '');
  }, [lead]);

  // Clean phone number for WhatsApp
  const getWhatsAppLink = () => {
    let rawDigits = (lead.phone || '').replace(/\D/g, '');
    if (!rawDigits) return '#';
    // If 10 digits (standard Indian number), prefix 91
    if (rawDigits.length === 10) {
      rawDigits = '91' + rawDigits;
    }
    const msg = `Hi ${lead.name}, this is ${lead.assignedSalesperson || 'the sales team'} from ENTERPRENEX SOLUTIONS. Regarding your requirement for ${lead.serviceInterested}, I would love to connect and share our tailored scope of work & proposal. When would be a good time to connect?`;
    return `https://wa.me/${rawDigits}?text=${encodeURIComponent(msg)}`;
  };

  const handleLogSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!actSummary.trim()) return;
    onLogActivity(lead.id, actType, actSummary.trim());
    setActSummary('');
  };

  const handleFollowUpChange = (newDate: string) => {
    setNextFollowUp(newDate);
    if (onUpdateLead) {
      onUpdateLead(lead.id, { nextFollowUpDate: newDate });
    }
  };

  const handleSaveNotes = () => {
    if (onUpdateLead) {
      onUpdateLead(lead.id, { notes: notesDraft });
    }
    setIsEditingNotes(false);
  };

  const currentStageIdx = CRM_STAGES.indexOf(lead.status);
  const nextStage = currentStageIdx >= 0 && currentStageIdx < CRM_STAGES.length - 1 ? CRM_STAGES[currentStageIdx + 1] : null;

  return (
    <div className="adm-drawer-overlay" onClick={onClose}>
      <div
        className="adm-preview-drawer"
        onClick={e => e.stopPropagation()}
        style={{ width: 'clamp(440px, 56vw, 860px)' }}
      >
        {/* ── Drawer Header ── */}
        <div className="adm-drawer-header">
          <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span className="adm-badge adm-badge-primary">{lead.serviceInterested}</span>
              <span className="adm-badge adm-badge-neutral">{lead.source}</span>
              <span
                className={`adm-badge ${
                  lead.status === 'Won'
                    ? 'adm-badge-success'
                    : lead.status === 'Lost'
                    ? 'adm-badge-danger'
                    : 'adm-badge-warning'
                }`}
              >
                {lead.status}
              </span>
              <span className="adm-badge adm-badge-info" style={{ fontWeight: 700 }}>
                {lead.probability}% Prob
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
              {lead.company}
            </h2>

            <div style={{ fontSize: '0.82rem', color: 'var(--adm-text-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>Contact: <strong style={{ color: 'var(--adm-text, #1a1a1a)' }}>{lead.name}</strong></span>
              <span>&bull;</span>
              <span>Rep: <strong style={{ color: 'var(--adm-text, #1a1a1a)' }}>{lead.assignedSalesperson}</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              className="adm-select"
              value={lead.status}
              onChange={e => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.4rem 0.75rem',
                width: 'auto',
                borderRadius: '8px'
              }}
            >
              {CRM_STAGES.map(stage => (
                <option key={stage} value={stage}>
                  Stage: {stage}
                </option>
              ))}
            </select>

            <button className="adm-modal-close" onClick={onClose} title="Close Drawer (Esc)">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Direct Outreach & Action Bar ── */}
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
              title="Open WhatsApp chat with pre-filled message"
            >
              <MessageCircle size={14} />
              <span>WhatsApp Prospect</span>
            </a>

            <a
              href={`tel:${lead.phone}`}
              className="adm-btn adm-btn-sm adm-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Phone size={13} />
              <span>Call ({lead.phone})</span>
            </a>

            <a
              href={`mailto:${lead.email}?subject=ENTERPRENEX%20SOLUTIONS%20-%20${encodeURIComponent(lead.serviceInterested)}%20Proposal`}
              className="adm-btn adm-btn-sm adm-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Mail size={13} />
              <span>Email</span>
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={13} style={{ color: 'var(--adm-text-dim)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--adm-text-dim)' }}>Next Follow-up:</span>
            <input
              type="date"
              className="adm-input"
              value={nextFollowUp}
              onChange={e => handleFollowUpChange(e.target.value)}
              style={{ fontSize: '0.75rem', padding: '2px 6px', height: 'auto', width: 'auto' }}
            />
          </div>
        </div>

        {/* ── Drawer Body ── */}
        <div className="adm-drawer-body">
          {/* Key Metrics / Financials */}
          <div className="adm-grid-3">
            <div
              style={{
                padding: '1rem',
                background: 'var(--adm-surface)',
                borderRadius: '10px',
                border: '1px solid var(--adm-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--adm-text-dim)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                <DollarSign size={13} />
                <span>Deal Value</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--adm-success)', marginTop: '4px' }}>
                ₹{lead.estimatedValue.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '2px' }}>
                ≈ ₹{(lead.estimatedValue / 100000).toFixed(2)} Lakhs
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                background: 'var(--adm-surface)',
                borderRadius: '10px',
                border: '1px solid var(--adm-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--adm-text-dim)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                <TrendingUp size={13} />
                <span>Win Probability</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: lead.probability >= 70 ? 'var(--adm-success)' : lead.probability >= 40 ? 'var(--adm-primary)' : 'var(--adm-warning)', marginTop: '4px' }}>
                {lead.probability}%
              </div>
              {/* Progress bar */}
              <div style={{ width: '100%', height: '5px', background: 'var(--adm-border)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${lead.probability}%`,
                    height: '100%',
                    background: lead.probability >= 70 ? 'var(--adm-success)' : lead.probability >= 40 ? 'var(--adm-primary)' : 'var(--adm-warning)',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                background: 'var(--adm-surface)',
                borderRadius: '10px',
                border: '1px solid var(--adm-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--adm-text-dim)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                <Calendar size={13} />
                <span>Created Date</span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--adm-text, #1a1a1a)', marginTop: '4px' }}>
                {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '2px' }}>
                Via {lead.source}
              </div>
            </div>
          </div>

          {/* Client & Enterprise Details */}
          <div
            style={{
              padding: '1rem',
              background: 'var(--adm-surface)',
              borderRadius: '10px',
              border: '1px solid var(--adm-border)'
            }}
          >
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text, #1a1a1a)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building size={14} />
              <span>Contact & Enterprise Profile</span>
            </h4>

            <div className="adm-grid-2" style={{ gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase' }}>Client Name</span>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--adm-text, #1a1a1a)' }}>{lead.name}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase' }}>Company / Organization</span>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--adm-text, #1a1a1a)' }}>{lead.company}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase' }}>Email Address</span>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--adm-primary)' }}>{lead.email}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase' }}>Direct Phone / WhatsApp</span>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--adm-text, #1a1a1a)' }}>{lead.phone}</div>
              </div>
            </div>
          </div>

          {/* Discovery Notes */}
          <div
            style={{
              padding: '1rem',
              background: 'var(--adm-surface)',
              borderRadius: '10px',
              border: '1px solid var(--adm-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text, #1a1a1a)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} />
                <span>Discovery Notes & Scope Discussion</span>
              </h4>
              {!isEditingNotes ? (
                <button
                  type="button"
                  onClick={() => setIsEditingNotes(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--adm-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Edit Notes
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => { setIsEditingNotes(false); setNotesDraft(lead.notes || ''); }}
                    className="adm-btn adm-btn-sm adm-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="adm-btn adm-btn-sm adm-btn-primary"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {!isEditingNotes ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--adm-text-muted)', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                {lead.notes || 'No notes entered yet. Click "Edit Notes" to record discovery points.'}
              </p>
            ) : (
              <textarea
                className="adm-textarea"
                rows={3}
                value={notesDraft}
                onChange={e => setNotesDraft(e.target.value)}
                placeholder="Enter client pain points, budget flexibility, timeline..."
                style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}
              />
            )}
          </div>

          {/* Activity Logs & Touchpoint Logger */}
          <div
            style={{
              padding: '1rem',
              background: 'var(--adm-surface)',
              borderRadius: '10px',
              border: '1px solid var(--adm-border)'
            }}
          >
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text, #1a1a1a)', margin: '0 0 0.75rem 0' }}>
              Touchpoint & Interaction History ({lead.activities?.length || 0})
            </h4>

            {/* Quick logger */}
            <form onSubmit={handleLogSubmit} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                {(['Call', 'Meeting', 'Email', 'Note'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActType(t)}
                    style={{
                      background: actType === t ? 'var(--adm-primary)' : 'var(--adm-surface-alt, rgba(0, 0, 0, 0.05))',
                      color: actType === t ? '#fff' : 'var(--adm-text-muted)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  className="adm-input"
                  placeholder={`Log details for ${actType} with client...`}
                  value={actSummary}
                  onChange={e => setActSummary(e.target.value)}
                  style={{ flex: 1, fontSize: '0.82rem' }}
                />
                <button type="submit" className="adm-btn adm-btn-primary" style={{ padding: '0 1rem' }}>
                  <Send size={14} />
                  <span>Log</span>
                </button>
              </div>
            </form>

            {/* Activity Timeline List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {(lead.activities || []).map((act: LeadActivity, idx: number) => (
                <div
                  key={act.id || idx}
                  style={{
                    padding: '0.75rem',
                    background: 'var(--adm-surface-alt, rgba(0, 0, 0, 0.02))',
                    borderRadius: '8px',
                    border: '1px solid var(--adm-border)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="adm-badge adm-badge-primary" style={{ fontSize: '0.68rem' }}>{act.type}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>
                      {act.date} {act.author ? `• by ${act.author}` : ''}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--adm-text, #1a1a1a)', lineHeight: 1.4 }}>
                    {act.summary}
                  </div>
                </div>
              ))}

              {(!lead.activities || lead.activities.length === 0) && (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--adm-text-dim)', fontSize: '0.8rem' }}>
                  No interaction history recorded yet. Use the logger above to log calls or meetings.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Drawer Footer ── */}
        <div className="adm-drawer-footer">
          <button
            type="button"
            className="adm-btn adm-btn-sm adm-btn-danger"
            onClick={() => {
              if (window.confirm(`Delete lead "${lead.company}" from CRM pipeline?`)) {
                onDeleteLead(lead.id);
                onClose();
              }
            }}
            title="Delete this opportunity"
          >
            <Trash2 size={13} />
            <span>Delete Lead</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {lead.status !== 'Won' && (
              <button
                type="button"
                className="adm-btn adm-btn-sm"
                onClick={() => onUpdateStatus(lead.id, 'Won')}
                style={{
                  background: 'var(--adm-success)',
                  color: '#fff',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCircle2 size={13} />
                <span>Mark Won</span>
              </button>
            )}

            {lead.status !== 'Lost' && (
              <button
                type="button"
                className="adm-btn adm-btn-sm adm-btn-secondary"
                onClick={() => onUpdateStatus(lead.id, 'Lost')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <XCircle size={13} />
                <span>Mark Lost</span>
              </button>
            )}

            {nextStage && (
              <button
                type="button"
                className="adm-btn adm-btn-sm adm-btn-primary"
                onClick={() => onUpdateStatus(lead.id, nextStage)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Advance to {nextStage}</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
