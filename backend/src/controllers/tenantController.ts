import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/db';
import { BadRequestError, NotFoundError, ForbiddenError, UnauthorizedError } from '../utils/errors';
import { sendResponse } from '../utils/response';
import authService from '../services/authService';

export class TenantController {
  // GET /api/tenants (ADMIN only)
  async getAllTenants(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await prisma.tenant.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Tenants directory fetched successfully',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/tenants/:id
  async getTenant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenant = await prisma.tenant.findFirst({
        where: { id, deletedAt: null }
      });

      if (!tenant) {
        return next(new NotFoundError('Tenant not found'));
      }

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Tenant details fetched successfully',
        data: tenant,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/tenants (ADMIN only)
  async createTenant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, subdomain, logoUrl, address, phone, email, currency, taxId } = req.body;
      if (!name || !subdomain) {
        return next(new BadRequestError('Name and subdomain are required'));
      }

      const existing = await prisma.tenant.findUnique({
        where: { subdomain }
      });
      if (existing) {
        return next(new BadRequestError('Subdomain already taken'));
      }

      const tenant = await prisma.tenant.create({
        data: {
          name,
          subdomain,
          logoUrl,
          address,
          phone,
          email,
          currency: currency || 'USD',
          taxId,
        }
      });

      // Log action
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          action: 'CREATE_TENANT',
          module: 'TENANT_MANAGEMENT',
          details: `Tenant created: ${tenant.name} (${tenant.subdomain})`,
        }
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Tenant created successfully',
        data: tenant,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/tenants/:id
  async updateTenant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Multi-tenant check: non-admins can only modify their own tenant
      if (req.user?.role !== 'ADMIN' && req.tenantId !== id) {
        return next(new ForbiddenError('Access denied: Unauthorized tenant settings access.'));
      }

      const tenant = await prisma.tenant.findFirst({
        where: { id, deletedAt: null }
      });
      if (!tenant) {
        return next(new NotFoundError('Tenant not found'));
      }

      const updated = await prisma.tenant.update({
        where: { id },
        data: {
          name: req.body.name,
          logoUrl: req.body.logoUrl,
          address: req.body.address,
          phone: req.body.phone,
          email: req.body.email,
          currency: req.body.currency,
          taxId: req.body.taxId,
          status: req.user?.role === 'ADMIN' ? req.body.status : undefined, // Admins only can change tenant status
        }
      });

      // Log action
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          tenantId: id,
          action: 'UPDATE_TENANT',
          module: 'TENANT_MANAGEMENT',
          details: `Updated settings for tenant: ${updated.name}`,
        }
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Tenant settings updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/tenants/:id (ADMIN only)
  async deleteTenant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenant = await prisma.tenant.findFirst({
        where: { id, deletedAt: null }
      });

      if (!tenant) {
        return next(new NotFoundError('Tenant not found'));
      }

      await prisma.tenant.update({
        where: { id },
        data: { deletedAt: new Date() }
      });

      // Log action
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          action: 'DELETE_TENANT',
          module: 'TENANT_MANAGEMENT',
          details: `Soft deleted tenant: ${tenant.name}`,
        }
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Tenant deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/tenants/:id/switch
  async switchTenant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const targetTenant = await prisma.tenant.findFirst({
        where: { id, deletedAt: null, status: 'ACTIVE' }
      });

      if (!targetTenant) {
        return next(new NotFoundError('Active target tenant not found'));
      }

      const userId = req.user!.id;

      // Access Check: Is the user a global Admin, or do they belong to this tenant, or do they possess a UserRole under it?
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return next(new UnauthorizedError('User session invalid'));
      }

      const isGlobalAdmin = req.user?.role === 'ADMIN';
      const isTenantMember = user.tenantId === id;

      // Verify role mapping in target tenant
      let userRole = await prisma.userRole.findFirst({
        where: {
          userId,
          deletedAt: null,
          role: {
            tenantId: id
          }
        },
        include: { role: true }
      });

      if (!isGlobalAdmin && !isTenantMember && !userRole) {
        return next(new ForbiddenError('You do not have access to switch to this tenant.'));
      }

      // If no role mapping exists in target tenant but user belongs to it, create default Employee role mapping
      if (!userRole) {
        let defaultRole = await prisma.role.findFirst({
          where: { name: isGlobalAdmin ? 'ADMIN' : 'EMPLOYEE', tenantId: id }
        });

        if (!defaultRole) {
          defaultRole = await prisma.role.create({
            data: {
              name: isGlobalAdmin ? 'ADMIN' : 'EMPLOYEE',
              tenantId: id,
            }
          });
        }

        userRole = await prisma.userRole.create({
          data: {
            userId,
            roleId: defaultRole.id,
          },
          include: { role: true }
        });
      }

      // Perform user tenantId switch update in DB
      await prisma.user.update({
        where: { id: userId },
        data: { tenantId: id }
      });

      // Generate new tokens
      const accessToken = authService.generateAccessToken(userId);
      const refreshToken = authService.generateRefreshToken(userId);

      // Create new session tracking
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
        }
      });

      // Log switch
      await prisma.auditLog.create({
        data: {
          userId,
          tenantId: id,
          action: 'SWITCH_TENANT',
          module: 'TENANT_MANAGEMENT',
          details: `User switched active session tenant to: ${targetTenant.name}`,
        }
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: `Switched active tenant to ${targetTenant.name}`,
        data: {
          accessToken,
          refreshToken,
          tenant: {
            id: targetTenant.id,
            name: targetTenant.name,
            subdomain: targetTenant.subdomain,
            logoUrl: targetTenant.logoUrl,
            currency: targetTenant.currency,
          },
          role: userRole.role.name,
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TenantController();
export const tenantController = new TenantController();
