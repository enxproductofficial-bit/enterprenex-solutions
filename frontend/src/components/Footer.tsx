import { Link } from 'react-router-dom';

const SOCIAL = [
  {
    label: 'LinkedIn',
    href: '#',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  {
    label: 'Twitter/X',
    href: '#',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.26 5.632 5.905-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    label: 'Instagram',
    href: '#',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  },
];

/* Only real, available service pages */
const SERVICE_LINKS = [
  { label: 'AI Development', to: '/services/ai-development' },
  { label: 'Web Development', to: '/services/web-development' },
  { label: 'Mobile App Development', to: '/services/mobile-app-development' },
  { label: 'Backend Development', to: '/services/backend-development' },
  { label: 'SaaS Development', to: '/services/saas-development' },
  { label: 'Machine Learning', to: '/services/machine-learning' },
  { label: 'DevOps', to: '/services/devops' },
  { label: 'Cybersecurity', to: '/services/cybersecurity' },
  { label: 'View All Services →', to: '/services' },
];

/* Only real, available pages */
const COMPANY_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'All Services', to: '/services' },
  { label: 'Contact Us', to: '/contact' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo" id="footer">
      <div className="wrap">
        <div className="footer-inner">

          {/* ── Brand Column ── */}
          <div className="footer-brand">
            <Link to="/" aria-label="Enterprenex Solutions home">
              <img
                src="/images/logo.svg"
                alt="Enterprenex Solutions"
                style={{ height: '52px', width: '52px' }}
              />
            </Link>

            <p style={{ marginTop: '0.875rem', lineHeight: 1.7 }}>
              Empowering businesses with innovative digital solutions and strategic consulting
              that drive measurable growth.
            </p>

            {/* Contact info */}
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <a
                href="mailto:enterprenexsolutionpvtltd@gmail.com"
                style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '0.45rem', textDecoration: 'none' }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                enterprenexsolutionpvtltd@gmail.com
              </a>

              <a
                href="tel:+919226860060"
                style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '0.45rem', textDecoration: 'none' }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +91-9226860060
              </a>

              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.81rem', display: 'flex', alignItems: 'flex-start', gap: '0.45rem', lineHeight: 1.5 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ marginTop: '2px', flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Plot No. 148, Shrinand Plaza,<br />
                CIDCO Waluj Mahanagar 1,<br />
                Chhatrapati Sambhajinagar, MH 431136
              </span>
            </div>

            {/* Socials */}
            <div className="footer-socials" style={{ marginTop: '1.25rem' }}>
              {SOCIAL.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label} className="social-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* ── Services Column ── */}
          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              {SERVICE_LINKS.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Company Column ── */}
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              {COMPANY_LINKS.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Get In Touch Column ── */}
          <div className="footer-col">
            <h4>Get In Touch</h4>
            <ul>
              <li>
                <a href="/contact">Schedule a Free Call</a>
              </li>
              <li>
                <a href="mailto:enterprenexsolutionpvtltd@gmail.com">Send Us an Email</a>
              </li>
              <li>
                <a href="https://wa.me/919226860060" target="_blank" rel="noopener noreferrer">
                  Chat on WhatsApp
                </a>
              </li>
              <li>
                <a href="tel:+919226860060">Call: +91-9226860060</a>
              </li>
            </ul>
          </div>

        </div>

        {/* ── Bottom Bar ── */}
        <div className="footer-bottom">
          <p>© {year} Enterprenex Solutions Pvt Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
