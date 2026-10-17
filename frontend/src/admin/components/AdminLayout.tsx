import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useLanguage } from '../i18n/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../i18n/types';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Layers,
  Target,
  CreditCard,
  UserCheck,
  CheckSquare,
  LifeBuoy,
  FileText,
  Calendar,
  Globe,
  BarChart3,
  ShieldCheck,
  Search,
  Plus,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  Camera,
  Sun,
  Moon,
  Languages,
  CheckCircle2,
  Sparkles,
  Settings,
  X
} from 'lucide-react';
import { QuickCreateModal } from './QuickCreateModal';
import { ToastContainer } from './ToastContainer';
import { AiChatbotWidget } from './AiChatbotWidget';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const {
    currentUser,
    logout,
    tickets,
    invoices,
    leads,
    projects,
    clients,
    tasks,
    updateCurrentUser,
    updateEmployee,
    employees,
    showToast
  } = useAdmin();
  const { language, setLanguage, t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Live Portal Theme (Default to clean Light minimalism, with instant toggle)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('ewms_portal_theme') as 'light' | 'dark') || 'light';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('ewms_portal_theme', nextTheme);
  };

  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Safe array references to prevent any undefined crashes
  const safeTickets = tickets || [];
  const safeInvoices = invoices || [];
  const safeLeads = leads || [];
  const safeProjects = projects || [];
  const safeClients = clients || [];
  const safeTasks = tasks || [];

  // Calculate live badge counters
  const openTicketsCount = safeTickets.filter(t => t && (t.status === 'Open' || t.status === 'In Progress')).length;
  const pendingInvoicesCount = safeInvoices.filter(i => i && i.status === 'Pending').length;
  const newLeadsCount = safeLeads.filter(l => l && l.status === 'New Lead').length;
  const activeProjectsCount = safeProjects.filter(p => p && p.status !== 'Delivered').length;

  // Determine current user role
  const userRole = currentUser?.role || 'Super Admin';
  const isEmployee = userRole === 'Team Member' || userRole === 'Developer';
  const isManagerOrHr = userRole === 'Project Manager' || userRole === 'HR Manager' || userRole === 'Sales Lead' || userRole === 'Finance Officer';
  const isDirector = userRole === 'Super Admin';

  // Navigation Items strictly filtered according to EWMS Institutional Permissions Matrix
  const getNavItems = () => {
    // 1. Employee / Engineering Workforce Portal
    if (isEmployee) {
      return [
        { section: t('sec.humanCapital', 'Individual Workspace') },
        { to: '/admin', label: 'My Workspace', icon: LayoutDashboard, exact: true },
        { to: '/admin/tasks', label: t('nav.tasks', 'My Assigned Tasks'), icon: CheckSquare, badge: safeTasks.filter(t => t && t.status !== 'Done' && (t.assignedTo === currentUser?.name || t.assignedTo === currentUser?.employeeId)).length },
        { to: '/admin/team', label: t('nav.team', 'Colleagues Directory & Attendance'), icon: UserCheck },
        { to: '/admin/calendar', label: t('nav.calendar', 'Scheduled Meetings & Calendar'), icon: Calendar },
        { to: '/admin/support', label: t('nav.helpdesk', 'Support Requests & Tickets'), icon: LifeBuoy, badge: openTicketsCount > 0 ? `${openTicketsCount}` : undefined },
        { to: '/admin/documents', label: t('nav.documents', 'Shared Documents & Vault'), icon: FileText }
      ];
    }

    // 2. Manager / Operations & HR Portal
    if (isManagerOrHr) {
      return [
        { section: t('sec.operations', 'Enterprise Operations') },
        { to: '/admin', label: t('nav.dashboard', 'Executive Operations Dashboard'), icon: LayoutDashboard, exact: true },
        { to: '/admin/clients', label: t('nav.clients', 'Client Accounts Directory'), icon: Users, badge: safeClients.length },
        { to: '/admin/projects', label: t('nav.projects', 'Project Portfolio & Milestones'), icon: Briefcase, badge: activeProjectsCount },
        { to: '/admin/tasks', label: t('nav.tasks', 'Sprint Backlog & Kanban'), icon: CheckSquare, badge: safeTasks.filter(t => t && t.status !== 'Done').length },

        { section: t('sec.commercial', 'Commercial Governance') },
        { to: '/admin/crm', label: t('nav.crm', 'Enterprise CRM & Sales Pipeline'), icon: Target, badge: newLeadsCount > 0 ? `${newLeadsCount} New` : undefined },

        { section: t('sec.humanCapital', 'Human Capital & Delivery') },
        { to: '/admin/team', label: t('nav.team', 'Workforce Roster & Attendance'), icon: UserCheck },
        { to: '/admin/support', label: t('nav.helpdesk', 'Service Desk & SLA Governance'), icon: LifeBuoy, badge: openTicketsCount > 0 ? `${openTicketsCount}` : undefined },
        { to: '/admin/documents', label: t('nav.documents', 'Compliance Vault & Records'), icon: FileText },
        { to: '/admin/calendar', label: t('nav.calendar', 'Corporate Calendar & Sessions'), icon: Calendar },

        { section: t('sec.governance', 'Governance & Intelligence') },
        { to: '/admin/analytics', label: t('nav.analytics', 'Operational Telemetry & Reports'), icon: BarChart3 }
      ];
    }

    // 3. Director (Super Admin & CMD) - Complete 7-Sector Executive Control Matrix
    return [
      { section: 'Director Control Center' },
      { to: '/admin', label: 'Executive Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/admin/analytics', label: 'Business Intelligence & Telemetry', icon: BarChart3 },

      { section: 'Enterprise Operations' },
      { to: '/admin/clients', label: 'Client Accounts Directory', icon: Users, badge: safeClients.length },
      { to: '/admin/projects', label: 'Project Portfolio & Milestones', icon: Briefcase, badge: activeProjectsCount },
      { to: '/admin/tasks', label: 'Sprint Backlog & Kanban', icon: CheckSquare, badge: safeTasks.filter(t => t && t.status !== 'Done').length },

      { section: 'Finance & Commerce' },
      { to: '/admin/finance', label: 'Finance Dashboard & P&L', icon: CreditCard, badge: pendingInvoicesCount > 0 ? `${pendingInvoicesCount} Due` : undefined },
      { to: '/admin/crm', label: 'Enterprise CRM & Sales Pipeline', icon: Target, badge: newLeadsCount > 0 ? `${newLeadsCount} New` : undefined },

      { section: 'People & Organization' },
      { to: '/admin/team', label: 'Personnel Directory & Payroll', icon: UserCheck },

      { section: 'Communication & Meetings' },
      { to: '/admin/calendar', label: 'Corporate Calendar & Sessions', icon: Calendar },
      { to: '/admin/support', label: 'Service Desk & Escalations', icon: LifeBuoy, badge: openTicketsCount > 0 ? `${openTicketsCount}` : undefined },

      { section: 'Governance & Security' },
      { to: '/admin/documents', label: 'Compliance Vault & Records', icon: FileText },
      { to: '/admin/cms', label: 'Digital Publishing & Web CMS', icon: Globe },
      { to: '/admin/security', label: 'Information Security & RBAC', icon: ShieldCheck }
    ];
  };

  const NAV_ITEMS = getNavItems();

  // Search matches with null safety
  const matchingProjects = searchQuery ? safeProjects.filter(p => p && (p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.clientName?.toLowerCase().includes(searchQuery.toLowerCase()))) : [];
  const matchingClients = searchQuery ? safeClients.filter(c => c && (c.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) || c.primaryContact?.name?.toLowerCase().includes(searchQuery.toLowerCase()))) : [];
  const matchingTasks = searchQuery ? safeTasks.filter(t => t && t.title?.toLowerCase().includes(searchQuery.toLowerCase())) : [];
  const matchingLeads = searchQuery ? safeLeads.filter(l => l && (l.company?.toLowerCase().includes(searchQuery.toLowerCase()) || l.name?.toLowerCase().includes(searchQuery.toLowerCase()))) : [];

  const hasSearchResults = matchingProjects.length > 0 || matchingClients.length > 0 || matchingTasks.length > 0 || matchingLeads.length > 0;

  return (
    <div className={`adm-app theme-${theme}`}>
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Quick Create Universal Modal */}
      <QuickCreateModal isOpen={showQuickCreate} onClose={() => setShowQuickCreate(false)} />

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="adm-mobile-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Close Mobile Navigation"
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`adm-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Brand Header */}
        <div className="adm-sidebar-header">
          <NavLink to={isEmployee ? '/admin/team' : '/admin'} className="adm-brand-link" onClick={() => setMobileOpen(false)}>
            <div className="adm-brand-logo" style={{ background: 'transparent', boxShadow: 'none', padding: '2px' }}>
              <img src="/images/logo.svg" alt="Enterprenex Logo" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
            </div>
            {!collapsed && (
              <div className="adm-brand-text">
                <span className="adm-brand-title">ENTERPRENEX</span>
                <span className="adm-brand-sub">Enterprise Suite</span>
              </div>
            )}
          </NavLink>
        </div>

        {/* Navigation Items */}
        <div className="adm-nav-scroll">
          {NAV_ITEMS.map((item, idx) => {
            if (item.section) {
              if (collapsed) return null;
              return (
                <div key={idx} className="adm-nav-section">
                  {item.section}
                </div>
              );
            }

            const Icon = item.icon!;
            const isItemExact = item.to === '/admin' || Boolean(item.exact);

            return (
              <NavLink
                key={item.to}
                to={item.to!}
                end={isItemExact}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `adm-nav-link ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <div className="adm-nav-icon">
                  <Icon size={18} />
                </div>
                {!collapsed && (
                  <>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && <span className="adm-nav-badge">{item.badge}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer User Info */}
        {!collapsed && currentUser && (
          <div className="adm-sidebar-footer">
            <img src={currentUser.avatar} alt={currentUser.name} className="adm-avatar" />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--adm-text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--adm-primary)' }}>
                {currentUser.role}
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              title="Logout"
              style={{ background: 'transparent', border: 'none', color: 'var(--adm-text-dim)', cursor: 'pointer' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>

      {/* ── MAIN CONTENT WRAPPER ── */}
      <div className={`adm-main-wrapper ${collapsed ? 'sidebar-collapsed' : ''}`}>
        
        {/* Topbar */}
        <header className="adm-topbar">
          <div className="adm-topbar-left">
            <button
              className="adm-toggle-btn"
              onClick={() => {
                if (window.innerWidth <= 768) {
                  setMobileOpen(prev => !prev);
                } else {
                  setCollapsed(prev => !prev);
                }
              }}
              title="Toggle Sidebar Navigation"
              aria-label="Toggle Navigation"
            >
              <Menu size={18} />
            </button>

            {/* Global Search Bar */}
            <div className="adm-search-box">
              <Search size={15} className="adm-search-icon" />
              <input
                type="text"
                className="adm-search-input"
                placeholder="Search institutional records, clients, projects, or workstreams..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
                onFocus={() => setShowSearchResults(true)}
              />

              {/* Search Results Dropdown */}
              {showSearchResults && searchQuery.trim() && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    background: 'var(--adm-surface)',
                    border: '1px solid var(--adm-border-light)',
                    borderRadius: 'var(--adm-radius)',
                    boxShadow: 'var(--adm-shadow-lg)',
                    maxHeight: '380px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    padding: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase' }}>
                    <span>Search Results for "{searchQuery}"</span>
                    <button onClick={() => setShowSearchResults(false)} style={{ background: 'none', border: 'none', color: 'var(--adm-text-dim)', cursor: 'pointer' }}>Close</button>
                  </div>

                  {!hasSearchResults && (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--adm-text-muted)', fontSize: '0.85rem' }}>
                      No matching records found.
                    </div>
                  )}

                  {matchingProjects.length > 0 && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--adm-primary)', fontWeight: 700, padding: '4px 8px' }}>PROJECTS ({matchingProjects.length})</div>
                      {matchingProjects.map(p => (
                        <div
                          key={p.id}
                          onClick={() => { navigate('/admin/projects'); setShowSearchResults(false); }}
                          style={{ padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          className="adm-table-row-hover"
                        >
                          <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>{p.title}</span>
                          <span className="adm-badge adm-badge-primary">{p.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {matchingClients.length > 0 && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--adm-success)', fontWeight: 700, padding: '4px 8px' }}>CLIENTS ({matchingClients.length})</div>
                      {matchingClients.map(c => (
                        <div
                          key={c.id}
                          onClick={() => { navigate('/admin/clients'); setShowSearchResults(false); }}
                          style={{ padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          className="adm-table-row-hover"
                        >
                          <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>{c.companyName}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>{c.city}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {matchingTasks.length > 0 && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--adm-info)', fontWeight: 700, padding: '4px 8px' }}>TASKS ({matchingTasks.length})</div>
                      {matchingTasks.map(t => (
                        <div
                          key={t.id}
                          onClick={() => { navigate('/admin/tasks'); setShowSearchResults(false); }}
                          style={{ padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          className="adm-table-row-hover"
                        >
                          <span style={{ fontSize: '0.82rem', color: '#fff' }}>{t.title}</span>
                          <span className="adm-badge adm-badge-neutral">{t.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {matchingLeads.length > 0 && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--adm-warning)', fontWeight: 700, padding: '4px 8px' }}>LEADS ({matchingLeads.length})</div>
                      {matchingLeads.map(l => (
                        <div
                          key={l.id}
                          onClick={() => { navigate('/admin/crm'); setShowSearchResults(false); }}
                          style={{ padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          className="adm-table-row-hover"
                        >
                          <span style={{ fontSize: '0.82rem', color: '#fff' }}>{l.company}</span>
                          <span className="adm-badge adm-badge-primary">{l.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="adm-topbar-right">
            {/* System Settings & Language Preferences Trigger */}
            <button
              className="adm-topbar-btn"
              onClick={() => setShowSettingsModal(true)}
              title="Portal Settings & Language Preferences"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Settings size={17} />
            </button>


            {/* Live Minimalist Theme Toggle (Light / Dark) */}
            <button
              className="adm-topbar-btn"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Clean Light Minimalism'}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} color="#f59e0b" />}
            </button>

            {/* Quick Action Button - Scoped by RBAC (No direct CRUD for employees) */}
            {!isEmployee ? (
              <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={() => setShowQuickCreate(true)}>
                <Plus size={15} />
                <span>{t('btn.add', 'Create New')}</span>
              </button>
            ) : (
              <button
                className="adm-btn adm-btn-secondary adm-btn-sm"
                onClick={() => navigate('/admin/support')}
                title="Submit an internal support ticket, query, or infrastructure request"
              >
                <LifeBuoy size={14} color="var(--adm-primary)" />
                <span>Raise Request</span>
              </button>
            )}

            {/* Notifications Bell */}
            <div style={{ position: 'relative' }}>
              <button className="adm-topbar-btn" onClick={() => setShowNotifMenu(!showNotifMenu)} title="Notifications">
                <Bell size={17} />
                {(openTicketsCount > 0 || (isDirector && pendingInvoicesCount > 0)) && <span className="adm-badge-dot" />}
              </button>

              {/* Notification Dropdown */}
              {showNotifMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '320px',
                    background: 'var(--adm-surface)',
                    border: '1px solid var(--adm-border-light)',
                    borderRadius: 'var(--adm-radius)',
                    boxShadow: 'var(--adm-shadow-lg)',
                    zIndex: 1000,
                    padding: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--adm-border)' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>Corporate System Alerts</span>
                    <span className="adm-badge adm-badge-primary">{openTicketsCount + (isDirector ? pendingInvoicesCount : 0)} Active</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {safeTickets.slice(0, 2).map(t => (
                      <div
                        key={t.id}
                        onClick={() => { navigate('/admin/support'); setShowNotifMenu(false); }}
                        style={{ padding: '0.5rem', background: 'var(--adm-bg)', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff' }}>{t.ticketNumber}: {t.subject}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--adm-warning)', marginTop: '2px' }}>SLA: {t.slaHoursRemaining || 24}h remaining • {t.clientName || 'General'}</div>
                      </div>
                    ))}

                    {isDirector && safeInvoices.filter(i => i && i.status === 'Pending').slice(0, 1).map(i => (
                      <div
                        key={i.id}
                        onClick={() => { navigate('/admin/finance'); setShowNotifMenu(false); }}
                        style={{ padding: '0.5rem', background: 'var(--adm-bg)', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--adm-text)' }}>{i.invoiceNumber}: Payment Pending</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--adm-danger)', marginTop: '2px' }}>₹{(Number(i.totalAmount) || 0).toLocaleString('en-IN')} • Due {i.dueDate || 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Role Switcher */}
            <div style={{ position: 'relative' }}>
              <div className="adm-user-profile-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                {currentUser && <img src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt={currentUser.name || 'User'} className="adm-avatar" />}
                <div className="adm-user-info">
                  <span className="adm-user-name">{currentUser?.name || 'Enterprenex Admin'}</span>
                  <span className="adm-user-role" style={{ fontSize: '0.68rem', color: 'var(--adm-text-dim)', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser?.email || currentUser?.role || 'Super Admin'}
                  </span>
                </div>
                <ChevronDown size={14} color="var(--adm-text-dim)" />
              </div>

              {/* Profile / RBAC User Menu Dropdown */}
              {showUserMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '270px',
                    background: 'var(--adm-surface)',
                    border: '1px solid var(--adm-border-light)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.16)',
                    zIndex: 1000,
                    padding: '1rem'
                  }}
                >
                  {currentUser && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                        <img
                          src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={currentUser.name || 'User'}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--adm-primary)' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--adm-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {currentUser.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--adm-primary)', fontWeight: 600 }}>
                            {currentUser.role}
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: '0.65rem 0.75rem', background: 'var(--adm-bg)', borderRadius: '8px', fontSize: '0.75rem', marginBottom: '0.75rem', border: '1px solid var(--adm-border)' }}>
                        <div style={{ color: 'var(--adm-text-dim)', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
                          Verified Email
                        </div>
                        <div style={{ color: 'var(--adm-text)', fontWeight: 600, wordBreak: 'break-all' }}>
                          {currentUser.email}
                        </div>
                        {currentUser.department && (
                          <>
                            <div style={{ marginTop: '6px', color: 'var(--adm-text-dim)', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
                              Department
                            </div>
                            <div style={{ color: 'var(--adm-text-muted)', fontWeight: 600 }}>
                              {currentUser.department}
                            </div>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => { setShowUserMenu(false); setShowSettingsModal(true); }}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          background: 'var(--adm-surface-hover)',
                          border: '1px solid var(--adm-border)',
                          borderRadius: '6px',
                          color: 'var(--adm-text)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          marginBottom: '0.75rem'
                        }}
                      >
                        <Settings size={14} color="var(--adm-primary)" />
                        <span>Portal Settings & Language</span>
                      </button>
                    </>
                  )}

                  <div style={{ borderTop: '1px solid var(--adm-border)', paddingTop: '0.5rem' }}>
                    <button
                      onClick={() => { logout(); navigate('/login'); }}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--adm-danger)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Viewport Content */}
        <main className="adm-content">
          {children}
        </main>

        {/* Floating Conversational AI Copilot */}
        <AiChatbotWidget />

        {/* Portal Settings & Language Preferences Modal */}
        {showSettingsModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '1rem'
            }}
            onClick={() => setShowSettingsModal(false)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '520px',
                background: 'var(--adm-surface)',
                borderRadius: '16px',
                border: '1px solid var(--adm-border)',
                boxShadow: '0 20px 48px rgba(0,0,0,0.25)',
                overflow: 'hidden'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--adm-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(5, 150, 105, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Settings size={18} color="var(--adm-primary)" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--adm-text)' }}>
                      Portal Settings & Preferences
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--adm-text-dim)' }}>
                      Configure regional language, interface appearance and RBAC security
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--adm-text-dim)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.25rem', maxHeight: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* 1. Language Selection (10 Types) */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--adm-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Languages size={15} color="var(--adm-primary)" />
                      System Language / भाषा निवडा ({SUPPORTED_LANGUAGES.length})
                    </label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)', fontWeight: 700 }}>
                      Active: {language.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    {SUPPORTED_LANGUAGES.map(lang => {
                      const isActive = language === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            setLanguage(lang.code);
                            showToast('Language Updated', `Switched language to ${lang.nativeLabel}.`, 'success');
                          }}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: isActive ? '2px solid var(--adm-primary)' : '1px solid var(--adm-border)',
                            background: isActive ? 'var(--adm-primary-soft)' : 'var(--adm-bg)',
                            color: isActive ? 'var(--adm-primary)' : 'var(--adm-text)',
                            fontWeight: isActive ? 700 : 500,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            textAlign: 'left',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>{lang.nativeLabel}</span>
                          {isActive && <CheckCircle2 size={14} color="var(--adm-primary)" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Theme & Display */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--adm-text)', marginBottom: '0.65rem' }}>
                    Theme Appearance
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => { if (theme !== 'light') toggleTheme(); }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: theme === 'light' ? '2px solid var(--adm-primary)' : '1px solid var(--adm-border)',
                        background: theme === 'light' ? 'var(--adm-primary-soft)' : 'var(--adm-bg)',
                        color: theme === 'light' ? 'var(--adm-primary)' : 'var(--adm-text)',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Sun size={16} color="#f59e0b" />
                      <span>Light Clean Minimalism</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: theme === 'dark' ? '2px solid var(--adm-primary)' : '1px solid var(--adm-border)',
                        background: theme === 'dark' ? 'var(--adm-primary-soft)' : 'var(--adm-bg)',
                        color: theme === 'dark' ? 'var(--adm-primary)' : 'var(--adm-text)',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Moon size={16} />
                      <span>Dark Enterprise Mode</span>
                    </button>
                  </div>
                </div>

                {/* 3. Session & RBAC info */}
                <div style={{ padding: '0.85rem', background: 'var(--adm-bg)', borderRadius: '10px', border: '1px solid var(--adm-border)', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--adm-text-dim)' }}>Session Role:</span>
                    <strong style={{ color: 'var(--adm-primary)' }}>{currentUser?.role || 'Super Admin'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--adm-text-dim)' }}>Timezone:</span>
                    <strong style={{ color: 'var(--adm-text)' }}>IST (UTC+05:30)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--adm-text-dim)' }}>Access Protocol:</span>
                    <strong style={{ color: '#059669' }}>Zero-Trust Statutory RBAC</strong>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '0.75rem 1.25rem', background: 'var(--adm-bg)', borderTop: '1px solid var(--adm-border)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="adm-btn adm-btn-primary adm-btn-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
