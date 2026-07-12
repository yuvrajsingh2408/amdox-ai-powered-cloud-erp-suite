import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError } from '../utils/errors';
import env from '../config/env';
import crypto from 'crypto';

export class AuthService {
  // Generate Access Token (JWT)
  generateAccessToken(userId: string): string {
    return jwt.sign({ id: userId }, env.JWT_SECRET, {
      expiresIn: '1h',
    });
  }

  // Generate Refresh Token (JWT)
  generateRefreshToken(userId: string, ipAddress?: string, userAgent?: string): string {
    return jwt.sign({ id: userId, ipAddress, userAgent }, env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });
  }

  // Register a new user under a tenant
  async register(data: {
    email: string;
    passwordPlain: string;
    firstName: string;
    lastName: string;
    tenantIdentifier?: string;
    roleName?: string;
  }) {
    const existing = await prisma.user.findFirst({
      where: { email: data.email, deletedAt: null },
    });
    if (existing) {
      throw new BadRequestError('Email already registered');
    }

    // Salt and hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.passwordPlain, salt);

    // Resolve tenant if provided
    let tenantId: string | null = null;
    if (data.tenantIdentifier) {
      const tenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { id: data.tenantIdentifier },
            { subdomain: data.tenantIdentifier }
          ],
          deletedAt: null,
        }
      });
      if (!tenant) {
        throw new NotFoundError('Resolved tenant was not found.');
      }
      tenantId = tenant.id;
    } else {
      // Assign to first default tenant if available
      const firstTenant = await prisma.tenant.findFirst({ where: { deletedAt: null } });
      if (firstTenant) {
        tenantId = firstTenant.id;
      }
    }

    // Generate verification details
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        tenantId,
        status: 'ACTIVE', // Automatically active on self-registration
        verificationToken,
        verificationTokenExpires,
      },
    });

    // Resolve or assign role
    const requestedRoleName = data.roleName || 'EMPLOYEE';
    let role = await prisma.role.findFirst({
      where: { name: requestedRoleName, tenantId },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          name: requestedRoleName,
          tenantId,
        }
      });
    }

    // Map User to Role
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
      }
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        tenantId,
        action: 'REGISTER',
        module: 'AUTHENTICATION',
        details: `User registered: ${user.email} with role ${role.name}`,
      },
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    // Save refresh token to db
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    });

    return { accessToken, refreshToken, user: { ...user, role: role.name } };
  }

  // Login a user (with lockout safety)
  async login(email: string, passwordPlain: string, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: {
        userRoles: {
          where: { deletedAt: null },
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Lockout check
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new ForbiddenError(`Account is temporarily locked. Try again in ${remainingMinutes} minutes.`);
    }

    if (user.status !== 'ACTIVE' && user.status !== 'INVITED') {
      throw new UnauthorizedError('Account is disabled or verification is pending.');
    }

    // Compare passwords
    const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isValid) {
      // Increment failed login count
      const attempts = user.failedLoginAttempts + 1;
      const shouldLock = attempts >= 5;
      const lockedUntil = shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null; // 15 mins lock

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: shouldLock ? 0 : attempts,
          lockedUntil,
          status: shouldLock ? 'LOCKED' : user.status,
        }
      });

      if (shouldLock) {
        throw new ForbiddenError('Too many failed attempts. Account has been locked for 15 minutes.');
      } else {
        throw new UnauthorizedError(`Invalid credentials. Attempts remaining: ${5 - attempts}`);
      }
    }

    // Reset failed attempts on success
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      }
    });

    // Log login audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        action: 'LOGIN',
        module: 'AUTHENTICATION',
        details: `User logged in: ${user.email}`,
        ipAddress,
      },
    });

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id, ipAddress, userAgent);

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress,
        userAgent,
      }
    });

    const roles = user.userRoles.map(ur => ur.role.name);
    const primaryRole = roles.includes('ADMIN') ? 'ADMIN' : roles[0] || 'EMPLOYEE';

    return { 
      accessToken, 
      refreshToken, 
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        role: primaryRole,
        roles,
        tenantId: user.tenantId,
        twoFactorEnabled: user.twoFactorEnabled,
      } 
    };
  }

  // Logout a user
  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    });
  }

  // Refresh token rotation
  async refresh(tokenStr: string, ipAddress?: string, userAgent?: string) {
    // Find token in DB
    const storedToken = await prisma.refreshToken.findFirst({
      where: { token: tokenStr, deletedAt: null },
      include: { user: true }
    });

    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new UnauthorizedError('Refresh token expired');
    }

    try {
      jwt.verify(tokenStr, env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token signature');
    }

    // Generate new pair
    const accessToken = this.generateAccessToken(storedToken.userId);
    const newRefreshToken = this.generateRefreshToken(storedToken.userId, ipAddress, userAgent);

    // Delete old refresh token, save new one
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress,
        userAgent,
      }
    });

    return { accessToken, refreshToken: newRefreshToken, userId: storedToken.userId };
  }

  // Invite user (created in status INVITED with verification link)
  async inviteUser(
    tenantId: string,
    data: { email: string; firstName: string; lastName: string; roleName: string },
    adminUserId?: string
  ) {
    const existing = await prisma.user.findFirst({
      where: { email: data.email, deletedAt: null }
    });
    if (existing) {
      throw new BadRequestError('User email already exists');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    // Generate default random temporary password
    const tempPassword = crypto.randomBytes(12).toString('base64');
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        tenantId,
        status: 'INVITED',
        verificationToken,
        verificationTokenExpires,
      }
    });

    // Find role
    let role = await prisma.role.findFirst({
      where: { name: data.roleName, tenantId }
    });
    if (!role) {
      role = await prisma.role.create({
        data: { name: data.roleName, tenantId }
      });
    }

    // Map User to Role
    await prisma.userRole.create({
      data: { userId: user.id, roleId: role.id }
    });

    // Log invite
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        tenantId,
        action: 'INVITE_USER',
        module: 'USER_MANAGEMENT',
        details: `Invited user: ${user.email} as ${data.roleName}`,
      }
    });

    // Returns verification details. In a real system, you would email this link.
    const inviteLink = `${env.AI_SERVICE_URL.replace(':8000', ':3000')}/reset-password?token=${verificationToken}`;
    return { user, inviteLink, tempPassword };
  }

  // Verify email and activate account
  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: { gt: new Date() },
        deletedAt: null,
      }
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'ACTIVE',
        verificationToken: null,
        verificationTokenExpires: null,
      }
    });

    return user;
  }

  // Forgot password token generation
  async forgotPassword(email: string) {
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null }
    });

    if (!user) {
      // Avoid enumerating email accounts for security, but return resolved placeholder message
      return { message: 'If the email exists, a password reset link has been compiled.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      }
    });

    // Compile reset link
    const resetLink = `${env.AI_SERVICE_URL.replace(':8000', ':3000')}/reset-password?token=${resetToken}`;
    console.log(`🔑 [SECURITY] Password reset compiled for ${email}: ${resetLink}`);

    return { resetLink };
  }

  // Reset password verification
  async resetPassword(token: string, passwordPlain: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { resetPasswordToken: token, resetPasswordExpires: { gt: new Date() } },
          { verificationToken: token, verificationTokenExpires: { gt: new Date() } } // Also allow setting password during activation
        ],
        deletedAt: null,
      }
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired reset token.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        verificationToken: null,
        verificationTokenExpires: null,
        status: 'ACTIVE', // Sets account active on password resetting
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        action: 'RESET_PASSWORD',
        module: 'AUTHENTICATION',
        details: `Password reset successfully via token for ${user.email}`,
      }
    });

    return user;
  }

  // Logged in user password change
  async changePassword(userId: string, currentPasswordPlain: string, newPasswordPlain: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      throw new NotFoundError('User profile not found.');
    }

    const isValid = await bcrypt.compare(currentPasswordPlain, user.passwordHash);
    if (!isValid) {
      throw new BadRequestError('Current password is incorrect.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPasswordPlain, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        tenantId: user.tenantId,
        action: 'CHANGE_PASSWORD',
        module: 'USER_MANAGEMENT',
        details: `Password changed manually for ${user.email}`,
      }
    });
  }

  // Update profile variables
  async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string }
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl: data.avatarUrl,
      }
    });

    // Check if employee directory needs synchronizing
    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (employee) {
      await prisma.employee.update({
        where: { id: employee.id },
        data: {
          firstName: data.firstName || employee.firstName,
          lastName: data.lastName || employee.lastName,
          phone: data.phone || employee.phone,
          avatarUrl: data.avatarUrl || employee.avatarUrl,
        }
      });
    }

    return user;
  }

  // Toggle 2FA settings
  async toggle2FA(userId: string, enable: boolean, secret?: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: enable,
        twoFactorSecret: enable ? secret : null,
      }
    });
  }
}

export default new AuthService();
export const authService = new AuthService();
