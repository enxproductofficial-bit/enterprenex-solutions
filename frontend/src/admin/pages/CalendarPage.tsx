import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Plus,
  Video,
  Clock,
  MapPin,
  Users,
  Trash2,
  X,
  Share2,
  Copy,
  MessageSquare,
  Send,
  Calendar,
  Sparkles,
  Heart,
  Check,
  ShieldCheck,
  Search,
  ExternalLink,
  Radio,
  Tag
} from 'lucide-react';
import type { CalendarMeeting, CommunityAnnouncement } from '../types';

// Clean SVG Icon for WhatsApp
const WhatsAppIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#ffffff' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.941-.708-1.792s.448-1.272.607-1.446c.159-.175.346-.219.462-.219s.231.002.332.008c.107.006.25-.041.391.299.144.348.491 1.198.534 1.285.043.087.072.189.014.305-.058.117-.087.19-.174.291-.087.102-.182.227-.26.305-.088.087-.179.182-.077.357.101.174.45 0.742.964 1.201.662.591 1.221.774 1.394.861.174.087.275.073.377-.044.101-.116.433-.506.549-.68.116-.174.232-.145.39-.087s1.011.477 1.184.564c.174.087.289.13.332.203.044.073.044.42-.1 0.825zM12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.1 22l5.163-1.218A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
  </svg>
);

