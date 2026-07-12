import { Router } from 'express';
import authController from '../controllers/authController';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);

// Protected routes
router.get('/me', protect, authController.getMe);
router.get('/profile', protect, authController.getProfile);
router.patch('/profile', protect, authController.updateProfile);
router.post('/change-password', protect, authController.changePassword);

// Two-Factor Authentication routes
router.post('/2fa/setup', protect, authController.setup2FA);
router.post('/2fa/verify', protect, authController.verify2FA);
router.post('/2fa/disable', protect, authController.disable2FA);

export default router;
export { router };
