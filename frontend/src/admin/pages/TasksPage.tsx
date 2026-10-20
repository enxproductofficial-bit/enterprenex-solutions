import React, { useState, useEffect, useRef } from 'react';
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
  Edit,
  Trash2,
  Eye,
  CheckSquare,
  Columns,
  List,
  FolderGit2
} from 'lucide-react';
import type { Task, TaskColumn, TaskPriority, TaskAcceptanceCriteria } from '../types';

const TaskPreviewDrawer = React.lazy(() => import('../components/TaskPreviewDrawer'));

// EWMS Section 10: 9-Stage Task Lifecycle Progression
const NINE_STAGE_LIFECYCLE: { stage: TaskColumn; label: string; badge: string; color: string; desc: string }[] = [
  { stage: 'Backlog', label: 'Backlog', badge: 'adm-badge-neutral', color: '#64748b', desc: 'Unscheduled sprint requirements' },
  { stage: 'To Do', label: 'To Do', badge: 'adm-badge-primary', color: '#0284c7', desc: 'Ready for sprint execution' },
  { stage: 'In Progress', label: 'In Progress', badge: 'adm-badge-info', color: '#3b82f6', desc: 'Active execution telemetry' },
  { stage: 'Blocked', label: 'Blocked', badge: 'adm-badge-danger', color: '#ef4444', desc: 'Impediment / dependencies' },
  { stage: 'In Review', label: 'In Review', badge: 'adm-badge-warning', color: '#f59e0b', desc: 'Peer & Manager review' },
  { stage: 'Revision Required', label: 'Revision Required', badge: 'adm-badge-danger', color: '#dc2626', desc: 'Rework feedback returned' },
  { stage: 'Approved', label: 'Approved', badge: 'adm-badge-success', color: '#10b981', desc: 'Verified & stage-gated' },
  { stage: 'Completed', label: 'Completed', badge: 'adm-badge-success', color: '#059669', desc: 'Production signed-off' },
  { stage: 'Cancelled', label: 'Cancelled', badge: 'adm-badge-neutral', color: '#94a3b8', desc: 'Aborted or superseded' }
];

const MODULE_OPTIONS = [
  'Core Engine & Telemetry',
  'Frontend UI/UX Systems',
  'API & Security Infrastructure',
  'Billing & Financial Operations',
  'Workforce & Capacity Ops',
  'Competency & Verification',
  'KPI & Performance Engine',
  'DevOps & Cloud Infrastructure',
  'Quality Assurance & Testing'
];

