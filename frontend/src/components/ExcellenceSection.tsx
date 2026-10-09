import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';

interface MetricItem {
  eyebrow: string;
  targetValue: number;
  prefix?: string;
  suffix: string;
  label: string;
  sub: string;
  icon: string;
}

const STATS: MetricItem[] = [
  { 
    eyebrow: 'Technology', 
    targetValue: 20, 
    suffix: '+', 
    label: 'Modern Technologies', 
    sub: 'Frontend • Backend • Cloud • AI Stack',
    icon: '⚡'
  },
  { 
    eyebrow: 'Support', 
    targetValue: 24, 
    suffix: '/7', 
    label: 'Technical Support', 
    sub: 'Reliable Round-the-Clock Assistance',
    icon: '🌐'
  },
  { 
    eyebrow: 'Quality', 
    targetValue: 100, 
    suffix: '%', 
    label: 'Custom Development', 
    sub: 'Tailored Specifically for Your Business',
    icon: '🎯'
  },
];

function AnimatedCounterValue({ targetValue, prefix = '', suffix }: { targetValue: number; prefix?: string; suffix: string }) {
  const [currentVal, setCurrentVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 1400; // ms
    const steps = 28;
    const increment = targetValue / steps;
    const intervalTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetValue) {
        setCurrentVal(targetValue);
        clearInterval(timer);
      } else {
        setCurrentVal(Math.floor(start));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isInView, targetValue]);

  return (
    <span ref={ref} className="stat-num-animated">
      {prefix}{currentVal}
      <span className="stat-suffix">{suffix}</span>
    </span>
  );
}

export default function ExcellenceSection() {
  return (
    <section className="excellence" id="about" aria-labelledby="excellence-h2">
      <div className="wrap">
        <div className="excellence-inner">
          {/* Left Column: Heading & Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <p className="t-overline" style={{ color: '#8f8f8f' }}>WHY CHOOSE US</p>
            <h2 id="excellence-h2">
              Engineering Excellence<span className="dot">.</span><br />
              Built Into Every Solution<span className="dot">.</span>
            </h2>
            <p style={{ marginTop: '1.25rem' }}>
              We don't just build applications—we create digital products engineered for performance, security, scalability, and exceptional user experiences.
            </p>
            <p style={{ marginTop: '1rem' }}>
              Every project follows industry best practices, modern architecture, and a commitment to delivering business value from day one.
            </p>

            <Link 
              to="/contact" 
              className="btn btn-orange" 
              style={{ marginTop: '2.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>Let's Build Together</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </motion.div>

          {/* Right Column: Sleek Metrics Grid with Animated Counters */}
          <motion.div 
            className="stats-grid-enhanced" 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } }
            }}
          >
            {STATS.map(s => (
              <motion.div 
                key={s.label} 
                className="excellence-card"
                variants={{
                  hidden: { opacity: 0, x: 40, scale: 0.96 },
                  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
                }}
                whileHover={{ 
                  y: -6,
                  scale: 1.02,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(246, 97, 53, 0.6)',
                  boxShadow: '0 12px 35px rgba(246, 97, 53, 0.18)'
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              >
                <motion.div 
                  className="excellence-card__icon"
                  whileHover={{ scale: 1.25, rotate: 6 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  {s.icon}
                </motion.div>

                <div className="excellence-card__val-block">
                  <p className="t-overline" style={{ color: '#8f8f8f', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
                    {s.eyebrow}
                  </p>
                  <div className="stat-num">
                    <AnimatedCounterValue 
                      targetValue={s.targetValue} 
                      prefix={s.prefix} 
                      suffix={s.suffix} 
                    />
                  </div>
                </div>

                <div className="excellence-card__details">
                  <p className="stat-lbl" style={{ color: '#fff', fontSize: '1.125rem', fontWeight: 600, marginTop: 0 }}>
                    {s.label}
                  </p>
                  <p className="stat-sub" style={{ fontSize: '0.9375rem', marginTop: '0.375rem' }}>
                    {s.sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
