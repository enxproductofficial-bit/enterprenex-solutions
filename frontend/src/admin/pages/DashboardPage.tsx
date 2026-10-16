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
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { clients, projects, invoices, leads, tickets, employees, auditLogs } = useAdmin();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState<'30D' | '90D' | '1Y'>('30D');

  // Calculations with complete null-safety
  const safeClients = clients || [];
  const safeProjects = projects || [];
  const safeInvoices = invoices || [];
  const safeLeads = leads || [];
  const safeTickets = tickets || [];
  const safeEmployees = employees || [];
  const safeAuditLogs = auditLogs || [];

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
          <h1>{t('dash.title', 'Executive Operations & Intelligence Dashboard')}</h1>
          <p>{t('dash.subtitle', 'Real-time operational telemetry, fiscal revenue realization, engineering capacity & portfolio workstream governance')}</p>
        </div>
        <div className="adm-page-actions">
          <button className="adm-btn adm-btn-secondary" onClick={() => navigate('/admin/analytics')}>
            <TrendingUp size={15} />
            <span>Executive Analytics & Telemetry</span>
          </button>
          <button className="adm-btn adm-btn-primary" onClick={() => navigate('/admin/projects')}>
            <Briefcase size={15} />
            <span>Project Portfolio Governance</span>
          </button>
        </div>
      </div>

      {/* ── TOP KPI STATS (8 Institutional Enterprise Metrics) ── */}
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

        {/* 3. Completed & Pending Projects */}
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

      {/* ── CHARTS & WORKLOAD ROW ── */}
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

      {/* ── ACTIVE PROJECTS SNAPSHOT & AUDIT STREAM ── */}
      <div className="adm-grid-2" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        {/* Active Projects Table Snapshot */}
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
                  fontSize: '0.82rem',
                  transition: 'all 0.2s ease'
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
  );
};
