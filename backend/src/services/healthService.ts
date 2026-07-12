import prisma from '../config/db';

export class HealthService {
  async getHealthChecks(tenantId: string) {
    const count = await prisma.healthCheck.count({ where: { tenantId } });
    if (count === 0) {
      await prisma.healthCheck.createMany({
        data: [
          { tenantId, service: 'SQLite Database Connection', status: 'HEALTHY', latencyMs: 2 },
          { tenantId, service: 'Redis Cache Server', status: 'HEALTHY', latencyMs: 1 },
          { tenantId, service: 'SMTP Mailing Gateway', status: 'HEALTHY', latencyMs: 45 },
        ],
      });
    }
    return prisma.healthCheck.findMany({ where: { tenantId } });
  }
}

export default new HealthService();
export const healthService = new HealthService();
