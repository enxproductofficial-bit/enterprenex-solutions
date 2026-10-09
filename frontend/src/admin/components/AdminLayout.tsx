import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
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
  Sparkles
} from 'lucide-react';
import { QuickCreateModal } from './QuickCreateModal';
import { ToastContainer } from './ToastContainer';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { currentUser, users, switchUser, logout, tickets, invoices, leads, projects, clients, tasks } = useAdmin();
  const [collapsed, setCollapsed] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Calculate live badge counters
  const openTicketsCount = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const pendingInvoicesCount = invoices.filter(i => i.status === 'Pending').length;
  const newLeadsCount = leads.filter(l => l.status === 'New Lead').length;
  const activeProjectsCount = projects.filter(p => p.status !== 'Delivered').length;

  // Determine current user role
  const userRole = currentUser?.role || 'Super Admin';
  const isEmployee = userRole === 'Team Member' || userRole === 'Developer';
  const isManagerOrHr = userRole === 'Project Manager' || userRole === 'HR Manager' || userRole === 'Sales Lead' || userRole === 'Finance Officer';
  const isDirector = userRole === 'Super Admin';

  // Navigation Items strictly filtered according to EWMS Permissions Matrix
  const getNavItems = () => {
    // 1. Employee / Staff Portal
    if (isEmployee) {
      return [
        { section: 'My Work Portal' },
        { to: '/admin/tasks', label: 'My Tasks & Kanban', icon: CheckSquare, badge: tasks.filter(t => t.status !== 'Done').length },
        { to: '/admin/team', label: 'My Attendance & Leave', icon: UserCheck },
        { to: '/admin/support', label: 'Helpdesk & Support', icon: LifeBuoy, badge: openTicketsCount > 0 ? `${openTicketsCount}` : undefined },
        { to: '/admin/documents', label: 'Document Vault', icon: FileText },
        { to: '/admin/calendar', label: 'Calendar & Schedule', icon: Calendar }
      ];
    }

    // 2. Manager / HR Operations Portal (Finance, CMS & Security strictly excluded)
    if (isManagerOrHr) {
      return [
        { section: 'Core Operations' },
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { to: '/admin/clients', label: 'Client Management', icon: Users, badge: clients.length },
        { to: '/admin/projects', label: 'Project Lifecycle', icon: Briefcase, badge: activeProjectsCount },
        { to: '/admin/tasks', label: 'Task Kanban & Sprints', icon: CheckSquare, badge: tasks.filter(t => t.status !== 'Done').length },

        { section: 'Growth & Commerce' },
        { to: '/admin/services', label: 'Services Catalogue', icon: Layers },
        { to: '/admin/crm', label: 'Leads & Sales CRM', icon: Target, badge: newLeadsCount > 0 ? `${newLeadsCount} New` : undefined },

        { section: 'People & Delivery' },
        { to: '/admin/team', label: 'Team & Attendance', icon: UserCheck },
        { to: '/admin/support', label: 'Support & Helpdesk', icon: LifeBuoy, badge: openTicketsCount > 0 ? `${openTicketsCount}` : undefined },
        { to: '/admin/documents', label: 'Document Vault', icon: FileText },
        { to: '/admin/calendar', label: 'Calendar & Meetings', icon: Calendar },

        { section: 'Platform & Intelligence' },
        { to: '/admin/analytics', label: 'Analytics & Reports', icon: BarChart3 }
      ];
    }

    // 3. Director (Super Admin) - Full 14-Module Unrestricted Access
    return [
      { section: 'Core Operations' },
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/admin/clients', label: 'Client Management', icon: Users, badge: clients.length },
      { to: '/admin/projects', label: 'Project Lifecycle', icon: Briefcase, badge: activeProjectsCount },
      { to: '/admin/tasks', label: 'Task Kanban & Sprints', icon: CheckSquare, badge: tasks.filter(t => t.status !== 'Done').length },

      { section: 'Growth & Commerce' },
      { to: '/admin/services', label: 'Services Catalogue', icon: Layers },
      { to: '/admin/crm', label: 'Leads & Sales CRM', icon: Target, badge: newLeadsCount > 0 ? `${newLeadsCount} New` : undefined },
      { to: '/admin/finance', label: 'Finance & Invoices', icon: CreditCard, badge: pendingInvoicesCount > 0 ? `${pendingInvoicesCount} Due` : undefined },

      { section: 'People & Delivery' },
      { to: '/admin/team', label: 'Team & Attendance', icon: UserCheck },
      { to: '/admin/support', label: 'Support & Helpdesk', icon: LifeBuoy, badge: openTicketsCount > 0 ? `${openTicketsCount}` : undefined },
      { to: '/admin/documents', label: 'Document Vault', icon: FileText },
      { to: '/admin/calendar', label: 'Calendar & Meetings', icon: Calendar },

      { section: 'Platform & Intelligence' },
      { to: '/admin/cms', label: 'CMS & Website', icon: Globe },
      { to: '/admin/analytics', label: 'Analytics & Reports', icon: BarChart3 },
      { to: '/admin/security', label: 'Admin & RBAC Security', icon: ShieldCheck }
    ];
  };

  const NAV_ITEMS = getNavItems();

  // Search matches
  const matchingProjects = searchQuery ? projects.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.clientName.toLowerCase().includes(searchQuery.toLowerCase())) : [];
  const matchingClients = searchQuery ? clients.filter(c => c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || c.primaryContact.name.toLowerCase().includes(searchQuery.toLowerCase())) : [];
  const matchingTasks = searchQuery ? tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())) : [];
  const matchingLeads = searchQuery ? leads.filter(l => l.company.toLowerCase().includes(searchQuery.toLowerCase()) || l.name.toLowerCase().includes(searchQuery.toLowerCase())) : [];

  const hasSearchResults = matchingProjects.length > 0 || matchingClients.length > 0 || matchingTasks.length > 0 || matchingLeads.length > 0;

  return (
    <div className="adm-app">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Quick Create Universal Modal */}
      <QuickCreateModal isOpen={showQuickCreate} onClose={() => setShowQuickCreate(false)} />

      {/* ── SIDEBAR ── */}
      <aside className={`adm-sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Brand Header */}
        <div className="adm-sidebar-header">
          <NavLink to={isEmployee ? '/admin/tasks' : '/admin'} className="adm-brand-link">
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
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--adm-primary)' }}>
                {currentUser.role}
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/admin/login'); }}
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
                placeholder="Search projects, clients, tasks, leads..."
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
            {/* Quick Action Button */}
            <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={() => setShowQuickCreate(true)}>
              <Plus size={15} />
              <span>Create New</span>
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
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>System Alerts</span>
                    <span className="adm-badge adm-badge-primary">{openTicketsCount + (isDirector ? pendingInvoicesCount : 0)} Active</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {tickets.slice(0, 2).map(t => (
                      <div
                        key={t.id}
                        onClick={() => { navigate('/admin/support'); setShowNotifMenu(false); }}
                        style={{ padding: '0.5rem', background: 'var(--adm-bg)', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff' }}>{t.ticketNumber}: {t.subject}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--adm-warning)', marginTop: '2px' }}>SLA: {t.slaHoursRemaining}h remaining • {t.clientName}</div>
                      </div>
                    ))}

                    {isDirector && invoices.filter(i => i.status === 'Pending').slice(0, 1).map(i => (
                      <div
                        key={i.id}
                        onClick={() => { navigate('/admin/finance'); setShowNotifMenu(false); }}
                        style={{ padding: '0.5rem', background: 'var(--adm-bg)', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff' }}>{i.invoiceNumber}: Payment Pending</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--adm-danger)', marginTop: '2px' }}>₹{i.totalAmount.toLocaleString('en-IN')} • Due {i.dueDate}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Role Switcher */}
            <div style={{ position: 'relative' }}>
              <div className="adm-user-profile-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                {currentUser && <img src={currentUser.avatar} alt={currentUser.name} className="adm-avatar" />}
                <div className="adm-user-info">
                  <span className="adm-user-name">{currentUser?.name || 'Enterprenex Admin'}</span>
                  <span className="adm-user-role">{currentUser?.role || 'Super Admin'}</span>
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
                    width: '260px',
                    background: 'var(--adm-surface)',
                    border: '1px solid var(--adm-border-light)',
                    borderRadius: 'var(--adm-radius)',
                    boxShadow: 'var(--adm-shadow-lg)',
                    zIndex: 1000,
                    padding: '1rem'
                  }}
                >
                  {currentUser && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                        <img src={currentUser.avatar} alt={currentUser.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {currentUser.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--adm-primary)', fontWeight: 600 }}>
                            {currentUser.role}
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: '0.65rem 0.75rem', background: 'var(--adm-bg)', borderRadius: '6px', fontSize: '0.75rem', marginBottom: '0.85rem', border: '1px solid var(--adm-border)' }}>
                        <div style={{ color: 'var(--adm-text-dim)', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
                          Official Email
                        </div>
                        <div style={{ color: '#fff', fontWeight: 600, wordBreak: 'break-all' }}>
                          {currentUser.email}
                        </div>
                        <div style={{ marginTop: '6px', color: 'var(--adm-text-dim)', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
                          Department
                        </div>
                        <div style={{ color: 'var(--adm-text-muted)', fontWeight: 500 }}>
                          {currentUser.department}
                        </div>
                      </div>
                    </>
                  )}

                  <div style={{ borderTop: '1px solid var(--adm-border)', paddingTop: '0.5rem' }}>
                    <button
                      onClick={() => { logout(); navigate('/admin/login'); }}
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

      </div>
    </div>
  );
};
