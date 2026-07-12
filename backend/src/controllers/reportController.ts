import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import reportService from '../services/reportService';
import { sendResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export class ReportController {
  // GET /api/reports
  async getSavedReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const pageNum = page ? parseInt(page as string) : undefined;
      const limitNum = limit ? parseInt(limit as string) : undefined;
      const data = await reportService.getSavedReports(req.tenantId!, pageNum, limitNum);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Saved reports and templates retrieved successfully',
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/reports/preview
  async runReportPreview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { module, startDate, endDate, departmentId, projectId, vendorId, customerId, status } = req.query;

      if (!module) {
        return next(new BadRequestError('The module parameter is required for report previews'));
      }

      const rows = await reportService.runReportData(req.tenantId!, module as string, {
        startDate: startDate as string,
        endDate: endDate as string,
        departmentId: departmentId as string,
        projectId: projectId as string,
        vendorId: vendorId as string,
        customerId: customerId as string,
        status: status as string,
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Report data compiled successfully',
        data: rows,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/reports
  async saveReportConfig(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { title, module, filters, chartType, fileType, description } = req.body;

      if (!title || !module || !filters) {
        return next(new BadRequestError('Title, module, and filters parameters are required'));
      }

      const report = await reportService.saveCustomReport(req.tenantId!, req.user!.id, {
        title,
        module,
        filters: typeof filters === 'string' ? filters : JSON.stringify(filters),
        chartType,
        fileType,
        description,
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Custom report design saved successfully',
        data: report,
      });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/reports/:id/favorite
  async toggleFavorite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const report = await reportService.toggleFavoriteReport(req.tenantId!, id);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: `Saved report favorite toggled to: ${report.isFavorite}`,
        data: report,
      });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/reports/:id
  async deleteReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await reportService.deleteSavedReport(req.tenantId!, id);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Saved report deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/reports/history
  async getExportHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await reportService.getExportHistory(req.tenantId!);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Export file history retrieved successfully',
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/reports/export
  async triggerExport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reportId, title, module, filters, fileType } = req.body;

      if (!title || !module || !filters || !fileType) {
        return next(new BadRequestError('Title, module, filters, and fileType parameters are required'));
      }

      const fileDetails = await reportService.generateExport(req.tenantId!, req.user!.id, {
        reportId,
        title,
        module,
        filters: typeof filters === 'string' ? filters : JSON.stringify(filters),
        fileType,
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Report compilation completed and file exported successfully',
        data: fileDetails,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/reports/scheduled
  async getScheduled(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await reportService.getScheduledReports(req.tenantId!);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Scheduled reports dashboard active',
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/reports/scheduled
  async createSchedule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reportId, schedule, recipients, format } = req.body;

      if (!reportId || !schedule || !recipients) {
        return next(new BadRequestError('ReportId, schedule, and recipients are required fields'));
      }

      const record = await reportService.createScheduledReport(req.tenantId!, req.user!.id, {
        reportId,
        schedule,
        recipients,
        format: format || 'PDF',
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Report distribution scheduled successfully',
        data: record,
      });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/reports/scheduled/:id/toggle
  async toggleSchedule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const sched = await reportService.toggleScheduledStatus(req.tenantId!, id);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: `Scheduled report status toggled to: ${sched.status}`,
        data: sched,
      });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/reports/scheduled/:id
  async deleteSchedule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await reportService.deleteScheduledReport(req.tenantId!, id);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Scheduled report deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/reports/download/:fileName
  async downloadReportFile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { fileName } = req.params;

      // Mock binary file transmission
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'text/csv');
      return res.status(200).send(`"ID","Timestamp","ActivityLog"\n"1","2026-07-11 00:00:00","Mock Report data download for filename: ${fileName}"`);
    } catch (err) {
      next(err);
    }
  }
}

export default new ReportController();
export const reportController = new ReportController();
