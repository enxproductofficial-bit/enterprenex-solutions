import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAdmin();

  if (toasts.length === 0) return null;

  return (
    <div className="adm-toast-container">
      {toasts.map(t => {
        let Icon = CheckCircle2;
        let iconColor = 'var(--adm-success)';
        if (t.type === 'error') {
          Icon = XCircle;
          iconColor = 'var(--adm-danger)';
        } else if (t.type === 'warning') {
          Icon = AlertCircle;
          iconColor = 'var(--adm-warning)';
        } else if (t.type === 'info') {
          Icon = Info;
          iconColor = 'var(--adm-info)';
        }

        return (
          <div key={t.id} className={`adm-toast adm-toast-${t.type}`}>
            <Icon size={20} color={iconColor} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div className="adm-toast-title">{t.title}</div>
              <div className="adm-toast-msg">{t.message}</div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--adm-text-dim)',
                cursor: 'pointer',
                padding: '2px'
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
