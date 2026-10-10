import { BrowserRouter, Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import './index.css';
import './admin/admin.css';

// Public Components & Pages
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ServicePage from './pages/ServicePage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import VerificationPage from './pages/VerificationPage';
import FloatingWidgets from './components/FloatingWidgets';
import LoginPage from './pages/LoginPage';

// Admin Context, Layout & IP Guard
import { AdminProvider, useAdmin } from './admin/context/AdminContext';
import { AdminLayout } from './admin/components/AdminLayout';
import { IpRestrictionGuard } from './admin/components/IpRestrictionGuard';

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

function AdminRouteGuard({ children, allowedRoles, moduleName = 'This Module' }: AdminRouteGuardProps) {
  const { currentUser } = useAdmin();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If user is Employee (Team Member / Developer) attempting to access Executive Dashboard (/admin),
  // redirect them directly to their primary workspace (/admin/tasks)
  if ((currentUser.role === 'Team Member' || currentUser.role === 'Developer') && location.pathname === '/admin') {
    return <Navigate to="/admin/tasks" replace />;
  }

  // If role is not authorized for this specific module
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    const isEmployeeRole = currentUser.role === 'Team Member' || currentUser.role === 'Developer';
    return (
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
              to={isEmployeeRole ? '/admin/tasks' : '/admin'}
              className="adm-btn adm-btn-primary"
              style={{ textDecoration: 'none', padding: '0.65rem 1.4rem' }}
            >
              Return to Authorized Workspace
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}

// Public Website Layout Component (renders Public Header/Footer only for public routes)
function PublicWebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div style={{ paddingTop: '72px' }}>
        {children}
      </div>
      <Footer />
      <FloatingWidgets />
    </>
  );
}

function MainAppRoutes() {
  const { pathname } = useLocation();
  const isAuthOrOnboardingRoute = pathname.startsWith('/admin') || pathname === '/register' || pathname === '/login';

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      <ScrollToTopOnRoute />

      {/* Scroll Progress Bar for Public Site */}
      {!isAuthOrOnboardingRoute && (
        <motion.div
          style={{
            scaleX,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(to right, #F66135, #ff9575)',
            transformOrigin: '0%',
            zIndex: 10000,
          }}
        />
      )}

      {/* Accessibility Skip Link on Public Site */}
      {!isAuthOrOnboardingRoute && (
        <a
          href="#main-content"
          style={{
            position: 'absolute', top: '-40px', left: '1rem',
            background: 'var(--primary)', color: '#fff',
            padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 600,
            transition: 'top 0.2s', zIndex: 9999,
          }}
          onFocus={e => (e.currentTarget.style.top = '1rem')}
          onBlur={e => (e.currentTarget.style.top = '-40px')}
        >
          Skip to main content
        </a>
      )}

      <Routes>
        {/* ── PUBLIC ROUTES (Clean front-page, NO admin buttons or links) ── */}
        <Route path="/" element={<PublicWebsiteLayout><HomePage /></PublicWebsiteLayout>} />
        <Route path="/services" element={<PublicWebsiteLayout><ServicesPage /></PublicWebsiteLayout>} />
        <Route path="/services/:serviceId" element={<PublicWebsiteLayout><ServicePage /></PublicWebsiteLayout>} />
        <Route path="/contact" element={<PublicWebsiteLayout><ContactPage /></PublicWebsiteLayout>} />
        <Route path="/about" element={<PublicWebsiteLayout><AboutPage /></PublicWebsiteLayout>} />
        <Route path="/verification" element={<PublicWebsiteLayout><VerificationPage /></PublicWebsiteLayout>} />
        <Route path="/verification/internship" element={<PublicWebsiteLayout><VerificationPage /></PublicWebsiteLayout>} />
        <Route path="/verification/soc" element={<PublicWebsiteLayout><VerificationPage /></PublicWebsiteLayout>} />
        <Route path="/verification/employee" element={<PublicWebsiteLayout><VerificationPage /></PublicWebsiteLayout>} />

        {/* ── STAFF AUTH PORTAL (Approach A: Internal Onboarding Only) ── */}
        <Route path="/register" element={<Navigate to="/login?notice=internal_only" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ── ADMIN LOGIN (Protected by IP Restriction Guard) ── */}
        <Route path="/admin/login" element={<IpRestrictionGuard><AdminLoginPage /></IpRestrictionGuard>} />

        {/* ── 14 ENTERPRISE ADMIN SUITE MODULES (Protected strictly according to EWMS table) ── */}
        {/* 1. Dashboard: Director & Managers/HR */}
        <Route path="/admin" element={
          <IpRestrictionGuard>
            <AdminRouteGuard allowedRoles={['Super Admin', 'Project Manager', 'HR Manager', 'Sales Lead', 'Finance Officer']} moduleName="Executive Dashboard">
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

        {/* 11. Calendar & Meetings: All Roles */}
        <Route path="/admin/calendar" element={
          <IpRestrictionGuard>
            <AdminRouteGuard allowedRoles={['Super Admin', 'Project Manager', 'Team Member', 'Developer']} moduleName="Calendar & Meetings">
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
        <MainAppRoutes />
      </AdminProvider>
    </BrowserRouter>
  );
}
