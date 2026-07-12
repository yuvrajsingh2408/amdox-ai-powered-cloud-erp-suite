import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import biService from '../services/biService';
import { sendResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export class BiController {
  // GET /api/bi/metrics
  async getMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await biService.getMetrics(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Analytical KPI stats compiled successfully',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/bi/dashboards
  async getDashboards(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await biService.getBIDashboards(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Custom BI dashboard layouts fetched successfully',
        data: list
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/bi/dashboards
  async saveDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, layoutJson, id } = req.body;
      if (!name || !layoutJson) {
        return next(new BadRequestError('Name and layoutJson are required properties'));
      }

      const saved = await biService.saveBIDashboard(req.tenantId!, { name, layoutJson, id });
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'BI layout configured successfully',
        data: saved
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BiController();
export const biController = new BiController();
