import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { AuthenticatedRequest, RoleName } from '../types';
import { UnauthorizedError } from '../utils/errors';
import env from '../config/env';

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = '';
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new UnauthorizedError('Please log in to get access.'));
    }

    // Verify token using configuration env
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;

    // Fetch user and include their dynamic roles & permissions
    const user = await prisma.user.findFirst({
      where: { 
        id: decoded.id,
        deletedAt: null
      },
      include: {
        userRoles: {
          where: { deletedAt: null },
          include: {
            role: {
              include: {
                permissions: {
                  where: { deletedAt: null },
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return next(
        new UnauthorizedError('The user belonging to this token no longer exists.')
      );
    }

    if (user.status !== 'ACTIVE') {
      return next(new UnauthorizedError('This user account has been disabled.'));
    }

    // Verify tenant access boundary. Admins with no tenantId bound can access system resources,
    // otherwise the user's tenantId must match the request tenantId.
    if (user.tenantId && req.tenantId && user.tenantId !== req.tenantId) {
      return next(new UnauthorizedError('Access denied: Unauthorized access to tenant resource.'));
    }

    // Implicitly bind request tenantId to user's tenantId if not already present
    if (!req.tenantId && user.tenantId) {
      req.tenantId = user.tenantId;
    }

    // Gather roles and permissions list
    const roles = user.userRoles.map(ur => ur.role.name);
    const permissions = Array.from(new Set(
      user.userRoles.flatMap(ur =>
        ur.role.permissions.map(rp => rp.permission.name)
      )
    ));

    // Fallback role name for compatibility
    const role = (roles.includes('ADMIN') ? 'ADMIN' : roles[0] || 'EMPLOYEE') as RoleName;

    req.user = {
      id: user.id,
      email: user.email,
      role,
      roles,
      permissions,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid token. Please log in again.'));
  }
};

export const restrictTo = (...roles: RoleName[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || (!roles.includes(req.user.role) && !req.user.roles.some(r => roles.includes(r as RoleName)))) {
      return next(
        new UnauthorizedError('Forbidden: You do not have the required role to access this resource.')
      );
    }
    next();
  };
};
