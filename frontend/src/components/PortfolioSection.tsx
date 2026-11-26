import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Layers,
  Database,
  Lock,
  Cpu,
  BarChart3,
  Sparkles,
  Zap
} from 'lucide-react';

interface PlatformProject {
  id: string;
  name: string;
  tagline: string;
  category: string;
  badge: string;
  icon: any;
  accentColor: string;
  gradientBg: string;
  borderColor: string;
  overview: string;
  businessValue: {
    metric: string;
    label: string;
    detail: string;
  }[];
  keyCapabilities: string[];
  techStack: string[];
  deploymentStatus: string;
}

const PLATFORMS: PlatformProject[] = [
  {
    id: 'enx-money',
    name: 'ENX Money',
    tagline: 'Financial & Corporate Treasury Platform',
    category: 'FinTech & Institutional Finance',
    badge: 'Bank-Grade Resilience',
    icon: TrendingUp,
    accentColor: '#1070C8',
    gradientBg: 'linear-gradient(135deg, rgba(16, 112, 200, 0.08) 0%, rgba(2, 132, 199, 0.04) 100%)',
    borderColor: 'rgba(16, 112, 200, 0.25)',
    overview:
      'An institutional financial management and corporate treasury engine engineered for real-time liquidity oversight, multi-entity ledger reconciliation, encrypted transaction routing, and automated fiscal compliance.',
    businessValue: [
      {
        metric: '99.999%',
        label: 'Ledger Audit Integrity',
        detail: 'Cryptographic double-entry ledger eliminates transaction slippage and ledger mismatch.'
      },
      {
        metric: '65% Faster',
        label: 'Reconciliation Velocity',
        detail: 'Automated multi-bank statement ingestion and algorithmic invoice settlement pipelines.'
      },
      {
        metric: 'Zero-Risk',
        label: 'Board Governance',
        detail: 'Real-time cash positioning, automated GST/tax audit readiness, and anomaly telemetry.'
      }
    ],
    keyCapabilities: [
      'Multi-Entity Ledger & Account Reconciliation',
      'Real-Time Cash Flow & Liquidity Telemetry',
      'Bank-Grade AES-256 & TLS 1.3 Encryption',
      'Statutory Tax & GST Invoice Generation',
      'Automated Remittance & Vendor Routing',
      'Granular Role-Based Treasury Access Controls'
    ],
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Banking APIs'],
    deploymentStatus: 'Enterprise Production Ready'
  },
  {
    id: 'ewms',
    name: 'EWMS',
    tagline: 'Enterprise Workforce Management System',
    category: 'Enterprise Operations & HR ERP',
    badge: 'Flagship Operations Suite',
    icon: Users,
    accentColor: '#059669',
    gradientBg: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)',
    borderColor: 'rgba(5, 150, 105, 0.25)',
    overview:
      'A unified workforce operations and governance suite that orchestrates engineering shift telemetry, sprint deliverables, client contracts, and WhatsApp-encrypted executive dispatch across organizations.',
    businessValue: [
      {
        metric: '100% Unified',
        label: 'Single-Pane Operations',
        detail: 'Consolidates workforce HR, sprint Kanban, client invoicing, and statutory vault in one hub.'
      },
      {
        metric: '40% Boost',
        label: 'Deliverable Velocity',
        detail: 'Milestone-based project management with real-time technical personnel capacity tracking.'
      },
      {
        metric: 'OWASP ASVS',
        label: 'Security & Access Control',
        detail: 'Argon2id password hashing, sliding-window rate limiting, and brute-force lockout defenses.'
      }
    ],
    keyCapabilities: [
      'Engineering Workforce Shift & Capacity Telemetry',
      'Milestone-Driven Sprint Backlog & Kanban Suite',
      'Multi-Role Governance (Super Admin / PM / Squad)',
      'Statutory Vault for ISO Compliance & Legal Documents',
      'Automated Encrypted WhatsApp Meeting Dispatch',
      'Integrated Corporate Calendar & Holiday Synchronization'
    ],
    techStack: ['React', 'TypeScript', 'Express', 'Prisma', 'PostgreSQL (Neon)', 'Argon2id', 'Socket.IO'],
    deploymentStatus: 'Live Production Governance'
  },
  {
    id: 'granthsetu',
    name: 'GranthSetu',
    tagline: 'Smart Library & Study Centre Platform',
    category: 'EdTech & Smart Facility SaaS',
    badge: 'Automated Facility Tech',
    icon: BookOpen,
    accentColor: '#d97706',
    gradientBg: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(245, 158, 11, 0.04) 100%)',
    borderColor: 'rgba(217, 119, 6, 0.25)',
    overview:
      'A next-generation facility and access orchestration platform built for educational institutions, modern reading spaces, and community study centres. Automates student entry, desk allocation, and recurring membership billing.',
    businessValue: [
      {
        metric: '100% Automated',
        label: 'Desk & Shift Scheduling',
        detail: 'Eliminates front-desk manual logging, desk disputes, and registration bottlenecks.'
      },
      {
        metric: '3x Revenue',
        label: 'Facility Monetization',
        detail: 'Flexible multi-shift seat tiers (Morning, Evening, Full-Day, Reserved Private Cabins).'
      },
      {
        metric: 'Real-Time',
        label: 'Access & Parent Telemetry',
        detail: 'RFID / QR student check-in triggers instant security logging and parent notifications.'
      }
    ],
    keyCapabilities: [
      'Interactive Dynamic Seat & Shift Allocation Matrix',
      'Contactless Student RFID & QR Check-In Gateways',
      'Automated Subscription Renewals & UPI Payment Gateway',
      'Digital Book Cataloging, Circulation & Fine Pipelines',
      'Live Facility Occupancy & Heatmap Dashboard',
      'SMS & WhatsApp Automated Inactivity / Alert Notifications'
    ],
    techStack: ['React', 'Node.js', 'PostgreSQL', 'WebSockets', 'UPI Gateway', 'WhatsApp Cloud API'],
    deploymentStatus: 'Live Commercial Deployments'
  }
];