export const CalendarPage: React.FC = () => {
  const {
    meetings,
    addMeeting,
    deleteMeeting,
    announcements,
    addAnnouncement,
    likeAnnouncement,
    chatMessages,
    sendChatMessage,
    employees,
    currentUser,
    showToast
  } = useAdmin();

  // Active Tab: 'meetings' | 'community' | 'chat'
  const [activeTab, setActiveTab] = useState<'meetings' | 'community' | 'chat'>('meetings');

  // ── Meetings Tab State ──
  const [selectedType, setSelectedType] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [broadcastOnWhatsApp, setBroadcastOnWhatsApp] = useState(true);

  // Form State for Meetings
  const [fTitle, setFTitle] = useState('');
  const [fType, setFType] = useState<CalendarMeeting['type']>('Sprint Planning');
  const [fDate, setFDate] = useState(new Date().toISOString().split('T')[0]);
  const [fTime, setFTime] = useState('11:00 AM - 12:00 PM');
  const [fLocation, setFLocation] = useState('Google Meet');
  const [fMeetUrl, setFMeetUrl] = useState('https://meet.google.com/enx-sprint-sync');
  const [fDesc, setFDesc] = useState('');

  // ── Community Tab State ──
  const [showAddAnnModal, setShowAddAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<CommunityAnnouncement['priority']>('General');
  const [annMeetUrl, setAnnMeetUrl] = useState('');
  const [annTags, setAnnTags] = useState('Director Notice, Team Update');

  // ── Chat Tab State ──
  const [activeChatChannel, setActiveChatChannel] = useState<string>('general');
  const [chatInputText, setChatInputText] = useState('');
  const [chatSearchFilter, setChatSearchFilter] = useState('');

  const isDirector = currentUser?.role === 'Super Admin';
  const isManager = currentUser?.role === 'Project Manager';
  const canPostAnnouncement = isDirector || isManager;

  // Filtered Meetings
  const filteredMeetings = meetings.filter(m => selectedType === 'All' || m.type === selectedType);

  // ── WhatsApp Invite Formatter ──
  const formatWhatsAppInvite = (meet: {
    title: string;
    type: string;
    date: string;
    time: string;
    location: string;
    meetUrl?: string;
    attendees?: string[];
    description?: string;
  }) => {
    return [
      `🚀 *ENTERPRENEX SOLUTIONS - MEETING INVITATION*`,
      ``,
      `📌 *Topic:* ${meet.title}`,
      `📂 *Type:* ${meet.type}`,
      `📅 *Date:* ${meet.date}`,
      `⏰ *Time:* ${meet.time}`,
      `📍 *Location:* ${meet.location}`,
      meet.meetUrl ? `🔗 *Google Meet Link:* ${meet.meetUrl}` : ``,
      meet.attendees && meet.attendees.length > 0 ? `👥 *Attendees:* ${meet.attendees.join(', ')}` : ``,
      meet.description ? `📝 *Agenda:* ${meet.description}` : ``,
      ``,
      `_Sent automatically from Enterprenex Work Management System (EWMS)_`
    ].filter(Boolean).join('\n');
  };

  // ── Open WhatsApp Share ──
  const handleShareOnWhatsApp = (meet: CalendarMeeting) => {
    const text = formatWhatsAppInvite(meet);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('WhatsApp Dispatched', `Meeting link for "${meet.title}" opened in WhatsApp.`, 'success');
  };

  // ── Copy Invite to Clipboard ──
  const handleCopyInvite = (meet: CalendarMeeting) => {
    const text = formatWhatsAppInvite(meet);
    navigator.clipboard.writeText(text);
    showToast('Invite Copied', 'WhatsApp meeting invitation copied to clipboard.', 'success');
  };

  // ── Create Meeting Handler ──
  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const newMeetData = {
      title: fTitle || 'Project Sprint Sync',
      type: fType,
      date: fDate,
      time: fTime,
      attendees: [currentUser?.name || 'Enterprenex Team', 'Rohit P.', 'POLAMREDDY REVANTH REDDY'],
      location: fLocation,
      meetUrl: fMeetUrl,
      description: fDesc || 'Sprint sync & client roadmap discussion.'
    };

    addMeeting(newMeetData);

    if (broadcastOnWhatsApp) {
      const text = formatWhatsAppInvite(newMeetData);
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    }

    setShowAddModal(false);
    setFTitle('');
    setFDesc('');
  };

  // ── Create Announcement Handler ──
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    addAnnouncement({
      title: annTitle,
      content: annContent,
      authorName: currentUser?.name || 'Rohit P.',
      authorRole: isDirector ? 'Managing Director & Lead Architect' : (currentUser?.role || 'Project Lead'),
      authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isDirectorPost: isDirector,
      priority: annPriority,
      tags: annTags.split(',').map(t => t.trim()).filter(Boolean),
      meetingLink: annMeetUrl.trim() || undefined
    });

    setShowAddAnnModal(false);
    setAnnTitle('');
    setAnnContent('');
    setAnnMeetUrl('');
  };

  // ── Send Chat Message Handler ──
  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInputText.trim()) return;

    const isGeneral = activeChatChannel === 'general';
    const targetEmployee = employees.find(emp => emp.employeeId === activeChatChannel || emp.id === activeChatChannel);

    sendChatMessage({
      senderId: currentUser?.employeeId || currentUser?.id || '202600000002',
      senderName: currentUser?.name || 'POLAMREDDY REVANTH REDDY',
      senderRole: currentUser?.role || 'Full Stack Developer',
      senderAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      channelId: isGeneral ? 'general' : activeChatChannel,
      recipientId: isGeneral ? undefined : (targetEmployee?.employeeId || activeChatChannel),
      recipientName: isGeneral ? 'General Channel' : targetEmployee?.name,
      message: chatInputText.trim(),
      isDirector: isDirector
    });

    setChatInputText('');
  };

  // Filtered Chat Messages for Current Selected Channel or 1-on-1
  const currentUserId = currentUser?.employeeId || currentUser?.id || '202600000002';
  const displayedMessages = chatMessages.filter(msg => {
    if (activeChatChannel === 'general') {
      return msg.channelId === 'general';
    }
    // 1-on-1 DM between current user and active partner
    return (
      (msg.senderId === currentUserId && (msg.recipientId === activeChatChannel || msg.channelId === activeChatChannel)) ||
      (msg.senderId === activeChatChannel && (msg.recipientId === currentUserId || msg.channelId === currentUserId))
    );
  });

  const activePartner = employees.find(emp => emp.employeeId === activeChatChannel || emp.id === activeChatChannel);

  return (
    <div>
      {/* ── PAGE HEADER ── */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1>Calendar, Community & Executive Sync</h1>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '8px',
                background: 'rgba(37, 211, 102, 0.12)',
                color: '#25D366',
                border: '1px solid rgba(37, 211, 102, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <WhatsAppIcon size={13} color="#25D366" /> WhatsApp Dispatch Enabled
            </span>
          </div>
          <p>
            Schedule executive meetings with 1-click WhatsApp invitations, view official Director community bulletins, and collaborate in real-time team channels.
          </p>
        </div>

        <div className="adm-page-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {activeTab === 'meetings' && (
            <button className="adm-btn adm-btn-primary" onClick={() => setShowAddModal(true)} style={{ borderRadius: '10px' }}>
              <Plus size={16} />
              <span>Schedule Meeting</span>
            </button>
          )}

          {activeTab === 'community' && canPostAnnouncement && (
            <button className="adm-btn adm-btn-primary" onClick={() => setShowAddAnnModal(true)} style={{ borderRadius: '10px' }}>
              <Plus size={16} />
              <span>Post Director Bulletin</span>
            </button>
          )}
        </div>
      </div>

      {/* ── PRIMARY SECTION TABS (Meetings / Community / Chat) ── */}
      <div
        className="adm-card"
        style={{
          padding: '0.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          borderRadius: '12px'
        }}
      >
        <button
          onClick={() => setActiveTab('meetings')}
          className={activeTab === 'meetings' ? 'adm-btn adm-btn-primary' : 'adm-btn adm-btn-secondary'}
          style={{
            borderRadius: '10px',
            padding: '0.6rem 1.2rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Calendar size={16} />
          <span>Executive Meetings & Calendar</span>
          <span
            style={{
              padding: '0.1rem 0.5rem',
              borderRadius: '12px',
              fontSize: '0.72rem',
              background: activeTab === 'meetings' ? 'rgba(255,255,255,0.25)' : 'var(--adm-border)'
            }}
          >
            {meetings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('community')}
          className={activeTab === 'community' ? 'adm-btn adm-btn-primary' : 'adm-btn adm-btn-secondary'}
          style={{
            borderRadius: '10px',
            padding: '0.6rem 1.2rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Radio size={16} />
          <span>Director Bulletins & Community</span>
          <span
            style={{
              padding: '0.1rem 0.5rem',
              borderRadius: '12px',
              fontSize: '0.72rem',
              background: activeTab === 'community' ? 'rgba(255,255,255,0.25)' : 'var(--adm-border)'
            }}
          >
            {announcements.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={activeTab === 'chat' ? 'adm-btn adm-btn-primary' : 'adm-btn adm-btn-secondary'}
          style={{
            borderRadius: '10px',
            padding: '0.6rem 1.2rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <MessageSquare size={16} />
          <span>Team Chat & 1-on-1</span>
          <span
            style={{
              padding: '0.1rem 0.5rem',
              borderRadius: '12px',
              fontSize: '0.72rem',
              background: activeTab === 'chat' ? 'rgba(255,255,255,0.25)' : 'var(--adm-border)'
            }}
          >
            Live Hub
          </span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TAB 1: MEETINGS & CALENDAR
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'meetings' && (
        <div>
          {/* Filter Bar */}
          <div
            className="adm-card"
            style={{
              padding: '1.25rem 1.4rem',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              borderRadius: '12px'
            }}
          >
            <span style={{ fontSize: '0.82rem', color: 'var(--adm-text-muted)', fontWeight: 700, marginRight: '0.25rem' }}>
              Meeting Type:
            </span>
            {(['All', 'Client Presentation', 'Sprint Planning', 'Lead Follow-up', 'Internal Sync'] as const).map(t => {
              const isSelected = selectedType === t;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={isSelected ? 'adm-btn adm-btn-primary adm-btn-sm' : 'adm-btn adm-btn-secondary adm-btn-sm'}
                  style={{
                    borderRadius: '20px',
                    padding: '0.45rem 1rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {/* Meeting Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredMeetings.map(meet => {
              const dateParts = meet.date.split('-');
              const dayStr = dateParts[2] || '16';
              const monthStr = dateParts[1] ? ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][parseInt(dateParts[1], 10) - 1] || 'OCT' : 'OCT';

              return (
                <div
                  key={meet.id}
                  className="adm-card adm-card-hover"
                  style={{
                    padding: '1.25rem 1.4rem',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1.25rem'
                  }}
                >
                  {/* Left: Date Block & Details */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flex: 1, minWidth: '300px' }}>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '12px',
                        background: 'var(--adm-bg)',
                        border: '1px solid var(--adm-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <span style={{ fontSize: '0.7rem', color: 'var(--adm-primary)', fontWeight: 800, textTransform: 'uppercase' }}>
                        {monthStr}
                      </span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--adm-text)', lineHeight: 1 }}>
                        {dayStr}
                      </span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span className="adm-badge adm-badge-primary">{meet.type}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                          <Clock size={13} color="var(--adm-primary)" /> {meet.time}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--adm-text)', margin: '4px 0' }}>
                        {meet.title}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--adm-text-muted)', marginBottom: '10px', lineHeight: 1.5 }}>
                        {meet.description}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.78rem', color: 'var(--adm-text-muted)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                          <MapPin size={13} color="var(--adm-primary)" /> {meet.location}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Users size={13} color="var(--adm-primary)" /> {meet.attendees.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Buttons (WhatsApp Dispatch + Video Call + Copy + Delete) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {/* Share on WhatsApp Button */}
                    <button
                      onClick={() => handleShareOnWhatsApp(meet)}
                      className="adm-btn"
                      style={{
                        background: '#25D366',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '0.55rem 1rem',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        cursor: 'pointer'
                      }}
                      title="Send WhatsApp invitation to team / client group"
                    >
                      <WhatsAppIcon size={15} color="#ffffff" />
                      <span>Share on WhatsApp</span>
                    </button>

                    {/* Join Video Call Button */}
                    {meet.meetUrl && (
                      <a
                        href={meet.meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="adm-btn adm-btn-primary"
                        style={{ fontSize: '0.82rem', borderRadius: '10px', padding: '0.55rem 1rem' }}
                      >
                        <Video size={14} />
                        <span>Join Video Call</span>
                      </a>
                    )}

                    {/* Copy Invite Button */}
                    <button
                      className="adm-btn adm-btn-secondary"
                      onClick={() => handleCopyInvite(meet)}
                      title="Copy WhatsApp formatted invitation text"
                      style={{ borderRadius: '10px', padding: '0.55rem 0.75rem' }}
                    >
                      <Copy size={14} />
                    </button>

                    {/* Delete Meeting Button (Managers/Directors) */}
                    {(isDirector || isManager) && (
                      <button
                        className="adm-btn adm-btn-danger"
                        onClick={() => deleteMeeting(meet.id)}
                        title="Cancel Meeting"
                        style={{ borderRadius: '10px', padding: '0.55rem 0.75rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredMeetings.length === 0 && (
              <div
                className="adm-card"
                style={{ textAlign: 'center', padding: '3.5rem 1.4rem', color: 'var(--adm-text-muted)', borderRadius: '12px' }}
              >
                <Calendar size={36} color="var(--adm-primary)" style={{ marginBottom: '0.75rem', opacity: 0.8 }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--adm-text)', margin: '0 0 0.25rem 0' }}>
                  No meetings found in this category
                </h4>
                <p style={{ fontSize: '0.82rem', margin: 0 }}>
                  Click "Schedule Meeting" to create an executive sync and dispatch meeting links over WhatsApp.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 2: DIRECTOR BULLETINS & COMMUNITY BOARD
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'community' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Banner */}
          <div
            className="adm-card"
            style={{
              padding: '1.25rem 1.4rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%)',
              border: '1px solid var(--adm-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'var(--adm-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0
                }}
              >
                <Sparkles size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--adm-text)', margin: '0 0 4px 0' }}>
                  Official Director & Leadership Announcements
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--adm-text-muted)', margin: 0 }}>
                  Company-wide executive directives, quarterly milestones, celebrations, and team video sync briefings.
                </p>
              </div>
            </div>

            {canPostAnnouncement && (
              <button
                className="adm-btn adm-btn-primary"
                onClick={() => setShowAddAnnModal(true)}
                style={{ borderRadius: '10px' }}
              >
                <Plus size={16} />
                <span>Post Bulletin</span>
              </button>
            )}
          </div>

          {/* Announcements List */}
          {announcements.map(ann => {
            const currentUserId = currentUser?.employeeId || currentUser?.id || '202600000002';
            const isLiked = ann.likedBy?.includes(currentUserId);

            return (
              <div
                key={ann.id}
                className="adm-card"
                style={{
                  padding: '1.25rem 1.4rem',
                  borderRadius: '12px',
                  border: ann.isDirectorPost ? '1px solid rgba(234, 88, 12, 0.4)' : '1px solid var(--adm-border)'
                }}
              >
                {/* Author Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img
                      src={ann.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={ann.authorName}
                      style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--adm-primary)' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--adm-text)' }}>
                          {ann.authorName}
                        </span>
                        {ann.isDirectorPost && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              background: 'var(--adm-primary)',
                              color: '#ffffff',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <ShieldCheck size={11} /> DIRECTOR
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)', fontWeight: 600 }}>
                        {ann.authorRole} • <span style={{ color: 'var(--adm-text-dim)' }}>{ann.postedAt}</span>
                      </span>
                    </div>
                  </div>

                  {/* Priority Tag */}
                  <div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        background:
                          ann.priority === 'Urgent'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : ann.priority === 'Celebration'
                            ? 'rgba(5, 150, 105, 0.15)'
                            : 'rgba(234, 88, 12, 0.15)',
                        color:
                          ann.priority === 'Urgent'
                            ? '#EF4444'
                            : ann.priority === 'Celebration'
                            ? '#059669'
                            : 'var(--adm-primary)',
                        border:
                          ann.priority === 'Urgent'
                            ? '1px solid rgba(239, 68, 68, 0.3)'
                            : ann.priority === 'Celebration'
                            ? '1px solid rgba(5, 150, 105, 0.3)'
                            : '1px solid rgba(234, 88, 12, 0.3)'
                      }}
                    >
                      {ann.priority} Notice
                    </span>
                  </div>
                </div>

                {/* Announcement Title & Content */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-text)', margin: '0 0 0.5rem 0' }}>
                  {ann.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--adm-text)', lineHeight: 1.6, margin: '0 0 1rem 0' }}>
                  {ann.content}
                </p>

                {/* Embedded Video Meeting Link (if present) */}
                {ann.meetingLink && (
                  <div
                    style={{
                      background: 'var(--adm-bg)',
                      border: '1px solid var(--adm-border)',
                      borderRadius: '10px',
                      padding: '0.9rem 1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: 'rgba(234, 88, 12, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--adm-primary)'
                        }}
                      >
                        <Video size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text)' }}>
                          Live All-Hands Video Session
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>
                          {ann.meetingLink}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <a
                        href={ann.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="adm-btn adm-btn-primary adm-btn-sm"
                        style={{ borderRadius: '8px' }}
                      >
                        <ExternalLink size={13} /> Join Google Meet
                      </a>
                      <button
                        onClick={() => {
                          const text = `📢 *ENTERPRENEX DIRECTOR BULLETIN*\n\n*${ann.title}*\n\n${ann.content}\n\n🔗 *Meeting Link:* ${ann.meetingLink}\n\n_Sent from Enterprenex EWMS_`;
                          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                        }}
                        className="adm-btn adm-btn-sm"
                        style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px' }}
                      >
                        <WhatsAppIcon size={14} color="#fff" /> Share Notice
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer: Tags & Likes & WhatsApp Broadcast */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--adm-border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {ann.tags?.map(t => (
                      <span
                        key={t}
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          background: 'var(--adm-bg)',
                          border: '1px solid var(--adm-border)',
                          color: 'var(--adm-text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Tag size={10} /> {t}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                      onClick={() => likeAnnouncement(ann.id)}
                      className="adm-btn adm-btn-secondary adm-btn-sm"
                      style={{
                        borderRadius: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        color: isLiked ? '#EF4444' : 'var(--adm-text-muted)'
                      }}
                    >
                      <Heart size={14} fill={isLiked ? '#EF4444' : 'none'} color={isLiked ? '#EF4444' : 'currentColor'} />
                      <span>{ann.likes} Likes</span>
                    </button>

                    <button
                      onClick={() => {
                        const text = `📢 *ENTERPRENEX DIRECTOR BULLETIN*\n\n*${ann.title}*\n\n${ann.content}\n\n_Sent via Enterprenex Work Management System (EWMS)_`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                      }}
                      className="adm-btn adm-btn-secondary adm-btn-sm"
                      style={{ borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      title="Share notice to team WhatsApp group"
                    >
                      <WhatsAppIcon size={14} color="#25D366" />
                      <span>Share on WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 3: TEAM CHAT & 1-ON-1 DIRECT MESSAGES
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'chat' && (
        <div
          className="adm-card"
          style={{
            padding: 0,
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            minHeight: '620px'
          }}
        >
          {/* Left Column: Channels & Colleagues */}
          <div
            style={{
              borderRight: '1px solid var(--adm-border)',
              background: 'var(--adm-bg)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Search Input */}
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--adm-border)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} color="var(--adm-text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  className="adm-input"
                  placeholder="Filter channels & team..."
                  value={chatSearchFilter}
                  onChange={e => setChatSearchFilter(e.target.value)}
                  style={{ paddingLeft: '2rem', fontSize: '0.8rem', borderRadius: '8px' }}
                />
              </div>
            </div>

            {/* Channels & People List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--adm-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
                Team Channels
              </div>

              {/* General Channel */}
              <button
                onClick={() => setActiveChatChannel('general')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.7rem 0.8rem',
                  borderRadius: '8px',
                  background: activeChatChannel === 'general' ? 'var(--adm-primary)' : 'transparent',
                  color: activeChatChannel === 'general' ? '#ffffff' : 'var(--adm-text)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  marginBottom: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={16} />
                  <span># General Hub</span>
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '10px',
                    background: activeChatChannel === 'general' ? 'rgba(255,255,255,0.25)' : 'var(--adm-border)',
                    color: activeChatChannel === 'general' ? '#ffffff' : 'var(--adm-text-muted)'
                  }}
                >
                  All Staff
                </span>
              </button>

              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--adm-text-muted)', textTransform: 'uppercase', margin: '1rem 0 0.5rem 0', paddingLeft: '0.5rem' }}>
                Direct Messages (1-on-1)
              </div>

              {/* Colleagues List */}
              {employees
                .filter(emp => !chatSearchFilter || emp.name.toLowerCase().includes(chatSearchFilter.toLowerCase()))
                .map(emp => {
                  const isSelected = activeChatChannel === emp.employeeId || activeChatChannel === emp.id;
                  const isEmpDirector = emp.role.includes('Director');

                  return (
                    <button
                      key={emp.id}
                      onClick={() => setActiveChatChannel(emp.employeeId || emp.id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '8px',
                        background: isSelected ? 'var(--adm-primary)' : 'transparent',
                        color: isSelected ? '#ffffff' : 'var(--adm-text)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        cursor: 'pointer',
                        marginBottom: '0.25rem'
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <img
                          src={emp.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                          alt={emp.name}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: '9px',
                            height: '9px',
                            borderRadius: '50%',
                            background: '#10B981',
                            border: '1.5px solid var(--adm-card-bg)'
                          }}
                        />
                      </div>

                      <div style={{ overflow: 'hidden', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {emp.name}
                          </span>
                          {isEmpDirector && (
                            <span
                              style={{
                                fontSize: '0.62rem',
                                padding: '0.1rem 0.35rem',
                                borderRadius: '4px',
                                background: isSelected ? 'rgba(255,255,255,0.3)' : 'rgba(234, 88, 12, 0.2)',
                                color: isSelected ? '#ffffff' : 'var(--adm-primary)',
                                fontWeight: 800
                              }}
                            >
                              DIR
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--adm-text-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {emp.role}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Right Column: Chat Conversation Stream & Input */}
          <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--adm-card-bg)' }}>
            {/* Chat Stream Header */}
            <div
              style={{
                padding: '1rem 1.4rem',
                borderBottom: '1px solid var(--adm-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: activeChatChannel === 'general' ? 'var(--adm-primary)' : 'rgba(5, 150, 105, 0.15)',
                    color: activeChatChannel === 'general' ? '#ffffff' : '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800
                  }}
                >
                  {activeChatChannel === 'general' ? <Users size={18} /> : (activePartner?.name[0] || 'C')}
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                    {activeChatChannel === 'general' ? '# General Team Hub' : activePartner?.name}
                  </h4>
                  <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-muted)' }}>
                    {activeChatChannel === 'general'
                      ? 'Enterprise public channel • All staff & management connected'
                      : `${activePartner?.role} • Active Shift (Pune HQ)`}
                  </div>
                </div>
              </div>

              {/* Quick Call & WhatsApp Action */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a
                  href="https://meet.google.com/enx-sprint-sync"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="adm-btn adm-btn-secondary adm-btn-sm"
                  style={{ borderRadius: '8px' }}
                >
                  <Video size={13} color="var(--adm-primary)" /> Meet
                </a>
                <button
                  onClick={() => {
                    const phone = activePartner?.phone || '';
                    const text = `Hi ${activePartner?.name || 'Team'}, connecting via Enterprenex EWMS portal.`;
                    const url = phone
                      ? `https://api.whatsapp.com/send?phone=${phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(text)}`
                      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  className="adm-btn adm-btn-sm"
                  style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px' }}
                >
                  <WhatsAppIcon size={14} color="#fff" /> WhatsApp
                </button>
              </div>
            </div>

            {/* Message History Bubble List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.4rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                background: 'var(--adm-bg)'
              }}
            >
              {displayedMessages.map(msg => {
                const isOwn = msg.senderId === currentUserId || msg.senderName === currentUser?.name;

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: isOwn ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      maxWidth: '85%',
                      alignSelf: isOwn ? 'flex-end' : 'flex-start'
                    }}
                  >
                    {!isOwn && (
                      <img
                        src={msg.senderAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                        alt={msg.senderName}
                        style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                    )}

                    <div>
                      {!isOwn && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--adm-text)' }}>
                            {msg.senderName}
                          </span>
                          {msg.isDirector && (
                            <span
                              style={{
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                background: 'var(--adm-primary)',
                                color: '#ffffff',
                                padding: '0.1rem 0.35rem',
                                borderRadius: '4px'
                              }}
                            >
                              DIR
                            </span>
                          )}
                          <span style={{ fontSize: '0.68rem', color: 'var(--adm-text-dim)' }}>
                            {msg.timestamp}
                          </span>
                        </div>
                      )}

                      <div
                        style={{
                          padding: '0.8rem 1.1rem',
                          borderRadius: isOwn ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                          background: isOwn ? 'var(--adm-primary)' : 'var(--adm-card-bg)',
                          color: isOwn ? '#ffffff' : 'var(--adm-text)',
                          border: isOwn ? 'none' : '1px solid var(--adm-border)',
                          fontSize: '0.85rem',
                          lineHeight: 1.5,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                      >
                        {msg.message}
                      </div>

                      {isOwn && (
                        <div style={{ textAlign: 'right', fontSize: '0.68rem', color: 'var(--adm-text-dim)', marginTop: '2px' }}>
                          {msg.timestamp} • Sent
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {displayedMessages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--adm-text-muted)' }}>
                  <MessageSquare size={32} color="var(--adm-primary)" style={{ opacity: 0.6, marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>
                    No messages yet in this channel. Send the first message to start collaborating!
                  </p>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendChat}
              style={{
                padding: '1rem 1.4rem',
                borderTop: '1px solid var(--adm-border)',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
                background: 'var(--adm-card-bg)'
              }}
            >
              <input
                type="text"
                className="adm-input"
                placeholder={
                  activeChatChannel === 'general'
                    ? 'Write a message to # General Team Hub...'
                    : `Send a direct message to ${activePartner?.name || 'colleague'}...`
                }
                value={chatInputText}
                onChange={e => setChatInputText(e.target.value)}
                style={{ flex: 1, borderRadius: '10px' }}
              />

              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                onClick={() => setChatInputText(prev => (prev ? `${prev} https://meet.google.com/enx-sprint-sync` : 'https://meet.google.com/enx-sprint-sync'))}
                title="Insert Google Meet URL"
                style={{ borderRadius: '10px' }}
              >
                <Video size={16} />
              </button>

              <button
                type="submit"
                className="adm-btn adm-btn-primary"
                style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Send size={15} />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL 1: SCHEDULE EVENT / MEETING (WITH WHATSAPP DISPATCH)
      ══════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()} style={{ borderRadius: '14px', maxWidth: '580px' }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--adm-text)', margin: '0 0 2px 0' }}>
                  Schedule Event / Meeting
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)', margin: 0 }}>
                  Enterprenex calendar integration with automated WhatsApp link dispatch
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting}>
              <div className="adm-form-group">
                <label className="adm-form-label">Meeting Title *</label>
                <input
                  className="adm-input"
                  required
                  value={fTitle}
                  onChange={e => setFTitle(e.target.value)}
                  placeholder="e.g. Solution Architecture Review / Sprint Kickoff"
                />
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Meeting Type</label>
                  <select className="adm-select" value={fType} onChange={e => setFType(e.target.value as any)}>
                    <option value="Sprint Planning">Sprint Planning</option>
                    <option value="Client Presentation">Client Presentation</option>
                    <option value="Lead Follow-up">Lead Follow-up</option>
                    <option value="Internal Sync">Internal Sync</option>
                    <option value="Project Milestone">Project Milestone</option>
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
                  <input
                    className="adm-input"
                    value={fTime}
                    onChange={e => setFTime(e.target.value)}
                    placeholder="11:00 AM - 12:00 PM"
                  />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Location / Platform</label>
                  <input
                    className="adm-input"
                    value={fLocation}
                    onChange={e => setFLocation(e.target.value)}
                    placeholder="Google Meet / Zoom / HQ Boardroom"
                  />
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Meeting Video Link URL (Google Meet / Zoom)</label>
                <input
                  className="adm-input"
                  value={fMeetUrl}
                  onChange={e => setFMeetUrl(e.target.value)}
                  placeholder="https://meet.google.com/abc-enterprenex"
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Agenda & Brief</label>
                <textarea
                  className="adm-textarea"
                  value={fDesc}
                  onChange={e => setFDesc(e.target.value)}
                  placeholder="Objectives, deliverables review, attendees to present, and action items..."
                  rows={3}
                />
              </div>

              {/* WhatsApp Broadcast Checkbox Option */}
              <div
                style={{
                  background: 'rgba(37, 211, 102, 0.1)',
                  border: '1px solid rgba(37, 211, 102, 0.3)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.25rem'
                }}
              >
                <input
                  type="checkbox"
                  id="chk-whatsapp-broadcast"
                  checked={broadcastOnWhatsApp}
                  onChange={e => setBroadcastOnWhatsApp(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#25D366', cursor: 'pointer' }}
                />
                <label htmlFor="chk-whatsapp-broadcast" style={{ fontSize: '0.82rem', color: 'var(--adm-text)', cursor: 'pointer', margin: 0, fontWeight: 600 }}>
                  Broadcast meeting link and formatted agenda to WhatsApp group upon confirmation
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>

                <button
                  type="submit"
                  className="adm-btn"
                  style={{
                    background: broadcastOnWhatsApp ? '#25D366' : 'var(--adm-primary)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.6rem 1.25rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {broadcastOnWhatsApp && <WhatsAppIcon size={16} color="#fff" />}
                  <span>{broadcastOnWhatsApp ? 'Schedule & Share on WhatsApp' : 'Confirm Schedule'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL 2: POST DIRECTOR BULLETIN / NOTICE
      ══════════════════════════════════════════════════════════════ */}
      {showAddAnnModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddAnnModal(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()} style={{ borderRadius: '14px', maxWidth: '580px' }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--adm-text)', margin: '0 0 2px 0' }}>
                  Post Director Community Bulletin
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)', margin: 0 }}>
                  Publish an executive notice to the entire Enterprenex workforce
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setShowAddAnnModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement}>
              <div className="adm-form-group">
                <label className="adm-form-label">Notice Title *</label>
                <input
                  className="adm-input"
                  required
                  value={annTitle}
                  onChange={e => setAnnTitle(e.target.value)}
                  placeholder="e.g. Q4 Deliverables & Town Hall Meeting"
                />
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Category / Priority</label>
                  <select
                    className="adm-select"
                    value={annPriority}
                    onChange={e => setAnnPriority(e.target.value as any)}
                  >
                    <option value="General">General Notice</option>
                    <option value="Urgent">Urgent Priority</option>
                    <option value="Policy">Policy Update</option>
                    <option value="Celebration">Celebration & Kudos</option>
                  </select>
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Tags (comma-separated)</label>
                  <input
                    className="adm-input"
                    value={annTags}
                    onChange={e => setAnnTags(e.target.value)}
                    placeholder="Director, Sprint, EWMS"
                  />
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Optional Video Meeting Link (Google Meet / Zoom)</label>
                <input
                  className="adm-input"
                  value={annMeetUrl}
                  onChange={e => setAnnMeetUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Bulletin Content *</label>
                <textarea
                  className="adm-textarea"
                  required
                  value={annContent}
                  onChange={e => setAnnContent(e.target.value)}
                  placeholder="Write the executive announcement details for all team members..."
                  rows={4}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowAddAnnModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary" style={{ borderRadius: '10px' }}>
                  Publish Bulletin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
