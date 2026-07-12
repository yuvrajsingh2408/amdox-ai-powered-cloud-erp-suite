import { Router } from 'express';
import auditController from '../controllers/auditController';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes under this namespace
router.use(protect);
router.use(restrictTo('ADMIN', 'HR_MANAGER'));

router.get('/', auditController.getAuditLogs);

export default router;
export { router };
