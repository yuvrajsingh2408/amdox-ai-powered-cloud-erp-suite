import { Response, NextFunction } from 'express';
import authService from '../services/authService';
import { AuthenticatedRequest } from '../types';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import { sendResponse } from '../utils/response';
import prisma from '../config/db';

export class AuthController {
  // POST /api/auth/register
  async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName, tenantIdentifier, roleName } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return next(new BadRequestError('All fields (email, password, firstName, lastName) are required'));
      }

      const { accessToken, refreshToken, user } = await authService.register({
        email,
        passwordPlain: password,
        firstName,
        lastName,
        tenantIdentifier,
        roleName,
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'User registered successfully',
        data: {
          accessToken,
          refreshToken,
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/login
  async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new BadRequestError('Email and password are required'));
      }

      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const { accessToken, refreshToken, user } = await authService.login(
        email,
        password,
        ipAddress,
        userAgent
      );

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Logged in successfully',
        data: {
          accessToken,
          refreshToken,
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/logout
  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return next(new BadRequestError('Refresh token is required for logging out'));
      }

      await authService.logout(refreshToken);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Logged out successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/refresh-token
  async refreshToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return next(new BadRequestError('Refresh token is required'));
      }

      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const data = await authService.refresh(refreshToken, ipAddress, userAgent);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Tokens refreshed successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/forgot-password
  async forgotPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        return next(new BadRequestError('Email address is required'));
      }

      const result = await authService.forgotPassword(email);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'If the email exists, a password reset link has been compiled.',
        data: process.env.NODE_ENV === 'development' ? result : null,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/reset-password
  async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return next(new BadRequestError('Token and new password are required'));
      }

      await authService.resetPassword(token, password);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Password reset successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/verify-email
  async verifyEmail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      if (!token) {
        return next(new BadRequestError('Verification token is required'));
      }

      await authService.verifyEmail(token);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Email verified and account activated successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/auth/me
  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return next(new BadRequestError('No user payload present in request context'));
      }
      
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Current user fetched successfully',
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/auth/profile
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findFirst({
        where: { id: req.user?.id, deletedAt: null },
        include: {
          employee: {
            include: {
              department: true,
              manager: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                }
              }
            }
          },
          userRoles: {
            include: {
              role: true
            }
          }
        }
      });

      if (!user) {
        return next(new UnauthorizedError('Profile not found'));
      }

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Profile retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/auth/profile
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await authService.updateProfile(req.user!.id, req.body);
      
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Profile updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/change-password
  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return next(new BadRequestError('Current and new passwords are required'));
      }

      await authService.changePassword(req.user!.id, currentPassword, newPassword);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Password updated successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/2fa/setup
  async setup2FA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Mock generating 2FA credentials
      const secret = 'JBSWY3DPEHPK3PXP'; // Standard Google Authenticator compatible placeholder key
      const qrCodeUrl = `otpauth://totp/AmdoxERP:${req.user!.email}?secret=${secret}&issuer=AmdoxERP`;

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Two Factor Authentication secret generated successfully',
        data: {
          secret,
          qrCodeUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/2fa/verify
  async verify2FA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { secret, code } = req.body;
      if (!secret || !code) {
        return next(new BadRequestError('Secret and validation code are required'));
      }

      // Mock verifying code: For demo, check if code matches standard validator formats (e.g. 123456)
      if (code !== '123456') {
        return next(new BadRequestError('Invalid verification code'));
      }

      await authService.toggle2FA(req.user!.id, true, secret);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Two Factor Authentication configured successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/2fa/disable
  async disable2FA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await authService.toggle2FA(req.user!.id, false);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Two Factor Authentication disabled successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
export const authController = new AuthController();
