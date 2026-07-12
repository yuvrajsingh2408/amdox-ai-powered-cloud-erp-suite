import prisma from '../config/db';

export class IntegrationService {
  async getIntegrations(tenantId: string) {
    const count = await prisma.integration.count({ where: { tenantId } });
    if (count === 0) {
      await prisma.integration.createMany({
        data: [
          { tenantId, provider: 'Google Workspace', credentials: '{"client_id": "mock_id"}', isActive: true },
          { tenantId, provider: 'Stripe Payments', credentials: '{"publishable_key": "pk_test"}', isActive: true },
          { tenantId, provider: 'Slack Connect', credentials: '{"webhook_url": "https://slack.com"}', isActive: false },
        ],
      });
    }
    return prisma.integration.findMany({ where: { tenantId } });
  }

  async toggleIntegration(tenantId: string, id: string, isActive: boolean) {
    return prisma.integration.update({
      where: { id },
      data: { isActive },
    });
  }
}

export default new IntegrationService();
export const integrationService = new IntegrationService();
