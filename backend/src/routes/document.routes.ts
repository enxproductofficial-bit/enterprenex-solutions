import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { logAuditSecurityEntry } from '../services/security.service';
import crypto from 'crypto';

const router = Router();

// GET /api/v1/documents (List vault documents with strict access partitioning)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, employeeId, accessPermission } = req.query as Record<string, string>;
    const userRole = req.user?.role || '';
    const userEmail = (req.user?.email || '').toLowerCase();
    const userEmpId = req.user?.employeeId;

    const isDirector =
      userRole === 'Super Admin' ||
      userRole.includes('Director') ||
      userEmail.includes('director');

    const isHR =
      isDirector ||
      userRole === 'HR Manager' ||
      userRole.includes('HR') ||
      req.user?.department === 'Human Resources' ||
      userEmail.includes('hr');

    const isManager = isDirector || userRole === 'Project Manager';

    const where: any = {};
    if (category) where.category = category;

    if (isDirector || isHR) {
      // HR and Executive Director have compliance vault visibility
      if (employeeId) where.employeeId = employeeId;
      if (accessPermission) where.accessPermission = accessPermission;
    } else if (isManager) {
      // Project Managers can access company technical/internal documents and department docs
      where.accessPermission = { in: ['Public', 'Internal', 'Confidential'] };
      if (employeeId) where.employeeId = employeeId;
    } else {
      // Regular employees can strictly ONLY view:
      // 1. Company-wide Public / Internal documents (where employeeId is null)
      // 2. Their OWN confidential records matching their Employee ID
      where.OR = [
        {
          employeeId: null,
          accessPermission: { in: ['Public', 'Internal'] }
        },
        ...(userEmpId ? [{ employeeId: userEmpId }] : []),
        ...(req.user?.id ? [{ employeeId: req.user.id }] : [])
      ];
    }

    const documents = await prisma.vaultDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const parsed = documents.map(d => ({
      ...d,
      tags: d.tagsJson ? JSON.parse(d.tagsJson) : []
    }));

    res.json({ documents: parsed });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/documents/:id (Get single document with permission check)
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await prisma.vaultDocument.findUnique({
      where: { id: req.params.id }
    });

    if (!doc) {
      res.status(404).json({ error: 'Document not found.' });
      return;
    }

    const userRole = req.user?.role || '';
    const userEmail = (req.user?.email || '').toLowerCase();
    const userEmpId = req.user?.employeeId;

    const isDirector =
      userRole === 'Super Admin' ||
      userRole.includes('Director') ||
      userEmail.includes('director');

    const isHR =
      isDirector ||
      userRole === 'HR Manager' ||
      userRole.includes('HR') ||
      req.user?.department === 'Human Resources' ||
      userEmail.includes('hr');

    if (!isDirector && !isHR) {
      const isOwner = (userEmpId && doc.employeeId === userEmpId) || (doc.employeeId === req.user?.id);
      const isPublicOrInternal = !doc.employeeId && (doc.accessPermission === 'Public' || doc.accessPermission === 'Internal');

      if (!isOwner && !isPublicOrInternal) {
        res.status(403).json({ error: 'Access Denied: You do not have permission to view or download this confidential document.' });
        return;
      }
    }

    res.json({
      document: {
        ...doc,
        tags: doc.tagsJson ? JSON.parse(doc.tagsJson) : []
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/documents (Upload/Register document)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      category = 'Technical Docs',
      version = 'v1.0',
      fileFormat = 'PDF',
      fileSize = '1.2 MB',
      accessPermission = 'Internal',
      tags = [],
      url = '#',
      employeeId,
      verificationStatus = 'Verified'
    } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Document title is required.' });
      return;
    }

    // Generate SHA-256 integrity hash
    const checksumHash = crypto.createHash('sha256').update(`${title}-${Date.now()}-${req.user?.id}`).digest('hex');

    const doc = await prisma.vaultDocument.create({
      data: {
        title,
        category,
        version,
        fileFormat,
        fileSize,
        uploadedBy: req.user?.name || 'Administrator',
        uploadDate: new Date().toISOString().split('T')[0],
        accessPermission,
        tagsJson: JSON.stringify(tags),
        url,
        employeeId: employeeId || null,
        verificationStatus,
        checksumHash
      }
    });

    // ISO 27001 Audit Entry
    await logAuditSecurityEntry({
      action: 'DOCUMENT_VAULT_UPLOAD',
      category: 'Document Vault & Compliance',
      details: `Secured document "${title}" (${category}) in central vault. Integrity Hash: ${checksumHash.substring(0, 16)}...`,
      actor: req.user?.name || 'Staff'
    });

    res.status(201).json({
      message: 'Document saved to central vault.',
      document: {
        ...doc,
        tags
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/documents/:id (Update document metadata or verification status - authorized staff only)
router.patch('/:id', authenticateToken, requireRole(['Super Admin', 'Project Manager', 'HR Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      version,
      accessPermission,
      tags,
      verificationStatus,
      verifiedBy,
      verifiedAt
    } = req.body;

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (category !== undefined) data.category = category;
    if (version !== undefined) data.version = version;
    if (accessPermission !== undefined) data.accessPermission = accessPermission;
    if (tags !== undefined) data.tagsJson = JSON.stringify(tags);
    if (verificationStatus !== undefined) data.verificationStatus = verificationStatus;
    if (verifiedBy !== undefined) data.verifiedBy = verifiedBy;
    if (verifiedAt !== undefined) data.verifiedAt = verifiedAt;

    const updated = await prisma.vaultDocument.update({
      where: { id },
      data
    });

    res.json({
      message: 'Document updated successfully.',
      document: {
        ...updated,
        tags: updated.tagsJson ? JSON.parse(updated.tagsJson) : []
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/documents/:id (Delete document from vault)
router.delete('/:id', authenticateToken, requireRole(['Super Admin', 'Project Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.vaultDocument.delete({ where: { id } });
    res.json({ message: 'Document removed from vault.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

