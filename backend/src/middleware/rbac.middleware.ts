import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { ForbiddenError } from '../utils/errors';

export const checkPermission = (requiredPermission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Admin role bypasses permission checks (super-user authority)
    if (req.user && (req.user.role === 'ADMIN' || req.user.roles.includes('ADMIN'))) {
      return next();
    }

    if (!req.user || !req.user.permissions.includes(requiredPermission)) {
      return next(
        new ForbiddenError(`Forbidden: You do not have the required permission (${requiredPermission}) to perform this action.`)
      );
    }
    
    next();
  };
};

export default checkPermission;
