import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { sendResponse } from '../utils/response';
import documentService from '../services/documentService';
import { BadRequestError } from '../utils/errors';

export class DocumentController {
  // --- Folder Routes ---
  async createFolder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, parentId } = req.body;
      if (!name) throw new BadRequestError('Folder name is required');
      const folder = await documentService.createFolder(
        req.tenantId!,
        name,
        req.user?.email || 'system',
        parentId
      );

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Folder created successfully',
        data: folder,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFolders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await documentService.getFolders(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Folders fetched successfully',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteFolder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const folder = await documentService.deleteFolder(req.tenantId!, id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Folder moved to Recycle Bin',
        data: folder,
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Document Routes ---
  async uploadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { title, description, fileName, mimeType, base64Data, folderId } = req.body;
      if (!title || !fileName || !mimeType || !base64Data) {
        throw new BadRequestError('Missing required upload fields');
      }

      const result = await documentService.uploadDocument(
        req.tenantId!,
        title,
        description,
        fileName,
        mimeType,
        base64Data,
        req.user?.email || 'system',
        folderId
      );

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Document uploaded successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadNewVersion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { fileName, mimeType, base64Data } = req.body;
      if (!fileName || !mimeType || !base64Data) {
        throw new BadRequestError('Missing required version upload fields');
      }

      const versionRecord = await documentService.uploadNewVersion(
        req.tenantId!,
        id,
        fileName,
        mimeType,
        base64Data,
        req.user?.email || 'system'
      );

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'New document version uploaded successfully',
        data: versionRecord,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { folderId, tag, search, isFavorite, status } = req.query;
      const parsedFav = isFavorite !== undefined ? isFavorite === 'true' : undefined;

      const list = await documentService.getDocuments(req.tenantId!, {
        folderId: folderId as string,
        tag: tag as string,
        search: search as string,
        isFavorite: parsedFav,
        status: status as any
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Documents fetched successfully',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDocumentDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const doc = await documentService.getDocumentDetails(req.tenantId!, id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Document details fetched successfully',
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleFavorite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const doc = await documentService.toggleFavorite(req.tenantId!, id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: doc.isFavorite ? 'Document marked as favorite' : 'Document removed from favorites',
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  }

  async moveToRecycleBin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const doc = await documentService.moveToRecycleBin(req.tenantId!, id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Document moved to Recycle Bin',
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  }

  async restoreFromRecycleBin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const doc = await documentService.restoreFromRecycleBin(req.tenantId!, id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Document restored from Recycle Bin',
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  }

  async permanentDelete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await documentService.permanentDelete(req.tenantId!, id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Document permanently deleted',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Sharing & Permissions ---
  async createShare(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { documentId, accessType, sharedWithEmail, expiryDays } = req.body;
      if (!documentId) throw new BadRequestError('Document ID is required');

      const share = await documentService.createShare(
        req.tenantId!,
        documentId,
        req.user?.email || 'system',
        accessType || 'READ',
        sharedWithEmail,
        expiryDays
      );

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Document shared successfully',
        data: share,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSharedDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await documentService.getSharedDocuments(req.tenantId!, req.user?.email || '');
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Shared documents fetched successfully',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPublicShare(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const doc = await documentService.getPublicShare(token);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Public document fetched successfully',
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Comments ---
  async addComment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { documentId, comment } = req.body;
      if (!documentId || !comment) throw new BadRequestError('Document ID and comment text are required');

      const entry = await documentService.addComment(
        req.tenantId!,
        documentId,
        comment,
        req.user?.email || 'system'
      );

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Comment added successfully',
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  }

  // --- AI Operations ---
  async detectDuplicates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { title, fileSize } = req.query;
      if (!title || !fileSize) throw new BadRequestError('Title and file size are required for duplicate detection');

      const dupes = await documentService.detectDuplicates(
        req.tenantId!,
        title as string,
        Number(fileSize)
      );

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Duplicate scan completed',
        data: dupes,
      });
    } catch (error) {
      next(error);
    }
  }

  async runOCR(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const text = await documentService.runOCR(req.tenantId!, id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'AI OCR scan completed successfully',
        data: { text },
      });
    } catch (error) {
      next(error);
    }
  }

  async smartSearch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { query } = req.query;
      if (!query) throw new BadRequestError('Search query is required');

      const results = await documentService.smartSearch(req.tenantId!, query as string);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'AI Smart search completed successfully',
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DocumentController();
export const documentController = new DocumentController();
