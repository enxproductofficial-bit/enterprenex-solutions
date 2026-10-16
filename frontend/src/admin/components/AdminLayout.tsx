import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useLanguage } from '../i18n/LanguageContext';
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
  Sparkles
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
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
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
        { section: t('sec.humanCapital', 'Engineering Workspace') },
        { to: '/admin/team', label: 'Workforce Roster & Attendance', icon: UserCheck },
        { to: '/admin/tasks', label: 'Assigned Engineering Tasks', icon: CheckSquare, badge: safeTasks.filter(t => t && t.status !== 'Done' && (t.assignedTo === currentUser?.name || t.assignedTo === currentUser?.employeeId)).length },
        { to: '/admin/calendar', label: 'Corporate Schedule & Sessions', icon: Calendar },
        { to: '/admin/support', label: 'Service Desk Incident Tickets', icon: LifeBuoy, badge: openTicketsCount > 0 ? `${openTicketsCount}` : undefined },
        { to: '/admin/documents', label: 'Compliance Records & Credentials', icon: FileText }
      ];
    }

    // 2. Manager / Operations & HR Portal
    if (isManagerOrHr) {
      return [
        { section: 'Enterprise Operations' },
        { to: '/admin', label: 'Executive Operations Dashboard', icon: LayoutDashboard, exact: true },
        { to: '/admin/clients', label: 'Client Accounts Directory', icon: Users, badge: safeClients.length },
        { to: '/admin/projects', label: 'Project Portfolio & Milestones', icon: Briefcase, badge: activeProjectsCount },
        { to: '/admin/tasks', label: 'Sprint Backlog & Kanban', icon: CheckSquare, badge: safeTasks.filter(t => t && t.status !== 'Done').length },

        { section: 'Commercial Governance' },
        { to: '/admin/services', label: 'Enterprise Services Catalogue', icon: Layers },
        { to: '/admin/crm', label: 'Enterprise CRM & Sales Pipeline', icon: Target, badge: newLeadsCount > 0 ? `${newLeadsCount} New` : undefined },

        { section: 'Human Capital & Delivery' },
        { to: '/admin/team', label: 'Workforce Roster & Attendance', icon: UserCheck },
        { to: '/admin/support', label: 'Service Desk & SLA Governance', icon: LifeBuoy, badge: openTicketsCount > 0 ? `${openTicketsCount}` : undefined },
        { to: '/admin/documents', label: 'Compliance Vault & Records', icon: FileText },
        { to: '/admin/calendar', label: 'Corporate Calendar & Sessions', icon: Calendar },

        { section: 'Governance & Intelligence' },
        { to: '/admin/analytics', label: 'Operational Telemetry & Reports', icon: BarChart3 }
      ];
    }

    // 3. Director (Super Admin) - Full 14-Module Executive Access
    return [
      { section: 'Enterprise Operations' },
      { to: '/admin', label: 'Executive Operations Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/admin/clients', label: 'Client Accounts Directory', icon: Users, badge: safeClients.length },
      { to: '/admin/projects', label: 'Project Portfolio & Milestones', icon: Briefcase, badge: activeProjectsCount },
      { to: '/admin/tasks', label: 'Sprint Backlog & Kanban', icon: CheckSquare, badge: safeTasks.filter(t => t && t.status !== 'Done').length },

      { section: 'Commercial Governance' },
      { to: '/admin/services', label: 'Enterprise Services Catalogue', icon: Layers },
      { to: '/admin/crm', label: 'Enterprise CRM & Sales Pipeline', icon: Target, badge: newLeadsCount > 0 ? `${newLeadsCount} New` : undefined },
      { to: '/admin/finance', label: 'Fiscal Operations & Invoicing', icon: CreditCard, badge: pendingInvoicesCount > 0 ? `${pendingInvoicesCount} Due` : undefined },

      { section: 'Human Capital & Delivery' },
      { to: '/admin/team', label: 'Workforce Roster & Attendance', icon: UserCheck },
      { to: '/admin/support', label: 'Service Desk & SLA Governance', icon: LifeBuoy, badge: openTicketsCount > 0 ? `${openTicketsCount}` : undefined },
      { to: '/admin/documents', label: 'Compliance Vault & Records', icon: FileText },
      { to: '/admin/calendar', label: 'Corporate Calendar & Sessions', icon: Calendar },

      { section: 'Governance & Intelligence' },
      { to: '/admin/cms', label: 'Digital Publishing & Web CMS', icon: Globe },
      { to: '/admin/analytics', label: 'Executive Intelligence & Analytics', icon: BarChart3 },
      { to: '/admin/security', label: 'Information Security & RBAC Governance', icon: ShieldCheck }
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

      {/* ── SIDEBAR ── */}
      <aside className={`adm-sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Brand Header */}
        <div className="adm-sidebar-header">
          <NavLink to={isEmployee ? '/admin/team' : '/admin'} className="adm-brand-link">
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
            const isActive = item.exact 
              ? location.pathname === item.to 
              : location.pathname.startsWith(item.to!);

            return (
              <NavLink
                key={item.to}
                to={item.to!}
                className={`adm-nav-link ${isActive ? 'active' : ''}`}
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
            <button className="adm-toggle-btn" onClick={() => setCollapsed(!collapsed)} title="Toggle Sidebar">
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
            {/* Multi-Language Selector Dropdown (English / Hindi / Marathi) */}
            <div style={{ position: 'relative' }}>
              <button
                className="adm-topbar-btn"
                onClick={() => setShowLangMenu(!showLangMenu)}
                title="Change Portal Language (English / हिन्दी / मराठी)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '0 10px'
                }}
              >
                <Languages size={15} color="var(--adm-primary)" />
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {language === 'hi' ? 'हिन्दी' : language === 'mr' ? 'मराठी' : 'ENG'}
                </span>
                <ChevronDown size={12} />
              </button>

              {showLangMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '180px',
                    background: 'var(--adm-surface)',
                    border: '1px solid var(--adm-border)',
                    borderRadius: 'var(--adm-radius)',
                    boxShadow: 'var(--adm-shadow-lg)',
                    zIndex: 1000,
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: 'var(--adm-text-dim)', padding: '4px 8px', textTransform: 'uppercase', fontWeight: 800 }}>
                    Select Language / भाषा निवडा
                  </div>
                  <button
                    onClick={() => { setLanguage('en'); setShowLangMenu(false); }}
                    style={{
                      padding: '8px 10px',
                      background: language === 'en' ? 'var(--adm-primary-soft)' : 'transparent',
                      color: language === 'en' ? 'var(--adm-primary)' : 'var(--adm-text)',
                      border: 'none',
                      borderRadius: '6px',
                      textAlign: 'left',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>English (Official)</span>
                    {language === 'en' && <CheckCircle2 size={13} />}
                  </button>
                  <button
                    onClick={() => { setLanguage('hi'); setShowLangMenu(false); }}
                    style={{
                      padding: '8px 10px',
                      background: language === 'hi' ? 'var(--adm-primary-soft)' : 'transparent',
                      color: language === 'hi' ? 'var(--adm-primary)' : 'var(--adm-text)',
                      border: 'none',
                      borderRadius: '6px',
                      textAlign: 'left',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>हिन्दी (Hindi)</span>
                    {language === 'hi' && <CheckCircle2 size={13} />}
                  </button>
                  <button
                    onClick={() => { setLanguage('mr'); setShowLangMenu(false); }}
                    style={{
                      padding: '8px 10px',
                      background: language === 'mr' ? 'var(--adm-primary-soft)' : 'transparent',
                      color: language === 'mr' ? 'var(--adm-primary)' : 'var(--adm-text)',
                      border: 'none',
                      borderRadius: '6px',
                      textAlign: 'left',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>मराठी (Maharashtra)</span>
                    {language === 'mr' && <CheckCircle2 size={13} />}
                  </button>
                </div>
              )}
            </div>


            {/* Live Minimalist Theme Toggle (Light / Dark) */}
            <button
              className="adm-topbar-btn"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Clean Light Minimalism'}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} color="#f59e0b" />}
            </button>

            {/* Quick Action Button */}
            <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={() => setShowQuickCreate(true)}>
              <Plus size={15} />
              <span>{t('btn.add', 'Create New')}</span>
            </button>

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

              {/* Profile / Role Switcher Modal Dropdown */}
              {showUserMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '280px',
                    background: 'var(--adm-surface)',
                    border: '1px solid var(--adm-border-light)',
                    borderRadius: '14px',
                    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.16)',
                    zIndex: 1000,
                    padding: '1.1rem'
                  }}
                >
                  {currentUser && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                        <img src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt={currentUser.name || 'User'} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--adm-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {currentUser.name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--adm-primary)', fontWeight: 600 }}>
                            {currentUser.role}
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: '0.75rem 0.85rem', background: 'var(--adm-bg)', borderRadius: '8px', fontSize: '0.78rem', marginBottom: '0.85rem', border: '1px solid var(--adm-border)' }}>
                        <div style={{ color: 'var(--adm-text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '3px' }}>
                          Official Email
                        </div>
                        <div style={{ color: 'var(--adm-text)', fontWeight: 600, wordBreak: 'break-all' }}>
                          {currentUser.email}
                        </div>
                        <div style={{ marginTop: '8px', color: 'var(--adm-text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '3px' }}>
                          Department
                        </div>
                        <div style={{ color: 'var(--adm-text-muted)', fontWeight: 600 }}>
                          {currentUser.department || 'Operations & Engineering'}
                        </div>
                      </div>

                      {/* Update Photo Option */}
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 10px',
                          fontSize: '0.78rem',
                          color: '#34d399',
                          background: 'rgba(5, 150, 105, 0.1)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          marginBottom: '0.85rem',
                          border: '1px solid rgba(5, 150, 105, 0.25)',
                          fontWeight: 600
                        }}
                      >
                        <Camera size={13} />
                        <span>Update My Profile Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) {
                              showToast('File Too Large', 'Please select an image smaller than 5MB.', 'error');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => {
                              const dataUrl = reader.result as string;
                              updateCurrentUser({ avatar: dataUrl });
                              const matchedEmp = employees.find(emp => emp.id === currentUser?.id || emp.email === currentUser?.email);
                              if (matchedEmp) {
                                updateEmployee(matchedEmp.id, { avatar: dataUrl });
                              }
                              showToast('Profile Photo Updated', 'Your profile picture has been updated across the suite.', 'success');
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
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

      </div>
    </div>
  );
};
