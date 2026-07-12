import { Router } from 'express';
import tenantController from '../controllers/tenantController';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes under this namespace
router.use(protect);

// Switch active tenant (Accessible to all users authorized for target tenant)
router.post('/:id/switch', tenantController.switchTenant);

// Retrieve details or update settings
router.route('/:id')
  .get(tenantController.getTenant)
  .patch(tenantController.updateTenant);

// General CRUD (Restricted to system ADMIN role only)
router.route('/')
  .get(restrictTo('ADMIN'), tenantController.getAllTenants)
  .post(restrictTo('ADMIN'), tenantController.createTenant);

router.delete('/:id', restrictTo('ADMIN'), tenantController.deleteTenant);

export default router;
export { router };
