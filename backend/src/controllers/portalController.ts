import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response';
import customerPortalService from '../services/customerPortalService';
import vendorPortalService from '../services/vendorPortalService';
import ticketService from '../services/ticketService';
import knowledgeBaseService from '../services/knowledgeBaseService';
import prisma from '../config/db';
import { BadRequestError } from '../utils/errors';

export class PortalController {
  // ----------------------------------------------------
  // 1. Authentication Handlers
  // ----------------------------------------------------
  async registerCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, email, password, firstName, lastName, customerId } = req.body;
      if (!tenantId || !email || !password) {
        return next(new BadRequestError('TenantId, email, and password are required'));
      }
      const user = await customerPortalService.registerUser(tenantId, {
        email,
        passwordHash: password,
        firstName,
        lastName,
        customerId,
      });
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Customer portal user created successfully',
        data: { id: user.id, email: user.email },
      });
    } catch (err) {
      next(err);
    }
  }

  async loginCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new BadRequestError('Email and password are required'));
      }
      const result = await customerPortalService.authenticate({ email, passwordPlain: password });
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Customer session authenticated',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async registerVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, email, password, firstName, lastName, vendorId } = req.body;
      if (!tenantId || !email || !password) {
        return next(new BadRequestError('TenantId, email, and password are required'));
      }
      const user = await vendorPortalService.registerUser(tenantId, {
        email,
        passwordHash: password,
        firstName,
        lastName,
        vendorId,
      });
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Vendor portal user created successfully',
        data: { id: user.id, email: user.email },
      });
    } catch (err) {
      next(err);
    }
  }

  async loginVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new BadRequestError('Email and password are required'));
      }
      const result = await vendorPortalService.authenticate({ email, passwordPlain: password });
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Vendor session authenticated',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // ----------------------------------------------------
  // 2. Customer Portal Dashboard & Orders
  // ----------------------------------------------------
  async getCustomerDashboard(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const customerId = req.query.customerId as string;
      if (!customerId) return next(new BadRequestError('CustomerId parameter required'));

      const metrics = await customerPortalService.getDashboardMetrics(tenantId, customerId);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Customer metrics compiled successfully',
        data: metrics,
      });
    } catch (err) {
      next(err);
    }
  }

  async getCustomerOrders(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const customerId = req.query.customerId as string;
      if (!customerId) return next(new BadRequestError('CustomerId parameter required'));

      const list = await customerPortalService.getOrders(tenantId, customerId);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Customer sales orders fetched',
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  async getCustomerPayments(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const customerId = req.query.customerId as string;
      if (!customerId) return next(new BadRequestError('CustomerId required'));

      const list = await customerPortalService.getPayments(tenantId, customerId);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Payments list fetched',
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  async getCustomerSpending(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const customerId = req.query.customerId as string;
      if (!customerId) return next(new BadRequestError('CustomerId parameter required'));

      const analysis = await customerPortalService.getSpendingAnalysis(tenantId, customerId);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'AI spending metrics overlay ready',
        data: analysis,
      });
    } catch (err) {
      next(err);
    }
  }

  // ----------------------------------------------------
  // 3. Vendor Portal Features
  // ----------------------------------------------------
  async getVendorDashboard(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const vendorId = req.query.vendorId as string;
      if (!vendorId) return next(new BadRequestError('VendorId parameter required'));

      const metrics = await vendorPortalService.getDashboardMetrics(tenantId, vendorId);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Vendor metrics compiled successfully',
        data: metrics,
      });
    } catch (err) {
      next(err);
    }
  }

  async getVendorQuotations(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const vendorId = req.query.vendorId as string;
      if (!vendorId) return next(new BadRequestError('VendorId required'));

      const list = await vendorPortalService.getQuotations(tenantId, vendorId);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Vendor quotations list retrieved',
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  async createVendorQuotation(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const { vendorId, amount } = req.body;
      if (!vendorId || !amount) return next(new BadRequestError('VendorId and amount required'));

      const quotation = await vendorPortalService.createQuotation(tenantId, vendorId, parseFloat(amount));
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Quotation submitted to ERP procurement board',
        data: quotation,
      });
    } catch (err) {
      next(err);
    }
  }

  async getVendorInvoices(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const vendorId = req.query.vendorId as string;
      if (!vendorId) return next(new BadRequestError('VendorId required'));

      const list = await vendorPortalService.getInvoices(tenantId, vendorId);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Vendor invoices list retrieved',
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  async createVendorInvoice(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const { vendorId, amount } = req.body;
      if (!vendorId || !amount) return next(new BadRequestError('VendorId and amount required'));

      const invoice = await vendorPortalService.createInvoice(tenantId, vendorId, parseFloat(amount));
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Invoice logged under pending validations',
        data: invoice,
      });
    } catch (err) {
      next(err);
    }
  }

  async getVendorShipments(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const vendorId = req.query.vendorId as string;
      if (!vendorId) return next(new BadRequestError('VendorId required'));

      const list = await vendorPortalService.getShipments(tenantId, vendorId);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Transit shipments list fetched',
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  async getVendorPerformance(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const vendorId = req.query.vendorId as string;
      if (!vendorId) return next(new BadRequestError('VendorId required'));

      const performance = await vendorPortalService.getPerformance(tenantId, vendorId);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Vendor performance KPI score compiled',
        data: performance,
      });
    } catch (err) {
      next(err);
    }
  }

  // ----------------------------------------------------
  // 4. Ticketing Support Center
  // ----------------------------------------------------
  async getTickets(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const { portalType, portalUserId } = req.query;
      if (!portalType || !portalUserId) {
        return next(new BadRequestError('PortalType and PortalUserId parameters are required'));
      }
      const list = await ticketService.getTickets(tenantId, portalType as string, portalUserId as string);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Support tickets list ready',
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  async getTicket(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const { id } = req.params;
      const details = await ticketService.getTicketDetails(tenantId, id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Ticket details and reply log fetched',
        data: details,
      });
    } catch (err) {
      next(err);
    }
  }

  async createTicket(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const { portalType, portalUserId, category, priority, subject, description } = req.body;

      const ticket = await ticketService.createTicket(tenantId, portalType, portalUserId, {
        category,
        priority,
        subject,
        description,
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Technical support ticket generated successfully',
        data: ticket,
      });
    } catch (err) {
      next(err);
    }
  }

  async submitReply(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const { id } = req.params;
      const { senderType, senderId, senderName, message } = req.body;

      if (!message) return next(new BadRequestError('Reply message body cannot be blank'));

      const reply = await ticketService.addReply(tenantId, id, {
        senderType,
        senderId,
        senderName,
      }, message);

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Reply logged on timeline',
        data: reply,
      });
    } catch (err) {
      next(err);
    }
  }

  async closeTicket(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const { id } = req.params;
      const { rating } = req.body;

      const updated = await ticketService.closeTicket(tenantId, id, rating);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Ticket marked resolved and closed',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  async getAISuggestedReply(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const sugg = await ticketService.getAISuggestedReply(id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'AI decision copilot reply generated',
        data: sugg,
      });
    } catch (err) {
      next(err);
    }
  }

  // ----------------------------------------------------
  // 5. Knowledge Base articles
  // ----------------------------------------------------
  async getKnowledgeArticles(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const { category, search } = req.query;
      const list = await knowledgeBaseService.getArticles(tenantId, category as string, search as string);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'FAQs articles retrieved successfully',
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  async getKnowledgeArticle(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const { id } = req.params;
      const article = await knowledgeBaseService.getArticleDetails(tenantId, id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Manual content retrieved',
        data: article,
      });
    } catch (err) {
      next(err);
    }
  }

  // Announcements & notifications seeding
  async getAnnouncements(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const { portal } = req.query;

      // Seed if none
      const count = await prisma.portalAnnouncement.count({ where: { tenantId } });
      if (count === 0) {
        await prisma.portalAnnouncement.create({
          data: { tenantId, targetPortal: 'BOTH', title: 'Portal Maintenance Notice', content: 'Scheduled backup update on July 15th from 2:00 AM to 4:00 AM UTC.' },
        });
      }

      const list = await prisma.portalAnnouncement.findMany({
        where: {
          tenantId,
          targetPortal: { in: [portal as string || 'BOTH', 'BOTH'] },
          deletedAt: null,
        },
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Announcements retrieved successfully',
        data: list,
      });
    } catch (e) {
      next(e);
    }
  }
}

export default new PortalController();
export const portalController = new PortalController();
