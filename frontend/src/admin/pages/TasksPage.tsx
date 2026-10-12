import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Send,
  ArrowRight,
  X,
  Play,
  Pause,
  Square,
  Calendar,
  MessageSquare,
  MessageCircle,
  Clock,
  RotateCcw,
  Check,
  AlertTriangle,
  UserCheck,
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import type { Task, TaskColumn, TaskPriority } from '../types';

const TASK_COLUMNS: TaskColumn[] = ['To Do', 'In Progress', 'In Review', 'Changes Required', 'Done'];

export const TasksPage: React.FC = () => {
  const {
    tasks,
    projects,
    employees,
    addTask,
    updateTaskStatus,
    toggleSubtask,
    addTaskComment,
    logTaskTime,
    deleteTask,
    submitTaskForReview,
    reviewTask,
    currentUser,
    showToast
  } = useAdmin();

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [loggedHoursInput, setLoggedHoursInput] = useState(2);

  // Review rework modal state
  const [showReworkModal, setShowReworkModal] = useState(false);
  const [reworkTaskId, setReworkTaskId] = useState<string | null>(null);
  const [reworkNotes, setReworkNotes] = useState('');

  // ── ⏱ LIVE STOPWATCH ENGINE ──
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(() => {
    return localStorage.getItem('ewms_active_timer_task_id') || null;
  });
  const [timerSeconds, setTimerSeconds] = useState<number>(() => {
    return Number(localStorage.getItem('ewms_active_timer_seconds') || 0);
  });
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(() => {
    return localStorage.getItem('ewms_active_timer_running') === 'true';
  });

  // Stopwatch ticking interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && activeTimerTaskId) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          const next = prev + 1;
          localStorage.setItem('ewms_active_timer_seconds', String(next));
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, activeTimerTaskId]);

  const formatStopwatch = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = (taskId: string) => {
    if (activeTimerTaskId && activeTimerTaskId !== taskId) {
      // Switching tasks, prompt or log previous
      const prevTask = tasks.find(t => t.id === activeTimerTaskId);
      if (timerSeconds > 10 && prevTask) {
        const hrs = Math.max(0.1, Math.round((timerSeconds / 3600) * 10) / 10);
        logTaskTime(activeTimerTaskId, hrs);
      }
    }
    setActiveTimerTaskId(taskId);
    setIsTimerRunning(true);
    localStorage.setItem('ewms_active_timer_task_id', taskId);
    localStorage.setItem('ewms_active_timer_running', 'true');
    const task = tasks.find(t => t.id === taskId);
    if (task && (task.status === 'To Do' || task.status === 'Changes Required')) {
      updateTaskStatus(taskId, 'In Progress');
    }
    showToast('Stopwatch Started', `Live task timer running for "${task?.title || 'Task'}"`, 'info');
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    localStorage.setItem('ewms_active_timer_running', 'false');
    showToast('Stopwatch Paused', 'Timer paused. You can resume at any time.', 'info');
  };

  const handleStopAndLogTimer = (taskId: string) => {
    setIsTimerRunning(false);
    const durationHours = Math.max(0.1, Math.round((timerSeconds / 3600) * 100) / 100);
    logTaskTime(taskId, durationHours);
    showToast('Time Logged to Task', `Recorded +${durationHours} hrs (${formatStopwatch(timerSeconds)}) to sprint task.`, 'success');

    setActiveTimerTaskId(null);
    setTimerSeconds(0);
    localStorage.removeItem('ewms_active_timer_task_id');
    localStorage.removeItem('ewms_active_timer_seconds');
    localStorage.removeItem('ewms_active_timer_running');
  };

  // Role detection and view filter
  const isEmployee = currentUser?.role === 'Team Member' || currentUser?.role === 'Developer';
  const isDirector = currentUser?.role === 'Super Admin' || currentUser?.email?.includes('director');
  const [taskViewFilter, setTaskViewFilter] = useState<'my' | 'all'>(isEmployee ? 'my' : 'all');

  // Form State
  const [fTitle, setFTitle] = useState('');
  const [fProjectId, setFProjectId] = useState(projects[0]?.id || '');
  const [fAssignedTo, setFAssignedTo] = useState(employees[0]?.name || currentUser?.name || 'Assigned Engineer');
  const [fPriority, setFPriority] = useState<TaskPriority>('Medium');
  const [fDue, setFDue] = useState('2026-03-01');
  const [fDesc, setFDesc] = useState('');
  const [fHours, setFHours] = useState(8);

  const myTasks = tasks.filter(t =>
    (currentUser?.name && t.assignedTo.toLowerCase().includes(currentUser.name.toLowerCase())) ||
    (currentUser?.employeeId && t.assignedTo.includes(currentUser.employeeId))
  );

  const filteredTasks = tasks.filter(t => {
    if (taskViewFilter === 'my') {
      const isMine =
        (currentUser?.name && t.assignedTo.toLowerCase().includes(currentUser.name.toLowerCase())) ||
        (currentUser?.employeeId && t.assignedTo.includes(currentUser.employeeId));
      if (!isMine) return false;
    }

    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(search.toLowerCase()) ||
      t.projectName.toLowerCase().includes(search.toLowerCase());
    const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  // Assignee Capacity Helper
  const getAssigneeWorkload = (assigneeName: string) => {
    const emp = employees.find(
      e =>
        e.name.toLowerCase() === assigneeName.toLowerCase() ||
        (e.employeeId && assigneeName.includes(e.employeeId))
    );
    const pct = emp?.workloadPercentage || 75;
    if (pct < 70) {
      return { status: 'Available', percent: pct, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' };
    } else if (pct <= 100) {
      return { status: 'Healthy', percent: pct, color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)' };
    } else {
      return { status: 'Overloaded', percent: pct, color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)' };
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selPrj = projects.find(p => p.id === fProjectId);
    addTask({
      title: fTitle || 'Feature Implementation',
      description: fDesc || 'Technical implementation task.',
      projectId: fProjectId,
      projectName: selPrj ? selPrj.title : 'General Engineering',
      assignedTo: fAssignedTo,
      priority: fPriority,
      status: 'To Do',
      dueDate: fDue,
      subtasks: [
        { id: 'st-' + Date.now(), title: 'Core architecture and business logic', completed: false },
        { id: 'st-' + (Date.now() + 1), title: 'Unit tests & code review checklist', completed: false }
      ],
      estimatedHours: Number(fHours),
      tags: ['Sprint Feature', 'Enterprenex']
    });
    setShowAddModal(false);
    setFTitle('');
    setFDesc('');
  };

  const handleAddComment = (taskId: string) => {
    if (!commentInput.trim()) return;
    addTaskComment(taskId, commentInput);
    if (selectedTask?.id === taskId) {
      const newCm = {
        id: 'cm-' + Date.now(),
        author: currentUser?.name || 'Assigned Engineer',
        authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        text: commentInput,
        createdAt: 'Just now'
      };
      setSelectedTask({ ...selectedTask, comments: [...selectedTask.comments, newCm] });
    }
    setCommentInput('');
  };

  const activeTimerTask = tasks.find(t => t.id === activeTimerTaskId);

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <h1>{isEmployee ? 'My Assigned Tasks & Review Flow' : 'Sprint Tasks, Stopwatch & Review Flow'}</h1>
          <p>
            {isEmployee
              ? 'Real-time task stopwatch, subtask execution, capacity load & Lead review submissions'
              : 'EWMS Live task stopwatch, QA/Lead review approvals, capacity engine & Agile sprint delivery'}
          </p>
        </div>
        <div className="adm-page-actions">
          <button className="adm-btn adm-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* ── LIVE ACTIVE STOPWATCH NOTIFICATION BAR ── */}
      {activeTimerTaskId && activeTimerTask && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.12) 0%, rgba(2, 132, 199, 0.12) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '12px',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: isTimerRunning ? '#10b981' : '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: isTimerRunning ? '0 0 14px rgba(16, 185, 129, 0.5)' : 'none'
              }}
            >
              <Clock size={18} className={isTimerRunning ? 'spin-subtle' : ''} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: isTimerRunning ? '#10b981' : '#f59e0b', fontWeight: 800 }}>
                  {isTimerRunning ? '● Live Stopwatch Active' : '⏸ Stopwatch Paused'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--adm-text-dim)' }}>•</span>
                <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>{activeTimerTask.title}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>
                Assigned: <strong style={{ color: '#fff' }}>{activeTimerTask.assignedTo}</strong> ({activeTimerTask.projectName})
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Digital Timer */}
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '1.45rem',
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '1px',
                padding: '0.2rem 0.75rem',
                borderRadius: '6px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--adm-border)'
              }}
            >
              {formatStopwatch(timerSeconds)}
            </div>

            {/* Controls */}
            {isTimerRunning ? (
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', gap: '5px' }}
                onClick={handlePauseTimer}
              >
                <Pause size={14} />
                <span>Pause</span>
              </button>
            ) : (
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', gap: '5px' }}
                onClick={() => handleStartTimer(activeTimerTaskId)}
              >
                <Play size={14} />
                <span>Resume</span>
              </button>
            )}

            <button
              type="button"
              className="adm-btn"
              style={{
                background: '#10b981',
                color: '#fff',
                border: 'none',
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                gap: '5px'
              }}
              onClick={() => handleStopAndLogTimer(activeTimerTaskId)}
            >
              <Square size={13} fill="#fff" />
              <span>Stop & Log Time</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search */}
      <div
        className="adm-card"
        style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-dim)' }}
            />
            <input
              type="text"
              className="adm-input"
              style={{ paddingLeft: '2.4rem' }}
              placeholder={isEmployee ? 'Search your tasks, projects...' : 'Search tasks, assignees, projects...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Quick View Filter: Assigned to Me vs All Tasks */}
          <div
            style={{
              display: 'flex',
              gap: '0.35rem',
              background: 'var(--adm-bg)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid var(--adm-border)'
            }}
          >
            <button
              type="button"
              onClick={() => setTaskViewFilter('my')}
              style={{
                background: taskViewFilter === 'my' ? 'var(--adm-primary)' : 'transparent',
                color: taskViewFilter === 'my' ? '#fff' : 'var(--adm-text-muted)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Assigned to Me ({myTasks.length})
            </button>
            <button
              type="button"
              onClick={() => setTaskViewFilter('all')}
              style={{
                background: taskViewFilter === 'all' ? 'var(--adm-primary)' : 'transparent',
                color: taskViewFilter === 'all' ? '#fff' : 'var(--adm-text-muted)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              All Tasks ({tasks.length})
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)', fontWeight: 600 }}>Priority:</span>
          {(['All', 'Urgent', 'High', 'Medium', 'Low'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              style={{
                background: priorityFilter === p ? 'var(--adm-primary)' : 'var(--adm-bg)',
                color: priorityFilter === p ? '#fff' : 'var(--adm-text-muted)',
                border: '1px solid var(--adm-border)',
                borderRadius: '6px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── 5-COLUMN SPRINT & REVIEW KANBAN ── */}
      <div className="adm-kanban-board">
        {TASK_COLUMNS.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col);

          const colBadgeColor =
            col === 'In Review'
              ? 'rgba(245, 158, 11, 0.2)'
              : col === 'Changes Required'
              ? 'rgba(239, 68, 68, 0.2)'
              : col === 'Done'
              ? 'rgba(16, 185, 129, 0.2)'
              : 'rgba(255, 255, 255, 0.05)';

          const colTextColor =
            col === 'In Review' ? '#f59e0b' : col === 'Changes Required' ? '#ef4444' : col === 'Done' ? '#10b981' : '#fff';

          return (
            <div key={col} className="adm-kanban-column">
              <div
                className="adm-kanban-column-header"
                style={{ borderBottom: `2px solid ${col === 'In Review' ? '#f59e0b' : col === 'Done' ? '#10b981' : 'var(--adm-border)'}` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: colTextColor }}>{col}</span>
                  <span
                    className="adm-badge"
                    style={{ background: colBadgeColor, color: colTextColor, fontSize: '0.7rem' }}
                  >
                    {colTasks.length}
                  </span>
                </div>
              </div>

              <div className="adm-kanban-cards-wrapper">
                {colTasks.map(t => {
                  const completedSubtasks = t.subtasks.filter(s => s.completed).length;
                  const workloadInfo = getAssigneeWorkload(t.assignedTo);
                  const isThisTaskTimerActive = activeTimerTaskId === t.id && isTimerRunning;

                  return (
                    <div
                      key={t.id}
                      className="adm-kanban-card"
                      style={{
                        borderLeft: isThisTaskTimerActive
                          ? '3px solid #10b981'
                          : t.status === 'In Review'
                          ? '3px solid #f59e0b'
                          : t.status === 'Changes Required'
                          ? '3px solid #ef4444'
                          : '1px solid var(--adm-border)'
                      }}
                      onClick={() => setSelectedTask(t)}
                    >
                      {/* Card Header: Priority & Workload Badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '4px' }}>
                        <span
                          className={`adm-badge ${
                            t.priority === 'Urgent'
                              ? 'adm-badge-danger'
                              : t.priority === 'High'
                              ? 'adm-badge-warning'
                              : 'adm-badge-neutral'
                          }`}
                          style={{ fontSize: '0.65rem' }}
                        >
                          {t.priority}
                        </span>

                        {/* Capacity / Workload Indicator */}
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: workloadInfo.bg,
                            color: workloadInfo.color
                          }}
                          title={`Assignee Workload: ${workloadInfo.status} (${workloadInfo.percent}% capacity)`}
                        >
                          {workloadInfo.status} {workloadInfo.percent}%
                        </span>
                      </div>

                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', margin: '4px 0', lineHeight: 1.3 }}>
                        {t.title}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--adm-primary)', marginBottom: '8px' }}>
                        {t.projectName}
                      </div>

                      {/* Rework Note Alert (if Changes Required) */}
                      {t.reviewNotes && (
                        <div
                          style={{
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            borderRadius: '6px',
                            padding: '6px 8px',
                            marginBottom: '8px',
                            fontSize: '0.72rem',
                            color: '#fca5a5'
                          }}
                        >
                          <strong>Reviewer Note:</strong> {t.reviewNotes}
                        </div>
                      )}

                      {/* Subtasks Progress indicator */}
                      {t.subtasks.length > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '0.68rem',
                              color: 'var(--adm-text-dim)'
                            }}
                          >
                            <span>Subtasks</span>
                            <span>
                              {completedSubtasks}/{t.subtasks.length}
                            </span>
                          </div>
                          <div className="adm-progress-bar">
                            <div
                              className="adm-progress-fill"
                              style={{ width: `${(completedSubtasks / t.subtasks.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Assignee & Due */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.72rem',
                          color: 'var(--adm-text-dim)',
                          paddingTop: '6px',
                          borderTop: '1px solid var(--adm-border)'
                        }}
                      >
                        <span style={{ fontWeight: 600, color: '#fff' }}>{t.assignedTo}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Calendar size={11} /> {t.dueDate}
                        </span>
                      </div>

                      {/* ── CARD ACTION CONTROLS: STOPWATCH & REVIEW PIPELINE ── */}
                      <div
                        style={{
                          marginTop: '8px',
                          paddingTop: '6px',
                          borderTop: '1px solid rgba(255,255,255,0.06)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {/* Inline Stopwatch Button */}
                        {isThisTaskTimerActive ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontSize: '0.72rem',
                                color: '#10b981',
                                fontWeight: 800
                              }}
                            >
                              {formatStopwatch(timerSeconds)}
                            </span>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handlePauseTimer();
                              }}
                              style={{
                                background: 'transparent',
                                border: '1px solid #10b981',
                                color: '#10b981',
                                borderRadius: '4px',
                                padding: '2px 5px',
                                fontSize: '0.68rem',
                                cursor: 'pointer'
                              }}
                            >
                              Pause
                            </button>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleStopAndLogTimer(t.id);
                              }}
                              style={{
                                background: '#10b981',
                                border: 'none',
                                color: '#fff',
                                borderRadius: '4px',
                                padding: '2px 5px',
                                fontSize: '0.68rem',
                                cursor: 'pointer',
                                fontWeight: 700
                              }}
                            >
                              Log
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleStartTimer(t.id);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--adm-text-muted)',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer'
                            }}
                            title="Start Stopwatch on this Task"
                          >
                            <Play size={11} color="#10b981" />
                            <span>{t.loggedHours}h logged</span>
                          </button>
                        )}

                        {/* Review Flow Buttons */}
                        {col === 'In Progress' && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              submitTaskForReview(t.id);
                            }}
                            style={{
                              background: 'rgba(245, 158, 11, 0.15)',
                              border: '1px solid rgba(245, 158, 11, 0.35)',
                              color: '#f59e0b',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Submit Review
                          </button>
                        )}

                        {col === 'Changes Required' && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              submitTaskForReview(t.id);
                            }}
                            style={{
                              background: 'rgba(245, 158, 11, 0.15)',
                              border: '1px solid rgba(245, 158, 11, 0.35)',
                              color: '#f59e0b',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Resubmit
                          </button>
                        )}

                        {col === 'In Review' && (
                          <div style={{ display: 'flex', gap: '3px' }}>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                reviewTask(t.id, 'Approved');
                              }}
                              style={{
                                background: '#10b981',
                                border: 'none',
                                color: '#fff',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                              title="Approve Task and mark Done"
                            >
                              ✓ Approve
                            </button>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setReworkTaskId(t.id);
                                setReworkNotes('');
                                setShowReworkModal(true);
                              }}
                              style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                color: '#fca5a5',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                              title="Request Changes from Engineer"
                            >
                              ↺ Rework
                            </button>
                          </div>
                        )}

                        {col === 'To Do' && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              updateTaskStatus(t.id, 'In Progress');
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--adm-primary)',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              cursor: 'pointer'
                            }}
                          >
                            <span>Start Task</span>
                            <ArrowRight size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--adm-text-dim)', fontSize: '0.78rem' }}>
                    Empty column
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── TASK DETAIL MODAL ── */}
      {selectedTask && (
        <div className="adm-modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="adm-modal-content adm-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <span className="adm-badge adm-badge-primary" style={{ marginBottom: '4px' }}>
                  {selectedTask.projectName}
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {selectedTask.title}
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)', marginTop: '2px' }}>
                  Assigned to: <strong style={{ color: '#fff' }}>{selectedTask.assignedTo}</strong> • Due: {selectedTask.dueDate}
                </div>
              </div>
              <button className="adm-modal-close" onClick={() => setSelectedTask(null)}>
                <X size={18} />
              </button>
            </div>

            {/* ⏱ Real-time Task Stopwatch & Time Logger */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--adm-bg)',
                padding: '1rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid var(--adm-border)',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Stopwatch & Time Tracking
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                  {selectedTask.loggedHours}{' '}
                  <span style={{ fontSize: '0.88rem', color: 'var(--adm-text-dim)' }}>/ {selectedTask.estimatedHours} Hours</span>
                </div>
              </div>

              {/* Stopwatch Action Controls */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {activeTimerTaskId === selectedTask.id && isTimerRunning ? (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        color: '#10b981',
                        background: 'rgba(0,0,0,0.4)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px'
                      }}
                    >
                      {formatStopwatch(timerSeconds)}
                    </span>
                    <button className="adm-btn adm-btn-secondary adm-btn-sm" onClick={handlePauseTimer}>
                      <Pause size={13} />
                      <span>Pause</span>
                    </button>
                    <button
                      className="adm-btn adm-btn-sm"
                      style={{ background: '#10b981', color: '#fff', border: 'none' }}
                      onClick={() => handleStopAndLogTimer(selectedTask.id)}
                    >
                      <Square size={12} fill="#fff" />
                      <span>Stop & Log</span>
                    </button>
                  </div>
                ) : (
                  <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={() => handleStartTimer(selectedTask.id)}>
                    <Play size={13} />
                    <span>Start Stopwatch</span>
                  </button>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '0.5rem', borderLeft: '1px solid var(--adm-border)', paddingLeft: '0.75rem' }}>
                  <input
                    type="number"
                    className="adm-input"
                    style={{ width: '65px', padding: '0.3rem 0.4rem', fontSize: '0.8rem' }}
                    value={loggedHoursInput}
                    onChange={e => setLoggedHoursInput(Number(e.target.value))}
                  />
                  <button
                    className="adm-btn adm-btn-secondary adm-btn-sm"
                    onClick={() => {
                      logTaskTime(selectedTask.id, loggedHoursInput);
                      setSelectedTask({ ...selectedTask, loggedHours: selectedTask.loggedHours + loggedHoursInput });
                    }}
                  >
                    +Hours
                  </button>
                </div>
              </div>
            </div>

            {/* Review Status & Actions Pipeline */}
            <div
              style={{
                background:
                  selectedTask.status === 'In Review'
                    ? 'rgba(245, 158, 11, 0.08)'
                    : selectedTask.status === 'Changes Required'
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'var(--adm-bg)',
                border: '1px solid var(--adm-border)',
                borderRadius: '8px',
                padding: '0.85rem 1.25rem',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Review & Approval Pipeline
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                  Current Status: <span style={{ color: 'var(--adm-primary)' }}>{selectedTask.status}</span>
                </div>
                {selectedTask.reviewNotes && (
                  <div style={{ fontSize: '0.78rem', color: '#fca5a5', marginTop: '3px' }}>
                    <strong>Rework Feedback:</strong> {selectedTask.reviewNotes}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(selectedTask.status === 'In Progress' || selectedTask.status === 'Changes Required') && (
                  <button
                    className="adm-btn adm-btn-sm"
                    style={{ background: '#f59e0b', color: '#fff', border: 'none', fontWeight: 700 }}
                    onClick={() => {
                      submitTaskForReview(selectedTask.id);
                      setSelectedTask({ ...selectedTask, status: 'In Review' });
                    }}
                  >
                    Submit for Review 📤
                  </button>
                )}

                {selectedTask.status === 'In Review' && (
                  <>
                    <button
                      className="adm-btn adm-btn-sm"
                      style={{ background: '#10b981', color: '#fff', border: 'none', fontWeight: 700 }}
                      onClick={() => {
                        reviewTask(selectedTask.id, 'Approved');
                        setSelectedTask({ ...selectedTask, status: 'Done' });
                      }}
                    >
                      ✓ Approve (Done)
                    </button>
                    <button
                      className="adm-btn adm-btn-sm"
                      style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid #ef4444', fontWeight: 700 }}
                      onClick={() => {
                        setReworkTaskId(selectedTask.id);
                        setReworkNotes('');
                        setShowReworkModal(true);
                      }}
                    >
                      ↺ Request Changes
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Subtasks Checklist */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4
                style={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle2 size={16} color="var(--adm-success)" />
                Subtasks Breakdown
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedTask.subtasks.map(st => (
                  <div
                    key={st.id}
                    onClick={() => {
                      toggleSubtask(selectedTask.id, st.id);
                      const updated = selectedTask.subtasks.map(s => (s.id === st.id ? { ...s, completed: !s.completed } : s));
                      setSelectedTask({ ...selectedTask, subtasks: updated });
                    }}
                    style={{
                      padding: '0.65rem 0.85rem',
                      background: st.completed ? 'var(--adm-success-soft)' : 'var(--adm-bg)',
                      border: '1px solid var(--adm-border)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    <input type="checkbox" checked={st.completed} onChange={() => {}} style={{ accentColor: 'var(--adm-success)' }} />
                    <span
                      style={{
                        fontSize: '0.85rem',
                        color: st.completed ? 'var(--adm-success)' : '#fff',
                        textDecoration: st.completed ? 'line-through' : 'none'
                      }}
                    >
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Collaboration Comments Thread */}
            <div>
              <h4
                style={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <MessageSquare size={16} color="var(--adm-info)" />
                Engineering Comments Thread
              </h4>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="Post technical update or review comment..."
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddComment(selectedTask.id);
                  }}
                />
                <button className="adm-btn adm-btn-primary" onClick={() => handleAddComment(selectedTask.id)}>
                  <Send size={14} />
                  <span>Reply</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {selectedTask.comments.map(c => (
                  <div
                    key={c.id}
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'var(--adm-bg)',
                      borderRadius: '8px',
                      border: '1px solid var(--adm-border)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.82rem' }}>{c.author}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>{c.createdAt}</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--adm-text-muted)', margin: 0 }}>{c.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--adm-border)'
              }}
            >
              <a
                href={`https://wa.me/919226860060?text=${encodeURIComponent(
                  `*ENTERPRENEX TASK STATUS UPDATE*\n\n*Task:* ${selectedTask.title}\n*Assignee:* ${selectedTask.assignedTo}\n*Status:* ${selectedTask.status}\n*Project:* ${selectedTask.projectName}\n*Logged Time:* ${selectedTask.loggedHours}h / ${selectedTask.estimatedHours}h\n*Due Date:* ${selectedTask.dueDate}\n\n*Portal Link:* https://www.enterprenexsolution.com/admin/tasks`
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
                <span>Share Update on WhatsApp</span>
              </a>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!isEmployee && (
                  <button
                    className="adm-btn adm-btn-danger adm-btn-sm"
                    onClick={() => {
                      deleteTask(selectedTask.id);
                      setSelectedTask(null);
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Delete Task</span>
                  </button>
                )}
                <button className="adm-btn adm-btn-secondary" onClick={() => setSelectedTask(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── REWORK FEEDBACK MODAL ── */}
      {showReworkModal && reworkTaskId && (
        <div className="adm-modal-overlay" onClick={() => setShowReworkModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="adm-modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Request Task Changes & Rework
              </h3>
              <button className="adm-modal-close" onClick={() => setShowReworkModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="adm-form-label">Reviewer Rework Instructions *</label>
              <textarea
                className="adm-textarea"
                rows={4}
                placeholder="Specify what needs correction (e.g., add input validation, write unit test cases, fix UI alignment)..."
                value={reworkNotes}
                onChange={e => setReworkNotes(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="adm-btn adm-btn-secondary" onClick={() => setShowReworkModal(false)}>
                Cancel
              </button>
              <button
                className="adm-btn"
                style={{ background: '#ef4444', color: '#fff', border: 'none', fontWeight: 700 }}
                onClick={() => {
                  reviewTask(reworkTaskId, 'Changes Required', reworkNotes || 'Please address lead review feedback.');
                  setShowReworkModal(false);
                  if (selectedTask?.id === reworkTaskId) {
                    setSelectedTask({ ...selectedTask, status: 'Changes Required', reviewNotes: reworkNotes });
                  }
                }}
              >
                Send Rework Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE TASK MODAL ── */}
      {showAddModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Create Sprint Task</h3>
              <button className="adm-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="adm-form-group">
                <label className="adm-form-label">Task Title *</label>
                <input
                  className="adm-input"
                  required
                  value={fTitle}
                  onChange={e => setFTitle(e.target.value)}
                  placeholder="e.g. Implement Webhook Dispatcher"
                />
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Associated Project</label>
                  <select className="adm-select" value={fProjectId} onChange={e => setFProjectId(e.target.value)}>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Assignee</label>
                  <select className="adm-select" value={fAssignedTo} onChange={e => setFAssignedTo(e.target.value)}>
                    {employees.map(e => (
                      <option key={e.id} value={e.name}>
                        {e.name} ({e.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="adm-grid-3">
                <div className="adm-form-group">
                  <label className="adm-form-label">Priority</label>
                  <select className="adm-select" value={fPriority} onChange={e => setFPriority(e.target.value as any)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Est. Hours</label>
                  <input className="adm-input" type="number" value={fHours} onChange={e => setFHours(Number(e.target.value))} />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Due Date</label>
                  <input className="adm-input" type="date" value={fDue} onChange={e => setFDue(e.target.value)} />
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Task Description</label>
                <textarea
                  className="adm-textarea"
                  value={fDesc}
                  onChange={e => setFDesc(e.target.value)}
                  placeholder="Acceptance criteria and technical details..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
