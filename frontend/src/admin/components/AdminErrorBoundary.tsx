import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside Enterprise Admin boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
            background: 'var(--adm-bg, #090a0d)',
            color: 'var(--adm-text, #ffffff)',
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          <div
            style={{
              maxWidth: '560px',
              width: '100%',
              background: 'var(--adm-surface, #101216)',
              border: '1px solid rgba(234, 88, 12, 0.3)',
              borderRadius: '16px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(234, 88, 12, 0.12)',
                border: '1.5px solid #ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                color: '#ea580c'
              }}
            >
              <AlertTriangle size={32} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--adm-text, #fff)' }}>
              {this.props.fallbackTitle || 'Enterprise Workspace Recovered'}
            </h2>

            <p style={{ fontSize: '0.88rem', color: 'var(--adm-text-dim, #94a3b8)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              An unexpected render fault was captured and contained safely by the system.
              {this.state.error?.message ? ` (${this.state.error.message})` : ''}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.reload();
                }}
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
              >
                <RefreshCw size={15} />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                onClick={() => {
                  window.location.href = '/admin/team';
                }}
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
              >
                <ArrowLeft size={15} />
                <span>Go to My Attendance & Team</span>
              </button>

              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                onClick={() => {
                  window.location.href = '/login';
                }}
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
              >
                <Home size={15} />
                <span>Return to Login</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
