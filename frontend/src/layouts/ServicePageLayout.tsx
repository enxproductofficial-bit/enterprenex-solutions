import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Target, CheckCircle, ChevronDown, Sparkles, Cpu, Lock, Activity, ArrowRight, Check } from 'lucide-react';
import type { ServiceData } from '../data/servicesData';

interface ServiceProps {
  serviceData: ServiceData;
}

const defaultProcess = [
  { 
    step: '01', 
    title: 'Discovery & Consultation', 
    desc: 'We analyze your requirements, target audience, and business goals to chart out clear measurable outcomes.',
    details: 'Includes stakeholder interviews, architectural audits, risk assessment, and precise KPI definition.'
  },
  { 
    step: '02', 
    title: 'Strategy & Architecture', 
    desc: 'Creating a comprehensive roadmap, cloud architecture, and optimal technology stack selection.',
    details: 'Covers milestone scoping, resource allocation, security posture planning, and data pipeline design.'
  },
  { 
    step: '03', 
    title: 'UX/UI & Prototype Design', 
    desc: 'Crafting intuitive, accessible, and high-converting user interfaces and design systems.',
    details: 'Interactive Figma prototypes, design tokens, accessibility compliance (WCAG), and feedback loops.'
  },
  { 
    step: '04', 
    title: 'Agile Engineering & Build', 
    desc: 'Writing clean, scalable, and secure code using modern frameworks and automated CI/CD.',
    details: 'Continuous integration, automated unit tests, daily standups, and modular code architecture.'
  },
  { 
    step: '05', 
    title: 'QA & Security Hardening', 
    desc: 'Rigorous quality assurance, load testing, and penetration audits to ensure zero vulnerabilities.',
    details: 'End-to-end automated testing, performance profiling, multi-device audits, and security compliance.'
  },
  { 
    step: '06', 
    title: 'Seamless Deployment', 
    desc: 'Smooth transition to production with automated release strategies and zero downtime.',
    details: 'Blue-green deployment, cloud infrastructure provisioning, SSL/DNS setup, and data migration.'
  },
  { 
    step: '07', 
    title: 'SLA Support & Continuous Scaling', 
    desc: 'Ongoing maintenance, active telemetry monitoring, and rapid iterative feature enhancements.',
    details: '24/7 uptime monitoring, security patching, quarterly feature releases, and analytics tracking.'
  },
];

const floatingBadges = [
  { text: '⚡ Enterprise Speed', top: '12%', right: '6%', icon: Zap, delay: 0 },
  { text: '🔒 SOC2 & GDPR Ready', top: '48%', right: '10%', icon: Lock, delay: 0.6 },
  { text: '🚀 99.99% Uptime SLA', top: '28%', right: '24%', icon: Activity, delay: 1.2 },
  { text: '🤖 AI Native Workflows', top: '72%', right: '4%', icon: Cpu, delay: 1.8 },
];

