import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const SERVICES = [
  {
    icon: '👥',
    title: 'Staff Augmentation',
    desc: 'Scale your existing team with vetted senior engineers who integrate seamlessly into your workflows, culture, and tech stack.',
    badge: 'Popular',
  },
  {
    icon: '🚀',
    title: 'Dedicated Teams',
    desc: 'Get a fully managed, cross-functional engineering team built around your product goals and delivery roadmap.',
    badge: 'High Impact',
  },
  {
    icon: '💻',
    title: 'Software Outsourcing',
    desc: 'Delegate your entire software development lifecycle — from spec to launch — to our expert engineers and PMs.',
  },
  {
    icon: '🤖',
    title: 'AI Transformation',
    desc: 'Embed AI and ML across your operations to increase productivity, cut costs, and gain a measurable competitive edge.',
    badge: 'Trending',
  },
  {
    icon: '📱',
    title: 'Mobile App Development',
    desc: 'Native iOS and Android apps built by specialists who understand platform best practices, UX standards, and performance.',
  },
  {
    icon: '🛡️',
    title: 'QA & Test Automation',
    desc: 'Comprehensive quality engineering — from manual testing to end-to-end automation frameworks that protect your releases.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 35, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] as const },
  },
};

const arrowVariants = {
  initial: { x: 0 },
  hover: { x: 6, color: '#F66135' },
};

const iconVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: { scale: 1.18, rotate: [0, -8, 8, -4, 0], transition: { duration: 0.4 } },
};

export default function ServicesSection() {
  return (
    <section className="services section" id="services" aria-labelledby="services-h2">
      <div className="wrap">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="t-overline section-eyebrow">What We Offer</p>
          <h2 id="services-h2" className="section-h2">
            Get full-dev coverage<span className="dot">.</span><br />
            <span style={{ color: '#8f8f8f', fontWeight: 400, fontSize: 'clamp(1.25rem,2vw,1.875rem)' }}>
              Unlock excellence across the SDLC
            </span>
          </h2>
        </motion.div>

        <motion.div 
          className="services-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            perspective: '1000px',
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
        >
          {SERVICES.map(svc => (
            <motion.article 
              key={svc.title} 
              className="svc-card"
              variants={cardVariants}
              style={{
                position: 'relative',
                background: '#ffffff',
                border: '1px solid #e8e8e8',
                borderRadius: '16px',
                padding: '2rem 1.75rem',
                cursor: 'pointer',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              }}
              animate={{
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              }}
              whileHover={{ 
                y: -10,
                scale: 1.02,
                rotateX: 2,
                rotateY: -2,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12), 0 0 25px rgba(246, 97, 53, 0.3)',
                borderColor: 'rgba(246, 97, 53, 0.6)',
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            >
              {svc.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: '1.25rem',
                    right: '1.25rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                    background: '#FFF3EF',
                    color: '#F66135',
                    border: '1px solid rgba(246, 97, 53, 0.2)',
                  }}
                >
                  {svc.badge}
                </span>
              )}

              <motion.div 
                className="svc-icon" 
                aria-hidden="true"
                variants={iconVariants}
              >
                {svc.icon}
              </motion.div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#333', marginBottom: '0.625rem' }}>
                {svc.title}
              </h3>
              <p style={{ fontSize: '0.9375rem', color: '#8f8f8f', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                {svc.desc}
              </p>
              
              <Link 
                to="/contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#F66135',
                }}
              >
                <span>Learn more</span>
                <motion.svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  variants={arrowVariants}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                </motion.svg>
              </Link>
            </motion.article>
          ))}
        </motion.div>

        <motion.div 
          style={{ textAlign: 'center', marginTop: '3rem' }}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link 
            to="/services" 
            className="btn-link" 
            style={{ fontSize: '1rem', color: '#333' }}
          >
            View all services
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}


