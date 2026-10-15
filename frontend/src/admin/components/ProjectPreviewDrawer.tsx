import React, { useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Circle,
  Phone,
  Mail,
  MessageCircle,
  Users,
  Code,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Trash2,
  FileText,
  Layers,
  Clock
} from 'lucide-react';
import type { Project, ProjectStatus, Client } from '../types';

export const STAGES: ProjectStatus[] = [
  'Lead',
  'Proposal',
  'Planning',
  'Development',
  'Testing',
  'Review',
  'Delivered',
  'Maintenance'
];

interface ProjectPreviewDrawerProps {
  project: Project;
  client?: Client;
  onClose: () => void;
  onUpdateStatus: (projectId: string, status: ProjectStatus) => void;
  onToggleMilestone: (projectId: string, milestoneId: string) => void;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectPreviewDrawer: React.FC<ProjectPreviewDrawerProps> = ({
  project,
  client,
  onClose,
  onUpdateStatus,
  onToggleMilestone,
  onDeleteProject
}) => {
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
    if (rawDigits.length === 10) rawDigits = '91' + rawDigits;
    const msg = `Hi ${client?.primaryContact?.name || project.clientName}, this is the engineering delivery team from ENTERPRENEX SOLUTIONS. Regarding your project "${project.title}", we are currently in the ${project.status} stage with ${project.progress}% completed milestones. Please let us know if you would like to schedule a sprint demo.`;
    return `https://wa.me/${rawDigits}?text=${encodeURIComponent(msg)}`;
  };

  const currentStageIdx = STAGES.indexOf(project.status);
  const nextStage = currentStageIdx >= 0 && currentStageIdx < STAGES.length - 1 ? STAGES[currentStageIdx + 1] : null;

  const completedMilestones = project.milestones.filter(m => m.completed).length;

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
              <span className="adm-badge adm-badge-primary">{project.serviceCategory}</span>
              <span
                className={`adm-badge ${
                  project.priority === 'Critical'
                    ? 'adm-badge-danger'
                    : project.priority === 'High'
                    ? 'adm-badge-warning'
                    : 'adm-badge-neutral'
                }`}
              >
                {project.priority} Priority
              </span>
              <span className="adm-badge adm-badge-success" style={{ fontWeight: 700 }}>
                {project.progress}% Complete
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
              {project.title}
            </h2>

            <div style={{ fontSize: '0.82rem', color: 'var(--adm-text-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>Client: <strong style={{ color: 'var(--adm-text, #1a1a1a)' }}>{project.clientName}</strong></span>
              <span>&bull;</span>
              <span>Target Delivery: <strong style={{ color: 'var(--adm-text, #1a1a1a)' }}>{project.targetEndDate}</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              className="adm-select"
              value={project.status}
              onChange={e => onUpdateStatus(project.id, e.target.value as ProjectStatus)}
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.4rem 0.75rem',
                width: 'auto',
                borderRadius: '8px'
              }}
            >
              {STAGES.map(stage => (
                <option key={stage} value={stage}>
                  Phase: {stage}
                </option>
              ))}
            </select>

            <button className="adm-modal-close" onClick={onClose} title="Close Drawer (Esc)">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Direct Client Outreach & WhatsApp Toolbar ── */}
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
              title="Send Milestone Progress Report to Client"
            >
              <MessageCircle size={14} />
              <span>WhatsApp Progress</span>
            </a>

            <a
              href={`tel:${clientPhone}`}
              className="adm-btn adm-btn-sm adm-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Phone size={13} />
              <span>Call Client</span>
            </a>

