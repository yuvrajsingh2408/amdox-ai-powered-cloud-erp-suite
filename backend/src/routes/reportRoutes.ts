import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import reportController from '../controllers/reportController';

const router = Router();

// Apply JWT auth protection to all routes
router.use(protect);

router.route('/')
  .get(reportController.getSavedReports)
  .post(reportController.saveReportConfig);

router.get('/preview', reportController.runReportPreview);
router.get('/history', reportController.getExportHistory);
router.post('/export', reportController.triggerExport);

router.patch('/:id/favorite', reportController.toggleFavorite);
router.delete('/:id', reportController.deleteReport);

// Scheduled reporting configurations
router.route('/scheduled')
  .get(reportController.getScheduled)
  .post(reportController.createSchedule);

router.patch('/scheduled/:id/toggle', reportController.toggleSchedule);
router.delete('/scheduled/:id', reportController.deleteSchedule);

// Download compiled reports
router.get('/download/:fileName', reportController.downloadReportFile);

export default router;
