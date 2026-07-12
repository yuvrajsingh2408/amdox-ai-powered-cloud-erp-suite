import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import payrollService from '../services/payrollService';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { sendResponse } from '../utils/response';
import prisma from '../config/db';

export class PayrollController {
  // POST /api/payroll/process
  async processPayroll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.body;
      if (!month || !year) {
        return next(new BadRequestError('Month and year values are required'));
      }

      const run = await payrollService.processPayroll(
        req.tenantId!,
        parseInt(month),
        parseInt(year),
        req.user?.id
      );

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Payroll processed successfully',
        data: run,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/payroll/approve
  async approvePayroll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { runId } = req.body;
      if (!runId) {
        return next(new BadRequestError('Payroll Run ID is required for approvals'));
      }

      const run = await payrollService.approvePayroll(
        req.tenantId!,
        runId,
        req.user?.id
      );

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Payroll approved and finalized successfully',
        data: run,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/payroll/history
  async getPayrollHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await payrollService.getPayrollHistory(req.tenantId!);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Payroll history fetched successfully',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/payroll/payslips
  async getPayslips(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;
      if (!month || !year) {
        return next(new BadRequestError('Query params month and year are required'));
      }

      const slips = await payrollService.getPayslips(
        req.tenantId!,
        parseInt(month as string),
        parseInt(year as string)
      );

      // Format for UI display
      const formatted = slips.map(s => ({
        id: s.id,
        employeeName: `${s.employee.firstName} ${s.employee.lastName}`,
        employeeCode: s.employee.employeeCode,
        basicSalary: s.basicSalary,
        allowances: s.allowances,
        deductions: s.deductions,
        netSalary: s.netSalary,
        status: s.status,
        paymentDate: s.paymentDate ? s.paymentDate.toISOString().split('T')[0] : 'Pending'
      }));

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Payslips fetched successfully',
        data: formatted,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/payroll/payslips/:id
  async getPayslipById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const slip = await prisma.payslip.findFirst({
        where: { id, tenantId: req.tenantId!, deletedAt: null },
        include: {
          employee: {
            include: {
              department: true,
              user: true
            }
          },
          payrollRun: true
        }
      });

      if (!slip) {
        return next(new NotFoundError('Payslip not found'));
      }

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Payslip details retrieved successfully',
        data: slip,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PayrollController();
export const payrollController = new PayrollController();
