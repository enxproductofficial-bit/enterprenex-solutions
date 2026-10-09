import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  Globe,
  Smartphone,
  Brain,
  Cpu,
  Cloud,
  Layout,
  Wrench,
  Boxes,
  ToggleLeft,
  ToggleRight,
  Clock
} from 'lucide-react';
import type { ServiceCatalogueItem } from '../types';

export const ServicesManagePage: React.FC = () => {
  const { services, addService, updateService, toggleServiceActive, deleteService } = useAdmin();
  const [selectedService, setSelectedService] = useState<ServiceCatalogueItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [pricingModel, setPricingModel] = useState<'Fixed' | 'Hourly' | 'Retainer' | 'Milestone'>('Fixed');
  const [startingPrice, setStartingPrice] = useState(150000);
  const [typicalTimeline, setTypicalTimeline] = useState('4 - 8 Weeks');
  const [techInput, setTechInput] = useState('React, TypeScript, Node.js');
  const [featuresInput, setFeaturesInput] = useState('Custom Architecture\nSEO Optimized\nCloud Deployment');

  const getServiceIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'web development': return Globe;
      case 'mobile app development': return Smartphone;
      case 'saas development': return Layers;
      case 'ai/ml solutions': return Brain;
      case 'iot solutions': return Cpu;
      case 'cloud & devops': return Cloud;
      case 'ui/ux':
      case 'ui/ux design': return Layout;
      case 'software maintenance & support':
      case 'software maintenance': return Wrench;
      default: return Boxes;
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addService({
      name,
      category,
      shortDesc,
      fullDesc,
      pricingModel,
      startingPrice: Number(startingPrice),
      typicalTimeline,
      technologies: techInput.split(',').map(s => s.trim()).filter(Boolean),
      features: featuresInput.split('\n').map(s => s.trim()).filter(Boolean),
      active: true,
      iconName: 'Boxes'
    });
    setShowAddModal(false);
    setName('');
    setShortDesc('');
    setFullDesc('');
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    updateService(selectedService.id, {
      name,
      category,
      shortDesc,
      fullDesc,
      pricingModel,
      startingPrice: Number(startingPrice),
      typicalTimeline,
      technologies: techInput.split(',').map(s => s.trim()).filter(Boolean),
      features: featuresInput.split('\n').map(s => s.trim()).filter(Boolean)
    });
    setIsEditing(false);
    setSelectedService(null);
  };

  const openEditModal = (svc: ServiceCatalogueItem) => {
    setSelectedService(svc);
    setName(svc.name);
    setCategory(svc.category);
    setShortDesc(svc.shortDesc);
    setFullDesc(svc.fullDesc);
    setPricingModel(svc.pricingModel);
    setStartingPrice(svc.startingPrice);
    setTypicalTimeline(svc.typicalTimeline);
    setTechInput(svc.technologies.join(', '));
    setFeaturesInput(svc.features.join('\n'));
    setIsEditing(true);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <h1>Enterprise Services Catalogue</h1>
          <p>Manage corporate technical offerings, baseline pricing structures, deliverables & technologies</p>
        </div>
        <div className="adm-page-actions">
          <button className="adm-btn adm-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Add New Offering</span>
          </button>
        </div>
      </div>

      {/* Services Grid (3 columns) */}
      <div className="adm-grid-3">
        {services.map(svc => {
          const Icon = getServiceIcon(svc.name);

          return (
            <div
              key={svc.id}
              className="adm-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                opacity: svc.active ? 1 : 0.6,
                border: svc.active ? '1px solid var(--adm-border)' : '1px dashed var(--adm-border)'
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--adm-primary-soft)', border: '1px solid var(--adm-primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--adm-primary)' }}>
                  <Icon size={24} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => toggleServiceActive(svc.id)}
                    title={svc.active ? 'Disable Service' : 'Activate Service'}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: svc.active ? 'var(--adm-success)' : 'var(--adm-text-dim)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 600
                    }}
                  >
                    {svc.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    <span>{svc.active ? 'Active' : 'Draft'}</span>
                  </button>
                </div>
              </div>

              {/* Title & Category */}
              <div style={{ marginBottom: '0.75rem' }}>
                <span className="adm-badge adm-badge-neutral" style={{ fontSize: '0.68rem', marginBottom: '4px' }}>{svc.category}</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>{svc.name}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--adm-text-muted)', lineHeight: 1.5 }}>
                  {svc.shortDesc}
                </p>
              </div>

              {/* Pricing & Timeline Badges */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--adm-bg)', padding: '0.65rem 0.85rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--adm-border)' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase' }}>Starting Rate</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--adm-primary)' }}>
                    ₹{svc.startingPrice.toLocaleString('en-IN')}
                    <span style={{ fontSize: '0.7rem', color: 'var(--adm-text-muted)', fontWeight: 500 }}> ({svc.pricingModel})</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase' }}>Est. Delivery</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={12} color="var(--adm-text-dim)" />
                    {svc.typicalTimeline}
                  </div>
                </div>
              </div>

              {/* Key Deliverables & Features */}
              <div style={{ marginBottom: '1rem', flex: 1 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                  Included Core Features:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {svc.features.slice(0, 4).map((f, idx) => (
                    <div key={idx} style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} color="var(--adm-success)" style={{ flexShrink: 0 }} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack Pills */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {svc.technologies.slice(0, 4).map((t, idx) => (
                    <span key={idx} className="adm-badge adm-badge-neutral" style={{ fontSize: '0.68rem' }}>{t}</span>
                  ))}
                  {svc.technologies.length > 4 && (
                    <span className="adm-badge adm-badge-neutral" style={{ fontSize: '0.68rem' }}>+{svc.technologies.length - 4}</span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--adm-border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--adm-text-dim)' }}>
                  {svc.leadsCount} Total Inquiries
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="adm-btn adm-btn-sm adm-btn-secondary" onClick={() => openEditModal(svc)}>
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => deleteService(svc.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      {(showAddModal || isEditing) && (
        <div className="adm-modal-overlay" onClick={() => { setShowAddModal(false); setIsEditing(false); }}>
          <div className="adm-modal-content adm-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                {isEditing ? `Edit Service: ${selectedService?.name}` : 'Create New Service Offering'}
              </h3>
            </div>

            <form onSubmit={isEditing ? handleUpdateSubmit : handleCreateSubmit}>
              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Service Title *</label>
                  <input className="adm-input" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. AI Pathology & Document OCR" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Category</label>
                  <select className="adm-select" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="Engineering">Engineering</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Product">Product & SaaS</option>
                    <option value="Infrastructure">Infrastructure & Cloud</option>
                    <option value="Design">Design & UI/UX</option>
                    <option value="Support">Support & SLA</option>
                  </select>
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">One-line Short Tagline *</label>
                <input className="adm-input" required value={shortDesc} onChange={e => setShortDesc(e.target.value)} placeholder="Summary shown on cards and proposals..." />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Detailed Scope of Capability</label>
                <textarea className="adm-textarea" value={fullDesc} onChange={e => setFullDesc(e.target.value)} placeholder="Full architectural details and client benefits..." />
              </div>

              <div className="adm-grid-3">
                <div className="adm-form-group">
                  <label className="adm-form-label">Pricing Model</label>
                  <select className="adm-select" value={pricingModel} onChange={e => setPricingModel(e.target.value as any)}>
                    <option value="Fixed">Fixed Scope</option>
                    <option value="Milestone">Milestone Based</option>
                    <option value="Retainer">Monthly Retainer</option>
                    <option value="Hourly">Hourly T&M</option>
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Starting Price (₹)</label>
                  <input className="adm-input" type="number" required value={startingPrice} onChange={e => setStartingPrice(Number(e.target.value))} />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Typical Delivery Timeline</label>
                  <input className="adm-input" value={typicalTimeline} onChange={e => setTypicalTimeline(e.target.value)} placeholder="e.g. 4 - 8 Weeks" />
                </div>
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Technology Stack (Comma separated)</label>
                  <input className="adm-input" value={techInput} onChange={e => setTechInput(e.target.value)} placeholder="React, TypeScript, Node.js, AWS" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Key Features / Deliverables (One per line)</label>
                  <textarea className="adm-textarea" value={featuresInput} onChange={e => setFeaturesInput(e.target.value)} placeholder="Custom Microservices&#10;Security Hardening&#10;CI/CD Pipeline" />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => { setShowAddModal(false); setIsEditing(false); }}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">{isEditing ? 'Save Changes' : 'Create Offering'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
