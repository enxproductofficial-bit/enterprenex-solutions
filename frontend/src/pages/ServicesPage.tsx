import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SERVICES_DATA } from '../data/servicesData';
import { ArrowRight, Sparkles, Search } from 'lucide-react';

/* ── All service categories with metadata ── */
const CATEGORIES = [
  {
    id: 'engagement-models',
    heading: 'Engagement Models',
    subtitle: 'Flexible software delivery & team expansion frameworks tailored to your operational scale.',
    accent: '#F66135',
    services: [
      { name: 'Staff Augmentation', icon: '👥', slug: 'staff-augmentation', desc: 'Scale your engineering capacity with vetted remote developers on demand.' },
      { name: 'Dedicated Teams', icon: '🏢', slug: 'dedicated-teams', desc: 'Full autonomous squads working exclusively on your product roadmap.' },
      { name: 'Software Outsourcing', icon: '🌐', slug: 'software-outsourcing', desc: 'End-to-end offshore & nearshore software delivery management.' },
      { name: 'AI Transformation', icon: '🤖', slug: 'ai-transformation', desc: 'Enterprise AI strategy, roadmap, LLM integration & implementation.' },
    ],
  },
  {
    id: 'top-services',
    heading: 'Top Services',
    subtitle: 'Core engineering capabilities for modern web, mobile, data, and intelligent systems.',
    accent: '#F66135',
    services: [
      { name: 'AI Development', icon: '🧠', slug: 'ai-development', desc: 'Custom AI solutions, intelligent chatbots, LLMs & workflow automation.' },
      { name: 'Web Development', icon: '💻', slug: 'web-development', desc: 'High-performance web applications, SaaS platforms & enterprise portals.' },
      { name: 'Mobile App Development', icon: '📱', slug: 'mobile-app-development', desc: 'Cross-platform & native iOS/Android apps built with React Native & Flutter.' },
      { name: 'Backend Development', icon: '⚙️', slug: 'backend-development', desc: 'Scalable REST & GraphQL APIs, microservices & secure infrastructure.' },
      { name: 'Frontend Development', icon: '🎨', slug: 'frontend-development', desc: 'Modern, responsive, pixel-perfect & animated user interfaces.' },
      { name: 'SaaS Development', icon: '☁️', slug: 'saas-development', desc: 'Multi-tenant SaaS architecture with billing, RBAC auth & telemetry.' },
      { name: 'UX/UI Design', icon: '✏️', slug: 'ux-ui-design', desc: 'User research, wireframing, design systems & interactive prototypes.' },
      { name: 'QA Testing & Automation', icon: '🧪', slug: 'qa-testing-and-automation', desc: 'Manual, end-to-end automated, performance & penetration testing.' },
      { name: 'Machine Learning', icon: '📊', slug: 'machine-learning', desc: 'Predictive models, classification engines, NLP & automated MLOps.' },
      { name: 'Data Engineering', icon: '🔧', slug: 'data-engineering', desc: 'ETL pipelines, data lakehouse architectures & Kafka stream processing.' },
      { name: 'Business Intelligence', icon: '📈', slug: 'business-intelligence', desc: 'Interactive dashboards, Power BI, Tableau & operational KPI analytics.' },
      { name: 'CMS Development', icon: '📝', slug: 'cms-development', desc: 'WordPress, headless Strapi, Sanity & custom content workflows.' },
      { name: 'eCommerce Development', icon: '🛒', slug: 'ecommerce-development', desc: 'Shopify, WooCommerce & custom high-converting online storefronts.' },
    ],
  },
  {
    id: 'enterprise-focused',
    heading: 'Enterprise Focused',
    subtitle: 'Mission-critical cloud, security, ERP, and legacy modernization solutions.',
    accent: '#F66135',
    services: [
      { name: 'Cloud Applications', icon: '☁️', slug: 'cloud-applications', desc: 'AWS, Azure, GCP serverless, containerization & Kubernetes clusters.' },
      { name: 'DevOps', icon: '🔄', slug: 'devops', desc: 'Automated CI/CD pipelines, Docker, Terraform & infrastructure-as-code.' },
      { name: 'Cybersecurity', icon: '🛡️', slug: 'cybersecurity', desc: 'Security audits, penetration testing, ISO/SOC2 compliance & hardening.' },
      { name: 'CRM Development', icon: '🤝', slug: 'crm-development', desc: 'Custom sales CRM, lead management & customer portal solutions.' },
      { name: 'ERP Development', icon: '🏭', slug: 'erp-development', desc: 'Integrated HR, Finance, Inventory & Manufacturing ERP platforms.' },
      { name: 'Big Data', icon: '🗄️', slug: 'big-data', desc: 'Hadoop, Spark, Snowflake & enterprise data lake architectures.' },
      { name: 'Digital Transformation', icon: '🚀', slug: 'digital-transformation', desc: 'Legacy system modernization, cloud migration & AI workflows.' },
      { name: 'Backup Solutions', icon: '💾', slug: 'backup-solutions', desc: 'Cloud backup, automated disaster recovery & continuous monitoring.' },
    ],
  },
];

