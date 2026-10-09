import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Variants } from 'framer-motion';

const ROLES = [
  { text: 'Cloud Engineers', gradient: 'linear-gradient(135deg, #FF7B54 0%, #F66135 100%)', glow: 'rgba(246, 97, 53, 0.5)' },
  { text: 'AI & ML Developers', gradient: 'linear-gradient(135deg, #38BDF8 0%, #3B82F6 100%)', glow: 'rgba(59, 130, 246, 0.5)' },
  { text: 'Software Architects', gradient: 'linear-gradient(135deg, #34D399 0%, #059669 100%)', glow: 'rgba(16, 185, 129, 0.5)' },
  { text: 'Full-Stack Engineers', gradient: 'linear-gradient(135deg, #F472B6 0%, #E11D48 100%)', glow: 'rgba(225, 29, 72, 0.5)' },
  { text: 'SaaS Platform Builders', gradient: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)', glow: 'rgba(245, 158, 11, 0.5)' },
  { text: 'DevOps Specialists', gradient: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)', glow: 'rgba(124, 58, 237, 0.5)' },
  { text: 'Mobile App Experts', gradient: 'linear-gradient(135deg, #22D3EE 0%, #0284C7 100%)', glow: 'rgba(2, 132, 199, 0.5)' },
  { text: 'Cybersecurity Leaders', gradient: 'linear-gradient(135deg, #F87171 0%, #DC2626 100%)', glow: 'rgba(220, 38, 38, 0.5)' },
  { text: 'Data Engineers', gradient: 'linear-gradient(135deg, #818CF8 0%, #4F46E5 100%)', glow: 'rgba(79, 70, 229, 0.5)' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// Floating tech pills and stat badges with physics floating motion
const FLOATING_BADGES = [
  {
    id: 1,
    icon: '⚡',
    title: 'AI-Augmented Engineering',
    sub: '2x Velocity Boost',
    className: 'hero-badge hero-badge--top-right',
    floatPattern: [0, -12, 0],
    duration: 4.2,
    delay: 0,
  },
  {
    id: 2,
    icon: '☁️',
    title: 'Top 1% Cloud Talent',
    sub: 'AWS • GCP • Azure',
    className: 'hero-badge hero-badge--mid-right',
    floatPattern: [0, -14, 0],
    duration: 4.8,
    delay: 0.5,
  },
  {
    id: 3,
    icon: '🛡️',
    title: 'Enterprise Grade',
    sub: '100% Timezone Aligned',
    className: 'hero-badge hero-badge--bottom-right',
    floatPattern: [0, -10, 0],
    duration: 3.9,
    delay: 1.0,
  },
];

export default function HeroSection() {
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROLES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* ── Hero Section ── */}
      <section className="hero" id="hero" aria-labelledby="hero-h1">
        {/* Background image — engineers collaborating */}
        <motion.img
          initial={{ scale: 1.08, opacity: 0.75 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          src="/images/hero.jpg"
          alt="Software engineers working at modern office desks"
          className="hero__bg"
          loading="eager"
        />
        
        {/* Gradient overlay so text stays readable */}
        <div className="hero__gradient" aria-hidden="true" />

        {/* Floating tech pills & stat badges with physics animations */}
        <div className="hero__floating-wrapper" aria-hidden="true">
          {FLOATING_BADGES.map((badge) => (
            <motion.div
              key={badge.id}
              className={badge.className}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: badge.floatPattern,
              }}
              transition={{
                opacity: { duration: 0.6, delay: badge.delay },
                scale: { duration: 0.6, delay: badge.delay },
                y: {
                  repeat: Infinity,
                  duration: badge.duration,
                  ease: 'easeInOut',
                  delay: badge.delay,
                },
              }}
              whileHover={{ scale: 1.08, y: -5 }}
            >
              <div className="hero-badge__icon">{badge.icon}</div>
              <div className="hero-badge__content">
                <span className="hero-badge__title">{badge.title}</span>
                <span className="hero-badge__sub">{badge.sub}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="wrap">
          <motion.div
            className="hero__content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Tag reveal */}
            <motion.div className="hero__tag" variants={itemVariants}>
              Vetted Nearshore Talent
            </motion.div>

            {/* Staggered Heading Reveal */}
            <motion.h1 id="hero-h1" className="hero__h1" variants={itemVariants}>
              Accelerate Your Roadmap<br />
              With Our Vetted Nearshore<br />
              <span style={{ display: 'inline-block', position: 'relative', overflow: 'hidden', verticalAlign: 'bottom', minHeight: '1.25em', paddingRight: '0.1em' }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={ROLES[roleIndex].text}
                    initial={{ y: 35, opacity: 0, filter: 'blur(4px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: -35, opacity: 0, filter: 'blur(4px)' }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      display: 'inline-block',
                      background: ROLES[roleIndex].gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: `drop-shadow(0 4px 16px ${ROLES[roleIndex].glow})`,
                      fontWeight: 800,
                    }}
                  >
                    {ROLES[roleIndex].text}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.h1>

            {/* Subtitle reveal */}
            <motion.p className="hero__sub" variants={itemVariants}>
              Access 4,000+ timezone-aligned, AI-augmented software engineers across 100+ technologies.
            </motion.p>

            {/* CTA Group with Staggered Reveal and Responsive Layout */}
            <motion.div className="hero__cta-group" variants={itemVariants}>
              <Link 
                to="/contact" 
                className="btn btn-orange btn-hero-primary" 
                id="hero-cta"
              >
                <span>Schedule a Call</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>

              <a 
                href="#technologies" 
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById('technologies');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="btn btn-dark btn-hero-secondary" 
              >
                <span>Explore Stack</span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Enterprise Standards ── */}
      <section className="enterprise-standards" id="standards" aria-label="Enterprise Standards">
        <div className="wrap">
          <motion.div 
            className="standards-header section-header section-header--center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-h2" style={{ color: 'var(--white)' }}>Built with Enterprise Standards</h2>
            <p className="section-sub" style={{ color: 'var(--gray-400)' }}>
              From planning to deployment, every project follows industry best practices for security, scalability, maintainability, and performance.
            </p>
          </motion.div>

          <motion.div 
            className="standards-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {[
              { icon: '🏗️', title: 'Clean Architecture', desc: 'Modular, maintainable, and testable codebases built to scale.' },
              { icon: '📈', title: 'Scalable Systems', desc: 'Engineered to handle high traffic and rapid business growth.' },
              { icon: '🔒', title: 'Secure Development', desc: 'Security integrated at every stage of the development lifecycle.' },
              { icon: '☁️', title: 'Cloud Ready', desc: 'Cloud-native solutions optimized for AWS, GCP, and Azure.' },
              { icon: '🔌', title: 'API First', desc: 'Seamless integration with existing ecosystems and third-party systems.' },
              { icon: '⚡', title: 'Continuous Delivery', desc: 'Automated testing and rapid, reliable deployment pipelines.' }
            ].map(feature => (
              <motion.div 
                key={feature.title} 
                className="standard-card"
                variants={{
                  hidden: { opacity: 0, scale: 0.95, y: 20 },
                  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
                }}
                whileHover={{ y: -6, borderColor: 'rgba(246, 97, 53, 0.4)' }}
              >
                <div className="standard-card__icon">{feature.icon}</div>
                <h3 className="standard-card__title">{feature.title}</h3>
                <p className="standard-card__desc">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
