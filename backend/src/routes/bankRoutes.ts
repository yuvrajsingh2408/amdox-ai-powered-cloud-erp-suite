import { Router } from 'express';
import bankController from '../controllers/bankController';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/accounts', bankController.getBankAccounts);
router.post('/accounts', restrictTo('ADMIN', 'FINANCE_MANAGER'), bankController.createBankAccount);

router.get('/accounts/:id/transactions', bankController.getTransactions);
router.post('/accounts/:id/transactions', restrictTo('ADMIN', 'FINANCE_MANAGER'), bankController.createTransaction);
router.post('/accounts/:id/reconcile/:transId', restrictTo('ADMIN', 'FINANCE_MANAGER'), bankController.reconcileTransaction);
router.post('/accounts/:id/statement', restrictTo('ADMIN', 'FINANCE_MANAGER'), bankController.uploadStatement);

export default router;
export { router };
