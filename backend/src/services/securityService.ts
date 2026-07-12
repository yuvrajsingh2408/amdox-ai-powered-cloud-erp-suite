import prisma from '../config/db';
import logger from '../utils/logger';
import crypto from 'crypto';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class SecurityService {
  // ----------------------------------------------------
  // 1. IP Whitelisting & Blocking
  // ----------------------------------------------------
  async getIPWhitelist(tenantId: string) {
    const count = await prisma.iPWhitelist.count({ where: { tenantId } });
    if (count === 0) {
      await prisma.iPWhitelist.create({
        data: { tenantId, ipAddress: '192.168.1.1', description: 'Internal Office HQ Gateway' },
      });
    }
    return prisma.iPWhitelist.findMany({ where: { tenantId } });
  }

  async addIPToWhitelist(tenantId: string, ipAddress: string, description?: string) {
    return prisma.iPWhitelist.create({
      data: { tenantId, ipAddress, description },
    });
  }

  async getBlockedIPs(tenantId: string) {
    const count = await prisma.blockedIP.count({ where: { tenantId } });
    if (count === 0) {
      await prisma.blockedIP.create({
        data: { tenantId, ipAddress: '198.51.100.42', reason: 'Brute force attempts detected' },
      });
    }
    return prisma.blockedIP.findMany({ where: { tenantId } });
  }

  async blockIP(tenantId: string, ipAddress: string, reason?: string, minutes?: number) {
    let blockedUntil: Date | null = null;
    if (minutes) {
      blockedUntil = new Date();
      blockedUntil.setMinutes(blockedUntil.getMinutes() + minutes);
    }
    return prisma.blockedIP.create({
      data: { tenantId, ipAddress, reason, blockedUntil },
    });
  }

  // ----------------------------------------------------
  // 2. API Key Management
  // ----------------------------------------------------
  async getApiKeys(tenantId: string, userId: string) {
    return prisma.apiKey.findMany({
      where: { tenantId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generateApiKey(tenantId: string, userId: string, name: string) {
    if (!name) throw new BadRequestError('API key name is required');
    const rawKey = `ak_${crypto.randomBytes(24).toString('hex')}`;
    const hash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const key = await prisma.apiKey.create({
      data: {
        tenantId,
        userId,
        name,
        keyHash: hash,
        isActive: true,
      },
    });

    return {
      ...key,
      rawKey, // Returned only once on generation
    };
  }

  async revokeApiKey(tenantId: string, id: string) {
    const key = await prisma.apiKey.findFirst({ where: { id, tenantId } });
    if (!key) throw new NotFoundError('API key not found');

    return prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ----------------------------------------------------
  // 3. Password Policies configurations
  // ----------------------------------------------------
  async getPasswordPolicy(tenantId: string) {
    const policy = await prisma.passwordPolicy.findFirst({ where: { tenantId } });
    if (!policy) {
      return prisma.passwordPolicy.create({
        data: {
          tenantId,
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecial: true,
          expiryDays: 90,
          historyCount: 5,
        },
      });
    }
    return policy;
  }

  async updatePasswordPolicy(
    tenantId: string,
    data: { minLength: number; requireUppercase: boolean; requireLowercase: boolean; requireNumbers: boolean; requireSpecial: boolean; expiryDays: number }
  ) {
    const policy = await this.getPasswordPolicy(tenantId);

    return prisma.passwordPolicy.update({
      where: { id: policy.id },
      data: {
        minLength: data.minLength,
        requireUppercase: data.requireUppercase,
        requireLowercase: data.requireLowercase,
        requireNumbers: data.requireNumbers,
        requireSpecial: data.requireSpecial,
        expiryDays: data.expiryDays,
      },
    });
  }

  // ----------------------------------------------------
  // 4. Security Alerts Logs
  // ----------------------------------------------------
  async getSecurityAlerts(tenantId: string) {
    const count = await prisma.securityAlert.count({ where: { tenantId } });
    if (count === 0) {
      await prisma.securityAlert.create({
        data: { tenantId, alertType: 'BRUTE_FORCE', severity: 'HIGH', message: '10+ failed logins registered from IP 198.51.100.42 within 1 minute.' },
      });
    }
    return prisma.securityAlert.findMany({
      where: { tenantId },
      orderBy: { detectedAt: 'desc' },
    });
  }

  async resolveAlert(tenantId: string, id: string, userId: string) {
    const alert = await prisma.securityAlert.findFirst({ where: { id, tenantId } });
    if (!alert) throw new NotFoundError('Security alert not found');

    return prisma.securityAlert.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedBy: userId,
      },
    });
  }

  async getSecurityScore(tenantId: string) {
    // Simulated security rating calculations
    const alerts = await prisma.securityAlert.count({ where: { tenantId, status: 'OPEN' } });
    const mfaUsers = 12; // simulated count
    
    let score = 92; // default excellent rating
    if (alerts > 0) score -= alerts * 10;
    if (mfaUsers < 5) score -= 15;

    return {
      score: Math.max(10, score),
      grade: score >= 90 ? 'A' : score >= 75 ? 'B' : 'C',
      recommendations: [
        'Enforce multi-factor authentication (MFA) for all administrative roles.',
        'Configure IP Whitelisting checks for financial transaction disbursements.',
      ],
    };
  }
}

export default new SecurityService();
export const securityService = new SecurityService();