export default function ServicePageLayout({ serviceData }: ServiceProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [openStepIndex, setOpenStepIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const toggleStep = (index: number) => {
    setOpenStepIndex(openStepIndex === index ? null : index);
  };

  const problemsList = serviceData.businessProblemsWeSolve || [
    'Streamline complex workflows and eliminate repetitive manual bottlenecks to boost overall team efficiency.',
    'Modernize legacy monolithic systems with cloud-native, ultra-scalable microservices and secure APIs.',
    'Transform raw fragmented data into real-time business intelligence and automated AI insights.'
  ];

  const faqsList = (serviceData as any).faqs || [
    { question: `What is your typical engagement model for ${serviceData.title}?`, answer: `We offer flexible engagement models tailored to your business stage—including dedicated developer squads, end-to-end project outsourcing, and specialized advisory services.` },
    { question: `How do you guarantee quality, security, and IP ownership?`, answer: `All source code and intellectual property rights are 100% transferred to your organization upon project completion. We adhere to strict ISO/SOC2 security protocols and perform automated QA testing.` },
    { question: 'What is the estimated timeline for typical deliverables?', answer: 'Initial discovery and scoping take 1-2 weeks. Prototype delivery occurs within 3-4 weeks, followed by iterative bi-weekly sprint releases.' },
    { question: 'Do you provide post-launch support and SLA guarantees?', answer: 'Yes! We provide tiered 24/7 SLA support contracts, including proactive bug fixing, server health monitoring, security patches, and scaling management.' },
    { question: 'Can we scale our dedicated team size during development?', answer: 'Absolutely. You can scale your team up or down with a 2-week notice to adapt to shifting project demands or accelerated launch targets.' }
  ];

  return (
    <div className="service-page" style={{ overflowX: 'hidden' }}>
      
      {/* ── 1. HERO SECTION ── */}
      <section className="hero" style={{ position: 'relative', background: '#0a0a0a', color: '#fff', padding: 'clamp(4rem, 8vw, 6.5rem) 1rem', overflow: 'hidden' }}>
        {/* Animated Background Gradients & Image */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.35, pointerEvents: 'none' }}>
          <img 
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2070" 
            alt="Hero Background" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
        
        {/* Glow Spheres */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-5%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(246,97,53,0.35) 0%, transparent 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none'
          }}
        />

        <div className="wrap relative" style={{ zIndex: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }}>
            
            {/* Left Content */}
            <motion.div 
              className="hero__content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ maxWidth: '680px' }}
            >
              <motion.span 
                className="hero__tag"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  padding: '0.4rem 1rem', 
                  borderRadius: '9999px', 
                  background: 'rgba(246,97,53,0.15)', 
                  border: '1px solid rgba(246,97,53,0.4)', 
                  color: '#F66135',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '1.25rem'
                }}
              >
                <Sparkles size={14} /> Enterprise Solutions
              </motion.span>

              <h1 style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#ffffff', marginBottom: '1.25rem' }}>
                {serviceData.title || 'Enterprise Solutions'}
              </h1>

              <p style={{ fontSize: 'clamp(1rem, 2vw, 1.18rem)', color: 'rgba(255,255,255,0.78)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '580px' }}>
                {serviceData.heroDescription || 'Comprehensive enterprise solutions engineered with peak performance, security-first principles, and modern scalable architecture.'}
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <motion.a 
                  href="/contact" 
                  className="btn btn-orange"
                  whileHover={{ scale: 1.04, boxShadow: '0 12px 28px rgba(246, 97, 53, 0.45)' }}
                  whileTap={{ scale: 0.96 }}
                  style={{ borderRadius: '9999px', padding: '0.875rem 2rem', fontSize: '1rem', fontWeight: 600 }}
                >
                  Get Free Consultation <ArrowRight size={18} />
                </motion.a>
                
                <motion.a 
                  href="#features" 
                  className="btn"
                  whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.15)' }}
                  whileTap={{ scale: 0.96 }}
                  style={{ 
                    borderRadius: '9999px', 
                    padding: '0.875rem 1.75rem', 
                    fontSize: '0.95rem', 
                    fontWeight: 600, 
                    color: '#fff', 
                    border: '1.5px solid rgba(255,255,255,0.25)', 
                    background: 'rgba(255,255,255,0.06)' 
                  }}
                >
                  Explore Capabilities
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Tech Badges (Visible on medium+ screens) */}
        <div className="hero-badges-container" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
          {floatingBadges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.6, y: 20 }}
                animate={{ 
                  opacity: [0.7, 1, 0.7], 
                  scale: 1, 
                  y: [-8, 8, -8],
                  rotate: [-1.5, 1.5, -1.5]
                }}
                transition={{
                  y: { duration: 4 + idx, repeat: Infinity, ease: 'easeInOut' },
                  rotate: { duration: 5 + idx, repeat: Infinity, ease: 'easeInOut' },
                  opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                  delay: badge.delay,
                  duration: 0.6
                }}
                style={{
                  position: 'absolute',
                  top: badge.top,
                  right: badge.right,
                  display: 'none', // Shown via responsive CSS media below
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.65rem 1.1rem',
                  background: 'rgba(20, 20, 20, 0.75)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '9999px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)'
                }}
                className="desktop-floating-badge"
              >
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(246,97,53,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={13} color="#F66135" />
                </div>
                <span>{badge.text}</span>
              </motion.div>
            );
          })}
        </div>

        <style>{`
          @media (min-width: 1024px) {
            .desktop-floating-badge { display: flex !important; }
          }
        `}</style>
      </section>

      {/* ── 2. WHY CHOOSE THIS SERVICE ── */}
      <section className="section" style={{ background: '#ffffff', padding: 'clamp(3.5rem, 6vw, 5.5rem) 0' }}>
        <div className="wrap">
          <motion.div 
            className="section-header section-header--center"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
          >
            <span className="section-eyebrow t-overline">Advantages</span>
            <h2 className="section-h2">Why Partner With <span className="dot">Enterprenex</span></h2>
            <p className="section-sub" style={{ margin: '0.75rem auto 0' }}>
              We blend engineering rigor with strategic business execution to build high-impact solutions.
            </p>
          </motion.div>

          <motion.div 
            className="services-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {(serviceData.whyChooseThisService ? [serviceData.whyChooseThisService] : [
              'Our senior engineers bring proven industry domain expertise and software architecture excellence.',
              'We enforce agile methodology, transparent codebases, and predictable milestone delivery.',
              'Custom tailored technology stacks designed specifically for your growth, scalability, and security requirements.'
            ]).map((desc, idx) => (
              <motion.div 
                key={idx} 
                className="svc-card"
                variants={{
                  hidden: { opacity: 0, y: 25 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } }
                }}
                whileHover={{ y: -6, borderColor: '#F66135', boxShadow: '0 16px 36px rgba(246, 97, 53, 0.12)' }}
                style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid var(--gray-200)', transition: 'all 0.3s ease' }}
              >
                <div className="svc-icon" style={{ background: 'rgba(246,97,53,0.08)', borderRadius: '12px', width: '3.25rem', height: '3.25rem' }}>
                  <Shield size={24} color="#F66135" />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '1rem', color: '#0a0a0a' }}>Advantage 0{idx + 1}</h3>
                <p style={{ color: 'var(--gray-600)', lineHeight: 1.65, fontSize: '0.95rem', marginTop: '0.5rem' }}>{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 3. BUSINESS PROBLEMS WE SOLVE (BENTO SECTION WITH ANIMATED CHECKMARKS) ── */}
      <section className="section" style={{ background: 'var(--gray-50)', padding: 'clamp(3.5rem, 6vw, 5.5rem) 0' }}>
        <div className="wrap">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
          >
            <span className="section-eyebrow t-overline">Solutions</span>
            <h2 className="section-h2">Business Problems We <span className="dot">Solve</span></h2>
            <p className="section-sub">Targeted engineering interventions for complex operational challenges.</p>
          </motion.div>

          {/* Bento Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem' }}>
            {problemsList.map((desc, idx) => {
              const isFeatured = idx === 0;
              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ 
                    y: -6, 
                    borderColor: '#F66135', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.08)' 
                  }}
                  style={{ 
                    background: isFeatured ? 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)' : '#ffffff', 
                    color: isFeatured ? '#ffffff' : '#0a0a0a',
                    padding: 'clamp(1.5rem, 3vw, 2.25rem)', 
                    borderRadius: '20px', 
                    border: isFeatured ? '1px solid rgba(246,97,53,0.3)' : '1px solid var(--gray-200)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {/* Background Accent Glow for Featured */}
                  {isFeatured && (
                    <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(246,97,53,0.25) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
                  )}

                  <div>
                    {/* Animated Checkmark Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <div style={{ 
                        width: '3.25rem', 
                        height: '3.25rem', 
                        borderRadius: '14px', 
                        background: isFeatured ? 'rgba(246,97,53,0.2)' : 'rgba(246,97,53,0.08)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        <motion.div
                          initial={{ scale: 0.5, rotate: -20 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          viewport={{ once: true }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: idx * 0.1 + 0.2 }}
                        >
                          <Target size={26} color="#F66135" />
                        </motion.div>
                      </div>

                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 800, 
                        letterSpacing: '0.08em', 
                        padding: '0.3rem 0.75rem', 
                        borderRadius: '9999px',
                        background: isFeatured ? 'rgba(255,255,255,0.1)' : 'var(--gray-100)',
                        color: isFeatured ? '#F66135' : 'var(--gray-600)'
                      }}>
                        PROBLEM 0{idx + 1}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.85rem', color: isFeatured ? '#ffffff' : '#0a0a0a', lineHeight: 1.3 }}>
                      {idx === 0 ? 'Operational Bottlenecks' : idx === 1 ? 'Legacy Code Limitations' : 'Fragmented Data Silos'}
                    </h3>

                    <p style={{ color: isFeatured ? 'rgba(255,255,255,0.75)' : 'var(--gray-600)', lineHeight: 1.65, fontSize: '0.95rem' }}>
                      {desc}
                    </p>
                  </div>

                  {/* Animated checkmark indicator footer */}
                  <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: isFeatured ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <motion.div 
                      whileHover={{ scale: 1.2 }}
                      style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#F66135', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Check size={14} color="#fff" strokeWidth={3} />
                    </motion.div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isFeatured ? '#F66135' : 'var(--primary)' }}>
                      Solved with Custom Architecture
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. FEATURES & CAPABILITIES ── */}
      <section id="features" className="section" style={{ background: '#ffffff', padding: 'clamp(3.5rem, 6vw, 5.5rem) 0' }}>
        <div className="wrap">
          <motion.div 
            className="section-header section-header--center"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
          >
            <span className="section-eyebrow t-overline">Capabilities</span>
            <h2 className="section-h2">Features & <span className="dot">Capabilities</span></h2>
            <p className="section-sub" style={{ margin: '0.75rem auto 0' }}>
              High-impact feature suites engineered to meet enterprise requirements.
            </p>
          </motion.div>

          <motion.div 
            className="services-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } }
            }}
          >
            {(serviceData.sections || [
              'Custom Engineering', 'API & Integration', 'Cloud Migration', 'Performance Optimization', 'Security Audits', '24/7 SLA Support'
            ]).map((title, idx) => (
              <motion.div 
                key={idx} 
                className="svc-card"
                variants={{
                  hidden: { opacity: 0, scale: 0.95, y: 20 },
                  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } }
                }}
                whileHover={{ y: -6, borderColor: '#F66135', boxShadow: '0 16px 36px rgba(246, 97, 53, 0.12)' }}
                style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid var(--gray-200)', transition: 'all 0.3s ease' }}
              >
                <div className="svc-icon" style={{ background: 'rgba(246,97,53,0.08)', borderRadius: '12px', width: '3.25rem', height: '3.25rem' }}>
                  <Zap size={24} color="#F66135" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '1rem', color: '#0a0a0a' }}>{title}</h3>
                <p style={{ color: 'var(--gray-600)', lineHeight: 1.6, fontSize: '0.92rem', marginTop: '0.5rem' }}>
                  We deliver top-tier {title.toLowerCase()} tailored to give your business a sustained competitive edge.
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 5. DEVELOPMENT PROCESS (MOTION ACCORDION EFFECT) ── */}
      <section className="process-section" style={{ background: 'var(--gray-50)', padding: 'clamp(3.5rem, 6vw, 5.5rem) 0' }}>
        <div className="wrap process-inner">
          
          <motion.div 
            className="process-left"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-eyebrow t-overline">Methodology</span>
            <h2 className="section-h2" style={{ marginTop: '0.5rem' }}>Our Proven <span className="dot">Process</span></h2>
            <p className="section-sub" style={{ marginBottom: '2rem' }}>
              We follow a structured, transparent process with clear milestones, active client communication, and rigorous QA. Click any step to inspect the details.
            </p>
            <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.1)' }}>
              <motion.img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070" 
                alt="Development Process" 
                className="process-img" 
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.4 }}
                style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '420px', objectFit: 'cover' }}
              />
            </div>
          </motion.div>

          <motion.div 
            className="process-right"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } }
            }}
          >
            <div className="process-timeline"></div>
            {defaultProcess.map((step, idx) => {
              const isOpen = openStepIndex === idx;
              return (
                <motion.div 
                  key={idx} 
                  className="pstep"
                  variants={{
                    hidden: { opacity: 0, x: 30 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  style={{ marginBottom: '1.25rem', cursor: 'pointer' }}
                  onClick={() => toggleStep(idx)}
                >
                  <motion.div 
                    className="pstep__icon"
                    animate={{ 
                      backgroundColor: isOpen ? '#F66135' : '#ffffff', 
                      color: isOpen ? '#ffffff' : '#0a0a0a',
                      borderColor: isOpen ? '#F66135' : 'var(--gray-200)'
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ fontWeight: 700 }}
                  >
                    {step.step}
                  </motion.div>
                  
                  <div 
                    className="pstep__body" 
                    style={{ 
                      background: isOpen ? '#ffffff' : 'transparent',
                      padding: isOpen ? '1.25rem' : '0.25rem 0',
                      borderRadius: '14px',
                      border: isOpen ? '1px solid var(--gray-200)' : '1px solid transparent',
                      boxShadow: isOpen ? '0 10px 25px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span className="pstep__over" style={{ color: isOpen ? '#F66135' : 'var(--gray-400)' }}>Phase {step.step}</span>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{step.title}</h3>
                      </div>
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <ChevronDown size={20} color={isOpen ? '#F66135' : 'var(--gray-500)'} />
                      </motion.div>
                    </div>

                    <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.92rem', color: 'var(--gray-600)' }}>
                      {step.desc}
                    </p>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--gray-200)', fontSize: '0.875rem', color: 'var(--gray-700)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <CheckCircle size={16} color="#F66135" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span><strong>Deliverables:</strong> {step.details}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

        </div>
      </section>

      {/* ── 6. TECHNOLOGY STACK ── */}
      <section className="section" style={{ background: '#0a0a0a', color: '#fff', padding: 'clamp(3.5rem, 6vw, 5.5rem) 0' }}>
        <div className="wrap">
          <motion.div 
            className="section-header section-header--center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
          >
            <span className="section-eyebrow t-overline" style={{ color: '#F66135' }}>Technologies</span>
            <h2 className="section-h2" style={{ color: '#fff' }}>Modern Technology <span className="dot">Stack</span></h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
              We build with battle-tested frameworks and cutting-edge cloud infrastructure.
            </p>
          </motion.div>

          <motion.div 
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', justifyContent: 'center', maxWidth: '850px', margin: '0 auto' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.04 } }
            }}
          >
            {(serviceData.technologies || ['React', 'Next.js', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'GraphQL', 'TypeScript', 'Tailwind', 'Redis']).map((tech, idx) => (
              <motion.span 
                key={idx} 
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '9999px', 
                  fontSize: '0.9375rem', 
                  fontWeight: 600, 
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.9)',
                  cursor: 'default'
                }}
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1 }
                }}
                whileHover={{ scale: 1.08, backgroundColor: 'rgba(246,97,53,0.2)', borderColor: '#F66135', color: '#ffffff' }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                {tech}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 7. INDUSTRIES WE SERVE ── */}
      <section className="section" style={{ background: '#ffffff', padding: 'clamp(3.5rem, 6vw, 5.5rem) 0' }}>
        <div className="wrap">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
          >
            <span className="section-eyebrow t-overline">Sectors</span>
            <h2 className="section-h2">Industries We <span className="dot">Serve</span></h2>
          </motion.div>

          <motion.div 
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } }
            }}
          >
            {((serviceData as any).industries || ['Healthcare & Biotech', 'Fintech & Banking', 'Retail & E-Commerce', 'Logistics & Supply Chain', 'Manufacturing & IoT', 'SaaS & Enterprise Tech']).map((industry: string, idx: number) => (
              <motion.div 
                key={idx} 
                style={{ 
                  padding: '1.25rem 1.5rem', 
                  border: '1px solid var(--gray-200)', 
                  borderRadius: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.85rem', 
                  background: 'var(--gray-50)',
                  transition: 'all 0.3s ease'
                }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.03, borderColor: '#F66135', backgroundColor: '#ffffff', boxShadow: '0 12px 24px rgba(246,97,53,0.1)' }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(246,97,53,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle size={16} color="#F66135" />
                </div>
                <span style={{ fontWeight: 700, color: 'var(--gray-800)', fontSize: '0.95rem' }}>{industry}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 8. FAQ (MOTION ACCORDION) ── */}
      <section className="section" style={{ background: 'var(--gray-50)', padding: 'clamp(3.5rem, 6vw, 5.5rem) 0' }}>
        <div className="wrap">
          <motion.div 
            className="section-header section-header--center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
          >
            <span className="section-eyebrow t-overline">FAQ</span>
            <h2 className="section-h2">Frequently Asked <span className="dot">Questions</span></h2>
            <p className="section-sub" style={{ margin: '0.75rem auto 0' }}>
              Clear answers to common questions about our delivery, pricing, and process.
            </p>
          </motion.div>

          <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqsList.map((faq: any, idx: number) => {
              const isOpen = openFaqIndex === idx;
              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  style={{ 
                    background: '#ffffff', 
                    borderRadius: '16px', 
                    border: isOpen ? '1.5px solid #F66135' : '1px solid var(--gray-200)',
                    boxShadow: isOpen ? '0 12px 30px rgba(246, 97, 53, 0.08)' : '0 2px 6px rgba(0,0,0,0.02)',
                    overflow: 'hidden',
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
                  }}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    style={{
                      width: '100%',
                      padding: '1.35rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: isOpen ? '#F66135' : 'var(--gray-900)', lineHeight: 1.4 }}>
                      {faq.question}
                    </span>
                    <motion.div 
                      animate={{ rotate: isOpen ? 180 : 0 }} 
                      transition={{ duration: 0.3 }}
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: isOpen ? 'rgba(246,97,53,0.1)' : 'var(--gray-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <ChevronDown size={18} color={isOpen ? '#F66135' : 'var(--gray-600)'} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                      >
                        <div style={{ padding: '0 1.5rem 1.5rem', color: 'var(--gray-600)', fontSize: '0.95rem', lineHeight: 1.7, borderTop: '1px solid var(--gray-100)', paddingTop: '1rem' }}>
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 9. CONTACT / CONSULTATION CTA ── */}
      <section id="contact" className="cta-banner" style={{ background: 'linear-gradient(135deg, #F66135 0%, #D94E22 100%)', padding: 'clamp(4rem, 7vw, 6rem) 1rem', textAlign: 'center', color: '#fff' }}>
        <div className="wrap">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ maxWidth: '720px', margin: '0 auto' }}
          >
            <h2 style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Ready to Scale Your Business?
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
              Schedule a technical consultation with our solution architects to evaluate your architecture and receive a tailored implementation plan.
            </p>
            <div className="cta-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.a 
                href="/contact"
                className="btn"
                whileHover={{ scale: 1.05, boxShadow: '0 12px 28px rgba(0,0,0,0.25)' }}
                whileTap={{ scale: 0.95 }}
                style={{ background: '#ffffff', color: '#F66135', borderRadius: '9999px', padding: '0.875rem 2.25rem', fontWeight: 700, fontSize: '1rem' }}
              >
                Get Free Consultation
              </motion.a>
              <motion.a 
                href="/contact"
                className="btn"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.95 }}
                style={{ background: 'transparent', color: '#ffffff', border: '2px solid rgba(255,255,255,0.6)', borderRadius: '9999px', padding: '0.875rem 2rem', fontWeight: 600, fontSize: '0.95rem' }}
              >
                Contact Sales Squad
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
