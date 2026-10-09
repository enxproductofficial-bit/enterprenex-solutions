import React, { useState, useRef } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  FileText,
  Search,
  Download,
  Trash2,
  Eye,
  Shield,
  X,
  UploadCloud,
  FileCheck,
  Plus
} from 'lucide-react';
import type { VaultDocument } from '../types';

const CATEGORIES = [
  'All',
  'Contracts',
  'NDA',
  'Proposals',
  'Quotations',
  'Invoices',
  'Technical Docs',
  'Client Docs',
  'Employee Docs'
];

export const DocumentsPage: React.FC = () => {
  const { documents, uploadDocument, deleteDocument, showToast } = useAdmin();
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);

  // Form & File State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fTitle, setFTitle] = useState('');
  const [fCategory, setFCategory] = useState<VaultDocument['category']>('Contracts');
  const [fVersion, setFVersion] = useState('v1.0');
  const [fFormat, setFFormat] = useState('PDF');
  const [fSize, setFSize] = useState('1.2 MB');
  const [fPermission, setFPermission] = useState<VaultDocument['accessPermission']>('Internal');
  const [fTags, setFTags] = useState('Legal, Enterprise, 2026');

  const filteredDocs = documents.filter(d => {
    const matchCat = selectedCat === 'All' || d.category === selectedCat;
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Auto-populate document name and details from selected file
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      if (!fTitle) setFTitle(nameWithoutExt);

      const extension = file.name.split('.').pop()?.toUpperCase() || 'PDF';
      setFFormat(extension);

      // Compute friendly file size
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      const sizeInKb = (file.size / 1024).toFixed(0);
      setFSize(file.size > 1024 * 1024 ? `${sizeInMb} MB` : `${sizeInKb} KB`);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let docUrl = '#';
    if (selectedFile) {
      docUrl = URL.createObjectURL(selectedFile);
    }

    uploadDocument({
      title: fTitle || (selectedFile ? selectedFile.name : 'Untitled Document'),
      category: fCategory,
      version: fVersion,
      fileFormat: fFormat,
      fileSize: fSize,
      accessPermission: fPermission,
      tags: fTags.split(',').map(s => s.trim()).filter(Boolean),
      url: docUrl
    });

    setShowUploadModal(false);
    setSelectedFile(null);
    setFTitle('');
    showToast('Upload Successful', `${fTitle || 'Document'} secured in central vault.`, 'success');
  };

  const handleDownload = (doc: VaultDocument) => {
    if (doc.url && doc.url !== '#') {
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = `${doc.title}.${doc.fileFormat.toLowerCase()}`;
      link.click();
    }
    showToast('Download Started', `Downloading ${doc.title} (${doc.fileFormat})`, 'info');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <h1>Central Document Vault & IP Repository</h1>
          <p>Encrypted vault for client NDAs, master service agreements, technical specifications & compliance records</p>
        </div>
        <div className="adm-page-actions">
          <button className="adm-btn adm-btn-primary" onClick={() => setShowUploadModal(true)}>
            <UploadCloud size={16} />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="adm-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-dim)' }} />
            <input
              type="text"
              className="adm-input"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Search document vault by title or tags..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--adm-text-muted)', fontWeight: 600 }}>
              {filteredDocs.length} Documents
            </span>
            <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={() => setShowUploadModal(true)}>
              <Plus size={14} /> Add Document
            </button>
          </div>
        </div>

        {/* Category buttons */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              style={{
                background: selectedCat === cat ? 'var(--adm-primary)' : 'var(--adm-bg)',
                color: selectedCat === cat ? '#fff' : 'var(--adm-text-muted)',
                border: '1px solid var(--adm-border)',
                borderRadius: '6px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid / Table */}
      {filteredDocs.length > 0 ? (
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Document Title & Format</th>
                <th>Category</th>
                <th>Version</th>
                <th>Access Level</th>
                <th>File Size</th>
                <th>Uploaded Date & By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--adm-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--adm-primary)', flexShrink: 0 }}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{doc.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)', display: 'flex', gap: '4px', marginTop: '2px' }}>
                          {doc.tags.map((t, idx) => <span key={idx} className="adm-badge adm-badge-neutral" style={{ padding: '1px 5px', fontSize: '0.65rem' }}>{t}</span>)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="adm-badge adm-badge-neutral">{doc.category}</span>
                  </td>
                  <td>
                    <span className="adm-badge adm-badge-primary">{doc.version}</span>
                  </td>
                  <td>
                    <span className={`adm-badge ${
                      doc.accessPermission === 'Admin Only' ? 'adm-badge-danger' :
                      doc.accessPermission === 'Confidential' ? 'adm-badge-warning' :
                      doc.accessPermission === 'Internal' ? 'adm-badge-info' : 'adm-badge-success'
                    }`}>
                      <Shield size={11} />
                      {doc.accessPermission}
                    </span>
                  </td>
                  <td>{doc.fileSize} ({doc.fileFormat})</td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: '#fff' }}>{doc.uploadDate}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>by {doc.uploadedBy}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="adm-btn adm-btn-sm adm-btn-secondary" onClick={() => setPreviewDoc(doc)} title="Preview Details">
                        <Eye size={13} />
                      </button>
                      <button className="adm-btn adm-btn-sm adm-btn-primary" onClick={() => handleDownload(doc)} title="Download File">
                        <Download size={13} />
                      </button>
                      <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => deleteDocument(doc.id)} title="Delete File">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="adm-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(246, 97, 53, 0.1)', color: 'var(--adm-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <UploadCloud size={30} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem 0' }}>
            No Documents Uploaded in this Category
          </h3>
          <p style={{ color: 'var(--adm-text-muted)', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
            Securely upload NDAs, client contracts, proposals, invoices, and technical documentation into the central repository.
          </p>
          <button className="adm-btn adm-btn-primary" onClick={() => setShowUploadModal(true)}>
            <UploadCloud size={16} />
            <span>Upload Document Now</span>
          </button>
        </div>
      )}

      {/* ── PREVIEW DOCUMENT MODAL ── */}
      {previewDoc && (
        <div className="adm-modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Vault Document Metadata</h3>
              <button className="adm-modal-close" onClick={() => setPreviewDoc(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1rem', background: 'var(--adm-bg)', borderRadius: '8px', border: '1px solid var(--adm-border)', marginBottom: '1rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{previewDoc.title}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--adm-primary)', marginTop: '4px' }}>Category: {previewDoc.category} • Version: {previewDoc.version}</div>
            </div>

            <div className="adm-grid-2" style={{ marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--adm-text-dim)' }}>File Format:</span>
                <div style={{ fontWeight: 700, color: '#fff' }}>{previewDoc.fileFormat} ({previewDoc.fileSize})</div>
              </div>
              <div>
                <span style={{ color: 'var(--adm-text-dim)' }}>Access Permission:</span>
                <div style={{ fontWeight: 700, color: '#fff' }}>{previewDoc.accessPermission}</div>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--adm-text-dim)' }}>Uploaded On:</span>
                <div style={{ fontWeight: 700, color: '#fff' }}>{previewDoc.uploadDate}</div>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--adm-text-dim)' }}>Author / Uploader:</span>
                <div style={{ fontWeight: 700, color: '#fff' }}>{previewDoc.uploadedBy}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="adm-btn adm-btn-secondary" onClick={() => setPreviewDoc(null)}>Close</button>
              <button className="adm-btn adm-btn-primary" onClick={() => handleDownload(previewDoc)}>
                <Download size={14} />
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── UPLOAD DOCUMENT MODAL WITH REAL FILE PICKER ── */}
      {showUploadModal && (
        <div className="adm-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="adm-modal-content adm-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Upload Document to Vault</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)' }}>Securely store PDF, DOCX, ZIP, or spreadsheet files with access controls</p>
              </div>
              <button className="adm-modal-close" onClick={() => setShowUploadModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              {/* Drag & Drop File Picker Zone */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                accept=".pdf,.docx,.doc,.xlsx,.xls,.zip,.png,.jpg,.jpeg,.txt,.csv"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--adm-primary)',
                  background: 'rgba(246, 97, 53, 0.04)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  marginBottom: '1.25rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {selectedFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                    <FileCheck size={32} color="var(--adm-success)" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>{selectedFile.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>
                        {fSize} • {fFormat} Document (Click to change file)
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <UploadCloud size={36} color="var(--adm-primary)" style={{ margin: '0 auto 8px auto' }} />
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                      Click to Browse or Drag & Drop File Here
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '4px' }}>
                      Supports PDF, Word (.docx), Excel (.xlsx), ZIP, PNG, JPG (Up to 50MB)
                    </div>
                  </div>
                )}
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Document Title *</label>
                <input
                  className="adm-input"
                  required
                  value={fTitle}
                  onChange={e => setFTitle(e.target.value)}
                  placeholder="e.g. Master Services Agreement 2026"
                />
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-form-label">Category</label>
                  <select className="adm-select" value={fCategory} onChange={e => setFCategory(e.target.value as any)}>
                    <option value="Contracts">Contracts</option>
                    <option value="NDA">NDA</option>
                    <option value="Proposals">Proposals</option>
                    <option value="Quotations">Quotations</option>
                    <option value="Invoices">Invoices</option>
                    <option value="Technical Docs">Technical Docs</option>
                    <option value="Client Docs">Client Docs</option>
                    <option value="Employee Docs">Employee Docs</option>
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Version</label>
                  <input className="adm-input" value={fVersion} onChange={e => setFVersion(e.target.value)} placeholder="v1.0" />
                </div>
              </div>

              <div className="adm-grid-3">
                <div className="adm-form-group">
                  <label className="adm-form-label">File Format</label>
                  <input className="adm-input" value={fFormat} onChange={e => setFFormat(e.target.value)} />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Access Level</label>
                  <select className="adm-select" value={fPermission} onChange={e => setFPermission(e.target.value as any)}>
                    <option value="Internal">Internal (All Staff)</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Admin Only">Admin Only</option>
                    <option value="Public">Public</option>
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">File Size</label>
                  <input className="adm-input" value={fSize} onChange={e => setFSize(e.target.value)} />
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Search Tags (Comma separated)</label>
                <input className="adm-input" value={fTags} onChange={e => setFTags(e.target.value)} placeholder="Legal, Architecture, NDA" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">
                  <UploadCloud size={16} />
                  <span>Upload & Encrypt Document</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
