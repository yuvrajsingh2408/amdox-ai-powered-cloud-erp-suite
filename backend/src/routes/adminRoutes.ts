import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import adminController from '../controllers/adminController';

const router = Router();

// Secure authorization locks
router.use(protect);

// Global settings & Env variables
router.get('/env', adminController.getEnvVariables);
router.post('/env', adminController.saveEnvVariable);

router.get('/settings', adminController.getSystemSettings);
router.post('/settings', adminController.saveSystemSetting);
router.post('/maintenance', adminController.toggleMaintenance);

// Tenant Administration
router.get('/tenants', adminController.getTenants);
router.get('/tenants/:id', adminController.getTenantDetails);
router.put('/tenants/:id/status', adminController.updateTenantStatus);

// Subscriptions & Licenses
router.get('/license/plans', adminController.getPlans);
router.get('/license', adminController.getLicense);

// Integrations & Webhooks
router.get('/integrations', adminController.getIntegrations);
router.post('/integrations/:id/toggle', adminController.toggleIntegration);

router.get('/webhooks', adminController.getWebhooks);
router.post('/webhooks', adminController.createWebhook);
router.delete('/webhooks/:id', adminController.deleteWebhook);

// Telemetry & Logs
router.get('/metrics', adminController.getMetrics);
router.get('/logs', adminController.getServerLogs);
router.get('/health', adminController.getHealthChecks);

// Scheduler
router.get('/scheduler', adminController.getCronJobs);

// Plugins & Marketplace
router.get('/plugins', adminController.getPlugins);
router.delete('/plugins/:id', adminController.uninstallPlugin);

// Brandings
router.get('/branding', adminController.getBranding);
router.post('/branding', adminController.saveBranding);

// Release Deployments
router.get('/deployments', adminController.getDeployments);

// Storage & DB statistics
router.get('/db', adminController.getDatabaseStats);

// Caches Redis monitoring
router.get('/cache', adminController.getCacheStats);
router.post('/cache/flush', adminController.flushCache);

export default router;
