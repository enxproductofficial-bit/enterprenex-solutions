import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Plus,
  Search,
  ArrowRight,
  X,
  Play,
  Pause,
  Square,
  Calendar,
  Clock
} from 'lucide-react';
import type { Task, TaskColumn, TaskPriority } from '../types';

const TaskPreviewDrawer = React.lazy(() => import('../components/TaskPreviewDrawer'));

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
  const [taskViewFilter, setTaskViewFilter] = useState<'my' | 'all'>(isEmployee ? 'my' : 'all');

  // Form State
  const [fTitle, setFTitle] = useState('');
  const [fProjectId, setFProjectId] = useState(projects[0]?.id || '');
  const [fAssignedTo, setFAssignedTo] = useState(employees[0]?.name || currentUser?.name || 'Assigned Engineer');
  const [fPriority, setFPriority] = useState<TaskPriority>('Medium');
  const [fDue, setFDue] = useState('2026-03-01');
  const [fDesc, setFDesc] = useState('');
  const [fHours, setFHours] = useState(8);

  const myTasks = tasks.filter(t => {
    const userName = (currentUser?.name || '').toLowerCase().trim();
    const empId = (currentUser?.employeeId || '').toLowerCase().trim();
    const assigned = (t.assignedTo || '').toLowerCase().trim();

    const nameParts = userName.split(' ').filter(p => p.length >= 3);
    const nameMatch = userName && (assigned.includes(userName) || nameParts.some(p => assigned.includes(p)));
    const idMatch = empId && assigned.includes(empId);

    return nameMatch || idMatch;
  });

  const filteredTasks = tasks.filter(t => {
    if (taskViewFilter === 'my') {
      const userName = (currentUser?.name || '').toLowerCase().trim();
      const empId = (currentUser?.employeeId || '').toLowerCase().trim();
      const assigned = (t.assignedTo || '').toLowerCase().trim();

      const nameParts = userName.split(' ').filter(p => p.length >= 3);
      const isMine = (userName && (assigned.includes(userName) || nameParts.some(p => assigned.includes(p)))) ||
                     (empId && assigned.includes(empId));
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
    if (pct < 85) {
      return { status: 'Available', percent: pct, color: 'var(--adm-success)', bg: 'rgba(16, 185, 129, 0.10)' };
    } else {
      return { status: 'High Load', percent: pct, color: 'var(--adm-primary)', bg: 'var(--adm-primary-soft)' };
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

      {/* ── LIVE ACTIVE STOPWATCH BAR (MINIMALISM) ── */}
      {activeTimerTaskId && activeTimerTask && (
        <div
          className="adm-card"
          style={{
            padding: '0.75rem 1.15rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: isTimerRunning ? 'rgba(16, 185, 129, 0.12)' : 'var(--adm-primary-soft)',
                border: '1px solid ' + (isTimerRunning ? 'rgba(16, 185, 129, 0.25)' : 'var(--adm-primary-border)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isTimerRunning ? 'var(--adm-success)' : 'var(--adm-primary)'
              }}
            >
              <Clock size={16} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: isTimerRunning ? 'var(--adm-success)' : 'var(--adm-primary)', fontWeight: 800 }}>
                  {isTimerRunning ? '● Live Stopwatch Active' : '⏸ Stopwatch Paused'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--adm-text-dim)' }}>•</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--adm-text)', fontWeight: 600 }}>{activeTimerTask.title}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>
                Assigned: <strong style={{ color: 'var(--adm-text)' }}>{activeTimerTask.assignedTo}</strong> ({activeTimerTask.projectName})
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
                color: 'var(--adm-text)',
                letterSpacing: '1px',
                padding: '0.2rem 0.75rem',
                borderRadius: '6px',
                background: 'var(--adm-surface-hover)',
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
                background: 'var(--adm-success)',
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
          {(['All', 'Urgent', 'High', 'Medium', 'Low'] as const).map(p => {
            const isSelected = priorityFilter === p;
            return (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={isSelected ? 'adm-btn adm-btn-primary adm-btn-sm' : 'adm-btn adm-btn-secondary adm-btn-sm'}
                style={{
                  borderRadius: '20px',
                  padding: '0.45rem 1rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 5-COLUMN SPRINT & REVIEW KANBAN ── */}
      <div className="adm-kanban-board">
        {TASK_COLUMNS.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col);

          const isDone = col === 'Done';
          const isInReview = col === 'In Review';

          return (
            <div key={col} className="adm-kanban-column">
              <div
                className="adm-kanban-column-header"
                style={{
                  borderBottom: isDone ? '2px solid var(--adm-success)' : isInReview ? '2px solid var(--adm-primary)' : '1px solid var(--adm-border)',
                  background: 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    color: isDone ? 'var(--adm-success)' : isInReview ? 'var(--adm-primary)' : 'var(--adm-text)'
                  }}>
                    {col}
                  </span>
                  <span
                    className="adm-badge"
                    style={{
                      background: isDone ? 'rgba(16, 185, 129, 0.12)' : isInReview ? 'var(--adm-primary-soft)' : 'var(--adm-surface-hover)',
                      color: isDone ? 'var(--adm-success)' : isInReview ? 'var(--adm-primary)' : 'var(--adm-text-muted)',
                      border: '1px solid var(--adm-border)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px'
                    }}
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
                      className={`adm-kanban-card ${selectedTask?.id === t.id ? 'adm-kanban-card-active' : ''}`}
                      style={{
                        cursor: 'pointer',
                        borderLeft: isThisTaskTimerActive
                          ? '3px solid var(--adm-success)'
                          : t.status === 'Done'
                          ? '3px solid var(--adm-success)'
                          : t.status === 'In Review'
                          ? '3px solid var(--adm-primary)'
                          : selectedTask?.id === t.id
                          ? '3px solid var(--adm-primary)'
                          : '1px solid var(--adm-border)',
                        boxShadow: selectedTask?.id === t.id ? '0 4px 16px rgba(0,0,0,0.08)' : undefined,
                        transform: selectedTask?.id === t.id ? 'scale(1.01)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                      onClick={() => setSelectedTask(t)}
                    >
                      {/* Card Header: Priority & Workload Badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '4px' }}>
                        <span
                          className={`adm-badge ${
                            t.priority === 'Urgent'
                              ? 'adm-badge-primary'
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
                            color: workloadInfo.color,
                            border: '1px solid var(--adm-border)'
                          }}
                          title={`Assignee Workload: ${workloadInfo.status} (${workloadInfo.percent}% capacity)`}
                        >
                          {workloadInfo.status} {workloadInfo.percent}%
                        </span>
                      </div>

                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--adm-text)', margin: '4px 0', lineHeight: 1.3 }}>
                        {t.title}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginBottom: '8px' }}>
                        {t.projectName}
                      </div>

                      {/* Rework Note Alert (if Changes Required) */}
                      {t.reviewNotes && (
                        <div
                          style={{
                            background: 'var(--adm-primary-soft)',
                            border: '1px solid var(--adm-primary-border)',
                            borderRadius: '6px',
                            padding: '6px 8px',
                            marginBottom: '8px',
                            fontSize: '0.72rem',
                            color: 'var(--adm-primary)'
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
                        <span style={{ fontWeight: 600, color: 'var(--adm-text)' }}>{t.assignedTo}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Calendar size={11} /> {t.dueDate}
                        </span>
                      </div>

                      {/* ── CARD ACTION CONTROLS: STOPWATCH & REVIEW PIPELINE ── */}
                      <div
                        style={{
                          marginTop: '8px',
                          paddingTop: '6px',
                          borderTop: '1px solid var(--adm-border)',
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
                                color: 'var(--adm-success)',
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
                                border: '1px solid var(--adm-success)',
                                color: 'var(--adm-success)',
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
                                background: 'var(--adm-success)',
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
                            <Play size={11} color="var(--adm-success)" />
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
                              background: 'var(--adm-primary-soft)',
                              border: '1px solid var(--adm-primary-border)',
                              color: 'var(--adm-primary)',
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
                              background: 'var(--adm-primary-soft)',
                              border: '1px solid var(--adm-primary-border)',
                              color: 'var(--adm-primary)',
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
                                background: 'var(--adm-success)',
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
                                background: 'var(--adm-surface-hover)',
                                border: '1px solid var(--adm-border)',
                                color: 'var(--adm-text-muted)',
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

      {/* ── SCREEN-ADAPTIVE SLIDING TASK PREVIEW DRAWER (LAZY LOADED) ── */}
      {selectedTask && (
        <React.Suspense
          fallback={
            <div className="adm-drawer-overlay">
              <div
                className="adm-preview-drawer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'clamp(440px, 56vw, 860px)'
                }}
              >
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="adm-spinner" style={{ margin: '0 auto 1rem auto' }} />
                  <div style={{ fontSize: '0.85rem', color: 'var(--adm-text-muted)' }}>
                    Loading Task Drawer...
                  </div>
                </div>
              </div>
            </div>
          }
        >
          <TaskPreviewDrawer
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            activeTimerTaskId={activeTimerTaskId}
            isTimerRunning={isTimerRunning}
            timerSeconds={timerSeconds}
            formatStopwatch={formatStopwatch}
            onStartTimer={handleStartTimer}
            onPauseTimer={handlePauseTimer}
            onStopAndLogTimer={handleStopAndLogTimer}
            onLogHours={logTaskTime}
            onSubmitForReview={submitTaskForReview}
            onReviewTask={reviewTask}
            onRequestRework={taskId => {
              setReworkTaskId(taskId);
              setReworkNotes('');
              setShowReworkModal(true);
            }}
            onToggleSubtask={toggleSubtask}
            commentInput={commentInput}
            setCommentInput={setCommentInput}
            onAddComment={handleAddComment}
            isEmployee={isEmployee}
            onDeleteTask={deleteTask}
            onUpdateSelectedTask={setSelectedTask}
          />
        </React.Suspense>
      )}

      {/* ── REWORK FEEDBACK MODAL ── */}
      {showReworkModal && reworkTaskId && (
        <div className="adm-modal-overlay" onClick={() => setShowReworkModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="adm-modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
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
                className="adm-btn adm-btn-primary"
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text)' }}>Create Sprint Task</h3>
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
                    <option value="">-- General / Internal Operations --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.clientName})
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
