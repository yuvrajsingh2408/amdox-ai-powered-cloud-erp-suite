import { Router } from 'express';
import apController from '../controllers/apController';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/vendors', apController.getVendors);
router.post('/vendors', restrictTo('ADMIN', 'FINANCE_MANAGER'), apController.createVendor);

router.get('/bills', apController.getBills);
router.post('/bills', restrictTo('ADMIN', 'FINANCE_MANAGER'), apController.createBill);
router.post('/bills/:id/pay', restrictTo('ADMIN', 'FINANCE_MANAGER'), apController.payBill);

router.get('/reports/aging', apController.getApAgingReport);

export default router;
export { router };
