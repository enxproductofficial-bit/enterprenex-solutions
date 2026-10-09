import { motion } from 'framer-motion';

const AWARDS = [
  { icon: '🏆', title: 'Clutch Global Leader',     sub: '2024 · Top IT Services' },
  { icon: '⭐', title: 'G2 Top Rated',              sub: 'IT Services & Outsourcing' },
  { icon: '📈', title: 'Inc. 5000',                 sub: 'Fastest Growing Companies' },
  { icon: '❤️', title: 'Great Place to Work',       sub: 'Certified 2023–2024' },
  { icon: '💼', title: 'Glassdoor Top Employer',    sub: '4.6★ Employee Rating' },
];

export default function AwardsSection() {
  return (
    <section className="awards-section" id="awards" aria-labelledby="awards-h2">
      <div className="wrap">
        <motion.div 
          className="awards-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="t-overline section-eyebrow">Recognition</p>
          <h2 id="awards-h2">
            Our global visibility<span className="dot">.</span>
          </h2>
        </motion.div>
        <motion.div 
          className="awards-flex"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
        >
          {AWARDS.map(a => (
            <motion.div 
              key={a.title} 
              className="award-badge"
              variants={{
                hidden: { opacity: 0, scale: 0.9, y: 20 },
                visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } }
              }}
              whileHover={{ scale: 1.08, y: -6 }}
              transition={{ type: 'spring', stiffness: 350, damping: 18 }}
            >
              <motion.span 
                className="award-badge__icon" 
                aria-hidden="true"
                whileHover={{ rotate: [0, -15, 15, 0] }}
              >
                {a.icon}
              </motion.span>
              <div className="award-badge__text">
                <strong>{a.title}</strong>
                <span>{a.sub}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

