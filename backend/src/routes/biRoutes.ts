import { Router } from 'express';
import biController from '../controllers/biController';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/metrics', biController.getMetrics);

router.route('/dashboards')
  .get(biController.getDashboards)
  .post(restrictTo('ADMIN', 'FINANCE_MANAGER', 'SCM_MANAGER'), biController.saveDashboard);

export default router;
export { router };
