import { Router } from 'express';
import rbacController from '../controllers/rbacController';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes under this namespace
router.use(protect);

// Retrieve roles and permissions list
router.get('/roles', rbacController.getRoles);
router.get('/permissions', rbacController.getPermissions);

// Map permissions to role (Restricted to ADMIN role only)
router.post('/assign-permissions', restrictTo('ADMIN'), rbacController.assignPermissionsToRole);

// Manage permission details (Restricted to ADMIN role only)
router.post('/permissions', restrictTo('ADMIN'), rbacController.createPermission);
router.patch('/permissions/:id', restrictTo('ADMIN'), rbacController.updatePermission);
router.delete('/permissions/:id', restrictTo('ADMIN'), rbacController.deletePermission);

export default router;
export { router };
