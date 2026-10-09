import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';

/* ── Animation Variants ── */
const fadeUp: any = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: 'easeOut' },
  }),
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

/* ── Values Data ── */
const VALUES = [
  { title: 'Engineering Excellence', description: 'We build robust, scalable, enterprise-grade software using clean architecture standards.', icon: '🚀' },
  { title: 'Radical Transparency', description: 'Open communication, honest roadmaps, and clear milestone tracking form our core ethos.', icon: '🔍' },
  { title: 'Zero-Trust Security', description: 'Security and data protection are integrated into every phase of our development lifecycle.', icon: '🛡️' },
  { title: 'Client-Centric ROI', description: 'Your business outcomes dictate our technology choices. We deliver measurable growth.', icon: '🤝' },
  { title: 'Agile Velocity', description: 'Continuous deployment cycles that allow rapid adaptation without code degradation.', icon: '⚡' },
  { title: 'Developer Empowerment', description: 'Equipping senior talent with modern tooling to produce world-class products.', icon: '🌟' },
];

/* ── Journey Stages ── */
const JOURNEY = [
  { title: 'Idea & Research', year: 'Phase 1', description: 'Identified critical market gaps in enterprise digital transformation and conceptualized an agile product studio.' },
  { title: 'Company Formation', year: 'Phase 2', description: 'Established Enterprenex Solutions Pvt. Ltd., bringing together elite software architects, engineers, and product leads.' },
  { title: 'Core Stack Architecture', year: 'Phase 3', description: 'Engineered our modular cloud-native template and AI pipeline framework to accelerate client project delivery.' },
  { title: 'High-Impact Collaborations', year: 'Phase 4', description: 'Delivered mission-critical platforms for tech startups and enterprises with zero security compromises.' },
  { title: 'Global Scale & AI Integration', year: 'Present & Beyond', description: 'Expanding AI capabilities, agentic automation, and scaling operations globally to empower ambitious teams.' },
];

/* ── Stats Data ── */
const STATS = [
  { numericValue: 25, suffix: '+', label: 'Services & Modules' },
  { numericValue: 20, suffix: '+', label: 'Tech Stacks Mastered' },
  { isText: true, textValue: '24/7', label: 'Dedicated Support' },
  { numericValue: 100, suffix: '%', label: 'Custom Architecture' },
];

