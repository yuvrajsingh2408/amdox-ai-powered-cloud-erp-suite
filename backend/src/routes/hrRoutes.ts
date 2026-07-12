import { Router } from 'express';
import hrController from '../controllers/hrController';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes under this namespace
router.use(protect);

// Employee CRUD, imports, and exports
router.get('/employees/export', hrController.exportEmployees);
router.post('/employees/import', restrictTo('ADMIN', 'HR_MANAGER'), hrController.importEmployees);

router.route('/employees/:id')
  .get(hrController.getEmployeeById)
  .patch(restrictTo('ADMIN', 'HR_MANAGER'), hrController.updateEmployee)
  .delete(restrictTo('ADMIN', 'HR_MANAGER'), hrController.deleteEmployee);

router.route('/employees')
  .get(hrController.getEmployees)
  .post(restrictTo('ADMIN', 'HR_MANAGER'), hrController.hireEmployee);

// Leave tracking and balances
router.get('/leaves/balances/:employeeId', hrController.getLeaveBalances);
router.route('/leaves')
  .get(hrController.getLeaves)
  .post(hrController.applyLeave);

router.patch('/leaves/:id/status', restrictTo('ADMIN', 'HR_MANAGER'), hrController.reviewLeave);

// Clock in / out / break logs
router.post('/attendance/clock-in', hrController.clockIn);
router.post('/attendance/break', hrController.toggleBreak);
router.post('/attendance/clock-out', hrController.clockOut);

export default router;
export { router };
