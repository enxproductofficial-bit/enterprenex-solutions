import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const STEPS = [
  {
    num: '01',
    step: 'Step 1',
    icon: '📞',
    title: 'Join exploration call.',
    body: "Tell us more about your business on a discovery call. We'll discuss team structure and approach, success criteria, timescale, budget, and required skill sets to see how we can help.",
  },
  {
    num: '02',
    step: 'Step 2',
    icon: '🧩',
    title: 'Discuss solution and team structure.',
    body: "In a matter of days, we'll present the ideal team structure for your project — including CVs of our top candidates who precisely match your requirements and culture.",
  },
  {
    num: '03',
    step: 'Step 3',
    icon: '📈',
    title: 'Onboard your team and track performance.',
    body: 'Your dedicated team starts contributing from day one. We track performance with transparent metrics and regular reporting to ensure your goals are always met.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.1,
    },
  },
};

const stepVariants: any = {
  hidden: { opacity: 0, x: 40, y: 15 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function ProcessSection() {
  return (
    <section className="process-section" id="process" aria-labelledby="process-h2">
      <div className="wrap">
        <div className="process-inner">
          {/* Left: heading + image */}
          <motion.div 
            className="process-left"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <p className="t-overline section-eyebrow">How It Works</p>
            <h2 id="process-h2">
              Our process<span className="dot">.</span> Simple,<br />
              seamless, streamlined<span className="dot">.</span>
            </h2>
            <motion.img
              src="/images/process.jpg"
              alt="Our three-step process: discovery call, team assembly, and performance tracking"
              className="process-img"
              loading="lazy"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4 }}
            />
          </motion.div>

          {/* Right: steps timeline */}
          <motion.div 
            className="process-right"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={containerVariants}
          >
            {/* Background base timeline track */}
            <div 
              className="process-timeline" 
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '1.5rem',
                bottom: '1.5rem',
                width: '3px',
                background: '#e8e8e8',
                borderRadius: '9999px',
                overflow: 'hidden',
              }}
            >
              {/* Animated fill connection line */}
              <motion.div
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(to bottom, #F66135 0%, #D94E22 100%)',
                  transformOrigin: 'top',
                  boxShadow: '0 0 10px rgba(246, 97, 53, 0.6)',
                }}
              />
            </div>

            {STEPS.map((s, i) => (
              <motion.div 
                key={s.title} 
                className="pstep"
                variants={stepVariants}
                whileHover={{ x: 8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  marginBottom: i === STEPS.length - 1 ? 0 : '3.5rem',
                  position: 'relative',
                  background: '#ffffff',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '1px solid #f0f0f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                }}
              >
                <motion.div 
                  className="pstep__icon" 
                  aria-hidden="true"
                  whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    flexShrink: 0,
                    width: '3.5rem',
                    height: '3.5rem',
                    borderRadius: '50%',
                    border: '2px solid #F66135',
                    background: '#FFF3EF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.35rem',
                    boxShadow: '0 4px 14px rgba(246, 97, 53, 0.25)',
                  }}
                >
                  {s.icon}
                </motion.div>
                
                <div className="pstep__body" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                    <span 
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        background: 'linear-gradient(135deg, #F66135 0%, #D94E22 100%)',
                        color: '#ffffff',
                        boxShadow: '0 2px 8px rgba(246, 97, 53, 0.35)',
                      }}
                    >
                      {s.step}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b8b8b8' }}>
                      {s.num}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1875rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.5rem' }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: '0.9375rem', color: '#666666', lineHeight: 1.65 }}>
                    {s.body}
                  </p>
                  
                  {i === STEPS.length - 1 && (
                    <Link 
                      to="/contact" 
                      className="btn btn-orange" 
                      style={{ marginTop: '1.5rem', display: 'inline-flex', fontSize: '.9rem' }}
                    >
                      Start Today
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}


