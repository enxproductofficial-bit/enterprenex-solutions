import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
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

// Protected Route Guard for Admin
function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAdmin();
  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
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

        {/* ── STAFF AUTH PORTAL (Approach A: Internal Onboarding Only) ── */}
        <Route path="/register" element={<Navigate to="/login?notice=internal_only" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ── ADMIN LOGIN (Protected by IP Restriction Guard) ── */}
        <Route path="/admin/login" element={<IpRestrictionGuard><AdminLoginPage /></IpRestrictionGuard>} />

        {/* ── 14 ENTERPRISE ADMIN SUITE MODULES (Protected by IP Guard & Auth Guard) ── */}
        <Route path="/admin" element={<IpRestrictionGuard><AdminRouteGuard><DashboardPage /></AdminRouteGuard></IpRestrictionGuard>} />
        <Route path="/admin/clients" element={<IpRestrictionGuard><AdminRouteGuard><ClientsPage /></AdminRouteGuard></IpRestrictionGuard>} />
        <Route path="/admin/projects" element={<IpRestrictionGuard><AdminRouteGuard><ProjectsPage /></AdminRouteGuard></IpRestrictionGuard>} />
        <Route path="/admin/services" element={<IpRestrictionGuard><AdminRouteGuard><ServicesManagePage /></AdminRouteGuard></IpRestrictionGuard>} />
        <Route path="/admin/crm" element={<IpRestrictionGuard><AdminRouteGuard><CrmLeadsPage /></AdminRouteGuard></IpRestrictionGuard>} />
        <Route path="/admin/finance" element={<IpRestrictionGuard><AdminRouteGuard><FinancePage /></AdminRouteGuard></IpRestrictionGuard>} />
        <Route path="/admin/team" element={<IpRestrictionGuard><AdminRouteGuard><TeamPage /></AdminRouteGuard></IpRestrictionGuard>} />
        <Route path="/admin/tasks" element={<IpRestrictionGuard><AdminRouteGuard><TasksPage /></AdminRouteGuard></IpRestrictionGuard>} />
        <Route path="/admin/support" element={<IpRestrictionGuard><AdminRouteGuard><HelpdeskPage /></AdminRouteGuard></IpRestrictionGuard>} />
        <Route path="/admin/documents" element={<IpRestrictionGuard><AdminRouteGuard><DocumentsPage /></AdminRouteGuard></IpRestrictionGuard>} />
        <Route path="/admin/calendar" element={<IpRestrictionGuard><AdminRouteGuard><CalendarPage /></AdminRouteGuard></IpRestrictionGuard>} />
        <Route path="/admin/cms" element={<IpRestrictionGuard><AdminRouteGuard><CmsPage /></AdminRouteGuard></IpRestrictionGuard>} />
        <Route path="/admin/analytics" element={<IpRestrictionGuard><AdminRouteGuard><AnalyticsPage /></AdminRouteGuard></IpRestrictionGuard>} />
        <Route path="/admin/security" element={<IpRestrictionGuard><AdminRouteGuard><SecurityPage /></AdminRouteGuard></IpRestrictionGuard>} />

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
