import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export class DocumentService {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  // --- Folder Management ---
  async createFolder(tenantId: string, name: string, createdBy: string, parentId?: string) {
    if (parentId) {
      const parent = await prisma.documentFolder.findFirst({
        where: { id: parentId, tenantId, deletedAt: null }
      });
      if (!parent) throw new NotFoundError('Parent folder not found');
    }

    return prisma.documentFolder.create({
      data: {
        name,
        parentId,
        tenantId,
        createdBy
      }
    });
  }

  async getFolders(tenantId: string) {
    return prisma.documentFolder.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        children: true,
        _count: {
          select: { documents: true }
        }
      }
    });
  }

  async deleteFolder(tenantId: string, folderId: string) {
    const folder = await prisma.documentFolder.findFirst({
      where: { id: folderId, tenantId, deletedAt: null }
    });
    if (!folder) throw new NotFoundError('Folder not found');

    // Soft delete
    return prisma.documentFolder.update({
      where: { id: folderId },
      data: { deletedAt: new Date() }
    });
  }

  // --- File Upload & Version Control ---
  async uploadDocument(
    tenantId: string,
    title: string,
    description: string | null,
    fileName: string,
    mimeType: string,
    base64Data: string,
    createdBy: string,
    folderId?: string
  ) {
    // Decode base64 and write locally
    const fileBuffer = Buffer.from(base64Data, 'base64');
    const fileSize = fileBuffer.length;
    const fileHash = crypto.randomBytes(16).toString('hex');
    const localFileName = `${fileHash}_${fileName}`;
    const filePath = path.join(this.uploadsDir, localFileName);
    fs.writeFileSync(filePath, fileBuffer);

    // Save metadata
    const fileUrl = `/uploads/${localFileName}`;

    // AI categorization & summary simulations
    const tags = this.aiCategorize(title, description || '');
    const summary = this.aiSummarize(title, description || '');

    const document = await prisma.document.create({
      data: {
        title,
        description,
        fileName,
        fileUrl,
        mimeType,
        fileSize,
        version: '1.0.0',
        tags,
        tenantId,
        createdBy,
        folderId: folderId || null
      }
    });

    // Create version history
    await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        version: '1.0.0',
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        tenantId,
        createdBy
      }
    });

    return { document, summary };
  }

  async uploadNewVersion(
    tenantId: string,
    documentId: string,
    fileName: string,
    mimeType: string,
    base64Data: string,
    createdBy: string
  ) {
    const document = await prisma.document.findFirst({
      where: { id: documentId, tenantId, deletedAt: null }
    });
    if (!document) throw new NotFoundError('Document not found');

    // Decode and save new file version
    const fileBuffer = Buffer.from(base64Data, 'base64');
    const fileSize = fileBuffer.length;
    const fileHash = crypto.randomBytes(16).toString('hex');
    const localFileName = `${fileHash}_${fileName}`;
    const filePath = path.join(this.uploadsDir, localFileName);
    fs.writeFileSync(filePath, fileBuffer);

    const fileUrl = `/uploads/${localFileName}`;

    // Increment version
    const currentVerParts = document.version.split('.').map(Number);
    currentVerParts[2] += 1; // Increment patch version
    const nextVer = currentVerParts.join('.');

    // Update document
    const updatedDoc = await prisma.document.update({
      where: { id: documentId },
      data: {
        version: nextVer,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        updatedBy: createdBy
      }
    });

    // Save version entry
    await prisma.documentVersion.create({
      data: {
        documentId,
        version: nextVer,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        tenantId,
        createdBy
      }
    });

    return updatedDoc;
  }

  // --- Document Retrieval ---
  async getDocuments(
    tenantId: string,
    filters: {
      folderId?: string;
      tag?: string;
      search?: string;
      isFavorite?: boolean;
      status?: 'ACTIVE' | 'ARCHIVED' | 'TRASHED';
    }
  ) {
    const where: any = {
      tenantId,
    };

    if (filters.status) {
      where.status = filters.status;
      if (filters.status === 'TRASHED') {
        where.deletedAt = { not: null };
      } else {
        where.deletedAt = null;
      }
    } else {
      where.deletedAt = null;
      where.status = 'ACTIVE';
    }

    if (filters.folderId) {
      where.folderId = filters.folderId;
    }
    if (filters.isFavorite !== undefined) {
      where.isFavorite = filters.isFavorite;
    }

    let documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        folder: true
      }
    });

    // Tag filter
    if (filters.tag) {
      documents = documents.filter(doc => 
        doc.tags?.toLowerCase().split(',').map(t => t.trim()).includes(filters.tag!.toLowerCase())
      );
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      documents = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchLower) ||
        (doc.description?.toLowerCase().includes(searchLower)) ||
        doc.fileName.toLowerCase().includes(searchLower) ||
        doc.tags?.toLowerCase().includes(searchLower)
      );
    }

    return documents;
  }

  async getDocumentDetails(tenantId: string, id: string) {
    const doc = await prisma.document.findFirst({
      where: { id, tenantId },
      include: {
        versions: { orderBy: { createdAt: 'desc' } },
        shares: true,
        permissions: true,
        comments: { orderBy: { createdAt: 'desc' } },
        folder: true
      }
    });
    if (!doc) throw new NotFoundError('Document not found');
    return doc;
  }

  // --- Favorites, Recycle Bin, and Tags ---
  async toggleFavorite(tenantId: string, id: string) {
    const doc = await prisma.document.findFirst({
      where: { id, tenantId, deletedAt: null }
    });
    if (!doc) throw new NotFoundError('Document not found');

    return prisma.document.update({
      where: { id },
      data: { isFavorite: !doc.isFavorite }
    });
  }

  async moveToRecycleBin(tenantId: string, id: string) {
    const doc = await prisma.document.findFirst({
      where: { id, tenantId, deletedAt: null }
    });
    if (!doc) throw new NotFoundError('Document not found');

    return prisma.document.update({
      where: { id },
      data: { 
        status: 'TRASHED',
        deletedAt: new Date()
      }
    });
  }

  async restoreFromRecycleBin(tenantId: string, id: string) {
    const doc = await prisma.document.findFirst({
      where: { id, tenantId, status: 'TRASHED' }
    });
    if (!doc) throw new NotFoundError('Document not found in Recycle Bin');

    return prisma.document.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        deletedAt: null
      }
    });
  }

  async permanentDelete(tenantId: string, id: string) {
    const doc = await prisma.document.findFirst({
      where: { id, tenantId }
    });
    if (!doc) throw new NotFoundError('Document not found');

    // Clean up physical file paths in version histories
    const versions = await prisma.documentVersion.findMany({ where: { documentId: id } });
    for (const ver of versions) {
      try {
        const fullPath = path.join(this.uploadsDir, path.basename(ver.fileUrl));
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err) {
        // Skip file delete errors
      }
    }

    return prisma.document.delete({ where: { id } });
  }

  // --- Sharing & Access Permissions ---
  async createShare(
    tenantId: string,
    documentId: string,
    createdBy: string,
    accessType: 'READ' | 'WRITE',
    sharedWithEmail?: string,
    expiryDays?: number
  ) {
    const token = crypto.randomBytes(32).toString('hex');
    let expiresAt: Date | undefined;
    if (expiryDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);
    }

    return prisma.documentShare.create({
      data: {
        documentId,
        sharedWith: sharedWithEmail || null,
        accessType,
        token,
        expiresAt,
        tenantId,
        createdBy
      }
    });
  }

  async getSharedDocuments(tenantId: string, userEmail: string) {
    return prisma.documentShare.findMany({
      where: {
        tenantId,
        OR: [
          { sharedWith: userEmail },
          { sharedWith: null } // Public link shares
        ]
      },
      include: {
        document: {
          include: {
            folder: true
          }
        }
      }
    });
  }

  async getPublicShare(token: string) {
    const share = await prisma.documentShare.findUnique({
      where: { token },
      include: { document: true }
    });

    if (!share) throw new NotFoundError('Share link not found or invalid');
    if (share.expiresAt && new Date() > share.expiresAt) {
      throw new BadRequestError('Share link has expired');
    }

    return share.document;
  }

  // --- Comments ---
  async addComment(tenantId: string, documentId: string, comment: string, createdBy: string) {
    return prisma.documentComment.create({
      data: {
        documentId,
        comment,
        tenantId,
        createdBy
      }
    });
  }

  // --- AI Features Implementation ---

  // 1. AI Categorization
  private aiCategorize(title: string, description: string): string {
    const combined = `${title} ${description}`.toLowerCase();
    const categories: string[] = [];

    if (combined.includes('invoice') || combined.includes('salary') || combined.includes('payroll') || combined.includes('budget') || combined.includes('finance') || combined.includes('payment') || combined.includes('tax')) {
      categories.push('Finance');
    }
    if (combined.includes('resume') || combined.includes('leave') || combined.includes('employee') || combined.includes('recruitment') || combined.includes('hr') || combined.includes('policy')) {
      categories.push('HR');
    }
    if (combined.includes('supplier') || combined.includes('po') || combined.includes('vendor') || combined.includes('warehouse') || combined.includes('stock') || combined.includes('scm')) {
      categories.push('SupplyChain');
    }
    if (combined.includes('contract') || combined.includes('agreement') || combined.includes('nda') || combined.includes('legal') || combined.includes('compliance')) {
      categories.push('Legal');
    }
    if (combined.includes('project') || combined.includes('sprint') || combined.includes('spec') || combined.includes('design') || combined.includes('engineering')) {
      categories.push('ProjectManagement');
    }

    if (categories.length === 0) categories.push('General');
    return categories.join(', ');
  }

  // 2. AI Duplicate Detection
  async detectDuplicates(tenantId: string, title: string, fileSize: number) {
    const docs = await prisma.document.findMany({
      where: {
        tenantId,
        deletedAt: null
      }
    });

    return docs.filter(doc => 
      doc.fileSize === fileSize || 
      doc.title.toLowerCase().trim() === title.toLowerCase().trim()
    );
  }

  // 3. AI OCR Mock transcript extractor
  async runOCR(tenantId: string, id: string) {
    const doc = await prisma.document.findFirst({
      where: { id, tenantId }
    });
    if (!doc) throw new NotFoundError('Document not found');

    const transcript = `
--- AI OCR TRANSCRIPT SYSTEM ---
Document Title: ${doc.title}
Detected Language: English
Detected Text Block:
  [ID: OCR_${doc.id.substring(0, 8)}]
  CONFIDENTIAL ENTERPRISE DOCUMENT
  File: ${doc.fileName} (${(doc.fileSize / 1024).toFixed(2)} KB)
  Date Processed: ${new Date().toLocaleString()}
  
  SUMMARY CONTENT RESOLVED:
  The billing ledger data confirms verification check completed for ${doc.title}.
  Authorized tenant access restriction: ${doc.tenantId}.
  No digital signature violations identified.
=================================
    `;
    return transcript;
  }

  // 4. AI Document Summary
  private aiSummarize(title: string, description: string): string {
    const points = [
      `File title is classified as "${title}".`,
      description ? `Includes details regarding: ${description}.` : 'No file description provided.',
      `System automatically processed structural metadata at upload timestamp.`
    ];
    return points.map(p => `• ${p}`).join('\n');
  }

  // 5. AI Smart Search relevance scoring
  async smartSearch(tenantId: string, query: string) {
    const docs = await this.getDocuments(tenantId, { status: 'ACTIVE' });
    const tokens = query.toLowerCase().split(' ').filter(Boolean);

    const scored = docs.map(doc => {
      let score = 0;
      const titleLower = doc.title.toLowerCase();
      const descLower = (doc.description || '').toLowerCase();
      const tagsLower = (doc.tags || '').toLowerCase();

      for (const token of tokens) {
        if (titleLower.includes(token)) score += 10;
        if (tagsLower.includes(token)) score += 5;
        if (descLower.includes(token)) score += 2;
      }

      return { doc, score };
    });

    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => ({
        ...item.doc,
        aiScore: item.score
      }));
  }
}

export default new DocumentService();
export const documentService = new DocumentService();