/* ── Animated Stats Counter Component ── */
function AnimatedCounter({ target, suffix = '', duration = 2 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const steps = 36;
    const stepTime = (duration * 1000) / steps;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function AboutPage() {
  return (
    <main id="main-content">
      {/* ── RESPONSIVE STYLES ── */}
      <style>{`
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: minmax(220px, auto);
          gap: 1.5rem;
        }
        .bento-hero-card {
          grid-column: span 2;
          grid-row: span 2;
        }
        .bento-wide-card {
          grid-column: span 3;
        }
        .about-values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }
        .journey-item-desktop-even {
          flex-direction: row-reverse;
          text-align: left;
        }
        .journey-item-desktop-odd {
          flex-direction: row;
          text-align: right;
        }
        .journey-timeline-line {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 3px;
          background: #e2e8f0;
          transform: translateX(-50%);
        }
        .journey-dot {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ffffff;
          border: 4px solid #F66135;
          box-shadow: 0 0 0 4px rgba(246, 97, 53, 0.15);
          z-index: 10;
        }

        @media (max-width: 1024px) {
          .about-values-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .bento-grid {
            grid-template-columns: 1fr;
          }
          .bento-hero-card, .bento-wide-card {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
          }
        }

        @media (max-width: 768px) {
          .about-values-grid {
            grid-template-columns: 1fr;
          }
          .journey-timeline-line {
            left: 20px !important;
            transform: none !important;
          }
          .journey-dot {
            left: 20px !important;
            transform: translateX(-50%) !important;
          }
          .journey-card-wrapper {
            margin-left: 45px !important;
            width: calc(100% - 45px) !important;
            text-align: left !important;
          }
        }
      `}</style>

      {/* ── HERO ── */}
      <section
        style={{
          position: 'relative',
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '6.5rem 1rem 4rem',
          background: '#ffffff',
        }}
      >
        {/* Animated ambient blurs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <motion.div
            animate={{ y: [0, -42, 20, -18, 0], x: [0, 28, -26, 14, 0], scale: [1, 1.08, 0.95, 1.04, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: '-10%',
              left: '-8%',
              width: '560px',
              height: '560px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(246,97,53,0.22) 0%, transparent 70%)',
              filter: 'blur(90px)',
            }}
          />
          <motion.div
            animate={{ y: [0, 34, -40, 16, 0], x: [0, -20, 36, -10, 0], scale: [1, 0.93, 1.1, 0.96, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              bottom: '-10%',
              right: '-8%',
              width: '520px',
              height: '520px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(246,97,53,0.16) 0%, transparent 70%)',
              filter: 'blur(100px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '920px', textAlign: 'center' }}>
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span
              variants={fadeUp}
              style={{
                display: 'inline-block',
                background: 'rgba(246,97,53,0.08)',
                border: '1px solid rgba(246,97,53,0.2)',
                color: '#F66135',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '0.4rem 1.1rem',
                borderRadius: '999px',
                marginBottom: '1.5rem',
              }}
            >
              About Enterprenex Solutions
            </motion.span>
            <motion.h1
              variants={fadeUp}
              style={{
                fontSize: 'clamp(2.4rem, 6vw, 4.8rem)',
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                color: '#0f172a',
                marginBottom: '1.5rem',
              }}
            >
              We Don't Just Write Code.<br />
              <span style={{ color: '#F66135' }}>We Engineer Competitive Advantages.</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              style={{
                fontSize: '1.25rem',
                lineHeight: 1.7,
                color: '#475569',
                maxWidth: '700px',
                margin: '0 auto 2.5rem',
              }}
            >
              Enterprenex Solutions is an AI-first product studio turning complex enterprise challenges into intuitive, scalable digital platforms with high ROI.
            </motion.p>
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/services" className="btn btn-orange" style={{ borderRadius: '9999px', padding: '0.85rem 2.25rem', fontWeight: 600 }}>
                Explore What We Build
              </Link>
              <Link
                to="/contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 2rem',
                  borderRadius: '9999px',
                  border: '1.5px solid #cbd5e1',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  background: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                Schedule Discovery Call
              </Link>
            </motion.div>
          </motion.div>

          {/* Interactive Mockup Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: 'easeOut' }}
            style={{
              marginTop: '4rem',
              background: '#ffffff',
              borderRadius: '20px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 32px 80px rgba(15, 23, 42, 0.08)',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: '0.85rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Enterprenex Core Engine</span>
            </div>
            <div style={{ padding: '1.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', background: 'rgba(246,97,53,0.015)' }}>
              {[
                { title: 'System Velocity', metric: '99.98%', highlight: '#F66135' },
                { title: 'Security Audit', metric: 'Passed A+', highlight: '#16a34a' },
                { title: 'Deployment Speed', metric: '4x Faster', highlight: '#0284c7' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    padding: '1.25rem',
                    textAlign: 'left',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>{item.title}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: item.highlight }}>{item.metric}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS COUNTER ON SCROLL ── */}
      <section style={{ padding: '3.5rem 1rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="wrap">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', textAlign: 'center' }}
          >
            {STATS.map((s, i) => (
              <motion.div key={i} custom={i} variants={fadeUp}>
                <div style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontWeight: 800, color: '#F66135', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                  {s.isText ? s.textValue : <AnimatedCounter target={s.numericValue!} suffix={s.suffix} />}
                </div>
                <div style={{ fontSize: '0.92rem', color: '#64748b', marginTop: '0.4rem', fontWeight: 600 }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── WHO WE ARE ── */}
      <section style={{ padding: '5.5rem 1rem', background: '#ffffff' }}>
        <div className="wrap" style={{ maxWidth: '820px' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(246,97,53,0.08)',
                  border: '1px solid rgba(246,97,53,0.2)',
                  color: '#F66135',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '0.35rem 0.9rem',
                  borderRadius: '999px',
                  marginBottom: '1rem',
                }}
              >
                Our Story
              </span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
                Who We Are
              </h2>
              <div style={{ width: '48px', height: '4px', background: '#F66135', borderRadius: '999px', margin: '0 auto' }} />
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {[
                'We started with a clear observation: conventional digital development forces a choice between speed and stability. Startups move quickly but accrue technical debt, while traditional enterprises build robust systems that take months to ship. We created Enterprenex to eliminate that trade-off.',
                'We build with zero-compromise enterprise standards from day one. Our core team blends deep cloud-native expertise, AI strategy, and modern UX design to solve complex business problems at high velocity.',
                'We partner with ambitious visionaries and enterprise stakeholders to engineer solutions that don’t just function today — they are built to scale seamlessly into the future.',
              ].map((text, i) => (
                <motion.p key={i} custom={i} variants={fadeUp} style={{ fontSize: '1.125rem', color: '#475569', lineHeight: 1.8 }}>
                  {text}
                </motion.p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section style={{ padding: '5.5rem 1rem', background: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(246,97,53,0.08) 0%, transparent 70%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div className="wrap" style={{ position: 'relative', zIndex: 10 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(246,97,53,0.08)',
                  border: '1px solid rgba(246,97,53,0.2)',
                  color: '#F66135',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '0.35rem 0.9rem',
                  borderRadius: '999px',
                  marginBottom: '1rem',
                }}
              >
                What Drives Us
              </span >
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Mission & Vision</h2>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {[
                { icon: '⚡', title: 'Our Mission', text: 'To empower organizations by engineering resilient, intelligent digital products. We bridge the gap between rapid software innovation and high-grade reliability, delivering tangible business performance.' },
                { icon: '👁️', title: 'Our Vision', text: 'To serve as the global benchmark for modern product engineering. We envision a future where every business commands scalable technology to transform ambitious ideas into category leaders.' },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  whileHover={{ y: -7, boxShadow: '0 20px 45px rgba(246,97,53,0.12)', borderColor: 'rgba(246,97,53,0.35)' }}
                  style={{
                    padding: '2.5rem',
                    background: '#ffffff',
                    borderRadius: '24px',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: 'rgba(246,97,53,0.1)',
                      border: '1.5px solid rgba(246,97,53,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.6rem',
                      marginBottom: '1.5rem',
                    }}
                  >
                    {card.icon}
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>{card.title}</h3>
                  <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.7 }}>{card.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── OUR STARTUP JOURNEY (TIMELINE) ── */}
      <section style={{ padding: '5.5rem 1rem', background: '#ffffff' }}>
        <div className="wrap">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(246,97,53,0.08)',
                  border: '1px solid rgba(246,97,53,0.2)',
                  color: '#F66135',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '0.35rem 0.9rem',
                  borderRadius: '999px',
                  marginBottom: '1rem',
                }}
              >
                Milestones
              </span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
                Our Startup Journey
              </h2>
              <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>
                From architectural inception to building mission-critical enterprise systems.
              </p>
            </motion.div>

            <div style={{ position: 'relative', maxWidth: '840px', margin: '0 auto' }}>
              {/* Animated Timeline Fill Line */}
              <div className="journey-timeline-line">
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: '100%' }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{ width: '100%', background: '#F66135' }}
                />
              </div>

              <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                {JOURNEY.map((stage, i) => (
                  <div key={i} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div className="journey-dot" />
                    <motion.div
                      custom={i}
                      variants={fadeUp}
                      className="journey-card-wrapper"
                      style={{
                        width: 'calc(50% - 40px)',
                        marginLeft: i % 2 === 0 ? 'auto' : '0',
                        textAlign: 'left',
                      }}
                    >
                      <motion.div
                        whileHover={{ y: -4, borderColor: 'rgba(246,97,53,0.4)', boxShadow: '0 16px 32px rgba(246,97,53,0.08)' }}
                        style={{
                          padding: '1.75rem 2rem',
                          background: '#f8fafc',
                          borderRadius: '20px',
                          border: '1.5px solid #e2e8f0',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F66135', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          {stage.year}
                        </span>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0.5rem' }}>{stage.title}</h3>
                        <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.65 }}>{stage.description}</p>
                      </motion.div>
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CORE VALUES ── */}
      <section style={{ padding: '5.5rem 1rem', background: '#f8fafc' }}>
        <div className="wrap">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(246,97,53,0.08)',
                  border: '1px solid rgba(246,97,53,0.2)',
                  color: '#F66135',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '0.35rem 0.9rem',
                  borderRadius: '999px',
                  marginBottom: '1rem',
                }}
              >
                Our Principles
              </span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
                Our Core Values
              </h2>
              <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>
                Principles guiding our daily decisions, engineering standards, and client relationships.
              </p>
            </motion.div>

            <div className="about-values-grid">
              {VALUES.map((v, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  whileHover={{ y: -8, scale: 1.015, borderColor: 'rgba(246,97,53,0.4)', boxShadow: '0 20px 40px rgba(246,97,53,0.1)' }}
                  style={{
                    padding: '2.25rem 1.75rem',
                    background: '#ffffff',
                    borderRadius: '20px',
                    border: '1.5px solid #e2e8f0',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      background: 'rgba(246,97,53,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.6rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    {v.icon}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>{v.title}</h3>
                  <p style={{ fontSize: '0.94rem', color: '#64748b', lineHeight: 1.65 }}>{v.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHY ENTERPRENEX (BENTO GRID WITH RADIAL BLURS) ── */}
      <section style={{ padding: '5.5rem 1rem', background: '#ffffff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', right: '-5%', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(246,97,53,0.12) 0%, transparent 70%)', filter: 'blur(90px)', pointerEvents: 'none' }} />
        <div className="wrap" style={{ position: 'relative', zIndex: 10 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(246,97,53,0.08)',
                  border: '1px solid rgba(246,97,53,0.2)',
                  color: '#F66135',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '0.35rem 0.9rem',
                  borderRadius: '999px',
                  marginBottom: '1rem',
                }}
              >
                Key Differentiators
              </span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
                Why Choose Enterprenex
              </h2>
              <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>
                Combining enterprise-grade security with modern cloud architecture and agile iteration.
              </p>
            </motion.div>

            <motion.div variants={stagger} className="bento-grid">
              {/* Hero Feature Card */}
              <motion.div
                custom={0}
                variants={fadeUp}
                whileHover={{ y: -6, borderColor: 'rgba(246,97,53,0.4)', boxShadow: '0 24px 48px rgba(246,97,53,0.12)' }}
                className="bento-hero-card"
                style={{
                  padding: '2.75rem',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                  borderRadius: '28px',
                  border: '1.5px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ position: 'relative', zIndex: 10 }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: 'rgba(246,97,53,0.1)',
                      border: '1.5px solid rgba(246,97,53,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.6rem',
                      marginBottom: '1.5rem',
                    }}
                  >
                    💻
                  </div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                    Modern Cloud-Native Tech Stack
                  </h3>
                  <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.7, maxWidth: '440px' }}>
                    We leverage cutting-edge frameworks (React, Vite, Node, TypeScript) alongside cloud-native microservices to ensure your application handles massive growth effortlessly.
                  </p>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker'].map((tech, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        padding: '0.35rem 0.85rem',
                        borderRadius: '999px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Subtle Radial Glow */}
                <div
                  style={{
                    position: 'absolute',
                    right: '-80px',
                    bottom: '-80px',
                    width: '260px',
                    height: '260px',
                    background: 'radial-gradient(circle, rgba(246,97,53,0.18) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(40px)',
                    pointerEvents: 'none',
                  }}
                />
              </motion.div>

              {/* AI-First Card */}
              <motion.div
                custom={1}
                variants={fadeUp}
                whileHover={{ y: -5, borderColor: 'rgba(246,97,53,0.4)', boxShadow: '0 16px 36px rgba(246,97,53,0.1)' }}
                style={{
                  padding: '2rem',
                  background: '#f8fafc',
                  borderRadius: '24px',
                  border: '1.5px solid #e2e8f0',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '0.85rem' }}>🤖</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>AI-First Intelligence</h3>
                <p style={{ fontSize: '0.94rem', color: '#64748b', lineHeight: 1.65 }}>
                  Integrating LLMs and intelligent workflow automation to unlock efficiency across your business processes.
                </p>
              </motion.div>

              {/* Agile Delivery Card */}
              <motion.div
                custom={2}
                variants={fadeUp}
                whileHover={{ y: -5, borderColor: 'rgba(246,97,53,0.4)', boxShadow: '0 16px 36px rgba(246,97,53,0.1)' }}
                style={{
                  padding: '2rem',
                  background: '#f8fafc',
                  borderRadius: '24px',
                  border: '1.5px solid #e2e8f0',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '0.85rem' }}>🔄</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Agile Delivery Sprints</h3>
                <p style={{ fontSize: '0.94rem', color: '#64748b', lineHeight: 1.65 }}>
                  Bi-weekly feature deployments with continuous feedback loops so you maintain absolute clarity on progress.
                </p>
              </motion.div>

              {/* Wide Security Banner Card */}
              <motion.div
                custom={3}
                variants={fadeUp}
                whileHover={{ y: -5, borderColor: 'rgba(246,97,53,0.4)', boxShadow: '0 20px 40px rgba(246,97,53,0.1)' }}
                className="bento-wide-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '2rem',
                  padding: '2.25rem 2.75rem',
                  background: '#ffffff',
                  borderRadius: '24px',
                  border: '1.5px solid #e2e8f0',
                  flexWrap: 'wrap',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ maxWidth: '640px' }}>
                  <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.65rem' }}>
                    Enterprise Security & Compliance
                  </h3>
                  <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.7 }}>
                    Zero-trust access control, automated vulnerability scanning, and robust data encryption come standard in all custom builds.
                  </p>
                </div>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(246,97,53,0.1)',
                    border: '1.5px solid rgba(246,97,53,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    flexShrink: 0,
                  }}
                >
                  🛡️
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '5.5rem 1rem', background: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '20%', transform: 'translateY(-50%)', width: '380px', height: '380px', background: 'radial-gradient(circle, rgba(246,97,53,0.12) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none' }} />
        <div className="wrap" style={{ position: 'relative', zIndex: 10 }}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(24px)',
              border: '1.5px solid #e2e8f0',
              borderRadius: '28px',
              padding: 'clamp(2.5rem, 6vw, 4.5rem)',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
              maxWidth: '840px',
              margin: '0 auto',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                background: 'rgba(246,97,53,0.08)',
                border: '1px solid rgba(246,97,53,0.2)',
                color: '#F66135',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '0.35rem 1rem',
                borderRadius: '999px',
                marginBottom: '1.25rem',
              }}
            >
              Start Building
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.4rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: '1.25rem' }}>
              Let's Build Something<br />
              <span style={{ color: '#F66135' }}>Exceptional Together</span>
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto 2.25rem' }}>
              Ready to elevate your digital presence? Our senior strategy team is standing by to guide your roadmap.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn btn-orange" style={{ borderRadius: '9999px', padding: '0.85rem 2.25rem', textDecoration: 'none', fontWeight: 700 }}>
                Start a Project
              </Link>
              <Link
                to="/contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 2rem',
                  borderRadius: '9999px',
                  border: '1.5px solid #cbd5e1',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  background: '#ffffff',
                }}
              >
                Schedule Consultation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
