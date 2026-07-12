import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import securityController from '../controllers/securityController';

const router = Router();

// Secure authorization locks
router.use(protect);

// Sessions
router.get('/sessions', securityController.getSessions);
router.delete('/sessions/:id', securityController.revokeSession);
router.delete('/sessions-all', securityController.revokeAllSessions);

// Devices & Login History
router.get('/login-history', securityController.getLoginHistory);
router.get('/devices', securityController.getDevices);
router.post('/devices/:id/trust', securityController.trustDevice);

// IP filters
router.route('/ip-whitelist')
  .get(securityController.getIPWhitelist)
  .post(securityController.addWhitelistIP);

router.route('/blocked-ips')
  .get(securityController.getBlockedIPs)
  .post(securityController.blockIP);

// API Keys
router.route('/api-keys')
  .get(securityController.getApiKeys)
  .post(securityController.generateApiKey);

router.delete('/api-keys/:id', securityController.revokeApiKey);

// Password Policy
router.route('/password-policy')
  .get(securityController.getPasswordPolicy)
  .put(securityController.updatePasswordPolicy);

// TOTP MFA setup
router.get('/mfa/setup', securityController.generateMFA);
router.post('/mfa/verify', securityController.verifyMFA);

// Alerts & Recommendations
router.get('/alerts', securityController.getSecurityAlerts);
router.post('/alerts/:id/resolve', securityController.resolveAlert);
router.get('/score', securityController.getSecurityScore);

// Backups & Snapshots
router.get('/backups', securityController.getBackups);
router.post('/backups', securityController.triggerBackup);
router.post('/backups/:id/restore', securityController.simulateRestore);

// Compliance reports
router.get('/compliance', securityController.getCompliance);
router.post('/compliance/scan', securityController.scanCompliance);

// Auditing Events logs
router.get('/audit-events', securityController.getAuditEvents);

export default router;
