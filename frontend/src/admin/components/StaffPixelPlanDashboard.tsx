import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  FileText,
  Video,
  Plus,
  CheckSquare,
  MessageSquare,
  LifeBuoy,
  Coffee,
  MessageCircle,
  Phone,
  Mail,
  MoreHorizontal,
  Briefcase,
  Users,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Clock
} from 'lucide-react';
import type { Task, Employee } from '../types';
import { EmployeeSelfServiceHub } from './EmployeeSelfServiceHub';

interface StaffPixelPlanDashboardProps {
  currentEmpProfile: Employee | any;
  myTasks: Task[];
  attendancePunchedIn: boolean;
  punchInTime: string;
  handleToggleAttendance: () => void;
  onOpenSupportModal: () => void;
  onOpenMeetModal: () => void;
  onOpenLeaveModal: () => void;
  onSelectTask: (task: Task) => void;
  safeMeetings: any[];
}

export const StaffPixelPlanDashboard: React.FC<StaffPixelPlanDashboardProps> = ({
  currentEmpProfile,
  myTasks,
  attendancePunchedIn,
  punchInTime,
  handleToggleAttendance,
  onOpenSupportModal,
  onOpenMeetModal,
  onOpenLeaveModal,
  onSelectTask,
  safeMeetings
}) => {
  const navigate = useNavigate();
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [calendarMonth, setCalendarMonth] = useState<number>(9); // 9 = October (0-indexed)
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<number>(17);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(y => y - 1);
    } else {
      setCalendarMonth(m => m - 1);
    }
    setCalendarSelectedDate(1);
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(y => y + 1);
    } else {
      setCalendarMonth(m => m + 1);
    }
    setCalendarSelectedDate(1);
  };

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 = Sun
  const prevMonthTotalDays = new Date(calendarYear, calendarMonth, 0).getDate();

  const leadingDays = Array.from(
    { length: firstDayOfWeek },
    (_, i) => prevMonthTotalDays - firstDayOfWeek + i + 1
  );
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const selectedDateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(calendarSelectedDate).padStart(2, '0')}`;
  const meetingsOnSelectedDate = (safeMeetings || []).filter(m => m && m.date === selectedDateStr);
  const tasksDueOnSelectedDate = (myTasks || []).filter(t => t && t.dueDate === selectedDateStr);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 1. PIXELPLAN HERO & QUICK FEATURE ACTION CARDS ROW */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className="adm-card"
        style={{
          padding: '1.75rem 2rem',
          background: 'linear-gradient(135deg, var(--adm-surface, #ffffff) 0%, rgba(37, 99, 235, 0.04) 100%)',
          border: '1px solid var(--adm-border, #e2e8f0)',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        {/* Left Welcome Title */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(37, 99, 235, 0.08)', color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: attendancePunchedIn ? '#10b981' : '#f59e0b' }} />
            <span>{attendancePunchedIn ? `Active Shift • Checked in at ${punchInTime}` : 'Shift Standby • Click Punch In'}</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>({currentEmpProfile?.employeeId || 'ZCX-EMP-0001'})</span>
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--adm-text, #0f172a)', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2 }}>
            Hello, {currentEmpProfile?.name ? currentEmpProfile.name.split(' ')[0] : 'Staff'}!<br />
            <span style={{ color: 'var(--adm-text, #0f172a)' }}>Welcome back.</span>
          </h1>
          <p style={{ color: 'var(--adm-text-muted, #64748b)', fontSize: '0.9rem', margin: '6px 0 0 0' }}>
            Stay in the loop — check your updates, meetings and active deliverables
          </p>
        </div>

        {/* Right Quick Feature Showcase Cards (PixelPlan style) */}
        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Plus Card */}
          <div
            onClick={onOpenSupportModal}
            title="Submit Support Request / Internal Ticket"
            style={{
              width: '80px',
              height: '96px',
              borderRadius: '16px',
              background: 'var(--adm-surface-hover, #f1f5f9)',
              border: '1px dashed var(--adm-border, #cbd5e1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <Plus size={22} />
            </div>
          </div>

          {/* Card 1: Stay Organized */}
          <div
            onClick={() => navigate('/admin/tasks')}
            style={{
              width: '148px',
              height: '96px',
              padding: '12px 14px',
              borderRadius: '16px',
              background: 'var(--adm-surface, #ffffff)',
              border: '1px solid var(--adm-border, #e2e8f0)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.15s ease'
            }}
          >
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--adm-text, #0f172a)' }}>Stay Organized</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--adm-text-dim, #64748b)', lineHeight: 1.25, marginTop: '2px' }}>
                Tasks, meetings & projects clearly structured
              </div>
            </div>
          </div>

          {/* Card 2: Sync all Files */}
          <div
            onClick={() => navigate('/admin/documents')}
            style={{
              width: '148px',
              height: '96px',
              padding: '12px 14px',
              borderRadius: '16px',
              background: 'var(--adm-surface, #ffffff)',
              border: '1px solid var(--adm-border, #e2e8f0)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.15s ease'
            }}
          >
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--adm-text, #0f172a)' }}>Sync all Files</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--adm-text-dim, #64748b)', lineHeight: 1.25, marginTop: '2px' }}>
                Every kind of document synced in vault
              </div>
            </div>
          </div>

          {/* Card 3: Cooperate */}
          <div
            onClick={onOpenMeetModal}
            style={{
              width: '148px',
              height: '96px',
              padding: '12px 14px',
              borderRadius: '16px',
              background: 'var(--adm-surface, #ffffff)',
              border: '1px solid var(--adm-border, #e2e8f0)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.15s ease'
            }}
          >
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Video size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--adm-text, #0f172a)' }}>Cooperate</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--adm-text-dim, #64748b)', lineHeight: 1.25, marginTop: '2px' }}>
                Team work & 1:1 manager sync
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 1b. CONSULTAO / MODA QUICK APPLICATIONS & MANAGER INTERACTION BAR */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className="adm-card"
        style={{
          padding: '1rem 1.4rem',
          borderRadius: '16px',
          border: '1px solid var(--adm-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        {/* Quick Applications (Consultao App Launcher) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--adm-text-dim)', letterSpacing: '0.5px' }}>
            Quick Launch:
          </span>
          <button
            type="button"
            onClick={() => navigate('/admin/tasks')}
            className="adm-btn adm-btn-secondary adm-btn-sm"
            style={{ borderRadius: '10px', padding: '0.35rem 0.75rem', fontSize: '0.78rem', gap: '5px' }}
          >
            <CheckSquare size={14} color="#2563eb" />
            <span>Sprint Tasks ({myTasks.length})</span>
          </button>
          <button
            type="button"
            onClick={onOpenMeetModal}
            className="adm-btn adm-btn-secondary adm-btn-sm"
            style={{ borderRadius: '10px', padding: '0.35rem 0.75rem', fontSize: '0.78rem', gap: '5px' }}
          >
            <Video size={14} color="#10b981" />
            <span>Google Meet 1:1</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/documents')}
            className="adm-btn adm-btn-secondary adm-btn-sm"
            style={{ borderRadius: '10px', padding: '0.35rem 0.75rem', fontSize: '0.78rem', gap: '5px' }}
          >
            <FileText size={14} color="#f59e0b" />
            <span>Compliance Vault</span>
          </button>
          <button
            type="button"
            onClick={onOpenSupportModal}
            className="adm-btn adm-btn-secondary adm-btn-sm"
            style={{ borderRadius: '10px', padding: '0.35rem 0.75rem', fontSize: '0.78rem', gap: '5px' }}
          >
            <LifeBuoy size={14} color="#ec4899" />
            <span>Submit Ticket</span>
          </button>
          <button
            type="button"
            onClick={onOpenLeaveModal}
            className="adm-btn adm-btn-secondary adm-btn-sm"
            style={{ borderRadius: '10px', padding: '0.35rem 0.75rem', fontSize: '0.78rem', gap: '5px' }}
          >
            <Coffee size={14} color="#8b5cf6" />
            <span>Apply Leave</span>
          </button>
        </div>

        {/* Direct Reporting Manager Quick Contact (Consultao Style) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--adm-bg)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--adm-border)' }}>
          <div style={{ fontSize: '0.72rem' }}>
            <span style={{ color: 'var(--adm-text-dim)' }}>Lead: </span>
            <strong style={{ color: 'var(--adm-text)' }}>{currentEmpProfile?.reportingManager || 'Rohit Pawar (MD)'}</strong>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <a
              href={`https://wa.me/919226860060?text=${encodeURIComponent(
                `Hi Rohit Sir, update from ${currentEmpProfile?.name || 'Staff'} (${currentEmpProfile?.employeeId || 'ZCX-EMP-0001'}).`
              )}`}
              target="_blank"
              rel="noreferrer"
              style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
              title="Direct WhatsApp"
            >
              <MessageCircle size={13} />
            </a>
            <a
              href="tel:+919226860060"
              style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'var(--adm-surface)', border: '1px solid var(--adm-border)', color: 'var(--adm-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
              title="Direct Call"
            >
              <Phone size={13} />
            </a>
            <a
              href="mailto:director@enterprenex.solutions"
              style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'var(--adm-surface)', border: '1px solid var(--adm-border)', color: 'var(--adm-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
              title="Official Email"
            >
              <Mail size={13} />
            </a>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 2. MIDDLE 3-CARD ROW (PixelPlan Layout) */}
      {/* Notifications & Feed | Upcoming Meetings | Task Completed Velocity */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="adm-grid-3" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>

        {/* CARD 1: Notifications */}
        <div
          className="adm-card"
          style={{
            padding: '1.4rem',
            borderRadius: '18px',
            border: '1px solid var(--adm-border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                Notifications
              </h3>
              <button className="adm-btn adm-btn-secondary" style={{ padding: '2px 6px', border: 'none', background: 'transparent' }}>
                <MoreHorizontal size={16} color="var(--adm-text-dim)" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Notification 1 */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--adm-text)' }}>
                    You have 1 new announcement
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', marginTop: '2px' }}>
                    All-Hands Team Meeting tomorrow 7:00 PM IST &bull; 1 hour ago
                  </div>
                </div>
              </div>

              {/* Notification 2 */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageSquare size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--adm-text)' }}>
                    Rohit Pawar sent a message
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', marginTop: '2px' }}>
                    Sprint backlog & Phase 2 architecture reviewed &bull; 25 minutes ago
                  </div>
                </div>
              </div>

              {/* Notification 3 */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--adm-text)' }}>
                    Biometric Attendance Verified
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', marginTop: '2px' }}>
                    {attendancePunchedIn ? `Checked in at ${punchInTime}` : 'Standby for shift punch'} &bull; Today
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.2rem', paddingTop: '0.75rem', borderTop: '1px solid var(--adm-border)' }}>
            <span
              onClick={onOpenSupportModal}
              style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}
            >
              View all updates &rarr;
            </span>
          </div>
        </div>

        {/* CARD 2: Upcoming meetings */}
        <div
          className="adm-card"
          style={{
            padding: '1.4rem',
            borderRadius: '18px',
            border: '1px solid var(--adm-border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                Upcoming meetings
              </h3>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={15} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Meeting 1 */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--adm-text-dim)', letterSpacing: '0.5px' }}>
                  10:00 - 11:30 AM
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--adm-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                    <Briefcase size={15} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text)' }}>
                      Meeting with the Client
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>
                      Architecture & Cloud Presale
                    </div>
                  </div>
                </div>
              </div>

              {/* Meeting 2 */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563eb', letterSpacing: '0.5px' }}>
                  7:00 - 8:00 PM (Tomorrow)
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                    <Users size={15} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--adm-text)' }}>
                      Team All-Hands Meeting
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>
                      Google Meet &bull; Chaired by Rohit Pawar
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.2rem', paddingTop: '0.75rem', borderTop: '1px solid var(--adm-border)' }}>
            <a
              href="https://meet.google.com"
              target="_blank"
              rel="noreferrer"
              className="adm-btn adm-btn-primary adm-btn-sm"
              style={{ width: '100%', justifyContent: 'center', borderRadius: '8px', fontSize: '0.78rem' }}
            >
              <Video size={13} />
              <span>Join Google Meet Session</span>
            </a>
          </div>
        </div>

        {/* CARD 3: Task Completed (Velocity Analytics Bar Chart) */}
        <div
          className="adm-card"
          style={{
            padding: '1.4rem',
            borderRadius: '18px',
            border: '1px solid var(--adm-border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                Task Completed
              </h3>
              <button className="adm-btn adm-btn-secondary" style={{ padding: '2px 6px', border: 'none', background: 'transparent' }}>
                <MoreHorizontal size={16} color="var(--adm-text-dim)" />
              </button>
            </div>

            {/* PixelPlan Bar Chart Illustration */}
            <div style={{ height: '115px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', padding: '0 4px' }}>
              {/* January */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ width: '100%', height: '40px', background: 'var(--adm-surface-hover, #e2e8f0)', borderRadius: '8px' }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--adm-text-dim)', marginTop: '6px' }}>Jan</span>
              </div>
              {/* February */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', top: '-18px', background: '#2563eb', color: '#fff', fontSize: '0.58rem', fontWeight: 800, padding: '1px 4px', borderRadius: '4px' }}>+3%</span>
                <div style={{ width: '100%', height: '62px', background: 'var(--adm-surface-hover, #e2e8f0)', borderRadius: '8px' }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--adm-text-dim)', marginTop: '6px' }}>Feb</span>
              </div>
              {/* March */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ width: '100%', height: '48px', background: 'var(--adm-surface-hover, #e2e8f0)', borderRadius: '8px' }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--adm-text-dim)', marginTop: '6px' }}>Mar</span>
              </div>
              {/* April (Active Spike) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', top: '-18px', background: '#2563eb', color: '#fff', fontSize: '0.58rem', fontWeight: 800, padding: '1px 4px', borderRadius: '4px' }}>+5%</span>
                <div style={{ width: '100%', height: '88px', background: '#3b82f6', borderRadius: '8px', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)' }} />
                <span style={{ fontSize: '0.65rem', color: '#2563eb', fontWeight: 700, marginTop: '6px' }}>Apr</span>
              </div>
              {/* May */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ width: '100%', height: '68px', background: 'var(--adm-surface-hover, #e2e8f0)', borderRadius: '8px' }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--adm-text-dim)', marginTop: '6px' }}>May</span>
              </div>
              {/* June */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ width: '100%', height: '54px', background: 'var(--adm-surface-hover, #e2e8f0)', borderRadius: '8px' }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--adm-text-dim)', marginTop: '6px' }}>Jun</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--adm-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--adm-text-dim)' }}>Sprint Velocity Rate</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#10b981' }}>94% High Efficiency</span>
          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 3. BOTTOM ROW (PixelPlan Layout) */}
      {/* Today Tasks | My Calendar (Compact Widget) | Workspace Pro Focus Card */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="adm-grid-3" style={{ gridTemplateColumns: '1.4fr 1fr 0.9fr', gap: '1.25rem' }}>

        {/* COLUMN 1: Today Tasks */}
        <div
          className="adm-card"
          style={{
            padding: '1.4rem',
            borderRadius: '18px',
            border: '1px solid var(--adm-border)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--adm-text)', margin: 0 }}>
                Today Tasks
              </h3>
              {/* Assignee Avatar Stack */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={currentEmpProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={currentEmpProfile?.name || 'Staff'}
                  style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #fff', objectFit: 'cover' }}
                />
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                  alt="Manager"
                  style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #fff', marginLeft: '-6px', objectFit: 'cover' }}
                />
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#e2e8f0',
                    color: '#64748b',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '-6px',
                    border: '2px solid #fff'
                  }}
                >
                  +
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="adm-btn adm-btn-secondary adm-btn-sm"
                onClick={() => navigate('/admin/tasks')}
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
              >
                View All ({myTasks.length})
              </button>
            </div>
          </div>

          {/* Task Items with Progress Bars (PixelPlan style) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myTasks.length > 0 ? (
              myTasks.slice(0, 3).map((t) => {
                const progressPercent = t.status === 'Completed' || t.status === 'Approved' ? 100 : t.status === 'In Review' ? 80 : t.status === 'In Progress' ? 50 : 15;
                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTask(t)}
                    style={{
                      padding: '12px 14px',
                      background: 'var(--adm-bg)',
                      borderRadius: '12px',
                      border: '1px solid var(--adm-border)',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--adm-text)' }}>
                          {t.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)', marginTop: '2px' }}>
                          Due: {t.dueDate} &bull; Est: {t.estimatedHours || 2} hours &bull; {t.projectName}
                        </div>
                      </div>
                      <span
                        className={`adm-badge ${
                          t.status === 'Completed' || t.status === 'Approved' ? 'adm-badge-success' :
                          t.status === 'In Review' ? 'adm-badge-warning' : 'adm-badge-primary'
                        }`}
                        style={{ fontSize: '0.68rem' }}
                      >
                        {t.status}
                      </span>
                    </div>

                    {/* Progress Bar & Telemetry Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', minWidth: '32px' }}>
                        {progressPercent}%
                      </span>
                      <div style={{ flex: 1, height: '6px', background: 'var(--adm-surface-hover, #e2e8f0)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${progressPercent}%`,
                            height: '100%',
                            background: progressPercent === 100 ? '#10b981' : '#2563eb',
                            borderRadius: '3px'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', color: 'var(--adm-text-dim)', fontSize: '0.72rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <CheckSquare size={12} /> {(t.subtasks || []).length || 4}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <MessageSquare size={12} /> {(t.comments || []).length || 2}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--adm-text-dim)', fontSize: '0.85rem' }}>
                No pending tasks assigned for today. All milestones clear!
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: My Calendar (Fully Dynamic & Interactive Month Calendar) */}
        <div
          className="adm-card"
          style={{
            padding: '1.4rem',
            borderRadius: '18px',
            border: '1px solid var(--border, #E8E8E8)',
            background: 'var(--surface, #FFFFFF)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            {/* Header: Month Switcher & Quick Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div
                onClick={() => navigate('/admin/calendar')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                title="Click to open Full Corporate Calendar"
              >
                <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'var(--blue-light, #E6EDF5)', color: 'var(--primary, #1070C8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={14} />
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary, #111827)', margin: 0 }}>
                  My Calendar
                </h3>
              </div>

              {/* Month Navigation Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="adm-btn adm-btn-secondary"
                  title="Previous Month"
                  style={{ padding: '3px 6px', border: '1px solid var(--border, #E8E8E8)', background: 'var(--surface-secondary, #F8F8F8)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <ChevronLeft size={14} />
                </button>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary, #111827)', minWidth: '95px', textAlign: 'center' }}>
                  {monthNames[calendarMonth]} {calendarYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="adm-btn adm-btn-secondary"
                  title="Next Month"
                  style={{ padding: '3px 6px', border: '1px solid var(--border, #E8E8E8)', background: 'var(--surface-secondary, #F8F8F8)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted, #9CA3AF)', marginBottom: '8px' }}>
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Dynamic Month Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.75rem' }}>
              {/* Preceding month padding days */}
              {leadingDays.map((pDay, idx) => (
                <span key={`lead-${idx}`} style={{ padding: '6px 0', color: 'var(--text-muted, #9CA3AF)', opacity: 0.35, fontSize: '0.72rem' }}>
                  {pDay}
                </span>
              ))}

              {/* Days of Current Month */}
              {monthDays.map(day => {
                const dayDateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isToday = calendarYear === 2026 && calendarMonth === 9 && day === 17;
                const hasMeeting = (safeMeetings || []).some(m => m && m.date === dayDateStr);
                const hasTask = (myTasks || []).some(t => t && t.dueDate === dayDateStr);
                const isSelected = calendarSelectedDate === day;

                return (
                  <div
                    key={day}
                    onClick={() => setCalendarSelectedDate(day)}
                    style={{
                      padding: '5px 0',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      margin: '0 auto',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontWeight: isToday || isSelected ? 800 : hasMeeting || hasTask ? 700 : 500,
                      background: isSelected
                        ? 'var(--primary, #1070C8)'
                        : isToday
                        ? 'var(--blue-light, #E6EDF5)'
                        : 'transparent',
                      color: isSelected
                        ? '#ffffff'
                        : isToday
                        ? 'var(--primary, #1070C8)'
                        : 'var(--text-primary, #111827)',
                      border: isToday && !isSelected
                        ? '1.5px solid var(--primary, #1070C8)'
                        : hasMeeting && !isSelected
                        ? '1px dashed var(--primary-highlight, #197ED8)'
                        : 'none',
                      position: 'relative',
                      transition: 'all 0.15s ease'
                    }}
                    title={`${day} ${monthNames[calendarMonth]} ${calendarYear}${hasMeeting ? ' (Meeting Scheduled)' : ''}${hasTask ? ' (Task Due)' : ''}`}
                  >
                    <span>{day}</span>
                    {/* Event Indicator Dot */}
                    {hasMeeting && !isSelected && (
                      <span style={{ position: 'absolute', bottom: '2px', width: '3px', height: '3px', borderRadius: '50%', background: 'var(--primary, #1070C8)' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Selected Day Event Details */}
          <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border, #E8E8E8)', fontSize: '0.74rem' }}>
            {meetingsOnSelectedDate.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: 'var(--primary, #1070C8)' }}>
                    📅 {calendarSelectedDate} {monthNames[calendarMonth].slice(0, 3)}: {meetingsOnSelectedDate[0].title}
                  </span>
                  {meetingsOnSelectedDate[0].meetUrl && (
                    <a
                      href={meetingsOnSelectedDate[0].meetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="adm-btn adm-btn-primary"
                      style={{ padding: '2px 8px', fontSize: '0.68rem', borderRadius: '4px', textDecoration: 'none' }}
                    >
                      Join
                    </a>
                  )}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #6B7280)' }}>
                  {meetingsOnSelectedDate[0].time} &bull; {meetingsOnSelectedDate[0].location}
                </div>
              </div>
            ) : tasksDueOnSelectedDate.length > 0 ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#f59e0b' }}>⚠️ Task Due ({calendarSelectedDate} {monthNames[calendarMonth].slice(0, 3)}):</span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #6B7280)' }}>{tasksDueOnSelectedDate[0].title}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectTask(tasksDueOnSelectedDate[0])}
                  className="adm-btn adm-btn-secondary"
                  style={{ padding: '2px 8px', fontSize: '0.68rem', borderRadius: '4px' }}
                >
                  View
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted, #9CA3AF)', fontSize: '0.72rem' }}>
                  {calendarSelectedDate} {monthNames[calendarMonth].slice(0, 3)}: No sessions scheduled
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={onOpenMeetModal}
                    className="adm-btn adm-btn-secondary"
                    style={{ padding: '2px 7px', fontSize: '0.68rem', borderRadius: '4px' }}
                    title="Schedule a new meeting"
                  >
                    + Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/calendar')}
                    className="adm-btn adm-btn-primary"
                    style={{ padding: '2px 7px', fontSize: '0.68rem', borderRadius: '4px' }}
                    title="Open Full Corporate Calendar"
                  >
                    Full View
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: Workspace Pro Resource Card (PixelPlan "Get Premium" blue card style) */}
        <div
          style={{
            padding: '1.4rem',
            borderRadius: '18px',
            background: 'linear-gradient(145deg, #1d4ed8 0%, #2563eb 100%)',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle background glow circle */}
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.12)',
              pointerEvents: 'none'
            }}
          />

          <div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={22} color="#ffffff" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.3px', color: '#ffffff' }}>
              Workspace Active!
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.45, margin: 0 }}>
              Zero-Trust security controls, anti-tamper monitored stopwatch, and direct 1-on-1 manager sync active.
            </p>
          </div>

          <div style={{ marginTop: '1.4rem' }}>
            <button
              type="button"
              onClick={handleToggleAttendance}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: '#ffffff',
                color: '#1e3a8a',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <Clock size={15} color="#2563eb" />
              <span>{attendancePunchedIn ? 'Punch Out Today' : 'Punch Attendance In'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 4. OFFICIAL EWMS SECTION 4: EMPLOYEE SELF-SERVICE & WORKSPACE SUITE */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <EmployeeSelfServiceHub
        currentEmpProfile={currentEmpProfile}
        myTasks={myTasks}
        attendancePunchedIn={attendancePunchedIn}
        punchInTime={punchInTime}
        onToggleAttendance={handleToggleAttendance}
      />

    </div>
  );
};
