import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import crmService from '../services/crmService';
import { sendResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export class CrmController {
  // GET /api/crm/leads
  async getLeads(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await crmService.getLeads(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Leads lists compiled successfully',
        data: list
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/crm/leads
  async createLead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, company, email } = req.body;
      if (!name || !company || !email) {
        return next(new BadRequestError('Name, company, and email are required parameters'));
      }

      const lead = await crmService.createLead(req.tenantId!, req.body);
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Lead registered successfully',
        data: lead
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/crm/leads/:id/predict
  async predictLeadConversion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const prediction = await crmService.predictLeadConversion(req.params.id, req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Lead conversion prediction completed',
        data: prediction
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/crm/clients
  async getClients(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await crmService.getClients(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Customers directory listed successfully',
        data: list
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/crm/clients
  async createClient(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, company, email } = req.body;
      if (!name || !company || !email) {
        return next(new BadRequestError('Name, company, and email are required parameters'));
      }

      const client = await crmService.createClient(req.tenantId!, req.body);
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Client registered successfully',
        data: client
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/crm/deals
  async getDeals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await crmService.getDeals(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Deals pipeline fetched successfully',
        data: list
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/crm/deals
  async createDeal(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, amount, clientId } = req.body;
      if (!name || !amount || !clientId) {
        return next(new BadRequestError('Name, amount, and clientId are required parameters'));
      }

      const deal = await crmService.createDeal(req.tenantId!, req.body);
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Deal logged successfully',
        data: deal
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/crm/meetings
  async getMeetings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await crmService.getMeetings(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'CRM meetings listed successfully',
        data: list
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/crm/meetings
  async createMeeting(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { title, date } = req.body;
      if (!title || !date) {
        return next(new BadRequestError('Title and date are required parameters'));
      }

      const meeting = await crmService.createMeeting(req.tenantId!, req.body);
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Meeting scheduled successfully',
        data: meeting
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/crm/dashboard
  async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await crmService.getCrmDashboard(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'CRM dashboard analytics compiled successfully',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CrmController();
export const crmController = new CrmController();
