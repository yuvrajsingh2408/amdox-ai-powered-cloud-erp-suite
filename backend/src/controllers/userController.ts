import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import userRepository from '../repositories/userRepository';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { sendResponse } from '../utils/response';
import authService from '../services/authService';

export class UserController {
  // GET /api/users
  async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { search, status, role, page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;
      const skip = (pageNum - 1) * limitNum;

      // Build Prisma where clauses
      const whereClause: any = {
        tenantId: req.tenantId,
        deletedAt: null,
      };

      if (status) {
        whereClause.status = status as string;
      }

      if (search) {
        whereClause.OR = [
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      if (role) {
        whereClause.userRoles = {
          some: {
            deletedAt: null,
            role: {
              name: role as string,
            }
          }
        };
      }

      // Query database
      const [users, totalCount] = await prisma.$transaction([
        prisma.user.findMany({
          where: whereClause,
          orderBy: {
            [sortBy as string]: sortOrder as string,
          },
          skip,
          take: limitNum,
          include: {
            userRoles: {
              where: { deletedAt: null },
              include: { role: true },
            },
            employee: {
              include: { department: true }
            }
          }
        }),
        prisma.user.count({ where: whereClause }),
      ]);

      // Map dynamic role output for UI
      const formatted = users.map(u => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        status: u.status,
        createdAt: u.createdAt,
        avatarUrl: u.avatarUrl,
        twoFactorEnabled: u.twoFactorEnabled,
        role: u.userRoles[0]?.role.name || 'EMPLOYEE',
        department: u.employee?.department?.name || 'Unassigned',
      }));

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Users directory retrieved successfully',
        data: {
          users: formatted,
          pagination: {
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limitNum),
            currentPage: pageNum,
            limit: limitNum,
          }
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/users/:id
  async getUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findFirst({
        where: { id, tenantId: req.tenantId, deletedAt: null },
        include: {
          userRoles: {
            where: { deletedAt: null },
            include: { role: true }
          },
          employee: {
            include: {
              department: true,
              manager: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                }
              }
            }
          }
        }
      });

      if (!user) {
        return next(new NotFoundError('User profile not found'));
      }

      const role = user.userRoles[0]?.role.name || 'EMPLOYEE';

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'User profile details retrieved successfully',
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.status,
          createdAt: user.createdAt,
          avatarUrl: user.avatarUrl,
          twoFactorEnabled: user.twoFactorEnabled,
          role,
          employeeDetails: user.employee ? {
            id: user.employee.id,
            employeeCode: user.employee.employeeCode,
            phone: user.employee.phone,
            designation: user.employee.designation,
            dateOfJoining: user.employee.dateOfJoining,
            salary: user.employee.salary,
            department: user.employee.department,
            manager: user.employee.manager,
          } : null,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/users (ADMIN only - Creates User directly)
  async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName, role, departmentId, salary, designation } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return next(new BadRequestError('Missing required registration properties'));
      }

      const existing = await prisma.user.findFirst({
        where: { email, deletedAt: null }
      });
      if (existing) {
        return next(new BadRequestError('Email already registered'));
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          tenantId: req.tenantId || null,
          status: 'ACTIVE',
        },
      });

      // Find or create role for the tenant
      const requestedRoleName = role || 'EMPLOYEE';
      let dbRole = await prisma.role.findFirst({
        where: { name: requestedRoleName, tenantId: req.tenantId },
      });

      if (!dbRole) {
        dbRole = await prisma.role.create({
          data: {
            name: requestedRoleName,
            tenantId: req.tenantId || null,
          }
        });
      }

      // Map User to Role
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: dbRole.id,
        }
      });

      // Optional: Create employee profile if department is provided
      if (departmentId) {
        await prisma.employee.create({
          data: {
            userId: user.id,
            employeeCode: `EMP-${user.email.split('@')[0].toUpperCase()}`,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            departmentId,
            designation: designation || requestedRoleName,
            dateOfJoining: new Date(),
            salary: parseFloat(salary) || 50000.0,
            tenantId: req.tenantId!,
            status: 'ACTIVE',
          }
        });
      }

      // Log creation
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          tenantId: req.tenantId || null,
          action: 'CREATE_USER',
          module: 'USER_MANAGEMENT',
          details: `Admin created user profile: ${user.email} as ${dbRole.name}`,
        },
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'User profile created successfully',
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: dbRole.name,
          status: user.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/users/invite (ADMIN only)
  async inviteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email, firstName, lastName, role } = req.body;
      if (!email || !firstName || !lastName || !role) {
        return next(new BadRequestError('All properties (email, firstName, lastName, role) are required'));
      }

      const result = await authService.inviteUser(req.tenantId!, {
        email,
        firstName,
        lastName,
        roleName: role
      }, req.user?.id);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'User invited successfully. Verification link compiled.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/users/:id (ADMIN only)
  async editUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { firstName, lastName, role, departmentId, designation, managerId, status } = req.body;

      const user = await prisma.user.findFirst({
        where: { id, tenantId: req.tenantId, deletedAt: null }
      });
      if (!user) {
        return next(new NotFoundError('User not found'));
      }

      await prisma.$transaction(async (tx) => {
        // 1. Update basic user details
        await tx.user.update({
          where: { id },
          data: {
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            status: status || undefined,
          }
        });

        // 2. Update role mapping if provided
        if (role) {
          let dbRole = await tx.role.findFirst({
            where: { name: role, tenantId: req.tenantId }
          });
          if (!dbRole) {
            dbRole = await tx.role.create({
              data: { name: role, tenantId: req.tenantId }
            });
          }

          // Disable old user roles
          await tx.userRole.updateMany({
            where: { userId: id },
            data: { deletedAt: new Date() }
          });

          // Create new UserRole mapping
          await tx.userRole.create({
            data: { userId: id, roleId: dbRole.id }
          });
        }

        // 3. Update or create Employee details if department or manager is specified
        if (departmentId || managerId || designation) {
          const emp = await tx.employee.findUnique({ where: { userId: id } });
          if (emp) {
            await tx.employee.update({
              where: { id: emp.id },
              data: {
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                departmentId: departmentId || undefined,
                designation: designation || undefined,
                managerId: managerId === null ? null : managerId || undefined,
                status: status || undefined,
              }
            });
          } else {
            // Create employee profile
            await tx.employee.create({
              data: {
                userId: id,
                employeeCode: `EMP-${user.email.split('@')[0].toUpperCase()}`,
                firstName: firstName || user.firstName,
                lastName: lastName || user.lastName,
                email: user.email,
                departmentId: departmentId || '',
                designation: designation || role || 'EMPLOYEE',
                dateOfJoining: new Date(),
                salary: 60000.0,
                tenantId: req.tenantId!,
                managerId: managerId || null,
                status: status || 'ACTIVE',
              }
            });
          }
        }

        // 4. Log Action
        await tx.auditLog.create({
          data: {
            userId: req.user?.id,
            tenantId: req.tenantId,
            action: 'EDIT_USER',
            module: 'USER_MANAGEMENT',
            details: `Modified details for user profile: ${user.email}`,
          }
        });
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'User account updated successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/users/:id (ADMIN only)
  async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const user = await prisma.user.findFirst({
        where: { id, tenantId: req.tenantId, deletedAt: null }
      });
      if (!user) {
        return next(new NotFoundError('User not found'));
      }

      await prisma.$transaction(async (tx) => {
        // Soft delete user
        await tx.user.update({
          where: { id },
          data: { deletedAt: new Date() }
        });

        // Soft delete employee profile
        await tx.employee.updateMany({
          where: { userId: id },
          data: { deletedAt: new Date() }
        });

        // Log action
        await tx.auditLog.create({
          data: {
            userId: req.user?.id,
            tenantId: req.tenantId,
            action: 'DELETE_USER',
            module: 'USER_MANAGEMENT',
            details: `Soft deleted user profile: ${user.email}`,
          }
        });
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'User deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/users/:id/status (ADMIN only)
  async updateUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['ACTIVE', 'INACTIVE', 'LOCKED'].includes(status)) {
        return next(new BadRequestError('Valid status value is required'));
      }

      const user = await prisma.user.findFirst({
        where: { id, tenantId: req.tenantId, deletedAt: null }
      });
      if (!user) {
        return next(new NotFoundError('User profile not found'));
      }

      await prisma.user.update({
        where: { id },
        data: { status }
      });

      // Synchronize employee record status if applicable
      await prisma.employee.updateMany({
        where: { userId: id },
        data: { status: status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE' }
      });

      // Log status change
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          tenantId: req.tenantId,
          action: 'UPDATE_USER_STATUS',
          module: 'USER_MANAGEMENT',
          details: `User status changed to ${status} for ${user.email}`,
        },
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: `User account status updated to ${status.toLowerCase()}`,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
export const userController = new UserController();
