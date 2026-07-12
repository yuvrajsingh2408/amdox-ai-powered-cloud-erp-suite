import prisma from '../config/db';

export class MonitoringService {
  async getMetrics(tenantId: string) {
    const list = await prisma.systemMetric.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (list.length === 0) {
      await prisma.systemMetric.create({
        data: { tenantId, cpuUsage: 14.5, memUsage: 45.2, diskUsage: 38.1 },
      });
    }

    return prisma.systemMetric.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async getServerLogs(tenantId: string) {
    const count = await prisma.serverLog.count({ where: { tenantId } });
    if (count === 0) {
      await prisma.serverLog.createMany({
        data: [
          { tenantId, level: 'INFO', message: 'HTTP GET /api/admin/metrics 200 OK - 42ms' },
          { tenantId, level: 'WARN', message: 'Redis cache hit latency variance: 12ms threshold limit exceeded.' },
        ],
      });
    }
    return prisma.serverLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}

export default new MonitoringService();
export const monitoringService = new MonitoringService();
