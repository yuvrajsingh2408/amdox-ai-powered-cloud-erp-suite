import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import analyticsService from '../services/analyticsService';
import { sendResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export class AnalyticsController {
  // GET /api/analytics/kpis
  async getKPIs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.compileKPIs(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Analytical KPIs compiled successfully',
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/analytics/widgets
  async getDashboardWidgets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getWidgetsAndLayouts(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Dashboard layout details retrieved',
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/analytics/layout
  async saveLayout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, layoutJson } = req.body;

      if (!name || !layoutJson) {
        return next(new BadRequestError('Name and layoutJson are required parameters'));
      }

      const layout = await analyticsService.saveWidgetLayout(req.tenantId!, req.user!.id, {
        name,
        layoutJson: typeof layoutJson === 'string' ? layoutJson : JSON.stringify(layoutJson),
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Dashboard custom coordinate layout saved',
        data: layout,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/analytics/ai-report
  async generateAIReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { module } = req.query;

      if (!module) {
        return next(new BadRequestError('The module parameter is required for AI Report generation'));
      }

      const report = await analyticsService.generateAIAutoReport(req.tenantId!, module as string);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'AI Automated snapshot compiled successfully',
        data: report,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new AnalyticsController();
export const analyticsController = new AnalyticsController();
