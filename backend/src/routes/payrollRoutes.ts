import { Router } from 'express';
import payrollController from '../controllers/payrollController';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes under this namespace
router.use(protect);

router.post('/process', restrictTo('ADMIN', 'FINANCE_MANAGER'), payrollController.processPayroll);
router.post('/approve', restrictTo('ADMIN', 'FINANCE_MANAGER'), payrollController.approvePayroll);
router.get('/history', payrollController.getPayrollHistory);
router.get('/payslips', payrollController.getPayslips);
router.get('/payslips/:id', payrollController.getPayslipById);

export default router;
export { router };
