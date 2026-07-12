import { Router } from 'express';
import financeController from '../controllers/financeController';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/accounts', financeController.getCOA);
router.post('/accounts', restrictTo('ADMIN', 'FINANCE_MANAGER'), financeController.createAccount);

router.post('/journal', restrictTo('ADMIN', 'FINANCE_MANAGER'), financeController.postJournalEntry);

router.get('/reports/profit-loss', financeController.getProfitAndLoss);
router.get('/reports/balance-sheet', financeController.getBalanceSheet);
router.get('/reports/trial-balance', financeController.getTrialBalance);

router.post('/periods/lock', restrictTo('ADMIN', 'FINANCE_MANAGER'), financeController.lockPeriod);

export default router;
export { router };
