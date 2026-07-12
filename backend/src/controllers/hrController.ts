import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import hrService from '../services/hrService';
import hrRepository from '../repositories/hrRepository';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { sendResponse } from '../utils/response';
import prisma from '../config/db';

export class HrController {
  // GET /api/hr/employees
  async getEmployees(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { search, departmentId, status, page = '1', limit = '10', sortBy = 'employeeCode', sortOrder = 'asc' } = req.query;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;
      const skip = (pageNum - 1) * limitNum;

      const whereClause: any = {
        tenantId: req.tenantId!,
        deletedAt: null
      };

      if (status) {
        whereClause.status = status as string;
      }

      if (departmentId) {
        whereClause.departmentId = departmentId as string;
      }

      if (search) {
        whereClause.OR = [
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { employeeCode: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [employees, totalCount] = await prisma.$transaction([
        prisma.employee.findMany({
          where: whereClause,
          orderBy: { [sortBy as string]: sortOrder as string },
          skip,
          take: limitNum,
          include: { department: true }
        }),
        prisma.employee.count({ where: whereClause })
      ]);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Employees fetched successfully',
        data: {
          employees,
          pagination: {
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limitNum),
            currentPage: pageNum,
            limit: limitNum
          }
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/hr/employees/:id
  async getEmployeeById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const employee = await hrRepository.findEmployeeById(req.tenantId!, id);

      if (!employee) {
        return next(new NotFoundError('Employee profile not found'));
      }

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Employee profile fetched successfully',
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/hr/employees
  async hireEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { employeeCode, firstName, lastName, email, phone, departmentId, designation, dateOfJoining, salary, managerId } = req.body;
      if (!employeeCode || !firstName || !lastName || !email || !departmentId || !designation || !dateOfJoining || !salary) {
        return next(new BadRequestError('All fields (employeeCode, firstName, lastName, email, departmentId, designation, dateOfJoining, salary) are required'));
      }

      const employee = await hrService.hireEmployee(req.tenantId!, req.body, req.user?.id);
      
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Employee record created successfully',
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/hr/employees/:id
  async updateEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await hrService.updateEmployee(req.tenantId!, id, req.body, req.user?.id);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Employee profile updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/hr/employees/:id
  async deleteEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await hrService.deleteEmployee(req.tenantId!, id, req.user?.id);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Employee record deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/hr/employees/import
  async importEmployees(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { csv } = req.body;
      if (!csv) {
        return next(new BadRequestError('CSV text payload is required'));
      }

      const imported = await hrService.importEmployeesCSV(req.tenantId!, csv, req.user?.id);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: `Import completed successfully. Added ${imported.length} employee profiles.`,
        data: imported,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/hr/employees/export
  async exportEmployees(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await hrRepository.listAllEmployees(req.tenantId!);
      
      // Generate clean CSV representation
      const headers = 'EmployeeCode,FirstName,LastName,Email,Phone,Designation,Salary,Status\n';
      const rows = list.map(e => 
        `"${e.employeeCode}","${e.firstName}","${e.lastName}","${e.email}","${e.phone || ''}","${e.designation}",${e.salary},"${e.status}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=employees_export.csv');
      return res.status(200).send(headers + rows);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/hr/leaves/balances/:employeeId
  async getLeaveBalances(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      const balances = await hrService.getLeaveBalances(req.tenantId!, employeeId);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Leave balances compiled successfully',
        data: balances,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/hr/leaves
  async getLeaves(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await hrRepository.listAllLeaves(req.tenantId!);
      
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Leave applications fetched successfully',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/hr/leaves
  async applyLeave(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { employeeId, leaveType, startDate, endDate, reason } = req.body;
      if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
        return next(new BadRequestError('All properties (employeeId, leaveType, startDate, endDate, reason) are required'));
      }

      const leave = await hrService.applyLeave(req.tenantId!, req.body);
      
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Leave application submitted successfully',
        data: leave,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/hr/leaves/:id/status
  async reviewLeave(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!id || !status) {
        return next(new BadRequestError('Leave ID and status are required'));
      }

      const updated = await hrService.reviewLeave(req.tenantId!, id, status, req.user?.id || 'system');
      
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: `Leave application status updated to ${status.toLowerCase()}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/hr/attendance/clock-in
  async clockIn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.body;
      if (!employeeId) {
        return next(new BadRequestError('Employee ID is required for checking in'));
      }
      const attendance = await hrService.clockIn(req.tenantId!, employeeId, req.user?.id);
      
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Clock-in attendance logged successfully',
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/hr/attendance/break
  async toggleBreak(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { employeeId, type } = req.body;
      if (!employeeId || !type || !['START', 'END'].includes(type)) {
        return next(new BadRequestError('Employee ID and break type (START/END) are required'));
      }
      const attendance = await hrService.toggleBreak(req.tenantId!, employeeId, type);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: `Break ${type.toLowerCase()} logged successfully`,
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/hr/attendance/clock-out
  async clockOut(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.body;
      if (!employeeId) {
        return next(new BadRequestError('Employee ID is required for checking out'));
      }
      const attendance = await hrService.clockOut(req.tenantId!, employeeId);
      
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Clock-out attendance logged successfully',
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new HrController();
export const hrController = new HrController();
