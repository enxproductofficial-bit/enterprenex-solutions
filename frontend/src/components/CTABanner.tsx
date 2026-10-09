import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function CTABanner() {
  return (
    <section className="cta-banner" id="contact" aria-labelledby="cta-h2">
      {/* Animated Radiant Gradient Background Glow & Aurora Motion */}
      <div className="cta-banner__aurora-wrapper" aria-hidden="true">
        <motion.div 
          className="cta-aurora cta-aurora--1"
          animate={{
            x: [-20, 30, -20],
            y: [-10, 20, -10],
            scale: [1, 1.25, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        />
        <motion.div 
          className="cta-aurora cta-aurora--2"
          animate={{
            x: [30, -20, 30],
            y: [20, -15, 20],
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div 
          className="cta-aurora cta-aurora--3"
          animate={{
            x: [0, -30, 0],
            y: [15, -20, 15],
            scale: [0.9, 1.15, 0.9],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div className="wrap" style={{ position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <motion.p 
            className="cta-banner__tag"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            🚀 START YOUR ENGAGEMENT TODAY
          </motion.p>

          <h2 id="cta-h2">Ready to accelerate your roadmap?</h2>

          <p>
            Join 500+ companies that trust us with their most critical engineering initiatives.
            Schedule a no-commitment discovery call today.
          </p>

          <div className="cta-buttons">
            {/* Magnetic Button 1: Primary White CTA */}
            <Link 
              to="/contact" 
              className="btn btn-white btn-cta-magnetic" 
              id="cta-btn"
            >
              <span>Schedule a Call</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
              </svg>
            </Link>

            {/* Magnetic Button 2: Secondary Outline CTA */}
            <Link 
              to="/services" 
              className="btn btn-outline-white btn-cta-magnetic-secondary"
            >
              <span>View All Services</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
