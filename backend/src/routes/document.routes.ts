import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { logAuditSecurityEntry } from '../services/security.service';
import crypto from 'crypto';

const router = Router();

// GET /api/v1/documents (List vault documents)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, employeeId, accessPermission } = req.query as Record<string, string>;
    const isDirectorOrAdmin =
      req.user?.role === 'Super Admin' ||
      req.user?.role === 'Project Manager' ||
      req.user?.email?.includes('director');

    const where: any = {};
    if (category) where.category = category;
    if (employeeId) where.employeeId = employeeId;
    if (accessPermission) where.accessPermission = accessPermission;

    // Strict access control: regular employees cannot see 'Admin Only' or 'Executive' documents
    if (!isDirectorOrAdmin) {
      where.accessPermission = {
        in: ['Public', 'Internal', 'Confidential']
      };
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

// GET /api/v1/documents/:id (Get single document)
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await prisma.vaultDocument.findUnique({
      where: { id: req.params.id }
    });

    if (!doc) {
      res.status(404).json({ error: 'Document not found.' });
      return;
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

// PATCH /api/v1/documents/:id (Update document metadata or verification status)
router.patch('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
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

