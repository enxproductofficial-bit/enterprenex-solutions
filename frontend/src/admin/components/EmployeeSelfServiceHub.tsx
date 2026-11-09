/**
 * EmployeeSelfServiceHub.tsx
 * EWMS Role 3: Employee Individual Delivery Portal
 * ---------------------------------------------------
 * Features:
 *  1. My Workspace (Profile, EMP ID, Dept, Manager)
 *  2. My Tasks (Accept → In Progress → Submit for Review)
 *  3. Anti-Tamper Monitored Stopwatch (auto-pause on tab switch / 2min idle)
 *  4. Biometric Attendance (Punch In / Punch Out)
 *  5. Leave Applications & Balances (CL / SL / PL)
 *  6. 1-on-1 Communication Hub (WhatsApp / Call / Meet with Manager)
 *  7. Support & Resource Request Desk (Ticket submission)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAdmin } from '../context/AdminContext';
import type { Task, LeaveRequest, SupportTicket } from '../types';
import {
  User, Briefcase, Clock, Calendar, MessageCircle,
  Ticket, ChevronRight, Play, Pause, Square,
  Phone, Mail, Video, CheckCircle, AlertCircle,
  PlusCircle, LogIn, LogOut, FileText, Shield,
  Bell, Star, TrendingUp, Zap, Coffee, ArrowRight,
  RefreshCw, Send, X, Check, ChevronDown, Activity
} from 'lucide-react';

// ── Tab Definitions ──
type HubTab = 'workspace' | 'tasks' | 'attendance' | 'leaves' | 'communication' | 'tickets';

const TABS: { key: HubTab; label: string; icon: React.ReactNode }[] = [
  { key: 'workspace',     label: 'My Workspace',    icon: <User size={15} /> },
  { key: 'tasks',         label: 'My Tasks',         icon: <Briefcase size={15} /> },
  { key: 'attendance',    label: 'Attendance',       icon: <Clock size={15} /> },
  { key: 'leaves',        label: 'Leave',            icon: <Calendar size={15} /> },
  { key: 'communication', label: 'Communication',    icon: <MessageCircle size={15} /> },
  { key: 'tickets',       label: 'Support Desk',     icon: <Ticket size={15} /> },
];

// ── Helpers ──
const today = () => new Date().toISOString().split('T')[0];
const nowTime = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
const fmtTimer = (secs: number) => {
  const h = Math.floor(secs / 3600).toString().padStart(2, '0');
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

// ── Badge color helper ──
const statusColor: Record<string, string> = {
  'To Do':            '#64748b',
  'Backlog':          '#64748b',
  'In Progress':      '#3b82f6',
  'In Review':        '#f59e0b',
  'Revision Required':'#ef4444',
  'Approved':         '#10b981',
  'Completed':        '#059669',
  'Cancelled':        '#94a3b8',
  'Blocked':          '#dc2626',
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export const EmployeeSelfServiceHub: React.FC = () => {
  const {
    currentUser, employees, tasks, leaves, tickets, attendance,
    addLeaveRequest, addTicket, updateTaskStatus, submitTaskForReview,
    markAttendanceToday, showToast, addTaskComment
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<HubTab>('workspace');

  // ── Find employee record matching current user ──
  const myEmployee = employees.find(
    e => e.email === currentUser?.email || e.employeeId === currentUser?.employeeId
  );

  // ── My tasks (only tasks assigned to me) ──
  const myTasks = tasks.filter(t =>
    t.assignedTo === currentUser?.name ||
    t.assignedTo === myEmployee?.name
  );

  // ── My leaves ──
  const myLeaves = leaves.filter(l =>
    l.employeeName === currentUser?.name ||
    l.employeeName === myEmployee?.name
  );

  // ── My tickets ──
  const myTickets = tickets.filter(t =>
    t.clientName === currentUser?.name ||
    t.clientEmail === currentUser?.email
  );

  // ── My attendance ──
  const myAttendance = attendance.filter(a =>
    a.employeeId === myEmployee?.id || a.employeeName === currentUser?.name
  );
  const todayAttendance = myAttendance.find(a => a.date === today());

  // ─── SECTION: Anti-Tamper Stopwatch ───────────────────────────────
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const lastActivityRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tab visibility listener
  useEffect(() => {
    const handleVisibility = () => {
      const visible = document.visibilityState === 'visible';
      setIsTabVisible(visible);
      if (!visible && timerRunning) {
        setTimerRunning(false);
        showToast('⏸ Stopwatch Paused', 'Timer auto-paused — tab switched detected.', 'warning');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [timerRunning]);

  // Activity tracker (mouse / keyboard)
  useEffect(() => {
    const updateActivity = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
    };
  }, []);

  // Stopwatch tick with 2-minute inactivity cutoff
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        const idleMs = Date.now() - lastActivityRef.current;
        if (idleMs > 2 * 60 * 1000) {
          setTimerRunning(false);
          showToast('⏸ Idle Detected', 'Timer paused after 2 minutes of inactivity.', 'warning');
          return;
        }
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [timerRunning]);

  // 60-second server heartbeat
  useEffect(() => {
    if (timerRunning && activeTimerTaskId) {
      heartbeatRef.current = setInterval(async () => {
        try {
          const token = localStorage.getItem('ewms_token');
          await fetch(`/api/tasks/${activeTimerTaskId}/stopwatch/heartbeat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ elapsedSeconds: timerSeconds, employeeId: myEmployee?.id })
          });
        } catch { /* silent — network issue */ }
      }, 60000);
    } else {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    }
    return () => { if (heartbeatRef.current) clearInterval(heartbeatRef.current); };
  }, [timerRunning, activeTimerTaskId]);

  const startTimer = useCallback((taskId: string) => {
    setActiveTimerTaskId(taskId);
    setTimerSeconds(0);
    setTimerRunning(true);
    lastActivityRef.current = Date.now();
    showToast('▶ Timer Started', 'Anti-tamper stopwatch is now running. Stay active!', 'info');
  }, []);

  const pauseTimer = () => {
    setTimerRunning(false);
    showToast('⏸ Timer Paused', 'Resume when ready.', 'info');
  };

  const stopTimer = async () => {
    setTimerRunning(false);
    const hours = +(timerSeconds / 3600).toFixed(2);
    if (activeTimerTaskId && hours > 0) {
      try {
        const token = localStorage.getItem('ewms_token');
        await fetch(`/api/tasks/${activeTimerTaskId}/stopwatch/stop`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ elapsedSeconds: timerSeconds, employeeId: myEmployee?.id })
        });
      } catch { /* silent */ }
      showToast('✅ Time Logged', `+${hours} hrs logged to task.`, 'success');
    }
    setActiveTimerTaskId(null);
    setTimerSeconds(0);
  };

  // ─── SECTION: Leave form ──────────────────────────────────────────
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    type: 'Casual Leave' as LeaveRequest['type'],
    startDate: today(),
    endDate: today(),
    reason: ''
  });

  const submitLeave = () => {
    if (!leaveForm.reason.trim()) { showToast('Required', 'Please enter a reason.', 'warning'); return; }
    addLeaveRequest({
      employeeName: currentUser?.name || myEmployee?.name || 'Employee',
      type: leaveForm.type,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      reason: leaveForm.reason
    });
    setShowLeaveForm(false);
    setLeaveForm({ type: 'Casual Leave', startDate: today(), endDate: today(), reason: '' });
    showToast('✅ Leave Applied', 'Your leave request has been submitted for manager approval.', 'success');
  };

  // Leave balance (computed)
  const approvedLeaves = myLeaves.filter(l => l.status === 'Approved');
  const usedCL = approvedLeaves.filter(l => l.type === 'Casual Leave').length;
  const usedSL = approvedLeaves.filter(l => l.type === 'Sick Leave').length;
  const usedPL = approvedLeaves.filter(l => l.type === 'Paid Leave').length;

  // ─── SECTION: Ticket form ─────────────────────────────────────────
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'HR & Stipend' as SupportTicket['category'],
    priority: 'Medium' as SupportTicket['priority'],
    description: ''
  });

  const submitTicket = () => {
    if (!ticketForm.subject.trim()) { showToast('Required', 'Enter a subject.', 'warning'); return; }
    addTicket({
      ticketNumber: 'TKT-' + Date.now().toString().slice(-6),
      subject: ticketForm.subject,
      clientName: currentUser?.name || 'Employee',
      clientEmail: currentUser?.email,
      priority: ticketForm.priority,
      status: 'Open',
      assignedTo: myEmployee?.reportingManager || 'Manager',
      category: ticketForm.category,
      slaHoursRemaining: 24,
    });
    setShowTicketForm(false);
    setTicketForm({ subject: '', category: 'HR & Stipend', priority: 'Medium', description: '' });
    showToast('🎫 Ticket Raised', 'Support ticket submitted. You will be notified on updates.', 'success');
  };

  // ─── Attendance punch ─────────────────────────────────────────────
  const [punchLoading, setPunchLoading] = useState(false);

  const handlePunchIn = async () => {
    setPunchLoading(true);
    setTimeout(() => {
      markAttendanceToday('Present');
      showToast('✅ Punched In', `Attendance recorded at ${nowTime()}`, 'success');
      setPunchLoading(false);
    }, 800);
  };

  const handlePunchOut = () => {
    showToast('👋 Punched Out', `See you tomorrow! Time: ${nowTime()}`, 'info');
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--adm-bg, #0f172a)', color: 'var(--adm-text, #e2e8f0)', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderBottom: '1px solid rgba(99,102,241,0.2)', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
              {(currentUser?.name || 'E')[0].toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>
                👋 {currentUser?.name || 'Employee'}
              </h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                {myEmployee?.employeeId || currentUser?.employeeId || 'ZCX-EMP-XXXX'} · {myEmployee?.department || currentUser?.department || 'Engineering'}
              </p>
            </div>
          </div>
          {/* Live stopwatch pill */}
          {timerRunning && (
            <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 20, padding: '0.3rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={13} color="#10b981" />
              <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>{fmtTimer(timerSeconds)}</span>
              <span style={{ fontSize: '0.68rem', color: '#6ee7b7' }}>LIVE</span>
            </div>
          )}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: '0.25rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '2px' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.4rem 0.9rem', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap',
                background: activeTab === tab.key ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.05)',
                color: activeTab === tab.key ? '#fff' : '#94a3b8',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>

        {/* ════════════════════════════════
            TAB 1: MY WORKSPACE
        ════════════════════════════════ */}
        {activeTab === 'workspace' && (
          <div>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#c7d2fe' }}>🗂 My Workspace</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>

              {/* Profile card */}
              <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>
                    {(currentUser?.name || 'E')[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#f1f5f9' }}>{currentUser?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{myEmployee?.designation || myEmployee?.role || currentUser?.role}</div>
                  </div>
                </div>
                {[
                  { label: 'Employee ID', value: myEmployee?.employeeId || currentUser?.employeeId || '—' },
                  { label: 'Department',  value: myEmployee?.department || currentUser?.department || '—' },
                  { label: 'Manager',     value: myEmployee?.reportingManager || '—' },
                  { label: 'Work Mode',   value: myEmployee?.workMode || 'Office' },
                  { label: 'Email',       value: currentUser?.email || '—' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
                    <span style={{ color: '#64748b' }}>{row.label}</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 500, maxWidth: '55%', textAlign: 'right', wordBreak: 'break-all' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Quick stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { icon: <Briefcase size={18} color="#6366f1" />, label: 'Active Tasks',    value: myTasks.filter(t => t.status === 'In Progress').length, bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.3)' },
                  { icon: <CheckCircle size={18} color="#10b981" />, label: 'Completed',      value: myTasks.filter(t => t.status === 'Completed' || t.status === 'Approved').length, bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
                  { icon: <Calendar size={18} color="#f59e0b" />,   label: 'Pending Leaves', value: myLeaves.filter(l => l.status === 'Pending').length, bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
                  { icon: <Ticket size={18} color="#8b5cf6" />,     label: 'Open Tickets',   value: myTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length, bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: stat.bg, border: `1px solid ${stat.border}`, borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {stat.icon}
                    <span style={{ flex: 1, fontSize: '0.82rem', color: '#cbd5e1' }}>{stat.label}</span>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9' }}>{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* KPI / Performance */}
              <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <TrendingUp size={15} color="#6366f1" />
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#c7d2fe' }}>Performance Overview</span>
                </div>
                {[
                  { label: 'KPI Score',   value: myEmployee?.kpiScore ?? 72, color: '#6366f1' },
                  { label: 'OKR Score',   value: myEmployee?.okrScore ?? 65, color: '#8b5cf6' },
                  { label: 'Workload',    value: myEmployee?.workloadPercentage ?? 60, color: '#f59e0b' },
                  { label: 'Rating',      value: (myEmployee?.performanceRating ?? 3.5) * 20, color: '#10b981' },
                ].map(item => (
                  <div key={item.label} style={{ marginBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                      <span>{item.label}</span><span style={{ color: item.color, fontWeight: 600 }}>{item.value}%</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${item.value}%`, height: '100%', background: item.color, borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            TAB 2: MY TASKS
        ════════════════════════════════ */}
        {activeTab === 'tasks' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#c7d2fe' }}>📋 My Tasks & Deliverables</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{myTasks.length} total tasks</span>
            </div>

            {/* Active stopwatch bar */}
            {activeTimerTaskId && (
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Activity size={16} color="#10b981" />
                <span style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>{fmtTimer(timerSeconds)}</span>
                <span style={{ fontSize: '0.78rem', color: '#6ee7b7', flex: 1 }}>
                  Tracking: <strong>{myTasks.find(t => t.id === activeTimerTaskId)?.title || 'Task'}</strong>
                </span>
                <button onClick={timerRunning ? pauseTimer : () => setTimerRunning(true)} style={{ background: timerRunning ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)', border: `1px solid ${timerRunning ? '#f59e0b' : '#10b981'}`, borderRadius: 6, padding: '0.3rem 0.7rem', color: timerRunning ? '#f59e0b' : '#10b981', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {timerRunning ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Resume</>}
                </button>
                <button onClick={stopTimer} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 6, padding: '0.3rem 0.7rem', color: '#f87171', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Square size={12} /> Stop & Log
                </button>
              </div>
            )}

            {myTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
                <Briefcase size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p>No tasks assigned yet. Your manager will assign tasks soon.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {myTasks.map(task => (
                  <div key={task.id} style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '1rem', transition: 'border-color 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace' }}>{task.taskId || task.id}</span>
                        <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.9rem', marginTop: '0.1rem' }}>{task.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{task.projectName} · Due: {task.dueDate}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {/* Status badge */}
                        <span style={{ background: `${statusColor[task.status] || '#64748b'}22`, border: `1px solid ${statusColor[task.status] || '#64748b'}55`, color: statusColor[task.status] || '#94a3b8', borderRadius: 20, padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 600 }}>
                          {task.status}
                        </span>
                        {/* Priority badge */}
                        <span style={{ background: task.priority === 'Urgent' ? 'rgba(239,68,68,0.15)' : task.priority === 'High' ? 'rgba(245,158,11,0.15)' : 'rgba(100,116,139,0.15)', color: task.priority === 'Urgent' ? '#f87171' : task.priority === 'High' ? '#fbbf24' : '#94a3b8', borderRadius: 20, padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 600 }}>
                          {task.priority}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons — Employee lifecycle: Accept → In Progress → Submit for Review */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      {(task.status === 'To Do' || task.status === 'Backlog') && (
                        <button
                          onClick={() => { updateTaskStatus(task.id, 'In Progress'); showToast('✅ Task Accepted', `You accepted: ${task.title}`, 'success'); }}
                          style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', borderRadius: 6, padding: '0.3rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                          <Check size={12} style={{ marginRight: 4 }} />Accept Task
                        </button>
                      )}
                      {task.status === 'In Progress' && (
                        <>
                          {activeTimerTaskId !== task.id && (
                            <button
                              onClick={() => startTimer(task.id)}
                              style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#6ee7b7', borderRadius: 6, padding: '0.3rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                              <Play size={11} /> Start Timer
                            </button>
                          )}
                          <button
                            onClick={() => submitTaskForReview(task.id, 'Submitting for manager review')}
                            style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', color: '#fbbf24', borderRadius: 6, padding: '0.3rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <ArrowRight size={11} /> Submit for Review
                          </button>
                        </>
                      )}
                      {task.status === 'Revision Required' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'In Progress')}
                          style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', borderRadius: 6, padding: '0.3rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                          <RefreshCw size={11} style={{ marginRight: 4 }} />Rework
                        </button>
                      )}
                      {/* Logged hours */}
                      <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#475569', alignSelf: 'center' }}>
                        <Clock size={11} style={{ marginRight: 3 }} />
                        {task.loggedHours}h / {task.estimatedHours}h
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════
            TAB 3: ATTENDANCE
        ════════════════════════════════ */}
        {activeTab === 'attendance' && (
          <div>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#c7d2fe' }}>🕐 Biometric Attendance</h3>

            {/* Punch card */}
            <div style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.25rem' }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div style={{ fontSize: '2rem', fontFamily: 'monospace', fontWeight: 700, color: '#f1f5f9', marginBottom: '1rem' }}>
                {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </div>

              {todayAttendance ? (
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem' }}>
                  <CheckCircle size={16} color="#10b981" style={{ marginRight: 6 }} />
                  <span style={{ color: '#6ee7b7', fontWeight: 600 }}>Attendance Marked — {todayAttendance.status}</span>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Check-in: {todayAttendance.checkIn}</div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button
                    onClick={handlePunchIn}
                    disabled={punchLoading}
                    style={{ background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none', borderRadius: 10, padding: '0.75rem 2rem', color: '#fff', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <LogIn size={16} /> {punchLoading ? 'Recording...' : 'Punch In'}
                  </button>
                  <button
                    onClick={handlePunchOut}
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 10, padding: '0.75rem 2rem', color: '#f87171', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <LogOut size={16} /> Punch Out
                  </button>
                </div>
              )}
            </div>

            {/* Attendance history */}
            <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Recent Attendance</h4>
            <div style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Date', 'Check In', 'Check Out', 'Status'].map(h => (
                      <th key={h} style={{ padding: '0.6rem 1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myAttendance.slice(0, 10).length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: '#475569' }}>No attendance records found.</td></tr>
                  ) : myAttendance.slice(0, 10).map(rec => (
                    <tr key={rec.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.6rem 1rem', color: '#e2e8f0' }}>{rec.date}</td>
                      <td style={{ padding: '0.6rem 1rem', color: '#94a3b8' }}>{rec.checkIn || '—'}</td>
                      <td style={{ padding: '0.6rem 1rem', color: '#94a3b8' }}>{rec.checkOut || '—'}</td>
                      <td style={{ padding: '0.6rem 1rem' }}>
                        <span style={{ background: rec.status === 'Present' ? 'rgba(16,185,129,0.15)' : rec.status === 'Absent' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: rec.status === 'Present' ? '#10b981' : rec.status === 'Absent' ? '#ef4444' : '#f59e0b', borderRadius: 20, padding: '0.15rem 0.6rem', fontWeight: 600 }}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            TAB 4: LEAVE MANAGEMENT
        ════════════════════════════════ */}
        {activeTab === 'leaves' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#c7d2fe' }}>🌴 Leave Applications</h3>
              <button onClick={() => setShowLeaveForm(true)} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 8, padding: '0.4rem 1rem', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <PlusCircle size={13} /> Apply Leave
              </button>
            </div>

            {/* Leave balances */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {[
                { type: 'Casual Leave (CL)', total: 12, used: usedCL, color: '#6366f1' },
                { type: 'Sick Leave (SL)',   total: 10, used: usedSL, color: '#10b981' },
                { type: 'Paid Leave (PL)',   total: 15, used: usedPL, color: '#f59e0b' },
              ].map(lb => (
                <div key={lb.type} style={{ background: 'rgba(30,41,59,0.8)', border: `1px solid ${lb.color}33`, borderRadius: 10, padding: '0.9rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '0.25rem' }}>{lb.type}</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: lb.color }}>{lb.total - lb.used}</div>
                  <div style={{ fontSize: '0.68rem', color: '#475569' }}>available / {lb.total} total</div>
                </div>
              ))}
            </div>

            {/* Apply leave form modal */}
            {showLeaveForm && (
              <div style={{ background: 'rgba(30,41,59,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 600, color: '#c7d2fe' }}>📝 Apply for Leave</span>
                  <button onClick={() => setShowLeaveForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={16} /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Leave Type</label>
                    <select value={leaveForm.type} onChange={e => setLeaveForm(f => ({ ...f, type: e.target.value as LeaveRequest['type'] }))} className="adm-input" style={{ width: '100%', fontSize: '0.82rem' }}>
                      <option>Casual Leave</option>
                      <option>Sick Leave</option>
                      <option>Paid Leave</option>
                      <option>Unpaid</option>
                    </select>
                  </div>
                  <div />
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>From Date</label>
                    <input type="date" value={leaveForm.startDate} onChange={e => setLeaveForm(f => ({ ...f, startDate: e.target.value }))} className="adm-input" style={{ width: '100%', fontSize: '0.82rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>To Date</label>
                    <input type="date" value={leaveForm.endDate} onChange={e => setLeaveForm(f => ({ ...f, endDate: e.target.value }))} className="adm-input" style={{ width: '100%', fontSize: '0.82rem' }} />
                  </div>
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Reason *</label>
                  <textarea value={leaveForm.reason} onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))} className="adm-input" rows={3} placeholder="Briefly describe your reason..." style={{ width: '100%', fontSize: '0.82rem', resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={submitLeave} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 7, padding: '0.5rem 1.25rem', color: '#fff', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Submit Application</button>
                  <button onClick={() => setShowLeaveForm(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '0.5rem 1rem', color: '#94a3b8', fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}

            {/* Leave history */}
            {myLeaves.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}>No leave applications found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {myLeaves.map(l => (
                  <div key={l.id} style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#e2e8f0' }}>{l.type}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{l.startDate} → {l.endDate} · {l.reason}</div>
                    </div>
                    <span style={{ background: l.status === 'Approved' ? 'rgba(16,185,129,0.15)' : l.status === 'Rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: l.status === 'Approved' ? '#10b981' : l.status === 'Rejected' ? '#ef4444' : '#f59e0b', borderRadius: 20, padding: '0.2rem 0.75rem', fontSize: '0.72rem', fontWeight: 600 }}>
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════
            TAB 5: COMMUNICATION HUB
        ════════════════════════════════ */}
        {activeTab === 'communication' && (
          <div>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#c7d2fe' }}>💬 1-on-1 Communication Hub</h3>

            {/* Manager contact card */}
            {myEmployee?.reportingManager ? (
              <div style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                    {myEmployee.reportingManager[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#f1f5f9' }}>{myEmployee.reportingManager}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Your Reporting Manager</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {[
                    { icon: <Phone size={15} />, label: 'Call', color: '#10b981', href: `tel:` },
                    { icon: <MessageCircle size={15} />, label: 'WhatsApp', color: '#25D366', href: `https://wa.me/` },
                    { icon: <Video size={15} />, label: 'Google Meet', color: '#4285F4', href: `https://meet.google.com/new` },
                    { icon: <Mail size={15} />, label: 'Email', color: '#6366f1', href: `mailto:` },
                  ].map(action => (
                    <a key={action.label} href={action.href} target="_blank" rel="noopener noreferrer" style={{ flex: 1, minWidth: 120, background: `${action.color}18`, border: `1px solid ${action.color}44`, borderRadius: 8, padding: '0.6rem', textAlign: 'center', color: action.color, fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      {action.icon} {action.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.5rem', marginBottom: '1.25rem', textAlign: 'center', color: '#475569' }}>
                <Shield size={28} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p>No reporting manager assigned yet. Contact HR to update your profile.</p>
              </div>
            )}

            {/* Company contacts */}
            <h4 style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '0.5rem' }}>📞 Company Contacts</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
              {[
                { name: 'Rohit Pawar', role: 'Managing Director', icon: '👑' },
                { name: 'Jyoti', role: 'Project Manager / HR', icon: '📋' },
                { name: 'HR Department', role: 'Human Resources', icon: '🏢' },
              ].map(c => (
                <div key={c.name} style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '0.75rem' }}>
                  <div style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{c.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.83rem', color: '#e2e8f0' }}>{c.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.role}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            TAB 6: SUPPORT DESK
        ════════════════════════════════ */}
        {activeTab === 'tickets' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#c7d2fe' }}>🎫 Support & Resource Request Desk</h3>
              <button onClick={() => setShowTicketForm(true)} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 8, padding: '0.4rem 1rem', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <PlusCircle size={13} /> Raise Ticket
              </button>
            </div>

            {/* Ticket form */}
            {showTicketForm && (
              <div style={{ background: 'rgba(30,41,59,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 600, color: '#c7d2fe' }}>🎫 Raise a Support Ticket</span>
                  <button onClick={() => setShowTicketForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={16} /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Subject *</label>
                    <input value={ticketForm.subject} onChange={e => setTicketForm(f => ({ ...f, subject: e.target.value }))} className="adm-input" placeholder="Brief issue summary..." style={{ width: '100%', fontSize: '0.82rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Category</label>
                    <select value={ticketForm.category} onChange={e => setTicketForm(f => ({ ...f, category: e.target.value as SupportTicket['category'] }))} className="adm-input" style={{ width: '100%', fontSize: '0.82rem' }}>
                      <option>HR &amp; Stipend</option>
                      <option>Attendance Correction</option>
                      <option>Certificate Request</option>
                      <option>Leave &amp; Permission</option>
                      <option>IT &amp; Setup</option>
                      <option>General Query</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Priority</label>
                    <select value={ticketForm.priority} onChange={e => setTicketForm(f => ({ ...f, priority: e.target.value as SupportTicket['priority'] }))} className="adm-input" style={{ width: '100%', fontSize: '0.82rem' }}>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Description</label>
                    <textarea value={ticketForm.description} onChange={e => setTicketForm(f => ({ ...f, description: e.target.value }))} className="adm-input" rows={3} placeholder="Detailed description of the issue..." style={{ width: '100%', fontSize: '0.82rem', resize: 'vertical' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={submitTicket} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 7, padding: '0.5rem 1.25rem', color: '#fff', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Send size={13} /> Submit Ticket
                  </button>
                  <button onClick={() => setShowTicketForm(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '0.5rem 1rem', color: '#94a3b8', fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}

            {/* Ticket list */}
            {myTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: '#475569' }}>
                <Ticket size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p>No tickets raised yet. Use the button above to submit a request.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {myTickets.map(t => (
                  <div key={t.id} style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#475569' }}>{t.ticketNumber}</span>
                        <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>{t.subject}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>{t.category} · Created: {new Date(t.createdAt).toLocaleDateString('en-IN')}</div>
                      </div>
                      <span style={{ background: t.status === 'Resolved' ? 'rgba(16,185,129,0.15)' : t.status === 'Open' ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)', color: t.status === 'Resolved' ? '#10b981' : t.status === 'Open' ? '#818cf8' : '#f59e0b', borderRadius: 20, padding: '0.2rem 0.75rem', fontSize: '0.7rem', fontWeight: 600 }}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeSelfServiceHub;

