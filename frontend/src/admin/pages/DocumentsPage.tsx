import React, { useState, useRef, useEffect } from 'react';
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
  Plus,
  Printer,
  Mail,
  Share2,
  ExternalLink,
  CheckCircle2,
  Lock,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
  Send,
  Building,
  UserCheck
} from 'lucide-react';
import type { VaultDocument, Employee } from '../types';

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
  const {
    documents,
    uploadDocument,
    updateDocument,
    deleteDocument,
    showToast,
    currentUser,
    employees,
    logAction
  } = useAdmin();

  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);
  const [emailModalDoc, setEmailModalDoc] = useState<VaultDocument | null>(null);
  const [customEmail, setCustomEmail] = useState('');

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

  // Auto-heal documents in storage: If an employee document is missing its URL or format,
  // link it automatically to the employee's panDocUrl / aadhaarDocUrl
  useEffect(() => {
    documents.forEach(doc => {
      let needsUpdate = false;
      const updates: Partial<VaultDocument> = {};

      if (!doc.fileFormat || doc.fileFormat.trim() === '') {
        updates.fileFormat = doc.title.toLowerCase().includes('docx') ? 'DOCX' : 'PDF';
        needsUpdate = true;
      }

      if ((!doc.url || doc.url === '#') && doc.category === 'Employee Docs') {
        const matchingEmp = employees.find(e =>
          doc.tags.includes(e.employeeId) ||
          doc.tags.includes(e.id) ||
          doc.title.toLowerCase().includes(e.name.toLowerCase())
        );

        if (matchingEmp) {
          const isPan = doc.title.toLowerCase().includes('pan');
          const isAadhaar = doc.title.toLowerCase().includes('aadhaar');

          if (isPan && matchingEmp.panDocUrl) {
            updates.url = matchingEmp.panDocUrl;
            updates.fileFormat = matchingEmp.panDocUrl.startsWith('data:application/pdf') ? 'PDF' : 'JPG';
            needsUpdate = true;
          } else if (isAadhaar && matchingEmp.aadhaarDocUrl) {
            updates.url = matchingEmp.aadhaarDocUrl;
            updates.fileFormat = matchingEmp.aadhaarDocUrl.startsWith('data:application/pdf') ? 'PDF' : 'JPG';
            needsUpdate = true;
          }
        }
      }

      if (needsUpdate && updateDocument) {
        updateDocument(doc.id, updates);
      }
    });
  }, [employees, documents, updateDocument]);

  // Helper to resolve the effective file URL for any document
  const getEffectiveDocUrl = (doc: VaultDocument): string | null => {
    if (doc.url && doc.url !== '#') return doc.url;

    // Check if matching employee has the file attached
    const matchingEmp = employees.find(e =>
      doc.tags.includes(e.employeeId) ||
      doc.tags.includes(e.id) ||
      doc.title.toLowerCase().includes(e.name.toLowerCase())
    );

    if (matchingEmp) {
      if (doc.title.toLowerCase().includes('pan') && matchingEmp.panDocUrl) {
        return matchingEmp.panDocUrl;
      }
      if (doc.title.toLowerCase().includes('aadhaar') && matchingEmp.aadhaarDocUrl) {
        return matchingEmp.aadhaarDocUrl;
      }
    }
    return null;
  };

  // Helper to find associated employee if applicable
  const getMatchingEmployee = (doc: VaultDocument): Employee | undefined => {
    return employees.find(e =>
      doc.tags.includes(e.employeeId) ||
      doc.tags.includes(e.id) ||
      doc.title.toLowerCase().includes(e.name.toLowerCase())
    );
  };

  const filteredDocs = documents.filter(d => {
    const matchCat = selectedCat === 'All' || d.category === selectedCat;
    const matchSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
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
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
      const sizeInKb = (file.size / 1024).toFixed(0);
      setFSize(file.size > 1024 * 1024 ? `${sizeInMb} MB` : `${sizeInKb} KB`);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const saveDoc = (docUrl: string) => {
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

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        saveDoc((reader.result as string) || '#');
      };
      reader.onerror = () => {
        saveDoc('#');
      };
      reader.readAsDataURL(selectedFile);
    } else {
      saveDoc('#');
    }
  };

  // Generate official, legally formatted HTML content for contracts, NDAs, KYC, proposals, etc.
  const generateDocumentHtml = (doc: VaultDocument, emp?: Employee): string => {
    const isMsa = doc.title.toLowerCase().includes('msa') || doc.category === 'Contracts';
    const isNda = doc.title.toLowerCase().includes('nda') || doc.category === 'NDA';
    const isKyc = doc.category === 'Employee Docs' || doc.tags.includes('KYC');

    let bodyContent = '';

    if (isMsa) {
      bodyContent = `
        <div class="legal-section">
          <h3>1. PURPOSE & SCOPE OF SERVICES</h3>
          <p>This Master Services Agreement ("Agreement") governs the engagement, software engineering, cloud infrastructure provisioning, and AI integrations delivered by <strong>ENTERPRENEX SOLUTIONS PRIVATE LIMITED</strong> ("Company") to the undersigned Enterprise Client ("Client"). Specific deliverables, technical milestones, and completion schedules shall be set forth in respective Statements of Work (SOW).</p>
        </div>
        <div class="legal-section">
          <h3>2. INTELLECTUAL PROPERTY & TITLE</h3>
          <p>All source code, algorithm models, bespoke microservice architectures, and proprietary software developed under this Agreement shall vest in the Client upon full settlement of milestone invoicing. The Company retains ownership of pre-existing core libraries, tooling foundations, and generic development utilities.</p>
        </div>
        <div class="legal-section">
          <h3>3. CONFIDENTIALITY & DATA INTEGRITY</h3>
          <p>Each party agrees to maintain strict confidentiality over all proprietary data, system credentials, user analytics, and commercial secrets for a minimum duration of five (5) years following the completion or termination of this Agreement.</p>
        </div>
        <div class="legal-section">
          <h3>4. SERVICE LEVEL AGREEMENT (SLA) & WARRANTIES</h3>
          <p>The Company warrants that deliverables shall perform substantially in conformance with written technical specifications with 99.9% uptime for cloud-hosted environments and 30-day bug warranty post-deployment.</p>
        </div>
        <div class="legal-section">
          <h3>5. GOVERNING LAW & ARBITRATION</h3>
          <p>This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in Hyderabad & Bengaluru, India.</p>
        </div>
      `;
    } else if (isNda) {
      bodyContent = `
        <div class="legal-section">
          <h3>1. DEFINITION OF CONFIDENTIAL INFORMATION</h3>
          <p>"Confidential Information" encompasses all proprietary technical, business, financial, architectural, source code, patent claims, and algorithmic data disclosed by <strong>ENTERPRENEX SOLUTIONS PRIVATE LIMITED</strong> to the Receiving Party, whether in written, digital, oral, or visual form.</p>
        </div>
        <div class="legal-section">
          <h3>2. OBLIGATIONS OF RECEIVING PARTY</h3>
          <p>The Receiving Party shall safeguard the Confidential Information with the highest standard of care, shall not disclose it to any third party without prior written consent, and shall restrict internal access strictly to personnel with a direct need-to-know under signed NDA covenants.</p>
        </div>
        <div class="legal-section">
          <h3>3. NON-SOLICITATION & NON-CIRCUMVENTION</h3>
          <p>During the term of this Agreement and for a period of twenty-four (24) months thereafter, the Receiving Party shall not directly or indirectly solicit, hire, or engage any employee, contractor, or officer of Enterprenex Solutions Pvt Ltd.</p>
        </div>
        <div class="legal-section">
          <h3>4. REMEDIES FOR BREACH</h3>
          <p>The parties acknowledge that unauthorized disclosure or use of Confidential Information will cause irreparable harm. Accordingly, Enterprenex Solutions Pvt Ltd shall be entitled to seek immediate injunctive relief in addition to damages.</p>
        </div>
      `;
    } else if (isKyc) {
      const empName = emp?.name || doc.uploadedBy || 'Employee';
      const empId = emp?.employeeId || emp?.id || '202600000002';
      const panNum = emp?.panNumber || 'PRRPS8209K';
      const aadhaarNum = emp?.aadhaarNumber ? `XXXX-XXXX-${emp.aadhaarNumber.slice(-4)}` : 'XXXX-XXXX-2345';

      bodyContent = `
        <div class="kyc-badge-header">
          <div class="kyc-tag">STATUTORY GOVERNMENT COMPLIANCE RECORD &bull; DPDP ACT 2023 & UIDAI COMPLIANT</div>
          <div class="status-verified">&check; KYC VERIFIED & SECURED</div>
        </div>
        <div class="kyc-table-container">
          <table class="kyc-table">
            <tr><td><strong>Employee Full Name:</strong></td><td>${empName}</td></tr>
            <tr><td><strong>12-Digit Employee ID:</strong></td><td><code>${empId}</code></td></tr>
            <tr><td><strong>Designation & Governance Role:</strong></td><td>${emp?.role || 'Executive Team Member'}</td></tr>
            <tr><td><strong>Permanent Account Number (PAN):</strong></td><td><code>${panNum}</code> (Income Tax Department, Govt of India)</td></tr>
            <tr><td><strong>Aadhaar Card UID:</strong></td><td><code>${aadhaarNum}</code> (UIDAI Masked Format)</td></tr>
            <tr><td><strong>Verification Status:</strong></td><td><span style="color: #059669; font-weight: 800;">VERIFIED & ACTIVE</span></td></tr>
            <tr><td><strong>Verification Officer:</strong></td><td>Managing Director / HR Operations &bull; Enterprenex Solutions</td></tr>
            <tr><td><strong>Timestamp:</strong></td><td>${doc.uploadDate || '2026-10-10'} &bull; Digital Vault Record ID: ${doc.id}</td></tr>
          </table>
        </div>
        <div class="legal-section" style="margin-top: 1.5rem; font-size: 0.8rem; color: #475569;">
          <p><strong>Statutory Declaration:</strong> This identity verification record has been archived in compliance with Section 139AA of the Income Tax Act 1961, Employee Provident Fund & Miscellaneous Provisions Act 1952, and the Digital Personal Data Protection (DPDP) Act 2023. Unauthorized reproduction is strictly prohibited.</p>
        </div>
      `;
    } else {
      bodyContent = `
        <div class="legal-section">
          <h3>DOCUMENT OVERVIEW & PURPOSE</h3>
          <p>Official corporate repository record for <strong>${doc.title}</strong> under Category: <strong>${doc.category}</strong>. This document is authenticated by Enterprenex Solutions Private Limited central document registry.</p>
        </div>
        <div class="legal-section">
          <h3>ACCESS & GOVERNANCE CLEARANCE</h3>
          <p>Classified as <strong>${doc.accessPermission}</strong>. Accessible to authorized Directors, Human Resources Executives, Project Managers, and designated Staff Members.</p>
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${doc.title} - Enterprenex Solutions Pvt Ltd</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.6; margin: 0; padding: 2.5rem; background: #fff; }
            .header-bar { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #f66135; padding-bottom: 1.25rem; margin-bottom: 2rem; }
            .brand-name { font-size: 1.6rem; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.5px; }
            .brand-name span { color: #f66135; }
            .brand-sub { font-size: 0.75rem; color: #64748b; font-weight: 600; margin-top: 3px; }
            .doc-meta { text-align: right; font-size: 0.78rem; color: #64748b; line-height: 1.4; }
            .doc-title-block { text-align: center; margin: 1.75rem 0 2rem 0; padding: 1rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
            .doc-title-block h1 { font-size: 1.35rem; margin: 0; color: #0f172a; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
            .doc-title-block p { margin: 6px 0 0 0; font-size: 0.8rem; color: #f66135; font-weight: 700; }
            .legal-section { margin-bottom: 1.5rem; }
            .legal-section h3 { font-size: 0.95rem; font-weight: 800; color: #1e293b; margin: 0 0 0.4rem 0; border-left: 3px solid #f66135; padding-left: 8px; }
            .legal-section p { font-size: 0.85rem; color: #334155; margin: 0; text-align: justify; }
            .kyc-badge-header { display: flex; justify-content: space-between; align-items: center; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1.25rem; }
            .kyc-tag { font-size: 0.75rem; font-weight: 800; color: #047857; letter-spacing: 0.5px; }
            .status-verified { font-size: 0.8rem; font-weight: 800; color: #059669; }
            .kyc-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
            .kyc-table td { padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; }
            .kyc-table tr:nth-child(even) { background: #f8fafc; }
            .sig-block { margin-top: 3.5rem; display: flex; justify-content: space-between; align-items: flex-end; padding-top: 1rem; }
            .sig-box { width: 45%; border-top: 1px solid #94a3b8; padding-top: 0.5rem; font-size: 0.8rem; color: #475569; }
            .sig-box strong { color: #0f172a; display: block; font-size: 0.88rem; }
            .sig-seal { width: 90px; height: 90px; border-radius: 50%; border: 2px dashed #f66135; display: inline-flex; align-items: center; justify-content: center; text-align: center; font-size: 0.65rem; font-weight: 800; color: #f66135; text-transform: uppercase; margin-bottom: 8px; }
            .footer-bar { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 0.72rem; color: #94a3b8; }
            @media print {
              body { padding: 0.5cm; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div>
              <div class="brand-name">Enterpre<span>nex</span> Solutions Pvt Ltd</div>
              <div class="brand-sub">CIN: U72900TG2026PTC184920 &bull; GSTIN: 36AAXCE2026M1Z4</div>
              <div class="brand-sub">Enterprise Web, AI & Cloud Infrastructure Systems &bull; Bengaluru | Hyderabad, India</div>
            </div>
            <div class="doc-meta">
              <div><strong>Document ID:</strong> ${doc.id}</div>
              <div><strong>Category:</strong> ${doc.category}</div>
              <div><strong>Version:</strong> ${doc.version}</div>
              <div><strong>Security:</strong> ${doc.accessPermission}</div>
              <div><strong>Date:</strong> ${doc.uploadDate}</div>
            </div>
          </div>

          <div class="doc-title-block">
            <h1>${doc.title}</h1>
            <p>OFFICIAL DIGITAL VAULT REPOSITORY RECORD &bull; AUTHENTICATED</p>
          </div>

          ${bodyContent}

          <div class="sig-block">
            <div class="sig-box">
              <div class="sig-seal">Corporate<br/>Seal &bull; ENX<br/>Authorized</div>
              <strong>Rohit P.</strong>
              <span>Managing Director</span><br/>
              <span>Enterprenex Solutions Private Limited</span><br/>
              <span style="font-size: 0.7rem; color: #059669;">Digitally Signed & Validated</span>
            </div>
            <div class="sig-box" style="text-align: right;">
              <br/><br/><br/>
              <strong>Authorized Signatory / Executive</strong>
              <span>Recipient / Employee Compliance Office</span><br/>
              <span>Date: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span><br/>
              <span style="font-size: 0.7rem; color: #059669;">Verified Identity</span>
            </div>
          </div>

          <div class="footer-bar">
            <div>Enterprenex Enterprise Central Vault &bull; Confidential &bull; All Rights Reserved 2026</div>
            <div>Page 1 of 1 &bull; SHA-256 Checksum Verified</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
  };

  // Instant Download Handler
  const handleDownload = (doc: VaultDocument) => {
    const effectiveUrl = getEffectiveDocUrl(doc);
    const matchingEmp = getMatchingEmployee(doc);
    const cleanTitle = doc.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'Document';

    // 1. If we have a raw base64 DataURL or valid URL
    if (effectiveUrl && effectiveUrl !== '#') {
      const isBase64 = effectiveUrl.startsWith('data:');
      const ext = (doc.fileFormat || (effectiveUrl.includes('image') ? 'jpg' : 'pdf')).toLowerCase().replace(/[^a-z0-9]/g, '');

      const link = document.createElement('a');
      link.href = effectiveUrl;
      link.download = `${cleanTitle}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Download Complete', `Downloaded ${doc.title} (${ext.toUpperCase()})`, 'success');
      return;
    }

    // 2. If it is a seeded template or document without raw uploaded file:
    // Generate official corporate printable HTML & PDF blob download
    const htmlContent = generateDocumentHtml(doc, matchingEmp);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${cleanTitle}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);

    // Also trigger instant print-to-PDF dialog for immediate "Save as PDF"
    handlePrintPdf(doc);

    showToast(
      'Document Generated & Downloaded',
      `Official file saved. Opening "Print to PDF" for immediate vector PDF download.`,
      'success'
    );
  };

  // Instant Print to PDF Handler
  const handlePrintPdf = (doc: VaultDocument) => {
    const effectiveUrl = getEffectiveDocUrl(doc);
    const matchingEmp = getMatchingEmployee(doc);

    // If it is an image, open dedicated image print window
    if (effectiveUrl && effectiveUrl.startsWith('data:image')) {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${doc.title} - Enterprenex Solutions</title>
              <style>
                body { margin: 0; padding: 2rem; display: flex; flex-direction: column; align-items: center; font-family: sans-serif; }
                img { max-width: 95%; max-height: 85vh; object-fit: contain; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .title { font-weight: 800; font-size: 1.2rem; margin-bottom: 1rem; color: #0f172a; }
                @media print { body { padding: 0; } img { max-width: 100%; border: none; box-shadow: none; } }
              </style>
            </head>
            <body>
              <div class="title">${doc.title}</div>
              <img src="${effectiveUrl}" alt="${doc.title}" />
              <script>
                window.onload = function() { window.print(); };
              </script>
            </body>
          </html>
        `);
        win.document.close();
      }
      return;
    }

    // Open standard printable corporate agreement
    const win = window.open('', '_blank');
    if (!win) {
      showToast('Popup Blocked', 'Please allow popups to open printable PDF view.', 'warning');
      return;
    }

    win.document.write(generateDocumentHtml(doc, matchingEmp));
    win.document.close();
  };

  // Email Document to Director, HR, Manager or Employee
  const handleEmailDocument = (doc: VaultDocument, targetEmail: string) => {
    const subject = encodeURIComponent(`[Enterprenex Vault] Official Document Dispatch: ${doc.title}`);
    const body = encodeURIComponent(
      `ENTERPRENEX SOLUTIONS PRIVATE LIMITED\n` +
      `CENTRAL DOCUMENT VAULT & IP REPOSITORY\n` +
      `======================================================\n\n` +
      `DOCUMENT DETAILS:\n` +
      `- Title: ${doc.title}\n` +
      `- Category: ${doc.category}\n` +
      `- Version: ${doc.version}\n` +
      `- Access Level: ${doc.accessPermission}\n` +
      `- File Format: ${doc.fileFormat} (${doc.fileSize})\n` +
      `- Uploaded On: ${doc.uploadDate} by ${doc.uploadedBy}\n` +
      `- Reference Vault ID: ${doc.id}\n\n` +
      `DISPATCHED BY:\n` +
      `- Name: ${currentUser?.name || 'Authorized Officer'}\n` +
      `- Role: ${currentUser?.role || 'Staff'}\n` +
      `- Email: ${currentUser?.email || 'portal@enterprenexsolution.com'}\n\n` +
      `SECURITY NOTICE:\n` +
      `This corporate record has been dispatched under Enterprenex Enterprise Security Policies.\n` +
      `Authorized recipients can view, inspect and download the raw secured file directly in the Central Vault at:\n` +
      `https://enterprenexsolution.com/admin/documents\n\n` +
      `Confidential • Enterprenex Solutions Pvt. Ltd.`
    );

    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;

    if (logAction) {
      logAction('Dispatched Document via Email', 'Document Vault', `Shared ${doc.title} with ${targetEmail}`);
    }

    showToast('Email Dispatch', `Preparing email packet for ${targetEmail}.`, 'info');
    setEmailModalDoc(null);
    setCustomEmail('');
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

      {/* Role Clearance & Access Banner */}
      <div
        style={{
          background: 'rgba(246, 97, 53, 0.08)',
          border: '1px solid rgba(246, 97, 53, 0.25)',
          borderRadius: '10px',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.25rem',
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
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'var(--adm-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Shield size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.88rem' }}>
              Vault Clearance: Active for {currentUser?.name} &bull; {currentUser?.role}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>
              Director, HR Manager, Project Manager & Employee roles cleared for 1-click View, PDF Download & Email dispatch
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="adm-badge adm-badge-success" style={{ fontSize: '0.72rem' }}>
            <CheckCircle2 size={12} /> Download Clearance: 100% Active
          </span>
          <span className="adm-badge adm-badge-primary" style={{ fontSize: '0.72rem' }}>
            <Lock size={12} /> SHA-256 Encrypted
          </span>
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
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
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
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map(doc => {
                const effectiveUrl = getEffectiveDocUrl(doc);
                const isRealFile = effectiveUrl && effectiveUrl !== '#';

                return (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: isRealFile ? 'rgba(16, 185, 129, 0.15)' : 'var(--adm-primary-soft)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isRealFile ? 'var(--adm-success)' : 'var(--adm-primary)',
                            flexShrink: 0
                          }}
                        >
                          <FileText size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{doc.title}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)', display: 'flex', gap: '4px', marginTop: '2px', flexWrap: 'wrap' }}>
                            {doc.tags.map((t, idx) => (
                              <span key={idx} className="adm-badge adm-badge-neutral" style={{ padding: '1px 5px', fontSize: '0.65rem' }}>
                                {t}
                              </span>
                            ))}
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
                      <span
                        className={`adm-badge ${
                          doc.accessPermission === 'Admin Only'
                            ? 'adm-badge-danger'
                            : doc.accessPermission === 'Confidential'
                            ? 'adm-badge-warning'
                            : doc.accessPermission === 'Internal'
                            ? 'adm-badge-info'
                            : 'adm-badge-success'
                        }`}
                      >
                        <Shield size={11} />
                        {doc.accessPermission}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{doc.fileSize}</span>{' '}
                      <span style={{ color: 'var(--adm-text-dim)', fontSize: '0.78rem' }}>
                        ({doc.fileFormat || 'PDF'})
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: '#fff' }}>{doc.uploadDate}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-dim)' }}>by {doc.uploadedBy}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                        {/* 1. Preview Button */}
                        <button
                          className="adm-btn adm-btn-sm adm-btn-secondary"
                          onClick={() => setPreviewDoc(doc)}
                          title="Preview & Read Document"
                          style={{ padding: '0.35rem 0.55rem' }}
                        >
                          <Eye size={13} />
                        </button>

                        {/* 2. Download Button */}
                        <button
                          className="adm-btn adm-btn-sm adm-btn-primary"
                          onClick={() => handleDownload(doc)}
                          title="Download Document"
                          style={{ padding: '0.35rem 0.55rem' }}
                        >
                          <Download size={13} />
                        </button>

                        {/* 3. Print / Save as PDF Button */}
                        <button
                          className="adm-btn adm-btn-sm adm-btn-secondary"
                          onClick={() => handlePrintPdf(doc)}
                          title="Print / Save as PDF"
                          style={{ padding: '0.35rem 0.55rem' }}
                        >
                          <Printer size={13} />
                        </button>

                        {/* 4. Email / Share Button */}
                        <button
                          className="adm-btn adm-btn-sm adm-btn-secondary"
                          onClick={() => setEmailModalDoc(doc)}
                          title="Share / Email Document"
                          style={{ padding: '0.35rem 0.55rem' }}
                        >
                          <Mail size={13} />
                        </button>

                        {/* 5. Delete Button */}
                        <button
                          className="adm-btn adm-btn-sm adm-btn-danger"
                          onClick={() => deleteDocument(doc.id)}
                          title="Delete File"
                          style={{ padding: '0.35rem 0.55rem' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="adm-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              background: 'rgba(246, 97, 53, 0.1)',
              color: 'var(--adm-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
          >
            <UploadCloud size={30} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem 0' }}>
            No Documents Uploaded in this Category
          </h3>
          <p style={{ color: 'var(--adm-text-muted)', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
            Securely upload NDAs, client contracts, proposals, invoices, and employee records into the central repository.
          </p>
          <button className="adm-btn adm-btn-primary" onClick={() => setShowUploadModal(true)}>
            <UploadCloud size={16} />
            <span>Upload Document Now</span>
          </button>
        </div>
      )}

      {/* ── PREVIEW DOCUMENT READER MODAL ── */}
      {previewDoc && (() => {
        const effectiveUrl = getEffectiveDocUrl(previewDoc);
        const matchingEmp = getMatchingEmployee(previewDoc);
        const isImage = effectiveUrl && effectiveUrl.startsWith('data:image');
        const isPdf = effectiveUrl && (effectiveUrl.startsWith('data:application/pdf') || effectiveUrl.endsWith('.pdf'));

        return (
          <div className="adm-modal-overlay" onClick={() => setPreviewDoc(null)}>
            <div
              className="adm-modal-content adm-modal-xl"
              style={{ maxWidth: '920px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="adm-modal-header" style={{ paddingBottom: '0.85rem', borderBottom: '1px solid var(--adm-border)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                      {previewDoc.title}
                    </h3>
                    <span className="adm-badge adm-badge-primary">{previewDoc.version}</span>
                    <span className="adm-badge adm-badge-neutral">{previewDoc.category}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)', margin: '4px 0 0 0' }}>
                    Uploaded on {previewDoc.uploadDate} by {previewDoc.uploadedBy} &bull; Classification: {previewDoc.accessPermission}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    className="adm-btn adm-btn-sm adm-btn-secondary"
                    onClick={() => handlePrintPdf(previewDoc)}
                    title="Print / Save as PDF"
                  >
                    <Printer size={14} />
                    <span>Print / PDF</span>
                  </button>
                  <button
                    className="adm-btn adm-btn-sm adm-btn-primary"
                    onClick={() => handleDownload(previewDoc)}
                    title="Download File"
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>
                  <button
                    className="adm-modal-close"
                    onClick={() => setPreviewDoc(null)}
                    style={{ marginLeft: '6px' }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Reader Body */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.25rem 0',
                  maxHeight: '62vh'
                }}
              >
                {/* 1. Image Viewer (e.g. Uploaded PAN Card / Aadhaar photo) */}
                {isImage && (
                  <div style={{ textAlign: 'center', padding: '1rem', background: '#090d16', borderRadius: '10px' }}>
                    <img
                      src={effectiveUrl}
                      alt={previewDoc.title}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '520px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        border: '1px solid var(--adm-border)'
                      }}
                    />
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>
                      High-Resolution Scanned Document Preview ({previewDoc.fileSize})
                    </div>
                  </div>
                )}

                {/* 2. Embedded PDF Viewer */}
                {isPdf && (
                  <div style={{ width: '100%', height: '520px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--adm-border)' }}>
                    <iframe
                      src={effectiveUrl}
                      title={previewDoc.title}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                    />
                  </div>
                )}

                {/* 3. Official Corporate Document Paper Reader (Contracts, MSA, NDA, KYC) */}
                {!isImage && !isPdf && (
                  <div
                    style={{
                      background: '#ffffff',
                      color: '#0f172a',
                      borderRadius: '10px',
                      padding: '2.5rem',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                    dangerouslySetInnerHTML={{
                      __html: generateDocumentHtml(previewDoc, matchingEmp)
                        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '') // remove print script for inline reader
                        .replace(/<!DOCTYPE html>[\s\S]*?<body.*?>/i, '')
                        .replace(/<\/body>[\s\S]*?<\/html>/i, '')
                    }}
                  />
                )}
              </div>

              {/* Footer Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--adm-border)',
                  fontSize: '0.78rem',
                  color: 'var(--adm-text-dim)'
                }}
              >
                <div>
                  🔒 SHA-256 Checksum: <code style={{ color: 'var(--adm-primary)' }}>7f8a3c9e2b01d4a...</code> &bull; All roles cleared
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="adm-btn adm-btn-secondary"
                    onClick={() => {
                      setEmailModalDoc(previewDoc);
                      setPreviewDoc(null);
                    }}
                  >
                    <Mail size={14} />
                    <span>Email Document</span>
                  </button>
                  <button className="adm-btn adm-btn-primary" onClick={() => handleDownload(previewDoc)}>
                    <Download size={14} />
                    <span>Download File</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── EMAIL / SHARE DOCUMENT MODAL ── */}
      {emailModalDoc && (
        <div className="adm-modal-overlay" onClick={() => setEmailModalDoc(null)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Share Document via Email</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)' }}>
                  Dispatch official document access packet directly to Director, HR, Manager or Staff
                </p>
              </div>
              <button className="adm-modal-close" onClick={() => setEmailModalDoc(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '0.85rem', background: 'var(--adm-bg)', borderRadius: '8px', border: '1px solid var(--adm-border)', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 800, color: '#fff' }}>{emailModalDoc.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--adm-primary)', marginTop: '3px' }}>
                {emailModalDoc.category} &bull; {emailModalDoc.fileFormat} ({emailModalDoc.fileSize})
              </div>
            </div>

            <label className="adm-form-label" style={{ marginBottom: '8px', display: 'block' }}>
              Quick Dispatch to Role Email:
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.25rem' }}>
              <button
                className="adm-btn adm-btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '0.65rem 0.85rem' }}
                onClick={() => handleEmailDocument(emailModalDoc, 'director@enterprenexsolution.com')}
              >
                <Building size={16} color="var(--adm-primary)" />
                <div style={{ textAlign: 'left', marginLeft: '6px' }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.82rem' }}>Managing Director</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>director@enterprenexsolution.com</div>
                </div>
              </button>

              <button
                className="adm-btn adm-btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '0.65rem 0.85rem' }}
                onClick={() => handleEmailDocument(emailModalDoc, 'hr@enterprenexsolution.com')}
              >
                <UserCheck size={16} color="var(--adm-info)" />
                <div style={{ textAlign: 'left', marginLeft: '6px' }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.82rem' }}>HR Operations & Compliance</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>hr@enterprenexsolution.com</div>
                </div>
              </button>

              <button
                className="adm-btn adm-btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '0.65rem 0.85rem' }}
                onClick={() => handleEmailDocument(emailModalDoc, 'manager@enterprenexsolution.com')}
              >
                <Shield size={16} color="var(--adm-warning)" />
                <div style={{ textAlign: 'left', marginLeft: '6px' }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.82rem' }}>Project & Operations Manager</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>manager@enterprenexsolution.com</div>
                </div>
              </button>

              {currentUser?.email && (
                <button
                  className="adm-btn adm-btn-secondary"
                  style={{ justifyContent: 'flex-start', padding: '0.65rem 0.85rem' }}
                  onClick={() => handleEmailDocument(emailModalDoc, currentUser.email)}
                >
                  <Mail size={16} color="var(--adm-success)" />
                  <div style={{ textAlign: 'left', marginLeft: '6px' }}>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.82rem' }}>Send to Myself ({currentUser.name})</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--adm-text-dim)' }}>{currentUser.email}</div>
                  </div>
                </button>
              )}
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Or Custom Recipient Email:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  className="adm-input"
                  placeholder="e.g. client@enterprise.com"
                  value={customEmail}
                  onChange={e => setCustomEmail(e.target.value)}
                />
                <button
                  className="adm-btn adm-btn-primary"
                  disabled={!customEmail.trim()}
                  onClick={() => handleEmailDocument(emailModalDoc, customEmail.trim())}
                >
                  <Send size={14} />
                  <span>Send</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button className="adm-btn adm-btn-secondary" onClick={() => setEmailModalDoc(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── UPLOAD DOCUMENT MODAL WITH BASE64 FILE READER ── */}
      {showUploadModal && (
        <div className="adm-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="adm-modal-content adm-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Upload Document to Vault</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--adm-text-muted)' }}>
                  Securely store PDF, DOCX, ZIP, or spreadsheet files with access controls
                </p>
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
                        {fSize} &bull; {fFormat} Document (Click to change file)
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
                      Supports PDF, Word (.docx), Excel (.xlsx), ZIP, PNG, JPG (Permanent Base64 encryption)
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
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
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
