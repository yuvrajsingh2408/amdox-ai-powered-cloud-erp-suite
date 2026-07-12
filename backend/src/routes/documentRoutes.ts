import { Router } from 'express';
import documentController from '../controllers/documentController';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Public route for public share links
router.get('/public/:token', documentController.getPublicShare);

// Protect all other routes
router.use(protect);

// Folder routes
router.post('/folders', documentController.createFolder);
router.get('/folders', documentController.getFolders);
router.delete('/folders/:id', documentController.deleteFolder);

// Document CRUD & versioning
router.post('/', documentController.uploadDocument);
router.post('/:id/versions', documentController.uploadNewVersion);
router.get('/', documentController.getDocuments);
router.get('/shared', documentController.getSharedDocuments);
router.post('/share', documentController.createShare);
router.get('/:id', documentController.getDocumentDetails);
router.put('/:id/favorite', documentController.toggleFavorite);
router.delete('/:id', documentController.moveToRecycleBin);
router.put('/:id/restore', documentController.restoreFromRecycleBin);
router.delete('/:id/permanent', documentController.permanentDelete);

// Comments
router.post('/comments', documentController.addComment);

// AI operations
router.get('/ai/duplicates', documentController.detectDuplicates);
router.get('/ai/ocr/:id', documentController.runOCR);
router.get('/ai/search', documentController.smartSearch);

export default router;
export { router };
