import prisma from '../config/db';
import crypto from 'crypto';

export class WebhookService {
  async getWebhooks(tenantId: string) {
    return prisma.webhook.findMany({
      where: { tenantId },
      include: { deliveries: { take: 5, orderBy: { createdAt: 'desc' } } },
    });
  }

  async createWebhook(tenantId: string, targetUrl: string) {
    const secret = `whsec_${crypto.randomBytes(16).toString('hex')}`;
    return prisma.webhook.create({
      data: {
        tenantId,
        targetUrl,
        secret,
      },
    });
  }

  async deleteWebhook(tenantId: string, id: string) {
    return prisma.webhook.delete({
      where: { id },
    });
  }
}

export default new WebhookService();
export const webhookService = new WebhookService();
