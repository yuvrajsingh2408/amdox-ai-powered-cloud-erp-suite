import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import financeService from '../services/financeService';
import prisma from '../config/db';
import { BadRequestError } from '../utils/errors';
import { sendResponse } from '../utils/response';

export class FinanceController {
  // GET /api/finance/accounts
  async getCOA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const coa = await prisma.account.findMany({
        where: { 
          tenantId: req.tenantId,
          deletedAt: null
        },
        orderBy: { code: 'asc' },
      });
      
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Chart of Accounts fetched successfully',
        data: coa,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/finance/accounts
  async createAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { code, name, type, balance } = req.body;
      if (!code || !name || !type) {
        return next(new BadRequestError('Code, name, and type are required'));
      }

      const dup = await prisma.account.findFirst({
        where: { code, tenantId: req.tenantId!, deletedAt: null }
      });
      if (dup) {
        return next(new BadRequestError('GL account code already exists'));
      }

      const account = await prisma.account.create({
        data: {
          code,
          name,
          type,
          balance: parseFloat(balance || 0),
          tenantId: req.tenantId!
        }
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'GL Account created successfully in Chart of Accounts',
        data: account
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/finance/journal
  async postJournalEntry(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { description, lines } = req.body;
      if (!description || !lines || !Array.isArray(lines)) {
        return next(new BadRequestError('Missing properties: description, and lines array'));
      }

      const transaction = await financeService.postJournalEntry(req.tenantId!, { description, lines }, req.user?.id);
      
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Journal entry posted successfully',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/finance/reports/profit-loss
  async getProfitAndLoss(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const report = await financeService.getProfitAndLoss(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Profit & Loss statement compiled successfully',
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/finance/reports/balance-sheet
  async getBalanceSheet(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const report = await financeService.getBalanceSheet(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Balance Sheet statement compiled successfully',
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/finance/reports/trial-balance
  async getTrialBalance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const report = await financeService.getTrialBalance(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Trial Balance compiled successfully',
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/finance/periods/lock
  async lockPeriod(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, startDate, endDate } = req.body;
      if (!name || !startDate || !endDate) {
        return next(new BadRequestError('Name, startDate, and endDate are required'));
      }

      // Check if Fiscal Year exists
      let fy = await prisma.fiscalYear.findFirst({
        where: { tenantId: req.tenantId!, deletedAt: null }
      });
      if (!fy) {
        fy = await prisma.fiscalYear.create({
          data: {
            name: 'FY26',
            startDate: new Date('2026-01-01'),
            endDate: new Date('2026-12-31'),
            tenantId: req.tenantId!
          }
        });
      }

      const period = await prisma.financialPeriod.create({
        data: {
          fiscalYearId: fy.id,
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isLocked: true,
          tenantId: req.tenantId!
        }
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: `Financial period ${name} locked successfully`,
        data: period
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new FinanceController();
export const financeController = new FinanceController();
