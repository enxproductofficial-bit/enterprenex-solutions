import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
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
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { clients, projects, invoices, leads, tickets, employees, auditLogs } = useAdmin();
  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState<'30D' | '90D' | '1Y'>('30D');

  // Calculations
  const totalClients = clients.length;
  const activeProjects = projects.filter(p => p.status !== 'Delivered' && p.status !== 'Lead').length;
  const completedProjects = projects.filter(p => p.status === 'Delivered').length;
  const pendingProjects = projects.filter(p => p.status === 'Planning' || p.status === 'Lead').length;

  const monthlyRevenue = invoices
    .filter(i => i.status === 'Paid')
    .reduce((acc, i) => acc + i.totalAmount, 0);

  const outstandingPayments = invoices
    .filter(i => i.status === 'Pending' || i.status === 'Overdue')
    .reduce((acc, i) => acc + (i.totalAmount - i.paidAmount), 0);

  const newLeads = leads.filter(l => l.status === 'New Lead').length;
  const activeTickets = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;

  const avgWorkload = employees.length > 0
    ? Math.round(employees.reduce((acc, e) => acc + (e.workloadPercentage || 0), 0) / employees.length)
    : 0;

  // Monthly Revenue Chart Data derived from actual invoices
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
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <h1>Enterprise Operations Dashboard</h1>
          <p>Real-time analytics, revenue pipeline, team workload & project health</p>
        </div>
        <div className="adm-page-actions">
          <button className="adm-btn adm-btn-secondary" onClick={() => navigate('/admin/analytics')}>
            <TrendingUp size={15} />
            <span>Detailed Analytics</span>
          </button>
          <button className="adm-btn adm-btn-primary" onClick={() => navigate('/admin/projects')}>
            <Briefcase size={15} />
            <span>Manage Projects</span>
          </button>
        </div>
      </div>

      {/* ── TOP KPI STATS (8 Requested Metrics) ── */}
      <div className="adm-grid-4" style={{ marginBottom: '1.75rem' }}>
        {/* 1. Total Clients */}
        <div className="adm-kpi-card">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Total Clients</span>
            <div className="adm-kpi-icon" style={{ background: 'var(--adm-info-soft)', color: 'var(--adm-info)' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="adm-kpi-value">{totalClients}</div>
          <div className="adm-kpi-footer">
            <span style={{ color: 'var(--adm-primary)' }}>{clients.filter(c => c.status === 'Active').length} Active</span>
            <span>accounts</span>
          </div>
        </div>

        {/* 2. Active Projects */}
        <div className="adm-kpi-card">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Active Projects</span>
            <div className="adm-kpi-icon" style={{ background: 'var(--adm-primary-soft)', color: 'var(--adm-primary)' }}>
              <Briefcase size={18} />
            </div>
          </div>
          <div className="adm-kpi-value">{activeProjects}</div>
          <div className="adm-kpi-footer">
            <span style={{ color: 'var(--adm-primary)', fontWeight: 600 }}>{projects.length} Total</span>
            <span>tracked in lifecycle</span>
          </div>
        </div>

        {/* 3. Completed & Pending Projects */}
        <div className="adm-kpi-card">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Completed / Pending</span>
            <div className="adm-kpi-icon" style={{ background: 'var(--adm-success-soft)', color: 'var(--adm-success)' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="adm-kpi-value">{completedProjects} <span style={{ fontSize: '1rem', color: 'var(--adm-text-dim)' }}>/ {pendingProjects} pend</span></div>
          <div className="adm-kpi-footer">
            <span style={{ color: 'var(--adm-success)' }}>{projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0}%</span>
            <span>delivery completion rate</span>
          </div>
        </div>

        {/* 4. Monthly Revenue */}
        <div className="adm-kpi-card">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Realized Revenue</span>
            <div className="adm-kpi-icon" style={{ background: 'var(--adm-success-soft)', color: 'var(--adm-success)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="adm-kpi-value">₹{monthlyRevenue.toLocaleString('en-IN')}</div>
          <div className="adm-kpi-footer">
            <span className="adm-trend-up"><ArrowUpRight size={14} /> Live Total</span>
            <span>Paid Invoices</span>
          </div>
        </div>

        {/* 5. Outstanding Payments */}
        <div className="adm-kpi-card">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Outstanding Due</span>
            <div className="adm-kpi-icon" style={{ background: 'var(--adm-warning-soft)', color: 'var(--adm-warning)' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div className="adm-kpi-value">₹{outstandingPayments.toLocaleString('en-IN')}</div>
          <div className="adm-kpi-footer">
            <span style={{ color: 'var(--adm-warning)' }}>{invoices.filter(i => i.status === 'Pending').length} Pending</span>
            <span>invoices</span>
          </div>
        </div>

        {/* 6. New Leads */}
        <div className="adm-kpi-card">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">New CRM Leads</span>
            <div className="adm-kpi-icon" style={{ background: 'var(--adm-purple-soft)', color: 'var(--adm-purple)' }}>
              <Target size={18} />
            </div>
          </div>
          <div className="adm-kpi-value">{newLeads}</div>
          <div className="adm-kpi-footer">
            <span style={{ color: 'var(--adm-primary)' }}>{leads.length} Total</span>
            <span>in sales pipeline</span>
          </div>
        </div>

        {/* 7. Active Support Tickets */}
        <div className="adm-kpi-card">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Active Tickets</span>
            <div className="adm-kpi-icon" style={{ background: 'var(--adm-danger-soft)', color: 'var(--adm-danger)' }}>
              <LifeBuoy size={18} />
            </div>
          </div>
          <div className="adm-kpi-value">{activeTickets}</div>
          <div className="adm-kpi-footer">
            <span style={{ color: 'var(--adm-text-dim)' }}>{tickets.filter(t => t.status === 'Resolved').length} resolved</span>
          </div>
        </div>

        {/* 8. Team Workload Gauge */}
        <div className="adm-kpi-card">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Team Capacity</span>
            <div className="adm-kpi-icon" style={{ background: 'var(--adm-primary-soft)', color: 'var(--adm-primary)' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="adm-kpi-value">{avgWorkload}%</div>
          <div className="adm-kpi-footer">
            <span>{employees.length} Engineers Roster</span>
          </div>
        </div>
      </div>

      {/* ── CHARTS & WORKLOAD ROW ── */}
      <div className="adm-grid-2" style={{ marginBottom: '1.75rem', gridTemplateColumns: '2fr 1fr' }}>
        {/* Revenue SVG Chart */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div className="adm-card-title">
              <TrendingUp size={18} color="var(--adm-primary)" />
              Monthly Revenue vs Target Realization
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

          {/* SVG Bar / Area Chart */}
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
                    {/* Target Bar */}
                    <rect
                      x={`${barX + 2}%`}
                      y={200 - targetPct}
                      width="12"
                      height={Math.max(targetPct, 2)}
                      rx="3"
                      fill="rgba(255, 255, 255, 0.08)"
                    />
                    {/* Actual Amount Bar */}
                    <rect
                      x={`${barX - 1}%`}
                      y={200 - heightPct}
                      width="14"
                      height={Math.max(heightPct, 2)}
                      rx="4"
                      fill="url(#revGradient)"
                    />
                    {/* Month Label */}
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
              <span style={{ color: 'var(--adm-text-muted)' }}>Realized Revenue</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.15)' }} />
              <span style={{ color: 'var(--adm-text-muted)' }}>Target Projection</span>
            </div>
          </div>
        </div>

        {/* Team Workload Breakdown */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div className="adm-card-title">
              <Users size={18} color="var(--adm-info)" />
              Team Workload & Capacity
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {employees.map(emp => (
              <div key={emp.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '0.82rem' }}>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{emp.name}</span>
                  <span style={{
                    fontWeight: 700,
                    color: emp.workloadPercentage > 85 ? 'var(--adm-danger)' : emp.workloadPercentage > 70 ? 'var(--adm-warning)' : 'var(--adm-success)'
                  }}>
                    {emp.workloadPercentage}%
                  </span>
                </div>
                <div className="adm-progress-bar">
                  <div
                    className="adm-progress-fill"
                    style={{
                      width: `${emp.workloadPercentage}%`,
                      background: emp.workloadPercentage > 85 ? 'var(--adm-danger)' : emp.workloadPercentage > 70 ? 'var(--adm-warning)' : 'var(--adm-success)'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--adm-text-dim)', marginTop: '2px' }}>
                  <span>{emp.role}</span>
                  <span>{emp.currentProjects.length} Projects</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ACTIVE PROJECTS SNAPSHOT & AUDIT STREAM ── */}
      <div className="adm-grid-2" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        {/* Active Projects Table Snapshot */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div className="adm-card-title">
              <Briefcase size={18} color="var(--adm-primary)" />
              Active Project Progress
            </div>
            <button className="adm-btn adm-btn-sm adm-btn-secondary" onClick={() => navigate('/admin/projects')}>
              View All ({projects.length})
            </button>
          </div>

          {projects.length > 0 ? (
            <div className="adm-table-container">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Client</th>
                    <th>Stage</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.slice(0, 5).map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600, color: '#fff' }}>{p.title}</td>
                      <td>{p.clientName}</td>
                      <td>
                        <span className={`adm-badge ${
                          p.status === 'Development' ? 'adm-badge-primary' :
                          p.status === 'Delivered' ? 'adm-badge-success' :
                          p.status === 'Testing' ? 'adm-badge-warning' : 'adm-badge-neutral'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ width: '130px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="adm-progress-bar" style={{ flex: 1 }}>
                            <div className="adm-progress-fill" style={{ width: `${p.progress}%` }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{p.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--adm-text-dim)', fontSize: '0.85rem' }}>
              <p>No active projects yet.</p>
              <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={() => navigate('/admin/projects')}>
                <Plus size={14} /> Create First Project
              </button>
            </div>
          )}
        </div>

        {/* Live Audit Activity Stream */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div className="adm-card-title">
              <Activity size={18} color="var(--adm-success)" />
              Live Audit Stream
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--adm-text-dim)' }}>
              System Logs
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {auditLogs.slice(0, 5).map(log => (
              <div
                key={log.id}
                style={{
                  padding: '0.65rem 0.85rem',
                  background: 'var(--adm-bg)',
                  borderRadius: 'var(--adm-radius)',
                  border: '1px solid var(--adm-border)',
                  fontSize: '0.8rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{log.action}</span>
                  <span style={{ color: 'var(--adm-text-dim)', fontSize: '0.7rem' }}>{log.timestamp}</span>
                </div>
                <div style={{ color: 'var(--adm-text-muted)', fontSize: '0.75rem' }}>{log.details}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--adm-primary)', marginTop: '3px' }}>
                  by {log.userName} • {log.module}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
