import { Router } from 'express';
import departmentController from '../controllers/departmentController';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes under this namespace
router.use(protect);

// Retrieve department statistics
router.get('/:id/statistics', departmentController.getDepartmentStats);

// Detail operations
router.route('/:id')
  .get(departmentController.getDepartment)
  .patch(restrictTo('ADMIN', 'HR_MANAGER'), departmentController.updateDepartment)
  .delete(restrictTo('ADMIN', 'HR_MANAGER'), departmentController.deleteDepartment);

// Global list and creation
router.route('/')
  .get(departmentController.getAllDepartments)
  .post(restrictTo('ADMIN', 'HR_MANAGER'), departmentController.createDepartment);

export default router;
export { router };
