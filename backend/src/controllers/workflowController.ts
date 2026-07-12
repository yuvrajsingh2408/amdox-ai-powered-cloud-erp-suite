import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import workflowService from '../services/workflowService';
import { sendResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export class WorkflowController {
  // GET /api/workflows
  async getWorkflows(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { search } = req.query;
      const list = await workflowService.getWorkflows(req.tenantId!, search as string);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Workflows retrieved successfully',
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/workflows
  async createWorkflow(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, description, triggerType, steps } = req.body;
      if (!name || !triggerType || !steps) {
        return next(new BadRequestError('Name, triggerType, and steps are required parameters'));
      }

      const wf = await workflowService.createWorkflow(req.tenantId!, req.user!.id, {
        name,
        description,
        triggerType,
        steps,
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Workflow configuration saved successfully',
        data: wf,
      });
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/workflows/:id
  async updateWorkflow(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description, steps } = req.body;

      if (!name || !steps) {
        return next(new BadRequestError('Name and steps are required fields'));
      }

      const updated = await workflowService.updateWorkflow(req.tenantId!, id, req.user!.id, {
        name,
        description,
        steps,
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Workflow design updated and version incremented',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/workflows/:id/toggle
  async toggleActive(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const wf = await workflowService.toggleWorkflowActive(req.tenantId!, id);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: `Workflow state updated to: ${wf.isActive ? 'Active' : 'Inactive'}`,
        data: wf,
      });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/workflows/:id
  async deleteWorkflow(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await workflowService.deleteWorkflow(req.tenantId!, id);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Workflow configuration deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/workflows/:id/duplicate
  async cloneWorkflow(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const duplicated = await workflowService.duplicateWorkflow(req.tenantId!, id, req.user!.id);

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Workflow cloned successfully',
        data: duplicated,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/workflow-templates
  async getTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const templates = await workflowService.getWorkflowTemplates(req.tenantId!);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Workflow templates active',
        data: templates,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/workflows/instances
  async getInstances(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const list = await workflowService.getWorkflowInstances(req.tenantId!, status as string);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Active executions traced successfully',
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new WorkflowController();
export const workflowController = new WorkflowController();
