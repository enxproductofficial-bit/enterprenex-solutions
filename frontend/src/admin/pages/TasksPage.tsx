import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Send,
  ArrowRight,
  X,
  Play,
  Calendar,
  MessageSquare
} from 'lucide-react';
import type { Task, TaskColumn, TaskPriority } from '../types';

const TASK_COLUMNS: TaskColumn[] = ['To Do', 'In Progress', 'In Review', 'Testing', 'Done'];

export const TasksPage: React.FC = () => {
  const { tasks, projects, employees, addTask, updateTaskStatus, toggleSubtask, addTaskComment, logTaskTime, deleteTask, currentUser } = useAdmin();
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [loggedHoursInput, setLoggedHoursInput] = useState(2);

  // Form State
  const [fTitle, setFTitle] = useState('');
  const [fProjectId, setFProjectId] = useState(projects[0]?.id || '');
  const [fAssignedTo, setFAssignedTo] = useState(employees[0]?.name || currentUser?.name || 'Assigned Engineer');
  const [fPriority, setFPriority] = useState<TaskPriority>('Medium');
  const [fDue, setFDue] = useState('2026-03-01');
  const [fDesc, setFDesc] = useState('');
  const [fHours, setFHours] = useState(8);

  const filteredTasks = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(search.toLowerCase()) ||
      t.projectName.toLowerCase().includes(search.toLowerCase());
    const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selPrj = projects.find(p => p.id === fProjectId);
    addTask({
      title: fTitle || 'Feature Implementation',
      description: fDesc || 'Technical implementation task.',
      projectId: fProjectId,
      projectName: selPrj ? selPrj.title : 'General Engineering',
      assignedTo: fAssignedTo,
      priority: fPriority,
      status: 'To Do',
      dueDate: fDue,
      subtasks: [
        { id: 'st-' + Date.now(), title: 'Core architecture and business logic', completed: false },
        { id: 'st-' + (Date.now() + 1), title: 'Unit tests & code review checklist', completed: false }
      ],
      estimatedHours: Number(fHours),
      tags: ['Sprint Feature', 'Enterprenex']
    });
    setShowAddModal(false);
    setFTitle('');
    setFDesc('');
  };

  const handleAddComment = (taskId: string) => {
    if (!commentInput.trim()) return;
    addTaskComment(taskId, commentInput);
    if (selectedTask?.id === taskId) {
      const newCm = {
        id: 'cm-' + Date.now(),
        author: currentUser?.name || 'Assigned Engineer',
        authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        text: commentInput,
        createdAt: 'Just now'
      };
      setSelectedTask({ ...selectedTask, comments: [...selectedTask.comments, newCm] });
    }
    setCommentInput('');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <h1>Sprint Tasks & Kanban Board</h1>
          <p>Scrum agile task tracking, subtasks, stopwatch time tracking & team collaboration comments</p>
        </div>
        <div className="adm-page-actions">
          <button className="adm-btn adm-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="adm-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-dim)' }} />
          <input
            type="text"
            className="adm-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search tasks, assignees, projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)', fontWeight: 600 }}>Priority:</span>
          {(['All', 'Urgent', 'High', 'Medium', 'Low'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              style={{
                background: priorityFilter === p ? 'var(--adm-primary)' : 'var(--adm-bg)',
                color: priorityFilter === p ? '#fff' : 'var(--adm-text-muted)',
                border: '1px solid var(--adm-border)',
                borderRadius: '6px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── 5-COLUMN SPRINT KANBAN ── */}
      <div className="adm-kanban-board">
        {TASK_COLUMNS.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col);

          return (
            <div key={col} className="adm-kanban-column">
              <div className="adm-kanban-column-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{col}</span>
                  <span className="adm-badge adm-badge-neutral" style={{ fontSize: '0.7rem' }}>{colTasks.length}</span>
                </div>
              </div>

              <div className="adm-kanban-cards-wrapper">
                {colTasks.map(t => {
                  const completedSubtasks = t.subtasks.filter(s => s.completed).length;

                  return (
                    <div
                      key={t.id}
                      className="adm-kanban-card"
                      onClick={() => setSelectedTask(t)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span className={`adm-badge ${
                          t.priority === 'Urgent' ? 'adm-badge-danger' :
                          t.priority === 'High' ? 'adm-badge-warning' : 'adm-badge-neutral'
                        }`} style={{ fontSize: '0.65rem' }}>
                          {t.priority}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>
                          {t.loggedHours}h / {t.estimatedHours}h
                        </span>
                      </div>

                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', margin: '4px 0', lineHeight: 1.3 }}>
                        {t.title}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--adm-primary)', marginBottom: '8px' }}>
                        {t.projectName}
                      </div>

                      {/* Subtasks Progress indicator */}
                      {t.subtasks.length > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--adm-text-dim)' }}>
                            <span>Subtasks</span>
                            <span>{completedSubtasks}/{t.subtasks.length}</span>
                          </div>
                          <div className="adm-progress-bar">
                            <div className="adm-progress-fill" style={{ width: `${(completedSubtasks / t.subtasks.length) * 100}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Assignee & Due */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--adm-text-dim)', paddingTop: '6px', borderTop: '1px solid var(--adm-border)' }}>
                        <span style={{ fontWeight: 600, color: '#fff' }}>{t.assignedTo}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Calendar size={11} /> {t.dueDate}
                        </span>
                      </div>

                      {/* Shift forward */}
                      <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'flex-end' }}>
                        {col !== 'Done' && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              const nextIdx = TASK_COLUMNS.indexOf(col) + 1;
                              if (nextIdx < TASK_COLUMNS.length) {
                                updateTaskStatus(t.id, TASK_COLUMNS[nextIdx]);
                              }
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--adm-primary)',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              cursor: 'pointer'
                            }}
                          >
                            <span>Move Next</span>
                            <ArrowRight size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--adm-text-dim)', fontSize: '0.78rem' }}>
                    Empty column
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── TASK DETAIL MODAL ── */}
      {selectedTask && (
        <div className="adm-modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="adm-modal-content adm-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <span className="adm-badge adm-badge-primary" style={{ marginBottom: '4px' }}>{selectedTask.projectName}</span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {selectedTask.title}
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)', marginTop: '2px' }}>
                  Assigned to: <strong style={{ color: '#fff' }}>{selectedTask.assignedTo}</strong> • Due: {selectedTask.dueDate}
                </div>
              </div>
              <button className="adm-modal-close" onClick={() => setSelectedTask(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Time Tracking Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--adm-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--adm-border)', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Time Logged</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                  {selectedTask.loggedHours} <span style={{ fontSize: '0.9rem', color: 'var(--adm-text-dim)' }}>/ {selectedTask.estimatedHours} Hours</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  className="adm-input"
                  style={{ width: '80px', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                  value={loggedHoursInput}
                  onChange={e => setLoggedHoursInput(Number(e.target.value))}
                />
                <button className="adm-btn adm-btn-primary" onClick={() => {
                  logTaskTime(selectedTask.id, loggedHoursInput);
                  setSelectedTask({ ...selectedTask, loggedHours: selectedTask.loggedHours + loggedHoursInput });
                }}>
                  <Play size={14} />
                  <span>Log +Hours</span>
                </button>
              </div>
            </div>

            {/* Subtasks Checklist */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--adm-success)" />
                Subtasks Breakdown
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedTask.subtasks.map(st => (
                  <div
                    key={st.id}
                    onClick={() => {
                      toggleSubtask(selectedTask.id, st.id);
                      const updated = selectedTask.subtasks.map(s => s.id === st.id ? { ...s, completed: !s.completed } : s);
                      setSelectedTask({ ...selectedTask, subtasks: updated });
                    }}
                    style={{
                      padding: '0.65rem 0.85rem',
                      background: st.completed ? 'var(--adm-success-soft)' : 'var(--adm-bg)',
                      border: '1px solid var(--adm-border)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => {}}
                      style={{ accentColor: 'var(--adm-success)' }}
                    />
                    <span style={{ fontSize: '0.85rem', color: st.completed ? 'var(--adm-success)' : '#fff', textDecoration: st.completed ? 'line-through' : 'none' }}>
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Collaboration Comments Thread */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={16} color="var(--adm-info)" />
                Engineering Comments Thread
              </h4>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="Post technical update or review comment..."
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddComment(selectedTask.id); }}
                />
                <button className="adm-btn adm-btn-primary" onClick={() => handleAddComment(selectedTask.id)}>
                  <Send size={14} />
                  <span>Reply</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {selectedTask.comments.map(c => (
                  <div key={c.id} style={{ padding: '0.75rem 1rem', background: 'var(--adm-bg)', borderRadius: '8px', border: '1px solid var(--adm-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.82rem' }}>{c.author}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>{c.createdAt}</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--adm-text-muted)', margin: 0 }}>
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--adm-border)' }}>
              <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => { deleteTask(selectedTask.id); setSelectedTask(null); }}>
                <Trash2 size={13} />
                <span>Delete Task</span>
              </button>
              <button className="adm-btn adm-btn-secondary" onClick={() => setSelectedTask(null)}>Close</button>
            </div>

          </div>
        </div>
      )}

      {/* ── CREATE TASK MODAL ── */}
      {showAddModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Create Sprint Task</h3>
              <button className="adm-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="adm-form-group">
                <label className="adm-form-label">Task Title *</label>
                <input className="adm-input" required value={fTitle} onChange={e => setFTitle(e.target.value)} placeholder="e.g. Implement Webhook Dispatcher" />
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Associated Project</label>
                  <select className="adm-select" value={fProjectId} onChange={e => setFProjectId(e.target.value)}>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Assignee</label>
                  <select className="adm-select" value={fAssignedTo} onChange={e => setFAssignedTo(e.target.value)}>
                    {employees.map(e => <option key={e.id} value={e.name}>{e.name} ({e.role})</option>)}
                  </select>
                </div>
              </div>

              <div className="adm-grid-3">
                <div className="adm-form-group">
                  <label className="adm-form-label">Priority</label>
                  <select className="adm-select" value={fPriority} onChange={e => setFPriority(e.target.value as any)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Est. Hours</label>
                  <input className="adm-input" type="number" value={fHours} onChange={e => setFHours(Number(e.target.value))} />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Due Date</label>
                  <input className="adm-input" type="date" value={fDue} onChange={e => setFDue(e.target.value)} />
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Task Description</label>
                <textarea className="adm-textarea" value={fDesc} onChange={e => setFDesc(e.target.value)} placeholder="Acceptance criteria and technical details..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
