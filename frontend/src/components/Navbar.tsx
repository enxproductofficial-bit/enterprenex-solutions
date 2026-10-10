import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';


const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  {
    label: 'Services',
    href: '/services',
    cols: [
      {
        heading: 'Core Services',
        links: [
          { label: 'AI Development', to: '/services/ai-development' },
          { label: 'Web Development', to: '/services/web-development' },
          { label: 'Mobile App Development', to: '/services/mobile-app-development' },
          { label: 'Backend Development', to: '/services/backend-development' },
        ],
      },
      {
        heading: 'Specialized Engineering',
        links: [
          { label: 'SaaS Development', to: '/services/saas-development' },
          { label: 'Machine Learning', to: '/services/machine-learning' },
          { label: 'DevOps & Cloud', to: '/services/devops' },
          { label: 'Cybersecurity', to: '/services/cybersecurity' },
        ],
      },
      {
        heading: 'All Solutions',
        links: [
          { label: 'View All Services →', to: '/services' },
          { label: 'Request Custom Service →', to: '/contact' },
        ],
      },
    ],
  },
  {
    label: 'Verification',
    href: '/verification',
    hasIndicator: true,
    items: [
      { label: 'Internship Verification', to: '/verification/internship' },
      { label: 'Employee Verification', to: '/verification/employee' },
    ],
  },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function Header() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const location = useLocation();

  const handleNavClick = () => {
    setActiveItem(null);
    setMobileOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 20);
  });

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        paddingTop: isScrolled ? '0.75rem' : '0px',
      }}
    >
      <div
        style={{
          width: isScrolled ? 'calc(100% - 2rem)' : '100%',
          maxWidth: '1280px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          maxHeight: isScrolled ? '62px' : '72px',
          height: isScrolled ? '62px' : '72px',
          margin: '0 auto',
          borderRadius: isScrolled ? '16px' : '0px',
          borderBottom: isScrolled ? '1px solid rgba(232, 232, 232, 0.8)' : '1px solid #e8e8e8',
          border: isScrolled ? '1px solid rgba(232, 232, 232, 0.9)' : 'none',
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.88)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: isScrolled ? '0 1.25rem' : '0 2rem',
          boxShadow: isScrolled ? '0 8px 32px -4px rgba(246, 97, 53, 0.14), 0 2px 8px -2px rgba(0, 0, 0, 0.04)' : 'none',
        }}
      >
        {/* Logo */}
        <Link to="/" aria-label="Enterprenex Solutions home" onClick={handleNavClick} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minHeight: '44px' }}>
          <img src="/images/logo.svg" alt="Enterprenex Solutions" style={{ height: isScrolled ? '32px' : '36px', width: 'auto', transition: 'all 0.3s ease' }} />
          <span
            style={{
              fontWeight: 700,
              fontSize: isScrolled ? '1rem' : '1.125rem',
              color: '#0a0a0a',
              letterSpacing: '-0.02em',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Enterpre<span style={{ color: '#F66135' }}>nex</span>
            <span className="logo-text-solutions" style={{ color: '#8f8f8f', fontWeight: 400, marginLeft: '0.25rem' }}>Solutions</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main navigation" className="navbar__nav" style={{ alignItems: 'center', gap: '0.25rem', height: '100%' }}>
          {NAV_ITEMS.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href));

            return (
              <div
                key={item.label}
                className="nav-item"
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                  padding: '0 0.875rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: isActive ? '#F66135' : '#333',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={() => setActiveItem(item.label)}
                onMouseLeave={() => setActiveItem(null)}
              >
                {item.href.startsWith('/') ? (
                  <Link to={item.href} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', minHeight: '44px' }} onClick={handleNavClick}>
                    {item.label}
                    {(item as any).hasIndicator && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block', flexShrink: 0, boxShadow: '0 0 8px rgba(34,197,94,0.6)' }} />
                    )}
                    {((item as any).cols || (item as any).items) && (
                      <svg className="nav-chevron" viewBox="0 0 24 24" fill="currentColor" style={{ width: '1rem', height: '1rem' }}>
                        <path d="M7 10l5 5 5-5z" />
                      </svg>
                    )}
                  </Link>
                ) : (
                  <a href={item.href} onClick={handleNavClick} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', minHeight: '44px' }}>
                    {item.label}
                    {(item as any).hasIndicator && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block', flexShrink: 0, boxShadow: '0 0 8px rgba(34,197,94,0.6)' }} />
                    )}
                    {((item as any).cols || (item as any).items) && (
                      <svg className="nav-chevron" viewBox="0 0 24 24" fill="currentColor" style={{ width: '1rem', height: '1rem' }}>
                        <path d="M7 10l5 5 5-5z" />
                      </svg>
                    )}
                  </a>
                )}

                {/* Mega dropdown */}
                {activeItem === item.label && item.cols && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      background: '#fff',
                      borderRadius: '0 0 16px 16px',
                      boxShadow: '0 12px 48px rgba(0,0,0,.12)',
                      padding: '2rem',
                      zIndex: 100,
                      display: 'flex',
                      gap: '3rem',
                      minWidth: '36rem',
                      border: '1px solid #e8e8e8',
                      borderTop: 'none',
                    }}
                    onMouseEnter={() => setActiveItem(item.label)}
                    onMouseLeave={() => setActiveItem(null)}
                  >
                    {item.cols.map((col, ci) => (
                      <div key={ci} style={{ minWidth: '10rem' }}>
                        {col.heading && (
                          <p
                            style={{
                              fontSize: '.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '.08em',
                              color: '#8f8f8f',
                              marginBottom: '.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '.4rem',
                            }}
                          >
                            <span style={{ width: '.5rem', height: '.5rem', borderRadius: '2px', background: '#F66135', display: 'inline-block', flexShrink: 0 }} />
                            {col.heading}
                          </p>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                          {col.links.map((linkObj) => (
                            <Link
                              key={linkObj.label}
                              to={linkObj.to}
                              onClick={handleNavClick}
                              style={{ fontSize: '.875rem', fontWeight: 500, color: '#666', transition: 'color .15s', padding: '.375rem 0', minHeight: '44px', display: 'flex', alignItems: 'center' }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#F66135')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
                            >
                              {linkObj.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Standard dropdown (e.g. Verification) */}
                {activeItem === item.label && (item as any).items && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#ffffff',
                      borderRadius: '14px',
                      boxShadow: '0 16px 40px -8px rgba(0,0,0,0.16), 0 2px 10px rgba(0,0,0,0.06)',
                      padding: '0.5rem',
                      zIndex: 100,
                      minWidth: '220px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                    }}
                    onMouseEnter={() => setActiveItem(item.label)}
                    onMouseLeave={() => setActiveItem(null)}
                  >
                    {(item as any).items.map((sub: any) => (
                      <Link
                        key={sub.label}
                        to={sub.to}
                        onClick={handleNavClick}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.7rem 1rem',
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          color: '#1e293b',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fff7f4';
                          e.currentTarget.style.color = '#F66135';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#1e293b';
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F66135', opacity: 0.8 }} />
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/login"
            onClick={handleNavClick}
            style={{
              padding: isScrolled ? '.45rem 1.15rem' : '.55rem 1.25rem',
              fontSize: '.875rem',
              borderRadius: '9999px',
              fontWeight: 600,
              color: '#1e293b',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              transition: 'all 0.2s ease',
              minHeight: '40px',
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e2e8f0';
              e.currentTarget.style.borderColor = '#94a3b8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
          >
            Staff Login
          </Link>
          <Link
            to="/contact"
            className="btn btn-orange desktop-schedule-btn"
            onClick={handleNavClick}
            style={{
              padding: isScrolled ? '.45rem 1rem' : '.55rem 1.2rem',
              fontSize: '.875rem',
              borderRadius: '9999px',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(246,97,53,0.3)',
              transition: 'all 0.3s ease',
              minHeight: '40px',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Schedule a Call
          </Link>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setMobileOpen(false);
          }
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <Link to="/" onClick={handleNavClick} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minHeight: '44px' }}>
            <img src="/images/logo.svg" alt="Enterprenex Solutions" style={{ height: '32px', width: 'auto' }} />
            <span style={{ fontWeight: 700, fontSize: '1.125rem', color: '#0a0a0a' }}>
              Enterpre<span style={{ color: '#F66135' }}>nex</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            style={{
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              color: '#333',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.05)',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="mobile-drawer-group">
              <Link
                to={item.href}
                onClick={handleNavClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  color: '#0a0a0a',
                  padding: '0.75rem 0.5rem',
                  minHeight: '44px',
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                {item.label}
              </Link>
              {item.cols && (
                <div style={{ paddingLeft: '0.5rem', marginTop: '0.25rem' }}>
                  {item.cols
                    .flatMap((col) => col.links)
                    .map((linkObj) => (
                      <Link
                        key={linkObj.label}
                        to={linkObj.to}
                        onClick={handleNavClick}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '0.925rem',
                          color: '#4d4d4d',
                          padding: '0.5rem 0.75rem',
                          minHeight: '44px',
                          borderRadius: '6px',
                        }}
                      >
                        {linkObj.label}
                      </Link>
                    ))}
                </div>
              )}
              {(item as any).items && (
                <div style={{ paddingLeft: '0.5rem', marginTop: '0.25rem' }}>
                  {(item as any).items.map((linkObj: any) => (
                    <Link
                      key={linkObj.label}
                      to={linkObj.to}
                      onClick={handleNavClick}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.925rem',
                        color: '#4d4d4d',
                        padding: '0.5rem 0.75rem',
                        minHeight: '44px',
                        borderRadius: '6px',
                      }}
                    >
                      {linkObj.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', paddingBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link
            to="/login"
            onClick={handleNavClick}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '9999px',
              padding: '0.75rem',
              minHeight: '44px',
              border: '1.5px solid #cbd5e1',
              background: '#f8fafc',
              color: '#1e293b',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            Staff Login
          </Link>

          <Link
            to="/contact"
            className="btn btn-orange"
            onClick={handleNavClick}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              borderRadius: '9999px',
              padding: '0.875rem 1.5rem',
              minHeight: '44px',
            }}
          >
            Schedule a Call
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;

