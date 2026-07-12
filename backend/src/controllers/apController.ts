import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { sendResponse } from '../utils/response';

export class ApController {
  // GET /api/ap/vendors
  async getVendors(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const options: any = {
        where: { tenantId: req.tenantId!, deletedAt: null },
        orderBy: { code: 'asc' }
      };

      if (page || limit) {
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 50;
        options.skip = (pageNum - 1) * limitNum;
        options.take = limitNum;
      } else {
        options.take = 1000;
      }

      const list = await prisma.vendor.findMany(options);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Vendors list retrieved successfully',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/ap/vendors
  async createVendor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, code, email, phone, address } = req.body;
      if (!name || !code || !email) {
        return next(new BadRequestError('Name, unique code, and email are required'));
      }

      const dup = await prisma.vendor.findFirst({
        where: { OR: [{ code }, { email }], tenantId: req.tenantId!, deletedAt: null }
      });
      if (dup) {
        return next(new BadRequestError('Vendor code or email already exists'));
      }

      const vendor = await prisma.vendor.create({
        data: { name, code, email, phone, address, tenantId: req.tenantId! }
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Vendor created successfully',
        data: vendor
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/ap/bills
  async getBills(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await prisma.invoice.findMany({
        where: { type: 'AP', tenantId: req.tenantId!, deletedAt: null },
        include: { vendor: true },
        orderBy: { createdAt: 'desc' }
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'AP Bills fetched successfully',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/ap/bills (3-Way Matching Invoice)
  async createBill(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { invoiceNumber, vendorId, amount, purchaseOrderId, dueDate } = req.body;
      if (!invoiceNumber || !vendorId || !amount || !dueDate) {
        return next(new BadRequestError('InvoiceNumber, vendorId, amount, and dueDate are required'));
      }

      // 3-Way Match Verification logic
      let matchStatus = 'PENDING_MATCH';
      if (purchaseOrderId) {
        const po = await prisma.purchaseOrder.findFirst({
          where: { id: purchaseOrderId, tenantId: req.tenantId!, deletedAt: null },
          include: { goodsReceipt: true }
        });

        if (!po) {
          return next(new NotFoundError('Purchase Order reference not found'));
        }

        const receipts = po.goodsReceipt || [];
        const poAmountMatch = Math.abs(po.totalAmount - parseFloat(amount)) < 0.01;
        const hasReceipts = receipts.length > 0;

        if (poAmountMatch && hasReceipts) {
          matchStatus = 'MATCHED'; // 3-way match verified
        } else {
          matchStatus = 'MISMATCHED'; // Amount discrepancy or missing Goods Receipt
        }
      }

      const bill = await prisma.invoice.create({
        data: {
          invoiceNumber,
          type: 'AP',
          vendorId,
          amount: parseFloat(amount),
          dueDate: new Date(dueDate),
          issuedDate: new Date(),
          status: matchStatus === 'MATCHED' ? 'APPROVED' : 'DRAFT', // Mismatched bills remain in DRAFT for approval review
          tenantId: req.tenantId!
        }
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          tenantId: req.tenantId!,
          action: 'CREATE_BILL',
          module: 'AP',
          details: `Logged AP Bill: ${invoiceNumber} - Match status: ${matchStatus} - Amount: $${amount}`,
        }
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: matchStatus === 'MATCHED' 
          ? 'Bill logged and automatically approved via 3-way match verification'
          : 'Bill logged in draft status. Requires approval review due to 3-way mismatch.',
        data: { bill, matchStatus }
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/ap/bills/:id/pay
  async payBill(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { amount, paymentMethod, reference } = req.body;

      if (!amount || !paymentMethod) {
        return next(new BadRequestError('Amount and paymentMethod are required'));
      }

      const bill = await prisma.invoice.findFirst({
        where: { id, type: 'AP', tenantId: req.tenantId!, deletedAt: null }
      });

      if (!bill) {
        return next(new NotFoundError('Bill not found'));
      }

      if (bill.status === 'PAID') {
        return next(new BadRequestError('This bill is already fully settled'));
      }

      // Log payment
      const payment = await prisma.payment.create({
        data: {
          invoiceId: id,
          amount: parseFloat(amount),
          paymentDate: new Date(),
          paymentMethod,
          reference: reference || null,
          tenantId: req.tenantId!
        }
      });

      // Update Invoice Status
      await prisma.invoice.update({
        where: { id },
        data: { status: 'PAID' }
      });

      // Account Balance reduction (Asset cash decreases, Liability decreases)
      const cashAccount = await prisma.account.findFirst({
        where: { code: '1010', tenantId: req.tenantId!, deletedAt: null }
      });
      const apAccount = await prisma.account.findFirst({
        where: { code: '2010', tenantId: req.tenantId!, deletedAt: null } // standard AP code
      });

      if (cashAccount && apAccount) {
        await prisma.account.update({
          where: { id: cashAccount.id },
          data: { balance: { decrement: parseFloat(amount) } }
        });
        await prisma.account.update({
          where: { id: apAccount.id },
          data: { balance: { decrement: parseFloat(amount) } }
        });
      }

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Bill payment logged successfully',
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/ap/reports/aging
  async getApAgingReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const bills = await prisma.invoice.findMany({
        where: { type: 'AP', status: { not: 'PAID' }, tenantId: req.tenantId!, deletedAt: null },
        include: { vendor: true }
      });

      const today = new Date();
      const report = {
        current: 0,
        thirtyToSixty: 0,
        sixtyToNinety: 0,
        overNinety: 0,
        totalOutstanding: 0,
        bills: [] as any[]
      };

      bills.forEach(b => {
        const diffTime = Math.abs(today.getTime() - b.dueDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const isOverdue = today.getTime() > b.dueDate.getTime();

        let bucket = 'current';
        if (isOverdue) {
          if (diffDays <= 30) {
            bucket = 'current';
            report.current += b.amount;
          } else if (diffDays <= 60) {
            bucket = '30-60 days';
            report.thirtyToSixty += b.amount;
          } else if (diffDays <= 90) {
            bucket = '60-90 days';
            report.sixtyToNinety += b.amount;
          } else {
            bucket = '90+ days';
            report.overNinety += b.amount;
          }
        } else {
          report.current += b.amount;
        }

        report.totalOutstanding += b.amount;
        report.bills.push({
          invoiceNumber: b.invoiceNumber,
          vendorName: b.vendor?.name,
          amount: b.amount,
          dueDate: b.dueDate.toISOString().split('T')[0],
          daysOverdue: isOverdue ? diffDays : 0,
          bucket
        });
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'AP Aging report compiled successfully',
        data: report
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ApController();
export const apController = new ApController();
