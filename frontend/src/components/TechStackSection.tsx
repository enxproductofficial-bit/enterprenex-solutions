import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['All', 'Frontend', 'Backend', 'Cloud & DevOps', 'AI & Data', 'Mobile'];

interface TechItem {
  name: string;
  category: string;
  icon: string;
}

const TECH_ITEMS: TechItem[] = [
  { name: 'React', category: 'Frontend', icon: '⚛️' },
  { name: 'TypeScript', category: 'Frontend', icon: '📘' },
  { name: 'Vue.js', category: 'Frontend', icon: '🟢' },
  { name: 'Angular', category: 'Frontend', icon: '🅰️' },
  { name: 'Node.js', category: 'Backend', icon: '🟢' },
  { name: 'Python', category: 'Backend', icon: '🐍' },
  { name: 'Java', category: 'Backend', icon: '☕' },
  { name: '.NET', category: 'Backend', icon: '🔷' },
  { name: 'Golang', category: 'Backend', icon: '🐹' },
  { name: 'Django', category: 'Backend', icon: '🎸' },
  { name: 'PHP', category: 'Backend', icon: '🐘' },
  { name: 'Ruby', category: 'Backend', icon: '💎' },
  { name: 'C#', category: 'Backend', icon: '⚡' },
  { name: 'C++', category: 'Backend', icon: '⚙️' },
  { name: 'Scala', category: 'Backend', icon: '🔴' },
  { name: 'AWS', category: 'Cloud & DevOps', icon: '☁️' },
  { name: 'Google Cloud', category: 'Cloud & DevOps', icon: '🌐' },
  { name: 'Microsoft Azure', category: 'Cloud & DevOps', icon: '🔷' },
  { name: 'Kubernetes', category: 'Cloud & DevOps', icon: '☸️' },
  { name: 'Docker', category: 'Cloud & DevOps', icon: '🐳' },
  { name: 'Terraform', category: 'Cloud & DevOps', icon: '🏗️' },
  { name: 'Jenkins', category: 'Cloud & DevOps', icon: '👨‍✈️' },
  { name: 'AI & ML', category: 'AI & Data', icon: '🤖' },
  { name: 'Machine Learning', category: 'AI & Data', icon: '🧠' },
  { name: 'Spark', category: 'AI & Data', icon: '⚡' },
  { name: 'Power BI', category: 'AI & Data', icon: '📊' },
  { name: 'GraphQL', category: 'Backend', icon: '🕸️' },
  { name: 'PostgreSQL', category: 'Backend', icon: '🐘' },
  { name: 'MongoDB', category: 'Backend', icon: '🍃' },
  { name: 'Redis', category: 'Backend', icon: '🔴' },
  { name: 'React Native', category: 'Mobile', icon: '📱' },
  { name: 'Flutter', category: 'Mobile', icon: '💙' },
  { name: 'Swift', category: 'Mobile', icon: '🍎' },
  { name: 'Kotlin', category: 'Mobile', icon: '🎯' },
  { name: 'Salesforce', category: 'Cloud & DevOps', icon: '☁️' },
];

const ALL_NAMES = TECH_ITEMS.map(t => t.name);
const doubled = [...ALL_NAMES, ...ALL_NAMES];
const doubledReverse = [...ALL_NAMES].reverse().concat([...ALL_NAMES].reverse());

const badgeContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

const badgeItemVariants: any = {
  hidden: { opacity: 0, scale: 0.8, y: 15 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -10,
    transition: { duration: 0.2 },
  },
};

export default function TechStackSection() {
  const [activeTab, setActiveTab] = useState('All');

  const filteredTechs = activeTab === 'All'
    ? TECH_ITEMS
    : TECH_ITEMS.filter(t => t.category === activeTab);

  return (
    <section className="tech-section" id="technologies" aria-label="Technologies we cover">
      <div className="wrap">
        <motion.p 
          className="tech-label"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          The best vetted AI-leading tools you can rely on:
        </motion.p>

        {/* Category Filter Tabs */}
        <motion.div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '2rem',
          }}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {CATEGORIES.map(category => {
            const isActive = activeTab === category;
            return (
              <motion.button
                key={category}
                onClick={() => setActiveTab(category)}
                style={{
                  position: 'relative',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : '#666666',
                  background: isActive ? '#F66135' : '#ffffff',
                  border: isActive ? '1px solid #F66135' : '1px solid #e8e8e8',
                  boxShadow: isActive ? '0 4px 14px rgba(246, 97, 53, 0.35)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Staggered Vibrant Pill Badges */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={badgeContainerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.75rem',
              maxWidth: '960px',
              margin: '0 auto 2.5rem',
              minHeight: '120px',
            }}
          >
            {filteredTechs.map(tech => (
              <motion.span
                key={tech.name}
                variants={badgeItemVariants}
                whileHover={{ 
                  scale: 1.08, 
                  y: -3,
                  backgroundColor: '#FFF3EF', 
                  color: '#F66135', 
                  borderColor: '#F66135',
                  boxShadow: '0 8px 20px rgba(246, 97, 53, 0.25)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 1.25rem',
                  border: '1px solid #e8e8e8',
                  borderRadius: '9999px',
                  background: '#ffffff',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: '#333333',
                  cursor: 'pointer',
                  userSelect: 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <span style={{ fontSize: '1rem' }}>{tech.icon}</span>
                <span>{tech.name}</span>
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Infinite Marquee Rows */}
      <div style={{ marginTop: '1rem' }}>
        {/* Row 1 — left scroll */}
        <div className="ticker-wrap" aria-hidden="true">
          <div className="ticker">
            {doubled.map((t, i) => (
              <motion.span 
                key={`a${i}`} 
                className="ticker-tag"
                whileHover={{ scale: 1.08, backgroundColor: '#FFF3EF', color: '#F66135', borderColor: '#F66135' }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              >
                {t}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Row 2 — right scroll */}
        <div className="ticker-wrap" aria-hidden="true">
          <div className="ticker reverse">
            {doubledReverse.map((t, i) => (
              <motion.span 
                key={`b${i}`} 
                className="ticker-tag"
                whileHover={{ scale: 1.08, backgroundColor: '#FFF3EF', color: '#F66135', borderColor: '#F66135' }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              >
                {t}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      <motion.div 
        style={{ textAlign: 'center', marginTop: '2.5rem' }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <motion.a 
          href="#contact" 
          className="btn btn-orange" 
          id="tech-cta"
          whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(246, 97, 53, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          Hire a Developer
        </motion.a>
      </motion.div>
    </section>
  );
}


