import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import projectService from '../services/projectService';
import { sendResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export class ProjectController {
  // GET /api/projects
  async getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await projectService.getProjects(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Projects listed successfully',
        data: list
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/projects/:id
  async getProjectDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const details = await projectService.getProjectDetails(req.params.id, req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Project details retrieved successfully',
        data: details
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/projects
  async createProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, startDate } = req.body;
      if (!name || !startDate) {
        return next(new BadRequestError('Name and startDate are required parameters'));
      }

      const created = await projectService.createProject(req.tenantId!, req.body);
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Project configured successfully',
        data: created
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/projects/tasks/:id
  async getTaskDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await projectService.getTaskDetails(req.params.id, req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Task details retrieved successfully',
        data: task
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/projects/tasks
  async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId, name } = req.body;
      if (!projectId || !name) {
        return next(new BadRequestError('projectId and name are required parameters'));
      }

      const task = await projectService.createTask(req.tenantId!, {
        ...req.body,
        performedById: req.user!.id
      });
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Project task added successfully',
        data: task
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/projects/tasks/:id/status
  async updateTaskStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      if (!status) {
        return next(new BadRequestError('Status parameter is required'));
      }

      const updated = await projectService.updateTaskStatus(req.params.id, req.tenantId!, status, req.user!.id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Task status updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/projects/tasks/:id/comments
  async addTaskComment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { comment } = req.body;
      if (!comment) {
        return next(new BadRequestError('Comment parameter is required'));
      }

      const saved = await projectService.addTaskComment(req.tenantId!, req.params.id, req.user!.id, comment);
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Comment posted successfully',
        data: saved
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/projects/sprints
  async createSprint(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId, name, startDate, endDate } = req.body;
      if (!projectId || !name || !startDate || !endDate) {
        return next(new BadRequestError('Missing sprint properties'));
      }

      const sprint = await projectService.createSprint(req.tenantId!, req.body);
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Sprint logged successfully',
        data: sprint
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/projects/milestones
  async createMilestone(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId, name, dueDate } = req.body;
      if (!projectId || !name || !dueDate) {
        return next(new BadRequestError('Missing milestone properties'));
      }

      const milestone = await projectService.createMilestone(req.tenantId!, req.body);
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Milestone created successfully',
        data: milestone
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProjectController();
export const projectController = new ProjectController();
