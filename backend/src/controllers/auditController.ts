import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/db';
import { sendResponse } from '../utils/response';

export class AuditController {
  // GET /api/audit-logs
  async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { search, moduleName, actionType, page = '1', limit = '20' } = req.query;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 20;
      const skip = (pageNum - 1) * limitNum;

      // Build where clauses
      const whereClause: any = {
        deletedAt: null,
      };

      // Support multi-tenant boundary. ADMIN role can view all logs under tenant scope,
      // non-admins are restricted. Global logs are filtered by tenantId.
      if (req.user?.role === 'ADMIN' && !req.tenantId) {
        // Global system admin view
      } else {
        whereClause.tenantId = req.tenantId;
      }

      if (moduleName) {
        whereClause.module = moduleName as string;
      }

      if (actionType) {
        whereClause.action = actionType as string;
      }

      if (search) {
        whereClause.OR = [
          { details: { contains: search as string, mode: 'insensitive' } },
          { user: { email: { contains: search as string, mode: 'insensitive' } } },
        ];
      }

      // Query database
      const [logs, totalCount] = await prisma.$transaction([
        prisma.auditLog.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        }),
        prisma.auditLog.count({ where: whereClause }),
      ]);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Audit logs retrieved successfully',
        data: {
          logs,
          pagination: {
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limitNum),
            currentPage: pageNum,
            limit: limitNum,
          }
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuditController();
export const auditController = new AuditController();
