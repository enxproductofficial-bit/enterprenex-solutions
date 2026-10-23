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
  Edit,
  Clock,
  Calendar,
  User,
  ShieldCheck,
  Paperclip,
  CheckSquare,
  AlertTriangle,
  FolderGit2,
  Layers,
  Plus
} from 'lucide-react';
import type { Task, TaskColumn } from '../types';

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
  onEditTask?: (task: Task) => void;
  onUpdateTaskStatus?: (taskId: string, status: TaskColumn) => void;
}

const NINE_STAGE_LIFECYCLE: { stage: TaskColumn; label: string; color: string }[] = [
  { stage: 'Backlog', label: '1. Backlog', color: '#64748b' },
  { stage: 'To Do', label: '2. To Do', color: '#0284c7' },
  { stage: 'In Progress', label: '3. In Progress', color: '#3b82f6' },
  { stage: 'Blocked', label: '4. Blocked', color: '#ef4444' },
  { stage: 'In Review', label: '5. In Review', color: '#f59e0b' },
  { stage: 'Revision Required', label: '6. Revision Req.', color: '#dc2626' },
  { stage: 'Approved', label: '7. Approved', color: '#10b981' },
  { stage: 'Completed', label: '8. Completed', color: '#059669' },
  { stage: 'Cancelled', label: '9. Cancelled', color: '#94a3b8' }
];

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
  onUpdateSelectedTask,
  onEditTask,
  onUpdateTaskStatus
}) => {
  const [loggedHoursInput, setLoggedHoursInput] = useState<number>(1);
  const [showAttachmentInput, setShowAttachmentInput] = useState(false);
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');

  // Employee specific action modals
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionDate, setExtensionDate] = useState('');
  const [extensionReason, setExtensionReason] = useState('');

  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [blockerReason, setBlockerReason] = useState('');

  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [clarificationQuestion, setClarificationQuestion] = useState('');

  const isThisTaskTimerActive = activeTimerTaskId === task.id && isTimerRunning;
  const safeSubtasks = task.subtasks || [];
  const completedSubtasks = safeSubtasks.filter(s => s.completed).length;
  const hoursPercentage = Math.min(100, Math.round(((task.loggedHours || 0) / (task.estimatedHours || 1)) * 100));

  const safeAcceptanceCriteria = task.acceptanceCriteria || [];
  const completedCriteria = safeAcceptanceCriteria.filter(c => c.met).length;

  const handleSubtaskClick = (stId: string) => {
    onToggleSubtask(task.id, stId);
    const updated = safeSubtasks.map(s => (s.id === stId ? { ...s, completed: !s.completed } : s));
    onUpdateSelectedTask({ ...task, subtasks: updated });
  };

  const handleToggleCriteria = (cId: string) => {
    const updated = safeAcceptanceCriteria.map(c => (c.id === cId ? { ...c, met: !c.met } : c));
    const nextTask = { ...task, acceptanceCriteria: updated };
    onUpdateSelectedTask(nextTask);
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
    onUpdateSelectedTask({ ...task, status: 'Approved' });
  };

  const handleStatusChange = (newStatus: TaskColumn) => {
    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(task.id, newStatus);
    }
    onUpdateSelectedTask({ ...task, status: newStatus });
  };

  const handleAcknowledge = () => {
    handleStatusChange('In Progress');
    const comment = {
      id: 'c-' + Date.now(),
      taskId: task.id,
      author: task.assignedTo || 'Employee',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      text: '✓ Task assignment acknowledged and work initiated.',
      createdAt: new Date().toISOString().split('T')[0]
    };
    onUpdateSelectedTask({ ...task, status: 'In Progress', comments: [...(task.comments || []), comment] });
  };

  const handleReportBlocker = () => {
    if (!blockerReason.trim()) return;
    const comment = {
      id: 'c-' + Date.now(),
      taskId: task.id,
      author: task.assignedTo || 'Employee',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      text: `⚠️ BLOCKER ESCALATION: ${blockerReason.trim()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    handleStatusChange('Blocked');
    onUpdateSelectedTask({
      ...task,
      status: 'Blocked',
      reviewNotes: `⚠️ BLOCKER: ${blockerReason.trim()}`,
      comments: [...(task.comments || []), comment]
    });
    setBlockerReason('');
    setShowBlockerModal(false);
  };

  const handleRequestExtension = () => {
    if (!extensionDate || !extensionReason.trim()) return;
    const comment = {
      id: 'c-' + Date.now(),
      taskId: task.id,
      author: task.assignedTo || 'Employee',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      text: `⏳ DEADLINE EXTENSION REQUESTED: Proposed new date ${extensionDate}. Reason: ${extensionReason.trim()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    onUpdateSelectedTask({
      ...task,
      comments: [...(task.comments || []), comment]
    });
    setExtensionDate('');
    setExtensionReason('');
    setShowExtensionModal(false);
  };

  const handleRequestClarification = () => {
    if (!clarificationQuestion.trim()) return;
    const comment = {
      id: 'c-' + Date.now(),
      taskId: task.id,
      author: task.assignedTo || 'Employee',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      text: `❓ CLARIFICATION REQUEST for @${task.reviewer || 'Manager'}: ${clarificationQuestion.trim()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    onUpdateSelectedTask({
      ...task,
      comments: [...(task.comments || []), comment]
    });
    setClarificationQuestion('');
    setShowClarificationModal(false);
  };

  const handleAddAttachment = () => {
    if (!newAttachmentName.trim()) return;
    const newAtt = {
      id: 'att-' + Date.now(),
      name: newAttachmentName.trim(),
      url: newAttachmentUrl.trim() || '#',
      size: 'Document File',
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    const updatedAttachments = [...(task.attachments || []), newAtt];
    onUpdateSelectedTask({ ...task, attachments: updatedAttachments });
    setNewAttachmentName('');
    setNewAttachmentUrl('');
    setShowAttachmentInput(false);
  };

  const getStatusBadgeClass = (status: TaskColumn) => {
    switch (status) {
      case 'Completed':
      case 'Done':
      case 'Approved':
        return 'adm-badge-success';
      case 'In Progress':
        return 'adm-badge-info';
      case 'In Review':
        return 'adm-badge-warning';
      case 'Revision Required':
      case 'Changes Required':
      case 'Blocked':
        return 'adm-badge-danger';
      case 'To Do':
      case 'Assigned':
        return 'adm-badge-primary';
      default:
        return 'adm-badge-neutral';
    }
  };

  return (
    <div className="adm-drawer-overlay" onClick={onClose}>
      <div
        className="adm-preview-drawer"
        onClick={e => e.stopPropagation()}
        style={{ width: 'clamp(460px, 62vw, 920px)' }}
      >
        {/* ── Drawer Header: 18-Field Section 10 Specification ── */}
        <div className="adm-drawer-header">
          <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
            {/* Top Tag Bar */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
              {/* Field 1: Task ID */}
              <span
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(255, 107, 0, 0.12)',
                  color: 'var(--adm-primary, #ff6b00)',
                  border: '1px solid rgba(255, 107, 0, 0.3)'
                }}
              >
                {task.taskId || task.id}
              </span>

              {/* Field 4: Associated Project */}
              <span className="adm-badge adm-badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <FolderGit2 size={12} />
                {task.projectName}
              </span>

              {/* Field 5: Module */}
              <span
                className="adm-badge adm-badge-neutral"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="System Module"
              >
                <Layers size={12} />
                {task.module || 'Core Module'}
              </span>

              {/* Field 9: Priority */}
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

              {/* Field 10: Status (9-Stage Lifecycle) */}
              <span className={`adm-badge ${getStatusBadgeClass(task.status)}`}>
                ● {task.status}
              </span>
            </div>

            {/* Field 2: Task Title */}
            <h2
              style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                color: 'var(--adm-text, #1a1a1a)',
                margin: '4px 0 0 0',
                lineHeight: 1.35,
                wordBreak: 'break-word'
              }}
            >
              {task.title}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onEditTask && (
              <button
                className="adm-btn adm-btn-secondary adm-btn-sm"
                onClick={() => onEditTask(task)}
                title="Edit all 18 Task fields"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Edit size={14} />
                <span>Edit Task</span>
              </button>
            )}
            <button className="adm-modal-close" onClick={onClose} title="Close Drawer (Esc)">
              <X size={18} />
            </button>
          </div>
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
            <div style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)' }}>
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
        <div className="adm-drawer-body" style={{ padding: '1.25rem 1.5rem', background: 'var(--adm-bg, #fafafa)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* ── SECTION 10 LIFECYCLE CONTROLS: 9-STAGE PROGRESSION ── */}
          <div
            style={{
              background: 'var(--adm-surface, #ffffff)',
              border: '1px solid var(--adm-border)',
              borderRadius: '12px',
              padding: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--adm-text-muted)' }}>
                  EWMS 9-Stage Lifecycle Pipeline (Section 10)
                </span>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--adm-text)', marginTop: '2px' }}>
                  Current Stage: <span style={{ color: 'var(--adm-primary)' }}>{task.status}</span>
                </div>
              </div>

              {/* Status Jump Dropdown (Scoped by Role) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>Move Stage:</span>
                <select
                  className="adm-select"
                  value={task.status}
                  onChange={e => handleStatusChange(e.target.value as TaskColumn)}
                  style={{ fontSize: '0.78rem', padding: '0.3rem 0.5rem', fontWeight: 700 }}
                >
                  {NINE_STAGE_LIFECYCLE.filter(item => {
                    // Employees cannot self-approve or self-complete tasks
                    if (isEmployee && (item.stage === 'Approved' || item.stage === 'Completed')) return false;
                    return true;
                  }).map(item => (
                    <option key={item.stage} value={item.stage}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Action Ribbon */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem', alignItems: 'center' }}>
              {/* Employee: Accept or acknowledge assignment */}
              {task.status === 'To Do' && (
                <button
                  className="adm-btn adm-btn-primary adm-btn-sm"
                  onClick={handleAcknowledge}
                  style={{ fontWeight: 700 }}
                >
                  ✓ Accept & Acknowledge
                </button>
              )}

              {/* Submit for Review */}
              {(task.status === 'In Progress' || task.status === 'Changes Required' || task.status === 'Revision Required') && (
                <button
                  className="adm-btn adm-btn-sm"
                  style={{ background: '#f59e0b', color: '#fff', border: 'none', fontWeight: 700 }}
                  onClick={handleSubmitReview}
                >
                  Submit for Review 📤
                </button>
              )}

              {/* Reviewer / Manager Approval (RBAC: Strictly hidden for general employees) */}
              {task.status === 'In Review' && (
                !isEmployee ? (
                  <>
                    <button
                      className="adm-btn adm-btn-sm"
                      style={{ background: '#10b981', color: '#fff', border: 'none', fontWeight: 700 }}
                      onClick={handleApprove}
                    >
                      ✓ Approve (Verified)
                    </button>
                    <button
                      className="adm-btn adm-btn-sm"
                      style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#dc2626', border: '1px solid #ef4444', fontWeight: 700 }}
                      onClick={() => onRequestRework(task.id)}
                    >
                      ↺ Request Revision
                    </button>
                  </>
                ) : (
                  <span className="adm-badge adm-badge-warning" style={{ fontSize: '0.78rem', padding: '4px 8px' }}>
                    ⏳ Submitted — Awaiting Manager / Reviewer Verification
                  </span>
                )
              )}

              {task.status === 'Approved' && (
                !isEmployee ? (
                  <button
                    className="adm-btn adm-btn-sm"
                    style={{ background: '#059669', color: '#fff', border: 'none', fontWeight: 700 }}
                    onClick={() => handleStatusChange('Completed')}
                  >
                    Mark Completed 🚀
                  </button>
                ) : (
                  <span className="adm-badge adm-badge-success" style={{ fontSize: '0.78rem', padding: '4px 8px' }}>
                    ✓ Task Verified & Approved by {task.reviewer || 'Manager'}
                  </span>
                )
              )}

              {/* Report Blocker */}
              {task.status !== 'Blocked' && task.status !== 'Completed' && task.status !== 'Cancelled' && (
                <button
                  className="adm-btn adm-btn-secondary adm-btn-sm"
                  onClick={() => setShowBlockerModal(!showBlockerModal)}
                  style={{ color: '#dc2626', borderColor: 'rgba(220, 38, 38, 0.3)' }}
                >
                  <AlertTriangle size={12} />
                  <span>Report Blocker</span>
                </button>
              )}

              {task.status === 'Blocked' && (
                <button
                  className="adm-btn adm-btn-primary adm-btn-sm"
                  onClick={() => handleStatusChange('In Progress')}
                >
                  Unblock & Resume (In Progress)
                </button>
              )}

              {/* Request Deadline Extension */}
              {task.status !== 'Completed' && task.status !== 'Cancelled' && (
                <button
                  className="adm-btn adm-btn-secondary adm-btn-sm"
                  onClick={() => setShowExtensionModal(!showExtensionModal)}
                  title="Request deadline extension from manager"
                >
                  <Clock size={12} />
                  <span>Request Extension</span>
                </button>
              )}

              {/* Request Clarification */}
              {task.status !== 'Completed' && (
                <button
                  className="adm-btn adm-btn-secondary adm-btn-sm"
                  onClick={() => setShowClarificationModal(!showClarificationModal)}
                  title="Request clarification from reviewer/manager"
                >
                  <MessageSquare size={12} />
                  <span>Clarification</span>
                </button>
              )}
            </div>

            {/* Modal Card: Report Blocker */}
            {showBlockerModal && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  marginTop: '0.75rem'
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#dc2626', marginBottom: '6px' }}>
                  ⚠️ Escalate Project Blocker to Manager & Reviewer
                </div>
                <textarea
                  className="adm-input"
                  rows={2}
                  placeholder="Describe technical impediment, third-party dependency failure, or missing requirement..."
                  value={blockerReason}
                  onChange={e => setBlockerReason(e.target.value)}
                  style={{ width: '100%', fontSize: '0.82rem', marginBottom: '8px' }}
                />
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  <button
                    className="adm-btn adm-btn-secondary adm-btn-sm"
                    onClick={() => setShowBlockerModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="adm-btn adm-btn-danger adm-btn-sm"
                    onClick={handleReportBlocker}
                  >
                    Submit Blocker Escalation
                  </button>
                </div>
              </div>
            )}

            {/* Modal Card: Request Deadline Extension */}
            {showExtensionModal && (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  marginTop: '0.75rem'
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#d97706', marginBottom: '6px' }}>
                  ⏳ Request Deadline Extension
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="date"
                    className="adm-input"
                    value={extensionDate}
                    onChange={e => setExtensionDate(e.target.value)}
                    style={{ fontSize: '0.82rem', flex: 1, minWidth: '150px' }}
                  />
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="Justification (e.g. Scope expansion, API refactor)"
                    value={extensionReason}
                    onChange={e => setExtensionReason(e.target.value)}
                    style={{ fontSize: '0.82rem', flex: 2, minWidth: '200px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  <button
                    className="adm-btn adm-btn-secondary adm-btn-sm"
                    onClick={() => setShowExtensionModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="adm-btn adm-btn-primary adm-btn-sm"
                    onClick={handleRequestExtension}
                  >
                    Send Extension Request
                  </button>
                </div>
              </div>
            )}

            {/* Modal Card: Request Clarification */}
            {showClarificationModal && (
              <div
                style={{
                  background: 'rgba(2, 132, 199, 0.08)',
                  border: '1px solid rgba(2, 132, 199, 0.3)',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  marginTop: '0.75rem'
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7', marginBottom: '6px' }}>
                  ❓ Request Clarification from {task.reviewer || 'Reporting Manager'}
                </div>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="Ask specific clarification question regarding specs or acceptance criteria..."
                  value={clarificationQuestion}
                  onChange={e => setClarificationQuestion(e.target.value)}
                  style={{ width: '100%', fontSize: '0.82rem', marginBottom: '8px' }}
                />
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  <button
                    className="adm-btn adm-btn-secondary adm-btn-sm"
                    onClick={() => setShowClarificationModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="adm-btn adm-btn-primary adm-btn-sm"
                    onClick={handleRequestClarification}
                  >
                    Post Question to Reviewer
                  </button>
                </div>
              </div>
            )}

            {task.reviewNotes && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  marginTop: '0.75rem',
                  fontSize: '0.8rem',
                  color: '#dc2626'
                }}
              >
                <strong>Lead Rework Feedback:</strong> {task.reviewNotes}
              </div>
            )}
          </div>

          {/* ── 18 FIELDS SPECIFICATION GRID (SECTION 10 & 11) ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.75rem'
            }}
          >
            {/* Field 6: Assigned By */}
            <div className="adm-card" style={{ padding: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={12} /> Assigned By
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text)', marginTop: '3px' }}>
                {task.assignedBy || 'Rohit Pawar (Director)'}
              </div>
            </div>

            {/* Field 7: Assigned To */}
            <div className="adm-card" style={{ padding: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={12} /> Assigned To (Employee)
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text)', marginTop: '3px' }}>
                {task.assignedTo}
              </div>
            </div>

            {/* Field 8: Reviewer */}
            <div className="adm-card" style={{ padding: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} /> Reviewer / Lead
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text)', marginTop: '3px' }}>
                {task.reviewer || 'Rohit Pawar'}
              </div>
            </div>

            {/* Field 11 & 12: Start Date & Due Date */}
            <div className="adm-card" style={{ padding: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> Timeline & SLA
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--adm-text)', marginTop: '3px' }}>
                {task.startDate ? `${task.startDate} → ` : ''}{task.dueDate}
              </div>
            </div>

            {/* Field 13 & 14: Estimated & Actual Hours */}
            <div className="adm-card" style={{ padding: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> Telemetry (Est / Actual)
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text)', marginTop: '3px' }}>
                {task.estimatedHours}h est. / {task.loggedHours}h actual
              </div>
            </div>

            {/* Field 15: Dependencies */}
            <div className="adm-card" style={{ padding: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Prerequisite Dependencies
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--adm-text)', marginTop: '3px' }}>
                {Array.isArray(task.dependencies) ? task.dependencies.join(', ') : (task.dependencies || 'None')}
              </div>
            </div>
          </div>

          {/* Field 3: Task Description */}
          <div
            style={{
              background: 'var(--adm-surface, #ffffff)',
              border: '1px solid var(--adm-border)',
              borderRadius: '12px',
              padding: '1rem'
            }}
          >
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text-muted)', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>
              Task Scope & Implementation Details
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--adm-text)', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {task.description || 'No detailed specifications supplied for this sprint task.'}
            </p>
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
              <span>Hours Allocation & Burn rate ({task.loggedHours}h logged of {task.estimatedHours}h budget)</span>
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

          {/* Field 18: Acceptance Criteria (Section 10 Field 18) */}
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
                <CheckSquare size={16} color="var(--adm-primary)" />
                Acceptance Criteria Verification ({completedCriteria}/{safeAcceptanceCriteria.length})
              </h4>
              <span style={{ fontSize: '0.74rem', color: 'var(--adm-text-muted)' }}>
                Section 10 Review Gate
              </span>
            </div>

            {safeAcceptanceCriteria.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {safeAcceptanceCriteria.map(ac => (
                  <div
                    key={ac.id}
                    onClick={() => handleToggleCriteria(ac.id)}
                    style={{
                      padding: '0.65rem 0.85rem',
                      background: ac.met ? 'rgba(16, 185, 129, 0.08)' : 'var(--adm-bg, #fafafa)',
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
                      checked={ac.met}
                      onChange={() => {}}
                      style={{ accentColor: '#10b981', cursor: 'pointer' }}
                    />
                    <span
                      style={{
                        fontSize: '0.82rem',
                        color: ac.met ? '#059669' : 'var(--adm-text)',
                        textDecoration: ac.met ? 'line-through' : 'none',
                        fontWeight: ac.met ? 500 : 600
                      }}
                    >
                      {ac.text}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)', fontStyle: 'italic' }}>
                No formal acceptance criteria listed. Edit task to add criteria gates.
              </div>
            )}
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
                {completedSubtasks} of {safeSubtasks.length} Completed
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {safeSubtasks.map(st => (
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

          {/* Field 16: Attachments & Architectural Artifacts */}
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
                <Paperclip size={15} color="#6366f1" />
                Attached Specifications & Artifacts ({(task.attachments || []).length})
              </h4>
              <button
                className="adm-btn adm-btn-secondary adm-btn-sm"
                onClick={() => setShowAttachmentInput(!showAttachmentInput)}
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
              >
                <Plus size={12} />
                <span>Attach File / Doc</span>
              </button>
            </div>

            {showAttachmentInput && (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Document Name (e.g. Api_Spec_v1.pdf)"
                  className="adm-input"
                  style={{ flex: 1, minWidth: '180px', fontSize: '0.8rem' }}
                  value={newAttachmentName}
                  onChange={e => setNewAttachmentName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="URL / File Link (optional)"
                  className="adm-input"
                  style={{ flex: 1, minWidth: '180px', fontSize: '0.8rem' }}
                  value={newAttachmentUrl}
                  onChange={e => setNewAttachmentUrl(e.target.value)}
                />
                <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={handleAddAttachment}>
                  Save Attachment
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(task.attachments || []).map(att => (
                <div
                  key={att.id}
                  style={{
                    padding: '0.6rem 0.85rem',
                    background: 'var(--adm-bg, #fafafa)',
                    border: '1px solid var(--adm-border)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Paperclip size={14} color="var(--adm-primary)" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--adm-text)' }}>{att.name}</span>
                    {att.size && <span style={{ fontSize: '0.72rem', color: 'var(--adm-text-muted)' }}>({att.size})</span>}
                  </div>
                  {att.url && att.url !== '#' && (
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="adm-btn adm-btn-secondary adm-btn-sm"
                      style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                    >
                      View
                    </a>
                  )}
                </div>
              ))}
              {(!task.attachments || task.attachments.length === 0) && (
                <div style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)', fontStyle: 'italic' }}>
                  No files or technical documents attached yet.
                </div>
              )}
            </div>
          </div>

          {/* Field 17: Collaboration Comments Thread */}
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
        <div className="adm-drawer-footer" style={{ padding: '0.9rem 1.5rem', background: 'var(--adm-surface, #ffffff)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <a
            href={`https://wa.me/919226860060?text=${encodeURIComponent(
              `*ENTERPRENEX TASK SPECIFICATION UPDATE*\n\n*Task ID:* ${task.taskId || task.id}\n*Title:* ${task.title}\n*Assignee:* ${task.assignedTo}\n*Reviewer:* ${task.reviewer || 'Rohit Pawar'}\n*Status:* ${task.status}\n*Project:* ${task.projectName}\n*Logged Time:* ${task.loggedHours}h / ${task.estimatedHours}h\n*Due Date:* ${task.dueDate}\n\n*Portal Link:* https://www.enterprenexsolution.com/admin/tasks`
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
            {onEditTask && (
              <button
                className="adm-btn adm-btn-secondary adm-btn-sm"
                onClick={() => onEditTask(task)}
              >
                <Edit size={13} />
                <span>Edit</span>
              </button>
            )}
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
