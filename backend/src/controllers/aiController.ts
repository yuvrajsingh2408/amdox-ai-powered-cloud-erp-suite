import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import aiService from '../services/aiService';
import { sendResponse } from '../utils/response';
import { BadRequestError, ForbiddenError } from '../utils/errors';

export class AIController {
  // POST /api/ai/query
  async processQuery(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { query, conversationId } = req.body;
      if (!query) {
        return next(new BadRequestError('Query prompt is required'));
      }

      const result = await aiService.processNLQuery(req.tenantId!, req.user!.id, query, conversationId);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Query processed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/ai/summary/:module
  async generateSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { module } = req.params;
      const cleanModule = module.toUpperCase();

      // RBAC Validation for Module Summaries
      const userRoles = req.user!.roles;
      const primaryRole = req.user!.role;
      const isAdmin = primaryRole === 'ADMIN' || userRoles.includes('ADMIN');

      if (!isAdmin) {
        if (cleanModule === 'HR' && !userRoles.includes('HR_MANAGER')) {
          return next(new ForbiddenError('Forbidden: Access to HR summary requires HR Manager role.'));
        }
        if (cleanModule === 'FINANCE' && !userRoles.includes('FINANCE_MANAGER')) {
          return next(new ForbiddenError('Forbidden: Access to Finance summary requires Finance Manager role.'));
        }
        if (cleanModule === 'SCM' && !userRoles.includes('SCM_MANAGER')) {
          return next(new ForbiddenError('Forbidden: Access to SCM summary requires SCM Manager role.'));
        }
        if (cleanModule === 'PROJECT' && !userRoles.includes('PROJECT_MANAGER')) {
          return next(new ForbiddenError('Forbidden: Access to Project summary requires Project Manager role.'));
        }
      }

      const result = await aiService.generateModuleSummary(req.tenantId!, module);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: `${cleanModule} summary compiled successfully`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/ai/recommendations
  async getRecommendations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.scanRecommendations(req.tenantId!);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'AI alerts and recommendations retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/ai/recommendations/:id/resolve
  async resolveRecommendation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { action } = req.body; // 'RESOLVED' or 'DISMISSED'

      if (!action || !['RESOLVED', 'DISMISSED'].includes(action)) {
        return next(new BadRequestError('Valid resolve action (RESOLVED or DISMISSED) is required'));
      }

      const result = await aiService.resolveRecommendation(req.tenantId!, id, action);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: `Recommendation ${action.toLowerCase()} successfully`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/ai/conversations
  async getConversations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { search } = req.query;
      const list = await aiService.getConversations(req.tenantId!, req.user!.id, search as string);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Conversations list fetched successfully',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/ai/conversations/:id
  async getConversation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const details = await aiService.getConversation(req.tenantId!, req.user!.id, id);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Conversation history parsed successfully',
        data: details,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/ai/conversations
  async createConversation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { title, module } = req.body;
      const newConvo = await aiService.createConversation(req.tenantId!, req.user!.id, title, module);

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'AI Copilot thread initiated',
        data: newConvo,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/ai/conversations/:id
  async deleteConversation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await aiService.deleteConversation(req.tenantId!, req.user!.id, id);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'AI thread deleted from history',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/ai/conversations/:id/pin
  async togglePin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await aiService.togglePinConversation(req.tenantId!, req.user!.id, id);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: `Thread ${result.isPinned ? 'pinned' : 'unpinned'} successfully`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/ai/conversations/:id/favorite
  async toggleFavorite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await aiService.toggleFavoriteConversation(req.tenantId!, req.user!.id, id);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: `Thread ${result.isFavorite ? 'added to favorites' : 'removed from favorites'} successfully`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/ai/conversations/:id/messages/:messageId/feedback
  async setMessageFeedback(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id, messageId } = req.params;
      const { feedback } = req.body; // 'LIKE' or 'DISLIKE'

      if (!feedback || !['LIKE', 'DISLIKE'].includes(feedback)) {
        return next(new BadRequestError('Feedback value of LIKE or DISLIKE is required'));
      }

      const result = await aiService.setMessageFeedback(id, messageId, feedback);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Message feedback submitted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/ai/prompts
  async getTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await aiService.getPromptTemplates(req.tenantId!, req.user!.id);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Prompt templates retrieved successfully',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/ai/prompts
  async createTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { title, prompt, description, module } = req.body;
      if (!title || !prompt || !module) {
        return next(new BadRequestError('Title, prompt, and module are required parameters'));
      }

      const newTemplate = await aiService.createPromptTemplate(req.tenantId!, req.user!.id, {
        title,
        prompt,
        description,
        module,
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Custom prompt template created successfully',
        data: newTemplate,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/ai/prompts/:id/favorite
  async favoriteTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await aiService.toggleFavoriteTemplate(req.tenantId!, req.user!.id, id);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: `Template favorite toggled to: ${result.isFavorite}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/ai/history-logs
  async getHistoryLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { search } = req.query;
      const list = await aiService.getQueryHistoryLogs(req.tenantId!, search as string);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Query search history logs fetched successfully',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AIController();
export const aiController = new AIController();