export default function PortfolioSection() {
  const [selectedId, setSelectedId] = useState<string>('enx-money');
  const activePlatform = PLATFORMS.find(p => p.id === selectedId) || PLATFORMS[0];

  return (
    <section className="section portfolio-showcase" id="portfolio" aria-labelledby="portfolio-h2">
      <div className="wrap">
        {/* Section Header */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <span
              className="t-overline section-eyebrow"
              style={{
                background: 'rgba(16, 112, 200, 0.08)',
                color: '#1070C8',
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                fontWeight: 700,
                border: '1px solid rgba(16, 112, 200, 0.2)'
              }}
            >
              1.3 Portfolio & Real Projects Showcase
            </span>
          </div>
          <h2 id="portfolio-h2" className="section-h2" style={{ marginTop: '0.5rem' }}>
            Actual Company Platforms Engineered for Scale<span className="dot">.</span>
            <br />
            <span style={{ color: '#6b7280', fontWeight: 400, fontSize: 'clamp(1.15rem, 1.8vw, 1.6rem)' }}>
              Proven production systems delivering measurable business value
            </span>
          </h2>
        </motion.div>

        {/* Platform Selector Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            margin: '2rem 0 2.5rem 0'
          }}
        >
          {PLATFORMS.map(platform => {
            const isSelected = platform.id === selectedId;
            const Icon = platform.icon;
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => setSelectedId(platform.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.75rem 1.4rem',
                  borderRadius: '12px',
                  border: isSelected ? `2px solid ${platform.accentColor}` : '1px solid #e5e7eb',
                  background: isSelected ? platform.gradientBg : '#ffffff',
                  color: isSelected ? platform.accentColor : '#4b5563',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: isSelected
                    ? `0 8px 24px ${platform.accentColor}25`
                    : '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'all 0.25s ease'
                }}
              >
                <Icon size={18} color={isSelected ? platform.accentColor : '#6b7280'} />
                <span>{platform.name}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '8px',
                    background: isSelected ? '#ffffff' : '#f3f4f6',
                    color: isSelected ? platform.accentColor : '#6b7280',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                >
                  {platform.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Platform Showcase Hero Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePlatform.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              background: '#ffffff',
              border: `1px solid ${activePlatform.borderColor}`,
              borderRadius: '20px',
              padding: 'clamp(1.5rem, 3vw, 2.75rem)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.06)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Ambient Background Gradient Glow */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '320px',
                height: '320px',
                background: `radial-gradient(circle, ${activePlatform.accentColor}12 0%, transparent 70%)`,
                pointerEvents: 'none',
                zIndex: 0
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Header Meta */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  borderBottom: '1px solid #f3f4f6',
                  paddingBottom: '1.5rem',
                  marginBottom: '1.75rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: activePlatform.accentColor,
                        background: `${activePlatform.accentColor}14`,
                        padding: '0.2rem 0.65rem',
                        borderRadius: '6px'
                      }}
                    >
                      {activePlatform.category}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#059669',
                        background: 'rgba(5, 150, 105, 0.1)',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckCircle2 size={12} /> {activePlatform.deploymentStatus}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 'clamp(1.6rem, 2.4vw, 2.2rem)', fontWeight: 900, color: '#111827', margin: '0 0 0.4rem 0' }}>
                    {activePlatform.name}
                  </h3>
                  <p style={{ fontSize: '1.05rem', color: '#4b5563', margin: 0, fontWeight: 500 }}>
                    {activePlatform.tagline}
                  </p>
                </div>

                <Link
                  to="/contact"
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.35rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.88rem'
                  }}
                >
                  <span>Request Custom Quote & Demo</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

              {/* Overview Paragraph */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Platform Overview
                </h4>
                <p style={{ fontSize: '1.02rem', lineHeight: 1.7, color: '#374151', margin: 0 }}>
                  {activePlatform.overview}
                </p>
              </div>

              {/* 3 Business Value KPI Metric Cards */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
                  Quantified Business Value
                </h4>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.25rem'
                  }}
                >
                  {activePlatform.businessValue.map((bv, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '14px',
                        padding: '1.4rem',
                        transition: 'transform 0.2s ease, border-color 0.2s ease'
                      }}
                    >
                      <div
                        style={{
                          fontSize: '1.85rem',
                          fontWeight: 900,
                          color: activePlatform.accentColor,
                          lineHeight: 1.1,
                          marginBottom: '0.35rem'
                        }}
                      >
                        {bv.metric}
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>
                        {bv.label}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.5 }}>
                        {bv.detail}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Two Column Layout: Key Capabilities & Architecture */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '2rem',
                  borderTop: '1px solid #f3f4f6',
                  paddingTop: '2rem'
                }}
              >
                {/* Left: Key Capabilities */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={14} color={activePlatform.accentColor} /> Key Capabilities
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {activePlatform.keyCapabilities.map((cap, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem', color: '#374151', lineHeight: 1.5 }}>
                        <CheckCircle2 size={16} color={activePlatform.accentColor} style={{ flexShrink: 0, marginTop: '3px' }} />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: Architecture & Tech Stack */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Layers size={14} color={activePlatform.accentColor} /> Production Technology Stack
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {activePlatform.techStack.map((tech, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          background: '#ffffff',
                          color: '#1f2937',
                          border: '1px solid #d1d5db',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Architecture Guarantee Badge */}
                  <div
                    style={{
                      background: 'rgba(16, 112, 200, 0.05)',
                      border: '1px solid rgba(16, 112, 200, 0.15)',
                      borderRadius: '12px',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                  >
                    <ShieldCheck size={24} color="#1070C8" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.4 }}>
                      <strong>Enterprise Architecture SLA:</strong> Engineered with zero-trust security, encrypted audit logs, and microservices architecture.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 1.4 Lead Generation & Quotation Enquiries Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{
            marginTop: '3.5rem',
            background: 'linear-gradient(135deg, #0d233a 0%, #081320 100%)',
            borderRadius: '20px',
            padding: 'clamp(2rem, 3.5vw, 3rem)',
            color: '#ffffff',
            boxShadow: '0 16px 48px rgba(13, 35, 58, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem'
          }}
        >
          <div style={{ flex: '1', minWidth: '300px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.15)',
                padding: '0.25rem 0.75rem',
                borderRadius: '6px',
                display: 'inline-block',
                marginBottom: '0.75rem'
              }}
            >
              1.4 Lead Generation & Quotation Enquiries
            </span>
            <h3 style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.9rem)', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#ffffff' }}>
              Need a Custom Platform or Enterprise Software Architecture?
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', margin: 0, lineHeight: 1.6, maxWidth: '640px' }}>
              Whether you require a custom financial engine like <strong>ENX Money</strong>, an operational suite like <strong>EWMS</strong>, or a smart facility SaaS like <strong>GranthSetu</strong>, our senior engineering squad delivers fully tailored, SLA-backed solutions.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link
              to="/contact"
              className="btn btn-primary"
              style={{
                borderRadius: '12px',
                padding: '0.85rem 1.6rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 24px rgba(16, 112, 200, 0.4)'
              }}
            >
              <span>Submit Quotation Request</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              style={{
                borderRadius: '12px',
                padding: '0.85rem 1.4rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                background: 'rgba(255, 255, 255, 0.05)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>Book Discovery Call</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
