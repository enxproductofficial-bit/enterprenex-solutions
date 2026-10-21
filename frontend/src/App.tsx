import { BrowserRouter, Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import './index.css';
import './admin/admin.css';

// Verification & Staff Auth Pages
import VerificationPage from './pages/VerificationPage';
import LoginPage from './pages/LoginPage';
import { CreateNewPasswordPage } from './pages/CreateNewPasswordPage';

// Admin Context, Layout & IP Guard
import { AdminProvider, useAdmin } from './admin/context/AdminContext';
import { LanguageProvider } from './admin/i18n/LanguageContext';
import { AdminLayout } from './admin/components/AdminLayout';
import { IpRestrictionGuard } from './admin/components/IpRestrictionGuard';
import { AdminErrorBoundary } from './admin/components/AdminErrorBoundary';

// Admin Module Pages (All 14 Enterprise Modules)
import { AdminLoginPage } from './admin/pages/AdminLoginPage';
import { DashboardPage } from './admin/pages/DashboardPage';
import { ClientsPage } from './admin/pages/ClientsPage';
import { ProjectsPage } from './admin/pages/ProjectsPage';
import { ServicesManagePage } from './admin/pages/ServicesManagePage';
import { CrmLeadsPage } from './admin/pages/CrmLeadsPage';
import { FinancePage } from './admin/pages/FinancePage';
import { TeamPage } from './admin/pages/TeamPage';
import { TasksPage } from './admin/pages/TasksPage';
import { HelpdeskPage } from './admin/pages/HelpdeskPage';
import { DocumentsPage } from './admin/pages/DocumentsPage';
import { CalendarPage } from './admin/pages/CalendarPage';
import { CmsPage } from './admin/pages/CmsPage';
import { AnalyticsPage } from './admin/pages/AnalyticsPage';
import { SecurityPage } from './admin/pages/SecurityPage';
import { EmailsPage } from './admin/pages/EmailsPage';

function ScrollToTopOnRoute() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search]);
  return null;
}

// Protected Route Guard for Admin with EWMS Role-Based Access Control
interface AdminRouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  moduleName?: string;
}

function isAuthorizedRole(currentRole: string | undefined, allowedRoles?: string[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!currentRole) return false;
  if (allowedRoles.includes(currentRole)) return true;

  // Compatibility mapping for the 5 core EWMS roles
  const roleEquivalents: Record<string, string[]> = {
    'Director / CEO': ['Director / CEO', 'Super Admin'],
    'Super Admin': ['Director / CEO', 'Super Admin'],
    'Super Admin / IT Admin': ['Super Admin / IT Admin', 'Super Admin'],
    'Manager': ['Manager', 'Project Manager', 'Sales Lead', 'Finance Officer'],
    'Project Manager': ['Manager', 'Project Manager'],
    'HR': ['HR', 'HR Manager'],
    'HR Manager': ['HR', 'HR Manager'],
    'Employee': ['Employee', 'Team Member', 'Developer'],
    'Team Member': ['Employee', 'Team Member', 'Developer'],
    'Developer': ['Employee', 'Team Member', 'Developer']
  };

  const equivs = roleEquivalents[currentRole] || [currentRole];
  return equivs.some(r => allowedRoles.includes(r));
}

