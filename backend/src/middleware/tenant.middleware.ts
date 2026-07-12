import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';
import { BadRequestError, NotFoundError } from '../utils/errors';
import jwt from 'jsonwebtoken';
import env from '../config/env';

export const tenantMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Bypass tenant resolution for specific public/global API endpoints
  const publicPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh-token', '/api/health', '/api-docs'];
  const isPublic = publicPaths.some(path => req.originalUrl.startsWith(path) || req.path.startsWith(path));
  
  if (isPublic) {
    return next();
  }

  const tenantId = req.headers['x-tenant-id'] as string;
  const subdomainHeader = req.headers['x-tenant-subdomain'] as string;

  let tenantIdentifier = tenantId;

  // Resolve subdomain from header or host header
  if (!tenantIdentifier && subdomainHeader) {
    tenantIdentifier = subdomainHeader;
  } else if (!tenantIdentifier) {
    const hostname = req.hostname;
    // Assuming format: tenant-subdomain.domain.com
    const parts = hostname.split('.');
    if (parts.length > 2) {
      tenantIdentifier = parts[0];
    }
  }

  // Pre-resolve req.user if authorization header is present
  if (!tenantIdentifier && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      const user = await prisma.user.findFirst({
        where: { id: decoded.id, deletedAt: null },
        include: {
          userRoles: {
            where: { deletedAt: null },
            include: { role: true }
          }
        }
      });
      if (user && user.status === 'ACTIVE') {
        const roles = user.userRoles.map(ur => ur.role.name);
        const role = roles.includes('ADMIN') ? 'ADMIN' : (roles[0] || 'EMPLOYEE');
        req.user = {
          id: user.id,
          email: user.email,
          role: role as any,
          roles,
          permissions: [],
          firstName: user.firstName,
          lastName: user.lastName,
        };
      }
    } catch (err) {
      // Ignore token verification errors here, auth guard will handle it
    }
  }

  // Fallback: If no tenant is provided, look if user is already authenticated
  // and has a tenantId associated. If so, bind to that tenantId.
  if (!tenantIdentifier && req.user && (req.user.role === 'ADMIN' || req.user.roles.includes('ADMIN'))) {
    // Admin user can perform global calls or system calls. 
    return next();
  }

  if (!tenantIdentifier) {
    return next(new BadRequestError('Tenant identifier (x-tenant-id or x-tenant-subdomain header) is missing.'));
  }

  try {
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { id: tenantIdentifier },
          { subdomain: tenantIdentifier }
        ],
        deletedAt: null,
      },
    });

    if (!tenant) {
      return next(new NotFoundError('Active tenant could not be resolved. Please check your credentials.'));
    }

    if (tenant.status !== 'ACTIVE') {
      return next(new BadRequestError('Resolved tenant is inactive. Please contact your system administrator.'));
    }

    // Bind resolved Tenant ID to request context
    req.tenantId = tenant.id;
    next();
  } catch (error) {
    next(error);
  }
};

export default tenantMiddleware;
