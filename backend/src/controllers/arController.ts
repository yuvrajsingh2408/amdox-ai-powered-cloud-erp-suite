import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { sendResponse } from '../utils/response';

export class ArController {
  // GET /api/ar/customers
  async getCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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

      const list = await prisma.customer.findMany(options);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Customers retrieved successfully',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/ar/customers
  async createCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, code, email, phone, address } = req.body;
      if (!name || !code || !email) {
        return next(new BadRequestError('Name, unique code, and email are required'));
      }

      const dup = await prisma.customer.findFirst({
        where: { OR: [{ code }, { email }], tenantId: req.tenantId!, deletedAt: null }
      });
      if (dup) {
        return next(new BadRequestError('Customer code or email already exists'));
      }

      const customer = await prisma.customer.create({
        data: { name, code, email, phone, address, tenantId: req.tenantId! }
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Customer profile registered successfully',
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/ar/invoices
  async getInvoices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await prisma.invoice.findMany({
        where: { type: 'AR', tenantId: req.tenantId!, deletedAt: null },
        include: { customer: true },
        orderBy: { createdAt: 'desc' }
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Sales Invoices fetched successfully',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/ar/invoices
  async createInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { invoiceNumber, customerId, amount, tax, dueDate } = req.body;
      if (!invoiceNumber || !customerId || !amount || !dueDate) {
        return next(new BadRequestError('InvoiceNumber, customerId, amount, and dueDate are required'));
      }

      const existing = await prisma.invoice.findFirst({
        where: { invoiceNumber, tenantId: req.tenantId!, deletedAt: null }
      });
      if (existing) {
        return next(new BadRequestError('Invoice number already exists'));
      }

      const taxAmount = parseFloat(tax || 0);

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          type: 'AR',
          customerId,
          amount: parseFloat(amount),
          tax: taxAmount,
          dueDate: new Date(dueDate),
          issuedDate: new Date(),
          status: 'SENT',
          tenantId: req.tenantId!
        }
      });

      // Audit log entry
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          tenantId: req.tenantId!,
          action: 'CREATE_SALES_INVOICE',
          module: 'AR',
          details: `Logged AR Sales Invoice: ${invoiceNumber} - Amount: $${amount}`,
        }
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Sales invoice created and sent successfully',
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/ar/invoices/:id/pay
  async collectPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { amount, paymentMethod, reference } = req.body;

      if (!amount || !paymentMethod) {
        return next(new BadRequestError('Amount and paymentMethod are required'));
      }

      const invoice = await prisma.invoice.findFirst({
        where: { id, type: 'AR', tenantId: req.tenantId!, deletedAt: null }
      });

      if (!invoice) {
        return next(new NotFoundError('Sales invoice not found'));
      }

      if (invoice.status === 'PAID') {
        return next(new BadRequestError('Invoice is already fully settled'));
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

      // Account Balance increments (Asset cash increases, Revenue increases)
      const cashAccount = await prisma.account.findFirst({
        where: { code: '1010', tenantId: req.tenantId!, deletedAt: null }
      });
      const arAccount = await prisma.account.findFirst({
        where: { code: '1200', tenantId: req.tenantId!, deletedAt: null } // standard AR code
      });

      if (cashAccount && arAccount) {
        await prisma.account.update({
          where: { id: cashAccount.id },
          data: { balance: { increment: parseFloat(amount) } }
        });
        await prisma.account.update({
          where: { id: arAccount.id },
          data: { balance: { decrement: parseFloat(amount) } } // Asset receivable decreases
        });
      }

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Customer payment receipt logged successfully',
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/ar/reports/aging
  async getArAgingReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const invoices = await prisma.invoice.findMany({
        where: { type: 'AR', status: { not: 'PAID' }, tenantId: req.tenantId!, deletedAt: null },
        include: { customer: true }
      });

      const today = new Date();
      const report = {
        current: 0,
        thirtyToSixty: 0,
        sixtyToNinety: 0,
        overNinety: 0,
        totalOutstanding: 0,
        invoices: [] as any[]
      };

      invoices.forEach(inv => {
        const diffTime = Math.abs(today.getTime() - inv.dueDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const isOverdue = today.getTime() > inv.dueDate.getTime();

        let bucket = 'current';
        if (isOverdue) {
          if (diffDays <= 30) {
            bucket = 'current';
            report.current += inv.amount;
          } else if (diffDays <= 60) {
            bucket = '30-60 days';
            report.thirtyToSixty += inv.amount;
          } else if (diffDays <= 90) {
            bucket = '60-90 days';
            report.sixtyToNinety += inv.amount;
          } else {
            bucket = '90+ days';
            report.overNinety += inv.amount;
          }
        } else {
          report.current += inv.amount;
        }

        report.totalOutstanding += inv.amount;
        report.invoices.push({
          invoiceNumber: inv.invoiceNumber,
          customerName: inv.customer?.name,
          amount: inv.amount,
          dueDate: inv.dueDate.toISOString().split('T')[0],
          daysOverdue: isOverdue ? diffDays : 0,
          bucket
        });
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Accounts Receivable Aging report compiled successfully',
        data: report
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ArController();
export const arController = new ArController();
