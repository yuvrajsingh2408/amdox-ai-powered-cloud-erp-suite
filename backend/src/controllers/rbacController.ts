import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { sendResponse } from '../utils/response';

export class RbacController {
  // GET /api/rbac/roles
  async getRoles(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await prisma.role.findMany({
        where: {
          OR: [
            { tenantId: req.tenantId },
            { tenantId: null }
          ],
          deletedAt: null
        },
        include: {
          permissions: {
            where: { deletedAt: null },
            include: { permission: true }
          }
        },
        orderBy: { name: 'asc' },
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Tenant roles retrieved successfully',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/rbac/permissions
  async getPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await prisma.permission.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'System permissions retrieved successfully',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/rbac/permissions (ADMIN only)
  async createPermission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      if (!name) {
        return next(new BadRequestError('Permission name is required'));
      }

      const existing = await prisma.permission.findUnique({ where: { name } });
      if (existing) {
        return next(new BadRequestError('Permission already exists'));
      }

      const record = await prisma.permission.create({
        data: { name, description }
      });

      // Log action
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          tenantId: req.tenantId,
          action: 'CREATE_PERMISSION',
          module: 'RBAC',
          details: `Created permission: ${record.name}`,
        }
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Permission created successfully',
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/rbac/permissions/:id (ADMIN only)
  async updatePermission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { description } = req.body;

      const perm = await prisma.permission.findFirst({
        where: { id, deletedAt: null }
      });
      if (!perm) {
        return next(new NotFoundError('Permission not found'));
      }

      const updated = await prisma.permission.update({
        where: { id },
        data: { description }
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Permission updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/rbac/permissions/:id (ADMIN only)
  async deletePermission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const perm = await prisma.permission.findFirst({
        where: { id, deletedAt: null }
      });
      if (!perm) {
        return next(new NotFoundError('Permission not found'));
      }

      await prisma.permission.update({
        where: { id },
        data: { deletedAt: new Date() }
      });

      // Log action
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          tenantId: req.tenantId,
          action: 'DELETE_PERMISSION',
          module: 'RBAC',
          details: `Soft deleted permission: ${perm.name}`,
        }
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Permission deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/rbac/assign-permissions
  async assignPermissionsToRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { roleId, permissionIds } = req.body;
      if (!roleId || !Array.isArray(permissionIds)) {
        return next(new BadRequestError('Role ID and list of Permission IDs are required'));
      }

      // Verify the role belongs to the current tenant (or is global)
      const role = await prisma.role.findFirst({
        where: {
          id: roleId,
          OR: [
            { tenantId: req.tenantId },
            { tenantId: null }
          ],
          deletedAt: null
        }
      });

      if (!role) {
        return next(new NotFoundError('Role not found or unauthorized'));
      }

      await prisma.$transaction(async (tx) => {
        // 1. Delete existing RolePermissions
        await tx.rolePermission.deleteMany({
          where: { roleId }
        });

        // 2. Insert new RolePermissions
        if (permissionIds.length > 0) {
          await tx.rolePermission.createMany({
            data: permissionIds.map(permId => ({
              roleId,
              permissionId: permId,
            }))
          });
        }

        // 3. Log action
        await tx.auditLog.create({
          data: {
            userId: req.user?.id,
            tenantId: req.tenantId,
            action: 'ASSIGN_ROLE_PERMISSIONS',
            module: 'RBAC',
            details: `Assigned ${permissionIds.length} permissions to role: ${role.name}`,
          }
        });
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Permissions mapped to role successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new RbacController();
export const rbacController = new RbacController();
