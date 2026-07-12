import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { sendResponse } from '../utils/response';

export class DepartmentController {
  // GET /api/departments
  async getAllDepartments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await prisma.department.findMany({
        where: { 
          tenantId: req.tenantId!,
          deletedAt: null
        },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              designation: true,
            }
          },
          _count: {
            select: { employees: { where: { deletedAt: null } } }
          }
        },
        orderBy: { name: 'asc' },
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Departments directory fetched successfully',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/departments/:id
  async getDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const dept = await prisma.department.findFirst({
        where: { id, tenantId: req.tenantId!, deletedAt: null },
        include: {
          manager: true,
          employees: {
            where: { deletedAt: null },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              designation: true,
              status: true
            }
          }
        }
      });

      if (!dept) {
        return next(new NotFoundError('Department not found'));
      }

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Department details fetched successfully',
        data: dept,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/departments
  async createDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, managerId } = req.body;
      if (!name) {
        return next(new BadRequestError('Department name is required'));
      }

      // Check duplicate
      const existing = await prisma.department.findFirst({
        where: { name, tenantId: req.tenantId!, deletedAt: null }
      });
      if (existing) {
        return next(new BadRequestError('Department name already exists'));
      }

      const dept = await prisma.department.create({
        data: {
          name,
          managerId: managerId || null,
          tenantId: req.tenantId!,
        }
      });

      // Log action
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          tenantId: req.tenantId,
          action: 'CREATE_DEPARTMENT',
          module: 'HR',
          details: `Created department: ${dept.name}`,
        }
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Department created successfully',
        data: dept,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/departments/:id
  async updateDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, managerId } = req.body;

      const dept = await prisma.department.findFirst({
        where: { id, tenantId: req.tenantId!, deletedAt: null }
      });
      if (!dept) {
        return next(new NotFoundError('Department not found'));
      }

      if (name) {
        const existing = await prisma.department.findFirst({
          where: { name, tenantId: req.tenantId!, NOT: { id }, deletedAt: null }
        });
        if (existing) {
          return next(new BadRequestError('Department name already exists'));
        }
      }

      const updated = await prisma.department.update({
        where: { id },
        data: {
          name: name || undefined,
          managerId: managerId === null ? null : managerId || undefined,
        }
      });

      // If manager is assigned, update that manager's designation/record if needed
      if (managerId) {
        await prisma.employee.update({
          where: { id: managerId },
          data: { departmentId: id } // Ensure the manager belongs to the department they manage
        });
      }

      // Log action
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          tenantId: req.tenantId,
          action: 'UPDATE_DEPARTMENT',
          module: 'HR',
          details: `Updated department info for: ${updated.name}`,
        }
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Department updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/departments/:id
  async deleteDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const dept = await prisma.department.findFirst({
        where: { id, tenantId: req.tenantId!, deletedAt: null }
      });
      if (!dept) {
        return next(new NotFoundError('Department not found'));
      }

      // Ensure no active employees are currently linked to this department
      const employeeCount = await prisma.employee.count({
        where: { departmentId: id, deletedAt: null }
      });
      if (employeeCount > 0) {
        return next(new BadRequestError('Cannot delete department while active employees are assigned to it'));
      }

      await prisma.department.update({
        where: { id },
        data: { deletedAt: new Date() }
      });

      // Log action
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          tenantId: req.tenantId,
          action: 'DELETE_DEPARTMENT',
          module: 'HR',
          details: `Soft deleted department: ${dept.name}`,
        }
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Department deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/departments/:id/statistics
  async getDepartmentStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const dept = await prisma.department.findFirst({
        where: { id, tenantId: req.tenantId!, deletedAt: null }
      });
      if (!dept) {
        return next(new NotFoundError('Department not found'));
      }

      // 1. Employee Count
      const headcount = await prisma.employee.count({
        where: { departmentId: id, deletedAt: null }
      });

      // 2. Total Monthly Payroll
      const salaryAggregate = await prisma.employee.aggregate({
        _sum: { salary: true },
        where: { departmentId: id, status: 'ACTIVE', deletedAt: null }
      });
      const monthlySpend = salaryAggregate._sum.salary || 0;

      // 3. Active Leaves (Pending or Approved)
      const activeLeaves = await prisma.leave.count({
        where: {
          employee: { departmentId: id },
          status: { in: ['PENDING', 'APPROVED'] },
          deletedAt: null,
        }
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Department statistics compiled successfully',
        data: {
          departmentId: id,
          departmentName: dept.name,
          headcount,
          monthlySpend,
          activeLeaves,
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DepartmentController();
export const departmentController = new DepartmentController();
