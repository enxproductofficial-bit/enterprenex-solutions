import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Globe,
  Plus,
  Save,
  Star,
  Sliders
} from 'lucide-react';

export const CmsPage: React.FC = () => {
  const { cms, updateCms, updateEnquiryStatus } = useAdmin();
  const [tab, setTab] = useState<'hero' | 'portfolio' | 'blog' | 'testimonials' | 'faqs' | 'enquiries' | 'seo'>('hero');

  // Hero state
  const [heroHeading, setHeroHeading] = useState(cms.hero.heading);
  const [heroBadge, setHeroBadge] = useState(cms.hero.badge);
  const [heroSub, setHeroSub] = useState(cms.hero.subheading);
  const [heroCta1, setHeroCta1] = useState(cms.hero.ctaPrimary);
  const [heroCta2, setHeroCta2] = useState(cms.hero.ctaSecondary);

  // SEO state
  const [seoTitle, setSeoTitle] = useState(cms.seo.metaTitle);
  const [seoDesc, setSeoDesc] = useState(cms.seo.metaDescription);
  const [seoKeywords, setSeoKeywords] = useState(cms.seo.keywords);

  // New Blog form state
  const [showAddBlog, setShowAddBlog] = useState(false);
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogCat, setNewBlogCat] = useState('Engineering');
  const [newBlogExcerpt, setNewBlogExcerpt] = useState('');

  // New Case Study state
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [newPortTitle, setNewPortTitle] = useState('');
  const [newPortMetric, setNewPortMetric] = useState('');
  const [newPortDesc, setNewPortDesc] = useState('');

  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    updateCms({
      hero: {
        heading: heroHeading,
        badge: heroBadge,
        subheading: heroSub,
        ctaPrimary: heroCta1,
        ctaSecondary: heroCta2
      }
    });
  };

  const handleSaveSeo = (e: React.FormEvent) => {
    e.preventDefault();
    updateCms({
      seo: {
        ...cms.seo,
        metaTitle: seoTitle,
        metaDescription: seoDesc,
        keywords: seoKeywords
      }
    });
  };

  const handleAddBlog = (e: React.FormEvent) => {
    e.preventDefault();
    const newPost = {
      id: 'blg-' + Date.now(),
      title: newBlogTitle || 'New Engineering Article',
      slug: newBlogTitle.toLowerCase().replace(/\s+/g, '-'),
      category: newBlogCat,
      author: 'Enterprenex Tech Team',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: '5 min read',
      status: 'Published' as const,
      excerpt: newBlogExcerpt || 'Technical breakdown and insights from Enterprenex engineering.'
    };
    updateCms({ blogPosts: [newPost, ...cms.blogPosts] });
    setShowAddBlog(false);
    setNewBlogTitle('');
    setNewBlogExcerpt('');
  };

  const handleAddPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = {
      id: 'port-' + Date.now(),
      title: newPortTitle || 'Enterprise Case Study',
      category: 'Fintech & Cloud',
      description: newPortDesc || 'Comprehensive architectural revamp.',
      metric: newPortMetric || '99.99% Uptime SLA',
      techStack: ['React', 'TypeScript', 'Node.js', 'AWS'],
      featured: true
    };
    updateCms({ portfolioItems: [newItem, ...cms.portfolioItems] });
    setShowAddPortfolio(false);
    setNewPortTitle('');
    setNewPortMetric('');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <h1>CMS & Public Website Manager</h1>
          <p>Live visual editor for homepage copy, portfolio case studies, technical blog, testimonials & contact inquiries</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="adm-card" style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
        <div className="adm-tabs" style={{ margin: 0, border: 'none' }}>
          <button className={`adm-tab-btn ${tab === 'hero' ? 'active' : ''}`} onClick={() => setTab('hero')}>
            Hero Copy
          </button>
          <button className={`adm-tab-btn ${tab === 'portfolio' ? 'active' : ''}`} onClick={() => setTab('portfolio')}>
            Portfolio & Case Studies ({cms.portfolioItems.length})
          </button>
          <button className={`adm-tab-btn ${tab === 'blog' ? 'active' : ''}`} onClick={() => setTab('blog')}>
            Blog Articles ({cms.blogPosts.length})
          </button>
          <button className={`adm-tab-btn ${tab === 'testimonials' ? 'active' : ''}`} onClick={() => setTab('testimonials')}>
            Testimonials ({cms.testimonials.length})
          </button>
          <button className={`adm-tab-btn ${tab === 'enquiries' ? 'active' : ''}`} onClick={() => setTab('enquiries')}>
            Contact Enquiries ({cms.contactEnquiries.length})
          </button>
          <button className={`adm-tab-btn ${tab === 'seo' ? 'active' : ''}`} onClick={() => setTab('seo')}>
            SEO Metadata
          </button>
        </div>
      </div>

      {/* ── 1. HERO SECTION EDITOR ── */}
      {tab === 'hero' && (
        <div className="adm-card">
          <div className="adm-card-header">
            <div className="adm-card-title">
              <Globe size={18} color="var(--adm-primary)" />
              Public Homepage Hero Banner Copy
            </div>
            <button className="adm-btn adm-btn-primary" onClick={handleSaveHero}>
              <Save size={15} />
              <span>Publish Changes</span>
            </button>
          </div>

          <form onSubmit={handleSaveHero}>
            <div className="adm-form-group">
              <label className="adm-form-label">Top Highlight Badge</label>
              <input className="adm-input" value={heroBadge} onChange={e => setHeroBadge(e.target.value)} />
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Main Hero Headline H1</label>
              <textarea className="adm-textarea" style={{ minHeight: '80px', fontSize: '1.1rem', fontWeight: 700 }} value={heroHeading} onChange={e => setHeroHeading(e.target.value)} />
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Hero Supporting Subtitle</label>
              <textarea className="adm-textarea" value={heroSub} onChange={e => setHeroSub(e.target.value)} />
            </div>

            <div className="adm-grid-2">
              <div className="adm-form-group">
                <label className="adm-form-label">Primary CTA Button Label</label>
                <input className="adm-input" value={heroCta1} onChange={e => setHeroCta1(e.target.value)} />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Secondary CTA Button Label</label>
                <input className="adm-input" value={heroCta2} onChange={e => setHeroCta2(e.target.value)} />
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ── 2. PORTFOLIO CASE STUDIES ── */}
      {tab === 'portfolio' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="adm-btn adm-btn-primary" onClick={() => setShowAddPortfolio(true)}>
              <Plus size={15} />
              <span>Add Case Study</span>
            </button>
          </div>

          <div className="adm-grid-3">
            {cms.portfolioItems.map(item => (
              <div key={item.id} className="adm-card">
                <span className="adm-badge adm-badge-primary" style={{ marginBottom: '6px' }}>{item.category}</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>{item.title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--adm-text-muted)', marginBottom: '1rem' }}>{item.description}</p>
                <div style={{ padding: '0.65rem 0.85rem', background: 'var(--adm-bg)', borderRadius: '8px', border: '1px solid var(--adm-border)', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase' }}>Key Benchmark Metric</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--adm-success)' }}>{item.metric}</div>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {item.techStack.map((t, idx) => <span key={idx} className="adm-badge adm-badge-neutral" style={{ fontSize: '0.65rem' }}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>

          {showAddPortfolio && (
            <div className="adm-modal-overlay" onClick={() => setShowAddPortfolio(false)}>
              <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
                <div className="adm-modal-header">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Add Portfolio Case Study</h3>
                </div>
                <form onSubmit={handleAddPortfolio}>
                  <div className="adm-form-group">
                    <label className="adm-form-label">Project Title *</label>
                    <input className="adm-input" required value={newPortTitle} onChange={e => setNewPortTitle(e.target.value)} />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-form-label">Impact Metric *</label>
                    <input className="adm-input" required value={newPortMetric} onChange={e => setNewPortMetric(e.target.value)} placeholder="e.g. ₹50M+ Daily Disbursements" />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-form-label">Summary</label>
                    <textarea className="adm-textarea" value={newPortDesc} onChange={e => setNewPortDesc(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowAddPortfolio(false)}>Cancel</button>
                    <button type="submit" className="adm-btn adm-btn-primary">Add Item</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 3. BLOG POSTS ── */}
      {tab === 'blog' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="adm-btn adm-btn-primary" onClick={() => setShowAddBlog(true)}>
              <Plus size={15} />
              <span>Write New Article</span>
            </button>
          </div>

          <div className="adm-grid-2">
            {cms.blogPosts.map(post => (
              <div key={post.id} className="adm-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="adm-badge adm-badge-neutral">{post.category}</span>
                  <span className="adm-badge adm-badge-success">{post.status}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: '6px 0' }}>{post.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--adm-text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>{post.excerpt}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--adm-text-dim)', paddingTop: '0.75rem', borderTop: '1px solid var(--adm-border)' }}>
                  <span>by {post.author} • {post.date}</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            ))}
          </div>

          {showAddBlog && (
            <div className="adm-modal-overlay" onClick={() => setShowAddBlog(false)}>
              <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
                <div className="adm-modal-header">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Publish Engineering Article</h3>
                </div>
                <form onSubmit={handleAddBlog}>
                  <div className="adm-form-group">
                    <label className="adm-form-label">Article Title *</label>
                    <input className="adm-input" required value={newBlogTitle} onChange={e => setNewBlogTitle(e.target.value)} />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-form-label">Category</label>
                    <input className="adm-input" value={newBlogCat} onChange={e => setNewBlogCat(e.target.value)} />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-form-label">Excerpt / Summary *</label>
                    <textarea className="adm-textarea" required value={newBlogExcerpt} onChange={e => setNewBlogExcerpt(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowAddBlog(false)}>Cancel</button>
                    <button type="submit" className="adm-btn adm-btn-primary">Publish</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 4. TESTIMONIALS ── */}
      {tab === 'testimonials' && (
        <div className="adm-grid-3">
          {cms.testimonials.map(tst => (
            <div key={tst.id} className="adm-card">
              <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                {[...Array(tst.rating)].map((_, i) => <Star key={i} size={14} fill="#F66135" color="#F66135" />)}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#fff', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '1rem' }}>
                "{tst.quote}"
              </p>
              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--adm-border)' }}>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{tst.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--adm-primary)' }}>{tst.role} • {tst.company}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 5. CONTACT ENQUIRIES INBOX ── */}
      {tab === 'enquiries' && (
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Prospect Name</th>
                <th>Contact</th>
                <th>Service Requested</th>
                <th>Message Snippet</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cms.contactEnquiries.map(enq => (
                <tr key={enq.id}>
                  <td style={{ fontWeight: 700, color: '#fff' }}>{enq.name}</td>
                  <td>
                    <div style={{ fontSize: '0.78rem', color: 'var(--adm-primary)' }}>{enq.email}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>{enq.phone}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{enq.service}</td>
                  <td style={{ maxWidth: '280px', fontSize: '0.8rem', color: 'var(--adm-text-muted)' }}>{enq.message}</td>
                  <td>{enq.submittedAt}</td>
                  <td>
                    <span className={`adm-badge ${
                      enq.status === 'New' ? 'adm-badge-warning' :
                      enq.status === 'Contacted' ? 'adm-badge-success' : 'adm-badge-neutral'
                    }`}>
                      {enq.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {enq.status === 'New' && (
                        <button className="adm-btn adm-btn-sm adm-btn-primary" onClick={() => updateEnquiryStatus(enq.id, 'Contacted')}>
                          Mark Contacted
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 6. SEO METADATA ── */}
      {tab === 'seo' && (
        <div className="adm-card">
          <div className="adm-card-header">
            <div className="adm-card-title">
              <Sliders size={18} color="var(--adm-primary)" />
              Search Engine Optimization (SEO) & Open Graph Tags
            </div>
            <button className="adm-btn adm-btn-primary" onClick={handleSaveSeo}>
              <Save size={15} />
              <span>Save Meta Tags</span>
            </button>
          </div>

          <form onSubmit={handleSaveSeo}>
            <div className="adm-form-group">
              <label className="adm-form-label">Meta Title (Max 60 chars)</label>
              <input className="adm-input" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} />
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Meta Description (Max 160 chars)</label>
              <textarea className="adm-textarea" value={seoDesc} onChange={e => setSeoDesc(e.target.value)} />
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Keywords (Comma separated)</label>
              <input className="adm-input" value={seoKeywords} onChange={e => setSeoKeywords(e.target.value)} />
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
