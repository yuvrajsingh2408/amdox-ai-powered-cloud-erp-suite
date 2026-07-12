import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import adminService from '../services/adminService';
import settingsService from '../services/settingsService';
import tenantService from '../services/tenantService';
import licenseService from '../services/licenseService';
import integrationService from '../services/integrationService';
import webhookService from '../services/webhookService';
import monitoringService from '../services/monitoringService';
import healthService from '../services/healthService';
import schedulerService from '../services/schedulerService';
import pluginService from '../services/pluginService';
import marketplaceService from '../services/marketplaceService';
import brandingService from '../services/brandingService';
import deploymentService from '../services/deploymentService';
import systemMetricsService from '../services/systemMetricsService';
import cacheService from '../services/cacheService';
import { sendResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export class AdminController {
  // ----------------------------------------------------
  // Env Variables
  // ----------------------------------------------------
  async getEnvVariables(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await adminService.getEnvVariables(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Environment variables fetched',
        data: list,
      });
    } catch (e) {
      next(e);
    }
  }

  async saveEnvVariable(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { envKey, envVal } = req.body;
      if (!envKey) return next(new BadRequestError('Key parameter required'));
      const row = await adminService.saveEnvVariable(req.tenantId!, envKey, envVal);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Environment variable saved',
        data: row,
      });
    } catch (e) {
      next(e);
    }
  }

  // ----------------------------------------------------
  // System Settings
  // ----------------------------------------------------
  async getSystemSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await settingsService.getSystemSettings(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'System settings loaded',
        data: list,
      });
    } catch (e) {
      next(e);
    }
  }

  async saveSystemSetting(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { key, value } = req.body;
      if (!key) return next(new BadRequestError('Key parameter required'));
      const row = await settingsService.saveSystemSetting(req.tenantId!, key, value);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'System setting updated',
        data: row,
      });
    } catch (e) {
      next(e);
    }
  }

  async toggleMaintenance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { isActive, description } = req.body;
      const row = await settingsService.toggleMaintenanceMode(req.tenantId!, isActive, description);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: isActive ? 'System entering maintenance mode' : 'Maintenance window deactivated',
        data: row,
      });
    } catch (e) {
      next(e);
    }
  }

  // ----------------------------------------------------
  // Tenants
  // ----------------------------------------------------
  async getTenants(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await tenantService.getTenants();
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'All platform tenants mapped',
        data: list,
      });
    } catch (e) {
      next(e);
    }
  }

  async getTenantDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const details = await tenantService.getTenantDetails(id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Tenant details compiled',
        data: details,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateTenantStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const row = await tenantService.updateTenantStatus(id, status);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Tenant status successfully modified',
        data: row,
      });
    } catch (e) {
      next(e);
    }
  }

  // ----------------------------------------------------
  // Licenses & Plans
  // ----------------------------------------------------
  async getPlans(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await licenseService.getPlans();
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Billing plans ready',
        data: list,
      });
    } catch (e) {
      next(e);
    }
  }

  async getLicense(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const info = await licenseService.getLicense(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Subscription license verified',
        data: info,
      });
    } catch (e) {
      next(e);
    }
  }

  // ----------------------------------------------------
  // Integrations & Webhooks
  // ----------------------------------------------------
  async getIntegrations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await integrationService.getIntegrations(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Integrations list fetched',
        data: list,
      });
    } catch (e) {
      next(e);
    }
  }

  async toggleIntegration(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const row = await integrationService.toggleIntegration(req.tenantId!, id, isActive);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Integration status updated',
        data: row,
      });
    } catch (e) {
      next(e);
    }
  }

  async getWebhooks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await webhookService.getWebhooks(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Webhook lists retrieved',
        data: list,
      });
    } catch (e) {
      next(e);
    }
  }

  async createWebhook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { targetUrl } = req.body;
      if (!targetUrl) return next(new BadRequestError('targetUrl parameter required'));
      const row = await webhookService.createWebhook(req.tenantId!, targetUrl);
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Webhook created successfully',
        data: row,
      });
    } catch (e) {
      next(e);
    }
  }

  async deleteWebhook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await webhookService.deleteWebhook(req.tenantId!, id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Webhook configuration removed',
      });
    } catch (e) {
      next(e);
    }
  }

  // ----------------------------------------------------
  // Telemetry & logs
  // ----------------------------------------------------
  async getMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await monitoringService.getMetrics(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Telemetry metrics loaded',
        data: list,
      });
    } catch (e) {
      next(e);
    }
  }

  async getServerLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await monitoringService.getServerLogs(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Server transaction logs retrieved',
        data: list,
      });
    } catch (e) {
      next(e);
    }
  }

  async getHealthChecks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await healthService.getHealthChecks(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Core checks verified',
        data: list,
      });
    } catch (e) {
      next(e);
    }
  }

  // ----------------------------------------------------
  // Schedulers
  // ----------------------------------------------------
  async getCronJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const crons = await schedulerService.getCronJobs(req.tenantId!);
      const queues = await schedulerService.getQueueJobs(req.tenantId!);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Job scheduler maps fetched',
        data: { crons, queues },
      });
    } catch (e) {
      next(e);
    }
  }

  // ----------------------------------------------------
  // Plugins & Marketplace
  // ----------------------------------------------------
  async getPlugins(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const installed = await pluginService.getInstalledPlugins(req.tenantId!);
      const marketplace = await marketplaceService.getMarketplacePackages();

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Extension plugin configurations compiled',
        data: { installed, marketplace },
      });
    } catch (e) {
      next(e);
    }
  }

  async uninstallPlugin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await pluginService.uninstallPlugin(req.tenantId!, id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Extension plugin uninstalled',
      });
    } catch (e) {
      next(e);
    }
  }

  // ----------------------------------------------------
  // White-labelling Branding
  // ----------------------------------------------------
  async getBranding(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const details = await brandingService.getBranding(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'White-label parameters loaded',
        data: details,
      });
    } catch (e) {
      next(e);
    }
  }

  async saveBranding(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const row = await brandingService.saveBranding(req.tenantId!, req.body);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Custom branding options modified',
        data: row,
      });
    } catch (e) {
      next(e);
    }
  }

  // ----------------------------------------------------
  // Deployment releases
  // ----------------------------------------------------
  async getDeployments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const versions = await deploymentService.getVersions();
      const migrations = await deploymentService.getMigrations(req.tenantId!);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'DevOps migrations log maps loaded',
        data: { versions, migrations },
      });
    } catch (e) {
      next(e);
    }
  }

  // ----------------------------------------------------
  // Databases stats
  // ----------------------------------------------------
  async getDatabaseStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dbStats = await systemMetricsService.getDatabaseStats(req.tenantId!);
      const backups = await systemMetricsService.getBackupsList(req.tenantId!);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Database storage sizes updated',
        data: { dbStats, backups },
      });
    } catch (e) {
      next(e);
    }
  }

  // ----------------------------------------------------
  // Cache stats
  // ----------------------------------------------------
  async getCacheStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await cacheService.getCacheStats(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Redis stats loaded',
        data: stats,
      });
    } catch (e) {
      next(e);
    }
  }

  async flushCache(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await cacheService.flushAllCache(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Redis cache databases flushed',
        data: stats,
      });
    } catch (e) {
      next(e);
    }
  }
}

export default new AdminController();
export const adminController = new AdminController();
