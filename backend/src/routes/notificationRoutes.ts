import { Router } from 'express';
import notificationController from '../controllers/notificationController';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

// Basic notifications CRUD
router.get('/', notificationController.getNotifications);
router.put('/mark-read', notificationController.markNotificationsRead);
router.put('/:id/read', notificationController.markSingleRead);
router.delete('/:id', notificationController.deleteNotification);

// User preferences
router.get('/preferences', notificationController.getPreferences);
router.put('/preferences', notificationController.updatePreferences);

// Announcements & Broadcasts
router.get('/announcements', notificationController.getAnnouncements);
router.post('/announcements', notificationController.createAnnouncement);
router.delete('/announcements/:id', notificationController.deleteAnnouncement);

// Templates
router.get('/templates', notificationController.getTemplates);
router.post('/templates', notificationController.saveTemplate);
router.delete('/templates/:id', notificationController.deleteTemplate);

// Manual trigger test
router.post('/trigger', notificationController.triggerTestNotification);

export default router;
export { router };