            {clientEmail && (
              <a
                href={`mailto:${clientEmail}?subject=ENTERPRENEX%20SOLUTIONS%20-%20Project%20Status%20Update:%20${encodeURIComponent(project.title)}`}
                className="adm-btn adm-btn-sm adm-btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Mail size={13} />
                <span>Email</span>
              </a>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={13} style={{ color: 'var(--adm-text-dim)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--adm-text-dim)' }}>Sprint Start:</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--adm-text, #1a1a1a)' }}>{project.startDate}</span>
          </div>
        </div>

        {/* ── Drawer Body ── */}
        <div className="adm-drawer-body">
          {/* 8-Stage Lifecycle Stepper */}
          <div
            style={{
              padding: '1rem',
              background: 'var(--adm-surface)',
              borderRadius: '10px',
              border: '1px solid var(--adm-border)'
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.65rem' }}>
              8-Stage Lifecycle Stage Transition
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {STAGES.map(stage => {
                const isCurrent = project.status === stage;
                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => onUpdateStatus(project.id, stage)}
                    style={{
                      background: isCurrent ? 'var(--adm-primary)' : 'var(--adm-surface-alt, rgba(0, 0, 0, 0.04))',
                      color: isCurrent ? '#fff' : 'var(--adm-text-muted)',
                      border: isCurrent ? '1px solid var(--adm-primary)' : '1px solid var(--adm-border)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {stage}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Financials & Progress Stats */}
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
                <span>Contract Budget</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--adm-success)', marginTop: '4px' }}>
                ₹{project.budget.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '2px' }}>
                Expenses: ₹{project.expenses.toLocaleString('en-IN')}
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
                <span>Completion Status</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--adm-primary)', marginTop: '4px' }}>
                {project.progress}%
              </div>
              <div style={{ width: '100%', height: '5px', background: 'var(--adm-border)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${project.progress}%`,
                    height: '100%',
                    background: 'var(--adm-primary)',
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
                <Layers size={13} />
                <span>Milestones Gate</span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text, #1a1a1a)', marginTop: '4px' }}>
                {completedMilestones} / {project.milestones?.length || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '2px' }}>
                Phases Delivered
              </div>
            </div>
          </div>

          {/* Interactive Milestones & Deliverables Gate */}
          <div
            style={{
              padding: '1rem',
              background: 'var(--adm-surface)',
              borderRadius: '10px',
              border: '1px solid var(--adm-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text, #1a1a1a)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="var(--adm-success)" />
                <span>Milestones Checklist & Billing Gates</span>
              </h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>
                Click milestone to toggle completion
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(project.milestones || []).map(ms => (
                <div
                  key={ms.id}
                  onClick={() => onToggleMilestone(project.id, ms.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    background: ms.completed ? 'var(--adm-success-soft)' : 'var(--adm-surface-alt, rgba(0, 0, 0, 0.02))',
                    border: ms.completed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--adm-border)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {ms.completed ? (
                      <CheckCircle2 size={18} color="var(--adm-success)" />
                    ) : (
                      <Circle size={18} color="var(--adm-text-dim)" />
                    )}
                    <div>
                      <div
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: ms.completed ? 'var(--adm-success)' : 'var(--adm-text, #1a1a1a)',
                          textDecoration: ms.completed ? 'line-through' : 'none'
                        }}
                      >
                        {ms.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', marginTop: '2px' }}>
                        Target Date: {ms.dueDate}
                      </div>
                    </div>
                  </div>

                  {ms.amount && (
                    <div style={{ textAlign: 'right' }}>
                      <span className="adm-badge adm-badge-neutral" style={{ fontWeight: 700 }}>
                        ₹{ms.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {(!project.milestones || project.milestones.length === 0) && (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--adm-text-dim)', fontSize: '0.8rem' }}>
                  No milestones configured for this project.
                </div>
              )}
            </div>
          </div>

          {/* Assigned Squad & Tech Stack */}
          <div className="adm-grid-2" style={{ gap: '1rem' }}>
            <div
              style={{
                padding: '1rem',
                background: 'var(--adm-surface)',
                borderRadius: '10px',
                border: '1px solid var(--adm-border)'
              }}
            >
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text, #1a1a1a)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={14} />
                <span>Engineering Squad</span>
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(project.assignedTeam || []).map((mem, idx) => (
                  <span key={idx} className="adm-badge adm-badge-primary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                    {mem}
                  </span>
                ))}
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
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text, #1a1a1a)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Code size={14} />
                <span>Tech Stack Architecture</span>
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(project.techStack || []).map((t, idx) => (
                  <span key={idx} className="adm-badge adm-badge-neutral" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Scope & Description */}
          <div
            style={{
              padding: '1rem',
              background: 'var(--adm-surface)',
              borderRadius: '10px',
              border: '1px solid var(--adm-border)'
            }}
          >
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text, #1a1a1a)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} />
              <span>Project Scope & Engagement Overview</span>
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--adm-text-muted)', margin: 0, lineHeight: 1.5 }}>
              {project.description || 'Full-cycle enterprise software development engagement.'}
            </p>
          </div>
        </div>

        {/* ── Drawer Footer ── */}
        <div className="adm-drawer-footer">
          <button
            type="button"
            className="adm-btn adm-btn-sm adm-btn-danger"
            onClick={() => {
              if (window.confirm(`Delete project "${project.title}" from delivery governance?`)) {
                onDeleteProject(project.id);
                onClose();
              }
            }}
            title="Delete this project"
          >
            <Trash2 size={13} />
            <span>Delete Project</span>
          </button>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button type="button" className="adm-btn adm-btn-sm adm-btn-secondary" onClick={onClose}>
              Close
            </button>

            {nextStage && (
              <button
                type="button"
                className="adm-btn adm-btn-sm adm-btn-primary"
                onClick={() => onUpdateStatus(project.id, nextStage)}
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
