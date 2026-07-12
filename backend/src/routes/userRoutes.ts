import { Router } from 'express';
import userController from '../controllers/userController';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes under this namespace
router.use(protect);
router.use(restrictTo('ADMIN'));

router.post('/invite', userController.inviteUser);

router.route('/:id')
  .get(userController.getUser)
  .patch(userController.editUser)
  .delete(userController.deleteUser);

router.patch('/:id/status', userController.updateUserStatus);

router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

export default router;
export { router };
