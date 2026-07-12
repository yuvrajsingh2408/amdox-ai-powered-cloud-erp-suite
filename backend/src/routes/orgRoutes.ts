import { Router } from 'express';
import orgController from '../controllers/orgController';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes under this namespace
router.use(protect);

router.get('/chart', orgController.getOrgChart);
router.get('/dashboard', orgController.getHRDashboard);

export default router;
export { router };
