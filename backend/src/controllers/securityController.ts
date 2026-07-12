import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import sessionService from '../services/sessionService';
import securityService from '../services/securityService';
import mfaService from '../services/mfaService';
import backupService from '../services/backupService';
import complianceService from '../services/complianceService';
import prisma from '../config/db';
import { sendResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export class SecurityController {
  // ----------------------------------------------------
  // 1. Session Management
  // ----------------------------------------------------
  async getSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await sessionService.getActiveSessions(req.tenantId!, req.user!.id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Active sessions retrieved successfully',
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  async revokeSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await sessionService.revokeSession(req.tenantId!, id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Session revoked successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  async revokeAllSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await sessionService.revokeAllUserSessions(req.tenantId!, req.user!.id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'All device sessions logged out',
      });
    } catch (err) {
      next(err);
    }
  }

  async getLoginHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await sessionService.getLoginHistory(req.tenantId!, req.user!.id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Login attempts history ready',
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  async getDevices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await sessionService.getDevices(req.tenantId!, req.user!.id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Trusted devices list fetched',
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  async trustDevice(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const device = await sessionService.trustDevice(req.tenantId!, id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Device added to trusted signatures whitelists',
        data: device,
      });
    } catch (err) {
      next(err);
    }
  }

  // ----------------------------------------------------
  // 2. IP Whitelists & Blocking
  // ----------------------------------------------------
  async getIPWhitelist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await securityService.getIPWhitelist(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'IP Whitelist retrieved',
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  async addWhitelistIP(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { ipAddress, description } = req.body;
      if (!ipAddress) return next(new BadRequestError('Ip address parameter required'));
      const ip = await securityService.addIPToWhitelist(req.tenantId!, ipAddress, description);
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'IP successfully whitelisted',
        data: ip,
      });
    } catch (err) {
      next(err);
    }
  }

  async getBlockedIPs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await securityService.getBlockedIPs(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Blocked IPs list fetched',
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  async blockIP(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { ipAddress, reason, minutes } = req.body;
      if (!ipAddress) return next(new BadRequestError('Ip address parameter required'));
      const ip = await securityService.blockIP(req.tenantId!, ipAddress, reason, minutes);
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'IP address blocked',
        data: ip,
      });
    } catch (err) {
      next(err);
    }
  }

  // ----------------------------------------------------
  // 3. API Key Management
  // ----------------------------------------------------
  async getApiKeys(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await securityService.getApiKeys(req.tenantId!, req.user!.id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'API keys list ready',
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  async generateApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const key = await securityService.generateApiKey(req.tenantId!, req.user!.id, name);
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'API Key generated successfully. Save this raw secret key value now.',
        data: key,
      });
    } catch (err) {
      next(err);
    }
  }

  async revokeApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const key = await securityService.revokeApiKey(req.tenantId!, id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'API Key access revoked',
        data: key,
      });
    } catch (err) {
      next(err);
    }
  }

  // ----------------------------------------------------
  // 4. Password Policy
  // ----------------------------------------------------
  async getPasswordPolicy(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const policy = await securityService.getPasswordPolicy(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Password complexity policies active',
        data: policy,
      });
    } catch (err) {
      next(err);
    }
  }

  async updatePasswordPolicy(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const policy = await securityService.updatePasswordPolicy(req.tenantId!, req.body);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Password policy settings saved',
        data: policy,
      });
    } catch (err) {
      next(err);
    }
  }

  // ----------------------------------------------------
  // 5. Security Alerts
  // ----------------------------------------------------
  async getSecurityAlerts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await securityService.getSecurityAlerts(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Alert logs retrieved',
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  async resolveAlert(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const alert = await securityService.resolveAlert(req.tenantId!, id, req.user!.id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Alert resolved successfully',
        data: alert,
      });
    } catch (err) {
      next(err);
    }
  }

  async getSecurityScore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const metrics = await securityService.getSecurityScore(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'AI security grading ready',
        data: metrics,
      });
    } catch (err) {
      next(err);
    }
  }

  // ----------------------------------------------------
  // 6. Backups
  // ----------------------------------------------------
  async getBackups(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const jobs = await backupService.getBackupJobs(req.tenantId!);
      const history = await backupService.getBackupHistory(req.tenantId!);
      const recoveryPoints = await backupService.getRecoveryPoints(req.tenantId!);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Database backup schedules mapped',
        data: { jobs, history, recoveryPoints },
      });
    } catch (err) {
      next(err);
    }
  }

  async triggerBackup(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const history = await backupService.triggerBackup(req.tenantId!, name || 'Manual Database Dump');
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Manual backup dump triggered successfully',
        data: history,
      });
    } catch (err) {
      next(err);
    }
  }

  async simulateRestore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await backupService.simulateRestore(req.tenantId!, id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Restore validation complete',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // ----------------------------------------------------
  // 7. Compliance Standard Checks
  // ----------------------------------------------------
  async getCompliance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const rules = await complianceService.getComplianceRules(req.tenantId!);
      const reports = await complianceService.getReports(req.tenantId!);

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Compliance scoring ready',
        data: { rules, reports },
      });
    } catch (err) {
      next(err);
    }
  }

  async scanCompliance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const log = await complianceService.runAuditsScan(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Audit compliance scans complete',
        data: log,
      });
    } catch (err) {
      next(err);
    }
  }

  // ----------------------------------------------------
  // 8. MFA TOTP Verification
  // ----------------------------------------------------
  async generateMFA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const credentials = await mfaService.generateMfaSecret(req.tenantId!, req.user!.id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'TOTP secret generation complete',
        data: credentials,
      });
    } catch (err) {
      next(err);
    }
  }

  async verifyMFA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const ok = await mfaService.verifyAndEnableMfa(req.tenantId!, req.user!.id, token);
      if (!ok) return next(new BadRequestError('Invalid authenticator verification token'));

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'MFA successfully enabled for profile',
      });
    } catch (err) {
      next(err);
    }
  }

  // ----------------------------------------------------
  // 9. Audit Events Logs
  // ----------------------------------------------------
  async getAuditEvents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Seed audit event if none
      const count = await prisma.auditEvent.count({ where: { tenantId: req.tenantId! } });
      if (count === 0) {
        await prisma.auditEvent.create({
          data: {
            tenantId: req.tenantId!,
            userId: req.user!.id,
            action: 'MFA_SETTINGS_VIEWED',
            module: 'SECURITY',
            severity: 'INFO',
            details: 'Administrator opened MFA recovery verification parameters dashboard.',
          },
        });
      }

      const list = await prisma.auditEvent.findMany({
        where: { tenantId: req.tenantId! },
        orderBy: { createdAt: 'desc' },
      });

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Auditing log rows fetched successfully',
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new SecurityController();
export const securityController = new SecurityController();
