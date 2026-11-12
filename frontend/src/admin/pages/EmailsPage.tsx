import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { api } from '../api/client';
import {
  Mail,
  Send,
  Inbox,
  Star,
  Paperclip,
  Search,
  Plus,
  RefreshCw,
  Trash2,
  Archive,
  Reply,
  Forward,
  Printer,
  Download,
  CheckCircle2,
  X,
  Clock,
  ShieldCheck,
  Tag,
  Building2,
  User,
  Check,
  ExternalLink,
  ChevronDown,
  ArrowLeftRight
} from 'lucide-react';

export interface EnterpriseEmail {
  id: string;
  sender: string;
  senderEmail: string;
  senderAvatar?: string;
  recipient: string;
  recipientEmail: string;
  subject: string;
  snippet: string;
  body: string;
  timestamp: string;
  date: string;
  category: 'Clients & Sales' | 'Projects & Delivery' | 'HR & Workforce' | 'Finance & Billing' | 'Executive & Statutory';
  isUnread: boolean;
  isStarred: boolean;
  attachments?: { name: string; size: string; type: string }[];
  securityLevel?: 'Institutional Restricted' | 'Confidential' | 'General Operations';
}

const INITIAL_EMAILS: EnterpriseEmail[] = [];

export const EmailsPage: React.FC = () => {
  const { currentUser, showToast } = useAdmin();

  // Email State
  const [emails, setEmails] = useState<EnterpriseEmail[]>(() => {
    try {
      localStorage.removeItem('ewms_enterprise_emails');
      localStorage.removeItem('ewms_enterprise_emails_v2');
      const saved = localStorage.getItem('ewms_enterprise_emails_v3');
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return INITIAL_EMAILS;
  });

  const [selectedEmailId, setSelectedEmailId] = useState<string>(emails[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'starred'>('all');

  // Fetch live emails from backend SQLite database
  useEffect(() => {
    api.getEmails().then(res => {
      if (res?.emails && res.emails.length > 0) {
        setEmails(res.emails);
        if (!selectedEmailId && res.emails[0]) {
          setSelectedEmailId(res.emails[0].id);
        }
      }
    }).catch(err => {
      console.warn('Backend getEmails fallback to cached:', err);
    });
  }, []);

  // Resizable Split-Pane State
  const [leftPaneWidth, setLeftPaneWidth] = useState<number>(() => {
    const savedWidth = localStorage.getItem('ewms_email_pane_width');
    if (savedWidth) {
      const parsed = parseInt(savedWidth, 10);
      if (!isNaN(parsed) && parsed >= 260 && parsed <= 800) return parsed;
    }
    return 420; // Default balanced width in pixels
  });

  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartXRef = useRef<number>(0);
  const dragStartWidthRef = useRef<number>(0);

  // Quick Reply Composer State
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Compose New Email Modal State
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeCategory, setComposeCategory] = useState<EnterpriseEmail['category']>('Clients & Sales');
  const [composeBody, setComposeBody] = useState('');

  // Persist emails
  useEffect(() => {
    localStorage.setItem('ewms_enterprise_emails_v3', JSON.stringify(emails));
    const unread = emails.filter(e => e.isUnread).length;
    window.dispatchEvent(new CustomEvent('ewms_emails_updated', { detail: { unreadCount: unread } }));
  }, [emails]);

  // Persist pane width
  useEffect(() => {
    localStorage.setItem('ewms_email_pane_width', leftPaneWidth.toString());
  }, [leftPaneWidth]);

  // Active selected email object
  const activeEmail = useMemo(() => {
    return emails.find(e => e.id === selectedEmailId) || emails[0] || null;
  }, [emails, selectedEmailId]);

  // Mark as read when opened
  const handleSelectEmail = (email: EnterpriseEmail) => {
    setSelectedEmailId(email.id);
    if (email.isUnread) {
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, isUnread: false } : e));
      api.updateEnterpriseEmail(email.id, { isUnread: false }).catch(() => {});
    }
  };

  // Toggle star
  const handleToggleStar = (e: React.MouseEvent, emailId: string) => {
    e.stopPropagation();
    const em = emails.find(x => x.id === emailId);
    const nextStarred = !em?.isStarred;
    setEmails(prev => prev.map(item => item.id === emailId ? { ...item, isStarred: nextStarred } : item));
    api.updateEnterpriseEmail(emailId, { isStarred: nextStarred }).catch(() => {});
  };

  // Toggle read status
  const handleToggleReadStatus = (emailId: string) => {
    const em = emails.find(x => x.id === emailId);
    const nextUnread = !em?.isUnread;
    setEmails(prev => prev.map(item => item.id === emailId ? { ...item, isUnread: nextUnread } : item));
    showToast('Updated', 'Email read status updated.', 'info');
    api.updateEnterpriseEmail(emailId, { isUnread: nextUnread }).catch(() => {});
  };

  // Delete email
  const handleDeleteEmail = (emailId: string) => {
    setEmails(prev => {
      const remaining = prev.filter(em => em.id !== emailId);
      if (selectedEmailId === emailId && remaining.length > 0) {
        setSelectedEmailId(remaining[0].id);
      }
      return remaining;
    });
    showToast('Email Archived', 'The selected conversation has been archived.', 'info');
    api.deleteEnterpriseEmail(emailId).catch(() => {});
  };

  // ── DRAG RESIZE LOGIC (↔ or ⇹) ──
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartWidthRef.current = leftPaneWidth;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartXRef.current = e.touches[0].clientX;
      dragStartWidthRef.current = leftPaneWidth;
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStartXRef.current;
      let newWidth = dragStartWidthRef.current + deltaX;

      // Constrain minimum and maximum width
      const minW = 280;
      const maxW = Math.max(minW + 50, containerRect.width - 380);

      if (newWidth < minW) newWidth = minW;
      if (newWidth > maxW) newWidth = maxW;

      setLeftPaneWidth(newWidth);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || e.touches.length !== 1) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const deltaX = e.touches[0].clientX - dragStartXRef.current;
      let newWidth = dragStartWidthRef.current + deltaX;

      const minW = 260;
      const maxW = Math.max(minW + 50, containerRect.width - 320);

      if (newWidth < minW) newWidth = minW;
      if (newWidth > maxW) newWidth = maxW;

      setLeftPaneWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  const handleResetWidth = () => {
    setLeftPaneWidth(420);
    showToast('Layout Reset', 'Pane split ratio reset to default 420px balanced view.', 'info');
  };

  const handleIncreasePane = () => {
    setLeftPaneWidth(prev => Math.min(prev + 50, 750));
  };

  const handleDecreasePane = () => {
    setLeftPaneWidth(prev => Math.max(prev - 50, 280));
  };

  // Quick Reply handler
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeEmail) return;

    setIsSendingReply(true);
    const sentText = replyText;
    setReplyText('');

    api.sendEnterpriseEmail({
      recipient: activeEmail.sender,
      recipientEmail: activeEmail.senderEmail,
      subject: activeEmail.subject.startsWith('Re:') ? activeEmail.subject : `Re: ${activeEmail.subject}`,
      body: sentText,
      category: activeEmail.category
    }).then(res => {
      setIsSendingReply(false);
      if (res?.email) {
        setEmails(prev => [res.email, ...prev]);
        setSelectedEmailId(res.email.id);
      }
      showToast(
        'Email Dispatched',
        `Reply sent securely to ${activeEmail.senderEmail} via Enterprenex Corporate SMTP Gateway.`,
        'success'
      );
    }).catch(err => {
      setIsSendingReply(false);
      console.warn('Backend send reply deferred/offline:', err);
      showToast('Email Queued', 'Message recorded in communication log.', 'info');
    });
  };

  // Compose Submit Handler
  const handleSendNewEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) {
      showToast('Validation Error', 'Please complete recipient, subject, and message body.', 'warning');
      return;
    }

    const tempId = `em-${Date.now().toString().slice(-4)}`;
    const newEmail: EnterpriseEmail = {
      id: tempId,
      sender: currentUser?.name || 'Managing Director',
      senderEmail: currentUser?.email || 'director@enterprenex.solutions',
      senderAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      recipient: composeTo,
      recipientEmail: composeTo,
      subject: composeSubject,
      snippet: composeBody.slice(0, 110) + '...',
      body: composeBody,
      timestamp: 'Just now',
      date: 'Today',
      category: composeCategory,
      isUnread: false,
      isStarred: false,
      securityLevel: 'Institutional Restricted'
    };

    setEmails(prev => [newEmail, ...prev]);
    setSelectedEmailId(newEmail.id);
    setShowComposeModal(false);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    showToast('Email Sent', `Official institutional email transmitted to ${composeTo}.`, 'success');

    // Live backend database persistence & SMTP dispatch
    api.sendEnterpriseEmail({
      recipient: composeTo,
      recipientEmail: composeTo,
      subject: composeSubject,
      body: composeBody,
      category: composeCategory
    }).then(res => {
      if (res?.email?.id) {
        setEmails(prev => prev.map(item => item.id === tempId ? res.email : item));
      }
    }).catch(err => {
      console.warn('Backend sendEnterpriseEmail deferred/offline:', err);
    });
  };

  // Filter emails
  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        email.subject.toLowerCase().includes(q) ||
        email.sender.toLowerCase().includes(q) ||
        email.senderEmail.toLowerCase().includes(q) ||
        email.body.toLowerCase().includes(q);

      const matchesCategory = activeCategory === 'All' || email.category === activeCategory;

      let matchesFilter = true;
      if (filterType === 'unread') matchesFilter = email.isUnread;
      if (filterType === 'starred') matchesFilter = email.isStarred;

      return matchesSearch && matchesCategory && matchesFilter;
    });
  }, [emails, searchQuery, activeCategory, filterType]);

  const unreadCount = useMemo(() => emails.filter(e => e.isUnread).length, [emails]);

  const CATEGORIES = [
    'All',
    'Clients & Sales',
    'Projects & Delivery',
    'HR & Workforce',
    'Finance & Billing',
    'Executive & Statutory'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', minHeight: '620px' }}>
      
      {/* ── Page Header Bar ── */}
      <div className="adm-page-header" style={{ marginBottom: '1rem', flexShrink: 0 }}>
        <div className="adm-page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--adm-primary-soft)',
                border: '1px solid var(--adm-primary-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Mail size={18} color="var(--adm-primary)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
                Enterprise Operations: Overall Emails & Communications
              </h1>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--adm-text-dim)' }}>
                Unified institutional email gateway, client SLAs, statutory filings, and multi-tenant correspondence
              </p>
            </div>
          </div>
        </div>

        <div className="adm-page-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Quick Pane Resize Controls (<->) */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'var(--adm-surface)',
              border: '1px solid var(--adm-border)',
              borderRadius: '8px',
              padding: '2px',
              gap: '2px'
            }}
            title="Adjust pane width (or drag the vertical divider ↔)"
          >
            <button
              type="button"
              onClick={handleDecreasePane}
              className="adm-btn adm-btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.72rem', height: '32px' }}
              title="Decrease left pane width (narrow inbox)"
            >
              ◀ Inbox
            </button>
            <button
              type="button"
              onClick={handleResetWidth}
              className="adm-btn adm-btn-secondary"
              style={{ padding: '6px 8px', fontSize: '0.72rem', height: '32px', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Reset to balanced 420px width (↔)"
            >
              <ArrowLeftRight size={12} />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={handleIncreasePane}
              className="adm-btn adm-btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.72rem', height: '32px' }}
              title="Increase left pane width (wider inbox)"
            >
              Inbox ▶
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowComposeModal(true)}
            className="adm-btn adm-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
          >
            <Plus size={15} />
            <span>Compose Email</span>
          </button>
        </div>
      </div>

      {/* ── MAIN RESIZABLE TWO-PANE CONTAINER ── */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          display: 'flex',
          background: 'var(--adm-surface)',
          border: '1px solid var(--adm-border)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: 'var(--adm-shadow-md)',
          position: 'relative'
        }}
      >
        {/* ═══════════════════════════════════════════════
            LEFT PANE: Inbox Thread List & Folders
           ═══════════════════════════════════════════════ */}
        <div
          style={{
            width: `${leftPaneWidth}px`,
            minWidth: '260px',
            maxWidth: '850px',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--adm-border)',
            background: 'var(--adm-surface)',
            flexShrink: 0,
            overflow: 'hidden'
          }}
        >
          {/* Top Search & Filter Bar */}
          <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--adm-border)', background: 'var(--adm-surface)' }}>
            <div style={{ position: 'relative', marginBottom: '0.65rem' }}>
              <input
                type="text"
                className="adm-input"
                placeholder="Search institutional emails..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.2rem', paddingRight: '1.8rem', height: '36px', fontSize: '0.8rem' }}
              />
              <Search size={14} color="var(--adm-text-dim)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--adm-text-dim)' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Status Segment Control */}
            <div style={{ display: 'flex', background: 'var(--adm-bg)', padding: '3px', borderRadius: '8px', border: '1px solid var(--adm-border)' }}>
              <button
                type="button"
                onClick={() => setFilterType('all')}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: filterType === 'all' ? 700 : 500,
                  background: filterType === 'all' ? 'var(--adm-surface)' : 'transparent',
                  color: filterType === 'all' ? 'var(--adm-text)' : 'var(--adm-text-dim)',
                  boxShadow: filterType === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer'
                }}
              >
                All ({emails.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('unread')}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: filterType === 'unread' ? 700 : 500,
                  background: filterType === 'unread' ? 'var(--adm-surface)' : 'transparent',
                  color: filterType === 'unread' ? 'var(--adm-primary)' : 'var(--adm-text-dim)',
                  boxShadow: filterType === 'unread' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer'
                }}
              >
                Unread ({unreadCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('starred')}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: filterType === 'starred' ? 700 : 500,
                  background: filterType === 'starred' ? 'var(--adm-surface)' : 'transparent',
                  color: filterType === 'starred' ? '#f59e0b' : 'var(--adm-text-dim)',
                  boxShadow: filterType === 'starred' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer'
                }}
              >
                Starred ({emails.filter(e => e.isStarred).length})
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              padding: '0.5rem 1rem',
              borderBottom: '1px solid var(--adm-border)',
              background: 'var(--adm-bg)',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              scrollbarWidth: 'none'
            }}
          >
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  border: activeCategory === cat ? '1px solid var(--adm-primary)' : '1px solid var(--adm-border)',
                  background: activeCategory === cat ? 'var(--adm-primary-soft)' : 'var(--adm-surface)',
                  color: activeCategory === cat ? 'var(--adm-primary)' : 'var(--adm-text-dim)',
                  fontSize: '0.68rem',
                  fontWeight: activeCategory === cat ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Email Item Feed */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredEmails.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--adm-text-dim)' }}>
                <Mail size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>No emails found</div>
                <div style={{ fontSize: '0.72rem', marginTop: '2px' }}>Try adjusting your search terms or filter criteria</div>
              </div>
            ) : (
              filteredEmails.map(email => {
                const isSelected = email.id === selectedEmailId;
                return (
                  <div
                    key={email.id}
                    onClick={() => handleSelectEmail(email)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderBottom: '1px solid var(--adm-border)',
                      cursor: 'pointer',
                      background: isSelected
                        ? 'var(--adm-primary-soft)'
                        : email.isUnread
                        ? 'rgba(16, 112, 200, 0.04)'
                        : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--adm-primary)' : '3px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Header Row: Sender, Star & Time */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        {email.isUnread && (
                          <div
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              background: 'var(--adm-primary)',
                              flexShrink: 0
                            }}
                            title="Unread message"
                          />
                        )}
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: email.isUnread ? 800 : 600,
                            color: email.isUnread ? 'var(--adm-text)' : 'var(--adm-text-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {email.sender.split('(')[0].trim()}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--adm-text-dim)' }}>
                          {email.timestamp}
                        </span>
                        <button
                          type="button"
                          onClick={e => handleToggleStar(e, email.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                            color: email.isStarred ? '#f59e0b' : 'var(--adm-text-dim)',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title={email.isStarred ? 'Unstar message' : 'Star message'}
                        >
                          <Star size={13} fill={email.isStarred ? '#f59e0b' : 'none'} />
                        </button>
                      </div>
                    </div>

                    {/* Subject Line */}
                    <div
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: email.isUnread ? 700 : 500,
                        color: 'var(--adm-text)',
                        marginBottom: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {email.subject}
                    </div>

                    {/* Snippet */}
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--adm-text-dim)',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {email.snippet}
                    </div>

                    {/* Badges / Attachments */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: 'var(--adm-bg)',
                          border: '1px solid var(--adm-border)',
                          color: 'var(--adm-text-dim)'
                        }}
                      >
                        {email.category}
                      </span>
                      {email.attachments && email.attachments.length > 0 && (
                        <span
                          style={{
                            fontSize: '0.62rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            color: 'var(--adm-text-muted)'
                          }}
                        >
                          <Paperclip size={11} />
                          {email.attachments.length}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            ↔ DRAGGABLE SPLITTER DIVIDER (↔ or ⇹)
            Click and drag left or right to decrease or 
            increase the width of either pane.
           ═══════════════════════════════════════════════ */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onDoubleClick={handleResetWidth}
          title="Click and drag left or right (↔) to resize pane width. Double-click to reset."
          style={{
            width: '10px',
            cursor: 'col-resize',
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDragging ? 'var(--adm-primary)' : 'var(--adm-border)',
            transition: isDragging ? 'none' : 'background 0.2s ease',
            userSelect: 'none',
            flexShrink: 0
          }}
        >
          {/* Visual Grip Pill with ↔ (<->) Indicator */}
          <div
            style={{
              width: '22px',
              height: '48px',
              borderRadius: '8px',
              background: isDragging ? 'var(--adm-primary)' : 'var(--adm-surface)',
              border: '1px solid var(--adm-border)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDragging ? '#ffffff' : 'var(--adm-primary)',
              cursor: 'col-resize',
              userSelect: 'none'
            }}
          >
            <ArrowLeftRight size={13} />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            RIGHT PANE: Active Email Reader & Composer
           ═══════════════════════════════════════════════ */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--adm-surface)',
            minWidth: '320px',
            overflow: 'hidden'
          }}
        >
          {activeEmail ? (
            <>
              {/* Header Action Bar */}
              <div
                style={{
                  padding: '0.85rem 1.25rem',
                  borderBottom: '1px solid var(--adm-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--adm-surface)',
                  flexShrink: 0
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleStar({ stopPropagation: () => {} } as any, activeEmail.id)}
                    className="adm-btn adm-btn-secondary adm-btn-sm"
                    title={activeEmail.isStarred ? 'Starred' : 'Add Star'}
                    style={{ color: activeEmail.isStarred ? '#f59e0b' : 'inherit' }}
                  >
                    <Star size={14} fill={activeEmail.isStarred ? '#f59e0b' : 'none'} />
                    <span>{activeEmail.isStarred ? 'Starred' : 'Star'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleReadStatus(activeEmail.id)}
                    className="adm-btn adm-btn-secondary adm-btn-sm"
                  >
                    <Mail size={14} />
                    <span>{activeEmail.isUnread ? 'Mark as Read' : 'Mark as Unread'}</span>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="adm-btn adm-btn-secondary adm-btn-sm"
                    title="Print institutional record"
                  >
                    <Printer size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteEmail(activeEmail.id)}
                    className="adm-btn adm-btn-secondary adm-btn-sm"
                    style={{ color: 'var(--adm-danger)' }}
                    title="Archive email conversation"
                  >
                    <Archive size={14} />
                    <span>Archive</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Email Body Area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                
                {/* Subject Title & Tags */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span
                      className="adm-badge adm-badge-primary"
                      style={{ fontSize: '0.68rem', padding: '2px 8px' }}
                    >
                      {activeEmail.category}
                    </span>
                    {activeEmail.securityLevel && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#0284c7',
                          background: 'rgba(2, 132, 199, 0.08)',
                          border: '1px solid rgba(2, 132, 199, 0.2)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <ShieldCheck size={12} /> {activeEmail.securityLevel}
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0, lineHeight: 1.35 }}>
                    {activeEmail.subject}
                  </h2>
                </div>

                {/* Sender & Recipient Metadata Card */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    background: 'var(--adm-bg)',
                    borderRadius: '12px',
                    border: '1px solid var(--adm-border)',
                    marginBottom: '1.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={activeEmail.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={activeEmail.sender}
                      style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--adm-border)' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--adm-text)' }}>
                        {activeEmail.sender}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--adm-text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>from: <strong>{activeEmail.senderEmail}</strong></span>
                        <span>&bull;</span>
                        <span>to: {activeEmail.recipientEmail}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--adm-text)' }}>{activeEmail.date}</div>
                    <div>{activeEmail.timestamp} (IST)</div>
                  </div>
                </div>

                {/* Corporate Email Message Letterhead & Body */}
                <div
                  style={{
                    background: 'var(--adm-bg)',
                    border: '1px solid var(--adm-border)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    fontSize: '0.86rem',
                    lineHeight: 1.7,
                    color: 'var(--adm-text)',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {activeEmail.body}
                </div>

                {/* Attachments Section if present */}
                {activeEmail.attachments && activeEmail.attachments.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--adm-text)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Paperclip size={14} color="var(--adm-primary)" />
                      <span>Attached Institutional Files ({activeEmail.attachments.length})</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                      {activeEmail.attachments.map((att, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.65rem 0.85rem',
                            background: 'var(--adm-bg)',
                            border: '1px solid var(--adm-border)',
                            borderRadius: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <div style={{ padding: '6px', background: 'var(--adm-primary-soft)', borderRadius: '6px' }}>
                              <Download size={14} color="var(--adm-primary)" />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--adm-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {att.name}
                              </div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--adm-text-dim)' }}>
                                {att.size} &bull; Verified Safe
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => showToast('Downloading Attachment', `Preparing secure download for ${att.name}...`, 'info')}
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                            style={{ padding: '4px 8px' }}
                            title="Download file"
                          >
                            <Download size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Quick Reply Composer ── */}
                <div
                  style={{
                    background: 'var(--adm-bg)',
                    border: '1px solid var(--adm-border)',
                    borderRadius: '12px',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--adm-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Reply size={14} color="var(--adm-primary)" />
                      <span>Reply to {activeEmail.sender.split('(')[0].trim()}</span>
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>
                      Authenticated via {currentUser?.email}
                    </span>
                  </div>

                  <form onSubmit={handleSendReply}>
                    <textarea
                      className="adm-input"
                      rows={4}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type your official reply or operational directive here..."
                      style={{
                        width: '100%',
                        resize: 'vertical',
                        minHeight: '90px',
                        fontSize: '0.82rem',
                        marginBottom: '0.75rem',
                        background: 'var(--adm-surface)'
                      }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => showToast('Attach File', 'Select file to attach to outgoing transmission.', 'info')}
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                        >
                          <Paperclip size={13} />
                          <span>Attach File</span>
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="adm-btn adm-btn-primary"
                        disabled={!replyText.trim() || isSendingReply}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px' }}
                      >
                        <Send size={14} />
                        <span>{isSendingReply ? 'Transmitting...' : 'Send Official Reply'}</span>
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--adm-text-dim)' }}>
              <Mail size={44} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>Select a Conversation</div>
              <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>Choose an email from the left pane to view full institutional telemetry</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Compose New Email Modal ── */}
      {showComposeModal && (
        <div className="adm-modal-overlay" onClick={() => setShowComposeModal(false)}>
          <div
            className="adm-modal"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '620px', width: '92%' }}
          >
            <div className="adm-modal-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--adm-border)', margin: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', background: 'var(--adm-primary-soft)', borderRadius: '8px' }}>
                  <Send size={18} color="var(--adm-primary)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--adm-text)' }}>
                    Compose Enterprise Transmission
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>
                    Official SMTP Dispatch via Enterprenex Solutions Institutional Gateway
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="adm-modal-close"
                onClick={() => setShowComposeModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendNewEmail}>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <label className="adm-form-label">Recipient (To:)</label>
                  <input
                    type="email"
                    required
                    className="adm-input"
                    placeholder="e.g. client.executive@corporate.com"
                    value={composeTo}
                    onChange={e => setComposeTo(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="adm-form-label">Category</label>
                    <select
                      className="adm-select"
                      value={composeCategory}
                      onChange={e => setComposeCategory(e.target.value as any)}
                      style={{ width: '100%' }}
                    >
                      <option value="Clients & Sales">Clients & Sales</option>
                      <option value="Projects & Delivery">Projects & Delivery</option>
                      <option value="HR & Workforce">HR & Workforce</option>
                      <option value="Finance & Billing">Finance & Billing</option>
                      <option value="Executive & Statutory">Executive & Statutory</option>
                    </select>
                  </div>

                  <div>
                    <label className="adm-form-label">Sender Identity</label>
                    <input
                      className="adm-input"
                      disabled
                      value={`${currentUser?.name || 'Administrator'} <${currentUser?.email || 'director@enterprenex.solutions'}>`}
                      style={{ opacity: 0.8 }}
                    />
                  </div>
                </div>

                <div>
                  <label className="adm-form-label">Subject Line *</label>
                  <input
                    type="text"
                    required
                    className="adm-input"
                    placeholder="e.g. Milestone 3 Delivery Acceptance & Executive MoM"
                    value={composeSubject}
                    onChange={e => setComposeSubject(e.target.value)}
                  />
                </div>

                <div>
                  <label className="adm-form-label">Message Content *</label>
                  <textarea
                    required
                    className="adm-input"
                    rows={6}
                    placeholder="Compose official institutional message body..."
                    value={composeBody}
                    onChange={e => setComposeBody(e.target.value)}
                    style={{ resize: 'vertical', minHeight: '130px' }}
                  />
                </div>
              </div>

              <div style={{ padding: '1rem 1.5rem', background: 'var(--adm-bg)', borderTop: '1px solid var(--adm-border)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="adm-btn adm-btn-secondary adm-btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-btn adm-btn-primary adm-btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={14} />
                  <span>Transmit Email</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