function AdminRouteGuard({ children, allowedRoles, moduleName = 'This Module' }: AdminRouteGuardProps) {
  const { currentUser } = useAdmin();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Mandatory First-Time Password Setup Guard:
  // Employees cannot access the dashboard or any enterprise module until they complete password setup
  if (currentUser.mustChangePassword) {
    return <Navigate to="/create-new-password" replace />;
  }

  // If role is not authorized for this specific module
  if (allowedRoles && !isAuthorizedRole(currentUser.role, allowedRoles)) {
    const isEmployeeRole = currentUser.role === 'Employee' || currentUser.role === 'Team Member' || currentUser.role === 'Developer';
    return (
      <AdminErrorBoundary fallbackTitle="Unauthorized Module Access">
        <AdminLayout>
          <div style={{
            minHeight: '65vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2.5rem 1.5rem'
          }}>
            <div style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              color: '#ef4444',
              boxShadow: '0 0 30px rgba(239, 68, 68, 0.15)'
            }}>
              <ShieldAlert size={44} />
            </div>
            <span style={{
              padding: '5px 14px',
              borderRadius: '100px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '1rem'
            }}>
              EWMS Access Restricted
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>
              {moduleName} Access Restricted
            </h2>
            <p style={{ maxWidth: '520px', color: 'var(--adm-text-muted)', lineHeight: '1.6', fontSize: '0.92rem', marginBottom: '1.75rem' }}>
              According to the Enterprenex Solutions EWMS Policy, access to <strong style={{ color: '#fff' }}>{moduleName}</strong> is restricted to <strong>Director / Authorized Personnel</strong> only. Your current role is <strong style={{ color: 'var(--adm-primary)' }}>{currentUser.role}</strong>.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link
                to={isEmployeeRole ? '/admin/team' : '/admin'}
                className="adm-btn adm-btn-primary"
                style={{ textDecoration: 'none', padding: '0.65rem 1.4rem' }}
              >
                Return to Authorized Workspace
              </Link>
            </div>
          </div>
        </AdminLayout>
      </AdminErrorBoundary>
    );
  }

  return (
    <AdminErrorBoundary fallbackTitle={`${moduleName} Workspace`}>
      <AdminLayout>{children}</AdminLayout>
    </AdminErrorBoundary>
  );
}

