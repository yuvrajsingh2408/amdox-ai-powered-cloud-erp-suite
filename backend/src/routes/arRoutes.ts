import { Router } from 'express';
import arController from '../controllers/arController';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/customers', arController.getCustomers);
router.post('/customers', restrictTo('ADMIN', 'FINANCE_MANAGER'), arController.createCustomer);

router.get('/invoices', arController.getInvoices);
router.post('/invoices', restrictTo('ADMIN', 'FINANCE_MANAGER'), arController.createInvoice);
router.post('/invoices/:id/pay', restrictTo('ADMIN', 'FINANCE_MANAGER'), arController.collectPayment);

router.get('/reports/aging', arController.getArAgingReport);

export default router;
export { router };
