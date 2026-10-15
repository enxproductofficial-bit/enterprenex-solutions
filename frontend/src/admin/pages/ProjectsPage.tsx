import React, { useState, Suspense, lazy } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Plus,
  Search,
  Trash2,
  ArrowRight,
  X,
  Calendar,
  Layers,
  DollarSign
} from 'lucide-react';
import type { Project, ProjectStatus } from '../types';

const ProjectPreviewDrawer = lazy(() =>
  import('../components/ProjectPreviewDrawer').then(m => ({ default: m.ProjectPreviewDrawer }))
);

const STAGES: ProjectStatus[] = [
  'Lead',
  'Proposal',
  'Planning',
  'Development',
  'Testing',
  'Review',
  'Delivered',
  'Maintenance'
];

export const ProjectsPage: React.FC = () => {
  const { projects, clients, employees, addProject, updateProject, updateProjectStatus, deleteProject, showToast } = useAdmin();
  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline');
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [fTitle, setFTitle] = useState('');
  const [fClientId, setFClientId] = useState(clients[0]?.id || '');
  const [fStatus, setFStatus] = useState<ProjectStatus>('Planning');
  const [fBudget, setFBudget] = useState(1500000);
  const [fCategory, setFCategory] = useState('Web Development');
  const [fStart, setFStart] = useState(new Date().toISOString().split('T')[0]);
  const [fEnd, setFEnd] = useState('2026-06-30');
  const [fDesc, setFDesc] = useState('');
  const [fTechStack, setFTechStack] = useState('React, TypeScript, Node.js, PostgreSQL');

  const filteredProjects = projects.filter(p => {
    return p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.serviceCategory.toLowerCase().includes(search.toLowerCase());
  });

  const selectedClient = clients.find(
    c => c.id === selectedProject?.clientId || c.companyName === selectedProject?.clientName
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selClient = clients.find(c => c.id === fClientId);
    addProject({
      title: fTitle || 'New Software Solution',
      clientName: selClient ? selClient.companyName : 'Enterprise Client',
      clientId: fClientId,
      status: fStatus,
      progress: fStatus === 'Lead' ? 0 : fStatus === 'Proposal' ? 10 : fStatus === 'Planning' ? 25 : 50,
      budget: Number(fBudget),
      expenses: 0,
      startDate: fStart,
      targetEndDate: fEnd,
      assignedTeam: employees.length > 0 ? employees.map(e => e.name) : ['Enterprenex Engineering Squad'],
      techStack: fTechStack.split(',').map(s => s.trim()).filter(Boolean),
      serviceCategory: fCategory,
      description: fDesc || 'Full-cycle enterprise software development engagement.',
      milestones: [
        { id: 'ms-1', title: 'Phase 1: Architecture Signoff', dueDate: fEnd, completed: false, amount: Number(fBudget) * 0.4 },
        { id: 'ms-2', title: 'Phase 2: Alpha Release & UAT', dueDate: fEnd, completed: false, amount: Number(fBudget) * 0.6 }
      ],
      priority: 'High'
    });
    setShowAddModal(false);
    setFTitle('');
    setFDesc('');
  };

  const handleToggleMilestone = (prjId: string, milestoneId: string) => {
    const prj = projects.find(p => p.id === prjId);
    if (!prj) return;
    const updatedMilestones = prj.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m);
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const newProgress = Math.round((completedCount / (updatedMilestones.length || 1)) * 100);

    updateProject(prjId, { milestones: updatedMilestones, progress: newProgress });
    if (selectedProject?.id === prjId) {
      setSelectedProject({ ...selectedProject, milestones: updatedMilestones, progress: newProgress });
    }
    showToast('Milestone Updated', 'Project progress recalculated.', 'success');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <h1>Project Lifecycle Governance</h1>
          <p>End-to-end 8-stage delivery management, milestone tracker, and budget analytics</p>
        </div>
        <div className="adm-page-actions">
          <div style={{ display: 'flex', background: 'var(--adm-surface)', border: '1px solid var(--adm-border)', borderRadius: 'var(--adm-radius)', padding: '2px' }}>
            <button
              onClick={() => setViewMode('pipeline')}
              style={{
                background: viewMode === 'pipeline' ? 'var(--adm-primary)' : 'transparent',
                color: viewMode === 'pipeline' ? '#fff' : 'var(--adm-text-muted)',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Pipeline Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? 'var(--adm-primary)' : 'transparent',
                color: viewMode === 'table' ? '#fff' : 'var(--adm-text-muted)',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Table View
            </button>
          </div>

          <button className="adm-btn adm-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* Search & Overview Stats */}
      <div className="adm-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-dim)' }} />
          <input
            type="text"
            className="adm-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search projects, clients, tech stacks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* 8-Stage Progress Overview Breadcrumb */}
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', padding: '4px 0' }}>
          {STAGES.map(st => {
            const count = projects.filter(p => p.status === st).length;
            return (
              <div
                key={st}
                style={{
                  padding: '4px 8px',
                  background: count > 0 ? 'var(--adm-primary-soft)' : 'var(--adm-bg)',
                  border: count > 0 ? '1px solid var(--adm-primary-border)' : '1px solid var(--adm-border)',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  color: count > 0 ? 'var(--adm-primary)' : 'var(--adm-text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{st}</span>
                <span style={{ fontWeight: 800 }}>({count})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 1. PIPELINE 8-STAGE KANBAN BOARD ── */}
      {viewMode === 'pipeline' && (
        <div className="adm-kanban-board">
          {STAGES.map(stage => {
            const stageProjects = filteredProjects.filter(p => p.status === stage);
            return (
              <div key={stage} className="adm-kanban-column">
                <div className="adm-kanban-column-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text, #1a1a1a)' }}>{stage}</span>
                    <span className="adm-badge adm-badge-neutral" style={{ fontSize: '0.7rem' }}>{stageProjects.length}</span>
                  </div>
                </div>

                <div className="adm-kanban-cards-wrapper">
                  {stageProjects.map(p => {
                    const isSelected = selectedProject?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        className="adm-kanban-card"
                        onClick={() => setSelectedProject(p)}
                        style={{
                          cursor: 'pointer',
                          borderColor: isSelected ? 'var(--adm-primary)' : undefined,
                          boxShadow: isSelected ? '0 0 0 2px rgba(18, 201, 144, 0.25)' : undefined
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <span className="adm-badge adm-badge-primary" style={{ fontSize: '0.68rem' }}>{p.serviceCategory}</span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--adm-success)' }}>
                            ₹{(p.budget / 100000).toFixed(1)}L
                          </span>
                        </div>

                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--adm-text, #1a1a1a)', marginBottom: '4px', lineHeight: 1.3 }}>
                          {p.title}
                        </h4>
                        <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginBottom: '8px' }}>
                          {p.clientName}
                        </div>

                        {/* Progress Bar */}
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>
                            <span>Progress</span>
                            <span style={{ fontWeight: 700, color: 'var(--adm-primary)' }}>{p.progress}%</span>
                          </div>
                          <div className="adm-progress-bar">
                            <div className="adm-progress-fill" style={{ width: `${p.progress}%` }} />
                          </div>
                        </div>

                        {/* Footer Info */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--adm-text-dim)', paddingTop: '6px', borderTop: '1px solid var(--adm-border)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} /> {p.targetEndDate}
                          </span>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {p.assignedTeam.map((mem, idx) => (
                              <span key={idx} style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--adm-surface-active)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#fff' }}>
                                {mem.charAt(0)}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Quick Action Footer */}
                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--adm-primary)', fontWeight: 600 }}>
                            Milestones &rarr;
                          </span>
                          {stage !== 'Delivered' && stage !== 'Maintenance' && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                const currentIdx = STAGES.indexOf(stage);
                                if (currentIdx < STAGES.length - 1) {
                                  updateProjectStatus(p.id, STAGES[currentIdx + 1]);
                                  if (selectedProject?.id === p.id) {
                                    setSelectedProject({ ...p, status: STAGES[currentIdx + 1] });
                                  }
                                }
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--adm-primary)',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                cursor: 'pointer'
                              }}
                            >
                              <span>Advance</span>
                              <ArrowRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {stageProjects.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--adm-text-dim)', fontSize: '0.78rem' }}>
                      No projects in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 2. LIST / TABLE VIEW ── */}
      {viewMode === 'table' && (
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Project Title & Client</th>
                <th>Category</th>
                <th>Stage</th>
                <th>Progress</th>
                <th>Budget / Exp</th>
                <th>Delivery Target</th>
                <th className="adm-table-sticky-right" style={{ minWidth: '160px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(p => {
                const isSelected = selectedProject?.id === p.id;
                return (
                  <tr
                    key={p.id}
                    className={isSelected ? 'adm-table-row-clickable adm-table-row-active' : 'adm-table-row-clickable'}
                    onClick={() => setSelectedProject(p)}
                  >
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--adm-text, #1a1a1a)' }}>{p.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>{p.clientName}</div>
                    </td>
                    <td><span className="adm-badge adm-badge-neutral">{p.serviceCategory}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <select
                        className="adm-select"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', width: 'auto' }}
                        value={p.status}
                        onChange={e => {
                          const newStatus = e.target.value as ProjectStatus;
                          updateProjectStatus(p.id, newStatus);
                          if (selectedProject?.id === p.id) {
                            setSelectedProject({ ...p, status: newStatus });
                          }
                        }}
                      >
                        {STAGES.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </td>
                    <td style={{ minWidth: '100px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--adm-primary)' }}>{p.progress}%</span>
                      </div>
                      <div className="adm-progress-bar" style={{ margin: 0 }}>
                        <div className="adm-progress-fill" style={{ width: `${p.progress}%` }} />
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--adm-text, #1a1a1a)' }}>₹{p.budget.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>Exp: ₹{p.expenses.toLocaleString('en-IN')}</div>
                    </td>
                    <td>{p.targetEndDate}</td>
                    <td className="adm-table-sticky-right" style={{ minWidth: '160px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button className="adm-btn adm-btn-sm adm-btn-secondary" onClick={() => setSelectedProject(p)}>
                          Preview Drawer
                        </button>
                        <button
                          className="adm-btn adm-btn-sm adm-btn-danger"
                          onClick={() => {
                            if (window.confirm(`Delete project "${p.title}"?`)) {
                              deleteProject(p.id);
                              if (selectedProject?.id === p.id) setSelectedProject(null);
                            }
                          }}
                          title="Delete Project"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── LAZY-LOADED SCREEN-ADAPTIVE SLIDING PROJECT DRAWER ── */}
      {selectedProject && (
        <Suspense
          fallback={
            <div className="adm-drawer-overlay">
              <div
                className="adm-preview-drawer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'clamp(440px, 58vw, 900px)'
                }}
              >
                <div className="adm-spinner" />
              </div>
            </div>
          }
        >
          <ProjectPreviewDrawer
            project={selectedProject}
            client={selectedClient}
            onClose={() => setSelectedProject(null)}
            onUpdateStatus={(id, status) => {
              updateProjectStatus(id, status);
              setSelectedProject(prev => (prev && prev.id === id ? { ...prev, status } : prev));
            }}
            onToggleMilestone={handleToggleMilestone}
            onUpdateProject={(id, updates) => {
              updateProject(id, updates);
              setSelectedProject(prev => (prev && prev.id === id ? { ...prev, ...updates } : prev));
            }}
            onDeleteProject={id => {
              deleteProject(id);
              setSelectedProject(null);
            }}
          />
        </Suspense>
      )}

      {/* ── CREATE PROJECT MODAL ── */}
      {showAddModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text, #1a1a1a)' }}>
                Initialize New Project
              </h3>
              <button className="adm-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Project Title *</label>
                  <input className="adm-input" required value={fTitle} onChange={e => setFTitle(e.target.value)} placeholder="e.g. AI Pathology Scanner" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Client Account *</label>
                  <select className="adm-select" value={fClientId} onChange={e => setFClientId(e.target.value)}>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                </div>
              </div>

              <div className="adm-grid-3">
                <div className="adm-form-group">
                  <label className="adm-form-label">Service Category</label>
                  <select className="adm-select" value={fCategory} onChange={e => setFCategory(e.target.value)}>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile App Development">Mobile App Development</option>
                    <option value="SaaS Development">SaaS Development</option>
                    <option value="AI/ML Solutions">AI/ML Solutions</option>
                    <option value="IoT Solutions">IoT Solutions</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Custom Enterprise Software">Custom Enterprise Software</option>
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Initial Status</label>
                  <select className="adm-select" value={fStatus} onChange={e => setFStatus(e.target.value as ProjectStatus)}>
                    {STAGES.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Total Budget (₹)</label>
                  <input className="adm-input" type="number" required value={fBudget} onChange={e => setFBudget(Number(e.target.value))} />
                </div>
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Start Date</label>
                  <input className="adm-input" type="date" value={fStart} onChange={e => setFStart(e.target.value)} />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Target Delivery Date</label>
                  <input className="adm-input" type="date" value={fEnd} onChange={e => setFEnd(e.target.value)} />
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Tech Stack (comma separated)</label>
                <input className="adm-input" value={fTechStack} onChange={e => setFTechStack(e.target.value)} />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Engagement Description & Objectives</label>
                <textarea className="adm-textarea" value={fDesc} onChange={e => setFDesc(e.target.value)} placeholder="Key architecture, deliverables, and integration points..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">Launch Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
