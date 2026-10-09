import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Plus,
  Video,
  Clock,
  MapPin,
  Users,
  Trash2,
  X
} from 'lucide-react';
import type { CalendarMeeting } from '../types';

export const CalendarPage: React.FC = () => {
  const { meetings, addMeeting, deleteMeeting, currentUser } = useAdmin();
  const [selectedType, setSelectedType] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [fTitle, setFTitle] = useState('');
  const [fType, setFType] = useState<CalendarMeeting['type']>('Client Presentation');
  const [fDate, setFDate] = useState(new Date().toISOString().split('T')[0]);
  const [fTime, setFTime] = useState('11:00 AM - 12:00 PM');
  const [fLocation, setFLocation] = useState('Google Meet');
  const [fMeetUrl, setFMeetUrl] = useState('https://meet.google.com/abc-enterprenex');
  const [fDesc, setFDesc] = useState('');

  const filteredMeetings = meetings.filter(m => selectedType === 'All' || m.type === selectedType);

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    addMeeting({
      title: fTitle || 'Project Sync Call',
      type: fType,
      date: fDate,
      time: fTime,
      attendees: [currentUser?.name || 'Enterprenex Team'],
      location: fLocation,
      meetUrl: fMeetUrl,
      description: fDesc || 'Sprint sync & client roadmap discussion.'
    });
    setShowAddModal(false);
    setFTitle('');
    setFDesc('');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <h1>Calendar & Executive Meetings</h1>
          <p>Executive reviews, client presentations, Google Meet/Zoom video integration & follow-ups</p>
        </div>
        <div className="adm-page-actions">
          <button className="adm-btn adm-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="adm-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)', fontWeight: 600, marginRight: '0.5rem' }}>Meeting Type:</span>
        {(['All', 'Client Presentation', 'Sprint Planning', 'Lead Follow-up', 'Internal Sync'] as const).map(t => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            style={{
              background: selectedType === t ? 'var(--adm-primary)' : 'var(--adm-bg)',
              color: selectedType === t ? '#fff' : 'var(--adm-text-muted)',
              border: '1px solid var(--adm-border)',
              borderRadius: '6px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Schedule Agenda Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredMeetings.map(meet => (
          <div
            key={meet.id}
            className="adm-card adm-card-hover"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--adm-bg)', border: '1px solid var(--adm-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--adm-primary)', fontWeight: 700, textTransform: 'uppercase' }}>FEB</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{meet.date.split('-')[2] || '24'}</span>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                  <span className="adm-badge adm-badge-primary">{meet.type}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--adm-text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {meet.time}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
                  {meet.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--adm-text-muted)', marginBottom: '8px' }}>
                  {meet.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--adm-text-dim)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} color="var(--adm-primary)" /> {meet.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={13} /> {meet.attendees.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {meet.meetUrl && (
                <a
                  href={meet.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="adm-btn adm-btn-primary"
                  style={{ fontSize: '0.82rem' }}
                >
                  <Video size={14} />
                  <span>Join Video Call</span>
                </a>
              )}
              <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => deleteMeeting(meet.id)} title="Cancel Meeting">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {filteredMeetings.length === 0 && (
          <div className="adm-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--adm-text-muted)' }}>
            No meetings scheduled in this filter.
          </div>
        )}
      </div>

      {/* ── SCHEDULE MEETING MODAL ── */}
      {showAddModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Schedule Event / Meeting</h3>
              <button className="adm-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting}>
              <div className="adm-form-group">
                <label className="adm-form-label">Meeting Title *</label>
                <input className="adm-input" required value={fTitle} onChange={e => setFTitle(e.target.value)} placeholder="e.g. Solution Architecture Review" />
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Meeting Type</label>
                  <select className="adm-select" value={fType} onChange={e => setFType(e.target.value as any)}>
                    <option value="Client Presentation">Client Presentation</option>
                    <option value="Sprint Planning">Sprint Planning</option>
                    <option value="Lead Follow-up">Lead Follow-up</option>
                    <option value="Internal Sync">Internal Sync</option>
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Scheduled Date</label>
                  <input className="adm-input" type="date" value={fDate} onChange={e => setFDate(e.target.value)} />
                </div>
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Time Window</label>
                  <input className="adm-input" value={fTime} onChange={e => setFTime(e.target.value)} placeholder="11:00 AM - 12:00 PM" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Location / Platform</label>
                  <input className="adm-input" value={fLocation} onChange={e => setFLocation(e.target.value)} placeholder="Google Meet / Zoom" />
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Meeting Video Link URL</label>
                <input className="adm-input" value={fMeetUrl} onChange={e => setFMeetUrl(e.target.value)} placeholder="https://meet.google.com/..." />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Agenda & Brief</label>
                <textarea className="adm-textarea" value={fDesc} onChange={e => setFDesc(e.target.value)} placeholder="Objectives, attendees to present, and slides required..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">Confirm Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