export const TasksPage: React.FC = () => {
  const {
    tasks,
    projects,
    employees,
    addTask,
    updateTask,
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
  const [moduleFilter, setModuleFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [showAllStages, setShowAllStages] = useState(true);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

  // Anti-Tamper & Idle-Aware Stopwatch State
  const [isIdlePaused, setIsIdlePaused] = useState<boolean>(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => localStorage.getItem('ewms_active_session_id'));
  const lastUserActivityRef = useRef<number>(Date.now());

  // Track User Activity (Mouse, Keyboard, Click) to prevent unattended running (e.g. YouTube watching)
  useEffect(() => {
    const markActivity = () => {
      lastUserActivityRef.current = Date.now();
      if (isIdlePaused) {
        setIsIdlePaused(false);
      }
    };

    window.addEventListener('mousemove', markActivity);
    window.addEventListener('keydown', markActivity);
    window.addEventListener('click', markActivity);
    window.addEventListener('scroll', markActivity);

    // Tab visibility listener: Automatically detect when employee leaves tab
    const handleVisibilityChange = () => {
      if (document.hidden && isTimerRunning) {
        setIsIdlePaused(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('mousemove', markActivity);
      window.removeEventListener('keydown', markActivity);
      window.removeEventListener('click', markActivity);
      window.removeEventListener('scroll', markActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTimerRunning, isIdlePaused]);

  // Stopwatch ticking interval with idle cutoff (2 minutes of inactivity or tab hidden pauses active accumulation)
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && activeTimerTaskId) {
      interval = setInterval(() => {
        const now = Date.now();
        const isTabHidden = document.hidden;
        const isUserInactive = (now - lastUserActivityRef.current) > 120000; // 2 minutes without interaction

        if (isTabHidden || isUserInactive) {
          if (!isIdlePaused) setIsIdlePaused(true);
          // Do NOT accumulate active sprint time while tab is hidden or user is inactive
          return;
        }

        if (isIdlePaused) setIsIdlePaused(false);

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
  }, [isTimerRunning, activeTimerTaskId, isIdlePaused]);

  // Periodic Server Heartbeat (Every 60s) for verified presence telemetry
  useEffect(() => {
    if (!isTimerRunning || !activeTimerTaskId) return;

    const heartbeatInterval = setInterval(async () => {
      const token = localStorage.getItem('ewms_token');
      if (!token) return;

      const isTabActive = !document.hidden;
      const isUserRecent = (Date.now() - lastUserActivityRef.current) < 120000;

      try {
        await fetch(`http://localhost:5000/api/tasks/${activeTimerTaskId}/stopwatch/heartbeat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            sessionId: activeSessionId || 'local-session',
            isTabActive,
            userActiveRecent: isUserRecent
          })
        });
      } catch (err) {
        // Silent background fallback
      }
    }, 60000);

    return () => clearInterval(heartbeatInterval);
  }, [isTimerRunning, activeTimerTaskId, activeSessionId]);

  const formatStopwatch = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = async (taskId: string) => {
    if (activeTimerTaskId && activeTimerTaskId !== taskId) {
      const prevTask = tasks.find(t => t.id === activeTimerTaskId);
      if (timerSeconds > 10 && prevTask) {
        const hrs = Math.max(0.1, Math.round((timerSeconds / 3600) * 10) / 10);
        logTaskTime(activeTimerTaskId, hrs);
      }
    }
    setActiveTimerTaskId(taskId);
    setIsTimerRunning(true);
    setIsIdlePaused(false);
    lastUserActivityRef.current = Date.now();

    localStorage.setItem('ewms_active_timer_task_id', taskId);
    localStorage.setItem('ewms_active_timer_running', 'true');

    // Register verified session on backend
    const token = localStorage.getItem('ewms_token');
    if (token) {
      try {
        const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/stopwatch/start`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.sessionId) {
          setActiveSessionId(data.sessionId);
          localStorage.setItem('ewms_active_session_id', data.sessionId);
        }
      } catch (e) {
        // Fallback
      }
    }

    const task = tasks.find(t => t.id === taskId);
    if (task && (task.status === 'Backlog' || task.status === 'Assigned' || task.status === 'To Do' || task.status === 'Changes Required')) {
      updateTaskStatus(taskId, 'In Progress');
    }
    showToast('Stopwatch Started', `Live task timer running for "${task?.title || 'Task'}". Anti-tamper idle tracking active.`, 'info');
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    localStorage.setItem('ewms_active_timer_running', 'false');
    showToast('Stopwatch Paused', 'Timer paused. You can resume at any time.', 'info');
  };

  const handleStopAndLogTimer = async (taskId: string) => {
    setIsTimerRunning(false);
    setIsIdlePaused(false);
    const durationHours = Math.max(0.1, Math.round((timerSeconds / 3600) * 100) / 100);

    // Call server to commit verified active hours
    const token = localStorage.getItem('ewms_token');
    if (token && activeSessionId) {
      try {
        await fetch(`http://localhost:5000/api/tasks/${taskId}/stopwatch/stop`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            sessionId: activeSessionId,
            activityNote: `Sprint session logged (${formatStopwatch(timerSeconds)})`
          })
        });
      } catch (e) {
        // Fallback to context
      }
    }

    logTaskTime(taskId, durationHours);
    showToast('Verified Time Logged', `Recorded +${durationHours} hrs (${formatStopwatch(timerSeconds)}) verified active work to sprint task.`, 'success');

    setActiveTimerTaskId(null);
    setTimerSeconds(0);
    setActiveSessionId(null);
    localStorage.removeItem('ewms_active_timer_task_id');
    localStorage.removeItem('ewms_active_timer_seconds');
    localStorage.removeItem('ewms_active_timer_running');
    localStorage.removeItem('ewms_active_session_id');
  };

  // Role detection and view filter
  const isEmployee = currentUser?.role === 'Team Member' || currentUser?.role === 'Developer';
  const [taskViewFilter, setTaskViewFilter] = useState<'my' | 'all'>(isEmployee ? 'my' : 'all');

  // ── SECTION 11: MANAGER ASSIGNMENT FLOW FORM STATE (18 FIELDS) ──
  const [fTaskId, setFTaskId] = useState('');
  const [fTitle, setFTitle] = useState('');
  const [fProjectId, setFProjectId] = useState(projects[0]?.id || '');
  const [fModule, setFModule] = useState(MODULE_OPTIONS[0]);
  const [fAssignedBy, setFAssignedBy] = useState('Rohit Pawar (Technical Director)');
  const [fAssignedTo, setFAssignedTo] = useState(employees[0]?.name || currentUser?.name || 'Assigned Engineer');
  const [fReviewer, setFReviewer] = useState('Rohit Pawar');
  const [fPriority, setFPriority] = useState<TaskPriority>('Medium');
  const [fStatus, setFStatus] = useState<TaskColumn>('Assigned');
  const [fStartDate, setFStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [fDue, setFDue] = useState('2026-10-30');
  const [fHours, setFHours] = useState(8);
  const [fDependencies, setFDependencies] = useState('None');
  const [fDesc, setFDesc] = useState('');
  const [fCriteria, setFCriteria] = useState<string[]>([
    'Core architecture and business logic verification',
    'Unit test coverage & lead peer review sign-off'
  ]);
  const [fNewCriterion, setFNewCriterion] = useState('');

  // Edit Task State
  const [eTaskId, setETaskId] = useState('');
  const [eTitle, setETitle] = useState('');
  const [eProjectId, setEProjectId] = useState('');
  const [eModule, setEModule] = useState('');
  const [eAssignedBy, setEAssignedBy] = useState('');
  const [eAssignedTo, setEAssignedTo] = useState('');
  const [eReviewer, setEReviewer] = useState('');
  const [ePriority, setEPriority] = useState<TaskPriority>('Medium');
  const [eStatus, setEStatus] = useState<TaskColumn>('In Progress');
  const [eStartDate, setEStartDate] = useState('');
  const [eDue, setEDue] = useState('');
  const [eHours, setEHours] = useState(8);
  const [eDependencies, setEDependencies] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [eCriteria, setECriteria] = useState<TaskAcceptanceCriteria[]>([]);
  const [eNewCriterion, setENewCriterion] = useState('');

  const normalizeStatus = (st: TaskColumn): TaskColumn => {
    if (st === 'To Do') return 'Backlog';
    if (st === 'Done') return 'Completed';
    if (st === 'Testing') return 'In Review';
    return st;
  };

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
      (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.taskId || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.assignedTo || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.projectName || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.module || '').toLowerCase().includes(search.toLowerCase());

    const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchModule = moduleFilter === 'All' || (t.module || '').toLowerCase().includes(moduleFilter.toLowerCase());

    return matchSearch && matchPriority && matchModule;
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
      return { status: 'Available', percent: pct, color: 'var(--adm-success, #10b981)', bg: 'rgba(16, 185, 129, 0.10)' };
    } else if (pct <= 95) {
      return { status: 'Optimal Load', percent: pct, color: '#0284c7', bg: 'rgba(2, 132, 199, 0.10)' };
    } else {
      return { status: 'High Load', percent: pct, color: '#dc2626', bg: 'rgba(220, 38, 38, 0.10)' };
    }
  };

  // Open Create Modal with auto-generated Task ID
  const handleOpenAddModal = () => {
    const count = tasks.length + 1;
    setFTaskId(`TSK-2026-${count.toString().padStart(3, '0')}`);
    setFTitle('');
    setFDesc('');
    setFHours(8);
    setFDependencies('None');
    setFCriteria([
      'Core architecture and business logic verification',
      'Unit test coverage & lead peer review sign-off'
    ]);
    setShowAddModal(true);
  };

  // Open Edit Modal with existing task's 18 fields
  const handleOpenEditModal = (t: Task) => {
    setEditingTask(t);
    setETaskId(t.taskId || t.id);
    setETitle(t.title);
    setEProjectId(t.projectId);
    setEModule(t.module || MODULE_OPTIONS[0]);
    setEAssignedBy(t.assignedBy || 'Rohit Pawar (Technical Director)');
    setEAssignedTo(t.assignedTo);
    setEReviewer(t.reviewer || 'Rohit Pawar');
    setEPriority(t.priority);
    setEStatus(normalizeStatus(t.status));
    setEStartDate(t.startDate || t.createdAt);
    setEDue(t.dueDate);
    setEHours(t.estimatedHours || 8);
    setEDependencies(Array.isArray(t.dependencies) ? t.dependencies.join(', ') : (t.dependencies || 'None'));
    setEDesc(t.description || '');
    setECriteria(t.acceptanceCriteria || [
      { id: 'ac-1', text: 'Implementation verified against specs', met: true }
    ]);
    setShowEditModal(true);
  };

  const handleAddCriterion = () => {
    if (!fNewCriterion.trim()) return;
    setFCriteria(prev => [...prev, fNewCriterion.trim()]);
    setFNewCriterion('');
  };

  const handleRemoveCriterion = (idx: number) => {
    setFCriteria(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddEditCriterion = () => {
    if (!eNewCriterion.trim()) return;
    setECriteria(prev => [
      ...prev,
      { id: 'ac-' + Date.now(), text: eNewCriterion.trim(), met: false }
    ]);
    setENewCriterion('');
  };

  const handleRemoveEditCriterion = (id: string) => {
    setECriteria(prev => prev.filter(c => c.id !== id));
  };

  // Section 11 Manager Task Assignment Submission
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selPrj = projects.find(p => p.id === fProjectId);

    const initialCriteria: TaskAcceptanceCriteria[] = fCriteria.map((txt, idx) => ({
      id: 'ac-' + (Date.now() + idx),
      text: txt,
      met: false
    }));

    addTask({
      taskId: fTaskId || `TSK-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: fTitle || 'Engineering Task Implementation',
      description: fDesc || 'Technical deliverable according to architecture blueprint.',
      projectId: fProjectId,
      projectName: selPrj ? selPrj.title : 'General Engineering',
      module: fModule,
      assignedBy: fAssignedBy || 'Rohit Pawar (Technical Director)',
      assignedTo: fAssignedTo,
      reviewer: fReviewer || 'Rohit Pawar',
      priority: fPriority,
      status: fStatus,
      startDate: fStartDate,
      dueDate: fDue,
      estimatedHours: Number(fHours) || 8,
      dependencies: fDependencies || 'None',
      acceptanceCriteria: initialCriteria,
      attachments: [],
      subtasks: [
        { id: 'st-' + Date.now(), title: 'Core architecture and business logic implementation', completed: false },
        { id: 'st-' + (Date.now() + 1), title: 'Unit testing & technical documentation', completed: false }
      ],
      tags: [fModule.split(' ')[0], 'EWMS-Sprint']
    });

    setShowAddModal(false);
  };

  // Update Task Form Submission
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    const selPrj = projects.find(p => p.id === eProjectId);
    const updates: Partial<Task> = {
      taskId: eTaskId,
      title: eTitle,
      projectId: eProjectId,
      projectName: selPrj ? selPrj.title : editingTask.projectName,
      module: eModule,
      assignedBy: eAssignedBy,
      assignedTo: eAssignedTo,
      reviewer: eReviewer,
      priority: ePriority,
      status: eStatus,
      startDate: eStartDate,
      dueDate: eDue,
      estimatedHours: Number(eHours),
      dependencies: eDependencies,
      description: eDesc,
      acceptanceCriteria: eCriteria
    };

    updateTask(editingTask.id, updates);
    if (selectedTask?.id === editingTask.id) {
      setSelectedTask({ ...selectedTask, ...updates });
    }
    setShowEditModal(false);
    setEditingTask(null);
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

  // Active columns to display
  const displayedColumns = showAllStages
    ? NINE_STAGE_LIFECYCLE
    : NINE_STAGE_LIFECYCLE.filter(c => c.stage !== 'Cancelled');

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(255, 107, 0, 0.12)',
                color: 'var(--adm-primary)'
              }}
            >
              EWMS Section 10 & 11 Governance
            </span>
          </div>
          <h1>{isEmployee ? 'Engineering Backlog & Deliverable Review Governance' : 'Sprint Backlog, Task Management & 9-Stage Review Lifecycle'}</h1>
          <p>
            18-field enterprise specification, real-time stopwatch telemetry, manager delegation flow, and statutory review gate approval.
          </p>
        </div>

        <div className="adm-page-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* View Toggle */}
          <div style={{ display: 'inline-flex', background: 'var(--adm-surface)', border: '1px solid var(--adm-border)', borderRadius: '8px', padding: '2px' }}>
            <button
              className={`adm-btn adm-btn-sm ${viewMode === 'board' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
              style={{ border: 'none', padding: '0.35rem 0.65rem' }}
              onClick={() => setViewMode('board')}
              title="Kanban Board View"
            >
              <Columns size={14} />
              <span>Board</span>
            </button>
            <button
              className={`adm-btn adm-btn-sm ${viewMode === 'table' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
              style={{ border: 'none', padding: '0.35rem 0.65rem' }}
              onClick={() => setViewMode('table')}
              title="18-Field Enterprise Table View"
            >
              <List size={14} />
              <span>18-Field Table</span>
            </button>
          </div>

          {!isEmployee && (
            <button className="adm-btn adm-btn-primary" onClick={handleOpenAddModal}>
              <Plus size={16} />
              <span>Commission Task (Manager Flow)</span>
            </button>
          )}
        </div>
      </div>

      {/* ── LIVE ACTIVE STOPWATCH BAR WITH ANTI-TAMPER IDLE SHIELD ── */}
      {activeTimerTaskId && activeTimerTask && (
        <div
          className="adm-card"
          style={{
            padding: '0.75rem 1.15rem',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: isIdlePaused ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.04)',
            border: isIdlePaused ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: isIdlePaused ? '#f59e0b' : isTimerRunning ? '#10b981' : '#64748b',
                display: 'inline-block',
                boxShadow: isTimerRunning && !isIdlePaused ? '0 0 8px #10b981' : 'none'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--adm-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Active Live Sprint Timer &bull; {activeTimerTask.taskId || activeTimerTask.id}
                </span>
                {isIdlePaused && (
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                    ⚠️ IDLE DETECTED (AUTO-PAUSED)
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--adm-text)' }}>
                {activeTimerTask.title} <span style={{ fontWeight: 400, color: 'var(--adm-text-muted)' }}>({activeTimerTask.projectName})</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.08)',
                padding: '2px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              ⏱ {formatStopwatch(timerSeconds)}
            </div>

            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {isTimerRunning ? (
                <button
                  className="adm-btn adm-btn-secondary adm-btn-sm"
                  onClick={handlePauseTimer}
                  title="Pause Timer"
                >
                  <Pause size={13} />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  className="adm-btn adm-btn-secondary adm-btn-sm"
                  onClick={() => setIsTimerRunning(true)}
                  title="Resume Timer"
                >
                  <Play size={13} />
                  <span>Resume</span>
                </button>
              )}

              <button
                className="adm-btn adm-btn-sm"
                style={{ background: '#10b981', color: '#fff', border: 'none' }}
                onClick={() => handleStopAndLogTimer(activeTimerTaskId)}
                title="Stop and record time to sprint task"
              >
                <Square size={12} fill="#fff" />
                <span>Stop & Log</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Filters & Search Toolbar ── */}
      <div
        className="adm-card"
        style={{
          padding: '0.85rem 1.15rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: '220px', flex: 1, maxWidth: '340px' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-muted)' }}
            />
            <input
              type="text"
              className="adm-input"
              placeholder="Search by ID, title, module, engineer..."
              style={{ paddingLeft: '32px', fontSize: '0.82rem' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Module Filter */}
          <select
            className="adm-select"
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            style={{ fontSize: '0.82rem', maxWidth: '200px' }}
          >
            <option value="All">All Modules</option>
            {MODULE_OPTIONS.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            className="adm-select"
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            style={{ fontSize: '0.82rem', width: '130px' }}
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          {/* Scope Filter */}
          <div style={{ display: 'flex', background: 'var(--adm-bg)', border: '1px solid var(--adm-border)', borderRadius: '6px', padding: '2px' }}>
            <button
              type="button"
              className={`adm-btn adm-btn-sm ${taskViewFilter === 'my' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
              style={{ border: 'none', padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
              onClick={() => setTaskViewFilter('my')}
            >
              My Tasks
            </button>
            <button
              type="button"
              className={`adm-btn adm-btn-sm ${taskViewFilter === 'all' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
              style={{ border: 'none', padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
              onClick={() => setTaskViewFilter('all')}
            >
              All Organization Tasks
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showAllStages}
              onChange={e => setShowAllStages(e.target.checked)}
              style={{ accentColor: 'var(--adm-primary)' }}
            />
            Show All 9 Lifecycle Stages
          </label>
          <span style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)', fontWeight: 600 }}>
            {filteredTasks.length} Tasks
          </span>
        </div>
      </div>

      {/* ── VIEW 1: KANBAN BOARD (9-STAGE LIFECYCLE) ── */}
      {viewMode === 'board' && (
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            overflowX: 'auto',
            paddingBottom: '1rem',
            alignItems: 'flex-start'
          }}
        >
          {displayedColumns.map(colDef => {
            const colTasks = filteredTasks.filter(t => normalizeStatus(t.status) === colDef.stage);

            return (
              <div
                key={colDef.stage}
                style={{
                  minWidth: '290px',
                  width: '290px',
                  flexShrink: 0,
                  background: 'var(--adm-surface, #ffffff)',
                  border: '1px solid var(--adm-border)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 'calc(100vh - 270px)'
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    borderBottom: '1px solid var(--adm-border)',
                    borderTop: `3px solid ${colDef.color}`,
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.01)'
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                      {colDef.label}
                    </h3>
                    <div style={{ fontSize: '0.68rem', color: 'var(--adm-text-muted)' }}>{colDef.desc}</div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: 'var(--adm-bg)',
                      border: '1px solid var(--adm-border)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      color: 'var(--adm-text)'
                    }}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Task Cards */}
                <div
                  style={{
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    overflowY: 'auto',
                    flex: 1
                  }}
                >
                  {colTasks.map(t => {
                    const isThisTaskTimerActive = activeTimerTaskId === t.id && isTimerRunning;
                    const workloadInfo = getAssigneeWorkload(t.assignedTo);
                    const safeSubtasks = t.subtasks || [];
                    const completedSubtasks = safeSubtasks.filter(s => s.completed).length;
                    const safeCriteria = t.acceptanceCriteria || [];
                    const completedCriteria = safeCriteria.filter(c => c.met).length;

                    return (
                      <div
                        key={t.id}
                        className={`adm-kanban-card ${selectedTask?.id === t.id ? 'adm-kanban-card-active' : ''}`}
                        style={{
                          cursor: 'pointer',
                          borderLeft: isThisTaskTimerActive
                            ? '3px solid var(--adm-success, #10b981)'
                            : `3px solid ${colDef.color}`,
                          boxShadow: selectedTask?.id === t.id ? '0 4px 16px rgba(0,0,0,0.08)' : undefined,
                          transition: 'all 0.15s ease'
                        }}
                        onClick={() => setSelectedTask(t)}
                      >
                        {/* Top ID & Priority & Actions */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '4px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              fontSize: '0.68rem',
                              color: 'var(--adm-primary)'
                            }}
                          >
                            {t.taskId || t.id}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span
                              className={`adm-badge ${
                                t.priority === 'Urgent'
                                  ? 'adm-badge-danger'
                                  : t.priority === 'High'
                                  ? 'adm-badge-warning'
                                  : 'adm-badge-neutral'
                              }`}
                              style={{ fontSize: '0.62rem', padding: '1px 5px' }}
                            >
                              {t.priority}
                            </span>

                            {/* Card Edit CRUD Button */}
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleOpenEditModal(t);
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--adm-text-muted)',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'inline-flex'
                              }}
                              title="Edit Task Details"
                            >
                              <Edit size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text)', margin: '2px 0 4px 0', lineHeight: 1.3 }}>
                          {t.title}
                        </h4>

                        {/* Project & Module Badge */}
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--adm-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <FolderGit2 size={10} /> {t.projectName}
                          </span>
                          {t.module && (
                            <span style={{ fontSize: '0.66rem', color: '#6366f1', background: 'rgba(99, 102, 241, 0.08)', padding: '1px 5px', borderRadius: '4px' }}>
                              {t.module}
                            </span>
                          )}
                        </div>

                        {/* Reviewer Note Alert if Changes Required */}
                        {t.reviewNotes && (
                          <div
                            style={{
                              background: 'rgba(239, 68, 68, 0.08)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              marginBottom: '6px',
                              fontSize: '0.7rem',
                              color: '#dc2626'
                            }}
                          >
                            <strong>Reviewer:</strong> {t.reviewNotes}
                          </div>
                        )}

                        {/* Section 10 Criteria Status */}
                        {safeCriteria.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: 'var(--adm-text-muted)', marginBottom: '6px' }}>
                            <CheckSquare size={11} color="var(--adm-primary)" />
                            <span>Criteria: {completedCriteria}/{safeCriteria.length} met</span>
                          </div>
                        )}

                        {/* Assignee & Due Date */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.72rem',
                            paddingTop: '6px',
                            borderTop: '1px solid var(--adm-border)'
                          }}
                        >
                          <span style={{ fontWeight: 600, color: 'var(--adm-text)' }} title={`Assigned to: ${t.assignedTo}`}>
                            {t.assignedTo}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--adm-text-muted)' }}>
                            <Calendar size={11} /> {t.dueDate}
                          </span>
                        </div>

                        {/* Subtasks Progress & Assignee Load */}
                        {safeSubtasks.length > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.67rem', color: 'var(--adm-text-muted)', marginTop: '4px' }}>
                            <span>Subtasks ({completedSubtasks}/{safeSubtasks.length})</span>
                            <span style={{ color: workloadInfo.color, fontWeight: 700 }}>{workloadInfo.percent}% Load</span>
                          </div>
                        )}

                        {/* ── CARD ACTION CONTROLS: STOPWATCH & PIPELINE ── */}
                        <div
                          style={{
                            marginTop: '6px',
                            paddingTop: '6px',
                            borderTop: '1px solid var(--adm-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {/* Stopwatch Button */}
                          {isThisTaskTimerActive ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#10b981', fontWeight: 800 }}>
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
                                  padding: '1px 4px',
                                  fontSize: '0.65rem',
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
                                  padding: '1px 5px',
                                  fontSize: '0.65rem',
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
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                cursor: 'pointer'
                              }}
                              title="Start Stopwatch on this Task"
                            >
                              <Play size={10} color="#10b981" />
                              <span>{t.loggedHours}h logged</span>
                            </button>
                          )}

                          {/* Quick Lifecycle Action */}
                          {colDef.stage === 'Backlog' && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                updateTaskStatus(t.id, 'Assigned');
                              }}
                              style={{
                                background: 'rgba(2, 132, 199, 0.1)',
                                border: '1px solid rgba(2, 132, 199, 0.3)',
                                color: '#0284c7',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Assign →
                            </button>
                          )}

                          {colDef.stage === 'Assigned' && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                updateTaskStatus(t.id, 'In Progress');
                              }}
                              style={{
                                background: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                color: '#3b82f6',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Start →
                            </button>
                          )}

                          {colDef.stage === 'In Progress' && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                submitTaskForReview(t.id);
                              }}
                              style={{
                                background: 'rgba(245, 158, 11, 0.12)',
                                border: '1px solid rgba(245, 158, 11, 0.4)',
                                color: '#d97706',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Submit Review
                            </button>
                          )}

                          {colDef.stage === 'In Review' && (
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
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              ✓ Approve
                            </button>
                          )}

                          {colDef.stage === 'Approved' && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                updateTaskStatus(t.id, 'Completed');
                              }}
                              style={{
                                background: '#059669',
                                border: 'none',
                                color: '#fff',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Complete ✓
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--adm-text-dim)', fontSize: '0.75rem' }}>
                      No tasks in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── VIEW 2: 18-FIELD ENTERPRISE TABLE VIEW ── */}
      {viewMode === 'table' && (
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th>1. ID</th>
                <th>2. Task Title</th>
                <th>4. Project</th>
                <th>5. Module</th>
                <th>6. Assigned By</th>
                <th>7. Assigned To</th>
                <th>8. Reviewer</th>
                <th>9. Priority</th>
                <th>10. Status</th>
                <th>11/12. SLA Dates</th>
                <th>13/14. Hours (Est/Act)</th>
                <th>18. Criteria</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(t => {
                const safeCriteria = t.acceptanceCriteria || [];
                const metCriteria = safeCriteria.filter(c => c.met).length;

                return (
                  <tr key={t.id} onClick={() => setSelectedTask(t)} style={{ cursor: 'pointer' }}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--adm-primary)' }}>
                        {t.taskId || t.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--adm-text)', fontSize: '0.85rem' }}>{t.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.description}
                      </div>
                    </td>
                    <td>
                      <span className="adm-badge adm-badge-primary" style={{ fontSize: '0.7rem' }}>
                        {t.projectName}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--adm-text)' }}>{t.module || 'Core'}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>{t.assignedBy || 'Rohit Pawar'}</span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.8rem', color: 'var(--adm-text)' }}>{t.assignedTo}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--adm-text)' }}>{t.reviewer || 'Rohit Pawar'}</span>
                    </td>
                    <td>
                      <span
                        className={`adm-badge ${
                          t.priority === 'Urgent'
                            ? 'adm-badge-danger'
                            : t.priority === 'High'
                            ? 'adm-badge-warning'
                            : 'adm-badge-neutral'
                        }`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`adm-badge ${t.status === 'Completed' || t.status === 'Approved' ? 'adm-badge-success' : t.status === 'In Progress' ? 'adm-badge-info' : 'adm-badge-neutral'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.74rem', color: 'var(--adm-text)' }}>Due: {t.dueDate}</div>
                      {t.startDate && <div style={{ fontSize: '0.68rem', color: 'var(--adm-text-muted)' }}>Start: {t.startDate}</div>}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                        {t.loggedHours}h / {t.estimatedHours}h
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.72rem', color: metCriteria === safeCriteria.length && safeCriteria.length > 0 ? '#10b981' : 'var(--adm-text-muted)' }}>
                        {safeCriteria.length > 0 ? `${metCriteria}/${safeCriteria.length} Met` : 'None'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                        <button
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                          onClick={() => setSelectedTask(t)}
                          title="View in Drawer"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                          onClick={() => handleOpenEditModal(t)}
                          title="Edit Task"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          className="adm-btn adm-btn-danger adm-btn-sm"
                          onClick={() => {
                            if (window.confirm(`Delete task "${t.title}" (${t.taskId || t.id})?`)) {
                              deleteTask(t.id);
                            }
                          }}
                          title="Delete Task"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── SCREEN-ADAPTIVE SLIDING TASK PREVIEW DRAWER ── */}
      {selectedTask && (
        <React.Suspense
          fallback={
            <div className="adm-drawer-overlay">
              <div className="adm-preview-drawer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="adm-spinner" />
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
            onEditTask={handleOpenEditModal}
            onUpdateTaskStatus={updateTaskStatus}
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

      {/* ── SECTION 11: COMMISSION TASK (MANAGER ASSIGNMENT FLOW MODAL) ── */}
      {showAddModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="adm-modal-content adm-modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px' }}>
            <div className="adm-modal-header">
              <div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--adm-primary)', background: 'rgba(255, 107, 0, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                    EWMS Section 11 Workflow
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                  Manager Task Assignment & Governance
                </h3>
              </div>
              <button className="adm-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Manager Flow Visual Stepper Banner */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.02)',
                border: '1px solid var(--adm-border)',
                borderRadius: '8px',
                padding: '0.65rem 0.9rem',
                marginBottom: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--adm-text)',
                flexWrap: 'wrap'
              }}
            >
              <span style={{ color: 'var(--adm-primary)' }}>1. Select Project</span>
              <ArrowRight size={12} color="var(--adm-text-muted)" />
              <span style={{ color: 'var(--adm-primary)' }}>2. Select Employee</span>
              <ArrowRight size={12} color="var(--adm-text-muted)" />
              <span style={{ color: 'var(--adm-primary)' }}>3. Set Est. Hours</span>
              <ArrowRight size={12} color="var(--adm-text-muted)" />
              <span style={{ color: 'var(--adm-primary)' }}>4. Set Deadline</span>
              <ArrowRight size={12} color="var(--adm-text-muted)" />
              <span style={{ color: 'var(--adm-primary)' }}>5. Set Priority</span>
              <ArrowRight size={12} color="var(--adm-text-muted)" />
              <span style={{ color: 'var(--adm-primary)' }}>6. Set Reviewer</span>
              <ArrowRight size={12} color="var(--adm-text-muted)" />
              <span style={{ color: '#10b981' }}>7. Assign</span>
            </div>

            <form onSubmit={handleCreateSubmit}>
              {/* Step 1: Project & Module & ID */}
              <div className="adm-grid-3">
                <div className="adm-form-group">
                  <label className="adm-form-label">1. Task ID (Field 1) *</label>
                  <input
                    className="adm-input"
                    required
                    value={fTaskId}
                    onChange={e => setFTaskId(e.target.value)}
                    placeholder="e.g. TSK-2026-001"
                    style={{ fontFamily: 'monospace', fontWeight: 700 }}
                  />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">4. Select Project (Field 4) *</label>
                  <select className="adm-select" value={fProjectId} onChange={e => setFProjectId(e.target.value)} required>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.clientName})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">5. System Module (Field 5) *</label>
                  <select className="adm-select" value={fModule} onChange={e => setFModule(e.target.value)}>
                    {MODULE_OPTIONS.map(m => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Task Title */}
              <div className="adm-form-group">
                <label className="adm-form-label">2. Task Title (Field 2) *</label>
                <input
                  className="adm-input"
                  required
                  value={fTitle}
                  onChange={e => setFTitle(e.target.value)}
                  placeholder="e.g. Implement Webhook Dispatcher with Exponential Backoff"
                />
              </div>

              {/* Step 2: Employee Delegation & Reviewer */}
              <div className="adm-grid-3">
                <div className="adm-form-group">
                  <label className="adm-form-label">7. Select Employee / Assignee *</label>
                  <select className="adm-select" value={fAssignedTo} onChange={e => setFAssignedTo(e.target.value)} required>
                    {employees.map(e => {
                      const load = getAssigneeWorkload(e.name);
                      return (
                        <option key={e.id} value={e.name}>
                          {e.name} ({load.percent}% load)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">6. Assigned By (Field 6) *</label>
                  <input
                    className="adm-input"
                    value={fAssignedBy}
                    onChange={e => setFAssignedBy(e.target.value)}
                    placeholder="e.g. Rohit Pawar (Technical Director)"
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">8. Set Reviewer (Field 8) *</label>
                  <input
                    className="adm-input"
                    value={fReviewer}
                    onChange={e => setFReviewer(e.target.value)}
                    placeholder="e.g. Rohit Pawar"
                  />
                </div>
              </div>

              {/* Step 3: SLA, Hours & Priority */}
              <div className="adm-grid-4">
                <div className="adm-form-group">
                  <label className="adm-form-label">13. Set Estimated Hours *</label>
                  <input
                    className="adm-input"
                    type="number"
                    min="1"
                    step="0.5"
                    value={fHours}
                    onChange={e => setFHours(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">11. Start Date</label>
                  <input className="adm-input" type="date" value={fStartDate} onChange={e => setFStartDate(e.target.value)} />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">12. Set Deadline / Due Date *</label>
                  <input className="adm-input" type="date" value={fDue} onChange={e => setFDue(e.target.value)} required />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">9. Set Priority *</label>
                  <select className="adm-select" value={fPriority} onChange={e => setFPriority(e.target.value as any)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Status & Dependencies */}
              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">10. Initial Status</label>
                  <select className="adm-select" value={fStatus} onChange={e => setFStatus(e.target.value as any)}>
                    <option value="Backlog">Backlog</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">15. Dependencies (Field 15)</label>
                  <input
                    className="adm-input"
                    value={fDependencies}
                    onChange={e => setFDependencies(e.target.value)}
                    placeholder="e.g. TSK-2026-001, API Gateway Auth"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="adm-form-group">
                <label className="adm-form-label">3. Task Description & Scope (Field 3)</label>
                <textarea
                  className="adm-textarea"
                  rows={3}
                  value={fDesc}
                  onChange={e => setFDesc(e.target.value)}
                  placeholder="Technical scope, architectural expectations, and constraints..."
                />
              </div>

              {/* Field 18: Acceptance Criteria */}
              <div className="adm-form-group">
                <label className="adm-form-label">18. Acceptance Criteria Checklist (Field 18)</label>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="Add technical acceptance criterion (e.g. HMAC signature validation)..."
                    value={fNewCriterion}
                    onChange={e => setFNewCriterion(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCriterion();
                      }
                    }}
                  />
                  <button type="button" className="adm-btn adm-btn-secondary" onClick={handleAddCriterion}>
                    + Add
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {fCriteria.map((cr, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '6px 10px',
                        background: 'var(--adm-bg)',
                        border: '1px solid var(--adm-border)',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.8rem'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckSquare size={13} color="var(--adm-primary)" />
                        {cr}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCriterion(idx)}
                        style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary">
                  Commission & Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT TASK MODAL (ALL 18 FIELDS) ── */}
      {showEditModal && editingTask && (
        <div className="adm-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="adm-modal-content adm-modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px' }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                  Edit Task &bull; {editingTask.taskId || editingTask.id}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)', margin: '2px 0 0 0' }}>
                  Update any of the 18 architecture specification fields
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setShowEditModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="adm-grid-3">
                <div className="adm-form-group">
                  <label className="adm-form-label">1. Task ID</label>
                  <input
                    className="adm-input"
                    value={eTaskId}
                    onChange={e => setETaskId(e.target.value)}
                    style={{ fontFamily: 'monospace', fontWeight: 700 }}
                  />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">4. Project</label>
                  <select className="adm-select" value={eProjectId} onChange={e => setEProjectId(e.target.value)}>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">5. Module</label>
                  <select className="adm-select" value={eModule} onChange={e => setEModule(e.target.value)}>
                    {MODULE_OPTIONS.map(m => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">2. Task Title *</label>
                <input
                  className="adm-input"
                  required
                  value={eTitle}
                  onChange={e => setETitle(e.target.value)}
                />
              </div>

              <div className="adm-grid-3">
                <div className="adm-form-group">
                  <label className="adm-form-label">7. Assigned To (Employee) *</label>
                  <select className="adm-select" value={eAssignedTo} onChange={e => setEAssignedTo(e.target.value)}>
                    {employees.map(e => (
                      <option key={e.id} value={e.name}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">6. Assigned By</label>
                  <input
                    className="adm-input"
                    value={eAssignedBy}
                    onChange={e => setEAssignedBy(e.target.value)}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">8. Reviewer / Lead</label>
                  <input
                    className="adm-input"
                    value={eReviewer}
                    onChange={e => setEReviewer(e.target.value)}
                  />
                </div>
              </div>

              <div className="adm-grid-4">
                <div className="adm-form-group">
                  <label className="adm-form-label">13. Est. Hours</label>
                  <input
                    className="adm-input"
                    type="number"
                    step="0.5"
                    value={eHours}
                    onChange={e => setEHours(Number(e.target.value))}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">11. Start Date</label>
                  <input className="adm-input" type="date" value={eStartDate} onChange={e => setEStartDate(e.target.value)} />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">12. Due Date</label>
                  <input className="adm-input" type="date" value={eDue} onChange={e => setEDue(e.target.value)} />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">9. Priority</label>
                  <select className="adm-select" value={ePriority} onChange={e => setEPriority(e.target.value as any)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">10. Lifecycle Status</label>
                  <select className="adm-select" value={eStatus} onChange={e => setEStatus(e.target.value as any)}>
                    {NINE_STAGE_LIFECYCLE.map(item => (
                      <option key={item.stage} value={item.stage}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">15. Dependencies</label>
                  <input
                    className="adm-input"
                    value={eDependencies}
                    onChange={e => setEDependencies(e.target.value)}
                  />
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">3. Description</label>
                <textarea
                  className="adm-textarea"
                  rows={3}
                  value={eDesc}
                  onChange={e => setEDesc(e.target.value)}
                />
              </div>

              {/* Acceptance Criteria in Edit */}
              <div className="adm-form-group">
                <label className="adm-form-label">18. Acceptance Criteria Gates</label>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="Add new criteria..."
                    value={eNewCriterion}
                    onChange={e => setENewCriterion(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEditCriterion();
                      }
                    }}
                  />
                  <button type="button" className="adm-btn adm-btn-secondary" onClick={handleAddEditCriterion}>
                    + Add
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {eCriteria.map(cr => (
                    <div
                      key={cr.id}
                      style={{
                        padding: '6px 10px',
                        background: 'var(--adm-bg)',
                        border: '1px solid var(--adm-border)',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.8rem'
                      }}
                    >
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={cr.met}
                          onChange={() => {
                            setECriteria(prev =>
                              prev.map(c => (c.id === cr.id ? { ...c, met: !c.met } : c))
                            );
                          }}
                          style={{ accentColor: '#10b981' }}
                        />
                        <span style={{ textDecoration: cr.met ? 'line-through' : 'none' }}>{cr.text}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveEditCriterion(cr.id)}
                        style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default TasksPage;