function MainAppRoutes() {
  return (
    <>
      <ScrollToTopOnRoute />

      <Routes>
        {/* ── EWMS ROOT APPLICATION: Primary portal points directly to EWMS ── */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/verify" element={<VerificationPage />} />
        <Route path="/verification" element={<VerificationPage />} />
        <Route path="/verification/internship" element={<VerificationPage />} />
        <Route path="/verification/employee" element={<VerificationPage />} />

        {/* ── STAFF AUTH PORTAL (Approach A: Internal Onboarding Only) ── */}
        <Route path="/register" element={<Navigate to="/login?notice=internal_only" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-new-password" element={<CreateNewPasswordPage />} />
        <Route path="/change-password" element={<CreateNewPasswordPage />} />

        {/* ── ADMIN LOGIN (Protected by IP Restriction Guard) ── */}
        <Route path="/admin/login" element={<IpRestrictionGuard><AdminLoginPage /></IpRestrictionGuard>} />

        {/* ── 14 ENTERPRISE ADMIN SUITE MODULES (Protected strictly according to EWMS table) ── */}
        {/* 1. Dashboard: Director & Managers/HR */}
        <Route path="/admin" element={
          <IpRestrictionGuard>
            <AdminRouteGuard allowedRoles={['Super Admin', 'Project Manager', 'HR Manager', 'Sales Lead', 'Finance Officer', 'Team Member', 'Developer']} moduleName="Operations Dashboard">
              <DashboardPage />
            </AdminRouteGuard>
          </IpRestrictionGuard>
        } />

        {/* 2. Client Management: Director & Managers */}
        <Route path="/admin/clients" element={
          <IpRestrictionGuard>
            <AdminRouteGuard allowedRoles={['Super Admin', 'Project Manager', 'Sales Lead']} moduleName="Client Management">
              <ClientsPage />
            </AdminRouteGuard>
          </IpRestrictionGuard>
        } />

        {/* 3. Project Lifecycle: Director & Project Managers */}
        <Route path="/admin/projects" element={
          <IpRestrictionGuard>
            <AdminRouteGuard allowedRoles={['Super Admin', 'Project Manager']} moduleName="Project Lifecycle">
              <ProjectsPage />
            </AdminRouteGuard>
          </IpRestrictionGuard>
        } />

        {/* 4. Services Catalogue: Director & Managers */}
        <Route path="/admin/services" element={
          <IpRestrictionGuard>
            <AdminRouteGuard allowedRoles={['Super Admin', 'Project Manager', 'Sales Lead']} moduleName="Services Catalogue">
              <ServicesManagePage />
            </AdminRouteGuard>
          </IpRestrictionGuard>
        } />

        {/* 5. Leads & CRM: Director & Managers */}
        <Route path="/admin/crm" element={
          <IpRestrictionGuard>
            <AdminRouteGuard allowedRoles={['Super Admin', 'Project Manager', 'Sales Lead']} moduleName="Leads & Sales CRM">
              <CrmLeadsPage />
            </AdminRouteGuard>
          </IpRestrictionGuard>
        } />

        {/* 6. Finance & Invoices: DIRECTOR ONLY */}
        <Route path="/admin/finance" element={
          <IpRestrictionGuard>
            <AdminRouteGuard allowedRoles={['Super Admin']} moduleName="Finance & Invoices">
              <FinancePage />
            </AdminRouteGuard>
          </IpRestrictionGuard>
        } />

        {/* 7. Team & Attendance: All Roles (Director, Managers/HR, Employees) */}
        <Route path="/admin/team" element={
          <IpRestrictionGuard>
            <AdminRouteGuard allowedRoles={['Super Admin', 'Project Manager', 'HR Manager', 'Team Member', 'Developer']} moduleName="Team & Attendance">
              <TeamPage />
            </AdminRouteGuard>
          </IpRestrictionGuard>
        } />

        {/* 8. Tasks & Kanban: All Roles (Primary Workspace for Employees) */}
        <Route path="/admin/tasks" element={
          <IpRestrictionGuard>
            <AdminRouteGuard allowedRoles={['Super Admin', 'Project Manager', 'Team Member', 'Developer', 'Sales Lead', 'HR Manager', 'Finance Officer']} moduleName="Task Kanban & Sprints">
              <TasksPage />
            </AdminRouteGuard>
          </IpRestrictionGuard>
        } />

        {/* Enterprise Operations: Overall Emails & Communications */}
        <Route path="/admin/emails" element={
          <IpRestrictionGuard>
            <AdminRouteGuard allowedRoles={['Super Admin', 'Project Manager', 'HR Manager', 'Sales Lead', 'Finance Officer', 'Team Member', 'Developer']} moduleName="Overall Emails & Communications">
              <EmailsPage />
            </AdminRouteGuard>
          </IpRestrictionGuard>
        } />

        {/* 9. Support & Helpdesk: All Roles */}
        <Route path="/admin/support" element={
          <IpRestrictionGuard>
            <AdminRouteGuard allowedRoles={['Super Admin', 'Project Manager', 'Team Member', 'Developer']} moduleName="Support & Helpdesk">
              <HelpdeskPage />
            </AdminRouteGuard>
          </IpRestrictionGuard>
        } />

        {/* 10. Document Vault: All Roles */}
        <Route path="/admin/documents" element={
          <IpRestrictionGuard>
            <AdminRouteGuard allowedRoles={['Super Admin', 'Project Manager', 'Team Member', 'Developer']} moduleName="Document Vault">
              <DocumentsPage />
            </AdminRouteGuard>
          </IpRestrictionGuard>
        } />

        {/* 11. Calendar, Community & Team Chat: All Roles */}
        <Route path="/admin/calendar" element={
          <IpRestrictionGuard>
            <AdminRouteGuard allowedRoles={['Super Admin', 'Project Manager', 'Team Member', 'Developer', 'HR Manager', 'Sales Lead', 'Finance Officer']} moduleName="Calendar & Community">
              <CalendarPage />
            </AdminRouteGuard>
          </IpRestrictionGuard>
        } />

        {/* 12. CMS & Website Publishing: DIRECTOR ONLY */}
        <Route path="/admin/cms" element={
          <IpRestrictionGuard>
            <AdminRouteGuard allowedRoles={['Super Admin']} moduleName="CMS & Website Publishing">
              <CmsPage />
            </AdminRouteGuard>
          </IpRestrictionGuard>
        } />

        {/* 13. Analytics & Reports: Director & Managers */}
        <Route path="/admin/analytics" element={
          <IpRestrictionGuard>
            <AdminRouteGuard allowedRoles={['Super Admin', 'Project Manager']} moduleName="Analytics & Reports">
              <AnalyticsPage />
            </AdminRouteGuard>
          </IpRestrictionGuard>
        } />

        {/* 14. Admin & RBAC Security: DIRECTOR ONLY */}
        <Route path="/admin/security" element={
          <IpRestrictionGuard>
            <AdminRouteGuard allowedRoles={['Super Admin']} moduleName="Admin & RBAC Security">
              <SecurityPage />
            </AdminRouteGuard>
          </IpRestrictionGuard>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <LanguageProvider>
          <MainAppRoutes />
        </LanguageProvider>
      </AdminProvider>
    </BrowserRouter>
  );
}
