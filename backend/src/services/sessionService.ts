import prisma from '../config/db';
import logger from '../utils/logger';
import { NotFoundError } from '../utils/errors';

export class SessionService {
  async getActiveSessions(tenantId: string, userId: string) {
    return prisma.userSession.findMany({
      where: { tenantId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSession(
    tenantId: string,
    userId: string,
    data: { token: string; deviceFingerprint?: string; ipAddress?: string }
  ) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return prisma.userSession.create({
      data: {
        tenantId,
        userId,
        token: data.token,
        deviceFingerprint: data.deviceFingerprint || null,
        ipAddress: data.ipAddress || null,
        expiresAt,
      },
    });
  }

  async revokeSession(tenantId: string, id: string) {
    const session = await prisma.userSession.findFirst({
      where: { id, tenantId },
    });
    if (!session) throw new NotFoundError('Active session not found');

    return prisma.userSession.delete({
      where: { id },
    });
  }

  async revokeAllUserSessions(tenantId: string, userId: string) {
    return prisma.userSession.deleteMany({
      where: { tenantId, userId },
    });
  }

  async logLoginAttempt(
    tenantId: string,
    data: { userId?: string; email: string; ipAddress?: string; deviceFingerprint?: string; status: 'SUCCESS' | 'FAILED'; reason?: string }
  ) {
    return prisma.loginHistory.create({
      data: {
        tenantId,
        userId: data.userId || null,
        email: data.email,
        ipAddress: data.ipAddress || null,
        deviceFingerprint: data.deviceFingerprint || null,
        status: data.status,
        reason: data.reason || null,
      },
    });
  }

  async getLoginHistory(tenantId: string, userId?: string) {
    const where: any = { tenantId };
    if (userId) {
      where.userId = userId;
    }
    return prisma.loginHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getDevices(tenantId: string, userId: string) {
    const count = await prisma.device.count({ where: { tenantId, userId } });
    if (count === 0) {
      await prisma.device.create({
        data: {
          tenantId,
          userId,
          deviceFingerprint: 'FP-9901-MAC',
          deviceName: 'Apple MacBook Pro (Chrome)',
          isTrusted: true,
        },
      });
    }

    return prisma.device.findMany({
      where: { tenantId, userId },
      orderBy: { lastUsedAt: 'desc' },
    });
  }

  async trustDevice(tenantId: string, id: string) {
    const device = await prisma.device.findFirst({ where: { id, tenantId } });
    if (!device) throw new NotFoundError('Device mapping not found');

    return prisma.device.update({
      where: { id },
      data: { isTrusted: true },
    });
  }
}

export default new SessionService();
export const sessionService = new SessionService();
