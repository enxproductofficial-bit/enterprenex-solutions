import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Users,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Target,
  LifeBuoy,
  ArrowUpRight,
  Activity,
  Plus,
  Clock,
  AlertTriangle,
  MessageSquare,
  Calendar,
  CheckSquare,
  ShieldAlert,
  ArrowRight,
  Check,
  X,
  Phone,
  Mail,
  MessageCircle,
  FolderGit2,
  Sliders,
  UserCheck,
  Share2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Task, TaskColumn, Employee, Project } from '../types';

export const DashboardPage: React.FC = () => {
  const {
    clients,
    projects,
    invoices,
    leads,
    tickets,
    employees,
    auditLogs,
    tasks,
    leaves,
    meetings,
    announcements,
    currentUser,
    updateLeaveStatus,
    updateTaskStatus,
    showToast
  } = useAdmin();

  const { t } = useLanguage();
  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState<'30D' | '90D' | '1Y'>('30D');

  const isDirector =
    currentUser?.role === 'Super Admin' ||
    currentUser?.email === 'director@enterprenex.solutions' ||
    currentUser?.email === 'director@enterprenexsolution.com';

  // Toggle between Executive (Director) View and Department Manager View
  const [activeDashboardMode, setActiveDashboardMode] = useState<'director' | 'manager'>(
    isDirector ? 'director' : 'manager'
  );

  // Safe Arrays
  const safeClients = clients || [];
  const safeProjects = projects || [];
  const safeInvoices = invoices || [];
  const safeLeads = leads || [];
  const safeTickets = tickets || [];
  const safeEmployees = employees || [];
  const safeAuditLogs = auditLogs || [];
  const safeTasks = tasks || [];
  const safeLeaves = leaves || [];
  const safeMeetings = meetings || [];
  const safeAnnouncements = announcements || [];

  const todayStr = new Date().toISOString().split('T')[0];

  // ── Executive Stats ──
  const totalClients = safeClients.length;
  const activeProjects = safeProjects.filter(p => p && p.status !== 'Delivered' && p.status !== 'Lead').length;
  const completedProjects = safeProjects.filter(p => p && p.status === 'Delivered').length;
  const pendingProjects = safeProjects.filter(p => p && (p.status === 'Planning' || p.status === 'Lead')).length;

  const monthlyRevenue = safeInvoices
    .filter(i => i && i.status === 'Paid')
    .reduce((acc, i) => acc + (Number(i.totalAmount) || 0), 0);

  const outstandingPayments = safeInvoices
    .filter(i => i && (i.status === 'Pending' || i.status === 'Overdue'))
    .reduce((acc, i) => acc + ((Number(i.totalAmount) || 0) - (Number(i.paidAmount) || 0)), 0);

  const newLeads = safeLeads.filter(l => l && l.status === 'New Lead').length;
  const activeTickets = safeTickets.filter(t => t && (t.status === 'Open' || t.status === 'In Progress')).length;

  const avgWorkload = safeEmployees.length > 0
    ? Math.round(safeEmployees.reduce((acc, e) => acc + (Number(e?.workloadPercentage) || 0), 0) / safeEmployees.length)
    : 0;

  // ── Manager Dashboard Telemetry (Aniket Sir's Specification) ──
  const tasksDueToday = safeTasks.filter(
    t => t.dueDate === todayStr && t.status !== 'Completed' && t.status !== 'Approved'
  );

  const overdueTasks = safeTasks.filter(
    t => t.dueDate < todayStr && t.status !== 'Completed' && t.status !== 'Approved' && t.status !== 'Cancelled'
  );

  const tasksAwaitingReview = safeTasks.filter(t => t.status === 'In Review');
  const blockedTasks = safeTasks.filter(t => t.status === 'Blocked');

  const pendingLeaves = safeLeaves.filter(l => l.status === 'Pending');
  const pendingEmpApprovals = safeEmployees.filter(e => e.approvalStatus === 'Pending Director Approval');

  const availableMembers = safeEmployees.filter(e => (e.workloadPercentage || 0) < 70);
  const optimalMembers = safeEmployees.filter(e => (e.workloadPercentage || 0) >= 70 && (e.workloadPercentage || 0) <= 90);
  const highLoadMembers = safeEmployees.filter(e => (e.workloadPercentage || 0) > 90);

  // Revenue Chart Data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const revenueChartData = months.map(m => {
    return {
      month: m,
      amount: monthlyRevenue > 0 ? Math.round(monthlyRevenue / months.length) : 0,
      target: monthlyRevenue > 0 ? Math.round((monthlyRevenue * 1.2) / months.length) : 0
    };
  });
  const maxAmount = Math.max(...revenueChartData.map(d => Math.max(d.amount, d.target)), 100000);

  return (
    <div>
      {/* ── Page Header & Role View Selector ── */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <h1>
            {activeDashboardMode === 'director'
              ? t('dash.title', 'Executive Operations & Intelligence Dashboard')
              : 'Department & Project Delivery Manager Dashboard'}
          </h1>
          <p>
            {activeDashboardMode === 'director'
              ? t('dash.subtitle', 'Real-time operational telemetry, fiscal revenue realization, engineering capacity & portfolio workstream governance')
              : 'Sprint delivery operations, team workload capacity, 1-on-1 employee interactions, review gates & blocker escalations'}
          </p>
        </div>

        <div className="adm-page-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Executive vs Manager Segmented Toggle */}
          <div style={{ display: 'flex', background: 'var(--adm-surface)', padding: '3px', borderRadius: '8px', border: '1px solid var(--adm-border)' }}>
            <button
              type="button"
              onClick={() => setActiveDashboardMode('director')}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: activeDashboardMode === 'director' ? 'var(--adm-primary)' : 'transparent',
                color: activeDashboardMode === 'director' ? '#fff' : 'var(--adm-text-muted)',
                transition: 'all 0.2s ease'
              }}
            >
              Executive (Director)
            </button>
            <button
              type="button"
              onClick={() => setActiveDashboardMode('manager')}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: activeDashboardMode === 'manager' ? 'var(--adm-primary)' : 'transparent',
                color: activeDashboardMode === 'manager' ? '#fff' : 'var(--adm-text-muted)',
                transition: 'all 0.2s ease'
              }}
            >
              Manager Dashboard
            </button>
          </div>

          <button className="adm-btn adm-btn-secondary" onClick={() => navigate('/admin/tasks')}>
            <CheckSquare size={14} />
            <span>Sprint Tasks</span>
          </button>
          <button className="adm-btn adm-btn-primary" onClick={() => navigate('/admin/projects')}>
            <Briefcase size={14} />
            <span>Projects</span>
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODE 1: MANAGER DASHBOARD (ROLE 2 - ANIKET SIR'S SPECIFICATION) ── */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {activeDashboardMode === 'manager' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Top Row: Manager Operational Telemetry Cards (6 Cards) */}
          <div className="adm-grid-3">
            {/* 1. Tasks Due Today */}
            <div className="adm-kpi-card" onClick={() => navigate('/admin/tasks')} style={{ cursor: 'pointer' }}>
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">Tasks Due Today</span>
                <div className="adm-kpi-icon" style={{ background: 'rgba(255, 107, 0, 0.1)', color: 'var(--adm-primary)' }}>
                  <Clock size={17} />
                </div>
              </div>
              <div className="adm-kpi-value">{tasksDueToday.length}</div>
              <div className="adm-kpi-footer">
                <span style={{ color: tasksDueToday.length > 0 ? 'var(--adm-primary)' : 'var(--adm-success)', fontWeight: 600 }}>
                  {tasksDueToday.length > 0 ? 'Urgent Sprint Milestones' : 'No Immediate Due Today'}
                </span>
                <span>today's deadline</span>
              </div>
            </div>

            {/* 2. Overdue Tasks */}
            <div className="adm-kpi-card" onClick={() => navigate('/admin/tasks')} style={{ cursor: 'pointer' }}>
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">Overdue Tasks</span>
                <div className="adm-kpi-icon" style={{ background: overdueTasks.length > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.1)', color: overdueTasks.length > 0 ? '#ef4444' : '#10b981' }}>
                  <AlertTriangle size={17} />
                </div>
              </div>
              <div className="adm-kpi-value" style={{ color: overdueTasks.length > 0 ? '#ef4444' : 'inherit' }}>
                {overdueTasks.length}
              </div>
              <div className="adm-kpi-footer">
                <span style={{ color: overdueTasks.length > 0 ? '#ef4444' : 'var(--adm-success)', fontWeight: 600 }}>
                  {overdueTasks.length > 0 ? 'SLA Breaches Identified' : 'Clean Timeline Compliance'}
                </span>
                <span>delivery risks</span>
              </div>
            </div>

            {/* 3. Tasks Awaiting Review */}
            <div className="adm-kpi-card" onClick={() => navigate('/admin/tasks')} style={{ cursor: 'pointer' }}>
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">Tasks Awaiting Review</span>
                <div className="adm-kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
                  <CheckSquare size={17} />
                </div>
              </div>
              <div className="adm-kpi-value" style={{ color: '#f59e0b' }}>{tasksAwaitingReview.length}</div>
              <div className="adm-kpi-footer">
                <span style={{ color: '#f59e0b', fontWeight: 600 }}>Review Gate Queue</span>
                <span>submitted work</span>
              </div>
            </div>

            {/* 4. Blocked Tasks */}
            <div className="adm-kpi-card" onClick={() => navigate('/admin/tasks')} style={{ cursor: 'pointer' }}>
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">Blocked Tasks (Escalations)</span>
                <div className="adm-kpi-icon" style={{ background: blockedTasks.length > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.05)', color: blockedTasks.length > 0 ? '#ef4444' : 'var(--adm-text-dim)' }}>
                  <ShieldAlert size={17} />
                </div>
              </div>
              <div className="adm-kpi-value" style={{ color: blockedTasks.length > 0 ? '#ef4444' : 'inherit' }}>
                {blockedTasks.length}
              </div>
              <div className="adm-kpi-footer">
                <span style={{ color: blockedTasks.length > 0 ? '#ef4444' : 'var(--adm-text-dim)', fontWeight: 600 }}>
                  {blockedTasks.length > 0 ? 'Escalate to Director' : 'No Impediments'}
                </span>
                <span>dependency blockers</span>
              </div>
            </div>

            {/* 5. Team Workload & Availability */}
            <div className="adm-kpi-card" onClick={() => navigate('/admin/team')} style={{ cursor: 'pointer' }}>
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">Team Capacity & Workload</span>
                <div className="adm-kpi-icon" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}>
                  <Users size={17} />
                </div>
              </div>
              <div className="adm-kpi-value">{avgWorkload}%</div>
              <div className="adm-kpi-footer">
                <span style={{ color: '#10b981', fontWeight: 600 }}>{availableMembers.length} Available</span>
                <span>&bull; {highLoadMembers.length} High Load</span>
              </div>
            </div>

            {/* 6. Pending Approvals & Leave Requests */}
            <div className="adm-kpi-card" onClick={() => navigate('/admin/team')} style={{ cursor: 'pointer' }}>
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">Pending Approvals</span>
                <div className="adm-kpi-icon" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }}>
                  <UserCheck size={17} />
                </div>
              </div>
              <div className="adm-kpi-value">{pendingLeaves.length + pendingEmpApprovals.length}</div>
              <div className="adm-kpi-footer">
                <span style={{ color: '#a855f7', fontWeight: 600 }}>{pendingLeaves.length} Leaves</span>
                <span>&bull; {pendingEmpApprovals.length} Registrations</span>
              </div>
            </div>
          </div>

          {/* Middle Row: Team Member Roster & 1-on-1 Interaction + Assigned Projects */}
          <div className="adm-grid-2" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
            
            {/* Team Members List with One-to-One Interaction */}
            <div className="adm-card">
              <div className="adm-card-header">
                <div className="adm-card-title">
                  <Users size={18} color="var(--adm-primary)" />
                  Team Member Roster & 1-on-1 Direct Interaction
                </div>
                <button className="adm-btn adm-btn-secondary adm-btn-sm" onClick={() => navigate('/admin/team')}>
                  View All ({safeEmployees.length})
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {safeEmployees.slice(0, 5).map(emp => {
                  const empTasks = safeTasks.filter(t => {
                    const assigned = (t.assignedTo || '').toLowerCase();
                    const name = (emp.name || '').toLowerCase();
                    const empId = (emp.employeeId || '').toLowerCase();
                    return assigned.includes(name) || (empId && assigned.includes(empId));
                  });

                  const isAvailable = (emp.workloadPercentage || 0) < 70;
                  const isHigh = (emp.workloadPercentage || 0) > 90;

                  return (
                    <div
                      key={emp.id}
                      style={{
                        padding: '0.85rem 1rem',
                        background: 'var(--adm-bg)',
                        borderRadius: '10px',
                        border: '1px solid var(--adm-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '180px' }}>
                        <div style={{ position: 'relative' }}>
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--adm-border)' }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: emp.status === 'Active' ? '#10b981' : '#94a3b8',
                              border: '2px solid #000'
                            }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--adm-text)' }}>
                            {emp.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--adm-primary)' }}>
                            {emp.role} &bull; <span style={{ color: 'var(--adm-text-dim)' }}>{emp.department}</span>
                          </div>
                        </div>
                      </div>

                      {/* Workload Telemetry & Availability Badge */}
                      <div style={{ minWidth: '120px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '3px' }}>
                          <span style={{ color: 'var(--adm-text-dim)' }}>Workload</span>
                          <span style={{ fontWeight: 700, color: isHigh ? '#ef4444' : isAvailable ? '#10b981' : 'var(--adm-primary)' }}>
                            {emp.workloadPercentage}% ({isAvailable ? 'Available' : isHigh ? 'High Load' : 'Optimal'})
                          </span>
                        </div>
                        <div className="adm-progress-bar" style={{ height: '6px' }}>
                          <div
                            className="adm-progress-fill"
                            style={{
                              width: `${Math.min(100, Math.max(0, emp.workloadPercentage || 0))}%`,
                              background: isHigh ? '#ef4444' : isAvailable ? '#10b981' : 'var(--adm-primary)'
                            }}
                          />
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--adm-text-dim)', marginTop: '2px' }}>
                          {empTasks.length} {empTasks.length === 1 ? 'task assigned' : 'tasks assigned'}
                        </div>
                      </div>

                      {/* 1-on-1 Interaction Options (Explicit Requirement) */}
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="adm-btn adm-btn-secondary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', gap: '4px', color: 'var(--adm-primary)' }}
                          onClick={() => {
                            navigate('/admin/calendar');
                            showToast('1-on-1 Chat', `Opening private 1-on-1 workspace for ${emp.name}.`, 'info');
                          }}
                          title="Open 1-on-1 Direct Message with Employee"
                        >
                          <MessageSquare size={12} />
                          <span>1:1 Chat</span>
                        </button>

                        <a
                          href={`https://wa.me/${(emp.phone || '').replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="adm-btn adm-btn-secondary"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.72rem', color: '#22c55e' }}
                          title="WhatsApp 1-on-1 Interaction"
                        >
                          <MessageCircle size={12} />
                        </a>

                        <a
                          href={`mailto:${emp.email}`}
                          className="adm-btn adm-btn-secondary"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.72rem', color: '#38bdf8' }}
                          title="Official Email"
                        >
                          <Mail size={12} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assigned Projects & Delivery Progress */}
            <div className="adm-card">
              <div className="adm-card-header">
                <div className="adm-card-title">
                  <Briefcase size={18} color="var(--adm-primary)" />
                  Assigned Projects & Progress
                </div>
                <button className="adm-btn adm-btn-secondary adm-btn-sm" onClick={() => navigate('/admin/projects')}>
                  View All
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {safeProjects.slice(0, 4).map(p => {
                  const prog = Number(p.progress) || 0;
                  const completedMilestones = (p.milestones || []).filter(m => m.completed).length;
                  const totalMilestones = (p.milestones || []).length;

                  return (
                    <div
                      key={p.id}
                      style={{
                        padding: '0.85rem 1rem',
                        background: 'var(--adm-bg)',
                        borderRadius: '10px',
                        border: '1px solid var(--adm-border)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--adm-text)' }}>
                            {p.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-muted)' }}>
                            Client: {p.clientName} &bull; Due: {p.targetEndDate}
                          </div>
                        </div>
                        <span
                          className={`adm-badge ${
                            p.status === 'Development' ? 'adm-badge-primary' :
                            p.status === 'Delivered' ? 'adm-badge-success' : 'adm-badge-neutral'
                          }`}
                          style={{ fontSize: '0.65rem' }}
                        >
                          {p.status}
                        </span>
                      </div>

                      <div className="adm-progress-bar" style={{ height: '7px', marginBottom: '4px' }}>
                        <div
                          className="adm-progress-fill"
                          style={{
                            width: `${Math.min(100, Math.max(0, prog))}%`,
                            background: prog === 100 ? '#10b981' : 'var(--adm-primary)'
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>
                        <span>Progress: <strong>{prog}%</strong></span>
                        <span>Milestones: {completedMilestones}/{totalMilestones || 1} Signed-off</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Row: Review Queue + Blockers + Upcoming Meetings + Leave Approvals */}
          <div className="adm-grid-2">
            
            {/* Tasks Awaiting Review & Blocked Escalations */}
            <div className="adm-card">
              <div className="adm-card-header">
                <div className="adm-card-title">
                  <CheckSquare size={18} color="#f59e0b" />
                  Review Gate Queue & Blocker Escalations
                </div>
                <button className="adm-btn adm-btn-secondary adm-btn-sm" onClick={() => navigate('/admin/tasks')}>
                  Manage Tasks
                </button>
              </div>

              {tasksAwaitingReview.length === 0 && blockedTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--adm-text-dim)', fontSize: '0.85rem' }}>
                  ✓ Review queue is clear. No blocked tasks or pending review gates.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {tasksAwaitingReview.map(t => (
                    <div
                      key={t.id}
                      style={{
                        padding: '0.75rem 0.95rem',
                        background: 'rgba(245, 158, 11, 0.05)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--adm-text)' }}>
                          {t.title} ({t.taskId || t.id})
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#f59e0b' }}>
                          Submitted by {t.assignedTo} &bull; Project: {t.projectName}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          className="adm-btn adm-btn-primary"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.7rem' }}
                          onClick={() => {
                            updateTaskStatus(t.id, 'Approved');
                            showToast('Task Approved', `Approved work on ${t.title}.`, 'success');
                          }}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="adm-btn adm-btn-secondary"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.7rem' }}
                          onClick={() => {
                            updateTaskStatus(t.id, 'Revision Required');
                            showToast('Revision Requested', `Returned ${t.title} for revision.`, 'warning');
                          }}
                        >
                          Request Revision
                        </button>
                      </div>
                    </div>
                  ))}

                  {blockedTasks.map(t => (
                    <div
                      key={t.id}
                      style={{
                        padding: '0.75rem 0.95rem',
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <AlertTriangle size={13} />
                          <span>BLOCKED: {t.title}</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>
                          Assigned to {t.assignedTo} &bull; Prereq: {Array.isArray(t.dependencies) ? t.dependencies.join(', ') : t.dependencies || 'Impediment'}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="adm-btn adm-btn-danger"
                        style={{ padding: '0.25rem 0.55rem', fontSize: '0.7rem' }}
                        onClick={() => {
                          showToast('Escalated to Director', `Risk escalation logged for ${t.title} directly to Rohit Pawar (Managing Director).`, 'info');
                        }}
                      >
                        Escalate to Director
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Leave Approvals & Upcoming Meetings */}
            <div className="adm-card">
              <div className="adm-card-header">
                <div className="adm-card-title">
                  <Calendar size={18} color="var(--adm-primary)" />
                  Upcoming Team Meetings & Leave Requests
                </div>
                <button className="adm-btn adm-btn-secondary adm-btn-sm" onClick={() => navigate('/admin/calendar')}>
                  Calendar
                </button>
              </div>

              {/* Leave Requests Sub-Section */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--adm-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Pending Leave Applications ({pendingLeaves.length})
                </div>

                {pendingLeaves.length === 0 ? (
                  <div style={{ fontSize: '0.78rem', color: 'var(--adm-text-dim)', fontStyle: 'italic' }}>
                    No pending leave applications.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {pendingLeaves.map(l => (
                      <div
                        key={l.id}
                        style={{
                          padding: '0.65rem 0.85rem',
                          background: 'var(--adm-bg)',
                          border: '1px solid var(--adm-border)',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--adm-text)' }}>
                            {l.employeeName} &bull; <span style={{ color: 'var(--adm-primary)' }}>{l.type}</span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>
                            {l.startDate} to {l.endDate} &bull; Reason: {l.reason}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            className="adm-btn adm-btn-primary"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                            onClick={() => updateLeaveStatus(l.id, 'Approved')}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="adm-btn adm-btn-danger"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                            onClick={() => updateLeaveStatus(l.id, 'Rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Meetings Sub-Section */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--adm-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Upcoming Sprint Syncs & Reviews
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {safeMeetings.slice(0, 3).map(m => (
                    <div
                      key={m.id}
                      style={{
                        padding: '0.65rem 0.85rem',
                        background: 'var(--adm-bg)',
                        border: '1px solid var(--adm-border)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--adm-text)' }}>
                          {m.title}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>
                          {m.date} &bull; {m.time} &bull; {m.type}
                        </div>
                      </div>
                      {m.meetUrl && (
                        <a
                          href={m.meetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="adm-btn adm-btn-secondary"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem', color: '#10b981' }}
                        >
                          Join Meet
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Department Announcements & Communication Reports */}
          <div className="adm-card">
            <div className="adm-card-header">
              <div className="adm-card-title">
                <MessageSquare size={18} color="var(--adm-primary)" />
                Department Announcements & Communication Delivery Reports
              </div>
              <button className="adm-btn adm-btn-secondary adm-btn-sm" onClick={() => navigate('/admin/calendar')}>
                Communication Hub
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
              {safeAnnouncements.slice(0, 3).map(ann => (
                <div
                  key={ann.id}
                  style={{
                    padding: '0.85rem 1rem',
                    background: 'var(--adm-bg)',
                    borderRadius: '8px',
                    border: '1px solid var(--adm-border)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="adm-badge adm-badge-primary" style={{ fontSize: '0.65rem' }}>
                      {ann.priority}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--adm-text-dim)' }}>
                      {ann.postedAt}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--adm-text)', marginBottom: '4px' }}>
                    {ann.title}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--adm-text-muted)', lineHeight: 1.4 }}>
                    {ann.content.length > 100 ? `${ann.content.slice(0, 100)}...` : ann.content}
                  </p>
                  <div style={{ marginTop: '6px', fontSize: '0.7rem', color: 'var(--adm-primary)' }}>
                    Posted by: {ann.authorName} ({ann.authorRole})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ═════════════════════════════════════════════════════════════════════════ */
        /* ── MODE 2: EXECUTIVE (DIRECTOR) OPERATIONS DASHBOARD ── */
        /* ═════════════════════════════════════════════════════════════════════════ */
        <div>
          {/* Top KPI Stats */}
          <div className="adm-grid-4" style={{ marginBottom: '1.75rem' }}>
            {/* 1. Total Clients */}
            <div className="adm-kpi-card">
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">{t('dash.clients', 'Institutional Client Accounts')}</span>
                <div className="adm-kpi-icon" style={{ background: 'var(--adm-surface-hover)', color: 'var(--adm-text)', border: '1px solid var(--adm-border)' }}>
                  <Users size={18} />
                </div>
              </div>
              <div className="adm-kpi-value">{totalClients}</div>
              <div className="adm-kpi-footer">
                <span style={{ color: 'var(--adm-primary)', fontWeight: 600 }}>{safeClients.filter(c => c && c.status === 'Active').length} Active Retainers</span>
                <span>corporate registry</span>
              </div>
            </div>

            {/* 2. Active Projects */}
            <div className="adm-kpi-card">
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">{t('dash.projects', 'Active Engineering Workstreams')}</span>
                <div className="adm-kpi-icon" style={{ background: 'var(--adm-surface-hover)', color: 'var(--adm-primary)', border: '1px solid var(--adm-border)' }}>
                  <Briefcase size={18} />
                </div>
              </div>
              <div className="adm-kpi-value">{activeProjects}</div>
              <div className="adm-kpi-footer">
                <span style={{ color: 'var(--adm-primary)', fontWeight: 600 }}>{safeProjects.length} Portfolio Workstreams</span>
                <span>in execution lifecycle</span>
              </div>
            </div>

            {/* 3. Deliverable Fulfillment Rate */}
            <div className="adm-kpi-card">
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">Deliverable Fulfillment Rate</span>
                <div className="adm-kpi-icon" style={{ background: 'var(--adm-surface-hover)', color: 'var(--adm-success)', border: '1px solid var(--adm-border)' }}>
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div className="adm-kpi-value">{completedProjects} <span style={{ fontSize: '1rem', color: 'var(--adm-text-dim)' }}>/ {pendingProjects} pend</span></div>
              <div className="adm-kpi-footer">
                <span style={{ color: 'var(--adm-success)', fontWeight: 600 }}>{safeProjects.length > 0 ? Math.round((completedProjects / safeProjects.length) * 100) : 0}%</span>
                <span>milestone delivery completion</span>
              </div>
            </div>

            {/* 4. Monthly Revenue */}
            <div className="adm-kpi-card">
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">{t('dash.revenue', 'Realized Net Revenue')}</span>
                <div className="adm-kpi-icon" style={{ background: 'var(--adm-surface-hover)', color: 'var(--adm-text)', border: '1px solid var(--adm-border)' }}>
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="adm-kpi-value">₹{monthlyRevenue.toLocaleString('en-IN')}</div>
              <div className="adm-kpi-footer">
                <span className="adm-trend-up" style={{ color: 'var(--adm-success)' }}><ArrowUpRight size={14} /> Audited Gross</span>
                <span>Paid Invoices</span>
              </div>
            </div>

            {/* 5. Outstanding Payments */}
            <div className="adm-kpi-card">
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">{t('dash.outstanding', 'Accounts Receivable Outstanding')}</span>
                <div className="adm-kpi-icon" style={{ background: 'var(--adm-surface-hover)', color: 'var(--adm-text-muted)', border: '1px solid var(--adm-border)' }}>
                  <CreditCard size={18} />
                </div>
              </div>
              <div className="adm-kpi-value">₹{outstandingPayments.toLocaleString('en-IN')}</div>
              <div className="adm-kpi-footer">
                <span style={{ color: 'var(--adm-text-muted)', fontWeight: 600 }}>{safeInvoices.filter(i => i && i.status === 'Pending').length} Pending Remittances</span>
                <span>fiscal ledger</span>
              </div>
            </div>

            {/* 6. New Leads */}
            <div className="adm-kpi-card">
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">Enterprise CRM Pipeline</span>
                <div className="adm-kpi-icon" style={{ background: 'var(--adm-surface-hover)', color: 'var(--adm-primary)', border: '1px solid var(--adm-border)' }}>
                  <Target size={18} />
                </div>
              </div>
              <div className="adm-kpi-value">{newLeads}</div>
              <div className="adm-kpi-footer">
                <span style={{ color: 'var(--adm-primary)', fontWeight: 600 }}>{safeLeads.length} Total Opportunities</span>
                <span>commercial pipeline</span>
              </div>
            </div>

            {/* 7. Active Support Tickets */}
            <div className="adm-kpi-card">
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">Service Desk Incidents</span>
                <div className="adm-kpi-icon" style={{ background: 'var(--adm-surface-hover)', color: 'var(--adm-text-muted)', border: '1px solid var(--adm-border)' }}>
                  <LifeBuoy size={18} />
                </div>
              </div>
              <div className="adm-kpi-value">{activeTickets}</div>
              <div className="adm-kpi-footer">
                <span style={{ color: 'var(--adm-text-dim)' }}>{safeTickets.filter(t => t && t.status === 'Resolved').length} resolved under SLA</span>
              </div>
            </div>

            {/* 8. Team Workload Gauge */}
            <div className="adm-kpi-card">
              <div className="adm-kpi-header">
                <span className="adm-kpi-label">Engineering Capacity Allocation</span>
                <div className="adm-kpi-icon" style={{ background: 'var(--adm-surface-hover)', color: 'var(--adm-primary)', border: '1px solid var(--adm-border)' }}>
                  <Users size={18} />
                </div>
              </div>
              <div className="adm-kpi-value">{avgWorkload}%</div>
              <div className="adm-kpi-footer">
                <span>{safeEmployees.length} Technical Personnel Roster</span>
              </div>
            </div>
          </div>

          {/* Charts & Workload Row */}
          <div className="adm-grid-2" style={{ marginBottom: '1.75rem', gridTemplateColumns: '2fr 1fr' }}>
            {/* Revenue SVG Chart */}
            <div className="adm-card">
              <div className="adm-card-header">
                <div className="adm-card-title">
                  <TrendingUp size={18} color="var(--adm-primary)" />
                  Fiscal Revenue Realization vs. Strategic Target Benchmark
                </div>
                <div style={{ display: 'flex', gap: '4px', background: 'var(--adm-bg)', padding: '2px', borderRadius: '6px', border: '1px solid var(--adm-border)' }}>
                  {(['30D', '90D', '1Y'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setChartPeriod(p)}
                      style={{
                        background: chartPeriod === p ? 'var(--adm-primary)' : 'transparent',
                        color: chartPeriod === p ? '#fff' : 'var(--adm-text-muted)',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: '220px', width: '100%', position: 'relative', marginTop: '1rem' }}>
                <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <line x1="0" y1="20" x2="100%" y2="20" stroke="var(--adm-border)" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="100%" y2="80" stroke="var(--adm-border)" strokeDasharray="3 3" />
                  <line x1="0" y1="140" x2="100%" y2="140" stroke="var(--adm-border)" strokeDasharray="3 3" />
                  <line x1="0" y1="200" x2="100%" y2="200" stroke="var(--adm-border)" />

                  {revenueChartData.map((d, i) => {
                    const totalBars = revenueChartData.length;
                    const slotWidth = 100 / totalBars;
                    const barX = (i * slotWidth) + (slotWidth / 2) - 3;
                    const heightPct = maxAmount > 0 ? (d.amount / maxAmount) * 180 : 0;
                    const targetPct = maxAmount > 0 ? (d.target / maxAmount) * 180 : 0;

                    return (
                      <g key={i}>
                        <rect
                          x={`${barX + 2}%`}
                          y={200 - targetPct}
                          width="12"
                          height={Math.max(targetPct, 2)}
                          rx="3"
                          fill="rgba(255, 255, 255, 0.08)"
                        />
                        <rect
                          x={`${barX - 1}%`}
                          y={200 - heightPct}
                          width="14"
                          height={Math.max(heightPct, 2)}
                          rx="4"
                          fill="url(#revGradient)"
                        />
                        <text
                          x={`${barX + 2}%`}
                          y="218"
                          fill="var(--adm-text-dim)"
                          fontSize="11"
                          textAnchor="middle"
                        >
                          {d.month}
                        </text>
                      </g>
                    );
                  })}

                  <defs>
                    <linearGradient id="revGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#F66135" />
                      <stop offset="100%" stopColor="#D94E22" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--adm-primary)' }} />
                  <span style={{ color: 'var(--adm-text-muted)' }}>Audited Net Realization</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--adm-surface-hover)', border: '1px solid var(--adm-border)' }} />
                  <span style={{ color: 'var(--adm-text-muted)' }}>Strategic Target Benchmark</span>
                </div>
              </div>
            </div>

            {/* Team Workload Breakdown */}
            <div className="adm-card">
              <div className="adm-card-header">
                <div className="adm-card-title">
                  <Users size={18} color="var(--adm-primary)" />
                  Engineering Workforce Capacity & Allocation
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {safeEmployees.map(emp => {
                  const workload = Number(emp?.workloadPercentage) || 0;
                  const projectCount = (emp?.currentProjects || []).length;
                  return (
                    <div key={emp.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '0.82rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--adm-text)' }}>{emp.name}</span>
                        <span style={{
                          fontWeight: 700,
                          color: workload > 85 ? 'var(--adm-primary)' : 'var(--adm-success)'
                        }}>
                          {workload}%
                        </span>
                      </div>
                      <div className="adm-progress-bar">
                        <div
                          className="adm-progress-fill"
                          style={{
                            width: `${Math.min(100, Math.max(0, workload))}%`,
                            background: workload > 85 ? 'var(--adm-primary)' : 'var(--adm-success)'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--adm-text-dim)', marginTop: '2px' }}>
                        <span>{emp.role || 'Staff'}</span>
                        <span>{projectCount} Workstreams</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Projects Snapshot & Audit Stream */}
          <div className="adm-grid-2" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
            <div className="adm-card">
              <div className="adm-card-header">
                <div className="adm-card-title">
                  <Briefcase size={18} color="var(--adm-primary)" />
                  Active Project Execution Portfolio
                </div>
                <button className="adm-btn adm-btn-sm adm-btn-secondary" onClick={() => navigate('/admin/projects')}>
                  View All Workstreams ({safeProjects.length})
                </button>
              </div>

              {safeProjects.length > 0 ? (
                <div className="adm-table-container">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Project Charter</th>
                        <th>Corporate Client Entity</th>
                        <th>Lifecycle Stage</th>
                        <th>Milestone Execution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeProjects.slice(0, 5).map(p => {
                        const prog = Number(p?.progress) || 0;
                        return (
                          <tr key={p.id}>
                            <td style={{ fontWeight: 600, color: 'var(--adm-text)' }}>{p.title}</td>
                            <td style={{ color: 'var(--adm-text-muted)' }}>{p.clientName}</td>
                            <td>
                              <span className={`adm-badge ${
                                p.status === 'Development' ? 'adm-badge-primary' :
                                p.status === 'Delivered' ? 'adm-badge-success' : 'adm-badge-neutral'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td style={{ width: '130px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="adm-progress-bar" style={{ flex: 1 }}>
                                  <div className="adm-progress-fill" style={{ width: `${Math.min(100, Math.max(0, prog))}%` }} />
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{prog}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--adm-text-dim)', fontSize: '0.85rem' }}>
                  <p>No active project charters registered.</p>
                  <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={() => navigate('/admin/projects')}>
                    <Plus size={14} /> Initiate First Project Charter
                  </button>
                </div>
              )}
            </div>

            {/* Live Audit Activity Stream */}
            <div className="adm-card" style={{ padding: '1.25rem 1.4rem' }}>
              <div className="adm-card-header" style={{ marginBottom: '1.1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--adm-border)' }}>
                <div className="adm-card-title">
                  <Activity size={18} color="var(--adm-primary)" />
                  Institutional Audit & Governance Telemetry
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--adm-text-dim)', fontWeight: 600 }}>
                  ISO 27001 Log Register
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {safeAuditLogs.slice(0, 5).map(log => (
                  <div
                    key={log.id}
                    style={{
                      padding: '0.9rem 1.15rem',
                      background: 'var(--adm-bg)',
                      borderRadius: '10px',
                      border: '1px solid var(--adm-border)',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--adm-text)', fontSize: '0.84rem' }}>{log.action}</span>
                      <span style={{ color: 'var(--adm-text-dim)', fontSize: '0.7rem', fontWeight: 500 }}>{log.timestamp}</span>
                    </div>
                    <div style={{ color: 'var(--adm-text-muted)', fontSize: '0.78rem', lineHeight: 1.5 }}>
                      {log.details}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--adm-primary)', marginTop: '8px', fontWeight: 600 }}>
                      <span>by {log.userName}</span>
                      <span style={{ color: 'var(--adm-text-dim)' }}>•</span>
                      <span style={{ background: 'var(--adm-surface-hover)', padding: '2px 7px', borderRadius: '4px', border: '1px solid var(--adm-border)', color: 'var(--adm-text-muted)' }}>
                        {log.module}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
