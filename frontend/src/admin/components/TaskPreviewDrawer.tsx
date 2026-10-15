import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  Square,
  CheckCircle2,
  MessageSquare,
  Send,
  MessageCircle,
  Trash2,
  Clock,
  Calendar,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import type { Task } from '../types';

interface TaskPreviewDrawerProps {
  task: Task;
  onClose: () => void;
  activeTimerTaskId: string | null;
  isTimerRunning: boolean;
  timerSeconds: number;
  formatStopwatch: (totalSecs: number) => string;
  onStartTimer: (taskId: string) => void;
  onPauseTimer: () => void;
  onStopAndLogTimer: (taskId: string) => void;
  onLogHours: (taskId: string, hours: number) => void;
  onSubmitForReview: (taskId: string) => void;
  onReviewTask: (taskId: string, decision: 'Approved' | 'Changes Required', notes?: string) => void;
  onRequestRework: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  commentInput: string;
  setCommentInput: (val: string) => void;
  onAddComment: (taskId: string) => void;
  isEmployee: boolean;
  onDeleteTask: (taskId: string) => void;
  onUpdateSelectedTask: (updated: Task) => void;
}

export const TaskPreviewDrawer: React.FC<TaskPreviewDrawerProps> = ({
  task,
  onClose,
  activeTimerTaskId,
  isTimerRunning,
  timerSeconds,
  formatStopwatch,
  onStartTimer,
  onPauseTimer,
  onStopAndLogTimer,
  onLogHours,
  onSubmitForReview,
  onReviewTask,
  onRequestRework,
  onToggleSubtask,
  commentInput,
  setCommentInput,
  onAddComment,
  isEmployee,
  onDeleteTask,
  onUpdateSelectedTask
}) => {
  const [loggedHoursInput, setLoggedHoursInput] = useState<number>(1);
  const isThisTaskTimerActive = activeTimerTaskId === task.id && isTimerRunning;
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const hoursPercentage = Math.min(100, Math.round(((task.loggedHours || 0) / (task.estimatedHours || 1)) * 100));

  const handleSubtaskClick = (stId: string) => {
    onToggleSubtask(task.id, stId);
    const updated = task.subtasks.map(s => (s.id === stId ? { ...s, completed: !s.completed } : s));
    onUpdateSelectedTask({ ...task, subtasks: updated });
  };

  const handleAddManualHours = () => {
    if (loggedHoursInput > 0) {
      onLogHours(task.id, loggedHoursInput);
      onUpdateSelectedTask({ ...task, loggedHours: (task.loggedHours || 0) + loggedHoursInput });
    }
  };

  const handleSubmitReview = () => {
    onSubmitForReview(task.id);
    onUpdateSelectedTask({ ...task, status: 'In Review' });
  };

  const handleApprove = () => {
    onReviewTask(task.id, 'Approved');
    onUpdateSelectedTask({ ...task, status: 'Done' });
  };

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
              <span className="adm-badge adm-badge-primary">{task.projectName}</span>
              <span
                className={`adm-badge ${
                  task.priority === 'Urgent'
                    ? 'adm-badge-danger'
                    : task.priority === 'High'
                    ? 'adm-badge-warning'
                    : 'adm-badge-neutral'
                }`}
              >
                {task.priority} Priority
              </span>
              <span
                className={`adm-badge ${
                  task.status === 'Done'
                    ? 'adm-badge-success'
                    : task.status === 'In Progress'
                    ? 'adm-badge-info'
                    : task.status === 'In Review'
                    ? 'adm-badge-warning'
                    : task.status === 'Changes Required'
                    ? 'adm-badge-danger'
                    : 'adm-badge-neutral'
                }`}
              >
                {task.status}
              </span>
            </div>

            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--adm-text, #1a1a1a)',
                margin: '4px 0 0 0',
                lineHeight: 1.35,
                wordBreak: 'break-word'
              }}
            >
              {task.title}
            </h2>

            <div style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)', marginTop: '4px' }}>
              Assigned to: <strong style={{ color: 'var(--adm-text, #1a1a1a)' }}>{task.assignedTo}</strong> &bull; Due Date: {task.dueDate}
            </div>
          </div>

          <button className="adm-modal-close" onClick={onClose} title="Close Drawer (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* ── Sticky Toolbar: Live Stopwatch & Quick Logging ── */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.02)',
            borderBottom: '1px solid var(--adm-border)',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>
              Logged: <strong style={{ color: 'var(--adm-text)', fontSize: '0.95rem' }}>{task.loggedHours}h</strong> / {task.estimatedHours}h
            </div>
            {isThisTaskTimerActive && (
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}
              >
                ⏱ {formatStopwatch(timerSeconds)}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {isThisTaskTimerActive ? (
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <button
                  className="adm-btn adm-btn-secondary adm-btn-sm"
                  onClick={onPauseTimer}
                  title="Pause stopwatch"
                >
                  <Pause size={12} />
                  <span>Pause</span>
                </button>
                <button
                  className="adm-btn adm-btn-sm"
                  style={{ background: '#10b981', color: '#fff', border: 'none' }}
                  onClick={() => onStopAndLogTimer(task.id)}
                  title="Stop and log recorded time"
                >
                  <Square size={11} fill="#fff" />
                  <span>Stop & Log</span>
                </button>
              </div>
            ) : (
              <button
                className="adm-btn adm-btn-primary adm-btn-sm"
                onClick={() => onStartTimer(task.id)}
                title="Start live sprint stopwatch"
              >
                <Play size={12} />
                <span>Start Stopwatch</span>
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderLeft: '1px solid var(--adm-border)', paddingLeft: '0.5rem' }}>
              <input
                type="number"
                min="0.5"
                step="0.5"
                className="adm-input"
                style={{ width: '55px', padding: '0.25rem 0.35rem', fontSize: '0.78rem' }}
                value={loggedHoursInput}
                onChange={e => setLoggedHoursInput(Number(e.target.value))}
                title="Hours to log"
              />
              <button
                className="adm-btn adm-btn-secondary adm-btn-sm"
                onClick={handleAddManualHours}
                title="Add manual hours to task"
              >
                +Log
              </button>
            </div>
          </div>
        </div>

        {/* ── Drawer Body: Screen-Adaptive Content ── */}
        <div className="adm-drawer-body" style={{ padding: '1.25rem 1.5rem', background: 'var(--adm-bg, #fafafa)' }}>
          {/* Review & Approval Status Ribbon */}
          <div
            style={{
              background:
                task.status === 'In Review'
                  ? 'rgba(245, 158, 11, 0.08)'
                  : task.status === 'Changes Required'
                  ? 'rgba(239, 68, 68, 0.08)'
                  : 'var(--adm-surface, #ffffff)',
              border: '1px solid var(--adm-border)',
              borderRadius: '12px',
              padding: '0.9rem 1.1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Sprint Review Pipeline
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--adm-text)', marginTop: '2px' }}>
                Status: <span style={{ color: 'var(--adm-primary)' }}>{task.status}</span>
              </div>
              {task.reviewNotes && (
                <div style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '3px', fontWeight: 500 }}>
                  <strong>Rework Feedback:</strong> {task.reviewNotes}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(task.status === 'In Progress' || task.status === 'Changes Required') && (
                <button
                  className="adm-btn adm-btn-sm"
                  style={{ background: '#f59e0b', color: '#fff', border: 'none', fontWeight: 700 }}
                  onClick={handleSubmitReview}
                >
                  Submit for Review 📤
                </button>
              )}

              {task.status === 'In Review' && (
                <>
                  <button
                    className="adm-btn adm-btn-sm"
                    style={{ background: '#10b981', color: '#fff', border: 'none', fontWeight: 700 }}
                    onClick={handleApprove}
                  >
                    ✓ Approve (Done)
                  </button>
                  <button
                    className="adm-btn adm-btn-sm"
                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#dc2626', border: '1px solid #ef4444', fontWeight: 700 }}
                    onClick={() => onRequestRework(task.id)}
                  >
                    ↺ Request Changes
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Hours Allocation Progress Bar */}
          <div
            style={{
              background: 'var(--adm-surface, #ffffff)',
              border: '1px solid var(--adm-border)',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--adm-text-muted)' }}>
              <span>Hours Allocation & Burn rate</span>
              <strong style={{ color: 'var(--adm-text)' }}>{hoursPercentage}% Burned</strong>
            </div>
            <div className="adm-progress-bar" style={{ height: '8px', background: 'rgba(0,0,0,0.06)' }}>
              <div
                className="adm-progress-fill"
                style={{
                  width: `${hoursPercentage}%`,
                  background: hoursPercentage > 100 ? '#ef4444' : hoursPercentage > 85 ? '#f59e0b' : '#10b981'
                }}
              />
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div
            style={{
              background: 'var(--adm-surface, #ffffff)',
              border: '1px solid var(--adm-border)',
              borderRadius: '12px',
              padding: '1rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: 'var(--adm-text)',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle2 size={15} color="#10b981" />
                Subtasks Checklist
              </h4>
              <span style={{ fontSize: '0.74rem', color: 'var(--adm-text-muted)' }}>
                {completedSubtasks} of {task.subtasks.length} Completed
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {task.subtasks.map(st => (
                <div
                  key={st.id}
                  onClick={() => handleSubtaskClick(st.id)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    background: st.completed ? 'rgba(16, 185, 129, 0.08)' : 'var(--adm-bg, #fafafa)',
                    border: '1px solid var(--adm-border)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => {}}
                    style={{ accentColor: '#10b981', cursor: 'pointer' }}
                  />
                  <span
                    style={{
                      fontSize: '0.82rem',
                      color: st.completed ? '#059669' : 'var(--adm-text)',
                      textDecoration: st.completed ? 'line-through' : 'none',
                      fontWeight: st.completed ? 500 : 600
                    }}
                  >
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Collaboration Comments Thread */}
          <div
            style={{
              background: 'var(--adm-surface, #ffffff)',
              border: '1px solid var(--adm-border)',
              borderRadius: '12px',
              padding: '1rem'
            }}
          >
            <h4
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--adm-text)',
                margin: '0 0 0.75rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MessageSquare size={15} color="#0284c7" />
              Engineering Discussion Thread ({task.comments.length})
            </h4>

            {/* Post comment input */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                className="adm-input"
                placeholder="Post technical update or review comment..."
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') onAddComment(task.id);
                }}
                style={{ fontSize: '0.82rem' }}
              />
              <button className="adm-btn adm-btn-primary" onClick={() => onAddComment(task.id)}>
                <Send size={13} />
                <span>Reply</span>
              </button>
            </div>

            {/* Comments list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {task.comments.map(c => (
                <div
                  key={c.id}
                  style={{
                    padding: '0.75rem 0.95rem',
                    background: 'var(--adm-bg, #fafafa)',
                    borderRadius: '8px',
                    border: '1px solid var(--adm-border)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--adm-text)', fontSize: '0.8rem' }}>{c.author}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--adm-text-muted)' }}>{c.createdAt}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)', margin: 0, lineHeight: 1.45 }}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Drawer Footer ── */}
        <div className="adm-drawer-footer" style={{ padding: '0.9rem 1.5rem', background: 'var(--adm-surface, #ffffff)' }}>
          <a
            href={`https://wa.me/919226860060?text=${encodeURIComponent(
              `*ENTERPRENEX TASK STATUS UPDATE*\n\n*Task:* ${task.title}\n*Assignee:* ${task.assignedTo}\n*Status:* ${task.status}\n*Project:* ${task.projectName}\n*Logged Time:* ${task.loggedHours}h / ${task.estimatedHours}h\n*Due Date:* ${task.dueDate}\n\n*Portal Link:* https://www.enterprenexsolution.com/admin/tasks`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="adm-btn adm-btn-sm"
            style={{
              background: '#25D366',
              color: '#fff',
              border: 'none',
              textDecoration: 'none',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <MessageCircle size={14} />
            <span>Share on WhatsApp</span>
          </a>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!isEmployee && (
              <button
                className="adm-btn adm-btn-danger adm-btn-sm"
                onClick={() => {
                  onDeleteTask(task.id);
                  onClose();
                }}
              >
                <Trash2 size={13} />
                <span>Delete Task</span>
              </button>
            )}
            <button className="adm-btn adm-btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TaskPreviewDrawer;
