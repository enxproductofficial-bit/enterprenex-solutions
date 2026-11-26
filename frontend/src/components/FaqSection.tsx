import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export const OFFICIAL_COMPANY_FAQS: FaqItem[] = [
  {
    question: 'What services does Enterprenex Solutions provide?',
    answer: 'Enterprenex Solutions provides full-lifecycle enterprise technology services, including custom software engineering, Artificial Intelligence & Machine Learning development, web application engineering, native iOS/Android mobile app development, custom ERP & CRM systems, cloud DevOps infrastructure, and dedicated IT staff augmentation.',
    category: 'Services'
  },
  {
    question: 'Does the company develop custom software?',
    answer: 'Yes. We engineer bespoke, tailor-made software solutions specifically designed to solve complex business bottlenecks. Every platform is architected from the ground up with scalable microservices, bank-grade encryption, role-based access control (RBAC), and high-throughput databases.',
    category: 'Engineering'
  },
  {
    question: 'Does the company provide AI and Machine Learning solutions?',
    answer: 'Yes. We design and deploy intelligent AI systems, autonomous AI agents, multi-modal copilots, natural language processing (NLP) pipelines, computer vision algorithms, and Retrieval-Augmented Generation (RAG) vector search workflows using OpenAI, Claude, Gemini, LangChain, and Python.',
    category: 'Artificial Intelligence'
  },
  {
    question: 'Does the company develop mobile applications?',
    answer: 'Yes. Enterprenex Solutions develops native and cross-platform mobile applications for iOS and Android. Our mobile apps adhere to platform design standards, zero-lag performance, offline-first syncing, and biometric hardware authentication.',
    category: 'Mobile'
  },
  {
    question: 'What industries does Enterprenex Solutions serve?',
    answer: 'We serve diverse industries including Banking & FinTech, Enterprise Workforce Management, Hospitality & Dining, Educational Institutions & Libraries, Healthcare & Pharmaceuticals, Logistics & Supply Chain, and High-Growth SaaS Startups.',
    category: 'Industries'
  },
  {
    question: 'How can customers start a project with Enterprenex Solutions?',
    answer: 'Starting a project is streamlined into 3 simple steps: 1) Initial discovery consultation to map your technical requirements, 2) Milestone scoping and architecture proposal, and 3) Agile sprint onboarding with dedicated engineering teams and transparent weekly demonstrations.',
    category: 'Process'
  },
  {
    question: 'How can customers request a quotation or project estimate?',
    answer: 'You can request a free consultation and project quote by filling out our online inquiry form on our Contact Page, emailing our architecture board at contact@enterprenex.solutions, or instantly connecting with our solutions team via WhatsApp at +91-9226860060. We provide detailed estimates within 24 business hours.',
    category: 'Sales'
  }
];

/**
 * Returns Schema.org FAQPage structured data for Google & AI search engines
 */
export const getFaqPageJsonLd = (faqs: FaqItem[] = OFFICIAL_COMPANY_FAQS) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
});

export default function FaqSection({ faqs = OFFICIAL_COMPANY_FAQS }: { faqs?: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section" id="faq" style={{ padding: '6rem 1.5rem', background: 'var(--bg-secondary, #070b14)', position: 'relative' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              background: 'rgba(16, 112, 200, 0.1)',
              border: '1px solid rgba(16, 112, 200, 0.3)',
              color: 'var(--primary, #1070C8)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            <HelpCircle size={15} />
            <span>Answer Engine Optimization • Frequently Asked Questions</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.25,
              marginBottom: '1rem'
            }}
          >
            Everything You Need to Know About <span style={{ color: 'var(--primary, #1070C8)' }}>Enterprenex</span>
          </h2>

          <p
            style={{
              fontSize: '1rem',
              color: '#94a3b8',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6
            }}
          >
            Clear answers to common questions about our custom software development, AI solutions, industry expertise, and project engagement models.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={faq.question}
                style={{
                  background: isOpen ? 'rgba(15, 23, 42, 0.85)' : 'rgba(15, 23, 42, 0.45)',
                  border: isOpen ? '1px solid rgba(16, 112, 200, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'border-color 0.25s, background-color 0.25s',
                  boxShadow: isOpen ? '0 10px 25px -5px rgba(0, 0, 0, 0.3)' : 'none'
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                  style={{
                    width: '100%',
                    padding: '1.35rem 1.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#ffffff'
                  }}
                >
                  <span
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      lineHeight: 1.4,
                      color: isOpen ? '#60a5fa' : '#f1f5f9'
                    }}
                  >
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      flexShrink: 0,
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isOpen ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isOpen ? '#60a5fa' : '#94a3b8'
                    }}
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div
                        style={{
                          padding: '0 1.75rem 1.5rem 1.75rem',
                          color: '#cbd5e1',
                          fontSize: '0.96rem',
                          lineHeight: 1.65,
                          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                          paddingTop: '1rem'
                        }}
                      >
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Box */}
        <div
          style={{
            marginTop: '3.5rem',
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(16, 112, 200, 0.15) 0%, rgba(30, 41, 59, 0.4) 100%)',
            border: '1px solid rgba(16, 112, 200, 0.25)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
              Have a specific technical question or custom RFP?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: 0 }}>
              Speak directly with our senior software architects for a confidential project evaluation.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.4rem',
                borderRadius: '8px',
                background: 'var(--primary, #1070C8)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none'
              }}
            >
              <span>Request Quotation</span>
              <ArrowRight size={16} />
            </Link>

            <a
              href="https://wa.me/919226860060?text=Hello%20Enterprenex%20Solutions%2C%20I%20have%20an%20inquiry%20regarding%20a%20software%20project."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.4rem',
                borderRadius: '8px',
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                color: '#4ade80',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none'
              }}
            >
              <MessageSquare size={16} />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
