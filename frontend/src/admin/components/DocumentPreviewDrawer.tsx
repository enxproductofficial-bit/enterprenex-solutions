import React from 'react';
import {
  X,
  Printer,
  Download,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
  Shield,
  Lock
} from 'lucide-react';
import type { VaultDocument, Employee } from '../types';

interface DocumentPreviewDrawerProps {
  doc: VaultDocument;
  onClose: () => void;
  onSetVerificationStatus: (doc: VaultDocument, status: 'Verified' | 'Pending Verification' | 'Rejected') => void;
  onDownload: (doc: VaultDocument) => void;
  onPrint: (doc: VaultDocument) => void;
  onOpenEmailModal: (doc: VaultDocument) => void;
  canManageVerification: boolean;
  empId?: string;
  emp?: Employee;
  verificationStatus: 'Verified' | 'Pending Verification' | 'Rejected' | 'Not Submitted';
  effectiveUrl: string;
  generateDocumentHtml: (doc: VaultDocument, emp?: Employee) => string;
}

export const DocumentPreviewDrawer: React.FC<DocumentPreviewDrawerProps> = ({
  doc,
  onClose,
  onSetVerificationStatus,
  onDownload,
  onPrint,
  onOpenEmailModal,
  canManageVerification,
  empId,
  emp,
  verificationStatus,
  effectiveUrl,
  generateDocumentHtml
}) => {
  const isImage = effectiveUrl && effectiveUrl.startsWith('data:image');
  const isPdf = effectiveUrl && (effectiveUrl.startsWith('data:application/pdf') || effectiveUrl.endsWith('.pdf'));

  return (
    <div className="adm-drawer-overlay" onClick={onClose}>
      <div
        className="adm-preview-drawer"
        onClick={e => e.stopPropagation()}
        style={{ width: 'clamp(440px, 56vw, 860px)' }}
      >
        {/* ── Drawer Header ── */}
        <div className="adm-drawer-header">
          <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span className="adm-badge adm-badge-primary">{doc.version || 'v1.0'}</span>
              <span className="adm-badge adm-badge-neutral">{doc.category}</span>
              {empId && (
                <span
                  className="adm-badge adm-badge-info"
                  style={{ fontFamily: 'monospace', fontWeight: 700 }}
                >
                  ID: {empId}
                </span>
              )}
              <span
                className={`adm-badge ${
                  verificationStatus === 'Verified'
                    ? 'adm-badge-success'
                    : verificationStatus === 'Rejected'
                    ? 'adm-badge-danger'
                    : 'adm-badge-warning'
                }`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                {verificationStatus === 'Verified' ? (
                  <CheckCircle2 size={11} />
                ) : verificationStatus === 'Rejected' ? (
                  <XCircle size={11} />
                ) : (
                  <Clock size={11} />
                )}
                <span>{verificationStatus}</span>
              </span>
            </div>

            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--adm-text, #1a1a1a)',
                margin: '4px 0 0 0',
                lineHeight: 1.35,
                wordBreak: 'break-word'
              }}
            >
              {doc.title}
            </h2>

            <div style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)', marginTop: '5px' }}>
              Uploaded on <strong>{doc.uploadDate}</strong> by {doc.uploadedBy} &bull; Classification: {doc.accessPermission}
              {doc.verifiedBy && ` &bull; Verified by ${doc.verifiedBy}`}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <button
              className="adm-btn adm-btn-sm adm-btn-secondary"
              onClick={() => onPrint(doc)}
              title="Print or Save as PDF"
            >
              <Printer size={13} />
              <span className="adm-btn-text-responsive">Print / PDF</span>
            </button>
            <button
              className="adm-btn adm-btn-sm adm-btn-primary"
              onClick={() => onDownload(doc)}
              title="Download Document"
            >
              <Download size={13} />
              <span className="adm-btn-text-responsive">Download</span>
            </button>
            <button className="adm-modal-close" onClick={onClose} title="Close Drawer (Esc)">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Verification Action Toolbar for Director / HR ── */}
        {canManageVerification && (
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.02)',
              borderBottom: '1px solid var(--adm-border)',
              padding: '0.75rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--adm-text-muted)' }}>
              <Lock size={13} color="var(--adm-primary)" />
              <span>KYC Verification Action for </span>
              <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{empId || 'General Staff'}</strong>
              {emp && <span style={{ fontWeight: 600 }}>({emp.name})</span>}
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                className="adm-btn adm-btn-sm"
                style={{
                  background: verificationStatus === 'Verified' ? '#059669' : 'rgba(16, 185, 129, 0.12)',
                  color: verificationStatus === 'Verified' ? '#fff' : '#059669',
                  border: '1px solid ' + (verificationStatus === 'Verified' ? '#059669' : 'rgba(16, 185, 129, 0.3)'),
                  fontSize: '0.74rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 9px'
                }}
                onClick={() => onSetVerificationStatus(doc, 'Verified')}
                title="Mark as Verified & Authenticated"
              >
                <CheckCircle2 size={12} />
                <span>Mark as Verified</span>
              </button>

              <button
                className="adm-btn adm-btn-sm"
                style={{
                  background: verificationStatus === 'Pending Verification' ? '#d97706' : 'rgba(245, 158, 11, 0.12)',
                  color: verificationStatus === 'Pending Verification' ? '#fff' : '#d97706',
                  border: '1px solid ' + (verificationStatus === 'Pending Verification' ? '#d97706' : 'rgba(245, 158, 11, 0.3)'),
                  fontSize: '0.74rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 9px'
                }}
                onClick={() => onSetVerificationStatus(doc, 'Pending Verification')}
                title="Mark as Pending Verification"
              >
                <Clock size={12} />
                <span>Mark as Pending</span>
              </button>

              <button
                className="adm-btn adm-btn-sm"
                style={{
                  background: verificationStatus === 'Rejected' ? '#dc2626' : 'rgba(239, 68, 68, 0.12)',
                  color: verificationStatus === 'Rejected' ? '#fff' : '#dc2626',
                  border: '1px solid ' + (verificationStatus === 'Rejected' ? '#dc2626' : 'rgba(239, 68, 68, 0.3)'),
                  fontSize: '0.74rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 9px'
                }}
                onClick={() => onSetVerificationStatus(doc, 'Rejected')}
                title="Reject Document"
              >
                <XCircle size={12} />
                <span>Reject</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Drawer Body: Screen-Adaptive Document Reader ── */}
        <div className="adm-drawer-body" style={{ padding: '1.25rem 1.5rem', background: 'var(--adm-bg, #fafafa)' }}>
          {/* Tags & Metadata Overview Card */}
          <div
            style={{
              background: 'var(--adm-surface, #ffffff)',
              border: '1px solid var(--adm-border)',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--adm-text-muted)' }}>
                <Shield size={13} color="#10b981" />
                <span>Access Permission: <strong>{doc.accessPermission}</strong></span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)' }}>
                File Size: <strong style={{ color: 'var(--adm-text)' }}>{doc.fileSize}</strong> ({doc.fileFormat || 'PDF'})
              </div>
            </div>

            {doc.tags && doc.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                {doc.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="adm-badge adm-badge-neutral"
                    style={{ fontSize: '0.7rem', padding: '2px 7px' }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 1. Image Viewer */}
          {isImage && (
            <div
              style={{
                textAlign: 'center',
                padding: '1.5rem',
                background: '#090d16',
                borderRadius: '12px',
                border: '1px solid var(--adm-border)'
              }}
            >
              <img
                src={effectiveUrl}
                alt={doc.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '600px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
                }}
              />
              <div style={{ marginTop: '0.85rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                High-Resolution Verified Image Record &bull; {doc.fileSize}
              </div>
            </div>
          )}

          {/* 2. Embedded PDF Viewer */}
          {isPdf && (
            <div
              style={{
                width: '100%',
                height: '620px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid var(--adm-border)',
                background: '#ffffff'
              }}
            >
              <iframe
                src={effectiveUrl}
                title={doc.title}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          )}

          {/* 3. Official Corporate Document Paper Reader */}
          {!isImage && !isPdf && (
            <div
              style={{
                background: '#ffffff',
                color: '#0f172a',
                borderRadius: '12px',
                padding: '2.5rem 2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                border: '1px solid var(--adm-border)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
              dangerouslySetInnerHTML={{
                __html: generateDocumentHtml(doc, emp)
                  .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
                  .replace(/<!DOCTYPE html>[\s\S]*?<body.*?>/i, '')
                  .replace(/<\/body>[\s\S]*?<\/html>/i, '')
              }}
            />
          )}
        </div>

        {/* ── Drawer Footer ── */}
        <div className="adm-drawer-footer" style={{ padding: '1rem 1.5rem', background: 'var(--adm-surface, #ffffff)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)' }}>
            Employee ID: <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{empId || 'General'}</strong> &bull; Status: <strong style={{ color: 'var(--adm-text)' }}>{verificationStatus}</strong>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="adm-btn adm-btn-secondary"
              onClick={() => onOpenEmailModal(doc)}
            >
              <Mail size={14} />
              <span>Email Document</span>
            </button>
            <button className="adm-btn adm-btn-primary" onClick={() => onDownload(doc)}>
              <Download size={14} />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DocumentPreviewDrawer;