/* ── Animation Variants ── */
const fadeUp: any = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, delay: i * 0.05 } 
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

/* ── Stats ── */
const STATS = [
  { value: '25+', label: 'Specialized Services' },
  { value: '100+', label: 'Projects Delivered' },
  { value: '99.9%', label: 'On-Time SLA' },
  { value: '24/7', label: 'Dedicated Support' },
];

export default function ServicesPage() {
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCategories = CATEGORIES.map(cat => {
    if (selectedCat !== 'all' && cat.id !== selectedCat) {
      return null;
    }
    const matchingServices = cat.services.filter(svc => 
      svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (matchingServices.length === 0 && searchQuery) return null;
    return { ...cat, services: matchingServices };
  }).filter(Boolean) as typeof CATEGORIES;

  return (
    <main id="main-content" style={{ background: '#ffffff', overflowX: 'hidden' }}>

      {/* ── HERO SECTION ── */}
      <section style={{ position: 'relative', padding: 'clamp(4rem, 8vw, 6.5rem) 1rem 4rem', background: '#ffffff', overflow: 'hidden', textAlign: 'center' }}>
        {/* Animated Background Blobs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <motion.div
            animate={{ y: [0, -30, 20, -15, 0], x: [0, 20, -25, 10, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: '-10%', left: '-5%', width: '550px', height: '550px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(246,97,53,0.18) 0%, transparent 70%)', filter: 'blur(90px)' }}
          />
          <motion.div
            animate={{ y: [0, 25, -30, 15, 0], x: [0, -18, 25, -10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(246,97,53,0.14) 0%, transparent 70%)', filter: 'blur(95px)' }}
          />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '850px', margin: '0 auto' }}>
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            
            <motion.span
              variants={fadeUp}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                background: 'linear-gradient(135deg, rgba(246,97,53,0.1) 0%, rgba(255,143,91,0.15) 100%)', 
                border: '1px solid rgba(246,97,53,0.3)', 
                color: '#F66135', 
                fontSize: '0.8rem', 
                fontWeight: 700, 
                letterSpacing: '0.08em', 
                textTransform: 'uppercase', 
                padding: '0.4rem 1.1rem', 
                borderRadius: '9999px', 
                marginBottom: '1.5rem' 
              }}
            >
              <Sparkles size={14} /> Full-Service Engineering & AI
            </motion.span>

            <motion.h1
              variants={fadeUp}
              style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#0a0a0a', marginBottom: '1.25rem' }}
            >
              Enterprise-Grade Services<br />
              <span style={{ 
                background: 'linear-gradient(135deg, #F66135 0%, #FF8F5B 100%)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}>
                Engineered for High Growth
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              style={{ fontSize: 'clamp(1rem, 2vw, 1.18rem)', color: 'var(--gray-600)', lineHeight: 1.7, maxWidth: '640px', margin: '0 auto 2.5rem' }}
            >
              Explore 25+ specialized engineering services. From AI transformation to scalable cloud infrastructure, we deliver security-first architectures tailored to your roadmap.
            </motion.p>

            {/* Search Input Bar */}
            <motion.div variants={fadeUp} style={{ maxWidth: '480px', margin: '0 auto 2rem', position: 'relative' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={18} color="var(--gray-400)" style={{ position: 'absolute', left: '1.25rem', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Search 25 services (e.g. AI, Cloud, DevOps)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.25rem 0.85rem 3rem',
                    borderRadius: '9999px',
                    border: '1.5px solid var(--gray-200)',
                    outline: 'none',
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </motion.div>

            <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn btn-orange" style={{ borderRadius: '9999px', textDecoration: 'none', padding: '0.85rem 2rem', fontWeight: 600 }}>
                Get Free Consultation
              </Link>
              <a href="#services-list" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.85rem 1.75rem', borderRadius: '9999px', border: '1.5px solid var(--gray-200)', color: 'var(--gray-800)', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', background: '#fff' }}>
                Browse All Services ↓
              </a>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ padding: '2.25rem 1rem', background: 'var(--gray-50)', borderTop: '1px solid var(--gray-200)', borderBottom: '1px solid var(--gray-200)' }}>
        <div className="wrap">
          <motion.div
            variants={staggerContainer} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1.5rem', textAlign: 'center' }}
          >
            {STATS.map((s, i) => (
              <motion.div key={i} custom={i} variants={fadeUp}>
                <div style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 800, color: '#F66135', letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--gray-600)', marginTop: '0.2rem', fontWeight: 600 }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STICKY CATEGORY TABS BAR ── */}
      <div 
        id="services-list"
        style={{ 
          position: 'sticky', 
          top: '5rem', 
          zIndex: 40, 
          background: 'rgba(255, 255, 255, 0.92)', 
          backdropFilter: 'blur(16px)', 
          borderBottom: '1px solid var(--gray-200)',
          padding: '0.85rem 1rem'
        }}
      >
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
          <button
            onClick={() => setSelectedCat('all')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '9999px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: selectedCat === 'all' ? 'none' : '1px solid var(--gray-200)',
              background: selectedCat === 'all' ? 'linear-gradient(135deg, #F66135 0%, #FF8F5B 100%)' : '#ffffff',
              color: selectedCat === 'all' ? '#ffffff' : 'var(--gray-700)',
              boxShadow: selectedCat === 'all' ? '0 4px 14px rgba(246, 97, 53, 0.3)' : 'none',
              whiteSpace: 'nowrap',
              transition: 'all 0.25s ease'
            }}
          >
            All Services (25)
          </button>

          {CATEGORIES.map(cat => {
            const isSelected = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '9999px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isSelected ? 'none' : '1px solid var(--gray-200)',
                  background: isSelected ? 'linear-gradient(135deg, #F66135 0%, #FF8F5B 100%)' : '#ffffff',
                  color: isSelected ? '#ffffff' : 'var(--gray-700)',
                  boxShadow: isSelected ? '0 4px 14px rgba(246, 97, 53, 0.3)' : 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.25s ease'
                }}
              >
                {cat.heading} ({cat.services.length})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ALL SERVICES CATEGORIES ── */}
      <div>
        {filteredCategories.map((cat, ci) => (
          <section
            key={cat.id}
            style={{ 
              padding: 'clamp(3.5rem, 6vw, 5rem) 1rem', 
              background: ci % 2 === 0 ? '#ffffff' : 'var(--gray-50)',
              borderBottom: '1px solid var(--gray-100)'
            }}
          >
            <div className="wrap">
              <motion.div 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true, margin: '-50px' }} 
                variants={staggerContainer}
              >

                {/* Category Header with Gradient Pill Demarcation */}
                <motion.div variants={fadeUp} style={{ marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
                    <span 
                      style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: 'linear-gradient(135deg, rgba(246,97,53,0.12) 0%, rgba(255,143,91,0.16) 100%)',
                        border: '1px solid rgba(246,97,53,0.3)',
                        color: '#F66135',
                        padding: '0.35rem 0.95rem',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase'
                      }}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F66135' }} />
                      {cat.heading}
                    </span>
                  </div>

                  <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
                    {cat.heading}
                  </h2>
                  <p style={{ color: 'var(--gray-600)', fontSize: '1rem', maxWidth: '640px' }}>
                    {cat.subtitle}
                  </p>
                </motion.div>

                {/* Services Grid (1 Column on Mobile <640px via media queries) */}
                <div className="services-category-grid">
                  {cat.services.map((svc, si) => {
                    const hasPage = !!SERVICES_DATA[svc.slug];
                    return (
                      <motion.div key={si} custom={si} variants={fadeUp}>
                        <Link
                          to={hasPage ? `/services/${svc.slug}` : '#'}
                          style={{ textDecoration: 'none', display: 'block', height: '100%' }}
                        >
                          <motion.div
                            whileHover={{ 
                              y: -6, 
                              scale: 1.02, 
                              boxShadow: '0 20px 42px rgba(246,97,53,0.15)', 
                              borderColor: 'rgba(246,97,53,0.5)',
                              backgroundColor: '#ffffff'
                            }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                            style={{ 
                              padding: '1.85rem', 
                              background: '#ffffff', 
                              borderRadius: '20px', 
                              border: '1.5px solid var(--gray-200)', 
                              height: '100%', 
                              display: 'flex', 
                              flexDirection: 'column', 
                              justifyContent: 'space-between',
                              gap: '0.85rem', 
                              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '2.2rem', lineHeight: 1 }}>{svc.icon}</div>
                                {hasPage ? (
                                  <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%', 
                                    background: 'rgba(246,97,53,0.1)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    flexShrink: 0 
                                  }}>
                                    <ArrowRight size={16} color="#F66135" />
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gray-400)', background: 'var(--gray-100)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                    Enterprise
                                  </span>
                                )}
                              </div>

                              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0a0a0a', lineHeight: 1.3, marginBottom: '0.5rem' }}>
                                {svc.name}
                              </h3>

                              <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: 1.6 }}>
                                {svc.desc}
                              </p>
                            </div>

                            {hasPage && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#F66135', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.5rem' }}>
                                <span>Learn more & explore stack</span>
                                <ArrowRight size={14} />
                              </div>
                            )}
                          </motion.div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

              </motion.div>
            </div>
          </section>
        ))}
      </div>

      <style>{`
        .services-category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.35rem;
        }
        @media (max-width: 639px) {
          .services-category-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* ── CTA SECTION ── */}
      <section style={{ padding: 'clamp(4rem, 7vw, 6rem) 1rem', background: '#ffffff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '650px', height: '450px', background: 'radial-gradient(ellipse, rgba(246,97,53,0.12) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none' }} />
        
        <div className="wrap" style={{ position: 'relative', zIndex: 10 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ 
              maxWidth: '800px', 
              margin: '0 auto', 
              textAlign: 'center', 
              padding: 'clamp(2.5rem, 5vw, 4rem) 1.5rem', 
              background: 'linear-gradient(135deg, #0a0a0a 0%, #171717 100%)', 
              color: '#ffffff',
              borderRadius: '28px', 
              border: '1.5px solid rgba(255,255,255,0.1)', 
              boxShadow: '0 24px 60px rgba(0,0,0,0.2)' 
            }}
          >
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
              Need a Custom Engineered Solution?
            </h2>
            
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '560px', margin: '0 auto 2rem' }}>
              We partner with start-ups, scale-ups, and enterprise organizations to design bespoke architectures and deliver custom software solutions.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn btn-orange" style={{ borderRadius: '9999px', textDecoration: 'none', padding: '0.875rem 2.25rem', fontWeight: 700 }}>
                Talk to Our Architects
              </Link>
              <Link to="/about" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.875rem 2rem', borderRadius: '9999px', border: '1.5px solid rgba(255,255,255,0.25)', color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', background: 'rgba(255,255,255,0.06)' }}>
                About Enterprenex
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </main>
  );
}
