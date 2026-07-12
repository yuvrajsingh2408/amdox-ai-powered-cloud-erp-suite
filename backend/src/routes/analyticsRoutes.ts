import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import analyticsController from '../controllers/analyticsController';

const router = Router();

// Apply JWT auth protection to all routes
router.use(protect);

router.get('/kpis', analyticsController.getKPIs);
router.get('/widgets', analyticsController.getDashboardWidgets);
router.post('/layout', analyticsController.saveLayout);
router.get('/ai-report', analyticsController.generateAIReport);

export default router;
