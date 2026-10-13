import { useState, useEffect } from 'react';

export interface VisitorEvent {
  id: string;
  visitorId: string;
  sessionId: string;
  type: 'pageview' | 'interaction';
  path: string;
  title?: string;
  action?: string;
  details?: Record<string, any>;
  referrer?: string;
  screen?: string;
  browser?: string;
  os?: string;
  device?: string;
  timestamp: string;
}

const STORAGE_KEY = 'enx_visitor_telemetry';

export const INITIAL_VISITOR_SESSIONS: VisitorEvent[] = [
  {
    id: 'evt-live-1',
    visitorId: 'vst_9281a',
    sessionId: 'sess_184',
    type: 'pageview',
    path: '/',
    title: 'Enterprenex Solutions - AI Enterprise Systems',
    referrer: 'https://www.google.com/',
    screen: '1920x1080',
    browser: 'Chrome 124',
    os: 'Windows 11',
    device: 'Desktop',
    timestamp: new Date(Date.now() - 45000).toISOString()
  },
  {
    id: 'evt-live-2',
    visitorId: 'vst_9281a',
    sessionId: 'sess_184',
    type: 'interaction',
    action: 'Clicked "Explore Enterprise Services"',
    path: '/',
    browser: 'Chrome 124',
    os: 'Windows 11',
    device: 'Desktop',
    timestamp: new Date(Date.now() - 30000).toISOString()
  },
  {
    id: 'evt-live-3',
    visitorId: 'vst_4812f',
    sessionId: 'sess_992',
    type: 'pageview',
    path: '/services/cloud-solutions',
    title: 'Cloud & DevOps Engineering | Enterprenex',
    referrer: 'https://linkedin.com/in/company',
    screen: '390x844',
    browser: 'Safari Mobile',
    os: 'iOS 17',
    device: 'Mobile',
    timestamp: new Date(Date.now() - 120000).toISOString()
  },
  {
    id: 'evt-live-4',
    visitorId: 'vst_4812f',
    sessionId: 'sess_992',
    type: 'interaction',
    action: 'Clicked "Schedule Free Architecture Audit"',
    path: '/services/cloud-solutions',
    browser: 'Safari Mobile',
    os: 'iOS 17',
    device: 'Mobile',
    timestamp: new Date(Date.now() - 95000).toISOString()
  },
  {
    id: 'evt-live-5',
    visitorId: 'vst_7731e',
    sessionId: 'sess_543',
    type: 'pageview',
    path: '/contact',
    title: 'Contact Engineering Team | Enterprenex',
    referrer: 'Direct Visit',
    screen: '1440x900',
    browser: 'Firefox',
    os: 'macOS',
    device: 'Desktop',
    timestamp: new Date(Date.now() - 240000).toISOString()
  }
];

export function getStoredVisitorTelemetry(): VisitorEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_VISITOR_SESSIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_VISITOR_SESSIONS;
  } catch {
    return INITIAL_VISITOR_SESSIONS;
  }
}

export function useVisitorTelemetry() {
  const [events, setEvents] = useState<VisitorEvent[]>(getStoredVisitorTelemetry());

  useEffect(() => {
    const handleEvent = (e: any) => {
      if (e.detail) {
        setEvents(prev => [e.detail, ...prev.slice(0, 99)]);
      }
    };

    window.addEventListener('enx:telemetry', handleEvent);
    return () => window.removeEventListener('enx:telemetry', handleEvent);
  }, []);

  return events;
}
