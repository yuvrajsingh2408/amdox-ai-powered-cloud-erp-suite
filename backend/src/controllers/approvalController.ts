import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/db';
import approvalEngine from '../services/approvalEngine';
import { sendResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export class ApprovalController {
  // GET /api/approvals/inbox
  async getInboxApprovals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const userId = req.user!.id;
      // Get user's primary role
      const userRoleRelation = await prisma.userRole.findFirst({
        where: { userId, deletedAt: null },
        include: { role: true },
      });
      const userRole = userRoleRelation?.role?.name || 'EMPLOYEE';

      const list = await prisma.workflowApproval.findMany({
        where: {
          tenantId,
          status: 'PENDING',
          OR: [
            { approverUserId: userId },
            { approverRole: userRole },
          ],
        },
        include: {
          instance: {
            include: { workflow: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Inbox approval items fetched successfully',
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/approvals/:id/decision
  async submitDecision(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { action, comments } = req.body;

      if (!action || !['APPROVED', 'REJECTED', 'ESCALATED'].includes(action)) {
        return next(new BadRequestError('Action must be APPROVED, REJECTED, or ESCALATED'));
      }

      const result = await approvalEngine.submitDecision(req.tenantId!, id, req.user!.id, {
        action,
        comments,
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: `Decision logged successfully: ${action}`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/approvals/escalate-overdue
  async triggerEscalations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const logs = await approvalEngine.scanEscalations(req.tenantId!);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: `Background SLA scanner run completed. ${logs.length} items escalated.`,
        data: logs,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/approvals/:id/ai-recommendation
  async getAIRecommendation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const rec = await approvalEngine.getAIRecommendation(id);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'AI decision prediction ready',
        data: rec,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/approval-history
  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      
      const list = await prisma.approvalHistory.findMany({
        where: {
          approval: {
            tenantId,
          },
        },
        include: {
          actor: true,
          approval: {
            include: {
              instance: {
                include: { workflow: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Decision history records fetched',
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new ApprovalController();
export const approvalController = new ApprovalController();
