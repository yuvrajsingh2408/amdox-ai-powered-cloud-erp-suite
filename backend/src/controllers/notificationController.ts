import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/db';
import { sendResponse } from '../utils/response';
import notificationService from '../services/notificationService';
import { BadRequestError } from '../utils/errors';

export class NotificationController {
  // GET /api/notifications
  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const pageNum = page ? parseInt(page as string) : undefined;
      const limitNum = limit ? parseInt(limit as string) : undefined;
      const list = await notificationService.getNotifications(req.tenantId!, req.user?.id!, pageNum, limitNum);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Notifications fetched successfully',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/notifications/mark-read
  async markNotificationsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllRead(req.tenantId!, req.user?.id!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'All notifications marked as read',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/notifications/:id/read
  async markSingleRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await notificationService.markRead(req.tenantId!, req.user?.id!, id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Notification marked as read',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/notifications/:id
  async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await notificationService.deleteNotification(req.tenantId!, req.user?.id!, id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Notification deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/notifications/preferences
  async getPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const prefs = await notificationService.getPreferences(req.tenantId!, req.user?.id!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Notification preferences fetched',
        data: prefs,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/notifications/preferences
  async updatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const prefs = await notificationService.updatePreferences(req.tenantId!, req.user?.id!, req.body);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Notification preferences updated',
        data: prefs,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/notifications/announcements
  async getAnnouncements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await notificationService.getAnnouncements(req.tenantId!, req.user?.role);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Announcements fetched successfully',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/notifications/announcements
  async createAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { title, message, targetRole } = req.body;
      if (!title || !message) throw new BadRequestError('Title and message are required');

      const entry = await notificationService.createAnnouncement(
        req.tenantId!,
        title,
        message,
        req.user?.email || 'system',
        targetRole
      );

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Announcement broadcast created successfully',
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/notifications/announcements/:id
  async deleteAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await notificationService.deleteAnnouncement(req.tenantId!, id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Announcement deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/notifications/templates
  async getTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await notificationService.getTemplates(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Notification templates fetched',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/notifications/templates
  async saveTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, subject, content, channel, id } = req.body;
      if (!name || !subject || !content || !channel) {
        throw new BadRequestError('Missing required template fields');
      }

      const template = await notificationService.saveTemplate(req.tenantId!, {
        name,
        subject,
        content,
        channel,
        id
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Template saved successfully',
        data: template,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/notifications/templates/:id
  async deleteTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await notificationService.deleteTemplate(req.tenantId!, id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Template deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/notifications/trigger (Helper endpoint to test dispatching notifications)
  async triggerTestNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId, title, message, type, templateCode, templateVariables } = req.body;
      const targetUserId = userId || req.user?.id!;

      const result = await notificationService.dispatchNotification(
        req.tenantId!,
        targetUserId,
        title || 'System Test',
        message || 'This is a test notification message from Amdox Cloud ERP.',
        type || 'INFO',
        templateCode,
        templateVariables
      );

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Notification dispatched successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
export const notificationController = new NotificationController();
